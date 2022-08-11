i = 0;
nops = document.body.getElementsByTagName('nop');
while(i < nops.length){
    nop = nops[i];
    nop.style.display = "grid";
    if(nop.hasAttribute('cs') == true){
        cs = nop.getAttribute('cs');
    }
    else{
        console.log('%c nop標籤缺少cs屬性！', 'background: red; color: white')
    }
    if(nop.hasAttribute('rs') == true){
        rs = nop.getAttribute('rs');
    }
    else{
        console.log('%c nop標籤缺少rs屬性！', 'background: red; color: white')
    }
    if(nop.hasAttribute('g') == true){
        nop.style.gridGap = nop.getAttribute('g');
        g = nop.getAttribute('g');
    }
    else{
        console.log('%c nop標籤缺少g屬性！', 'background: red; color: white')
    }
    if(nop.hasAttribute('c') == true){
        ii = 1;
        gridTemplateColumns = "";
        while(ii < cs){
            gridTemplateColumns = gridTemplateColumns+" "+nop.getAttribute('c');
            ii ++;
        }
        nop.style.gridTemplateColumns = gridTemplateColumns;
        nop.style.width = ((cs-1)*parseInt(g)+((cs-1)*parseInt(nop.getAttribute('c'))))+nop.getAttribute('c').replace(parseInt(nop.getAttribute('c')), "");
    }
    else{
        console.log('%c nop標籤缺少c屬性！', 'background: red; color: white')
    }
    if(nop.hasAttribute('r') == true){
        ii = 1;
        gridTemplateRows = "";
        while(ii < rs){
            gridTemplateRows = gridTemplateRows+" "+nop.getAttribute('r');
            ii ++;
        }
        nop.style.gridTemplateRows = gridTemplateRows;
        nop.style.height = ((rs-1)*parseInt(g)+((rs-1)*parseInt(nop.getAttribute('r'))))+nop.getAttribute('r').replace(parseInt(nop.getAttribute('r')), "");
    }
    else{
        console.log('%c nop標籤缺少r屬性！', 'background: red; color: white')
    }
    // gridTemplateColumns
    // gridTemplateRows
    // gridGap
    i ++;
}
i = 0;
ns = document.body.getElementsByTagName('n');
while(i < ns.length){
    n = ns[i];
    if(n.hasAttribute('ga') == true){
        n.style.gridArea = n.getAttribute('ga');
        // gridArea
    }
    else{
        if(n.hasAttribute('cs') == true){
            n.style.gridColumnStart = n.getAttribute('cs');
        }
        else{
            console.log('%c n標籤缺少cs屬性！', 'background: red; color: white')
        }
        if(n.hasAttribute('ce') == true){
            n.style.gridColumnEnd = n.getAttribute('ce');
        }
        else{
            console.log('%c n標籤缺少ce屬性！', 'background: red; color: white')
        }
        if(n.hasAttribute('rs') == true){
            n.style.gridRowStart = n.getAttribute('rs');
        }
        else{
            console.log('%c n標籤缺少rs屬性！', 'background: red; color: white')
        }
        if(n.hasAttribute('re') == true){
            n.style.gridRowEnd = n.getAttribute('re');
        }
        else{
            console.log('%c n標籤缺少re屬性！', 'background: red; color: white')
        }
    }
    i ++;
}