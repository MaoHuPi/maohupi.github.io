/*
 * 2022 © MaoHuPi
 * classUniformEditor/script/canvas.js
 */

function newImage(url){
    let image = new Image();
    image.src = url;
    return(image);
}

window.todoList = [];
window.todo = function todo(){
    if(window.todoList.length > 0){
        let fun = window.todoList[0];
        window.todoList.shift();
        fun();
    }
}

let pxPerVw = 50;
let pixiOptions = {
    width: 1080, 
    height: 1080, 
    transparent: true
}
let clothes = {
    front: new PIXI.Application({...pixiOptions, width: 22.2*pxPerVw, height: 30.6*pxPerVw}), 
    back: new PIXI.Application({...pixiOptions, width: 22.2*pxPerVw, height: 30.6*pxPerVw}), 
    right: new PIXI.Application({...pixiOptions, width: 8*pxPerVw, height: 8*pxPerVw}), 
    left: new PIXI.Application({...pixiOptions, width: 8*pxPerVw, height: 8*pxPerVw})
}
let clothesView = {
    front: clothes.front.view, 
    back: clothes.back.view, 
    right: clothes.right.view, 
    left: clothes.left.view
}
let view = {
    front: [$('#threeDViewerRotate .main-front .front')], 
    back: [$('#threeDViewerRotate .main-back .back')], 
    right: [...$$('#threeDViewerRotate [class*="main-"] .right')], 
    left: [...$$('#threeDViewerRotate [class*="main-"] .left')]
}
let materials = [];

function viewerInit(){
    let idCount = 0;
    for(let type in view){
        for(let canvas of view[type]){
            (function(){
                canvas.ctx = canvas.getContext('2d');
                let canvasId = idCount++;
                let cmx = cmy = 0, cmd = false;
                let cdx = cdy = 0;
                let cpx = cpy = 0;
                let targetIndex = 0, targetMaterial = false;
                canvas.addEventListener('mousedown', event => {
                    // let cvs = $create('canvas');
                    // let ctx = cvs.getContext('2d');
                    // cvs.width = canvas.width;
                    // cvs.height = canvas.height;
                    // for(let material of materials){
                    //     ctx.clearRect(0, 0, cvs.width, cvs.height);
                    //     ctx.drawImage(material.image, materialData.position.x, materialData.position.y, materialData.size.w, materialData.size.h);
                    //     let data = ctx.getImageData(cmx/canvas.offsetWidth*canvas.width, cmy/canvas.offsetWidth*canvas.width, 1, 1).data;
                    //     console.log(data);
                    // }

                    if(targetMaterial){
                        event.preventDefault();
                        event.stopPropagation();

                        cmx = event.screenX;
                        cmy = event.screenY;
                        cmd = true;

                        cpx = targetMaterial.position.x;
                        cpy = targetMaterial.position.y;
                    }
                });
                window.addEventListener('mousemove', event => {
                    if(cmd){
                        event.preventDefault();
                        event.stopPropagation();
                        cdx = (event.screenX - cmx)/canvas.offsetWidth*canvas.width;
                        cdy = (event.screenY - cmy)/canvas.offsetHeight*canvas.height;
                        let cxn = cpx + cdx;
                        let cyn = cpy + cdy;
                        targetMaterial.position.x = cxn;
                        targetMaterial.position.y = cyn;
                        [targetMaterial.sprite.x, targetMaterial.sprite.y] = [targetMaterial.position.x, targetMaterial.position.y];
                    }
                });
                window.addEventListener('mouseup', () => {
                    cpx += cdx;
                    cdx = 0;
                    cpy += cdy;
                    cdy = 0;
                    cmd = false;
                });

                let cmo = false;
                canvas.addEventListener('mouseover', event => {
                    event.preventDefault();
                    event.stopPropagation();
                    cmo = true;
                });
                canvas.addEventListener('wheel', event => {
                    if(cmo && targetMaterial){
                        event.preventDefault();
                        event.stopPropagation();
                        let delta = -event.deltaY / canvas.offsetHeight*canvas.height * 0.01;
                        if(targetMaterial.size.s + delta > 0 ){
                            targetMaterial.size.s += delta;
                            [targetMaterial.sprite.width, targetMaterial.sprite.height] = [targetMaterial.size.w * targetMaterial.size.s, targetMaterial.size.h * targetMaterial.size.s];
                        }
                    }
                });
                window.addEventListener('mouseleave', () => {
                    cmo = false;
                });
                canvas.addEventListener('contextmenu', event => {
                    event.preventDefault();
                    event.stopPropagation();
                    openFile('image/*', input => {
                        if(input.files && input.files.length > 0){
                            let file = input.files[0];
                            let reader = new FileReader();
                            reader.onloadend = () => {
                                newMaterial(type, reader.result);
                            }
                            reader.readAsDataURL(file);
                        }
                    });
                });
                window.addEventListener('keydown', event => {
                    if(!keys[`${canvasId}-${event.key}`] && /^[1-9]$/.test(event.key)){
                        targetIndex = parseInt(event.key) - 1;
                        let targetMaterials = materials.filter(materialData => materialData.target == type);
                        targetMaterial = 
                            targetMaterials.length > targetIndex ? targetMaterials[targetIndex] : 
                            targetMaterials[0] ? targetMaterials[0] : 
                            false;
                        console.log(targetMaterial);
                        $('#viewerInfo .layer').innerText = targetIndex + 1;
                        window.layer = targetIndex + 1;
                        keys[`${canvasId}-${event.key}`] = true;
                    }
                    if(cmo && targetMaterial && ['Delete'].indexOf(event.key) > -1){
                        targetMaterial.sprite.destroy();
                        materials = materials.filter(materialData => materialData != targetMaterial);
                        targetMaterial = false;
                        window.update = true;
                    }
                });
                window.addEventListener('keyup', event => {
                    if(/^[0-9]$/.test(event.key)){
                        targetIndex = 0;
                        targetMaterial = false;
                        $('#viewerInfo .layer').innerText = 0;
                        window.layer = 0;
                        keys[`${canvasId}-${event.key}`] = false;
                    }
                });
            })();
        }
    }
}
viewerInit();
function viewerUpdate(){
    if(window.layer != 0 || window.update){
        for(let type in view){
            for(let canvas of view[type]){
                canvas.width = clothesView[type].width;
                canvas.height = clothesView[type].height;
                canvas.ctx.drawImage(clothesView[type], 0, 0);
            }
        }
        window.recolored = false;
        window.update = false;
    }
    else{
        if(!window.recolored){
            for(let type in view){
                for(let canvas of view[type]){
                    canvas.width = clothesView[type].width;
                    canvas.height = clothesView[type].height;
                    canvas.ctx.drawImage(clothesView[type], 0, 0);
                    window.todoList.push(() => {
                        colorTransform(canvas, window.newColors);
                    });
                }
            }
            window.todo();
            window.recolored = true;
        }
    }
    setTimeout(viewerUpdate, 30);
}
viewerUpdate();

