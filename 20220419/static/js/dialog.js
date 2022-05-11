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
function genFilebtn(mts,user,tstr,msgstr){
    fmsg = JSON.parse(msgstr);
    return "<div class='dmsg' id='msg" + mts + "'><p class='bubbletip'>" + user + " " + tstr + "</p> <a target='_blank' class='bubbletxt' href='/fileDown?fid=" + fmsg.fid + "'>" + fmsg.fname + "</a></div>"
}
function genImgbtn(mts,user,tstr,msgstr){
    fmsg = JSON.parse(msgstr);
    return "<div class='dmsg' id='msg" + mts + "'><p class='bubbletip'>" + user + " " + tstr + "</p> <img style='max-width:200px;max-height:200px;object-fit:scale-down;' class='bubbletxt' src='/imgDown?fid=" + fmsg.fid + "'></div>"
}
function genDiatdbtn(msg){
    console.log(msg);
    dt = new Date(msg[2]);
    if(msg[3] == 't'){
        ustr = genDlgbtn(msg[2].toString(),msg[1],dt.toUTCString(),msg[4]);
        console.log(ustr);
        console.log(dt.toUTCString());
    }
    else if(msg[3] == 'f'){
        ustr = genFilebtn(msg[2].toString(),msg[1],dt.toUTCString(),msg[4]);
        console.log(ustr);
        console.log(dt.toUTCString());
    }
    else if(msg[3] == 'i'){
        ustr = genImgbtn(msg[2].toString(),msg[1],dt.toUTCString(),msg[4]);
        console.log(ustr);
        console.log(dt.toUTCString());
    }
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


function SendMsg(msgstr,type='t'){
    ndt = new Date();
    nt = ndt.getTime();
    msg = JSON.stringify([focusedGroup,userName,nt,type,msgstr])
    $.post("/dataPush",{rqType:"sendmsg",gname:focusedGroup,sender:userName,ts:nt,mtype:type,msg:msgstr},function(data){
        msgCache[focusedGroup].push([focusedGroup,userName,nt,type,msgstr])
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
    $("#addg_sug").html("");
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

function isValidGroupname(gname){
    if(gname == "") return false;
    for(var i = 0;i < gname.length;i++){
        if(gname[i] == ' ') return false;
        if(gname[i] == '<') return false;
        if(gname[i] == '>') return false;
    }
    return true;
}

$("#addg_submit").click(function(){
    groupName = $("#txt_gname").val();
    if(!isValidGroupname(groupName)){
        $("#addg_sug").html("Invalid Group Name");
        $("#txt_gname").val("");
        return;
    }
    usrList = "";
    $(".gadd_li").each(function(){
        if(usrList == "") usrList += "\"" + $(this).html() + "\"";
        else usrList += ",\"" + $(this).html() + "\"";
    })
    usrList = "[" + usrList + "]";
    var isSuccess = true;
    $.post("/dataPush",{rqType:"newgroup",gname:groupName,ulist:usrList},function(data){
        if(data == "F"){
            isSuccess = false;
            return;
        }
    },async=false);
    if(isSuccess){
        if(updateGroup()) renderGroup();
        $(this).parent().parent().css({"display":"none"});
    }else{
        $("#addg_sug").html("Group Name exists");
        $("#txt_gname").val("");
    }
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


// FILE UPLOAD PART

fuploading = false;

$("#sendfile").click(function(){
    if(focusedGroup == "") return;
    if(fuploading) return;
    $("#fileholder").trigger("click");
})

// TODO : make the button animated

$("#fileholder").change(function(){
    flist = $(this).get(0).files;
    if(flist.length == 0 || flist == undefined){
        return;
    }
    fitem = flist[0]; 
    if(fitem.size > 50 * 1024 * 1024){
        alert("File too big!");
        return;
    }
    var formData = new FormData();
    formData.append("upload_file",fitem);
    $.ajax({
        url:"/fileUp",type:'POST',cache:false,data:formData,processData:false,contentType:false,dataType: "json",beforeSend:function(){
            $("#sendfile").val("");
            fuploading = true;
        },success:function(result,status,xhr){
            console.log("success",result,status,xhr);
            fmsg = {
                fid : result,
                fname : fitem.name
            };
            SendMsg(JSON.stringify(fmsg),'f');
            $("#sendfile").val("");
            fuploading = false;
        },error:function(xhr,status,error){
            console.log("error",xhr,status,error);
            if(xhr.status == 200){
                fmsg = {
                    fid : xhr.responseText,
                    fname : fitem.name
                };
                SendMsg(JSON.stringify(fmsg),'f');
                $("#sendfile").val("");
                fuploading = false;
            }else{
                alert("Failed to upload");
                $("#sendfile").val("");
                fuploading = false;
            }
        }
    });
})

//FILE UPLOAD PART END

// IMG UPLOAD PART

iuploading = false;

$("#sendimg").click(function(){
    if(focusedGroup == "") return;
    if(iuploading) return;
    $("#imgholder").trigger("click");
})

// TODO : make the button animated

$("#imgholder").change(function(){
    flist = $(this).get(0).files;
    if(flist.length == 0 || flist == undefined){
        return;
    }
    fitem = flist[0]; 
    if(fitem.size > 10 * 1024 * 1024){
        alert("File too big!");
        return;
    }
    var formData = new FormData();
    formData.append("upload_img",fitem);
    $.ajax({
        url:"/imgUp",type:'POST',cache:false,data:formData,processData:false,contentType:false,dataType: "json",beforeSend:function(){
            $("#sendimg").val("");
            iuploading = true;
        },success:function(result,status,xhr){
            console.log("success",result,status,xhr);
            fmsg = {
                fid : result,
                fname : fitem.name
            };
            SendMsg(JSON.stringify(fmsg),'i');
            $("#sendimg").val("");
            iuploading = false;
        },error:function(xhr,status,error){
            console.log("error",xhr,status,error);
            if(xhr.status == 200){
                fmsg = {
                    fid : xhr.responseText,
                    fname : fitem.name
                };
                SendMsg(JSON.stringify(fmsg),'i');
                $("#sendimg").val("");
                iuploading = false;
            }else{
                alert("Failed to upload");
                $("#sendimg").val("");
                iuploading = false;
            }
        }
    });
})

//IMG UPLOAD PART END