'use strict'

const body = document.body;
let contentType = 'empty';

// mouse
let MX = 0, 
    MY = 0;
window.addEventListener('mousemove', (event) => {
    MX = event.pageX;
    MY = event.pageY;
});
window.addEventListener('mousedown', (event) => {
    MX = event.pageX;
    MY = event.pageY;
});

// key
// window.addEventListener('keydown', (event) => {
//     keys[event.key] = true;
//     if(keys['Control'] == true){
//         if(event.key in '123456789'.split('')){
//             for(let key in keys){
//                 keys[key] = false;
//             }
//         }
//         let preventControl = false;
//         let isHotKey = true;
//         switch(event.key){
//             case 'r': imageReload(); break;
//             case 'o': imageOpen(); break;
//             case 's': imageSave(); break;
//             case '0': canvasReposition(); break;
//             default: isHotKey = false; break;
//         }
//         if(isHotKey){
//             event.preventDefault();
//             if(preventControl){keys['Control'] = false;}
//             keys[event.key] = false;
//         }
//     }
// });
// window.addEventListener('keyup', (event) => {
//     keys[event.key] = false;
// });

// bar
$$('.bar').forEach(bar => {
    bar.move = false;
    bar.moveFun = function(){
        let moveTypeIsX = this.getAttribute('moveType') == 'h';
        let unit = moveTypeIsX ? vw() : vh(), 
            value = moveTypeIsX ? MX : MY;
        body.style.setProperty(
            `--${this.id}`, 
            `${Math.min(Math.max(0, value/unit), 100)}%`
        );
        if(this.move){
            setTimeout(() => {
                this.moveFun();
            }, 30);
        }
    }
    bar.addEventListener('mousedown', () => {
        bar.move = true;
        bar.moveFun();
    });
    bar.addEventListener('mouseup', () => {
        bar.move = false;
    });
    window.addEventListener('mouseup', () => {
        bar.move = false;
    });
});

// viewBox
let viewBox = $('#viewBox');
let viewBox_table = $('#viewBox-table');
viewBox.move = false;
[viewBox.oMX, viewBox.oMY, viewBox.oMW, viewBox.oMH, viewBox.MW, viewBox.MH] = [0, 0, 0, 0, 0, 0];
viewBox.moveFun = function(){
    viewBox.MW = viewBox.oMW + (MX - viewBox.oMX);
    viewBox.MH = viewBox.oMH + (MY - viewBox.oMY);
    viewBox.style.setProperty('--moveW', `${viewBox.MW}px`);
    viewBox.style.setProperty('--moveH', `${viewBox.MH}px`);
    if(this.move){
        setTimeout(() => {
            this.moveFun();
        }, 30);
    }
}
function moveStart(){
    viewBox.move = true;
    [viewBox.oMX, viewBox.oMY, viewBox.oMW, viewBox.oMH] = [MX, MY, viewBox.MW, viewBox.MH];
    viewBox.moveFun();
}
function moveEnd(){
    viewBox.move = false;

}
viewBox.addEventListener('mousedown', moveStart);
viewBox.addEventListener('mouseup', moveEnd);
window.addEventListener('mouseup', moveEnd);
viewBox.scale = 1;
viewBox.addEventListener('wheel', (event) => {
    event.preventDefault();
    viewBox.scale += event.deltaY * -0.01;
    viewBox.scale = Math.min(Math.max(0.1, viewBox.scale), 5);
    viewBox.style.setProperty('--scale', viewBox.scale);
});

let contentTypes = ['empty', 'number', 'lock', 'disable'];
let controlBox_content = $('#controlBox-content');
for(let buttonName of contentTypes){
    let row = $e('div'), 
        radio = $e('input'), 
        check = $e('input'), 
        radioMark = $e('div'), 
        name = $e('label'), 
        preview = $e('input'), 
        visibleBtn = $e('button'), 
        deleteBtn = $e('button');
    radio.id = `content-type-${buttonName}`;
    radio.type = 'radio';
    radio.name = 'content-type';
    radio.value = buttonName;
    row.appendChild(radio);
    check.id = `content-visible-${buttonName}`;
    check.type = 'checkbox';
    check.checked = true;
    row.appendChild(check);
    name.setAttribute('for', radio.id);
    name.innerText = buttonName;
    row.appendChild(name);
    preview.type = 'text';
    preview.className = buttonName;
    preview.disabled = true;
    row.appendChild(preview);
    visibleBtn.className = 'visibleBtn';
    visibleBtn.innerText = 'visi';
    visibleBtn.onclick = () => {
        check.click();
        viewBoxUpdate();
    };
    row.appendChild(visibleBtn);
    deleteBtn.className = 'deleteBtn';
    deleteBtn.innerText = 'dele';
    deleteBtn.onclick = () => {
        sitMap.deleteType(buttonName);
        viewBoxUpdate();
    };
    row.appendChild(deleteBtn);
    radioMark.className = 'radioMark centerBoth';
    radioMark.innerText = '>';
    row.appendChild(radioMark);
    row.onclick = () => {
        radio.click();
    };
    controlBox_content.appendChild(row);
}
$(`#content-type-${contentType}`).click();

