//Crown
//Porject 1 Wenjie Zhang (wzm416)


// Vertex shader program----------------------------------
var VSHADER_SOURCE =
  'uniform mat4 u_ModelMatrix;\n' +
  'attribute vec4 a_Position;\n' +
  'attribute vec4 a_Color;\n' +
  'varying vec4 v_Color;\n' +
  'void main() {\n' +
  '  gl_Position = u_ModelMatrix * a_Position;\n' +
  '  gl_PointSize = 10.0;\n' +
  '  v_Color = a_Color;\n' +
  '}\n';


// Fragment shader program----------------------------------
var FSHADER_SOURCE =
//  '#ifdef GL_ES\n' +
  'precision mediump float;\n' +
//  '#endif GL_ES\n' +
  'varying vec4 v_Color;\n' +
  'void main() {\n' +
  '  gl_FragColor = v_Color;\n' +
  '}\n';
//  Each instance computes all the on-screen attributes for just one PIXEL.
// here we do the bare minimum: if we draw any part of any drawing primitive in 
// any pixel, we simply set that pixel to the constant color specified here.


// Global Variable -- Rotation angle rate (degrees/second)
var ANGLE_STEP = 25.0;

// Global vars for mouse click-and-drag for rotation.
var isDrag=false;   // mouse-drag: true when user holds down mouse button
var xMclik=0.0;     // last mouse button-down position (in CVV coords)
var yMclik=0.0;   
var xMdragTot=0.0;  // total (accumulated) mouse-drag amounts (in CVV coords).
var yMdragTot=0.0; 

var Keypress = 0.0; 

var Xloc=0;
var Yloc=0;

var Xstep=0;
var Ystep=0;

function main() {


//==============================================================================
  // Retrieve <canvas> element
  var canvas = document.getElementById('webgl');

  // Get the rendering context for WebGL
  var gl = getWebGLContext(canvas);
  if (!gl) {
    console.log('Failed to get the rendering context for WebGL');
    return;
  }

  // Initialize shaders
  if (!initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)) {
    console.log('Failed to intialize shaders.');
    return;
  }

  // Write the positions of vertices into an array, transfer
  // array contents to a Vertex Buffer Object created in the
  // graphics hardware.
  var n = initVertexBuffers(gl);
  if (n < 0) {
    console.log('Failed to set the positions of the vertices');
    return;
  }

  //mouse event
  canvas.onmousedown  = function(ev){myMouseDown( ev, gl, canvas) }; 
  canvas.onmousemove =  function(ev){myMouseMove( ev, gl, canvas) };
  canvas.onmouseup =    function(ev){myMouseUp(   ev, gl, canvas)};

  // key event
  window.addEventListener("keydown", myKeyDown, false);
  window.addEventListener("keyup", myKeyUp, false);
  window.addEventListener("keypress", myKeyPress, false);


  // Specify the color for clearing <canvas>
  gl.clearColor(1, 0, 1, 1);

  gl.depthFunc(gl.LESS);
  gl.enable(gl.DEPTH_TEST); 

  // Get storage location of u_ModelMatrix
  var u_ModelMatrix = gl.getUniformLocation(gl.program, 'u_ModelMatrix');
  if (!u_ModelMatrix) { 
    console.log('Failed to get the storage location of u_ModelMatrix');
    return;
  }


  // Create a local version of our model matrix in JavaScript 
  var modelMatrix = new Matrix4();
	// Current rotation angle
  var currentAngle = 0.0;
var tick = function() {
    currentAngle = animate(currentAngle);  // Update the rotation angle
    draw(gl, n, currentAngle, modelMatrix, u_ModelMatrix); 
    initVertexBuffers(gl,currentAngle);  // Draw the triangle
    requestAnimationFrame(tick, canvas);   // Request that the browser ?calls tick
  };
  tick();

}

