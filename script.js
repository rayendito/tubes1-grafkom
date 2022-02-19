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

// blok canvas dengan warna putih, jadi kesannya blank
function clearScreenToWhite(webglContext){
    webglContext.clearColor(0, 0, 0, 0);
    webglContext.clear(webglContext.COLOR_BUFFER_BIT);
}

// draw a set of shapes, input is 
function drawToScreen(gl, thingsToDraw, positionBuffer, colorBuffer, positionAttLoc, colorAttLoc) {
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
        gl.drawArrays(primitiveType, offset, count);
    })
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
    var colorAttLoc = gl.getAttribLocation(program, "a_color")
    var resolutionUnLoc = gl.getUniformLocation(program, "u_resolution");
    
    // create buffers to store thing data
    var positionBuffer = gl.createBuffer()
    var colorBuffer = gl.createBuffer()

    // clear the canvas (like ngeblock seluruh canvas)
    clearScreenToWhite(gl)

    /* "TURNING ON" the program */
    gl.useProgram(program);

    // enabling the attributes
    gl.enableVertexAttribArray(positionAttLoc);
    gl.enableVertexAttribArray(colorAttLoc);
    gl.uniform2f(resolutionUnLoc, gl.canvas.width, gl.canvas.height);

    var thingsToDraw = [
        {
            positions: [
                10, 20,
                80, 20,
                10, 30,
            ],
            color : [
                98, 252, 3,
                98, 252, 3,
                98, 252, 3
            ]
        },
        {
            positions: [
                10, 30,
                80, 20,
                80, 30,
            ],
            color : [
                122, 63, 181,
                122, 63, 181,
                122, 63, 181
            ]
        }
    ]
    drawToScreen(gl, thingsToDraw, positionBuffer, colorBuffer, positionAttLoc, colorAttLoc)

    /* attributes for event listeners */
    var focus = false;
    const modes = {
        LINE : 0,
        SQUARE : 1,
        RECTANGLE : 2,
        POLYGON : 3
    }

    var drawMode = modes.LINE
    /* event listeners */
    // changing modes
    const line = document.getElementById("lineBtn")
    line.addEventListener("click", function(e){
        drawMode = modes.LINE
    })

    const square = document.getElementById("squareBtn")
    square.addEventListener("click", function(e){
        drawMode = modes.SQUARE
    })

    const rectangle = document.getElementById("rectangleBtn")
    rectangle.addEventListener("click", function(e){
        drawMode = modes.RECTANGLE
    })

    const poly = document.getElementById("polygonBtn")
    poly.addEventListener("click", function(e){
        drawMode = modes.POLYGON
    })

} 

main()