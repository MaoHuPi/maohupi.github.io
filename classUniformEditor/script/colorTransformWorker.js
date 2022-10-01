/*
 * 2022 © MaoHuPi
 * classUniformEditor/script/colorTransformWorker.js
 */

self.addEventListener('message', function(msg){
    for(let [k, v] in msg.data){
        this.self[k] = v;
    }
    // console.log(msg.data.forFun);
    eval(msg.data.forFun)(msg.data);
    console.log('done');
    msg.data.progress = 'done';
    self.postMessage(msg.data);
    self.close();
}, false);