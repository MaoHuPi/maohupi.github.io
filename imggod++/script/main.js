'use strict'

/*******/
/* out */
/*******/
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
window.addEventListener('keydown', (event) => {
    keys[event.key] = true;
    if(keys['Control'] == true){
        if(event.key in '123456789'.split('')){
            for(let key in keys){
                keys[key] = false;
            }
        }
        let preventControl = false;
        let isHotKey = true;
        switch(event.key){
            case 'r': imageReload(); break;
            case 'o': imageOpen(); break;
            case 's': imageSave(); break;
            case '0': canvasReposition(); break;
            default: isHotKey = false; break;
        }
        if(isHotKey){
            event.preventDefault();
            if(preventControl){keys['Control'] = false;}
            keys[event.key] = false;
        }
    }
});
window.addEventListener('keyup', (event) => {
    keys[event.key] = false;
});
// container line
const containerOut = $('#container-out');
$$('[id|="container-line"]').forEach(containerLine => {
    containerLine.move = false;
    containerLine.moveFun = function(){
        let controlTypeIsX = this.getAttribute('controlType') == 'x'
        let unit = controlTypeIsX ? vw() : vh(), 
            value = controlTypeIsX ? MX : MY;
        containerOut.style.setProperty(
            this.getAttribute('controlProperty'), 
            Math.min(
                Math.max(
                    0, 
                    (value - 0.25*vw())/unit
                ), 
                100 - (0.5 * vw())/unit
            )
        );
        if(this.move){
            setTimeout(() => {
                this.moveFun();
            }, 30);
        }
    }
    containerLine.addEventListener('mousedown', () => {
        containerLine.move = true;
        containerLine.moveFun();
    });
    containerLine.addEventListener('mouseup', () => {
        containerLine.move = false;
    });
});

/************/
/* language */
/************/
let langData = {};
changeLang('zh-TW');
function changeLang(langName){
    sendXmlhttp(`json/lang/${langName}.json`, '', t => {
        langData = JSON.parse(t);
        langMessageInit();
        setEffect();
    }, 'get');
}
function lang(textId){
    return(textId in langData ? langData[textId] : textId);
}

/********/
/* in-1 */
/********/
// canvas
const cvs = $('#imageCanvas'), 
    ctx = cvs.getContext('2d');
ctx.imageSmoothingEnabled = false;
// image
let fileNow = undefined;
function imageOpen(){
    let input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.click();
    input.onchange = () => {
        if('files' in input && input['files'].length > 0){
            let file = input.files[0];
            try{
                imageLoad(file);
                fileNow = file;
            }
            catch(e){console.error(e);}
        }
    }
}
function imageLoad(file){
    let image = new Image();
    image.src = URL.createObjectURL(file);
    image.onload = () => {
        exitPreview();
        cvs.width = image.naturalWidth;
        cvs.height = image.naturalHeight;
        ctx.drawImage(image, 0, 0, cvs.width, cvs.height);
        cvs.style.setProperty('--pixelPercentageWidth', 100/image.naturalWidth);
        cvs.style.setProperty('--pixelPercentageHeight', 100/image.naturalHeight);
        canvasReposition();
    }
    cvs.image = image;
}
function imageReload(){
    if('image' in cvs && cvs.image){
        cvs.width = cvs.image.naturalWidth;
        cvs.height = cvs.image.naturalHeight;
        ctx.drawImage(cvs.image, 0, 0, cvs.width, cvs.height);
        canvasReposition();
    }
}
function imageSave(){
    var link = document.createElement('a');
    link.download = fileNow ? fileNow.name : 'download.png';
    link.href = cvs.toDataURL(fileNow ? fileNow.type : 'image/png');
    link.click();
}
function canvasReposition(){
    let container = $('#container-in-1'), 
        cvsProportion = cvs.width/cvs.height;
    if(container.offsetWidth/container.offsetHeight > cvsProportion){
        cvs.style.width = container.offsetHeight*cvsProportion+'px';
        cvs.style.height = container.offsetHeight+'px';
        cvs.style.left = (container.offsetWidth - cvs.style.width.split('px')[0])/2+'px';
        cvs.style.top = '0px';
    }
    else{
        cvs.style.width = container.offsetWidth+'px';
        cvs.style.height = container.offsetWidth/cvsProportion+'px';
        cvs.style.left = '0px';
        cvs.style.top = (container.offsetHeight - cvs.style.height.split('px')[0])/2+'px';
    }
    cvs.scale = 1;
}
// move
const in_1 = $('#container-in-1');
cvs.move = false;
cvs.moveFun = function(){
    this.style.left = this.actionLeft + MX + 'px';
    this.style.top = this.actionTop + MY + 'px';
    if(this.move){
        setTimeout(this.moveFun, 30);
    }
}.bind(cvs);
function imageMoveTo(x, y){
    cvs.style.left = x + 'px';
    cvs.style.top = y + 'px';
}
in_1.addEventListener('mousedown', () => {
    cvs.move = true;
    cvs.actionLeft = toPxNum(cvs.style.left) - MX;
    cvs.actionTop = toPxNum(cvs.style.top) - MY;
    cvs.moveFun();
});
in_1.addEventListener('mouseup', () => {
    cvs.move = false;
});
// zoom
cvs.scale = 1;
in_1.addEventListener('wheel', (event) => {
    event.preventDefault();
    cvs.scale += event.deltaY * -0.01;
    imageZoomTo(MX, MY, cvs.scale);
});
function imageZoomTo(x, y, size){
    let container = $('#container-in-1'), 
        cvsProportion = cvs.width/cvs.height, 
        left = toPxNum(cvs.style.left), 
        top = toPxNum(cvs.style.top), 
        width = toPxNum(cvs.style.width);
    if(container.offsetWidth/container.offsetHeight > cvsProportion){
        cvs.style.width = container.offsetHeight*cvsProportion*size+'px';
        cvs.style.height = container.offsetHeight*size+'px';
    }
    else{
        cvs.style.width = container.offsetWidth*size+'px';
        cvs.style.height = container.offsetWidth/cvsProportion*size+'px';
    }
    var deltaSize = toPxNum(cvs.style.width)/width;
    cvs.style.left = left - (x - left)*(deltaSize - 1) + 'px';
    cvs.style.top = top - (y - top)*(deltaSize - 1) + 'px';
}

