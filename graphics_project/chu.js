//3456789_123456789_123456789_123456789_123456789_123456789_123456789_123456789_
//==============================================================================
//
// LookAtTrianglesWithKey_ViewVolume.js (c) 2012 matsuda
//
//  MODIFIED 2014.02.19 J. Tumblin to 
//		--demonstrate multiple viewports (see 'draw()' function at bottom of file)
//		--draw ground plane in the 3D scene:  makeGroundPlane()

// Vertex shader program
var VSHADER_SOURCE =
  'attribute vec4 a_Position;\n' +
  'attribute vec4 a_Color;\n' +
  'uniform mat4 u_ViewMatrix;\n' +
  'uniform mat4 u_ProjMatrix;\n' +
  'varying vec4 v_Color;\n' +
  'void main() {\n' +
  '  gl_Position = u_ProjMatrix * u_ViewMatrix * a_Position;\n' +
  '  v_Color = a_Color;\n' +
  '}\n';

// Fragment shader program
var FSHADER_SOURCE =
  '#ifdef GL_ES\n' +
  'precision mediump float;\n' +
  '#endif\n' +
  'varying vec4 v_Color;\n' +
  'void main() {\n' +
  '  gl_FragColor = v_Color;\n' +
  '}\n';
  
var floatsPerVertex = 6;	// # of Float32Array elements used for each vertex
													// (x,y,z)position + (r,g,b)color

var MOVE_STEP = 0.15;
var LOOK_STEP = 0.02;
var PHI_NOW = 0;
var THETA_NOW = 0;
var LAST_UPDATE = -1;
var currentAngle=0.0;
var ANGLE_STEP = 45.0;

function main() {
//==============================================================================
  // Retrieve <canvas> element
  var canvas = document.getElementById('webgl');
  canvas.width=window.innerWidth;
  canvas.height=window.innerHeight-100;

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

	// NEW!! Enable 3D depth-test when drawing: don't over-draw at any pixel 
	// unless the new Z value is closer to the eye than the old one..
//	gl.depthFunc(gl.LESS);			 // WebGL default setting:
	gl.enable(gl.DEPTH_TEST); 
	
  // Set the vertex coordinates and color (the blue triangle is in the front)
  var n = initVertexBuffers(gl);

  if (n < 0) {
    console.log('Failed to specify the vertex information');
    return;
  }

  // Specify the color for clearing <canvas>
  gl.clearColor(0.0, 0.0, 0.0, 1.0);

  // Get the graphics system storage locations of
  // the uniform variables u_ViewMatrix and u_ProjMatrix.
  var u_ViewMatrix = gl.getUniformLocation(gl.program, 'u_ViewMatrix');
  var u_ProjMatrix = gl.getUniformLocation(gl.program, 'u_ProjMatrix');
  if (!u_ViewMatrix || !u_ProjMatrix) { 
    console.log('Failed to get u_ViewMatrix or u_ProjMatrix');
    return;
  }

  // Create a JavaScript matrix to specify the view transformation
  var viewMatrix = new Matrix4();
  // Register the event handler to be called on key press
 document.onkeydown= function(ev){keydown(ev, gl, u_ViewMatrix, viewMatrix); };
	// (Note that I eliminated the 'n' argument (no longer needed)).
	
  // Create the matrix to specify the camera frustum, 
  // and pass it to the u_ProjMatrix uniform in the graphics system
  var projMatrix = new Matrix4();
  // REPLACE this orthographic camera matrix:
/*  projMatrix.setOrtho(-1.0, 1.0, 					// left,right;
  										-1.0, 1.0, 					// bottom, top;
  										0.0, 2000.0);				// near, far; (always >=0)
*/
	// with this perspective-camera matrix:
	// (SEE PerspectiveView.js, Chapter 7 of book)

  projMatrix.setPerspective(40, canvas.width/canvas.height, 1, 100);

  // YOU TRY IT: make an equivalent camera using matrix-cuon-mod.js
  // perspective-camera matrix made by 'frustum()' function..
  
	// Send this matrix to our Vertex and Fragment shaders through the
	// 'uniform' variable u_ProjMatrix:
  gl.uniformMatrix4fv(u_ProjMatrix, false, projMatrix.elements);

  var currentAngle = 0;
  var tick = function() {
    currentAngle = animate(currentAngle);
    canvas.width = innerWidth*0.75;    
    canvas.height = innerHeight*0.75;
    initVertexBuffers(gl);
    draw(gl, currentAngle, u_ViewMatrix, viewMatrix);   // Draw the triangles
    requestAnimationFrame(tick, canvas);   
                      // Request that the browser re-draw the webpage
  };
  tick();     
}

