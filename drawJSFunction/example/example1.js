function sigmoid(x, t, k = 1){
    k = 10;
    x = x-700;
    x += Math.abs(t/100%100-50)*10;
    let o = 1 / (1 + Math.exp(-x/k));
    return ((o)*300 + 30);
}
%color=hsl(-20deg,80%,${50+Math.abs(time/100%100-50)}%)
%dash=[12,10]
%end
canvas.getContext('2d').setTransform(1, 0.2, 0.8, 1, 0, 0);