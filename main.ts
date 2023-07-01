/*
  Top page:
  name, contacts, fancy animation

  school:
  * school logo
  * rose red background

  experance:

  skills:
  * 6 langs on the 6 sides of a cube
  Python,
  Java,
  C/C++,
  JavaScript/TypeScript,
  HTML CSS, 
  bash

  Projects randomly floating and spinning:
  Websites | Flask, Vue, tailwind, TypeScript, JavaScript, HTML, CSS, Socket.io 
  Real Time Object Detection For Robotic Actuation | Python           
  Embedded Systems External Device Drivers | C, C++             
  Auto grader
  Robomasters Game
  Boids: bird flock simulation
  KD trees collision detection: optimized collision detection to log n
  C internet socket, shell, scheduler: low-level understanding of OS
  Created own architecture and assembly.
  Digital Electronics: Arduino projects and soldering

*/
import './style.css'
import * as THREE from 'three'
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { AsciiEffect } from 'three/addons/effects/AsciiEffect.js';
import { SVGLoader } from 'three/addons/loaders/SVGLoader.js';

//==================== setup ==================== 
// setup needs 3 things: scene, cam, renderer
// init scene
const scene = new THREE.Scene()

// init cam
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000)

const renderer = new THREE.WebGLRenderer({ // choosing which elm to use
  canvas: document.querySelector('#bg')
})
// const renderer = new THREE.WebGLRenderer();

renderer.setPixelRatio(window.devicePixelRatio) //set renderer pixel ratio
renderer.setSize(window.innerWidth, window.innerHeight) // make it full screen


// const lightHelper = new THREE.PointLightHelper(pointLight) // gives wireframe to light
const gridHelper = new THREE.GridHelper(200, 50) // adds grid to sceen
scene.add(gridHelper)

const controls = new OrbitControls(camera, renderer.domElement)

//mesh

function wireframe(name: string, size, shapex, shapez) {
  // Geometry
  const wireframeGeometry = new THREE.PlaneGeometry(
    size.width, size.height, // width, height
    shapex, shapez // Segments
  );
  // Material
  const wireframeMaterial = new THREE.MeshBasicMaterial({
    color: 0x1a7aad,
    wireframe: true,
    transparent: true,
    depthWrite: false,
    // side: THREE.DoubleSide,
    blending: THREE.AdditiveBlending
  });

  // Mesh
  const wireframe = new THREE.Mesh(wireframeGeometry, wireframeMaterial);
  wireframe.name = name;
  return wireframe;
}

const num_segments = 20

// const mesh = scene.add(wireframe("terrain", {width: 1, height: 1}, [255, 255]));
// const mesh = wireframe("terrain", { width: 50, height: 50 }, [num_segments - 1, num_segments - 1]);
const mesh = wireframe("terrain", { width: 450, height: 100 }, num_segments - 1, 4 - 1);
// const mesh = wireframe("terrain", { width: 720, height: 720 }, [num_segments - 1, num_segments - 1]);
mesh.rotateX(-Math.PI / 2)
mesh.position.y -= 5;
mesh.position.z -= 190;
scene.add(mesh)

// Update
const positionAttribute = mesh.geometry.getAttribute('position');



function display_text(text: string, x: int, y: int, z: int) {

  const canvas = document.createElement('canvas')
  const context = canvas.getContext('2d')
  context.fillStyle = 'white'
  context.font = '30px sans-serif'
  context.fillText(text, 0, 30)

  // canvas contents are used for a texture
  const texture = new THREE.Texture(canvas)
  texture.needsUpdate = true
  var material = new THREE.MeshBasicMaterial({
    map: texture,
    side: THREE.DoubleSide,
  })
  material.transparent = true
  var text_mesh = new THREE.Mesh(new THREE.PlaneGeometry(text.length + 1, 2), material)
  text_mesh.position.set(x, y, z)
  return text_mesh
}

