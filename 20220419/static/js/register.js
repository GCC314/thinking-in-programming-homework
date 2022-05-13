function validchk(){
    uname = $("#username").val();
    passwd = $("#passwd").val();
    email = $("#email").val();
    if(!isUsernameValid(uname)){
        $("#suggest").html("Invalid username!");
        $("#username").val("");
        return false;
    }
    if(passwd.length < 8){
        $("#suggest").html("Password too short!");
        $("#passwd").val("");
        return false;
    }
    if(passwd.length > 25){
        $("#suggest").html("Password too long!");
        $("#passwd").val("");
        return false;
    }
    if(!isPasswdValid(passwd)){
        $("#suggest").html("Invalid password!");
        $("#passwd").val("");
        return false;
    }
    if(!isEmailValid(email)){
        $("#suggest").html("Invalid email!");
        $("#email").val("");
        return false;
    }
    var eFlag = "";
    $.post("/uInfo",{rqType:"userexist",username:uname},function(data){eFlag = data;});
    if(eFlag == "E"){
        $("#suggest").html("User exists!");
        $("#username").val("");
        return false;
    }
    $.post("/uInfo",{rqType:"emailexist",email:email},function(data){eFlag = data;});
    if(eFlag == "E"){
        $("#suggest").html("Email in use!");
        $("#email").val("");
        return false;
    }
    return true;
}

$("#register").click(function(){
    if(!validchk()) return;
    VFlag = "";
    $.post("/uInfo",{rqType:"verifycode",email:$("#email").val(),vcode:$("#vcode").val()},function(data){VFlag = data;});
    if(VFlag == "N"){
        $("#suggest").html("The email isn't sent yet!");
        $("#vcode").val("");
    }
    if(VFlag == "W"){
        $("#suggest").html("Wrong code!");
        $("#vcode").val("");
    }
    if(VFlag == "E"){
        $("#suggest").html("Code expired!");
        $("#vcode").val("");
    }
    $.post("/uInfo",{rqType:"ureg",username:$("#username").val(),passwd:$("#passwd").val(),email:$("#email").val()},function(data){});
    window.location.replace("/login?s=r");
})

function btnUpdate(t){
    if(t > 0){
        $("#sendvm").val("Send VCode(" + t.toString() + ")");
        if(t == 60) $("#sendvm").toggleClass("hidbutton_disable",true);
    }else{
        $("#sendvm").val("Send VCode");
        $("#sendvm").toggleClass("hidbutton_disable",false);
    }
}
var vmTimer = "";
var TimeStamp = 0;
var vmTimerOn = false;
$(document).ready(function(){
    $.ajaxSettings.async = false; 
    vmTimerOn = false;
    TimerStamp = 0;
})
function TimerUpdate(){
    --TimeStamp;
    btnUpdate(TimeStamp);
    if(TimeStamp == 0){
        vmTimerOn = false;
        clearInterval(vmTimer);
    }
}
function TimerStart(){
    if(vmTimerOn) return;
    TimeStamp = 60;
    vmTimerOn = true;
    btnUpdate(60);
    vmTimer = setInterval("TimerUpdate()",1000);
}

$("#email").change(function(){
    $("#register").attr("disabled",true);
    $("#register").toggleClass("hcbuttons",false);
})
$("#username").change(function(){
    $("#register").attr("disabled",true);
    $("#register").toggleClass("hcbuttons",false);
})
$("#passwd").change(function(){
    $("#register").attr("disabled",true);
    $("#register").toggleClass("hcbuttons",false);
})

$("#sendvm").click(function(){
    if(vmTimerOn) return;
    if(!validchk()) return;
    $.post("/uInfo",{rqType:"sendmail",email:$("#email").val(),mtype:"RG"},function(data){
        if(data == "F"){
            $("#suggest").html("Failed to send email!");
            return;
        }
        TimerStart();
        $("#register").attr("disabled",false);
        $("#register").toggleClass("hcbuttons",true);
    });
    console.log("4");
})


$("#goback").click(function(){
    window.location.replace("/login");
})