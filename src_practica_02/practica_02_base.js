/*
* 
* Practica_02_base.js
* Videojuegos (30262) - Curso 2019-2020
* 
* Parte adaptada de: Alex Clarke, 2016, y Ed Angel, 2015.
* 
*/

// Variable to store the WebGL rendering context
var gl;

//----------------------------------------------------------------------------
// MODEL DATA 
//----------------------------------------------------------------------------

const MAX_CUBOS = 20;
const MAX_RADIO = 9;
const MIN_RADIO = 1;
const MAX_ESCALA = 1.3;
const MIN_ESCALA = 0.1;
const MAX_VEL = 2;
const MIN_VEL = 0.1;
const VEL_MOVIMIENTO = 0.1;

//Define points' position vectors
const cubeVerts = [
	[ 0.5, 0.5, 0.5, 1], //0
	[ 0.5, 0.5,-0.5, 1], //1
	[ 0.5,-0.5, 0.5, 1], //2
	[ 0.5,-0.5,-0.5, 1], //3
	[-0.5, 0.5, 0.5, 1], //4
	[-0.5, 0.5,-0.5, 1], //5
	[-0.5,-0.5, 0.5, 1], //6
	[-0.5,-0.5,-0.5, 1], //7
];

const wireCubeIndices = [
//Wire Cube - use LINE_STRIP, starts at 0, 30 vertices
	0,4,6,2,0, //front
	1,0,2,3,1, //right
	5,1,3,7,5, //back
	4,5,7,6,4, //right
	4,0,1,5,4, //top
	6,7,3,2,6, //bottom
];

const cubeIndices = [	
//Solid Cube - use TRIANGLES, starts at 0, 36 vertices
	0,4,6, //front
	0,6,2,
	1,0,2, //right
	1,2,3, 
	5,1,3, //back
	5,3,7,
	4,5,7, //left
	4,7,6,
	4,0,1, //top
	4,1,5,
	6,7,3, //bottom
	6,3,2,
];

const pointsAxes = [];
pointsAxes.push([ 2.0, 0.0, 0.0, 1.0]); //x axis is green
pointsAxes.push([-2.0, 0.0, 0.0, 1.0]);
pointsAxes.push([ 0.0, 2.0, 0.0, 1.0]); //y axis is red
pointsAxes.push([ 0.0,-2.0, 0.0, 1.0]); 
pointsAxes.push([ 0.0, 0.0, 2.0, 1.0]); //z axis is blue
pointsAxes.push([ 0.0, 0.0,-2.0, 1.0]);

const pointsWireCube = [];
for (let i=0; i < wireCubeIndices.length; i++)
{
	pointsWireCube.push(cubeVerts[wireCubeIndices[i]]);
}

// Cubo solido
const pointsCube = [];
for (let i=0; i < cubeIndices.length; i++)
{
	pointsCube.push(cubeVerts[cubeIndices[i]]);
}

const shapes = {
	wireCube: {Start: 0, Vertices: 30},
	cube: {Start: 0, Vertices: 36},
	axes: {Start: 0, Vertices: 6}
};
	
const red =			[1.0, 0.0, 0.0, 1.0];
const green =		[0.0, 1.0, 0.0, 1.0];
const blue =		[0.0, 0.0, 1.0, 1.0];
const lightred =	[1.0, 0.5, 0.5, 1.0];
const lightgreen =	[0.5, 1.0, 0.5, 1.0];
const lightblue = 	[0.5, 0.5, 1.0, 1.0];
const white =		[1.0, 1.0, 1.0, 1.0];

const colorsAxes = [
	green, green, //x
	red, red,     //y
	blue, blue,   //z
];	

const colorsWireCube = [
	white, white, white, white, white,
	white, white, white, white, white,
	white, white, white, white, white,
	white, white, white, white, white,
	white, white, white, white, white,
	white, white, white, white, white,
];

