// path
let path = decodeURI($_GET['path']);
path = path.split('/');
if(path[0] == 'clear'){
    LSCmd('clear');
    path[0] = 'preamble';
}
if(path[0] == 'undefined' || path[0] == ''){
    path[0] = 'preamble';
}

// preamble
if(path[0] == 'preamble'){
    $('#preamble-box').removeAttribute('hide');
    preamble();
    changePath('preamble');
}

// timeline_point
class timeline_point{
    constructor(data, immediateInit = true){
        this.data = data;
        this.name = data['name'];
        this.date = new Date(data['date']).toJSON().split('T')[0];
        this.days = data['days'];
        this.cover = data['cover'];
        this.introduction = data['introduction'];
        // date.setDate(date.getDate()+1)
        if(parseInt(this.days) > 1){
            this.dateEnd = new Date(this.date);
            this.dateEnd.setDate(this.dateEnd.getDate()+parseInt(this.days)-1);
            this.dateEnd = this.dateEnd.toJSON().split('T')[0];
        }
        else{
            this.dateEnd = '';
        }
        this.element = {
            'block':document.createElement('div'), 
            'dot':document.createElement('div'), 
            'box':document.createElement('div'), 
            'mask':document.createElement('div'), 
            'title':document.createElement('span'), 
            'time':document.createElement('span')
        };
        if(immediateInit){
            this.init();
        }
    }
    init(){
        for(let name in this.element){
            this.element[name].timeline_point = this;
        }
        this.element.block.setAttribute('class', 'timeline-block');
        this.element.mask.setAttribute('class', 'mask');
        this.element.box.appendChild(this.element.mask);
        this.element.title.setAttribute('class', 'title');
        this.element.box.appendChild(this.element.title);
        this.element.time.setAttribute('class', 'time');
        this.element.box.appendChild(this.element.time);
        this.element.box.setAttribute('class', 'box');
        this.element.block.appendChild(this.element.box);
        this.element.dot.setAttribute('class', 'dot');
        this.element.block.appendChild(this.element.dot);
        this.element.box.addEventListener('click', (event) => {
            openIntroduction(this, event);
        });
    }
    pack(show = true){
        if(!($$('#timeline-box').length >= 1)){
            console.error('in "timeline_point.pack()":\ntimeline-box not found!');
            return;
        }
        this.element.title.innerText = this.name;
        this.element.box.setAttribute('title', this.name);
        this.element.time.innerText = parseInt(this.days) > 1 ? `${this.date}~${this.dateEnd}` : this.date;
        this.element.box.style.opacity = show ? 1 : 0;
        this.element.dot.style.opacity = show ? 1 : 0;
        this.element.box.style.backgroundImage = `url('${this.cover['url'].replaceAll('%date', this.date.replaceAll('-', ''))}')`;
        this.element.box.style.backgroundPositionY = this.cover['position-y'];
        $('#timeline-box').appendChild(this.element.block);
        // $('#timeline-box .points').appendChild(this.element.block);
    }
    aniIn(){
        for(let name in this.element){
            this.element[name].style.transition = '0s';
        }
        this.element.box.style.opacity = 1;
        this.element.box.style.transform = 'translate(100vw, 0px)';
        this.element.dot.style.opacity = 1;
        this.element.dot.style.transform = 'scale(0)';
        setTimeout(() => {
            for(let name in this.element){
                this.element[name].style.transition = '1.5s';
            }
            this.element.box.style.transform = 'translate(0px, 0px)';
            this.element.dot.style.transform = 'scale(var(--transform-scale))';
        }, 30);
    }
}

// timeline
let timeline = [];
sendXmlhttp('json/timeline.json', '', (response) => {
    try{
        response = JSON.parse(response);
    }
    catch(e){
        console.error(e);
    }
    timeline = response['points'];
    if(path[0] == 'menu' || preambleExited == true){
        setTimeline();
    }
}, 'get');
function setTimeline(){
    if(!(timeline.length >= 1)){
        return;
    }
    let points = [];
    timeline.forEach(point => {
        point['timestamp'] = new Date(point['date'].toNormalDate('-'));
    });
    timeline.sort((a, b) => {return(a['timestamp']-b['timestamp']);}).forEach(point => {
        let timelinePoint = new timeline_point(point), 
        img = new Image;
        points.push(timelinePoint);
        timelinePoint.pack(false);
        img.onload = () => {
            timelinePoint.aniIn();
            if(path[0] == 'menu' && path.length > 1 && timelinePoint['name'] == path[1]){
                openIntroduction(timelinePoint);
                if(path[2] == 'album'){
                    setTimeout(() => {
                        openAlbum();
                    }, 1.5*1000);
                }
            }
        }
        img.src = point['cover']['url'].replaceAll('%date', point['date'].replaceAll('-', ''));
    });
}

