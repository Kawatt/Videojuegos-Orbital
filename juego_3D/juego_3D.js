/*
* 
* juego_3D.js
* Videojuegos (30262) - Curso 2024-2025
* 
*/

// Variable to store the WebGL rendering context
var gl;

/**
 * Añade el objeto al vector y le asocia el modelo
 * 
 * @param {Object} object - Nuevo objeto
 * @param {Object} model - Modelo a asociar al objeto
 * @param {Array} vector - Vector al que añadir el objeto
 * 
 */
function crear_objeto_y_modelo(object, model, vector) {
	setOnePrimitive(model);
	objectsToDraw.push(model);
	object.model = model;
	vector.push(object);
}

function crear_estrella(object, model, vector) {
	setOnePrimitive(model);
	objectsToDraw.push(model);
	object.model = model;
	vector.push(object);
	console.log("estrella creada");
}

/**
 * Elimina un objeto y su modelo asociado
 * 
 * @param {Array} models - Array de modelos
 * @param {Array} objects - Array de objetos
 * @param {Number} i - Indice del objeto a eliminar
 * 
 */
function remove_model_and_object(models, objects, i) {
	const indice = models.indexOf(objects[i].model);

	if (indice !== -1) {
		models.splice(indice, 1);
		objects.splice(i, 1);
	}
}

/**
 * Actualiza los contenidos del HUD
 */
function update_hud() {
	// Distancia al astro elegido
	hud_distance_center.textContent = "Distancia al astro: "+(100*length(subtract(jugador.position, selected_planet.position))).toFixed(0) + " m"
	// Velocidad a la que se está acercando al astro elegido
	let vel_rel = subtract(jugador.velocity, selected_planet.velocity)
	let pos_rel = subtract(jugador.position, selected_planet.position)
	hud_velocity_target.textContent = "Velocidad de aproximacion: " + (100*1000*(-dot(pos_rel, vel_rel)/ length(pos_rel))).toFixed(0) + " m/s"
	// Puntuación
	hud_points.textContent = "Balizas obtenidas: " + signals_obtenidas;

	if (hide_signal_obtenida > 0) {
		hud_signal_obtenida.style.opacity = 1-(1-hide_signal_obtenida/SIGNAL_OBTENIDA_MSG_TIME);
		hide_signal_obtenida--;
	} else {
		hud_signal_obtenida.style.display = 'none';
	}

	if (hide_ha_colisionado > 0) {
		hud_ha_colisionado.style.opacity = 1-(1-hide_ha_colisionado/HA_COLISIONADO_MSG_TIME);
		hide_ha_colisionado--;
	} else {
		hud_ha_colisionado.style.display = 'none';
	}
}

/**
 * Inicializa el HUD
 */
function start_hud() {
	hud_distance_center = document.getElementById("hud_distance");
	hud_velocity_target = document.getElementById("hud_velocity_target");
	hud_ajustar_vel = document.getElementById("hud_ajustar_vel");
	hud_ajustar_vel.textContent = "Velocidad Ajustada";
	hud_ajustar_vel.style.display = 'none';
	hud_signal_obtenida = document.getElementById("hud_signal_obtenida");
	hud_signal_obtenida.textContent = "Baliza obtenida";
	hud_signal_obtenida.style.display = 'none';
	hud_ha_colisionado = document.getElementById("hud_ha_colisionado");
	hud_ha_colisionado.textContent = "Ha colisionado con un astro y ha perdido sus balizas";
	hud_ha_colisionado.style.display = 'none';
	hud_points = document.getElementById("hud_points");

	hud_mira = document.getElementById("mira");
	hud_mira.style.top = window.innerHeight / 2 + "px";
    hud_mira.style.left = window.innerWidth / 2 + "px";

	hud_orient = document.getElementById("orientador");
}



function projectToScreen(position) {
    let position4D = vec4(position[0], position[1], position[2], 1);
	let behind = false;
    
	let P_camera = mult(transpose(view), position4D)
	let P_clip = mult(transpose(projection), P_camera)
	if (P_clip[3] < 0) { //Posición detrás de la cámara
		P_clip = vec4(-P_clip[0],-P_clip[1],-P_clip[2],P_clip[3])
		behind = true;
    }
	let P_ndc = vec3(P_clip[0]/P_clip[3], P_clip[1]/P_clip[3], P_clip[2]/P_clip[3]);
	
	let x = (P_ndc[0] * 0.5 + 0.5) * canvas.width
	let y = (1 - (P_ndc[1] * 0.5 + 0.5)) * canvas.height

    return { x, y, behind };
}