let data = null
// Fetch the json file
fetch('./output.json')
  .then((response) => response.json())
  .then((json) => {
    data = json
    console.log("read json");
  });




function update_wave(frame: int, step) {
  if (data == null)
    return
  // console.log("rendering...");
  let value = 0;
  for (let i = 0; i < num_segments; i++) {
    for (let j = 0; j < num_segments; j++) {
      value = data[frame][i][j]// 2
      let next_value = data[(frame + 1) % data.length][i][j]//2
      positionAttribute.setZ(num_segments * i + j, lerp(value, next_value, step));


      // scene.add(display_text(value.toString(),positionAttribute.getX(num_segments*i+j),positionAttribute.getY(num_segments*i+j),positionAttribute.getZ(num_segments*i+j)))
      // scene.add(display_text(data[frame][i][j].toString(),positionAttribute.getX(num_segments*i+j),positionAttribute.getY(num_segments*i+j),positionAttribute.getZ(num_segments*i+j)))
    }
  }
  positionAttribute.needsUpdate = true;
}


//========================adding sun=============================
function sun() {
  const geometry = new THREE.CircleGeometry(10, 32);
  const material = new THREE.MeshBasicMaterial({ color: 0xffff00 });
  const circle = new THREE.Mesh(geometry, material); scene.add(circle);
  scene.add(circle)

  for (let i = 0; i < 5; i++) {
    const bar_geometry = new THREE.PlaneGeometry(20, 1, 1, 1);
    const bar_material = new THREE.MeshBasicMaterial({ color: 0x0fff00, side: THREE.DoubleSide });
    const bars = new THREE.Mesh(bar_geometry, bar_material);
    bars.position.y -= 4*Math.sqrt(i)
    scene.add(bars);
  }
}
sun()

//============================== ascii ============================== 
scene.background = new THREE.Color(0, 0, 0);

const ambientLight = new THREE.AmbientLight(0x0f0f0f);
scene.add(ambientLight)

const pointLight1 = new THREE.PointLight(0xffffff);
pointLight1.position.set(10, 20, 10);
scene.add(pointLight1);
scene.add(new THREE.PointLightHelper(pointLight1))

const torus = new THREE.Mesh(new THREE.TorusGeometry(8, 3, 32, 100), new THREE.MeshPhongMaterial({ flatShading: true }));
// torus.position.set()
// scene.add(torus);




const effect = new AsciiEffect(renderer, ' .:-+*=%@#', { invert: true });
effect.setSize(window.innerWidth, window.innerHeight);
effect.domElement.style.color = 'white';
effect.domElement.style.backgroundColor = 'black';
// document.querySelector('#ascii').appendChild( effect.domElement );

//==================== logos ====================  
const logo = new THREE.Mesh(
  new THREE.PlaneGeometry(5, 5),
  new THREE.MeshBasicMaterial({
    map: new THREE.TextureLoader().load('../assets/logo.png'),
    transparent: true,
    side: THREE.DoubleSide
  }))
logo.position.set(15, 0, 0)
// scene.add(logo)

const rosie = new THREE.Mesh(
  new THREE.PlaneGeometry(5, 5),
  new THREE.MeshBasicMaterial({
    map: new THREE.TextureLoader().load('../assets/rosie.png'),
    transparent: true,
    side: THREE.DoubleSide
  }))
rosie.position.set(20, 0, 0)
// scene.add(rosie)

