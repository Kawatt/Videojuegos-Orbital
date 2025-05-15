/*
* 
* juego_3D_planetas.js
* Videojuegos (30262) - Curso 2024-2025
* 
*/

var spheresToDraw = [];

var planetas = [];

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

	// Inclinacion de la orbita - Eje perpendicular a la inclinacion y a la orbita
	// Con esto se consigue en que direccion se debe mover el planeta para que
	// este sobre la orbita pero en el plano inclinado
	let ejeDesplazamiento = cross(ejeOrbita, ejeInclinacion)

	// Crea una matriz de rotacion con cero grados para construir el vector como
	// vec4 (homogeneo)
	let RInc = rotate(0, ejeDesplazamiento);

	// Convierte el eje de inclinacion en un vec4 y lo transforma con la matriz
	// Con esto podemos rotar objetos en el espacio
	let ejeInclinacionRotado =
		mult(RInc, vec4(ejeInclinacion[0], ejeInclinacion[1], ejeInclinacion[2], 0.0));

	// Matriz de rotacion que inclina el plano de la orbita respecto a un eje determinado.
	// Esto hace que los planetas no orbiten en el mismo plano
	// En lugar de orbitar en el plano XZ, el planeta orbitara en un plano 
	// inclinado respecto al eje elegido
	let M_Rot_Inclinacion = 
		rotate(
			inclinacion, // Inclinacion de la orbita
			vec3(
				ejeInclinacionRotado[0],
				ejeInclinacionRotado[1],
				ejeInclinacionRotado[2]
			)
		);

	// Calcula la posicion del planeta a lo largo de la orbita multiplicaando
	// el eje perpendicular (eje desplazamiento) por la distancia al sol (radio)
	// Sirve para poner el planeta en la orbita, sino se quedaria en el origen
	let M_Tras_R_Orb = translate(
		ejeDesplazamiento[0] * radioOrbita,
		ejeDesplazamiento[1] * radioOrbita,
		ejeDesplazamiento[2] * radioOrbita
	);

	// Escalado de tamaño - Multiplica cada componente para que tenga el tamaño 
	// correcto
	let M_Escalado = scale(radioPlaneta, radioPlaneta, radioPlaneta);

	planetas.push({

		// Posiciones fisicas
		position: vec3(0,0,0),
		oldpos: vec3(0,0,0),
		velocity: vec3(0,0,0),

		// Rotacion sobre si mismo
		vel_rot_mismo: velRotMismo,
		eje_rot_mismo: ejeRotMismo,
		pos_rot_mismo: 0.0,

		// Parametros orbitales
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
		programInfo: programInfo,	// Info del shader
		pointsArray: pointsArray,	// Geometria de la esfera (vertices)
		colorsArray: arrayColor,	// Colores del planeta
		uniforms: {
			u_colorMult: [1.0, 1.0, 1.0, 1.0],	// Modificador del color
			u_model: new mat4(),	// Matrix del modelo (se rellena despues)
		},
		primType: "triangles",	// Tipo de primitiva para webgl
	});
}

// Sol central
generar_planeta(
	20, 50000, // radio, masa
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
	colorsArrayPlanet_1
);

// Lumbre
generar_planeta(
	2.5, 1000, // radio, masa
	-0.01, ejeY, // Rotación sobre si mismo: vel, eje
	90.0, 0.008, ejeY, ejeZ, 0, 90, //normalize(vec3(1,2,0)), // Rotación sobre orbita: radio, vel, eje, eje inclinacion, inclinacion
	colorsArrayPlanet_2
);

// Hondonada
generar_planeta(
	3, 1000, // radio, masa
	-0.01, ejeY, // Rotación sobre si mismo: vel, eje
	120.0, 0.004, ejeY, ejeZ, 0, 310, //normalize(vec3(1,2,0)), // Rotación sobre orbita: radio, vel, eje, eje inclinacion, inclinacion
	colorsArrayPlanet_3
);

// Abismo
generar_planeta(
	10, 1000, // radio, masa
	-0.01, ejeY, // Rotación sobre si mismo: vel, eje
	170.0, 0.002, ejeY, ejeZ, 0, 160, //normalize(vec3(1,2,0)), // Rotación sobre orbita: radio, vel, eje, eje inclinacion, inclinacion
	colorsArrayPlanet_4
);

// Espinoscuro
generar_planeta(
	8.5, 1000, // radio, masa
	-0.01, ejeY, // Rotación sobre si mismo: vel, eje
	200.0, 0.0002, ejeY, ejeZ, 0, 250,//normalize(vec3(1,2,0)), // Rotación sobre orbita: radio, vel, eje, eje inclinacion, inclinacion
	colorsArrayPlanet_5
);