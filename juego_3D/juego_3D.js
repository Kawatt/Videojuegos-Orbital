/*
* 
* juego_3D.js
* Videojuegos (30262) - Curso 2024-2025
* 
*/

// Variable to store the WebGL rendering context
var gl;

//----------------------------------------------------------------------------
// MODEL DATA 
//----------------------------------------------------------------------------

const VEL_MOVIMIENTO = 0.1;
const VEL_ROTACION = 0.4;
const VEL_MIRAR = 1.2;
const SENSITIVITY = 0.08;  // Sensibilidad del raton (mayor sensibilidad = mayor velocidad)

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
                1.0
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
            pointsArray.push(...v);

			let greenValue = Math.random()*0.6+0.2;
			let redValue = 1.0;
			let blueValue = 0.0;
			colorsArray.push(redValue, greenValue, blueValue, 1.0);
			
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
    return [v[0] / len, v[1] / len, v[2] / len, 1.0];
}

// Generar esfera con 3 subdivisiones (más alto -> más detallado)
const { pointsArray, colorsArray } = generateIcosahedronSphere(3);

var planetas = [
];

/**
 * Crea un planeta.
 * 
 * ⚠️ **Restricción:** El eje `ejRot` **no puede ser igual** al eje `ejOrb` o `ejInc`.
 * 
 * @param {float} radioPlaneta - Tamaño del planeta.
 * @param {float} velRotX - Velocidad de rotación en su eje X.
 * @param {float} velRotY - Velocidad de rotación en su eje Y.
 * @param {float} velRotZ - Velocidad de rotación en su eje Z.
 * @param {float} radioOrbita - Distancia al centro del sistema.
 * @param {float} velOrbita - Velocidad de rotación alrededor del centro del sistema.
 * @param {eje} ejOrb - Eje a traves del cual se traslada el planeta para colocarlo en la orbita.
 * @param {eje} ejRot - Eje de rotacion de la orbita
 * @param {eje} ejInc - Eje que se va a rotar para obtener el eje de inclinacion
 * @param {float} incOrb - Inclinacion del eje sobre el que orbita
 * @param {float} incOrb2 - Inclinacion extra de la orbita
 */
function generar_planeta(radioPlaneta, velRotX, velRotY, velRotZ, radioOrbita, 
	velOrbita, ejOrb, ejRot, ejInc, incOrb, incOrb2){
	if (ejRot === ejOrb) {
		throw new Error('⚠️ Los ejes ejRot y ejOrb no pueden ser iguales.');
	}
	if (ejRot === ejInc) {
		throw new Error('⚠️ Los ejes ejRot y ejInc no pueden ser iguales.');
	}

	// Inclinacion de la orbita
	let RInc = rotate(incOrb, ejOrb);			
	let ejeInclinacionRotado =
		mult(RInc, vec4(ejInc[0], ejInc[1], ejInc[2], 0.0))
	;

	let M_Rot_Inclinacion = 
		rotate(
			Math.floor(incOrb2), // Inclinacion de la orbita
			vec3(
				ejeInclinacionRotado[0],
				ejeInclinacionRotado[1],
				ejeInclinacionRotado[2]
			)
		)
	;

	// Traslación
	M_Tras_R_Orb = translate(
		ejOrb[0] * radioOrbita,
		ejOrb[1] * radioOrbita,
		ejOrb[2] * radioOrbita
	);

	// Escalado de tamaño
	let M_Escalado = scale(radioPlaneta, radioPlaneta, radioPlaneta);

	planetas.push({
		ejeOrbita: ejOrb,//ejOrb, // Eje sobre desplaza
		ejeRotOrbita: ejRot,//ejRot, // Eje sobre el que se rota

		velRotXMismo: velRotX, // Velocidad de rotacion sobre si mismo
		velRotYMismo: velRotY,
		velRotZMismo: velRotZ,
		posRotXMismo: 0.0, // Rotacion actual sobre si mismo
		posRotYMismo: 0.0,
		posRotZMismo: 0.0,
		
		velRotOrbita: velOrbita, // Velocidad rotacion en la orbita
		posRotOrbita: 0.0, // Rotacion actual en la orbita

		Matriz_Inclinacion_Orbita: M_Rot_Inclinacion,
		Matriz_Traslacion_R_Orbita: M_Tras_R_Orb,
		Matriz_Escalado: M_Escalado
	});

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
}

