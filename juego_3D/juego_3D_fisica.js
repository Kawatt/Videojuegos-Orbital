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

    // Para cada planeta calcula la distancia entre el planeta y el objeto, 
    // se aplica la fuerza de gravedad entre dos cuerpos
    for (let planet of planets) {
        // distancia desde el objeto al planeta
        let d = subtract(planet.position, object.position);
        let distance = length(d);

        if (distance === 0) continue; // Evitar división por cero

        // Fuerza de gravedad G*m1*m2 / d^2
        let forceMagnitude = G * planet.mass * object.mass / dot(d, d);

        // Normaliza d para convertirlo en una direccion
        let u = normalize(d);

        // Fuerza individual (mult(forceMagnitude, u) -> obtener vector fuerza)
        gravedad = add(gravedad, mult(forceMagnitude, u))
    }
    
    return gravedad;
}

// Si la distancia entre los centros de los objetos es menor o igual a la suma 
// de sus radios es qeu han colisionado
function colision_esferas(centro1, radio1, centro2, radio2){
	let radiot = radio1 + radio2;
	let distancia = length(subtract(centro1, centro2));
	return distancia <= radiot;
}

function detectar_colisiones() {
    // Comprobar colision jugador-planeta
    planetas.forEach(function(planeta) {
		if (colision_esferas(jugador.position, jugador.radius, planeta.position, planeta.radius)) {
            hud_ha_colisionado.style.display = 'inline';
            hide_ha_colisionado = HA_COLISIONADO_MSG_TIME;
            signals_obtenidas = 0;
			reset_jugador();
		}
    });
    // Comporbar colision jugador-señal
    signals.forEach(function(signal, i) {
		if (colision_esferas(jugador.position, jugador.radius, signal.position, 30)) {
            // Borra la señal
            remove_model_and_object(objectsToDraw, signals, i);
            // Genera una señal aleatoria
            generar_signal_aleatoria();
            hud_signal_obtenida.style.display = 'inline';
            hide_signal_obtenida = SIGNAL_OBTENIDA_MSG_TIME;
            signals_obtenidas++;
            console.log("Señal obtenida");
		}
    });
}

/**
 * Devuelve la distancia del rayo a la esfera si intersecta
 * 
 * @param {vec3} origen Origen del rayo
 * @param {vec3} direccion Dirección del rayo
 * @param {vec3} centro Centro de la esfera
 * @param {vec3} radio Radio de la esfera
 * @returns Un diccionario donde intersecta es un booleano indicando si ha intersectado y dist es la distancia al punto de intersección
 */
function intersecta(origen, direccion, centro, radio) {
    // Vector origen jugador - centro esfera
    let OC = subtract(origen, centro)

    // Coeficientes de la ecuacion cuadratica para interseccion rayo-esfera
    let a = dot(direccion, direccion)
    let b = 2 * dot(OC, direccion)
    let c = dot(OC, OC) - radio*radio
    
    // Indica si hay 0, 1 o 2 soluciones reales
    let discriminante = b*b - 4*a*c
    
    // Si es negativo no hay interseccion
    if (discriminante < 0) {
        return {intersecta:false, dist:0}  // no intersection
    }
    else {
        // Comprobar que esfera esté por delante del rayo
        let sqrt_disc = Math.sqrt(discriminante)
        let t1 = (-b - sqrt_disc) / (2*a)
        let t2 = (-b + sqrt_disc) / (2*a)
        
        if (t1 >= 0) return {intersecta:true, dist:t1}
        else if (t2 >= 0) return {intersecta:true, dist:t2}
        else return {intersecta:false, dist:0}
    }
}