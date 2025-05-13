var estrellas = [];


function generar_estrella(vec_pos){

    let position = vec_pos;
	crear_estrella(
		{
			position: position
		}, 
		{
			programInfo: programInfo,
			pointsArray: puntosEstrellas, 
			colorsArray: color_estrellas, 
			uniforms: {
			u_colorMult: [1.0, 1.0, 1.0, 1.0],
			u_model: translate(position[0], position[1], position[2]),
			},
			primType: "triangles",
		}, 
		estrellas
	)
}


function posicionEstrellaAleatoria(minR, maxR, centro) {
	// Ángulo aleatorio en esferas: theta y phi
	let theta = Math.random() * 2 * Math.PI;
	let phi = Math.acos(2 * Math.random() - 1);

	// Radio aleatorio entre minR y maxR
	let r = minR + Math.random() * (maxR - minR);

	// Coordenadas esféricas a cartesianas
	let x = r * Math.sin(phi) * Math.cos(theta);
	let y = r * Math.sin(phi) * Math.sin(theta);
	let z = r * Math.cos(phi);

	// Trasladar desde el centro dado
	return [
		centro[0] + x,
		centro[1] + y,
		centro[2] + z
	];
}


function generar_fondo_estrellas() {

    for(let i = 0; i < 300; i++) {
        let pos = posicionEstrellaAleatoria(400, 1000, [0, 0, -230]);
        generar_estrella(vec3(pos[0], pos[1], pos[2]));
    }
}