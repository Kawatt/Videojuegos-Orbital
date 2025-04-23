/*
* 
* juego_3D_constantes.js
* Videojuegos (30262) - Curso 2024-2025
* 
*/

const ESCALA = 0.00001;
const VEL_MOVIMIENTO = 0.5 * ESCALA;
const VEL_GIRAR = 8 * ESCALA;
const MAX_VEL_GIRAR = 16000 * ESCALA;
const SENSITIVITY = 0.08;  // Sensibilidad del raton (mayor sensibilidad = mayor velocidad)
const BALL_LIFETIME = 400;
const SHOOTING_FORCE = 0.005;
const INITIAL_POSITION = vec3(0.0, 0.0, -30.0);
const MAX_DISP_COOLDOWN = 20; // Frames entre disparos
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