function makeGroundGrid() {
//==============================================================================
// Create a list of vertices that create a large grid of lines in the x,y plane
// centered at x=y=z=0.  Draw this shape using the GL_LINES primitive.

	var xcount = 100;			// # of lines to draw in x,y to make the grid.
	var ycount = 100;		
	var xymax	= 50.0;			// grid size; extends to cover +/-xymax in x and y.
 	var xColr = new Float32Array([1.0, 1.0, 0.3]);	// bright yellow
 	var yColr = new Float32Array([0.5, 1.0, 0.5]);	// bright green.
 	
	// Create an (global) array to hold this ground-plane's vertices:
	gndVerts = new Float32Array(floatsPerVertex*2*(xcount+ycount));
						// draw a grid made of xcount+ycount lines; 2 vertices per line.
						
	var xgap = xymax/(xcount-1);		// HALF-spacing between lines in x,y;
	var ygap = xymax/(ycount-1);		// (why half? because v==(0line number/2))
	
	// First, step thru x values as we make vertical lines of constant-x:
	for(v=0, j=0; v<2*xcount; v++, j+= floatsPerVertex) {
		if(v%2==0) {	// put even-numbered vertices at (xnow, -xymax, 0)
			gndVerts[j  ] = -xymax + (v  )*xgap;	// x
			gndVerts[j+1] = -xymax;								// y
			gndVerts[j+2] = 0.0;									// z
		}
		else {				// put odd-numbered vertices at (xnow, +xymax, 0).
			gndVerts[j  ] = -xymax + (v-1)*xgap;	// x
			gndVerts[j+1] = xymax;								// y
			gndVerts[j+2] = 0.0;									// z
		}
		gndVerts[j+3] = xColr[0];			// red
		gndVerts[j+4] = xColr[1];			// grn
		gndVerts[j+5] = xColr[2];			// blu
	}
	// Second, step thru y values as wqe make horizontal lines of constant-y:
	// (don't re-initialize j--we're adding more vertices to the array)
	for(v=0; v<2*ycount; v++, j+= floatsPerVertex) {
		if(v%2==0) {		// put even-numbered vertices at (-xymax, ynow, 0)
			gndVerts[j  ] = -xymax;								// x
			gndVerts[j+1] = -xymax + (v  )*ygap;	// y
			gndVerts[j+2] = 0.0;									// z
		}
		else {					// put odd-numbered vertices at (+xymax, ynow, 0).
			gndVerts[j  ] = xymax;								// x
			gndVerts[j+1] = -xymax + (v-1)*ygap;	// y
			gndVerts[j+2] = 0.0;									// z
		}
		gndVerts[j+3] = yColr[0];			// red
		gndVerts[j+4] = yColr[1];			// grn
		gndVerts[j+5] = yColr[2];			// blu
	}
}

