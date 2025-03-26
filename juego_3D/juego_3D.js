/*
* 
* juego_3D.js
* Videojuegos (30262) - Curso 2024-2025
* 
*/

// Variable to store the WebGL rendering context
var gl;

// CONSTANTES
const ESCALA = 0.00001;
const VEL_MOVIMIENTO = 0.1 * ESCALA;
const VEL_GIRAR = 8 * ESCALA;
const MAX_VEL_GIRAR = 16000 * ESCALA;
const SENSITIVITY = 0.08;  // Sensibilidad del raton (mayor sensibilidad = mayor velocidad)
const BALL_LIFETIME = 200;
const SHOOTING_FORCE = 0.005;

const ejeX = vec3(1.0, 0.0, 0.0);
const ejeY = vec3(0.0, 1.0, 0.0);
const ejeZ = vec3(0.0, 0.0, 1.0);

var balls = [];

//----------------------------------------------------------------------------
// MODEL DATA 
//----------------------------------------------------------------------------

// AXIS
const pointsAxes = [];
pointsAxes.push([ 2.0, 0.0, 0.0, 1.0]); //x axis is green
pointsAxes.push([-2.0, 0.0, 0.0, 1.0]);
pointsAxes.push([ 0.0, 2.0, 0.0, 1.0]); //y axis is red
pointsAxes.push([ 0.0,-2.0, 0.0, 1.0]); 
pointsAxes.push([ 0.0, 0.0, 2.0, 1.0]); //z axis is blue
pointsAxes.push([ 0.0, 0.0,-2.0, 1.0]);
	
const default_color =	[0.5, 0.5, 0.5, 1.0];
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

// NAVES ENEMIGAS
const naveVerts = [
	[ 0.0, 0.0, 0.5, 1], //0 punta delantera
	[ 0.5, 0.0,-0.5, 1], //1
	[-0.5, 0.0,-0.5, 1], //2
	[ 0.0, 0.3,-0.3, 1], //3 ala
];

const naveIndices = [	
	//Solid Cube - use TRIANGLES
	0,1,2,
	0,1,3,
	0,2,3,
	1,2,3,
];

const pointsNave = [];
for (let i=0; i < naveIndices.length; i++)
{
	pointsNave.push(naveVerts[naveIndices[i]]);
}

let colorsNave = [	
	red, lightred, lightred, 
	red, lightred, lightred,
	red, lightred, lightred, 
	white, white, white,
]

// Disparos
const dispVerts = [
	[ 0.005, 0.005, 0.005, 1], //0
	[ 0.005, 0.005,-0.005, 1], //1
	[ 0.005,-0.005, 0.005, 1], //2
	[ 0.005,-0.005,-0.005, 1], //3
	[-0.005, 0.005, 0.005, 1], //4
	[-0.005, 0.005,-0.005, 1], //5
	[-0.005,-0.005, 0.005, 1], //6
	[-0.005,-0.005,-0.005, 1], //7
];

const dispIndices = [	
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

const pointsDisp = [];
for (let i=0; i < dispIndices.length; i++)
{
	pointsDisp.push(dispVerts[dispIndices[i]]);
}

const colorsDisp = [	
	white, white, white, white, white, white,
	white, white, white, white, white, white,
	white, white, white, white, white, white,
	white, white, white, white, white, white,
	white, white, white, white, white, white,
	white, white, white, white, white, white,
];	


// PLANETAS
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

    for (let tri of indices) {
        for (let idx of tri) {
            let v = vertices[idx];
            pointsArray.push(...v);
			
        }
    }

    return { pointsArray };
}

// Normalización de vectores
function normalize_new(v) {
    let len = Math.sqrt(v[0] ** 2 + v[1] ** 2 + v[2] ** 2);
    return [v[0] / len, v[1] / len, v[2] / len, 1.0];
}

// Generar esfera con 3 subdivisiones (más alto -> más detallado)
const { pointsArray } = generateIcosahedronSphere(3);

function arrayColorSun() {
	let ret = [];
	for (let i=0; i < pointsArray.length; i++) {
		let greenValue = Math.random()*0.6+0.2;
		let redValue = 1.0;
		let blueValue = 0.0;
		ret.push([redValue, greenValue, blueValue, 1.0]);
	}
	return ret;
}
var colorsArraySun = arrayColorSun()

