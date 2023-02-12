/* 
 * 2023 © MaoHuPi
 * AStar/main.js
 */

const cvs = $('#mainCvs');
const ctx = cvs.getContext('2d');
let mX = mY = 0;
let mD = false;
let lCX = lCY = -1;
let oT = oL = 0;
let cW = cH = 0;

const gameVars = {
    gridWidth: 10, 
    selectedBtn: 0, 
    gridMap: false
}

function inRect(point, rect){
    if(point[0] > rect[0] && point[0] < rect[0] + rect[2] &&
        point[1] > rect[1] && point[1] < rect[1] + rect[3]){
            return true;
    }
    return false;
}

function resizeGrid(gridWidth){
    gameVars.gridWidth = parseInt(gridWidth);
    gameVars.gridMap = new Array(gameVars.gridWidth).fill(0).map(() => new Array(gameVars.gridWidth).fill(-1));
}
resizeGrid(10);

async function edit(){
    let gridRect = [cH*0.05, cH*0.05, cH*0.9, cH*0.9];
    let btnData = [
        {name: 'start', color: '#ffeb3b'}, 
        {name: 'brick', color: '#607d8b'}, 
        {name: 'end', color: '#8bc34a'}
    ];
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, cW, cH);
    ctx.fillStyle = '#eeeeee';
    ctx.fillRect(...gridRect);
    let gap = cH*0.9 / gameVars.gridWidth
    ctx.strokeStyle = 'white';
    ctx.lineWidth = 5;
    ctx.beginPath();
    for(let i = 0; i < gameVars.gridWidth; i++){
        ctx.moveTo(cH*0.05, cH*0.05 + gap*i);
        ctx.lineTo(cH*0.95, cH*0.05 + gap*i);
        ctx.moveTo(cH*0.05 + gap*i, cH*0.05);
        ctx.lineTo(cH*0.05 + gap*i, cH*0.95);
    }
    ctx.stroke();
    if(inRect([mX, mY], gridRect)){
        ctx.strokeStyle = btnData[gameVars.selectedBtn].color;
        iX = Math.floor((mX-gridRect[0]) / gap);
        iY = Math.floor((mY-gridRect[0]) / gap);
        ctx.strokeRect(
            gridRect[0] + iX*gap, 
            gridRect[0] + iY*gap, 
            gap, gap
        );
        if(mD && !(iX == lCX && iY == lCY)){
            [lCX, lCY] = [iX, iY];
            if(gameVars.gridMap[iY][iX] == gameVars.selectedBtn){
                gameVars.gridMap[iY][iX] = -1;
            }
            else{
                gameVars.gridMap[iY][iX] = gameVars.selectedBtn;
            }
        }
    }
    for(let i = 0; i < gameVars.gridMap.length; i++){
        for(let j = 0; j < gameVars.gridMap[i].length; j++){
            if(gameVars.gridMap[i][j] != -1){
                ctx.fillStyle = btnData[gameVars.gridMap[i][j]].color;
                ctx.fillRect(
                    gridRect[0] + j*gap, 
                    gridRect[0] + i*gap, 
                    gap, gap
                );
            }
        }
    }
    let btnWidth = (cW-cH-cH*0.05 - 5*(btnData.length-1))/btnData.length;
    for(let i = 0; i < btnData.length; i++){
        ctx.fillStyle = btnData[i].color;
        let btnRect = [cH + (btnWidth+5)*i, cH*0.05, btnWidth, btnWidth];
        ctx.fillRect(...btnRect);
        if(inRect([mX, mY], btnRect)){
            ctx.fillStyle = 'black';
            ctx.font = `${cH*0.03}px arial`;
            ctx.textAlign = 'center';
            ctx.fillText(btnData[i].name, btnRect[0]+btnWidth/2, btnRect[1]+btnWidth+cH*0.03);
            if(mD){
                gameVars.selectedBtn = i;
                mD = false;
            }
        }
    }
    let inputWidth = (cW-cH-cH*0.05);
    let inputRect;
    ctx.font = `${cH*0.04}px arial`;
    ctx.textAlign = 'center';
    let inputBackgroundColor, inputTextColor;
    
    inputRect = [cH, cH*0.95 - btnWidth, inputWidth, btnWidth];
    inputTextColor = 'black';
    inputBackgroundColor = 'white';
    if(inRect([mX, mY], inputRect)){
        inputTextColor = 'white';
        inputBackgroundColor = 'black';
        if(mD){
            loopFunc = start;
            mD = false;
        }
    }    
    ctx.fillStyle = inputBackgroundColor;
    ctx.fillRect(...inputRect);
    ctx.strokeStyle = 'black';
    ctx.strokeRect(...inputRect);
    ctx.fillStyle = inputTextColor;
    ctx.fillText('Start', inputRect[0] + inputRect[2]/2, inputRect[1] + inputRect[3]/2 + cH*0.04/2);
    
    inputRect = [inputRect[0], inputRect[1] - inputRect[3]*2, inputRect[2], inputRect[3]];
    inputTextColor = 'black';
    inputBackgroundColor = 'white';
    ctx.fillStyle = inputBackgroundColor;
    ctx.fillRect(...inputRect);
    ctx.strokeStyle = 'black';
    ctx.strokeRect(...inputRect);
    ctx.fillStyle = inputTextColor;
    ctx.fillText(gameVars.gridWidth, inputRect[0] + inputRect[2]/2, inputRect[1] + inputRect[3]/2 + cH*0.04/2)
    
    inputRect = [inputRect[0], inputRect[1], inputRect[2]*0.2, inputRect[3]];
    inputTextColor = 'black';
    inputBackgroundColor = 'white';
    if(inRect([mX, mY], inputRect)){
        inputTextColor = 'white';
        inputBackgroundColor = 'black';
        if(mD && gameVars.gridWidth > 1){
            resizeGrid(gameVars.gridWidth-1);
            mD = false;
        }
    }
    ctx.fillStyle = inputBackgroundColor;
    ctx.fillRect(...inputRect);
    ctx.strokeStyle = 'black';
    ctx.strokeRect(...inputRect);
    ctx.fillStyle = inputTextColor;
    ctx.fillText('-', inputRect[0] + inputRect[2]/2, inputRect[1] + inputRect[3]/2 + cH*0.04/2)
    
    inputRect = [inputRect[0] + inputRect[2]/0.2*0.8, inputRect[1], inputRect[2], inputRect[3]];
    inputTextColor = 'black';
    inputBackgroundColor = 'white';
    if(inRect([mX, mY], inputRect)){
        inputTextColor = 'white';
        inputBackgroundColor = 'black';
        if(mD){
            resizeGrid(gameVars.gridWidth+1);
            mD = false;
        }
    }    
    ctx.fillStyle = inputBackgroundColor;
    ctx.fillRect(...inputRect);
    ctx.strokeStyle = 'black';
    ctx.strokeRect(...inputRect);
    ctx.fillStyle = inputTextColor;
    ctx.fillText('+', inputRect[0] + inputRect[2]/2, inputRect[1] + inputRect[3]/2 + cH*0.04/2);
    return;
}