class Sit{
    constructor(num = 0, type = 'number'){
        this.num = num;
        this.type = type;
    }
}
class SitMap{
    #w = 3;
    #h = 2;
    #array = 2;
    #resize = function(){
        this.#array = new Array(this.#w * this.#h).fill(0).map(() => new Sit(0, 'empty'));
    }
    constructor(w = 3, h = 2){
        this.#w = w;
        this.#h = h;
        this.#resize();
    }
    set w(num){
        if(num !== false && num > 0){
            if(this.#w > num){
                for(let i = 0; i < this.#h; i++){
                    this.#array.splice((i+1)*num, this.#w - num);
                }
            }
            else if(this.#w < num){
                for(let i = 0; i < this.#h; i++){
                    this.#array.splice(num*i + this.#w, 0, ...new Array(num-this.#w).fill(0).map(() => new Sit(0, 'empty')));
                }
            }
            this.#w = parseInt(num);
        }
    }
    set h(num){
        if(num !== false && num > 0){
            if(this.#h > num){
                this.#array.splice(num*this.#w, (this.#h - num)*this.#w);
            }
            else if(this.#h < num){
                this.#array.push(...new Array((num - this.#h)*this.#w).fill(0).map(() => new Sit(0, 'empty')));
            }
            this.#h = parseInt(num);
        }
    }
    get w(){return(this.#w)}
    get h(){return(this.#h)}
    get array(){return(this.#array)}
    setNum(x = 0, y = 0, num = 1){
        let sit = this.#array[x + y*this.#w];
        let oldNum = sit.num;
        sit.num = Math.max(Math.min(num, this.#array.length), 1);
        for(let sit2 of this.#array){
            if(sit2.num == sit.num){
                sit2.num = oldNum;
            }
        }
    }
    setType(x = 0, y = 0, type = 'number'){
        let sit = this.#array[x + y*this.#w];
        sit.type = type;
        if(type == 'disable'){
            sit.num = 0;
        }
    }
    deleteType(type = 'number'){
        for(let sit of this.#array){
            if(sit.type == type){
                sit.type = 'empty';
            }
        }
    }
}

let sitMap = new SitMap(3, 2);
function viewBoxUpdate(){
    let array = sitMap.array;
    let deltaLen = array.length - viewBox_table.children.length;
    let children = viewBox_table.children;
    if(deltaLen > 0){
        for(let i = 0; i < deltaLen; i++){
            let input = $e('input');
            viewBox_table.appendChild(input);
        }
    }
    else if(deltaLen < 0){
        for(let i = 0; i < -deltaLen; i++){
            children[children.length - 1].remove();
        }
    }
    viewBox_table.style.setProperty('--hNum', sitMap.w);
    viewBox_table.style.setProperty('--vNum', sitMap.h);
    let visibleDict = {};
    [...$$(`[id|=content-visible]`)].forEach(n => visibleDict[n.id.split('-')[2]] = n.checked);
    for(let i = 0; i < array.length; i++){
        if(!visibleDict[array[i].type]){
            children[i].type = 'text';
            children[i].value = '';
            children[i].className = 'empty';
            children[i].disabled = true;
        }
        else{
            children[i].type = 'text';
            children[i].value = array[i].num == 0 ? '' : array[i].num;
            children[i].className = array[i].type;
            children[i].disabled = ['empty', 'disable'].indexOf(array[i].type) > -1;
        }
    }
}
viewBoxUpdate();
$('#controlBox-size-width').onchange = function(){
    sitMap.w = this.value;
    viewBoxUpdate();
}
$('#controlBox-size-height').onchange = function(){
    sitMap.h = this.value;
    viewBoxUpdate();
}
viewBox_table.addEventListener('click', function(event){
    let target = event.target;
    let index = new Array(...this.children).indexOf(target);
    if(index > -1){
        console.log(index);
        let x = index % sitMap.w;
        let y = Math.floor(index / sitMap.w);
        contentType = $('[name="content-type"]:checked').value;
        sitMap.setType(x, y, contentType);
        viewBoxUpdate();
    }
});