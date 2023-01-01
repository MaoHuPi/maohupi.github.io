(x, t) => {window.var_change = t/1000}
%end
(x, t) => {window.var_treePos = Math.sin(window.var_change)*50 - 50}
%end
(x, t) => {window.var_treeRot = -Math.atan(((Math.sin(window.var_change-25)*50 - 50)-(Math.sin(window.var_change+25)*50 - 50))/50)/4}
%end

x => x == 0 ? 400+window.var_treePos : x == 1 ? 100+window.var_treePos : NaN
%color=yellow
%rotate=[${window.var_treeRot},[0,${window.var_treePos}]]
%end
x => x > -25 && x < 25 ? 100+window.var_treePos : Math.abs(x) == 26 ? window.var_treePos : NaN
%color=brown
%rotate=[${window.var_treeRot},[0,${window.var_treePos}]]
%end
x => x > -25 && x < 25 ? window.var_treePos : Math.abs(x) == 26 ? window.var_treePos : NaN
%color=brown
%rotate=[${window.var_treeRot},[0,${window.var_treePos}]]
%note=trunk
%end

(x, t) => x > -100-window.var_treePos && x < 201-window.var_treePos ? (x+100+window.var_treePos)%100 * (Math.abs(t/1000%4-2)-1) : NaN
%rotate=[${window.var_treeRot},[0,${-300+window.var_treePos}]]
%rotate=[${deg(90)},[0,0]]
%transform=[1,0,0,1,0,-300]
%color=green
%end
(x, t) => x > -100-window.var_treePos && x < 201-window.var_treePos ? -(x+100+window.var_treePos)%100 * (Math.abs(t/1000%4-2)-1) : NaN
%rotate=[${window.var_treeRot},[0,${-300+window.var_treePos}]]
%rotate=[${deg(90)},[0,0]]
%transform=[1,0,0,1,0,-300]
%color=green
%note=leafs
%end
(x, t) => x > -100-window.var_treePos && x < 201-window.var_treePos ? (x+100+window.var_treePos)%100 * (Math.abs((t/1000-5)%4-2)-1) : NaN
%rotate=[${window.var_treeRot},[0,${-300+window.var_treePos}]]
%rotate=[${deg(90)},[0,0]]
%transform=[1,0,0,1,0,-300]
%color=green
%end
(x, t) => x > -100-window.var_treePos && x < 201-window.var_treePos ? -(x+100+window.var_treePos)%100 * (Math.abs((t/1000-5)%4-2)-1) : NaN
%rotate=[${window.var_treeRot},[0,${-300+window.var_treePos}]]
%rotate=[${deg(90)},[0,0]]
%transform=[1,0,0,1,0,-300]
%color=green
%note=leafs
%end

(x, t) => Math.sin(x/1000+t/1000)*50 - 50
%note=floor
%color=white
%end