newMaterial('front', 'image/和.png', {position: {x:22.2*pxPerVw/2, y: 30.6*pxPerVw/2}})
// newMaterial('front', 'image/clothes_model_front.png', {position: {x: (22.2*pxPerVw - 20*pxPerVw)/2, y: (30.6*pxPerVw - 20*pxPerVw)/2}})
function newMaterial(target, url, options){
    materialData = {...{
        url: url, 
        target: target, 
        sprite: false, 
        image: newImage(url), 
        position: {x: 22.2*pxPerVw/2, y: 30.6*pxPerVw/2}, 
        size: {w: 1000, h: 1000, s: 1}
    }, ...options};

    var loader = PIXI.Loader.shared;
    if(!(url in loader.resources)){
        loader
            .add(url)
            .load(loaded);
    }
    else{
        loaded();
    }
    function loaded(){
        materialData.sprite = new PIXI.Sprite(loader.resources[url].texture);
        
        materialData.sprite.anchor.set(0.5, 0.5);
        materialData.size.h = materialData.sprite.height / materialData.sprite.width * materialData.size.w;
        [materialData.sprite.x, materialData.sprite.y] = [materialData.position.x, materialData.position.y];
        [materialData.sprite.width, materialData.sprite.height] = [materialData.size.w*materialData.size.s, materialData.size.h*materialData.size.s];
        
        materials.push(materialData);
        clothes[target].stage.addChild(materialData.sprite);
        window.update = true;
        /* 因為呈現的部分是用額外的canvas故無法直接使用PIXI的事件功能來偵目標素材 */
        // materialData.sprite.interactive = true;
        // clothes[target].stage.interactive = materialData.sprite.mouseover = function(){
        //     console.log(this);
        // }
        window.todo();
    }
}

