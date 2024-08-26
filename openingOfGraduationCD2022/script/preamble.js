let preambleExited = true;
function preamble(){
    preambleExited = false;
    const cvs = $('#preamble-cvs'), 
    ctx = cvs.getContext('2d'), 
    aniCvs = document.createElement('canvas'), 
    aniCtx = aniCvs.getContext('2d'), 
    ratio = 1536/1024;
    let cw = 0, 
    ch = 0, 
    font = 'zpix', 
    element = {
        ax:0.9, 
        ay:0.9, 
        w:3, 
        h:5, 
        r:1.2
    }
    me = {
        x:('meX' in LSCmd() ? parseInt(LSCmd('get', 'meX')) : 10), y:('meY' in LSCmd() ? parseInt(LSCmd('get', 'meY')) : 13), 
        facing:'top', 
        ani:{
            x:0, 
            y:0, 
            sx:0, 
            sy:0, 
            arrow:0
        }, 
        decay:{
            x:0.3, 
            y:0.3, 
            sx:0.1, 
            sy:0.1, 
            arrow:0.1
        }, 
        timestamp:time()
    }, 
    map = {
        bedroom:{
            inner:[
                ['牆', '牆', '牆', '窗', '牆', '牆', '牆', '牆', '牆', '牆'], 
                ['牆', '桌', '桌', '　', '　', '枕', '床', '床', '床', '牆'], 
                ['牆', '桌', '桌', '椅', '　', '枕', '床', '床', '床', '牆'], 
                ['牆', '燈', ('photoFlag' in LSCmd() && LSCmd('get', 'photoFlag') == 'true' ? '照' : '機'), '　', '　', '　', '　', '　', '　', '牆'], 
                ['牆', '　', '　', '　', '　', '　', '　', '　', '　', '牆'], 
                ['牆', '　', '　', '　', '　', '　', '　', '　', '　', '牆'], 
                ['牆', '　', '　', '　', '　', '　', '　', '　', '　', '牆'], 
                ['牆', '牆', '門', '牆', '牆', '牆', '牆', '牆', '牆', '牆']
            ], 
            position:{x:8, y:7}, 
            effect:{
                '1,3':[
                    function(){
                        ctx.shadowColor = 'yellow';
                        ctx.shadowBlur = 1*cw;
                    }, 
                    function(){
                        ctx.shadowColor = 'black';
                        ctx.shadowBlur = 0;
                    }
                ], 
                '2,3':[
                    function(){
                        ctx.shadowColor = 'white';
                        ctx.shadowBlur = 1*cw;
                    }, 
                    function(){
                        ctx.shadowColor = 'black';
                        ctx.shadowBlur = 0;
                    }
                ]
            }
        }, 
        now:[]
    }, 
    dialog = {
        inner:('diI' in LSCmd() ? JSON.parse(LSCmd('get', 'diI')) : []), 
        position:{x:('diX' in LSCmd() ? parseInt(LSCmd('get', 'diX')) : 0), y:('diY' in LSCmd() ? parseInt(LSCmd('get', 'diY')) : 0)}, 
        timestamp:time(), 
        fakeMe:{x:('fmX' in LSCmd() ? parseInt(LSCmd('get', 'fmX')) : -1), y:('fmY' in LSCmd() ? parseInt(LSCmd('get', 'fmY')) : -1)}, 
        showLength:0, 
        showText:('diI' in LSCmd() ? JSON.parse(LSCmd('get', 'diI')) : []), 
        showAni:{}, 
        show:function(list, x = 0, y = 0){
            this.inner = list;
            this.position.x = x;
            this.position.y = y;
            this.timestamp = time();
            this.clearAni();
            LSCmd('set', 'diI', JSON.stringify(list));
            LSCmd('set', 'diX', x);
            LSCmd('set', 'diY', y);
        }, 
        draw:function(){
            let showLength = (time() - dialog.timestamp)/100, 
            showText = [];
            for(let line of dialog.inner){
                if(showLength > line.length){
                    showText.push(line);
                    showLength -= line.length;
                }
                else{
                    showText.push([...line].splice(0, showLength));
                    break;
                }
            }
            if(JSON.stringify(this.showText) != JSON.stringify(showText)){
                new Audio(se.keyboard[random(0, 7)].src).play();
            }
            this.showText = showText;
            drawList(showText, dialog.position.x, dialog.position.y, 'dialog');
        }, 
        getPosition:function(text){
            for(let y in this.inner){
                for(let x in this.inner[y]){
                    if(this.inner[y][x] == text){
                        text = {x:x, y:y};
                        break;
                    }
                }
            }
            return(text);
        }, 
        remove:function(text){
            if(typeof(text) == 'string'){
                text = this.getPosition(text);
                if(typeof(text) == 'string'){
                    return;
                }
            }
            if(this.inner[text.y] != undefined && this.inner[text.y][text.x] != undefined){
                let line = this.inner[text.y].split('');
                line[text.x] = '　';
                this.inner[text.y] = line;
            }
        }, 
        addAni:function(x, y, type, doneFunction = () => {}){
            this.showAni[`${x},${y}`] = {
                type:type, 
                timestamp:time(), 
                doneFunction:doneFunction, 
                stage:0
            };
            if(type in se){
                new Audio(se[type].src).play();
            }
        }, 
        removeAni:function(x, y){
            delete this.showAni[`${x},${y}`];
        }, 
        clearAni:function(){
            this.showAni = {};
        }, 
        renderingAni:function(text, x, y){
            let attribute = this.showAni[`${x},${y}`];
            if(attribute == undefined){
                drawText(text, dialog.position.x+x, dialog.position.y+y);
                return;
            }
            let timeLag = (time()-attribute.timestamp) / 30, 
            e = element;
            switch('type' in attribute ? attribute.type : 'none'){
                case 'delete':
                    s = 0.6;
                    if(timeLag < 1000/30*s){
                        if(attribute.stage == 0){
                            attribute.stage = 1;
                        }
                        let oldFillStyle = ctx.fillStyle, 
                        p = getElementPosition(dialog.position.x+x, dialog.position.y+y);
                        ctx.fillStyle = `rgba(255, 255, 255, ${1-timeLag/(1000/30*s)*1})`;
                        drawText(text, dialog.position.x+x, dialog.position.y+y);
                        for(let i = 0; i < timeLag; i++){
                            ctx.fillStyle = `rgba(255, 255, 0, ${i/(1000/30*s)*1})`;
                            ctx.fillRect(p.x+(-(i/30/s-0.56)*e.w)*cw, p.y+(i/30/s-0.56)*e.h*ch, 0.3*cw, 0.3*cw);
                        }
                        ctx.fillStyle = oldFillStyle;
                    }
                    else if(timeLag <= 1000/30*s*2){
                        if(attribute.stage == 1){
                            attribute.stage = 2;
                            new Audio(se.done.src).play();
                        }
                        timeLag = timeLag - 1000/30*s;
                        let oldFillStyle = ctx.fillStyle, 
                        pF = getElementPosition(dialog.position.x, dialog.position.y+y), 
                        pL = getElementPosition(dialog.position.x+dialog.inner[y].length, dialog.position.y+y), 
                        dw = (-0.56)*e.w*cw, 
                        dh = (-0.56)*e.h*ch, 
                        lw = 0.3*cw, 
                        xh = e.h*ch*(timeLag/(1000/30*s)), 
                        yw = -(pF.x-pL.x)*(timeLag/(1000/30*s));
                        ctx.fillStyle = `rgba(255, 255, 255, ${(timeLag/(1000/30*s))})`;
                        ctx.fillRect(pF.x+dw, pF.y+dh, -(pF.x-pL.x)+lw, e.h*ch+lw*2);
                        ctx.fillStyle = 'white';
                        ctx.fillRect(pF.x+dw, pF.y+dh, yw, lw);
                        ctx.fillRect(pL.x+dw, pL.y+dh, lw, xh);
                        ctx.fillRect(pL.x+dw - yw, pL.y-dh, yw, lw);
                        ctx.fillRect(pF.x+dw, pF.y-dh - xh, lw, xh);
                        ctx.fillStyle = oldFillStyle;
                    }
                    else if(timeLag <= 1000/30*s*3){
                        if(attribute.stage == 2){
                            attribute.stage = 3;
                        }
                        timeLag = timeLag - 1000/30*s*2;
                        let oldFillStyle = ctx.fillStyle, 
                        maxTimeLag = 20, 
                        pF = getElementPosition(dialog.position.x, dialog.position.y+y), 
                        pL = getElementPosition(dialog.position.x+dialog.inner[y].length, dialog.position.y+y), 
                        dw = (-0.56)*e.w*cw, 
                        dh = (-0.56)*e.h*ch, 
                        lw = 0.3*cw, 
                        xh = e.h*ch*(maxTimeLag/(1000/30*s)), 
                        yw = -(pF.x-pL.x)*(maxTimeLag/(1000/30*s));
                        ctx.fillStyle = `white`;
                        ctx.fillRect(pF.x+dw, pF.y+dh, -(pF.x-pL.x)+lw, e.h*ch+lw*2);
                        ctx.fillRect(pF.x+dw, pF.y+dh, yw, lw);
                        ctx.fillRect(pL.x+dw, pL.y+dh, lw, xh);
                        ctx.fillRect(pL.x+dw - yw, pL.y-dh, yw, lw);
                        ctx.fillRect(pF.x+dw, pF.y-dh - xh, lw, xh);
                        ctx.fillStyle = oldFillStyle;
                    }
                    else if(timeLag <= 1000/30*s*4){
                        if(attribute.stage == 3){
                            attribute.stage = 4;
                        }
                        timeLag = timeLag - 1000/30*s*3;
                        let oldFillStyle = ctx.fillStyle, 
                        maxTimeLag = 20, 
                        pF = getElementPosition(dialog.position.x, dialog.position.y+y), 
                        pL = getElementPosition(dialog.position.x+dialog.inner[y].length, dialog.position.y+y), 
                        dw = (-0.56)*e.w*cw, 
                        dh = (-0.56)*e.h*ch, 
                        lw = 0.3*cw, 
                        xh = e.h*ch*(maxTimeLag/(1000/30*s)), 
                        yw = -(pF.x-pL.x)*(maxTimeLag/(1000/30*s));
                        ctx.fillStyle = `rgba(255, 255, 255, ${(1-timeLag/(1000/30*s))})`;
                        ctx.fillRect(pF.x+dw, pF.y+dh, -(pF.x-pL.x)+lw, e.h*ch+lw*2);
                        ctx.fillRect(pF.x+dw, pF.y+dh, yw, lw);
                        ctx.fillRect(pL.x+dw, pL.y+dh, lw, xh);
                        ctx.fillRect(pL.x+dw - yw, pL.y-dh, yw, lw);
                        ctx.fillRect(pF.x+dw, pF.y-dh - xh, lw, xh);
                        ctx.fillStyle = oldFillStyle;
                    }
                    else if(timeLag <= 1000/30*s*5){
                        if(attribute.stage == 4){
                            attribute.stage = 5;
                        }
                        timeLag = timeLag - 1000/30*s*4;
                    }
                    else{
                        this.removeAni(x, y);
                        this.addAni(x, y, 'hidden');
                        attribute.doneFunction();
                    }
                    break;
                case 'hidden':
                    break;
            }
        }
    }, 
    se = {
        keyboard:[], 
        walk:[], 
        delete:new Audio(`audio/delete.wav`), 
        done:new Audio(`audio/done.wav`)
    };
    map.now = 'bedroom';
    for(let i = 1; i <= 8; i++){
        se.keyboard.push(new Audio(`audio/keyboard/${i}.wav`));
    }
    for(let i = 1; i <= 2; i++){
        se.walk.push(new Audio(`audio/walk/${i}.wav`));
    }
    loadFont('zpix', 'font/Zpix.ttf');
    window.addEventListener('keydown', keydown, false);
    function keydown(event){
        let mapInner = map[map.now].inner, 
        syAniStep = 0.5, 
        lastFacing = me.facing, 
        lastMeX = me.x, 
        lastMeY = me.y;
        if(LSCmd('all').length <= 0 || LSCmd('get', 'run') === 'false'){
            window.onkeydown = () => {};
            dialog.show([
                '那些旅程就這樣結束，', 
                '或許有些不捨，', 
                '但不管怎麼說那夢境般的種種都已成為過去。'
            ], 1, 1);
            LSCmd('set', 'run', 'true');
        }
        function isText(callback){
            let cvsPosition = callback({x:0, y:0}), 
            mapPosition = callback(map[map.now].position), 
            dialogPosition = callback(dialog.position);
            let mi0 = 
                cvsPosition[0] <= -1 ? false : 
                    cvsPosition[0] >= 16 ? false : 
                        cvsPosition[1] <= -1 ? false : 
                            cvsPosition[1] >= 26 ? false : true;
            let mi1 = mapInner[mapPosition[0]];
            mi1 = mi1 == undefined ? mi1 : mi1[mapPosition[1]];
            mi1 = mi1 == undefined ? true : mi1 == '　' ? true : false;
            let mi2 = dialog.inner[dialogPosition[0]];
            mi2 = mi2 == undefined ? mi2 : mi2[dialogPosition[1]];
            mi2 = mi2 == undefined ? true : mi2 == '　' ? true : false;
            return(mi0 && mi1 && mi2);
        }
        function getText(callback){
            let mapPosition = callback(map[map.now].position), 
            dialogPosition = callback(dialog.position), 
            element = '　';
            let mi1 = mapInner[mapPosition[0]];
            mi1 = mi1 == undefined ? mi1 : mi1[mapPosition[1]];
            mi1 = mi1 == undefined ? true : mi1 == '　' ? true : false;
            if(!mi1){
                element = mapInner[mapPosition[0]][mapPosition[1]];
            }
            let mi2 = dialog.inner[dialogPosition[0]];
            mi2 = mi2 == undefined ? mi2 : mi2[dialogPosition[1]];
            mi2 = mi2 == undefined ? true : mi2 == '　' ? true : false;
            if(!mi2){
                element = dialog.inner[dialogPosition[0]][dialogPosition[1]];
            }
            return(element);
        }
        switch(event.key){
            case 'ArrowUp':
            case 'w':
                me.facing = 'top';
                if(isText(p => {return([(me.y - p.y - 1), (me.x - p.x)])})){
                    me.y -= 1;
                    me.ani.y -= 1;
                    me.ani.sy = syAniStep;
                    new Audio(se.walk[random(0, 1)].src).play();
                }
                break;
            case 'ArrowDown':
            case 's':
                me.facing = 'bottom';
                if(isText(p => {return([(me.y - p.y + 1), (me.x - p.x)])})){
                    me.y += 1;
                    me.ani.y += 1;
                    me.ani.sy = syAniStep;
                    new Audio(se.walk[random(0, 1)].src).play();
                }
                break;
            case 'ArrowLeft':
            case 'a':
                me.facing = 'left';
                if(isText(p => {return([(me.y - p.y), (me.x - p.x - 1)])})){
                    me.x -= 1;
                    me.ani.x -= 1;
                    me.ani.sy = syAniStep;
                    new Audio(se.walk[random(0, 1)].src).play();
                }
                break;
            case 'ArrowRight':
            case 'd':
                me.facing = 'right';
                if(isText(p => {return([(me.y - p.y), (me.x - p.x + 1)])})){
                    me.x += 1;
                    me.ani.x += 1;
                    me.ani.sy = syAniStep;
                    new Audio(se.walk[random(0, 1)].src).play();
                }
                break;
            case ' ':
                let element = '　';

                if(me.facing == 'top'){
                    element = getText((p) => {return([(me.y - p.y - 1), (me.x - p.x)]);});
                }
                else if(me.facing == 'bottom'){
                    element = getText((p) => {return([(me.y - p.y + 1), (me.x - p.x)]);});
                }
                else if(me.facing == 'left'){
                    element = getText((p) => {return([(me.y - p.y), (me.x - p.x - 1)]);});
                }
                else if(me.facing == 'right'){
                    element = getText((p) => {return([(me.y - p.y), (me.x - p.x + 1)]);});
                }
                interact(element);
                break;
        }
        if(lastFacing != me.facing){
            me.ani.arrow = 1;
        }
        if(me.x !== lastMeX){
            LSCmd('set', 'meX', me.x);
        }
        if(me.y !== lastMeY){
            LSCmd('set', 'meY', me.y);
        }
    }
    function aniLoop(lvw, lvh){
        // resize
        if(vw() != lvw || vh() != lvh){
            if(vw()/vh() > ratio){
                cvs.style.width = 'calc(100vh/1024*1536)';
                cvs.style.height = '100vh';
                cvs.width = 100*vh()/1024*1536;
                cvs.height = 100*vh();
                aniCvs.width = 100*vh()/1024*1536;
                aniCvs.height = 100*vh();
            }
            else{
                cvs.style.width = '100vw';
                cvs.style.height = 'calc(100vw/1536*1024)';
                cvs.width = 100*vw();
                cvs.height = 100*vw()/1536*1024;
                aniCvs.width = 100*vw();
                aniCvs.height = 100*vw()/1536*1024;
            }
            cw = cvs.width/100;
            ch = cvs.height/100;
        }

        // background
        ctx.fillStyle = 'black';
        ctx.fillRect(0, 0, cvs.width, cvs.height);
        // ctx.strokeStyle = 'white';
        // ctx.strokeRect(0, 0, cvs.width, cvs.height);

        // map
        ctx.fillStyle = 'white';
        drawList(map[map.now].inner, map[map.now].position.x, map[map.now].position.y, 'map');
        
        // dialog
        dialog.draw();

        // me
        let timeLag = (time()-me.timestamp) / 30;
        me.timestamp = time();
        me.ani.x += (0-me.ani.x)*me.decay.x*timeLag;
        me.ani.y += (0-me.ani.y)*me.decay.y*timeLag;
        me.ani.sx += (0-me.ani.sx)*me.decay.sx*timeLag;
        me.ani.sy += (0-me.ani.sy)*me.decay.sy*timeLag;
        me.ani.arrow += (0-me.ani.arrow)*me.decay.arrow*timeLag;
        drawText('我', me.x-me.ani.x, me.y-me.ani.y, 1-me.ani.sx, 1-me.ani.sy);
        drawText('我', dialog.fakeMe.x, dialog.fakeMe.y);
        ctx.fillStyle = `rgba(255, 255, 255, ${me.ani.arrow})`;
        let arrowGap = 0.8;
        switch(me.facing){
            case 'top':
                drawText('▲', (me.x-me.ani.x)*2+1.5, (me.y-me.ani.y)-arrowGap, 0.5, 0.5);
                break;
            case 'bottom':
                drawText('▼', (me.x-me.ani.x)*2+1.5, (me.y-me.ani.y)+arrowGap, 0.5, 0.5);
                break;
            case 'left':
                drawText('◀', (me.x-me.ani.x)*2+1.5-arrowGap*2, (me.y-me.ani.y), 0.5, 0.5);
                break;
            case 'right':
                drawText('▶', (me.x-me.ani.x)*2+1.5+arrowGap*2, (me.y-me.ani.y), 0.5, 0.5);
                break;
        }
        setTimeout(aniLoop, 30, vw(), vh());
    }
    aniLoop(0, 0);
    function getElementPosition(x, y, sx = 1, sy = 1){
        let e = element, 
        ax = e.ax/sx, 
        ay = e.ay/sy;
        x = x+sx;
        y = y/sy;
        return({
            x:((x+ax)*e.w*e.r*cw), 
            y:((y+ay)*e.h*e.r*ch)
        });
    }
    function drawText(text, x, y, sx = 1, sy = 1){
        let e = element, 
        ax = e.ax/sx, 
        ay = e.ay/sy;
        x = x+sx;
        y = y/sy;
        if(sx != 1 || sy != 1){
            ctx.save();
            ctx.scale(sx, sy);
        }
        else if(x < 0 || ((x+ax)*e.w*e.r*cw) > cvs.width-ax || y < 0 || ((y+ay)*e.h*e.r*ch) > cvs.height-ay){
            return;
        }
        ctx.font = `${3*cw}px ${font}`;
        ctx.textAlign = "center";
        ctx.textBaseline = 'middle';
        ctx.fillText(text, ((x+ax)*e.w*e.r*cw), ((y+ay)*e.h*e.r*ch));
        if(sx != 1 || sy != 1){
            ctx.restore();
        }
    }
    function aniDrawText(text, x, y, sx = 1, sy = 1){
        let e = element, 
        ax = e.ax/sx, 
        ay = e.ay/sy;
        x = x+sx;
        y = y/sy;
        if(sx != 1 || sy != 1){
            aniCtx.save();
            aniCtx.scale(sx, sy);
        }
        else if(x < 0 || ((x+ax)*e.w*e.r*cw) > aniCvs.width-ax || y < 0 || ((y+ay)*e.h*e.r*ch) > aniCvs.height-ay){
            return;
        }
        aniCtx.font = `${3*cw}px ${font}`;
        aniCtx.textAlign = "center";
        aniCtx.textBaseline = 'middle';
        aniCtx.fillText(text, ((x+ax)*e.w*e.r*cw), ((y+ay)*e.h*e.r*ch));
        if(sx != 1 || sy != 1){
            aniCtx.restore();
        }
    }
    function drawList(list, ax, ay, is = 'undefined'){
        for(let ih = 0; ih < list.length; ih++){
            for(let iw = 0; iw < list[ih].length; iw++){
                if(is == 'dialog'){
                    dialog.renderingAni(list[ih][iw], iw, ih);
                }
                else if(is == 'map'){
                    let effect = map[map.now].effect, 
                    key = `${iw},${ih}`;
                    if(key in effect){
                        effect[key][0]();
                    }
                    drawText(list[ih][iw], ax+iw, ay+ih);
                    if(key in effect){
                        effect[key][1]();
                    }
                }
                else{
                    drawText(list[ih][iw], ax+iw, ay+ih);
                }
            }
        }
    }
    function interact(text){
        if(text.length != 1 || text == ' ' || text == '　'){
            return;
        }
        if(map.now == 'bedroom'){
            var mp = map[map.now].position, 
            mi = map[map.now].inner;
            if(me.y > mp.y && me.y < mp.y+mi.length && me.x > mp.x && me.x < mp.x+mi[me.y-mp.y].length){
                switch(text){
                    case '門':
                        dialog.show([
                            '去客廳？', 
                            '算了。', 
                            '出了房門便又要被碎念給摧殘。'
                        ], 1, 1);
                        break;
                    case '牆':
                        dialog.show([
                            '雪白的水泥牆上頭空無一物，', 
                            '正如同我的心境。'
                        ], 1, 1);
                        break;
                    case '窗':
                        dialog.show([
                            '外頭的雨水傾瀉而下，', 
                            '我的思緒也就這樣被沖刷地一乾二淨。'
                        ], 1, 1);
                        break;
                    case '床':
                        dialog.show([
                            '柔軟的床鋪依舊是那熟悉的觸感，', 
                            '大概…也只有它願意抱我吧？'
                        ], 1, 1);
                        break;
                    case '枕':
                        dialog.show([
                            '枕頭上的淚水早已乾涸，', 
                            '事到如今又有說不完的故事想向它傾吐。'
                        ], 1, 1);
                        break;
                    case '桌':
                        dialog.show([
                            '淺褐色的木紋書桌上沾了些許泥土，', 
                            '或許是進門時，', 
                            '直接將書包置於桌上導致的。'
                        ], 1, 1);
                        break;
                    case '椅':
                        dialog.show([
                            '暗沉的黑色椅背四周，', 
                            '是那純白的車線。', 
                            '整張椅子最顯眼的地方，', 
                            '大概便是加粗的鵝黃色LOGO了。'
                        ], 1, 1);
                        break;
                    case '燈':
                        dialog.show([
                            '是那半尺高的桌燈，', 
                            '為這昏暗的角落帶來光亮，', 
                            '為我低落的情緒帶來溫暖。'
                        ], 1, 1);
                        break;
                    case '機':
                        dialog.show([
                            '　打開手機，', 
                            '滑著相簿，', 
                            '裡頭沒有半張照片。'
                        ], 1, 1);
                        dialog.fakeMe.x = me.x;
                        dialog.fakeMe.y = me.y;
                        me.x = dialog.position.x; //dialog.inner
                        me.y = dialog.position.y; //dialog.inner
                        break;
                    case '照':
                        let list = [
                            '不，只不過是載入時間較長罷了。', 
                            '記憶中的景象爬滿了鏡面般的螢幕，', 
                            '使得畫面上不再只是映著我空洞迷惘的臉龐。', 
                        ];
                        if(JSON.stringify(dialog.inner) == JSON.stringify(list)){
                            window.removeEventListener('keydown', keydown, false);
                            $('#preamble-box').style.transition = '5s';
                            $('#preamble-box').style.opacity = 0;
                            $('#preamble-box').style.filter = 'blur(1vw)';
                            setTimeout(() => {
                                $('#preamble-box').setAttribute('hide', '');
                                quit();
                            }, 0.5*1000);
                        }
                        else{
                            dialog.show(list, 1, 1);
                        }
                        break;
                }
            }
            switch(text){
                case '沒':
                    if(map.now == 'bedroom'){
                        text = dialog.getPosition('沒');
                        dialog.addAni(text.x, text.y, 'delete', () => {
                            map.bedroom.inner[3][2] = '照';
                            LSCmd('set', 'photoFlag', 'true');
                            dialog.show(['']);
                        });
                        me.x = dialog.fakeMe.x;
                        me.y = dialog.fakeMe.y;
                        dialog.fakeMe.x = -1;
                        dialog.fakeMe.y = -1;
                    }
                    break;
            }
        }
    }
    function quit(){
        dialog.show(['']);
        preambleExited = true;
        setTimeline();
    }
}