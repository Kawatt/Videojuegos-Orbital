/*
* 
* juego_3D.js
* Videojuegos (30262) - Curso 2024-2025
* 
*/

// Variable to store the WebGL rendering context
var gl;

// CONSTANTES

const ejeX = vec3(1.0, 0.0, 0.0);
const ejeY = vec3(0.0, 1.0, 0.0);
const ejeZ = vec3(0.0, 0.0, 1.0);

var balls = [];

//----------------------------------------------------------------------------
// OTHER DATA 
//----------------------------------------------------------------------------

var model = new mat4();   		// create a model matrix and set it to the identity matrix
var view = new mat4();   		// create a view matrix and set it to the identity matrix
var projection = new mat4();	// create a projection matrix and set it to the identity matrix

var eye, target, up;			// for view matrix

var rotAngle = 0.0;
var rotChange = 0.5;

var program;
var uLocations = {};
var aLocations = {};

var programInfo = {
			program,
			uniformLocations: {},
			attribLocations: {},
};

//----------------------------------------------------------------------------
// OBJECTS TO DRAW 
//----------------------------------------------------------------------------

var objectsToDraw = [
	/*{ // AXIS
		programInfo: programInfo,
		pointsArray: pointsAxes, 
		colorsArray: colorsAxes, 
		uniforms: {
		  u_colorMult: [1.0, 1.0, 1.0, 1.0],
		  u_model: new mat4(),
		},
		primType: "lines",
	},*/
];
var spheresToDraw = [
];
var navesToDraw = [
];
var ballsToDraw = [
];


// Creación de planetas

var planetas = [
];

