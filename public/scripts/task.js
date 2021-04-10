$(function() {

    let rn_color1 = '#' + (Math.floor(Math.random()*16777215)&0xFFFFFF).toString(16);
    let rn_color2 = '#' + (Math.floor(Math.random()*16777215)&0xFFFFFF).toString(16);
    let cl = 'linear-gradient('+rn_color1+','+rn_color2+')';
    // background-image: linear-gradient(#e66465, #9198e5);
    $('.q-top').css('background-image', cl);
    
});