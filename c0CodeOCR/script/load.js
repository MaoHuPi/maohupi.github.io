/*
 * 2023 © MaoHuPi
 * 資源載入函式
 * c0CodeOCR > script > load.js
 */

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

function loadWasm(url, importObject = {}){
	return new Promise(solve => {
		WebAssembly.instantiateStreaming(fetch(url), importObject)
		.then(obj => {
			solve(obj);
		});
	});
}