function initVertexBuffers(gl,currentAngle) {


var c30 = Math.sqrt(3); 
//==============================================================================
  var colorShapes = new Float32Array ([

    // +x face: RED
     1.0, -1.0, -1.0, 1.0,    1.0, 0.0, 0.0,  // Node 3
     1.0,  1.0, -1.0, 1.0,    1.0, 0.0, 0.0,  // Node 2
     1.0,  1.0,  1.0, 1.0,    1.0, 0.0, 0.0,  // Node 4
     
     1.0,  1.0,  1.0, 1.0,    1.0, 0.1, 0.1,  // Node 4
     1.0, -1.0,  1.0, 1.0,    1.0, 0.1, 0.1,  // Node 7
     1.0, -1.0, -1.0, 1.0,    1.0, 0.1, 0.1,  // Node 3

    // +y face: GREEN
    -1.0,  1.0, -1.0, 1.0,    0.0, 1.0, 0.0,  // Node 1
    -1.0,  1.0,  1.0, 1.0,    0.0, 1.0, 0.0,  // Node 5
     1.0,  1.0,  1.0, 1.0,    0.0, 1.0, 0.0,  // Node 4

     1.0,  1.0,  1.0, 1.0,    0.1, 1.0, 0.1,  // Node 4
     1.0,  1.0, -1.0, 1.0,    0.1, 1.0, 0.1,  // Node 2 
    -1.0,  1.0, -1.0, 1.0,    0.1, 1.0, 0.1,  // Node 1

    // +z face: BLUE
    -1.0,  1.0,  1.0, 1.0,    0.0, 0.0, 1.0,  // Node 5
    -1.0, -1.0,  1.0, 1.0,    0.0, 0.0, 1.0,  // Node 6
     1.0, -1.0,  1.0, 1.0,    0.0, 0.0, 1.0,  // Node 7

     1.0, -1.0,  1.0, 1.0,    0.1, 0.1, 1.0,  // Node 7
     1.0,  1.0,  1.0, 1.0,    0.1, 0.1, 1.0,  // Node 4
    -1.0,  1.0,  1.0, 1.0,    0.1, 0.1, 1.0,  // Node 5

    // -x face: CYAN
    -1.0, -1.0,  1.0, 1.0,    0.0, 1.0, 1.0,  // Node 6 
    -1.0,  1.0,  1.0, 1.0,    0.0, 1.0, 1.0,  // Node 5 
    -1.0,  1.0, -1.0, 1.0,    0.0, 1.0, 1.0,  // Node 1
    
    -1.0,  1.0, -1.0, 1.0,    0.1, 1.0, 1.0,  // Node 1
    -1.0, -1.0, -1.0, 1.0,    0.1, 1.0, 1.0,  // Node 0  
    -1.0, -1.0,  1.0, 1.0,    0.1, 1.0, 1.0,  // Node 6  
    
    // -y face: MAGENTA
     1.0, -1.0, -1.0, 1.0,    1.0, 0.0, 1.0,  // Node 3
     1.0, -1.0,  1.0, 1.0,    1.0, 0.0, 1.0,  // Node 7
    -1.0, -1.0,  1.0, 1.0,    1.0, 0.0, 1.0,  // Node 6

    -1.0, -1.0,  1.0, 1.0,    1.0, 0.1, 1.0,  // Node 6
    -1.0, -1.0, -1.0, 1.0,    1.0, 0.1, 1.0,  // Node 0
     1.0, -1.0, -1.0, 1.0,    1.0, 0.1, 1.0,  // Node 3

     // -z face: YELLOW
     1.0,  1.0, -1.0, 1.0,    1.0, 1.0, 0.0,  // Node 2
     1.0, -1.0, -1.0, 1.0,    1.0, 1.0, 0.0,  // Node 3
    -1.0, -1.0, -1.0, 1.0,    1.0, 1.0, 0.0,  // Node 0   

    -1.0, -1.0, -1.0, 1.0,    1.0, 1.0, 0.1,  // Node 0
    -1.0,  1.0, -1.0, 1.0,    1.0, 1.0, 0.1,  // Node 1
     1.0,  1.0, -1.0, 1.0,    1.0, 1.0, 0.1,  // Node 2

     // 

       0.0, 1.0, 0.0, 1.0,        0.2, 0.4, 0.2,  
       1.0, 0, 0, 1.0,            0.2, 0.4, 0.2,
       Math.cos((Math.PI)/6), 0, Math.sin((Math.PI)/6), 1.0,         currentAngle/360, 1.0, 0.2,
       Math.cos((Math.PI)/3), 0, Math.sin((Math.PI)/3), 1.0,     0, 1.0, 0.2,
       0, 0, 1, 1.0,       1.0, 1.0, 0.2,
       Math.cos(2*(Math.PI)/3), 0, Math.sin(2*(Math.PI)/3), 1.0,     currentAngle/360, 0, 0,
       Math.cos(5*(Math.PI)/6), 0, Math.sin(5*(Math.PI)/6), 1.0,     0, 0, currentAngle/360,
      -1.0, 0, 0, 1.0,     1.0, 1.0, 0.2,
       Math.cos(7*(Math.PI)/6), 0, Math.sin(7*(Math.PI)/6), 1.0,     currentAngle/360, 1.0, 0.2,
       Math.cos(4*(Math.PI)/3), 0, Math.sin(4*(Math.PI)/3), 1.0,     1.0, 1.0, 0.2,
       0.0, 0, -1, 1.0,     1.0, 1.0, 0.2,
       Math.cos(5*(Math.PI)/3), 0, Math.sin(5*(Math.PI)/3), 1.0,   currentAngle/360, 0.3, 0.2,
       Math.cos(11*(Math.PI)/6), 0, Math.sin(11*(Math.PI)/6), 1.0,   currentAngle/360, 0.3, 0.2,
       1.0, 0, 0, 1.0,            1.0, 1.0, 0.2,

       0.0, 0.0, 0.0, 1.0,        0.2, 0.4, 0.2,  
       1.0, 0, 0, 1.0,            0.2, 0.4, 0.2,
       Math.cos((Math.PI)/6), 0, Math.sin((Math.PI)/6), 1.0,         currentAngle/360, 1.0, 0.2,
       Math.cos((Math.PI)/3), 0, Math.sin((Math.PI)/3), 1.0,     currentAngle/360, 1.0, 0.2,
       0, 0, 1, 1.0,       1.0, 1.0, 0.2,
       Math.cos(2*(Math.PI)/3), 0, Math.sin(2*(Math.PI)/3), 1.0,     0, currentAngle/360, 0,
       Math.cos(5*(Math.PI)/6), 0, Math.sin(5*(Math.PI)/6), 1.0,     currentAngle/360, 0, 0,
      -1.0, 0, 0, 1.0,     1.0, 1.0, 0.2,
       Math.cos(7*(Math.PI)/6), 0, Math.sin(7*(Math.PI)/6), 1.0,     currentAngle/360, 1.0, 0.2,
       Math.cos(4*(Math.PI)/3), 0, Math.sin(4*(Math.PI)/3), 1.0,     1.0, 1.0, 0.2,
       0.0, 0, -1, 1.0,     1.0, 1.0, 0.2,
       Math.cos(5*(Math.PI)/3), 0, Math.sin(5*(Math.PI)/3), 1.0,   0.5, 0.3, 0.2,
       Math.cos(11*(Math.PI)/6), 0, Math.sin(11*(Math.PI)/6), 1.0,   currentAngle/360, 0.3, 0.2,
       1.0, 0, 0, 1.0,            1.0, 1.0, 0.2,

        0.0, 0.5, 0.0, 1.0,        1.0, 0.5, 0.2,  
        1.0, 0.5, 0, 1.0,            1.0, 0.5, 0.2,
        Math.cos((Math.PI)/6), 0.5, Math.sin((Math.PI)/6), 1.0,        0.5, 0.3, 0.2,
        Math.cos((Math.PI)/3), 0.5, Math.sin((Math.PI)/3), 1.0,     0.5, 0.3, 0.2,
        0, 0.5, 1, 1.0,       1,1,1,
        Math.cos(2*(Math.PI)/3), 0.5, Math.sin(2*(Math.PI)/3), 1.0,     1.0, 1.0, 0.2,
        Math.cos(5*(Math.PI)/6), 0.5, Math.sin(5*(Math.PI)/6), 1.0,     1.0, 1.0, 0.2,
       -1.0, 0.5, 0, 1.0,     1,1,1,
        Math.cos(7*(Math.PI)/6), 0.5, Math.sin(7*(Math.PI)/6), 1.0,     0.2, 0.4, 0.2,
        Math.cos(4*(Math.PI)/3), 0.5, Math.sin(4*(Math.PI)/3), 1.0,     0.2, 0.4, 0.2,
        0.0, 0.5, -1, 1.0,     1,1,1,
        Math.cos(5*(Math.PI)/3), 0.5, Math.sin(5*(Math.PI)/3), 1.0,   0, 1.0, 0.2,
        Math.cos(11*(Math.PI)/6), 0.5, Math.sin(11*(Math.PI)/6), 1.0,   0, 1.0, 0.2,
        1.0, 0.5, 0, 1.0,            1,1,1,
//  皇冠底座

        0.0, 0.0, 0.0, 1.0,        currentAngle/360, 0.4, 0.2, 
        0.0, 0.5, 0.0, 1.0,        1.0, currentAngle/360, 0.2, 
        1.0, 0, 0, 1.0,            0.2, 0.4, currentAngle/360, 
        1.0, 0.5, 0, 1.0,            currentAngle/360, 0.5, 0.2,
        Math.cos((Math.PI)/6), 0, Math.sin((Math.PI)/6), 1.0,         currentAngle/360, 1.0, 0.2,
        Math.cos((Math.PI)/6), 0.5, Math.sin((Math.PI)/6), 1.0,         0, 1.0, currentAngle/360,
        Math.cos((Math.PI)/3), 0, Math.sin((Math.PI)/3), 1.0,     0, currentAngle/360, 0.2,
        Math.cos((Math.PI)/3), 0.5, Math.sin((Math.PI)/3), 1.0,     currentAngle/360, 1.0, 0.2,
       0, 0, 1, 1.0,       1.0, currentAngle/360, 0.2,
       0, 0.5, 1, 1.0,       currentAngle/360, 1.0, 0.2,
       Math.cos(2*(Math.PI)/3), 0, Math.sin(2*(Math.PI)/3), 1.0,     currentAngle/360, 0, 0,
       Math.cos(2*(Math.PI)/3), 0.5, Math.sin(2*(Math.PI)/3), 1.0,     0, 0, currentAngle/360,
       Math.cos(5*(Math.PI)/6), 0, Math.sin(5*(Math.PI)/6), 1.0,     0, currentAngle/360, 0,
       Math.cos(5*(Math.PI)/6), 0.5, Math.sin(5*(Math.PI)/6), 1.0,     currentAngle/360, 0, 0,
      -1.0, 0, 0, 1.0,     currentAngle/360, 1.0, 0.2,
      -1.0, 0.5, 0, 1.0,     currentAngle/360, 1.0, 0.2,
       Math.cos(7*(Math.PI)/6), 0, Math.sin(7*(Math.PI)/6), 1.0,     1.0, currentAngle/360, 0.2,
       Math.cos(7*(Math.PI)/6), 0.5, Math.sin(7*(Math.PI)/6), 1.0,     currentAngle/360, 1.0, 0.2,
       Math.cos(4*(Math.PI)/3), 0, Math.sin(4*(Math.PI)/3), 1.0,     currentAngle/360, 1.0, 0.2,
       Math.cos(4*(Math.PI)/3), 0.5, Math.sin(4*(Math.PI)/3), 1.0,     1.0, 1.0, currentAngle/360,
       0.0, 0, -1, 1.0,     1.0, 1.0, 0.2,
       0.0, 0.5, -1, 1.0,     1.0, 1.0, 0.2,
       Math.cos(5*(Math.PI)/3), 0, Math.sin(5*(Math.PI)/3), 1.0,   0.5, currentAngle/360, 0.2,
       Math.cos(5*(Math.PI)/3), 0.5, Math.sin(5*(Math.PI)/3), 1.0,   currentAngle/360, 0.3, 0.2,
       Math.cos(11*(Math.PI)/6), 0, Math.sin(11*(Math.PI)/6), 1.0,   0.5, 0.3, 0.2,
       Math.cos(11*(Math.PI)/6), 0.5, Math.sin(11*(Math.PI)/6), 1.0,   0.5, currentAngle/360, 0.2,
       1.0, 0, 0, 1.0,              1.0, 1.0, 0.2,
       1.0, 0.5, 0, 1.0,            currentAngle/360, 1.0, 0.2,


//皇冠上面

        Math.cos((Math.PI)/6), 0.5, Math.sin((Math.PI)/6), 1.0,        0.5, yMdragTot, 0.2,
        0.75, 0.9, 0, 1.0,            1.0, xMdragTot, 0.2,
        Math.cos(11*(Math.PI)/6), 0.5, Math.sin(11*(Math.PI)/6), 1.0,   xMdragTot, 0.3, yMdragTot,

        1.0, 0.5, 0, 1.0,            1.0, 0.5, 0.2,
        0.75*Math.cos((Math.PI)/6), 0.9, 0.75*Math.sin((Math.PI)/6), 1.0,       yMdragTot, 0.3, 0.2,
        Math.cos((Math.PI)/3), 0.5, Math.sin((Math.PI)/3), 1.0,     xMdragTot, 1.0, 0.2,
        
        Math.cos((Math.PI)/6), 0.5, Math.sin((Math.PI)/6), 1.0,   xMdragTot, 0.3, 0.2,
        0.75*Math.cos((Math.PI)/3), 0.9, 0.75*Math.sin((Math.PI)/3), 1.0,     0.5, yMdragTot, 0.2,
        0, 0.5, 1, 1.0,       1.0, 1.0, 0.2,

        Math.cos((Math.PI)/3), 0.5, Math.sin((Math.PI)/3), 1.0,     0.5, yMdragTot, 0.2,
        0, 0.9, 0.75, 1.0,       1,1,1,
        Math.cos(2*(Math.PI)/3), 0.5, Math.sin(2*(Math.PI)/3), 1.0,     xMdragTot, yMdragTot, 0,

        0, 0.5, 1, 1.0,       1.0, 1.0, 0.2,
        0.75*Math.cos(2*(Math.PI)/3), 0.9, 0.75*Math.sin(2*(Math.PI)/3), 1.0,     yMdragTot, 1.0, 0.2,
        Math.cos(5*(Math.PI)/6), 0.5, Math.sin(5*(Math.PI)/6), 1.0,     xMdragTot, 0, 0,

        Math.cos(2*(Math.PI)/3), 0.5, Math.sin(2*(Math.PI)/3), 1.0,     0, xMdragTot, 0,
        0.75*Math.cos(5*(Math.PI)/6), 0.9, 0.75*Math.sin(5*(Math.PI)/6), 1.0,     xMdragTot, 1.0, xMdragTot,
        -1.0, 0.5, 0, 1.0,     1.0, 1.0, 0.2,

       Math.cos(5*(Math.PI)/6), 0.5, Math.sin(5*(Math.PI)/6), 1.0,     0, yMdragTot, 0,
       -0.75, 0.9, 0, 1.0,     1,1,1,
       Math.cos(7*(Math.PI)/6), 0.5, Math.sin(7*(Math.PI)/6), 1.0,     xMdragTot, xMdragTot, 0.2,

        -1.0, 0.5, 0, 1.0,     xMdragTot, 1.0, 0.2,
        0.75*Math.cos(7*(Math.PI)/6), 0.9, 0.75*Math.sin(7*(Math.PI)/6), 1.0,     xMdragTot, 0.4, yMdragTot,
        Math.cos(4*(Math.PI)/3), 0.5, Math.sin(4*(Math.PI)/3), 1.0,     xMdragTot, 1.0, 0.2,


        Math.cos(7*(Math.PI)/6), 0.5, Math.sin(7*(Math.PI)/6), 1.0,     1.0, yMdragTot, 0.2,
        0.75*Math.cos(4*(Math.PI)/3), 0.9, 0.75*Math.sin(4*(Math.PI)/3), 1.0,     xMdragTot, 0.4, 0.2,
        0.0, 0.5, -1, 1.0,     1.0, yMdragTot, 0.2,

        Math.cos(4*(Math.PI)/3), 0.5, Math.sin(4*(Math.PI)/3), 1.0,     yMdragTot, 1.0, 0.2,
        0.0, 0.9, -0.75, 1.0,     yMdragTot,1,1,
        Math.cos(5*(Math.PI)/3), 0.5, Math.sin(5*(Math.PI)/3), 1.0,   0.5, xMdragTot, 0.2,


        0.0, 0.5, -1, 1.0,     1.0, 1.0, 0.2,
        0.75*Math.cos(5*(Math.PI)/3), 0.9, 0.75*Math.sin(5*(Math.PI)/3), 1.0,   0, yMdragTot, 0.2,
        Math.cos(11*(Math.PI)/6), 0.5, Math.sin(11*(Math.PI)/6), 1.0,   0.5, xMdragTot, 0.2,

        
        Math.cos(5*(Math.PI)/3), 0.5, Math.sin(5*(Math.PI)/3), 1.0,   0.5, 0.3, xMdragTot,
        0.75*Math.cos(11*(Math.PI)/6), 0.9, 0.75*Math.sin(11*(Math.PI)/6), 1.0,   yMdragTot, 1.0, 0.2,
        1.0, 0.5, 0, 1.0,            1.0, xMdragTot, 0.2,

// 第二个装饰
        1,0,0,1,               0.5*Math.abs(xMdragTot)+0.12, 0.2*Math.abs(yMdragTot)+0.21, Math.abs(xMdragTot*yMdragTot)+0.6,
        0,0,1,1,               0.5*Math.abs(xMdragTot)+0.12, 0.2*Math.abs(yMdragTot)+0.21, Math.abs(xMdragTot*yMdragTot)+0.5,
        0,1,0,1,               0.5*Math.abs(xMdragTot)+0.12, 0.2*Math.abs(yMdragTot)+0.21, Math.abs(xMdragTot*yMdragTot)+0.8,

        1,0,0,1,               0.5*Math.abs(xMdragTot)+0.2, 0.2*Math.abs(yMdragTot)+0.1, Math.abs(xMdragTot*yMdragTot)+0.6,
        0,0,-1,1,               0.5*Math.abs(xMdragTot)+0.2, 0.2*Math.abs(yMdragTot)+0.1, Math.abs(xMdragTot*yMdragTot)+0.5,
        0,1,0,1,               0.5*Math.abs(xMdragTot)+0.2, 0.2*Math.abs(yMdragTot)+0.1, Math.abs(xMdragTot*yMdragTot)+0.8,

        -1,0,0,1,               0.5*Math.abs(xMdragTot)+0.22, 0.2*Math.abs(yMdragTot)+0.71, Math.abs(xMdragTot*yMdragTot)+0.6,
        0,0,-1,1,               0.5*Math.abs(xMdragTot)+0.22, 0.2*Math.abs(yMdragTot)+0.71, Math.abs(xMdragTot*yMdragTot)+0.5,
        0,1,0,1,               0.5*Math.abs(xMdragTot)+0.22, 0.2*Math.abs(yMdragTot)+0.61, Math.abs(xMdragTot*yMdragTot)+0.8,

        -1,0,0,1,               0.5*Math.abs(xMdragTot)+0.2, 0.2*Math.abs(yMdragTot)+0.31, Math.abs(xMdragTot*yMdragTot)+0.8,
        0,0,1,1,               0.5*Math.abs(xMdragTot)+0.2, 0.2*Math.abs(yMdragTot)+0.31, Math.abs(xMdragTot*yMdragTot)+0.5,
        0,1,0,1,               0.5*Math.abs(xMdragTot)+0.2, 0.2*Math.abs(yMdragTot)+0.31, Math.abs(xMdragTot*yMdragTot)+0.8,

        1,0,0,1,               0.5*Math.abs(xMdragTot)+0.22, 0.2*Math.abs(yMdragTot)+0.31, Math.abs(xMdragTot*yMdragTot)+0.2,
        0,0,1,1,               0.5*Math.abs(xMdragTot)+0.52, 0.2*Math.abs(yMdragTot)+0.31, Math.abs(xMdragTot*yMdragTot)+0.5,
        0,-1,0,1,               0.5*Math.abs(xMdragTot)+0.72, 0.2*Math.abs(yMdragTot)+0.31, Math.abs(xMdragTot*yMdragTot)+0.3,

        -1,0,0,1,               0.5*Math.abs(xMdragTot)+0.2, 0.2*Math.abs(yMdragTot)+0.21, Math.abs(xMdragTot*yMdragTot)+0.1,
        0,0,1,1,               0.5*Math.abs(xMdragTot)+0.2, 0.2*Math.abs(yMdragTot)+0.21, Math.abs(xMdragTot*yMdragTot)+0.8,
        0,-1,0,1,               0.5*Math.abs(xMdragTot)+0.2, 0.2*Math.abs(yMdragTot)+0.21, Math.abs(xMdragTot*yMdragTot)+0.3,

        -1,0,0,1,               0.5*Math.abs(xMdragTot)+0.52, 0.2*Math.abs(yMdragTot)+0.41, Math.abs(xMdragTot*yMdragTot)+0.8,
        0,0,-1,1,               0.5*Math.abs(xMdragTot)+0.42, 0.2*Math.abs(yMdragTot)+0.41, Math.abs(xMdragTot*yMdragTot)+0.8,
        0,-1,0,1,               0.5*Math.abs(xMdragTot)+0.32, 0.2*Math.abs(yMdragTot)+0.41, Math.abs(xMdragTot*yMdragTot)+0.3,

        1,0,0,1,               0.5*Math.abs(xMdragTot)+0.02, 0.2*Math.abs(yMdragTot)+0.81, Math.abs(xMdragTot*yMdragTot)+0.8,
        0,0,-1,1,               0.5*Math.abs(xMdragTot)+0.02, 0.2*Math.abs(yMdragTot)+0.81, Math.abs(xMdragTot*yMdragTot)+0.8,
        0,-1,0,1,               0.5*Math.abs(xMdragTot)+0.02, 0.2*Math.abs(yMdragTot)+0.18, Math.abs(xMdragTot*yMdragTot)+0.3,

]);
  var nn = 100;    // The number of vertices

  // Create a buffer object
  var shapeBufferHandle = gl.createBuffer();
  if (!shapeBufferHandle) {
    console.log('Failed to create the buffer object');
    return -1;
  }

  // Bind the buffer object to target
  gl.bindBuffer(gl.ARRAY_BUFFER, shapeBufferHandle);
  // Write date into the buffer object
  gl.bufferData(gl.ARRAY_BUFFER, colorShapes, gl.STATIC_DRAW);

  var FSIZE = colorShapes.BYTES_PER_ELEMENT; 
  // Assign the buffer object to a_Position variable
  
  var a_Position = gl.getAttribLocation(gl.program, 'a_Position');
  if(a_Position < 0) {
    console.log('Failed to get the storage location of a_Position');
    return -1;
  }
  gl.vertexAttribPointer(a_Position, 4, gl.FLOAT, false, FSIZE *7, 0);

  gl.enableVertexAttribArray(a_Position);

  var a_Color = gl.getAttribLocation(gl.program, 'a_Color');
  if(a_Color < 0) {
    console.log('Failed to get the storage location of a_Color');
    return -1;
  }

  // Use handle to specify how to retrieve color data from our VBO:
  gl.vertexAttribPointer(
    a_Color,        // choose Vertex Shader attribute to fill with data
    3,              // how many values? 1,2,3 or 4. (we're using R,G,B)
    gl.FLOAT,       // data type for each value: usually gl.FLOAT
    false,          // did we supply fixed-point data AND it needs normalizing?
    FSIZE * 7,      // Stride -- how many bytes used to store each vertex?
                    // (x,y,z,w, r,g,b) * bytes/value
    FSIZE * 4);     // Offset -- how many bytes from START of buffer to the
                    // value we will actually use?  Need to skip over x,y,z,w
                    
  gl.enableVertexAttribArray(a_Color); 
  
  gl.bindBuffer(gl.ARRAY_BUFFER, null);
  return nn;
}

