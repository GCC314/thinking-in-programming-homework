import os
import requests
from bs4 import BeautifulSoup
import sqlite3
import time

def parseWord(idx,word):
    if(idx == 0): return word
    if(idx == 7 or idx == 8): return int(word.replace(",",""))
    return float(word)

def parsedData(lList):
    if(len(lList) != 11):
        return None
    return tuple([parseWord(i,v.text) for i,v in enumerate(lList)]) + tuple([lList[idx].attrs['class'][0] for idx in range(1,7)])

try: os.remove("stock.db")
except FileNotFoundError: print("New stock database file")
else: print("Deleted previous database file")

dbConn = sqlite3.connect("stock.db")

dateList = [(y,s) for y in range(2015,2022) for s in range(1,5)] + [(2022,1),(2022,2)]

ts0 = time.time()

for stockId in range(1,6):
    dbConn.execute(f"""CREATE TABLE stock_{stockId}(
        date        text,
        sprice      real,
        hprice      real,
        lprice      real,
        eprice      real,
        deltav      real,
        deltap      real,
        dealnum     integer,
        dealprice   integer,
        amplip      real,
        turnover    real,
        sprice_C    text,
        hprice_C    text,
        lprice_C    text,
        eprice_C    text,
        deltav_C    text,
        deltap_C    text
    )""")
    print(f"Create table {stockId}")
    for dt in dateList:
        url = "https://quotes.money.163.com/trade/lsjysj_00000%d.html?year=%d&season=%d" % (stockId,dt[0],dt[1])
        req = requests.get(url)
        obs = BeautifulSoup(req.text,"html.parser")
        print(f"Get data of {dt[0]}/{dt[1]}")
        tbl = obs.find(class_=["table_bg001 border_box limit_sale"])
        for idx,tr in enumerate(tbl.select("tr")):
            print(f"(time {int(time.time() - ts0)}) [{stockId}] [{dt[0]}/{dt[1]}] data id {idx}")
            ltuple = parsedData([td for td in tr.select("td")])
            if(ltuple == None): continue
            dbConn.execute(f"""insert into stock_{stockId}
                values{ltuple}
            """)
        dbConn.commit()

dbConn.close()