/**********/
/* effect */
/**********/
const in_3 = $('#container-in-3');
let effectData = {}, 
    cvsEffect = new effect(cvs);
sendXmlhttp('json/effect.json', '', t => {
    effectData = JSON.parse(t);
    setEffect();
}, 'get');
function setEffect(){
    let categoryDiv = $('#effect-category');
    let typeDiv = $('#effect-type');
    categoryDiv.innerHTML = '';
    typeDiv.innerHTML = '';
    for(let category in effectData){
        let button = document.createElement('button'), 
            div = document.createElement('div');
        button.innerText = lang(category);
        button.setAttribute('class', 'effect-category-button');
        button.typeDiv = div;
        button.onclick = function(){
            $$('.effect-category-button').forEach(b => {
                b.removeAttribute('select');
            });
            this.setAttribute('select', '');
            $$('.effect-type-div').forEach(b => {
                b.removeAttribute('select');
            });
            this.typeDiv.setAttribute('select', '');
        };
        div.setAttribute('class', 'effect-type-div');
        categoryDiv.appendChild(button);
        typeDiv.appendChild(div);
        effectData[category].forEach(typeData => {
            let box = document.createElement('div');
            box.innerText = lang(typeData['name']);
            box.setAttribute('class', 'effect-type-box');
            box.onclick = () => {
                exitPreview();
                $$('.effect-type-box').forEach(b => {
                    b.removeAttribute('select');
                });
                box.setAttribute('select', '');
                let lineNum = 0;
                in_3.innerHTML = '';
                box.parameters = {};
                for(let text in typeData['parameter']){
                    lineNum ++;
                    let type = typeData['parameter'][text][0].split('(')[0], 
                        settings = typeData['parameter'][text][0], 
                        value = typeData['parameter'][text][1] ? typeData['parameter'][text][1] : null, 
                        lable = document.createElement('label'),  
                        inputName = type == 'select' ? 'select' : 'input', 
                        input = document.createElement(inputName);
                    if(settings.split('(').length >= 2){
                        settings = settings.split('(');
                        settings.shift();
                        settings = settings.join('(');
                        settings = settings.split(')');
                        settings.pop();
                        settings = settings.join(')');
                        try{settings = JSON.parse(settings);}
                        catch(error){
                            console.log(settings);
                            console.error(error);
                        }
                    }
                    box.parameters[text] = input;
                    lable.innerText = lang(text);
                    switch(inputName){
                        case 'input':
                            input.type = type;
                            switch(type){
                                case 'number':
                                    input.max = 'max' in settings ? settings['max'] : false;
                                    input.min = 'min' in settings ? settings['min'] : false;
                                    input.step = 'step' in settings ? settings['step'] : 1;
                                    break;
                                case 'color':
                                    break;
                                case 'file':
                                    input.accept = 'accept' in settings ? settings['accept'] : false;
                                    input.multiple = 'multiple' in settings ? settings['multiple'] : false;
                                    break;
                            }
                            break;
                        case 'select':
                            settings.forEach(optionText => {
                                let option = document.createElement('option');
                                option.innerText = lang(optionText);
                                option.value = optionText;
                                input.appendChild(option);
                            });
                            break;
                    }
                    if(value != null){
                        input.value = value;
                    }
                    lable.style.gridArea = `${lineNum}/1/${lineNum+1}/2`;
                    input.style.gridArea = `${lineNum}/2/${lineNum+1}/3`;
                    in_3.appendChild(lable);
                    in_3.appendChild(input);
                }
                let viewButton = document.createElement('button'), 
                    applyButton = document.createElement('button');
                viewButton.innerText = lang('preview');
                applyButton.innerText = lang('apply');
                let getParameters = async () => {
                    try{
                        exitPreview();
                        let parameters = {}
                        for(let key in box.parameters){
                            if(box.parameters[key].type == 'file'){
                                let imageDataPromiseList = Array.from(box.parameters[key].files).map(file => 
                                    fileToDataURL(file)
                                        .then(url => URLToImage(url))
                                        .then(image => imageToImageData(image))
                                );
                                let imageDatas = await Promise.all(imageDataPromiseList);
                                parameters[key] = imageDatas;
                            }
                            else{
                                parameters[key] = box.parameters[key].value;
                            }
                        }
                        // resolve(parameters);
                        return(parameters);
                    }
                    catch(error){
                        // reject(error);
                    }
                }
                viewButton.style.gridArea = `${lineNum+1}/1/${lineNum+2}/3`;
                viewButton.onclick = async () => {
                    let parameters = await getParameters();
                    // preview(() => {cvsEffect[typeData['function']](parameters);});
                    preview(() => {cvsEffect.render(typeData['function'], parameters);});
                };
                applyButton.style.gridArea = `${lineNum+2}/1/${lineNum+3}/3`;
                applyButton.onclick = async () => {
                    let parameters = await getParameters();
                    // cvsEffect[typeData['function']](parameters);
                    cvsEffect.render(typeData['function'], parameters);
                };
                in_3.appendChild(viewButton);
                in_3.appendChild(applyButton);
            };
            div.appendChild(box);
        });
    }
}
async function fileToDataURL(file){
    return(new Promise((resolve, reject) => {
        let reader = new FileReader();
        reader.onload = async () => {
            try {
                resolve(reader.result);
            }
            catch(error){
                reject(error);
            }
        };
        reader.onerror = (error) => {
            reject(error);
        };
        reader.readAsDataURL(file);
    }));
}
async function URLToImage(dataURL){
    return(new Promise((resolve, reject) => {
        let image = new Image();
        image.onload = async () => {
            try {
                resolve(image);
            }
            catch(error){
                reject(error);
            }
        };
        image.onerror = (error) => {
            reject(error);
        };
        image.src = dataURL;
    }));
}
async function imageToImageData(image){
    return(new Promise((resolve, reject) => {
        try {
            let cvs = document.createElement('canvas');
            let ctx = cvs.getContext('2d');
            cvs.width = image.width;
            cvs.height = image.height;
            ctx.drawImage(image, 0, 0);
            let imageData = ctx.getImageData(0, 0, cvs.width, cvs.height);
            resolve(imageData);
        }
        catch(error){
            reject(error);
        }
    }));
}
// preview
let oldCvs = document.createElement('canvas');
let oldCtx = oldCvs.getContext('2d');
let previewing = false;
function preview(previewFunction = () => {}){
    if(!previewing){
        oldCvs.width = cvs.width;
        oldCvs.height = cvs.height;
        oldCtx.clearRect(0, 0, oldCvs.width, oldCvs.height);
        oldCtx.drawImage(cvs, 0, 0);
    }
    previewing = true;
    ctx.clearRect(0, 0, cvs.width, cvs.height);
    ctx.drawImage(oldCvs, 0, 0);
    previewFunction();
}
function exitPreview(){
    if(previewing){
        ctx.clearRect(0, 0, cvs.width, cvs.height);
        ctx.drawImage(oldCvs, 0, 0);
    }
    previewing = false;
}

/********/
/* in-3 */
/********/
function langMessageInit(){
    $('#container-in-3').innerHTML = `<label>${lang('NO_SELECTED_EFFECT')}</label>`;
}

/*********/
/* alert */
/*********/
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

/*******/
/* all */
/*******/
window.addEventListener('mouseup', () => {
    $$('[id|="container-line"]').forEach(containerLine => {
        containerLine.move = false;
    });
    cvs.move = false;
});