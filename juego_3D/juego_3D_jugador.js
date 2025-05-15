/*
* 
* juego_3D_jugador.js
* Videojuegos (30262) - Curso 2024-2025
* 
*/

var vuelo_sencillo = 0; // la nave ajusta constantemente la velocidad si es 1
var selected_planet = planetas[0]

var jugador = {

	position: INITIAL_POSITION,
	velocity: vec3(0.0, 0.0, 0.0),
	acceleration: vec3(0.0, 0.0, 0.0),

	// Propiedades de rotacion
	yaw: 0.0,
	pitch: 0.0,
	roll: 0.0,
	yaw_velocity: 0.0,
	pitch_velocity: 0.0,
	roll_velocity: 0.0,
	rot_yaw: 0.0,
	rot_pitch: 0.0,
	rot_roll: 0.0,

	eje_X_rot: vec3(1.0,0.0,0.0),
	eje_Y_rot: vec3(0.0,1.0,0.0),
	eje_Z_rot: vec3(0.0,0.0,1.0),

	radius: JUGADOR_RADIO,
	mass: JUGADOR_MASA
}

function reset_jugador() {

	jugador.position = INITIAL_POSITION,
	jugador.velocity = vec3(0.0, 0.0, 0.0),
	jugador.acceleration = vec3(0.0, 0.0, 0.0),

	jugador.yaw = 0.0;
	jugador.pitch = 0.0;
	jugador.roll = 0.0;
	jugador.yaw_velocity = 0.0,
	jugador.pitch_velocity = 0.0,
	jugador.roll_velocity = 0.0,
	jugador.rot_yaw = 0.0;
	jugador.rot_pitch = 0.0;
	jugador.rot_roll = 0.0;

	jugador.eje_X_rot = vec3(1.0,0.0,0.0);
	jugador.eje_Y_rot = vec3(0.0,1.0,0.0);
	jugador.eje_Z_rot = vec3(0.0,0.0,1.0);

}

// Selecciona el planeta que este mas cerca del jugador
function seleccionar_planeta() {
	var ant = Infinity;
	for (let planeta of planetas) {
		let interseccion = intersecta(jugador.position, jugador.eje_Z_rot, planeta.position, planeta.radius);
		if (interseccion.intersecta) {
			if (interseccion.dist < ant) {
				selected_planet = planeta
				ant = interseccion.dist
			}
		}
	}
}

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
			//teclas_pulsadas.disparar = 1;
			seleccionar_planeta()
			break;
		case "r":
		case "R":
			reset_jugador();
			break;
		default:
			console.log("UNHANDLED INPUT: " + event.key)
			break;
	}
}
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
			hud_ajustar_vel.style.display = 'none'
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

    let matriz_rot_pitch = rotate(nave.pitch, nave.eje_X_rot);
	let matriz_rot_yaw = rotate(nave.yaw, nave.eje_Y_rot);
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

/**
 * Calcula yaw, pitch y roll según la velocidad de rotación
 * 
 * @param {*} nave Nave de la que calcular las rotaciones
 * @param {*} dt Deltatime
 */
function calcular_rotacion(nave, dt) {
	nave.yaw += nave.yaw_velocity * dt;
	nave.pitch += nave.pitch_velocity * dt;
	nave.roll += nave.roll_velocity * dt;
}

/**
 * Calcula la velocidad y posición de la nave según las fuerzas
 * 
 * @param {*} nave Nave de la que calcular la velocidad
 * @param {*} dt Deltatime
 */
function calcular_movimiento_jugador(nave, dt) {
	nave.velocity = add(nave.velocity, mult(dt, add(fuerza_motores(nave), calcular_gravedad(planetas, nave))));
	nave.position = add(nave.position, mult(dt, nave.velocity));
}

