/*
 * 2023 © MaoHuPi
 * OCR WASM調用
 * c0CodeOCR > script > ocr.js
 */

let ocrWasm;
(async () => {
	ocrWasm = (await loadWasm('script/ocr.wasm', {console})).instance.exports;
})();

class OCR {
	// constructor(data = {}){
	// 	data = {...{
	// 		samplingLevel: 64, 
	// 		fontDataRange: {}, 
	// 		codeLanguage: 'cpp', 
	// 	}, ...data};
	// 	this.samplingLevel = data.samplingLevel;
	// 	this.fontDataRange = {};
	// 	this.codeLanguage = 'cpp';
	// 	this.fontData = {};
	// }
	static setData(data, dataPtr, reserveMemoryLength){
		ocrWasm.reserveMemory(reserveMemoryLength);
		new Uint8Array(ocrWasm.imageData.buffer).set(new Uint8Array(new Uint32Array([data.byteLength]).buffer), dataPtr);
		new Uint8Array(ocrWasm.imageData.buffer).set(new Uint8Array(data), dataPtr + 4);
		return dataPtr;
	}
	static rgba2gray(data, width, height){
		if(!Number.isInteger(data)) data = OCR.setData(data, 0, 4 + data.byteLength);
		let resultPtr = ocrWasm.rgba2gray(data, width, height);
		let resultLength = new Uint32Array(new Uint8Array(ocrWasm.imageData.buffer).slice(resultPtr, resultPtr + 4).buffer)[0];
		return new Uint8ClampedArray(ocrWasm.imageData.buffer).slice(resultPtr + 4, resultPtr + 4 + resultLength);
	}
	static cutImage(data, width, height, cX, cY, cW, cH, channelAmount){
		if(!Number.isInteger(data)) data = OCR.setData(data, 0, 4 + data.byteLength + 4 + cW*cH*channelAmount);
		let resultPtr = ocrWasm.cutImage(data, width, height, cX, cY, cW, cH, channelAmount);
		let resultLength = new Uint32Array(new Uint8Array(ocrWasm.imageData.buffer).slice(resultPtr, resultPtr + 4).buffer)[0];
		return new Uint8ClampedArray(ocrWasm.imageData.buffer).slice(resultPtr + 4, resultPtr + 4 + resultLength);
	}
	static stretchImage(data, width, height, tW, tH, channelAmount){
		if(!Number.isInteger(data)) data = OCR.setData(data, 0, 4 + data.byteLength + 4 + tW*tH*channelAmount);
		let resultPtr = ocrWasm.stretchImage(data, width, height, tW, tH, channelAmount);
		let resultLength = new Uint32Array(new Uint8Array(ocrWasm.imageData.buffer).slice(resultPtr, resultPtr + 4).buffer)[0];
		return new Uint8ClampedArray(ocrWasm.imageData.buffer).slice(resultPtr + 4, resultPtr + 4 + resultLength);
	}
	static getDifferentPoints(data, width, height, channelAmount, axis = 'x'){
		var axisIsX = axis.toLowerCase() == 'x';
		if(!Number.isInteger(data)) data = OCR.setData(data, 0, 4 + data.byteLength + 4 + (axisIsX ? width : height));
		let resultPtr = (axisIsX ? ocrWasm.getDifferentPointsX : ocrWasm.getDifferentPointsY)(data, width, height, channelAmount);
		let resultLength = new Uint32Array(new Uint8Array(ocrWasm.imageData.buffer).slice(resultPtr, resultPtr + 4).buffer)[0];
		return [...new Uint8Array(ocrWasm.imageData.buffer).slice(resultPtr + 4, resultPtr + 4 + resultLength)];
	}
	static getCharData(data, width, height, samplingLevel){
		let charCvs = document.createElement('canvas');
		charCvs.width = width;
		charCvs.height = height;
		charCvs.getContext('2d').putImageData(new ImageData(new Uint8ClampedArray(data), width, height), 0, 0);

		let dataPtr = 0;
		OCR.setData(data, dataPtr, Math.max(
			4 + data.byteLength, 
			4 + data.byteLength/4 + 4 + Math.max(width, height), 
			(4 + data.byteLength/4)*2 + 4 + samplingLevel*samplingLevel
		));
		ocrWasm.rgba2gray(dataPtr, width, height);
		let dPX = OCR.getDifferentPoints(dataPtr, width, height, 1, 'x');
		let dPY = OCR.getDifferentPoints(dataPtr, width, height, 1, 'y');
		if(dPX.length == 0) dPX.push(0);
		if(dPY.length == 0) dPY.push(0);
		if(dPX.length == 1) dPX.push(width);
		if(dPY.length == 1) dPY.push(height);
		let dPX_l = dPX.length-1;
		let dPY_l = dPY.length-1;

		const cvs = detectCanvas;
		const ctx = detectCanvas.getContext('2d');
		[cvs.width, cvs.height] = [options.samplingLevel, options.samplingLevel];
		ctx.drawImage(charCvs, 
			dPX[0], dPY[0], dPX[dPX_l]-dPX[0], dPY[dPY_l]-dPY[0], 
			0, 0, cvs.width, cvs.height
		);
		data = ctx.getImageData(0, 0, cvs.width, cvs.height).data;
		data = OCR.rgba2gray(data, cvs.width, cvs.height);

		// let imageRect = [dPX[0], dPY[0], dPX[dPX_l]-dPX[0], dPY[dPY_l]-dPY[0]];
		// dataPtr = ocrWasm.cutImage(dataPtr, width, height, ...imageRect, 1);
		// dataPtr = ocrWasm.stretchImage(dataPtr, imageRect[2], imageRect[3], samplingLevel, samplingLevel, 1);
		// var resultLength = new Uint32Array(new Uint8Array(ocrWasm.imageData.buffer).slice(dataPtr, dataPtr + 4).buffer)[0];
		// data = new Uint8Array(ocrWasm.imageData.buffer).slice(dataPtr + 4, dataPtr + 4 + resultLength);
		
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
				charData[i] = charData[i] > 127.5 ? 255-(255-charData[i])*0.5 : charData[i]*0.5; // 不完全型二值化，用於減少元圖像像素代少所導致的「縮放結果方角化」問題，使得大小寫p能正常辨識。
			}
		}
		let charM = Math.atan2(dPY[dPY_l]-dPY[0], dPX[dPX_l]-dPX[0]);
		return {data: charData, m: charM, heightRate: (dPY[dPY_l]-dPY[0])/height};
	}
}