// Sol central
generar_planeta(1, 0.0, 0.1, 0.0, 0, 0, ejeX, ejeY, ejeX, Math.random()*360, Math.random()*180);
// Planeta que orbita
generar_planeta(1, 0.0, 0.1, 0.0, 5, 0.1, ejeX, ejeZ, ejeX, 0, 0);

//------------------------------------------------------------------------------
// Nave jugador
//------------------------------------------------------------------------------

var jugador = {
	position: vec3(0.0, 0.0, -3.0),
	velocity: vec3(0.0, 0.0, 0.0),
	acceleration: vec3(0.0, 0.0, 0.0),
	angular_velocity: vec3(0.0, 0.0, 0.0),
	rotation: vec3(0.0, 0.0, 0.0),
	diameter: 1.5,
}

//------------------------------------------------------------------------------
// Controles
//------------------------------------------------------------------------------

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
	lookder: 0,
	lookizq: 0,
	lookup: 0,
	lookdown: 0,
};

/**
 * Maneja la pulsación de teclas.
 */
function keyPressedHandler(event) {
    switch(event.key) {
		//case "ArrowUp":
		case "w":
		case "W":
			teclas_pulsadas.delante = 1;
			break;
		//case "ArrowDown":
		case "s":
		case "S":
			teclas_pulsadas.atras = 1;
			break;
		//case "ArrowLeft":
		case "a":
		case "A":
			teclas_pulsadas.izquierda = 1;
			break;
		//case "ArrowRight":
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
		case "ArrowUp":
			teclas_pulsadas.lookup = 1;
			break;
		case "ArrowDown":
			teclas_pulsadas.lookdown = 1;
			break;
		case "ArrowRight":
			teclas_pulsadas.lookder = 1;
			break;
		case "ArrowLeft":
			teclas_pulsadas.lookizq = 1;
			break;
		default:
			console.log("tecla pulsada: " + event.key)
			break;
	}
}

/**
 * Maneja la liberación de teclas.
 */
function keyReleasedHandler(event) {
    switch(event.key) {
		//case "ArrowUp":
		case "w":
		case "W":
			teclas_pulsadas.delante = 0;
			break;
		//case "ArrowDown":
		case "s":
		case "S":
			teclas_pulsadas.atras = 0;
			break;
		//case "ArrowLeft":
		case "a":
		case "A":
			teclas_pulsadas.izquierda = 0;
			break;
		//case "ArrowRight":
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
		case "ArrowUp":
			teclas_pulsadas.lookup = 0;
			break;
		case "ArrowDown":
			teclas_pulsadas.lookdown = 0;
			break;
		case "ArrowRight":
			teclas_pulsadas.lookder = 0;
			break;
		case "ArrowLeft":
			teclas_pulsadas.lookizq = 0;
			break;
		default:
			break;
	}
}

// Ejes de movimiento y rotación
var eje_X_rotado = vec3(ejeX[0], ejeX[1], ejeX[2]);
var eje_Y_rotado = vec3(ejeY[0], ejeY[1], ejeY[2]);
var eje_Z_rotado = vec3(ejeZ[0], ejeZ[1], ejeZ[2]);

/**
 * Calcula los ejes sobre los que se mueve y gira la cámara.
 */
function nuevo_eje_movimiento() {

	let matriz_rot_yaw = rotate(yaw, eje_Y_rotado);
    let matriz_rot_pitch = rotate(pitch, eje_X_rotado);
    let matriz_rot_roll = rotate(roll, eje_Z_rotado);

	let matriz_total = mult(matriz_rot_roll, mult(matriz_rot_yaw, matriz_rot_pitch));

	let ejeX4 = mult(matriz_total, vec4(eje_X_rotado[0],eje_X_rotado[1],eje_X_rotado[2],0))
	let ejeY4 = mult(matriz_total, vec4(eje_Y_rotado[0],eje_Y_rotado[1],eje_Y_rotado[2],0))
	let ejeZ4 = mult(matriz_total, vec4(eje_Z_rotado[0],eje_Z_rotado[1],eje_Z_rotado[2],0))

	yaw = 0;
	pitch = 0;
	roll = 0;
    
    eje_X_rotado = normalize(vec3(ejeX4[0],ejeX4[1],ejeX4[2]))
    eje_Y_rotado = normalize(vec3(ejeY4[0],ejeY4[1],ejeY4[2]))
    eje_Z_rotado = normalize(vec3(ejeZ4[0],ejeZ4[1],ejeZ4[2]))

}

