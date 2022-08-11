/*
 * 2022 © MaoHuPi
 * sheetPlayer.js v2.0.0
 */
class sheetPlayer{
    'use strict';
    constructor(){
        let _sheetPlayer = this;
        this.context = new (window.AudioContext || window.webkitAudioContext)();;
        this.analyser = this.context.createAnalyser();;
        this.totalGain = this.context.createGain();;
        this.dataArray = new Uint8Array(this.analyser.fftSize);;
        this.analyser.fftSize = 2048;
        this.totalGain.connect(this.analyser);
        this.analyser.connect(this.context.destination);
        this.basic = sheetPlayer.basic;
        this.samples = {};
        this.wave = class sp_wave{
            constructor(args = {}){
                this.name = 'name' in args ? args['name'] : 'c';
                this.level = 'level' in args ? args['level'] : 0;
                this.attack = 'attack' in args ? args['attack'] : 0;
                this.sustain = 'sustain' in args ? args['sustain'] : 0;
                this.release = 'release' in args ? args['release'] : 0;
                this.type = 'type' in args ? args['type'] : 'sine';
                this.subType = 'subType' in args ? args['subType'] : 'piano';
                this.volume = 'volume' in args ? args['volume'] : 1;
                this.output = _sheetPlayer.totalGain;
                this.context = _sheetPlayer.context;
                this.oscillator = undefined;
                this.gain = undefined;
                this.volumeController = undefined;
            }
            play(){
                this.volumeController = this.context.createGain();
                this.oscillator = this.context.createOscillator();
                this.gain = this.context.createGain();
                // types = ['sine', 'square', 'triangle', 'sawtooth'];
                this.oscillator.type = this.type;
                this.oscillator.frequency.value = _sheetPlayer.basic.getHz(this.name, this.level);
                this.volumeController.gain.value = this.volume;
                this.oscillator.connect(this.gain);
                this.gain.connect(this.volumeController);
                this.volumeController.connect(this.output);
                this.gain.gain.value = 0;
                this.oscillator.start();
                this.gain.gain.exponentialRampToValueAtTime(
                    1.0, _sheetPlayer.context.currentTime + this.attack
                );
                setTimeout(() => {
                    this.stop();
                }, 1e3*(this.attack + this.sustain));
            }
            stop(){
                if(this.gain != undefined){
                    this.gain.gain.exponentialRampToValueAtTime(
                        1e-4, this.context.currentTime + this.release
                    );
                }
                // if(this.oscillator != undefined){
                //     this.oscillator.frequency.exponentialRampToValueAtTime(
                //         1e-4, this.context.currentTime + this.release
                //     );
                // }
                setTimeout(() => {
                    if(this.oscillator != undefined){
                        this.oscillator.stop();
                        delete this.oscillator;
                    }
                }, this.release*1e3 + 10);
            }
            getArgs(){
                return({
                    name: this.name, 
                    level: this.level, 
                    attack: this.attack, 
                    sustain: this.sustain, 
                    release: this.release, 
                    type: this.type, 
                    subType: this.subType, 
                    volume: this.volume
                });
            }
            toString(){
                return(JSON.stringify(this.getArgs()));
            }
        }
        this.kick = class sp_kick{
            // https://dev.opera.com/articles/drum-sounds-webaudio/
            constructor(args = {}){
                this.name = 'name' in args ? args['name'] : 'c';
                this.level = 'level' in args ? args['level'] : 0;
                this.type = 'type' in args ? args['type'] : 'kick';
                this.subType = 'subType' in args ? args['subType'] : 'kick';
                this.volume = 'volume' in args ? args['volume'] : 1;
                this.output = _sheetPlayer.totalGain;
                this.context = _sheetPlayer.context;
                this.oscillator = undefined;
                this.gain = undefined;
                this.volumeController = undefined;
            }
            play(){
                this.volumeController = this.context.createGain();
                this.oscillator = this.context.createOscillator();
                this.gain = this.context.createGain();
                this.oscillator.frequency.value = _sheetPlayer.basic.getHz(this.name, this.level);
                this.volumeController.gain.value = this.volume;
                this.oscillator.connect(this.gain);
                this.gain.connect(this.volumeController);
                this.volumeController.connect(this.output);
                this.gain.gain.setValueAtTime(1, this.context.currentTime);
                this.oscillator.frequency.exponentialRampToValueAtTime(0.01, this.context.currentTime + 0.5);
                this.gain.gain.exponentialRampToValueAtTime(0.01, this.context.currentTime + 0.5);
                this.oscillator.start();
                this.oscillator.stop(this.context.currentTime + 0.5);
            }
            stop(){}
            getArgs(){
                return({
                    name: this.name, 
                    level: this.level, 
                    type: this.type, 
                    subType: this.subType, 
                    volume: this.volume
                });
            }
            toString(){
                return(JSON.stringify(this.getArgs()));
            }
        }
        this.snare = class sp_snare{
            // https://dev.opera.com/articles/drum-sounds-webaudio/
            constructor(args = {}){
                this.name = 'name' in args ? args['name'] : 'c';
                this.level = 'level' in args ? args['level'] : 0;
                this.type = 'type' in args ? args['type'] : 'snare';
                this.subType = 'subType' in args ? args['subType'] : 'snare';
                this.volume = 'volume' in args ? args['volume'] : 1;
                this.output = _sheetPlayer.totalGain;
                this.context = _sheetPlayer.context;
                this.oscillator = undefined;
                this.gain = undefined;
                this.volumeController = undefined;
                this.noise = undefined;
                this.noiseFilter = undefined;
                this.noiseEnvelope = undefined;
            }
            noiseBuffer(){
                var bufferSize = this.context.sampleRate;
                var buffer = this.context.createBuffer(1, bufferSize, this.context.sampleRate);
                var output = buffer.getChannelData(0);
                for (var i = 0; i < bufferSize; i++) {
                    output[i] = Math.random() * 2 - 1;
                }
                return(buffer);
            }
            play(){
                this.volumeController = this.context.createGain();
                // noise
                this.noise = this.context.createBufferSource();
                this.noise.buffer = this.noiseBuffer();
                this.noiseFilter = this.context.createBiquadFilter();
                this.noiseFilter.type = 'highpass';
                this.noiseFilter.frequency.value = 1000;
                this.noise.connect(this.noiseFilter);
                this.noiseEnvelope = this.context.createGain();
                this.noiseFilter.connect(this.noiseEnvelope);
                this.noiseEnvelope.connect(this.volumeController);
                // wave
                this.oscillator = this.context.createOscillator();
                this.gain = this.context.createGain();
                this.oscillator.type = 'triangle';
                this.oscillator.frequency.value = _sheetPlayer.basic.getHz(this.name, this.level);
                this.volumeController.gain.value = this.volume;
                this.oscillator.connect(this.gain);
                this.gain.connect(this.volumeController);
                this.volumeController.connect(this.output);
                this.gain.gain.setValueAtTime(1, this.context.currentTime);
                this.oscillator.frequency.exponentialRampToValueAtTime(0.01, this.context.currentTime + 0.5);
                this.gain.gain.exponentialRampToValueAtTime(0.01, this.context.currentTime + 0.5);
                this.oscillator.start();
                this.oscillator.stop(this.context.currentTime + 0.5);
            }
            stop(){}
            getArgs(){
                return({
                    name: this.name, 
                    level: this.level, 
                    type: this.type, 
                    subType: this.subType, 
                    volume: this.volume
                });
            }
            toString(){
                return(JSON.stringify(this.getArgs()));
            }
        }
        // this.hihat = class sp_hihat{
        //     constructor(args = {}){
        //         this.name = 'name' in args ? args['name'] : 'c';
        //         this.level = 'level' in args ? args['level'] : 0;
        //         this.type = 'type' in args ? args['type'] : 'hihat';
        //         this.subType = 'subType' in args ? args['subType'] : 'hihat';
        //         this.volume = 'volume' in args ? args['volume'] : 1;
        //         this.output = _sheetPlayer.totalGain;
        //         this.oscillator = undefined;
        //         this.gain = undefined;
        //         this.volumeController = undefined;
        //     }
        //     play(){
        //         this.source = this.context.createBufferSource();
        //         this.source.buffer = this.buffer;
        //         this.source.connect(this.volumeController);
        //         this.source.start(time);
        //         // ???
        //         this.oscillator = this.context.createOscillator();
        //         this.gain = this.context.createGain();
        //         this.volumeController = this.context.createGain();
        //         this.oscillator.frequency.value = _sheetPlayer.basic.getHz(this.name, this.level);
        //         this.volumeController.gain.value = this.volume;
        //         this.oscillator.connect(this.gain);
        //         this.gain.connect(this.volumeController);
        //         this.volumeController.connect(this.output);
        //         this.gain.gain.setValueAtTime(1, this.context.currentTime);
        //         this.oscillator.frequency.exponentialRampToValueAtTime(0.01, this.context.currentTime + 0.5);
        //         this.gain.gain.exponentialRampToValueAtTime(0.01, this.context.currentTime + 0.5);
        //         this.oscillator.start();
        //         this.oscillator.stop(this.context.currentTime + 0.5);
        //     }
        //     stop(){}
        //     getArgs(){
        //         return({
        //             name: this.name, 
        //             level: this.level, 
        //             type: this.type, 
        //             subType: this.subType, 
        //             volume: this.volume
        //         });
        //     }
        //     toString(){
        //         return(JSON.stringify(this.getArgs()));
        //     }
        // }
        this.sample = class sp_sample{
            constructor(args = {}){
                this.name = 'name' in args ? args['name'] : 'c';
                this.level = 'level' in args ? args['level'] : 0;
                this.type = 'type' in args ? args['type'] : '';
                this.subType = 'subType' in args ? args['subType'] : 'piano';
                this.volume = 'volume' in args ? args['volume'] : 1;
                this.output = _sheetPlayer.totalGain;
                this.context = _sheetPlayer.context;
                this.oscillator = undefined;
                this.gain = undefined;
                this.volumeController = undefined;
            }
            play(){
                this.gain = this.context.createGain();
                this.volumeController = this.context.createGain();
                this.source = this.context.createBufferSource();
                this.source.buffer = sp.samples[this.type];
                this.source.playbackRate.value = _sheetPlayer.basic.getHz(this.name, this.level)/_sheetPlayer.basic.getHz('c', 4);
                this.volumeController.gain.value = this.volume;
                this.source.connect(this.gain);
                this.gain.connect(this.volumeController);
                this.volumeController.connect(this.output);
                // this.gain.gain.setValueAtTime(1, this.context.currentTime);
                this.source.start();
            }
            stop(){}
            getArgs(){
                return({
                    name: this.name, 
                    level: this.level, 
                    type: this.type, 
                    subType: this.subType, 
                    volume: this.volume
                });
            }
            toString(){
                return(JSON.stringify(this.getArgs()));
            }
        }
        this.timeline = class sp_timeline{
            constructor(args = {}){
                this.soundList = 'soundList' in args ? args['soundList'] : [];
                this.timePoint = 'timePoint' in args ? args['timePoint'] : 0;
                this.lastTime = new Date().getTime();
                this.paused = true;
                this.ended = false;
                this.deleteAfterPlay = false;
                this.sheetPlayer = _sheetPlayer;
            }
            add(time, sound){
                this.soundList.push({
                    'time': time, 
                    'sound': sound, 
                    'played': false
                });
            }
            play(){
                this.lastTime = new Date().getTime();
                this.paused = false;
                this._play();
            }
            _play(){
                var timeNow = new Date().getTime();
                this.timePoint += timeNow - this.lastTime;
                this.lastTime = timeNow;
                let unplayed = 0;
                for(let i = 0; i < this.soundList.length; i++){
                    if(this.soundList[i] && this.soundList[i]['played'] === false){
                        if(this.soundList[i]['time']*1e3 < this.timePoint){
                            this.soundList[i]['sound'].play();
                            this.soundList[i]['played'] = true;
                            if(this.deleteAfterPlay){
                                delete this.soundList[i];
                            }
                        }
                        unplayed++;
                    }
                }
                this.ended = unplayed == 0;
                setTimeout(() => {
                    if(!this.paused){
                        this._play();
                    }
                }, 10);
            }
            pause(){
                this.paused = true;
                for(let i = 0; i < this.soundList.length; i++){
                    if(this.soundList[i] && 'stop' in this.soundList[i]['sound']){
                        this.soundList[i]['sound'].stop();
                    }
                }
            }
            stop(){
                this.paused = true;
                for(let i = 0; i < this.soundList.length; i++){
                    if(this.soundList[i] && 'stop' in this.soundList[i]['sound']){
                        this.soundList[i]['sound'].stop();
                        this.timePoint = 0;
                        this.soundList[i]['played'] = false;
                    }
                }
            }
            getSoundListData(removePlayed = false){
                return(this.soundList.map(item => {
                    item = {...item}
                    item['sound'] =  typeof(item['sound']) == 'object' && 'getArgs' in item['sound'] ? item['sound'].getArgs() : {};
                    if(removePlayed){
                        delete item['played'];
                    }
                    return(item);
                }));
            }
            getArgs(){
                return({
                    soundList: this.getSoundListData(), 
                    timePoint: this.timePoint, 
                    paused: this.paused
                });
            }
            toString(){
                return(JSON.stringify(this.getArgs()));
            }
        }
    }
    getFft(){
        this.analyser.getByteTimeDomainData(this.dataArray)
        return(this.dataArray);
    }
    changeFftSize(size){
        this.analyser.fftSize = size;
        this.dataArray = new Uint8Array(this.analyser.fftSize);
    }
    loadSample(path = undefined){
        let context = this.context;
        if(path != undefined){
            fetch(path)
                .then(res => res.arrayBuffer())
                .then(arrayBuffer => context.decodeAudioData(arrayBuffer))
                .then(buffer => {
                    this.samples[path] = buffer;
                });

            // let request = new XMLHttpRequest();
            // request.open('GET', path);
            // request.responseType = 'arraybuffer';
            // request.onload = () => {
            //     if(request.status === 200){
            //         this.context.decodeAudioData(request.response, (buffer) => {
            //             console.log(buffer);
            //             this.samples[path] = buffer;
            //         });
            //     }
            // };
            // request.send();
        }
    }
    static basic = class basic{
        static getHz(name, level, toInt = false){
            var heightDict = {'c': -9, 'd': -7, 'e': -5, 'f': -4, 'g': -2, 'a': 0, 'b': 2};
            if(typeof(name) == 'string' && name.length > 0){
                var height = heightDict[name[0].toLowerCase()]
                    + (name.slice(1).match(/#/g) || []).length
                    - (name.slice(1).match(/b/g) || []).length;
                // var floorNow = (440 * (2**(level-4)));
                // var floorNext = (440 * (2**(level-3)));
                // var hz = floorNow + (floorNext - floorNow)/12*height;
                var hz = (440 * (2**(level-4 + height/12)));
                return(toInt ? parseInt(hz) : hz);
            }
            return(0);
        }
    }
}