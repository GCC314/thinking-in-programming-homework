nowTimestamp = 0;
var focusedGroup = "";
var userId = 0;
var userName = "";
var groupList = []
var msgList = {}
var msgCache = {}

function genGroupbtn(groupname,ischosen=false){
    if(ischosen) return "<input type='button' class='groupbtn sidebuttons sidebuttons_c' id='gbtn_" + groupname + "' value='" + groupname + "'>";
    else return "<input type='button' class='groupbtn sidebuttons' id='gbtn_" + groupname + "' value='" + groupname + "'>";
}
function genDlgbtn(mts,user,tstr,msgstr){
    return "<div class='dmsg' id='msg" + mts + "'><p class='bubbletip'>" + user + " " + tstr + "</p> <p class='bubbletxt'>" + msgstr + "</p></div>"
}
function genDiatdbtn(msg){
    console.log(msg);
    dt = new Date(msg[2]);
    ustr = genDlgbtn(msg[2].toString(),msg[1],dt.toUTCString(),msg[4]);
    console.log(ustr);
    console.log(dt.toUTCString());
    return ustr
}

function renderDialog(){
    if(focusedGroup == ""){
        console.log("Attempt to render dialog failed");
        return;
    }
    dtstring = "";
    for(var msgidx in msgList[focusedGroup]){
        msg = msgList[focusedGroup][msgidx];
        dtstring += genDiatdbtn(msg);
    }
    $("#dialogbox").html(dtstring);
}
function appendDialog(deltaList){
    if(focusedGroup == ""){
        console.log("Attempt to append dialog failed");
        return;
    }
    if(deltaList.length == 0) return;
    console.log("dl");
    console.log(deltaList);
    dtstring = $("#dialogbox").html();
    for(var msgidx in deltaList){
        msg = deltaList[msgidx];
        dtstring += genDiatdbtn(msg);
    }
    $("#dialogbox").html(dtstring);
}
function renderGroup(){
    console.log("renderingGroup");
    gtstring = "";
    for(var gidx in groupList) gtstring += genGroupbtn(groupList[gidx],groupList[gidx] == focusedGroup);
    $("#groupbox").html(gtstring);
    for(var gidx in groupList){
        group = groupList[gidx];
        $("#gbtn_" + group).on("click",function(){
            if(focusedGroup != ""){
                var preg = "#gbtn_" + focusedGroup;
                $(preg).toggleClass("sidebuttons_c",false);
            }
            var gname = $(this).attr("id").split("_")[1];
            console.log(gname);
            focusedGroup = gname;
            $(this).toggleClass("sidebuttons_c",true);
            renderDialog();
        });
    }
}

function updMsg(gname,nt){
    var pqueue = [];
    if(!(gname in msgList)) msgList[gname] = [];
    if(!(gname in msgCache)) msgCache[gname] = [];
    console.log("nowTimestamp")
    console.log(nowTimestamp);
    if(nowTimestamp == 0){
        $.post("/dataReq",{rqType:"updmsg",gname:gname,ubts:nt},function(data){
            msgpkg = JSON.parse(data);
            msgList[gname] = msgpkg;
        },async=false);
    }else{
        $.post("/dataReq",{rqType:"syncmsg",gname:gname,lbts:nowTimestamp,ubts:nt},function(data){
            newmsg = JSON.parse(data);
            var csize = msgCache[gname].length,nsize = newmsg.length;
            var i = 0,j = 0;
            for(;i < csize && j < nsize;){
                if(msgCache[gname][i][2] < newmsg[j][2]){
                    pqueue.push(msgCache[gname][i]);
                    i++;
                }else{
                    pqueue.push(newmsg[j]);
                    j++;
                }
            }
            for(;i < csize;i++) pqueue.push(msgCache[gname][i]);
            msgCache[gname] = [];
            for(;j < nsize;j++) pqueue.push(newmsg[j]);
            if(pqueue.length > 0) console.log(pqueue);
            msgList[gname].push(...pqueue);
        },async=false);
    }
    return pqueue;
}

