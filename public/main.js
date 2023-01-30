//MAIN

//standard globals
var container, scene, camera, renderer, controls, stats;
var clock = new THREE.Clock();

var keyboard = new KeyboardState();

//custom globals
var cube;
var posarray = [];
const cubeGeometry = new THREE.BoxGeometry();
const cubeMaterial = new THREE.MeshPhongMaterial({color: 0x00ff00, wireframe:false});
var socket = io();
var cubeDict = {};
var socketid;

init();
animate();

//FUNCTIONS
function init()
{
	//SCENE
	scene = new THREE.Scene();
	//CAMERA
	var SCREEN_WIDTH = window.innerWidth, SCREEN_HEIGHT = window.innerHeight;
	var VIEW_ANGLE = 75, ASPECT = SCREEN_WIDTH / SCREEN_HEIGHT, NEAR = 0.1, FAR = 20000;
	camera = new THREE.PerspectiveCamera(VIEW_ANGLE, ASPECT, NEAR, FAR);
	scene.add(camera);
	camera.position.set(10,10,10);
	camera.lookAt(scene.position);
	//RENDERER
	renderer = new THREE.WebGLRenderer( {antialias:true});
	renderer.setSize(SCREEN_WIDTH, SCREEN_HEIGHT);
	container = document.getElementById("ThreeJS");
	container.appendChild(renderer.domElement);
	//EVENTS
	THREEx.WindowResize(renderer, camera);
	//CONTROLS
	controls = new THREE.OrbitControls(camera, renderer.domElement);
	//LIGHT
	//var light = new THREE.PointLight(0xffffff);
	//light.position.set(100,250,100);
	var light = new THREE.HemisphereLight(0xB1E1FF, 0xB97A20, 1);
	scene.add(light);
	//FLOOR
	var floorGeometry = new THREE.PlaneGeometry(100,100,1,1);
	var floorMaterial = new THREE.MeshPhongMaterial ( {color:0x999999, side: THREE.DoubleSide} );
	var floor = new THREE.Mesh(floorGeometry, floorMaterial);
	floor.position.y = -0.5;
	floor.rotation.x = Math.PI / 2;
	scene.add(floor);
	//SKYBOX
	/*
	var skyBoxGeometry = new THREE.CubeGeometry(1000,1000,1000);
	var skyBoxMaterial = new THREE.MeshBasicMaterial({color:0x9999ff, side: THREE.BackSide});
	var skyBox = new THREE.Mesh(skyBoxGeometry, skyBoxMaterial);
	scene.add(skyBox);
	*/
	////////////
	// CUSTOM //
	////////////
	var randomColor = '0x'+Math.floor(Math.random()*16777215).toString(16);
	cube = new THREE.Mesh(cubeGeometry, cubeMaterial);
	scene.add(cube);
	cube.material.color.setHex(randomColor);
	socket.emit("sendColour", randomColor);
	
}

function animate()
{
	requestAnimationFrame(animate);
	render();
	update();
}

function update()
{
	keyboard.update();

	if (keyboard.down("left") || keyboard.down("A"))
	{
		cube.translateX(-1);
		socket.emit("updateServer", cube.position);
	}

	if (keyboard.down("right") || keyboard.down("D"))
	{
		cube.translateX(1);
		socket.emit("updateServer", cube.position);
	}

	if (keyboard.down("up") || keyboard.down("W"))
	{
		cube.translateZ(-1);
		socket.emit("updateServer", cube.position);
	}

	if (keyboard.down("down") || keyboard.down("S"))
	{
		cube.translateZ(1);
		socket.emit("updateServer", cube.position);
	}

	if (keyboard.down("space"))
	{
		var randomColor = '0x'+Math.floor(Math.random()*16777215).toString(16);
		setColor(randomColor);
	}

	if (keyboard.down("R"))
	{
		cube.position.set(0,0,0);
		socket.emit("updateServer", cube.position);
	}

	if (keyboard.down("enter"))
	{
		setColor("0x" + prompt("Input 6 digit hex colour code","FFFFFF"));
	}

	if (keyboard.down("F"))
	{
		console.log(camera.getWorldDirection());
	}
	
	controls.update();

};


function render()
{
	renderer.render(scene, camera);
};

function newCube(keyName, color)
{

	var tempCubeMaterial = new THREE.MeshPhongMaterial({color: 0x0000ff, wireframe:false});
	var tempCube = new THREE.Mesh(cubeGeometry, tempCubeMaterial);
	cubeDict[keyName] = tempCube;
	scene.add(cubeDict[keyName]);
	cubeDict[keyName].material.color.setHex(color);
};

function setColor(color)
{
		cube.material.color.setHex(color);
		socket.emit("colourChangeTOSERVER", color);
};

//PHONE FUNCTIONS 
function phoneLeft(){
	cube.translateX(-1);
	socket.emit("updateServer", cube.position);
}

function phoneUp(){
	cube.translateZ(-1);
	socket.emit("updateServer", cube.position);
}

function phoneRight(){
	cube.translateX(1);
	socket.emit("updateServer", cube.position);
}

function phoneDown(){
	cube.translateZ(1);
	socket.emit("updateServer", cube.position);
}

function phoneColour(){
	var randomColor = '0x'+Math.floor(Math.random()*16777215).toString(16);
	setColor(randomColor);
}

//EVENTS
//logs ID of this socket to console
socket.on("sendID", (id) => {
	console.log(`Connected to server with socketid ${id}`);
	socketid = id;
});

//creates cube object for each cube in socketObj
socket.on("loadCubes", (socketObj) => {
	for (var i in socketObj)
	{
		newCube(i, socketObj[i]);
	};
});

//when a new socket connects a new cube is created
socket.on("newCube", (id, color) => {
	newCube(id, color);
});

//updates cube dictionary with new positions
socket.on("updateSockets", (id, position) => {
	cubeDict[id].position.x = position.x;
	cubeDict[id].position.y = position.y;
	cubeDict[id].position.z = position.z;
});

socket.on("posReq", () =>{
	socket.emit("updateServer", cube.position);
});

socket.on("colourChangeTOCLIENT", (id, color) => {
	cubeDict[id].material.color.setHex(color);
});

//removes cube from scene and dictionary when socket disconnects
socket.on("cubeDisconnect", (id) => {
	scene.remove(cubeDict[id]);
	delete cubeDict[id];
});