// introduction
$('#introduction-box').addEventListener('click', closeIntroduction);
function openIntroduction(timelinePoint){
    var box = $('#introduction-box'),
    mask = $('#introduction-mask'),
    background = $('.background', box),  
    title = $('.title', box), 
    time = $('.time', box), 
    introduction = $('.introduction', box), 
    pointBoxOffset = timelinePoint.element.box.offset();
    changePath(`menu/${timelinePoint['name']}`);
    box.timeline_point = timelinePoint;
    // mask
    mask.removeAttribute('hidden');
    // box
    box.openning = true;
    box.removeAttribute('hidden');
    box.style.transition = '0s';
    box.style.width = `${pointBoxOffset.width/vw()}vw`;
    box.style.height = `${pointBoxOffset.height/vh()}vh`;
    box.style.left = `${pointBoxOffset.left/vw()}vw`;
    box.style.top = `${(pointBoxOffset.top-$('#timeline-box').scrollTop)/vh()}vh`;
    // box.style.top = `${pointBoxOffset.top/vh()}vh`;
    box.style.borderRadius = '1vw';
    box.style.borderWidth = '1px';
    box.actionElement = timelinePoint;
    // background
    background.style.transition = '0s';
    background.style.backgroundImage = timelinePoint.element.box.style.backgroundImage;
    background.style.backgroundPositionY = timelinePoint.cover['position-y'];
    setBlur(background, '0px');
    // title
    title.style.transition = '0s';
    title.innerText = timelinePoint.name;
    title.style.fontSize = 'var(--timeline-block-box-title_font-style)';
    title.style.top = 'var(--timeline-block-box_padding)';
    title.style.left = 'var(--timeline-block-box_padding)';
    // time
    time.style.transition = '0s';
    time.innerText = parseInt(timelinePoint.days) > 1 ? `${timelinePoint.date}~${timelinePoint.dateEnd}` : timelinePoint.date;
    time.style.fontSize = 'var(--timeline-block-box-time_font-style)';
    time.style.bottom = 'var(--timeline-block-box_padding)';
    time.style.left = 'var(--timeline-block-box_padding)';
    // introduction
    introduction.style.transition = '0s';
    introduction.innerText = timelinePoint.introduction;
    introduction.style.fontSize = '0px';
    setTimeout(() => {
        // box
        box.style.transition = '1.5s';
        box.style.width = '100vw';
        box.style.height = '100vh';
        box.style.left = '0px';
        box.style.top = `0px`;
        // box.style.top = `${(0+$('#timeline-box').scrollTop)/vw()}vw`;
        box.style.borderRadius = '0px';
        box.style.borderWidth = '0px';
        // background
        background.style.transition = '1.5s';
        background.style.backgroundPositionY = 'center';
        setBlur(background, '5px');
        // title
        title.style.transition = '1.5s';
        title.style.fontSize = 'var(--introduction-box-title_font-style)';
        title.style.top = 'var(--introduction-box_padding)';
        title.style.left = 'var(--introduction-box_padding)';
        // time
        time.style.transition = '1.5s';
        time.style.fontSize = 'var(--introduction-box-time_font-style)';
        time.style.bottom = 'var(--introduction-box_padding)';
        time.style.left = 'var(--introduction-box_padding)';
        // introduction
        introduction.style.transition = '1.5s';
        introduction.style.fontSize = '2vw';
    }, 30);
    setTimeout(showAlbum, 1.5*1000);
}
function closeIntroduction(){
    var box = $('#introduction-box'),
    mask = $('#introduction-mask'),
    timelinePoint = box.actionElement, 
    background = $('.background', box),  
    title = $('.title', box), 
    time = $('.time', box), 
    introduction = $('.introduction', box), 
    pointBoxOffset = timelinePoint.element.box.offset();
    hideAlbum();
    path[3] = '1';
    // mask
    // mask.setAttribute('hidden', '');
    // box
    box.openning = false;
    box.style.width = `${pointBoxOffset.width/vw()}vw`;
    box.style.height = `${pointBoxOffset.height/vh()}vh`;
    box.style.left = `${pointBoxOffset.left/vw()}vw`;
    box.style.top = `${(pointBoxOffset.top-$('#timeline-box').scrollTop)/vh()}vh`;
    // box.style.top = `${pointBoxOffset.top/vh()}vh`;
    box.style.borderRadius = '1vw';
    box.style.borderWidth = '1px';
    // background
    background.style.backgroundImage = timelinePoint.element.box.style.backgroundImage;
    background.style.backgroundPositionY = timelinePoint.cover['position-y'];
    setBlur(background, '0px');
    // title
    title.innerText = timelinePoint.name;
    title.style.fontSize = 'var(--timeline-block-box-title_font-style)';
    title.style.top = 'var(--timeline-block-box_padding)';
    title.style.left = 'var(--timeline-block-box_padding)';
    // time
    time.innerText = parseInt(timelinePoint.days) > 1 ? `${timelinePoint.date}~${timelinePoint.dateEnd}` : timelinePoint.date;
    time.style.fontSize = 'var(--timeline-block-box-time_font-style)';
    time.style.bottom = 'var(--timeline-block-box_padding)';
    time.style.left = 'var(--timeline-block-box_padding)';
    // introduction
    introduction.innerText = timelinePoint.introduction;
    introduction.style.fontSize = '0px';
    setTimeout(() => {
        if(!box.openning){
            mask.setAttribute('hidden', '');
            box.setAttribute('hidden', '');
            changePath('menu')
        }
    }, 1.5*1000);
}
$('#introduction-mask').addEventListener('click', function(){
    this.setAttribute('hidden', '');
    $('#introduction-box').setAttribute('hidden', '');
});

