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
function drawToScreen(gl, program, pick_program, fb, thingsToDraw,
                        positionBuffer, colorBuffer,
                        positionAttLoc, colorAttLoc,
                        drawMode, modes,
                        pick_positionBuffer, pick_positionAttLoc, pick_colorUnLoc,
                        mouseX, mouseY, nowColor) {
    // clear screen first wkwkw
    clearScreenToWhite(gl)

    /* DRAW TO TEXTURE */
    gl.bindFramebuffer(gl.FRAMEBUFFER, fb);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.enable(gl.CULL_FACE);
    gl.enable(gl.DEPTH_TEST);

    gl.useProgram(pick_program) // pick_program for drawing to the texture
    thingsToDraw.map(thing => {
        // yeah bind first
        gl.bindBuffer(gl.ARRAY_BUFFER, pick_positionBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(thing.positions), gl.STATIC_DRAW);
        gl.enableVertexAttribArray(pick_positionAttLoc);
        // how to get position
        var size = 2
        var type = gl.FLOAT
        var normalize = false
        var stride = 0
        var offset = 0
        gl.vertexAttribPointer(pick_positionAttLoc, size, type, normalize, stride, offset);

        // habisitu color --  as a uniform soalnya dibuat sama karena dia adalah id
        var colorArray = [
            ((thing.id >> 0) & 0xFF) / 0xFF,
            ((thing.id >> 8) & 0xFF) / 0xFF,
            ((thing.id >> 16) & 0xFF) / 0xFF,
            ((thing.id >> 24) & 0xFF) / 0xFF
        ]
        gl.uniform4fv(pick_colorUnLoc, colorArray)

        var primitiveType = gl.POINTS
        var offset = 0;
        var count = thing.positions.length/2;
        gl.drawArrays(primitiveType, offset, count);
    })

    /* PIXEL UNDER MOUSE ON TEXTURE */
    const data = new Uint8Array(4);
    gl.readPixels(
        mouseX + 3,
        gl.canvas.height - mouseY - 1,
        1,                 // width
        1,                 // height
        gl.RGBA,           // format
        gl.UNSIGNED_BYTE,  // type
        data);             // typed array to hold result
    
    if(data[0] > 0){
        if(drawMode == modes.CCOLOR){
            thingsToDraw[data[0]-1].color = nowColor
        }
        else if (drawMode == modes.MOVE){
            if(thingsToDraw[data[0]-1].drawMode == modes.POLYGON){
                const pickedPoint = findNearestVertex(mouseX, mouseY, thingsToDraw[data[0]-1].positions)
                thingsToDraw[data[0]-1].positions[pickedPoint.x] = mouseX
                thingsToDraw[data[0]-1].positions[pickedPoint.y] = mouseY
            }
            else if (thingsToDraw[data[0]-1].drawMode == modes.LINE){
                const pickedPoint = findNearestVertex(mouseX, mouseY, thingsToDraw[data[0]-1].positions)
                thingsToDraw[data[0]-1].positions[pickedPoint.x] = mouseX
                thingsToDraw[data[0]-1].positions[pickedPoint.y] = mouseY

            }
        }
    }
    document.getElementById("C").innerHTML = data[0] + " " + data[1] + " " + data[2] + " " + data[3]

    /* DRAW TO CANVAS */
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    gl.useProgram(program)
    thingsToDraw.map(thing => {
        // position dulu
        gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(thing.positions), gl.STATIC_DRAW);
        gl.enableVertexAttribArray(positionAttLoc);
        // how to get position
        var size = 2
        var type = gl.FLOAT
        var normalize = false
        var stride = 0
        var offset = 0
        gl.vertexAttribPointer(positionAttLoc, size, type, normalize, stride, offset);

        //habisitu color
        var colorArray = []
        var numPoints = thing.positions.length/2
        for(var i = 0; i < numPoints; i++){
            colorArray.push(thing.color[0], thing.color[1], thing.color[2])
        }

        gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Uint8Array(colorArray), gl.STATIC_DRAW);
        gl.enableVertexAttribArray(colorAttLoc);
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
            primitiveType = gl.LINES

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

// set parameters for texture and renderbuffer
function setFrameBufferAttachmentSizes(gl, width, height, targetTexture, depthBuffer){
    // i guess ini tuh buat ngeset parameter2 si texture?
    gl.bindTexture(gl.TEXTURE_2D, targetTexture)
    // definisikan parameter2 tekstur
    const level = 0;
    const internalFormat = gl.RGBA;
    const border = 0;
    const format = gl.RGBA;
    const type = gl.UNSIGNED_BYTE;
    const data = null; // emang kosong, cuma perlu buat alokasi sebuah texture
    gl.texImage2D(gl.TEXTURE_2D,
                    level,
                    internalFormat,
                    width, height,
                    border,
                    format,
                    type,
                    data);

    // ini baru soal depth
    gl.bindRenderbuffer(gl.RENDERBUFFER, depthBuffer);
    gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH_COMPONENT16, width, height);
}

//return indexes of x and y respectively -- to change in the attribute
function findNearestVertex(X, Y, arrayOfLoc){
    // assumption: arrayOfLoc selalu bernilai genap karena merupakan pasangan titik
    var min = Infinity
    var xret, yret
    for (var i = 0; i < arrayOfLoc.length; i += 2){
        var cand_min = calcDistance(X, Y, arrayOfLoc[i], arrayOfLoc[i+1])
        if(cand_min < min){
            min = cand_min
            xret = i
            yret = i+1
        }
    }
    return {
        x : xret,
        y : yret
    }
}

function calcDistance(x1, y1, x2, y2){
    return Math.sqrt( (x1-x2)**2 + (y1-y2)**2 );
}