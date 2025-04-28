/*
* 
* juego_3D_planetas.js
* Videojuegos (30262) - Curso 2024-2025
* 
*/

var spheresToDraw = [];

var planetas = [
];

/**
 * Crea un planeta.
 * 
 * ⚠️ **Restricción:** El eje `ejRot` **no puede ser igual** al eje `ejOrb` o `ejInc`.
 * 
 * @param {float} radioPlaneta - Tamaño del planeta.
 * @param {float} masaPlaneta - Masa del planeta.
 * @param {float} velRotMismo - Velocidad de rotación sobre si mismo.
 * @param {vec3} ejeRotMismo - Eje de rotación sobre si mismo.
 * @param {float} radioOrbita - Distancia al centro del sistema.
 * @param {float} velOrbita - Velocidad de rotación alrededor del centro del sistema.
 * @param {vec3} ejeOrbita - Eje sobre el que orbita el planeta
 * @param {vec3} ejeInclinacion - Eje sobre el que se inclina la orbita
 * @param {float} inclinacion - Inclinacion del eje sobre el que orbita
 * @param {float} arrayColor - Color del planeta
 */
function generar_planeta(radioPlaneta, masaPlaneta, velRotMismo, ejeRotMismo, radioOrbita, velOrbita, ejeOrbita, ejeInclinacion, inclinacion, posInit, arrayColor){

	if (ejeOrbita === ejeInclinacion) {
		throw new Error('⚠️ Los ejes ejeOrbita y ejeInclinacion no pueden ser iguales.');
	}

	// Inclinacion de la orbita
	let ejeDesplazamiento = cross(ejeOrbita, ejeInclinacion)

	let RInc = rotate(0, ejeDesplazamiento);
	let ejeInclinacionRotado =
		mult(RInc, vec4(ejeInclinacion[0], ejeInclinacion[1], ejeInclinacion[2], 0.0));

	let M_Rot_Inclinacion = 
		rotate(
			inclinacion, // Inclinacion de la orbita
			vec3(
				ejeInclinacionRotado[0],
				ejeInclinacionRotado[1],
				ejeInclinacionRotado[2]
			)
		);

	let M_Tras_R_Orb = translate(
		ejeDesplazamiento[0] * radioOrbita,
		ejeDesplazamiento[1] * radioOrbita,
		ejeDesplazamiento[2] * radioOrbita
	);

	// Escalado de tamaño
	let M_Escalado = scale(radioPlaneta, radioPlaneta, radioPlaneta);

	planetas.push({

		position: vec3(0,0,0),
		oldpos: vec3(0,0,0),
		velocity: vec3(0,0,0),

		vel_rot_mismo: velRotMismo,
		eje_rot_mismo: ejeRotMismo,
		pos_rot_mismo: 0.0,

		radio_orbita: radioOrbita,
		vel_orbita: velOrbita,
		eje_orbita: ejeOrbita,
		pos_orbita: posInit,

		// Matrices precalculadas
		matriz_traslacion_orbita: M_Tras_R_Orb,
		matriz_inclinacion_orbita: M_Rot_Inclinacion,
		matriz_escalado: M_Escalado,

		radius: radioPlaneta,
		mass: masaPlaneta,
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
generar_planeta(
	20, 100000, // radio, masa
	0.01, ejeZ, // Rotación sobre si mismo: vel, eje
	0.0, 0.0, ejeY, ejeX, 0, 0, // Rotación sobre orbita: radio, vel, eje, eje inclinacion, inclinacion, posInit
	colorsArraySun
);

// Planetas que orbitan
// Gemelos
generar_planeta(
	1.6, 1000, // radio, masa
	-0.01, ejeY, // Rotación sobre si mismo: vel, eje
	60.0, 0.01, ejeY, ejeZ, 0, 45, //normalize(vec3(1,2,0)), // Rotación sobre orbita: radio, vel, eje, eje inclinacion, inclinacion
	colorsArrayPlanet
);

// Lumbre
generar_planeta(
	2.5, 1000, // radio, masa
	-0.01, ejeY, // Rotación sobre si mismo: vel, eje
	90.0, 0.008, ejeY, ejeZ, 0, 90, //normalize(vec3(1,2,0)), // Rotación sobre orbita: radio, vel, eje, eje inclinacion, inclinacion
	colorsArrayPlanet
);

// Hondonada
generar_planeta(
	3, 1000, // radio, masa
	-0.01, ejeY, // Rotación sobre si mismo: vel, eje
	120.0, 0.004, ejeY, ejeZ, 0, 310, //normalize(vec3(1,2,0)), // Rotación sobre orbita: radio, vel, eje, eje inclinacion, inclinacion
	colorsArrayPlanet
);

// Abismo
generar_planeta(
	10, 1000, // radio, masa
	-0.01, ejeY, // Rotación sobre si mismo: vel, eje
	170.0, 0.002, ejeY, ejeZ, 0, 160, //normalize(vec3(1,2,0)), // Rotación sobre orbita: radio, vel, eje, eje inclinacion, inclinacion
	colorsArrayPlanet
);

// Espinoscuro
generar_planeta(
	8.5, 1000, // radio, masa
	-0.01, ejeY, // Rotación sobre si mismo: vel, eje
	200.0, 0.0002, ejeY, ejeZ, 0, 250,//normalize(vec3(1,2,0)), // Rotación sobre orbita: radio, vel, eje, eje inclinacion, inclinacion
	colorsArrayPlanet
);