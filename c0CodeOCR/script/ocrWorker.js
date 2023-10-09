/*
 * 2023 © MaoHuPi
 * 以Worker形式調用ocr.js
 * c0CodeOCR > script > ocrWorker.js
 */

self.importScripts('load.js');
self.importScripts('statistics.js');
self.importScripts('ocr.js');

let ocr;

self.onmessage = event => {
	let operate = event.data.operate;
	let parameter = event.data.parameter;
	switch(operate){
		case 'init':
			ocr = new OCR({
				fontCanvas: parameter[0], 
				detectCanvas: parameter[1], 
				wasmPath: 'ocr.wasm'
			});
			break;
		case 'ocrProcess_v1':
		case 'ocrProcess_v2':
			try{
				ocr.importProperty(parameter[0]);
				self.postMessage({
					state: 'done', 
					result: [ocr[operate](parameter[1], parameter[2], parameter[3], progressRate => {
						self.postMessage({
							state: 'progress', 
							result: [progressRate], 
						});
					})], 
				});
			}
			catch(error){
				self.postMessage({
					state: 'error', 
					result: [error], 
				});
			}
			break;
	}
};