/*
 * 2022 © MaoHuPi
 * imggod++/script/effect.js
 */

class effect {
    constructor(canvas) {
        this.cvs = canvas;
        this.ctx = canvas.getContext('2d');
    }
    render(name, argv) {
        let pixis = this.ctx.getImageData(0, 0, this.cvs.width, this.cvs.height),
            data = pixis.data;
        const worker = new Worker("./script/worker.js");
        alertBox.progress(langData[name], () => {
            worker.terminate();
            alertBox.visible(false);
        });
        // let data1 = JSON.stringify(data);
        worker.onmessage = (msg) => {
            if (msg.data.progress == 'done') {
                for (let i = 0; i < pixis.data.length; i++) {
                    pixis.data[i] = msg.data.data[i];
                }
                this.ctx.putImageData(pixis, 0, 0);
                // console.log(msg.data.data);
                alertBox.visible(false);
            }
            else {
                alertBox.setProgress(msg.data.progress);
            }
        };
        worker.postMessage({
            data: data,
            argv: argv,
            cvs: { width: this.cvs.width, height: this.cvs.height },
            forFun: (this[name]).toString()
        });
        this.ctx.putImageData(pixis, 0, 0);
    }
    static HexToCData(color) {
        color = color.toString();
        color = color.replace('#', '');
        let cData = [];
        for (let i = 0; i < color.length; i += 2) {
            let value = color[i];
            value += i + 1 < color.length ? color[i + 1] : '';
            value = parseInt(value, 16);
            cData.push(value);
        }
        return (cData);
    }
    static DataToGrayscale(data) {
        let grayscale = [...data];
        for (let i = 0; i < grayscale.length; i += 4) {
            grayscale[i] = grayscale[i + 1] = grayscale[i + 2] = grayscale.slice(i, i + 3).reduce((a, b) => a + b) / 3;
        }
        return (grayscale);
    }
    invertColor = (msgArgs) => {
        let data = msgArgs.data;
        let argv = msgArgs.argv;
        let cvs = msgArgs.cvs;
        if (!('flipAxis' in argv)) {
            return;
        }
        mirror = argv['flipAxis'];
        for (let i = 0; i < data.length; i += 4) {
            data[i] = mirror * 2 - data[i];
            data[i + 1] = mirror * 2 - data[i + 1];
            data[i + 2] = mirror * 2 - data[i + 2];
            if (i % 5 == 0) {
                self.postMessage({ progress: (i / data.length) });
            }
        }
    }
    turnToColor = (msgArgs) => {
        let data = msgArgs.data;
        let argv = msgArgs.argv;
        let cvs = msgArgs.cvs;
        if (!('color' in argv)) {
            return;
        }
        color = argv['color'];
        for (let i = 0; i < data.length; i += 4) {
            data[i] = color == 'red' ? (data[i] + data[i + 1] + data[i + 2]) / 3 : 0;
            data[i + 1] = color == 'green' ? (data[i] + data[i + 1] + data[i + 2]) / 3 : 0;
            data[i + 2] = color == 'blue' ? (data[i] + data[i + 1] + data[i + 2]) / 3 : 0;
            if (i % 5 == 0) {
                self.postMessage({ progress: (i / data.length) });
            }
        }
    }
    extremeRGB = (msgArgs) => {
        let data = msgArgs.data;
        let argv = msgArgs.argv;
        let cvs = msgArgs.cvs;

        for (let i = 0; i < data.length; i += 4) {
            let max = Math.max(data[i], data[i + 1], data[i + 2]);
            if (data[i] == data[i + 1] && data[i + 1] == data[i + 2]) {
                if (data[i] >= 112.5) {
                    data[i] = data[i + 1] = data[i + 2] = 255;
                }
                else {
                    data[i] = data[i + 1] = data[i + 2] = 0;
                }
            }
            else if (max = data[i]) {
                data[i + 1] = data[i + 2] = 0;
                data[i] = 255;
            }
            else if (max = data[i + 1]) {
                data[i] = data[i + 2] = 0;
                data[i + 1] = 255;
            }
            else if (max = data[i + 2]) {
                data[i] = data[i + 1] = 0;
                data[i + 2] = 255;
            }
            if (i % 5 == 0) {
                self.postMessage({ progress: (i / data.length) });
            }
        }
    }
    turnToGray = (msgArgs) => {
        let data = msgArgs.data;
        let argv = msgArgs.argv;
        let cvs = msgArgs.cvs;
        if (!('mode' in argv)) {
            return;
        }
        mode = argv['mode'];
        for (let i = 0; i < data.length; i += 4) {
            var rgbE = mode == 'addition' ? (data[i] + data[i + 1] + data[i + 2]) / 3 : mode == 'multiplication' ? Math.pow((data[i] * data[i + 1] * data[i + 2]), 1 / 3) : 0;
            data[i] = rgbE;
            data[i + 1] = rgbE;
            data[i + 2] = rgbE;
            if (i % 5 == 0) {
                self.postMessage({ progress: (i / data.length) });
            }
        }
    }
    turnToPixel = (msgArgs) => {
        let data = msgArgs.data;
        let argv = msgArgs.argv;
        let cvs = msgArgs.cvs;
        if (!('wideCuts' in argv)) {
            return;
        }
        let sqWidth = parseInt(cvs.width / argv['wideCuts']);
        for (let i = 0; i < cvs.width; i += sqWidth) {
            for (let j = 0; j < cvs.height; j += sqWidth) {
                let nth = (Math.floor(j + sqWidth / 2 < cvs.height ? j + sqWidth / 2 : j) * cvs.width + Math.floor(i + sqWidth / 2 < cvs.width ? i + sqWidth / 2 : i)) * 4;
                for (let k = i; k < i + sqWidth; k++) {
                    for (let l = j; l < j + sqWidth; l++) {
                        nthInSq = Math.floor(l * cvs.width + k) * 4;
                        for (m = 0; m < 4; m++) {
                            data[nthInSq + m] = data[nth + m];
                        }
                    }
                }
            }
            self.postMessage({ progress: (i / cvs.width) });
        }
    }
    brightnessAdjustment = (msgArgs) => {
        let data = msgArgs.data;
        let argv = msgArgs.argv;
        let cvs = msgArgs.cvs;
        if (!('mode' in argv) || !('value' in argv)) {
            return;
        }
        let mode = '+',
            value = parseFloat(argv['value']);
        switch (argv['mode']) {
            case 'addition': mode = '+'; break;
            case 'subtraction': mode = '-'; break;
            case 'multiplication': mode = '*'; break;
            case 'division': mode = '/'; break;
            case 'power': mode = '**'; break;
            case 'remainder': mode = '%'; break;
        }

        for (let i = 0; i < data.length; i += 4) {
            data[i] = eval(`${data[i]}${mode}${value}`);
            data[i + 1] = eval(`${data[i + 1]}${mode}${value}`);
            data[i + 2] = eval(`${data[i + 2]}${mode}${value}`);
            if (i % 5 == 0) {
                self.postMessage({ progress: (i / data.length) });
            }
        }
    }
    alphaAdjustment = (msgArgs) => {
        let data = msgArgs.data;
        let argv = msgArgs.argv;
        let cvs = msgArgs.cvs;
        if (!('mode' in argv) || !('value' in argv)) {
            return;
        }
        let mode = '+',
            value = parseFloat(argv['value']);
        switch (argv['mode']) {
            case 'addition': mode = '+'; break;
            case 'subtraction': mode = '-'; break;
            case 'multiplication': mode = '*'; break;
            case 'division': mode = '/'; break;
            case 'power': mode = '**'; break;
            case 'remainder': mode = '%'; break;
        }

        for (let i = 0; i < data.length; i += 4) {
            data[i + 3] = eval(`${data[i + 3]}${mode}${value}`);
            if (i % 5 == 0) {
                self.postMessage({ progress: (i / data.length) });
            }
        }
    }
    soulTranslation = (msgArgs) => {
        let data = msgArgs.data;
        let argv = msgArgs.argv;
        let cvs = msgArgs.cvs;
        if (!('mode' in argv) || !('stagger' in argv)) {
            return;
        }
        data2 = [...data];
        let mode = 4 - parseInt(argv['mode']);
        let value = mode + parseInt(argv['stagger']) * 4;
        let h = cvs.width * 4 + value, w = 4 + value;
        for (let i = 0; i < data.length; i += 4) {
            for (let j = i; j < i + 3; j++) {
                data[j] = (data2[j - h] + data2[j + h] + data2[j - w] + data2[j + w]) / 4;
            }
            if (i % 5 == 0) {
                self.postMessage({ progress: (i / data.length) });
            }
        }
    }
    gradationNoise = (msgArgs) => {
        let data = msgArgs.data;
        let argv = msgArgs.argv;
        let cvs = msgArgs.cvs;
        if (!('mode' in argv) || !('density' in argv)) {
            return;
        }
        data2 = [...data];
        let density = parseFloat(argv['density']);
        // let h = cvs.width*4 + value, w = 4 + value;
        for (let i = 0; i < data.length; i += 4) {
            for (let j = i; j < i + 3; j++) {
                switch (argv['mode']) {
                    case 'fade-white':
                        data[j] = data[j] + (i / data.length * density) % 255;
                        break;
                    case 'interference':
                        data[j] = (data[j] + i / data.length * density) % 255;
                        break;
                }
            }
            if (i % 5 == 0) {
                self.postMessage({ progress: (i / data.length) });
            }
        }
    }
    cornerStaining = (msgArgs) => {
        let data = msgArgs.data;
        let argv = msgArgs.argv;
        let cvs = msgArgs.cvs;
        if (!('mode' in argv) || !('side' in argv)) {
            return;
        }
        let mode = '+';
        switch (argv['mode']) {
            case 'addition': mode = '+'; break;
            case 'subtraction': mode = '-'; break;
            case 'multiplication': mode = '*'; break;
            case 'division': mode = '/'; break;
            case 'power': mode = '**'; break;
            case 'remainder': mode = '%'; break;
        }
        for (let i = 0; i < data.length; i += 4) {
            let value = 0;
            var oTL = argv['side'] == 'outer' ? Math.pow(Math.pow(cvs.width, 2) + Math.pow(cvs.height, 2), 1 / 2) / 2 : 0;
            var iD = [((i + 3) / 4), cvs.width];
            iD[2] = iD[0] / iD[1];
            iD[3] = iD[0] % iD[1];
            var iT = Math.pow(iD[2], 2);
            var iB = Math.pow(cvs.height - iD[2], 2);
            var iL = Math.pow(iD[3], 2);
            var iR = Math.pow(cvs.width - iD[3], 2);
            var iTL = Math.pow(iT + iL, 1 / 2);
            var iTR = Math.pow(iT + iR, 1 / 2);
            var iBL = Math.pow(iB + iL, 1 / 2);
            var iBR = Math.pow(iB + iR, 1 / 2);
            value = Math.min(iTL, iTR, iBL, iBR);
            value = (argv['side'] == 'outer' ? oTL - value : value) / 3;
            for (let j = i; j < i + 3; j++) {
                data[j] = eval(`${data[j]}${mode}${value}`);
            }
            if (i % 5 == 0) {
                self.postMessage({ progress: (i / data.length) });
            }
        }
    }
    textRemoveBackground = (msgArgs) => {
        let data = msgArgs.data;
        let argv = msgArgs.argv;
        let cvs = msgArgs.cvs;
        if (!('mode' in argv) || !('gate' in argv) || !('background' in argv)) {
            return;
        }
        let h = 200;
        h = argv['gate'];
        h = argv['mode'] == 'dark' ? 255 - h : h;
        let mode = argv['mode'] == 'dark' ? '<' : '>';
        let background = [0, 0];
        switch (argv['background']) {
            case 'transparent': background = [[0, 255], [0, 0]]; break;
            case 'white': background = [[0, 255], [255, 255]]; break;
            case 'black': background = [[255, 255], [0, 255]]; break;
        }
        for (let i = 0; i < data.length; i += 4) {
            if (
                eval(`
                    ${data[i]} ${mode} ${h} && 
                    ${data[i + 1]} ${mode} ${h} && 
                    ${data[i + 2]} ${mode} ${h}
                `)
            ) {
                data[i] = data[i + 1] = data[i + 2] = background[1][0];
                data[i + 3] = background[1][1];
            } else {
                data[i] = data[i + 1] = data[i + 2] = background[0][0];
                data[i + 3] = background[0][1];
            }
            if (i % 5 == 0) {
                self.postMessage({ progress: (i / data.length) });
            }
        }

    }
    fadeColor = (msgArgs) => {
        let data = msgArgs.data;
        let argv = msgArgs.argv;
        let cvs = msgArgs.cvs;
        if (!('mode' in argv) || !('color' in argv)) {
            return;
        }
        let color = [0, 0, 0];
        color = effect.HexToCData(argv['color']);
        for (let i = 0; i < data.length; i += 4) {
            switch (argv['mode']) {
                case 'fade-transparent':
                    data[i + 3] -= 255 - (Math.abs(data[i] - color[0]) + Math.abs(data[i + 1] - color[1]) + Math.abs(data[i + 2] - color[2])) / 3;
                    break;
                case 'hold':
                    data[i + 3] -= (Math.abs(data[i] - color[0]) + Math.abs(data[i + 1] - color[1]) + Math.abs(data[i + 2] - color[2])) / 3;
                    break;
            }
            if (i % 5 == 0) {
                self.postMessage({ progress: (i / data.length) });
            }
        }
    }
    pixelThrow = (msgArgs) => {
        let data = msgArgs.data;
        let argv = msgArgs.argv;
        let cvs = msgArgs.cvs;
        if (!('magnification' in argv)) {
            return;
        }
        let magnification = argv['magnification'];
        let newData = [...data];
        for (let i = 0; i < data.length; i += 4) {
            data[i]
            let nth = Math.floor(i / 4);
            let y = Math.floor(nth / cvs.width),
                x = nth % cvs.width;
            let ny = Math.min(y, cvs.height - y),
                nx = Math.min(x, cvs.width - x);
            let l = Math.min(ny, nx);
            switch ((x - cvs.width / 2 > 0 ? '+' : '-') + (y - cvs.height / 2 > 0 ? '+' : '-')) {
                case '--':
                    x += l * magnification;
                    break;
                case '+-':
                    y += l * magnification;
                    break;
                case '++':
                    x -= l * magnification;
                    break;
                case '-+':
                    y -= l * magnification;
                    break;
            }
            let j = (y * cvs.width + x) * 4;
            for (let k = 0; k < 4; k++) {
                newData[j + k] = data[i + k];
            }
            if (i % 5 == 0) {
                self.postMessage({ progress: (i / data.length) });
            }
        }
        msgArgs.data = newData;
    }
    sampleCorrespond = (msgArgs) => {
        let data = msgArgs.data;
        let argv = msgArgs.argv;
        let cvs = msgArgs.cvs;
        if (!('mode' in argv) || !('originalSample' in argv) || !('correspondSample' in argv)) {
            return;
        }
        if (!(argv['originalSample'][0]) || !(argv['correspondSample'][0])) {
            return;
        }
        function scaleImageData(imageData, width, height) {
            let xRatio = width / imageData.width;
            let yRatio = height / imageData.height;
            let oldData = [...imageData.data];
            let newData = new Array(width * height * 4);
            for (let y = 0; y < height; y++) {
                for (let x = 0; x < width; x++) {
                    let i = (y * width + x) * 4;
                    let ratioI = (Math.floor(y / yRatio) * argv['correspondSample'][0].width + Math.floor(x / xRatio)) * 4;
                    [newData[i], newData[i + 1], newData[i + 2], newData[i + 3]] = oldData.slice(ratioI, ratioI + 4);
                }
                // console.log(y/height);
            }
            return (newData);
        }
        let originalSample = argv['originalSample'][0].data;
        let correspondSample_Pixis = argv['correspondSample'][0];
        let correspondSample = scaleImageData(correspondSample_Pixis, argv['originalSample'][0].width, argv['originalSample'][0].height);
        let colors = {};
        let nearbyColors = {};
        let singalCorrespond = argv['mode'] == 'singleSampling';
        for (let i = 0; i < originalSample.length; i += 4) {
            let oldColor_text = originalSample.slice(i, i + 3).join(',');
            if (singalCorrespond) {
                if (!(oldColor_text in colors)) {
                    colors[oldColor_text] = correspondSample.slice(i, i + 3);
                }
            }
            else {
                if (!(oldColor_text in colors)) {
                    colors[oldColor_text] = { colors: [], index: 0 };
                }
                colors[oldColor_text]['colors'].push(correspondSample.slice(i, i + 3));
            }
        }
        for (let i = 0; i < data.length; i += 4) {
            if (data[i + 4] != 0) {
                let color = data.slice(i, i + 3);
                let color_text = color.join(',');
                if (color_text in colors) {
                    if (singalCorrespond) {
                        [data[i], data[i + 1], data[i + 2]] = colors[color_text];
                    }
                    else {
                        [data[i], data[i + 1], data[i + 2]] = colors[color_text]['colors'][colors[color_text]['index']];
                        colors[color_text]['index']++;
                        if (colors[color_text]['index'] > colors[color_text]['colors'].length - 1) {
                            colors[color_text]['index'] = 0;
                        }
                    }
                }
                // else if(color_text in nearbyColors){
                //     color_text = nearbyColors[color_text];
                // }
                // else{
                //     let colorMax = Object.entries(colors)
                //         .map(oldColor_text => [
                //             oldColor_text[0], 
                //             oldColor_text[0]
                //                 .split(',')
                //                 .map(color => parseInt(color))
                //         ])
                //         .map(oldColor => [
                //             oldColor[0], 
                //             Math.abs(oldColor[1][0] - color[0]) + Math.abs(oldColor[1][1] - color[1]) + Math.abs(oldColor[1][1] - color[1]), 
                //         ]);
                //     let colorMax_value = colorMax.map(arr => arr[1]);
                //     colorMax = colorMax[colorMax_value.indexOf(Math.max(colorMax_value))];
                //     nearbyColors[color_text] = colorMax[0];
                //     color_text = colorMax[0];
                // }
                // if(singalCorrespond){
                //     [data[i], data[i + 1], data[i + 2]] = colors[color_text];
                // }
                // else{
                //     [data[i], data[i + 1], data[i + 2]] = colors[color_text]['colors'][colors[color_text]['index']];
                //     colors[color_text]['index']++;
                //     if(colors[color_text]['index'] > colors[color_text]['colors'].length - 1){
                //         colors[color_text]['index'] = 0;
                //     }
                // }
            }
            if (i % 5 == 0) {
                self.postMessage({ progress: (i / data.length) });
            }
        }
        msgArgs.data = data;
    }
    sampleLearning = (msgArgs) => {
        let data = msgArgs.data;
        let argv = msgArgs.argv;
        let cvs = msgArgs.cvs;
        if (!('mode' in argv) || !('sample' in argv)) {
            return;
        }
        let sample = argv['sample'][0].data;
        if (argv['mode'] == 'shallowLearning') {
            let models = new Array(3)
                .fill(0)
                .map(() => new ml_singleLayerPerceptron());
            function binary(x) {
                return (x > 0 ? 1 : 0);
            }
            function sigmoid(z) {
                return 1 / (1 + Math.exp(-z));
            }
            models.forEach(m => m.actionFun = sigmoid);
            function learn(sample) {
                let iDatas = new Array(3).fill(0).map(() => []);
                for (let i = 0; i < sample.length; i += 4) {
                    let input = sample.slice(i, i + 3);
                    let output = input.reduce((a, b) => a + b) / 3 / 256;
                    for (let j = 0; j < 3; j++) {
                        iDatas[j].push({ 'input': [input[j]], 'output': output });
                    }
                }
                models.map((n, i) => {
                    models[i].learn(iDatas[i]);
                    console.log(models[i].wList);
                });
            }
            learn(sample);
            function test(g) {
                return (models.map(m => m.test([g])));
            }
            // let grayscaleData = effect.DataToGrayscale(data);
            for (let i = 0; i < data.length; i += 4) {
                let request = test(data.slice(i, i + 3).reduce((a, b) => a + b) / 3 / 256);
                [data[i], data[i + 1], data[i + 2]] = request.map(n => n * 256);
                if (i % 5 == 0) {
                    self.postMessage({ progress: (i / data.length) });
                }
            }
        }
        else if (argv['mode'] == 'deepLearning') {
            console.log('此模式尚在開發當中！');
            self.postMessage({ progress: 1 });
        }
        msgArgs.data = data;
    }
}