function start(){
    let gridRect = [cH*0.05, cH*0.05, cH*0.9, cH*0.9];
    let btnData = [
        {name: 'start', color: '#ffeb3b'}, 
        {name: 'brick', color: '#607d8b'}, 
        {name: 'end', color: '#8bc34a'}
    ];
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, cW, cH);
    ctx.fillStyle = '#eeeeee';
    ctx.fillRect(...gridRect);
    let gap = cH*0.9 / gameVars.gridWidth
    ctx.strokeStyle = 'white';
    ctx.lineWidth = 5;
    ctx.beginPath();
    for(let i = 0; i < gameVars.gridWidth; i++){
        ctx.moveTo(cH*0.05, cH*0.05 + gap*i);
        ctx.lineTo(cH*0.95, cH*0.05 + gap*i);
        ctx.moveTo(cH*0.05 + gap*i, cH*0.05);
        ctx.lineTo(cH*0.05 + gap*i, cH*0.95);
    }
    ctx.stroke();

    let path = AStar(gameVars.gridMap);
    ctx.fillStyle = 'black';
    if(path){
        for(let p of path){
            ctx.fillRect(
                gridRect[0] + p.y*gap, 
                gridRect[0] + p.x*gap, 
                gap, gap
            );
        }
    }

    for(let i = 0; i < gameVars.gridMap.length; i++){
        for(let j = 0; j < gameVars.gridMap[i].length; j++){
            if(gameVars.gridMap[i][j] != -1){
                ctx.fillStyle = btnData[gameVars.gridMap[i][j]].color;
                ctx.fillRect(
                    gridRect[0] + j*gap, 
                    gridRect[0] + i*gap, 
                    gap, gap
                );
            }
        }
    }
    let btnWidth = (cW-cH-cH*0.05 - 5*(btnData.length-1))/btnData.length;
    let inputWidth = (cW-cH-cH*0.05);
    let inputRect;
    ctx.font = `${cH*0.04}px arial`;
    ctx.textAlign = 'center';
    let inputBackgroundColor, inputTextColor;
    
    inputRect = [cH, cH*0.95 - btnWidth, inputWidth, btnWidth];
    inputTextColor = 'black';
    inputBackgroundColor = 'white';
    if(inRect([mX, mY], inputRect)){
        inputTextColor = 'white';
        inputBackgroundColor = 'black';
        if(mD){
            loopFunc = edit;
            mD = false;
        }
    }    
    ctx.fillStyle = inputBackgroundColor;
    ctx.fillRect(...inputRect);
    ctx.strokeStyle = 'black';
    ctx.strokeRect(...inputRect);
    ctx.fillStyle = inputTextColor;
    ctx.fillText('Stop', inputRect[0] + inputRect[2]/2, inputRect[1] + inputRect[3]/2 + cH*0.04/2);
}

loopFunc = () => {};
loopFunc = edit;
async function loop(){
    await loopFunc();
    setTimeout(loop, 30);
}
loop();

function windowResize(){
    [cW, cH] = [cvs.width, cvs.height] = [cvs.offsetParent.offsetWidth, cvs.offsetParent.offsetHeight];
    [oT, oL] = [cvs.offsetParent.offsetTop, cvs.offsetParent.offsetLeft];
}
windowResize();
window.addEventListener('resize', windowResize);

function mouseMove(event){
    [mX, mY] = [event.pageX - oL, event.pageY - oT];
}
function mouseDown(){
    mD = true;
}
function mouseUp(){
    mD = false;
    lCX = lCY = -1;
}
window.addEventListener('mousemove', mouseMove);
window.addEventListener('mousedown', event => {mouseMove(event); mouseDown();});
window.addEventListener('mouseup', event => {mouseMove(event); mouseUp();});