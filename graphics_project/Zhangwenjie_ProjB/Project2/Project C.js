
var VSHADER_SOURCE =

  'struct MatlT {\n' +    // Describes one Phong material by its reflectances:
  '   vec3 emit;\n' +     // Ke: emissive -- surface 'glow' amount (r,g,b);
  '   vec3 ambi;\n' +     // Ka: ambient reflectance (r,g,b)
  '   vec3 diff;\n' +     // Kd: diffuse reflectance (r,g,b)
  '   vec3 spec;\n' +     // Ks: specular reflectance (r,g,b)
  '   int shiny;\n' +     // Kshiny: specular exponent (integer >= 1; typ. <200)
  '};\n' +


  'attribute vec4 a_Position;\n' +
  'attribute vec4 a_Normal;\n' +
  'attribute vec2 a_TexCoord;\n' +

  'varying vec2 v_TexCoord;\n' +
  
  'uniform MatlT u_MatlSet[1];\n' +   // Array of all materials.
  'uniform mat4 v_ProjMatrix;\n' +
  'uniform mat4 myv_ViewMatrix;\n' +
  'uniform mat4 v_NormalMatrix;\n' +
 

  'varying vec3 v_Kd; \n' +             // Phong Lighting: diffuse reflectance
                                        // (I didn't make per-pixel Ke,Ka,Ks;
                                        // we use 'uniform' values instead)

  'uniform int v_mode; \n' +
  'uniform int v_onoff1; \n' +
  'uniform int v_onoff2; \n' +

  'uniform int v_gou; \n' +
  'uniform int v_distance; \n' +

  'struct LampT {\n' +    // Describes one point-like Phong light source
  '   vec3 pos;\n' +      // (x,y,z,w); w==1.0 for local light at x,y,z position
                          //       w==0.0 for distant light from x,y,z direction 
  '   vec3 ambi;\n' +     // Ia ==  ambient light source strength (r,g,b)
  '   vec3 diff;\n' +     // Id ==  diffuse light source strength (r,g,b)
  '   vec3 spec;\n' +     // Is == specular light source strength (r,g,b)
  '}; \n' +


  'uniform LampT u_LampSet[2];\n' +   // Array of all light sources.

  'varying vec4 v_Position; \n' +
  'varying vec3 v_Normal; \n' +

  'varying vec4 v_Color;\n' +

  'void main() {\n' +
  '  v_TexCoord = a_TexCoord; \n' +
  '  gl_Position = v_ProjMatrix * a_Position;\n' +
  '  v_Position = myv_ViewMatrix * a_Position; \n' +
  '  v_Normal = normalize(vec3(v_NormalMatrix * a_Normal));\n' +
  '  v_Kd = u_MatlSet[0].diff; \n' +  

 // Normalize! !!IMPORTANT!! TROUBLE if you don't! 
      // normals interpolated for each pixel aren't 1.0 in length any more!
  '  vec3 normal = normalize(v_Normal); \n' +
//  '  vec3 normal = v_Normal; \n' +
      // Find the unit-length light dir vector 'L' (surface pt --> light):
  '  vec3 lightDirection = normalize(u_LampSet[0].pos - v_Position.xyz);\n' +
      // Find the unit-length eye-direction vector 'V' (surface pt --> camera)
  '  vec3 eyeDirection = normalize(u_LampSet[0].pos - v_Position.xyz); \n' +
      // The dot product of (unit-length) light direction and the normal vector
      // (use max() to discard any negatives from lights below the surface) 
      // (look in GLSL manual: what other functions would help?)
      // gives us the cosine-falloff factor needed for the diffuse lighting term:
  '  float nDotL = max(dot(lightDirection, normal), 0.0); \n' +
      // The Blinn-Phong lighting model computes the specular term faster 
      // because it replaces the (V*R)^shiny weighting with (H*N)^shiny,
      // where 'halfway' vector H has a direction half-way between L and V
      // H = norm(norm(V) + norm(L)).  Note L & V already normalized above.
      // (see http://en.wikipedia.org/wiki/Blinn-Phong_shading_model)
  '  vec3 H = normalize(lightDirection + eyeDirection); \n' +
  '  float nDotH = max(dot(H, normal), 0.0); \n' +
      // (use max() to discard any negatives from lights below the surface)
      // Apply the 'shininess' exponent K_e:
      // Try it two different ways:   The 'new hotness': pow() fcn in GLSL.
      // CAREFUL!  pow() won't accept integer exponents! Convert K_shiny!  
  '  float e64 = pow(nDotH, float(u_MatlSet[0].shiny));\n' +
  // Calculate the final color from diffuse reflection and ambient reflection

  '  if(v_mode == 0) { \n' +
  '  vec3 reflectDir = reflect(-lightDirection, normal);\n' +
  '  nDotH = max(dot(reflectDir, eyeDirection), 0.0);\n' +
  '  e64 = pow(nDotH, float(u_MatlSet[0].shiny)/4.0);\n' +
  '  } \n' +

  '  vec3 lightDirection2 = normalize(u_LampSet[1].pos - v_Position.xyz);\n' +
      // Find the unit-length eye-direction vector 'V' (surface pt --> camera)
  '  vec3 eyeDirection2 = normalize(u_LampSet[1].pos - v_Position.xyz); \n' +
  
  '  float nDotL2 = max(dot(lightDirection2, normal), 0.0); \n' +
      // The Blinn-Phong lighting model computes the specular term faster 
      // because it replaces the (V*R)^shiny weighting with (H*N)^shiny,
      // where 'halfway' vector H has a direction half-way between L and V
      // H = norm(norm(V) + norm(L)).  Note L & V already normalized above.
      // (see http://en.wikipedia.org/wiki/Blinn-Phong_shading_model)
  '  vec3 H2 = normalize(lightDirection2 + eyeDirection2); \n' +
  '  float nDotH2 = max(dot(H2, normal), 0.0); \n' +
      // (use max() to discard any negatives from lights below the surface)
      // Apply the 'shininess' exponent K_e:
      // Try it two different ways:   The 'new hotness': pow() fcn in GLSL.
      // CAREFUL!  pow() won't accept integer exponents! Convert K_shiny!  
  '  float e642 = pow(nDotH2, float(u_MatlSet[0].shiny));\n' +


  '  if(v_mode == 0) { \n' +
  '  vec3 reflectDir2 = reflect(-lightDirection2, normal);' +
  '  nDotH2 = max(dot(reflectDir2, eyeDirection2), 0.0);' +
  '  e642 = pow(nDotH2, float(u_MatlSet[0].shiny)/4.0);' +
  '  }\n' +

  '  vec3 emissive = u_MatlSet[0].emit;' +
  
  '  vec3 ambient = u_LampSet[0].ambi * u_MatlSet[0].ambi;\n' +
  '  vec3 diffuse = u_LampSet[0].diff * v_Kd * nDotL;\n' +
  '  vec3 speculr = u_LampSet[0].spec * u_MatlSet[0].spec * e64;\n' +

  
  '  vec3 ambient2 = u_LampSet[1].ambi * u_MatlSet[0].ambi;\n' +
  '  vec3 diffuse2 = u_LampSet[1].diff * v_Kd * nDotL2;\n' +
  '  vec3 speculr2 = u_LampSet[1].spec * u_MatlSet[0].spec * e642;\n' +




'  if(v_onoff1 == 1) { \n' +
          'if(v_onoff2 == 1) {\n' +
            '  v_Color = vec4(emissive+emissive + ambient + diffuse + speculr + ambient2 + diffuse2 + speculr2, 1.0);\n' +
          '} \n' +
          'else \n' +
            '  v_Color = vec4(emissive + ambient + diffuse + speculr, 1.0);\n' +
  '  }\n' +


  '  else { \n' +
          'if(v_onoff2 == 1) {\n' +
            '  v_Color = vec4(emissive + ambient2 + diffuse2 + speculr2, 1.0);\n' +
          '} \n' +
          'else \n' +
            '  v_Color = vec4(0,0,0, 1.0);\n' +
  '  } \n' +
  '}\n';

