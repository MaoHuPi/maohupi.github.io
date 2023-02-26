/*
 * 2023 © MaoHuPi
 * seatRandomizer/script/main.js
 */

'use strict'

const developerMod = false;
const body = document.body;
let contentType = 'empty';

// mouse
let MX = 0, 
    MY = 0;
window.addEventListener('mousemove', (event) => {
    MX = event.pageX;
    MY = event.pageY;
});
window.addEventListener('mousedown', (event) => {
    MX = event.pageX;
    MY = event.pageY;
});

// bar
$$('.bar').forEach(bar => {
    bar.move = false;
    bar.moveFun = function(){
        let moveTypeIsX = this.getAttribute('moveType') == 'h';
        let unit = moveTypeIsX ? vw() : vh(), 
            value = moveTypeIsX ? MX : MY;
        body.style.setProperty(
            `--${this.id}`, 
            `${Math.min(Math.max(0, value/unit), 100)}%`
        );
        if(this.move){
            setTimeout(() => {
                this.moveFun();
            }, 30);
        }
    }
    bar.addEventListener('mousedown', () => {
        bar.move = true;
        bar.moveFun();
    });
    bar.addEventListener('mouseup', () => {
        bar.move = false;
    });
    window.addEventListener('mouseup', () => {
        bar.move = false;
    });
});

// viewBox
let viewBox = $('#viewBox');
let viewBox_table = $('#viewBox-table');
viewBox.move = false;
[viewBox.oMX, viewBox.oMY, viewBox.oMW, viewBox.oMH, viewBox.MW, viewBox.MH] = [0, 0, 0, 0, 0, 0];
viewBox.moveFun = function(){
    viewBox.MW = viewBox.oMW + (MX - viewBox.oMX);
    viewBox.MH = viewBox.oMH + (MY - viewBox.oMY);
    viewBox.style.setProperty('--moveW', `${viewBox.MW}px`);
    viewBox.style.setProperty('--moveH', `${viewBox.MH}px`);
    if(this.move){
        setTimeout(() => {
            this.moveFun();
        }, 30);
    }
}
function moveStart(){
    viewBox.move = true;
    [viewBox.oMX, viewBox.oMY, viewBox.oMW, viewBox.oMH] = [MX, MY, viewBox.MW, viewBox.MH];
    viewBox.moveFun();
}
function moveEnd(){
    viewBox.move = false;

}
viewBox.addEventListener('mousedown', moveStart);
viewBox.addEventListener('mouseup', moveEnd);
window.addEventListener('mouseup', moveEnd);
viewBox.scale = 1;
viewBox.addEventListener('wheel', (event) => {
    event.preventDefault();
    viewBox.scale += event.deltaY * -0.01;
    viewBox.scale = Math.min(Math.max(0.1, viewBox.scale), 5);
    viewBox.style.setProperty('--scale', viewBox.scale);
});

// controlBox content
let contentTypes = ['empty', 'number', 'lock', 'disable'];
let controlBox_content = $('#controlBox-content');
for(let buttonName of contentTypes){
    let row = $e('div'), 
        radio = $e('input'), 
        check = $e('input'), 
        radioMark = $e('div'), 
        name = $e('label'), 
        preview = $e('input'), 
        visibleBtn = $e('button'), 
        deleteBtn = $e('button');
    radio.id = `content-type-${buttonName}`;
    radio.type = 'radio';
    radio.name = 'content-type';
    radio.value = buttonName;
    row.appendChild(radio);
    check.id = `content-visible-${buttonName}`;
    check.type = 'checkbox';
    check.checked = true;
    row.appendChild(check);
    name.setAttribute('for', radio.id);
    name.innerText = buttonName;
    row.appendChild(name);
    preview.type = 'text';
    preview.className = buttonName;
    preview.disabled = true;
    row.appendChild(preview);
    visibleBtn.className = 'visibleBtn';
    visibleBtn.innerText = 'visi';
    visibleBtn.onclick = () => {
        check.click();
        viewBoxUpdate();
    };
    row.appendChild(visibleBtn);
    deleteBtn.className = 'deleteBtn';
    deleteBtn.innerText = 'dele';
    deleteBtn.onclick = () => {
        seatMap.deleteType(buttonName);
        viewBoxUpdate();
    };
    row.appendChild(deleteBtn);
    radioMark.className = 'radioMark centerBoth';
    radioMark.innerText = '>';
    row.appendChild(radioMark);
    row.onclick = () => {
        radio.click();
    };
    controlBox_content.appendChild(row);
}
$(`#content-type-${contentType}`).click();


