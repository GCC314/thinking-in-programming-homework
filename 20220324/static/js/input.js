function isValid(grid){
    xx = parseInt(grid[3]);
    yy = parseInt(grid[4]);
    var cnt = [0,0,0,0,0,0,0,0,0,0];
    for(var y = 0;y < 9;y++){
        u = parseInt($("#td_" + xx.toString() + y.toString()).html());
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
        ++cnt
    });
    return cnt;
}

$(".zeroCell").click(function(){
    u = parseInt(prompt("Please input number!(0~9)",9));
    if(u != NaN && (0 <= u && u <= 9)){
        bak = $(this).html();
        if(u == 0){
            $(this).html("");
        }else{
            $(this).html(u.toString());
        }
        if(isValid($(this).attr("id")) && countBlank() > 0){
            return;
        }else{
            $(this).html(bak);
            if(countBlank() == 1){
                alert("Please leave at least one blank grid!");
                return;
            }
        }
    }
    alert("Invalid input!");
});

$("#btnSubmit").click(function(){
    sdkstr = ""
    for(var x = 0;x < 9;x++){
        for(var y = 0;y < 9;y++){
            u = $("#td_" + x.toString() + y.toString()).html();
            if(u == ""){
                u = "0";
            }
            sdkstr += u;
        }
    }
    console.log(sdkstr);
    $.post("/input",{sudokuValue:sdkstr},function(data){
        console.log(data);
        if(data[0] == "0"){
            $("#Msg").html("This sudoku is unsolvable.");
        }
        else{
            $("#Msg").html("Succeeded to store a sudoku!");
            for(var x = 0;x < 9;x++){
                for(var y = 0;y < 9;y++){
                    var cur = "#td_" + x.toString() + y.toString();
                    $(cur).html("");
                    $(cur).toggleClass("zeroCell",true);
                    $(cur).on("click",function(){
                        stru = prompt("Please input number!(0~9)",9);
                        if(stru == ""){
                            return;
                        }
                        u = parseInt(stru);
                        if(u != NaN && (0 <= u && u <= 9)){
                            bak = $(this).html();
                            if(u == 0){
                                $(this).html("");
                            }else{
                                $(this).html(u.toString());
                            }
                            if(isValid($(this).attr("id")) && countBlank() > 0){
                                return;
                            }else{
                                $(this).html(bak);
                                if(countBlank() == 1){
                                    alert("Please leave at least one blank grid!");
                                    return;
                                }
                            }
                        }
                        alert("Invalid input!");
                    })
                }
            }
        }
        // $("#sudokubox").html(data.substring(1));
    });
})