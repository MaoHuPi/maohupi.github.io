/*
 * 2023 © MaoHuPi
 * 頁面基本功能
 * c0CodeOCR > script > main.js
 */

const debugMode = false;
const outputs = [];

/* alert */
const alerts = document.getElementById('alerts');
const pool_FloatAlert = [];
function alert(content = '', type = 'compleat'){
	// object pool
	let usableFA = pool_FloatAlert.filter(FA => !FA.displayed)[0];
	if(usableFA == undefined){
		usableFA = new FloatAlert();
		if(pool_FloatAlert.length < 5) pool_FloatAlert.push(usableFA);
	}
	[usableFA.content, usableFA.type] = [content, type];
	alerts.appendChild(usableFA.display());
}

/* progress */
const progressAlert = new ProgressAlert({cancelButton: true});
document.body.appendChild(progressAlert.element);

/* ocr */
const fontCanvas = document.createElement('canvas');
const detectCanvas = document.createElement('canvas');
let debugCanvas;
if(debugMode){
	debugCanvas = document.createElement('canvas');
	document.getElementById('bottomBox').appendChild(debugCanvas);
}
let ocr = new OCR({
	fontCanvas, 
	detectCanvas, 
	wasmPath: 'script/ocr.wasm'
});

const fontWholeHeightData = {};
function makeFontData(fontName, fontDecorations, rangeData){
	const cvs = fontCanvas;
	const ctx = fontCanvas.getContext('2d');
	let fontKey = fontDecorations !== undefined ? `${fontName}-${fontDecorations.join(',')}` : fontName;
	ocr.fontData[fontKey] = [];
	ocr.fontData[`${fontKey}_invert`] = [];

	if(!(fontKey in fontWholeHeightData)){
		var span = document.createElement('span');
		span.innerText = 'some text';
		span.style.margin = '0px';
		span.style.padding = '0px';
		span.style.width = 'auto';
		span.style.height = 'auto';
		span.style.fontSize = '100px';
		span.style.fontFamily = fontName;
		span.style.fontWeight = fontDecorations !== undefined && fontDecorations.includes('bold') ? 'bold' : 'normal';
		document.body.appendChild(span);
		var boundingRect = span.getBoundingClientRect();
		fontWholeHeightData[fontKey] = boundingRect.height;
		span.remove();
	}

	function makeByText(text){
		var reserveSize = fontWholeHeightData[fontKey];
		[cvs.width, cvs.height] = [reserveSize*text.length, reserveSize];
		ctx.fillStyle = 'white';
		ctx.fillRect(0, 0, cvs.width, cvs.height);
		ctx.fillStyle = 'black';
		ctx.font = `${fontDecorations !== undefined ? fontDecorations.join(' ')+' ' : ''}100px ${fontName}`;
		ctx.textAlign = 'center';
		ctx.textBaseline = 'middle';
		ctx.fillText(text, cvs.width/2, cvs.height/2);
		ocr.fontData[fontKey][text] = ocr.getCharData(ctx.getImageData(0, 0, cvs.width, cvs.height).data, cvs.width, cvs.height, ocr.samplingLevel);
		ocr.fontData[`${fontKey}_invert`][text] = {...ocr.fontData[fontKey][text], data: ocr.fontData[fontKey][text].data.map(n => 255 - n)};
	}
	if('charCodeRange' in rangeData){
		for(let r of rangeData.charCodeRange){
			for(let i = r[0]; i < r[1]+1; i++){
				makeByText(String.fromCharCode(i));
			}
		}
	}
	if('charCode' in rangeData){
		for(let i of rangeData.charCode){
			makeByText(String.fromCharCode(i));
		}
	}
	if('charRange' in rangeData){
		for(let r of rangeData.charRange){
			for(let i = r[0]; i < r[1]+1; i++){
				makeByText(i);
			}
		}
	}
	if('char' in rangeData){
		for(let i of rangeData.char){
			makeByText(i);
		}
	}
	if('string' in rangeData){
		for(let i of rangeData.string){
			makeByText(i);
		}
	}
}

