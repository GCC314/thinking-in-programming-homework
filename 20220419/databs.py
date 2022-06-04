import sqlite3
import json
import math
import time
import base64
import hashlib

def S2B(ostr): # String To Base64-String
    return base64.b64encode(ostr.encode()).decode()

def B2S(bstr): # Base64-String To String
    return base64.b64decode(bstr.encode()).decode()

dbConn = None

def dbInit():
    global dbConn
    dbConn = sqlite3.connect("chatdb.db",check_same_thread=False)
    dbConn.execute("""CREATE TABLE IF NOT EXISTS USERS(
        username    text not null,
        passwd      text not null,
        email       text not null,
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
    dbConn.execute("""CREATE TABLE IF NOT EXISTS GTS(
        username    text,
        groupname   text,
        timestamp   bigint
    )""")
    dbConn.commit()

def UserExist(username):
    global dbConn
    dbRec = dbConn.execute("""select username from USERS where username=? """,(username,)).fetchone()
    return dbRec != None

def EmailExist(email):
    global dbConn
    dbRec = dbConn.execute("""select email from USERS where email=? """,(email,)).fetchone()
    return dbRec != None

def GroupExist(groupname):
    global dbConn
    dbRec = dbConn.execute("""select groupname from GROUPS where groupname=? """,(groupname,)).fetchone()
    return dbRec != None

def UserPwdCheck(username,passwd):
    global dbConn
    dbRec = dbConn.execute("""select passwd from USERS where username=? """,(username,)).fetchone()
    return dbRec[0] == passwd

def UserRegister(username,passwd,email):
    global dbConn
    dbConn.execute("""insert into USERS
    (username,passwd,email,groups)
    values(?,?,?,?)
    """,(username,passwd,email.lower(),S2B("[]")))
    dbConn.commit()

def UserPswdReset(email):
    global dbConn
    dbConn.execute("""update USERS
    set passwd="12345678"
    where email=?
    """,(email.lower(),))
    dbConn.commit()

def getUserGroup(username):
    global dbConn
    dbRec = dbConn.execute("""select groups from USERS where username=? """,(username,)).fetchone()
    return B2S(dbRec[0])

def getUserEmailDig(username):
    global dbConn
    dbRec = dbConn.execute("""select email from USERS where username=? """,(username,)).fetchone()
    estr = dbRec[0]
    return hashlib.md5(estr.encode(encoding="UTF-8")).hexdigest()

def addGroup2User(username,groupname):
    global dbConn
    print(username,groupname)
    dbRec = dbConn.execute("""select groups from USERS where username=? """,(username,)).fetchone()
    if(dbRec == None): return
    mlst = json.loads(B2S(dbRec[0]))
    if(groupname in mlst): return
    mlst.append(groupname)
    dbConn.execute("""update USERS
    set groups=?
    where username=?
    """,(S2B(json.dumps(mlst)),username))
    dbConn.commit()

def addGroup(groupname,usernames):
    global dbConn
    if(GroupExist(groupname)): return "F"
    dbConn.execute("""insert into GROUPS
    (groupname,users)
    values(?,?)
    """,(groupname,S2B(usernames)))
    for user in json.loads(usernames):
        addGroup2User(user,groupname)
    dbConn.commit()
    return "S"

def getGroupAllUser(groupname):
    global dbConn
    return B2S(dbConn.execute("""select users from GROUPS where groupname=? """,(groupname,)).fetchone()[0])

def delUserfromGroup(username,groupname):
    global dbConn
    # USERS
    ugroups = json.loads(B2S(dbConn.execute("""select groups from USERS where username=? """,(username,)).fetchone()[0]))
    ugroups = [group for group in ugroups if group != groupname]
    dbConn.execute("""update USERS
    SET groups=?
    where username=?
    """,(S2B(json.dumps(ugroups)),username))
    # GTS
    dbConn.execute("""delete from GTS where username=? AND groupname=? """,(username,groupname))
    # GROUPS -> users
    gusers = json.loads(B2S(dbConn.execute(f"""select users from GROUPS where groupname=? """,(groupname,)).fetchone()[0]))
    gusers = [usr for usr in ugroups if usr != username]
    if(len(gusers) > 0):
        dbConn.execute("""update GROUPS
        SET users=?
        where groupname=?
        """,(S2B(json.dumps(gusers)),groupname))
    else:
        # GROUPS -> del
        # MSG -> del
        dbConn.execute("""delete from GROUPS where groupname=? """,(groupname,))
        dbConn.execute("""delete from MSG where groupname=? """,(groupname,))
    # commit
    dbConn.commit()

def rmsg2msg(msg):
    ml = list(msg)
    ml[-1] = B2S(ml[-1])
    return ml

def reqUpdMsg(groupname,ubts):
    global dbConn
    rmsgpkg = dbConn.execute("""select groupname,sender,timestamp,mtype,content from MSG where groupname=? and timestamp<=? """,(groupname,ubts)).fetchall()
    msgpkg = [rmsg2msg(msg) for msg in rmsgpkg]
    return json.dumps(msgpkg)

def reqSyncMsg(groupname,lbts,ubts,sid):
    global dbConn
    msgpkg = dbConn.execute("""select groupname,sender,timestamp,mtype,content from MSG where groupname=? and timestamp>=? and timestamp<=? """,(groupname,lbts,ubts)).fetchall()
    sieve = [rmsg2msg(msg) for msg in msgpkg if msg[1] != sid]
    return json.dumps(sieve)

def sendMsg(groupname,sender,ts,tp,msg):
    global dbConn
    dbConn.execute("""insert into MSG (groupname,sender,timestamp,mtype,content)
    values (?,?,?,?,?)
    """,(groupname,sender,ts,tp,S2B(msg)))
    dbConn.commit()

def getgts(username):
    global dbConn
    dbRec = dbConn.execute("""select groupname,timestamp from GTS where username=? """,(username,))
    dic = {}
    for rec in dbRec:
        dic[rec[0]] = rec[1]
    return json.dumps(dic) 

def updgts(username,groupname,ts):
    global dbConn
    if(dbConn.execute("""select timestamp from GTS where username=? AND groupname=? """,(username,groupname)).fetchone() == None):
        dbConn.execute("""insert into GTS (username,groupname,timestamp)
        values(?,?,?)
        """,(username,groupname,ts))
    else:
        dbConn.execute("""update GTS
        set timestamp=?
        where username=? AND groupname=?
        """,(ts,username,groupname))
    dbConn.commit()