// album
$('#album-button').addEventListener('click', openAlbum);
$('#album-box').addEventListener('click', closeAlbum);
$('#album-box').opened = false;
function showAlbum(){
    var button = $('#album-button');
    if(button && 'album' in $('#introduction-box').timeline_point.data){
        button.style.opacity = '1';
    }
}
function hideAlbum(){
    var button = $('#album-button');
    if(button){
        button.style.opacity = '0';
    }
}
function openAlbum(){
    var box = $('#album-box'), 
    row = $('#album-row'), 
    timeout = 0;
    changePath(`menu/${$('.title', $('#introduction-box')).innerText}/album`);
    if(box && 'album' in $('#introduction-box').timeline_point.data){
        if($('#introduction-box').timeline_point != box.timeline_point){
            (() => {
                row.innerHTML = '';
                let album = $('#introduction-box').timeline_point.data['album'];
                box.timeline_point = $('#introduction-box').timeline_point;
                for(let g in album){
                    let data = album[g];
                    if(!('images' in data && 'type' in data)){
                        return;
                    }
                    let group  = document.createElement('div');
                    group.style.width = '100vw';
                    group.style.height = '100vh';
                    group.setAttribute('group-number', g);
                    group.setAttribute('group-type', data.type);
                    if(!isPC()){
                        group.setAttribute('group-show', '');
                    }
                    let groupBackgroundFlag = !(data.images.length > 10);
                    for(let i in data.images){
                        let frame = document.createElement('div'), 
                        type = fileType(data.images[i]), 
                        item = type == 'image' ? new Image : type == 'video' ? document.createElement('video') : undefined;
                        if(item !== undefined){
                            item.onload = () => {
                                frame.appendChild(item);
                                frame.style.setProperty('--group-image-backgroundImage', `url("../${data.images[i]}")`);
                                frame.setAttribute('group-image', parseInt(i)+1);
                                frame.style.setProperty('--group-image-width', item.width);
                                frame.style.setProperty('--group-image-height', item.height);
                                if(groupBackgroundFlag){
                                    group.style.setProperty(`--group-image-backgroundImage${+i+1}`, `url("../${data.images[i]}")`);
                                    group.style.setProperty(`--group-image-width${+i+1}`, item.width);
                                    group.style.setProperty(`--group-image-height${+i+1}`, item.height);
                                }
                                group.appendChild(frame);
                            };
                            item.onloadeddata = () => {
                                ['muted', 'autoplay', 'loop'].forEach(attr => {
                                    item[attr] = true;
                                });
                                item.playbackRate = 0.2;
                                item.play();
                                frame.appendChild(item);
                                (() => {
                                    let cvs = document.createElement('canvas'), 
                                    ctx = cvs.getContext('2d');
                                    cvs.width = 50*vw();
                                    cvs.height = 50*vw()/item.videoWidth*item.videoHeight;
                                    ctx.drawImage(item, 0, 0, cvs.width, cvs.height);
                                    backgroundUrl = cvs.toDataURL();
                                    frame.style.setProperty('--group-image-backgroundImage', `url("${backgroundUrl}")`);
                                    if(groupBackgroundFlag){
                                        group.style.setProperty(`--group-image-backgroundImage${+i+1}`, `url("${backgroundUrl}")`);
                                    }
                                })();
                                frame.setAttribute('group-image', parseInt(i)+1);
                                frame.style.setProperty('--group-image-width', item.videoWidth);
                                frame.style.setProperty('--group-image-height', item.videoHeight);
                                if(groupBackgroundFlag){
                                    group.style.setProperty(`--group-image-width${+i+1}`, item.videoWidth);
                                    group.style.setProperty(`--group-image-height${+i+1}`, item.videoHeight);
                                }
                                group.appendChild(frame);
                            };
                            item.src = data.images[i];
                        }
                    }
                    for(let i in data.texts){
                        let item = document.createElement('div');
                        if(item !== undefined){
                            item.innerHTML = data.texts[i];
                            item.setAttribute('group-text', parseInt(i)+1);
                            group.appendChild(item);
                        }
                    }
                    row.appendChild(group);
                }
            })();
            timeout += 1;
            setTimeout(() => {
                box.scrollLeft = (parseInt(path[3])-1)*100*vw(); 
            }, 30);
        }
        showAniMask();
        box.removeAttribute('hidden');
        box.style.opacity = 1;
        setTimeout(() => {
            box.style.width = '100vw';
            box.style.borderRadius = '100vw 100vw 0px 0px';
        }, (0.5+timeout)*1000);
        setTimeout(() => {
            box.style.width = '100vw';
            box.style.height = '100vh';
            box.style.borderRadius = '0px';
        }, (1+timeout)*1000);
        setTimeout(() => {
            hideAniMask();
            $('#album-box').opened = true;
        }, (1.5+timeout)*1000);
        albumAni(+path[3]-1, time(), $('#album-box').scrollLeft);
    }
}
function closeAlbum(){
    var box = $('#album-box');
    changePath(`menu/${$('.title', $('#introduction-box')).innerText}`);
    if(box){
        $('#album-box').opened = false;
        showAniMask();
        setTimeout(() => {
            box.style.width = '100vw';
            box.style.height = 'var(--radius)';
            box.style.borderRadius = '100vw 100vw 0px 0px';
        }, 1*1000);
        setTimeout(() => {
            box.style.width = 'var(--radius)';
            box.style.height = 'var(--radius)';
            box.style.borderRadius = '100vw 0px 0px 0px';
        }, 1.5*1000);
        setTimeout(() => {
            box.style.width = 'var(--radius)';
            box.style.height = 'var(--radius)';
            box.style.borderRadius = '100vw 0px 0px 0px';
        }, 2*1000);
        setTimeout(() => {
            box.style.opacity = 0;
        }, 2.5*1000);
        setTimeout(() => {
            box.setAttribute('hidden', '');
            hideAniMask();
        }, 3*1000);
    }
}
// $('#album-box').addEventListener('wheel', () => {
//     scrollCount++;
// });
// function albumScrollCorrection(n = scrollCount){
//     if(scrollCount != n){
//         let box = $('#album-box'), 
//         scrollTimer;
//         clearTimeout(scrollTimer);
//         scrollTimer = setTimeout(() => {
//             let num = Math.floor(box.scrollLeft/(100*vw()) + 0.5);
//             box.scrollLeft = box.scrollLeft - (box.scrollLeft-num*100*vw())*0.05;
//         }, 1000);
//         n = scrollCount;
//     }
//     setTimeout(() => {
//         albumScrollCorrection(n);
//     }, 10);
// }
// albumScrollCorrection();
let lastNow = -1;
function albumScrollCheck(){
    if($('#album-box').getAttribute('hidden') == undefined){
        let box = $('#album-box'), 
        row = $('#album-row');
        if(row.children.length > 0){
            if(box.opened){
                let now = Math.floor(box.scrollLeft/(100*vw()) + 0.5);
                if(now > -1 && row.children.length > now){
                    if(now != lastNow){
                        lastNow = now;
                        changePath(`menu/${$('.title', $('#introduction-box')).innerText}/album/${+now+1}`);
                        path[3] = `${+now+1}`;
                        row.children[now].setAttribute('group-show', 'now');
                        for(let i = 0; i < now; i++){
                            row.children[i].setAttribute('group-show', 'left');
                        }
                        for(let i = now+1; i < row.children.length; i++){
                            row.children[i].setAttribute('group-show', 'right');
                        }
                    }
                }
            }
            else{
                [...$('#album-row').children].forEach(group => {
                    group.removeAttribute('group-show');
                });
                lastNow = -1;
            }
        }
    }
    setTimeout(albumScrollCheck, 30);
}
let lastScroll = -1, 
row_children_style_getProperty = [];
function albumScrollFrame(){
    if($('#album-box').getAttribute('hidden') == undefined){
        let box = $('#album-box'), 
        row = $('#album-row');
        if(row.children.length > 0){
            if(box.opened && box.scrollLeft != lastScroll){
                lastScroll = box.scrollLeft;
                let now = Math.floor(box.scrollLeft/(100*vw()) + 0.5);
                if(now > -1 && row.children.length > now){
                    for(let i = 0; i < row.children.length; i++){
                        let frameNumber = 1-Math.abs(box.scrollLeft/vw()/100 - i);
                        frameNumber = frameNumber > 1 ? 1 : (frameNumber < 0 ? 0 : frameNumber);
                        if(row_children_style_getProperty[i] != frameNumber){
                            row_children_style_getProperty[i] == frameNumber
                            row.children[i].style.setProperty('--group-frame', frameNumber);
                        }
                        if(Math.abs(now - i) < 2){
                            row.children[i].style.contentVisibility = 'visible';
                        }
                        else{
                            row.children[i].style.contentVisibility = 'hidden';
                        }
                    }
                }
            }
        }
    }
    setTimeout(albumScrollFrame, 1);
}
function albumAni(next, lastTime, lastScroll){
    let box = $('#album-box'), 
    DifferenceTime = time() - lastTime, 
    addStep = Math.abs(lastScroll - next*100*vw())*0.001*DifferenceTime, 
    DifferenceScroll = box.scrollLeft - next*100*vw();
    if(Math.abs(DifferenceScroll) > addStep){
        box.scrollLeft = box.scrollLeft - addStep*(DifferenceScroll/Math.abs(DifferenceScroll));
        lastTime = time();
        setTimeout(albumAni, 1, next, lastTime, lastScroll);
        isAni = true;
    }
    else{
        box.scrollLeft = next*100*vw();
        isAni = false;
    }
}
if(isPC()){
    (() => {
        let box = $('#album-box'), 
        row = $('#album-row'), 
        lastTime = time(), 
        lastScroll = 0, 
        isAni = false, 
        isAni2 = false, 
        now = Math.floor(box.scrollLeft/(100*vw()) + 0.5), 
        next = now;
        window.addEventListener('keydown', (event) => {
            if(['ArrowLeft', 'ArrowRight', ' '].indexOf(event.key) > -1){
                event.preventDefault();
                lastTime = time();
                lastScroll = box.scrollLeft;
                now = Math.floor(box.scrollLeft/(100*vw()) + 0.5);
                next = event.key == 'ArrowLeft' && now > 0 ? now - 1 : (event.key == 'ArrowRight' && now < row.children.length-1 ? now + 1 : now);
                if(!isAni){
                    ani();
                }
            }
            else if(event.key == 'Enter'){
                event.preventDefault();
                if(!isAni2){
                    ani2();
                }
            }
        });
        function ani(){
            let DifferenceTime = time() - lastTime, 
            addStep = Math.abs(lastScroll - next*100*vw())*0.001*DifferenceTime, /* stemp_o */
            // addStep = Math.abs(lastScroll - next*100*vw())*0.0001*DifferenceTime, /* stemp_n */
            DifferenceScroll = box.scrollLeft - next*100*vw();
            if(Math.abs(DifferenceScroll) > addStep){
                box.scrollLeft = box.scrollLeft - addStep*(DifferenceScroll/Math.abs(DifferenceScroll));
                lastTime = time();
                setTimeout(ani, 1);
                isAni = true;
            }
            else{
                box.scrollLeft = next*100*vw();
                isAni = false;
            }
        }
        function ani2(){
            let max = box.scrollWidth - 100*vw(), 
            now = $('#album-box').scrollLeft;
            if(max > now){
                box.scrollLeft += 1;
                setTimeout(ani2, 1);
                isAni2 = true;
            }
            else{
                box.scrollLeft = box.scrollWidth - 100*vw();
                isAni2 = false;
            }
        }
    })();
    albumScrollCheck();
    albumScrollFrame();
}