const fontDataGenerateFunctionList = {
	// consolas: () => {
	// 	let fontDataRange = {
	// 		charCodeRange: [
	// 			[33, 126]
	// 		], 
	// 		string: [
	// 			'&&', '++', 'wh', 'PA', 'fo', 'ff', 'fi', 'fl', 'my', 'et'
	// 		]
	// 	};
	// 	makeFontData('consolas', undefined, fontDataRange);
	// 	makeFontData('consolas', ['bold'], fontDataRange);
	// 	makeFontData('consolas', ['italic'], {string: ['//']});
	// }, 
	default: (fontName) => {
		let fontDataRange = {
			charCodeRange: [
				[33, 126]
			], 
			string: [
				'&&', '++', 'wh', 'PA', 'fo', 'ff', 'fi', 'fl', 'my', 'et'
			]
		};
		makeFontData(fontName, undefined, fontDataRange);
		makeFontData(fontName, ['bold'], fontDataRange);
		makeFontData(fontName, ['italic'], {string: ['//']});
	}, 
	custom: (fontName, fontDataRangeList) => {
		for(let [fontDecorations, fontDataRange] of Object.entries(fontDataRangeList)){
			makeFontData(fontName, fontDecorations == 'undefined' ? undefined : fontDecorations.split(','), fontDataRange);
		}
	}
}

function renderDebugFontDataImage(font, charName){
	if(debugMode){
		const cvs = debugCanvas;
		const ctx = cvs.getContext('2d');
		cvs.width = ocr.samplingLevel + 10*2;
		cvs.height = ocr.samplingLevel + 10*2;
		let charData = ocr.fontData[font][charName];
		let imageData = ctx.getImageData(10, 10, ocr.samplingLevel, ocr.samplingLevel);
		for(let j = 0; j < charData.data.length; j++){
			imageData.data[j*4] = imageData.data[j*4+1] = imageData.data[j*4+2] = charData.data[j];
			imageData.data[j*4+3] = 255;
		}
		ctx.putImageData(imageData, 10, 10);
	}
}

async function previewImage(url){
	const cvs = document.querySelector('#imagePreviewBox > canvas');
	const box = document.getElementById('imagePreviewBox');
	let image = await loadImage(url);
	const ctx = cvs.getContext('2d');
	function drawImage(){
		[cvs.width, cvs.height] = [image.width, image.height];
		box.style.setProperty('--width', cvs.width);
		box.style.setProperty('--height', cvs.height);
		ctx.drawImage(image, 0, 0, image.width, image.height);
	}
	drawImage();
	cvs.imageLoaded = true;
	cvs.imageRedraw = drawImage;
}

