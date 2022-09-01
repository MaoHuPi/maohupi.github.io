class effect{
    constructor(canvas){
        this.cvs = canvas;
        this.ctx = canvas.getContext('2d');
    }
    invertColor(argv){
        if(!('flipAxis' in argv)){
            return;
        }
        let pixis = this.ctx.getImageData(0, 0, this.cvs.width, this.cvs.height), 
            data = pixis.data, 
            mirror = argv['flipAxis'];
        for(let i = 0; i < data.length; i += 4){
            data[i] = mirror*2 - data[i];
            data[i+1] = mirror*2 - data[i+1];
            data[i+2] = mirror*2 - data[i+2];
        }
        this.ctx.putImageData(pixis, 0, 0);
    }
    turnToColor(argv){
        if(!('color' in argv)){
            return;
        }
        let pixis = this.ctx.getImageData(0, 0, this.cvs.width, this.cvs.height), 
            data = pixis.data, 
            color = argv['color'];
        for(let i = 0; i < data.length; i += 4){
            data[i] = color == 'red' ? (data[i]+data[i+1]+data[i+2])/3 : 0;
            data[i+1] = color == 'green' ? (data[i]+data[i+1]+data[i+2])/3 : 0;
            data[i+2] = color == 'blue' ? (data[i]+data[i+1]+data[i+2])/3 : 0;
        }
        this.ctx.putImageData(pixis, 0, 0);
    }
    extremeRGB(argv){
        let pixis = this.ctx.getImageData(0, 0, this.cvs.width, this.cvs.height), 
            data = pixis.data;
        for(let i = 0; i < data.length; i += 4){
            if (data[i]>data[i+1] && data[i]>data[i+2]){
                data[i] = 255;data[i+1] = 0;data[i+2] = 0;
            }
            else if (data[i+1]>data[i] && data[i+1]>data[i+2]){
                data[i] = 0;data[i+1] = 255;data[i+2] = 0;
            }
            else if (data[i+2]>data[i] && data[i+2]>data[i+1]){
                data[i] = 0;data[i+1] = 0;data[i+2] = 255;
            }
            else if (data[i] == data[i+1] && data[i+1] == data[i+2] && data[i] >= 112.5){
                data[i] = 255;data[i+1] = 255;data[i+2] = 255;
            }
            else if (data[i] == data[i+1] && data[i+1] == data[i+2] && data[i] < 112.5){
                data[i] = 0;data[i+1] = 0;data[i+2] = 0;
            }
        }
        this.ctx.putImageData(pixis, 0, 0);
    }
    turnToGray(argv){
        if(!('mode' in argv)){
            return;
        }
        let pixis = this.ctx.getImageData(0, 0, this.cvs.width, this.cvs.height), 
            data = pixis.data, 
            mode = argv['mode'];
        for(let i = 0; i < data.length; i += 4){
            var rgbE = mode == 'addition' ? (data[i]+data[i+1]+data[i+2])/3 : mode == 'multiplication' ? Math.pow((data[i]*data[i+1]*data[i+2]), 1/3) : 0;
            data[i] = rgbE;
            data[i+1] = rgbE;
            data[i+2] = rgbE;
        }
        this.ctx.putImageData(pixis, 0, 0);
    }
    turnToPixel(argv){
        if(!('wideCuts' in argv)){
            return;
        }
        let sqWidth = parseInt(this.cvs.width / argv['wideCuts']);
        for(let i = 0; i < this.cvs.width; i += sqWidth){
            for(let j = 0; j < this.cvs.height; j += sqWidth){
                let data = this.ctx.getImageData(
                    i+sqWidth/2 < this.cvs.width ? i+sqWidth/2 : i, 
                    j+sqWidth/2 < this.cvs.height ? j+sqWidth/2 : j, 
                    1, 
                    1
                ).data;
                this.ctx.fillStyle = `rgba(${data[0]}, ${data[1]}, ${data[2]}, ${data[3]})`;
                this.ctx.fillRect(i, j, sqWidth, sqWidth);
            }
        }
    }
    brightnessAdjustment(argv){
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
        let pixis = this.ctx.getImageData(0, 0, this.cvs.width, this.cvs.height), 
            data = pixis.data;
        for(let i = 0; i < data.length; i += 4){
            data[i] = eval(`${data[i]}${mode}${value}`);
            data[i+1] = eval(`${data[i+1]}${mode}${value}`);
            data[i+2] = eval(`${data[i+2]}${mode}${value}`);
        }
        this.ctx.putImageData(pixis, 0, 0);
    }
    alphaAdjustment(argv){
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
        let pixis = this.ctx.getImageData(0, 0, this.cvs.width, this.cvs.height), 
            data = pixis.data;
        for(let i = 0; i < data.length; i += 4){
            data[i+3] = eval(`${data[i+3]}${mode}${value}`);
        }
        this.ctx.putImageData(pixis, 0, 0);
    }
    soulTranslation(argv){
        if(!('mode' in argv) || !('stagger' in argv)){
            return;
        }
        let pixis = this.ctx.getImageData(0, 0, this.cvs.width, this.cvs.height), 
            data = pixis.data, 
            data2 = [...data];
        let mode = 4 - parseInt(argv['mode']);
        let value = mode + parseInt(argv['stagger'])*4;
        let h = cvs.width*4 + value, w = 4 + value;
        for(let i = 0; i < data.length; i += 4){
            for(let j = i; j < i + 3; j++){
                data[j] = (data2[j - h] + data2[j + h] + data2[j - w] + data2[j + w])/4;
            }
        }
        this.ctx.putImageData(pixis, 0, 0);
    }
    gradationNoise(argv){
        if(!('mode' in argv) || !('density' in argv)){
            return;
        }
        let pixis = this.ctx.getImageData(0, 0, this.cvs.width, this.cvs.height), 
            data = pixis.data, 
            data2 = [...data];
        let density = parseFloat(argv['density']);
        // let h = cvs.width*4 + value, w = 4 + value;
        for(let i = 0; i < data.length; i += 4){
            for(let j = i; j < i + 3; j++){
                switch(argv['mode']){
                    case 'fade':
                        data[j] = data[j] + (i/data.length*density)%255;
                        break;
                    case 'interference':
                        data[j] = (data[j] + i/data.length*density)%255;
                        break;
                }
            }
        }
        this.ctx.putImageData(pixis, 0, 0);
    }
    cornerStaining(argv){
        if(!('mode' in argv) || !('side' in argv)){
            return;
        }
        let pixis = this.ctx.getImageData(0, 0, this.cvs.width, this.cvs.height), 
            data = pixis.data;
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
            var oTL = argv['side'] == 'outer' ? Math.pow(Math.pow(this.cvs.width, 2)+Math.pow(this.cvs.height, 2), 1/2)/2 : 0;
            var iD = [((i+3)/4), this.cvs.width];
            iD[2] = iD[0]/iD[1];
            iD[3] = iD[0]%iD[1];
            var iT = Math.pow(iD[2], 2);
            var iB = Math.pow(this.cvs.height - iD[2], 2);
            var iL = Math.pow(iD[3], 2);
            var iR = Math.pow(this.cvs.width - iD[3], 2);
            var iTL = Math.pow(iT + iL, 1/2);
            var iTR = Math.pow(iT + iR, 1/2);
            var iBL = Math.pow(iB + iL, 1/2);
            var iBR = Math.pow(iB + iR, 1/2);
            value = Math.min(iTL, iTR, iBL, iBR);
            value = (argv['side'] == 'outer' ? oTL - value : value)/3;
            for(let j = i; j < i+3; j++){
                data[j] = eval(`${data[j]}${mode}${value}`);
            }
        }
        this.ctx.putImageData(pixis, 0, 0);
    }
    reWatermark(argv){
        let h = 200, 
            $a = this.ctx.getImageData(0, 0, this.cvs.width, this.cvs.height), 
            $b = $a.data;
        for(let i = 0; i < $b.length; i+=4){
            if(
                $b[i] > h && 
                $b[i+1] > h && 
                $b[i+2] > h
            ){
                $b[i] = 255;
                $b[i+1] = 255;
                $b[i+2] = 255;
                $b[i+3] = 255;
            }
        }
        this.ctx.putImageData($a, 0, 0);
    }
    reWotB(argv){
        let h = 200, 
            $a = this.ctx.getImageData(0, 0, this.cvs.width, this.cvs.height), 
            $b = $a.data;
        for(let i = 0; i < $b.length; i+=4){
            if(
                $b[i] > h && 
                $b[i+1] > h && 
                $b[i+2] > h
            ){
                $b[i] = 0;
                $b[i+1] = 0;
                $b[i+2] = 0;
                $b[i+3] = 0;
            }else{$b[i] = 0;
                $b[i+1] = 0;
                $b[i+2] = 0;
                $b[i+3] = 255;}
        }
        this.ctx.putImageData($a, 0, 0);
     }
    fade(argv){
        let cData = [0, 0, 0], 
            $a = this.ctx.getImageData(0, 0, this.cvs.width, this.cvs.height), 
            $b = $a.data;
        for(let i = 0; i < $b.length; i+=4){
            $b[i+3] -= 255 - (Math.abs($b[i]-cData[0]) + Math.abs($b[i+1]-cData[1]) + Math.abs($b[i+2]-cData[2]))/3;
        }
        this.ctx.putImageData($a, 0, 0);
    }
}