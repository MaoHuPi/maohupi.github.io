/*
 * 2022 © MaoHuPi
 * replaceByObj.js
 */

function objToMap(obj){
    return(new Map(Object.entries(obj)));
}
String.prototype.replaceByObj = function(...objs){
    let text = this;
    let replaceObj = Object.assign(...objs);
    for(let key in replaceObj){
        if(key.indexOf('regexp:') > -1){
            splitWith = key;
            splitWith = new RegExp(splitWith.replace('regexp:', ''), 'g');
            while(splitWith.test(text)){
                text = text.replace(splitWith, replaceObj[key]);
            }
        }
        else if(this.indexOf(key) > -1){
            text = text.split(key).join(replaceObj[key]);
        }
    }
    // text = text.split('っ');
    // for(let i = 1; i < text.length; i++){
    //     text[i] = text[i][0] + text[i];
    // }
    // text = text.join('');
    return(text);
}

/* 日文轉拼音 */
// 清音
let hiraganaUnvoicedToRomanization = {"あ":"a","い":"i","う":"u","え":"e","お":"o","か":"ka","き":"ki","く":"ku","け":"ke","こ":"ko","さ":"sa","し":"si","す":"su","せ":"se","そ":"so","た":"ta","ち":"chi","つ":"tsu","て":"te","と":"to","な":"na","に":"ni","ぬ":"nu","ね":"ne","の":"no","は":"ha","ひ":"hi","ふ":"fu","へ":"he","ほ":"ho","ま":"ma","み":"mi","む":"mu","め":"me","も":"mo","や":"ya","ゆ":"yu","よ":"yo","ら":"ra","り":"ri","る":"ru","れ":"re","ろ":"ro","わ":"wa","を":"wo","ん":"n"};
let katakanaUnvoicedToRomanization = {"ア":"a","イ":"i","ウ":"u","エ":"e","オ":"o","カ":"ka","キ":"ki","ク":"ku","ケ":"ke","コ":"ko","サ":"sa","シ":"si","ス":"su","セ":"se","ソ":"so","タ":"ta","チ":"chi","ツ":"tsu","テ":"te","ト":"to","ナ":"na","ニ":"ni","ヌ":"nu","ネ":"ne","ノ":"no","ハ":"ha","ヒ":"hi","フ":"fu","ヘ":"he","ホ":"ho","マ":"ma","ミ":"mi","ム":"mu","メ":"me","モ":"mo","ヤ":"ya","ユ":"yu","ヨ":"yo","ラ":"ra","リ":"ri","ル":"ru","レ":"re","ロ":"ro","ワ":"wa","ヲ":"wo","ン":"n"};
// 濁音
let hiraganaVoicedToRomanization = {"が":"ga","ぎ":"gi","ぐ":"gu","げ":"ge","ご":"go","ざ":"za","じ":"ji","ず":"zu","ぜ":"ze","ぞ":"zo","だ":"da","ぢ":"di","づ":"du","で":"de","ど":"do","ば":"ba","び":"bi","ぶ":"bu","べ":"be","ぼ":"bo"};
let katakanaVoicedToRomanization = {"ガ":"ga","ギ":"gi","グ":"gu","ゲ":"ge","ゴ":"go","ザ":"za","ジ":"ji","ズ":"zu","ゼ":"ze","ゾ":"zo","ダ":"da","ヂ":"di","ヅ":"du","デ":"de","ド":"do","バ":"ba","ビ":"bi","ブ":"bu","ベ":"be","ボ":"bo"};
// 半濁音
let hiraganaSemiVoicedToRomanization = {"ば":"ba","び":"bi","ぶ":"bu","べ":"be","ぼ":"bo"};
let katakanaSemiVoicedToRomanization = {"バ":"ba","ビ":"bi","ブ":"bu","ベ":"be","ボ":"bo"};
// 促音
let hiraganaTonesToRomanization = {'regexp:っ(.)':'$1$1'};
let katakanaTonesToRomanization = {'regexp:ッ(.)':'$1$1'};
// 拗音
let hiraganaSlangToRomanization = {'reg:([^h]).ゃ':'$1ya','reg:h.ゃ':'ha','reg:([^h]).ゅ':'$1yu','reg:h.ゅ':'hu','reg:([^h]).ょ':'$1yo','reg:h.ょ':'ho'}
let katakanaSlangToRomanization = {'reg:([^h]).ｙ':'$1ya','reg:h.ｙ':'ha','reg:([^h]).ュ':'$1yu','reg:h.ュ':'hu','reg:([^h]).ョ':'$1yo','reg:h.ョ':'ho'}
// 統合
let hiraganaToRomanization = Object.assign(hiraganaUnvoicedToRomanization, hiraganaVoicedToRomanization, hiraganaSemiVoicedToRomanization, hiraganaTonesToRomanization, hiraganaSlangToRomanization);
let katakanaToRomanization = Object.assign(katakanaUnvoicedToRomanization, katakanaVoicedToRomanization, katakanaSemiVoicedToRomanization, katakanaTonesToRomanization, katakanaSlangToRomanization);