let [MX, MY] = [0, 0];
function main(){
	let ocrWorker;
	function createOcrWorker(){
		ocrWorker = new Worker('script/ocrWorker.js');
		let fontOffscreen = document.createElement('canvas').transferControlToOffscreen();
		let detectOffscreen = document.createElement('canvas').transferControlToOffscreen();
		ocrWorker.postMessage({
			operate: 'init', 
			parameter: [fontOffscreen, detectOffscreen]
		}, [fontOffscreen, detectOffscreen]);
	}
	createOcrWorker();
	progressAlert.cancelFunction = () => {
		if(ocrWorker) ocrWorker.terminate();
		createOcrWorker();
	};

	window.addEventListener('mousemove', event => {
		[MX, MY] = [event.pageX, event.pageY];
	});

	/* generate option */
	var preset = document.getElementById('preset');
	for(let [k, v] of Object.entries(presetData)){
		let option = document.createElement('option');
		option.innerText = v.name !== undefined ? v.name : k;
		option.value = k;
		preset.appendChild(option);
	}

	/* component */
	Component.init();

	/* image preview */
	const cvs = document.querySelector('#imagePreviewBox > canvas');
	const ctx = cvs.getContext('2d');
	const box = document.getElementById('imagePreviewBox');
	[cvs.width, cvs.height] = [1920, 1080];
	box.style.setProperty('--width', cvs.width);
	box.style.setProperty('--height', cvs.height);
	(async () => {
		ctx.fillStyle = 'white';
		ctx.fillRect(0, 0, cvs.width, cvs.height);
		ctx.globalAlpha = 0.2;
		var bgiSize = Math.min(cvs.width, cvs.height) * 0.8;
		var bgi = await loadImage('image/logo.png');
		ctx.drawImage(bgi, (cvs.width - bgiSize)/2, (cvs.height - bgiSize)/2, bgiSize, bgiSize);
		ctx.globalAlpha = 1.0;
		ctx.fillStyle = 'black';
		ctx.font = '150px consolas';
		ctx.textAlign = 'center';
		ctx.textBaseline = 'middle';
		ctx.fillText('C0 Code OCR', cvs.width/2, cvs.height/2 - 50);
		ctx.font = 'bold 50px consolas';
		ctx.fillText('MaoHuPi (c) 2023', cvs.width/2, cvs.height/2 + 100);
	})();

	/* method and listener */
	const inputs = {};
	[...document.querySelectorAll('#topRightBox > div > *[id]')].forEach(element => {
		inputs[element.id] = element;
	});

	inputs.uploadInput.addEventListener('change', () => {
		if(inputs.uploadInput.files.length > 0){
			let reader = new FileReader();
			reader.onloadend = async () => {
				await previewImage(reader.result);
				// inputs.uploadInput.files = new DataTransfer().files;
				inputs.uploadInput.value = '';
				codeColorFilter();
			};
			reader.readAsDataURL(inputs.uploadInput.files[0]);
		}
	});
	
	[inputs.getCodeButton_v1, inputs.getCodeButton_v2].forEach(button => {
		button.addEventListener('click', () => {
			if(cvs.imageLoaded){
				try{
					progressAlert.show();
					progressAlert.value = 0;
					let timer = Date.now();
					/* data process */
					if(ocr.samplingLevel !== inputs.samplingLevel.value || ocr.fontName !== inputs.fontName.value || ocr.fontDataRange !== inputs.fontDataRange.value){
						ocr.samplingLevel = inputs.samplingLevel.value;
						ocr.fontName = inputs.fontName.value;
						ocr.fontDataRange = inputs.fontDataRange.value;
						let fontNameList = ocr.fontName.replace(/ *, */g, ',').split(',');
						let fontDataRange = JSON.parse(ocr.fontDataRange);
						for(let key in ocr.fontData){
							delete ocr.fontData[key];
						}
						for(let fontName of fontNameList){
							if(fontName in fontDataRange){
								fontDataGenerateFunctionList.custom(fontName, fontDataRange[fontName]);
							}
							else if(fontName in fontDataGenerateFunctionList){
								fontDataGenerateFunctionList[fontName]();
							}
							else{
								fontDataGenerateFunctionList.default(fontName);
							}
						}
					}
					ocr.codeLanguage = inputs.codeLanguage.value;
					/* OCR */
					const codeRect = document.getElementById('codeRect');
					let rectData = [codeRect['rectDot-left']*cvs.width, codeRect['rectDot-top']*cvs.height, codeRect['rectDot-right']*cvs.width, codeRect['rectDot-bottom']*cvs.height].map(n => Math.floor(n));
					const newCvs = document.createElement('canvas');
					const newCtx = newCvs.getContext('2d');
					newCvs.width = rectData[2] - rectData[0];
					newCvs.height = rectData[3] - rectData[1];
					newCtx.drawImage(cvs, -rectData[0],  -rectData[1]);
					// document.getElementById('bottomBox').appendChild(newCvs);
					let codeContent;
					ocrWorker.postMessage({
						operate: ['ocrProcess_v1', 'ocrProcess_v2'][button.id.split('_v')[1] - 1], 
						parameter: [ocr.exportProperty(), newCtx.getImageData(0, 0, newCvs.width, newCvs.height).data, newCvs.width, newCvs.height], 
					});
					ocrWorker.onmessage = event => {
						let state = event.data.state;
						let result = event.data.result;
						switch(state){
							case 'progress':
								progressAlert.value = result[0];
								break;
							case 'done':
								codeContent = result[0];
								document.getElementById('codeOutput').innerHTML = hljs.highlight(codeContent, {language: ocr.codeLanguage}).value;
								outputs.push(codeContent);
								alert('Code extraction completed.', 'compleat');
								console.log(Date.now() - timer);
								progressAlert.value = 1;
								progressAlert.hide();
								break;
							case 'error':
								console.error(result[0]);
								progressAlert.hide();
								alert(result[0].toString(), 'error');
								break;
						}
					}
				}
				catch(error){
					console.error(error);
					progressAlert.hide();
					alert(error.toString(), 'error');
				}
			}
			else alert('Please open an image first!', 'warning');
		});
	});
	
	inputs.downloadCode.addEventListener('click', () => {
		if(cvs.imageLoaded && outputs.length > 0){
			var codeContent = outputs[outputs.length - 1];
			var a = document.createElement('a');
			a.href = URL.createObjectURL(new Blob([codeContent], {type: 'text/plain'}));
			a.download = `result.${ocr.codeLanguage}`;
			a.click();
			alert('File download completed.', 'compleat');
		}
		else alert('No extracted text output has been produced yet!', 'warning');
	});
	inputs.copyCode.addEventListener('click', () => {
		if(cvs.imageLoaded && outputs.length > 0){
			var codeContent = outputs[outputs.length - 1];
			navigator.clipboard.write([new ClipboardItem({['text/plain']: new Blob([codeContent], {type: 'text/plain'})})]);
			alert('Output content copy completed.', 'compleat');
		}
		else alert('No extracted text output has been produced yet!', 'warning');
	});

	inputs.preset.addEventListener('change', () => {
		if(inputs.preset.value in presetData){
			let data = presetData[inputs.preset.value];
			if('settings' in data){
				for(let [k, v] of Object.entries(data.settings)){
					if(inputs[k] !== undefined){
						if(inputs[k].setValue !== undefined) inputs[k].setValue(v);
						else inputs[k].value = v;
					}
				}
				ocr.replaceData = data?.data?.replaceData !== undefined ? data.data.replaceData : [];
				ocr.caseData = data?.data?.caseData !== undefined ? data.data.caseData : [];
			}
		}
		codeColorFilter();
	});
	inputs.preset.dispatchEvent(new Event('change'));

	function rgb2hsl(r, g, b){
		[r, g, b] = [r, g, b].map(n => n/255);
		var h = s = l = 0;
		var max = Math.max(r, g, b), min = Math.min(r, g, b), 
			sum = max + min, delta = max - min;
		l = sum/2;
		s = max == min ? 0 : 
			l <= 0.5 ? delta/sum : 
			delta/(2 - sum);
		h = max == min         ?  0                    : 
			max == r && g >= b ?  60*(g-b)/delta       : 
			max == r && g <  b ?  60*(g-b)/delta + 360 : 
			max == g           ?  60*(b-r)/delta + 120 : 
		  /*max == b           ?*/60*(r-g)/delta + 240 ;
		[h, s, l] = [h, s*100, l*100].map(n => Math.round(n));
		return {h, s, l};
	}
	function codeColorFilter(){
		if(cvs.imageLoaded){
			let value = ['codeColorRange-hue', 'codeColorRange-saturation', 'codeColorRange-lightness'].map(id => inputs[id].value);
			cvs.imageRedraw();
			const ctx = cvs.getContext('2d');
			let imageData = ctx.getImageData(0, 0, cvs.width, cvs.height);
			for(let i = 0; i < imageData.data.length; i += 4){
				let {h, s, l} = rgb2hsl(...imageData.data.slice(i, i+3));
				if([h, s, l]
					.map((n, i) => (
						value[i][0] > value[i][1] ? 
						(n >= value[i][0] || n <= value[i][1]) : 
						(n >= value[i][0] && n <= value[i][1])
					) ? 1 : 0)
					.includes(0)
				){
					imageData.data[i] = imageData.data[i+1] = imageData.data[i+2] = 255;
				}
			}
			ctx.putImageData(imageData, 0, 0);
		}
	}
	['codeColorRange-hue', 'codeColorRange-saturation', 'codeColorRange-lightness'].map(id => {
		let lastChangeTime = 0;
		function r(){
			if(Date.now() - lastChangeTime >= 100){
				codeColorFilter();
			}
		}
		inputs[id].addEventListener('change', () => {
			lastChangeTime = Date.now();
			setTimeout(r, 150);
		});
	});
}
main();