// ani mask
function showAniMask(){
    $('#animation-mask').removeAttribute('hidden');
}
function hideAniMask(){
    $('#animation-mask').setAttribute('hidden', '');
}

// functions
function setBlur(element = document.body, core = '5px'){
    element.style.WebkitFilter = `blur(${core})`;
    element.style.MozFilter = `blur(${core})`;
    element.style.OFilter = `blur(${core})`;
    element.style.MsFilter = `blur(${core})`;
    element.style.filter = `blur(${core})`;
}
function event_preventDefault(event) {
    event.preventDefault();
}
function changePath(url){
    history.pushState(null, '', `?path=${url}`);
}
function loadFont(name, path){
    let style = document.createElement('style');
    style.innerHTML = `@font-face {
        font-family: ${name};
        src: url('${path}');
    }`;
    $('#fonts').appendChild(style);
}
function LSCmd(type = 'all', key = '', value = ''){
    switch(type){
        case 'get':
            return(localStorage.getItem(key));
            break;
        case 'set':
            return(localStorage.setItem(key, value));
            break;
        case 'remove':
            return(localStorage.removeItem(key));
            break;
        case 'all':
            return(localStorage);
            break;
        case 'clear':
            localStorage.clear();
            break;
    }
}
function fileType(filename){
    let image = ['jpg', 'jpeg', 'png', 'gif', 'svg', 'webp', 'image', 'bmp', 'tiff', 'tif', 'mng', 'xpm'], 
    video = ['video', 'mov', 'mp4', 'mpeg', 'mpeg4', 'avi', 'wmv', 'flv'], 
    types = {'image':image, 'video':video};
    filename = filename.split('.');
    filename = filename[filename.length-1];
    for(let type in types){
        for(let name of types[type]){
            if(filename == name){
                return(type);
            }
        }
    }
}
function isPC() {
    let userAgent = navigator.userAgent, 
    Agent = ["Android","iPhone","SymbianOS","Windows Phone","iPad","iPod"];
    for(let i = 0; i < Agent.length; i++) {
        if(userAgent.indexOf(Agent[i]) > -1){
            return false;
        }
    }
    return true;
}
// $('#timeline-box').addEventListener('wheel', event_preventDefault);

window.addEventListener('keydown', (event) => {
    if(event.key == 'Escape'){
        if($('#album-box').getAttribute('hidden') == undefined){
            closeAlbum();
        }
        else if($('#introduction-box').getAttribute('hidden') == undefined){
            closeIntroduction();
        }
        else if($('#preamble-box').getAttribute('hide') == ''){
            setTimeout(() => {
                changePath('preamble');
                preamble();
                $('#preamble-box').removeAttribute('hide');
                $('#preamble-box').style.transition = '5s';
                $('#preamble-box').style.opacity = 1;
                $('#preamble-box').style.filter = 'blur(0px)';
            }, 30);
        }
    }
});