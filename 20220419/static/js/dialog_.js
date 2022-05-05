var nowTimestamp = 0;
var focusedGroup = 0;
var userId = 0;
var userName = "";
var groupList = []
var msgList = []
var msgCache = []

function genGroupbtn(groupname,groupid,isAdd=false){
    if(isAdd){
        return "<tr class='groupBlock'><td><input type='button' class='groupbtn_' id='groupadd' value='Add a Group'></td></tr>";
    }else{
        return "<tr class='groupBlock'><td><input type='button' class='groupbtn' id='gbtn_" + groupid + "' value='" + groupname + "'></td></tr>";
    }
}

function genDiatdbtn(msg){
    return "<tr class='dialogBlock'><p> " + msg[1] + " </p><br><p> " + msg[2] + " </p><br><p> " + msg[4] + " </p></tr>";
}

function refreshDialog(){
    dtstring = "";
    for(var msg in MsgList[focusedGroup]){
        dtstring += genDiatdbtn(msg);
    }
    $("#dtable").html(dtstring);
    MsgPtr[focusedGroup] = MsgList[focusedGroup].length - 1;
}

function appendDialog(){
    if(focusedGroup == 0){
        return;
    }
    dtstring = "";
    var lb = MsgPtr[focusedGroup] + 1,rb = MsgList[focusedGroup].length - 1;
    for(var i = lb;i <= rb;i++){
        msg = MsgList[focusedGroup][i];
        dtstring += genDiatdbtn(msg);
    }
    $("#dtable").html(dtstring);
    MsgPtr[focusedGroup] = MsgList[focusedGroup].length - 1;
}

function refreshGroup(){
    gtstring = "";
    for(var group in GroupList){
        gtstring += genGroupbtn(group);
    }
    gtstring += genGroupbtn(0,true);
    $("#gtable").html(gtstring);
    for(var group in GroupList){
        $("#gbtn_" + group.toString()).on("click",function(){
            var gid = parseInt($(this).attr("id").split("_")[1]);
            switchGroup(gid);
        });
    }
    $("#groupadd").on("click",function(){
        newGroup();
    });
}

function updateMsg(gid){
    ndt = new Date();
    nt = ndt.getTime();
    $.post("/dataReq",{rqType:"updmsg",gid:gid,lbts:nowTimestamp,ubts:nt},function(data){
        msgPkg = JSON.parse(data);
        if(!(gid in MsgList)){
            MsgList[gid] = [];
        }
        for(var msg in msgPkg){
            MsgList[gid].push(msg);
        }
    },async=false);
    nowTimestamp = nt;
}

function updateGroup(){
    $.post("/dataReq",{rqType:"updgroup",username:userName},function(data){
        GroupList = JSON.parse(data);
        refreshGroup();
    },async=false);
}

function Refresh(){
    updateGroup();
    for(var groupid in GroupList){
        updateMsg(groupid);
    }
    appendDialog();
}

function SendMsg(msgstr){
    ndt = new Date();
    nt = ndt.getTime();
    msg = JSON.stringify([focusedGroup,userId,nt,msg,msgstr])
    $.post("/dataPush",{rqType:"sendmsg",gid:focusedGroup,sender:userId,ts:nt,mtype:'t',msg},function(data){
        //
    },async=false);
}

$(window).on("load",function(){
    mTimer = setInterval("Refresh();",2000);
    userName = document.cookie.substring(9);
    $.post("/dataReq",{rqType:"getuserid",username:userName},function(data){
        userId = parseInt(data);
    },async=false);
})

$("#submittxt").click(function(){
    if(focusedGroup == 0){
        console.log("attempt to submit text failed");
        return;
    }
    var txt = $("#inputtxt").val();
    if(txt == ""){
        alert("Message cannot be empty!");
        return;
    }
    SendMsg(txt);
    $("#inputtxt").val("");
})

function switchGroup(gid){
    focusedGroup = gid;
    refreshDialog();
}

function newGroup(){
    groupName = prompt("input group name:");
    usrList = prompt("input users:");
    $.post("/dataPush",{rqType:"newgroup",gName:groupName,uList:usrList},function(data){
        updateGroup();
        renderGroup();
    },async=false);
}

$("#groupadd").click(function(){
    newGroup();
})

$(".groupbtn").click(function(){
    var gid = parseInt($(this).attr("id").split("_")[1]);
    switchGroup(gid);
})