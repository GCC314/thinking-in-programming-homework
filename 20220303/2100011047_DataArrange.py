fRead = open("ChinaAirportData.txt","r")
txtRead = fRead.read()
linesRead = txtRead.splitlines(False)
fRead.close()

fWrite = open("2100011047_cnAirport.txt","w")

for dataStr in linesRead[1:]:
	datas = dataStr.split(",")
	if(len(datas) < 4):		# invalid
		continue
	if(len(datas) == 4 and datas[2] == ""):	# invalid
		continue			
	if(len(datas) == 5):	# erase the thousand comma by merging
		datas = [datas[0],datas[1],datas[2] + datas[3],datas[4]]
	if(datas[3] == "-100"):	# invalid in mathematics
		continue
	outStr = ",".join(datas)
	print(outStr,file=fWrite)
fWrite.close()
