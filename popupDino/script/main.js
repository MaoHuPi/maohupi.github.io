/*
 * 2023 © MaoHuPi
 * popupDino/main.js
 * 玩一下幾乎不會用到的功能
 */

const SW = screen.width, 
    SH = screen.height, 
    NAME = $_GET['name'], 
    PARENT = window.opener, 
    POPUP = [], 
    ELEMENT = {}, 
    IMAGE = {}, 
    PXS = 10, 
    FPS = 30, 
    MSPF = 1e3/FPS, 
    GAME = {};
let [X, Y, W, H] = [0, 0, SW, SH];
function setWindowRect(x = 0, y = 0, w = 500, h = 300){
    window.moveTo(x, y);
    window.resizeTo(w, h);
    window.outerWidth = w;
    window.outerHeight = h;
}
function openWindow(name = 'default'){
    const settings = `popup=yes,scrollbars=no,resizable=no,status=no,location=no,toolbar=no,menubar=no,width=1,height=1,top=0,left=0`;
    let popup = window.open(`?name=${name}`, name, settings);
    POPUP.push(popup);
    return(popup);
}
function destroyWindow(){
    window.opener = null;
    window.open('', '_self');
    window.close();
}
function destroyAllPopup(){
    for(let popup of POPUP){
        if(popup && 'postMessage' in popup){
            popup.postMessage({msg: 'destroy', from: NAME}, location.origin);
        }
    }
}
function loadImage(name){
    let image = new Image();
    image.src = `image/${name}.png`;
    image.var = {};
    image.onload = () => {
        image.loaded = true;
    }
    IMAGE[name] = image;
}
function generateCactus(){
    if(GAME.run){
        if(GAME.cactusCounter < 3){
            GAME.cactusIndex += 1;
            if(GAME.cactusIndex > 3){
                GAME.cactusIndex = 0;
            }
            let index = GAME.cactusIndex;
            if(index < ELEMENT.cactus?.length){
                GAME.cactusCounter++;
                ELEMENT.cactus[index].postMessage({msg: 'show', from: NAME}, location.origin);
                setTimeout(() => {
                    GAME.cactusCounter--;
                }, SW/PXS*MSPF + 1e3);
            }
        }
    }
    setTimeout(generateCactus, 1e3 * (2 + Math.floor(Math.random()*3)));
}
function startPage(){
    let ctx = IMAGE.cvs.ctx, 
        [w, h] = [IMAGE.cvs.width, IMAGE.cvs.height];
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, w, h);
    ctx.strokeStyle = '#88888888';
    ctx.lineWidth = 10;
    let margin = 20 + ctx.lineWidth;
    ctx.strokeRect(0 + margin, 0 + margin, w - margin*2, h - margin*2);
    ctx.textAlign = 'center';
    ctx.fillStyle = 'black';
    ctx.font = '50px zpix';
    ctx.fillText('Popup Dino', w/2, h/2 - 50);
    ctx.font = '25px zpix';
    // ctx.fillText('Click to start >>', w/2, h/2 + 100);
    ctx.fillText('Click to start >>', w/2 + (Math.random()*10-5), h/2 + 100 + (Math.random()*10-5));
    ctx.fillStyle = 'gray';
    ctx.font = '20px zpix';
    ctx.fillText('2023 © MaoHuPi', w/2, h/2);
    
    ctx.fillStyle = '#88888855';
    ctx.font = '80px zpix';
    ctx.textAlign = 'left';
    let des = '', rowNum = 0;
    des = 
`[Up]、[W] => jump 
[Esc]      => exit`
        .split('\n');
    rowNum = 0;
    for(let row of des){
        ctx.fillText(row, 20 + margin, 80 + margin + rowNum*80);
        rowNum++;
    }
    ctx.textAlign = 'right';
    des = 
`Please allow popup
window first!`
        .split('\n').reverse();
    rowNum = 0;
    for(let row of des){
        ctx.fillText(row, w - (20 + margin), h - (80 + margin + rowNum*80));
        rowNum++;
    }
}
function gameOverPage(){
    let ctx = IMAGE.cvs.ctx, 
        [w, h] = [IMAGE.cvs.width, IMAGE.cvs.height];
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, w, h);
    ctx.strokeStyle = '#88888888';
    ctx.lineWidth = 10;
    let margin = 20 + ctx.lineWidth;
    ctx.strokeRect(0 + margin, 0 + margin, w - margin*2, h - margin*2);
    ctx.textAlign = 'center';
    ctx.fillStyle = 'black';
    ctx.font = '50px zpix';
    ctx.fillText('Game Over', w/2, h/2 - 50);
    ctx.font = '25px zpix';
    ctx.fillText('Click to restart >>', w/2 + (Math.random()*10-5), h/2 + 100 + (Math.random()*10-5));
    ctx.fillStyle = 'gray';
    ctx.font = '20px zpix';
    ctx.fillText('2023 © MaoHuPi', w/2, h/2);
    
    ctx.fillStyle = '#88888855';
    ctx.font = '80px zpix';
    ctx.textAlign = 'left';
    let des = '', rowNum = 0;
    des = 