function ocrDebug(dataImage, [width, height], [tW, tH]){
	function logImage(r){
		console.log([...r].map(n => n > 127 ? 1 : 0).join('').replace(new RegExp(`(.{${tW}})`, 'g'), '$1\n').replace(/([^\n])/g, '%c$1'), ...[...r].map(n => `color: rgba(${n}, ${n}, ${n}, 255)`));
	}
	logImage(ocr.stretchImage(new Uint8Array(dataImage), width, height, tW, tH, 1));
	
	var charCvs = document.createElement('canvas');
	[charCvs.width, charCvs.height] = [width, height];
	charCvs.getContext('2d').putImageData(new ImageData(ocr.gray2rgba(dataImage), charCvs.width, charCvs.height), 0, 0);
	const cvs = document.createElement('canvas');
	const ctx = cvs.getContext('2d');
	[cvs.width, cvs.height] = [tW, tH];
	ctx.drawImage(charCvs, 0, 0, cvs.width, cvs.height);
	data = ctx.getImageData(0, 0, cvs.width, cvs.height).data;
	data = ocr.rgba2gray(data);
	logImage(data);
	document.body.appendChild(charCvs);
	document.body.appendChild(cvs);
}
// ocrDebug([
// 	255, 255, 255, 
// 	0, 255, 0, 
// 	0, 0, 0
// ], [3, 3], [5, 5]);