import data,sudoku

def GenerateASudoku():
    a = []
    for s in sudoku.solve_sudoku(data.genSdk()):
        a.append(s)
    if(len(a) == 0):
        return None
    else:
        return data.mat2seq(a[0])