/**
 * Crea un planeta.
 * 
 * ⚠️ **Restricción:** El eje `ejRot` **no puede ser igual** al eje `ejOrb` o `ejInc`.
 * 
 * @param {float} radioPlaneta - Tamaño del planeta.
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
function generar_planeta(radioPlaneta, velRotX, velRotY, velRotZ, radioOrbita, 
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

		Matriz_Inclinacion_Orbita: M_Rot_Inclinacion,
		Matriz_Traslacion_R_Orbita: M_Tras_R_Orb,
		Matriz_Escalado: M_Escalado,

		radius: radioPlaneta,
		weight: 1.0,
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
generar_planeta(10, 0.0, 0.1, 0.0, 0, 0, ejeX, ejeY, ejeX, Math.random()*360, Math.random()*180, colorsArraySun);
// Planeta que orbita
generar_planeta(2, 0.0, 0.1, 0.0, 30, 0.1, ejeX, ejeZ, ejeX, 0, 0, colorsArrayPlanet);

// Creación de Naves enemigas

var naves = [];
function createNaveEnemiga() {
	naves.push({
		position: vec3(0.0,15.0,0.0),
		velocity: vec3(0.0,0.0,0.0),
		roll_velocity: 0.0,
		yaw_velocity: 0.0,
		pitch_velocity: 0.0,
	
		yaw: 0.0,
		pitch: 0.0,
		roll: 0.0,
		rot_yaw: 0.0,
		rot_pitch: 0.0,
		rot_roll: 0.0,
		eje_X_rot: vec3(1.0,0.0,0.0),
		eje_Y_rot: vec3(0.0,1.0,0.0),
		eje_Z_rot: vec3(0.0,0.0,1.0),
	
		target: vec3(0.0,0.0,0.0),
	});
	navesToDraw.push(
		{
			programInfo: programInfo,
			pointsArray: pointsNave, 
			colorsArray: colorsNave, 
			uniforms: {
			  u_colorMult: [1.0, 1.0, 1.0, 1.0],
			  u_model: new mat4(),
			},
			primType: "triangles",
		},
	)
}
createNaveEnemiga()

//------------------------------------------------------------------------------

var canvas;
var hud_distance_centerhud_distance_center;
var hud_velocity_target;
var hud_velocity;
var hud_ajustar_vel;

window.onload = function init() {
	
	// Set up a WebGL Rendering Context in an HTML5 Canvas
	canvas = document.getElementById("gl-canvas");
	hud_distance_center = document.getElementById("hud_distance");
	hud_velocity_target = document.getElementById("hud_velocity_target");
	hud_velocity = document.getElementById("hud_velocity");
	hud_ajustar_vel = document.getElementById("hud_ajustar_vel");
	hud_ajustar_vel.textContent = "Velocidad Ajustada"
	hud_ajustar_vel.style.display = 'none'
	gl = WebGLUtils.setupWebGL(canvas);
	if (!gl) {
		alert("WebGL isn't available");
	}

	//  Configure WebGL
	gl.clearColor(0.0, 0.0, 0.0, 1.0);
	gl.enable(gl.DEPTH_TEST);

	setPrimitive(objectsToDraw);
	setPrimitive(spheresToDraw);
	setPrimitive(navesToDraw);
	setPrimitive(ballsToDraw);

	// Set up a WebGL program
	// Load shaders and initialize attribute buffers
	program = initShaders(gl, "vertex-shader", "fragment-shader");
	  
	// Save the attribute and uniform locations
	uLocations.model = gl.getUniformLocation(program, "model");
	uLocations.view = gl.getUniformLocation(program, "view");
	uLocations.projection = gl.getUniformLocation(program, "projection");
	uLocations.colorMult = gl.getUniformLocation(program, "colorMult");
	aLocations.vPosition = gl.getAttribLocation(program, "vPosition");
	aLocations.vColor = gl.getAttribLocation(program, "vColor");

	programInfo.uniformLocations = uLocations;
	programInfo.attribLocations = aLocations;
	programInfo.program = program;

	gl.useProgram(programInfo.program);
	
	// Set up viewport 
	// gl.viewport(x, y, width, height)
	gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight);

	// Set up camera	
	eye = new vec3(0.0,0.0,0.0);
	target = vec3(0.0, 0.0, 0.0);
	up =  vec3(0.0, 1.0, 0.0);
	view = lookAt(eye,target,up);

	// Establecer la proyeccion perspectiva por defecto
	projection = perspective(45.0, canvas.width/canvas.height, 0.1, 1000.0 );

	gl.uniformMatrix4fv( programInfo.uniformLocations.projection, gl.FALSE, projection );
	gl.uniformMatrix4fv(programInfo.uniformLocations.view, gl.FALSE, view);
	
	window.addEventListener("keydown", keyDownHandler);
	window.addEventListener("keyup", keyReleasedHandler);
	
	//canvas.addEventListener("mouseenter", () => mouseInside = true);
	//canvas.addEventListener("mouseleave", () => mouseInside = false);
	
	lastTick = Date.now();
	requestAnimFrame(tick);
};

//----------------------------------------------------------------------------
// Tick Event Function
//----------------------------------------------------------------------------

var lastTick;

function tick(nowish) {
	var now = Date.now();

    var dt = now - lastTick;
    lastTick = now;

	update(dt)
	render(dt)

	window.requestAnimationFrame(tick)
}

//----------------------------------------------------------------------------
// Update Event Function
//----------------------------------------------------------------------------

var cooldown = 0;
const MAX_COOLDOWN = 20;

function spawn_disparo(position, direction, velocity) {
	ballsToDraw.push(
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
	);
	balls.push({
		position: add(position, mult(0.05, direction)),
		velocity: add(velocity, mult(SHOOTING_FORCE, direction)),
		direction: direction,
		lifetime: BALL_LIFETIME,
		index: 0,
		model: ballsToDraw[ballsToDraw.length-1]
	});
}
/**
 * Elimina un objeto y su modelo asociado
 * 
 * @param {array} models - Array de modelos
 * @param {array} objects - Array de objetos
 * @param {number} i - Indice del objeto a eliminar
 * 
 */
function remove_model_and_object(models, objects, i) {
	const indice = models.indexOf(objects[i].model);

	if (indice !== -1) {
		models.splice(indice, 1);
		objects.splice(i, 1);
	}
}
function handle_disparos(dt) {
	cooldown -= 1;
	for(let i=0; i < balls.length; i++){
		let ball = balls[i]
		//ball.velocity = add(ball.velocity, mult(dt * VEL_MOVIMIENTO * 2, ball.direction));
		ball.position = add(ball.position, mult(dt, ball.velocity));
		balls[i].lifetime -= 1;
		if (balls[i].lifetime <= 0) {
			remove_model_and_object(ballsToDraw, balls, i)
		}
	}
	if ((teclas_pulsadas.disparar == 1) && (cooldown <= 0)) {
		cooldown = MAX_COOLDOWN;
		const lateral = mult(0.05, jugador.eje_X_rot);
		spawn_disparo(add(jugador.position, lateral), jugador.eje_Z_rot, jugador.velocity)
		spawn_disparo(subtract(jugador.position, lateral), jugador.eje_Z_rot, jugador.velocity)
	}
}

function update_hud() {
	hud_distance_center.textContent = length(jugador.position).toFixed(4) + " m"
	hud_velocity_target.textContent = (-dot(jugador.velocity, normalize(jugador.position))).toFixed(4) + " m/s"
	hud_velocity.textContent = "Velocidad total: " + length(jugador.velocity).toFixed(4)
}