/**
 * Mueve o gira la cámara en función de las teclas presionadas.
 */
function mover_camara() {
	if (teclas_pulsadas.delante == 1) {
        eye[0] += VEL_MOVIMIENTO * eje_Z_rotado[0];
        eye[1] += VEL_MOVIMIENTO * eje_Z_rotado[1];
		eye[2] += VEL_MOVIMIENTO * eje_Z_rotado[2];
    }
    if (teclas_pulsadas.atras == 1) {
        eye[0] -= VEL_MOVIMIENTO * eje_Z_rotado[0];
        eye[1] -= VEL_MOVIMIENTO * eje_Z_rotado[1];
		eye[2] -= VEL_MOVIMIENTO * eje_Z_rotado[2];
    }
	if (teclas_pulsadas.arriba == 1) {
        eye[0] += VEL_MOVIMIENTO * eje_Y_rotado[0];
        eye[1] += VEL_MOVIMIENTO * eje_Y_rotado[1];
		eye[2] += VEL_MOVIMIENTO * eje_Y_rotado[2];
    }
    if (teclas_pulsadas.abajo == 1) {
        eye[0] -= VEL_MOVIMIENTO * eje_Y_rotado[0];
        eye[1] -= VEL_MOVIMIENTO * eje_Y_rotado[1];
		eye[2] -= VEL_MOVIMIENTO * eje_Y_rotado[2];
    }
    if (teclas_pulsadas.izquierda == 1) {
		eye[0] += VEL_MOVIMIENTO * eje_X_rotado[0];
        eye[1] += VEL_MOVIMIENTO * eje_X_rotado[1];
        eye[2] += VEL_MOVIMIENTO * eje_X_rotado[2];
    }
    if (teclas_pulsadas.derecha == 1) {
		eye[0] -= VEL_MOVIMIENTO * eje_X_rotado[0];
        eye[1] -= VEL_MOVIMIENTO * eje_X_rotado[1];
        eye[2] -= VEL_MOVIMIENTO * eje_X_rotado[2];
    }
	if (teclas_pulsadas.girder == 1) {
		roll -= VEL_ROTACION
    }
	if (teclas_pulsadas.girizq == 1) {
		roll += VEL_ROTACION
    }
	if (teclas_pulsadas.lookder == 1) {
		yaw += VEL_MIRAR
    }
	if (teclas_pulsadas.lookizq == 1) {
		yaw -= VEL_MIRAR
    }
	if (teclas_pulsadas.lookup == 1) {
		pitch += VEL_MIRAR
    }
	if (teclas_pulsadas.lookdown == 1) {
		pitch -= VEL_MIRAR
    }
}

//------------------------------------------------------------------------------
// Rotacion de la camara
//------------------------------------------------------------------------------


let lastX = 0;  		// Posición X del ratón anterior
let lastY = 0;  		// Posición Y del ratón anterior
let pitch = 0.0;        // Ángulo de pitch (rotacion sobre eje X)
let yaw = 0.0;          // Ángulo de yaw (rotacion sobre eje Y)
let roll = 0.0;         // Ángulo de roll (rotacion sobre eje Z)
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
 * Maneja el evento de movimiento del ratón para actualizar los ángulos de la 
 * cámara. Solo se ejecuta si el botón del ratón está presionado. Calcula el 
 * desplazamiento del cursor y ajusta los valores de yaw y pitch según la 
 * sensibilidad configurada.
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
		yaw += offsetX * SENSITIVITY;
		pitch -= offsetY * SENSITIVITY;
    }
});

//----------------------------------------------------------------------------
// Initialization function
//----------------------------------------------------------------------------

