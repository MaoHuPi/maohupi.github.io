/*
 * 2023 © MaoHuPi
 * 頁面基本功能
 * c0CodeOCR > script > main.js
 */

const debugMode = true;
const options = {
	samplingLevel: 64, 
	fontName: '', 
	fontDataRange: '', 
	codeLanguage: 'cpp'
};
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

// function getDifferentPointsX(cvs){
// 	return OCR.getDifferentPoints(cvs.getContext('2d').getImageData(0, 0, cvs.width, cvs.height).data, cvs.width, cvs.height, 'x');
// }
// function getDifferentPointsY(cvs){
// 	return OCR.getDifferentPoints(cvs.getContext('2d').getImageData(0, 0, cvs.width, cvs.height).data, cvs.width, cvs.height, 'y');
// }
function getDifferentPointsX(cvs){
	let data = cvs.getContext('2d').getImageData(0, 0, cvs.width, cvs.height).data;
	let differentPointsX = [];
	let lastLineEmpty = true;
	for(let c = 0; c < cvs.width; c++){
		let emptyCount = 0;
		for(let r = 0; r < cvs.height; r++){
			let pixelDataLocation = 4*(cvs.width*r + c);
			let pixelData = data.slice(pixelDataLocation, pixelDataLocation + 4);
			if((pixelData[0] + pixelData[1] + pixelData[2])/3 >= 127.5){
				emptyCount++;
			}
		}
		let thisLineEmpty = emptyCount == cvs.height;
		if(lastLineEmpty !== thisLineEmpty){
			lastLineEmpty = thisLineEmpty;
			differentPointsX.push(c);
		}
	}
	if(differentPointsX.length%2 == 1){
		differentPointsX.push(cvs.width);
	}
	return differentPointsX;
}
function getDifferentPointsY(cvs){
	let data = cvs.getContext('2d').getImageData(0, 0, cvs.width, cvs.height).data;
	let differentPointsY = [];
	let lastLineEmpty = true;
	for(let r = 0; r < cvs.height; r++){
		let emptyCount = 0;
		for(let c = 0; c < cvs.width; c++){
			let pixelDataLocation = 4*(cvs.width*r + c);
			let pixelData = data.slice(pixelDataLocation, pixelDataLocation + 4);
			if((pixelData[0] + pixelData[1] + pixelData[2])/3 >= 127.5){
				emptyCount++;
			}
		}
		let thisLineEmpty = emptyCount == cvs.width;
		if(lastLineEmpty !== thisLineEmpty){
			lastLineEmpty = thisLineEmpty;
			differentPointsY.push(r);
		}
	}
	if(differentPointsY.length%2 == 1){
		differentPointsY.push(cvs.height);
	}
	return differentPointsY;
}

const fontCanvas = document.createElement('canvas');
const detectCanvas = document.createElement('canvas');
let debugCanvas;
if(debugMode){
	debugCanvas = document.createElement('canvas');
	document.getElementById('bottomBox').appendChild(debugCanvas);
}
const fontData = {};

function getCharData(charCvs){
	let dPX = getDifferentPointsX(charCvs);
	let dPY = getDifferentPointsY(charCvs);
	if(dPX.length == 0) dPX.push(0);
	if(dPY.length == 0) dPY.push(0);
	if(dPX.length == 1) dPX.push(charCvs.width);
	if(dPY.length == 1) dPY.push(charCvs.height);
	let dPX_l = dPX.length-1;
	let dPY_l = dPY.length-1;
	const cvs = detectCanvas;
	const ctx = detectCanvas.getContext('2d');
	[cvs.width, cvs.height] = [options.samplingLevel, options.samplingLevel];
	ctx.drawImage(charCvs, 
		dPX[0], dPY[0], dPX[dPX_l]-dPX[0], dPY[dPY_l]-dPY[0], 
		0, 0, cvs.width, cvs.height
	);
	let data = ctx.getImageData(0, 0, cvs.width, cvs.height).data;
	let max = 0, min = 255, charData = [];
	for(let i = 0; i < data.length; i += 4){
		let pixelValue = (data[i] + data[i+1] + data[i+2])/3;
		if(pixelValue > max) max = pixelValue;
		if(pixelValue < min) min = pixelValue;
		charData.push(pixelValue);
	}
	for(let i = 0; i < charData.length; i++){
		charData[i] = (charData[i] - min)/(max - min)*255;
		charData[i] = charData[i] > 127.5 ? 255-(255-charData[i])*0.5 : charData[i]*0.5; // 不完全型二值化，用於減少元圖像像素代少所導致的「縮放結果方角化」問題，使得大小寫p能正常辨識。
	}
	let charM = Math.atan2(dPY[dPY_l]-dPY[0], dPX[dPX_l]-dPX[0]);
	return {data: charData, m: charM, heightRate: (dPY[dPY_l]-dPY[0])/charCvs.height};
}

