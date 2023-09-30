/*
 * 2023 © MaoHuPi
 * 設定值組合
 * c0CodeOCR > script > preset.js
 */

const presetData = {
	"devcpp-c": {
		"name": "Dev-C++ C", 
		"settings": {
			"codeLanguage": "c", 
			"fontName": "consolas", 
			"fontDataRange": JSON.stringify({
				consolas:{
					'undefined': {
						charCodeRange: [[33, 126]], 
						string: ['&&', '++', 'wh', 'PA', 'fo', 'ff', 'fi', 'fl', 'my', 'et', 're']
					}, 
					'bold': {
						charCodeRange: [[33, 126]], 
						string: ['&&', '++', 'wh', 'PA', 'fo', 'ff', 'fi', 'fl', 'my', 'et', 're']
					}, 
					'italic': {string: ['//']}
				}
			}), 
			"samplingLevel": 64, 
			"codeColorRange-hue": [209, 194], 
			"codeColorRange-saturation": [0, 100], 
			"codeColorRange-lightness": [0, 83]
		}, 
		"data": {
			"replaceData": [
				["\"\"", "\""], 
				["''", "\""], 
				["\\['", "\""], 
				["\\|'", "\""], 
				["[sS]", "s"]
			], 
			"caseData": ["include", "PAUSE", "system", "return", "define", "stdio", "scanf", "printf"]
		}
	}, 
	"devcpp-cpp": {
		"name": "Dev-C++ C++", 
		"settings": {
			"codeLanguage": "cpp", 
			"fontName": "consolas", 
			"fontDataRange": JSON.stringify({
				consolas:{
					'undefined': {
						charCodeRange: [[33, 126]], 
						string: ['&&', '++', 'wh', 'PA', 'fo', 'ff', 'fi', 'fl', 'my', 'et', 're']
					}, 
					'bold': {
						charCodeRange: [[33, 126]], 
						string: ['&&', '++', 'wh', 'PA', 'fo', 'ff', 'fi', 'fl', 'my', 'et', 're']
					}, 
					'italic': {string: ['//']}
				}
			}),  
			"samplingLevel": 64, 
			"codeColorRange-hue": [209, 194], 
			"codeColorRange-saturation": [0, 100], 
			"codeColorRange-lightness": [0, 83]
		}, 
		"data": {
			"replaceData": [
				["\"\"", "\""], 
				["''", "\""], 
				["\\['", "\""], 
				["\\|'", "\""], 
				["[sS]", "s"], 
				["(C|c)1n", "cin"]
			], 
			"caseData": ["cout", "cin", "include", "PAUSE", "system", "return", "define", "iostream", "using", "namespace", "std", "scanf", "printf"]
		}
	}, 
	"zpix-kana": {
		"name": "Zpix かな", 
		"settings": {
			"codeLanguage": "txt", 
			"fontName": "zpix", 
			"fontDataRange": JSON.stringify({
				zpix:{
					'undefined': {
						charCodeRange: [[33, 126], [12352, 12447], [12448, 12543]], 
						string: [...'九份的咖啡店'.split('')]
					}
				}
			}),  
			"samplingLevel": 32, 
			"codeColorRange-hue": [0, 360], 
			"codeColorRange-saturation": [0, 100], 
			"codeColorRange-lightness": [0, 100]
		}, 
		"data": {
			"replaceData": [], 
			"caseData": []
		}
	}
};