function arrayColorPlanet() {
	let ret = [];
	for (let i=0; i < pointsArray.length; i++) {
		let greenValue = Math.random()*0.6+0.2;
		let blueValue = 1.0;
		let redValue = 0.0;
		ret.push([redValue, greenValue, blueValue, 1.0]);
	}
	return ret;
}
var colorsArrayPlanet = arrayColorPlanet()

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

//----------------------------------------------------------------------------
// OBJECTS TO DRAW 
//----------------------------------------------------------------------------

var objectsToDraw = [
	/*{ // AXIS
		programInfo: programInfo,
		pointsArray: pointsAxes, 
		colorsArray: colorsAxes, 
		uniforms: {
		  u_colorMult: [1.0, 1.0, 1.0, 1.0],
		  u_model: new mat4(),
		},
		primType: "lines",
	},*/
];
var spheresToDraw = [
];
var navesToDraw = [
];
var ballsToDraw = [
];


// Creación de planetas

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
	velOrbita, ejOrb, ejRot, ejInc, incOrb, incOrb2, arrayColor){
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
		colorsArray: arrayColor,
		uniforms: {
			u_colorMult: [1.0, 1.0, 1.0, 1.0],
			u_model: new mat4(),
		},
		primType: "triangles",
	});
}

// Sol central
generar_planeta(1, 0.0, 0.1, 0.0, 0, 0, ejeX, ejeY, ejeX, Math.random()*360, Math.random()*180, colorsArraySun);
// Planeta que orbita
generar_planeta(0.5, 0.0, 0.1, 0.0, 5, 0.1, ejeX, ejeZ, ejeX, 0, 0, colorsArrayPlanet);

// Creación de Naves enemigas

var naves = [];
function createNaveEnemiga() {
	naves.push({
		position: vec3(0.0,2.0,0.0),
		velocity: vec3(0.0,0.0,0.0),
		roll_velocity: 0.0,
		yaw_velocity: 0.0,
		pitch_velocity: 0.0,
	
		yaw: 0.0,
		pitch: 0.0,
		roll: 0.0,
		rot_yaw: 0.0,
		rot_pitch: 0.0,
		rot_roll: 0.0,
		eje_X_rot: vec3(1.0,0.0,0.0),
		eje_Y_rot: vec3(0.0,1.0,0.0),
		eje_Z_rot: vec3(0.0,0.0,1.0),
	
		target: vec3(0.0,0.0,0.0),
	});
	navesToDraw.push(
		{
			programInfo: programInfo,
			pointsArray: pointsNave, 
			colorsArray: colorsNave, 
			uniforms: {
			  u_colorMult: [1.0, 1.0, 1.0, 1.0],
			  u_model: new mat4(),
			},
			primType: "triangles",
		},
	)
}
createNaveEnemiga()

//------------------------------------------------------------------------------
// Nave jugador
//------------------------------------------------------------------------------

var jugador = {
	position: vec3(0.0, 0.0, -3.0),
	velocity: vec3(0.0, 0.0, 0.0),
	acceleration: vec3(0.0, 0.0, 0.0),
	yaw_velocity: 0.0,
	pitch_velocity: 0.0,
	roll_velocity: 0.0,

	yaw: 0.0,
	pitch: 0.0,
	roll: 0.0,
	eje_X_rot: vec3(1.0,0.0,0.0),
	eje_Y_rot: vec3(0.0,1.0,0.0),
	eje_Z_rot: vec3(0.0,0.0,1.0),

	rotation: vec3(0.0, 0.0, 0.0),
	diameter: 1.5,
}

//------------------------------------------------------------------------------
// Físicas
//------------------------------------------------------------------------------

function calcular_gravedad() {
	let gravedad = vec3(0.0,0.0,0.0);
	if (teclas_pulsadas.delante == 1) {
        gravedad = mult(VEL_MOVIMIENTO, jugador.eje_Z_rot);
    }
    if (teclas_pulsadas.atras == 1) {
        gravedad = mult(-VEL_MOVIMIENTO, jugador.eje_Z_rot);
    }
	if (teclas_pulsadas.arriba == 1) {
        gravedad = mult(VEL_MOVIMIENTO, jugador.eje_Y_rot);
    }
    if (teclas_pulsadas.abajo == 1) {
        gravedad = mult(-VEL_MOVIMIENTO, jugador.eje_Y_rot);
    }
    if (teclas_pulsadas.izquierda == 1) {
        gravedad = mult(VEL_MOVIMIENTO, jugador.eje_X_rot);
    }
    if (teclas_pulsadas.derecha == 1) {
        gravedad = mult(-VEL_MOVIMIENTO, jugador.eje_X_rot);
    }
	return gravedad;
}

