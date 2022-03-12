# Phase 1
fRead = open("2100011047_cnAirport.txt","r")
txtRead = fRead.read()
linesRead = txtRead.splitlines(False)

def datas2tuple(data):
	vol2018 = float(data[2])
	ratio = float(data[3]) / 100.0
	vol2017 = vol2018 / (1.0 + ratio)
	# v7 * (1 + r) == v8
	"""
		data[1]
		float(data[2])
		vol2017
		vol2018-vol2017
	"""
	return tuple([data[1],vol2018,vol2017,vol2018-vol2017])

datas = [datas2tuple(line.split(",")) for line in linesRead]


# Phase 2
datas.sort(key=lambda x:x[2],reverse=True)
for i in range(0,len(datas)):
	print("%d,%s,%.1f,%.1f" % (i + 1,datas[i][0],datas[i][1],datas[i][2]))

# Phase 3
datas.sort(key=lambda x:x[3],reverse=True)
for i in range(0,len(datas)):
	print("%d,%s,%.1f,%.1f" % (i + 1,datas[i][0],datas[i][1],datas[i][2]))

# Phase 4
datas.sort(key=lambda x:1.0 * x[3] / x[2],reverse=True)
for i in range(0,len(datas)):
	print("%d,%s,%.1f,%.1f" % (i + 1,datas[i][0],datas[i][1],datas[i][2]))

