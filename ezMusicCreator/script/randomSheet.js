/*
 * 2022 © MaoHuPi
 * randomSheet.js v2.0.0
 */

'use strict';

/* method */
function bpmToSecond(bpm){
    return(60 / bpm);
}
function getComposition(name){
    if(typeof(name) == 'string' && name.length > 0){
        var basic = name[0];
        var type = name.toLowerCase().includes('maj') || name.includes('M') || name.includes('Δ') ? 'major' : 
        name.toLowerCase().includes('min') || name.includes('m') ? 'minor' : 
        isNum(name) ? 'dominant' : 'major';
        var num = isNum(name) ? parseInt(name) : 0;
        var notes = 'C C# D D# E F F# G G# A A# B'.split(' ');
        var composition = [];
        var basicIndex = notes.findIndex(item => item == basic);

        composition.push(basicIndex);
        if(type == 'minor'){
            composition.push((basicIndex + 3) % notes.length);
        }
        else{
            composition.push((basicIndex + 4) % notes.length);
        }
        composition.push((basicIndex + 7) % notes.length);
        if(num >= 7){
            if(type == 'major'){
                composition.push((basicIndex + 11) % notes.length);
            }
            else{
                composition.push((basicIndex + 10) % notes.length);
            }
        }
        if(num >= 9){
            composition.push((basicIndex + 14) % notes.length);
        }
        if(num >= 11){
            composition.push((basicIndex + 17) % notes.length);
        }
        if(num >= 13){
            composition.push((basicIndex + 21) % notes.length);
        }
        composition = composition.map(index => notes[index]);
        return(composition);
    }
    else{
        return([]);
    }
}

/* data */
let groupList = [ // 和弦組
    // 來路不明
    "C G Am Em F C Dm G", 
    // https://www.youtube.com/watch?v=zL_14UGziy4
    "C G Am C F C Dm G", 
    "C G Am F C G Am F", // 快樂
    "F C G Am F C G Am", // 快樂
    "G Am F C G Am F C", // 少見
    "Am F C G Am F C G", // 悲傷
    "F G Em Am F G Em Am", // 45364536
    "F G Em Am Dm G C", // 4536251
    "F G7 Em Am Dm G C", // 4536251
    // https://www.youtube.com/watch?v=gnyaGbiktM8
    "C Am Dm G C Am Dm G", // 可愛
    // http://tx.liberal.ntu.edu.tw/TxMusic/Docs/Audio-Chord_Major.htm
    // "C Dm G7 C C Dm G7 C", // 微雜
    // 個人偏好
    "C Em F G C Em F G"
]
let chordTypes = {
    "together": n => 0, 
    "single": n => n
    // "reverse": (n, totle) => totle - n
}

function roundNoteName(name, allowNotes = []){
    if(allowNotes.length > 0){
        if(allowNotes.indexOf(name) > -1){
            return(name);
        }
        else{
            var name_hz = sheetPlayer.basic.getHz(name, 4);
            var deltaHz = allowNotes
                .map(allowNoteName => sheetPlayer.basic.getHz(allowNoteName, 4))
                .map(hz => Math.abs(hz - name_hz));
            var roundedIndex = deltaHz.indexOf(Math.min(...deltaHz));
            return(allowNotes[roundedIndex]);
        }
    }
    else{
        return(name);
    }
}

function loadSamples(sheetPlayer){
    sheetPlayer.loadSample('sample/OverHiTom.wav');
    sheetPlayer.loadSample('sample/OverLowTom.wav');
    sheetPlayer.loadSample('sample/Koto.wav');
    sheetPlayer.loadSample('sample/Shakuhachi.wav');
}

