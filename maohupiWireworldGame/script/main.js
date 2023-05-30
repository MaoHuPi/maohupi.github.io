/*
 * 2023 © MaoHuPi
 * maohupiWireworldGame/main.js
 */

// basic
const view = $('#view'), 
viewCtx = view.getContext('2d');

const editModeBox = $('#editMode');
const playStatusBox = $('#playStatus');
const playSpeedBox = $('#playSpeed');
const lineVisibleBox = $('#lineVisible');
const lineWidthBox = $('#lineWidth');
const projectNameBox = $('#projectName');

// settings
let flagRun = false;
const edit = {
	cellType: 0, 
	downCellType: 0, 
	editMode: 'draw', 
	playSpeed: 10, 
	projectName: 'gameMap'
}
const mouse = {
	x: 0, 
	y: 0, 
	downX: 0, 
	downY: 0, 
	flagTranslate: false, 
	flagDraw: false, 
	flagSelect: false, 
	flagMove: false
}
const cellColor = {
	0: '#FFC107', // y
	1: '#2196F3', // b
	2: '#F44336' // r
}
let map = {};
const transform = {
	scaleZ: 10, 
	translateX: 0, 
	translateY: 0, 
	downTranslateX: 0, 
	downTranslateY: 0
}
const lines = {
	color: '#00000022', 
	visible: true, 
	width: 2
}
const selectRect = {
	x: 0, 
	y: 0, 
	endX: 1, 
	endY: 1, 
	downX: 1, 
	downY: 1, 
	visible: false
}

// control function
function playStatusChange(){
	flagRun = !flagRun;
	playStatusBox.innerText = flagRun ? 'play' : 'pause';
}
function lineVisibleChange(){
	lines.visible = !lines.visible;
	lineVisibleBox.innerText = lines.visible ? 'visible' : 'invisible';
}
function changeEditMode(mode){
	edit.editMode = mode;
	editModeBox.value = mode;
}
function regularizeSelectRect(){
	let xRange = [selectRect.x, selectRect.endX].sort((a, b) => a - b);
	let yRange = [selectRect.y, selectRect.endY].sort((a, b) => a - b);
	[selectRect.x, selectRect.y, selectRect.endX, selectRect.endY] = [xRange[0], yRange[0], xRange[1], yRange[1]];
}
function changeProjectName(newName){
	newName = newName.replaceAll('.json', '');
	edit.projectName = newName;
	projectNameBox.value = newName;
}

// interface default value
changeEditMode(edit.editMode);
playSpeedBox.value = edit.playSpeed;
playStatusBox.innerText = flagRun ? 'play' : 'pause';
lineWidthBox.value = lines.width;
lineVisibleBox.innerText = lines.visible ? 'visible' : 'invisible';
projectNameBox.value = edit.projectName;

// game
function gameUpdate(){
	let newMap = {};
	if(flagRun){
		let R = 1;
		for(let cell in map){
			let pos = cell.split(',');
			if(map[cell] == 1) newMap[cell] = 2;
			else if(map[cell] == 2) newMap[cell] = 0;
			else if(map[cell] == 0){
				let bCount = 0;
				for(let rd = -R; rd < R+1; rd++){
					for(let cd = -R; cd < R+1; cd++){
						if(!(rd === 0 && cd === 0)){
							let neighbor = map[`${parseInt(pos[0]) + rd},${parseInt(pos[1]) + cd}`];
							if(neighbor == 1) bCount ++;
						}
					}
				}
				if(bCount == 1 || bCount == 2) newMap[cell] = 1;
				else newMap[cell] = 0;
			}
		}
		map = newMap;
		setTimeout(gameUpdate, 1e3/edit.playSpeed);
	}
	else{
		setTimeout(gameUpdate, 30);
	}
}
gameUpdate();

