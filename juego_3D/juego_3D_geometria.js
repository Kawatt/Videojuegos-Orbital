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
		let greenValue = Math.random()*0.4+0.2;//Math.random()*0.6+0.2;
		let redValue = 1.0;
		let blueValue = 0.0;
		ret.push([redValue, 0.3, 0.0, 1.0]);
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


// Disparos
const signalVerts = [
	[ 0.05, 0.05, 0.05, 1], //0
	[ 0.05, 0.05,-0.05, 1], //1
	[ 0.05,-0.05, 0.05, 1], //2
	[ 0.05,-0.05,-0.05, 1], //3
	[-0.05, 0.05, 0.05, 1], //4
	[-0.05, 0.05,-0.05, 1], //5
	[-0.05,-0.05, 0.05, 1], //6
	[-0.05,-0.05,-0.05, 1], //7
];

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
	white, white, white, white, white, white,
	white, white, white, white, white, white,
	white, white, white, white, white, white,
	white, white, white, white, white, white,
	white, white, white, white, white, white,
	white, white, white, white, white, white,
];	