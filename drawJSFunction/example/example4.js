/* 聖誕布景(jingle bell音樂) */

x => {
    let oscillatorType = ['sine', 'triangle', 'sawtooth'][Math.floor(time/2/(400*16)%3)];
    let maxVolume  = [0.4, 0.6, 0.15][Math.floor(time/2/(400*16)%3)];
    (wavePlayer.oscillator.type != oscillatorType) && (wavePlayer.oscillator.type = oscillatorType);
    (wavePlayer.maxVolume != maxVolume) && (wavePlayer.maxVolume = maxVolume);
}
%end
x => {
    function getHz(name, level, toInt = false){
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
    let y = 0;
    x = x + (400*8);
    let x2 = Math.floor(x/100);
    let notes = [
        'e', 'e', 'e', '-', 
        'e', 'e', 'e', '-', 
        'e', 'g', 'c', 'd', 
        'e', '-', '-', '-', 

        'f', 'f', 'f', 'f', 
        'f', 'e', 'e', 'e', 
        'e', 'd', 'd', 'e', 
        'd', '-', 'g', '-', 

        'e', 'e', 'e', '-', 
        'e', 'e', 'e', '-', 
        'e', 'g', 'c', 'd', 
        'e', '-', '-', '-', 

        'f', 'f', 'f', 'f', 
        'f', 'e', 'e', 'e', 
        'g', 'g', 'f', 'd', 
        'c', '-', '-', '-'
    ];
    if(x2 > -1 && x2 < notes.length){
        let n = notes[x2];
        let x3 = x2;
        while(n == '-'){
            x3--;
            n = notes[x3];
        }
    y = typeof(n) == 'string' ? getHz(n, 4, false) : n;
    }
    if(x%100 > 60){
        y = notes[x2+1] == '-' ? y : 0;
    }
    return(y);
}
%waveFun=${time/2%(400*16)-(400*8)}
%color=#555555
%end

(x, t) => (Math.sin(x*100000 + t/1000)*100)/2 - 150
%color=#fff5
%note=decoration
%end

(x, t) => {window.var_change = t/1000}
%end
(x, t) => {window.var_treePos = Math.sin(window.var_change)*50 - 50}
%end
(x, t) => {window.var_treeRot = -Math.atan(((Math.sin(window.var_change-25)*50 - 50)-(Math.sin(window.var_change+25)*50 - 50))/50)/4}
%end

x => x == 0 ? 400+window.var_treePos : x == 1 ? 100+window.var_treePos : NaN
%color=yellow
%rotate=[${window.var_treeRot},[0,${window.var_treePos}]]
%end
x => x > -25 && x < 25 ? 100+window.var_treePos : Math.abs(x) == 26 ? window.var_treePos : NaN
%color=brown
%rotate=[${window.var_treeRot},[0,${window.var_treePos}]]
%end
x => x > -25 && x < 25 ? window.var_treePos : Math.abs(x) == 26 ? window.var_treePos : NaN
%color=brown
%rotate=[${window.var_treeRot},[0,${window.var_treePos}]]
%note=trunk
%end

(x, t) => x > -100-window.var_treePos && x < 201-window.var_treePos ? (x+100+window.var_treePos)%100 * (Math.abs(t/1000%4-2)-1) : NaN
%rotate=[${window.var_treeRot},[0,${-300+window.var_treePos}]]
%rotate=[${deg(90)},[0,0]]
%transform=[1,0,0,1,0,-300]
%color=green
%end
(x, t) => x > -100-window.var_treePos && x < 201-window.var_treePos ? -(x+100+window.var_treePos)%100 * (Math.abs(t/1000%4-2)-1) : NaN
%rotate=[${window.var_treeRot},[0,${-300+window.var_treePos}]]
%rotate=[${deg(90)},[0,0]]
%transform=[1,0,0,1,0,-300]
%color=green
%note=leafs
%end
(x, t) => x > -100-window.var_treePos && x < 201-window.var_treePos ? (x+100+window.var_treePos)%100 * (Math.abs((t/1000-5)%4-2)-1) : NaN
%rotate=[${window.var_treeRot},[0,${-300+window.var_treePos}]]
%rotate=[${deg(90)},[0,0]]
%transform=[1,0,0,1,0,-300]
%color=green
%end
(x, t) => x > -100-window.var_treePos && x < 201-window.var_treePos ? -(x+100+window.var_treePos)%100 * (Math.abs((t/1000-5)%4-2)-1) : NaN
%rotate=[${window.var_treeRot},[0,${-300+window.var_treePos}]]
%rotate=[${deg(90)},[0,0]]
%transform=[1,0,0,1,0,-300]
%color=green
%note=leafs
%end

(x, t) => Math.sin(x/1000+t/1000)*50 - 50
%note=floor
%color=white
%end

(x) => Math.abs((x%2)*20000)-10000
%color=rgba(255,255,255,${Math.abs(time/1000%2-1)*0.5})
%note=snow
%end