// Fragment shader program
var FSHADER_SOURCE =
  '#ifdef GL_ES\n' +
  'precision highp float;\n' +
  '#endif\n' +
  'precision highp int;\n' +

  'uniform int v_mode; \n' +
  'uniform int v_onoff1; \n' +
  'uniform int v_onoff2; \n' +
  'uniform int v_gou; \n' +

  'uniform int v_distance; \n' +


  'varying vec2 v_TexCoord;\n' +
  'uniform sampler2D u_Sampler; \n' +

  'struct LampT {\n' +    // Describes one point-like Phong light source
  '   vec3 pos;\n' +      // (x,y,z,w); w==1.0 for local light at x,y,z position
                          //       w==0.0 for distant light from x,y,z direction 
  '   vec3 ambi;\n' +     // Ia ==  ambient light source strength (r,g,b)
  '   vec3 diff;\n' +     // Id ==  diffuse light source strength (r,g,b)
  '   vec3 spec;\n' +     // Is == specular light source strength (r,g,b)
  '}; \n' +

  'struct MatlT {\n' +    // Describes one Phong material by its reflectances:
  '   vec3 emit;\n' +     // Ke: emissive -- surface 'glow' amount (r,g,b);
  '   vec3 ambi;\n' +     // Ka: ambient reflectance (r,g,b)
  '   vec3 diff;\n' +     // Kd: diffuse reflectance (r,g,b)
  '   vec3 spec;\n' +     // Ks: specular reflectance (r,g,b)
  '   int shiny;\n' +     // Kshiny: specular exponent (integer >= 1; typ. <200)
  '   };\n' +

  'uniform LampT u_LampSet[2];\n' +   // Array of all light sources.
  'uniform MatlT u_MatlSet[1];\n' +   // Array of all materials.

  
  //-------------VARYING:Vertex Shader values sent per-pix'''''''''''''''';el to Fragment shader: 
  'varying vec3 v_Normal;\n' +        // Find 3D surface normal at each pix
  'varying vec4 v_Position;\n' +      // pixel's 3D pos too -- in 'world' coords
  'varying vec3 v_Kd; \n' +           // Find diffuse reflectance K_d per pix
                            // Ambient? Emissive? Specular? almost
                            // NEVER change per-vertex: I use 'uniform' values
  'varying vec4 v_Color;\n' +

  'void main() { \n' +
      // Normalize! !!IMPORTANT!! TROUBLE if you don't! 
      // normals interpolated for each pixel aren't 1.0 in length any more!
  '  vec3 normal = normalize(v_Normal); \n' +
//  '  vec3 normal = v_Normal; \n' +
      // Find the unit-length light dir vector 'L' (surface pt --> light):
  '  vec3 lightDirection = normalize(u_LampSet[0].pos - v_Position.xyz);\n' +
      // Find the unit-length eye-direction vector 'V' (surface pt --> camera)
  '  vec3 eyeDirection = normalize(u_LampSet[0].pos - v_Position.xyz); \n' +
      // The dot product of (unit-length) light direction and the normal vector
      // (use max() to discard any negatives from lights below the surface) 
      // (look in GLSL manual: what other functions would help?)
      // gives us the cosine-falloff factor needed for the diffuse lighting term:
  '  float nDotL = max(dot(lightDirection, normal), 0.0); \n' +
      // The Blinn-Phong lighting model computes the specular term faster 
      // because it replaces the (V*R)^shiny weighting with (H*N)^shiny,
      // where 'halfway' vector H has a direction half-way between L and V
      // H = norm(norm(V) + norm(L)).  Note L & V already normalized above.
      // (see http://en.wikipedia.org/wiki/Blinn-Phong_shading_model)
  '  vec3 H = normalize(lightDirection + eyeDirection); \n' +
  '  float nDotH = max(dot(H, normal), 0.0); \n' +
      // (use max() to discard any negatives from lights below the surface)
      // Apply the 'shininess' exponent K_e:
      // Try it two different ways:   The 'new hotness': pow() fcn in GLSL.
      // CAREFUL!  pow() won't accept integer exponents! Convert K_shiny!  
  '  float e64 = pow(nDotH, float(u_MatlSet[0].shiny));\n' +

  // Calculate the final color from diffuse reflection and ambient reflection
//  '  vec3 emissive = u_Ke;' +

  '  if(v_mode == 0) { \n' +
  '  vec3 reflectDir = reflect(-lightDirection, normal);\n' +
  '  nDotH = max(dot(reflectDir, eyeDirection), 0.0);\n' +
  '  e64 = pow(nDotH, float(u_MatlSet[0].shiny)/4.0);\n' +
  '  } \n' +


  '  if(v_distance == 1) { \n' +
  '     e64 = e64/(1.0 + dot(lightDirection, lightDirection));     \n' +
  '  } \n' +

  '  else if(v_distance == 2) {\n' +
  '     e64 = e64/(1.0 + dot(lightDirection, lightDirection) + dot(lightDirection, lightDirection)*dot(lightDirection, lightDirection));     \n' +
  '  } \n' +

  '  vec3 lightDirection2 = normalize(u_LampSet[1].pos - v_Position.xyz);\n' +
      // Find the unit-length eye-direction vector 'V' (surface pt --> camera)
  '  vec3 eyeDirection2 = normalize(u_LampSet[1].pos - v_Position.xyz); \n' +
  
  '  float nDotL2 = max(dot(lightDirection2, normal), 0.0); \n' +
      // The Blinn-Phong lighting model computes the specular term faster 
      // because it replaces the (V*R)^shiny weighting with (H*N)^shiny,
      // where 'halfway' vector H has a direction half-way between L and V
      // H = norm(norm(V) + norm(L)).  Note L & V already normalized above.
      // (see http://en.wikipedia.org/wiki/Blinn-Phong_shading_model)
  '  vec3 H2 = normalize(lightDirection2 + eyeDirection2); \n' +
  '  float nDotH2 = max(dot(H2, normal), 0.0); \n' +
      // (use max() to discard any negatives from lights below the surface)
      // Apply the 'shininess' exponent K_e:
      // Try it two different ways:   The 'new hotness': pow() fcn in GLSL.
      // CAREFUL!  pow() won't accept integer exponents! Convert K_shiny!  
  '  float e642 = pow(nDotH2, float(u_MatlSet[0].shiny));\n' +
  // Calculate the final color from diffuse reflection and ambient reflection
//  '  vec3 emissive = u_Ke;' +

  '  if(v_mode == 0) { \n' +
  '  vec3 reflectDir2 = reflect(-lightDirection2, normal);' +
  '  nDotH2 = max(dot(reflectDir2, eyeDirection2), 0.0);' +
  '  e642 = pow(nDotH2, float(u_MatlSet[0].shiny)/4.0);' +
  '  }\n' +
  
  '  if(v_distance == 1) { \n' +
  '     e642 = e642/(1.0 + dot(lightDirection, lightDirection));     \n' +
  '  } \n' +

  '  else if(v_distance == 2) {\n' +
  '     e642 = e642/(1.0 + dot(lightDirection, lightDirection) + dot(lightDirection, lightDirection)*dot(lightDirection, lightDirection));     \n' +
  '  } \n' +

 
  '  vec3 emissive = u_MatlSet[0].emit;' +
  
  '  vec3 ambient = u_LampSet[0].ambi * u_MatlSet[0].ambi;\n' +
  '  vec3 diffuse = u_LampSet[0].diff * v_Kd * nDotL;\n' +
  '  vec3 speculr = u_LampSet[0].spec * u_MatlSet[0].spec * e64;\n' +
  // '  gl_FragColor = vec4(emissive + ambient + diffuse + speculr , 1.0);\n' +
  
  '  vec3 ambient2 = u_LampSet[1].ambi * u_MatlSet[0].ambi;\n' +
  '  vec3 diffuse2 = u_LampSet[1].diff * v_Kd * nDotL2;\n' +
  '  vec3 speculr2 = u_LampSet[1].spec * u_MatlSet[0].spec * e642;\n' +

  '  if(v_gou == 1) { \n' +
  '   gl_FragColor = 0.5*(v_Color + texture2D(u_Sampler, v_TexCoord)); \n' +
  '} \n' +

  ' else {' +
  '  if(v_onoff1 == 1) { \n' +
          'if(v_onoff2 == 1) {\n' +
            '  gl_FragColor = 0.5*(texture2D(u_Sampler, v_TexCoord)+vec4(emissive + emissive + ambient + diffuse + speculr + ambient2 + diffuse2 + speculr2, 1.0));\n' +
          '} \n' +
          'else \n' +
            '  gl_FragColor = 0.5*(texture2D(u_Sampler, v_TexCoord)+vec4(emissive + ambient + diffuse + speculr, 1.0));\n' +
  '  }\n' +


  '  else { \n' +
          'if(v_onoff2 == 1) {\n' +
            '  gl_FragColor = 0.5*(texture2D(u_Sampler, v_TexCoord) + vec4(emissive + ambient2 + diffuse2 + speculr2, 1.0));\n' +
          '} \n' +
          'else \n' +
            '  gl_FragColor = 0.5*(texture2D(u_Sampler, v_TexCoord)+vec4(0,0,0, 1.0));\n' +
  '  } \n' +
  ' } \n' +
  '}\n';

var ANGLE_STEP=45;
var MOVE_STEP = 2;
var LOOK_STEP = 2;
var PHI_NOW = 0;
var THETA_NOW = 0;

var lamp0 = new LightsT();
var lamp1 = new LightsT();
var floatsPerVertex = 9; 
var ANGLE_STEP = 45.0;
var r=0.8;
var g=0.8;
var b=0.8;
var light_x = 10;
var light_y = 35;
var light_z = 25;

var N = -1;

var uLoc_eyePosWorld  = false;
var uLoc_eyePosWorld2  = false;