function initVertexBuffers(gl) {
//==============================================================================
  var colorchange = currentAngle/20;
  var a = Math.sqrt(0.5);
  var a1=a/2;
	// make our 'forest' of triangular-shaped trees:
  forestVerts = new Float32Array([
    // 3 Vertex coordinates (x,y,z) and 3 colors (r,g,b)
    //(cube 36)
       -0.4,  0.0, -1.0, 1.0,   0.2, 0.1,
       -0.4,  0.0,  1.0, 1.0,   1.0, 0.2,
        0.4,  0.0,  1.0, 1.0,   0.7, 0.3,//bottom

       -0.4,  0.0, -1.0, 1.0,  0.2, 0.4,
        0.4,  0.0,  1.0, 1.0,   1.0, 0.5,
        0.4,  0.0, -1.0, 1.0,  0.2, 0.7,//bottom

       -0.4,  0.0,  1.0, 1.0,    0.0, 0.6,
        0.4,  0.0,  1.0, 1.0,     0.0, 0.8,
        0.4,  0.5,  1.0, 1.0,   0.0, 0.9,

       0.4,  0.5,  1.0, 1.0,   0.7, 1.0,
       -0.4,  0.0,  1.0, 1.0,    0.0, 0.9,
       -0.4,  0.5,  1.0, 1.0,   0.5, 0.8,//front

       0.4,  0.0,  1.0, 1.0,     0.5, 0.7,
       0.4,  0.0,  -1.0, 1.0,    0.5, 0.6,
       0.4,  0.5,  1.0, 1.0,  0.5, 0.5,

       0.4,  0.0,  -1.0, 1.0,    0.5, 0.4,
       0.4,  0.5,  1.0, 1.0,     0.5, 0.3,
       0.4,  0.5,  -1.0, 1.0,     0.5, 0.2,//right

       0.4,  0.5,  -1.0, 1.0,    1.0, 0.1,
       0.4,  0.0,  -1.0, 1.0, 1.0, 0.2,
      -0.4,  0.0,  -1.0, 1.0,    1.0, 0.3,

      -0.4,  0.0,  -1.0, 1.0,  1.0, 0.4,
       0.4,  0.5,  -1.0, 1.0,     1.0, 0.5,
      -0.4,  0.5,  -1.0, 1.0,   1.0, 0.6,//back

      -0.4,  0.5,  -1.0, 1.0,    1.0, 0.7,
       0.4,  0.5,  -1.0, 1.0,  1.0, 0.8,
       0.4,  0.5,  1.0, 1.0,   1.0, 1.0,

      -0.4,  0.5,  -1.0, 1.0,1.0, 1.0,
       0.4,  0.5,  1.0, 1.0,     1.0, 0.9,
      -0.4,  0.5,  1.0, 1.0,   1.0, 0.8,//top


       -0.4,  0.5,  -1.0, 1.0,    0.6, 0.7,
       -0.4,  0.5,  1.0, 1.0,     0.6, 0.6,
       -0.4,  0.0,  -1.0, 1.0,   0.6, 0.5,

       -0.4,  0.5,  1.0, 1.0,      0.6, 0.4,
       -0.4,  0.0,  -1.0, 1.0,   0.6, 0.3,
       -0.4,  0.0,  1.0, 1.0,     0.6, 0.2,//left
       //fengche(36+36)
       0.0, 0.0, 0.0,    1,0.1,colorchange,
        0.0, 0.0, 1.0,     1,0.1,colorchange,
        2.0, 0.0, 1.0,     1,0.1,colorchange,

        0.0, 0.0, 0.0,    colorchange,0.7,colorchange,
        2.0, 0.0, 1.0,     colorchange,0.6,colorchange,
        2.0, 0.0, 0.0,     colorchange,0.5,colorchange,//bottom

        2.0, 0.0, 1.0,     colorchange,0.4,colorchange,
        2.0, 0.0, 0.0,    colorchange,0.3,colorchange,
        1.0, 1.0, 1.0,     colorchange,0.2,colorchange,

        2.0, 0.0, 0.0,    colorchange,0.1,colorchange,
        1.0, 1.0, 1.0,    colorchange,0.1,colorchange,
        1.0, 1.0, 0.0,     colorchange,1.0,colorchange,//right

        1.0, 1.0, 1.0,     colorchange,0.9,colorchange,
        1.0, 1.0, 0.0,     colorchange,0.8,colorchange,
        0.0, 1.0, 1.0,     colorchange,0.7,colorchange,

        1.0, 1.0, 0.0,     colorchange,0.6,colorchange,
        0.0, 1.0, 1.0,     colorchange,0.5,colorchange,
        0.0, 1.0, 0.0,     colorchange,0.4,colorchange,//top

        0.0, 1.0, 1.0,     colorchange,0.5,colorchange,
        0.0, 1.0, 0.0,     colorchange,0.4,colorchange,
        0.0, 0.0, 0.0,     colorchange,0.3,colorchange,

        0.0, 1.0, 1.0,     colorchange,0.5,colorchange,
        0.0, 0.0, 0.0,     colorchange,0.3,colorchange,
        0.0, 0.0, 1.0,     colorchange,0.4,colorchange,//left

        0.0, 1.0, 1.0,    colorchange,0.1,1,
        0.0, 0.0, 1.0,     colorchange,0.1,1,
        2.0, 0.0, 1.0,     colorchange,0.1,1,

        2.0, 0.0, 1.0,     colorchange,0.1,1,
        0.0, 1.0, 1.0,     colorchange,0.1,1,
        1.0, 1.0, 1.0,     colorchange,0.1,1,//front

        2.0, 0.0, 0.0,    1,0.1,colorchange,
        1.0, 1.0, 0.0,     1,0.1,colorchange,
        0.0, 1.0, 0.0,    1,0.1,colorchange,

        2.0, 0.0, 0.0,     1,0.1,colorchange,
        0.0, 1.0, 0.0,     1,0.1,colorchange,
        0.0, 0.0, 0.0,    1,0.1,colorchange,//back

        //node for cylinder(72+96)
      0.0,  0.0,  0.0,     0.8, 0.1, 0.0,   
      0.5,  0.0,  0.0,     0.8, 0.1 ,0.0,  
       a1,  0.0,  -a1,    0.8, 0.1 ,0.0, //1

      0.0,  0.0,  0.0,    0.7, 0.1 ,0.0,   
       a1,  0.0,  -a1,     0.7, 0.1 ,0.0,  
      0.0,  0.0, -0.5,     0.7, 0.1 ,0.0, //2

      0.0,  0.0,  0.0,     0.6, 0.1 ,0.0, 
      0.0,  0.0, -0.5,     0.6, 0.1 ,0.0, 
      -a1,  0.0,  -a1,     0.6, 0.1 ,0.0,  //3 

       0.0,  0.0,  0.0,     0.8, 0.1 ,0.1, 
       -a1,  0.0,  -a1,     0.8, 0.1 ,0.1, 
      -0.5,  0.0,  0.0,     0.8, 0.1 ,0.1, //4

       0.0,  0.0,  0.0,    0.8, 0.1 ,0.2, 
      -0.5,  0.0,  0.0,    0.8, 0.1 ,0.2, 
       -a1,  0.0,   a1,    0.8, 0.1, 0.2, //5

       0.0,  0.0,  0.0,    0.8, 0.1 ,0.2, 
       -a1,  0.0,   a1,    0.8, 0.1, 0.2, 
       0.0,  0.0,  0.5,    0.8, 0.1 ,0.2, //6

       0.0,  0.0,  0.0,    0.8, 0.1 ,0.2, 
       0.0,  0.0,  0.5,    0.8, 0.1 ,0.2, 
       a1,  0.0,   a1,      0.8, 0.1, 0.2, //7

       0.0,  0.0,  0.0,     0.8, 0.1 ,0.2, 
       a1,  0.0,   a1,      0.8, 0.1, 0.2, 
       0.5,  0.0,  0.0,    0.8, 0.1 ,0.2,  //8 //24 

      0.0,  2.0,  0.0,     0.8, 0.1, 0.2,   
      0.5,  2.0,  0.0,   0.8, 0.1 ,0.2,   
       a1,  2.0,  -a1,     0.8, 0.1 ,0.2, //1

      0.0,  2.0,  0.0,     0.8, 0.1, 0.2,  
       a1,  2.0,  -a1,     0.8, 0.1 ,0.2,  
      0.0,  2.0, -0.5,    0.8, 0.1 ,0.2, //2

      0.0,  2.0,  0.0,     0.8, 0.1 ,0.2, 
      0.0,  2.0, -0.5,     0.8, 0.1 ,0.2, 
      -a1,  2.0,  -a1,     0.8, 0.1, 0.2,   //3

       0.0,  2.0,  0.0,    0.8, 0.1, 0.2, 
       -a1,  2.0,  -a1,    0.8, 0.1, 0.2,  
      -0.5,  2.0,  0.0,    0.8, 0.1, 0.2, //4

       0.0,  2.0,  0.0,    0.8, 0.1, 0.2, 
      -0.5,  2.0,  0.0,    0.8, 0.1, 0.2, 
       -a1,  2.0,   a1,     0.8, 0.1, 0.2, //5

       0.0,  2.0,  0.0,     0.8, 0.3 ,0.0, 
       -a1,  2.0,   a1,     0.8, 0.3 ,0.0, 
       0.0,  2.0,  0.5,     0.8, 0.3, 0.0, //6

       0.0,  2.0,  0.0,     0.8, 0.4, 0.0, 
       0.0,  2.0,  0.5,     0.8, 0.4, 0.0, 
       a1,   2.0,   a1,     0.8, 0.4, 0.0, //7

       0.0,  2.0,  0.0,     0.8, 0.5, 0.0, 
       a1,   2.0,   a1,     0.8, 0.5, 0.0, 
       0.5,  2.0,  0.0,     0.8, 0.5 ,0.0,  //8 //48 

       0.5,  0.0,  0.0,     0.8, 0.7 ,0.0,  
        a1,  0.0,  -a1,     0.8, 0.7, 0.0, 
       0.5,  2.0,  0.0,     0.8, 0.7, 0.0,  //middle//1

       0.5,  2.0,  0.0,     0.8, 0.8, 0.0,  
        a1,  2.0,  -a1,     0.8, 0.8 ,0.0, 
        a1,  0.0,  -a1,    0.8, 0.8 ,0.0, //1

        a1,  0.0,  -a1,    0.8, 0.9 ,0.0,  
       0.0,  0.0, -0.5,    0.8, 0.9 ,0.0, 
        a1,  2.0,  -a1,    0.8, 0.9 ,0.0, 

        a1,  2.0,  -a1,     0.7, 0.1 ,0.0,  
       0.0,  2.0, -0.5,     0.7, 0.1, 0.0, 
       0.0,  0.0, -0.5,     0.7, 0.1, 0.0, //2

       0.0,  0.0, -0.5,     0.6, 0.1 ,0.0, 
       -a1,  0.0,  -a1,    0.6, 0.1 ,0.0, 
       0.0,  2.0, -0.5,     0.6, 0.1, 0.0, 

       0.0,  2.0, -0.5,    0.5, 0.1, 0.0, 
       -a1,  2.0,  -a1,    0.5, 0.1 ,0.0, 
       -a1,  0.0,  -a1,    0.5, 0.1, 0.0, //3

       -a1,  2.0,  -a1,    0.4, 0.1, 0.0,  
      -0.5,  2.0,  0.0,    0.4, 0.1 ,0.0, 
      -0.5,  0.0,  0.0,     0.4, 0.1, 0.0, 

       -a1,  0.0,  -a1,    0.8, 0.1, 0.0,  
      -0.5,  0.0,  0.0,     0.8, 0.1 ,0.0, 
       -a1,  2.0,  -a1,    0.8, 0.1, 0.0,  //4

       -0.5,  0.0,  0.0,   0.8, 0.1 ,0.2, 
        -a1,  0.0,   a1,   0.8, 0.1, 0.2, 
       -0.5,  2.0,  0.0,   0.8, 0.1, 0.2, 

       -0.5,  2.0,  0.0,   0.8, 0.1, 0.3, 
        -a1,  2.0,   a1,   0.8, 0.1, 0.3, 
        -a1,  0.0,   a1,   0.8, 0.1 ,0.3, //5

       -a1,  0.0,   a1,    0.8, 0.1 ,0.4, 
       0.0,  0.0,  0.5,     0.8, 0.1, 0.4, 
       0.0,  2.0,  0.5,    0.8, 0.1, 0.4, 

       -a1,  0.0,   a1,    0.8, 0.1, 0.5, 
       -a1,  2.0,   a1,    0.8, 0.1, 0.5, 
       0.0,  2.0,  0.5,    0.8, 0.1, 0.5, //6

       0.0,  2.0,  0.5,    0.8, 0.1 ,0.7, 
       a1,   2.0,   a1,   0.8, 0.1, 0.7, 
       0.0,  0.0,  0.5,   0.8, 0.1, 0.7, 

       0.0,  0.0,  0.5,    0.8, 0.1, 0.9, 
        a1,  0.0,   a1,     0.8, 0.1 ,0.9, 
       a1,   2.0,   a1,   0.8, 0.1 ,0.9, //7

       a1,  0.0,    a1,     0.5, 0.1 ,0.0, 
       0.5,  0.0,  0.0,     0.5, 0.1 ,0.0, 
       a1,   2.0,   a1,     0.5, 0.1 ,0.0, 

       a1,   2.0,   a1,     0.2, 0.1, 0.0, 
       0.5,  2.0,  0.0,     0.2, 0.1 ,0.0, 
       0.5,  0.0,  0.0,     0.2, 0.1 ,0.0, //8

       //axes(168-2-x-axe)
       0.0,  0.0,  0.0,     1.0,0.0,0.0,
       1.0,  0.0,  0.0,     1.0,0.0,0.0, 

       //axes(170-2-y-axe)
       0.0,  0.0,  0.0,     0.0,1.0,0.0,
       0.0,  1.0,  0.0,     0.0,1.0,0.0, 

       //axes(172-2-z-axe)
       0.0,  0.0,  0.0,     0.0,0.0,1.0,
       0.0,  0.0,  1.0,     0.0,0.0,1.0, 
  ]);
  
  // Make our 'ground plane'; can you make a'torus' shape too?
  // (recall the 'basic shapes' starter code...)
  makeGroundGrid();

	// How much space to store all the shapes in one array?
	// (no 'var' means this is a global variable)
	mySiz = forestVerts.length + gndVerts.length;

	// How many vertices total?
	var nn = mySiz / floatsPerVertex;
	console.log('nn is', nn, 'mySiz is', mySiz, 'floatsPerVertex is', floatsPerVertex);

	// Copy all shapes into one big Float32 array:
  var verticesColors = new Float32Array(mySiz);
	// Copy them:  remember where to start for each shape:
	forestStart = 0;							// we store the forest first.
  for(i=0,j=0; j< forestVerts.length; i++,j++) {
  	verticesColors[i] = forestVerts[j];
		} 
	gndStart = i;						// next we'll store the ground-plane;
	for(j=0; j< gndVerts.length; i++, j++) {
		verticesColors[i] = gndVerts[j];
		}

  
  // Create a vertex buffer object (VBO)
  var vertexColorbuffer = gl.createBuffer();  
  if (!vertexColorbuffer) {
    console.log('Failed to create the buffer object');
    return -1;
  }

  // Write vertex information to buffer object
  gl.bindBuffer(gl.ARRAY_BUFFER, vertexColorbuffer);
  gl.bufferData(gl.ARRAY_BUFFER, verticesColors, gl.STATIC_DRAW);

  var FSIZE = verticesColors.BYTES_PER_ELEMENT;
  // Assign the buffer object to a_Position and enable the assignment
  var a_Position = gl.getAttribLocation(gl.program, 'a_Position');
  if(a_Position < 0) {
    console.log('Failed to get the storage location of a_Position');
    return -1;
  }
  gl.vertexAttribPointer(a_Position, 3, gl.FLOAT, false, FSIZE * 6, 0);
  gl.enableVertexAttribArray(a_Position);
  // Assign the buffer object to a_Color and enable the assignment
  var a_Color = gl.getAttribLocation(gl.program, 'a_Color');
  if(a_Color < 0) {
    console.log('Failed to get the storage location of a_Color');
    return -1;
  }
  gl.vertexAttribPointer(a_Color, 3, gl.FLOAT, false, FSIZE * 6, FSIZE * 3);
  gl.enableVertexAttribArray(a_Color);

  return mySiz/floatsPerVertex;	// return # of vertices
}