function draw(gl, n, currentAngle, modelMatrix, u_ModelMatrix) {
//==============================================================================
  // Clear <canvas>
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

//皇冠基座
   
   var dist = Math.sqrt(xMdragTot*xMdragTot + yMdragTot*yMdragTot);
   switch(Keypress){
    case 37:
    Xstep+=-(Keypress+3)/50000;
    break;
    case 38:
    Ystep+=(Keypress+2)/50000;
    break;
    case 39:
    Xstep+=(Keypress+1)/50000;
    break;
    case 40:
    Ystep+=-(Keypress)/50000;
    default:
    Xstep=Xstep;
    Ystep=Ystep;
    break;
  }
   modelMatrix.setTranslate(Xloc+Xstep,Yloc+Ystep,0);
   modelMatrix.scale(0.3,0.3,0.3); 
   modelMatrix.rotate(dist*120.0, -yMdragTot+0.0001, xMdragTot+0.0001, 0.0);
   modelMatrix.rotate(currentAngle, 0, 1, 0); 
   gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements);
   gl.drawArrays(gl.TRIANGLE_FAN, 50, 14);
   gl.drawArrays(gl.TRIANGLE_FAN, 64, 14);
   gl.drawArrays(gl.TRIANGLE_STRIP, 78, 28);
   gl.drawArrays(gl.TRIANGLES, 106, 36);
   pushMatrix(modelMatrix);