// view
function posView2Map(pos){
	const scaleZ = transform.scaleZ + lines.width;
	pos = pos.map(n => parseInt(n));
	pos = [(pos[0] - transform.translateX)/scaleZ, (pos[1] - transform.translateY)/scaleZ];
	pos = pos.map(n => Math.floor(n));
	return pos;
}
function posMap2View(pos){
	const scaleZ = transform.scaleZ + lines.width;
	pos = pos.map(n => parseInt(n));
	var pos = [
		lines.width + pos[0]*scaleZ + transform.translateX, 
		lines.width + pos[1]*scaleZ + transform.translateY
	]
	return pos;
}
function drawLines(){
	if(lines.visible){
		viewCtx.fillStyle = lines.color;
		const scaleZ = transform.scaleZ + lines.width;
		for(let ri = 0; ri < view.height/scaleZ; ri++){
			viewCtx.fillRect(0, ri*scaleZ + transform.translateY%scaleZ, view.width, lines.width);
		}
		for(let ci = 0; ci < view.width/scaleZ; ci++){
			viewCtx.fillRect(ci*scaleZ + transform.translateX%scaleZ, 0, lines.width, view.height);
		}
	}
}
function drawSelectRect(){
	if(selectRect.visible){
		viewCtx.fillStyle = '#8bc34a88';
		viewCtx.strokeStyle = '#4CAF50';
		viewCtx.lineWidth = lines.width;
		let posStart = posMap2View([selectRect.x, selectRect.y]);
		let posEnd = posMap2View([selectRect.endX, selectRect.endY]);
		let rect = [...posStart, posEnd[0] - posStart[0] - lines.width, posEnd[1] - posStart[1] - lines.width];
		viewCtx.fillRect(...rect);
		viewCtx.strokeRect(rect[0] - lines.width/2, rect[1] - lines.width/2, rect[2] + lines.width, rect[3] + lines.width);
		viewCtx.fillStyle = '#4CAF50';
		viewCtx.font = '20px Zpix';
		viewCtx.fillText(`${selectRect.endX - selectRect.x}, ${selectRect.endY - selectRect.y}`, Math.min(rect[0], rect[0] + rect[2]), Math.min(rect[1], rect[1] + rect[3]) - 10);
		// if(!mouse.flagSelect){

		// }
	}
}
function getSelectMap(){
	let selectMap = {};
	for(let cell in map){
		let pos = cell.split(',');
		pos = pos.map(n => parseInt(n));
		if(selectRect.visible && !mouse.flagSelect){
			let downSelectRect = [
				selectRect.oriX, 
				selectRect.oriY, 
				selectRect.endX - selectRect.x + selectRect.oriX, 
				selectRect.endY - selectRect.y + selectRect.oriY
			];
			if(
				pos[0] >= downSelectRect[0] && pos[0] < downSelectRect[2] && 
				pos[1] >= downSelectRect[1] && pos[1] < downSelectRect[3]
			){
				selectMap[cell] = map[cell];
				continue;
			}
		}
	}
	return(selectMap);
}
function viewUpdate(){
	view.width = window.innerWidth;
	view.height = window.innerHeight;
	drawLines();
	let selectMap = {};
	for(let cell in map){
		let pos = cell.split(',');
		pos = pos.map(n => parseInt(n));
		if(selectRect.visible && !mouse.flagSelect){
			let downSelectRect = [
				selectRect.oriX, 
				selectRect.oriY, 
				selectRect.endX - selectRect.x + selectRect.oriX, 
				selectRect.endY - selectRect.y + selectRect.oriY
			];
			if(
				pos[0] >= downSelectRect[0] && pos[0] < downSelectRect[2] && 
				pos[1] >= downSelectRect[1] && pos[1] < downSelectRect[3]
			){
				selectMap[cell] = map[cell];
				continue;
			}
		}
		pos = posMap2View(pos);
		if(
			pos[0]+transform.scaleZ > 0 && pos[0] < view.width && 
			pos[1]+transform.scaleZ > 0 && pos[1] < view.height
		){
			viewCtx.fillStyle = cellColor[map[cell]];
			viewCtx.fillRect(
				...pos, 
				1*transform.scaleZ, 
				1*transform.scaleZ
			);
		}
	}
	for(let cell in selectMap){
		let pos = cell.split(',');
		pos = pos.map(n => parseInt(n));
		pos[0] += -selectRect.oriX + selectRect.x;
		pos[1] += -selectRect.oriY + selectRect.y;
		pos = posMap2View(pos);
		if(
			pos[0]+transform.scaleZ > 0 && pos[0] < view.width && 
			pos[1]+transform.scaleZ > 0 && pos[1] < view.height
		){
			viewCtx.fillStyle = cellColor[map[cell]];
			viewCtx.fillRect(
				...pos, 
				1*transform.scaleZ, 
				1*transform.scaleZ
			);
		}
	}
	drawSelectRect();
	setTimeout(viewUpdate, 30);
}
viewUpdate();