var eyePosWorld = new Float32Array(3);  // x,y,z in world coords
var eyePosWorld2 = new Float32Array(3);  // x,y,z in world coords
// Create a JavaScript matrix to specify the view transformation
var myViewMatrix = new Matrix4();
// Create the matrix to specify the camera frustum, 
// and pass it to the u_ProjMatrix uniform in the graphics system
var projMatrix = new Matrix4();
// Register the event handler to be called on key press
// (Note that I eliminated the 'n' argument (no longer needed)).
var normalMatrix = new Matrix4();

  // ... for our first material:
var matlSel= 1;        // see keypress(): 'm' key changes matlSel
var matl0 = new Material(matlSel);  

var am = 0.5;
var di = 1;
var sp = 10;

function main() {
//==============================================================================
  // Retrieve <canvas> element
  var canvas = document.getElementById('webgl');
  canvas.width = innerWidth;    
  canvas.height = innerHeight;
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

  // Set the vertex coordinates and color (the blue triangle is in the front)
  var n = initVertexBuffers(gl);
  if (n < 0) {
    console.log('Failed to specify the vertex information');
    return;
  }

  // Specify the color for clearing <canvas>
  gl.clearColor(0.0, 0.0, 0.0, 1);
// NEW!! Enable 3D depth-test when drawing: don't over-draw at any pixel 
  // unless the new Z value is closer to the eye than the old one..
//  gl.depthFunc(gl.LESS);       // WebGL default setting:
  gl.enable(gl.DEPTH_TEST); 
  // Get the graphics system storage locations of
  // the uniform variables myu_ViewMatrix and u_ProjMatrix.


  // canvas.onmousedown  = function(ev){myMouseDown( ev, gl, canvas) }; 
  
  //           // when user's mouse button goes down call mouseDown() function
  // canvas.onmousemove =  function(ev){myMouseMove( ev, gl, canvas) };
  
  //                     // call mouseMove() function          
  // canvas.onmouseup =    function(ev){myMouseUp(   ev, gl, canvas)};


  window.addEventListener("keydown", myKeyDown, false);
  window.addEventListener("keyup", myKeyUp, false);
  window.addEventListener("keypress", myKeyPress, false);


  // uLoc_eyePosWorld  = gl.getUniformLocation(gl.program, 'u_eyePosWorld');
  // uLoc_eyePosWorld2  = gl.getUniformLocation(gl.program, 'u_eyePosWorld2');
  myu_ViewMatrix = gl.getUniformLocation(gl.program, 'myv_ViewMatrix');
  u_ProjMatrix = gl.getUniformLocation(gl.program, 'v_ProjMatrix');
  u_NormalMatrix = gl.getUniformLocation(gl.program, 'v_NormalMatrix');
  
  u_mode = gl.getUniformLocation(gl.program, 'v_mode');
  u_onoff1 = gl.getUniformLocation(gl.program, 'v_onoff1');
  u_onoff2 = gl.getUniformLocation(gl.program, 'v_onoff2');
  u_gou = gl.getUniformLocation(gl.program, 'v_gou');
  u_distance = gl.getUniformLocation(gl.program, 'v_distance');
  

  
  mode = 1;
  onoff1 = 1;
  onoff2 = 1;
  gou = 0;
  distance = 0;

  if (!myu_ViewMatrix || !u_ProjMatrix || !u_NormalMatrix) {
    console.log('Failed to get GPUs matrix storage locations');
    return;
    }
  //  ... for Phong light source:
  // NEW!  Note we're getting the location of a GLSL struct array member:

  lamp0.u_pos  = gl.getUniformLocation(gl.program, 'u_LampSet[0].pos'); 
  lamp0.u_ambi = gl.getUniformLocation(gl.program, 'u_LampSet[0].ambi');
  lamp0.u_diff = gl.getUniformLocation(gl.program, 'u_LampSet[0].diff');
  lamp0.u_spec = gl.getUniformLocation(gl.program, 'u_LampSet[0].spec');
  if( !lamp0.u_pos || !lamp0.u_ambi || !lamp0.u_diff || !lamp0.u_spec ) {
    console.log('Failed to get GPUs Lamp0 storage locations');
    return;
  }

  lamp1.u_pos  = gl.getUniformLocation(gl.program, 'u_LampSet[1].pos'); 
  lamp1.u_ambi = gl.getUniformLocation(gl.program, 'u_LampSet[1].ambi');
  lamp1.u_diff = gl.getUniformLocation(gl.program, 'u_LampSet[1].diff');
  lamp1.u_spec = gl.getUniformLocation(gl.program, 'u_LampSet[1].spec');
  if( !lamp1.u_pos || !lamp1.u_ambi || !lamp1.u_diff || !lamp1.u_spec ) {
    console.log('Failed to get GPUs Lamp0 storage locations');
    return;
  }

  
  uLoc_Ke = gl.getUniformLocation(gl.program, 'u_MatlSet[0].emit');
  uLoc_Ka = gl.getUniformLocation(gl.program, 'u_MatlSet[0].ambi');
  uLoc_Kd = gl.getUniformLocation(gl.program, 'u_MatlSet[0].diff');
  uLoc_Ks = gl.getUniformLocation(gl.program, 'u_MatlSet[0].spec');
  uLoc_Kshiny = gl.getUniformLocation(gl.program, 'u_MatlSet[0].shiny');
  
  if(!uLoc_Ke || !uLoc_Ka || !uLoc_Kd // || !uLoc_Kd2
              || !uLoc_Ks || !uLoc_Kshiny
     ) {
    console.log('Failed to get GPUs Reflectance storage locations');
    return;
  }
  // Position the camera in world coordinates:


  // (Note: uniform4fv() expects 4-element float32Array as its 2nd argument)

  
  // Init World-coord. position & colors of first light source in global vars;
  lamp0.I_ambi.elements.set([0.5, 0.5, 0.5]);
  lamp0.I_diff.elements.set([1.0, 1.0, 1.0]);
  lamp0.I_spec.elements.set([10.0, 10.0, 10.0]);


  

  if (!myu_ViewMatrix || !u_ProjMatrix) { 
    console.log('Failed to get myu_ViewMatrix or u_ProjMatrix');
    return;
  }
    
  var currentAngle = 0;
  var tick = function() {
    
    lamp1.I_ambi.elements.set([r*am, g*am, b*am]);
    lamp1.I_diff.elements.set([r*di, g*di, b*di]);
    lamp1.I_spec.elements.set([r*sp, g*sp, b*sp]);

    currentAngle = animate(currentAngle);
    canvas.width = innerWidth;    
    canvas.height = innerHeight;
    initVertexBuffers(gl);
    draw(gl, currentAngle, canvas);   // Draw the triangles

    lamp0.I_pos.elements.set([g_EyeX, g_EyeY, g_EyeZ]);
    lamp1.I_pos.elements.set([light_x, light_y, light_z]);

    requestAnimationFrame(tick, canvas);   
                      // Request that the browser re-draw the webpage
  };
  tick();             

}

function makeGroundGrid() {
//==============================================================================
// Create a list of vertices that create a large grid of lines in the x,y plane
// centered at x=y=z=0.  Draw this shape using the GL_LINES primitive.

  var xcount = 100;     // # of lines to draw in x,y to make the grid.
  var ycount = 100;   
  var xymax = 100.0;     // grid size; extends to cover +/-xymax in x and y.
  var xColr = new Float32Array([r, g, 0]);  // bright yellow
  var yColr = new Float32Array([0, 0, b]);  // bright green.
  
  // Create an (global) array to hold this ground-plane's vertices:
  gndVerts = new Float32Array(floatsPerVertex*2*(xcount+ycount));
            // draw a grid made of xcount+ycount lines; 2 vertices per line.
            
  var xgap = xymax/(xcount-1);    // HALF-spacing between lines in x,y;
  var ygap = xymax/(ycount-1);    // (why half? because v==(0line number/2))
  
  // First, step thru x values as we make vertical lines of constant-x:
  for(v=0, j=0; v<2*(xcount+ycount); v++, j+= floatsPerVertex) {
    if(v%4==0) {  // put even-numbered vertices at (xnow, -xymax, 0)
      gndVerts[j  ] = -xymax + (v  )*xgap;  // x
      gndVerts[j+1] = -xymax;               // y
      gndVerts[j+2] = 0.0;                  // z
    }
    else if(v%4==1) {    // put even-numbered vertices at (-xymax, ynow, 0)
      gndVerts[j  ] = -xymax;               // x
      gndVerts[j+1] = -xymax + (v  )*ygap;  // y
      gndVerts[j+2] = 0.0;                  // z
    }
    else if(v%4 == 2){        // put odd-numbered vertices at (xnow, +xymax, 0).
      gndVerts[j  ] = -xymax + (v-1)*xgap;  // x
      gndVerts[j+1] = xymax;                // y
      gndVerts[j+2] = 0.0;                  // z
    }

    else if (v%4 == 3){          // put odd-numbered vertices at (+xymax, ynow, 0).
      gndVerts[j  ] = xymax;                // x
      gndVerts[j+1] = -xymax + (v-1)*ygap;  // y
      gndVerts[j+2] = 0.0;                  // z
    }

    gndVerts[j+3] = xColr[0];     // red
    gndVerts[j+4] = xColr[1];     // grn
    gndVerts[j+5] = xColr[2];     // blu

    gndVerts[j+6] = 0;     // red
    gndVerts[j+7] = 0;     // grn
    gndVerts[j+8] = 1;     // blu
  }
  // Second, step thru y values as wqe make horizontal lines of constant-y:
  // (don't re-initialize j--we're adding more vertices to the arr
}

