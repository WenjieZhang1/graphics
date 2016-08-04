
//Name-netid
//Yamin Li-YLF245, Wenjie Zhang-wzm416, Ounan Ma-omg049, Zijun Zhang-zzz847

//Try Up/Down/Left/Right-arrow keys on the keyboard...

//3456789_123456789_123456789_123456789_123456789_123456789_123456789_123456789_
// (JT: why the numbers? counts columns, helps me keep 80-char-wide listings)
//
// MultiPoint.js (c) 2012 matsuda
// MultiPointJT.js  MODIFIED for EECS 351-1, Northwestern Univ. Jack Tumblin
//						(converted to 2D->4D; 3 verts --> 6 verts; draw as
//						gl.POINTS and as gl.LINE_LOOP, change color.
//
// Vertex shader program.  
//  Each instance computes all the on-screen attributes for just one VERTEX,
//  specifying that vertex so that it can be used as part of a drawing primitive
//  depicted in the CVV coord. system (+/-1, +/-1, +/-1) that fills our HTML5
//  'canvas' object.
// In this program, we get info for one vertex in our Vertex Buffer Object (VBO) 
// through the 'attribute' variable a_Position, and use it.
// 
//    ?What other vertex attributes can you set within a Vertex Shader? Color?
//    surface normal? texture coordinates?
//    ?How could you set each of these attributes separately for each vertex in//
//    our VBO?  Could you store them in the VBO? Use them in the Vertex Shader?
//
var VSHADER_SOURCE =
  'attribute vec4 a_Position;\n' +
  'void main() {\n' +
  '  gl_Position = a_Position;\n' +
  '  gl_PointSize = 10.0;\n' +
  '}\n';

// Fragment shader program
//  Each instance computes all the on-screen attributes for just one PIXEL
var FSHADER_SOURCE =
  'precision mediump float;\n' +
  'uniform vec4 u_FragColor;\n' +  // uniform変数
  'void main() {\n' +
  '  gl_FragColor = u_FragColor;\n' +
  '}\n';

var ANGLE_STEP = 45.0;  // default rotation angle rate (deg/sec)
var isDrag=false;		// mouse-drag: true when user holds down mouse button
var xMclik=0.0;     // last mouse button-down position (in CVV coords)
var yMclik=0.0;
var xMdragTot=0.0;	// total (accumulated) mouse-drag amounts (in CVV coords).
var yMdragTot=0.0;

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

  // Write the positions of vertices to a vertex shader
  var n = initVertexBuffers(gl);	
  if (n < 0) {
    console.log('Failed to set the positions of the vertices');
    return;
  }

  var u_FragColor = gl.getUniformLocation(gl.program, 'u_FragColor');
  if (!u_FragColor) {
    console.log('Failed to get the storage location of u_FragColor');
    return;
  }

  canvas.onmousedown = function(ev){myMouseDown( ev, gl, canvas) }; 
  					// when user's mouse button goes down call mouseDown() function
  canvas.onmousemove =  function(ev){myMouseMove( ev, gl, canvas, u_FragColor) };
					// call mouseMove() function					
  canvas.onmouseup = function(ev){myMouseUp(   ev, gl, canvas)};
  window.addEventListener("keydown", myKeyDown, false);
	window.addEventListener("keyup", myKeyUp, false);
	window.addEventListener("keypress", myKeyPress, false);
    
  // Specify the color for clearing <canvas>
  gl.clearColor(0, 0, 0.5, 1);

  // ANIMATION: create 'tick' variable whose value is this function:
  //----------------- 
  var tick = function() {
    initVertexBuffers(gl);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.drawArrays(gl.LINE_LOOP, 0, n); // gl.drawArrays(mode, first, count)
    gl.drawArrays(gl.POINTS, 0, n); // gl.drawArrays(mode, first, count)

    document.getElementById('Mouse').innerHTML=
      'Mouse Drag totals (CVV coords):\t'+xMdragTot+', \t'+yMdragTot; 
    requestAnimationFrame(tick, canvas); 
  }
  tick();             // start (and continue) animation: draw current image
}


