function parseRGB(str){
    str = str.substring(str.indexOf("(") + 1,str.lastIndexOf(")"));
    console.log(str.split(", "))
    return str.split(", ").map(function(v){return parseInt(v)});
}

function intToHex(v){
    return v.toString(16)
}

function RGBtoString(rgbs){
    return "#" + intToHex(rgbs[0]) + intToHex(rgbs[1]) + intToHex(rgbs[2]);
}

$(".buttons").mouseenter(function(){
    var col = $(this).css("background-color")
    var rgb = parseRGB(col);
    console.log(rgb)
    rgb[0] += 16;rgb[1] += 16;rgb[2] += 16;
    console.log(rgb)
    col = RGBtoString(rgb);
    console.log(col);
    $(this).css({"background-color":col});
    //$(this).animate({"background-color":col});
});

$(".buttons").mouseleave(function(){
    var col = $(this).css("background-color")
    var rgb = parseRGB(col);
    rgb[0] -= 16;rgb[1] -= 16;rgb[2] -= 16;
    col = RGBtoString(rgb);
    console.log(col);
    //$(this).animate({"background-color":col});
    $(this).css({"background-color":col});
});