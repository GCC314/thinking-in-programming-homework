import sqlite3
import json
import math
import time
import base64


def getTime():
    return int(floor(time.time()))

def Time2string(tm):
    return time.localtime(tm)

def isNameValid(mstr):
    if(mstr == ""):
        return False
    for c in mstr:
        if(not(c == '_' or c.isalnum())):
            return false
    return True

def isPswdValid(mstr):
    return len(mstr) >= 8

def S2B(ostr):
    return base64.b64encode(ostr.encode()).decode()

def B2S(bstr):
    return base64.b64decode(bstr.encode()).decode()

dbConn = None

def dbInit():
    global dbConn
    dbConn = sqlite3.connect("chatdb.db",check_same_thread=False)
    dbConn.execute("""CREATE TABLE IF NOT EXISTS USERS(
        username    text not null,
        passwd      text not null,
        groups      text
    )""")
    dbConn.execute("""CREATE TABLE IF NOT EXISTS GROUPS(
        groupname   text not null,
        users       text
    )""")
    dbConn.execute("""CREATE TABLE IF NOT EXISTS MSG(
        groupname   text,
        sender      text,
        timestamp   bigint,
        mtype       text not null,
        content     text
    )""")
    dbConn.commit()

def UserExist(username):
    global dbConn
    sqlstring = f"""select username from USERS where username="{username}" """
    dbRec = dbConn.execute(sqlstring).fetchone()
    return dbRec != None

def GroupExist(groupname):
    global dbConn
    sqlstring = f"""select groupname from GROUPS where groupname="{groupname}" """
    dbRec = dbConn.execute(sqlstring).fetchone()
    return dbRec != None

def UserPwdCheck(username,passwd):
    global dbConn
    sqlstring = f"""select passwd from USERS where username="{username}" """
    dbRec = dbConn.execute(sqlstring).fetchone()
    return dbRec[0] == passwd

def UserRegister(username,passwd):
    global dbConn
    sqlstring = f"""insert into USERS
    (username,passwd,groups)
    values("{username}","{passwd}","{S2B("[]")}")
    """
    dbConn.execute(sqlstring)
    dbConn.commit()

def getUserGroup(username):
    global dbConn
    sqlstring = f"""select groups from USERS where username="{username}" """
    dbRec = dbConn.execute(sqlstring).fetchone()
    return B2S(dbRec[0])

def addGroup2User(username,groupname):
    global dbConn
    print(username,groupname)
    sqlstring = f"""select groups from USERS where username="{username}" """
    dbRec = dbConn.execute(sqlstring).fetchone()
    if(dbRec == None): return
    mlst = json.loads(B2S(dbRec[0]))
    if(groupname in mlst): return
    mlst.append(groupname)
    sqlstring = f"""update USERS
    set groups="{S2B(json.dumps(mlst))}"
    where username="{username}"
    """
    dbConn.execute(sqlstring)
    dbConn.commit()

def addGroup(groupname,usernames):
    global dbConn
    if(GroupExist(groupname)): return "F"
    sqlstring = f"""insert into GROUPS
    (groupname,users)
    values("{groupname}","{S2B(usernames)}")
    """
    dbConn.execute(sqlstring)
    for user in json.loads(usernames):
        addGroup2User(user,groupname)
    dbConn.commit()
    return "S"

def getGroupAllUser(groupname):
    global dbConn
    sqlstring = f"""select users from GROUPS where groupname="{groupname}" """
    return B2S(dbConn.execute(sqlstring).fetchone()[0])

def rmsg2msg(msg):
    ml = list(msg)
    ml[-1] = B2S(ml[-1])
    return ml

def reqUpdMsg(groupname,ubts):
    global dbConn
    sqlstring = f"""select groupname,sender,timestamp,mtype,content from MSG where groupname="{groupname}" and timestamp<={ubts}"""
    rmsgpkg = dbConn.execute(sqlstring).fetchall()
    msgpkg = [rmsg2msg(msg) for msg in rmsgpkg]
    return json.dumps(msgpkg)

def reqSyncMsg(groupname,lbts,ubts,sid):
    global dbConn
    sqlstring = f"""select groupname,sender,timestamp,mtype,content from MSG where groupname="{groupname}" and timestamp>={lbts} and timestamp<={ubts}"""
    msgpkg = dbConn.execute(sqlstring).fetchall()
    sieve = [rmsg2msg(msg) for msg in msgpkg if msg[1] != sid]
    return json.dumps(sieve)

def sendMsg(groupname,sender,ts,tp,msg):
    global dbConn
    sqlstring = f"""insert into MSG (groupname,sender,timestamp,mtype,content)
    values ("{groupname}","{sender}",{ts},"{tp}","{S2B(msg)}")
    """
    dbConn.execute(sqlstring)
    dbConn.commit()
