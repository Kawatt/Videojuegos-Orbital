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

const VEL_MOVIMIENTO = 0.1;

const pointsAxes = [];
pointsAxes.push([ 2.0, 0.0, 0.0, 1.0]); //x axis is green
pointsAxes.push([-2.0, 0.0, 0.0, 1.0]);
pointsAxes.push([ 0.0, 2.0, 0.0, 1.0]); //y axis is red
pointsAxes.push([ 0.0,-2.0, 0.0, 1.0]); 
pointsAxes.push([ 0.0, 0.0, 2.0, 1.0]); //z axis is blue
pointsAxes.push([ 0.0, 0.0,-2.0, 1.0]);
	
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
];
var spheresToDraw = [
];

const ejeX = vec3(1.0, 0.0, 0.0);
const ejeY = vec3(0.0, 1.0, 0.0);
const ejeZ = vec3(0.0, 0.0, 1.0);

function generateIcosahedronSphere(subdivisions) {
    const t = (1.0 + Math.sqrt(5.0)) / 2.0;

    // Vértices iniciales del icosaedro
    let vertices = [
        [-1, t, 0, 1.0], [1, t, 0, 1.0], [-1, -t, 0, 1.0], [1, -t, 0, 1.0],
        [0, -1, t, 1.0], [0, 1, t, 1.0], [0, -1, -t, 1.0], [0, 1, -t, 1.0],
        [t, 0, -1, 1.0], [t, 0, 1, 1.0], [-t, 0, -1, 1.0], [-t, 0, 1, 1.0],
    ];

    // Normalizar los vértices
    vertices = vertices.map(v => normalize_new(v));

    // Triángulos del icosaedro
    let indices = [
        [0, 11, 5], [0, 5, 1], [0, 1, 7], [0, 7, 10], [0, 10, 11],
        [1, 5, 9], [5, 11, 4], [11, 10, 2], [10, 7, 6], [7, 1, 8],
        [3, 9, 4], [3, 4, 2], [3, 2, 6], [3, 6, 8], [3, 8, 9],
        [4, 9, 5], [2, 4, 11], [6, 2, 10], [8, 6, 7], [9, 8, 1],
    ];

    // Subdivisión de triángulos
    for (let i = 0; i < subdivisions; i++) {
        let newIndices = [];
        let midPointCache = {};

        function getMidPoint(a, b) {
            let key = a < b ? `${a}-${b}` : `${b}-${a}`;
            if (midPointCache[key] !== undefined) {
                return midPointCache[key];
            }

            let mid = normalize_new([
                (vertices[a][0] + vertices[b][0]) / 2,
                (vertices[a][1] + vertices[b][1]) / 2,
                (vertices[a][2] + vertices[b][2]) / 2,
                1.0  // Asegura que el vértice es un vec4
            ]);

            let index = vertices.length;
            vertices.push(mid);
            midPointCache[key] = index;
            return index;
        }

        for (let tri of indices) {
            let a = tri[0], b = tri[1], c = tri[2];
            let ab = getMidPoint(a, b);
            let bc = getMidPoint(b, c);
            let ca = getMidPoint(c, a);

            newIndices.push([a, ab, ca], [b, bc, ab], [c, ca, bc], [ab, bc, ca]);
        }

        indices = newIndices;
    }

    // Convertir los datos a buffers planos
    let pointsArray = [];
    let colorsArray = [];

    for (let tri of indices) {
        for (let idx of tri) {
            let v = vertices[idx];
            pointsArray.push(...v);  // Aquí agregamos `vec4`

			let greenValue = Math.random();
			let redValue = 0.9;
			let blueValue = 0.0;
			colorsArray.push(redValue, greenValue, blueValue, 1.0);  // Generar color en formato RGBA
			
        }
    }

    return { pointsArray, colorsArray };
}

function sphere_color() {
	return Math.max(Math.random(), 0.8);
}

// Normalización de vectores
function normalize_new(v) {
    let len = Math.sqrt(v[0] ** 2 + v[1] ** 2 + v[2] ** 2);
    return [v[0] / len, v[1] / len, v[2] / len, 1.0];  // Normalizamos a `vec4` (x, y, z, w)
}

