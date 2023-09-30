/*
 * 2023 © MaoHuPi
 * OCR功能
 * c0CodeOCR > script > ocr.js
 */

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
	static cutImage(data, width, height, cX, cY, cW, cH){
		data = data.slice(cY*width*4, (cY + cH)*width*4);
		let newData = [];
		for(let i = 0; i < cH; i++){
			newData.push(...data.slice((width*i + cX)*4, (width*i + cX + cW)*4));
		}
		return newData;
	}
	static stretchImage(data, width, height, tW, tH){
		let newData = [];
		for(let h = 0; h < tH; h++){
			for(let w = 0; w < tW; w++){
				// var rW = w/tW*width-0.25, 
				// 	rH = h/tH*height-0.25;
				// var rWn = [Math.floor(rW), Math.ceil(rW)], 
				// 	rHn = [Math.floor(rH),  Math.ceil(rH)], 
				// 	rWR = [1 - rW%1, rW%1], 
				// 	rHR = [1 - rH%1, rH%1];
				// 	for(let c = 0; c < 4; c++){
				// 		let value = 0;
				// 		for(let _h of [0, 1]){
				// 			for(let _w of [0, 1]){
				// 				value += data[(rHn[_h]*width + rWn[_w])*4 + c]*rWR[_w]*rHR[_h]
				// 				console.log(rHn[_h], rWn[_w], c, (rHn[_h]*width + rWn[_w])*4 + c);
				// 			}
				// 		}
				// 		newData.push(Math.round(value));
				// 	}
				var pixelStart = (Math.floor(h/tH*height)*width + Math.floor(w/tW*width))*4;
				newData.push(...data.slice(pixelStart, pixelStart+4));
			}
		}
		return newData;
	}
	static getDifferentPoints(data, width, height, axis = 'x'){
		let axisIsX = axis.toLowerCase() == 'x';
		let differentPoints = [];
		let lastLineEmpty = true;
		for(let c = 0; c < (axisIsX ? width : height); c++){
			let emptyCount = 0;
			for(let r = 0; r < (axisIsX ? height : width); r++){
				let pixelDataLocation = 4*(width*(axisIsX ? r : c) + (axisIsX ? c : r));
				let pixelData = data.slice(pixelDataLocation, pixelDataLocation + 4);
				if((pixelData[0] + pixelData[1] + pixelData[2])/3 >= 127.5){
					emptyCount++;
				}
			}
			let thisLineEmpty = (emptyCount == (axisIsX ? height : width));
			if(lastLineEmpty !== thisLineEmpty){
				lastLineEmpty = thisLineEmpty;
				differentPoints.push(c);
			}
		}
		if(differentPoints.length%2 == 1){
			differentPoints.push((axisIsX ? width : height));
		}
		return differentPoints;
	}
	static getCharData(data, width, height, samplingLevel){
		if(data.length !== width*height*4) console.log('bug');
		let dPX = OCR.getDifferentPoints(data, width, height, 'x');
		let dPY = OCR.getDifferentPoints(data, width, height, 'y');
		if(dPX.length == 0) dPX.push(0);
		if(dPY.length == 0) dPY.push(0);
		if(dPX.length == 1) dPX.push(width);
		if(dPY.length == 1) dPY.push(height);
		let dPX_l = dPX.length-1;
		let dPY_l = dPY.length-1;
		let imageRect = [dPX[0], dPY[0], dPX[dPX_l]-dPX[0], dPY[dPY_l]-dPY[0]];
		data = OCR.cutImage(data, width, height, ...imageRect);
		data = OCR.stretchImage(data, imageRect[2], imageRect[3], samplingLevel, samplingLevel);
		// data = OCR.stretchImage(data, width, height, samplingLevel, samplingLevel);
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
		return {data: charData, m: charM, heightRate: (dPY[dPY_l]-dPY[0])/height};
	}
}