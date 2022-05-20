$("#login").click(function(){
    uname = $("#username").val();
    passwd = $("#passwd").val();
    if(!isUsernameValid(uname)){
        $("#suggest").html("用户名非法!");
        $("#username").val("");
        $("#passwd").val("");
        return;
    }
    if(passwd.length < 8){
        $("#suggest").html("密码过短!");
        $("#passwd").val("");
        return;
    }
    if(passwd.length > 25){
        $("#suggest").html("密码过长!");
        $("#passwd").val("");
        return;
    }
    if(!isPasswdValid(passwd)){
        $("#suggest").html("密码非法!");
        $("#passwd").val("");
        return;
    }
    uFlag = "";
    $.post("/uInfo",{rqType:"login",username:uname,passwd:passwd},function(data){uFlag = data;});
    if(uFlag == "T"){
        window.location.replace("/");
    }else if(uFlag == "N"){
        $("#suggest").html("用户不存在!");
        $("#username").val("");
        $("#passwd").val("");
        return;
    }else if(uFlag == "F"){
        $("#suggest").html("密码错误!");
        $("#passwd").val("");
        return;
    }
})

$(document).ready(function(){
    $.ajaxSettings.async = false;
})

$("#reg").click(function(){
    window.location.replace("/register");
})

$("#forgot").click(function(){
    window.location.replace("/forgot");
})
