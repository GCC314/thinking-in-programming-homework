from flask import Flask,request
import sqlite3
import json

webApp = Flask(__name__)

@webApp.route("/")
def root():
    return webApp.send_static_file("index.html")

def tableRender(rawdata):
    tbstring = "<tr class='tbHead'><td>日期</td><td>开盘价</td><td>最高价</td><td>最低价</td><td>收盘价</td><td>涨跌额</td><td>涨跌幅(%)</td><td>成交量(手)</td><td>成交金额(万元)</td><td>振幅(%)</td><td>换手率(%)</td></tr>"
    rawdata.sort(key=lambda x:x[0])
    for rawln in rawdata:
        lnstring = ""
        for i in range(0,11):
            if(1 <= i < 7):
                lnstring += f"<td class='{rawln[10 + i]}'>{rawln[i]}</td>"
            else:
                lnstring += f"<td>{rawln[i]}</td>"
        tbstring += "<tr>" + lnstring + "</tr>"
    return "<table>" + tbstring + "</table>"

@webApp.route("/dataReq",methods=["POST"])
def dataReq():
    dbConn = sqlite3.connect("stock.db")
    year = request.form['year']
    month = request.form['month']
    if(len(month) < 2): month = "0" * (2 - len(month)) + month
    stkid = request.form['stkid']
    dt = year + "-" + month
    sqlstr = f"select * from stock_{stkid} where date like '{dt}%' "
    print(sqlstr)
    dataList = dbConn.execute(sqlstr).fetchall()
    dbConn.close()
    return tableRender(dataList)
    #return json.dumps(dataList)

if(__name__ == "__main__"):
    webApp.run("127.0.0.1",port=4848,debug=True)