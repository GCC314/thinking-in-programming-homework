import smtplib
from email.mime.text import MIMEText
from email.header import Header
import time
import random
from email.utils import parseaddr,formataddr

mHost = "smtp.163.com"
mUser = "hw_ichat_verify@163.com"
mPass = ""
sender = "hw_ichat_verify@163.com"
receivers = []

def _format_addr(s):
    addr = parseaddr(s)
    return formataddr(addr)

def sendvm(recmail,code,mtype):
    global mHost,mUser,mPass,sender,receivers
    if(mPass == ""):
        with open("mail.pswd","r") as fp:
            mPass = fp.read()
    subject = ""
    msgtext = ""
    if(mtype == "RG"): # register
        subject = "IChat register verification"
        msgtext = f"""
        Your verification code for registration is:
            {code}
        """
    elif(mtype == "RS"): # reset
        subject = "IChat password reset verification"
        msgtext = f"""
        Your verification code for reset is:
            {code}
        """
    message = MIMEText(msgtext,'plain','utf-8')
    message['From'] = _format_addr("IChat <%s>" % sender)
    message['To'] = _format_addr(recmail)
    message['Subject'] = Header(subject,'utf-8')
    receivers = [recmail]
    try:
        smtpObj = smtplib.SMTP_SSL(mHost,465)
        smtpObj.connect(mHost,465)
        smtpObj.login(mUser,mPass)
        smtpObj.sendmail(sender,receivers,message.as_string())
    except smtplib.SMTPException as err:
        print(err)
        return False
    return True

mp_vcode = {}

def generate(recmail,mtype):
    global mp_vcode
    vcode = str(random.randint(0,999999)).zfill(6)
    ts = time.time()
    recmail = recmail.lower()
    if(sendvm(recmail,vcode,mtype)):
        mp_vcode[recmail] = tuple([vcode,ts])
        return "S"
    else:
        return "F" # Fail

VERIFY_EXPIRE_TIME = 600.0

def verify(recmail,vcode):
    global mp_vcode
    ts = time.time()
    recmail = recmail.lower()
    if(not recmail in mp_vcode): return "N" # not verified
    if(mp_vcode[recmail][0] != vcode): return "W" # wrong vcode
    if(ts - mp_vcode[recmail][1] > VERIFY_EXPIRE_TIME): return "E" # verification expired
    return "S" # success