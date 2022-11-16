/*
 * 2022 © MaoHuPi
 * imggod++/script/ml.js
 */

class ml_singleLayerPerceptron{
    constructor(){
        this.wList = false;
        this.actionFun = x => x;
    }
    learn(iDatas, wList = false, actionFun = false){
        if(wList == false){
            wList = this.wList;
        }
        if(actionFun == false){
            actionFun = this.actionFun;
        }
        if(wList == false){
            wList = new Array(iDatas[0]['input'].length)
                .fill(0)
                .map(() => -5 + Math.random()*10);
        }
        for(let i = 0; i < iDatas.length; i++){
            let iList = iDatas[i]['input'];
            let o = this.test(iDatas[i]['input'], wList = wList, actionFun = actionFun);
            let a = 0.01;
            let e = iDatas[i]['output'] - o;
            // console.log(e);
            wList = wList.map((w, index) => w + a*iList[index]*e);
        }
        this.wList = wList;
        return(wList)
    }
    test(iList, wList = false, actionFun = false){
        if(wList == false){
            wList = this.wList;
        }
        if(actionFun == false){
            actionFun = this.actionFun;
        }
        if(wList != false){
            let o = 0;
            for(let j = 0; j < iList.length; j++){
                o += iList[j]*wList[j];
            }
            o = actionFun(o);
            return(o);
        }
        else{
            console.log('This model has no wList!');
            console.log(iList);
            return(false);
        }
    }
}