function createShader(webglContext, type, sourceCode){
    // [1] create empty shader with type
    var shader = webglContext.createShader(type)
    // [2] add source
    webglContext.shaderSource(shader, sourceCode)
    // [3] compile
    webglContext.compileShader(shader)
    return shader
}

function createProgram(webglContext, vertexShader, fragmentShader){
    // create an empty program
    var program = webglContext.createProgram()
    // attach the shaders
    webglContext.attachShader(program, vertexShader)
    webglContext.attachShader(program, fragmentShader)
    // link the program
    webglContext.linkProgram(program)
    return program;
}

// blok canvas dengan warna putih, jadi kesannya blank
function clearScreenToWhite(webglContext){
    webglContext.clearColor(0, 0, 0, 0);
    webglContext.clear(webglContext.COLOR_BUFFER_BIT);
}

function hexToRGB(hex){
    var r = parseInt(hex[1]+hex[2], 16);
    var g = parseInt(hex[3]+hex[4], 16);
    var b = parseInt(hex[5]+hex[6], 16);
    return [r,g,b];
}

// draw a set of shapes, input is 
function drawToScreen(gl, thingsToDraw, positionBuffer, colorBuffer, positionAttLoc, colorAttLoc, modes) {
    // clear screen first wkwkw
    clearScreenToWhite(gl)

    // draw satu satu gan
    thingsToDraw.map(thing => {
        // position dulu
        gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(thing.positions), gl.STATIC_DRAW);

        // how to get position
        var size = 2
        var type = gl.FLOAT
        var normalize = false
        var stride = 0
        var offset = 0
        gl.vertexAttribPointer(positionAttLoc, size, type, normalize, stride, offset);

        //habisitu color
        gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Uint8Array(thing.color), gl.STATIC_DRAW);

        // how to get color
        size = 3;
        type = gl.UNSIGNED_BYTE;
        normalize = true;
        stride = 0;
        offset = 0;
        gl.vertexAttribPointer(colorAttLoc, size, type, normalize, stride, offset);

        var primitiveType = gl.TRIANGLES
        var offset = 0;
        var count = thing.positions.length/2;
        if (thing.drawMode == modes.LINE){

        }
        else if (thing.drawMode == modes.SQUARE){

        }
        else if (thing.drawMode == modes.RECTANGLE){

        }
        else if (thing.drawMode == modes.POLYGON){ // polygon
            primitiveType = gl.LINE_LOOP
        }
        gl.drawArrays(primitiveType, offset, count);
    })
}