function validchk(){
    uname = $("#username").val();
    passwd = $("#passwd").val();
    email = $("#email").val();
    if(!isUsernameValid(uname)){
        $("#suggest").html("用户名非法!");
        $("#username").val("");
        return false;
    }
    if(passwd.length < 8){
        $("#suggest").html("密码过短!");
        $("#passwd").val("");
        return false;
    }
    if(passwd.length > 25){
        $("#suggest").html("密码过长!");
        $("#passwd").val("");
        return false;
    }
    if(!isPasswdValid(passwd)){
        $("#suggest").html("密码非法!");
        $("#passwd").val("");
        return false;
    }
    if(!isEmailValid(email)){
        $("#suggest").html("Email非法!");
        $("#email").val("");
        return false;
    }
    var eFlag = "";
    $.post("/uInfo",{rqType:"userexist",username:uname},function(data){eFlag = data;});
    if(eFlag == "E"){
        $("#suggest").html("用户已存在!");
        $("#username").val("");
        return false;
    }
    $.post("/uInfo",{rqType:"emailexist",email:email},function(data){eFlag = data;});
    if(eFlag == "E"){
        $("#suggest").html("Email已被占用!");
        $("#email").val("");
        return false;
    }
    $("#suggest").html("");
    return true;
}

$("#register").click(function(){
    if(!validchk()) return;
    VFlag = "";
    $.post("/uInfo",{rqType:"verifycode",email:$("#email").val(),vcode:$("#vcode").val()},function(data){VFlag = data;});
    if(VFlag == "N"){
        $("#suggest").html("未发送email!");
        $("#vcode").val("");
    }
    if(VFlag == "W"){
        $("#suggest").html("验证码错误!");
        $("#vcode").val("");
    }
    if(VFlag == "E"){
        $("#suggest").html("验证码过期!");
        $("#vcode").val("");
    }
    $.post("/uInfo",{rqType:"ureg",username:$("#username").val(),passwd:$("#passwd").val(),email:$("#email").val()},function(data){});
    window.location.replace("/login?s=r");
})

function btnUpdate(t){
    if(t > 0){
        $("#sendvm").val("发送验证码(" + t.toString() + ")");
        if(t == 60) $("#sendvm").toggleClass("hidbutton_disable",true);
    }else{
        $("#sendvm").val("发送验证码");
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
            $("#suggest").html("Email发送失败!");
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