function initVertexBuffers(gl) {
//==============================================================================
// first, create an array with all our vertex attribute values:
 var calAngle = Math.atan2(yMclik,xMclik);
// var calAngle = Math.atan2(0,0.5);
var currentAngle = 0.0;
 currentAngle = animate(currentAngle);  // Update the rotation angle
  var vertices = new Float32Array([
    //   0.0,  0.5,  0.0, 1.0,	// CAREFUL! I made these into 4D points/ vertices: x,y,z,w.
    // -0.14,  0.25+0.5*Math.sin(xMdragTot), 0.0, 1.0,	// new point!  (? What happens if I make w=0 instead of 1.0?)
    // -0.43,  0.25, 0.0, 1.0,
    // -0.29,  0.0,  0.0, 1.0,
    // -0.43, -0.25, 0.0, 1.0,
    // -0.14, -0.25, 0.0, 1.0,
    //   0.0, -0.5,  0.0, 1.0,
    //  0.14, -0.25, 0.0, 1.0, 
    //  0.43, -0.25, 0.0, 1.0,
    //  0.29,  0.0,  0.0, 1.0,  
    //  0.43,  0.25, 0.0, 1.0, 	// new point!
    //  0.14,  0.25, 0.0, 1.0,	//

    //   0.0+0.5*Math.cos(calAngle),  0.5-0.5*Math.sin(calAngle),  0.0, 1.0,  // CAREFUL! I made these into 4D points/ vertices: x,y,z,w.
    // -0.14+0.5*Math.cos(calAngle),  0.25-0.5*Math.sin(calAngle), 0.0, 1.0, // new point!  (? What happens if I make w=0 instead of 1.0?)
    // -0.43+0.5*Math.cos(calAngle),  0.25-0.5*Math.sin(calAngle), 0.0, 1.0,
    // -0.29+0.5*Math.cos(calAngle),  0.0-0.5*Math.sin(calAngle),  0.0, 1.0,
    // -0.43+0.5*Math.cos(calAngle), -0.25-0.5*Math.sin(calAngle), 0.0, 1.0,
    // -0.14+0.5*Math.cos(calAngle), -0.25-0.5*Math.sin(calAngle), 0.0, 1.0,
    //   0.0+0.5*Math.cos(calAngle), -0.5-0.5*Math.sin(calAngle),  0.0, 1.0,
    //  0.14+0.5*Math.cos(calAngle), -0.25-0.5*Math.sin(calAngle), 0.0, 1.0, 
    //  0.43+0.5*Math.cos(calAngle), -0.25-0.5*Math.sin(calAngle), 0.0, 1.0,
    //  0.29+0.5*Math.cos(calAngle),  0.0-0.5*Math.sin(calAngle),  0.0, 1.0,  
    //  0.43+0.5*Math.cos(calAngle),  0.25-0.5*Math.sin(calAngle), 0.0, 1.0,   // new point!
    //  0.14+0.5*Math.cos(calAngle),  0.25-0.5*Math.sin(calAngle), 0.0, 1.0, // 

      0.5*Math.cos(Math.atan2(0.5,0)+calAngle)+xMclik,  0.5*Math.sin(Math.atan2(0.5,0)+calAngle)+yMclik,  0.0, 1.0,
      0.29*Math.cos(Math.atan2(0.25,-0.14)+calAngle)+xMclik, 0.29*Math.sin(Math.atan2(0.25,-0.14)+calAngle)+yMclik, 0.0, 1.0,
      0.5*Math.cos(Math.atan2(0.25,-0.43)+calAngle)+xMclik,  0.5*Math.sin(Math.atan2(0.25,-0.43)+calAngle)+yMclik,  0.0, 1.0,
      0.29*Math.cos(Math.atan2(0,-0.29)+calAngle)+xMclik,  0.29*Math.sin(Math.atan2(0,-0.29)+calAngle)+yMclik,  0.0, 1.0,
      0.5*Math.cos(Math.atan2(-0.25,-0.43)+calAngle)+xMclik,  0.5*Math.sin(Math.atan2(-0.25,-0.43)+calAngle)+yMclik,  0.0, 1.0,
      0.29*Math.cos(Math.atan2(-0.25,-0.14)+calAngle)+xMclik,  0.29*Math.sin(Math.atan2(-0.25,-0.14)+calAngle)+yMclik,  0.0, 1.0,
      0.5*Math.cos(Math.atan2(-0.5,0)+calAngle)+xMclik,  0.5*Math.sin(Math.atan2(-0.5,0)+calAngle)+yMclik,  0.0, 1.0,
      0.29*Math.cos(Math.atan2(-0.25,0.14)+calAngle)+xMclik,  0.29*Math.sin(Math.atan2(-0.25,0.14)+calAngle)+yMclik,  0.0, 1.0,
      0.5*Math.cos(Math.atan2(-0.25,0.43)+calAngle)+xMclik,  0.5*Math.sin(Math.atan2(-0.25,0.43)+calAngle)+yMclik,  0.0, 1.0,
      0.29*Math.cos(Math.atan2(0,0.29)+calAngle)+xMclik,  0.29*Math.sin(Math.atan2(0,0.29)+calAngle)+yMclik,  0.0, 1.0,
      0.5*Math.cos(Math.atan2(0.25,0.43)+calAngle)+xMclik,  0.5*Math.sin(Math.atan2(0.25,0.43)+calAngle)+yMclik,  0.0, 1.0,
      0.29*Math.cos(Math.atan2(0.25,0.14)+calAngle)+xMclik,  0.29*Math.sin(Math.atan2(0.25,0.14)+calAngle)+yMclik,  0.0, 1.0,

  ]);
  var n = 12; // The number of vertices

  // Then in the Graphics hardware, reate a vertex buffer object (VBO)
  var vertexBuffer = gl.createBuffer();	// get it's 'handle'
  if (!vertexBuffer) {
    console.log('Failed to create the buffer object');
    return -1;
  }

  // Bind the buffer object to target
  gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
  // COPY data from our 'vertices' array into the vertex buffer object in GPU:
  gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

  var a_Position = gl.getAttribLocation(gl.program, 'a_Position');
  if (a_Position < 0) {
    console.log('Failed to get the storage location of a_Position');
    return -1;
  }
  // Assign the buffer object to a_Position variable
  gl.vertexAttribPointer(a_Position, 4, gl.FLOAT, false, 0, 0);
  // vertexAttributePointer(index, x,y,z,w size=4, type=FLOAT, 
  // NOT normalized, NO stride)

  // Enable the assignment to a_Position variable
  gl.enableVertexAttribArray(a_Position);

  return n;
}