/*function intersecta(punto, direccion, centro, radio) {
	// Variables del origen y dirección
    const [ox, oy, oz] = punto;
    const [dx, dy, dz] = direccion;
    const [cx, cy, cz] = centro;
    
    // Coeficientes de la ecuación cuadrática
    const A = dx * dx + dy * dy + dz * dz;
    const B = 2 * (dx * (ox - cx) + dy * (oy - cy) + dz * (oz - cz));
    const C = (ox - cx) ** 2 + (oy - cy) ** 2 + (oz - cz) ** 2 - radio ** 2;
    
    // Discriminante
    const discriminante = B * B - 4 * A * C;
    
    if (discriminante < 0) {
        // No hay intersección
        return null;
    }
    
    // Soluciones
    const t1 = (-B + Math.sqrt(discriminante)) / (2 * A);
    const t2 = (-B - Math.sqrt(discriminante)) / (2 * A);
    
    // Puntos de intersección
    const p1 = [ox + t1 * dx, oy + t1 * dy, oz + t1 * dz];
    const p2 = [ox + t2 * dx, oy + t2 * dy, oz + t2 * dz];
    
    // Si hay dos soluciones, devuelve ambos puntos
    return discriminante === 0;
}*/

//------------------------------------------------------------------------------
// IA
//------------------------------------------------------------------------------

//------------------------------------------------------------------------------
// Controles
//------------------------------------------------------------------------------

// 0 si ha sido soltada
// 1 si esta siendo pulsada
// 2 si se ha desabilitado la pulsación y es necesario volver a pulsar la tecla
// (solo disponible en parar)
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
	parar: 0,
	disparar: 0,
};

/**
 * Maneja la pulsación de teclas.
 */
function keyDownHandler(event) {
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
		case "z":
		case "Z":
			if (teclas_pulsadas.parar == 0) teclas_pulsadas.parar = 1;
			break;
		case "f":
		case "F":
			teclas_pulsadas.disparar = 1;
			break;
		default:
			console.log("UNHANDLED INPUT: " + event.key)
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
		case "z":
		case "Z":
			teclas_pulsadas.parar = 0;
			break;
		case "f":
		case "F":
			teclas_pulsadas.disparar = 0;
			break;
		default:
			break;
	}
}

/**
 * Calcula los ejes sobre los que se mueve y gira la cámara.
 */
function nuevo_eje_movimiento(nave) {

	let matriz_rot_yaw = rotate(nave.yaw, nave.eje_Y_rot);
    let matriz_rot_pitch = rotate(nave.pitch, nave.eje_X_rot);
    let matriz_rot_roll = rotate(nave.roll, nave.eje_Z_rot);

	let matriz_total = mult(matriz_rot_roll, mult(matriz_rot_yaw, matriz_rot_pitch));

	let newEjeX = mult(matriz_total, vec4(nave.eje_X_rot[0],nave.eje_X_rot[1],nave.eje_X_rot[2],0))
	let newEjeY = mult(matriz_total, vec4(nave.eje_Y_rot[0],nave.eje_Y_rot[1],nave.eje_Y_rot[2],0))
	let newEjeZ = mult(matriz_total, vec4(nave.eje_Z_rot[0],nave.eje_Z_rot[1],nave.eje_Z_rot[2],0))

	nave.yaw = 0;
	nave.pitch = 0;
	nave.roll = 0;
    
    nave.eje_X_rot = normalize(vec3(newEjeX[0],newEjeX[1],newEjeX[2]))
    nave.eje_Y_rot = normalize(vec3(newEjeY[0],newEjeY[1],newEjeY[2]))
    nave.eje_Z_rot = normalize(vec3(newEjeZ[0],newEjeZ[1],newEjeZ[2]))

}