var g_EyeX = 0.20, g_EyeY = 0.25, g_EyeZ = 4.25; 
// Global vars for Eye position. 
// NOTE!  I moved eyepoint BACKWARDS from the forest: from g_EyeZ=0.25
// a distance far enough away to see the whole 'forest' of trees within the
// 30-degree field-of-view of our 'perspective' camera.  I ALSO increased
// the 'keydown()' function's effect on g_EyeX position.


function keydown(ev, gl, u_ViewMatrix, viewMatrix) {
//------------------------------------------------------
//HTML calls this'Event handler' or 'callback function' when we press a key:
if(ev.keyCode == 39) { // right arrow - step right
        up = new Vector3();
        up[0] = 0;
        up[1] = 1;
        up[2] = 0;
        look = new Vector3();
        look = vec3FromEye2LookAt(g_EyeX, g_EyeY, g_EyeZ, g_LookAtX, g_LookAtY, g_LookAtZ);

        tmpVec3 = new Vector3();
        tmpVec3 = vec3CrossProduct(up, look);

        //console.log(tmpVec3[0], tmpVec3[1], tmpVec3[2]);

        g_EyeX -= MOVE_STEP * tmpVec3[0];
        g_EyeY -= MOVE_STEP * tmpVec3[1];
        g_EyeZ -= MOVE_STEP * tmpVec3[2];

        g_LookAtX -= MOVE_STEP * tmpVec3[0];
        g_LookAtY -= MOVE_STEP * tmpVec3[1];
        g_LookAtZ -= MOVE_STEP * tmpVec3[2];

        console.log('eyeX=',g_EyeX, 'eyeY=', g_EyeY, 'eyeZ=', g_EyeZ, 'lookAtX=', g_LookAtX, 'lookAtY=', g_LookAtY, 'lookAtZ=', g_LookAtZ);
    } 
  else 
    if (ev.keyCode == 37) { // left arrow - step left
        up = new Vector3();
        up[0] = 0;
        up[1] = 1;
        up[2] = 0;
        look = new Vector3();
        look = vec3FromEye2LookAt(g_EyeX, g_EyeY, g_EyeZ, g_LookAtX, g_LookAtY, g_LookAtZ);

        tmpVec3 = new Vector3();
        tmpVec3 = vec3CrossProduct(up, look);

        //console.log(tmpVec3[0], tmpVec3[1], tmpVec3[2]);

        g_EyeX += MOVE_STEP * tmpVec3[0];
        g_EyeY += MOVE_STEP * tmpVec3[1];
        g_EyeZ += MOVE_STEP * tmpVec3[2];

        g_LookAtX += MOVE_STEP * tmpVec3[0];
        g_LookAtY += MOVE_STEP * tmpVec3[1];
        g_LookAtZ += MOVE_STEP * tmpVec3[2];

        console.log('eyeX=',g_EyeX, 'eyeY=', g_EyeY, 'eyeZ=', g_EyeZ, 'lookAtX=', g_LookAtX, 'lookAtY=', g_LookAtY, 'lookAtZ=', g_LookAtZ);
    } 
  else 
    if (ev.keyCode == 38) { // up arrow - step forward
        tmpVec3 = new Vector3();
        tmpVec3 = vec3FromEye2LookAt(g_EyeX, g_EyeY, g_EyeZ, g_LookAtX, g_LookAtY, g_LookAtZ);
        
        g_EyeX += MOVE_STEP * tmpVec3[0];
        g_EyeY += MOVE_STEP * tmpVec3[1];
        g_EyeZ += MOVE_STEP * tmpVec3[2];

        g_LookAtX += MOVE_STEP * tmpVec3[0];
        g_LookAtY += MOVE_STEP * tmpVec3[1];
        g_LookAtZ += MOVE_STEP * tmpVec3[2];

        console.log('eyeX=',g_EyeX, 'eyeY=', g_EyeY, 'eyeZ=', g_EyeZ, 'lookAtX=', g_LookAtX, 'lookAtY=', g_LookAtY, 'lookAtZ=', g_LookAtZ);

    } 
    else 
    if (ev.keyCode == 40) { // down arrow - step backward
        tmpVec3 = new Vector3();
        tmpVec3 = vec3FromEye2LookAt(g_EyeX, g_EyeY, g_EyeZ, g_LookAtX, g_LookAtY, g_LookAtZ);
        
        g_EyeX -= MOVE_STEP * tmpVec3[0];
        g_EyeY -= MOVE_STEP * tmpVec3[1];
        g_EyeZ -= MOVE_STEP * tmpVec3[2];

        g_LookAtX -= MOVE_STEP * tmpVec3[0];
        g_LookAtY -= MOVE_STEP * tmpVec3[1];
        g_LookAtZ -= MOVE_STEP * tmpVec3[2];

        console.log('eyeX=',g_EyeX, 'eyeY=', g_EyeY, 'eyeZ=', g_EyeZ, 'lookAtX=', g_LookAtX, 'lookAtY=', g_LookAtY, 'lookAtZ=', g_LookAtZ);
    } 
    
    else
    if (ev.keyCode == 65){ // a - look left
      if(LAST_UPDATE==-1 || LAST_UPDATE==0)
        {
          a = g_LookAtX - g_EyeX;
          b = g_LookAtY - g_EyeY;
          c = g_LookAtZ - g_EyeZ;
          l = Math.sqrt(a*a + b*b + c*c);
          
          lzx = Math.sqrt(a*a+c*c);
          sin_phi = lzx / l;

          theta0 = Math.PI -  Math.asin(a/lzx);

          THETA_NOW = theta0 + LOOK_STEP;
          
          LAST_UPDATE = 1;
        }
        else
        {
          THETA_NOW += LOOK_STEP;
        }

        g_LookAtY = b + g_EyeY;
        g_LookAtX = l * sin_phi * Math.sin(THETA_NOW) + g_EyeX;
        g_LookAtZ = l * sin_phi * Math.cos(THETA_NOW) + g_EyeZ;
    }

    else
      if(ev.keyCode==68){//d - look right
        if (LAST_UPDATE==-1 || LAST_UPDATE==0)
        {
          a = g_LookAtX - g_EyeX;
          b = g_LookAtY - g_EyeY;
          c = g_LookAtZ - g_EyeZ;
          l = Math.sqrt(a*a + b*b + c*c);
          lzx = Math.sqrt(a*a+c*c);
          sin_phi = lzx / l;

          theta0 = Math.PI -  Math.asin(a/lzx);

          THETA_NOW = theta0 - LOOK_STEP;
          
          LAST_UPDATE = 1;
        }
        else
        {
          THETA_NOW -= LOOK_STEP;
        }

        g_LookAtY = b + g_EyeY;
        g_LookAtX = l * sin_phi * Math.sin(THETA_NOW) + g_EyeX;
        g_LookAtZ = l * sin_phi * Math.cos(THETA_NOW) + g_EyeZ;
      }
    else
      if(ev.keyCode==87){ //w - look up
        if (LAST_UPDATE==-1 || LAST_UPDATE==1)
        {  
          a = g_LookAtX - g_EyeX;
          b = g_LookAtY - g_EyeY;
          c = g_LookAtZ - g_EyeZ;
          l = Math.sqrt(a*a + b*b + c*c);
          cos_theta = c / Math.sqrt(a*a + c*c);
          sin_theta = a / Math.sqrt(a*a + c*c);

          phi0 = Math.asin(b/l);

          PHI_NOW = phi0 + LOOK_STEP;
          LAST_UPDATE = 0;
        }
        else
        {
          PHI_NOW += LOOK_STEP;
        }

        g_LookAtY = l * Math.sin(PHI_NOW) + g_EyeY;
        g_LookAtX = l * Math.cos(PHI_NOW) * sin_theta + g_EyeX;
        g_LookAtZ = l * Math.cos(PHI_NOW) * cos_theta + g_EyeZ;
      }
    else
      if(ev.keyCode==83){ //s-look down
        if(LAST_UPDATE==-1 || LAST_UPDATE==1)
        { 
          a = g_LookAtX - g_EyeX;
          b = g_LookAtY - g_EyeY;
          c = g_LookAtZ - g_EyeZ;
          l = Math.sqrt(a*a + b*b + c*c);
  
          cos_theta = c / Math.sqrt(a*a + c*c);
          sin_theta = a / Math.sqrt(a*a + c*c);

          phi0 = Math.asin(b/l);

          PHI_NOW = phi0 - LOOK_STEP;
          
          
          LAST_UPDATE = 0;
        }
        else
        {
          PHI_NOW -= LOOK_STEP;
        }

        g_LookAtY = l * Math.sin(PHI_NOW) + g_EyeY;
        g_LookAtX = l * Math.cos(PHI_NOW) * sin_theta + g_EyeX;
        g_LookAtZ = l * Math.cos(PHI_NOW) * cos_theta + g_EyeZ;
      }
    else { return; } // Prevent the unnecessary drawing
    draw(gl, u_ViewMatrix, viewMatrix);    
}