`Ha ha
Try again`
        .split('\n');
    rowNum = 0;
    for(let row of des){
        ctx.fillText(row, 20 + margin, 80 + margin + rowNum*80);
        rowNum++;
    }
    ctx.textAlign = 'right';
    des = 
`You got
${this.score} point${this.score > 1 ? 's' : ''}!`
        .split('\n').reverse();
    rowNum = 0;
    for(let row of des){
        ctx.fillText(row, w - (20 + margin), h - (80 + margin + rowNum*80));
        rowNum++;
    }
}
function windowAni(){
    IMAGE.cvs.width = window.innerWidth;
    IMAGE.cvs.height = window.innerHeight;
    IMAGE.cvs.ctx.imageSmoothingEnabled = false;
    GAME.frame++;
    switch(NAME){
        case undefined:
            GAME.mainPageFunc ? GAME.mainPageFunc() : false;
            break;
        case 'background':
            let DH = H - IMAGE.cvs.height;
            [X, Y, W, H] = [0, 0, SW, SH];
            IMAGE.cvs.ctx.fillStyle = 'white';
            IMAGE.cvs.ctx.fillRect(0, 0 - DH, IMAGE.cvs.width, SH/5*4);
            IMAGE.cvs.ctx.fillStyle = 'black';
            IMAGE.cvs.ctx.fillRect(0, SH/5*4 - DH, IMAGE.cvs.width, SH/5);
            if(IMAGE.ground?.loaded){
                IMAGE.ground.var.xPos = IMAGE.ground.var.xPos != undefined ? IMAGE.ground.var.xPos+GAME.dinoRunSpeed : 0;
                if(IMAGE.ground.var.xPos > IMAGE.ground.width){
                    IMAGE.ground.var.xPos = 0;
                }
                IMAGE.cvs.ctx.drawImage(IMAGE.ground, -IMAGE.ground.var.xPos*PXS, SH/5*4 - IMAGE.ground.height*PXS/2 - DH, IMAGE.ground.width*PXS, IMAGE.ground.height*PXS)
                IMAGE.cvs.ctx.drawImage(IMAGE.ground, (IMAGE.ground.width-IMAGE.ground.var.xPos)*PXS, SH/5*4 - IMAGE.ground.height*PXS/2 - DH, IMAGE.ground.width*PXS, IMAGE.ground.height*PXS)
            }
            IMAGE.cvs.ctx.fillStyle = 'black';
            IMAGE.cvs.ctx.font = '50px zpix';
            IMAGE.cvs.ctx.textAlign = 'right';
            let textPadding = 15;
            IMAGE.cvs.ctx.fillText(GAME.frame, IMAGE.cvs.width - textPadding, 50/2 + textPadding);
            break;
        case 'dino':
            [X, Y, W, H] = [SH/5, SH/5*3, SH/5, SH/5];
            if(IMAGE.dino?.loaded){
                IMAGE.dino.var.yPos = IMAGE.dino.var.yPos || 0;
                if(IMAGE.dino.var.jump){
                    IMAGE.dino.var.jumpFrame += 1;
                    IMAGE.dino.var.yPos = (x => (-(1/100)*((x*200-100)**2))/100 + 1)(IMAGE.dino.var.jumpFrame/IMAGE.dino.var.jumpFrameMax);
                    if(IMAGE.dino.var.jumpFrame >= IMAGE.dino.var.jumpFrameMax){
                        IMAGE.dino.var.jump = false;
                    }
                }
                let dinoBottom = (SH/5*3 - SH/5)*IMAGE.dino.var.yPos;
                [X, Y, W, H] = [SH/5, SH/5*3 - dinoBottom, SH/5, SH/5];
                IMAGE.cvs.ctx.drawImage(IMAGE.dino, (IMAGE.cvs.width - IMAGE.dino.width*PXS)/2, (IMAGE.cvs.height - IMAGE.dino.height*PXS)/2, IMAGE.dino.width*PXS, IMAGE.dino.height*PXS);
                if(IMAGE.dino.var.jump){
                    PARENT.postMessage({msg: 'dinoBottom', from: NAME, pos: dinoBottom}, location.origin);
                }
            }
            break;
        case 'cactus1':
        case 'cactus2':
        case 'cactus3':
            [X, Y, W, H] = [0, 0, 0, 0];
            IMAGE.cvs.ctx.fillStyle = 'white';
            IMAGE.cvs.ctx.fillRect(0, 0, IMAGE.cvs.width, IMAGE.cvs.height);
            if(IMAGE.cactus?.loaded){
                // if(IMAGE.cactus.var.show != true && Math.floor(Math.random()*100) == 0){
                //     IMAGE.cactus.var.show = true;
                // }
                if(IMAGE.cactus.var?.show){
                    IMAGE.cactus.var.xPos = IMAGE.cactus.var.xPos != undefined ? IMAGE.cactus.var.xPos+GAME.dinoRunSpeed : 0;
                    [X, Y, W, H] = [SW - SH/5*0.5 - IMAGE.cactus.var.xPos*PXS, SH/5*2, SH/5*0.5, SH/5*2];
                    if(X < 0){
                        IMAGE.cactus.var.show = false;
                        IMAGE.cactus.var.xPos = 0;
                        // destroyWindow();
                    }
                    if(X > SH/5 - 15*PXS && X < SH/5 + 15*PXS){
                        IMAGE.cvs.ctx.fillStyle = '#aaaaaa33';
                        IMAGE.cvs.ctx.fillRect(0, 0, IMAGE.cvs.width, IMAGE.cvs.height);
                        PARENT.postMessage({msg: 'detect', from: NAME}, location.origin)
                    }
                }
                IMAGE.cvs.ctx.drawImage(IMAGE.cactus, (IMAGE.cvs.width - IMAGE.cactus.width*PXS)/2, (IMAGE.cvs.height - IMAGE.cactus.height*PXS)/2, IMAGE.cactus.width*PXS, IMAGE.cactus.height*PXS);
            }
            break;
    }
    setWindowRect(X, Y, W, H);
    setTimeout(windowAni, MSPF);
}
function main(){
    IMAGE.cvs = $('#view');
    IMAGE.cvs.ctx = IMAGE.cvs.getContext('2d');
    GAME.frame = 0;
    GAME.dinoRunSpeed = 2;
    switch(NAME){
        case undefined:
            GAME.cactusCounter = 0;
            GAME.cactusIndex = 0;
            GAME.run = false;
            window.addEventListener('click', function(){
                ELEMENT.background = openWindow('background');
                ELEMENT.cactus = [];
                ELEMENT.cactus[0] = openWindow(`cactus1`);
                ELEMENT.cactus[1] = openWindow(`cactus2`);
                ELEMENT.cactus[2] = openWindow(`cactus3`);
                ELEMENT.dino = openWindow('dino');
                if([null, undefined].indexOf(ELEMENT.dino) > -1){
                    destroyAllPopup();
                    this.alert('Please allow popup window first!');
                    return;
                }
                GAME.frame = 0;
                GAME.run = true;
            });
            GAME.mainPageFunc = startPage;
            break;
        case 'background':
            loadImage('ground');
            break;
        case 'dino':
            loadImage('dino');
            window.addEventListener('keydown', event => {
                if(event.key == 'Escape'){
                    PARENT.postMessage({msg: 'exit', from: NAME}, location.origin)
                }
                else if(['w', 'ArrowUp'].indexOf(event.key) > -1){
                    if(IMAGE.dino?.loaded && IMAGE.dino.var?.jump != true){
                        IMAGE.dino.var.jump = true;
                        IMAGE.dino.var.jumpFrame = 0;
                        IMAGE.dino.var.jumpFrameMax = 50;
                        IMAGE.dino.var.yPos = 0
                    }
                    console.log(event.key)
                }
            });
            break;
        case 'cactus1':
        case 'cactus2':
        case 'cactus3':
            loadImage('cactus');
            break;
    }
    if(NAME == undefined){
        GAME.dinoBottom = 0;
        window.addEventListener("message", (event) => {
            if(event.origin !== location.origin){
                return;
            }
            console.log(event.data);
            if(event.data?.msg == 'exit' && event.data?.from == 'dino'){
                destroyAllPopup();
                if(GAME.run){
                    GAME.run = false;
                    GAME.mainPageFunc = startPage;
                }
            }
            else if(event.data?.msg == 'dinoBottom' && event.data?.from == 'dino'){
                GAME.dinoBottom = event.data?.pos || 0;
            }
            else if(event.data?.msg == 'detect' && event.data?.from.indexOf('cactus') == 0){
                if(GAME.dinoBottom < (SH/5*2 - 68)*0.75){
                    destroyAllPopup();
                    if(GAME.run){
                        GAME.run = false;
                        GAME.mainPageFunc = gameOverPage.bind({score: GAME.frame});
                    }
                }
            }
        });
        setInterval(() => {
            if(ELEMENT.background?.closed || ELEMENT.dino?.closed){
                destroyAllPopup();
                if(GAME.run){
                    GAME.run = false;
                    GAME.mainPageFunc = startPage;
                }
            }
        }, 0.5e3);
        generateCactus();
    }
    else{
        window.addEventListener("message", (event) => {
            if(event.origin !== location.origin){
                return;
            }
            console.log(event.data);
            if(event.data?.msg == 'destroy'){
                destroyWindow();
            }
            if(event.data?.msg == 'show' && NAME.indexOf('cactus') == 0){
                IMAGE.cactus.var.show = true;
            }
        });
    }
    windowAni();
}
main();
