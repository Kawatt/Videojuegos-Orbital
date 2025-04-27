/*
* 
* juego_3D_planetas.js
* Videojuegos (30262) - Curso 2024-2025
* 
*/

var spheresToDraw = [];

var planetas = [
];

function generar_planeta(radioPlaneta, masaPlaneta, velRotMismo, ejeRotMismo, radioOrbita, velOrbita, ejeOrbita, ejeInclinacion, inclinacion, arrayColor){

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
		pos_orbita: 0.0,

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
	10, 100000, // radio, masa
	0.01, ejeZ, // Rotación sobre si mismo: vel, eje
	0.0, 0.0, ejeY, ejeX, 0, // Rotación sobre orbita: radio, vel, eje, eje inclinacion, inclinacion
	colorsArraySun
);

// Planetas que orbitan
generar_planeta(
	2, 1000, // radio, masa
	-0.01, ejeY, // Rotación sobre si mismo: vel, eje
	20.0, 0.02, ejeY, ejeZ, 45, //normalize(vec3(1,2,0)), // Rotación sobre orbita: radio, vel, eje, eje inclinacion, inclinacion
	colorsArrayPlanet
);