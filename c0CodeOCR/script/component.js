/*
 * 2023 © MaoHuPi
 * 部件化元素群之生成與替換
 * c0CodeOCR > script > component.js
 */

class Component{
	static e(tagName){
		return document.createElement(tagName);
	}
	static componentConstructors = {
		slider: (attr) => {
			let slider = Component.e('div');
			slider.id = attr.id;
			slider.className = 'slider';
			slider.moving = false;
			slider.addEventListener('mousedown', () => {
				slider.moving = true;
			});
			window.addEventListener('mousemove', () => {
				if(slider.moving){
					var horizontal = attr.type == 'horizontal';
					let value = (horizontal ? MX : MY)/(horizontal ? window.innerWidth : window.innerHeight);
					value = Math.max(Math.min(value, 1), 0);
					slider.parentElement[`slider-${attr.id}`] = value;
					slider.parentElement.style.setProperty(`--${attr.id}`, value);
				}
			});
			window.addEventListener('mouseup', () => {
				slider.moving = false;
			});
			return slider;
		}, 
		rectdot: (attr, oldElement) => {
			let rectDot = Component.e('div');
			rectDot.className = `rectDot-${attr.type}`;
			rectDot.moving = false;
			let value = ['left', 'top'].includes(attr.type) ? 0 : 1;
			oldElement.parentElement[`rectDot-${attr.type}`] = value;
			oldElement.parentElement.style.setProperty(`--${attr.type}`, `${value*100}%`);
			oldElement.parentElement.dispatchEvent(new Event('change'));
			rectDot.addEventListener('mousedown', () => {
				rectDot.moving = true;
			});
			window.addEventListener('mousemove', () => {
				if(rectDot.moving){
					var horizontal = ['left', 'right'].includes(attr.type);
					let ppRect = rectDot.parentElement.parentElement.getBoundingClientRect();
					let value = ((horizontal?MX:MY) - (horizontal?ppRect.left:ppRect.top))/(horizontal?ppRect.width:ppRect.height);
					value = Math.max(Math.min(value, 1), 0);
					rectDot.parentElement[`rectDot-${attr.type}`] = value;
					rectDot.parentElement.style.setProperty(`--${attr.type}`, `${value*100}%`);
					rectDot.parentElement.dispatchEvent(new Event('change'));
				}
			});
			window.addEventListener('mouseup', () => {
				rectDot.moving = false;
			});
			return rectDot;
		}, 
		selectrect: (attr) => {
			let selectRect = Component.e('div'), 
				rectDotLeft = Component.e('rectDot'), 
				rectDotRight = Component.e('rectDot'), 
				rectDotTop = Component.e('rectDot'), 
				rectDotBottom = Component.e('rectDot');
			selectRect.id = attr.id;
			selectRect.className = (attr.class ? attr.class + ' ' : '') + 'selectRect';
			[[rectDotLeft, 'left'], [rectDotRight, 'right'], [rectDotTop, 'top'], [rectDotBottom, 'bottom']].forEach(([rectDot, type]) => {
				rectDot.setAttribute('type', type);
				selectRect.appendChild(rectDot);
				rectDot = Component.generate(rectDot);
				selectRect.appendChild(rectDot);
			});
			selectRect.addEventListener('change', () => {
				selectRect.value = {left: selectRect['rectDot-left'], right: selectRect['rectDot-right'], top: selectRect['rectDot-top'], bottom: selectRect['rectDot-bottom']};
			})
			selectRect.dispatchEvent(new Event('change'));
			selectRect.setValue = v => {
				selectRect.value = {...v};
				let {left, right, top, bottom} = v;
				[selectRect['rectDot-left'], selectRect['rectDot-right'], selectRect['rectDot-top'], selectRect['rectDot-bottom']] = [left, right, top, bottom];
				['left', 'right', 'top', 'bottom'].forEach(type => {
					selectRect.style.setProperty(`--${type}`, `${selectRect[`rectDot-${type}`]*100}%`);
				});
			};
			return selectRect;
		}, 
		advinp: (attr, oldElement) => {
			let advinp = Component.e('div'), 
				title = Component.e('label'), 
				rangeInverse, 
				inverse;
			advinp.id = attr.id;
			advinp.className = (attr.class ? attr.class + ' ' : '') + 'advinp';
			title.className = 'advinp-title';
			title.innerText = attr.title;
			advinp.appendChild(title);
			if(attr.type == 'range' && attr.inverse !== undefined && attr.inverse !== 'false'){
				rangeInverse = Component.e('input');
				rangeInverse.id = `${attr.id}-rangeInverse`;
				rangeInverse.type = 'checkbox';
				rangeInverse.hidden = true;
				rangeInverse.addEventListener('change', () => {
					if(advinp.value.length !== undefined){
						advinp.value.reverse();
					}
					else advinp.value = advinp.value + (rangeInverse.checked ? -1 : 1);
					advinp.dispatchEvent(new Event('change'));
				})
				advinp.appendChild(rangeInverse);
			}
			if(attr.type == 'number' || attr.type == 'range'){
				attr.min = attr.min !== undefined ? parseFloat(attr.min) : 0;
				attr.max = attr.max !== undefined ? parseFloat(attr.max) : 100;
				[attr.min, attr.max] = [attr.min, attr.max].sort((a, b) => a-b);
				attr.step = attr.step !== undefined ? Math.abs(parseFloat(attr.step)) : 1;
				let bar = Component.e('div'), 
					value = Component.e('div'), 
					rectDotRight = Component.e('rectDot'), 
					rectDotLeft;
				if(attr.type == 'range'){
					rectDotLeft = Component.e('rectDot');
					rectDotLeft.setAttribute('type', 'left');
					value.appendChild(rectDotLeft);
					rectDotLeft = Component.generate(rectDotLeft);
					value.appendChild(rectDotLeft);
				}
				rectDotRight.setAttribute('type', 'right');
				value.appendChild(rectDotRight);
				rectDotRight = Component.generate(rectDotRight);
				value.appendChild(rectDotRight);
				value.addEventListener('change', () => {
					advinp.value = attr.type == 'range' ? 
						(rangeInverse?.checked ? [value['rectDot-right'], value['rectDot-left']] : [value['rectDot-left'], value['rectDot-right']]).map(n => Math.round(n*(attr.max - attr.min)/attr.step)*attr.step + attr.min) : 
						Math.round(value['rectDot-right']*(attr.max - attr.min)/attr.step)*attr.step + attr.min;
					advinp.dispatchEvent(new Event('change'));
				})
				value.className = 'advinp-value';
				bar.appendChild(value);
				bar.className = 'advinp-bar';
				advinp.setValue = v => {
					advinp.value = v;
					if(attr.type == 'range'){
						advinp.value = [...advinp.value];
						let inversed = v[0] > v[1];
						v = v.map(n => (n - attr.min)/(attr.max - attr.min));
						value['rectDot-left'] = inversed ? v[1] : v[0];
						value['rectDot-right'] = inversed ? v[0] : v[1];
						rangeInverse.checked = inversed;
						value.style.setProperty(`--left`, `${value['rectDot-left']*100}%`);
						value.style.setProperty(`--right`, `${value['rectDot-right']*100}%`);
					}
					else{
						v = (v - attr.min)/(attr.max - attr.min);
						value['rectDot-right'] = v;
						value.style.setProperty(`--right`, `${value['rectDot-right']*100}%`);
					}
				};
				advinp.appendChild(bar);
			}
			else if(attr.type == 'text'){
				let input = Component.e('input');
				input.type = 'text';
				input.className = 'advinp-input';
				input.addEventListener('change', () => {
					advinp.value = input.value;
					advinp.dispatchEvent(new Event('change'));
				});
				advinp.setValue = v => {
					advinp.value = v;
					input.value = v;
				};
				input.dispatchEvent(new Event('change'));
				advinp.appendChild(input);
			}
			else if(attr.type == 'select'){
				let input = Component.e('select');
				input.className = 'advinp-input';
				input.innerHTML = oldElement.innerHTML;
				input.addEventListener('change', () => {
					advinp.value = input.value;
					advinp.dispatchEvent(new Event('change'));
				});
				advinp.setValue = v => {
					advinp.value = v;
					input.value = v;
				};
				input.dispatchEvent(new Event('change'));
				advinp.appendChild(input);
			}
			if(attr.inverse !== undefined && attr.inverse !== 'false'){
				inverse = Component.e('label');
				inverse.setAttribute('for', rangeInverse.id);
				inverse.className = 'advinp-inverse';
				inverse.innerText = 'inv.';
				advinp.appendChild(inverse);
			}
			return advinp;
		}
	};
	static generate(element){
		let attrDict = {};
		[...element.attributes].forEach(attr => attrDict[attr.name] = attr.value);
		return Component.componentConstructors[element.tagName.toLowerCase()](attrDict, element);
	}
	static init(){
		document.querySelectorAll('[component]').forEach(element => {
			element.after(Component.generate(element));
			element.remove();
		});
	}
}