function vec3FromEye2LookAt(eyeX, eyeY, eyeZ, lookAtX, lookAtY, lookAtZ)
{
  result = new Vector3();
  
  dx = lookAtX - eyeX;
  dy = lookAtY - eyeY;
  dz = lookAtZ - eyeZ;
  amp = Math.sqrt(dx*dx + dy*dy + dz*dz);

  result[0] = dx/amp;
  result[1] = dy/amp;
  result[2] = dz/amp;

  return result;
}

function vec3CrossProduct(up, look) //UpVec x LookVec --> Left Vec
{
  r = new Vector3();

  r[0] = up[1]*look[2] - up[2]*look[1];
  console.log('up1', up[1]);
  r[1] = up[2]*look[0] - up[0]*look[2];
  r[2] = up[0]*look[1] - up[1]*look[0];

  amp = Math.sqrt(r[0]*r[0] + r[1]*r[1] + r[2]*r[2]) + 0.000001;

  r[0] /= amp;
  r[1] /= amp;
  r[2] /= amp;

  return r;
}

//var g_EyeX = 0.20, g_EyeY = 0.25, g_EyeZ = 4.25; 
var g_LookAtX = 0.0, g_LookAtY = 0.0, g_LookAtZ = 0.0;

function draw(gl, currentAngle,u_ViewMatrix, viewMatrix) {
//==============================================================================
  
  // Clear <canvas> color AND DEPTH buffer
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  // Using OpenGL/ WebGL 'viewports':
  // these determine the mapping of CVV to the 'drawing context',
	// (for WebGL, the 'gl' context describes how we draw inside an HTML-5 canvas)
	// Details? see
	//
  //  https://www.khronos.org/registry/webgl/specs/1.0/#2.3
  // Draw in the FIRST of several 'viewports'
  //------------------------------------------
	// CHANGE from our default viewport:
	// gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight);
	// to a smaller one:
	gl.viewport(0,  														// Viewport lower-left corner
							0,															// (x,y) location(in pixels)
  						gl.drawingBufferWidth/2, 				// viewport width, height.
  						gl.drawingBufferHeight/2);
  						
  // Set the matrix to be used for to set the camera view
  viewMatrix.setLookAt(g_EyeX, g_EyeY, g_EyeZ, 	// eye position
  											g_LookAtX, g_LookAtY, g_LookAtZ, 								// look-at point (origin)
  											0, 1, 0);								// up vector (+y)

  // Pass the view projection matrix
  gl.uniformMatrix4fv(u_ViewMatrix, false, viewMatrix.elements);

	// Draw the scene:
	drawMyScene(gl, currentAngle,u_ViewMatrix, viewMatrix);
 
    // Draw in the SECOND of several 'viewports'
  //------------------------------------------
	gl.viewport(gl.drawingBufferWidth/2, 				// Viewport lower-left corner
							0, 															// location(in pixels)
  						gl.drawingBufferWidth/2, 				// viewport width, height.
  						gl.drawingBufferHeight/2);
  // projMatrix.setOrtho(-0.5*gl.drawingBufferWidth/300, 0.5*gl.drawingBufferWidth/300,          // left,right;
  //                     -gl.drawingBufferHeight/300, gl.drawingBufferHeight/300,          // bottom, top;
  //                     1, 100);       // near, far; (always >=0)

	// but use a different 'view' matrix:
  viewMatrix.setLookAt(-g_EyeX, g_EyeY, g_EyeZ, // eye position
  									g_LookAtX, g_LookAtY, g_LookAtZ,                 // look-at point (origin)
                        0, 1, 0);               // up vector (+y)
  // Pass the view projection matrix to our shaders:
  gl.uniformMatrix4fv(u_ViewMatrix, false, viewMatrix.elements);

	// Draw the scene:
	drawMyScene(gl,currentAngle, u_ViewMatrix, viewMatrix);
}