function draw(gl, n, currentAngle, modelMatrix, u_ModelMatrix) {
//==============================================================================
  // Clear <canvas>  colors AND the depth buffer
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  
// Great question from student:
// "?How can I get the screen-clearing color (or any of the many other state
//    variables of OpenGL)?  'glGet()' doesn't seem to work..."
// ANSWER: from WebGL specification page: 
//              https://www.khronos.org/registry/webgl/specs/1.0/
//  search for 'glGet()' (ctrl-f) yields:
//  OpenGL's 'glGet()' becomes WebGL's 'getParameter()'

  clrColr = new Float32Array(4);
  clrColr = gl.getParameter(gl.COLOR_CLEAR_VALUE);
  // console.log("clear value:", clrColr);
  
  //-------Draw Spinning Tetrahedron
  modelMatrix.setTranslate(-0.4,-0.4, 0.0);  // 'set' means DISCARD old matrix,
              // (drawing axes centered in CVV), and then make new
              // drawing axes moved to the lower-left corner of CVV. 
  modelMatrix.scale(1,1,-1);              // convert to left-handed coord sys
                                          // to match WebGL display canvas.
  modelMatrix.scale(0.5, 0.5, 0.5);
              // if you DON'T scale, tetra goes outside the CVV; clipped!
  modelMatrix.rotate(currentAngle, 0, 1, 0);  // Make new drawing axes that

  // DRAW TETRA:  Use this matrix to transform & draw 
  //            the first set of vertices stored in our VBO:
      // Pass our current matrix to the vertex shaders:
  gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements);
      // Draw triangles: start at vertex 0 and draw 12 vertices
  gl.drawArrays(gl.TRIANGLES, 0, 12);

  // NEXT, create different drawing axes, and...
  modelMatrix.setTranslate(0.4, 0.4, 0.0);  // 'set' means DISCARD old matrix,
              // (drawing axes centered in CVV), and then make new
              // drawing axes moved to the lower-left corner of CVV.
  modelMatrix.scale(1,1,-1);              // convert to left-handed coord sys
                                          // to match WebGL display canvas.
  modelMatrix.scale(0.3, 0.3, 0.3);       // Make it smaller.
  
  // Mouse-Dragging for Rotation:
  //-----------------------------
  // Attempt 1:  X-axis, then Y-axis rotation:
/*              // First, rotate around x-axis by the amount of -y-axis dragging:
  modelMatrix.rotate(-yMdragTot*120.0, 1, 0, 0); // drag +/-1 to spin -/+120 deg.
              // Then rotate around y-axis by the amount of x-axis dragging
  modelMatrix.rotate( xMdragTot*120.0, 0, 1, 0); // drag +/-1 to spin +/-120 deg.
        // Acts SENSIBLY if I always drag mouse to turn on Y axis, then X axis.
        // Acts WEIRDLY if I drag mouse to turn on X axis first, then Y axis.
        // ? Why is is 'backwards'? Duality again!
*/
  //-----------------------------

  // Attempt 2: perp-axis rotation:
              // rotate on axis perpendicular to the mouse-drag direction:
  var dist = Math.sqrt(xMdragTot*xMdragTot + yMdragTot*yMdragTot);
              // why add 0.001? avoids divide-by-zero in next statement
              // in cases where user didn't drag the mouse.)
  modelMatrix.rotate(dist*120.0, -yMdragTot+0.0001, xMdragTot+0.0001, 0.0);
        // Acts weirdly as rotation amounts get far from 0 degrees.
        // ?why does intuition fail so quickly here?

  //-------------------------------
  // Attempt 3: Quaternions? What will work better?

          // YOUR CODE HERE

  //-------------------------------
  // DRAW 2 TRIANGLES:    Use this matrix to transform & draw
  //            the different set of vertices stored in our VBO:
  gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements);
      // Draw only the last triangle: start at vertex 9, draw 3 vertices
  gl.drawArrays(gl.TRIANGLES, 6,6);

}

// Last time that this function was called:  (used for animation timing)
var g_last = Date.now();

function animate(angle) {
//==============================================================================
  // Calculate the elapsed time
  var now = Date.now();
  var elapsed = now - g_last;
  g_last = now;
  
  // Update the current rotation angle (adjusted by the elapsed time)
  //  limit the angle to move smoothly between +20 and -85 degrees:
//  if(angle >  120.0 && ANGLE_STEP > 0) ANGLE_STEP = -ANGLE_STEP;
//  if(angle < -120.0 && ANGLE_STEP < 0) ANGLE_STEP = -ANGLE_STEP;
  
  var newAngle = angle + (ANGLE_STEP * elapsed) / 1000.0;
  if(newAngle > 180.0) newAngle = newAngle - 360.0;
  if(newAngle <-180.0) newAngle = newAngle + 360.0;
  return newAngle;
}