const colorsCube = [	
	lightblue, lightblue, lightblue, lightblue, lightblue, lightblue,
	lightgreen, lightgreen, lightgreen, lightgreen, lightgreen, lightgreen,
	lightred, lightred, lightred, lightred, lightred, lightred,
	blue, blue, blue, blue, blue, blue,
	red, red, red, red, red, red,
	green, green, green, green, green, green,
];	

const colorsCubeSolid = [	
	lightblue, lightblue, lightblue, lightblue, lightblue, lightblue,
	lightblue, lightblue, lightblue, lightblue, lightblue, lightblue,
	lightblue, lightblue, lightblue, lightblue, lightblue, lightblue,
	lightblue, lightblue, lightblue, lightblue, lightblue, lightblue,
	lightblue, lightblue, lightblue, lightblue, lightblue, lightblue,
	lightblue, lightblue, lightblue, lightblue, lightblue, lightblue,
];	

//----------------------------------------------------------------------------
// OTHER DATA 
//----------------------------------------------------------------------------

var model = new mat4();   		// create a model matrix and set it to the identity matrix
var view = new mat4();   		// create a view matrix and set it to the identity matrix
var projection = new mat4();	// create a projection matrix and set it to the identity matrix

var eye, target, up;			// for view matrix

var rotAngle = 0.0;
var rotChange = 0.5;

var program;
var uLocations = {};
var aLocations = {};

var programInfo = {
			program,
			uniformLocations: {},
			attribLocations: {},
};

var objectsToDraw = [
];

function createSphere(radius, latBands, longBands) {
    let vertices = [];
    let normals = [];
    let indices = [];

    for (let lat = 0; lat <= latBands; lat++) {
        let theta = (lat * Math.PI) / latBands;
        let sinTheta = Math.sin(theta);
        let cosTheta = Math.cos(theta);

        for (let long = 0; long <= longBands; long++) {
            let phi = (long * 2 * Math.PI) / longBands;
            let sinPhi = Math.sin(phi);
            let cosPhi = Math.cos(phi);

            let x = cosPhi * sinTheta;
            let y = cosTheta;
            let z = sinPhi * sinTheta;

            vertices.push(radius * x, radius * y, radius * z);
            normals.push(x, y, z);
        }
    }

    for (let lat = 0; lat < latBands; lat++) {
        for (let long = 0; long < longBands; long++) {
            let first = lat * (longBands + 1) + long;
            let second = first + longBands + 1;
            
            indices.push(first, second, first + 1);
            indices.push(second, second + 1, first + 1);
        }
    }

    return { vertices, normals, indices };
}

let sphereData = createSphere(1.0, 32, 32);

objectsToDraw.push(
	{
		programInfo: programInfo,
		pointsArray: pointsAxes, 
		colorsArray: colorsAxes, 
		uniforms: {
		  u_colorMult: [1.0, 1.0, 1.0, 1.0],
		  u_model: new mat4(),
		},
		primType: "lines",
	},
);

const ejeX = vec3(1.0, 0.0, 0.0);
const ejeY = vec3(0.0, 1.0, 0.0);
const ejeZ = vec3(0.0, 0.0, 1.0);

//------------------------------------------------------------------------------
// Movimiento de la camara
//------------------------------------------------------------------------------

var es_perspectiva = true; 	// Variable para determinar la vista activa
var field = 45.0;			// Variable campo de vista
var eje_X_rotado_yaw = vec4(ejeX[0], ejeX[1], ejeX[2], 0.0);
var eje_Z_rotado_yaw = vec4(ejeZ[0], ejeZ[1], ejeZ[2], 0.0);


// 1 si esta siendo pulsada, 0 si ha sido soltada
var teclas_pulsadas = {
	arriba: 0,
	abajo: 0,
	izquierda: 0,
	derecha: 0,
	mas: 0,
	menos: 0,
};

