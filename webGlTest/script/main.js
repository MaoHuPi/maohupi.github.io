function main(){
    const cvs = document.querySelector('#mainCvs');
    [cvs.width, cvs.height] = [500, 500];
    const gl = cvs.getContext('webgl');
    window.gl = gl;
    if(gl === null){
        return;
    }

    gl.clearColor(0, 0, 0, 1);
    gl.clear(gl.COLOR_BUFFER_BIT);

    let matrix = glMatrix.mat4.create();
    glMatrix.mat4.translate(matrix, matrix, [0.2, 0.5, 0]);
    let vertexData = [
        1, 1, 0, 
        1, -1, 0, 
        -1, -1, 0, 
        1, 1, 0, 
        -1, 1, 0, 
        -1, -1, 0, 
    ];
    vertexData = vertexData.map(n => n*0.95);
    let colorData = [
        1, 0, 0, 
        1, 1, 0, 
        0, 1, 0, 
        1, 0, 0, 
        0, 1, 1, 
        0, 1, 0, 
    ];

    const positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertexData), gl.STATIC_DRAW);
    const colorBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(colorData), gl.STATIC_DRAW);

    const vertexShader = gl.createShader(gl.VERTEX_SHADER);
    gl.shaderSource(vertexShader, `
    precision mediump float;
    attribute vec3 position;
    attribute vec3 color;
    varying vec3 vColor;
    uniform mat4 matrix;
    void main(){
        vColor = color;
        gl_Position = matrix * vec4(position, 1);
        // gl_Position = vec4(position, 1);
    }
    `);
    gl.compileShader(vertexShader);
    
    const fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
    gl.shaderSource(fragmentShader, `
    precision mediump float;
    varying vec3 vColor;
    void main(){
        gl_FragColor = vec4(vColor, 1);
    }
    `);
    gl.compileShader(fragmentShader);

    const program = gl.createProgram();
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);

    const attribLocation_position = gl.getAttribLocation(program, 'position');
    gl.enableVertexAttribArray(attribLocation_position);
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.vertexAttribPointer(attribLocation_position, 3, gl.FLOAT, false, 0, 0);
    const attribLocation_color = gl.getAttribLocation(program, 'color');
    gl.enableVertexAttribArray(attribLocation_color);
    gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
    gl.vertexAttribPointer(attribLocation_color, 3, gl.FLOAT, false, 0, 0);
    const uniformLocation_matrix = gl.getUniformLocation(program, 'matrix');
    console.log(matrix);
    gl.uniformMatrix4fv(uniformLocation_matrix, false, matrix);

    gl.useProgram(program);
    gl.drawArrays(gl.TRIANGLES, 0, vertexData.length);
}
main();