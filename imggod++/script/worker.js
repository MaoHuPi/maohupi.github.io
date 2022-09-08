// import './effect.js';

self.addEventListener('message', function(msg){
    for(let [k, v] in msg.data){
        this.self[k] = v;
    }
    console.log(eval(msg.data.forFun));
    eval(msg.data.forFun)(msg.data);
    console.log('done');
    self.postMessage(msg.data);
    self.close();
}, false);