/**
 * Maneja las pulsaciones de teclas para controlar la cámara y la proyección.
 * - Activa las direcciones de movimiento con las flechas.
 * - Alterna entre proyección en perspectiva ('P') y ortográfica ('O').
 * - Modifica el campo de visión con '+' y '-'.
 */
function keyPressedHandler(event) {
    switch(event.key) {
		case "ArrowUp":
			teclas_pulsadas.arriba = 1;
			break;
		case "ArrowDown":
			teclas_pulsadas.abajo = 1;
			break;
		case "ArrowLeft":
			teclas_pulsadas.izquierda = 1;
			break;
		case "ArrowRight":
			teclas_pulsadas.derecha = 1;
			break;
		case "p":
		case "P":
			es_perspectiva = true;
			break;
		case "o":
		case "O":
			es_perspectiva = false;
			field = 45.0; // Reestablecer el valor por defecto
			break;
		case "+":
			teclas_pulsadas.mas = 1;
			break;
		case "-":
				teclas_pulsadas.menos = 1;
			break;
		default:
			console.log("Unhandled input");
	}
}

/**
 * Maneja la liberación de teclas para detener el movimiento o ajustes.
 */
function keyReleasedHandler(event) {
    switch(event.key) {
		case "ArrowUp":
			teclas_pulsadas.arriba = 0;
			break;
		case "ArrowDown":
			teclas_pulsadas.abajo = 0;
			break;
		case "ArrowLeft":
			teclas_pulsadas.izquierda = 0;
			break;
		case "ArrowRight":
			teclas_pulsadas.derecha = 0;
			break;
		case "+":
			teclas_pulsadas.mas = 0;
			break;
		case "-":
			teclas_pulsadas.menos = 0;
			break;
		default:
			break;
	}
}

/**
 * Mueve la cámara en función de las teclas presionadas.
 * Modifica la posición de la cámara (eye) y el objetivo (target)
 * según la dirección de movimiento y la velocidad definida.
 */
function mover_camara() {
	if (teclas_pulsadas.arriba == 1) {
        eye[0] += VEL_MOVIMIENTO * eje_X_rotado_yaw[0];
        target[0] += VEL_MOVIMIENTO * eje_X_rotado_yaw[0];
		eye[2] += VEL_MOVIMIENTO * eje_X_rotado_yaw[2];
        target[2] += VEL_MOVIMIENTO * eje_X_rotado_yaw[2];
    }
    if (teclas_pulsadas.abajo == 1) {
        eye[0] -= VEL_MOVIMIENTO * eje_X_rotado_yaw[0];
        target[0] -= VEL_MOVIMIENTO * eje_X_rotado_yaw[0];
		eye[2] -= VEL_MOVIMIENTO * eje_X_rotado_yaw[2];
        target[2] -= VEL_MOVIMIENTO * eje_X_rotado_yaw[2];
    }
    if (teclas_pulsadas.derecha == 1) {
        eye[2] += VEL_MOVIMIENTO * eje_Z_rotado_yaw[2];
        target[2] += VEL_MOVIMIENTO * eje_Z_rotado_yaw[2];
		eye[0] += VEL_MOVIMIENTO * eje_Z_rotado_yaw[0];
        target[0] += VEL_MOVIMIENTO * eje_Z_rotado_yaw[0];
    }
    if (teclas_pulsadas.izquierda == 1) {
        eye[2] -= VEL_MOVIMIENTO * eje_Z_rotado_yaw[2];
        target[2] -= VEL_MOVIMIENTO * eje_Z_rotado_yaw[2]; 
		eye[0] -= VEL_MOVIMIENTO * eje_Z_rotado_yaw[0];
        target[0] -= VEL_MOVIMIENTO * eje_Z_rotado_yaw[0];
		
    }
}

/**
 * Ajusta la proyección de la cámara en cada frame.
 * Modifica el campo de visión (FOV) si la proyección es en perspectiva,
 * permitiendo hacer zoom in/out con las teclas correspondientes.
 * Alterna entre proyección en perspectiva y ortográfica según la configuración.
 */
