$("#submit").click(function(){
    year = $("#year").val();
    month = $("#month").val();
    stkid = $("#stkid").val();
    $.post("/dataReq",{year:year,month:month,stkid:stkid},function(data){
        $("#result").html(data);
    });
})