/*
* 
* juego_3D_fisica.js
* Videojuegos (30262) - Curso 2024-2025
* 
*/

/**
 * Calcula la gravedad que aplican los planetas a un objeto
 * 
 * Tanto los planetas como el objeto deben tener
 * - position (vec3)
 * - mass (float)
 * 
 * @param {*} planets Vector de planetas
 * @param {*} object Objeto al que aplicar la gravedad
 * @returns Fuerza que aplican los planetas al objeto
 */
function calcular_gravedad(planets, object) {
	let gravedad = vec3(0.0,0.0,0.0);
    const G = 6.67430e-11; // Constante gravitacional

    for (let planet of planets) {
        let d = subtract(planet.position, object.position);
        let distance = length(d);

        if (distance === 0) continue; // Evitar división por cero

        let forceMagnitude = G * planet.mass * object.mass / dot(d, d);

        let u = normalize(d);

        // Fuerza individual
        gravedad = add(gravedad, mult(forceMagnitude, u))
    }
    
    return gravedad;
}

function colision_esferas(centro1, radio1, centro2, radio2){
	let radiot = radio1 + radio2;
	let distancia = length(subtract(centro1, centro2));
	return distancia <= radiot;
}

function detectar_colisiones() {
    planetas.forEach(function(planeta) {
		if (colision_esferas(jugador.position, jugador.radius, planeta.position, planeta.radius)) {
			reset_jugador();
		}
    });
	naves.forEach(function(nave) {
		if (colision_esferas(jugador.position, 1, nave.position, 1)) {
			reset_jugador();
		}
    });
	balls.forEach(function(ball, i) {
		if(naves.length > 0){if (colision_esferas(ball.position, 0.1, naves[0].position, 1)) {
			remove_model_and_object(objectsToDraw, naves, 0)
			remove_model_and_object(objectsToDraw, balls, i)
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