//皇冠装饰
   // modelMatrix.setTranslate(0.375*Math.cos(currentAngle/100), 0.45+0.05+0.05, 0.375*Math.sin(currentAngle/100)); 
   modelMatrix.translate(0.75,1,0);  
   modelMatrix.scale(0.1,0.1,0.1);
   modelMatrix.rotate(180, 0, 0, 1);  
   modelMatrix.rotate(currentAngle*10, 0, 1, 0); 
   gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements);
   gl.drawArrays(gl.TRIANGLE_FAN, 36, 14);
   gl.drawArrays(gl.TRIANGLE_FAN, 50, 14);

   modelMatrix = popMatrix();
   pushMatrix(modelMatrix);

   modelMatrix.translate(0.75*Math.cos((Math.PI)/6) ,1, 0.75*Math.sin((Math.PI)/6));  
   modelMatrix.scale(0.1,0.1,0.1);
   modelMatrix.rotate(180, 0, 0, 1);  
   modelMatrix.rotate(currentAngle*5, 0, 1, 0); 
   gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements);
   gl.drawArrays(gl.TRIANGLE_FAN, 36, 14);
   gl.drawArrays(gl.TRIANGLE_FAN, 50, 14);

   modelMatrix = popMatrix();
   pushMatrix(modelMatrix);

   modelMatrix.translate(0.75*Math.cos((Math.PI)/3) ,1, 0.75*Math.sin((Math.PI)/3));  
   modelMatrix.scale(0.1,0.1,0.1);
   modelMatrix.rotate(180, 0, 0, 1);  
   modelMatrix.rotate(currentAngle*6, 0, 1, 0); 
   gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements);
   gl.drawArrays(gl.TRIANGLE_FAN, 36, 14);
   gl.drawArrays(gl.TRIANGLE_FAN, 50, 14);

   modelMatrix = popMatrix();
   pushMatrix(modelMatrix);

   modelMatrix.translate(0.75*Math.cos((Math.PI)/2) ,1, 0.75*Math.sin((Math.PI)/2));  
   modelMatrix.scale(0.1,0.1,0.1);
   modelMatrix.rotate(180, 0, 0, 1);  
   modelMatrix.rotate(currentAngle*7, 0, 1, 0); 
   gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements);
   gl.drawArrays(gl.TRIANGLE_FAN, 36, 14);
   gl.drawArrays(gl.TRIANGLE_FAN, 50, 14);

   modelMatrix = popMatrix();
   pushMatrix(modelMatrix);

   modelMatrix.translate(0.75*Math.cos((Math.PI)*2/3) ,1, 0.75*Math.sin((Math.PI)*2/3));  
   modelMatrix.scale(0.1,0.1,0.1);
   modelMatrix.rotate(180, 0, 0, 1);  
   modelMatrix.rotate(currentAngle*8, 0, 1, 0); 
   gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements);
   gl.drawArrays(gl.TRIANGLE_FAN, 36, 14);
   gl.drawArrays(gl.TRIANGLE_FAN, 50, 14);

   modelMatrix = popMatrix();
   pushMatrix(modelMatrix);

   modelMatrix.translate(0.75*Math.cos((Math.PI)*5/6) ,1, 0.75*Math.sin((Math.PI)*5/6));  
   modelMatrix.scale(0.1,0.1,0.1);
   modelMatrix.rotate(180, 0, 0, 1);  
   modelMatrix.rotate(currentAngle*9, 0, 1, 0); 
   gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements);
   gl.drawArrays(gl.TRIANGLE_FAN, 36, 14);
   gl.drawArrays(gl.TRIANGLE_FAN, 50, 14);

   modelMatrix = popMatrix();
   pushMatrix(modelMatrix);

   modelMatrix.translate(0.75*Math.cos(Math.PI) ,1, 0.75*Math.sin(Math.PI));  
   modelMatrix.scale(0.1,0.1,0.1);
   modelMatrix.rotate(180, 0, 0, 1);  
   modelMatrix.rotate(currentAngle*10, 0, 1, 0); 
   gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements);
   gl.drawArrays(gl.TRIANGLE_FAN, 36, 14);
   gl.drawArrays(gl.TRIANGLE_FAN, 50, 14);

   modelMatrix = popMatrix();
   pushMatrix(modelMatrix);

   modelMatrix.translate(0.75*Math.cos((Math.PI)*7/6) ,1, 0.75*Math.sin((Math.PI)*7/6));  
   modelMatrix.scale(0.1,0.1,0.1);
   modelMatrix.rotate(180, 0, 0, 1);  
   modelMatrix.rotate(currentAngle*11, 0, 1, 0); 
   gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements);
   gl.drawArrays(gl.TRIANGLE_FAN, 36, 14);
   gl.drawArrays(gl.TRIANGLE_FAN, 50, 14);

   modelMatrix = popMatrix();
   pushMatrix(modelMatrix);

   modelMatrix.translate(0.75*Math.cos((Math.PI)*4/3) ,1, 0.75*Math.sin((Math.PI)*4/3));  
   modelMatrix.scale(0.1,0.1,0.1);
   modelMatrix.rotate(180, 0, 0, 1);  
   modelMatrix.rotate(currentAngle*12, 0, 1, 0); 
   gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements);
   gl.drawArrays(gl.TRIANGLE_FAN, 36, 14);
   gl.drawArrays(gl.TRIANGLE_FAN, 50, 14);

   modelMatrix = popMatrix();
   pushMatrix(modelMatrix);

   modelMatrix.translate(0.75*Math.cos((Math.PI)*3/2) ,1, 0.75*Math.sin((Math.PI)*3/2));  
   modelMatrix.scale(0.1,0.1,0.1);
   modelMatrix.rotate(180, 0, 0, 1);  
   modelMatrix.rotate(currentAngle*13, 0, 1, 0); 
   gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements);
   gl.drawArrays(gl.TRIANGLE_FAN, 36, 14);
   gl.drawArrays(gl.TRIANGLE_FAN, 50, 14);

   modelMatrix = popMatrix();
   pushMatrix(modelMatrix);

   modelMatrix.translate(0.75*Math.cos((Math.PI)*5/3) ,1, 0.75*Math.sin((Math.PI)*5/3));  
   modelMatrix.scale(0.1,0.1,0.1);
   modelMatrix.rotate(180, 0, 0, 1);  
   modelMatrix.rotate(currentAngle*14, 0, 1, 0); 
   gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements);
   gl.drawArrays(gl.TRIANGLE_FAN, 36, 14);
   gl.drawArrays(gl.TRIANGLE_FAN, 50, 14);

   modelMatrix = popMatrix();
   pushMatrix(modelMatrix);

   modelMatrix.translate(0.75*Math.cos((Math.PI)*11/6) ,1, 0.75*Math.sin((Math.PI)*11/6));  
   modelMatrix.scale(0.1,0.1,0.1);
   modelMatrix.rotate(180, 0, 0, 1);  
   modelMatrix.rotate(currentAngle*15, 0, 1, 0); 
   gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements);
   gl.drawArrays(gl.TRIANGLE_FAN, 36, 14);
   gl.drawArrays(gl.TRIANGLE_FAN, 50, 14);

// 2nd 装饰
   modelMatrix = popMatrix();
   pushMatrix(modelMatrix);

  var Zangle = 0.0;

  if(currentAngle/6 < 30.0 )  Zangle = currentAngle/6;
  if(currentAngle/6 > 30.0 ) Zangle = 60.0-currentAngle/6;

  //console.log('Zangle = ' + Zangle);

//第一个
   modelMatrix.translate(1*0.9,-0.05,0*0.9);  
   modelMatrix.scale(0.05,0.05,0.05);
   modelMatrix.rotate(Zangle, 0, 0, 1);  
   modelMatrix.rotate(currentAngle*25, 0, 1, 0); 
   gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements);
   gl.drawArrays(gl.TRIANGLES, 142, 24);

   modelMatrix.translate(0,-2,0);  
   //modelMatrix.scale(0.05,0.05,0.05);
   //modelMatrix.rotate(180, 0, 0, 1);  
   modelMatrix.rotate(currentAngle*20, 0, 1, 0); 
   gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements);
   gl.drawArrays(gl.TRIANGLES, 142, 24);

   modelMatrix.translate(0,-2,0);  
   //modelMatrix.scale(0.05,0.05,0.05);
   //modelMatrix.rotate(180, 0, 0, 1);  
   modelMatrix.rotate(currentAngle*15, 0, 1, 0); 
   gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements);
   gl.drawArrays(gl.TRIANGLES, 142, 24);

   modelMatrix.translate(0,-2,0);  
   //modelMatrix.scale(0.05,0.05,0.05);
   //modelMatrix.rotate(180, 0, 0, 1);  
   modelMatrix.rotate(currentAngle*10, 0, 1, 0); 
   gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements);
   gl.drawArrays(gl.TRIANGLES, 142, 24);

   modelMatrix.translate(0,-2,0);  
   //modelMatrix.scale(0.05,0.05,0.05);
   //modelMatrix.rotate(180, 0, 0, 1);  
   modelMatrix.rotate(currentAngle*5, 0, 1, 0); 
   gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements);
   gl.drawArrays(gl.TRIANGLES, 142, 24);

   modelMatrix.translate(0,-2,0);  
   //modelMatrix.scale(0.05,0.05,0.05);
   //modelMatrix.rotate(180, 0, 0, 1);  
   modelMatrix.rotate(currentAngle, 0, 1, 0); 
   gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements);
   gl.drawArrays(gl.TRIANGLES, 142, 24);
   
   modelMatrix.translate(0,-2,0);  
   //modelMatrix.scale(0.05,0.05,0.05);
   //modelMatrix.rotate(180, 0, 0, 1);  
   modelMatrix.rotate(currentAngle, 0, 1, 0); 
   gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements);
   gl.drawArrays(gl.TRIANGLES, 142, 24);

