const keys = {}, 
$_GET = {}, 
$_COOKIE = {}, 
$_DATA = {};
let MX = 0, 
MY = 0, 
none = 'none';
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
function* counter(){
    let i = 0;
    while(true){
        i++;
        yield(i);
    }
}
function $(e, f = document){return(f.querySelector(e));}
function $$(e, f = document){return(f.querySelectorAll(e));}
function $create(n){return(document.createElement(n));}
function vw(){return(window.innerWidth/100);}
function vh(){return(window.innerHeight/100);}
function random(min, max){return(Math.floor(Math.random()*(max+1-min))+min);}
function sendXmlhttp(name = '', value = '', responseFunction = t => {console.log(t);}, type = 'get'){
    value = value.toString();
    if(window.user && 'csrfId' in window.user){
        value += `&csrf-id=${window.user['csrfId']}`;
    }
    let xmlhttp = new XMLHttpRequest();
    let rf = function (){
        if (xmlhttp.readyState==4) {
            responseFunction(xmlhttp.responseText);
        }
    }
    type = type.toLowerCase();
    xmlhttp.addEventListener("load", rf);
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
    let cookie = '', 
    date = new Date();
    date.setTime(date.getTime() + expire);
    if(key !== undefined && value !== undefined){
        cookie = `${key}=${value}`;
        if(expire !== undefined){
            cookie += `; expires=${date.toGMTString()}`;
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
function getDaysOfMonth(year = new Date().getFullYear(), month = new Date().getMonth()+1){
    return(new Date(year, month, 0).getDate());
}
function fullString(string, length, fullWith, direction = 'right'){
    if(string.length > length){
        string = string.split('');
        let reString = '';
        for(let i = 0; i < length; i++){
            reString += string[i];
        }
        string = reString;
    }
    else if(string.length < length){
        if(direction == 'right'){
            for(let i = 0; i < length - string.length; i++){
                string += fullWith;
            }
        }
        else{
            for(let i = 0; i < length - string.length; i++){
                string = fullWith + string;
            }
        }
    }
    return(string);
}

function goTo(event, url){
    let target = event.ctrlKey ? '_blank' : '_self';
    window.open(url, target);
}

function offset(element, type) {
    var elementData = {
        height: element.offsetHeight, 
        width: element.offsetWidth, 
        top: 0, 
        left: 0
    };
    if(!(type in ['width', 'height'])){
        while(element !== document.body){
            if(type == 'left'){
                elementData.left += element.offsetLeft;
            }
            if(type == 'top'){
                elementData.top += element.offsetTop;
            }
            element = element.offsetParent;
        }
    }
    return(elementData[type]);
}