/**
 * Actualiza el estado de la simulación
 * 
 * @param {number} dt - Delta de tiempo transcurrido desde la última
 * actualización.
 * 
 */
function update(dt) {
	// Calculo rotación del jugador
	mover_camara(dt);
	jugador.yaw += jugador.yaw_velocity * dt;
	jugador.pitch += jugador.pitch_velocity * dt;
	jugador.roll += jugador.roll_velocity * dt;
	nuevo_eje_movimiento(jugador);
	// Calculo movimiento del jugador
	jugador.velocity = add(jugador.velocity, mult(dt, calcular_gravedad(jugador)));
	jugador.position = add(jugador.position, mult(dt, jugador.velocity));

	handle_disparos(dt)
	
	update_hud()

	if (colision_esferas(jugador.position, 0.1, vec3(0.0,0.0,0.0), 10)) {
		reset_jugador();
	}

	//if (balls.length > 0) console.log(balls[0].velocity)

	for(let i=0; i < naves.length; i++){
		let nave = naves[i];

		nave.yaw_velocity = VEL_GIRAR * dt * 10
		nave.pitch_velocity = VEL_GIRAR * dt * 10
		nave.roll_velocity = VEL_GIRAR * dt * 10

		nave.yaw = nave.yaw_velocity * dt;
		nave.pitch = nave.pitch_velocity * dt;
		nave.roll = nave.roll_velocity * dt;
		nave.rot_yaw += nave.yaw;
		nave.rot_pitch += nave.pitch;
		nave.rot_roll += nave.roll;
		nuevo_eje_movimiento(nave);
		
		// Calculo movimiento de la nave
		//nave.velocity = add(nave.velocity, mult(dt * VEL_MOVIMIENTO/2, nave.eje_Z_rot));
		//nave.position = add(nave.position, mult(dt, nave.velocity));
	}

	//console.log("Pos: " + jugador.position + ", Vel: " + jugador.velocity + ", Grav: " + calcular_gravedad());
}

//----------------------------------------------------------------------------
// Rendering Event Function
//----------------------------------------------------------------------------

function renderObject(object, adjust) {
	gl.useProgram(object.programInfo.program);

	// Setup buffers and attributes
	setBuffersAndAttributes(object.programInfo, object.pointsArray, object.colorsArray);

	// Set the uniforms
	setUniforms(object.programInfo, object.uniforms);

	// Draw
	gl.drawArrays(object.primitive, 0, object.pointsArray.length / adjust);
}