// Generar esfera con 3 subdivisiones (más alto → más detallado)
const { pointsArray, colorsArray } = generateIcosahedronSphere(3);

// Añadir el objeto a WebGL
spheresToDraw.push({
    programInfo: programInfo,
    pointsArray: pointsArray,
    colorsArray: colorsArray,
    uniforms: {
        u_colorMult: [1.0, 1.0, 1.0, 1.0],
        u_model: new mat4(),
    },
    primType: "triangles",
});




//------------------------------------------------------------------------------
// Movimiento de la camara
//------------------------------------------------------------------------------

var es_perspectiva = true; 	// Variable para determinar la vista activa
var field = 45.0;			// Variable campo de vista
var eje_X_rotado_yaw = vec4(ejeX[0], ejeX[1], ejeX[2], 0.0);
var eje_Z_rotado_yaw = vec4(ejeZ[0], ejeZ[1], ejeZ[2], 0.0);
var eje_Y_rotado_yaw = vec4(ejeY[0], ejeY[1], ejeY[2], 0.0);


// 1 si esta siendo pulsada, 0 si ha sido soltada
var teclas_pulsadas = {
	delante: 0,
	atras: 0,
	arriba: 0,
	abajo: 0,
	izquierda: 0,
	derecha: 0,
	girder: 0,
	girizq: 0,
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
		case "w":
		case "W":
			teclas_pulsadas.delante = 1;
			break;
		case "ArrowDown":
		case "s":
		case "S":
			teclas_pulsadas.atras = 1;
			break;
		case "ArrowLeft":
		case "a":
		case "A":
			teclas_pulsadas.izquierda = 1;
			break;
		case "ArrowRight":
		case "d":
		case "D":
			teclas_pulsadas.derecha = 1;
			break;
		case " ":
			teclas_pulsadas.arriba = 1;
			break;
		case "Shift":
			teclas_pulsadas.abajo = 1;
			break;
		case "e":
		case "E":
			teclas_pulsadas.girder = 1;
			break;
		case "q":
		case "Q":
			teclas_pulsadas.girizq = 1;
			break;
		default:
			console.log("tecla pulsada: " + event.key)
			break;
	}
}

/**
 * Maneja la liberación de teclas para detener el movimiento o ajustes.
 */
