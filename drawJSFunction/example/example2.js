/* sigmoid函數(k的變化) */

function sigmoid(x, k){
    k = Math.abs(k/100%100-50)
    let o = 1 / (1 + Math.exp(-x/k));
    return o*100;
}