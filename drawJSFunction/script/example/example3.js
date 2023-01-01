(x, t) => x > 0 ? 
100*3+20 + (Math.sin((x/25) + t/(Math.PI*2*50)%(Math.PI*2))*50 + 50)*0.6
 : 0
%name=Sine
%note=sine
%color=hsl(${360/4*0}deg,50%,75%)
%end

(x, t) => x > 0 ? 
100*2+20 + (Math.round(1 + (x/200 - t/(Math.PI*1000))%1)*100)*0.6
 : 0
%name=Square
%note=square
%color=hsl(${360/4*1}deg,50%,75%)
%end

(x, t) => x > 0 ? 
100*1+20 + (Math.abs((x + t/(Math.PI*3))%200-100))*0.6
 : 0
%name=Triangle
%note=triangle
%color=hsl(${360/4*2}deg,50%,75%)
%end

(x, t) => x > 0 ? 
100*0+20 + (100 + (x - t/(Math.PI*3))%100)*0.6
 : 0
%name=Sawtooth
%note=sawtooth
%color=hsl(${360/4*3}deg,50%,75%)
%end