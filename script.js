"use strict";

function main(){
    // get webgl context
    const canvas = document.getElementById("canvas")
    const gl = canvas.getContext("webgl")

    if (gl === null){
        alert("browser ga support webgl :(")
        return
    }
    
    // set viewport to full height and width of the canvas
    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height)

    // get the source codes for the shader programs
    const vertexSource = document.getElementById("vertex-src").text
    const fragmentSource = document.getElementById("fragment-scr").text
}