// seat map
class Seat{
    constructor(num = 0, type = 'number'){
        this.num = num;
        this.type = type;
    }
}
class SeatMap{
    #w = 3;
    #h = 2;
    #array = 2;
    #resize = function(){
        this.#array = new Array(this.#w * this.#h).fill(0).map(() => new Seat(0, 'empty'));
    }
    #maxNum = function(){
        return(this.#array.length - this.#array.filter(seat => seat.type == 'disable').length);
    }
    #toDict = function(){
        let seatDict = {};
        for(let i = 0; i < this.#array.length; i++){
            let seat = this.#array[i];
            if(seat.num != 0){
                seatDict[seat.num] = {
                        num: seat.num, 
                        x: i % this.#w, 
                        y: Math.floor(i / this.#w), 
                        type: seat.type
                };
            }
        }
        return(seatDict);
    }
    #toList = function(){
        let seatList = [];
        for(let i = 0; i < this.#array.length; i++){
            let seat = this.#array[i];
            if(seat.num != 0){
                seatList.push({
                        num: seat.num, 
                        x: i % this.#w, 
                        y: Math.floor(i / this.#w), 
                        type: seat.type
                });
            }
        }
        return(seatList);
    }
    constructor(w = 3, h = 2){
        this.#w = w;
        this.#h = h;
        this.#resize();
    }
    set w(num){
        if(num !== false && num > 0){
            if(this.#w > num){
                for(let i = 0; i < this.#h; i++){
                    this.#array.splice((i+1)*num, this.#w - num);
                }
            }
            else if(this.#w < num){
                for(let i = 0; i < this.#h; i++){
                    this.#array.splice(num*i + this.#w, 0, ...new Array(num-this.#w).fill(0).map(() => new Seat(0, 'empty')));
                }
            }
            this.#w = parseInt(num);
        }
    }
    set h(num){
        if(num !== false && num > 0){
            if(this.#h > num){
                this.#array.splice(num*this.#w, (this.#h - num)*this.#w);
            }
            else if(this.#h < num){
                this.#array.push(...new Array((num - this.#h)*this.#w).fill(0).map(() => new Seat(0, 'empty')));
            }
            this.#h = parseInt(num);
        }
    }
    get w(){return(this.#w)}
    get h(){return(this.#h)}
    get array(){return(this.#array)}
    setNum(x = 0, y = 0, num = 1){
        let maxNum = this.#maxNum();
        let seat = this.#array[x + y*this.#w];
        let oldNum = seat.num;
        seat.num = Math.max(Math.min(num, maxNum), 1);
        for(let seat2 of this.#array){
            if(seat2 !== seat && seat2.num == seat.num){
                seat2.num = oldNum;
            }
        }
    }
    setType(x = 0, y = 0, type = 'number'){
        let seat = this.#array[x + y*this.#w];
        seat.type = type;
        if(type == 'disable'){
            seat.num = 0;
        }
    }
    deleteType(type = 'number'){
        for(let seat of this.#array){
            if(seat.type == type){
                seat.type = 'empty';
            }
        }
    }
    format(){
        let maxNum = this.#maxNum();
        let useableNums = new Array(maxNum).fill(0).map((n, i) => i+1);
        let outOfRangeSeats = [];
        for(let seat of this.#array){
            if(['empty', 'disable'].indexOf(seat.type) > -1){
                seat.num = 0;
            }
            else if(seat.num > maxNum || seat.num < 1){
                outOfRangeSeats.push(seat);
            }
            else{
                useableNums.splice(useableNums.indexOf(seat.num), 1);
            }
        }
        for(let seat of outOfRangeSeats){
            seat.num = useableNums.shift();
        }
    }
    random(){
        this.format();
        let maxNum = this.#maxNum();
        let useableNums = new Array(maxNum).fill(0).map((n, i) => i+1);
        for(let seat of this.#array){
            let index = useableNums.indexOf(seat.num);
            if(index > -1){
                useableNums.splice(index, 1);
            }
        }
        useableNums = useableNums.sort(() => Math.random() - 0.5);
        for(let seat of this.#array){
            if(seat.type == 'empty'){
                seat.type = 'number';
                seat.num = useableNums.shift();
            }
        }
    }
    score(forceList = false){
        if(forceList === false){
            forceList = getForceList();
        }
        let score = 0;
        let seatDict = this.#toDict();
        for(let force of forceList){
            let seat1 = seatDict[force.num1];
            let seat2 = seatDict[force.num2];
            let d = distance([seat1.x, seat1.y], [seat2.x, seat2.y]);
            score += d * -force.forceValue;
        }
        return(score);
    }
    force(){
        this.random();
        let forceList = getForceList();
        let seatList = this.#toList();
        function center(...pList){
            let pC = {x: 0, y: 0};
            for(let p of pList){
                pC.x += p.x;
                pC.y += p.y;
            }
            pC.x /= pList.length;
            pC.y /= pList.length;
            return(pC);
        }
        let seatDict = {};
        seatList.map(seat => seatDict[seat.num] = seat);
        for(let i = 0; i < 10; i++){
            for(let key1 in seatDict){
                for(let key2 in seatDict){
                    if(key1 != key2){
                        let seatList2 = [seatDict[key1], seatDict[key2]];
                        let pC = center(...seatList2);
                        for(let seat of seatList2){
                            if(seat.type != 'lock'){
                                seat.fx == undefined ? seat.fx = 0 : false;
                                seat.fy == undefined ? seat.fy = 0 : false;
                                let rad = Math.atan2((pC.y - seat.y), (pC.x - seat.x));
                                let fx = Math.cos(rad) * 1;
                                let fy = Math.sin(rad) * 1;
                                seat.fx += fx * -1;
                                seat.fy += fy * -1;
                            }
                        }
                    }
                }
            }
            for(let force of forceList){
                let seatList2 = [seatDict[force.num1], seatDict[force.num2]];
                let pC = center(...seatList2);
                for(let seat of seatList2){
                    if(seat.type != 'lock'){
                        seat.fx == undefined ? seat.fx = 0 : false;
                        seat.fy == undefined ? seat.fy = 0 : false;
                        let rad = Math.atan2((pC.y - seat.y), (pC.x - seat.x));
                        let fx = Math.cos(rad) * 1;
                        let fy = Math.sin(rad) * 1;
                        if(force.forceValue > 0 && distance([0, 0], [fx, fy]) > distance(seat, pC)){
                            continue;
                        }
                        seat.fx += fx * force.forceValue;
                        seat.fy += fy * force.forceValue;
                    }
                }
            }
            for(let key in seatDict){
                let seat = seatDict[key];
                if(seat.type != 'lock'){
                    seat.x += seat.fx;
                    seat.y += seat.fy;
                }
            }
        }
        seatList.map(seat => seat = seatDict[seat.num]);
        let oldArray = this.#array;
        this.#resize();
        for(let seat of seatList.filter(seat => seat.type == 'lock')){
            let target = this.#array[seat.x + seat.y*this.#w];
            [target.num, target.type] = [seat.num, seat.type];
            seatList.splice(seatList.indexOf(seat), 1);
        }
        for(let arr of oldArray.map((n, i) => [n, i]).filter(arr => ['disable'].indexOf(arr[0].type) > -1)){
            let target = this.#array[arr[1]];
            [target.num, target.type] = [arr[0].num, arr[0].type];
        }

        let pNow = seatList.sort((a, b) => (a.x+a.y) - (b.x+b.y))[0];
        let pos = {x: 0, y: 0};
        let seatListLen = seatList.length;
        for(let i = 0; i < seatListLen; i++){
            let target = this.#array[pos.x + pos.y*this.#w];
            [target.num, target.type] = [pNow.num, pNow.type];
            let pNowOri = pNow;
            pNow = deepCopy(pNow);
            seatList.splice(seatList.indexOf(pNowOri), 1);
            if(seatList.length < 1){
                break;
            }
            let pNeighbor = closest(pNow, seatList);
            let neighborXOrY = [['x', Math.abs(pNow.x - pNeighbor.x)], ['y', Math.abs(pNow.y - pNeighbor.y)]].sort((a, b) => b[1] - a[1])[0][0];
            let neighborPOrN = {x: pNow.x < pNeighbor.x, y: Math.abs(pNow.y < pNeighbor.y)}[neighborXOrY] ? 1 : -1;
            let useableSeat = this.#array
                .map((seat, i) => [{x: i%this.#w, y: Math.floor(i/this.#w)}, seat])
                .filter(arr => arr[1].type == 'empty')
                .filter(arr => 
                    // (arr[0][neighborXOrY] > pNow[neighborXOrY] == neighborPOrN > 0 ||
                    // arr[0][neighborXOrY == 'x' ? 'y' : 'x'] == pNow[neighborXOrY == 'x' ? 'y' : 'x']) && 
                    !(arr[0].x == pNow.x && arr[0].y == pNow.y)
                );
            let pNext = useableSeat.map(arr => [arr[0], arr[1], distance(pNow, arr[0])]).sort((a, b) => a[2] - b[2])[0];
            try{
                pos = pNext[0];
                pNow = pNeighbor;
            }
            catch(e){
                console.log(e);
                return;
            }
        }

        // for(let x = 0; x < this.#w; x++){
        //     // seatList = seatList.sort((a, b) => a.x - b.x).filter(seat => seat !== undefined);
        //     // let clo = seatList.splice(0, this.#w);
        //     // clo = clo.sort((a, b) => a.y - b.y);
        //     // console.log(clo);
        //     for(let y = 0; y < this.#h; y++){
        //         if(this.#array[x + y*this.#w].type == 'empty'){
        //             let seat = seatList.shift();
        //             // let seat = clo.shift();
        //             let target = this.#array[x + y*this.#w];
        //             console.log(target, seat);
        //             [target.num, target.type] = [seat.num, seat.type];
        //         }
        //     }
        //     // seatList.push(...clo);
        // }
    }
    force2(){
        let forceList = getForceList();
        let data = [];
        for(let _ = 0; _ < 100; _++){
            this.deleteType('number');
            this.random();
            let score = this.score(forceList);
            let dump = JSON.stringify(this.dump());
            data.push({score: score, dump: dump});
        }
        let scoreList = data.map(d => d.score);
        let best = data[scoreList.indexOf(Math.max(...scoreList))];
        this.load(JSON.parse(best.dump));
    }
    saveImage(){
        const cvs = $e('canvas');
        const ctx = cvs.getContext('2d');
        let cellW = 100;
        let cellH = 100/5*3;
        let w = this.#w;
        let h = this.#h;
        let array = this.#array;
        cvs.width = cellW * w;
        cvs.height = cellH * h;
        ctx.fillStyle = 'white';
        ctx.fillRect(0, 0, cvs.width, cvs.height);
        ctx.strokeStyle = 'black';
        ctx.lineWidth = 1;
        ctx.fillStyle = 'black';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.font = `${Math.min(cellW, cellH)}px Arial`;
        for(let wi = 0; wi < w; wi++){
            for(let hi = 0; hi < h; hi++){
                let text = array[wi + hi*w].num.toString();
                ctx.strokeRect(wi*cellW, hi*cellH, cellW, cellH);
                ctx.fillText(text == '0' ? 'X' : text, (wi+0.5)*cellW, (hi+0.5*1.2)*cellH);
            }
        }
        let link = $e('a');
        link.href = cvs.toDataURL();
        link.download = 'seatRandomizer.png';
        link.click();
        link.remove();
        alert('Image Saved!');
    }
    dump(){
        return({
            w: this.#w, 
            h: this.#h, 
            array: this.#array
        });
    }
    load(data){
        this.#w = data.w;
        this.#h = data.h;
        this.#resize();
        for(let i = 0; i < this.#array.length; i++){
            this.#array[i].num = data.array[i].num;
            this.#array[i].type = data.array[i].type;
        }
    }
    toString(){
        return(JSON.stringify(this.dump()));
    }
}

let seatMap = new SeatMap(3, 2);
function viewBoxUpdate(){
    let array = seatMap.array;
    let deltaLen = array.length - viewBox_table.children.length;
    let children = viewBox_table.children;
    if(deltaLen > 0){
        for(let i = 0; i < deltaLen; i++){
            let input = $e('input');
            viewBox_table.appendChild(input);
        }
    }
    else if(deltaLen < 0){
        for(let i = 0; i < -deltaLen; i++){
            children[children.length - 1].remove();
        }
    }
    viewBox_table.style.setProperty('--hNum', seatMap.w);
    viewBox_table.style.setProperty('--vNum', seatMap.h);
    let visibleDict = {};
    [...$$(`[id|=content-visible]`)].forEach(n => visibleDict[n.id.split('-')[2]] = n.checked);
    for(let i = 0; i < array.length; i++){
        if(!visibleDict[array[i].type]){
            children[i].type = 'text';
            children[i].value = '';
            children[i].className = 'empty';
            children[i].disabled = true;
        }
        else{
            children[i].type = 'text';
            children[i].value = array[i].num == 0 ? '' : array[i].num;
            children[i].className = array[i].type;
            children[i].disabled = ['empty', 'disable'].indexOf(array[i].type) > -1;
        }
    }
}
viewBoxUpdate();
$('#controlBox-size-width').onchange = function(){
    seatMap.w = this.value;
    seatMap.format();
    viewBoxUpdate();
}
$('#controlBox-size-height').onchange = function(){
    seatMap.h = this.value;
    seatMap.format();
    viewBoxUpdate();
}
viewBox_table.addEventListener('click', function(event){
    let target = event.target;
    let index = new Array(...this.children).indexOf(target);
    if(index > -1){
        let x = index % seatMap.w;
        let y = Math.floor(index / seatMap.w);
        contentType = $('[name="content-type"]:checked').value;
        seatMap.setType(x, y, contentType);
        seatMap.format();
        viewBoxUpdate();
    }
});
viewBox_table.addEventListener('change', function(event){
    let target = event.target;
    let index = new Array(...this.children).indexOf(target);
    if(index > -1){
        let x = index % seatMap.w;
        let y = Math.floor(index / seatMap.w);
        seatMap.setNum(x, y, parseInt(target.value));
        viewBoxUpdate();
    }
});

// pages force
let tabBox_pages_forceList = $('#tabBox-pages-force > div');
function addForce(){
    let div = $e('div'),
        num1 = $e('input'), 
        num2 = $e('input'), 
        mode = $e('button'), 
        forceValue = $e('input');
    num1.type = 'number';
    num1.className = 'num1';
    num1.setAttribute('placeholder', 'num 1');
    div.appendChild(num1);
    num2.type = 'number';
    num2.className = 'num2';
    num2.setAttribute('placeholder', 'num 2');
    div.appendChild(num2);
    mode.className = 'mode';
    mode.value = '+';
    mode.addEventListener('click', () => {
        mode.value = mode.value == '+' ? '-' : '+';
    });
    div.appendChild(mode);
    forceValue.type = 'number';
    forceValue.className = 'forceValue';
    forceValue.setAttribute('placeholder', 'force value');
    div.appendChild(forceValue);
    tabBox_pages_forceList.appendChild(div);
    return(div);
}
$('#tabBox-pages-force .addBtn').addEventListener('click', addForce);
function getForceList(){
    let forceList = [...tabBox_pages_forceList.children]
        .map(n => {
            let force = {
                num1: parseInt($('.num1', n).value), 
                num2: parseInt($('.num2', n).value), 
                forceValue: ($('.mode', n).value == '+' ? 1 : -1) * parseFloat($('.forceValue', n).value), 
            };
            for(let key in force){
                if(['undefined', 'null', 'NaN'].indexOf(force[key].toString()) > -1){
                    return;
                }
            }
            return(force);
        })
        .filter(force => force);
    return(forceList);
}
function setForceList(forceList){
    tabBox_pages_forceList.innerHTML = '';
    for(let force of forceList){
        let forceDiv = addForce();
        $('.num1', forceDiv).value = force.num1;
        $('.num2', forceDiv).value = force.num2;
        $('.mode', forceDiv).value = force.forceValue < 0 ? '-' : '+';
        $('.forceValue', forceDiv).value = Math.abs(force.forceValue);
    }
}

let tabBox = $('#tabBox');
let tabBox_icons = $('#tabBox-icons');
let pageNow = 'about';
function changePage(page){
    $(`#tabBox-pages-${pageNow}`).removeAttribute('show');
    $(`#tabBox-pages-${pageNow}-icon`).removeAttribute('show');
    pageNow = page;
    $(`#tabBox-pages-${pageNow}`).setAttribute('show', '');
    $(`#tabBox-pages-${pageNow}-icon`).setAttribute('show', '');
}
[...$('#tabBox-pages').children].forEach(page => {
    let icon = $e('div');
    icon.id = `${page.id}-icon`;
    let pageName = icon.id.split('-')[2];
    icon.title = pageName;
    icon.style.setProperty('--bgi', `url('../image/page-${pageName}.svg')`);
    icon.addEventListener('click', () => {
        changePage(pageName);
    });
    tabBox_icons.appendChild(icon);
});
changePage(pageNow);

$('#controlBox-method-random').addEventListener('click', () => {
    seatMap.random();
    viewBoxUpdate();
    alert('Seat Map "Randomed"!');
});
$('#controlBox-method-force').addEventListener('click', () => {
    // seatMap.force();
    seatMap.force2();
    viewBoxUpdate();
    alert('Seat Map "Forced"!');
});
$('#controlBox-method-saveImage').addEventListener('click', () => {
    seatMap.saveImage();
});

// project read/write
// copy from "MaoHuPi - texteditor"
async function openFile(){
    if(window.showOpenFilePicker){
        let options = {
            types: [
                {
                    description: 'Seat Randomizer Project',
                    accept: {
                        'text/plain': ['.txt', '.text', '.TXT', '.TEXT', '.json', '.JSON', '.seatrandproj', '.seatRandProj'], 
                        'application/json': ['.json', '.JSON']
                    }
                }
            ], 
            startIn: 'documents'
        };
        let [entry] = await showOpenFilePicker(options);
        if(entry){
            let file = await entry.getFile();
            window.fileEntry = entry;
            loadFile(file, 'file');
        }
    }
    else{
        let input = $element('input');
        input.type = 'file';
        input.setAttribute('description', 'Seat Randomizer Project');
        input.setAttribute('accept', 'text/plain');
        input.onchange = async (event) => {
            window.fileEntry = undefined;
    
            if(input.files && input.files.length > 0){
                let file = input.files[0], 
                    reader = new FileReader();
                reader.onloadend = () => {
                    loadFile(reader.result);
                }
                reader.readAsText(file);
            }
        }
        input.click();
    }
}
async function loadFile(jsonTextOrFile, type = 'text'){
    if(type == 'file'){
        let file = jsonTextOrFile;
        try{
            let text = await file.text();
            loadFile(text, 'text');
        }
        catch(error){
            if(developerMod){
                console.error(error);
            }
            let reader = new FileReader();
            reader.onloadend = () => {
                loadFile(reader.result, 'text');
            }
            reader.readAsText(file);
        }
    }
    else if(type == 'text'){
        let data = JSON.parse(jsonTextOrFile);
        seatMap.load(data.seatMap);
        setForceList(data.forceList);
        $('#controlBox-size-width').value = seatMap.w;
        $('#controlBox-size-height').value = seatMap.h;
        viewBoxUpdate();
    }
}
async function updateLocalFile(entry, text) {
    let writable = await entry.createWritable();
    await writable.write(text);
    await writable.close();
}
function saveFile(){
    let dlLink = $e('a');
    let content = JSON.stringify({
        seatMap: seatMap.dump(), 
        forceList: getForceList()
    });
    let errorFlag = false;
    try{
        if(window.fileEntry){
            updateLocalFile(window.fileEntry, content);
        }
        else{
            errorFlag = true;
        }
    }
    catch(error){
        if(developerMod){
            console.error(error);
        }
        errorFlag = true;
    }
    if(errorFlag){
        dlLink.href = 'data:text/html;charset=utf-8,'+encodeURIComponent(content);
        dlLink.download = 'seatRandomizer.seatRandProj';
        dlLink.click();
    }
    alert('File Saved!');
}
$('#controlBox-method-saveProject').addEventListener('click', saveFile);
$('#controlBox-method-openProject').addEventListener('click', openFile);
window.addEventListener('keydown', event => {
    if(event.ctrlKey){
        switch(event.key){
            case 's':
                cancelEvent(event);
                saveFile();
                break;
            case 'o':
                cancelEvent(event);
                openFile();
                break;
            case 'i':
                cancelEvent(event);
                seatMap.saveImage();
                break;
        }
    }
});
let dropMask = $('#dropMask');
function cancelEvent(event){
    event.stopPropagation();
    event.preventDefault();
}
function dragOver(event){
    cancelEvent(event);
    dropMask.setAttribute('dragover', 'true');
}
function dragLeave(event){
    cancelEvent(event);
    dropMask.setAttribute('dragover', 'false');
}
window.fileEntry = undefined;
async function dropFile(event) {
    dropMask.setAttribute('dragover', 'false');
    var dataTransfer = event.dataTransfer;
    window.fileEntry = undefined;
    try{
        if(dataTransfer.items.length > 0){
            var item = dataTransfer.items[0];
            if(item.kind === 'file'){
                cancelEvent(event);
                let entry = await item.getAsFileSystemHandle();
                if (entry.kind === 'file') {
                    let file = await entry.getFile();
                    window.fileEntry = entry;
                    loadFile(file, 'file');
                }
            }
        }
    }
    catch(error){
        if(developerMod){
            console.error(error);
        }
        if(dataTransfer.files && dataTransfer.files.length > 0){
            cancelEvent(event);
            let file = dataTransfer.files[0];
            loadFile(file, 'file');
        }
    }
}
window.addEventListener("dragenter", dragOver, false);
window.addEventListener("dragover", dragOver, false);
window.addEventListener("dragleave", dragLeave, false);
window.addEventListener("drop", dropFile, false);

// alert
// copy from "MaoHuPi - texteditor"
const messages = [];
let message = $('#message');
function alert(text){
    messages.push(text);
}
function alertController(){
    if(messages.length > 0){
        message.innerText = messages[0];
        message.setAttribute('message', 'show');
        messages.pop();
        setTimeout(() => {
            message.setAttribute('message', 'hide');
        }, 3e3);
        setTimeout(alertController, 3.5e3);
    }
    else{
        setTimeout(alertController, 1e2);
    }
}
alertController();