"use strict";

function main(){
    // get webgl context
    const canvas = document.getElementById("canvas")
    const gl = canvas.getContext("webgl")

    if (gl === null){
        alert("browser ga support webgl :(")
        return
    }

    /* attributes for event listeners */
    var nowColor = [0,0,0]
    var firstPointPolygon = true

    const modes = {
        LINE : 0,
        SQUARE : 1,
        RECTANGLE : 2,
        POLYGON : 3
    }

    // drawing mode
    var drawMode = modes.LINE

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

    var thingsToDraw = []
    var thingsToDrawLength = 0
    
    /* event listeners */
    // changing modes
    const line = document.getElementById("lineBtn")
    line.addEventListener("click", function(e){
        drawMode = modes.LINE
        document.getElementById("curMode").innerHTML = "LINE"
    })

    const square = document.getElementById("squareBtn")
    square.addEventListener("click", function(e){
        drawMode = modes.SQUARE
        document.getElementById("curMode").innerHTML = "SQUARE"
    })

    const rectangle = document.getElementById("rectangleBtn")
    rectangle.addEventListener("click", function(e){
        drawMode = modes.RECTANGLE
        document.getElementById("curMode").innerHTML = "RECT"
    })

    const poly = document.getElementById("polygonBtn")
    poly.addEventListener("click", function(e){
        drawMode = modes.POLYGON
        document.getElementById("curMode").innerHTML = "POLY"
    })

    const noSelect = document.getElementById("noneBtn")
    noSelect.addEventListener("click", function(e){
        // artinya lagi ga milih apa apa, not drawing anything
        drawMode = -1
        document.getElementById("curMode").innerHTML = "NONE"
        firstPointPolygon = true
    })

    //color picker
    const colorpick = document.getElementById("colorBtn")
    colorpick.addEventListener('change', function(e){
        const rgb = hexToRGB(e.target.value)
        nowColor = rgb
    })

    /* canvas event listener */
    //draw
    canvas.addEventListener("click", function(e){
        if(drawMode == modes.POLYGON){
            if(firstPointPolygon){
                thingsToDraw.push({
                    positions:[
                        e.pageX, e.pageY-this.offsetTop
                    ],
                    color : nowColor,
                    drawMode :modes.POLYGON
                })
                thingsToDrawLength++
                firstPointPolygon = false;
            }
            else{
                thingsToDraw[thingsToDrawLength-1].positions.push(e.pageX, e.pageY-this.offsetTop)
                thingsToDraw[thingsToDrawLength-1].color.push(nowColor[0], nowColor[1], nowColor[2])
            }
            drawToScreen(gl, thingsToDraw, positionBuffer, colorBuffer, positionAttLoc, colorAttLoc, modes)
        }
        // add elifs for other modes
    })
} 

main()