function drawMyScene(myGL, currentAngle,myu_ViewMatrix, myViewMatrix) {
  myViewMatrix.rotate(-90.0, 1,0,0);	// new one has "+z points upwards",
  																		// made by rotating -90 deg on +x-axis.
  																		// Move those new drawing axes to the 
  																		// bottom of the trees:
	myViewMatrix.translate(0.0, 0.0, -0.6);	
	myViewMatrix.scale(0.4, 0.4,0.4);		// shrink the drawing axes 
																			//for nicer-looking ground-plane, and
  // Pass the modified view matrix to our shaders:
  myGL.uniformMatrix4fv(myu_ViewMatrix, false, myViewMatrix.elements);
  // Now, using these drawing axes, draw our ground plane: 
  myGL.drawArrays(myGL.LINES,							// use this drawing primitive, and
  							gndStart/floatsPerVertex,	// start at this vertex number, and
  							gndVerts.length/floatsPerVertex);		// draw this many vertices
  pushMatrix(myViewMatrix);
  pushMatrix(myViewMatrix);
  pushMatrix(myViewMatrix);
  pushMatrix(myViewMatrix);
  pushMatrix(myViewMatrix);
  pushMatrix(myViewMatrix);
  pushMatrix(myViewMatrix);
  pushMatrix(myViewMatrix);
  pushMatrix(myViewMatrix);
  pushMatrix(myViewMatrix);
  pushMatrix(myViewMatrix);
  pushMatrix(myViewMatrix);

  //AXES-X
  myGL.uniformMatrix4fv(myu_ViewMatrix, false, myViewMatrix.elements);
  myGL.drawArrays(myGL.LINES,168,2); 
  //AXES-Y
  myGL.uniformMatrix4fv(myu_ViewMatrix, false, myViewMatrix.elements);
  myGL.drawArrays(myGL.LINES,170,2); 
  //AXES-Z
  myGL.uniformMatrix4fv(myu_ViewMatrix, false, myViewMatrix.elements);
  myGL.drawArrays(myGL.LINES,172,2); 


  myViewMatrix = popMatrix();
  myViewMatrix.translate(-0.4,-0.4,0.0);
  myViewMatrix.scale(0.2, 0.2, 0.2);
  myViewMatrix.rotate(90, 1, 0, 0);
  myViewMatrix.rotate(currentAngle, 0, 1, 0);  
  myGL.uniformMatrix4fv(myu_ViewMatrix, false, myViewMatrix.elements)
  myGL.drawArrays(myGL.TRIANGLES, 72, 96);//cylinder


}
var g_last = Date.now();

function animate(angle) {
//==============================================================================
  var now = Date.now();
  var elapsed = now - g_last;
  g_last = now;
  
  if(angle >   320.0 && ANGLE_STEP > 0) ANGLE_STEP = -ANGLE_STEP;
  if(angle <  0.0 && ANGLE_STEP < 0) ANGLE_STEP = -ANGLE_STEP;
  
  var newAngle = angle + (ANGLE_STEP * elapsed) / 1000.0;
  return newAngle %= 360;
}