// edit
function translate(){
	[transform.translateX, transform.translateY] = [transform.downTranslateX + mouse.x - mouse.downX, transform.downTranslateY + mouse.y - mouse.downY];
}
function draw(){
	let pos = posView2Map([mouse.x, mouse.y]);
	let xRange = [selectRect.x, selectRect.endX].sort((a, b) => a - b);
	let yRange = [selectRect.y, selectRect.endY].sort((a, b) => a - b);
	if(pos[0] > xRange[0] && pos[0] < xRange[1] && pos[1] > yRange[0] && pos[1] < yRange[1]){
		mouse.x
		mouse.y
	}
	else{
		if(edit.cellType == -1){
			delete map[`${pos[0]},${pos[1]}`];
		}
		else{
			map[`${pos[0]},${pos[1]}`] = edit.cellType;
		}
	}
}
function select(){
	[selectRect.endX, selectRect.endY] = posView2Map([mouse.x, mouse.y]);
}
function move(){
	let posMouseNow = posView2Map([mouse.x, mouse.y]);
	let posMouseDown = posView2Map([mouse.downX, mouse.downY]);
	[selectRect.endX, selectRect.endY] = [selectRect.endX - selectRect.x, selectRect.endY - selectRect.y];
	[selectRect.x, selectRect.y] = [selectRect.downX + posMouseNow[0] - posMouseDown[0], selectRect.downY + posMouseNow[1] - posMouseDown[1]];
	[selectRect.endX, selectRect.endY] = [selectRect.endX + selectRect.x, selectRect.endY + selectRect.y];
}
function moveDone(){
	let tempMap = {};
	for(let cell in map){
		let pos = cell.split(',');
		pos = pos.map(n => parseInt(n));
		let downSelectRect = [
			selectRect.downX, 
			selectRect.downY, 
			selectRect.endX - selectRect.x + selectRect.downX, 
			selectRect.endY - selectRect.y + selectRect.downY
		];
		if(
			pos[0] >= downSelectRect[0] && pos[0] < downSelectRect[2] && 
			pos[1] >= downSelectRect[1] && pos[1] < downSelectRect[3]
		){
			pos[0] += -selectRect.downX + selectRect.x;
			pos[1] += -selectRect.downY + selectRect.y;
			let value = map[cell];
			delete map[cell];
			tempMap[`${pos[0]},${pos[1]}`] = value;
		}
	}
	map = {...map, ...tempMap};
}
function resetSelectRect(){
	['x', 'y', 'endX', 'endY', 'downX', 'downY', 'oriX', 'oriY'].forEach(attr => {
		selectRect[attr] = 0;
	});
}

