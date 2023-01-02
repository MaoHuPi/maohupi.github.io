/* 二次函數(a的變化) */

(x, t) => (0.25-Math.abs(t/10000%1-0.5))*(x)**2
%end

x => 0
%name=a:\t${(0.25-Math.abs(time/10000%1-0.5))}
%color=transparent
%end