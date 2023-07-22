/* function scanner */

(x, t) => {
    window.aniFuncName = 'tan';
    window.aniBasicCount = 100;
    window.aniRangeBegin = -window.aniBasicCount;
    window.aniRangeEnd = window.aniBasicCount;
    window.aniTime = t*0.05% (window.aniRangeEnd - window.aniRangeBegin) + window.aniRangeBegin;
    window.aniFun = Math.tan;
}
%end

(x) => (x > 0 && x < window.aniTime) || (x < 0 && x > window.aniTime) ? (x/window.aniTime)*(window.aniFun)(window.aniTime/window.aniBasicCount)*window.aniBasicCount : -1e5
%color=hsl(180deg,100%,65%)
%end

x => x < 0 ? 1e5 : -1e5
%width=${vw()/2}
%color=black
%note=e0
%end

x => x < 0 ? 1e5 : -1e5
%width=${vw()/100*15}
%color=#ffffff55
%note=l0
%end

x => x > window.aniRangeBegin && x < window.aniRangeEnd ? window.aniFun(x/window.aniBasicCount)*window.aniBasicCount: -1e5
%color=#ffffff88
%end

x => x > window.aniRangeBegin && x < window.aniTime ? ((window.aniFun(x/window.aniBasicCount)*window.aniBasicCount)**2 + x**2)**0.5 : -1e5
%color=#aabbdd88
%end

x => x < window.aniRangeEnd ? 1e5 : -1e5
%width=${vw()/2}
%color=black
%note=e100
%end

x => x < window.aniRangeEnd ? 1e5 : -1e5
%width=${vw()/100*15}
%color=#ffffff55
%note=l100
%end

x => x < window.aniRangeBegin ? 1e5 : -1e5
%width=${vw()/2}
%color=black
%note=e-100
%end

x => x < window.aniRangeBegin ? 1e5 : -1e5
%width=${vw()/100*15}
%color=#ffffff55
%note=l-100
%end

(x) => x > window.aniTime ? 1e5 : -1e5
%color=hsl(180deg,100%,65%)
%window
%end

() => 0
%color=transparent
%name=${`graph_of_${window.aniFuncName}`}
%end
