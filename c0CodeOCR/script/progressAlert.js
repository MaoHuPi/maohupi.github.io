/*
 * 2023 © MaoHuPi
 * 帶進度條的遮罩型提示框
 * blogTemplate_thread > public > script > progressAlert.js
 */

'use strict';

class ProgressAlert{
	#showed = false;
	#content = '';
	#value = 0;
	#showCancelButton = true;
	constructor(data = {}){
		data = {
			showCancelButton: true, 
			cancelFunction: () => {}, 
			...data
		};
		this.#showCancelButton = data.showCancelButton;
		this.element = document.createElement('div');
		this.elements = {
			mask: this.element, 
			box: document.createElement('div'), 
			text: document.createElement('p'), 
			bar: document.createElement('div'), 
			cancel: document.createElement('button'), 
		};
		this.elements.text.className = 'ProgressAlert_text';
		this.elements.box.appendChild(this.elements.text);
		this.elements.cancel.className = 'ProgressAlert_cancel';
		this.elements.cancel.addEventListener('mouseover', () => {
			this.elements.mask.setAttribute('cancelHovered', '');
		});
		this.elements.cancel.addEventListener('mouseleave', () => {
			this.elements.mask.removeAttribute('cancelHovered');
		});
		this.elements.cancel.addEventListener('click', () => {
			this.cancelFunction();
			this.hide();
		});
		this.elements.box.appendChild(this.elements.cancel);
		this.elements.bar.className = 'ProgressAlert_bar';
		let barAnimationCounter = 0;
		let barAnimation = () => {
			if(this.#showed){
				barAnimationCounter += 3;
				this.elements.bar.style.setProperty('--bg_offsetX', barAnimationCounter + 'px');
			}
			setTimeout(barAnimation, 60);
		}
		barAnimation();
		this.elements.box.appendChild(this.elements.bar);
		this.elements.box.className = 'ProgressAlert_box';
		this.elements.mask.appendChild(this.elements.box);
		this.element.className = 'ProgressAlert_mask';
	}
	// get content(){return this.#content;}
	// set content(v){
	// 	this.#content = v;
	// 	this.elements.text.innerText = v;
	// }
	get value(){return this.#value;}
	set value(v){
		this.#value = v;
		this.elements.bar.style.setProperty('--value', v);
		this.#content = Math.floor(v*100) + ' %';
		this.elements.text.innerText = this.#content;
	}
	get showCancelButton(){return this.#showCancelButton;}
	set showCancelButton(v){
		this.#showCancelButton = v;
		if(v) this.elements.cancel.setAttribute('show', '');
		else this.elements.cancel.removeAttribute('show');
	}
	show(){
		this.#showed = true;
		this.elements.mask.setAttribute('show', '');
	}
	hide(){
		this.#showed = false;
		this.elements.mask.removeAttribute('show');
	}
}