//第二个
   modelMatrix = popMatrix();
   pushMatrix(modelMatrix);

   modelMatrix.translate(Math.cos(Math.PI/3)*0.9,-0.05,Math.sin(Math.PI/3)*0.9);  
   modelMatrix.scale(0.05,0.05,0.05);
   modelMatrix.rotate(Zangle, 0, 0, 1);  
   modelMatrix.rotate(currentAngle*25, 0, 1, 0); 
   gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements);
   gl.drawArrays(gl.TRIANGLES, 142, 24);

   modelMatrix.translate(0,-2,0);  
   //modelMatrix.scale(0.05,0.05,0.05);
   //modelMatrix.rotate(180, 0, 0, 1);  
   modelMatrix.rotate(currentAngle*20, 0, 1, 0); 
   gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements);
   gl.drawArrays(gl.TRIANGLES, 142, 24);

   modelMatrix.translate(0,-2,0);  
   //modelMatrix.scale(0.05,0.05,0.05);
   //modelMatrix.rotate(180, 0, 0, 1);  
   modelMatrix.rotate(currentAngle*15, 0, 1, 0); 
   gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements);
   gl.drawArrays(gl.TRIANGLES, 142, 24);

   modelMatrix.translate(0,-2,0);  
   //modelMatrix.scale(0.05,0.05,0.05);
   //modelMatrix.rotate(180, 0, 0, 1);  
   modelMatrix.rotate(currentAngle*10, 0, 1, 0); 
   gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements);
   gl.drawArrays(gl.TRIANGLES, 142, 24);

   modelMatrix.translate(0,-2,0);  
   //modelMatrix.scale(0.05,0.05,0.05);
   //modelMatrix.rotate(180, 0, 0, 1);  
   modelMatrix.rotate(currentAngle*5, 0, 1, 0); 
   gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements);
   gl.drawArrays(gl.TRIANGLES, 142, 24);

   modelMatrix.translate(0,-2,0);  
   //modelMatrix.scale(0.05,0.05,0.05);
   //modelMatrix.rotate(180, 0, 0, 1);  
   modelMatrix.rotate(currentAngle, 0, 1, 0); 
   gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements);
   gl.drawArrays(gl.TRIANGLES, 142, 24);
   
   modelMatrix.translate(0,-2,0);  
   //modelMatrix.scale(0.05,0.05,0.05);
   //modelMatrix.rotate(180, 0, 0, 1);  
   modelMatrix.rotate(currentAngle, 0, 1, 0); 
   gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements);
   gl.drawArrays(gl.TRIANGLES, 142, 24);

// 第三个
   modelMatrix = popMatrix();
   pushMatrix(modelMatrix);

   modelMatrix.translate(Math.cos(Math.PI/6)*0.9,-0.05,Math.sin(Math.PI/6)*0.9);  
   modelMatrix.scale(0.05,0.05,0.05);
   modelMatrix.rotate(Zangle, 0, 0, 1);  
   modelMatrix.rotate(currentAngle*25, 0, 1, 0); 
   gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements);
   gl.drawArrays(gl.TRIANGLES, 142, 24);

   modelMatrix.translate(0,-2,0);  
   //modelMatrix.scale(0.05,0.05,0.05);
   //modelMatrix.rotate(180, 0, 0, 1);  
   modelMatrix.rotate(currentAngle*20, 0, 1, 0); 
   gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements);
   gl.drawArrays(gl.TRIANGLES, 142, 24);

   modelMatrix.translate(0,-2,0);  
   //modelMatrix.scale(0.05,0.05,0.05);
   //modelMatrix.rotate(180, 0, 0, 1);  
   modelMatrix.rotate(currentAngle*15, 0, 1, 0); 
   gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements);
   gl.drawArrays(gl.TRIANGLES, 142, 24);

   modelMatrix.translate(0,-2,0);  
   //modelMatrix.scale(0.05,0.05,0.05);
   //modelMatrix.rotate(180, 0, 0, 1);  
   modelMatrix.rotate(currentAngle*10, 0, 1, 0); 
   gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements);
   gl.drawArrays(gl.TRIANGLES, 142, 24);

   modelMatrix.translate(0,-2,0);  
   //modelMatrix.scale(0.05,0.05,0.05);
   //modelMatrix.rotate(180, 0, 0, 1);  
   modelMatrix.rotate(currentAngle*5, 0, 1, 0); 
   gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements);
   gl.drawArrays(gl.TRIANGLES, 142, 24);

   modelMatrix.translate(0,-2,0);  
   //modelMatrix.scale(0.05,0.05,0.05);
   //modelMatrix.rotate(180, 0, 0, 1);  
   modelMatrix.rotate(currentAngle, 0, 1, 0); 
   gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements);
   gl.drawArrays(gl.TRIANGLES, 142, 24);
   
   modelMatrix.translate(0,-2,0);  
   //modelMatrix.scale(0.05,0.05,0.05);
   //modelMatrix.rotate(180, 0, 0, 1);  
   modelMatrix.rotate(currentAngle, 0, 1, 0); 
   gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements);
   gl.drawArrays(gl.TRIANGLES, 142, 24);

//第四个
   modelMatrix = popMatrix();
   pushMatrix(modelMatrix);

   modelMatrix.translate(Math.cos(Math.PI/2)*0.9,-0.05,Math.sin(Math.PI/2)*0.9);  
   modelMatrix.scale(0.05,0.05,0.05);
   modelMatrix.rotate(Zangle, 0, 0, 1);  
   modelMatrix.rotate(currentAngle*25, 0, 1, 0); 
   gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements);
   gl.drawArrays(gl.TRIANGLES, 142, 24);

   modelMatrix.translate(0,-2,0);  
   //modelMatrix.scale(0.05,0.05,0.05);
   //modelMatrix.rotate(180, 0, 0, 1);  
   modelMatrix.rotate(currentAngle*20, 0, 1, 0); 
   gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements);
   gl.drawArrays(gl.TRIANGLES, 142, 24);

   modelMatrix.translate(0,-2,0);  
   //modelMatrix.scale(0.05,0.05,0.05);
   //modelMatrix.rotate(180, 0, 0, 1);  
   modelMatrix.rotate(currentAngle*15, 0, 1, 0); 
   gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements);
   gl.drawArrays(gl.TRIANGLES, 142, 24);

   modelMatrix.translate(0,-2,0);  
   //modelMatrix.scale(0.05,0.05,0.05);
   //modelMatrix.rotate(180, 0, 0, 1);  
   modelMatrix.rotate(currentAngle*10, 0, 1, 0); 
   gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements);
   gl.drawArrays(gl.TRIANGLES, 142, 24);

   modelMatrix.translate(0,-2,0);  
   //modelMatrix.scale(0.05,0.05,0.05);
   //modelMatrix.rotate(180, 0, 0, 1);  
   modelMatrix.rotate(currentAngle*5, 0, 1, 0); 
   gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements);
   gl.drawArrays(gl.TRIANGLES, 142, 24);

   modelMatrix.translate(0,-2,0);  
   //modelMatrix.scale(0.05,0.05,0.05);
   //modelMatrix.rotate(180, 0, 0, 1);  
   modelMatrix.rotate(currentAngle, 0, 1, 0); 
   gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements);
   gl.drawArrays(gl.TRIANGLES, 142, 24);
   
   modelMatrix.translate(0,-2,0);  
   //modelMatrix.scale(0.05,0.05,0.05);
   //modelMatrix.rotate(180, 0, 0, 1);  
   modelMatrix.rotate(currentAngle, 0, 1, 0); 
   gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements);
   gl.drawArrays(gl.TRIANGLES, 142, 24);