function render_planet_selector() {
	let projectedPosition = projectToScreen(selected_planet.position);

	if (projectedPosition.behind) {
		hud_orient.style.opacity = 0.4;
	} else {
		hud_orient.style.opacity = 0.9;
	}

	hud_orient.style.top = Math.max(20, Math.min(canvas.height-(hud_orient.height/2), projectedPosition.y)) + "px";
	hud_orient.style.left = Math.max(20, Math.min(canvas.width-(hud_orient.width/2), projectedPosition.x)) + "px";
}

//----------------------------------------------------------------------------
// OBJECTS TO DRAW 
//----------------------------------------------------------------------------

axis = { // AXIS
	programInfo: programInfo,
	pointsArray: pointsAxes, 
	colorsArray: colorsAxes, 
	uniforms: {
	  u_colorMult: [1.0, 1.0, 1.0, 1.0],
	  u_model: new mat4(),
	},
	primType: "lines",
}

var objectsToDraw = [
	// axis,
];

// Creación de Naves enemigas

var naves = [];
function createNaveEnemiga() {
	crear_objeto_y_modelo(
		{
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
		
			target: vec3(0.0,0.0,0.0)
		}, 
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
		naves
	)
}

//------------------------------------------------------------------------------

var canvas;
// HUD
var hud_distance_center;
var hud_velocity_target;
var hud_points;
var hud_ajustar_vel;
var hud_signal_obtenida;
var hud_ha_colisionado;
var hud_mira;
var hud_orient;


var hide_signal_obtenida = 0;
var hide_ha_colisionado = 0;

var signals_obtenidas = 0;