// event listener
window.addEventListener('mousemove', event => {
	[mouse.x, mouse.y] = [event.pageX, event.pageY];
	if(event.button === 0 || event.button === 2){
		if(mouse.flagTranslate) translate();
		else if(mouse.flagDraw) draw();
		else if(mouse.flagSelect) select();
		else if(mouse.flagMove) move();
	}
});
view.addEventListener('mousedown', event => {
	[mouse.x, mouse.y] = [event.pageX, event.pageY];
	[mouse.downX, mouse.downY] = [mouse.x, mouse.y];
	if(event.ctrlKey){
		if(event.button === 0 || event.button == 2){
			[transform.downTranslateX, transform.downTranslateY] = [transform.translateX, transform.translateY];
			mouse.flagTranslate = true;
			changeEditMode('translate');
		}
	}
	else if(event.shiftKey){
		moveDone();
		resetSelectRect();
		[selectRect.x, selectRect.y] = posView2Map([mouse.downX, mouse.downY]);
		[selectRect.endX, selectRect.endY] = [selectRect.x, selectRect.y];
		selectRect.visible = true;
		mouse.flagSelect = true;
		changeEditMode('select');
	}
	else{
		let pos = posView2Map([mouse.downX, mouse.downY]);
		regularizeSelectRect();
		if(
			pos[0] >= selectRect.x && pos[0] < selectRect.endX && 
			pos[1] >= selectRect.y && pos[1] < selectRect.endY
		){
			if(event.button === 2){
				selectRect.visible = false;
				moveDone();
				resetSelectRect();
			}
			else{
				[selectRect.downX, selectRect.downY] = [selectRect.x, selectRect.y];
				mouse.flagMove = true;
				changeEditMode('move');
				move();
			}
		}
		else{
			mouse.flagDraw = true;
			edit.downCellType = edit.cellType;
			if(event.button === 2) edit.cellType = -1;
			changeEditMode(event.button === 2 ? 'erase' : 'draw');
			draw();
		}
	}
});
window.addEventListener('mouseup', event => {
	[mouse.x, mouse.y] = [event.pageX, event.pageY];
	if(mouse.flagSelect){
		regularizeSelectRect();
		[selectRect.oriX, selectRect.oriY] = [selectRect.x, selectRect.y];
	}
	['flagTranslate', 'flagDraw', 'flagSelect', 'flagMove'].forEach(flag => mouse[flag] = false);
	edit.cellType = edit.downCellType;
	changeEditMode('draw');
});
window.addEventListener('keydown', event => {
	// console.log(event.key);
	if(event.ctrlKey){
		let flagPreventDefault = true;
		switch(event.key){
			case 's':
				downloadExport();
				break;
			case 'o':
				loadImport();
				break;
			case '0':
				transform.scaleZ = 10;
				break;
			case '=':
				if(transform.scaleZ < 100) transform.scaleZ += 1;
				var centerPos = [
					(-transform.translateX + view.width/2), 
					(-transform.translateY + view.height/2)
				];
				var newCenterPos = [
					centerPos[0] + centerPos[0]/(transform.scaleZ + lines.width) * 1, 
					centerPos[1] + centerPos[1]/(transform.scaleZ + lines.width) * 1
				];
				transform.translateX += (centerPos[0] - newCenterPos[0])/2;
				transform.translateY += (centerPos[1] - newCenterPos[1])/2;
				break;
			case '-':
				if(transform.scaleZ > 1) transform.scaleZ -= 1;
				var centerPos = [
					(-transform.translateX + view.width/2), 
					(-transform.translateY + view.height/2)
				];
				var newCenterPos = [
					centerPos[0] + centerPos[0]/(transform.scaleZ + lines.width) * -1, 
					centerPos[1] + centerPos[1]/(transform.scaleZ + lines.width) * -1
				];
				transform.translateX += (centerPos[0] - newCenterPos[0])/2;
				transform.translateY += (centerPos[1] - newCenterPos[1])/2;
				break;
			case 'r':
				yellowAll();	
				break;
			default:
				flagPreventDefault = false;
				break;
		}
		if(flagPreventDefault){
			event.preventDefault();
		}
	}
	else{
		let targetType = ['y' , 'b', 'r'].indexOf(event.key);
		if(targetType > -1){
			edit.downCellType = targetType;
			if(edit.cellType !== -1) edit.cellType = targetType;
			selectButton($(`[id="typeSwitch-${targetType}"]`));
		}
	}
});
window.addEventListener('keyup', event => {
	if(event.key == ' '){
		playStatusChange();
	}
})
window.addEventListener('contextmenu', event => {
	event.preventDefault();
});

// tool bar
function selectButton(button){
	$$('button', button.parentElement).forEach(b => {b.removeAttribute('selected')});
	button.setAttribute('selected', '');
}
$$('[id^="typeSwitch-"]').forEach(button => {
	let index = button.id.split('-')[1];
	button.style.backgroundColor = cellColor[index];
	button.addEventListener('click', () => {
		selectButton(button);
		edit.cellType = index;
	})
});
selectButton($(`[id="typeSwitch-${edit.cellType}"]`));
$$('[id^="typeSwitch-"]').forEach(button => {
	let index = button.id.split('-')[1];
	button.style.backgroundColor = cellColor[index];
	button.addEventListener('click', () => {
		selectButton(button);
		edit.cellType = index;
	})
});
selectButton($(`[id="typeSwitch-${edit.cellType}"]`));
playStatusBox.addEventListener('click', playStatusChange);
playSpeedBox.addEventListener('change', () => {edit.playSpeed = parseInt(playSpeedBox.value);});
lineVisibleBox.addEventListener('click', lineVisibleChange);
lineWidthBox.addEventListener('change', () => {lines.width = parseInt(lineWidthBox.value);});
projectNameBox.addEventListener('change', () => {changeProjectName(projectNameBox.value);});
$('#loadImageButton').addEventListener('click', () => {importImage();});
$('#downloadImageButton').addEventListener('click', () => {exportImage();});

