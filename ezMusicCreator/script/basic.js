/*
 * 2022 © MaoHuPi
 */
function $(e, p = document){return(p.querySelector(e));}
function $$(e, p = document){return(p.querySelectorAll(e));}
class random{
    static range(min, max){
       return(Math.floor(min + Math.random()*(max - min)));
    };
    static pick(list){
        return(list[Math.floor(random.range(0, list.length))]);
     };
}
function isNum(input){
    return(parseInt(input) != NaN);
};
// function rgbToHsl(r, g, b){
//     var sort = [r, g, b].sort();
//     var hsl = [0, 0, 0];
//     hsl[2] = sort[2];
//     hsl[1] = (sort[2] - sort[0])/sort[2];
//     var getDeg = (x) => {
//         angle = 0;
//         switch(x){
//             case r:
//                 lightestAngle = 0;
//                 break;
//             case g:
//                 lightestAngle = 120;
//                 break;
//             case b:
//                 lightestAngle = 240;
//                 break;
//         }
//         return(angle);
//     };
//     hsl[0] = ((getDeg(sort[2]) + getDeg(sort[1]))/2)*(sort[1] - sort[0])/(sort[2] - sort[0]);
//     return(hsl);
// }
function hexToHsl(hex) {
    // https://stackoverflow.com/questions/62390243/java-script-how-can-i-pull-the-hsl-value-when-a-colour-is-selected-from-input-t
    var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    var r = parseInt(result[1], 16);
    var g = parseInt(result[2], 16);
    var b = parseInt(result[3], 16);
    r /= 255, g /= 255, b /= 255;
    var max = Math.max(r, g, b), min = Math.min(r, g, b);
    var h, s, l = (max + min) / 2;
    if(max == min){
        h = s = 0; // achromatic
    } else {
        var d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
        switch(max) {
            case r: h = (g - b) / d + (g < b ? 6 : 0); break;
            case g: h = (b - r) / d + 2; break;
            case b: h = (r - g) / d + 4; break;
        }
        
        h /= 6;
    }
    s = s*100;
    s = Math.round(s);
    l = l*100;
    l = Math.round(l);
    h = Math.round(360*h);
    return({h, s, l});
}
function circleiseDistance(a, b, max){
    var sort = [a, b].sort();
    return(Math.min(Math.abs(sort[1] - sort[0]), Math.abs(sort[1] - (sort[0] + max))))
}
function sendXmlhttp(name = '', value = '', responseFunction = t => {console.log(t);}, type = 'get'){
    let xmlhttp = new XMLHttpRequest();
    let rf = function (){
        if (xmlhttp.readyState==4) {
            responseFunction(xmlhttp.responseText);
        }
    }
    type = type.toLowerCase();
    xmlhttp.addEventListener("readystatechange", rf);
    if(type == 'get'){
        xmlhttp.open("GET", name+value);
        xmlhttp.send();
    }
    else if(type == 'post'){
        xmlhttp.open("POST", name,true);
        xmlhttp.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
        xmlhttp.send(value);
    }
}
Array.prototype.remove = function(item){
    return(this.splice(this.indexOf(item), 1));
}