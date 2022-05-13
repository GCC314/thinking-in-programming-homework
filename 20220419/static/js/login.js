$("#login").click(function(){
    uname = $("#username").val();
    passwd = $("#passwd").val();
    if(!isUsernameValid(uname)){
        $("#suggest").html("Invalid username!");
        $("#username").val("");
        $("#passwd").val("");
        return;
    }
    if(passwd.length < 8){
        $("#suggest").html("Password too short!");
        $("#passwd").val("");
        return;
    }
    if(passwd.length > 25){
        $("#suggest").html("Password too long!");
        $("#passwd").val("");
        return;
    }
    if(!isPasswdValid(passwd)){
        $("#suggest").html("Invalid password!");
        $("#passwd").val("");
        return;
    }
    uFlag = "";
    $.post("/uInfo",{rqType:"login",username:uname,passwd:passwd},function(data){uFlag = data;});
    if(uFlag == "T"){
        window.location.replace("/");
    }else if(uFlag == "N"){
        $("#suggest").html("User not exist!");
        $("#username").val("");
        $("#passwd").val("");
        return;
    }else if(uFlag == "F"){
        $("#suggest").html("Wrong password!");
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