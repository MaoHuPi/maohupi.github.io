/*
 * 2022 © MaoHuPi
 */

const viewRect = [0, 0, 100, 100]; // [xmin, ymin, xmax, ymax]

const body = document.body;
const inputFunc = document.querySelector('#inputFunc');
inputFunc.value = 
`/* 2022 © maohupi */

(x, time) => Math.abs((time+000)/100%40-20)*(x-500)**2 
%color=hsl(\${(time/100+360/8*1)%(360*2)-360}deg,100%,65%) 
%end

(x, time) => Math.abs((time+100)/100%40-20)*(x-600)**2 
%color=hsl(\${(time/100+360/8*2)%(360*2)-360}deg,100%,65%) 
%end

(x, time) => Math.abs((time+200)/100%40-20)*(x-700)**2 
%color=hsl(\${(time/100+360/8*3)%(360*2)-360}deg,100%,65%) 
%end

(x, time) => Math.abs((time+300)/100%40-20)*(x-800)**2 
%color=hsl(\${(time/100+360/8*4)%(360*2)-360}deg,100%,65%) 
%end

(x, time) => Math.abs((time+400)/100%40-20)*(x-900)**2 
%color=hsl(\${(time/100+360/8*5)%(360*2)-360}deg,100%,65%) 
%end

(x, time) => Math.abs((time+500)/100%40-20)*(x-1000)**2 
%color=hsl(\${(time/100+360/8*6)%(360*2)-360}deg,100%,65%) 
%end`;

const resizeBar = document.querySelector('#resizeBar');
let resizeBarMoving = false;
resizeBar.addEventListener('mousedown', () => {
    resizeBarMoving = true;
});

const cvs = document.querySelector('#drawCvs');
let cvsMoving = false;
let cvsMove_actionMouse = [0, 0];
let cvsMove_actionViewRect = [0, 0, 0, 0];
cvs.addEventListener('mousedown', event => {
    cvsMoving = true;
    cvsMove_actionMouse = [event.pageX, event.pageY];
    cvsMove_actionViewRect = [...viewRect];
});
const ctx = cvs.getContext('2d');
body.appendChild(cvs);

window.addEventListener('mouseup', () => {
    resizeBarMoving = false;
    cvsMoving = false;
});
window.addEventListener('mousemove', event => {
    if(resizeBarMoving){
        let vw = window.innerWidth/100;
        let vh = window.innerHeight/100;
        body.style.setProperty('--resizeBarValue', (event.pageY-vw)/(100*vh - 2*vw));
    }
    else if(cvsMoving){
        console.log(viewRect[0], cvsMove_actionViewRect[0] + event.pageX - cvsMove_actionMouse[0]);
        viewRect[0] = cvsMove_actionViewRect[0] - (event.pageX - cvsMove_actionMouse[0]);
        viewRect[1] = cvsMove_actionViewRect[1] + (event.pageY - cvsMove_actionMouse[1]);
    }
});

let drawReferenceGrid = true;
let desSize = 30;
function draw(){
    viewRect[2] = viewRect[0] + window.innerWidth*(1-0.02);
    viewRect[3] = viewRect[1] + window.innerHeight*(1-0.02) - inputFunc.offsetHeight - resizeBar.offsetHeight;
    cvs.width = viewRect[2] - viewRect[0];
    cvs.height = viewRect[3] - viewRect[1];
    ctx.clearRect(0, 0, cvs.width, cvs.height);
    ctx.fillStyle = '#151515';
    ctx.fillRect(0, 0, cvs.width, cvs.height);
    let time = new Date().getTime();
    let settingsData = {
        color: {regexp: /%(line)*[Cc]olor=(.[^ ]*)/g, default: 'white', method: (v => ctx.strokeStyle = v)}, 
        dash: {regexp: /%(line)*[Dd]ash=(\[.[^ ]*\])/g, default: [], method: ctx.setLineDash.bind(ctx)}, 
        transform: {regexp: /%(line)*[Tt]ransform=(\[.[^ ]*\])/g, default: [1, 0, 0, 1, 0, 0], method: ctx.setTransform.bind(ctx)}, 
        width: {regexp: /%(line)*[Ww]idth=(.[^ ]*)/g, default: window.innerWidth*0.0025, method: (v => ctx.lineWidth = v)}, 
        join: {regexp: /%(line)*[Jj]oin=(.[^ ]*)/g, default: 'round', method: (v => ctx.lineJoin = v)}
    }
    desSize = 30;
    ctx.font = `${desSize}px serif`;
    ctx.fillStyle = '#444444';
    let desY = desSize;
    for(let settingsType in settingsData){
        var des = `%${settingsType}=${JSON.stringify(settingsData[settingsType]['default'])}`;
        ctx.fillText(des, 0, desY);
        desY += desSize;
    }
    for(let settingsType in settingsData){
        (settingsData[settingsType]['method'])(settingsData[settingsType]['default']);
    }
    let funcDataList = inputFunc.value
        .split('%end')
        .map(t => {
            let settings = {text: t};
            for(let settingsType in settingsData){
                settings['text'] = settings['text']
                    .replaceAll(settingsData[settingsType]['regexp'], '');
                let s = settingsData[settingsType]['regexp'].exec(t.replaceAll('\n', ' '));
                settings[settingsType] = s && s.length > 1 ? s[2] : JSON.stringify(settingsData[settingsType]['default']);
            }
            return(settings);
        });
    
    if(drawReferenceGrid){
        ctx.save();
        desSize = 25;
        ctx.font = `${desSize}px serif`;
        ctx.fillStyle = '#444444';
        ctx.strokeStyle = '#888888';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.textAlign = 'right';
        for(let i = viewRect[0]; i < viewRect[2]; i++){
            if(i%100 == 0){
                var x = i-viewRect[0];
                ctx.moveTo(x, 0);
                ctx.lineTo(x, cvs.height);
                ctx.fillText(i, x, cvs.height);
            }
        }
        for(let i = viewRect[1]; i < viewRect[3]; i++){
            if(i%100 == 0){
                var y = cvs.height - i+viewRect[1];
                ctx.moveTo(0, y);
                ctx.lineTo(cvs.width, y);
                ctx.fillText(i, cvs.width, y);
            }
        }
        ctx.stroke();
        ctx.restore();
    }

    for(let funcData of funcDataList){
        try{
            let func = (x) => eval(`(${funcData['text']})(x, time)`, x = x, time = time, canvas = cvs);
            ctx.save();
            for(let settingsType in settingsData){
                try{
                    (settingsData[settingsType]['method'])(JSON.parse(funcData[settingsType]));
                }
                catch(e){
                    (settingsData[settingsType]['method'])(eval(`\`${funcData[settingsType]}\``, time = time));
                }
            }
            ctx.beginPath();
            for(let i = viewRect[0]; i < viewRect[2]; i++){
                ctx.lineTo(i-viewRect[0], viewRect[1] + cvs.height - func(i));
            }
            ctx.stroke();
            ctx.restore();
        }catch(e){}
    }
}
function loop(){
    draw();
    setTimeout(loop, 30);
}
loop();