//==================== languages ==================== 
const java = new THREE.TextureLoader().load('../assets/Java-Logo.png')
java.repeat.set(0.5, 1)
java.offset.set(0.255, 0)
const html_css = new THREE.TextureLoader().load('../assets/html_css.png')
html_css.repeat.set(1, 1.1)
html_css.offset.set(0, -0.08)
const cube = new THREE.Mesh(
  new THREE.BoxGeometry(10, 10, 10),
  [new THREE.MeshLambertMaterial({
    map: java,
    transparent: true,
  }),
  new THREE.MeshLambertMaterial({
    map: new THREE.TextureLoader().load('../assets/c_cpp.png'),
    transparent: true,
  }),
  new THREE.MeshLambertMaterial({
    map: html_css,
    transparent: true,
  }),
  new THREE.MeshLambertMaterial({
    map: new THREE.TextureLoader().load('../assets/JS_TS.png'),
    transparent: true,
  }),
  new THREE.MeshLambertMaterial({
    map: new THREE.TextureLoader().load('../assets/bash.png'),
    transparent: true,
  })]
)
cube.position.set(35, 0, 0)
// scene.add(cube)

function lerp(a, b, t: float) { return a + (b - a) * t }
function ease(t) { return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t }
const loader = new GLTFLoader()

let py_logo = null
loader.load(
  '../assets/python.glb',
  gltf => {
    gltf.scene.scale.set(50, 50, 50)
    py_logo = gltf.scene
    cube.add(gltf.scene)
    py_logo.position.set(5, -6.5, 8)
    py_logo.rotation.y -= 1.55
    py_logo.rotation.z -= 0.13
  },
  xhr => { console.log((xhr.loaded / xhr.total) * 100 + '% loaded') },
  error => { console.log(error) }
)

//m stands for max hight
let points = [
  { m: 0, x: 0, y: 10, z: 30 },
  { m: 500, x: 0, y: 20, z: 30 },
  { m: 1000, x: 20, y: 10, z: 30 },
  { m: 1500, x: 20, y: 10, z: -20 },
  { m: 3500, x: -50, y: 10, z: -10 }
]

camera.position.set(points[0].x, points[0].y, points[0].z)

//====================move cam on scroll==================== 
let i = 1
function moveCamera() {
  if (i < 1) i = 1
  else if (i <= 5) i = 4
  //gets distance from top of pg when scrolling
  let t = document.body.getBoundingClientRect().top //NOTE: always negitive
  let curPoint = points[i]
  let pastPoint = points[i - 1]
  t = (t + pastPoint.m) / (curPoint.m - pastPoint.m)// t has to stay between 0 and 1
  // console.log('t :>> ', t);

  if (t < -1) {
    i++
  } else if (t > 0) {
    i--
  }
  // console.log("t after:", t);

  camera.position.x = lerp(pastPoint.x, curPoint.x, ease(-t))
  camera.position.y = lerp(pastPoint.y, curPoint.y, ease(-t))
  camera.position.z = lerp(pastPoint.z, curPoint.z, ease(-t))
  camera.lookAt(0, 10, 0)
}

//========================= window resize ==================== 
window.addEventListener('resize', onWindowResize);
function onWindowResize() {

  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();

  renderer.setSize(window.innerWidth, window.innerHeight);
  effect.setSize(window.innerWidth, window.innerHeight);

}

// runs func everytime user scrolls
// document.body.onscroll = moveCamera
//====================  main control loop (game loop) ====================

// update_wave(0, 0)
let frame_index = 0;
let spacer = 0;
function animate() {
  requestAnimationFrame(animate) // tells browser to perform an animation

  // if (robot) robot.rotation.y += 0.01
  // torus.rotation.x += 0.01
  // torus.rotation.y += 0.03
  // torus.rotation.z += 0.03

  // logo.rotation.x += 0.01
  // logo.rotation.y += 0.01

  // cube.rotateX(0.01)
  // cube.rotateY(0.01)
  // cube.rotateZ(0.01)

  // rosie.rotation.y += 0.01

  spacer += .17
  if (spacer >= 1 && data != null) {
    frame_index++
    frame_index %= data.length
  }
  spacer %= 1
  update_wave(frame_index, spacer)
  // update_wave(0, spacer)

  controls.update()//lets us move around in the browser
  effect.render(scene, camera) // updates UI
}
animate()