function aplicarFuerzaOpuesta(dt, velocidad, vel_objetivo) {
	// Calcula el vector opuesto
	const velOPuesta = subtract(vel_objetivo, velocidad);

	const distancia = length(velOPuesta);

    // Si la distancia es casi cero, considera que ya se ha detenido
    if (distancia < 1e-5) {
		console.log("Velocidad Ajustada");
		teclas_pulsadas.parar = 2;
		return vel_objetivo;
	}
	
	const fuerzaOpuesta = mult(VEL_MOVIMIENTO * dt, normalize(velOPuesta));
	
    return add(velocidad, fuerzaOpuesta);
}

function reducirGiro(dt, factor, valor) {
    // Si el valor es casi cero, considera que ya se ha detenido
    if (Math.abs(valor) < 1e-5) return 0;

    // Asegura que no se invierta la dirección al llegar a 0
    const factorAplicado = Math.min(factor * dt, Math.abs(valor));

    // Reduce el valor hacia 0
    return valor - Math.sign(valor) * factorAplicado;
}

/**
 * Mueve o gira la cámara en función de las teclas presionadas.
 */
function mover_camara(dt) {
	if (teclas_pulsadas.parar == 1) {
        jugador.velocity = aplicarFuerzaOpuesta(dt, jugador.velocity, vec3(0,0,0));
    }
	if (teclas_pulsadas.girder == 1) {
		/*if (jugador.roll_velocity > -MAX_VEL_GIRAR)*/ jugador.roll_velocity += -VEL_GIRAR * dt
    }
	if (teclas_pulsadas.girizq == 1) {
		/*if (jugador.roll_velocity < MAX_VEL_GIRAR)*/ jugador.roll_velocity += VEL_GIRAR * dt
    }
	if (teclas_pulsadas.lookder == 1) {
		/*if (jugador.yaw_velocity < MAX_VEL_GIRAR)*/ jugador.yaw_velocity += VEL_GIRAR * dt
    }
	if (teclas_pulsadas.lookizq == 1) {
		/*if (jugador.yaw_velocity > -MAX_VEL_GIRAR)*/ jugador.yaw_velocity += -VEL_GIRAR * dt
    }
	if (teclas_pulsadas.lookup == 1) {
		/*if (jugador.pitch_velocity < MAX_VEL_GIRAR)*/ jugador.pitch_velocity += VEL_GIRAR * dt
    }
	if (teclas_pulsadas.lookdown == 1) {
		/*if (jugador.pitch_velocity > -MAX_VEL_GIRAR)*/ jugador.pitch_velocity += -VEL_GIRAR * dt
    }
	if ((teclas_pulsadas.girder == 0) & (teclas_pulsadas.girizq == 0)) {
		jugador.roll_velocity = reducirGiro(dt, VEL_GIRAR, jugador.roll_velocity)
    }
	if ((teclas_pulsadas.lookder == 0) & (teclas_pulsadas.lookizq == 0)) {
		jugador.yaw_velocity = reducirGiro(dt, VEL_GIRAR, jugador.yaw_velocity)
    }
	if ((teclas_pulsadas.lookup == 0) & (teclas_pulsadas.lookdown == 0)) {
		jugador.pitch_velocity = reducirGiro(dt, VEL_GIRAR, jugador.pitch_velocity)
    }

	/*
	if ((teclas_pulsadas.derecha == 0) & (teclas_pulsadas.izquierda == 0)) {
		jugador.velocity[0] = reducirGiro(dt, VEL_MOVIMIENTO, jugador.velocity[0])
    }
	if ((teclas_pulsadas.arriba == 0) & (teclas_pulsadas.abajo == 0)) {
		jugador.velocity[1] = reducirGiro(dt, VEL_MOVIMIENTO, jugador.velocity[1])
    }
	if ((teclas_pulsadas.delante == 0) & (teclas_pulsadas.atras == 0)) {
		jugador.velocity[2] = reducirGiro(dt, VEL_MOVIMIENTO, jugador.velocity[2])
    }*/
}

//------------------------------------------------------------------------------
// Rotacion de la camara
//------------------------------------------------------------------------------


let lastX = 0;  		// Posición X del ratón anterior
let lastY = 0;  		// Posición Y del ratón anterior
let raton_pulsado = 0; 	// 1 si el ratón está pulsado, 0 si no

/**
 * Detecta cuando se presiona el botón izquierdo del ratón.
 * Al presionar, guarda la posición inicial del cursor.
 */
