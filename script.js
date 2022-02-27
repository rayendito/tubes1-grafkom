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
    var firstPointLine = true
    var firstPointSquare = true
    var firstPointRectangle = true
    var hover_draw_line      = false;
    var hover_draw_rectangle = false;
    var hover_draw_square = false;
    const modes = {
        NONE: -1,
        LINE : 0,
        SQUARE : 1,
        RECTANGLE : 2,
        POLYGON : 3,
        CCOLOR: 4,
        MOVE : 5
    }
    var drawMode = modes.NONE
    var thingsToDraw = []
    var thingsToDrawLength = thingsToDraw.length
    // mouse location
    let mouseX = -1;
    let mouseY = -1;
    // mouse state
    var mouseClicked = false

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
    
    drawToScreen(gl, program, pick_program, fb, thingsToDraw,
                    positionBuffer, colorBuffer,
                    positionAttLoc, colorAttLoc,
                    drawMode, modes,
                    pick_positionBuffer, pick_positionAttLoc, pick_colorUnLoc,
                    mouseX, mouseY, nowColor)

    /********** EVENT LISTENERS **********/
    // changing modes
    const noSelect = document.getElementById("noneBtn")
    noSelect.addEventListener("click", function(e){
        // artinya lagi ga milih apa apa, not drawing anything
        drawMode = -1
        document.getElementById("curMode").innerHTML = "NONE"
        firstPointPolygon = true
        firstPointLine = true
        firstPointSquare = true
    })

    const line = document.getElementById("lineBtn")
    line.addEventListener("click", function(e){
        drawMode = modes.LINE
        document.getElementById("curMode").innerHTML = "LINE"
        firstPointLine = true
        
    })

    const square = document.getElementById("squareBtn")
    square.addEventListener("click", function(e){
        drawMode = modes.SQUARE
        document.getElementById("curMode").innerHTML = "SQUARE"
        firstPointSquare = true
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
        firstPointPolygon = true
    
    })

    const ccolor = document.getElementById("changeColBtn")
    ccolor.addEventListener("click", function(e){
        drawMode = modes.CCOLOR
        document.getElementById("curMode").innerHTML = "CCOLOR"
    })

    const btn_save = document.getElementById("saveBtn")
    btn_save.addEventListener("click", function(e){
        save(); 
    })

    const btn_load = document.getElementById("loadBtn")
    btn_load.addEventListener("click", function(e){
        load();
        close_btn_handler();
    })


    const move = document.getElementById("moveBtn")
    move.addEventListener("click", function(e){
        drawMode = modes.MOVE
        document.getElementById("curMode").innerHTML = "MOVE"
    })

    //color picker
    const colorpick = document.getElementById("colorBtn")
    colorpick.addEventListener('change', function(e){
        const rgb = hexToRGB(e.target.value)
        nowColor = rgb
    })


    /* canvas event listener */
    canvas.addEventListener('mousemove', (e) => {
        const rect = canvas.getBoundingClientRect();
        mouseX = e.clientX - rect.left;
        mouseY = e.clientY - rect.top;
        document.getElementById("X").innerHTML = mouseX
        document.getElementById("Y").innerHTML = mouseY
        if(drawMode == modes.MOVE){
            if(mouseClicked){
                drawToScreen(gl, program, pick_program, fb, thingsToDraw,
                    positionBuffer, colorBuffer,
                    positionAttLoc, colorAttLoc,
                    drawMode, modes,
                    pick_positionBuffer, pick_positionAttLoc, pick_colorUnLoc,
                    mouseX, mouseY, nowColor)
            }
            
        }
        if(hover_draw_line){
            if(thingsToDraw[thingsToDrawLength-1].positions.length == 2){
                thingsToDraw[thingsToDrawLength-1].positions.push(mouseX, mouseY)
            }else{
                thingsToDraw[thingsToDrawLength-1].positions[thingsToDraw[thingsToDrawLength-1].positions.length-1]= mouseY;
                thingsToDraw[thingsToDrawLength-1].positions[thingsToDraw[thingsToDrawLength-1].positions.length-2]= mouseX;
            }
            drawToScreen(gl, program, pick_program, fb, thingsToDraw,
                positionBuffer, colorBuffer,
                positionAttLoc, colorAttLoc,
                drawMode, modes,
                pick_positionBuffer, pick_positionAttLoc, pick_colorUnLoc,
                mouseX, mouseY, nowColor)
        }

        if(hover_draw_square){
            var initPoint = thingsToDraw[thingsToDrawLength-1].positions
            var side = 0;
            if (mouseY > initPoint[1]){
                side = Math.abs(mouseX - initPoint[0])
            } else {
                side = -1 * Math.abs(mouseX - initPoint[0])
            }
            if(thingsToDraw[thingsToDrawLength-1].positions.length == 2){
                thingsToDraw[thingsToDrawLength-1].positions.push(mouseX, initPoint[initPoint.length-1])
                thingsToDraw[thingsToDrawLength-1].positions.push(initPoint[initPoint.length-2], initPoint[1] + side)
                thingsToDraw[thingsToDrawLength-1].positions.push(initPoint[0], initPoint[1] + side)
            }else{
                thingsToDraw[thingsToDrawLength-1].positions[2]= mouseX;
                thingsToDraw[thingsToDrawLength-1].positions[3]= initPoint[1];
                thingsToDraw[thingsToDrawLength-1].positions[4]= initPoint[2];
                thingsToDraw[thingsToDrawLength-1].positions[5]= initPoint[1] + side;
                thingsToDraw[thingsToDrawLength-1].positions[6]= initPoint[0];
                thingsToDraw[thingsToDrawLength-1].positions[7]= initPoint[1] + side;
                //console.log(initPoint)

            }
            drawToScreen(gl, program, pick_program, fb, thingsToDraw,
                positionBuffer, colorBuffer,
                positionAttLoc, colorAttLoc,
                drawMode, modes,
                pick_positionBuffer, pick_positionAttLoc, pick_colorUnLoc,
                mouseX, mouseY, nowColor)
        }

        if(hover_draw_rectangle){
            var initPoint = thingsToDraw[thingsToDrawLength-1].positions
            if(thingsToDraw[thingsToDrawLength-1].positions.length == 2){
                thingsToDraw[thingsToDrawLength-1].positions.push(mouseX, initPoint[initPoint.length-1])
                thingsToDraw[thingsToDrawLength-1].positions.push(initPoint[initPoint.length-2], mouseY)
                thingsToDraw[thingsToDrawLength-1].positions.push(initPoint[0], mouseY)
            }else{
                thingsToDraw[thingsToDrawLength-1].positions[2]= mouseX;
                thingsToDraw[thingsToDrawLength-1].positions[3]= initPoint[1];
                thingsToDraw[thingsToDrawLength-1].positions[4]= initPoint[2];
                thingsToDraw[thingsToDrawLength-1].positions[5]= mouseY;
                thingsToDraw[thingsToDrawLength-1].positions[6]= initPoint[0];
                thingsToDraw[thingsToDrawLength-1].positions[7]= mouseY;
                //console.log(initPoint)

            }
            drawToScreen(gl, program, pick_program, fb, thingsToDraw,
                positionBuffer, colorBuffer,
                positionAttLoc, colorAttLoc,
                drawMode, modes,
                pick_positionBuffer, pick_positionAttLoc, pick_colorUnLoc,
                mouseX, mouseY, nowColor)
        }

        
    })

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
            drawToScreen(gl, program, pick_program, fb, thingsToDraw,
                positionBuffer, colorBuffer,
                positionAttLoc, colorAttLoc,
                drawMode, modes,
                pick_positionBuffer, pick_positionAttLoc, pick_colorUnLoc,
                mouseX, mouseY, nowColor)

        }else if (drawMode== modes.LINE){
            if(firstPointLine){
                thingsToDraw.push({
                    id: thingsToDrawLength+1,
                    positions:[
                        e.pageX, e.pageY-this.offsetTop
                    ],
                    color : nowColor,
                    drawMode :modes.LINE
                })
                thingsToDrawLength++
                firstPointLine = false;
                hover_draw_line = true
                console.log(thingsToDraw)
                // console.log(hover_draw_line)
            }
            else{

                if(hover_draw_line){
                    thingsToDraw[thingsToDrawLength-1].positions[thingsToDraw[thingsToDrawLength-1].positions.length-1]= e.pageY-this.offsetTop;
                    thingsToDraw[thingsToDrawLength-1].positions[thingsToDraw[thingsToDrawLength-1].positions.length-2]= e.pageX;

                }
                firstPointLine = true;
                hover_draw_line = false;
            }

            
            drawToScreen(gl, program, pick_program, fb, thingsToDraw,
                positionBuffer, colorBuffer,
                positionAttLoc, colorAttLoc,
                drawMode, modes,
                pick_positionBuffer, pick_positionAttLoc, pick_colorUnLoc,
                mouseX, mouseY, nowColor)


        } else if (drawMode == modes.SQUARE){
            if(firstPointSquare){
                thingsToDraw.push({
                    id: thingsToDrawLength+1,
                    positions:[
                        e.pageX, e.pageY-this.offsetTop
                    ],
                    color : nowColor,
                    drawMode :modes.SQUARE
                })
                thingsToDrawLength++
                firstPointSquare = false;
                hover_draw_square = true
                // console.log(thingsToDraw)
                // console.log(hover_draw_line)
            }
            else{

                if(hover_draw_square){
                    var initPosition = thingsToDraw[thingsToDrawLength-1].positions
                    var side = 0;
                    if (mouseY > initPosition[1]){
                        side = Math.abs(mouseX - initPosition[0])
                    } else {
                        side = -1 * Math.abs(mouseX - initPosition[0])
                    }
                    thingsToDraw[thingsToDrawLength-1].positions[2]= e.pageX;
                    thingsToDraw[thingsToDrawLength-1].positions[3]= initPosition[1];
                    thingsToDraw[thingsToDrawLength-1].positions[4]= initPosition[2];
                    thingsToDraw[thingsToDrawLength-1].positions[5]= initPosition[1] + side;
                    thingsToDraw[thingsToDrawLength-1].positions[6]= initPosition[0];
                    thingsToDraw[thingsToDrawLength-1].positions[7]= initPosition[1] + side;
                    //console.log(thingsToDraw)

                }
                firstPointSquare = true;
                hover_draw_square = false;
            }

            
            drawToScreen(gl, program, pick_program, fb, thingsToDraw,
                positionBuffer, colorBuffer,
                positionAttLoc, colorAttLoc,
                drawMode, modes,
                pick_positionBuffer, pick_positionAttLoc, pick_colorUnLoc,
                mouseX, mouseY, nowColor)

        } else if (drawMode == modes.RECTANGLE) {
            if(firstPointRectangle){
                thingsToDraw.push({
                    id: thingsToDrawLength+1,
                    positions:[
                        e.pageX, e.pageY-this.offsetTop
                    ],
                    color : nowColor,
                    drawMode :modes.RECTANGLE
                })
                thingsToDrawLength++
                firstPointRectangle = false;
                hover_draw_rectangle = true
                // console.log(thingsToDraw)
                // console.log(hover_draw_line)
            }
            else{

                if(hover_draw_rectangle){
                    var initPosition = thingsToDraw[thingsToDrawLength-1].positions
                    thingsToDraw[thingsToDrawLength-1].positions[2]= e.pageX;
                    thingsToDraw[thingsToDrawLength-1].positions[3]= initPosition[1];
                    thingsToDraw[thingsToDrawLength-1].positions[4]= initPosition[2];
                    thingsToDraw[thingsToDrawLength-1].positions[5]= e.pageY-this.offsetTop;
                    thingsToDraw[thingsToDrawLength-1].positions[6]= initPosition[0];
                    thingsToDraw[thingsToDrawLength-1].positions[7]= e.pageY-this.offsetTop;
                    //console.log(thingsToDraw)

                }
                firstPointRectangle = true;
                hover_draw_rectangle = false;
            }

            
            drawToScreen(gl, program, pick_program, fb, thingsToDraw,
                positionBuffer, colorBuffer,
                positionAttLoc, colorAttLoc,
                drawMode, modes,
                pick_positionBuffer, pick_positionAttLoc, pick_colorUnLoc,
                mouseX, mouseY, nowColor)

        }

        if(drawMode == modes.CCOLOR){
            drawToScreen(gl, program, pick_program, fb, thingsToDraw,
                positionBuffer, colorBuffer,
                positionAttLoc, colorAttLoc,
                drawMode, modes,
                pick_positionBuffer, pick_positionAttLoc, pick_colorUnLoc,
                mouseX, mouseY, nowColor)
        }
    })

    canvas.addEventListener('mousedown', (e) => {
        mouseClicked = true
        
    })

    canvas.addEventListener('mouseup', (e) => {
        mouseClicked = false
        
    })

    function save() {
        var date = new Date()
        var a = document.createElement("a");
        var file = new Blob([JSON.stringify(thingsToDraw)], {type : "text/plain"});
        a.href = URL.createObjectURL(file);
        a.download = `save_${date}.txt`;
        a.click();
    }
    
    function load() {
        var src = document.getElementById("load_src");
        var reader = new FileReader();
    
        reader.readAsText(src.files[0]);
        reader.onerror = (e) => {console.log("Load error")};
        reader.onload  = (e) => {
            thingsToDraw = JSON.parse(e.target.result);
            thingsToDrawLength = thingsToDraw.length;
            drawToScreen(gl, program, pick_program, fb, thingsToDraw,
                positionBuffer, colorBuffer,
                positionAttLoc, colorAttLoc,
                drawMode, modes,
                pick_positionBuffer, pick_positionAttLoc, pick_colorUnLoc,
                mouseX, mouseY, nowColor)
        };
    }
}
var modalLoad = document.getElementById("modalload")
function close_btn_handler(){
    modalLoad.style.display = "none";
}

function open_btn_handler_load(){
    modalLoad.style.display = "Flex";
}


main()