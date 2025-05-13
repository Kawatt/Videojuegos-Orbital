/*
* 
* juego_3D_geometria.js
* Videojuegos (30262) - Curso 2024-2025
* 
*/

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
const cyan = 		[0.0, 1.0, 1.0, 1.0];
const lightred =	[1.0, 0.5, 0.5, 1.0];
const lightgreen =	[0.5, 1.0, 0.5, 1.0];
const lightblue = 	[0.5, 0.5, 1.0, 1.0];
const white =		[1.0, 1.0, 1.0, 1.0];
const dirtyWhite =	[0.3, 0.3, 0.3, 1.0];

const colorsAxes = [
	green, green, //x
	red, red,     //y
	blue, blue,   //z
];		

// NAVES ENEMIGAS --------------------------------------------------------------
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

// Disparos --------------------------------------------------------------------
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



// PLANETAS --------------------------------------------------------------------

// Genera una esfera 3D suave a partir de un icosaedro (figura de 20 caras triangulares).
function generateIcosahedronSphere(subdivisions) {
	
	// Vértices iniciales del icosaedro
    const t = (1.0 + Math.sqrt(5.0)) / 2.0; // Para que esten distribuidos de manera equilibrada
    let vertices = [
        [-1, t, 0, 1.0], [1, t, 0, 1.0], [-1, -t, 0, 1.0], [1, -t, 0, 1.0],
        [0, -1, t, 1.0], [0, 1, t, 1.0], [0, -1, -t, 1.0], [0, 1, -t, 1.0],
        [t, 0, -1, 1.0], [t, 0, 1, 1.0], [-t, 0, -1, 1.0], [-t, 0, 1, 1.0],
    ];

    // Normalizar los vértices
	// Cada vertice se "empuja" hacia la superficie de una esfera haciendo que
	// todos queden a la misma distancia del centro -> forma REDONDA
    vertices = vertices.map(v => normalize_new(v));

    // Triángulos del icosaedro
    let indices = [
        [0, 11, 5], [0, 5, 1], [0, 1, 7], [0, 7, 10], [0, 10, 11],
        [1, 5, 9], [5, 11, 4], [11, 10, 2], [10, 7, 6], [7, 1, 8],
        [3, 9, 4], [3, 4, 2], [3, 2, 6], [3, 6, 8], [3, 8, 9],
        [4, 9, 5], [2, 4, 11], [6, 2, 10], [8, 6, 7], [9, 8, 1],
    ];

    // Subdivisión de triángulos
	// Cada triangulo se subdivide en cuatro mas pequeños para suavizar la esfera 
	// Para cada triangulo se calcula el punto medio de cada lado (AB, BC y CA)
	// Crea 4 triangulos usando los puntos calculados y el centro del triangulo
    for (let i = 0; i < subdivisions; i++) {
        let newIndices = []; // Triangulos resultantes de la subdivision
        let midPointCache = {}; // Puntos medios calculados

		// DEFINICION DE LA FUNCION: Obtiene el punto medio entre los vertices a y b
        function getMidPoint(a, b) {
            let key = a < b ? `${a}-${b}` : `${b}-${a}`;
			// Comprueba que este punto no se haya calculado ya
            if (midPointCache[key] !== undefined) {
                return midPointCache[key];
            }

			// Normaliza los nuevos vertices para que esten sobre la esfera
            let mid = normalize_new([
                (vertices[a][0] + vertices[b][0]) / 2,
                (vertices[a][1] + vertices[b][1]) / 2,
                (vertices[a][2] + vertices[b][2]) / 2,
                1.0
            ]);

			// Guarda el vertice en el array de vertices
            let index = vertices.length;
            vertices.push(mid);
            midPointCache[key] = index;
            return index;
        }

		// Para cada triangulo, realiza la subdivision en 4
        for (let tri of indices) {
            let a = tri[0], b = tri[1], c = tri[2];
            let ab = getMidPoint(a, b);
            let bc = getMidPoint(b, c);
            let ca = getMidPoint(c, a);

			// Guarda los nuevos triangulos en el array 
            newIndices.push([a, ab, ca], [b, bc, ab], [c, ca, bc], [ab, bc, ca]);
        }

		// Establece el array de vertices al nuevo
        indices = newIndices;
    }

    // Convertir los datos a buffers planos para pasarlo a WebGL
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
// Normaliza un vector 3D para que tenga longitud 1, es decir, lo proyecta
// sobre una esfera de radio 1.
function normalize_new(v) {
    let len = Math.sqrt(v[0] ** 2 + v[1] ** 2 + v[2] ** 2);
    return [v[0] / len, v[1] / len, v[2] / len, 1.0];
}

// Generar esfera con 3 subdivisiones (más alto -> más detallado)
const { pointsArray } = generateIcosahedronSphere(3);

// Crea un array para dar color al sol (R=1, G=0.3, B=0, Opacidad = 1) 
function arrayColorSun() {
	let ret = [];
	for (let i=0; i < pointsArray.length; i++) {
		let greenValue = Math.random()*0.4+0.3; //Math.random()*0.4+0.2;
		let redValue = 1.0;
		let blueValue = 0.0;
		ret.push([redValue, greenValue, 0.0, 1.0]);
	}
	return ret;
}
var colorsArraySun = arrayColorSun()

//Mercurio 0.8, 0.8, 0.8
function arrayColorPlanet_1() {
	let ret = [];
	for (let i=0; i < pointsArray.length; i++) {
		let redValue = Math.random()*0.4+0.4;
		let greenValue =  Math.random()*0.4+0.4;
		let blueValue = Math.random()*0.4+0.4;
		ret.push([redValue, greenValue, blueValue, 1.0]);
	}
	return ret;
}

// Venus 0.9, 0.6, 0.2
function arrayColorPlanet_2() {
	let ret = [];
	for (let i=0; i < pointsArray.length; i++) {
		let redValue = Math.random()*0.3+0.7;
		let greenValue =  Math.random()*0.2+0.4;
		let blueValue = Math.random()*0.2+0.2;
		ret.push([redValue, greenValue, blueValue, 1.0]);
	}
	return ret;
}

// Tierra
function arrayColorPlanet_3() {
	let ret = [];
	for (let i=0; i < pointsArray.length; i++) {
		let redValue = Math.random()*0.1;
		let greenValue = Math.random()*0.2+0.3;
		let blueValue = Math.random()*0.1+0.2;
		ret.push([redValue, greenValue, blueValue, 1.0]);
	}
	return ret;
}

// Jupiter - 1.0, 0.9, 0.5
function arrayColorPlanet_4() {
	let ret = [];
	for (let i=0; i < pointsArray.length; i++) {
		let redValue = Math.random()*0.1+0.9;
		let greenValue =  Math.random()*0.2+0.7;
		let blueValue = Math.random()*0.2+0.3;
		ret.push([redValue, greenValue, blueValue, 1.0]);
	}
	return ret;
}

// Saturno - 0.9, 0.9, 0.6
function arrayColorPlanet_5() {
	let ret = [];
	for (let i=0; i < pointsArray.length; i++) {
		let greenValue = Math.random()*0.2+0.7;
		let blueValue =  Math.random()*0.2+0.7;
		let redValue = 0.6;
		ret.push([redValue, greenValue, blueValue, 1.0]);
	}
	return ret;
}

var colorsArrayPlanet_1 = arrayColorPlanet_1()
var colorsArrayPlanet_2 = arrayColorPlanet_2()
var colorsArrayPlanet_3 = arrayColorPlanet_3()
var colorsArrayPlanet_4 = arrayColorPlanet_4()
var colorsArrayPlanet_5 = arrayColorPlanet_5()

// Señales ---------------------------------------------------------------------
const signal_scale = 4 // Permite escalar las señales facilmente
const signalVerts = [
	[ 0.2, 0.2, 0.2, 1], //0
	[ 0.2, 0.2,-0.2, 1], //1
	[ 0.2,-0.2, 0.2, 1], //2
	[ 0.2,-0.2,-0.2, 1], //3
	[-0.2, 0.2, 0.2, 1], //4
	[-0.2, 0.2,-0.2, 1], //5
	[-0.2,-0.2, 0.2, 1], //6
	[-0.2,-0.2,-0.2, 1], //7
].map(v => [v[0]*signal_scale, v[1]*signal_scale, v[2]*signal_scale, v[3]]);

const signalIndices = [	
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

const pointsSignal = [];
for (let i=0; i < signalIndices.length; i++)
{
	pointsSignal.push(signalVerts[signalIndices[i]]);
}

const colorsSignal = [	
	cyan, cyan, cyan, cyan, cyan, cyan,
	cyan, cyan, cyan, cyan, cyan, cyan,
	cyan, cyan, cyan, cyan, cyan, cyan,
	cyan, cyan, cyan, cyan, cyan, cyan,
	cyan, cyan, cyan, cyan, cyan, cyan,
	cyan, cyan, cyan, cyan, cyan, cyan,
];	


// OTROS -----------------------------------------------------------------------

const estrella_scale = 3 // Permite escalar las señales facilmente
const estrellasVertices = [
	[ 0.2, 0.2, 0.2, 1], //0
	[ 0.2, 0.2,-0.2, 1], //1
	[ 0.2,-0.2, 0.2, 1], //2
	[ 0.2,-0.2,-0.2, 1], //3
	[-0.2, 0.2, 0.2, 1], //4
	[-0.2, 0.2,-0.2, 1], //5
	[-0.2,-0.2, 0.2, 1], //6
	[-0.2,-0.2,-0.2, 1], //7
].map(v => [v[0]*estrella_scale, v[1]*estrella_scale, v[2]*estrella_scale, v[3]]);

const estrellasIndices = [	
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

const color_estrellas = [	
	dirtyWhite, dirtyWhite, dirtyWhite, dirtyWhite, dirtyWhite, dirtyWhite,
	dirtyWhite, dirtyWhite, white, dirtyWhite, white, dirtyWhite,
	white, dirtyWhite, dirtyWhite, dirtyWhite, dirtyWhite, dirtyWhite,
	dirtyWhite, dirtyWhite, dirtyWhite, white, dirtyWhite, white,
	dirtyWhite, white, dirtyWhite, dirtyWhite, dirtyWhite, dirtyWhite,
	dirtyWhite, dirtyWhite, white, dirtyWhite, dirtyWhite, dirtyWhite,
];	

const puntosEstrellas = [];
for (let i=0; i < estrellasIndices.length; i++)
{
	puntosEstrellas.push(estrellasVertices[estrellasIndices[i]]);
}