function ajustar_proyeccion() {
	// Aplicar la proyección en cada frame
	if (es_perspectiva) {
		if(teclas_pulsadas.mas == 1) { 
			if(field > 10){
				field -= 1.0;
			}
		}
		if(teclas_pulsadas.menos == 1) { 
			if(field < 150){
				field += 1.0; 
			}
		}
		proy_perspectiva();		
	} else {
		proy_orto();
	}
	gl.uniformMatrix4fv(programInfo.uniformLocations.projection, gl.FALSE, projection);
}


//------------------------------------------------------------------------------
// Rotacion de la camara
//------------------------------------------------------------------------------

const sensitivity = 0.1;  // Sensibilidad del raton (mayor sensibilidad = mayor velocidad)

let lastX = 0;  		// Posición X del ratón anterior
let lastY = 0;  		// Posición Y del ratón anterior
let pitch = -24.00;     // Ángulo de pitch (rotacion sobre eje X)
let yaw = -63.50;       // Ángulo de yaw (rotacion sobre eje Y)
let raton_pulsado = 0; 	// 1 si el ratón está pulsado, 0 si no

/**
 * Detecta cuando se presiona el botón izquierdo del ratón.
 * Al presionar, guarda la posición inicial del cursor.
 */
document.addEventListener("mousedown", function(event) {
    if (event.button === 0) { // 0 = Botón izquierdo
		raton_pulsado = 1;
		lastX = event.clientX;
		lastY = event.clientY;
    }
});

/**
 * Detecta cuando se suelta el botón izquierdo del ratón.
 * Al soltar, indica que el botón ya no está pulsado.
 */
document.addEventListener("mouseup", function(event) {
    if (event.button === 0) {
        raton_pulsado = 0;
    }
});


/**
 * Maneja el evento de movimiento del ratón para actualizar los ángulos de la cámara.
 * Solo se ejecuta si el botón del ratón está presionado. Calcula el desplazamiento 
 * del cursor y ajusta los valores de yaw y pitch según la sensibilidad configurada.
 */
document.addEventListener("mousemove", (event) => {
	// Comprobar que el boton esta pulsado
    if (raton_pulsado == 1) {
		// Obtener los offsets de desplazamiento
		let offsetX = event.clientX - lastX;
		let offsetY = event.clientY - lastY;
		
		// Guardar los nuevos valores de posicion
		lastX = event.clientX;
		lastY = event.clientY;
		
		// Calculo de yaw y pitch dados los offsets y sensibilidad
		yaw += offsetX * sensitivity;
		pitch -= offsetY * sensitivity; 

        update_camera_direction();
    }
});

/**
 * Actualiza la dirección de la cámara según los ángulos de pitch y yaw.
 * Limita los valores extremos, convierte a radianes, calcula la nueva dirección
 * y ajusta el objetivo (target) en función de la posición actual (eye).
 */
function update_camera_direction() {
	// Comprobar que pitch y yaw no superan los valores extremo
	pitch = Math.max(-89, Math.min(89, pitch)); 
	yaw = Math.max(-89, Math.min(89, yaw));

	// Conversion de pitch y yaw a radianes
	let radPitch = pitch * (Math.PI / 180.0);
	let radYaw = yaw * (Math.PI / 180.0);
	
	// Calculo trigonometrico de la nueva direccion a apuntar
	let dirX = Math.cos(radYaw) * Math.cos(radPitch);
	let dirY = Math.sin(radPitch);
	let dirZ = Math.sin(radYaw) * Math.cos(radPitch);

	// Normalizacion de la direccion
	let direction = normalize(vec3(dirX, dirY, dirZ));

	// Calculo del target dada la posicion y la direccion
	target = add(eye, direction);
}

//------------------------------------------------------------------------------
// Proyecciones de la camara
//------------------------------------------------------------------------------

