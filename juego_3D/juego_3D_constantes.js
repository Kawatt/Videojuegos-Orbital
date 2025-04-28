/*
* 
* juego_3D_constantes.js
* Videojuegos (30262) - Curso 2024-2025
* 
*/

const JUGADOR_RADIO = 1;
const JUGADOR_MASA = 10;
const ESCALA = 0.000001;
const VEL_MOVIMIENTO = 0.4 * ESCALA;
const VEL_GIRAR = 80 * ESCALA;
const MAX_VEL_GIRAR = 8000 * ESCALA;
const SENSITIVITY = 0.08;  // Sensibilidad del raton (mayor sensibilidad = mayor velocidad)
const BALL_LIFETIME = 200; // Cantidad de frames que sobrevive el disparo
const SHOOTING_FORCE = 0.02;
const INITIAL_POSITION = vec3(0.0, 0.0, -230.0); //Posicion inicial de la nave
const MAX_DISP_COOLDOWN = 10; // Frames entre disparos
const SIGNAL_OBTENIDA_MSG_TIME = 200; // Frames que se muestra el mensage de 'Señal obtenida'
const ejeX = vec3(1.0, 0.0, 0.0);
const ejeY = vec3(0.0, 1.0, 0.0);
const ejeZ = vec3(0.0, 0.0, 1.0);

//----------------------------------------------------------------------------
// OTHER DATA 
//----------------------------------------------------------------------------

var model = new mat4();   		// create a model matrix and set it to the identity matrix
var view = new mat4();   		// create a view matrix and set it to the identity matrix
var projection = new mat4();	// create a projection matrix and set it to the identity matrix

var eye, target, up;			// for view matrix

var program;
var uLocations = {};
var aLocations = {};

var programInfo = {
	program,
	uniformLocations: {},
	attribLocations: {},
};