function render(dt) {

	gl.clear(gl.DEPTH_BUFFER_BIT | gl.COLOR_BUFFER_BIT);

	eye = jugador.position;
	target = vec3(
		eye[0]+jugador.eje_Z_rot[0], 
		eye[1]+jugador.eje_Z_rot[1], 
		eye[2]+jugador.eje_Z_rot[2]);
	up = vec3(jugador.eje_Y_rot[0], jugador.eje_Y_rot[1], jugador.eje_Y_rot[2]);
	
	view = lookAt(eye, target, up);
    gl.uniformMatrix4fv(programInfo.uniformLocations.view, gl.FALSE, view);

	// Renderizado de planetas
	for(let i=0; i < planetas.length; i++){
		// Reset a origen
		spheresToDraw[i].uniforms.u_model = translate(0.0, 0.0, 0.0);
		
		// Inclinacion de la orbita
		spheresToDraw[i].uniforms.u_model =
			mult(
				spheresToDraw[i].uniforms.u_model,
				planetas[i].Matriz_Inclinacion_Orbita
			)
		;

		// Desplazamiento en la orbita
		let ROrb = rotate(planetas[i].posRotOrbita, planetas[i].ejeRotOrbita);
		spheresToDraw[i].uniforms.u_model = 
			mult(spheresToDraw[i].uniforms.u_model, ROrb)
		;

		// Traslación
		spheresToDraw[i].uniforms.u_model = 
			mult(
				spheresToDraw[i].uniforms.u_model,
				planetas[i].Matriz_Traslacion_R_Orbita
			)
		;

		// Rotación sobre si mismo en los 3 ejes
		let RMZ = rotate(planetas[i].posRotZMismo, ejeZ);
		spheresToDraw[i].uniforms.u_model =
			mult(spheresToDraw[i].uniforms.u_model, RMZ)
		;

		let RMY = rotate(planetas[i].posRotYMismo, ejeY);
		spheresToDraw[i].uniforms.u_model =
			mult(spheresToDraw[i].uniforms.u_model, RMY)
		;

		let RMX = rotate(planetas[i].posRotXMismo, ejeX);
		spheresToDraw[i].uniforms.u_model =
			mult(spheresToDraw[i].uniforms.u_model, RMX)
		;
		
		// Escalado de tamaño
		spheresToDraw[i].uniforms.u_model = 
			mult(spheresToDraw[i].uniforms.u_model, planetas[i].Matriz_Escalado)
		;
	}

	// Renderizado de naves
	for(let i=0; i < naves.length; i++){
		let nave = naves[i];
		// Reset a origen
		navesToDraw[i].uniforms.u_model = translate(0.0, 0.0, 0.0);
		// Mover a position
		navesToDraw[i].uniforms.u_model = translate(nave.position[0], nave.position[1], nave.position[2]);

		let RMZ = rotate(nave.rot_roll, ejeZ);
		navesToDraw[i].uniforms.u_model =
			mult(navesToDraw[i].uniforms.u_model, RMZ)
		;

		let RMY = rotate(nave.rot_yaw, ejeY);
		navesToDraw[i].uniforms.u_model =
			mult(navesToDraw[i].uniforms.u_model, RMY)
		;

		let RMX = rotate(nave.rot_pitch, ejeX);
		navesToDraw[i].uniforms.u_model =
			mult(navesToDraw[i].uniforms.u_model, RMX)
		;
	}

	for(let i=0; i < balls.length; i++){
		let ball = balls[i];
		ballsToDraw[i].uniforms.u_model = translate(ball.position[0], ball.position[1], ball.position[2]);
	}
	
	//----------------------------------------------------------------------------
	// DRAW
	//----------------------------------------------------------------------------

	setPrimitive(ballsToDraw);
	objectsToDraw.forEach(function(object) {
		renderObject(object, 1)
    });	
	spheresToDraw.forEach(function(object) {
		renderObject(object, 4);
    });	
	navesToDraw.forEach(function(object) {
		renderObject(object, 1);
    });
	ballsToDraw.forEach(function(object) {
		renderObject(object, 1);
    });	
    
	rotAngle += rotChange;
	for (let i=0; i < planetas.length; i++) {
		planetas[i].posRotOrbita += planetas[i].velRotOrbita
		planetas[i].posRotXMismo += planetas[i].velRotXMismo
		planetas[i].posRotYMismo += planetas[i].velRotYMismo
		planetas[i].posRotZMismo += planetas[i].velRotZMismo
	}
	
}

//----------------------------------------------------------------------------
// Utils functions
//----------------------------------------------------------------------------

function setPrimitive(objectsToDraw) {	
	
	objectsToDraw.forEach(function(object) {
		switch(object.primType) {
		  case "lines":
			object.primitive = gl.LINES;
			break;
		  case "line_strip":
			object.primitive = gl.LINE_STRIP;
			break;
		  case "triangles":
		    object.primitive = gl.TRIANGLES;
		    break;
		  default:
			object.primitive = gl.TRIANGLES;
		}
	});	
}	

function setUniforms(pInfo, uniforms) {
	// Copy uniform model values to corresponding values in shaders
	gl.uniform4f(pInfo.uniformLocations.colorMult, uniforms.u_colorMult[0], uniforms.u_colorMult[1], uniforms.u_colorMult[2], uniforms.u_colorMult[3]);
	gl.uniformMatrix4fv(pInfo.uniformLocations.model, gl.FALSE, uniforms.u_model);
}

function setBuffersAndAttributes(pInfo, ptsArray, colArray) {
	// Load the data into GPU data buffers
	// Vertices
	var vertexBuffer = gl.createBuffer();
	gl.bindBuffer( gl.ARRAY_BUFFER, vertexBuffer );
	gl.bufferData( gl.ARRAY_BUFFER,  flatten(ptsArray), gl.STATIC_DRAW );
	gl.vertexAttribPointer( pInfo.attribLocations.vPosition, 4, gl.FLOAT, gl.FALSE, 0, 0 );
	gl.enableVertexAttribArray( pInfo.attribLocations.vPosition );

	// Colors
	var colorBuffer = gl.createBuffer();
	gl.bindBuffer( gl.ARRAY_BUFFER, colorBuffer );
	gl.bufferData( gl.ARRAY_BUFFER,  flatten(colArray), gl.STATIC_DRAW );
	gl.vertexAttribPointer( pInfo.attribLocations.vColor, 4, gl.FLOAT, gl.FALSE, 0, 0 );
	gl.enableVertexAttribArray( pInfo.attribLocations.vColor );
}
