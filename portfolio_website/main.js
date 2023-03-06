/*
  Top page:
  name, contacts, fancy animation

  school:
  * school logo
  * rose red background

  experance:

  skills:
  * 6 langs on the 6 sides of a cube

  Projects randomly floating and spinning
  Websites | Flask, Vue, TypeScript, JavaScript, HTML, CSS, Socket.io Jun 17, 2021
  Real Time Object Detection For Robotic Actuation | Python           Mar 8, 2022
  Embedded Systems External Device Drivers | C, C++             Jun 8, 2022
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
import { GLTFLoader } from 'https://unpkg.com/three@0.120.1/examples/jsm/loaders/GLTFLoader'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { AsciiEffect } from 'three/addons/effects/AsciiEffect.js';

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


// const lightHelper = new THREE.PointLightHelper(pointLight) // gives wirefram to light
const gridHelper = new THREE.GridHelper(200, 50) // adds grid to sceen
scene.add(gridHelper)

const controls = new OrbitControls(camera, renderer.domElement)

//============================== ascii ball============================== 
scene.background = new THREE.Color( 0, 0, 0 );

const ambientLight = new THREE.AmbientLight(0x0f0f0f);
scene.add(ambientLight)

const pointLight1 = new THREE.PointLight( 0xffffff );
pointLight1.position.set( 10, 20, 10 );
scene.add( pointLight1 );
scene.add(new THREE.PointLightHelper(pointLight1))

const torus = new THREE.Mesh( new THREE.TorusGeometry(8, 3, 32, 100), new THREE.MeshPhongMaterial( { flatShading: true } ) );
scene.add(torus);



const effect = new AsciiEffect( renderer, ' .:-+*=%@#', { invert: true } );
effect.setSize( window.innerWidth, window.innerHeight );
effect.domElement.style.color = 'white';
effect.domElement.style.backgroundColor = 'black';
document.querySelector('#ascii').appendChild( effect.domElement );

// scene.background = new THREE.TextureLoader().load('../assets/space.jpg')// loads img

function lerp(a, b, t) { return a + (b - a) * t }
function ease(t) { return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t }

/*
const material = new THREE.MeshPhysicalMaterial({
  color: 0xb2ffc8,
  metalness: 0.25,
  roughness: 0.1,
  opacity: 1.0,
  transparent: true,
  transmission: 0.99,
  clearcoat: 1.0,
  clearcoatRoughness: 0.25
})
const loader = new STLLoader()
loader.load(
  '../assets/STD-GML-Rotation_Pulley.STL',
    function (geometry) {
    const mesh = new THREE.Mesh(geometry, material)
    scene.add(mesh)
    mesh.position.set(0,0,0)
  },
  (xhr) => {
    console.log((xhr.loaded / xhr.total) * 100 + '% loaded')
  },
  (error) => {
    console.log(error)
  }
)
*/
const loader = new GLTFLoader()
let robot = null;
/*
loader.load(
  '../assets/CarBlue.glb',
  function (gltf) {
    gltf.scene.scale.set(50, 50, 50)
    gltf.scene.rotation.x += 0.01
    robot = gltf.scene
    // gltf.scene.traverse(function (child) {
    //     if ((child as THREE.Mesh).isMesh) {
    //         const m = (child as THREE.Mesh)
    //         m.receiveShadow = true
    //         m.castShadow = true
    //     }
    //     if (((child as THREE.Light)).isLight) {
    //         const l = (child as THREE.Light)
    //         l.castShadow = true
    //         l.shadow.bias = -.003
    //         l.shadow.mapSize.width = 2048
    //         l.shadow.mapSize.height = 2048
    //     }
    // })
    scene.add(gltf.scene)
  },
  (xhr) => {
    // console.log((xhr.loaded / xhr.total) * 100 + '% loaded')
  },
  (error) => {
    console.log(error)
  }
)
*/
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
  if(i<1) i = 1
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
  camera.lookAt(0,10,0)
}

//========================= window resize ==================== 
window.addEventListener( 'resize', onWindowResize );
function onWindowResize() {

  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();

  renderer.setSize( window.innerWidth, window.innerHeight );
  effect.setSize( window.innerWidth, window.innerHeight );

}

// runs func everytime user scrolls
// document.body.onscroll = moveCamera
//====================  main control loop (game loop) ====================
function animate() {
  requestAnimationFrame(animate) // tells browser to perform an animation

  // if (robot) robot.rotation.y += 0.01
  torus.rotation.x += 0.01
  torus.rotation.y += 0.03
  torus.rotation.z += 0.03

  controls.update()//lets us move around in the browser
  effect.render(scene, camera) // updates UI
}
animate()