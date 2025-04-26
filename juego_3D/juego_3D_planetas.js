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
function generar_planeta(radioPlaneta, masaPlaneta, velRotX, velRotY, velRotZ, radioOrbita, 
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

		matriz_inclinacion_orbita: M_Rot_Inclinacion,
		matriz_traslacion_orbita: M_Tras_R_Orb,
		Matriz_Escalado: M_Escalado,
		radioOrbita: radioOrbita,

		radius: radioPlaneta,
		mass: masaPlaneta,
		position: vec3(0,0,0),
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
generar_planeta(10, 100000, 0.0, 0.1, 0.0, 0, 0, ejeX, ejeY, ejeX, Math.random()*360, Math.random()*180, colorsArraySun);
// Planeta que orbita
generar_planeta(2, 1000, 0.0, 0.1, 0.0, 20, 0.2, ejeX, ejeZ, ejeY, 90, 30, colorsArrayPlanet);