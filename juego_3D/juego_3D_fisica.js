/*
* 
* juego_3D_fisica.js
* Videojuegos (30262) - Curso 2024-2025
* 
*/

function calcular_gravedad(nave) {
	let gravedad = vec3(0.0,0.0,0.0);
	if (teclas_pulsadas.delante == 1) {
        gravedad = mult(VEL_MOVIMIENTO, nave.eje_Z_rot);
    }
    if (teclas_pulsadas.atras == 1) {
        gravedad = mult(-VEL_MOVIMIENTO, nave.eje_Z_rot);
    }
	if (teclas_pulsadas.arriba == 1) {
        gravedad = mult(VEL_MOVIMIENTO, nave.eje_Y_rot);
    }
    if (teclas_pulsadas.abajo == 1) {
        gravedad = mult(-VEL_MOVIMIENTO, nave.eje_Y_rot);
    }
    if (teclas_pulsadas.izquierda == 1) {
        gravedad = mult(VEL_MOVIMIENTO, nave.eje_X_rot);
    }
    if (teclas_pulsadas.derecha == 1) {
        gravedad = mult(-VEL_MOVIMIENTO, nave.eje_X_rot);
    }
	// calculo solo del sol
	//gravedad = add(gravedad, mult((VEL_MOVIMIENTO*0.1)/length(normalize(subtract(vec3(0,0,0), nave.position))), normalize(subtract(vec3(0,0,0), nave.position))))
	return gravedad;
}

function colision_esferas(centro1, radio1, centro2, radio2){
	let radiot = radio1 + radio2;
	let distancia = length(subtract(centro1, centro2));
	return distancia <= radiot;
}

function detectar_colisiones() {
	if (colision_esferas(jugador.position, 1, vec3(0.0,0.0,0.0), 10)) {
		reset_jugador();
	}
	naves.forEach(function(nave) {
		if (colision_esferas(jugador.position, 1, nave.position, 1)) {
			reset_jugador();
		}
    });
	balls.forEach(function(ball, i) {
		if(naves.length > 0){if (colision_esferas(ball.position, 0.1, naves[0].position, 1)) {
			remove_model_and_object(objectsToDraw, naves, 0)
		}}
    });
}

/*function intersecta(punto, direccion, centro, radio) {
	// Variables del origen y dirección
    const [ox, oy, oz] = punto;
    const [dx, dy, dz] = direccion;
    const [cx, cy, cz] = centro;
    
    // Coeficientes de la ecuación cuadrática
    const A = dx * dx + dy * dy + dz * dz;
    const B = 2 * (dx * (ox - cx) + dy * (oy - cy) + dz * (oz - cz));
    const C = (ox - cx) ** 2 + (oy - cy) ** 2 + (oz - cz) ** 2 - radio ** 2;
    
    // Discriminante
    const discriminante = B * B - 4 * A * C;
    
    if (discriminante < 0) {
        // No hay intersección
        return null;
    }
    
    // Soluciones
    const t1 = (-B + Math.sqrt(discriminante)) / (2 * A);
    const t2 = (-B - Math.sqrt(discriminante)) / (2 * A);
    
    // Puntos de intersección
    const p1 = [ox + t1 * dx, oy + t1 * dy, oz + t1 * dz];
    const p2 = [ox + t2 * dx, oy + t2 * dy, oz + t2 * dz];
    
    // Si hay dos soluciones, devuelve ambos puntos
    return discriminante === 0;
}*/
