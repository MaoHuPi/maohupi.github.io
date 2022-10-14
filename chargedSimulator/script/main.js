/*
 * 2022 © MaoHuPi
 * chargedSimulator/main.js
 */

let VW = vw();
let VH = vh();
const viewCvs = $('#view');
const viewCtx = viewCvs.getContext('2d');
viewCvs.width = 100 * VW;
viewCvs.height = 100 * VH;

let particleList = [];
class Vector{
    constructor(x = 0, y = 0){
        this.x = x;
        this.y = y;
    }
    static radToDeg(rad = 0){
        return(rad*180/Math.PI);
    }
    static degToRad(deg = 0){
        return(deg/180*Math.PI);
    }
    plus(...vectorList){
        for(let vector of vectorList){
            this.x += vector.x;
            this.y += vector.y;
        }
        return(this);
    }
    minus(...vectorList){
        for(let vector of vectorList){
            this.x -= vector.x;
            this.y -= vector.y;
        }
        return(this);
    }
    times(...vectorList){
        for(let vector of vectorList){
            this.x *= vector.x;
            this.y *= vector.y;
        }
        return(this);
    }
    divide(...vectorList){
        for(let vector of vectorList){
            this.x /= vector.x;
            this.y /= vector.y;
        }
        return(this);
    }
    calc(symbol, ...vectorList){
        for(let vector of vectorList){
            this.x = eval(`${this.x} ${symbol} ${vector.x}`);
            this.y = eval(`${this.y} ${symbol} ${vector.y}`);
        }
        return(this);
    }
    abs(){
        this.x = Math.abs(this.x);
        this.y = Math.abs(this.y);
        return(this);
    }
    toDirectionVector(){
        var directionVector = {
            rad: 0, 
            value: 0
        };
        directionVector.rad = Math.atan(this.y/this.x);
        switch(`${this.x < 0 ? 0 : 1},${this.y < 0 ? 0 : 1}`){
            case '0,1':
                directionVector.rad = directionVector.rad + Vector.degToRad(180);
                break;
            case '0,0':
                directionVector.rad = directionVector.rad + Vector.degToRad(180);
                break;
            case '1,0':
                directionVector.rad = directionVector.rad + Vector.degToRad(360);
                break;
        }
        directionVector.deg = Vector.radToDeg(directionVector.rad);
        directionVector.value = (this.x**2 + this.y**2)**0.5;
        return(directionVector);
    }
    static fromDirectionVector(rad, value){
        var vector = new Vector();
        vector.x = Math.cos(rad)*value
        vector.y = Math.sin(rad)*value
        return(vector);
    }
    copy(){
        return(new Vector(this.x, this.y));
    }
}
class Particle{
    constructor(parentList, x = 0, y = 0, q = 0, m = 0, size = 1, color = '#ffffff', forceList = []){
        this.position = new Vector(parseFloat(x), parseFloat(y));
        this.v = new Vector(0, 0);
        this.q = parseFloat(q);
        this.e == Math.abs(this.q) ? 1 : -1; // electrical
        this.m = parseFloat(m);
        this.size = parseFloat(size);
        this.color = color;
        this.forceList = forceList;
        this.parentList = parentList;
    }
    static K = 9*(10**9);
    next(time){
        for(let parent of this.parentList){
            if(parent != this){
                var directionVector = this.position.copy().minus(parent.position).toDirectionVector();
                var r = directionVector.value;
                var f = (Particle.K*this.q*parent.q)/(r**2);
                var a = f/this.m;
                if(this.e != parent.e){
                    directionVector.rad = (directionVector.rad+Vector.degToRad(180))%Vector.degToRad(360);
                }
                this.v.plus(Vector.fromDirectionVector(directionVector.rad, a).copy().times(new Vector(time, time)));
            }
        }
    }
    update(time = 1){
        this.position.plus(this.v.copy().times(new Vector(time, time)));
        viewCtx.fillStyle = this.color;
        // viewCtx.fillRect(50*VW + this.position.x - this.size/2, 50*VH + -this.position.y - this.size/2, this.size, this.size);
        viewCtx.beginPath();
        viewCtx.arc(50*VW + this.position.x, 50*VH + -this.position.y, this.size/2, 0, 2*Math.PI);
        viewCtx.closePath();
        viewCtx.fill();
    }
}

function update(){
    viewCtx.clearRect(0, 0, viewCvs.width, viewCvs.height);
    VW = vw();
    VH = vh();
    if(viewCvs.width != 100*VW || viewCvs.height != 100*VH){
        viewCvs.width = 100*VW;
        viewCvs.height = 100*VH;
    }

    var boxWidth = 2;
    viewCtx.fillStyle = 'gray';
    // viewCtx.fillRect(viewCvs.width/2 - boxWidth/2, viewCvs.height/2 - boxWidth/2, boxWidth, boxWidth);
    viewCtx.fillRect(0, viewCvs.height/2 - boxWidth/2, viewCvs.width, boxWidth);
    viewCtx.fillRect(viewCvs.width/2 - boxWidth/2, 0, boxWidth, viewCvs.height);
    fontSize = 30;
    viewCtx.font = `${fontSize}px serif`;
    viewCtx.fillText('x', viewCvs.width - fontSize, viewCvs.height/2 + fontSize);
    viewCtx.fillText('y', viewCvs.width/2 - fontSize, fontSize);
    viewCtx.fillText('0', viewCvs.width/2 - fontSize, viewCvs.height/2 + fontSize);

    for(let particle of particleList){
        particle.next(30/1000);
    }
    for(let particle of particleList){
        particle.update(30/1000);
        console.log(particle.v);
    }
    setTimeout(update, 30);
}
update();

let mousePosition = new Vector(0, 0);
window.addEventListener('mousemove', event => {
    mousePosition.x = event.pageX - 50*VW;
    mousePosition.y = 50*VH - event.pageY;
    // console.log(mousePosition.x, mousePosition.y, mousePosition.toDirectionVector());
});
let inputQ = $('#inputQ');
window.addEventListener('keydown', event => {
    switch(event.key){
        case '-':
            inputQ.value = parseFloat(-Math.abs(inputQ.value));
            break;
        case '=':
            inputQ.value = parseFloat(Math.abs(inputQ.value));
            break;
    }
});
let inputs = ['inputQ', 'inputM', 'inputSize', 'inputColor'].map(id => $(`#${id}`))
viewCvs.addEventListener('click', event => {
    mousePosition.x = event.pageX - 50*VW;
    mousePosition.y = 50*VH - event.pageY;
    // particleList.push(new Particle(particleList, mousePosition.x, mousePosition.y, 1e-2, 1, 10))
    particleList.push(new Particle(particleList, mousePosition.x, mousePosition.y, ...inputs.map(input => input.value)))
});