let modelImage = {
    front: newImage('image/clothes_model_front.png'), 
    back: newImage('image/clothes_model_back.png')
}
function exportImage(){
    let cvs = $create('canvas');
    let ctx = cvs.getContext('2d');
    let gap = 1*pxPerVw;
    let top = 4.4*pxPerVw;
    let clothesModelSize = {w: 40*pxPerVw, h: 31.4*pxPerVw};
    
    cvs.width = gap*3 + clothesModelSize.w*2;
    cvs.height = gap*5 + clothesModelSize.h + 3*pxPerVw*2 + view.front[0].height;
    console.log(cvs.height);
    ctx.fillStyle = window.theme ? window.theme : '#ffffff';
    ctx.fillRect(0, 0, cvs.width, cvs.height);
    
    drawModel = (data = {}) => {
        // 外框
        ctx.drawImage(data.model, 0, 0, clothesModelSize.w, clothesModelSize.h);
        // 中間
        ctx.drawImage(data.middle, 9*pxPerVw, 5*pxPerVw - top);
        // 左邊
        ctx.save();
        ctx.translate(0.5*pxPerVw + clothesView.right.width/2, 3*pxPerVw - top + clothesView.right.height/2);
        ctx.rotate(deg2rad(78));
        ctx.drawImage(data.left, 
            /* sx, sy, sw, sh */...[clothesView.right.width/2, 0, clothesView.right.width/2, clothesView.right.height], 
            /* dx, dy, dw, dh */...[0, -clothesView.right.height/2, clothesView.right.width/2, clothesView.right.height]
        );
        ctx.restore();
        // 右邊
        ctx.save();
        ctx.translate(clothesModelSize.w - 0.5*pxPerVw - clothesView.left.width/2, 3*pxPerVw - top + clothesView.left.height/2);
        ctx.rotate(deg2rad(-78));
        ctx.drawImage(data.right, 
            /* sx, sy, sw, sh */...[0, 0, clothesView.left.width/2, clothesView.left.height], 
            /* dx, dy, dw, dh */...[-clothesView.left.width/2, -clothesView.left.height/2, clothesView.left.width/2, clothesView.left.height]
        );
        ctx.restore();
        // 文字
        ctx.fillStyle = 'black';
        ctx.font = `${3*pxPerVw}px serif`;
        ctx.fillText(data.text, 0, gap + clothesModelSize.h + 3*pxPerVw);
    }
    drawBorderImage = (data = {}) => {
        // 外框
        ctx.lineWidth = 0.1*pxPerVw;
        ctx.strokeStyle = 'black';
        ctx.strokeRect(0, 0, data.image.width, data.image.height);
        // 圖片
        ctx.drawImage(data.image, 0, 0);
        // 文字
        ctx.fillStyle = 'black';
        ctx.font = `${3*pxPerVw}px serif`;
        ctx.fillText(data.text, 0, gap + data.image.height + 3*pxPerVw);
    }
    drawColor = (data = {}) => {
        // 色塊
        ctx.fillStyle = data.color;
        ctx.fillRect(0, 0, 4*pxPerVw, 3*pxPerVw);
        // 文字
        ctx.fillStyle = 'black';
        ctx.font = `${2*pxPerVw}px serif`;
        ctx.fillText(data.color, gap + 4*pxPerVw, 2*pxPerVw);
    }

    ctx.save();
    ctx.translate(gap, gap);
    drawModel({model: modelImage.front, middle: view.front[0], left: view.right[0], right: view.left[0], text: '正面'})
    ctx.translate(gap + clothesModelSize.w, 0);
    drawModel({model: modelImage.back, middle: view.back[0], left: view.left[1], right: view.right[1], text: '背面'})
    ctx.translate(gap + clothesModelSize.w, 0);
    ctx.restore();
    ctx.translate(gap, gap*3 + clothesModelSize.h + 3*pxPerVw);

    ctx.save();
    let borderImageData = [
        {image: view.front[0], text: '前'}, 
        {image: view.back[0], text: '後'}, 
        {image: view.right[0], text: '右'}, 
        {image: view.left[0], text: '左'}
    ]
    for(let borderImage of borderImageData){
        drawBorderImage(borderImage);
        ctx.translate(gap + borderImage.image.width, 0);
    }
    ctx.translate(gap, 0);
    for(let color of window.newColors){
        drawColor({
            color: `#${color.slice(0, 3).map(n => fullString(n.toString(16), 2, '0', 'left')).join('')}`
        });
        ctx.translate(0, gap + 3*pxPerVw);
    }
    ctx.restore();

    let link = $create('a');
    link.href = cvs.toDataURL();
    link.download = 'export.png';
    link.click();
}

function notCompleted(){
    alertBox.alert('此功能尚未完成！');
}