$$(':where(input[type="text"], input[type="number"])').forEach(input => {
	input.addEventListener('keydown', event => {
		if(event.key.length === 1 && !event.ctrlKey) event.stopPropagation();
	});
	input.addEventListener('keyup', event => {
		if(event.key.length === 1 && !event.ctrlKey) event.stopPropagation();
	});
});
$$(':where(button, input[type="button"])').forEach(button => {
	button.addEventListener('focus', () => {button.blur();});
});

// import and export map
function importMap(text){
	map = JSON.parse(text);
}
function exportMap(){
	return(JSON.stringify(map));
}

function loadImport(){
	openFile();
}
$('#loadImportButton').addEventListener('click', loadImport);
function downloadExport(){
	saveFile(exportMap(), `${edit.projectName}.json`);
}
$('#downloadExportButton').addEventListener('click', downloadExport);

// import and export image
function importImage(){
	let input = $e('input');
	input.type = 'file';
	input.onchange = () => {
		if(input.files.length > 0){
			var file = input.files[0];
			let reader = new FileReader();
			reader.onloadend = () => {
				let img = $e('img');
				img.onload = () => {
					let cvs = $e('canvas'), 
						ctx = cvs.getContext('2d');
					[cvs.width, cvs.height] = [img.width, img.height];
					ctx.drawImage(img, 0, 0);
					let imgData = ctx.getImageData(0, 0, cvs.width, cvs.height), 
						data = imgData.data;
					let newMap = {};
					for(let i = 0; i < data.length; i += 4){
						if(data[i+3] !== 0){
							let cellType = -1;
							let [r, g, b] = data.slice(i, i+3);
							if(r >= 200 && b <= 200){
								if(g >= 200) cellType = 0;
								else cellType = 2;
							}
							else if(r <= 200 && g <= 200 && b >= 200) cellType = 1;
							if(cellType !== -1){
								newMap[`${parseInt(Math.round(i/4)%cvs.width)},${parseInt(Math.floor((i/4)/cvs.width))}`] = cellType;
							}
						}
					}
					map = newMap;
				};
				img.src = reader.result;
			};
			reader.readAsDataURL(file);
		}
	};
	input.click();
}
function exportImage(flagIsSelect = false){
	let processMap = {};
	if(flagIsSelect){
		processMap = getSelectMap();
	}
	else{
		processMap = {...map};
	}
	var poss = Object.keys(processMap).map(cell => cell.split(',').map(n => parseInt(n)));
	let xs = poss.map(l => l[0]), 
		ys = poss.map(l => l[1]);
	let startX = Math.min(...xs), 
		endX = Math.max(...xs) + 1, 
		startY = Math.min(...ys), 
		endY = Math.max(...ys) + 1;
	let cvs = $e('canvas'), 
		ctx = cvs.getContext('2d'), 
		dlLink = $e('a');
	cvs.width = endX - startX;
	cvs.height = endY - startY;
	for(let cell in processMap){
		let pos = cell.split(',');
		pos = pos.map(n => parseInt(n));
		pos[0] -= startX;
		pos[1] -= startY;
		ctx.fillStyle = cellColor[map[cell]];
		ctx.fillRect(...pos, 1, 1);
	}
	var url = cvs.toDataURL();
	dlLink.href = url;
	dlLink.download = 'mapImage.png';
	dlLink.click();
}
// pro
function yellowAll(){
	let newMap = {};
	for(let cell in map){
		newMap[cell] = 0;
	}
	map = newMap;
}
function hideLines(){
	lines.width = 0;
	lines.visible = false;
}