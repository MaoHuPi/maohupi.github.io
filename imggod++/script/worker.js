/*
 * 2022 © MaoHuPi
 * imggod++/script/worker.js
 */

importScripts('./effect.js');
importScripts('./ml.js');

self.addEventListener('message', function(msg){
    for(let [k, v] in msg.data){
        this.self[k] = v;
    }
    eval(msg.data.forFun)(msg.data);
    console.log('done');
    msg.data.progress = 'done';
    self.postMessage(msg.data);
    self.close();
}, false);