function openProject(){
    openFile('.cup, application/json', input => {
        if(input.files && input.files.length > 0){
            let file = input.files[0];
            let reader = new FileReader();
            reader.onloadend = () => {
                for(let materialData of materials){
                    materialData.sprite.destroy();
                }
                materials.length = 0;
                let data = JSON.parse(reader.result);
                let themeData = colorData[colorData.map(color => color.code).indexOf(data.theme)];
                themeData = themeData != undefined ? themeData : defaultColor;
                $('#viewerInfo .theme').innerText = themeData.code;
                $('#threeDViewer .clothes .main').style.setProperty('--color', themeData.color);
                window.theme = themeData.color;
                window.todoList.length = 0;
                for(let materialData of data.materials){
                    let options = {...materialData};
                    delete options['sprite'];
                    delete options['image'];
                    window.todoList.push(() => {
                        newMaterial(materialData.target, materialData.url, options);
                    });
                }
                window.todoList.push(() => {
                    window.newColors = data.colors;
                    $('#splitRange').value = data.colors.length;
                    splitRangeChange({target: {value: data.colors.length}}, data.colors.map(color => `#${color.slice(0, 3).map(n => fullString(n.toString(16), 2, '0', 'left')).join('')}`));
                });
                window.todo();
            }
            reader.readAsText(file);
        }
    });
}
function saveProject(){
    let data = {
        theme: (colorData[colorData.map(color => color.color).indexOf(window.theme)] || defaultColor).code, 
        colors: window.newColors, 
        materials: materials.map(materialData => ({...materialData, sprite: false}))
    };
    let json = JSON.stringify(data, true, 4);
    saveFile('download.cup', json, 'application/json');
}

// function getColorGroups(splitRange = 100, argColors = []){
//     let colors = [];
//     let groups = {};
//     if(argColors.length < 1){
//         for(let type in view){
//             let cvs = view[type][0]
//             let ctx = cvs.getContext('2d');
//             data = ctx.getImageData(0, 0, cvs.width, cvs.height).data;
//             for(let i = 0; i < data.length; i += 4){
//                 let color = data.slice(i, i + 4).join(',');
//                 if(colors.indexOf(color) == -1){
//                     colors.push(color);
//                 }
//             }
//         }
//     }
//     else{
//         for(let i = 0; i < argColors.length; i += 4){
//             let color = argColors.slice(i, i + 4).join(',');
//             if(colors.indexOf(color) == -1){
//                 colors.push(color);
//             }
//         }
//     }
//     for(let colorText of colors){
//         let color = colorText.split(',');
//         let toAdd = true;
//         for(let groupKeyText in groups){
//             let groupKey = groupKeyText.split(',');
//             let delta = [];
//             for(let i = 0; i < 3; i++){
//                 delta.push(Math.abs(color[i] - groupKey[i]));
//             }
//             console.log(delta);
//             delta = delta.reduce((a, b) => a + b);
//             if(delta < splitRange){
//                 groups[groupKeyText].push(colorText);
//                 toAdd = false;
//                 break;
//             }
//         }
//         if(toAdd){
//             groups[colorText] = [colorText];
//         }
//     }
//     let newGroups = {};
//     for(let groupKeyText in groups){
//         let averageColor = [0n, 0n, 0n, 0n];
//         for(let colorText of groups[groupKeyText]){

//             let color = colorText.split(',')
//             for(let i = 0; i < averageColor.length; i++){
//                 averageColor[i] += BigInt(color[i]);
//             }
//         }
//         let averageColorText = averageColor
//             .map(n => Math.floor(parseInt(n/BigInt(groups[groupKeyText].length))))
//             .join(',');
//         newGroups[averageColorText] = [...groups[groupKeyText]];
//         delete groups[groupKeyText];
//     }
//     console.log(newGroups);
//     return(newGroups);
// }

// function splitRangeChange(event){
//     let splitRange = parseInt(event.target.value);
//     // splitRange = 
//     //     splitRange > 100 ? splitRange : 
//     //     100;
//     let groups = getColorGroups(splitRange);
//     let colorBar = $('#colorBar');
//     for(let input of $$('input[type="color"]', colorBar)){
//         input.remove();
//     }
//     for(let groupKeyText in groups){
//         let input = $create('input');
//         input.type = 'color';
//         input.value = `#${groupKeyText.split(',').slice(0, 3).map(n => fullString(n.toString(16), 2, '0', 'left')).join('')}`;
//         console.log(`#${groupKeyText.split(',').slice(0, 3).map(n => fullString(n.toString(16), 2, '0', 'left')).join('')}`);
//         colorBar.appendChild(input);
//     }
// }