// five
   modelMatrix = popMatrix();
   pushMatrix(modelMatrix);

   modelMatrix.translate(Math.cos(2*Math.PI/3)*0.9,-0.05,Math.sin(2*Math.PI/3)*0.9);  
   modelMatrix.scale(0.05,0.05,0.05);
   modelMatrix.rotate(Zangle, 0, 0, 1);  
   modelMatrix.rotate(currentAngle*25, 0, 1, 0); 
   gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements);
   gl.drawArrays(gl.TRIANGLES, 142, 24);

   modelMatrix.translate(0,-2,0);  
   //modelMatrix.scale(0.05,0.05,0.05);
   //modelMatrix.rotate(180, 0, 0, 1);  
   modelMatrix.rotate(currentAngle*20, 0, 1, 0); 
   gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements);
   gl.drawArrays(gl.TRIANGLES, 142, 24);

   modelMatrix.translate(0,-2,0);  
   //modelMatrix.scale(0.05,0.05,0.05);
   //modelMatrix.rotate(180, 0, 0, 1);  
   modelMatrix.rotate(currentAngle*15, 0, 1, 0); 
   gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements);
   gl.drawArrays(gl.TRIANGLES, 142, 24);

   modelMatrix.translate(0,-2,0);  
   //modelMatrix.scale(0.05,0.05,0.05);
   //modelMatrix.rotate(180, 0, 0, 1);  
   modelMatrix.rotate(currentAngle*10, 0, 1, 0); 
   gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements);
   gl.drawArrays(gl.TRIANGLES, 142, 24);

   modelMatrix.translate(0,-2,0);  
   //modelMatrix.scale(0.05,0.05,0.05);
   //modelMatrix.rotate(180, 0, 0, 1);  
   modelMatrix.rotate(currentAngle*5, 0, 1, 0); 
   gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements);
   gl.drawArrays(gl.TRIANGLES, 142, 24);

   modelMatrix.translate(0,-2,0);  
   //modelMatrix.scale(0.05,0.05,0.05);
   //modelMatrix.rotate(180, 0, 0, 1);  
   modelMatrix.rotate(currentAngle, 0, 1, 0); 
   gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements);
   gl.drawArrays(gl.TRIANGLES, 142, 24);
   
   modelMatrix.translate(0,-2,0);  
   //modelMatrix.scale(0.05,0.05,0.05);
   //modelMatrix.rotate(180, 0, 0, 1);  
   modelMatrix.rotate(currentAngle, 0, 1, 0); 
   gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements);
   gl.drawArrays(gl.TRIANGLES, 142, 24);

   // six
   modelMatrix = popMatrix();
   pushMatrix(modelMatrix);

   modelMatrix.translate(Math.cos(5*Math.PI/6)*0.9,-0.05,Math.sin(5*Math.PI/6)*0.9);  
   modelMatrix.scale(0.05,0.05,0.05);
   modelMatrix.rotate(Zangle, 0, 0, 1);  
   modelMatrix.rotate(currentAngle*25, 0, 1, 0); 
   gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements);
   gl.drawArrays(gl.TRIANGLES, 142, 24);

   modelMatrix.translate(0,-2,0);  
   //modelMatrix.scale(0.05,0.05,0.05);
   //modelMatrix.rotate(180, 0, 0, 1);  
   modelMatrix.rotate(currentAngle*20, 0, 1, 0); 
   gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements);
   gl.drawArrays(gl.TRIANGLES, 142, 24);

   modelMatrix.translate(0,-2,0);  
   //modelMatrix.scale(0.05,0.05,0.05);
   //modelMatrix.rotate(180, 0, 0, 1);  
   modelMatrix.rotate(currentAngle*15, 0, 1, 0); 
   gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements);
   gl.drawArrays(gl.TRIANGLES, 142, 24);

   modelMatrix.translate(0,-2,0);  
   //modelMatrix.scale(0.05,0.05,0.05);
   //modelMatrix.rotate(180, 0, 0, 1);  
   modelMatrix.rotate(currentAngle*10, 0, 1, 0); 
   gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements);
   gl.drawArrays(gl.TRIANGLES, 142, 24);

   modelMatrix.translate(0,-2,0);  
   //modelMatrix.scale(0.05,0.05,0.05);
   //modelMatrix.rotate(180, 0, 0, 1);  
   modelMatrix.rotate(currentAngle*5, 0, 1, 0); 
   gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements);
   gl.drawArrays(gl.TRIANGLES, 142, 24);

   modelMatrix.translate(0,-2,0);  
   //modelMatrix.scale(0.05,0.05,0.05);
   //modelMatrix.rotate(180, 0, 0, 1);  
   modelMatrix.rotate(currentAngle, 0, 1, 0); 
   gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements);
   gl.drawArrays(gl.TRIANGLES, 142, 24);
   
   modelMatrix.translate(0,-2,0);  
   //modelMatrix.scale(0.05,0.05,0.05);
   //modelMatrix.rotate(180, 0, 0, 1);  
   modelMatrix.rotate(currentAngle, 0, 1, 0); 
   gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements);
   gl.drawArrays(gl.TRIANGLES, 142, 24);