function makeSphere() {
//==============================================================================
// Make a sphere from one OpenGL TRIANGLE_STRIP primitive.   Make ring-like 
// equal-lattitude 'slices' of the sphere (bounded by planes of constant z), 
// and connect them as a 'stepped spiral' design (see makeCylinder) to build the
// sphere from one triangle strip.
  var slices = 13;    // # of slices of the sphere along the z axis. >=3 req'd
                      // (choose odd # or prime# to avoid accidental symmetry)
  var sliceVerts  = 27; // # of vertices around the top edge of the slice
                      // (same number of vertices on bottom of slice, too)
  var topColr = new Float32Array([0.7, 0.7, 0.7]);  // North Pole: light gray
  var equColr = new Float32Array([0.3, 0.7, 0.3]);  // Equator:    bright green
  var botColr = new Float32Array([0.9, 0.9, 0.9]);  // South Pole: brightest gray.
  var sliceAngle = Math.PI/slices;  // lattitude angle spanned by one slice.

  // Create a (global) array to hold this sphere's vertices:
  sphVerts = new Float32Array(  ((slices * 2* sliceVerts) -2) * floatsPerVertex);
                    // # of vertices * # of elements needed to store them. 
                    // each slice requires 2*sliceVerts vertices except 1st and
                    // last ones, which require only 2*sliceVerts-1.
                    
  // Create dome-shaped top slice of sphere at z=+1
  // s counts slices; v counts vertices; 
  // j counts array elements (vertices * elements per vertex)
  var cos0 = 0.0;         // sines,cosines of slice's top, bottom edge.
  var sin0 = 0.0;
  var cos1 = 0.0;
  var sin1 = 0.0; 
  var j = 0;              // initialize our array index
  var isLast = 0;
  var isFirst = 1;
  for(s=0; s<slices; s++) { // for each slice of the sphere,
    // find sines & cosines for top and bottom of this slice
    if(s==0) {
      isFirst = 1;  // skip 1st vertex of 1st slice.
      cos0 = 1.0;   // initialize: start at north pole.
      sin0 = 0.0;
    }
    else {          // otherwise, new top edge == old bottom edge
      isFirst = 0;  
      cos0 = cos1;
      sin0 = sin1;
    }               // & compute sine,cosine for new bottom edge.
    cos1 = Math.cos((s+1)*sliceAngle);
    sin1 = Math.sin((s+1)*sliceAngle);
    // go around the entire slice, generating TRIANGLE_STRIP verts
    // (Note we don't initialize j; grows with each new attrib,vertex, and slice)
    if(s==slices-1) isLast=1; // skip last vertex of last slice.
    for(v=isFirst; v< 2*sliceVerts-isLast; v++, j+=floatsPerVertex) { 
      if(v%2==0)
      {       // put even# vertices at the the slice's top edge
              // (why PI and not 2*PI? because 0 <= v < 2*sliceVerts
              // and thus we can simplify cos(2*PI(v/2*sliceVerts))  
        sphVerts[j  ] = sin0 * Math.cos(Math.PI*(v)/sliceVerts);  
        sphVerts[j+1] = sin0 * Math.sin(Math.PI*(v)/sliceVerts);  
        sphVerts[j+2] = cos0;   
  
      }
      else {  // put odd# vertices around the slice's lower edge;
              // x,y,z,w == cos(theta),sin(theta), 1.0, 1.0
              //          theta = 2*PI*((v-1)/2)/capVerts = PI*(v-1)/capVerts
        sphVerts[j  ] = sin1 * Math.cos(Math.PI*(v-1)/sliceVerts);    // x
        sphVerts[j+1] = sin1 * Math.sin(Math.PI*(v-1)/sliceVerts);    // y
        sphVerts[j+2] = cos1;                                       // z
                                      // w.   
      }
      if(s==0) {  // finally, set some interesting colors for vertices:
        sphVerts[j+3]=topColr[0]; 
        sphVerts[j+4]=topColr[1]; 
        sphVerts[j+5]=topColr[2]; 
        }
      else if(s==slices-1) {
        sphVerts[j+3]=botColr[0]; 
        sphVerts[j+4]=botColr[1]; 
        sphVerts[j+5]=botColr[2]; 
      }
      else {
          sphVerts[j+3]=Math.random();// equColr[0]; 
          sphVerts[j+4]=Math.random();// equColr[1]; 
          sphVerts[j+5]=Math.random();// equColr[2];          
      }
        sphVerts[j+6]=sphVerts[j]; 
        sphVerts[j+7]=sphVerts[j+1]; 
        sphVerts[j+8]=sphVerts[j+2];
    }
  }
}
function makeCube() {
  cubVerts = new Float32Array([
      // Former
     0,0.1,0.1,    0,0.4,0,    0,0,1,// Node 3
     0,-0.1,0.1,   0.5, 0.0, 0.0,   0,0,1,// Node 0
     -2,-0.1,0.1,   0.1,0.6,1.0,  0,0,1,//Node 6

     -2,-0.1,0.1,   0.1,0.6,1.0, 0,0,1,//Node6
     -2,0.1,0.1,    0,0.8,0.8, 0,0,1,//Node 5
     0,0.1,0.1,     0,0.4,0, 0,0,1,//Node 3
    
    // Left
     -2,0.1,-0.1,   0.2,0.5,0.3, -1,0,0,//Node 4
     -2,0.1,0.1,    0,0.8,0.8,  -1,0,0,//Node 5
     -2,-0.1,0.1,   0.1,0.6,1.0,  -1,0,0,//Node6

     -2,-0.1,0.1,   0.1,0.6,1.0,  -1,0,0,//Node6
     -2,-0.1,-0.1,  0.5,0.2,0.9,    -1,0,0,//Node7
     -2,0.1,-0.1,   0.2,0.5,0.3,  -1,0,0,//Node 4

      // Back 
     0,-0.1,-0.1,   0.9,0.6,0.5,  0,0,-1,//Node 1
     0,0.1,-0.1,    0.7,0.7,0.4,  0,0,-1,//Node 2
     -2,0.1,-0.1,   0.2,0.5,0.3,  0,0,-1,//Node 4

     -2,0.1,-0.1,   0.2,0.5,0.3,  0,0,-1,//Node 4
     -2,-0.1,-0.1,  0.5,0.2,0.9,    0,0,-1,//Node7
     0,-0.1,-0.1,   0.9,0.6,0.5,  0,0,-1,//Node 1

     //Right
     0,-0.1,0.1,    0.5, 0.0, 0.0,  1,0,0,//Node 0
    0,0.1,0.1,      0,0.4,0,  1,0,0,//Node 3
     0,0.1,-0.1,    0.7,0.7,0.4, 1,0,0,//Node 2

     0,0.1,-0.1,    0.7,0.7,0.4,  1,0,0,//Node 2
     0,-0.1,-0.1,   0.9,0.6,0.5, 1,0,0, //Node 1
     0,-0.1,0.1,    0.5, 0.0, 0.0,  1,0,0,//Node 0

    //Top
     0,0.1,-0.1,    0.7,0.7,0.4,  0,1,0,//Node 2
     0,0.1,0.1,     0,0.4,0,  0,1,0,//Node 3
     -2,0.1,0.1,    0,0.8,0.8,  0,1,0,//Node 5

     -2,0.1,0.1,    0,0.8,0.8,  0,1,0,//Node 5
     -2,0.1,-0.1,   0.2,0.5,0.3,  0,1,0,//Node 4
     0,0.1,-0.1,    0.7,0.7,0.4,  0,1,0,//Node 2

     //Bottom
     0,-0.1,0.1,    0.5, 0.0, 0.0,  0,-1,0,//Node 0
     0,-0.1,-0.1,   0.9,0.6,0.5, 0,-1,0, //Node 1
     -2,-0.1,-0.1,  0.5,0.2,0.9,  0,-1,0, //Node7

     -2,-0.1,-0.1,  0.5,0.2,0.9,  0,-1,0,  //Node7
     -2,-0.1,0.1,   0.1,0.6,1.0, 0,-1,0, //Node6
     0,-0.1,0.1,    0.5, 0.0, 0.0, 0,-1,0, //Node 0
    ]);
}
function initVertexBuffers(gl) {
//==============================================================================

  // make our 'forest' of triangular-shaped trees:
  var a = Math.sqrt(0.5);
  var a1=a/2;
  // make our 'forest' of triangular-shaped trees:
  forestVerts = new Float32Array([

     // 3 Vertex coordinates (x,y,z) and 3 colors (r,g,b)
     0.0,  0.5,  -0.4,   0.4,  1.0,  0.4,  0,0,1,   // The back green one
    -0.5, -0.5,  -0.4,   0.4,  1.0,  0.4,  0,0,1,
     0.5, -0.5,  -0.4,   1.0,  0.4,  0.4,  0,0,1,
   
     0.5,  0.4,  -0.2,  1.0,  0.4,  0.4,  0,0,1  ,  // The middle yellow one
    -0.5,  0.4,  -0.2,  1.0,  1.0,  0.4,  0,0,1,
     0.0, -0.6,  -0.2,  1.0,  1.0,  0.4,  0,0,1,

     0.0,  0.5,   0.0,  0.4,  0.4,  1.0,   0,0,1,     // The front blue one 
    -0.5, -0.5,   0.0,  0.4,  0.4,  1.0,   0,0,1,
     0.5, -0.5,   0.0,  1.0,  0.4,  0.4,   0,0,1,


  ]);
  
  // Make our 'ground plane'; can you make a'torus' shape too?
  // (recall the 'basic shapes' starter code...)
  makeGroundGrid();
  makeSphere();
  makeCube();

  // How much space to store all the shapes in one array?
  // (no 'var' means this is a global variable)
  mySiz = forestVerts.length + gndVerts.length + sphVerts.length+ cubVerts.length;

  // How many vertices total?
  var nn = mySiz / floatsPerVertex;
  console.log('nn is', nn, 'mySiz is', mySiz, 'floatsPerVertex is', floatsPerVertex);

  // Copy all shapes into one big Float32 array:
  var verticesColors = new Float32Array(mySiz);
  // Copy them:  remember where to start for each shape:
  forestStart = 0;              // we store the forest first.
  for(i=0,j=0; j< forestVerts.length; i++,j++) {
    verticesColors[i] = forestVerts[j];
    } 
  gndStart = i;           // next we'll store the ground-plane;
  for(j=0; j< gndVerts.length; i++, j++) {
    verticesColors[i] = gndVerts[j];
    }

  spherestart = i;           // next we'll store the ground-plane;
  for(j=0; j< sphVerts.length; i++, j++) {
    verticesColors[i] = sphVerts[j];
    }

  cubStart=i;
  for(j=0; j< cubVerts.length; i++, j++) {
    verticesColors[i] = cubVerts[j];
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
  gl.vertexAttribPointer(a_Position, 3, gl.FLOAT, false, FSIZE * 9, 0);
  gl.enableVertexAttribArray(a_Position);
  
  var aLoc_TexCoord = gl.getAttribLocation(gl.program, 'a_TexCoord');
  if(aLoc_TexCoord < 0) {
    console.log('Failed to get storage location of shader var: a_TexCoord\n');
    return -1;
  }

  gl.vertexAttribPointer(
      aLoc_TexCoord,  // Location of Vertex Shader attribute to fill with data
      2,              // How many values? 1,2,3 or 4. (we're using s,t coords)
      gl.FLOAT,       // data type for each value: usually gl.FLOAT
      false,          // did we supply fixed-point data + it needs normalizing?
      FSIZE * 9,      // Stride -- how many bytes used to store each vertex?
                      // (x,y,z,w  r,g,b,  s,t) * bytes/value
      0);     // Offset -- how many bytes from START of buffer to the

  gl.enableVertexAttribArray(aLoc_TexCoord);
  
  // Assign the buffer object to a_Normal and enable the assignment
  var a_Normal = gl.getAttribLocation(gl.program, 'a_Normal');
  if(a_Normal < 0) {
    console.log('Failed to get the storage location of a_Normal');
    return -1;
  }
  gl.vertexAttribPointer(a_Normal, 3, gl.FLOAT, false, FSIZE * 9, FSIZE * 6);
  gl.enableVertexAttribArray(a_Normal);


  return mySiz/floatsPerVertex; // return # of vertices
}
// Global vars for Eye position. 
// NOTE!  I moved eyepoint BACKWARDS from the forest: from g_EyeZ=0.25
// a distance far enough away to see the whole 'forest' of trees within the
// 30-degree field-of-view of our 'perspective' camera.  I ALSO increased
// the 'keydown()' function's effect on g_EyeX position.

var g_EyeX = 0, g_EyeY = 20, g_EyeZ = 10; 
var g_LookAtX = 0.0, g_LookAtY = -3.0, g_LookAtZ = 1.0;
var g_AtX= 0.0, g_AtY=0.0,  g_AtZ=0.0;
function myKeyDown(ev, gl) {
//===============================================================================

var dx = g_LookAtX-g_EyeX;
var dy = g_LookAtY-g_EyeY;
var dz = g_LookAtZ-g_EyeZ;
var ax = Math.sqrt(dx*dx+dy*dy);
var a = Math.sqrt(dx*dx+dy*dy+dz*dz);
if(ev.keyCode == 39) {
      g_EyeX = g_EyeX+0.1*dy/ax;
      g_EyeY = g_EyeY-0.1*dx/ax;
      g_LookAtX += 0.1*dy/ax;
      g_LookAtY -= 0.1*dx/ax;
      
    } 
  else if (ev.keyCode == 37) { 
      g_EyeX = g_EyeX-0.1*dy/ax;
      g_EyeY = g_EyeY+0.1*dx/ax;
      g_LookAtX -= 0.1*dy/ax;
      g_LookAtY += 0.1*dx/ax;
      
    } 
  else if (ev.keyCode == 38) { 
      g_LookAtX = g_LookAtX+0.1*(dx/a);
      g_LookAtY = g_LookAtY+0.1*(dy/a);
      g_LookAtZ = g_LookAtZ+0.1*(dz/a);
      g_EyeX = g_EyeX+0.1*(dx/a);
      g_EyeY = g_EyeY+0.1*(dy/a);
      g_EyeZ = g_EyeZ+0.1*(dz/a);
      
    } 
    else if (ev.keyCode == 40) { 
      g_LookAtX = g_LookAtX-0.1*(dx/a);
      g_LookAtY = g_LookAtY-0.1*(dy/a);
      g_LookAtZ = g_LookAtZ-0.1*(dz/a); 
      g_EyeX = g_EyeX-0.1*(dx/a);
      g_EyeY = g_EyeY-0.1*(dy/a);
      g_EyeZ = g_EyeZ-0.1*(dz/a);
      
    } 
    else if(ev.keyCode==87){
        g_LookAtZ = g_LookAtZ+LOOK_STEP;
        
      }
    else if(ev.keyCode==83){ 
        g_LookAtZ = g_LookAtZ-LOOK_STEP;
        
      }
    else if(ev.keyCode == 49){    
      if(onoff1 == 1) {
        //.uniform1i(u_onoff1, 1);
        onoff1 = 0;
      }
      else{
        //gl.uniform1i(u_onoff1, 0);
        onoff1  = 1;
      } 
    }
    else if(ev.keyCode==50){
      if(onoff2 == 1){
        //gl.uniform1i(u_onoff2, 1);
        onoff2 = 0;
      }
      else {
        //gl.uniform1i(u_onoff2, 0);
        onoff2 = 1;
      }
    }
    else if(ev.keyCode==73){
      light_x = light_x-10;
      console.log("light_x: ", light_x);
    }
    else if(ev.keyCode==74){
      light_x = light_x+10;
      console.log("light_x: ", light_x);
    }
    else if(ev.keyCode==75){
      light_y = light_y-10;
    }
    else if(ev.keyCode==76){
      light_y = light_y+10;
    }
    else if(ev.keyCode==79){
      light_z = light_z-10;
    }
    else if(ev.keyCode==85){
      light_z = light_z+10;
    }
    
    else if(ev.keyCode==82){
      g=g+0.12;
    }
    else if(ev.keyCode==70){
      g=g-0.12;
    }
    else if(ev.keyCode==71){
      r=r+0.12;
    }
    else if(ev.keyCode==84){
      r=r-0.12;
    }
    else if(ev.keyCode==89){
      b=b-0.12;
    }
    else if(ev.keyCode==72){
      b=b+0.12;
    }


    else if(ev.keyCode==67){//C
      am=am+0.2
    }
    else if(ev.keyCode==86){
      am=am-0.2
    }
    else if(ev.keyCode==66){
      di=di+0.2
    }
    else if(ev.keyCode==78){
      di=di-0.2
    }
    else if(ev.keyCode==77){
      sp=sp+0.2
    }
    else if(ev.keyCode==88){
      sp=sp+0.2
    }


    else if(ev.keyCode==32){
      if(mode==0){
        mode=1;
      }
      else{
        mode=0;
      }
    }
    else if(ev.keyCode==90){
      if(gou==1){
        gou=0;
      }
      else{
        gou=1;    
      }
    }



    else { return; } // Prevent the unnecessary drawing

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



var g_last = Date.now();
function animate(angle) {
//==============================================================================
  // Calculate the elapsed time
  var now = Date.now();
  var elapsed = now - g_last;
  g_last = now;
  
  // Update the current rotation angle (adjusted by the elapsed time)
  //  limit the angle to move smoothly between +20 and -85 degrees:
// if(angle >  0.0 && ANGLE_STEP > 0) ANGLE_STEP = -ANGLE_STEP;
// if(angle < -180.0 && ANGLE_STEP < 0) ANGLE_STEP = -ANGLE_STEP;
  
var newAngle = angle + (ANGLE_STEP * elapsed) / 1000.0;
return newAngle %= 360;
}

function draw(gl, currentAngle, canvas) {
//==============================================================================
  
  // Clear <canvas> color AND DEPTH buffer
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  gl.uniform3fv(lamp0.u_pos,  lamp0.I_pos.elements.slice(0,3));
  //     ('slice(0,3) member func returns elements 0,1,2 (x,y,z) ) 
  gl.uniform3fv(lamp0.u_ambi, lamp0.I_ambi.elements);   // ambient
  gl.uniform3fv(lamp0.u_diff, lamp0.I_diff.elements);   // diffuse
  gl.uniform3fv(lamp0.u_spec, lamp0.I_spec.elements);   // Specular


  gl.uniform3fv(lamp1.u_pos,  lamp1.I_pos.elements.slice(0,3));
  //     ('slice(0,3) member func returns elements 0,1,2 (x,y,z) ) 
  gl.uniform3fv(lamp1.u_ambi, lamp1.I_ambi.elements);   // ambient
  gl.uniform3fv(lamp1.u_diff, lamp1.I_diff.elements);   // diffuse
  gl.uniform3fv(lamp1.u_spec, lamp1.I_spec.elements);   // Specular

  // YOU TRY IT: make an equivalent camera using matrix-cuon-mod.js
  // perspective-camera matrix made by 'frustum()' function..
  
  // Send this matrix to our Vertex and Fragment shaders through the
  // 'uniform' variable u_ProjMatrix:
  
     // Draw in the SECOND of several 'viewports'
  //------------------------------------------
  gl.viewport(0,        // Viewport lower-left corner
              0,                              // location(in pixels)
              innerWidth,        // viewport width, height.
              innerHeight);

  // but use a different 'view' matrix:

  gl.uniform1i(u_mode, mode);
  gl.uniform1i(u_onoff1, onoff1);
  gl.uniform1i(u_onoff2, onoff2);
  gl.uniform1i(u_gou, gou);
  gl.uniform1i(u_distance, distance);

  // Draw the scene:
  drawMyScene(gl, currentAngle);

}

function Setup(gl) {
projMatrix.setPerspective(40, innerWidth/innerHeight, 1, 100);
projMatrix.lookAt(g_EyeX, g_EyeY, g_EyeZ, // eye position
                      g_LookAtX, g_LookAtY, g_LookAtZ,                  // look-at point 
                      0, 0, 1);                 // up vector

  projMatrix.multiply(myViewMatrix);

  normalMatrix.setInverseOf(myViewMatrix);
  normalMatrix.transpose();
  gl.uniformMatrix4fv(myu_ViewMatrix, false, myViewMatrix.elements);
  gl.uniformMatrix4fv(u_ProjMatrix, false, projMatrix.elements);
  gl.uniformMatrix4fv(u_NormalMatrix, false, normalMatrix.elements);

}

function drawMyScene(myGL, currentAngle) {
//===============================================================================


  var Zangle;

  if(currentAngle/6 < 30.0 )  Zangle = currentAngle/6;
  if(currentAngle/6 > 30.0 ) Zangle = 60.0-currentAngle/6;

  var Xangle;

  if(currentAngle/6 < 50.0 )  Xangle = currentAngle/6;
  if(currentAngle/6 > 50.0 ) Xangle = 50.0-currentAngle/6;
  myViewMatrix.setTranslate(0,0,0); 
  pushMatrix(myViewMatrix);

  matlSel = 14;
  matl0 = new Material(matlSel);  
  myGL.uniform3fv(uLoc_Ke, matl0.K_emit.slice(0,3));        // Ke emissive
  myGL.uniform3fv(uLoc_Ka, matl0.K_ambi.slice(0,3));        // Ka ambient
  myGL.uniform3fv(uLoc_Kd, matl0.K_diff.slice(0,3));        // Kd diffuse
  myGL.uniform3fv(uLoc_Ks, matl0.K_spec.slice(0,3));        // Ks specular
  myGL.uniform1i(uLoc_Kshiny, parseInt(matl0.K_shiny, 10));     // Kshiny 

  Setup(myGL);

  myGL.drawArrays(myGL.TRIANGLES,              // use this drawing primitive, and
               gndStart/floatsPerVertex, // start at this vertex number, and
               gndVerts.length/floatsPerVertex);   // draw this many vertices

  myViewMatrix = popMatrix();
  pushMatrix(myViewMatrix);

  matlSel = 1;
  matl0 = new Material(matlSel);  
  myGL.uniform3fv(uLoc_Ke, matl0.K_emit.slice(0,3));        // Ke emissive
  myGL.uniform3fv(uLoc_Ka, matl0.K_ambi.slice(0,3));        // Ka ambient
  myGL.uniform3fv(uLoc_Kd, matl0.K_diff.slice(0,3));        // Kd diffuse
  myGL.uniform3fv(uLoc_Ks, matl0.K_spec.slice(0,3));        // Ks specular
  myGL.uniform1i(uLoc_Kshiny, parseInt(matl0.K_shiny, 10));     // Kshiny 


  myViewMatrix.translate(0,2.5,3);  
  myViewMatrix.scale(1,1,1);
  //myViewMatrix.rotate(180, 0, 0, 1);
  myViewMatrix.rotate(Zangle*1, 0, 1, 1);   
  //myViewMatrix.rotate(currentAngle, 0, 0, 1); 
  Setup(myGL);

  myGL.drawArrays(myGL.TRIANGLE_STRIP,               // use this drawing primitive, and
                spherestart/floatsPerVertex, // start at this vertex number, and
                sphVerts.length/floatsPerVertex);


  // matlSel = 1;
  // matl0 = new Material(matlSel);  
  // myGL.uniform3fv(uLoc_Ke, matl0.K_emit.slice(1,3));        // Ke emissive
  // myGL.uniform3fv(uLoc_Ka, matl0.K_ambi.slice(1,3));        // Ka ambient
  // myGL.uniform3fv(uLoc_Kd, matl0.K_diff.slice(1,3));        // Kd diffuse
  // myGL.uniform3fv(uLoc_Ks, matl0.K_spec.slice(0,3));        // Ks specular
  // myGL.uniform1i(uLoc_Kshiny, parseInt(matl0.K_shiny, 10));     // Kshiny 

  myViewMatrix.translate(0,2.5,0);  
  myViewMatrix.scale(1,1,1);
  //myViewMatrix.rotate(180, 0, 0, 1);
  myViewMatrix.rotate(Zangle*1.2, 1, 0, 1); 
  Setup(myGL);
  myGL.drawArrays(myGL.TRIANGLE_STRIP,               // use this drawing primitive, and
                spherestart/floatsPerVertex, // start at this vertex number, and
                sphVerts.length/floatsPerVertex);

  // matlSel = 10;
  // matl0 = new Material(matlSel);  
  // myGL.uniform3fv(uLoc_Ke, matl0.K_emit.slice(1,3));        // Ke emissive
  // myGL.uniform3fv(uLoc_Ka, matl0.K_ambi.slice(1,3));        // Ka ambient
  // myGL.uniform3fv(uLoc_Kd, matl0.K_diff.slice(1,3));        // Kd diffuse
  // myGL.uniform3fv(uLoc_Ks, matl0.K_spec.slice(0,3));        // Ks specular
  // myGL.uniform1i(uLoc_Kshiny, parseInt(matl0.K_shiny, 10));     // Kshiny 

  myViewMatrix.translate(0,2.5,0);  
  myViewMatrix.scale(1,1,1);
  //myViewMatrix.rotate(180, 0, 0, 1);
  myViewMatrix.rotate(Zangle*1.5, 1, 0, 1);  
  Setup(myGL);
  myGL.drawArrays(myGL.TRIANGLE_STRIP,               // use this drawing primitive, and
                spherestart/floatsPerVertex, // start at this vertex number, and
                sphVerts.length/floatsPerVertex);

  matlSel = 2;
  matl0 = new Material(matlSel);  
  myGL.uniform3fv(uLoc_Ke, matl0.K_emit.slice(0,3));        // Ke emissive
  myGL.uniform3fv(uLoc_Ka, matl0.K_ambi.slice(0,3));        // Ka ambient
  myGL.uniform3fv(uLoc_Kd, matl0.K_diff.slice(0,3));        // Kd diffuse
  myGL.uniform3fv(uLoc_Ks, matl0.K_spec.slice(0,3));        // Ks specular
  myGL.uniform1i(uLoc_Kshiny, parseInt(matl0.K_shiny, 10));     // Kshiny 

  myViewMatrix.translate(0,2.5,0);  
  myViewMatrix.scale(1,1,1);
  //myViewMatrix.rotate(180, 0, 0, 1);
  myViewMatrix.rotate(Zangle*2, 1, 0, 1);  
  Setup(myGL);
  myGL.drawArrays(myGL.TRIANGLE_STRIP,               // use this drawing primitive, and
                spherestart/floatsPerVertex, // start at this vertex number, and
                sphVerts.length/floatsPerVertex);

  // matlSel = 10;
  // matl0 = new Material(matlSel);  
  // myGL.uniform3fv(uLoc_Ke, matl0.K_emit.slice(1,3));        // Ke emissive
  // myGL.uniform3fv(uLoc_Ka, matl0.K_ambi.slice(1,3));        // Ka ambient
  // myGL.uniform3fv(uLoc_Kd, matl0.K_diff.slice(1,3));        // Kd diffuse
  // myGL.uniform3fv(uLoc_Ks, matl0.K_spec.slice(0,3));        // Ks specular
  // myGL.uniform1i(uLoc_Kshiny, parseInt(matl0.K_shiny, 10));     // Kshiny 

  myViewMatrix.translate(0,2.5,0);  
  myViewMatrix.scale(1,1,1);
  //myViewMatrix.rotate(180, 0, 0, 1);
  myViewMatrix.rotate(Zangle*2.5, 1, 0, 1);  
  Setup(myGL);
  myGL.drawArrays(myGL.TRIANGLE_STRIP,               // use this drawing primitive, and
                spherestart/floatsPerVertex, // start at this vertex number, and
                sphVerts.length/floatsPerVertex);


  myViewMatrix = popMatrix();
  pushMatrix(myViewMatrix);

  matlSel = 15;
  matl0 = new Material(matlSel);  
  myGL.uniform3fv(uLoc_Ke, matl0.K_emit.slice(0,3));        // Ke emissive
  myGL.uniform3fv(uLoc_Ka, matl0.K_ambi.slice(0,3));        // Ka ambient
  myGL.uniform3fv(uLoc_Kd, matl0.K_diff.slice(0,3));        // Kd diffuse
  myGL.uniform3fv(uLoc_Ks, matl0.K_spec.slice(0,3));        // Ks specular
  myGL.uniform1i(uLoc_Kshiny, parseInt(matl0.K_shiny, 10));     // Kshiny 

  myViewMatrix.translate(5,2,4);  
  myViewMatrix.scale(2,2,2);
  //myViewMatrix.rotate(180, 0, 0, 1);
  myViewMatrix.rotate(Zangle*0.8, 0, 0, 1);   
  //myViewMatrix.rotate(currentAngle, 0, 0, 1); 
  Setup(myGL);
  myGL.drawArrays(myGL.TRIANGLE_STRIP,               // use this drawing primitive, and
                spherestart/floatsPerVertex, // start at this vertex number, and
                sphVerts.length/floatsPerVertex);


  pushMatrix(myViewMatrix);
  // matlSel = 9;
  // matl0 = new Material(matlSel);  
  // myGL.uniform3fv(uLoc_Ke, matl0.K_emit.slice(1,3));        // Ke emissive
  // myGL.uniform3fv(uLoc_Ka, matl0.K_ambi.slice(1,3));        // Ka ambient
  // myGL.uniform3fv(uLoc_Kd, matl0.K_diff.slice(1,3));        // Kd diffuse
  // myGL.uniform3fv(uLoc_Ks, matl0.K_spec.slice(0,3));        // Ks specular
  // myGL.uniform1i(uLoc_Kshiny, parseInt(matl0.K_shiny, 10));     // Kshiny 

  myViewMatrix.translate(-1,0,-1);  
  myViewMatrix.scale(0.5,0.5,0.5);
  //myViewMatrix.rotate(180, 0, 0, 1);
  myViewMatrix.rotate(Zangle*0.8, 0, 0, 1);   
  //myViewMatrix.rotate(currentAngle, 0, 0, 1); 
  Setup(myGL);
  myGL.drawArrays(myGL.TRIANGLE_STRIP,               // use this drawing primitive, and
                spherestart/floatsPerVertex, // start at this vertex number, and
                sphVerts.length/floatsPerVertex);


  myViewMatrix = popMatrix();
  pushMatrix(myViewMatrix);

  // matlSel = 9;
  // matl0 = new Material(matlSel);  
  // myGL.uniform3fv(uLoc_Ke, matl0.K_emit.slice(1,3));        // Ke emissive
  // myGL.uniform3fv(uLoc_Ka, matl0.K_ambi.slice(1,3));        // Ka ambient
  // myGL.uniform3fv(uLoc_Kd, matl0.K_diff.slice(1,3));        // Kd diffuse
  // myGL.uniform3fv(uLoc_Ks, matl0.K_spec.slice(0,3));        // Ks specular
  // myGL.uniform1i(uLoc_Kshiny, parseInt(matl0.K_shiny, 10));     // Kshiny 

  myViewMatrix.translate(1,0,-1);  
  myViewMatrix.scale(0.5,0.5,0.5);
  //myViewMatrix.rotate(180, 0, 0, 1);
  myViewMatrix.rotate(Zangle*0.8, 0, 0, 1);   
  //myViewMatrix.rotate(currentAngle, 0, 0, 1); 
  Setup(myGL);
  myGL.drawArrays(myGL.TRIANGLE_STRIP,               // use this drawing primitive, and
                spherestart/floatsPerVertex, // start at this vertex number, and
                sphVerts.length/floatsPerVertex);

  myViewMatrix = popMatrix();
  pushMatrix(myViewMatrix);

  // matlSel = 9;
  // matl0 = new Material(matlSel);  
  // myGL.uniform3fv(uLoc_Ke, matl0.K_emit.slice(1,3));        // Ke emissive
  // myGL.uniform3fv(uLoc_Ka, matl0.K_ambi.slice(1,3));        // Ka ambient
  // myGL.uniform3fv(uLoc_Kd, matl0.K_diff.slice(1,3));        // Kd diffuse
  // myGL.uniform3fv(uLoc_Ks, matl0.K_spec.slice(0,3));        // Ks specular
  // myGL.uniform1i(uLoc_Kshiny, parseInt(matl0.K_shiny, 10));     // Kshiny 
  myViewMatrix.rotate(currentAngle, 0, 0, 1); 
  myViewMatrix.translate(0,0,1.5);  
  myViewMatrix.scale(0.5,0.5,0.5);
  //myViewMatrix.rotate(180, 0, 0, 1);
  myViewMatrix.rotate(Zangle*0.8, 1, 1, 1);   

  Setup(myGL);
  myGL.drawArrays(myGL.TRIANGLE_STRIP,               // use this drawing primitive, and
                spherestart/floatsPerVertex, // start at this vertex number, and
                sphVerts.length/floatsPerVertex);

  myViewMatrix = popMatrix();
  pushMatrix(myViewMatrix);

  // matlSel = 9;
  // matl0 = new Material(matlSel);  
  // myGL.uniform3fv(uLoc_Ke, matl0.K_emit.slice(1,3));        // Ke emissive
  // myGL.uniform3fv(uLoc_Ka, matl0.K_ambi.slice(1,3));        // Ka ambient
  // myGL.uniform3fv(uLoc_Kd, matl0.K_diff.slice(1,3));        // Kd diffuse
  // myGL.uniform3fv(uLoc_Ks, matl0.K_spec.slice(0,3));        // Ks specular
  // myGL.uniform1i(uLoc_Kshiny, parseInt(matl0.K_shiny, 10));     // Kshiny 

  myViewMatrix.translate(0,0,1.5);  
  myViewMatrix.scale(0.5,0.5,0.5);
  myViewMatrix.rotate(180, 0, 0, 1);
  myViewMatrix.rotate(Zangle*3, 1, 1, 1);   
  //myViewMatrix.rotate(currentAngle, 0, 0, 1); 
  Setup(myGL);
  myGL.drawArrays(myGL.TRIANGLES,               // use this drawing primitive, and
                cubStart/floatsPerVertex, // start at this vertex number, and
                cubVerts.length/floatsPerVertex);



  myViewMatrix = popMatrix();
  myViewMatrix = popMatrix();
  pushMatrix(myViewMatrix);
  matlSel = 20;
  matl0 = new Material(matlSel);  
  myGL.uniform3fv(uLoc_Ke, matl0.K_emit.slice(0,3));        // Ke emissive
  myGL.uniform3fv(uLoc_Ka, matl0.K_ambi.slice(0,3));        // Ka ambient
  myGL.uniform3fv(uLoc_Kd, matl0.K_diff.slice(0,3));        // Kd diffuse
  myGL.uniform3fv(uLoc_Ks, matl0.K_spec.slice(0,3));        // Ks specular
  myGL.uniform1i(uLoc_Kshiny, parseInt(matl0.K_shiny, 10));     // Kshiny 

  myViewMatrix.translate(-5,1,3);
  myViewMatrix.scale(2,2,2);
  myViewMatrix.rotate(-1, -1,0,0);
  Setup(myGL);
  myGL.drawArrays(myGL.TRIANGLES,               // use this drawing primitive, and
                cubStart/floatsPerVertex, // start at this vertex number, and
                cubVerts.length/floatsPerVertex);

  // matlSel = 9;
  // matl0 = new Material(matlSel);  
  // myGL.uniform3fv(uLoc_Ke, matl0.K_emit.slice(1,3));        // Ke emissive
  // myGL.uniform3fv(uLoc_Ka, matl0.K_ambi.slice(1,3));        // Ka ambient
  // myGL.uniform3fv(uLoc_Kd, matl0.K_diff.slice(1,3));        // Kd diffuse
  // myGL.uniform3fv(uLoc_Ks, matl0.K_spec.slice(0,3));        // Ks specular
  // myGL.uniform1i(uLoc_Kshiny, parseInt(matl0.K_shiny, 10));     // Kshiny 

  myViewMatrix.translate(0,0,0.2);
  myViewMatrix.scale(1,1,1);

  myViewMatrix.rotate(Zangle*0.8, 1, 0, 0); 
  Setup(myGL);
  myGL.drawArrays(myGL.TRIANGLES,               // use this drawing primitive, and
                cubStart/floatsPerVertex, // start at this vertex number, and
                cubVerts.length/floatsPerVertex);
  // matlSel = 9;
  // matl0 = new Material(matlSel);  
  // myGL.uniform3fv(uLoc_Ke, matl0.K_emit.slice(1,3));        // Ke emissive
  // myGL.uniform3fv(uLoc_Ka, matl0.K_ambi.slice(1,3));        // Ka ambient
  // myGL.uniform3fv(uLoc_Kd, matl0.K_diff.slice(1,3));        // Kd diffuse
  // myGL.uniform3fv(uLoc_Ks, matl0.K_spec.slice(0,3));        // Ks specular
  // myGL.uniform1i(uLoc_Kshiny, parseInt(matl0.K_shiny, 10));     // Kshiny 

  myViewMatrix.translate(0,0,0.2);
  myViewMatrix.scale(1,1,1);

  myViewMatrix.rotate(Zangle*1, 1, 0, 0); 
  Setup(myGL);
  myGL.drawArrays(myGL.TRIANGLES,               // use this drawing primitive, and
                cubStart/floatsPerVertex, // start at this vertex number, and
                cubVerts.length/floatsPerVertex);
  //   matlSel = 9;
  // matl0 = new Material(matlSel);  
  // myGL.uniform3fv(uLoc_Ke, matl0.K_emit.slice(1,3));        // Ke emissive
  // myGL.uniform3fv(uLoc_Ka, matl0.K_ambi.slice(1,3));        // Ka ambient
  // myGL.uniform3fv(uLoc_Kd, matl0.K_diff.slice(1,3));        // Kd diffuse
  // myGL.uniform3fv(uLoc_Ks, matl0.K_spec.slice(0,3));        // Ks specular
  // myGL.uniform1i(uLoc_Kshiny, parseInt(matl0.K_shiny, 10));     // Kshiny 

  myViewMatrix.translate(0,0,0.2);
  myViewMatrix.scale(1,1,1);

  myViewMatrix.rotate(Zangle*1.2, 1, 0, 0); 
  Setup(myGL);
  myGL.drawArrays(myGL.TRIANGLES,               // use this drawing primitive, and
                cubStart/floatsPerVertex, // start at this vertex number, and
                cubVerts.length/floatsPerVertex);
  //   matlSel = 9;
  // matl0 = new Material(matlSel);  
  // myGL.uniform3fv(uLoc_Ke, matl0.K_emit.slice(1,3));        // Ke emissive
  // myGL.uniform3fv(uLoc_Ka, matl0.K_ambi.slice(1,3));        // Ka ambient
  // myGL.uniform3fv(uLoc_Kd, matl0.K_diff.slice(1,3));        // Kd diffuse
  // myGL.uniform3fv(uLoc_Ks, matl0.K_spec.slice(0,3));        // Ks specular
  // myGL.uniform1i(uLoc_Kshiny, parseInt(matl0.K_shiny, 10));     // Kshiny 

  myViewMatrix.translate(0,0,0.2);
  myViewMatrix.scale(1,1,1);

  myViewMatrix.rotate(Zangle*1.5, 1, 0, 0); 
  Setup(myGL);
  myGL.drawArrays(myGL.TRIANGLES,               // use this drawing primitive, and
                cubStart/floatsPerVertex, // start at this vertex number, and
                cubVerts.length/floatsPerVertex);
  // matlSel = 7;
  // matl0 = new Material(matlSel);  
  // myGL.uniform3fv(uLoc_Ke, matl0.K_emit.slice(1,3));        // Ke emissive
  // myGL.uniform3fv(uLoc_Ka, matl0.K_ambi.slice(1,3));        // Ka ambient
  // myGL.uniform3fv(uLoc_Kd, matl0.K_diff.slice(1,3));        // Kd diffuse
  // myGL.uniform3fv(uLoc_Ks, matl0.K_spec.slice(0,3));        // Ks specular
  // myGL.uniform1i(uLoc_Kshiny, parseInt(matl0.K_shiny, 10));     // Kshiny 

  myViewMatrix.translate(0,0,0.2);
  myViewMatrix.scale(1,1,1);

  myViewMatrix.rotate(Zangle*1.7, 1, 0, 0); 
  Setup(myGL);
  myGL.drawArrays(myGL.TRIANGLES,               // use this drawing primitive, and
                cubStart/floatsPerVertex, // start at this vertex number, and
                cubVerts.length/floatsPerVertex);
  // matlSel = 22;
  // matl0 = new Material(matlSel);  
  // myGL.uniform3fv(uLoc_Ke, matl0.K_emit.slice(1,3));        // Ke emissive
  // myGL.uniform3fv(uLoc_Ka, matl0.K_ambi.slice(1,3));        // Ka ambient
  // myGL.uniform3fv(uLoc_Kd, matl0.K_diff.slice(1,3));        // Kd diffuse
  // myGL.uniform3fv(uLoc_Ks, matl0.K_spec.slice(0,3));        // Ks specular
  // myGL.uniform1i(uLoc_Kshiny, parseInt(matl0.K_shiny, 10));     // Kshiny 

  myViewMatrix.translate(0,0,0.2);
  myViewMatrix.scale(1,1,1);

  myViewMatrix.rotate(Zangle*2, 1, 0, 0); 
 Setup(myGL);
  myGL.drawArrays(myGL.TRIANGLES,               // use this drawing primitive, and
                cubStart/floatsPerVertex, // start at this vertex number, and
                cubVerts.length/floatsPerVertex);
  //   matlSel = 17;
  // matl0 = new Material(matlSel);  
  // myGL.uniform3fv(uLoc_Ke, matl0.K_emit.slice(1,3));        // Ke emissive
  // myGL.uniform3fv(uLoc_Ka, matl0.K_ambi.slice(1,3));        // Ka ambient
  // myGL.uniform3fv(uLoc_Kd, matl0.K_diff.slice(1,3));        // Kd diffuse
  // myGL.uniform3fv(uLoc_Ks, matl0.K_spec.slice(0,3));        // Ks specular
  // myGL.uniform1i(uLoc_Kshiny, parseInt(matl0.K_shiny, 10));     // Kshiny 

  myViewMatrix.translate(0,0,0.2);
  myViewMatrix.scale(1,1,1);

  myViewMatrix.rotate(Zangle*2.5, 1, 0, 0); 
  Setup(myGL);
  myGL.drawArrays(myGL.TRIANGLES,               // use this drawing primitive, and
                cubStart/floatsPerVertex, // start at this vertex number, and
                cubVerts.length/floatsPerVertex);
  // matlSel = 1;
  // matl0 = new Material(matlSel);  
  // myGL.uniform3fv(uLoc_Ke, matl0.K_emit.slice(1,3));        // Ke emissive
  // myGL.uniform3fv(uLoc_Ka, matl0.K_ambi.slice(1,3));        // Ka ambient
  // myGL.uniform3fv(uLoc_Kd, matl0.K_diff.slice(1,3));        // Kd diffuse
  // myGL.uniform3fv(uLoc_Ks, matl0.K_spec.slice(0,3));        // Ks specular
  // myGL.uniform1i(uLoc_Kshiny, parseInt(matl0.K_shiny, 10));     // Kshiny 

  myViewMatrix.translate(0,0,0.2);
  myViewMatrix.scale(1,1,1);

  myViewMatrix.rotate(Zangle*2.7, 1, 0, 0); 
  Setup(myGL);
  myGL.drawArrays(myGL.TRIANGLES,               // use this drawing primitive, and
                cubStart/floatsPerVertex, // start at this vertex number, and
                cubVerts.length/floatsPerVertex);

}