// function a(splitRange = 100, translateMap = {}){
//     for(let type in view){
//         for(let cvs of view[type]){
//             let ctx = cvs.getContext('2d');
//             pixis = ctx.getImageData(0, 0, cvs.width, cvs.height).data;
//             data = pixis.data;
//             for(let i = 0; i < data.length; i += 4){
//                 let deltas = {};
//                 for(let key in translateMap){
//                     keyColor = key.split(',');
//                     keyColor
//                     for(let j = 0; j < 3; j++){
//                         (data[i + j] - keyColor[j]);
//                     }
//                     deltas[key] = '';
//                 }
//             }
//             ctx.pushImageData(pixis, 0, 0);
//         }
//     }
// }

function splitRangeChange(event, colorValues = []){
    let splitRange = parseInt(event.target.value);
    let colorBar = $('#colorBar');
    for(let input of $$('input[type="color"]', colorBar)){
        input.remove();
    }
    for(let i = 0; i < splitRange; i++){
        let input = $create('input');
        input.type = 'color';
        if(colorValues.length > i){
            input.value = colorValues[i];
        }
        else{
            let deg = (360/splitRange*i)%360;
            let color = [0, 0, 0];
            let first = Math.floor((deg%360)/120);
            let offsetDeg = deg%360 - Math.floor((deg%360)/120)*120;
            let second = (first + (offsetDeg >= 0 ? 1 : -1))%3;
            second = second == -1 ? 2 : second;
            if(Math.abs(offsetDeg) > 60){
                [first, second] = [second, first];
                offsetDeg = 60 - offsetDeg%60;
            }
            color[first] = 255;
            color[second] = Math.abs(offsetDeg)/60*255;
            // console.log(deg, offsetDeg, second);
            input.value = `#${color.slice(0, 3).map(n => fullString(Math.floor(n).toString(16), 2, '0', 'left')).join('')}`;
            // console.log(`#${color.slice(0, 3).map(n => fullString(Math.floor(n).toString(16), 2, '0', 'left')).join('')}`);
        }
        input.addEventListener('change', colorInputChange);
        colorBar.appendChild(input);
    }
}

window.layer = 0;
window.update = false;
window.newColors = [];
window.recolored = true;
function colorInputChange(){
    let newColors = Array.from($$('#colorBar input[type="color"]'))
        .map(input => input.value.replace('#', ''))
        .map(text => [text.slice(0, 2), text.slice(2, 4), text.slice(4, 6)])
        .map(array => array.map(n => parseInt(n, 16)));
    
    window.newColors = newColors;
    window.recolored = false;
}

function colorTransform(cvs, newColors = [[0, 0, 0]]){
    if(newColors.length > 0){
        let ctx = cvs.getContext('2d');
        let pixis = ctx.getImageData(0, 0, cvs.width, cvs.height);
        let data = pixis.data;
        
        _colorTransform = (msgArgs) => {
            let data = msgArgs.data;
            let argv = msgArgs.argv;
            let cvs = msgArgs.cvs;
            console.log(argv.newColors);

            let p = 0;
            for(let i = 0; i < data.length; i += 4){
                let color = data.slice(i, i + 3);
                let max = Math.max(...color);
                let indexMax = color.indexOf(max);
                let deg = indexMax*120;
                deg += (color[(indexMax + 1)%3] - color[indexMax > 0 ? (indexMax - 1) : 2])*60;
                deg = deg < 0 ? 360 - deg%360 : deg;
                deg = deg%360;
                color = argv.newColors[Math.floor(deg / (360/argv.newColors.length))];
                for(let j = 0; j < 3; j++){
                    try{
                        data[i + j] = color[j];
                    }
                    catch(e){
                        console.log(deg, Math.floor(deg / (360/argv.newColors.length)));
                    }
                }
                np = Math.floor(i / data.length * 100);
                if(p != np){
                    p = np;
                    // console.log(`${p}%`);
                    self.postMessage({progress: p/100});
                }
            }
        }

        const worker = new Worker("./script/colorTransformWorker.js");
        alertBox.progress('處理中...', () => {
            worker.terminate();
            window.todoList.length = 0;
            alertBox.visible(false);
        });
        worker.onmessage = (msg) => {
            if(msg.data.progress == 'done'){
                for(let i = 0; i < pixis.data.length; i++){
                    pixis.data[i] = msg.data.data[i];
                }
                ctx.putImageData(pixis, 0, 0);
                alertBox.visible(false);
                window.todo();
            }
            else{
                alertBox.setProgress(msg.data.progress);
            }
        };
        worker.postMessage({
            data: data, 
            argv: {newColors: window.newColors}, 
            cvs: {width: cvs.width, height: cvs.height}, 
            forFun: _colorTransform.toString()
        });

        ctx.putImageData(pixis, 0, 0);
    }
}