/*document.addEventListener("mousedown", function(event) {
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
/*document.addEventListener("mouseup", function(event) {
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
/*document.addEventListener("mousemove", (event) => {
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
});*/

//----------------------------------------------------------------------------
// Initialization function
//----------------------------------------------------------------------------

var canvas;
var hud_distance_centerhud_distance_center;
var hud_velocity_target;
var hud_velocity;

window.onload = function init() {
	
	// Set up a WebGL Rendering Context in an HTML5 Canvas
	canvas = document.getElementById("gl-canvas");
	hud_distance_center = document.getElementById("hud_distance");
	hud_velocity_target = document.getElementById("hud_velocity_target");
	hud_velocity = document.getElementById("hud_velocity");
	gl = WebGLUtils.setupWebGL(canvas);
	if (!gl) {
		alert("WebGL isn't available");
	}

	//  Configure WebGL
	gl.clearColor(0.0, 0.0, 0.0, 1.0);
	gl.enable(gl.DEPTH_TEST);

	setPrimitive(objectsToDraw);
	setPrimitive(spheresToDraw);
	setPrimitive(navesToDraw);
	setPrimitive(ballsToDraw);

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
	
	window.addEventListener("keydown", keyDownHandler);
	window.addEventListener("keyup", keyReleasedHandler);
	
	//canvas.addEventListener("mouseenter", () => mouseInside = true);
	//canvas.addEventListener("mouseleave", () => mouseInside = false);
	
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

var cooldown = 0;
const MAX_COOLDOWN = 20;

function spawn_disparo(position, direction, velocity) {
	ballsToDraw.push(
		{
			programInfo: programInfo,
			pointsArray: pointsDisp, 
			colorsArray: colorsDisp, 
			uniforms: {
			  u_colorMult: [1.0, 1.0, 1.0, 1.0],
			  u_model: translate(0,0,0),
			},
			primType: "triangles",
		},
	);
	balls.push({
		position: add(position, mult(0.05, direction)),
		velocity: add(velocity, mult(SHOOTING_FORCE, direction)),
		direction: direction,
		lifetime: BALL_LIFETIME,
		index: 0,
		model: ballsToDraw[ballsToDraw.length-1]
	});
}
/**
 * Elimina un objeto y su modelo asociado
 * 
 * @param {array} models - Array de modelos
 * @param {array} objects - Array de objetos
 * @param {number} i - Indice del objeto a eliminar
 * 
 */
function remove_model_and_object(models, objects, i) {
	const indice = models.indexOf(objects[i].model);

	if (indice !== -1) {
		models.splice(indice, 1);
		objects.splice(i, 1);
	}
}
function handle_disparos(dt) {
	cooldown -= 1;
	for(let i=0; i < balls.length; i++){
		let ball = balls[i]
		//ball.velocity = add(ball.velocity, mult(dt * VEL_MOVIMIENTO * 2, ball.direction));
		ball.position = add(ball.position, mult(dt, ball.velocity));
		balls[i].lifetime -= 1;
		if (balls[i].lifetime <= 0) {
			remove_model_and_object(ballsToDraw, balls, i)
		}
	}
	if ((teclas_pulsadas.disparar == 1) && (cooldown <= 0)) {
		cooldown = MAX_COOLDOWN;
		const lateral = mult(0.05, jugador.eje_X_rot);
		spawn_disparo(add(jugador.position, lateral), jugador.eje_Z_rot, jugador.velocity)
		spawn_disparo(subtract(jugador.position, lateral), jugador.eje_Z_rot, jugador.velocity)
	}
}

function update_hud() {
	hud_distance_center.textContent = "Distancia al Sol: " + length(jugador.position).toFixed(4)
	hud_velocity_target.textContent = "Velocidad hacia el Sol: " + (-dot(jugador.velocity, normalize(jugador.position))).toFixed(4)
	hud_velocity.textContent = "Velocidad total: " + length(jugador.velocity).toFixed(4)
}

/**
 * Actualiza el estado de la simulación
 * 
 * @param {number} dt - Delta de tiempo transcurrido desde la última
 * actualización.
 * 
 */
function update(dt) {
	// Calculo rotación del jugador
	mover_camara(dt);
	jugador.yaw += jugador.yaw_velocity * dt;
	jugador.pitch += jugador.pitch_velocity * dt;
	jugador.roll += jugador.roll_velocity * dt;
	nuevo_eje_movimiento(jugador);
	// Calculo movimiento del jugador
	jugador.velocity = add(jugador.velocity, mult(dt, calcular_gravedad()));
	jugador.position = add(jugador.position, mult(dt, jugador.velocity));

	handle_disparos(dt)
	
	update_hud()

	//if (balls.length > 0) console.log(balls[0].velocity)

	for(let i=0; i < naves.length; i++){
		let nave = naves[i];

		nave.yaw_velocity = VEL_GIRAR * dt * 10
		nave.pitch_velocity = VEL_GIRAR * dt * 10
		nave.roll_velocity = VEL_GIRAR * dt * 10

		nave.yaw = nave.yaw_velocity * dt;
		nave.pitch = nave.pitch_velocity * dt;
		nave.roll = nave.roll_velocity * dt;
		nave.rot_yaw += nave.yaw;
		nave.rot_pitch += nave.pitch;
		nave.rot_roll += nave.roll;
		nuevo_eje_movimiento(nave);
		
		// Calculo movimiento de la nave
		//nave.velocity = add(nave.velocity, mult(dt * VEL_MOVIMIENTO/2, nave.eje_Z_rot));
		//nave.position = add(nave.position, mult(dt, nave.velocity));
	}

	//console.log("Pos: " + jugador.position + ", Vel: " + jugador.velocity + ", Grav: " + calcular_gravedad());
}

//----------------------------------------------------------------------------
// Rendering Event Function
//----------------------------------------------------------------------------

function renderObject(object, adjust) {
	gl.useProgram(object.programInfo.program);

	// Setup buffers and attributes
	setBuffersAndAttributes(object.programInfo, object.pointsArray, object.colorsArray);

	// Set the uniforms
	setUniforms(object.programInfo, object.uniforms);

	// Draw
	gl.drawArrays(object.primitive, 0, object.pointsArray.length / adjust);
}

function render(dt) {

	gl.clear(gl.DEPTH_BUFFER_BIT | gl.COLOR_BUFFER_BIT);

	eye = jugador.position;
	target = vec3(
		eye[0]+jugador.eje_Z_rot[0], 
		eye[1]+jugador.eje_Z_rot[1], 
		eye[2]+jugador.eje_Z_rot[2]);
	up = vec3(jugador.eje_Y_rot[0], jugador.eje_Y_rot[1], jugador.eje_Y_rot[2]);
	
	view = lookAt(eye, target, up);
    gl.uniformMatrix4fv(programInfo.uniformLocations.view, gl.FALSE, view);

	// Renderizado de planetas
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

	// Renderizado de naves
	for(let i=0; i < naves.length; i++){
		let nave = naves[i];
		// Reset a origen
		navesToDraw[i].uniforms.u_model = translate(0.0, 0.0, 0.0);
		// Mover a position
		navesToDraw[i].uniforms.u_model = translate(nave.position[0], nave.position[1], nave.position[2]);

		let RMZ = rotate(nave.rot_roll, ejeZ);
		navesToDraw[i].uniforms.u_model =
			mult(navesToDraw[i].uniforms.u_model, RMZ)
		;

		let RMY = rotate(nave.rot_yaw, ejeY);
		navesToDraw[i].uniforms.u_model =
			mult(navesToDraw[i].uniforms.u_model, RMY)
		;

		let RMX = rotate(nave.rot_pitch, ejeX);
		navesToDraw[i].uniforms.u_model =
			mult(navesToDraw[i].uniforms.u_model, RMX)
		;
	}

	for(let i=0; i < balls.length; i++){
		let ball = balls[i];
		ballsToDraw[i].uniforms.u_model = translate(ball.position[0], ball.position[1], ball.position[2]);
	}
	
	//----------------------------------------------------------------------------
	// DRAW
	//----------------------------------------------------------------------------

	objectsToDraw.forEach(function(object) {
		renderObject(object, 1)
    });	
	spheresToDraw.forEach(function(object) {
		renderObject(object, 4);
    });	
	navesToDraw.forEach(function(object) {
		renderObject(object, 1);
    });
	setPrimitive(ballsToDraw);
	ballsToDraw.forEach(function(object) {
		renderObject(object, 1);
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