const fontWholeHeightData = {};
function makeFontData(fontName, fontDecorations, rangeData){
	const cvs = fontCanvas;
	const ctx = fontCanvas.getContext('2d');
	let fontKey = fontDecorations !== undefined ? `${fontName}-${fontDecorations.join(',')}` : fontName;
	fontData[fontKey] = [];
	fontData[`${fontKey}_invert`] = [];

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
		fontData[fontKey][text] = getCharData(cvs);
		fontData[`${fontKey}_invert`][text] = {...fontData[fontKey][text], data: fontData[fontKey][text].data.map(n => 255 - n)};
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
		cvs.width = options.samplingLevel + 10*2;
		cvs.height = options.samplingLevel + 10*2;
		let charData = fontData[font][charName];
		let imageData = ctx.getImageData(10, 10, options.samplingLevel, options.samplingLevel);
		for(let j = 0; j < charData.data.length; j++){
			imageData.data[j*4] = imageData.data[j*4+1] = imageData.data[j*4+2] = charData.data[j];
			imageData.data[j*4+3] = 255;
		}
		ctx.putImageData(imageData, 10, 10);
	}
}

function ocrProcess_v1(cvs){
	let detectCount = 0;
	function detectChar(charCvs){
		let charData = getCharData(charCvs);
		let deltaData = [];
		for(let fontName in fontData){
			for(let char in fontData[fontName]){
				let compCharData = fontData[fontName][char];
				var dataDelta = charData.data.map((n, i) => Math.abs(compCharData.data[i] - n)).reduce((s, n) => s+n)/charData.data.length/255;
				var mDelta = Math.abs(charData.m - compCharData.m)/(Math.PI/2);
				var x = 0.5;
				deltaData.push([`${fontName}%comma%${char}`, dataDelta*x + mDelta*(1-x)]);
			}
		}
		// console.log(charData);
		deltaData = deltaData.filter(l => !isNaN(l[1]));
		let deltaMin = Math.min(...deltaData.map(l => l[1]));
		let usableChars = deltaData.filter(l => l[1] <= deltaMin+0.04).sort((l1, l2) => l1[1] - l2[1]);

		usableCount = {};
		for(let char of usableChars.map(s => s[0].split('%comma%')[1])){
			if(usableCount[char] === undefined){
				usableCount[char] = 0;
			}
			usableCount[char]++;
		}

		// console.log(usableChars.map(s => `${s[0].split('%comma%')[1]} ${s[1]}`).join(' '));
		// let resemblanceChar = usableChars[Math.floor(usableChars.length * Math.random())];
		let resemblanceChar = usableChars[0];
		resemblanceChar = resemblanceChar[0].split('%comma%');
		detectCount++;

		if(debugMode){
			function renderDebugImage(){
				const cvs = debugCanvas;
				const ctx = cvs.getContext('2d');
				cvs.width = options.samplingLevel + 10*2;
				cvs.height = (options.samplingLevel + 10)*(usableChars.length+1) + 10;
				
				for(let i = -1; i < usableChars.length; i++){
					if(i != -1){
						let charPath = usableChars[i][0].split('%comma%');
						charData = fontData[charPath[0]][charPath[1]];
					}
					let imageData = ctx.getImageData(10, 10 + (options.samplingLevel + 10)*(i+1), options.samplingLevel, options.samplingLevel);
					for(let j = 0; j < charData.data.length; j++){
						imageData.data[j*4] = imageData.data[j*4+1] = imageData.data[j*4+2] = charData.data[j];
						imageData.data[j*4+3] = 255;
					}
					ctx.putImageData(imageData, 10, 10 + (options.samplingLevel + 10)*(i+1));
				}
			}
			if(detectCount == 1/*50*/){
				renderDebugImage();
			}
		}

		return resemblanceChar[1];
	}

	const ctx = cvs.getContext('2d');
	let data = ctx.getImageData(0, 0, cvs.width, cvs.height).data;
	let differentPointsY = [];
	let lastLineEmpty = true;
	for(let r = 0; r < cvs.height; r++){
		let emptyCount = 0;
		for(let c = 0; c < cvs.width; c++){
			let pixelDataLocation = 4*(cvs.width*r + c);
			let pixelData = data.slice(pixelDataLocation, pixelDataLocation + 4);
			if((pixelData[0] + pixelData[1] + pixelData[2])/3 >= 200){
				emptyCount++;
			}
		}
		let thisLineEmpty = emptyCount == cvs.width;
		if(lastLineEmpty !== thisLineEmpty){
			lastLineEmpty = thisLineEmpty;
			differentPointsY.push(r);
		}
	}
	if(differentPointsY.length%2 == 1){
		differentPointsY.push(cvs.height);
	}
	let linesY = [];
	let linesCharsX = [];
	for(let i = 0; i < differentPointsY.length; i += 2){
		if(differentPointsY[i+1] - differentPointsY[i] <= 3) continue; // 過濾雜線
		linesY.push([differentPointsY[i], differentPointsY[i+1]]);
		let differentPointsX = [];
		let lineStart = differentPointsY[i], lineEnd = differentPointsY[i+1], lineHeight = lineEnd - lineStart;
		let lastLineEmpty = true;
		for(let c = 0; c < cvs.width; c++){
			let emptyCount = 0;
			for(let r = lineStart; r < lineEnd; r++){
				let pixelDataLocation = 4*(cvs.width*r + c);
				let pixelData = data.slice(pixelDataLocation, pixelDataLocation + 4);
				if((pixelData[0] + pixelData[1] + pixelData[2])/3 >= 200){
					emptyCount++;
				}
			}
			let thisLineEmpty = emptyCount == lineHeight;
			if(lastLineEmpty !== thisLineEmpty){
				lastLineEmpty = thisLineEmpty;
				differentPointsX.push(c);
			}
		}
		if(differentPointsX.length%2 == 1){
			differentPointsX.push(cvs.width);
		}
		let charsX = [];
		for(let i = 0; i < differentPointsX.length; i += 2){
			if(differentPointsX[i+1] - differentPointsX[i] <= 1) continue; // 過濾雜線
			charsX.push([differentPointsX[i], differentPointsX[i+1]]);
		}
		linesCharsX.push(charsX);
	}

	const charCvs = document.createElement('canvas');
	const charCtx = charCvs.getContext('2d');
	let codeContent = [];
	let lineHeightAv = linesY.length > 1 ? Statistics.average(Statistics.inlier(new Array(linesY.length-1).fill(0).map((n, i) => linesY[i+1][0] - linesY[i][0]))) : linesY[0][1] - linesY[0][0];
	var charWidthData = linesCharsX.map(lCData => lCData.length > 1 ? new Array(lCData.length-1).fill(0).map((n, i) => lCData[i+1][0] - lCData[i][0]) : lCData[0][1] - lCData[0][0]).flat();
	let charWidthAv = charWidthData.length > 1 ? Statistics.average(Statistics.inlier(charWidthData)) : 0;
	let leftmostPoint = Math.min(...[].concat(...linesCharsX).map(cData => cData[0]));
	
	for(let l = 0; l < linesY.length; l++){
		// ctx.fillStyle = '#0000ff22';
		// ctx.fillRect(0, linesY[l][0], cvs.width, linesY[l][1] - linesY[l][0]);
		if(l != 0){
			var lineGap = linesY[l][0] - linesY[l-1][1];
			if(lineGap > lineHeightAv){
				codeContent.push(...new Array(Math.floor(lineGap/lineHeightAv)).fill(''));
			}
		}
		let codeLine = '';
		for(let c = 0; c < linesCharsX[l].length; c++){
			if(c == 0){
				var charGap = linesCharsX[l][c][0] - leftmostPoint;
				if(charGap > charWidthAv){
					codeLine += new Array(Math.floor(charGap/charWidthAv)).fill(' ').join('');
				}
			}
			else{
				var charGap = linesCharsX[l][c][0] - linesCharsX[l][c-1][1];
				if(charGap > charWidthAv){
					codeLine += new Array(Math.floor(charGap/charWidthAv)).fill(' ').join('');
				}
			}
			let charData = [linesCharsX[l][c][0], linesY[l][0], linesCharsX[l][c][1]-linesCharsX[l][c][0], linesY[l][1] - linesY[l][0]];
			[charCvs.width, charCvs.height] = [charData[2], charData[3]];
			charCtx.drawImage(cvs, -charData[0], -charData[1], cvs.width, cvs.height);
			codeLine += detectChar(charCvs);
			// ctx.strokeStyle = '#00ff00';
			// ctx.strokeRect(...charData); // 此更動會一並影響到detect時的圖像
		}
		codeContent.push(codeLine);
	}
	codeContent = codeContent.join('\n');
	for(let replaceRule of options.replaceData){
		codeContent = codeContent.replace(new RegExp(replaceRule[0], 'g'), replaceRule[1]);
	}
	for(let caseRule of options.caseData){
		codeContent = codeContent.replace(new RegExp(caseRule, 'gi'), caseRule);
	}
	return codeContent;
}
function ocrProcess_v2(cvs){
	const ctx = cvs.getContext('2d');
	let data = ctx.getImageData(0, 0, cvs.width, cvs.height).data;
	let differentPointsY = [];
	let lastLineEmpty = true;
	for(let r = 0; r < cvs.height; r++){
		let emptyCount = 0;
		for(let c = 0; c < cvs.width; c++){
			let pixelDataLocation = 4*(cvs.width*r + c);
			let pixelData = data.slice(pixelDataLocation, pixelDataLocation + 4);
			if((pixelData[0] + pixelData[1] + pixelData[2])/3 >= 200){
				emptyCount++;
			}
		}
		let thisLineEmpty = emptyCount == cvs.width;
		if(lastLineEmpty !== thisLineEmpty){
			lastLineEmpty = thisLineEmpty;
			differentPointsY.push(r);
		}
	}
	if(differentPointsY.length%2 == 1){
		differentPointsY.push(cvs.height);
	}
	let linesY = [];
	let linesCharsX = [];
	for(let i = 0; i < differentPointsY.length; i += 2){
		if(differentPointsY[i+1] - differentPointsY[i] <= 3) continue; // 過濾雜線
		linesY.push([differentPointsY[i], differentPointsY[i+1]]);
		let differentPointsX = [];
		let lineStart = differentPointsY[i], lineEnd = differentPointsY[i+1], lineHeight = lineEnd - lineStart;
		let lastLineEmpty = true;
		for(let c = 0; c < cvs.width; c++){
			let emptyCount = 0;
			for(let r = lineStart; r < lineEnd; r++){
				let pixelDataLocation = 4*(cvs.width*r + c);
				let pixelData = data.slice(pixelDataLocation, pixelDataLocation + 4);
				if((pixelData[0] + pixelData[1] + pixelData[2])/3 >= 200){
					emptyCount++;
				}
			}
			let thisLineEmpty = emptyCount == lineHeight;
			if(lastLineEmpty !== thisLineEmpty){
				lastLineEmpty = thisLineEmpty;
				differentPointsX.push(c);
			}
		}
		if(differentPointsX.length%2 == 1){
			differentPointsX.push(cvs.width);
		}
		let charsX = [];
		for(let i = 0; i < differentPointsX.length; i += 2){
			if(differentPointsX[i+1] - differentPointsX[i] <= 1) continue; // 過濾雜線
			charsX.push([differentPointsX[i], differentPointsX[i+1]]);
		}
		linesCharsX.push(charsX);
	}

	const charCvs = document.createElement('canvas');
	const charCtx = charCvs.getContext('2d');
	let codeContent = [];
	let lineHeightAv = linesY.length > 1 ? Statistics.average(Statistics.inlier(new Array(linesY.length-1).fill(0).map((n, i) => linesY[i+1][0] - linesY[i][0]))) : linesY[0][1] - linesY[0][0];
	var charWidthData = linesCharsX.map(lCData => lCData.length > 1 ? new Array(lCData.length-1).fill(0).map((n, i) => lCData[i+1][0] - lCData[i][0]) : lCData[0][1] - lCData[0][0]).flat();
	let charWidthAv = charWidthData.length > 1 ? Statistics.average(Statistics.inlier(charWidthData)) : 0;
	let leftmostPoint = Math.min(...[].concat(...linesCharsX).map(cData => cData[0]));

	for(let l = 0; l < linesY.length; l++){
		// ctx.fillStyle = '#0000ff22';
		// ctx.fillRect(0, linesY[l][0], cvs.width, linesY[l][1] - linesY[l][0]);
		if(l != 0){
			var lineGap = linesY[l][0] - linesY[l-1][1];
			if(lineGap > lineHeightAv){
				codeContent.push(...new Array(Math.floor(lineGap/lineHeightAv)).fill(''));
			}
		}
		let codeLine = '';
		for(let c = 0; c < linesCharsX[l].length; c++){
			if(c == 0){
				var charGap = linesCharsX[l][c][0] - leftmostPoint;
				if(charGap > charWidthAv){
					codeLine += new Array(Math.floor(charGap/charWidthAv)).fill(' ').join('');
				}
			}
			else{
				var charGap = linesCharsX[l][c][0] - linesCharsX[l][c-1][1];
				if(charGap > charWidthAv){
					codeLine += new Array(Math.floor(charGap/charWidthAv)).fill(' ').join('');
				}
			}
			let charData = [linesCharsX[l][c][0], linesY[l][0], linesCharsX[l][c][1]-linesCharsX[l][c][0], linesY[l][1] - linesY[l][0]];
			let widthData = new Array(linesCharsX[l].length - c).fill(0)
				.map((n, i) => linesCharsX[l][c+i][1]-linesCharsX[l][c][0]);
			let drawChar = compCharData => {
				var targetWidth = lineHeightAv*compCharData.heightRate/Math.tan(compCharData.m);
				var deltaWidthData = widthData.map(n => Math.abs(targetWidth - n));
				var i = deltaWidthData.indexOf(Math.min(...deltaWidthData.filter(n => !Number.isNaN(n))));
				var newCharData = [charData[0], charData[1], linesCharsX[l][c+i][1]-linesCharsX[l][c][0], charData[3]];
				[charCvs.width, charCvs.height] = [newCharData[2], newCharData[3]];
				charCtx.drawImage(cvs, -newCharData[0], -newCharData[1], cvs.width, cvs.height);
				return i;
			};
			let deltaData = [];
			for(let fontName in fontData){
				for(let char in fontData[fontName]){
					let compCharData = fontData[fontName][char];
					drawChar(compCharData);
					let charData = getCharData(charCvs);
					var dataDelta = charData.data.map((n, i) => Math.abs(compCharData.data[i] - n)).reduce((s, n) => s+n)/charData.data.length/255;
					var mDelta = Math.abs(charData.m - compCharData.m)/(Math.PI/2);
					var x = 0.5;
					deltaData.push([`${fontName}%comma%${char}`, dataDelta*x + mDelta*(1-x)]);
					if(c == 2 && ['的', 'b'].includes(char)){ // flagg
						console.log(char, dataDelta*x + mDelta*(1-x), charCvs.width, lineHeightAv*compCharData.heightRate/Math.tan(compCharData.m));
					}
				}
			}
			deltaData = deltaData.filter(l => !isNaN(l[1]));
			let deltaMin = Math.min(...deltaData.map(l => l[1]));
			let usableChars = deltaData.filter(l => l[1] <= deltaMin+0.04).sort((l1, l2) => l1[1] - l2[1]);

			usableCount = {};
			for(let char of usableChars.map(s => s[0].split('%comma%')[1])){
				if(usableCount[char] === undefined){
					usableCount[char] = 0;
				}
				usableCount[char]++;
			}
			let resemblanceChar = usableChars[0];
			resemblanceChar = resemblanceChar[0].split('%comma%');
			c += drawChar(fontData[resemblanceChar[0]][resemblanceChar[1]]);
			
			codeLine += resemblanceChar[1];
		}
		codeContent.push(codeLine);
	}
	codeContent = codeContent.join('\n');
	for(let replaceRule of options.replaceData){
		codeContent = codeContent.replace(new RegExp(replaceRule[0], 'g'), replaceRule[1]);
	}
	for(let caseRule of options.caseData){
		codeContent = codeContent.replace(new RegExp(caseRule, 'gi'), caseRule);
	}
	return codeContent;
}

