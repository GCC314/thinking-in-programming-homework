from flask import Flask,render_template,request,session,make_response,redirect,url_for
import os,datetime
import databs,vmail
import math,time
import hashlib

webApp = Flask(__name__)
webApp.secret_key = os.urandom(24)

@webApp.route("/",methods=["post","get"])
def root():
    if("username" in session):
        if("PKG" in request.form and request.form["PKG"] == "logout_submit"):
            session.pop('username')
            return redirect(url_for("login"))
        res = make_response(render_template("dialog.html"))
        res.set_cookie("username",session["username"])
        return res
    return redirect(url_for("login"))

@webApp.route("/login",methods=["get"])
def login():
    sMsg = ""
    if("s" in request.args):
        if(request.args['s'] == 'r'): # successfully registered
            sMsg = "Successfully registered!"
        elif(request.args['s'] == 'w'): # passwd wrong
            sMsg = "Password wrong!"
        elif(request.args['s'] == 'p'): # reset passwd
            sMsg = "Successfully reset password!"
        else:
            sMsg = "Unknown args."
    return render_template("login.html",statusMsg = sMsg)

@webApp.route("/register",methods=["get"])
def register():
    sMsg = ""
    return render_template("register.html",statusMsg = sMsg)

@webApp.route("/forgot",methods=["get"])
def forgot():
    sMsg = ""
    return render_template("forgot.html",statusMsg = sMsg)

@webApp.route("/uInfo",methods=["post"])
def uInfo():
    if(request.form['rqType'] == "userexist"):
        if(databs.UserExist(request.form['username'])): return "E"
        else: return "O"
    if(request.form['rqType'] == "emailexist"):
        if(databs.EmailExist(request.form['email'])): return "E"
        else: return "O"
    """
    if(request.form['rqType'] == "check"):
        if(not databs.UserExist(request.form['username'])): return "N"
        if(databs.UserPwdCheck(request.form['username'],request.form['passwd'])): return "T"
        else: return "F"
    """
    if(request.form['rqType'] == "login"):
        if(not databs.UserExist(request.form['username'])): return "N"
        if(databs.UserPwdCheck(request.form['username'],request.form['passwd'])):
            session['username'] = request.form['username']
            return "T"
        else: return "F"
    if(request.form['rqType'] == "sendmail"):
        return vmail.generate(request.form['email'],request.form['mtype'])
    if(request.form['rqType'] == "verifycode"):
        return vmail.verify(request.form['email'],request.form['vcode'])
    if(request.form['rqType'] == "resetps"):
        databs.UserPswdReset(request.form['email'])
        return ""
    if(request.form['rqType'] == "ureg"):
        databs.UserRegister(request.form['username'],request.form['passwd'],request.form['email'])
        return ""
    return ""

@webApp.route("/dataReq",methods=["post"])
def dataReq():
    if(request.form['rqType'] == "updmsg"):
        return databs.reqUpdMsg(request.form['gname'],request.form['ubts'])
    if(request.form['rqType'] == "syncmsg"):
        return databs.reqSyncMsg(request.form['gname'],request.form['lbts'],request.form['ubts'],session['username'])
    if(request.form['rqType'] == "updgroup"):
        return databs.getUserGroup(request.form['username'])
    if(request.form['rqType'] == "userexist"):
        if(databs.UserExist(request.form['username'])): return "E"
        else: return "O"
    if(request.form['rqType'] == "emaildig"):
        return databs.getUserEmailDig(request.form['username'])
    if(request.form['rqType'] == "getgts"):
        return databs.getgts(request.form['username'])
    return ""

@webApp.route("/dataPush",methods=["post"])
def dataPush():
    if(request.form['rqType'] == "newgroup"):
        return databs.addGroup(request.form['gname'],request.form['ulist'])
    if(request.form['rqType'] == "sendmsg"):
        databs.sendMsg(request.form['gname'],request.form['sender'],request.form['ts'],request.form['mtype'],request.form['msg'])
        return ""
    if(request.form['rqType'] == "updgts"):
        databs.updgts(request.form['username'],request.form['groupname'],request.form['ts'])
    return ""

@webApp.route("/fileUp",methods=["post"])
def fileUp():
    fileHold = request.files["upload_file"]
    infodig = str(math.floor(time.time() * 10000))
    dirpfx = hashlib.md5(infodig.encode(encoding="UTF-8")).hexdigest()
    os.mkdir("./static/storage/file/" + dirpfx)
    fpath = "./static/storage/file/" + dirpfx + "/" + fileHold.filename
    fileHold.save(fpath)
    return dirpfx


@webApp.route("/fileDown",methods=["get"])
def fileDown():
    fpath = "storage/file/"
    fid = request.args["fid"]
    flist = os.listdir("./static/" + fpath + fid)
    fname = flist[0]
    return webApp.send_static_file(fpath + fid + "/" + fname)

@webApp.route("/imgUp",methods=["post"])
def imgUp():
    imgHold = request.files["upload_img"]
    infodig = str(math.floor(time.time() * 10000))
    dirpfx = hashlib.md5(infodig.encode(encoding="UTF-8")).hexdigest()
    os.mkdir("./static/storage/img/" + dirpfx)
    fpath = "./static/storage/img/" + dirpfx + "/" + imgHold.filename
    imgHold.save(fpath)
    return dirpfx


@webApp.route("/imgDown",methods=["get"])
def imgDown():
    fpath = "storage/img/"
    fid = request.args["fid"]
    flist = os.listdir("./static/" + fpath + fid)
    fname = flist[0]
    return webApp.send_static_file(fpath + fid + "/" + fname)

@webApp.route("/favicon.ico")
def favicon():
    return webApp.send_static_file("favicon.ico")

if(__name__ == "__main__"):
    databs.dbInit()
    webApp.run("127.0.0.1",port=19111,debug=True)