function fuerza_motores(nave) {
	let fuerza = vec3(0.0,0.0,0.0);
	if (teclas_pulsadas.delante == 1) {
        fuerza = mult(VEL_MOVIMIENTO, nave.eje_Z_rot);
    }
    if (teclas_pulsadas.atras == 1) {
        fuerza = mult(-VEL_MOVIMIENTO, nave.eje_Z_rot);
    }
	if (teclas_pulsadas.arriba == 1) {
        fuerza = mult(VEL_MOVIMIENTO, nave.eje_Y_rot);
    }
    if (teclas_pulsadas.abajo == 1) {
        fuerza = mult(-VEL_MOVIMIENTO, nave.eje_Y_rot);
    }
    if (teclas_pulsadas.izquierda == 1) {
        fuerza = mult(VEL_MOVIMIENTO, nave.eje_X_rot);
    }
    if (teclas_pulsadas.derecha == 1) {
        fuerza = mult(-VEL_MOVIMIENTO, nave.eje_X_rot);
    }
	return fuerza;
}

function aplicarFuerzaOpuesta(dt, velocidad, vel_objetivo) {
	// Calcula el vector opuesto
	const velOPuesta = subtract(vel_objetivo, velocidad);

	const distancia = length(velOPuesta);

    // Si la distancia es casi cero, considera que ya se ha detenido
    if (distancia < 1e-5) {
		hud_ajustar_vel.style.display = 'inline'
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
        jugador.velocity = aplicarFuerzaOpuesta(dt, jugador.velocity, selected_planet.velocity);
    }
	if (teclas_pulsadas.girder == 1) {
		if (vuelo_sencillo == 1) {
			if (jugador.roll_velocity > -MAX_VEL_GIRAR) jugador.roll_velocity += -VEL_GIRAR * dt;
		}
		else jugador.roll_velocity += -VEL_GIRAR * dt;
    }
	if (teclas_pulsadas.girizq == 1) {
		if (vuelo_sencillo == 1) {
			if (jugador.roll_velocity > -MAX_VEL_GIRAR) jugador.roll_velocity += VEL_GIRAR * dt;
		}
		else jugador.roll_velocity += VEL_GIRAR * dt;
    }
	if (teclas_pulsadas.lookder == 1) {
		if (vuelo_sencillo == 1) {
			if (jugador.roll_velocity > -MAX_VEL_GIRAR) jugador.yaw_velocity += VEL_GIRAR * dt;
		}
		else jugador.yaw_velocity += VEL_GIRAR * dt;
    }
	if (teclas_pulsadas.lookizq == 1) {
		if (vuelo_sencillo == 1) {
			if (jugador.roll_velocity > -MAX_VEL_GIRAR) jugador.yaw_velocity += -VEL_GIRAR * dt;
		}
		else jugador.yaw_velocity += -VEL_GIRAR * dt;
    }
	if (teclas_pulsadas.lookup == 1) {
		if (vuelo_sencillo == 1) {
			if (jugador.roll_velocity > -MAX_VEL_GIRAR) jugador.pitch_velocity += VEL_GIRAR * dt;
		}
		else jugador.pitch_velocity += VEL_GIRAR * dt;
    }
	if (teclas_pulsadas.lookdown == 1) {
		if (vuelo_sencillo == 1) {
			if (jugador.roll_velocity > -MAX_VEL_GIRAR) jugador.pitch_velocity += -VEL_GIRAR * dt;
		}
		else jugador.pitch_velocity += -VEL_GIRAR * dt;
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

	if (vuelo_sencillo == 1) {
		if ((teclas_pulsadas.derecha == 0) & (teclas_pulsadas.izquierda == 0)) {
			jugador.velocity[0] = reducirGiro(dt, VEL_MOVIMIENTO, jugador.velocity[0])
		}
		if ((teclas_pulsadas.arriba == 0) & (teclas_pulsadas.abajo == 0)) {
			jugador.velocity[1] = reducirGiro(dt, VEL_MOVIMIENTO, jugador.velocity[1])
		}
		if ((teclas_pulsadas.delante == 0) & (teclas_pulsadas.atras == 0)) {
			jugador.velocity[2] = reducirGiro(dt, VEL_MOVIMIENTO, jugador.velocity[2])
		}
	}
}