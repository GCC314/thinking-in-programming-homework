from flask import Flask,render_template,request
import data

DATA_FILE_NAME = "Sudoku.data"

webSudoku = Flask(__name__)

@webSudoku.route("/",methods=["post","get"])
def root():
	if(data.isFileEmpty(DATA_FILE_NAME)):
		return webSudoku.send_static_file("index0.html")
	else:
		return webSudoku.send_static_file("index.html")

def generate_sdkpage(sdk = None):
	if(sdk == None):
		sdk = [[0 for _ in range(9)] for _ in range(9)]
	tabSudoku = "<table cellpadding='0' cellspacing='0' border='1'>"
	for x in range(9):
		tabSudoku += "<tr>"
		for y in range(9):
			zeroState = rightState = bottomState = False
			cellVal = str(sdk[x][y])
			if(cellVal == "0"):
				zeroState = True
				cellVal = ""
			if(y == 2 or y == 5):
				rightState = True
			if(x == 2 or x == 5):
				bottomState = True
			classValue = ""
			if(zeroState):
				classValue += " zeroCell"
			if(rightState):
				classValue += " rightBolder"
			if(bottomState):
				classValue += " bottomBolder"
			classValue = classValue.strip()
			tdType = "<td>"
			idValue = str(x) + str(y)
			if(len(classValue) != 0):
				tdType = "<td class='%s' id='td_%s'>" % (classValue,idValue)
			else:
				tdType = "<td id='td_%s'>" % (idValue)
			tabSudoku += "%s%s</td>" % (tdType,cellVal)
		tabSudoku += "</tr>"
	tabSudoku += "</table>"
	return tabSudoku

@webSudoku.route("/game",methods=["post","get"])
def game():
	tabSudoku = generate_sdkpage(data.randomgFile(DATA_FILE_NAME))
	return render_template("game.html",placeContent = tabSudoku)

@webSudoku.route("/input",methods=["post","get"])
def input():
	tabSudoku = ""
	wMsg = ""
	if("sudokuValue" in request.form):
		sdk = request.form["sudokuValue"]
		if(data.solvable(sdk)):
			data.appendFile_seq(DATA_FILE_NAME,request.form["sudokuValue"])
			tabSudoku = generate_sdkpage()
			wMsg = "Succeeded to store a sudoku!"
			return "1" + tabSudoku
		else:
			tabSudoku = generate_sdkpage(data.seq2mat(sdk))
			wMsg = "This sudoku is unsolvable."
			return "0" + tabSudoku
	elif("random" in request.form):
		tabSudoku = generate_sdkpage(data.genSdk())
		wMsg = "Generated a random sudoku!"
	else:
		tabSudoku = generate_sdkpage()
	return render_template("input.html",placeContent = tabSudoku,systemMsg = wMsg)

if(__name__ == "__main__"):
	webSudoku.run(host = "127.0.0.1",port = 5055,debug = True)