function keyReleasedHandler(event) {
    switch(event.key) {
		case "ArrowUp":
		case "w":
		case "W":
			teclas_pulsadas.delante = 0;
			break;
		case "ArrowDown":
		case "s":
		case "S":
			teclas_pulsadas.atras = 0;
			break;
		case "ArrowLeft":
		case "a":
		case "A":
			teclas_pulsadas.izquierda = 0;
			break;
		case "ArrowRight":
		case "d":
		case "D":
			teclas_pulsadas.derecha = 0;
			break;
		case " ":
			teclas_pulsadas.arriba = 0;
			break;
		case "Shift":
			teclas_pulsadas.abajo = 0;
			break;
		case "e":
		case "E":
			teclas_pulsadas.girder = 0;
			break;
		case "q":
		case "Q":
			teclas_pulsadas.girizq = 0;
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
	if (teclas_pulsadas.delante == 1) {
        eye[0] += VEL_MOVIMIENTO * eje_X_rotado_yaw[0];
        target[0] += VEL_MOVIMIENTO * eje_X_rotado_yaw[0];
        eye[1] += VEL_MOVIMIENTO * eje_X_rotado_yaw[1];
        target[1] += VEL_MOVIMIENTO * eje_X_rotado_yaw[1];
		eye[2] += VEL_MOVIMIENTO * eje_X_rotado_yaw[2];
        target[2] += VEL_MOVIMIENTO * eje_X_rotado_yaw[2];
    }
    if (teclas_pulsadas.atras == 1) {
        eye[0] -= VEL_MOVIMIENTO * eje_X_rotado_yaw[0];
        target[0] -= VEL_MOVIMIENTO * eje_X_rotado_yaw[0];
        eye[1] -= VEL_MOVIMIENTO * eje_X_rotado_yaw[1];
        target[1] -= VEL_MOVIMIENTO * eje_X_rotado_yaw[1];
		eye[2] -= VEL_MOVIMIENTO * eje_X_rotado_yaw[2];
        target[2] -= VEL_MOVIMIENTO * eje_X_rotado_yaw[2];
    }
	if (teclas_pulsadas.arriba == 1) {
        eye[0] += VEL_MOVIMIENTO * eje_Y_rotado_yaw[0];
        target[0] += VEL_MOVIMIENTO * eje_Y_rotado_yaw[0];
        eye[1] += VEL_MOVIMIENTO * eje_Y_rotado_yaw[1];
        target[1] += VEL_MOVIMIENTO * eje_Y_rotado_yaw[1];
		eye[2] += VEL_MOVIMIENTO * eje_Y_rotado_yaw[2];
        target[2] += VEL_MOVIMIENTO * eje_Y_rotado_yaw[2];
    }
    if (teclas_pulsadas.abajo == 1) {
        eye[0] -= VEL_MOVIMIENTO * eje_Y_rotado_yaw[0];
        target[0] -= VEL_MOVIMIENTO * eje_Y_rotado_yaw[0];
        eye[1] -= VEL_MOVIMIENTO * eje_Y_rotado_yaw[1];
        target[1] -= VEL_MOVIMIENTO * eje_Y_rotado_yaw[1];
		eye[2] -= VEL_MOVIMIENTO * eje_Y_rotado_yaw[2];
        target[2] -= VEL_MOVIMIENTO * eje_Y_rotado_yaw[2];
    }
    if (teclas_pulsadas.derecha == 1) {
		eye[0] += VEL_MOVIMIENTO * eje_Z_rotado_yaw[0];
        target[0] += VEL_MOVIMIENTO * eje_Z_rotado_yaw[0];
        eye[1] += VEL_MOVIMIENTO * eje_Z_rotado_yaw[1];
        target[1] += VEL_MOVIMIENTO * eje_Z_rotado_yaw[1];
        eye[2] += VEL_MOVIMIENTO * eje_Z_rotado_yaw[2];
        target[2] += VEL_MOVIMIENTO * eje_Z_rotado_yaw[2];
    }
    if (teclas_pulsadas.izquierda == 1) {
		eye[0] -= VEL_MOVIMIENTO * eje_Z_rotado_yaw[0];
        target[0] -= VEL_MOVIMIENTO * eje_Z_rotado_yaw[0];
        eye[1] -= VEL_MOVIMIENTO * eje_Z_rotado_yaw[1];
        target[1] -= VEL_MOVIMIENTO * eje_Z_rotado_yaw[1]; 
        eye[2] -= VEL_MOVIMIENTO * eje_Z_rotado_yaw[2];
        target[2] -= VEL_MOVIMIENTO * eje_Z_rotado_yaw[2]; 
		
    }
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
	//yaw = Math.max(-89, Math.min(89, yaw));

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
	setPrimitive(spheresToDraw);


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
	eje_Y_rotado_yaw = mult(matriz_rot_X, 
		vec4(ejeY[0], ejeY[1], ejeY[2], 0.0));
}

function render() {

	gl.clear(gl.DEPTH_BUFFER_BIT | gl.COLOR_BUFFER_BIT);
	
	//----------------------------------------------------------------------------
	// MOVE STUFF AROUND
	//----------------------------------------------------------------------------

	nuevo_eje_movimiento();
	mover_camara();
	
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

	spheresToDraw.forEach(function(object) {

		gl.useProgram(object.programInfo.program);

		// Setup buffers and attributes
		setBuffersAndAttributes(object.programInfo, object.pointsArray, object.colorsArray);

		// Set the uniforms
		setUniforms(object.programInfo, object.uniforms);

		// Draw
		gl.drawArrays(object.primitive, 0, object.pointsArray.length / 4);
    });	
    
	rotAngle += rotChange;
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
