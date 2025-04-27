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
 * @param {float} radioPlaneta - Tamaño del planeta.
 * @param {float} masaPlaneta - Masa del planeta.
 * @param {float} velRotMismo - Velocidad de rotación sobre si mismo.
 * @param {vec3} ejeRotMismo - Eje de rotación sobre si mismo.
 * @param {float} radioOrbita - Distancia al centro del sistema.
 * @param {float} velOrbita - Velocidad con la que orbita.
 * @param {vec3} ejeOrbita - Eje a traves del cual se traslada el planeta para colocarlo en la orbita.
 * @param {array} arrayColor - Colores del planeta
 */
function generar_planeta(radioPlaneta, masaPlaneta, velRotMismo, ejeRotMismo, radioOrbita, velOrbita, ejeOrbita, arrayColor){

	let M_Tras_R_Orb = translate(
		ejeOrbita[0] * radioOrbita,
		ejeOrbita[1] * radioOrbita,
		ejeOrbita[2] * radioOrbita
	);

	// Escalado de tamaño
	let M_Escalado = scale(radioPlaneta, radioPlaneta, radioPlaneta);

	planetas.push({

		position: vec3(0,0,0),

		vel_rot_mismo: velRotMismo,
		eje_rot_mismo: ejeRotMismo,
		pos_rot_mismo: 0.0,

		radio_orbita: radioOrbita,
		vel_orbita: velOrbita,
		eje_orbita: ejeOrbita,
		pos_orbita: 0.0,

		// Matrices precalculadas
		matriz_traslacion_orbita: M_Tras_R_Orb,
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
	0.0, 0.0, vec3(0,0,0), // Rotación sobre orbita: radio, vel, eje, 
	colorsArraySun
);

// Planetas que orbitan
generar_planeta(
	2, 1000, // radio, masa
	-0.01, ejeY, // Rotación sobre si mismo: vel, eje
	20.0, 0.02, ejeY, // Rotación sobre orbita: radio, vel, eje, 
	colorsArrayPlanet
);