/*
* 
* juego_3D_planetas.js
* Videojuegos (30262) - Curso 2024-2025
* 
*/


var signals = [
];

function generar_signal(radioOrbita, velOrbita, ejeOrbita, ejeInclinacion, inclinacion){

	if (ejeOrbita === ejeInclinacion) {
		throw new Error('⚠️ Los ejes ejeOrbita y ejeInclinacion no pueden ser iguales.');
	}

	let ejeDesplazamiento = cross(ejeOrbita, ejeInclinacion)

	let RInc = rotate(0, ejeDesplazamiento);
	let ejeInclinacionRotado =
		mult(RInc, vec4(ejeInclinacion[0], ejeInclinacion[1], ejeInclinacion[2], 0.0));

	let M_Rot_Inclinacion = 
		rotate(
			inclinacion,
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

	crear_objeto_y_modelo(
		{
			position: vec3(0,0,0),
	
			radio_orbita: radioOrbita,
			vel_orbita: velOrbita,
			eje_orbita: ejeOrbita,
			pos_orbita: 0.0,
	
			// Matrices precalculadas
			matriz_traslacion_orbita: M_Tras_R_Orb,
			matriz_inclinacion_orbita: M_Rot_Inclinacion,
		}, 
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
		signals
	)
}

generar_signal(20.0, 0.02, ejeY, ejeZ, 45);