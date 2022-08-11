/*
 * 2022 © MaoHuPi
 */
'use strict';

/* form */
// var times = 8;
var times = Infinity;
let sp = new sheetPlayer();
loadSamples(sp);
let tl = new (sp.timeline)();
tl.deleteAfterPlay = true;
let args = [];
function create(settings = {}, createType = 'progressive'){
    var firstSheetData = randomSheet(tl, 0, settings);
    var deltaTime = bpmToSecond(firstSheetData['bpm']) * 4 * 8;
    let i = 0;
    if(createType == 'now'){
        for(let i = 0; i < times - 1; i++){
            randomSheet(tl, deltaTime*(i+1), {...firstSheetData, 'notes': undefined});
        }
    }
    else if(createType == 'progressive'){
        function randomNext(){
            if(i < times){
                randomSheet(tl, deltaTime*(i+1), {...firstSheetData, 'notes': undefined});
                i++;
                setTimeout(() => {
                    randomNext();
                }, 1e3*bpmToSecond(firstSheetData['bpm'] * 4 * 8));
            }
        }
        randomNext();
    }
    console.log(firstSheetData);
}
function play(){
    if(tl.ended){
        $('#playButton').style.backgroundImage = 'url("image/play.svg")';
        tl.stop();
    }
    if(tl.paused){
        $('#playButton').style.backgroundImage = 'url("image/pause.svg")';
        setTimeout(() => {
            tl.play();
        }, 30);
    }
    else{
        $('#playButton').style.backgroundImage = 'url("image/play.svg")';
        tl.pause();
    }
}

let backgroundUpdateRunning = true;
let background_html = undefined;
let background_body = undefined;
let background_createButton = undefined;
let fftAniColor = 0;
function backgroundUpdate(){
    if(backgroundUpdateRunning){
        if(!background_html){
            background_html = $('html');
        }
        if(!background_body){
            background_body = $('body');
        }
        if(!background_createButton){
            background_createButton = $('#createButton');
        }
        var argstyle_value = $('#argStyle').value;
        var {h, s, l} = hexToHsl($('#argColor').value);
        // 205, 100, 80
        background_html.style.backgroundColor = `hsl(${h}deg, ${s}%, ${l}%)`;
        background_body.style.backgroundColor = `hsl(${h}deg, ${s}%, ${l}%)`;
        // 205, 30, 50
        // background_createButton.style.backgroundColor = `hsl(${h}deg, ${Math.min(65*2 - s, 100)}%, ${Math.min(65*2 - l, 50)}%)`;
        background_createButton.style.setProperty(
            '--backgroundColor', 
            `hsl(${h}deg, ${30}%, ${50}%)`
        );
        // 205, 40, 30
        background_createButton.style.setProperty(
            '--hover_backgroundColor', 
            `hsl(${h}deg, ${40}%, ${30}%)`
        );
        fftAniColor = l > 50 ? 0 : 255;
        setTimeout(backgroundUpdate, 30);
    }
}
$('#argColor').value = '#9bd5ff';
backgroundUpdate();

function createButtonClick(){
    $('#createButton').removeEventListener('click', createButtonClick);
    backgroundUpdateRunning = false;
    args = {
        'style': $('#argStyle').value, 
        'color': hexToHsl($('#argColor').value), 
        'fftAniType': $('#argFftAniType').value
    };
    var speed = 0;
    speed += 360 - circleiseDistance(args['color'].h, 0, 360);
    speed += circleiseDistance(args['color'].h, 220, 360);
    speed += args['color'].l / 100 * 300;
    speed /= 3;
    var allowNotes = [];
    switch(args['style']){
        // https://wiwi.video/w/azUYGfQ1QaBQ6DPKMLULMY
        case 'sorrowful':
            allowNotes = ['C', 'D', 'D#', 'F', 'G'];
            break;
        case 'arabic':
            allowNotes = ['C', 'D#', 'E', 'F', 'G'];
            break;
        case 'magical':
            allowNotes = ['C', 'D', 'E', 'F#', 'G#'];
            break;
        case 'chinese':
            allowNotes = ['C', 'D', 'E', 'G', 'A'];
            break;
        // https://www.youtube.com/watch?v=3CJj4FlAtKk
        case 'japanese':
            allowNotes = ['C', 'E', 'F', 'A', 'B'];
            break;
        case 'japanese':
            allowNotes = ['A#', 'C', 'C#', 'F', 'F#', 'B'];
            break;
    }
    var instruments = ['chord', 'main', 'background', 'kick', 'snare'];
    if(args['style'].indexOf('japanese') > -1){
        // https://www.youtube.com/watch?v=hGQTQUNGiVc
        instruments.push('koto');
        instruments.remove('main');
        instruments.push('shakuhachi');
        instruments.remove('background');
        instruments.push('overlowtom');
        instruments.remove('kick');
        instruments.push('overhitom');
        instruments.remove('snare');
    }
    create({bpm: speed, allowNotes: allowNotes, instruments: instruments});
    // create({bpm: speed, allowNotes: ['C#']});
    setTimeout(() => {
        tl.play();
    }, 30);
    $('#formBasic').style.transform = 'scale(1) translateY(100vh)';
    $('#playButton').style.opacity = 1;
    $('#playButton').style.pointerEvents = 'all';
    $('#playButton').style.backgroundImage = 'url("image/pause.svg")';
    $('#playButton').style.backgroundImage = 'url("image/pause.svg")';
    if(fftAniColor == 0){
        $('#playButton').style.filter = 'invert(1)';
    }
    $('#playButton').addEventListener('click', play);
    if(args['fftAniType'] != 'none'){
        fftUpdate();
    }
}
$('#createButton').addEventListener('click', createButtonClick);

