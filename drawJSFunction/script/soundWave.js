class soundWave{
    'use strict';
    constructor(){
        this.playing = false;
        this.maxVolume = 0.5;

        this.context = new (window.AudioContext || window.webkitAudioContext)();
        this.analyser = this.context.createAnalyser();
        this.totalGain = this.context.createGain();
        this.dataArray = new Uint8Array(this.analyser.fftSize);
        this.analyser.fftSize = 2048;
        this.totalGain.connect(this.analyser);
        this.analyser.connect(this.context.destination);
        
        this.volumeController = this.context.createGain();
        this.oscillator = this.context.createOscillator();
        this.gain = this.context.createGain();
        // types = ['sine', 'square', 'triangle', 'sawtooth'];
        this.oscillator.type = 'sine';
        this.oscillator.frequency.value = 440;
        this.volumeController.gain.value = 0.5;
        this.oscillator.connect(this.gain);
        this.gain.connect(this.volumeController);
        this.volumeController.connect(this.totalGain);
        this.gain.gain.value = 0.2;
    }
    changeFrequency(f){
        this.oscillator.frequency.value = f;
    }
    start(){
        this.oscillator.start();
        this.playing = true;
    }
    stop(){
        this.oscillator.stop();
        this.playing = false;
    }
}
