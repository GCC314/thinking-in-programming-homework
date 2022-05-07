from flask import Flask,render_template,request,session,make_response
import os,datetime
import databs

webApp = Flask(__name__)
webApp.secret_key = os.urandom(24)

@webApp.route("/",methods=["post","get"])
def root():
    if("username" in session):
        if("PKG" in request.form and request.form["PKG"] == "logout_submit"):
            session.pop('username')
            return render_template("login.html")
        res = make_response(render_template("dialog.html"))
        res.set_cookie("username",session["username"])
        return res
    if(not "PKG" in request.form):
        return render_template("login.html")
    if(request.form["PKG"] == "logout_submit"):
        session.pop('username')
        return render_template("login.html")
    if(request.form["PKG"] == "reg_jmp"):
        return render_template("register.html")
    if(request.form["PKG"] == "reg_submit"):
        uname = request.form["username"]
        upwd = request.form["passwd"]
        if(not databs.isNameValid(uname)):
            return render_template("register.html",statusMsg="Invalid username!")
        if(not databs.isPswdValid(upwd)):
            return render_template("register.html",statusMsg="Invalid password!")
        if(databs.UserExist(uname)):
            return render_template("register.html",statusMsg="User already exists!")
        databs.UserRegister(uname,upwd)
        return render_template("login.html",statusMsg="Successfully registered! ")
    if(request.form["PKG"] == "login_submit"):
        uname = request.form["username"]
        upwd = request.form["passwd"]
        if(not databs.isNameValid(uname)):
            return render_template("login.html",statusMsg="Invalid username!")
        if(not databs.isPswdValid(upwd)):
            return render_template("login.html",statusMsg="Invalid password!")
        if(not databs.UserExist(uname)):
            return render_template("login.html",statusMsg="User does not exist!")
        if(not databs.UserPwdCheck(uname,upwd)):
            return render_template("login.html",statusMsg="Password wrong!")
        session["username"] = uname
        dcontent = render_template("dialog.html")
        res = make_response(dcontent)
        res.set_cookie("username",session["username"])
        return res
    return render_template("login.html",statusMsg="Unknown arg")

@webApp.route("/dataReq",methods=["post"])
def dataReq():
    if(request.form['rqType'] == "updmsg"):
        return databs.reqUpdMsg(request.form['gname'],request.form['ubts'])
    if(request.form['rqType'] == "syncmsg"):
        return databs.reqSyncMsg(request.form['gname'],request.form['lbts'],request.form['ubts'],session['username'])
    if(request.form['rqType'] == "updgroup"):
        return databs.getUserGroup(request.form['username'])
    if(request.form['rqType'] == "userexist"):
        if(databs.UserExist(request.form['username'])):
            return "E"
        else:
            return "O"
    return ""

@webApp.route("/dataPush",methods=["post"])
def dataPush():
    if(request.form['rqType'] == "newgroup"):
        databs.addGroup(request.form['gname'],request.form['ulist'])
        return ""
    if(request.form['rqType'] == "sendmsg"):
        databs.sendMsg(request.form['gname'],request.form['sender'],request.form['ts'],request.form['mtype'],request.form['msg'])
        return ""
    return ""

if(__name__ == "__main__"):
    databs.dbInit()
    webApp.run("127.0.0.1",port=19111,debug=True)