var canvas;

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
	eye = new vec3(jugador.position[0],jugador.position[1],jugador.position[2]);
	target =  vec3(0.0, 0.0, 0.0);
	up =  vec3(0.0, 1.0, 0.0);
	view = lookAt(eye,target,up);

	// Establecer la proyeccion perspectiva por defecto
	projection = perspective(45.0, canvas.width/canvas.height, 0.1, 100.0 );

	gl.uniformMatrix4fv( programInfo.uniformLocations.projection, gl.FALSE, projection );
	gl.uniformMatrix4fv(programInfo.uniformLocations.view, gl.FALSE, view);
	
	window.addEventListener("keydown", keyPressedHandler);
	window.addEventListener("keyup", keyReleasedHandler);
	
	canvas.addEventListener("mouseenter", () => mouseInside = true);
	canvas.addEventListener("mouseleave", () => mouseInside = false);
	
	lastTick = Date.now();
	requestAnimFrame(tick);
};

//----------------------------------------------------------------------------
// Tick Event Function
//----------------------------------------------------------------------------

var lastTick;

function tick(nowish) {
	var now = Date.now();

    var dt = now - lastTick;
    lastTick = now;

	update(dt)
	render(dt)

	window.requestAnimationFrame(tick)
}

//----------------------------------------------------------------------------
// Update Event Function
//----------------------------------------------------------------------------

/**
 * Actualiza el estado de la simulación
 * 
 * @param {number} dt - Delta de tiempo transcurrido desde la última
 * actualización.
 * 
 */
function update(dt) {
	jugador.position = add(jugador.position, mult(dt, jugador.velocity))
}

//----------------------------------------------------------------------------
// Rendering Event Function
//----------------------------------------------------------------------------

function render(dt) {

	gl.clear(gl.DEPTH_BUFFER_BIT | gl.COLOR_BUFFER_BIT);

	mover_camara();
	nuevo_eje_movimiento();

	target = vec3(
		eye[0]+eje_Z_rotado[0], 
		eye[1]+eje_Z_rotado[1], 
		eye[2]+eje_Z_rotado[2]);
	up = vec3(eje_Y_rotado[0], eje_Y_rotado[1], eje_Y_rotado[2]);
	
	view = lookAt(eye, target, up);
    gl.uniformMatrix4fv(programInfo.uniformLocations.view, gl.FALSE, view);

	for(let i=0; i < planetas.length; i++){
		// Reset a origen
		spheresToDraw[i].uniforms.u_model = translate(0.0, 0.0, 0.0);
		
		// Inclinacion de la orbita
		spheresToDraw[i].uniforms.u_model =
			mult(
				spheresToDraw[i].uniforms.u_model,
				planetas[i].Matriz_Inclinacion_Orbita
			)
		;

		// Desplazamiento en la orbita
		let ROrb = rotate(planetas[i].posRotOrbita, planetas[i].ejeRotOrbita);
		spheresToDraw[i].uniforms.u_model = 
			mult(spheresToDraw[i].uniforms.u_model, ROrb)
		;

		// Traslación
		spheresToDraw[i].uniforms.u_model = 
			mult(
				spheresToDraw[i].uniforms.u_model,
				planetas[i].Matriz_Traslacion_R_Orbita
			)
		;

		// Rotación sobre si mismo en los 3 ejes
		let RMZ = rotate(planetas[i].posRotZMismo, ejeZ);
		spheresToDraw[i].uniforms.u_model =
			mult(spheresToDraw[i].uniforms.u_model, RMZ)
		;

		let RMY = rotate(planetas[i].posRotYMismo, ejeY);
		spheresToDraw[i].uniforms.u_model =
			mult(spheresToDraw[i].uniforms.u_model, RMY)
		;

		let RMX = rotate(planetas[i].posRotXMismo, ejeX);
		spheresToDraw[i].uniforms.u_model =
			mult(spheresToDraw[i].uniforms.u_model, RMX)
		;
		
		// Escalado de tamaño
		spheresToDraw[i].uniforms.u_model = 
			mult(spheresToDraw[i].uniforms.u_model, planetas[i].Matriz_Escalado)
		;
	}
	
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
	for (let i=0; i < planetas.length; i++) {
		planetas[i].posRotOrbita += planetas[i].velRotOrbita
		planetas[i].posRotXMismo += planetas[i].velRotXMismo
		planetas[i].posRotYMismo += planetas[i].velRotYMismo
		planetas[i].posRotZMismo += planetas[i].velRotZMismo
	}
	
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