window.initGame = function() {
	// Set up a WebGL Rendering Context in an HTML5 Canvas
	canvas = document.getElementById("gl-canvas");
	canvas.width = window.innerWidth;
	canvas.height = window.innerHeight;

	gl = WebGLUtils.setupWebGL(canvas); // inicializar contexto webgl
	if (!gl) {
		alert("WebGL isn't available");
	}

	//  Configure WebGL
	gl.clearColor(0.0, 0.0, 0.0, 1.0);
	gl.enable(gl.DEPTH_TEST);

	setPrimitive(objectsToDraw);
	setPrimitive(spheresToDraw);
	//setPrimitive(starsToDraw);

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
	eye = INITIAL_POSITION;
	target = vec3(0.0, 0.0, 0.0);
	up =  vec3(0.0, 1.0, 0.0);
	view = lookAt(eye,target,up);

	// Establecer la proyeccion perspectiva por defecto
	projection = perspective(45.0, canvas.width/canvas.height, 0.1, 800.0 );

	gl.uniformMatrix4fv(programInfo.uniformLocations.projection, gl.FALSE, projection);
	gl.uniformMatrix4fv(programInfo.uniformLocations.view, gl.FALSE, view);
	
	window.addEventListener("keydown", keyDownHandler);
	window.addEventListener("keyup", keyReleasedHandler);
	
	start_hud();
	//createNaveEnemiga();
	generar_señales(7);
	generar_fondo_estrellas();

	
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

/**
 * Actualiza el estado de la simulación
 * 
 * @param {number} dt - Delta de tiempo transcurrido desde la última
 * actualización.
 * 
 */
function update(dt) {
	
	mover_camara(dt);
	calcular_rotacion(jugador, dt);
	nuevo_eje_movimiento(jugador);
	calcular_movimiento_jugador(jugador, dt);

	handle_disparos(dt, jugador);
	
	update_hud();

	detectar_colisiones();

	for(let i=0; i < naves.length; i++){
		let nave = naves[i];

		nave.yaw_velocity = VEL_GIRAR * dt * 10
		nave.pitch_velocity = VEL_GIRAR * dt * 10
		nave.roll_velocity = VEL_GIRAR * dt * 10

		calcular_rotacion(nave, dt);
		nave.rot_yaw += nave.yaw;
		nave.rot_pitch += nave.pitch;
		nave.rot_roll += nave.roll;
		nuevo_eje_movimiento(nave);
		
		// Calculo movimiento de la nave
		//nave.velocity = add(nave.velocity, mult(dt * VEL_MOVIMIENTO/2, nave.eje_Z_rot));
		//nave.position = add(nave.position, mult(dt, nave.velocity));
	}

	for(let i=0; i < planetas.length; i++){
		let planeta = planetas[i];

		planeta.pos_orbita += planeta.vel_orbita * dt;

		let pos = translate(0,0,0);
		pos = mult(pos, planeta.matriz_inclinacion_orbita);

		let ROrb = rotate(planeta.pos_orbita, planeta.eje_orbita);
		pos = mult(pos, ROrb);
		pos = mult(pos, planeta.matriz_traslacion_orbita);
		
		// Guardar posición final
		let oldpos = planeta.position
		planeta.position = vec3(pos[12], pos[13], pos[14]);
		let movvector = subtract(planeta.position, planeta.oldpos)
		planeta.oldpos = oldpos
		// Calcular velocidad global del planeta
		planeta.velocity = mult(planeta.vel_orbita, movvector)
		
	}

	for(let i=0; i < signals.length; i++){
		let signal = signals[i];

		signal.pos_orbita += signal.vel_orbita * dt;

		let pos = translate(0,0,0);
		pos = mult(pos, signal.matriz_inclinacion_orbita);

		let ROrb = rotate(signal.pos_orbita, signal.eje_orbita);
		pos = mult(pos, ROrb);
		pos = mult(pos, signal.matriz_traslacion_orbita);
		
		// Guardar posición final
		signal.position = vec3(pos[12], pos[13], pos[14]);
		
	}
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

	render_planet_selector()

	// Renderizado de planetas
	for(let i=0; i < planetas.length; i++){
		let planeta = planetas[i];

		// Reset a origen
		spheresToDraw[i].uniforms.u_model = translate(planeta.position[0], planeta.position[1], planeta.position[2]);

		// Rotación sobre si mismo
		let RM = rotate(planeta.pos_rot_mismo, planeta.eje_rot_mismo);
		spheresToDraw[i].uniforms.u_model =
			mult(spheresToDraw[i].uniforms.u_model, RM);
		
		// Escalado de tamaño
		spheresToDraw[i].uniforms.u_model = 
			mult(spheresToDraw[i].uniforms.u_model, planeta.matriz_escalado);
	}

	for(let i=0; i < signals.length; i++){
		let signal = signals[i];
		let uniforms = signal.model.uniforms;

		// Colocar en posición
		uniforms.u_model = translate(signal.position[0], signal.position[1], signal.position[2]);
	}

	for(let i=0; i < estrellas.length; i++){
		let estrella = estrellas[i];
		let uniforms = estrella.model.uniforms;

		// Colocar en posición
		uniforms.u_model = translate(estrella.position[0], estrella.position[1], estrella.position[2]);
	}


	// Renderizado de naves
	for(let i=0; i < naves.length; i++){
		let nave = naves[i];
		let uniforms = nave.model.uniforms;

		// Mover a position
		uniforms.u_model = translate(nave.position[0], nave.position[1], nave.position[2]);

		// Rotaciones sobre si mismo
		let RMZ = rotate(nave.rot_roll, ejeZ);
		uniforms.u_model = mult(uniforms.u_model, RMZ);
		
		let RMY = rotate(nave.rot_yaw, ejeY);
		uniforms.u_model = mult(uniforms.u_model, RMY);
		
		let RMX = rotate(nave.rot_pitch, ejeX);
		uniforms.u_model = mult(uniforms.u_model, RMX);

	}

	for(let i=0; i < balls.length; i++){
		let ball = balls[i];
		let uniforms = ball.model.uniforms;

		uniforms.u_model = translate(ball.position[0], ball.position[1], ball.position[2]);
	}
	
	//----------------------------------------------------------------------------
	// DRAW
	//----------------------------------------------------------------------------

	objectsToDraw.forEach(function(object) {
		renderObject(object, 1)
    });	
	spheresToDraw.forEach(function(object) {
		renderObject(object, 4);
    });
    
	for (let i=0; i < planetas.length; i++) {
		planetas[i].pos_rot_mismo += planetas[i].vel_rot_mismo * dt
	}
	
}

//----------------------------------------------------------------------------
// Utils functions
//----------------------------------------------------------------------------

function setOnePrimitive(model) {	
	
	switch(model.primType) {
		case "lines":
		  model.primitive = gl.LINES;
		  break;
		case "line_strip":
		  model.primitive = gl.LINE_STRIP;
		  break;
		case "triangles":
		  model.primitive = gl.TRIANGLES;
		  break;
		default:
		  model.primitive = gl.TRIANGLES;
	  }
}	

function setPrimitive(objectsToDraw) {	
	objectsToDraw.forEach(function(model) {
		setOnePrimitive(model)
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
