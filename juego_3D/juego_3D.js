/*
* 
* juego_3D.js
* Videojuegos (30262) - Curso 2024-2025
* 
*/

// Variable to store the WebGL rendering context
var gl;

var rotAngle = 0.0;
var rotChange = 0.5;

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

function update_hud() {
	hud_distance_center.textContent = length(jugador.position).toFixed(4) + " m"
	hud_velocity_target.textContent = (-dot(jugador.velocity, normalize(jugador.position))).toFixed(4) + " m/s"
	hud_velocity.textContent = "Velocidad total: " + length(jugador.velocity).toFixed(4)
}

function start_hud() {
	hud_distance_center = document.getElementById("hud_distance");
	hud_velocity_target = document.getElementById("hud_velocity_target");
	hud_velocity = document.getElementById("hud_velocity");
	hud_ajustar_vel = document.getElementById("hud_ajustar_vel");
	hud_ajustar_vel.textContent = "Velocidad Ajustada"
	hud_ajustar_vel.style.display = 'none';
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
	let model = {
		programInfo: programInfo,
		pointsArray: pointsNave, 
		colorsArray: colorsNave, 
		uniforms: {
		  u_colorMult: [1.0, 1.0, 1.0, 1.0],
		  u_model: new mat4(),
		},
		primType: "triangles",
	};
	objectsToDraw.push(
		model,
	)
	setOnePrimitive(model)
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

		model: objectsToDraw[objectsToDraw.length-1]
	});
	
}

//------------------------------------------------------------------------------

var canvas;
var hud_distance_center;
var hud_velocity_target;
var hud_velocity;
var hud_ajustar_vel;

window.onload = function init() {
	
	// Set up a WebGL Rendering Context in an HTML5 Canvas
	canvas = document.getElementById("gl-canvas");
	canvas.width = window.innerWidth;
	canvas.height = window.innerHeight;
	start_hud();
	gl = WebGLUtils.setupWebGL(canvas);
	if (!gl) {
		alert("WebGL isn't available");
	}

	//  Configure WebGL
	gl.clearColor(0.0, 0.0, 0.0, 1.0);
	gl.enable(gl.DEPTH_TEST);

	setPrimitive(objectsToDraw);
	setPrimitive(spheresToDraw);

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
	
	createNaveEnemiga();
	
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
	// Calculo rotación del jugador
	mover_camara(dt);
	jugador.yaw += jugador.yaw_velocity * dt;
	jugador.pitch += jugador.pitch_velocity * dt;
	jugador.roll += jugador.roll_velocity * dt;
	nuevo_eje_movimiento(jugador);
	// Calculo movimiento del jugador
	jugador.velocity = add(jugador.velocity, mult(dt, calcular_gravedad(jugador)));
	jugador.position = add(jugador.position, mult(dt, jugador.velocity));

	handle_disparos(dt, jugador)
	
	update_hud()

	detectar_colisiones()
	
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