/* canvas */
const fftCvs = $('#fftCanvas');
const fftCtx = fftCvs.getContext('2d');
// fftCtx.globalCompositeOperation = 'overlay';
function cvsResize(){
    let cvsProportion = 0.4;
    if(fftCvs.width != window.innerWidth*cvsProportion){
        fftCvs.width = window.innerWidth*cvsProportion;
    }
    if(fftCvs.height != window.innerHeight*cvsProportion){
        fftCvs.height = window.innerHeight*cvsProportion;
    }
    setTimeout(cvsResize, 30);
}
// cvsResize();
sp.changeFftSize(32*2**1);
// let fftAniType = 'bottomWave';
let fftAniType = 'alphaLine';
function fftUpdate(){
    var fft = sp.getFft();
    var fftC = fftAniColor;
    var boxGap = 0.5;
    var boxWidth = 1/fft.length/(1+boxGap);
    fftCtx.clearRect(0, 0, fftCvs.width, fftCvs.height);
    // fftCtx.fillStyle = `hsla(${args['color'].h}deg, ${args['color'].s}%, ${args['color'].l}%, ${0.4})`;
    // fftCtx.fillRect(0, 0, fftCvs.width, fftCvs.height);
    for(let i = 0; i < fft.length; i++){
        var boxHeight = (128 - fft[i])/128;
        switch(args['fftAniType']){
            case 'none':
                break;
            case 'topWave':
                fftCtx.fillStyle = `rgb(${fftC}, ${fftC}, ${fftC})`;
                fftCtx.fillRect(fftCvs.width*boxWidth*(i*(1+boxGap) + boxGap*0.5), 0, fftCvs.width*boxWidth, fftCvs.height*boxHeight);
                break;
            case 'bottomWave':
                fftCtx.fillStyle = `rgb(${fftC}, ${fftC}, ${fftC})`;
                fftCtx.fillRect(fftCvs.width*boxWidth*(i*(1+boxGap) + boxGap*0.5), fftCvs.height, fftCvs.width*boxWidth, -fftCvs.height*boxHeight);
                break;
            case 'leftWave':
                fftCtx.fillStyle = `rgb(${fftC}, ${fftC}, ${fftC})`;
                fftCtx.fillRect(0, fftCvs.height*boxWidth*(i*(1+boxGap) + boxGap*0.5), fftCvs.width*boxHeight, fftCvs.height*boxWidth);
                break;
            case 'rightWave':
                fftCtx.fillStyle = `rgb(${fftC}, ${fftC}, ${fftC})`;
                fftCtx.fillRect(fftCvs.width, fftCvs.height*boxWidth*(i*(1+boxGap) + boxGap*0.5), -fftCvs.width*boxHeight, fftCvs.height*boxWidth);
                break;
            case 'middleWave':
                fftCtx.fillStyle = `rgb(${fftC}, ${fftC}, ${fftC})`;
                fftCtx.fillRect(fftCvs.width*boxWidth*(i*(1+boxGap) + boxGap*0.5), fftCvs.height*(1 - boxHeight)/2, fftCvs.width*boxWidth, fftCvs.height*boxHeight);
                break;
            case 'dotWave':
                fftCtx.fillStyle = `rgb(${fftC}, ${fftC}, ${fftC})`;
                fftCtx.fillRect(fftCvs.width*boxWidth*(i*(1+boxGap) + boxGap*0.5), fftCvs.height*(1 - boxHeight), fftCvs.width*boxWidth, fftCvs.width*boxWidth);
                break;
            case 'verticalAlphaLine':
                fftCtx.fillStyle = `rgba(${fftC}, ${fftC}, ${fftC}, ${boxHeight})`;
                fftCtx.fillRect(fftCvs.width*boxWidth*(i*(1+boxGap) + boxGap*0.5), 0, fftCvs.width*boxWidth, fftCvs.height);
                break;
            case 'horizontalAlphaLine':
                fftCtx.fillStyle = `rgba(${fftC}, ${fftC}, ${fftC}, ${boxHeight})`;
                fftCtx.fillRect(0, fftCvs.height*boxWidth*(i*(1+boxGap) + boxGap*0.5), fftCvs.width, fftCvs.height*boxWidth);
                break;
        }
    }
    setTimeout(fftUpdate, 10);
    // var fftSum = fft.reduce((total, num) => total+num);
    // console.log(fftSum, new Date().getTime());
}

window.addEventListener('contextmenu', event => {event.preventDefault();});

/* start */
setTimeout(() => {
    $('#formBasic').style.transform = 'scale(1)';
}, 30);