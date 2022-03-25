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

function countBlank(){
    cnt = 0;
    $(".zeroCell").each(function(){
        if($(this).html() == ""){
            ++cnt;
        }
    });
    return cnt;
}

$(".zeroCell").click(function(){
    u = parseInt(prompt("Please input number!(1~9)",9));
    if(u != NaN && (1 <= u && u <= 9)){
        bak = $(this).html();
        $(this).html(u.toString());
        if(isValid($(this.attr("id")))){
            if(countBlank() == 0){
                DealEnd();
            }
        }else{
            $(this).html(bak)
        }
    }else{
        alert("Invalid input!");
    }
});

function DealEnd(){
    endstr = "<p class='tips'>Congratulations!</p><br><input type='image' src='finish.png'><br><form action='/game' method='post'><br><input type='submit' value='Start next round!' class='buttons'><br></form>"
    $("#Box").html() = endstr
}