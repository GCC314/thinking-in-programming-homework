function isValid(grid){
    xx = parseInt(grid[3]);
    yy = parseInt(grid[4]);
    var cnt = [0,0,0,0,0,0,0,0,0,0];
    for(var y = 0;y < 9;y++){
        u = parseInt($("#td_" + xx.toString() + y.toString()).html());
        //console.log(u)
        if(u != NaN && (1 <= u && u <= 9)){
            ++cnt[u];
            if(cnt[u] > 1){
                return false;
            }
        }
    }
    cnt = [0,0,0,0,0,0,0,0,0,0];
    for(var x = 0;x < 9;x++){
        u = parseInt($("#td_" + x.toString() + yy.toString()).html());
        //console.log(u)
        if(u != NaN && (1 <= u && u <= 9)){
            ++cnt[u];
            if(cnt[u] > 1){
                return false;
            }
        }
    }
    x0 = xx - xx % 3;
    y0 = yy - yy % 3;
    cnt = [0,0,0,0,0,0,0,0,0,0];
    for(var x = x0;x < x0 + 3;x++){
        for(var y = y0;y < y0 + 3;y++){
            u = parseInt($("#td_" + x.toString() + y.toString()).html());
            if(u != NaN && (1 <= u && u <= 9)){
                ++cnt[u];
                if(cnt[u] > 1){
                    return false;
                }
            }
        }
    }
    return true;
}

function zgrid(x,y){
    z = parseInt($("#td_" + x.toString() + y.toString()).html());
    if(z == NaN){
        z = 0;
    }
    return z;
}

function setzgrid(x,y,v){
    $("#td_" + x.toString() + y.toString()).toggleClass("invalidCell",v);
}

function rerender(){
    flag = true;
    for(var x = 0;x < 9;x++){
        for(var y = 0;y < 9;y++){
            setzgrid(x,y,false);
        }
    }
    for(var x = 0;x < 9;x++){
        iflag = true;
        cnt = [0,0,0,0,0,0,0,0,0,0];
        for(var y = 0;y < 9;y++){
            u = zgrid(x,y);
            if(u && ++cnt[u] > 1){
                iflag = flag = false;
            }
        }
        if(!iflag){
            for(var y = 0;y < 9;y++){
                setzgrid(x,y,true);
            }
        }
    }
    for(var y = 0;y < 9;y++){
        iflag = true;
        cnt = [0,0,0,0,0,0,0,0,0,0];
        for(var x = 0;x < 9;x++){
            u = zgrid(x,y);
            if(u && ++cnt[u] > 1){
                iflag = flag = false;
            }
        }
        if(!iflag){
            for(var x = 0;x < 9;x++){
                setzgrid(x,y,true);
            }
        }
    }
    for(var x0 = 0;x0 < 9;x0 += 3){
        for(var y0 = 0;y0 < 9;y0 += 3){
            iflag = true;
            cnt = [0,0,0,0,0,0,0,0,0,0];
            for(var x = x0;x < x0 + 3;x++){
                for(var y = y0;y < y0 + 3;y++){
                    u = zgrid(x,y);
                    if(u && ++cnt[u] > 1){
                        iflag = flag = false;
                    }
                }
            }
            if(!iflag){
                for(var x = x0;x < x0 + 3;x++){
                    for(var y = y0;y < y0 + 3;y++){
                        setzgrid(x,y,true)
                    }
                }
            }
        }
    }
    return flag;
}

function countBlank(){
    cnt = 0;
    $(".zeroCell").each(function(){
        if($(this).html() == ""){
            ++cnt;
        }
    });
    return cnt;
}

var TouchFlag = false;
var TimerSeconds = 0;
var mTimer = "";

$(document).ready(function(){
    TouchFlag = false;
    TimerSeconds = 0;
})

function FF(str){
    while(str.length < 2){
        str = "0" + str;
    }
    return str;
}

function TimeToString(time){
    var h = Math.floor(time / 3600);
    var m = Math.floor((time % 3600) / 60);
    var s = Math.floor(time % 60);
    return FF(h.toString()) + ":" + FF(m.toString()) + ":" + FF(s.toString());
}

function TimerUpdate(){
    TimerSeconds++;
    $("#TimerBand").html(TimeToString(TimerSeconds));
}

$(".zeroCell").click(function(){
    if(!TouchFlag){
        TouchFlag = true;
        mTimer = setInterval("TimerUpdate();", 1000);
    }
    stru = prompt("Please input number!(0~9)",9);
    if(stru == ""){
        return;
    }
    u = parseInt(stru);
    if(u != NaN && (0 <= u && u <= 9)){
        if(u == 0){
            $(this).html("");
        }else{
            $(this).html(u.toString());
        }
        if(rerender() && countBlank() == 0){
            DealEnd();
        }
    }else{
        alert("Invalid input!");
    }
});

function DealEnd(){
    endstr = ["","",""];
    clearInterval(mTimer);
    endstr[0] = "<p class='blabel'>Congratulations!</p><br><p class='blabel'>You finished in </p><br><p class='blabel notablelabel timer'>";
    endstr[1] = TimeToString(TimerSeconds);
    endstr[2] = "</p><br><input type='image' src='/static/img/finish.png'><br><form action='/game' method='post'><br><input type='submit' value='Start next round!' class='buttons pfbuttons'><br></form>";
    $("#Box").html(endstr.join(""));
}