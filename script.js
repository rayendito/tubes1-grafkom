"use strict";

function main(){
    // get webgl context
    const canvas = document.getElementById("canvas")
    const gl = canvas.getContext("webgl")

    if (gl === null){
        alert("browser ga support webgl :(")
        return
    }

    /********** ATTRIBUTES AND INITIALIZATIONS **********/
    var nowColor = [0,0,0]
    var firstPointPolygon = true
    const modes = {
        LINE : 0,
        SQUARE : 1,
        RECTANGLE : 2,
        POLYGON : 3
    }
    var drawMode = -1
    var thingsToDraw = [
        {
            id: 1,
            positions:[
                452, 187,
                638, 104,
                922, 243,
                745, 406,
                546, 407
            ],
            color: [
                28, 109, 171
            ],
            drawMode: modes.POLYGON
        }
    ]
    var thingsToDrawLength = thingsToDraw.length

    // resizing canvas supaya resolusi bagus
    canvas.width  = canvas.clientWidth;
    canvas.height = canvas.clientHeight;
    // set viewport to full height and width of the canvas
    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height)

    /********** CREATING SHADER PROGRAM **********/
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

    /********** CREATE BUFFERS **********/
    var positionBuffer = gl.createBuffer()
    var colorBuffer = gl.createBuffer()








    /********** PROGRAM FOR OBJECT PICKER **********/
    const pick_vertex_source = document.getElementById('vertex-src-pick').text
    const pick_fragment_source = document.getElementById('fragment-src-pick').text

    // create shaders and the program
    var pick_vertexShader = createShader(gl, gl.VERTEX_SHADER, pick_vertex_source)
    var pick_fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, pick_fragment_source)
    var pick_program = createProgram(gl, pick_vertexShader, pick_fragmentShader)

    // get att location
    var pick_positionAttLoc = gl.getAttribLocation(pick_program, "pick_position");
    var pick_resolutionUnLoc = gl.getUniformLocation(pick_program, "pick_resolution");
    var pick_colorUnLoc = gl.getUniformLocation(pick_program, "u_id");

    /********** CREATE TEXTURE TO RENDER TO **********/
    // texture to render to
    const targetTexture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, targetTexture);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

    // depth render buffer
    const depthBuffer = gl.createRenderbuffer();
    gl.bindRenderbuffer(gl.RENDERBUFFER, depthBuffer);

    setFrameBufferAttachmentSizes(gl, gl.canvas.width, gl.canvas.height, targetTexture, depthBuffer)

    /********** CREATE FRAME BUFFER AND SET DEPTH BUFFER (and also binding lol) **********/
    const fb = gl.createFramebuffer();
    gl.bindFramebuffer(gl.FRAMEBUFFER, fb)

    // attach the target texture to the frame buffer
    const attachmentPoint = gl.COLOR_ATTACHMENT0;
    const level = 0;
    gl.framebufferTexture2D(gl.FRAMEBUFFER, attachmentPoint, gl.TEXTURE_2D, targetTexture, level)

    // set the depth buffer
    gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.RENDERBUFFER, depthBuffer);

    //create buffer
    var pick_positionBuffer = gl.createBuffer()












    /********** CALL TO CLEAR ALL **********/
    clearScreenToWhite(gl)

    /********** USE PROGRAM AND ENABLING UNIFORM FOR SCALING **********/
    gl.useProgram(program);
    gl.uniform2f(resolutionUnLoc, gl.canvas.width, gl.canvas.height);
    gl.useProgram(pick_program);
    gl.uniform2f(pick_resolutionUnLoc, gl.canvas.width, gl.canvas.height);
    
    /********** EVENT LISTENERS **********/
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

    // mouse location
    let mouseX = -1;
    let mouseY = -1;
    canvas.addEventListener('mousemove', (e) => {
        const rect = canvas.getBoundingClientRect();
        mouseX = e.clientX - rect.left;
        mouseY = e.clientY - rect.top;
        document.getElementById("X").innerHTML = mouseX
        document.getElementById("Y").innerHTML = mouseY
        drawToScreen(gl, program, pick_program, fb,
            thingsToDraw, positionBuffer, colorBuffer, positionAttLoc, colorAttLoc, modes,
            pick_positionBuffer, pick_positionAttLoc, pick_colorUnLoc,
            mouseX, mouseY)
    })

    /* canvas event listener */
    //draw
    canvas.addEventListener("click", function(e){
        if(drawMode == modes.POLYGON){
            if(firstPointPolygon){
                thingsToDraw.push({
                    id: thingsToDrawLength+1,
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
            }
            drawToScreen(gl, program, pick_program, fb,
                thingsToDraw, positionBuffer, colorBuffer, positionAttLoc, colorAttLoc, modes,
                pick_positionBuffer, pick_positionAttLoc, pick_colorUnLoc,
                mouseX, mouseY)
        }
        // add elifs for other modes
    })
} 

main()