/*
 * 2023 © MaoHuPi
 * 資料統計功能
 * c0CodeOCR > script > statistics.js
 */

class Statistics{
	static quantile(data, n, slice){
		var r = data.length*(n/slice);
		r = r%1 == 0 ? (data[r-1] + data[r])/2 : data[Math.ceil(r)-1];
		return r;
	}
	static inlier(data){
		data = data.sort((a, b) => a - b);
		var q_1 = Statistics.quantile(data, 1, 4), 
			q_3 = Statistics.quantile(data, 3, 4);
		data = data.filter(n => n >= q_1 && n <= q_3);
		return data;
	}
	static outlier(data){
		data = data.sort((a, b) => a - b);
		var q_1 = Statistics.quantile(data, 1, 4), 
			q_3 = Statistics.quantile(data, 3, 4);
		data = data.filter(n => n < q_1 || n > q_3);
		return data;
	}
	static average(data){
		return data.reduce((s, n) => s+n)/data.length;
	}
}