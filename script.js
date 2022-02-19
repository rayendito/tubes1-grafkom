"use strict";

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

function main(){
    // get webgl context
    const canvas = document.getElementById("canvas")
    const gl = canvas.getContext("webgl")

    if (gl === null){
        alert("browser ga support webgl :(")
        return
    }

    // resizing canvas supaya resolusi bagus
    canvas.width  = canvas.clientWidth;
    canvas.height = canvas.clientHeight;
    
    // set viewport to full height and width of the canvas
    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height)

    /* CREATING SHADER PROGRAM */
    // get the source codes for the shader programs
    const vertexSource = document.getElementById("vertex-src").text
    const fragmentSource = document.getElementById("fragment-src").text

    // create shaders (detail of impl. check out the function)
    var vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexSource)
    var fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fragmentSource)

    // create shader program (vertex + fragment)
    var program = createProgram(gl, vertexShader, fragmentShader)

    // get variable locations
    var positionAttLoc = gl.getAttribLocation(program, "a_position")
    
    // create a buffer to store location data
    var positionBuffer = gl.createBuffer()

    // bind to array buffer. kayanya buat ngeset buffer mana yang dipake
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer)

    /* LOCATION VARIABLE */
    var positions = [
        0, 0,
        0, 0.5,
        0.7, 0,
    ]

    // add the positions to the buffer
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW)

    // clear the canvas (like ngeblock seluruh canvas)
    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT);

    /* "TURNING ON" the program */
    gl.useProgram(program);
    // enabling the vertex attribute
    gl.enableVertexAttribArray(positionAttLoc);

    // ini kaya ngeassign dari buffer ke attribute location yang ada di shader program
    var size = 2;
    var type = gl.FLOAT;
    var normalize = false;
    var stride = 0;
    var offset = 0;
    gl.vertexAttribPointer(positionAttLoc, size, type, normalize, stride, offset);

    /* DRAWING :D */
    var primitiveType = gl.TRIANGLES;
    var offset = 0;
    var count = 3;
    gl.drawArrays(primitiveType, offset, count);
}

main()