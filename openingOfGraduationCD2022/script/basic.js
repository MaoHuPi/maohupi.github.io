// src https://tab-studio.github.io/TSJSlib/basic.js
// version 2.0.3
function $(e, f = document){return(f.querySelector(e));}
function $$(e, f = document){return(f.querySelectorAll(e));}
function vw(){return(window.innerWidth/100);}
function vh(){return(window.innerHeight/100);}
function random(min, max){return(Math.floor(Math.random()*(max+1-min))+min);}
function log(...data){console.log(...data)}
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
String.prototype.replaceAll = function(substr, replacement) {
    return this.split(substr).join(replacement);
}
String.prototype.rjust = function(length, char = ' '){
    var string = `${this}`;
    while(string.length < length){
        string = char + string;
    }
    return(string);
}
String.prototype.ljust = function(length, char = ' '){
    var string = `${this}`;
    while(string.length < length){
        string = string + char;
    }
    return(string);
}
String.prototype.toNormalDate = function(delimiter){
    var array = `${this}`.split(delimiter);
    array[0] = array[0].rjust(4, '0');
    array[1] = array[1].rjust(2, '0');
    array[2] = array[2].rjust(2, '0');
    return(array.join(delimiter));
}
Element.prototype.offset = function(){
    var element = this, 
    array = {
        height: element.offsetHeight, 
        width: element.offsetWidth , 
        top: 0, 
        left: 0
    };
    while(element !== document.body){
        array.left += element.offsetLeft;
        array.top += element.offsetTop;
        element = element.offsetParent;
    }
    return(array);
}
window.addEventListener('keydown', function(event){
    keys[event.key] = true;
});
window.addEventListener('keyup', function(event){
    keys[event.key] = false;
});
function time(){
    return(new Date().getTime());
}