/*
 * 2022 © MaoHuPi
 * classUniformEditor/script/main.js
 */

let colorData = `
T01 白色 #e2ecfb
T02 粉紅 #f1b8c5
T03 粉藍 #7697c2
T04 天空藍 #437ea0
T05 鵝黃 #c2ac2e
T06 卡其 #928e7c
T07 薄荷綠 #248687
T08 淺花灰 #d0d7df
T09 深麻花灰 #72756e
T10 果綠 #519f30
T11 橘色 #fb5406
T12 金黃 #efc902
T13 翠藍 #0474b2
T14 酒紅 #310b14
T15 藏青 #150818
T16 咖啡 #291216
T17 黑色 #16060f
T18 紫色 #270d3e
T19 寶藍 #201e5d
T20 墨綠 #1a1c1f
T21 棗紅 #4e1019
T22 鮮紅 #c01726
T23 粉綠 #a0c252
T24 鮮綠 #103e22
T25 桃紅 #e23c62
T26 淺紫 #968dbb
T27 純灰 #3a3642
T28 土耳其藍 #1c3049
`
    .split('\n')
    .map(row => {
        let arr = row.split(' ');
        if(row.length > 0 && row.length >= 2){
            return({
                code: arr[0], 
                name: arr[1], 
                color: arr[2]
            });
        }
    })
    .filter(color => color != undefined);
let defaultColor = {code: 'default', name: '預設', color: '#ffffff'};

function initThreeDViewer(){
    let threeDViewer = $('#threeDViewer');
    let threeDViewerRotate = $('#threeDViewerRotate');
    let mainFront = $('#threeDViewer .clothes .main-front');
    let mainBack = $('#threeDViewer .clothes .main-back');
    let mx = my = 0, md = false;
    let dx = dy = 0;
    let rx = ry = 0;
    let size = 1;
    threeDViewer.addEventListener('mousedown', event => {
        mx = event.screenX;
        my = event.screenY;
        md = true;
    });
    threeDViewer.addEventListener('wheel', event => {
        event.preventDefault();
        size += -event.deltaY * 0.01;
        size = size > 0.1 ? size : 0.1;
        threeDViewerRotate.style.setProperty('--size', size);
        $('#viewerInfo .size').innerText = Math.floor(size*100);
    });
    window.addEventListener('mousemove', event => {
        if(md){
            dx = event.screenX - mx;
            dy = event.screenY - my;
            let xn = rx + dx;
            let yn = ry - dy;
            // console.log(((xn**2 + yn**2)**0.5) % 270, Math.abs(Math.abs(xn % 270) - Math.abs(yn % 270)) > 90);
            threeDViewerRotate.style.setProperty('--rotateY', `${xn}deg`);
            threeDViewerRotate.style.setProperty('--rotateX', `${yn}deg`);
            $('#viewerInfo .rotationY').innerText = xn;
            $('#viewerInfo .rotationX').innerText = yn;
        }
    });
    window.addEventListener('mouseup', () => {
        rx += dx;
        dx = 0;
        ry -= dy;
        dy = 0;
        md = false;
    });
}
initThreeDViewer();

function initThemeBar(){
    let themeBar = $('#themeBar');
    for(let color of colorData){
        let item = $create('div');
        item.className = 'item flex';
        item.addEventListener('click', () => {
            $('#viewerInfo .theme').innerText = color.code;
            $('#threeDViewer .clothes .main').style.setProperty('--color', color.color);
            window.theme = color.color;
        });
        themeBar.appendChild(item);
    
        let clothes = $create('div');
        clothes.className = 'clothes mask';
        clothes.style.setProperty('--color', color.color ? color.color : 'white');
        item.appendChild(clothes);
        
        let description = $create('div');
        description.className = 'description';
        description.innerText = `${color.code} ${color.name}`;
        item.appendChild(description);
    }
}
initThemeBar();

/*********/
/* alert */
/*********/
let langData = {'alert-button-okay': '確定', 'alert-button-cancel': '取消'};
class alertBox{
    static maskElement = $('#container-mask');
    static visible(open = true){
        open = open.toString();
        this.maskElement.setAttribute('open', open);
        this.maskElement.setAttribute('open', open);
    }
    static setInnerElement(nameList = ['buttons', 'rightButton']){
        nameList.push('box');
        nameList = Array.from(new Set(nameList));
        let innerElements = $$('*', this.maskElement);
        for(let innerElement of innerElements){
            if(nameList.indexOf(innerElement.getAttribute('id').replace('alert-', '')) > -1){
                innerElement.removeAttribute('hidden');
            }
            else{
                innerElement.setAttribute('hidden', '');
            }
        }
    }
    static setButton(name = 'true', text = '確定', buttonFunction = () => {console.log('click!');}){
        let button = $(`#alert-${name}Button`, this.maskElement);
        if(text != false && text != undefined){
            button.innerText = text;
        }
        button.onclick = buttonFunction;
    }
    static setContent(content){
        $(`#alert-content`, this.maskElement).innerText = content;
    }
    static setProgress(progress = 0){
        progress = parseFloat(progress);
        progress = Math.floor(progress*100);
        progress = `${progress}%`;
        let progressBar = $(`#alert-progressBar`, this.maskElement);
        progressBar.style.setProperty('--progress', progress);
        progressBar.style.setProperty('--progressString', `"${progress}"`);
    }
    static alert(content = '', doneFunction = () => {this.visible(false);}){
        this.setInnerElement(['buttons', 'rightButton', 'content']);
        this.setContent(content);
        this.setButton('right', langData['alert-button-okay'], doneFunction);
        this.visible(true);
    }
    static confirm(content = '', doneFunction = (result) => {console.log(result); this.visible(false);}, cancelFunction = undefined){
        let innerElements = ['buttons', 'leftButton', 'rightButton'];
        if(content != '' && content != undefined && content != false){
            innerElements.push('content');
        }
        this.setInnerElement(innerElements);
        this.setContent(content);
        this.setButton('left', langData['alert-button-okay'], () => {doneFunction(true);});
        if(cancelFunction != false && cancelFunction != undefined){
            this.setButton('right', langData['alert-button-cancel'], () => {cancelFunction(false);});
        }
        else{
            this.setButton('right', langData['alert-button-cancel'], () => {doneFunction(false);});
        }
        this.visible(true);
    }
    static progress(content = '', cancelFunction = (result) => {console.log(result); this.visible(false);}){
        this.setInnerElement(['buttons', 'rightButton', 'content', 'progressBar']);
        this.setProgress(0);
        this.setContent(content);
        this.setButton('right', langData['alert-button-cancel'], () => {cancelFunction(false);});
        this.visible(true);
    }
}