var canvas;

/**
 * Configura la proyección ortogonal.
 * Define una vista ortogonal basada en un tamaño fijo y la relación de aspecto
 * del canvas.
 * Luego, actualiza las matrices de proyección y vista en los shaders.
 */
function proy_orto() {
	let tam_vista = 10;  // Tamaño de la vista ortogonal
	let aspecto = canvas.width / canvas.height;  // Relación de aspecto

	projection = ortho(-tam_vista * aspecto, tam_vista * aspecto, -tam_vista, tam_vista, 0.1, 100.0);

	gl.uniformMatrix4fv(programInfo.uniformLocations.projection, gl.FALSE, projection);
	gl.uniformMatrix4fv(programInfo.uniformLocations.view, gl.FALSE, view);
}

/**
 * Configura la proyección en perspectiva.
 * Establece una proyección de perspectiva con el campo de visión actual y
 * la relación de aspecto.
 * Luego, actualiza las matrices de proyección y vista en los shaders.
 */
function proy_perspectiva() {
	projection = perspective(field, canvas.width/canvas.height, 0.1, 100.0 );

	gl.uniformMatrix4fv( programInfo.uniformLocations.projection, gl.FALSE, projection );
	gl.uniformMatrix4fv(programInfo.uniformLocations.view, gl.FALSE, view);
}

//----------------------------------------------------------------------------
// Initialization function
//----------------------------------------------------------------------------

window.onload = function init() {
	
	// Set up a WebGL Rendering Context in an HTML5 Canvas
	canvas = document.getElementById("gl-canvas");
	gl = WebGLUtils.setupWebGL(canvas);
	if (!gl) {
		alert("WebGL isn't available");
	}

	//  Configure WebGL
	gl.clearColor(0.0, 0.0, 0.0, 1.0);
	gl.enable(gl.DEPTH_TEST);

	setPrimitive(objectsToDraw);

	// Set up a WebGL program
	// Load shaders and initialize attribute buffers
	program = initShaders(gl, "vertex-shader", "fragment-shader");
	  
	// Save the attribute and uniform locations
	uLocations.model = gl.getUniformLocation(program, "model");
	uLocations.view = gl.getUniformLocation(program, "view");
	uLocations.projection = gl.getUniformLocation(program, "projection");
	uLocations.colorMult = gl.getUniformLocation(program, "colorMult");
	aLocations.vPosition = gl.getAttribLocation(program, "vPosition");
	aLocations.vColor = gl.getAttribLocation(program, "vColor");

	programInfo.uniformLocations = uLocations;
	programInfo.attribLocations = aLocations;
	programInfo.program = program;

	gl.useProgram(programInfo.program);
	
	// Set up viewport 
	// gl.viewport(x, y, width, height)
	gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight);

	// Set up camera	
	eye = vec3(-5.0, 5.0, 10.0);
	target =  vec3(0.0, 0.0, 0.0);
	up =  vec3(0.0, 1.0, 0.0);
	view = lookAt(eye,target,up);

	// Establecer la proyeccion perspectiva por defecto
	proy_perspectiva();
	
	requestAnimFrame(render);

	window.addEventListener("keydown", keyPressedHandler);
	window.addEventListener("keyup", keyReleasedHandler);
	//window.addEventListener('mousemove', handleMouseMove);

	canvas.addEventListener("mouseenter", () => mouseInside = true);
	canvas.addEventListener("mouseleave", () => mouseInside = false);

	// Escuchar clic en el canvas para activar Pointer Lock
	//canvas.addEventListener("click", requestPointerLock);
  
};

//----------------------------------------------------------------------------
// Rendering Event Function
//----------------------------------------------------------------------------

/**
 * Calcula las componentes a tener en cuenta en el movimiento dado el yaw
 */
