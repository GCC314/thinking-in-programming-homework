import random
from sudoku import solve_sudoku
import copy
import itertools

def mat2seq(mat):
    return "".join(["".join(list(map(str,mat[i]))) for i in range(9)])

def seq2mat(seq):
    return [[int(seq[i * 9 + j]) for j in range(9)] for i in range(9)]

def isMovable(mat,x,y,u):
    if(mat[x][y] != 0):
        return False
    for y_ in range(9):
        if(mat[x][y_] == u):
            return False
    for x_ in range(9):
        if(mat[x_][y] == u):
            return False
    xb , yb = x - x % 3 , y - y % 3
    for x_ in range(xb,xb + 3):
        for y_ in range(yb,yb + 3):
            if(mat[x_][y_] == u):
                return False
    return True

def isValid(mat):
    for x in range(9):
        s = set()
        for y in range(9):
            if(mat[x][y] > 0 and mat[x][y] in s):
                return False
            else:
                s.add(mat[x][y])
    for y in range(9):
        s = set()
        for x in range(9):
            if(mat[x][y] > 0 and mat[x][y] in s):
                return False
            else:
                s.add(mat[x][y])
    for x0 in range(0,3):
        for y0 in range(0,3):
            s = set()
            for x in range(x0 * 3,x0 * 3 + 3):
                for y in range(y0 * 3,y0 * 3 + 3):
                    if(mat[x][y] > 0 and mat[x][y] in s):
                        return False
                    else:
                        s.add(mat[x][y])
    return True

__SDK_ELEM_INI = 22
__SDK_ELEM_MIN = 40
__SDK_ELEM_MAX = 55

def difficulty(mat):
    alpha = 0
    for ans in solve_sudoku(mat): alpha += 1
    beta = 0
    for x in range(9):
        for y in range(9):
            if(mat[x][y] == 0):
                beta += 1
    return alpha * beta

def genSdk():
    ret = []
    while(True):
        sdk = [[0 for j in range(9)] for i in range(9)]
        elec = __SDK_ELEM_INI
        k = 0
        beg = random.randint(1,9)
        while(k < elec):
            x = random.randint(0,8)
            y = random.randint(0,8)
            u = (beg + k) % 9 + 1
            if(isMovable(sdk,x,y,u)):
                sdk[x][y] = u
                k += 1
        gflag = False
        for ans in solve_sudoku(sdk):
            ret = copy.deepcopy(ans)
            gflag = True
            break
        if(gflag):
            break
    dig = [_ for _ in itertools.product(range(0,9),range(0,9))]
    random.shuffle(dig)
    resc = random.randint(__SDK_ELEM_MIN,__SDK_ELEM_MAX)
    for ii in range(resc,81):
        ret[dig[ii][0]][dig[ii][1]] = 0
    return ret


def appendFile_mat(filename,sdk=None):
    with open(filename,"a+") as file:
        print(mat2seq(sdk),file=file)
    
def appendFile_seq(filename,sdk=None):
    with open(filename,"a+") as file:
        print(sdk,file=file)

def isFileEmpty(filename):
    try:
        file = open(filename,"r+")
    except(FileNotFoundError):
        return True
    with open(filename,"r+") as file:
        return len(file.read().splitlines(False)) == 0

def randomgFile(filename):
    try:
        file = open(filename,"r+")
    except(FileNotFoundError):
        return None
    with open(filename,"r+") as file:
        lines = file.read().splitlines(False)
        if(len(lines) == 0):
            return None
        return seq2mat(random.choice(lines))

def solvable(seq):
    for ans in solve_sudoku(seq2mat(seq)):
        return True
    return False