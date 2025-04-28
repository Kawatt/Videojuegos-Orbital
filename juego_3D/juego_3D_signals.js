/*
* 
* juego_3D_signals.js
* Videojuegos (30262) - Curso 2024-2025
* 
*/


var signals = [];

/**
 * Crea una señal.
 * 
 * ⚠️ **Restricción:** El eje `ejRot` **no puede ser igual** al eje `ejOrb` o `ejInc`.
 * 
 * @param {float} radioOrbita - Distancia al centro del sistema.
 * @param {float} velOrbita - Velocidad de rotación alrededor del centro del sistema.
 * @param {vec3} ejeOrbita - Eje sobre el que orbita el planeta
 * @param {vec3} ejeInclinacion - Eje sobre el que se inclina la orbita
 * @param {float} inclinacion - Inclinacion del eje sobre el que orbita
 */
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
			pointsArray: pointsSignal, 
			colorsArray: colorsSignal, 
			uniforms: {
			u_colorMult: [1.0, 1.0, 1.0, 1.0],
			u_model: translate(0,0,0),
			},
			primType: "triangles",
		}, 
		signals
	)
}

function generar_signal_aleatoria() {
	let rand = Math.floor(Math.random()*3)
	let rand2 = Math.floor(Math.random()*2)
	let ejOrb
	let ejInc
	if (rand == 1) {
		ejOrb = ejeX
		if (rand2 == 1) {
			ejInc = ejeY
		} else {
			ejInc = ejeZ
		}
	} else if (rand == 2) {
		ejOrb = ejeY
		if (rand2 == 1) {
			ejInc = ejeX
		} else {
			ejInc = ejeZ
		}
	} else {
		ejOrb = ejeZ
		if (rand2 == 1) {
			ejInc = ejeY
		} else {
			ejInc = ejeX
		}
	}
	let radio = (Math.random()*40)+planetas[0].radius;
	let vel_orb = Math.random()*0.09+0.01;
	let incl = Math.random()*360;
	generar_signal(radio, vel_orb, ejOrb, ejInc, incl);
	console.log("Generada señal con orbita de radio " + radio + " y velocidad orbital " + vel_orb + ".\n Orbitando sobre el eje " + ejOrb + " con inclinacion " + incl + " sobre el eje " + ejInc)
}