function myMouseDown(ev, gl, canvas) {
//==============================================================================
// Called when user PRESSES down any mouse button;
// 									(Which button?    console.log('ev.button='+ev.button);   )
// 		ev.clientX, ev.clientY == mouse pointer location, but measured in webpage 
//		pixels: left-handed coords; UPPER left origin; Y increases DOWNWARDS (!)  

// Create right-handed 'pixel' coords with origin at WebGL canvas LOWER left;
  var rect = ev.target.getBoundingClientRect();	// get canvas corners in pixels
  var xp = ev.clientX - rect.left;									// x==0 at canvas left edge
  var yp = canvas.height - (ev.clientY - rect.top);	// y==0 at canvas bottom edge
//  console.log('myMouseDown(pixel coords): xp,yp=\t',xp,',\t',yp);
  
	// Convert to Canonical View Volume (CVV) coordinates too:
  var x = (xp - canvas.width/2)  / 		// move origin to center of canvas and
  						 (canvas.width/2);			// normalize canvas to -1 <= x < +1,
	var y = (yp - canvas.height/2) /		//										 -1 <= y < +1.
							 (canvas.height/2);
//	console.log('myMouseDown(CVV coords  ):  x, y=\t',x,',\t',y);
	
	isDrag = true;											// set our mouse-dragging flag
	xMclik = x;													// record where mouse-dragging began
	yMclik = y;
};

function myMouseMove(ev, gl, canvas, u_FragColor){
//==============================================================================
// Called when user MOVES the mouse with a button already pressed down.
// 									(Which button?   console.log('ev.button='+ev.button);    )
// 		ev.clientX, ev.clientY == mouse pointer location, but measured in webpage 
//		pixels: left-handed coords; UPPER left origin; Y increases DOWNWARDS (!)  

	if(isDrag==false) return;				// IGNORE all mouse-moves except 'dragging'

	// Create right-handed 'pixel' coords with origin at WebGL canvas LOWER left;
  var rect = ev.target.getBoundingClientRect();	// get canvas corners in pixels
  var xp = ev.clientX - rect.left;									// x==0 at canvas left edge
	var yp = canvas.height - (ev.clientY - rect.top);	// y==0 at canvas bottom edge
//  console.log('myMouseMove(pixel coords): xp,yp=\t',xp,',\t',yp);
  
	// Convert to Canonical View Volume (CVV) coordinates too:
  var x = (xp - canvas.width/2)  / 		// move origin to center of canvas and
  						 (canvas.width/2);			// normalize canvas to -1 <= x < +1,
	var y = (yp - canvas.height/2) /		//										 -1 <= y < +1.
							 (canvas.height/2);
//	console.log('myMouseMove(CVV coords  ):  x, y=\t',x,',\t',y);

	// find how far we dragged the mouse:
	xMdragTot += (x - xMclik);					// Accumulate change-in-mouse-position,&
	yMdragTot += (y - yMclik);
	xMclik = x;													// Make next drag-measurement from here.
	yMclik = y;
  if(x>0&&y>0)
  gl.uniform4f(u_FragColor, 1.0, 1.0, 1.0, 1.0);
  else if(x<0&&y>0)
  gl.uniform4f(u_FragColor, 1.0, 0.0, 0.0, 1.0);
  else if(x>0&&y<0)
  gl.uniform4f(u_FragColor, 0.0, 1.0, 0.0, 1.0);
  else
  gl.uniform4f(u_FragColor, 0.0, 0.0, 1.0, 1.0);
};