// Seven

   modelMatrix = popMatrix();
   pushMatrix(modelMatrix);

   modelMatrix.translate(Math.cos(Math.PI)*0.9,-0.05,Math.sin(Math.PI)*0.9);  
   modelMatrix.scale(0.05,0.05,0.05);
   modelMatrix.rotate(Zangle, 0, 0, 1);  
   modelMatrix.rotate(currentAngle*25, 0, 1, 0); 
   gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements);
   gl.drawArrays(gl.TRIANGLES, 142, 24);

   modelMatrix.translate(0,-2,0);  
   //modelMatrix.scale(0.05,0.05,0.05);
   //modelMatrix.rotate(180, 0, 0, 1);  
   modelMatrix.rotate(currentAngle*20, 0, 1, 0); 
   gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements);
   gl.drawArrays(gl.TRIANGLES, 142, 24);

   modelMatrix.translate(0,-2,0);  
   //modelMatrix.scale(0.05,0.05,0.05);
   //modelMatrix.rotate(180, 0, 0, 1);  
   modelMatrix.rotate(currentAngle*15, 0, 1, 0); 
   gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements);
   gl.drawArrays(gl.TRIANGLES, 142, 24);

   modelMatrix.translate(0,-2,0);  
   //modelMatrix.scale(0.05,0.05,0.05);
   //modelMatrix.rotate(180, 0, 0, 1);  
   modelMatrix.rotate(currentAngle*10, 0, 1, 0); 
   gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements);
   gl.drawArrays(gl.TRIANGLES, 142, 24);

   modelMatrix.translate(0,-2,0);  
   //modelMatrix.scale(0.05,0.05,0.05);
   //modelMatrix.rotate(180, 0, 0, 1);  
   modelMatrix.rotate(currentAngle*5, 0, 1, 0); 
   gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements);
   gl.drawArrays(gl.TRIANGLES, 142, 24);

   modelMatrix.translate(0,-2,0);  
   //modelMatrix.scale(0.05,0.05,0.05);
   //modelMatrix.rotate(180, 0, 0, 1);  
   modelMatrix.rotate(currentAngle, 0, 1, 0); 
   gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements);
   gl.drawArrays(gl.TRIANGLES, 142, 24);
   
   modelMatrix.translate(0,-2,0);  
   //modelMatrix.scale(0.05,0.05,0.05);
   //modelMatrix.rotate(180, 0, 0, 1);  
   modelMatrix.rotate(currentAngle, 0, 1, 0); 
   gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements);
   gl.drawArrays(gl.TRIANGLES, 142, 24);

   // eight
   modelMatrix = popMatrix();
   pushMatrix(modelMatrix);

   modelMatrix.translate(Math.cos(7*Math.PI/6)*0.9,-0.05,Math.sin(7*Math.PI/6)*0.9);  
   modelMatrix.scale(0.05,0.05,0.05);
   modelMatrix.rotate(Zangle, 0, 0, 1);  
   modelMatrix.rotate(currentAngle*25, 0, 1, 0); 
   gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements);
   gl.drawArrays(gl.TRIANGLES, 142, 24);

   modelMatrix.translate(0,-2,0);  
   //modelMatrix.scale(0.05,0.05,0.05);
   //modelMatrix.rotate(180, 0, 0, 1);  
   modelMatrix.rotate(currentAngle*20, 0, 1, 0); 
   gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements);
   gl.drawArrays(gl.TRIANGLES, 142, 24);

   modelMatrix.translate(0,-2,0);  
   //modelMatrix.scale(0.05,0.05,0.05);
   //modelMatrix.rotate(180, 0, 0, 1);  
   modelMatrix.rotate(currentAngle*15, 0, 1, 0); 
   gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements);
   gl.drawArrays(gl.TRIANGLES, 142, 24);

   modelMatrix.translate(0,-2,0);  
   //modelMatrix.scale(0.05,0.05,0.05);
   //modelMatrix.rotate(180, 0, 0, 1);  
   modelMatrix.rotate(currentAngle*10, 0, 1, 0); 
   gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements);
   gl.drawArrays(gl.TRIANGLES, 142, 24);

   modelMatrix.translate(0,-2,0);  
   //modelMatrix.scale(0.05,0.05,0.05);
   //modelMatrix.rotate(180, 0, 0, 1);  
   modelMatrix.rotate(currentAngle*5, 0, 1, 0); 
   gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements);
   gl.drawArrays(gl.TRIANGLES, 142, 24);

   modelMatrix.translate(0,-2,0);  
   //modelMatrix.scale(0.05,0.05,0.05);
   //modelMatrix.rotate(180, 0, 0, 1);  
   modelMatrix.rotate(currentAngle, 0, 1, 0); 
   gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements);
   gl.drawArrays(gl.TRIANGLES, 142, 24);
   
   modelMatrix.translate(0,-2,0);  
   //modelMatrix.scale(0.05,0.05,0.05);
   //modelMatrix.rotate(180, 0, 0, 1);  
   modelMatrix.rotate(currentAngle, 0, 1, 0); 
   gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements);
   gl.drawArrays(gl.TRIANGLES, 142, 24);

   //nine
   modelMatrix = popMatrix();
   pushMatrix(modelMatrix);

   modelMatrix.translate(Math.cos(4*Math.PI/3)*0.9,-0.05,Math.sin(4*Math.PI/3)*0.9);  
   modelMatrix.scale(0.05,0.05,0.05);
   modelMatrix.rotate(Zangle, 0, 0, 1);  
   modelMatrix.rotate(currentAngle*25, 0, 1, 0); 
   gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements);
   gl.drawArrays(gl.TRIANGLES, 142, 24);

   modelMatrix.translate(0,-2,0);  
   //modelMatrix.scale(0.05,0.05,0.05);
   //modelMatrix.rotate(180, 0, 0, 1);  
   modelMatrix.rotate(currentAngle*20, 0, 1, 0); 
   gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements);
   gl.drawArrays(gl.TRIANGLES, 142, 24);

   modelMatrix.translate(0,-2,0);  
   //modelMatrix.scale(0.05,0.05,0.05);
   //modelMatrix.rotate(180, 0, 0, 1);  
   modelMatrix.rotate(currentAngle*15, 0, 1, 0); 
   gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements);
   gl.drawArrays(gl.TRIANGLES, 142, 24);

   modelMatrix.translate(0,-2,0);  
   //modelMatrix.scale(0.05,0.05,0.05);
   //modelMatrix.rotate(180, 0, 0, 1);  
   modelMatrix.rotate(currentAngle*10, 0, 1, 0); 
   gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements);
   gl.drawArrays(gl.TRIANGLES, 142, 24);

   modelMatrix.translate(0,-2,0);  
   //modelMatrix.scale(0.05,0.05,0.05);
   //modelMatrix.rotate(180, 0, 0, 1);  
   modelMatrix.rotate(currentAngle*5, 0, 1, 0); 
   gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements);
   gl.drawArrays(gl.TRIANGLES, 142, 24);

   modelMatrix.translate(0,-2,0);  
   //modelMatrix.scale(0.05,0.05,0.05);
   //modelMatrix.rotate(180, 0, 0, 1);  
   modelMatrix.rotate(currentAngle, 0, 1, 0); 
   gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements);
   gl.drawArrays(gl.TRIANGLES, 142, 24);
   
   modelMatrix.translate(0,-2,0);  
   //modelMatrix.scale(0.05,0.05,0.05);
   //modelMatrix.rotate(180, 0, 0, 1);  
   modelMatrix.rotate(currentAngle, 0, 1, 0); 
   gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements);
   gl.drawArrays(gl.TRIANGLES, 142, 24);

   // ten
   modelMatrix = popMatrix();
   pushMatrix(modelMatrix);

   modelMatrix.translate(Math.cos(3*Math.PI/2)*0.9,-0.05,Math.sin(3*Math.PI/2)*0.9);  
   modelMatrix.scale(0.05,0.05,0.05);
   modelMatrix.rotate(Zangle, 0, 0, 1);  
   modelMatrix.rotate(currentAngle*25, 0, 1, 0); 
   gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements);
   gl.drawArrays(gl.TRIANGLES, 142, 24);

   modelMatrix.translate(0,-2,0);  
   //modelMatrix.scale(0.05,0.05,0.05);
   //modelMatrix.rotate(180, 0, 0, 1);  
   modelMatrix.rotate(currentAngle*20, 0, 1, 0); 
   gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements);
   gl.drawArrays(gl.TRIANGLES, 142, 24);

   modelMatrix.translate(0,-2,0);  
   //modelMatrix.scale(0.05,0.05,0.05);
   //modelMatrix.rotate(180, 0, 0, 1);  
   modelMatrix.rotate(currentAngle*15, 0, 1, 0); 
   gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements);
   gl.drawArrays(gl.TRIANGLES, 142, 24);

   modelMatrix.translate(0,-2,0);  
   //modelMatrix.scale(0.05,0.05,0.05);
   //modelMatrix.rotate(180, 0, 0, 1);  
   modelMatrix.rotate(currentAngle*10, 0, 1, 0); 
   gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements);
   gl.drawArrays(gl.TRIANGLES, 142, 24);

   modelMatrix.translate(0,-2,0);  
   //modelMatrix.scale(0.05,0.05,0.05);
   //modelMatrix.rotate(180, 0, 0, 1);  
   modelMatrix.rotate(currentAngle*5, 0, 1, 0); 
   gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements);
   gl.drawArrays(gl.TRIANGLES, 142, 24);

   modelMatrix.translate(0,-2,0);  
   //modelMatrix.scale(0.05,0.05,0.05);
   //modelMatrix.rotate(180, 0, 0, 1);  
   modelMatrix.rotate(currentAngle, 0, 1, 0); 
   gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements);
   gl.drawArrays(gl.TRIANGLES, 142, 24);
   
   modelMatrix.translate(0,-2,0);  
   //modelMatrix.scale(0.05,0.05,0.05);
   //modelMatrix.rotate(180, 0, 0, 1);  
   modelMatrix.rotate(currentAngle, 0, 1, 0); 
   gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements);
   gl.drawArrays(gl.TRIANGLES, 142, 24);

   // eleven

   modelMatrix = popMatrix();
   pushMatrix(modelMatrix);

   modelMatrix.translate(Math.cos(5*Math.PI/3)*0.9,-0.05,Math.sin(5*Math.PI/3)*0.9);  
   modelMatrix.scale(0.05,0.05,0.05);
   modelMatrix.rotate(Zangle, 0, 0, 1);  
   modelMatrix.rotate(currentAngle*25, 0, 1, 0); 
   gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements);
   gl.drawArrays(gl.TRIANGLES, 142, 24);

   modelMatrix.translate(0,-2,0);  
   //modelMatrix.scale(0.05,0.05,0.05);
   //modelMatrix.rotate(180, 0, 0, 1);  
   modelMatrix.rotate(currentAngle*20, 0, 1, 0); 
   gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements);
   gl.drawArrays(gl.TRIANGLES, 142, 24);

   modelMatrix.translate(0,-2,0);  
   //modelMatrix.scale(0.05,0.05,0.05);
   //modelMatrix.rotate(180, 0, 0, 1);  
   modelMatrix.rotate(currentAngle*15, 0, 1, 0); 
   gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements);
   gl.drawArrays(gl.TRIANGLES, 142, 24);

   modelMatrix.translate(0,-2,0);  
   //modelMatrix.scale(0.05,0.05,0.05);
   //modelMatrix.rotate(180, 0, 0, 1);  
   modelMatrix.rotate(currentAngle*10, 0, 1, 0); 
   gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements);
   gl.drawArrays(gl.TRIANGLES, 142, 24);

   modelMatrix.translate(0,-2,0);  
   //modelMatrix.scale(0.05,0.05,0.05);
   //modelMatrix.rotate(180, 0, 0, 1);  
   modelMatrix.rotate(currentAngle*5, 0, 1, 0); 
   gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements);
   gl.drawArrays(gl.TRIANGLES, 142, 24);

   modelMatrix.translate(0,-2,0);  
   //modelMatrix.scale(0.05,0.05,0.05);
   //modelMatrix.rotate(180, 0, 0, 1);  
   modelMatrix.rotate(currentAngle, 0, 1, 0); 
   gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements);
   gl.drawArrays(gl.TRIANGLES, 142, 24);
   
   modelMatrix.translate(0,-2,0);  
   //modelMatrix.scale(0.05,0.05,0.05);
   //modelMatrix.rotate(180, 0, 0, 1);  
   modelMatrix.rotate(currentAngle, 0, 1, 0); 
   gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements);
   gl.drawArrays(gl.TRIANGLES, 142, 24);


   //12
   modelMatrix = popMatrix();
   pushMatrix(modelMatrix);

   modelMatrix.translate(Math.cos(11*Math.PI/6)*0.9,-0.05,Math.sin(11*Math.PI/6)*0.9);  
   modelMatrix.scale(0.05,0.05,0.05);
   modelMatrix.rotate(Zangle, 0, 0, 1);  
   modelMatrix.rotate(currentAngle*25, 0, 1, 0); 
   gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements);
   gl.drawArrays(gl.TRIANGLES, 142, 24);

   modelMatrix.translate(0,-2,0);  
   //modelMatrix.scale(0.05,0.05,0.05);
   //modelMatrix.rotate(180, 0, 0, 1);  
   modelMatrix.rotate(currentAngle*20, 0, 1, 0); 
   gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements);
   gl.drawArrays(gl.TRIANGLES, 142, 24);

   modelMatrix.translate(0,-2,0);  
   //modelMatrix.scale(0.05,0.05,0.05);
   //modelMatrix.rotate(180, 0, 0, 1);  
   modelMatrix.rotate(currentAngle*15, 0, 1, 0); 
   gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements);
   gl.drawArrays(gl.TRIANGLES, 142, 24);

   modelMatrix.translate(0,-2,0);  
   //modelMatrix.scale(0.05,0.05,0.05);
   //modelMatrix.rotate(180, 0, 0, 1);  
   modelMatrix.rotate(currentAngle*10, 0, 1, 0); 
   gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements);
   gl.drawArrays(gl.TRIANGLES, 142, 24);

   modelMatrix.translate(0,-2,0);  
   //modelMatrix.scale(0.05,0.05,0.05);
   //modelMatrix.rotate(180, 0, 0, 1);  
   modelMatrix.rotate(currentAngle*5, 0, 1, 0); 
   gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements);
   gl.drawArrays(gl.TRIANGLES, 142, 24);

   modelMatrix.translate(0,-2,0);  
   //modelMatrix.scale(0.05,0.05,0.05);
   //modelMatrix.rotate(180, 0, 0, 1);  
   modelMatrix.rotate(currentAngle, 0, 1, 0); 
   gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements);
   gl.drawArrays(gl.TRIANGLES, 142, 24);
   
   modelMatrix.translate(0,-2,0);  
   //modelMatrix.scale(0.05,0.05,0.05);
   //modelMatrix.rotate(180, 0, 0, 1);  
   modelMatrix.rotate(currentAngle, 0, 1, 0); 
   gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements);
   gl.drawArrays(gl.TRIANGLES, 142, 24);

   //拐杖

   modelMatrix.setTranslate(-0.5,-0.4,0);
   modelMatrix.scale(0.015,0.4,0.015);
   modelMatrix.rotate(currentAngle, 0, 1, 0); 
   gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements);
   gl.drawArrays(gl.TRIANGLES, 0, 36);
   pushMatrix(modelMatrix);

   modelMatrix.translate(0, 1.4, 0);
   modelMatrix.scale(2,0.5,2);
   gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements);
   gl.drawArrays(gl.TRIANGLES, 142, 24);

   modelMatrix = popMatrix();
   pushMatrix(modelMatrix);

   modelMatrix.translate(-3, 1.4, 0);
   modelMatrix.scale(2*xMdragTot+2,0.5*yMdragTot+0,3,2*xMdragTot+2);
    
   gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements);
   gl.drawArrays(gl.TRIANGLES, 142, 24);


   modelMatrix = popMatrix();
   pushMatrix(modelMatrix);

   modelMatrix.translate(3, 1.4, 0);
   modelMatrix.scale(2*xMdragTot+2,0.5*yMdragTot+0,3,2*xMdragTot+2);
    
   gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements);
   gl.drawArrays(gl.TRIANGLES, 142, 24);

   modelMatrix = popMatrix();
   pushMatrix(modelMatrix);

   modelMatrix.translate(0, 1.4, 3);
   modelMatrix.scale(2*xMdragTot+2,0.5*yMdragTot+0,3,2*xMdragTot+2);
    
   gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements);
   gl.drawArrays(gl.TRIANGLES, 142, 24);

   modelMatrix = popMatrix();
   pushMatrix(modelMatrix);

   modelMatrix.translate(0, 1.4, -3);
   modelMatrix.scale(2*xMdragTot+2,0.5*yMdragTot+0,3,2*xMdragTot+2);
    
   gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements);
   gl.drawArrays(gl.TRIANGLES, 142, 24);

   modelMatrix = popMatrix();
   pushMatrix(modelMatrix);

   modelMatrix.translate(-3, 1.4, -3);
   modelMatrix.scale(2*xMdragTot+2,0.5*yMdragTot+0,3,2*xMdragTot+2);
    
   gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements);
   gl.drawArrays(gl.TRIANGLES, 142, 24);

   modelMatrix = popMatrix();
   pushMatrix(modelMatrix);

   modelMatrix.translate(3, 1.4, 3);
   modelMatrix.scale(2*xMdragTot+2,0.5*yMdragTot+0,3,2*xMdragTot+2);
    
   gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements);
   gl.drawArrays(gl.TRIANGLES, 142, 24);

   modelMatrix = popMatrix();
   pushMatrix(modelMatrix);

   modelMatrix.translate(-3, 1.4, 3);
   modelMatrix.scale(2*xMdragTot+2,0.5*yMdragTot+0,3,2*xMdragTot+2);
    
   gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements);
   gl.drawArrays(gl.TRIANGLES, 142, 24);

   modelMatrix = popMatrix();
   pushMatrix(modelMatrix);

   modelMatrix.translate(3, 1.4, -3);
   modelMatrix.scale(2*xMdragTot+2,0.5*yMdragTot+0,3,2*xMdragTot+2);
    
   gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements);
   gl.drawArrays(gl.TRIANGLES, 142, 24);
}

