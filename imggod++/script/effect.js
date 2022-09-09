class effect{
    constructor(canvas){
        this.cvs = canvas;
        this.ctx = canvas.getContext('2d');
    }
    render(name, argv){
        let pixis = this.ctx.getImageData(0, 0, this.cvs.width, this.cvs.height), 
        data = pixis.data;
        const worker = new Worker("./script/worker.js");
        alertBox.progress(langData[name], () => {
            worker.terminate();
            alertBox.visible(false);
        });
        // let data1 = JSON.stringify(data);
        worker.onmessage = (msg) => {
            if(msg.data.progress == 'done'){
                for(let i = 0; i < pixis.data.length; i++){
                    pixis.data[i] = msg.data.data[i];
                }
                this.ctx.putImageData(pixis, 0, 0);
                // console.log(msg.data.data);
                alertBox.visible(false);
            }
            else{
                alertBox.setProgress(msg.data.progress);
            }
        };
        worker.postMessage({
            data: data, 
            argv: argv, 
            cvs: {width: this.cvs.width, height: this.cvs.height}, 
            forFun: (this[name]).toString()
        });
        this.ctx.putImageData(pixis, 0, 0);
    }
    HexToCData(color){
        color = color.toString();
        color = color.replace('#', '');
        let cData = [];
        for(let i = 0; i < color.length; i += 2){
            let value = color[i];
            value += i + 1 < color.length ? color[i + 1] : '';
            value = parseInt(value, 16);
            cData.push(value);
        }
        return(cData);
    }
    invertColor = (msgArgs) => {
        let data = msgArgs.data;
        let argv = msgArgs.argv;
        let cvs = msgArgs.cvs;
        if(!('flipAxis' in argv)){
            return;
        }
        mirror = argv['flipAxis'];
        for(let i = 0; i < data.length; i += 4){
            data[i] = mirror*2 - data[i];
            data[i+1] = mirror*2 - data[i+1];
            data[i+2] = mirror*2 - data[i+2];
            self.postMessage({progress: (i/data.length)});
        }
    }
    turnToColor = (msgArgs) => {
        let data = msgArgs.data;
        let argv = msgArgs.argv;
        let cvs = msgArgs.cvs;
        if(!('color' in argv)){
            return;
        }
        color = argv['color'];
        for(let i = 0; i < data.length; i += 4){
            data[i] = color == 'red' ? (data[i]+data[i+1]+data[i+2])/3 : 0;
            data[i+1] = color == 'green' ? (data[i]+data[i+1]+data[i+2])/3 : 0;
            data[i+2] = color == 'blue' ? (data[i]+data[i+1]+data[i+2])/3 : 0;
            self.postMessage({progress: (i/data.length)});
        }
    }
    extremeRGB = (msgArgs) => {
        let data = msgArgs.data;
        let argv = msgArgs.argv;
        let cvs = msgArgs.cvs;
        
        for(let i = 0; i < data.length; i += 4){
            let max = Math.max(data[i], data[i+1], data[i+2]);
            if(data[i] == data[i+1] && data[i+1] == data[i+2]){
                if(data[i] >= 112.5){
                    data[i] = data[i+1] = data[i+2] = 255;
                }
                else{
                    data[i] = data[i+1] = data[i+2] = 0;
                }
            }
            else if(max = data[i]){
                data[i+1] = data[i+2] = 0;
                data[i] = 255;
            }
            else if(max = data[i+1]){
                data[i] = data[i+2] = 0;
                data[i+1] = 255; 
            }
            else if(max = data[i+2]){
                data[i] = data[i+1] = 0;
                data[i+2] = 255;
            }
            self.postMessage({progress: (i/data.length)});
        }
    }
    turnToGray = (msgArgs) => {
        let data = msgArgs.data;
        let argv = msgArgs.argv;
        let cvs = msgArgs.cvs;
        if(!('mode' in argv)){
            return;
        }
        mode = argv['mode'];
        for(let i = 0; i < data.length; i += 4){
            var rgbE = mode == 'addition' ? (data[i]+data[i+1]+data[i+2])/3 : mode == 'multiplication' ? Math.pow((data[i]*data[i+1]*data[i+2]), 1/3) : 0;
            data[i] = rgbE;
            data[i+1] = rgbE;
            data[i+2] = rgbE;
            self.postMessage({progress: (i/data.length)});
        }
    }
    turnToPixel = (msgArgs) => {
        let data = msgArgs.data;
        let argv = msgArgs.argv;
        let cvs = msgArgs.cvs;
        if(!('wideCuts' in argv)){
            return;
        }
        let sqWidth = parseInt(cvs.width / argv['wideCuts']);
        for(let i = 0; i < cvs.width; i += sqWidth){
            for(let j = 0; j < cvs.height; j += sqWidth){
                let nth = (Math.floor(j+sqWidth/2 < cvs.height ? j+sqWidth/2 : j)*cvs.width + Math.floor(i+sqWidth/2 < cvs.width ? i+sqWidth/2 : i))*4;
                for(let k = i; k < i + sqWidth; k++){
                    for(let l = j; l < j + sqWidth; l++){
                        nthInSq = Math.floor(l*cvs.width + k)*4;
                        for(m = 0; m < 4; m++){
                            data[nthInSq + m] = data[nth + m];
                        }
                    }
                }
            }
            self.postMessage({progress: (i/cvs.width)});
        }
    }
    brightnessAdjustment = (msgArgs) => {
        let data = msgArgs.data;
        let argv = msgArgs.argv;
        let cvs = msgArgs.cvs;
        if(!('mode' in argv) || !('value' in argv)){
            return;
        }
        let mode = '+', 
           value = parseFloat(argv['value']);
        switch(argv['mode']){
            case 'addition': mode = '+'; break;
            case 'subtraction': mode = '-'; break;
            case 'multiplication': mode = '*'; break;
            case 'division': mode = '/'; break;
            case 'power': mode = '**'; break;
            case 'remainder': mode = '%'; break;
        }
        
        for(let i = 0; i < data.length; i += 4){
            data[i] = eval(`${data[i]}${mode}${value}`);
            data[i+1] = eval(`${data[i+1]}${mode}${value}`);
            data[i+2] = eval(`${data[i+2]}${mode}${value}`);
            self.postMessage({progress: (i/data.length)});
        }
    }
    alphaAdjustment = (msgArgs) => {
        let data = msgArgs.data;
        let argv = msgArgs.argv;
        let cvs = msgArgs.cvs;
        if(!('mode' in argv) || !('value' in argv)){
            return;
        }
        let mode = '+', 
           value = parseFloat(argv['value']);
        switch(argv['mode']){
            case 'addition': mode = '+'; break;
            case 'subtraction': mode = '-'; break;
            case 'multiplication': mode = '*'; break;
            case 'division': mode = '/'; break;
            case 'power': mode = '**'; break;
            case 'remainder': mode = '%'; break;
        }
        
        for(let i = 0; i < data.length; i += 4){
            data[i+3] = eval(`${data[i+3]}${mode}${value}`);
            self.postMessage({progress: (i/data.length)});
        }
    }
    soulTranslation = (msgArgs) => {
        let data = msgArgs.data;
        let argv = msgArgs.argv;
        let cvs = msgArgs.cvs;
        if(!('mode' in argv) || !('stagger' in argv)){
            return;
        }
        data2 = [...data];
        let mode = 4 - parseInt(argv['mode']);
        let value = mode + parseInt(argv['stagger'])*4;
        let h = cvs.width*4 + value, w = 4 + value;
        for(let i = 0; i < data.length; i += 4){
            for(let j = i; j < i + 3; j++){
                data[j] = (data2[j - h] + data2[j + h] + data2[j - w] + data2[j + w])/4;
            }
            self.postMessage({progress: (i/data.length)});
        }
    }
    gradationNoise = (msgArgs) => {
        let data = msgArgs.data;
        let argv = msgArgs.argv;
        let cvs = msgArgs.cvs;
        if(!('mode' in argv) || !('density' in argv)){
            return;
        }
        data2 = [...data];
        let density = parseFloat(argv['density']);
        // let h = cvs.width*4 + value, w = 4 + value;
        for(let i = 0; i < data.length; i += 4){
            for(let j = i; j < i + 3; j++){
                switch(argv['mode']){
                    case 'fade-white':
                        data[j] = data[j] + (i/data.length*density)%255;
                        break;
                    case 'interference':
                        data[j] = (data[j] + i/data.length*density)%255;
                        break;
                }
            }
            self.postMessage({progress: (i/data.length)});
        }
    }
    cornerStaining = (msgArgs) => {
        let data = msgArgs.data;
        let argv = msgArgs.argv;
        let cvs = msgArgs.cvs;
        if(!('mode' in argv) || !('side' in argv)){
            return;
        }
        let mode = '+';
        switch(argv['mode']){
            case 'addition': mode = '+'; break;
            case 'subtraction': mode = '-'; break;
            case 'multiplication': mode = '*'; break;
            case 'division': mode = '/'; break;
            case 'power': mode = '**'; break;
            case 'remainder': mode = '%'; break;
        }
        for(let i = 0; i < data.length; i += 4){
            let value = 0;
            var oTL = argv['side'] == 'outer' ? Math.pow(Math.pow(cvs.width, 2)+Math.pow(cvs.height, 2), 1/2)/2 : 0;
            var iD = [((i+3)/4), cvs.width];
            iD[2] = iD[0]/iD[1];
            iD[3] = iD[0]%iD[1];
            var iT = Math.pow(iD[2], 2);
            var iB = Math.pow(cvs.height - iD[2], 2);
            var iL = Math.pow(iD[3], 2);
            var iR = Math.pow(cvs.width - iD[3], 2);
            var iTL = Math.pow(iT + iL, 1/2);
            var iTR = Math.pow(iT + iR, 1/2);
            var iBL = Math.pow(iB + iL, 1/2);
            var iBR = Math.pow(iB + iR, 1/2);
            value = Math.min(iTL, iTR, iBL, iBR);
            value = (argv['side'] == 'outer' ? oTL - value : value)/3;
            for(let j = i; j < i+3; j++){
                data[j] = eval(`${data[j]}${mode}${value}`);
            }
            self.postMessage({progress: (i/data.length)});
        }
    }
    textRemoveBackground = (msgArgs) => {
        let data = msgArgs.data;
        let argv = msgArgs.argv;
        let cvs = msgArgs.cvs;
        if(!('mode' in argv) || !('gate' in argv) || !('background' in argv)){
            return;
        }
        let h = 200;
        h = argv['gate'];
        h = argv['mode'] == 'dark' ? 255 - h : h;
        let mode = argv['mode'] == 'dark' ? '<' : '>';
        let background = [0, 0];
        switch(argv['background']){
            case 'transparent': background = [[0, 255], [0, 0]]; break;
            case 'white': background = [[0, 255], [255, 255]]; break;
            case 'black': background = [[255, 255], [0, 255]]; break;
        }
        for(let i = 0; i < data.length; i += 4){
            if(
                eval(`
                    ${data[i]} ${mode} ${h} && 
                    ${data[i+1]} ${mode} ${h} && 
                    ${data[i+2]} ${mode} ${h}
                `)
            ){
                data[i] = data[i+1] = data[i+2] = background[1][0];
                data[i+3] = background[1][1];
            }else{
                data[i] = data[i+1] = data[i+2] = background[0][0];
                data[i+3] = background[0][1];
            }
            self.postMessage({progress: (i/data.length)});
        }
        
    }
    fadeColor = (msgArgs) => {
        let data = msgArgs.data;
        let argv = msgArgs.argv;
        let cvs = msgArgs.cvs;
        if(!('mode' in argv) || !('color' in argv)){
            return;
        }
        let color = [0, 0, 0];
        color = this.HexToCData(argv['color']);
        for(let i = 0; i < data.length; i+=4){
            switch(argv['mode']){
                case 'fade-transparent':
                    data[i+3] -= 255 - (Math.abs(data[i]-color[0]) + Math.abs(data[i+1]-color[1]) + Math.abs(data[i+2]-color[2]))/3;
                    break;
                case 'hold':
                    data[i+3] -= (Math.abs(data[i]-color[0]) + Math.abs(data[i+1]-color[1]) + Math.abs(data[i+2]-color[2]))/3;
                    break;
            }
            self.postMessage({progress: (i/data.length)});
        }
    }
    pixelThrow = (msgArgs) => {
        let data = msgArgs.data;
        let argv = msgArgs.argv;
        let cvs = msgArgs.cvs;
        if(!('magnification' in argv)){
            return;
        }
        let magnification = argv['magnification'];
        let newData = [...data];
        for(let i = 0; i < data.length; i+=4){
            data[i]
            let nth = Math.floor(i/4);
            let y = Math.floor(nth/cvs.width), 
                x = nth%cvs.width;
            let ny = Math.min(y, cvs.height - y), 
                nx = Math.min(x, cvs.width - x);
            let l = Math.min(ny, nx);
            switch((x - cvs.width/2 > 0 ? '+' : '-') + (y - cvs.height/2 > 0 ? '+' : '-')){
                case '--':
                    x += l*magnification;
                    break;
                case '+-':
                    y += l*magnification;
                    break;
                case '++':
                    x -= l*magnification;
                    break;
                case '-+':
                    y -= l*magnification;
                    break;
            }
            let j = (y*cvs.width + x)*4;
            for(let k = 0; k < 4; k++){
                newData[j + k] = data[i + k];
            }
            self.postMessage({progress: (i/data.length)});
        }
        msgArgs.data = newData;
    }
}