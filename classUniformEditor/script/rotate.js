function deg2rad(deg){
    return deg*(Math.PI/180);
}
function rad2deg(rad){
    return rad/(Math.PI/180);
}
function Rx(rad){
    let radSin = Math.sin(rad);
    let radCos = Math.cos(rad);
    return({
        x: [1, 0, 0], 
        y: [0, radCos, -radSin], 
        z: [0, radSin, radCos]
    });
}
function Ry(rad){
    let radSin = Math.sin(rad);
    let radCos = Math.cos(rad);
    return({
        x: [radCos, 0, radSin], 
        y: [0, 1, 0], 
        z: [-radSin, 0, radCos]
    });
}
function Rz(rad){
    let radSin = Math.sin(rad);
    let radCos = Math.cos(rad);
    return({
        x: [radCos, -radSin, 0], 
        y: [radSin, radCos, 0], 
        z: [0, 0, 1]
    });
}