function myMouseUp(ev, gl, canvas) {
//==============================================================================
// Called when user RELEASES mouse button pressed previously.
// 									(Which button?   console.log('ev.button='+ev.button);    )
// 		ev.clientX, ev.clientY == mouse pointer location, but measured in webpage 
//		pixels: left-handed coords; UPPER left origin; Y increases DOWNWARDS (!)  

// Create right-handed 'pixel' coords with origin at WebGL canvas LOWER left;
  var rect = ev.target.getBoundingClientRect();	// get canvas corners in pixels
  var xp = ev.clientX - rect.left;									// x==0 at canvas left edge
	var yp = canvas.height - (ev.clientY - rect.top);	// y==0 at canvas bottom edge
//  console.log('myMouseUp  (pixel coords): xp,yp=\t',xp,',\t',yp);
  
	// Convert to Canonical View Volume (CVV) coordinates too:
  var x = (xp - canvas.width/2)  / 		// move origin to center of canvas and
  						 (canvas.width/2);			// normalize canvas to -1 <= x < +1,
	var y = (yp - canvas.height/2) /		//										 -1 <= y < +1.
							 (canvas.height/2);
	console.log('myMouseUp  (CVV coords  ):  x, y=\t',x,',\t',y);
	
	isDrag = false;											// CLEAR our mouse-dragging flag, and
	// accumulate any final bit of mouse-dragging we did:
	xMdragTot += (x - xMclik);
	yMdragTot += (y - yMclik);
	console.log('myMouseUp: xMdragTot,yMdragTot =',xMdragTot,',\t',yMdragTot);
};


function myKeyDown(ev) {
//===============================================================================
// Called when user presses down ANY key on the keyboard, and captures the 
// keyboard's scancode or keycode(varies for different countries and alphabets).
//  CAUTION: You may wish to avoid 'keydown' and 'keyup' events: if you DON'T 
// need to sense non-ASCII keys (arrow keys, function keys, pgUp, pgDn, Ins, 
// Del, etc), then just use the 'keypress' event instead.
//	 The 'keypress' event captures the combined effects of alphanumeric keys and // the SHIFT, ALT, and CTRL modifiers.  It translates pressed keys into ordinary
// ASCII codes; you'll get the ASCII code for uppercase 'S' if you hold shift 
// and press the 's' key.
// For a light, easy explanation of keyboard events in JavaScript,
// see:    http://www.kirupa.com/html5/keyboard_events_in_javascript.htm
// For a thorough explanation of the messy way JavaScript handles keyboard events
// see:    http://javascript.info/tutorial/keyboard-events
//

	switch(ev.keyCode) {			// keycodes !=ASCII, but are very consistent for 
	//	nearly all non-alphanumeric keys for nearly all keyboards in all countries. 
		case 37:		// left-arrow key
			// print in console:
      xMclik = xMclik-0.1;
			console.log(' left-arrow.');
			// and print on webpage in the <div> element with id='Result':
  		document.getElementById('Result').innerHTML =
  			' Left Arrow:keyCode='+ev.keyCode;
			break;
		case 38:		// up-arrow key
      yMclik = yMclik + 0.1;
			console.log('   up-arrow.');
  		document.getElementById('Result').innerHTML =
  			'   Up Arrow:keyCode='+ev.keyCode;
			break;
		case 39:		// right-arrow key
      xMclik = xMclik + 0.1;
			console.log('right-arrow.');
  		document.getElementById('Result').innerHTML =
  			'Right Arrow:keyCode='+ev.keyCode;
  		break;
		case 40:		// down-arrow key
      yMclik = yMclik - 0.1;
			console.log(' down-arrow.');
  		document.getElementById('Result').innerHTML =
  			' Down Arrow:keyCode='+ev.keyCode;
  		break;
		default:
			console.log('myKeyDown()--keycode=', ev.keyCode, ', charCode=', ev.charCode);
  		document.getElementById('Result').innerHTML =
  			'myKeyDown()--keyCode='+ev.keyCode;
			break;
	}
}


function clearDrag() {
// Called when user presses 'Clear' button in our webpage
  xMdragTot = 0.0;
  yMdragTot = 0.0;
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