/* random */
function randomSheet(timeline, actionTimePoint = 0, sheetData = {}){
    sheetData['bpm'] = sheetData.bpm != undefined ? sheetData['bpm'] : random.range(60, 240);
    sheetData['group'] = sheetData.group != undefined ? sheetData['group'] : random.pick(groupList);
    sheetData['notes'] = sheetData.notes != undefined ? sheetData['notes'] : sheetData['group'].split(' ').map(chordName => getComposition(chordName));
    sheetData['chordType'] = sheetData.chordType != undefined ? sheetData['chordType'] : random.pick(Object.keys(chordTypes));
    sheetData['allowNotes'] = sheetData.allowNotes != undefined ? sheetData['allowNotes'] : [];
    sheetData['instruments'] = sheetData.instruments != undefined ? sheetData['instruments'] : ['chord'];
    var speed = bpmToSecond(sheetData['bpm']);
    for(let i = 0; i < sheetData['notes'].length; i++){
        if(sheetData['instruments'].indexOf('chord') > -1){
            for(let j = 0; j < sheetData['notes'][i].length; j++){
                timeline.add(actionTimePoint + speed*(i*4 + chordTypes[sheetData['chordType']](j, 4)), new(sp.wave)({
                    name: roundNoteName(sheetData['notes'][i][j], sheetData['allowNotes']), 
                    level: 4, 
                    attack: 0, 
                    sustain: speed*4, 
                    release: 0.1, 
                    type: 'sine', 
                    volume: 0.08
                })); // chord
            }
        }
        for(let j = 0; j < 4; j++){
            if(sheetData['instruments'].indexOf('main') > -1){
                if(j == 0 || random.range(0, 2) == 1){
                    timeline.add(actionTimePoint + speed*(i*4 + j), new (sp.wave)({
                        name: roundNoteName(random.pick(sheetData['notes'][i]), sheetData['allowNotes']), 
                        level: 4,
                        attack: 0, 
                        sustain: speed, 
                        release: 0.1, 
                        type: 'triangle', 
                        volume: (1 - Math.min(Math.abs(0 - j), Math.abs(2 - j)))*0.05 + 0.05
                    })); // main
                }
            }
            if(sheetData['instruments'].indexOf('koto') > -1){
                if(j == 0 || random.range(0, 2) == 1){
                    timeline.add(actionTimePoint + speed*(i*4 + j), new (sp.sample)({
                        name: roundNoteName(random.pick(sheetData['notes'][i]), sheetData['allowNotes']), 
                        level: 5,
                        attack: 0, 
                        sustain: speed, 
                        release: 0.1, 
                        type: 'sample/Koto.wav', 
                        volume: (1 - Math.min(Math.abs(0 - j), Math.abs(2 - j)))*0.05 + 0.1
                    })); // koto
                }
            }
            if(sheetData['instruments'].indexOf('background') > -1){
                if((j == 0 || j == 2) && random.range(0, 2) == 1){
                    timeline.add(actionTimePoint + speed*(i*4 + j), new (sp.wave)({
                        name: roundNoteName(random.pick(sheetData['notes'][i]), sheetData['allowNotes']), 
                        level: 3,
                        attack: 0, 
                        sustain: speed*2, 
                        release: 0.1, 
                        type: 'triangle', 
                        volume: 0.08
                    })); // background
                }
            }
            if(sheetData['instruments'].indexOf('shakuhachi') > -1){
                if((j == 0 || j == 2)){
                    timeline.add(actionTimePoint + speed*(i*4 + j), new (sp.sample)({
                        name: roundNoteName(random.pick(sheetData['notes'][i]), sheetData['allowNotes']), 
                        level: 4,
                        attack: 0, 
                        sustain: speed*2, 
                        release: 0.1, 
                        type: 'sample/Shakuhachi.wav', 
                        volume: 0.5
                    })); // shakuhachi
                }
            }
            if(sheetData['instruments'].indexOf('kick') > -1){
                if(j == 0 || (j != 2 && random.range(0, 8) == 1)){
                    timeline.add(actionTimePoint + speed*(i*4 + j), new (sp.kick)({
                        name: 'C', 
                        level: 3,
                        type: 'sawtooth', 
                        volume: j == 0 ? 1 : 0.4
                    })); // kick
                }
            }
            if(sheetData['instruments'].indexOf('overlowtom') > -1){
                if(j == 0 || (j != 2 && random.range(0, 8) == 1)){
                    timeline.add(actionTimePoint + speed*(i*4 + j), new (sp.sample)({
                        name: 'C', 
                        level: 4,
                        type: 'sample/OverLowTom.wav', 
                        volume: j == 0 ? 0.3 : 0.2
                    })); // overlowtom
                }
            }
            if(sheetData['instruments'].indexOf('snare') > -1){
                if(j == 2 || (j != 0 || random.range(0, 4) == 1)){
                    timeline.add(actionTimePoint + speed*(i*4 + j), new (sp.snare)({
                        name: 'C', 
                        level: 4,
                        type: 'sawtooth', 
                        volume: j == 2 ? 0.5 : 0.1
                    })); // snare
                    if(j == 2 && random.range(0, 2) == 1){
                        timeline.add(actionTimePoint + speed*(i*4 + j + 1), new (sp.snare)({
                            name: 'C', 
                            level: 4,
                            type: 'sawtooth', 
                            volume: 0.4
                        })); // snare
                    }
                }
            }
            if(sheetData['instruments'].indexOf('overhitom') > -1){
                if(j == 2 || (j != 0 || random.range(0, 4) == 1)){
                    timeline.add(actionTimePoint + speed*(i*4 + j), new (sp.sample)({
                        name: 'C', 
                        level: 4.5,
                        type: 'sample/OverHiTom.wav', 
                        volume: j == 2 ? 0.5 : 0.1
                    })); // overhitom
                    if(j == 2 && random.range(0, 2) == 1){
                        timeline.add(actionTimePoint + speed*(i*4 + j + 1), new (sp.sample)({
                            name: 'C', 
                            level: 4.5,
                            type: 'sample/OverHiTom.wav', 
                            volume: 0.4
                        })); // overhitom
                    }
                }
            }
        }
    }
    sheetData['sounds'] = timeline.soundList;
    return(sheetData);
}