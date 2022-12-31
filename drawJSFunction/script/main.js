/*
 * 2022 © MaoHuPi
 */

const viewRect = [0, 0, 100, 100]; // [xmin, ymin, xmax, ymax]

const body = document.body;
const inputFunc = document.querySelector('#inputFunc');
inputFunc.value = 
`/* 2022 © maohupi */
(x, time) => Math.abs((time+000)/100%40-20)*(x-500)**2 %color=hsl(\${(time/100+360/8*1)%(360*2)-360}deg,100%,65%) 
%end
(x, time) => Math.abs((time+100)/100%40-20)*(x-600)**2 %color=hsl(\${(time/100+360/8*2)%(360*2)-360}deg,100%,65%) 
%end
(x, time) => Math.abs((time+200)/100%40-20)*(x-700)**2 %color=hsl(\${(time/100+360/8*3)%(360*2)-360}deg,100%,65%) 
%end
(x, time) => Math.abs((time+300)/100%40-20)*(x-800)**2 %color=hsl(\${(time/100+360/8*4)%(360*2)-360}deg,100%,65%) 
%end
(x, time) => Math.abs((time+400)/100%40-20)*(x-900)**2 %color=hsl(\${(time/100+360/8*5)%(360*2)-360}deg,100%,65%) 
%end
(x, time) => Math.abs((time+500)/100%40-20)*(x-1000)**2 %color=hsl(\${(time/100+360/8*6)%(360*2)-360}deg,100%,65%) 
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

function draw(){
    viewRect[2] = viewRect[0] + window.innerWidth*(1-0.02);
    viewRect[3] = viewRect[1] + window.innerHeight*(1-0.02) - inputFunc.offsetHeight - resizeBar.offsetHeight;
    cvs.width = viewRect[2] - viewRect[0];
    cvs.height = viewRect[3] - viewRect[1];
    ctx.clearRect(0, 0, cvs.width, cvs.height);
    ctx.fillStyle = '#151515';
    ctx.fillRect(0, 0, cvs.width, cvs.height);
    let time = new Date().getTime();
    let colorRegex = /%color=(.[^ ]*)/g;
    let funcDataList = inputFunc.value
        .split('%end')
        .map(t => {
            let text = t;
            text = text.replaceAll(colorRegex, '');
            let color = colorRegex.exec(t);
            color = color && color.length > 0 ? color[1] : 'white';
            return({
                text: text, 
                color: color
            })
        });
    for(let funcData of funcDataList){
        try{
            let func = (x) => eval(`(${funcData['text']})(x, time)`, x = x, time = time, canvas = cvs);
            ctx.beginPath();
            for(let i = viewRect[0]; i < viewRect[2]; i++){
                ctx.lineTo(i-viewRect[0], viewRect[1] + cvs.height - func(i));
            }
            ctx.strokeStyle = eval(`\`${funcData['color']}\``, time = time);
            ctx.lineWidth = window.innerWidth*0.0025;
            ctx.stroke();
        }
        catch(e){}
    }
}
function loop(){
    draw();
    setTimeout(loop, 30);
}
loop();