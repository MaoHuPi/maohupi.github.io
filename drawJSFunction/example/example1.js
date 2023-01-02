function sigmoid(x, t, k = 1){
    k = 10;
    x = x-700;
    x += Math.abs(t/100%50-25)*10;
    let o = 1 / (1 + Math.exp(-x/k));
    return ((o)*300 + 30);
}
%color=hsl(-20deg,80%,${50+Math.abs(time/100%100-50)}%)
%dash=[12,10]
%waveFun=550
%end