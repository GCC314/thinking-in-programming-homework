function validchk(){
    email = $("#email").val();
    if(!isEmailValid(email)){
        $("#suggest").html("Email非法!");
        $("#email").val("");
        return false;
    }
    eFlag = "";
    $.post("/uInfo",{rqType:"emailexist",email:email},function(data){eFlag = data;});
    if(eFlag != "E"){
        $("#suggest").html("Email未被注册!");
        $("#email").val("");
        return false;
    }
    $("#suggest").html("");
    return true;
}

$("#resetpw").click(function(){
    if(!validchk()) return;
    VFlag = "";
    $.post("/uInfo",{rqType:"verifycode",email:$("#email").val(),vcode:$("#vcode").val()},function(data){VFlag = data;});
    if(VFlag == "N"){
        $("#suggest").html("未发送email!!");
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
    $.post("/uInfo",{rqType:"resetps",email:$("email").val()},function(data){});
    window.location.replace("/login?s=p");
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
    $("#resetpw").attr("disabled",true);
    $("#resetpw").toggleClass("hcbuttons",false);
})

$("#sendvm").click(function(){
    if(vmTimerOn) return;
    if(!validchk()) return;
    $.post("/uInfo",{rqType:"sendmail",email:$("#email").val(),mtype:"RS"},function(data){
        if(data == "F"){
            $("#suggest").html("Email发送失败!");
            return;
        }
        TimerStart();
        $("#resetpw").attr("disabled",false);
        $("#resetpw").toggleClass("hcbuttons",true);
    });
})


$("#goback").click(function(){
    window.location.replace("/login");
})
