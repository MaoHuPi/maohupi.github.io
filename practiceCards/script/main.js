/*
 * 2022 © MaoHuPi
 */
'use strict';
const container = $('#container'), 
    counter_deleteCount = $('#counter-deleteCount'), 
    counter_totalNum = $('#counter-totalNum'), 
    counter_turnOverCount = $('#counter-turnOverCount');
let lastDeleteTime = time();
let moveTakes = 0.5;
let turnOverCount = 0;
let deleteCount = 0;
let turnOveredCardElements = [];
let deletedCardElements = [];

function turnOverCountAdd(){
    turnOverCount++;
    counter_turnOverCount.innerText = turnOverCount.toString();
}
function deleteCountAdd(){
    deleteCount++;
    counter_deleteCount.innerText = deleteCount.toString();
}
function setTotalNum(num){
    counter_totalNum.innerText = num.toString();
}

function creatCard(front, back){
    let cardElement = document.createElement('div');
    let contentElement = document.createElement('p');
    contentElement.innerText = front;
    cardElement.appendChild(contentElement);
    cardElement.className = 'card';
    cardElement.setAttribute('content-type', 'front');
    cardElement.setAttribute('content-front', front);
    cardElement.setAttribute('content-back', back);
    cardElement.setAttribute('center', '');
    container.appendChild(cardElement);
    return(cardElement);
}
function turnOverCard(card, count = true){
    card.setAttribute('card-turnOver', '');
    card.setAttribute('card-turnOvering', '');
    let nextType = card.getAttribute('content-type') == 'front' ? 'back' : 'front';
    card.setAttribute('content-type', nextType);
    if(count && turnOveredCardElements.indexOf(card) <= -1){
        turnOveredCardElements.push(card);
        turnOverCountAdd();
    }
    setTimeout(() => {
        $('p', card).innerText = card.getAttribute(`content-${nextType}`);
        card.removeAttribute('card-turnOver');
        setTimeout(() => {
            card.removeAttribute('card-turnOvering');
        }, 0.5e3);
    }, 0.5e3);
}
function deleteCard(card){
    card.setAttribute('card-deleted', '');
    if(deletedCardElements.indexOf(card) <= -1){
        deletedCardElements.push(card);
        deleteCountAdd();
    }
    setTimeout(() => {
        card.remove();
    }, moveTakes*1e3);
    return(card);
}

if($_GET['id']){
    $_GET['id'] = decodeURI($_GET['id']);
    for(let inputId of $$('[name="id"]')){
        inputId.value = $_GET['id'];
    }
    $_GET['id'] = $_GET['id'].replaceByObj(hiraganaToRomanization, katakanaToRomanization);
    sendXmlhttp(`json/${$_GET['id']}.json`, '', json => {
        let data = JSON.parse(json);
        setTotalNum(data.cards.length);
        for(let card of data.cards){
            let cardElement = creatCard(card.front, card.back);
            function clickCard(event){
                event.preventDefault();
                console.log((event.pageX ? event.pageX : event.touches[0].pageX));
                if((event.pageX ? event.pageX : event.touches[0].pageX) > 50*vw()){
                    turnOverCard(this);
                }
                else{
                    deleteCard(this);
                }
            };
            cardElement.onclick = clickCard;
            cardElement.ontouchstart = clickCard;
            cardElement.oncontextmenu = clickCard;
        }
    }, 'get');
}

window.addEventListener('keydown', function(event){
    if(event.key == 'ArrowLeft' || event.key == 'ArrowDown'){
        /* 加快牌速 */
        // deleteCard($('*:nth-child(1)', container));
        // moveTakes = Math.min(time() - lastDeleteTime, 0.5e3)/1e3;
        // container.style.setProperty('--moveTakes', `${moveTakes}s`);
        // lastDeleteTime = time();

        /* 穿透刪牌 */
        for(let card of $$('.card', container)){
            if(card.getAttribute('card-deleted') == undefined){
                deleteCard(card);
                break;
            }
        }
    }
    if(event.key == 'ArrowRight' || event.key == 'ArrowUp'){
        turnOverCard($('.card:nth-child(1)', container));
    }
});
window.addEventListener('contextmenu', function(event){event.preventDefault();});
function shuffle(){
    let cardElements = $$('.card', container);
    let newCardElements = Array.from(cardElements);
    newCardElements.sort(function(){return(Math.random() - 0.5)});
    let relayElement = document.createElement('div');
    for(let cardElement of cardElements){
        relayElement.appendChild(cardElement);
    }
    for(let cardElement of newCardElements){
        container.appendChild(cardElement);
    }
}