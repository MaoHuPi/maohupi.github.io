function AStar(grid) {
    let openList = []; //存放已訪問的點
    let closeList = []; //存放未訪問的點
    let start = { x: 0, y: 0 };
    let end = { x: 0, y: 0 };
    let rows = grid.length;
    let cols = grid[0].length;
    let path = [];
    //獲取起始點和終點
    for (let i = 0; i < rows; i++) {
        for (let j = 0; j < cols; j++) {
            if (grid[i][j] === 0) {
                start.x = i;
                start.y = j;
            }
            if (grid[i][j] === 2) {
                end.x = i;
                end.y = j;
            }
        }
    }
    //開始演算
    let current = start;
    let currentNode = {
        x: start.x,
        y: start.y,
        g: 0,
        h: getDistance(start, end),
        f: getDistance(start, end),
        parent: null
    };
    openList.push(currentNode);
    //尋找路徑
    while (openList.length > 0) {
        //找出openlist中f值最小的點
        let min = openList[0].f;
        let minIndex = 0;
        for (let i = 0; i < openList.length; i++) {
            if (openList[i].f < min) {
                minIndex = i;
                min = openList[i].f;
            }
        }
        current = openList[minIndex];
        //結束條件：當前點是終點
        if (current.x === end.x && current.y === end.y) {
            path.push({ x: end.x, y: end.y });
            while (current.parent) {
                path.push({ x: current.parent.x, y: current.parent.y });
                current = current.parent;
            }
            return path.reverse();
        }
        //將當前點從openlist中移除，放入closelist中
        openList.splice(minIndex, 1);
        closeList.push(current);
        //檢查當前點的周圍點
        let neighbors = getNeighbors(current, grid);
        for (let i = 0; i < neighbors.length; i++) {
            let neighbor = neighbors[i];
            //如果neighbor在closelist中，則跳過
            if (isInCloseList(closeList, neighbor)) {
                continue;
            }
            //把neighbor的g值設為current的g值+1
            let g = current.g + 1;
            //如果neighbor不在openlist中，則把它添加進去，並計算它的f和h值
            if (!isInOpenList(openList, neighbor)) {
                neighbor.g = g;
                neighbor.h = getDistance(neighbor, end);
                neighbor.f = neighbor.g + neighbor.h;
                neighbor.parent = current;
                openList.push(neighbor);
            }
            //否則，如果neighbor在openlist中，
            // 但neighbor的g值比之前更小，則更新neighbor的f和g值
            else {
                if (neighbor.g > g) {
                    neighbor.g = g;
                    neighbor.f = neighbor.g + neighbor.h;
                    neighbor.parent = current;
                }
            }
        }
    }
    //如果openlist中沒有點了，則代表找不到路徑
    return null;
}

//獲取某一點的鄰居點
function getNeighbors(node, grid) {
    let x = node.x;
    let y = node.y;
    let neighbors = [];
    let rows = grid.length;
    let cols = grid[0].length;
    //左
    if (x > 0 && grid[x - 1][y] !== 1) {
        neighbors.push({ x: x - 1, y: y });
    }
    //右
    if (x < rows - 1 && grid[x + 1][y] !== 1) {
        neighbors.push({ x: x + 1, y: y });
    }
    //上
    if (y > 0 && grid[x][y - 1] !== 1) {
        neighbors.push({ x: x, y: y - 1 });
    }
    //下
    if (y < cols - 1 && grid[x][y + 1] !== 1) {
        neighbors.push({ x: x, y: y + 1 });
    }
    return neighbors;
}

//判斷某一點是否在closelist中
function isInCloseList(closeList, node) {
    for (let i = 0; i < closeList.length; i++) {
        if (node.x === closeList[i].x && node.y === closeList[i].y) {
            return true;
        }
    }
    return false;
}

//判斷某一點是否在openlist中
function isInOpenList(openList, node) {
    for (let i = 0; i < openList.length; i++) {
        if (node.x === openList[i].x && node.y === openList[i].y) {
            return true;
        }
    }
    return false;
}

//計算兩點的曼哈頓距離
function getDistance(node1, node2) {
    return Math.abs(node1.x - node2.x) + Math.abs(node1.y - node2.y);
}