function loadImage(url){
	return new Promise((resolve, reject) => {
		try{
			let image = new Image();
			// image.crossOrigin = 'Anonymous'; // 僅適用於 Firefox
			image.crossOrigin = undefined; // 不使用 server 載入圖片資源
			image.onload = () => {
				resolve(image);
			};
			image.src = url;
		}
		catch(error){reject(error);}
	});
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
				/* data process */
				if(options.samplingLevel !== inputs.samplingLevel.value || options.fontName !== inputs.fontName.value || options.fontDataRange !== inputs.fontDataRange.value){
					options.samplingLevel = inputs.samplingLevel.value;
					options.fontName = inputs.fontName.value;
					options.fontDataRange = inputs.fontDataRange.value;
					let fontNameList = options.fontName.replace(/ *, */g, ',').split(',');
					let fontDataRange = JSON.parse(options.fontDataRange);
					for(let key in fontData){
						delete fontData[key];
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
				options.codeLanguage = inputs.codeLanguage.value;
				/* OCR */
				const codeRect = document.getElementById('codeRect');
				let rectData = [codeRect['rectDot-left']*cvs.width, codeRect['rectDot-top']*cvs.height, codeRect['rectDot-right']*cvs.width, codeRect['rectDot-bottom']*cvs.height].map(n => Math.floor(n));
				const newCvs = document.createElement('canvas');
				const newCtx = newCvs.getContext('2d');
				newCvs.width = rectData[2] - rectData[0];
				newCvs.height = rectData[3] - rectData[1];
				newCtx.drawImage(cvs, -rectData[0],  -rectData[1]);
				// document.getElementById('bottomBox').appendChild(newCvs);
				let codeContent = ([ocrProcess_v1, ocrProcess_v2][button.id.split('_v')[1] - 1])(newCvs);
				document.getElementById('codeOutput').innerHTML = hljs.highlight(codeContent, {language: options.codeLanguage}).value;
				outputs.push(codeContent);
				alert('Code extraction completed.', 'compleat');
			}
			else alert('Please open an image first!', 'warning');
		});
	});
	
	inputs.downloadCode.addEventListener('click', () => {
		if(cvs.imageLoaded && outputs.length > 0){
			var codeContent = outputs[outputs.length - 1];
			var a = document.createElement('a');
			a.href = URL.createObjectURL(new Blob([codeContent], {type: 'text/plain'}));
			a.download = `result.${options.codeLanguage}`;
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
				options.replaceData = data?.data?.replaceData !== undefined ? data.data.replaceData : [];
				options.caseData = data?.data?.caseData !== undefined ? data.data.caseData : [];
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