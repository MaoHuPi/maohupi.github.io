/*
 * 2023 © MaoHuPi
 * OCR功能整合之物件
 * c0CodeOCR > script > ocr.js
 */

class OCR {
	#copyPropertyNames = ['samplingLevel', 'fontDataRange', 'codeLanguage', 'caseData', 'replaceData', 'fontData'];
	constructor(data = {}){
		data = {...{
			samplingLevel: 64, 
			fontDataRange: {}, 
			codeLanguage: 'cpp', 
			caseData: '', 
			replaceData: '', 
			fontData: {}, 
			fontCanvas: undefined, 
			detectCanvas: undefined, 
			wasmPath: 'ocr.wasm'
		}, ...data};
		this.samplingLevel = data.samplingLevel;
		this.fontDataRange = data.fontDataRange;
		this.codeLanguage = data.codeLanguage;
		this.caseData = data.caseData;
		this.replaceData = data.replaceData;
		this.fontData = data.fontData;
		this.fontCanvas = data.fontCanvas !== undefined ? data.fontCanvas : document.createElement('canvas');
		this.detectCanvas = data.detectCanvas !== undefined ? data.detectCanvas : document.createElement('canvas');
		this.ocrWasm = undefined;
		(async () => {
			this.ocrWasm = (await loadWasm(data.wasmPath, {console, Math})).instance.exports;
		})();
	}
	copyProperty(ocrObject){
		for(let propertyName of this.#copyPropertyNames){
			this[propertyName] = ocrObject[propertyName];
		}
	}
	exportProperty(){
		var ocrProperty = {};
		for(let propertyName of this.#copyPropertyNames){
			ocrProperty[propertyName] = this[propertyName];
		}
		return ocrProperty;
	}
	importProperty(ocrProperty){
		for(let propertyName of this.#copyPropertyNames){
			if(propertyName in ocrProperty){
				this[propertyName] = ocrProperty[propertyName];
			}
		}
	}
	setData(data, dataPtr, reserveMemoryLength){
		this.ocrWasm.reserveMemory(reserveMemoryLength);
		new Uint8Array(this.ocrWasm.imageData.buffer).set(new Uint8Array(new Uint32Array([data.byteLength]).buffer), dataPtr);
		new Uint8Array(this.ocrWasm.imageData.buffer).set(new Uint8Array(data), dataPtr + 4);
		return dataPtr;
	}
	rgba2gray(data){
		if(!Number.isInteger(data)) data = this.setData(data, 0, 4 + data.byteLength);
		let resultPtr = this.ocrWasm.rgba2gray(data);
		let resultLength = new Uint32Array(new Uint8Array(this.ocrWasm.imageData.buffer).slice(resultPtr, resultPtr + 4).buffer)[0];
		return new Uint8ClampedArray(this.ocrWasm.imageData.buffer).slice(resultPtr + 4, resultPtr + 4 + resultLength);
	}
	gray2rgba(data){
		return new Uint8ClampedArray([...data].map(n => [n, n, n, 255]).flat());
	}
	cutImage(data, width, height, cX, cY, cW, cH, channelAmount){
		if(!Number.isInteger(data)) data = this.setData(data, 0, 4 + data.byteLength + 4 + cW*cH*channelAmount);
		let resultPtr = this.ocrWasm.cutImage(data, width, height, cX, cY, cW, cH, channelAmount);
		let resultLength = new Uint32Array(new Uint8Array(this.ocrWasm.imageData.buffer).slice(resultPtr, resultPtr + 4).buffer)[0];
		return new Uint8ClampedArray(this.ocrWasm.imageData.buffer).slice(resultPtr + 4, resultPtr + 4 + resultLength);
	}
	stretchImage(data, width, height, tW, tH, channelAmount){
		if(!Number.isInteger(data)) data = this.setData(data, 0, 4 + data.byteLength + 4 + tW*tH*channelAmount);
		let resultPtr = this.ocrWasm.stretchImage(data, width, height, tW, tH, channelAmount);
		let resultLength = new Uint32Array(new Uint8Array(this.ocrWasm.imageData.buffer).slice(resultPtr, resultPtr + 4).buffer)[0];
		return new Uint8ClampedArray(this.ocrWasm.imageData.buffer).slice(resultPtr + 4, resultPtr + 4 + resultLength);
	}
	getDifferentPoints(data, width, height, channelAmount, axis = 'x'){
		var axisIsX = axis.toLowerCase() == 'x';
		if(!Number.isInteger(data)) data = this.setData(data, 0, 4 + data.byteLength + 4 + (axisIsX ? width : height));
		let resultPtr = (axisIsX ? this.ocrWasm.getDifferentPointsX : this.ocrWasm.getDifferentPointsY)(data, width, height, channelAmount);
		let resultLength = new Uint32Array(new Uint8Array(this.ocrWasm.imageData.buffer).slice(resultPtr, resultPtr + 4).buffer)[0];
		return [...new Uint8Array(this.ocrWasm.imageData.buffer).slice(resultPtr + 4, resultPtr + 4 + resultLength)];
	}
	getCharData(data, width, height, samplingLevel){
		let dataPtr = 0;
		this.setData(data, dataPtr, Math.max(
			4 + data.byteLength, 
			4 + data.byteLength/4 + 4 + Math.max(width, height), 
			(4 + data.byteLength/4)*2 + 4 + samplingLevel*samplingLevel
		));
		this.ocrWasm.rgba2gray(dataPtr, width, height);
		let dPX = this.getDifferentPoints(dataPtr, width, height, 1, 'x');
		let dPY = this.getDifferentPoints(dataPtr, width, height, 1, 'y');
		if(dPX.length == 0) dPX.push(0);
		if(dPY.length == 0) dPY.push(0);
		if(dPX.length == 1) dPX.push(width);
		if(dPY.length == 1) dPY.push(height);
		let dPX_l = dPX.length-1;
		let dPY_l = dPY.length-1;
		let imageRect = [dPX[0], dPY[0], dPX[dPX_l]-dPX[0], dPY[dPY_l]-dPY[0]];
		dataPtr = this.ocrWasm.cutImage(dataPtr, width, height, ...imageRect, 1);
		// dataPtr = this.ocrWasm.stretchImage(dataPtr, imageRect[2], imageRect[3], samplingLevel, samplingLevel, 1);
		var resultLength = new Uint32Array(new Uint8Array(this.ocrWasm.imageData.buffer).slice(dataPtr, dataPtr + 4).buffer)[0];
		data = new Uint8Array(this.ocrWasm.imageData.buffer).slice(dataPtr + 4, dataPtr + 4 + resultLength);

		this.fontCanvas.width = imageRect[2];
		this.fontCanvas.height = imageRect[3];
		this.fontCanvas.getContext('2d').putImageData(new ImageData(this.gray2rgba(data), imageRect[2], imageRect[3]), 0, 0);
		const cvs = this.detectCanvas;
		const ctx = this.detectCanvas.getContext('2d');
		[cvs.width, cvs.height] = [samplingLevel, samplingLevel];
		ctx.drawImage(this.fontCanvas, 
			// dPX[0], dPY[0], dPX[dPX_l]-dPX[0], dPY[dPY_l]-dPY[0], 
			0, 0, cvs.width, cvs.height
		);
		data = ctx.getImageData(0, 0, cvs.width, cvs.height).data;
		data = this.rgba2gray(data);

		let max = 0, min = 255, charData = [];
		for(let i = 0; i < data.length; i += 1){
			let pixelValue = data[i];
			if(pixelValue > max) max = pixelValue;
			if(pixelValue < min) min = pixelValue;
			charData.push(pixelValue);
		}
		if(min == max){
			charData.fill(0);
		}
		else{
			for(let i = 0; i < charData.length; i++){
				charData[i] = (charData[i] - min)/(max - min)*255;
				charData[i] = charData[i] > 125 ? 255-(255-charData[i])*0.5 : charData[i]*0.5; // 不完全型二值化，用於減少元圖像像素代少所導致的「縮放結果方角化」問題，使得大小寫p能正常辨識。
			}
		}
		let charM = Math.atan2(dPY[dPY_l]-dPY[0], dPX[dPX_l]-dPX[0]);
		return {data: charData, m: charM, heightRate: (dPY[dPY_l]-dPY[0])/height};
	}
	ocrProcess_v1(data, width, height, progressRateFunction = () => {}){
		let detectCount = 0;
		let detectChar = (data, width, height) => {
			if(data.length == 0){console.error('1')}
			let charData = this.getCharData(data, width, height, this.samplingLevel);
			let deltaData = [];
			for(let fontName in this.fontData){
				for(let char in this.fontData[fontName]){
					let compCharData = this.fontData[fontName][char];
					var dataDelta = charData.data.map((n, i) => Math.abs(compCharData.data[i] - n)).reduce((s, n) => s+n)/charData.data.length/255;
					var mDelta = Math.abs(charData.m - compCharData.m)/(Math.PI/2);
					var x = 0.5;
					deltaData.push([`${fontName}%comma%${char}`, dataDelta*x + mDelta*(1-x)]);
				}
			}
			deltaData = deltaData.filter(l => !isNaN(l[1]));
			let deltaMin = Math.min(...deltaData.map(l => l[1]));
			let usableChars = deltaData.filter(l => l[1] <= deltaMin+0.04).sort((l1, l2) => l1[1] - l2[1]);
			let resemblanceChar = usableChars[0];
			resemblanceChar = resemblanceChar[0].split('%comma%');
			detectCount++;
	
			// if(this.debugMode){
			// 	function renderDebugImage(){
			// 		const cvs = debugCanvas;
			// 		const ctx = cvs.getContext('2d');
			// 		width = this.samplingLevel + 10*2;
			// 		height = (this.samplingLevel + 10)*(usableChars.length+1) + 10;
					
			// 		for(let i = -1; i < usableChars.length; i++){
			// 			if(i != -1){
			// 				let charPath = usableChars[i][0].split('%comma%');
			// 				charData = this.fontData[charPath[0]][charPath[1]];
			// 			}
			// 			let imageData = ctx.getImageData(10, 10 + (this.samplingLevel + 10)*(i+1), this.samplingLevel, this.samplingLevel);
			// 			for(let j = 0; j < charData.data.length; j++){
			// 				imageData.data[j*4] = imageData.data[j*4+1] = imageData.data[j*4+2] = charData.data[j];
			// 				imageData.data[j*4+3] = 255;
			// 			}
			// 			ctx.putImageData(imageData, 10, 10 + (this.samplingLevel + 10)*(i+1));
			// 		}
			// 	}
			// 	if(detectCount == 1/*50*/){
			// 		renderDebugImage();
			// 	}
			// }
	
			return resemblanceChar[1];
		}
		// const ctx = cvs.getContext('2d');
		// let data = ctx.getImageData(0, 0, width, height).data;
		let differentPointsY = [];
		let lastLineEmpty = true;
		for(let r = 0; r < height; r++){
			let emptyCount = 0;
			for(let c = 0; c < width; c++){
				let pixelDataLocation = 4*(width*r + c);
				let pixelData = data.slice(pixelDataLocation, pixelDataLocation + 4);
				if((pixelData[0] + pixelData[1] + pixelData[2])/3 >= 200){
					emptyCount++;
				}
			}
			let thisLineEmpty = emptyCount == width;
			if(lastLineEmpty !== thisLineEmpty){
				lastLineEmpty = thisLineEmpty;
				differentPointsY.push(r);
			}
		}
		if(differentPointsY.length%2 == 1){
			differentPointsY.push(height);
		}
		let linesY = [];
		let linesCharsX = [];
		for(let i = 0; i < differentPointsY.length; i += 2){
			if(differentPointsY[i+1] - differentPointsY[i] <= 3) continue; // 過濾雜線
			linesY.push([differentPointsY[i], differentPointsY[i+1]]);
			let differentPointsX = [];
			let lineStart = differentPointsY[i], lineEnd = differentPointsY[i+1], lineHeight = lineEnd - lineStart;
			let lastLineEmpty = true;
			for(let c = 0; c < width; c++){
				let emptyCount = 0;
				for(let r = lineStart; r < lineEnd; r++){
					let pixelDataLocation = 4*(width*r + c);
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
				differentPointsX.push(width);
			}
			let charsX = [];
			for(let i = 0; i < differentPointsX.length; i += 2){
				if(differentPointsX[i+1] - differentPointsX[i] <= 1) continue; // 過濾雜線
				charsX.push([differentPointsX[i], differentPointsX[i+1]]);
			}
			linesCharsX.push(charsX);
		}
	
		let codeContent = [];
		let lineHeightAv = linesY.length > 1 ? Statistics.average(Statistics.inlier(new Array(linesY.length-1).fill(0).map((n, i) => linesY[i+1][0] - linesY[i][0]))) : linesY[0][1] - linesY[0][0];
		var charWidthData = linesCharsX.map(lCData => lCData.length > 1 ? new Array(lCData.length-1).fill(0).map((n, i) => lCData[i+1][0] - lCData[i][0]) : lCData[0][1] - lCData[0][0]).flat();
		let charWidthAv = charWidthData.length > 1 ? Statistics.average(Statistics.inlier(charWidthData)) : 0;
		let leftmostPoint = Math.min(...[].concat(...linesCharsX).map(cData => cData[0]));

		let progressAmount = linesY.map((n, i) => linesCharsX[i].length).reduce((s, n) => s+n);
		let progressCount = 0;
		for(let l = 0; l < linesY.length; l++){
			// ctx.fillStyle = '#0000ff22';
			// ctx.fillRect(0, linesY[l][0], width, linesY[l][1] - linesY[l][0]);
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
				let charRect = [linesCharsX[l][c][0], linesY[l][0], linesCharsX[l][c][1]-linesCharsX[l][c][0], linesY[l][1] - linesY[l][0]];
				codeLine += detectChar(this.cutImage(data, width, height, ...charRect, 4), charRect[2], charRect[3]);
				progressCount++;
				progressRateFunction(progressCount/progressAmount);
	
				// if(this.debugMode){
				// 	ctx.strokeStyle = '#00ff00';
				// 	ctx.strokeRect(...charRect);
				// }
			}
			codeContent.push(codeLine);
		}
		codeContent = codeContent.join('\n');
		for(let replaceRule of this.replaceData){
			codeContent = codeContent.replace(new RegExp(replaceRule[0], 'g'), replaceRule[1]);
		}
		for(let caseRule of this.caseData){
			codeContent = codeContent.replace(new RegExp(caseRule, 'gi'), caseRule);
		}
		return codeContent;
	}
	ocrProcess_v2(data, width, height, progressRateFunction = () => {}){
		// const ctx = cvs.getContext('2d');
		// let data = ctx.getImageData(0, 0, cvs.width, cvs.height).data;
		let differentPointsY = [];
		let lastLineEmpty = true;
		for(let r = 0; r < height; r++){
			let emptyCount = 0;
			for(let c = 0; c < width; c++){
				let pixelDataLocation = 4*(width*r + c);
				let pixelData = data.slice(pixelDataLocation, pixelDataLocation + 4);
				if((pixelData[0] + pixelData[1] + pixelData[2])/3 >= 200){
					emptyCount++;
				}
			}
			let thisLineEmpty = emptyCount == width;
			if(lastLineEmpty !== thisLineEmpty){
				lastLineEmpty = thisLineEmpty;
				differentPointsY.push(r);
			}
		}
		if(differentPointsY.length%2 == 1){
			differentPointsY.push(height);
		}
		let linesY = [];
		let linesCharsX = [];
		for(let i = 0; i < differentPointsY.length; i += 2){
			if(differentPointsY[i+1] - differentPointsY[i] <= 3) continue; // 過濾雜線
			linesY.push([differentPointsY[i], differentPointsY[i+1]]);
			let differentPointsX = [];
			let lineStart = differentPointsY[i], lineEnd = differentPointsY[i+1], lineHeight = lineEnd - lineStart;
			let lastLineEmpty = true;
			for(let c = 0; c < width; c++){
				let emptyCount = 0;
				for(let r = lineStart; r < lineEnd; r++){
					let pixelDataLocation = 4*(width*r + c);
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
				differentPointsX.push(width);
			}
			let charsX = [];
			for(let i = 0; i < differentPointsX.length; i += 2){
				if(differentPointsX[i+1] - differentPointsX[i] <= 1) continue; // 過濾雜線
				charsX.push([differentPointsX[i], differentPointsX[i+1]]);
			}
			linesCharsX.push(charsX);
		}
	
		let codeContent = [];
		let lineHeightAv = linesY.length > 1 ? Statistics.average(Statistics.inlier(new Array(linesY.length-1).fill(0).map((n, i) => linesY[i+1][0] - linesY[i][0]))) : linesY[0][1] - linesY[0][0];
		var charWidthData = linesCharsX.map(lCData => lCData.length > 1 ? new Array(lCData.length-1).fill(0).map((n, i) => lCData[i+1][0] - lCData[i][0]) : lCData[0][1] - lCData[0][0]).flat();
		let charWidthAv = charWidthData.length > 1 ? Statistics.average(Statistics.inlier(charWidthData)) : 0;
		let leftmostPoint = Math.min(...[].concat(...linesCharsX).map(cData => cData[0]));
	
		let progressAmount = linesY.map((n, i) => linesCharsX[i].length).reduce((s, n) => s+n);
		let progressCount = 0;
		for(let l = 0; l < linesY.length; l++){
			// ctx.fillStyle = '#0000ff22';
			// ctx.fillRect(0, linesY[l][0], width, linesY[l][1] - linesY[l][0]);
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
				let charRect = [linesCharsX[l][c][0], linesY[l][0], linesCharsX[l][c][1]-linesCharsX[l][c][0], linesY[l][1] - linesY[l][0]];
				let widthData = new Array(linesCharsX[l].length - c).fill(0)
					.map((n, i) => linesCharsX[l][c+i][1]-linesCharsX[l][c][0]);
				let deltaData = [];
				function getI(compCharData){
					var targetWidth = lineHeightAv*compCharData.heightRate/Math.tan(compCharData.m);
					var deltaWidthData = widthData.map(n => Math.abs(targetWidth - n));
					var i = deltaWidthData.indexOf(Math.min(...deltaWidthData.filter(n => !Number.isNaN(n))));
					return i;
				}
				for(let fontName in this.fontData){
					for(let char in this.fontData[fontName]){
						let compCharData = this.fontData[fontName][char];
						var i = getI(compCharData);
						var newCharRect = [charRect[0], charRect[1], linesCharsX[l][c+i][1]-linesCharsX[l][c][0], charRect[3]];
						let charData =  this.cutImage(data, width, height, ...newCharRect, 4);
						charData = this.getCharData(charData, newCharRect[2], newCharRect[3], this.samplingLevel);
						var dataDelta = charData.data.map((n, i) => Math.abs(compCharData.data[i] - n)).reduce((s, n) => s+n)/charData.data.length/255;
						var mDelta = Math.abs(charData.m - compCharData.m)/(Math.PI/2);
						var x = 0.5;
						deltaData.push([`${fontName}%comma%${char}`, dataDelta*x + mDelta*(1-x)]);
					}
				}
				deltaData = deltaData.filter(l => !isNaN(l[1]));
				let deltaMin = Math.min(...deltaData.map(l => l[1]));
				let usableChars = deltaData.filter(l => l[1] <= deltaMin+0.04).sort((l1, l2) => l1[1] - l2[1]);
				let resemblanceChar = usableChars[0];
				resemblanceChar = resemblanceChar[0].split('%comma%');
				var I = getI(this.fontData[resemblanceChar[0]][resemblanceChar[1]]);
				c += I;
				
				codeLine += resemblanceChar[1];
				progressCount += I+1;
				progressRateFunction(progressCount/progressAmount);
			}
			codeContent.push(codeLine);
		}
		codeContent = codeContent.join('\n');
		for(let replaceRule of this.replaceData){
			codeContent = codeContent.replace(new RegExp(replaceRule[0], 'g'), replaceRule[1]);
		}
		for(let caseRule of this.caseData){
			codeContent = codeContent.replace(new RegExp(caseRule, 'gi'), caseRule);
		}
		return codeContent;
	}
}