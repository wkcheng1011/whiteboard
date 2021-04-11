$(function(){
    
    $(".author").each(function(){
        let rn_color = '#' + (Math.floor(Math.random()*16777215)&0xFFFFFF).toString(16);
        $(this).css("color",rn_color);
    });

});