function nuevo_eje_movimiento(){
	// Calcular matriz de rotacion del eje X 
	let matriz_rot_X = rotate(yaw, ejeY);
	eje_X_rotado_yaw = mult(matriz_rot_X, 
			vec4(ejeX[0], ejeX[1], ejeX[2], 0.0));
	eje_Z_rotado_yaw = mult(matriz_rot_X, 
		vec4(ejeZ[0], ejeZ[1], ejeZ[2], 0.0));
}

function render() {

	gl.clear(gl.DEPTH_BUFFER_BIT | gl.COLOR_BUFFER_BIT);
	
	//----------------------------------------------------------------------------
	// MOVE STUFF AROUND
	//----------------------------------------------------------------------------

	nuevo_eje_movimiento();
	mover_camara();
	ajustar_proyeccion();
	
	view = lookAt(eye, target, up);
    gl.uniformMatrix4fv(programInfo.uniformLocations.view, gl.FALSE, view);
	
	//----------------------------------------------------------------------------
	// DRAW
	//----------------------------------------------------------------------------

	objectsToDraw.forEach(function(object) {

		gl.useProgram(object.programInfo.program);

		// Setup buffers and attributes
		setBuffersAndAttributes(object.programInfo, object.pointsArray, object.colorsArray);

		// Set the uniforms
		setUniforms(object.programInfo, object.uniforms);

		// Draw
		gl.drawArrays(object.primitive, 0, object.pointsArray.length);
    });	
    
	rotAngle += rotChange;
	for (let i=0; i < MAX_CUBOS; i++) {
		cubos[i].posRotOrbita += cubos[i].velRotOrbita
		cubos[i].posRotXMismo += cubos[i].velRotXMismo
		cubos[i].posRotYMismo += cubos[i].velRotYMismo
		cubos[i].posRotZMismo += cubos[i].velRotZMismo
	}
	requestAnimationFrame(render);
	
}

//----------------------------------------------------------------------------
// Utils functions
//----------------------------------------------------------------------------

function setPrimitive(objectsToDraw) {	
	
	objectsToDraw.forEach(function(object) {
		switch(object.primType) {
		  case "lines":
			object.primitive = gl.LINES;
			break;
		  case "line_strip":
			object.primitive = gl.LINE_STRIP;
			break;
		  case "triangles":
		    object.primitive = gl.TRIANGLES;
		    break;
		  default:
			object.primitive = gl.TRIANGLES;
		}
	});	
}	

function setUniforms(pInfo, uniforms) {
	// Copy uniform model values to corresponding values in shaders
	gl.uniform4f(pInfo.uniformLocations.colorMult, uniforms.u_colorMult[0], uniforms.u_colorMult[1], uniforms.u_colorMult[2], uniforms.u_colorMult[3]);
	gl.uniformMatrix4fv(pInfo.uniformLocations.model, gl.FALSE, uniforms.u_model);
}

function setBuffersAndAttributes(pInfo, ptsArray, colArray) {
	// Load the data into GPU data buffers
	// Vertices
	var vertexBuffer = gl.createBuffer();
	gl.bindBuffer( gl.ARRAY_BUFFER, vertexBuffer );
	gl.bufferData( gl.ARRAY_BUFFER,  flatten(ptsArray), gl.STATIC_DRAW );
	gl.vertexAttribPointer( pInfo.attribLocations.vPosition, 4, gl.FLOAT, gl.FALSE, 0, 0 );
	gl.enableVertexAttribArray( pInfo.attribLocations.vPosition );

	// Colors
	var colorBuffer = gl.createBuffer();
	gl.bindBuffer( gl.ARRAY_BUFFER, colorBuffer );
	gl.bufferData( gl.ARRAY_BUFFER,  flatten(colArray), gl.STATIC_DRAW );
	gl.vertexAttribPointer( pInfo.attribLocations.vColor, 4, gl.FLOAT, gl.FALSE, 0, 0 );
	gl.enableVertexAttribArray( pInfo.attribLocations.vColor );
}
