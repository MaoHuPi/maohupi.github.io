'use strict';

/* method */
function decodeExam(json){
    let data = JSON.parse(json.replaceAll('\n', '').replaceAll('\\"', '&34;'));
    for(let name in data){
        if('replaceAll' in data[name]){
            data[name] = data[name].replaceAll('&34;', '"');
        }
    }
    return(data);
}
function reHTML(text){
    return(text.replaceAll('&34;', '\"'));
}
async function loadImage(id, url){
    var bases = [
        'image/', 
        'http://bebras2.csie.ntnu.edu.tw/'
    ];
    var promiseList = [];
    for(let base of bases){
        promiseList.push(sendXmlhttpAsync(base + url, '', 'GET'));
    }
    for(let i = 0; i < promiseList.length; i++){
        if(i < promiseList.length - 1){
            promiseList[i].then(base => {
                if(base == false){
                    return(promiseList[i+1]);
                }
                $(`#${id}`).href = base + url;
            });
        }
    }
}
// loadImage('testImage', 'static/bebras/2022/2022-CA-06_C.svg');

/* main */
let examNum = $_GET['exam'];

sendXmlhttp(`json/${examNum}.json`, '', json => {
    let data = decodeExam(json);
    let exam = data[0];
    console.log(exam);
    $('#requestBase').setAttribute('href','http://bebras2.csie.ntnu.edu.tw/');
    $('#exam-title').innerHTML = reHTML(exam['title']);
    $('#exam-content').innerHTML = reHTML(exam['content']);
    var optionsElement = $('#exam-options');
    for(let option of exam['options']){
        let optionElement = document.createElement('div');
        optionElement.setAttribute('value', option[0]);
        optionElement.innerHTML = reHTML(option[1]);
        optionsElement.appendChild(optionElement);
    }
}, 'GET');