// Last time that this function was called:  (used for animation timing)
var g_last = Date.now();

function animate(angle) {
//==============================================================================
  // Calculate the elapsed time
  var now = Date.now();
  var elapsed = now - g_last;
  g_last = now;
  var newAngle = angle + (ANGLE_STEP * elapsed) / 1000.0;
  return newAngle %= 360;
}



function back2og(){
  Xstep=0;
  Ystep=0;
}

function moreCCW() {
//==============================================================================

  ANGLE_STEP += 10; 
}

function lessCCW() {
//==============================================================================
  ANGLE_STEP -= 10; 
}


function clearDrag() {
// Called when user presses 'Clear' button in our webpage
  xMdragTot = 0.0;
  yMdragTot = 0.0;
}


function runStop() {
// Called when user presses the 'Run/Stop' button
  if(ANGLE_STEP*ANGLE_STEP > 1) {
    myTmp = ANGLE_STEP;
    ANGLE_STEP = 0;
  }
  else {
    ANGLE_STEP = myTmp;
  }
}


function myMouseDown(ev, gl, canvas) {
//==============================================================================
// Called when user PRESSES down any mouse button;
//                  (Which button?    console.log('ev.button='+ev.button);   )
//    ev.clientX, ev.clientY == mouse pointer location, but measured in webpage 
//    pixels: left-handed coords; UPPER left origin; Y increases DOWNWARDS (!)  

// Create right-handed 'pixel' coords with origin at WebGL canvas LOWER left;
  var rect = ev.target.getBoundingClientRect(); // get canvas corners in pixels
  var xp = ev.clientX - rect.left;                  // x==0 at canvas left edge
  var yp = canvas.height - (ev.clientY - rect.top); // y==0 at canvas bottom edge
//  console.log('myMouseDown(pixel coords): xp,yp=\t',xp,',\t',yp);
  
  // Convert to Canonical View Volume (CVV) coordinates too:
  var x = (xp - canvas.width/2)  /    // move origin to center of canvas and
               (canvas.width/2);      // normalize canvas to -1 <= x < +1,
  var y = (yp - canvas.height/2) /    //                     -1 <= y < +1.
               (canvas.height/2);
//  console.log('myMouseDown(CVV coords  ):  x, y=\t',x,',\t',y);
  
  isDrag = true;                      // set our mouse-dragging flag
  xMclik = x;                         // record where mouse-dragging began
  yMclik = y;
};
function myMouseMove(ev, gl, canvas) {
//==============================================================================
// Called when user MOVES the mouse with a button already pressed down.
//                  (Which button?   console.log('ev.button='+ev.button);    )
//    ev.clientX, ev.clientY == mouse pointer location, but measured in webpage 
//    pixels: left-handed coords; UPPER left origin; Y increases DOWNWARDS (!)  

  if(isDrag==false) return;       // IGNORE all mouse-moves except 'dragging'

  // Create right-handed 'pixel' coords with origin at WebGL canvas LOWER left;
  var rect = ev.target.getBoundingClientRect(); // get canvas corners in pixels
  var xp = ev.clientX - rect.left;                  // x==0 at canvas left edge
  var yp = canvas.height - (ev.clientY - rect.top); // y==0 at canvas bottom edge
//  console.log('myMouseMove(pixel coords): xp,yp=\t',xp,',\t',yp);
  
  // Convert to Canonical View Volume (CVV) coordinates too:
  var x = (xp - canvas.width/2)  /    // move origin to center of canvas and
               (canvas.width/2);      // normalize canvas to -1 <= x < +1,
  var y = (yp - canvas.height/2) /    //                     -1 <= y < +1.
               (canvas.height/2);
//  console.log('myMouseMove(CVV coords  ):  x, y=\t',x,',\t',y);

  // find how far we dragged the mouse:
  xMdragTot += (x - xMclik);          // Accumulate change-in-mouse-position,&
  yMdragTot += (y - yMclik);
  xMclik = x;                         // Make next drag-measurement from here.
  yMclik = y;
};

function myMouseUp(ev, gl, canvas) {
//==============================================================================
// Called when user RELEASES mouse button pressed previously.
//                  (Which button?   console.log('ev.button='+ev.button);    )
//    ev.clientX, ev.clientY == mouse pointer location, but measured in webpage 
//    pixels: left-handed coords; UPPER left origin; Y increases DOWNWARDS (!)  

// Create right-handed 'pixel' coords with origin at WebGL canvas LOWER left;
  var rect = ev.target.getBoundingClientRect(); // get canvas corners in pixels
  var xp = ev.clientX - rect.left;                  // x==0 at canvas left edge
  var yp = canvas.height - (ev.clientY - rect.top); // y==0 at canvas bottom edge
//  console.log('myMouseUp  (pixel coords): xp,yp=\t',xp,',\t',yp);
  
  // Convert to Canonical View Volume (CVV) coordinates too:
  var x = (xp - canvas.width/2)  /    // move origin to center of canvas and
               (canvas.width/2);      // normalize canvas to -1 <= x < +1,
  var y = (yp - canvas.height/2) /    //                     -1 <= y < +1.
               (canvas.height/2);
  console.log('myMouseUp  (CVV coords  ):  x, y=\t',x,',\t',y);
  
  isDrag = false;                     // CLEAR our mouse-dragging flag, and
  // accumulate any final bit of mouse-dragging we did:
  xMdragTot += (x - xMclik);
  yMdragTot += (y - yMclik);
  console.log('myMouseUp: xMdragTot,yMdragTot =',xMdragTot,',\t',yMdragTot);
};

function myKeyDown(ev) {

  Keypress=ev.keyCode;
//===============================================================================
  switch(ev.keyCode) {      // keycodes !=ASCII, but are very consistent for 
  //  nearly all non-alphanumeric keys for nearly all keyboards in all countries.
    case 37:    // left-arrow key
      // print in console:
      console.log(' left-arrow.');
      break;
    case 38:    // up-arrow key
      console.log('   up-arrow.');

      break;
    case 39:    // right-arrow key
      console.log('right-arrow.');

      break;
    case 40:    // down-arrow key
      console.log(' down-arrow.');

      break;
    default:
      console.log('myKeyDown()--keycode=', ev.keyCode, ', charCode=', ev.charCode);

      break;
  }
}

function myKeyUp(ev) {
//===============================================================================
// Called when user releases ANY key on the keyboard; captures scancodes well

  console.log('myKeyUp()--keyCode='+ev.keyCode+' released.');
}

function myKeyPress(ev) {
//===============================================================================
// Best for capturing alphanumeric keys and key-combinations such as 
// CTRL-C, alt-F, SHIFT-4, etc.
  console.log('myKeyPress():keyCode='+ev.keyCode  +', charCode=' +ev.charCode+
                        ', shift='    +ev.shiftKey + ', ctrl='    +ev.ctrlKey +
                        ', altKey='   +ev.altKey   +
                        ', metaKey(Command key or Windows key)='+ev.metaKey);
}