function updateGroup(){
    var updflag = true;
    $.post("/dataReq",{rqType:"updgroup",username:userName},function(data){
        gList = JSON.parse(data);
        if(gList.length == groupList.length){
            updflag = false;
            return;
        }
        groupList = gList;
        for(var gnidx in groupList){
            var gname = groupList[gnidx];
            if(!(gname in msgCache)) msgCache[gname] = []
        }
    },async=false);
    return updflag;
}


function SendMsg(msgstr){
    ndt = new Date();
    nt = ndt.getTime();
    msg = JSON.stringify([focusedGroup,userName,nt,'t',msgstr])
    $.post("/dataPush",{rqType:"sendmsg",gname:focusedGroup,sender:userName,ts:nt,mtype:'t',msg:msgstr},function(data){
        msgCache[focusedGroup].push([focusedGroup,userName,nt,'t',msgstr])
    },async=false);
}

function Sync(){
    if(updateGroup()) renderGroup();
    delta = []
    ndt = new Date();
    nt = ndt.getTime();
    for(var gidx in groupList){
        var gname = groupList[gidx];
        d = updMsg(gname,nt);
        if(gname == focusedGroup){
            delta = d;
        }
    }
    if(delta.length != 0){
        console.log("delta");
        console.log(delta);
    }
    if(nowTimestamp == 0){
        renderDialog();
    }else{
        appendDialog(delta);
    }
    nowTimestamp = nt;
}

$(window).on("load",function(){
    $.ajaxSettings.async = false; 
    nowTimestamp = 0;
    userName = document.cookie.substring(9);
    console.log(userName);
    $("#username").html(userName);
    Sync();
    mTimer = setInterval("Sync();",4000);
})

$("#submittxt").click(function(){
    if(focusedGroup == 0){
        console.log("attempt to submit text failed");
        return;
    }
    var txt = $("textarea[name=inputtxt]").val();
    if(txt == ""){
        alert("Message cannot be empty!");
        return;
    }
    SendMsg(txt);
    $("textarea[name=inputtxt]").val("");
})

function genAddGroupbtn(uname,dable=false){
    if(dable) return "<li class='gadd_li gadd_li_dable' id='gadd_li_n_" + uname + "'>" + uname + "</li>";
    else return "<li class='gadd_li' id='gadd_li_n_" + uname + "'>" + uname + "</li>"
}

$("#groupadd").click(function(){
    $("#txt_gname").val("");
    $("#txt_uname_sch").val("");
    $("#ul_ulist").html(genAddGroupbtn(userName,true));
    $("#pop_addg").css({"display":"block"});
})

$(".popup_esc_btn").click(function(){
    $(this).parent().css({"display":"none"});
})

$("#btn_sch").click(function(){
    unameSch = $("#txt_uname_sch").val();
    console.log(unameSch);
    $.post("/dataReq",{rqType:"userexist",username:unameSch},function(data){
        if(data == "E"){
            var bakstr = $("#ul_ulist").html();
            $("#ul_ulist").html(bakstr + genAddGroupbtn(unameSch));
            $("#gadd_li_n_" + unameSch).on("dblclick",function(){
                if($(this).hasClass("gadd_li_dable")) return;
                $(this).remove();
            });
        }
    },async=false);
    $("#txt_uname_sch").val("");
})

$(".gadd_li").dblclick(function(){
    if($(this).hasClass("gadd_li_dable")) return;
    $(this).remove();
})

$("#addg_submit").click(function(){
    groupName = $("#txt_gname").val();
    usrList = "";
    $(".gadd_li").each(function(){
        if(usrList == "") usrList += "\"" + $(this).html() + "\"";
        else usrList += ",\"" + $(this).html() + "\"";
    })
    usrList = "[" + usrList + "]";
    $.post("/dataPush",{rqType:"newgroup",gname:groupName,ulist:usrList},function(data){
        if(updateGroup()) renderGroup();
    },async=false);
    $(this).parent().parent().css({"display":"none"});
})

$(".groupbtn").click(function(){
    if(focusedGroup != ""){
        var preg = "#gbtn_" + focusedGroup;
        $(preg).toggleClass("sidebuttons_c",false);
    }
    var gname = $(this).attr("id").split("_")[1];
    console.log(gname);
    focusedGroup = gname;
    $(this).toggleClass("sidebuttons_c",true);
    renderDialog();
})