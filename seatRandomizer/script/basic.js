// src https://tab-studio.github.io/TSJSlib/basic.js
// version 2.0.3
function $(e, f = document){return(f.querySelector(e));}
function $$(e, f = document){return(f.querySelectorAll(e));}
function $e(e){return(document.createElement(e));}
function vw(){return(window.innerWidth/100);}
function vh(){return(window.innerHeight/100);}
function random(min, max){return(Math.floor(Math.random()*(max+1-min))+min);}
const keys = {}, 
$_GET = {}, 
$_COOKIE = {};
if(location.href.indexOf('?') > -1){
    location.href.split('?')[1].split('&').forEach(kv => {
        kv = kv.split('=');
        $_GET[kv[0]] = kv[1];
    });
}
if(document.cookie !== ''){
    document.cookie.split('; ').forEach(kv => {
        kv = kv.split('=');
        $_COOKIE[kv[0]] = kv[1];
    });
}
function getGet(key = false){
    let get = {};
    if(location.href.indexOf('?') > -1){
        location.href.split('?')[1].split('&').forEach(kv => {
            kv = kv.split('=');
            get[kv[0]] = kv[1];
        });
    }
    if(key !== false){
        return(get[key]);
    }
    else{
        return(get);
    }
}
function getCookie(key = false){
    let cookie = {};
    if(document.cookie !== ''){
        document.cookie.split('; ').forEach(kv => {
            kv = kv.split('=');
            cookie[kv[0]] = kv[1];
        });
    }
    if(key !== false){
        return(cookie[key]);
    }
    else{
        return(cookie);
    }
}
function setCookie(key = undefined, value = undefined, expire = undefined, path = undefined, domain = undefined, secure = undefined){
    let cookie = '';
    if(key !== undefined && value !== undefined){
        cookie = `${key}=${value}`;
        if(expire !== undefined){
            cookie += `; expires=${expire}`;
        }
        if(path !== undefined){
            cookie += `; path=${path}`;
        }
        if(domain !== undefined){
            cookie += `; domain=${domain}`;
        }
        if(secure !== undefined){
            cookie += `; secure`;
        }
        document.cookie = cookie;
    }
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
function webLoad(link){
    if(keys['Control']){
        window.open(link);
    }
    else{
        location.href = link;
    }
}
function webOpen(link){
    window.open(link);
}
function radians(deg){
    return(deg * (Math.PI / 180));
}
function deg(radians){
    return(radians / (Math.PI / 180));
}
function toPxNum(text){
    if(text.indexOf('px') > -1){
        return(text.split('px')[0]);
    }
    if(text.indexOf('vw') > -1){
        return(text.split('vw')[0]*vw());
    }
    if(text.indexOf('vh') > -1){
        return(text.split('vh')[0]*vw());
    }
    return(text);
}
console.heightLightLog = function(text, regexp = /(null|undefined)/g, color = '#ff6666'){
    text = text.replaceAll(regexp, '%c$1%c');
    let colorArray = new Array(text.match(/%c/g).length).fill(0).map((n, i) => i%2 == 0 ? `color: ${color};` : 'color: white;')
    this.log(text, ...colorArray);
}
function deepCopy(obj){
    return(JSON.parse(JSON.stringify(obj)));
}
function distance(p1, p2){
    p1 = Object.values(p1);
    p2 = Object.values(p2);
    if(p1.length != p2.length){
        return;
    }
    let d = 0;
    for(let i = 0; i < p1.length; i++){
        d = (d**2 + (p1[i] - p2[i])**2)**0.5
    }
    return(d);
}
function closest(p1, pList){
    let p2 = pList.map(p => [distance(p1, p), p]).sort((a, b) => a[0] - b[0])[0][1];
    return(p2);
}