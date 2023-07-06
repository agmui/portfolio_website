import './style.css'
import * as THREE from 'three'
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { AsciiEffect } from 'three/addons/effects/AsciiEffect.js';
import { SVGLoader } from 'three/addons/loaders/SVGLoader.js';
import { Color } from 'three/src/math/Color.js';
import { BufferGeometry } from 'three/src/core/BufferGeometry.js';
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

const hexToRgb = (hex, forShaders = false) => {
  var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (forShaders) {
    return result ? {
      r: parseInt(result[1], 16) / 255,
      g: parseInt(result[2], 16) / 255,
      b: parseInt(result[3], 16) / 255
    } : null;
  }
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : null;
}
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
// const gridHelper = new THREE.GridHelper(200, 50) // adds grid to sceen
// scene.add(gridHelper)

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
    color: 0x19F2F7,
    wireframe: true,
    transparent: true,
    depthWrite: false,
    // side: THREE.DoubleSide,
    // blending: THREE.AdditiveBlending
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

// vertexShader for the Sun
function vertexShader() {
  return `
      varying vec2 vUv;
      varying vec3 vPos;
      void main() {
        vUv = uv;
        vPos = position;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); 
      }
  `
}

// fragmentShader for the Sun
function fragmentShader() {
  return `
      #ifdef GL_ES
      precision mediump float;
      #endif
      #define PI 3.14159265359
      #define TWO_PI 6.28318530718
      
      uniform vec2 u_resolution;
      uniform vec2 u_mouse;
      uniform float u_time;
      uniform vec3 color_main;
      uniform vec3 color_accent;
      varying vec2 vUv;
      varying vec3 vPos;
      void main() {
        vec2 st = gl_FragCoord.xy/u_resolution.xy;
        float x = vPos.y;
        float osc = ceil(sin((3. - (x - u_time) / 3.5) * 5.) / 2. + 0.4 - floor((3. - x / 2.5) * 5. / TWO_PI) / 10.);
        vec3 color = mix(color_accent, color_main, smoothstep(0.2, 1., vUv.y));
        gl_FragColor = vec4(color, osc);
      }
  `
}

const uniforms = {
  // ...getDefaultUniforms(),
  color_main: { // sun's top color
    value: hexToRgb("#fc36c9", true)
  },
  color_accent: { // sun's bottom color
    value: hexToRgb("#923dea", true)
  }
}

const sunGeom = new THREE.SphereGeometry(60, 64, 64)
const sunMat = new THREE.ShaderMaterial({
  uniforms: uniforms,
  vertexShader: vertexShader(),
  fragmentShader: fragmentShader(),
  transparent: true
})
const sun = new THREE.Mesh(sunGeom, sunMat)
sun.position.set(0, 20, -250)
scene.add(sun)

//====================  landscape ==================== 
const geo = new THREE.PlaneGeometry(
  200, 150,//w,h
  50, 50//sections
)

ToQuads(geo);
apply_gradent(geo, 0x090651, 0x19F2F7)

function apply_gradent(geometry, color1, color2) {
  const color: Color = new Color()
  const colors = []
  const count = geo.attributes.position.count
  for (let index = 0; index < count; index++) {
    const t = Math.pow(index / count, 3)// easing function
    color.lerpColors(new Color(color1), new Color(color2), t)//lerp
    colors.push(color.r, color.g, color.b);
  }
  geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));

}

let m = new THREE.LineBasicMaterial({
  // color: 0x00ffff,
  vertexColors: true
});

let grid = new THREE.LineSegments(geo, m);
// let grid = new THREE.LineSegments(geo, new THREE.MeshBasicMaterial({ color: 0xffffff, vertexColors: true }));

grid.rotateX(Math.PI / 2)
grid.position.z -= 50
scene.add(grid);

//funny convert to quad function DONT TOUCH
// https://discourse.threejs.org/t/wireframe-of-quads/17924
function ToQuads(g) {
  let p = g.parameters;
  let segmentsX = p.widthSegments
  let segmentsY = p.heightSegments
  let indices = [];
  for (let i = 0; i < segmentsY + 1; i++) {
    let index11 = 0;
    let index12 = 0;
    for (let j = 0; j < segmentsX; j++) {
      index11 = (segmentsX + 1) * i + j;
      index12 = index11 + 1;
      let index21 = index11;
      let index22 = index11 + (segmentsX + 1);
      indices.push(index11, index12);
      if (index22 < ((segmentsX + 1) * (segmentsY + 1) - 1)) {
        indices.push(index21, index22);
      }
    }
    if ((index12 + segmentsX + 1) <= ((segmentsX + 1) * (segmentsY + 1) - 1)) {
      indices.push(index12, index12 + segmentsX + 1);
    }
  }
  g.setIndex(indices);
}

//==================== knot planet====================t
// https://codepen.io/tr13ze/pen/pbjWwg?editors=0110

const KNOT_POS = 80

const knot_geo = new THREE.TorusKnotGeometry(4, 1.3, 100, 16);
var mat = new THREE.MeshPhongMaterial({
  color: 0xffffff,
  shading: THREE.FlatShading
});
const knot = new THREE.Mesh(knot_geo, mat)
knot.position.y += KNOT_POS
knot.rotateX(Math.PI / 2)
scene.add(knot)

const knot_geo2 = new THREE.OctahedronGeometry(11, 1);
var mat2 = new THREE.MeshPhongMaterial({
  color: 0xffffff,
  wireframe: true,
  side: THREE.DoubleSide

});
const knot_skeli = new THREE.Mesh(knot_geo2, mat2)//TODO:
knot_skeli.position.y += KNOT_POS
scene.add(knot_skeli)

var lights = [];
lights[0] = new THREE.DirectionalLight(0xffffff, .5);
lights[0].position.set(10, KNOT_POS - 7, 0);
lights[0].target = knot

lights[1] = new THREE.DirectionalLight(0x11E8BB, .9);
lights[1].position.set(8, KNOT_POS - 7, -7);
lights[1].target = knot

lights[2] = new THREE.DirectionalLight(0x8200C9, 1);
lights[2].position.set(8, KNOT_POS - 7, 7);
lights[2].target = knot

scene.add(lights[0]);
scene.add(lights[1]);
scene.add(lights[2]);
scene.add(new THREE.DirectionalLightHelper(lights[0]))
scene.add(new THREE.DirectionalLightHelper(lights[1]))
scene.add(new THREE.DirectionalLightHelper(lights[2]))

//====================Load background texture====================   
const img_loader = new THREE.TextureLoader();
img_loader.load('assets/Starfield.png', function (texture) {
  scene.background = texture;
});
//====================add stars==================== 
function addStar() {
  const geometry = new THREE.SphereGeometry(0.25, 24, 24);
  const material = new THREE.MeshStandardMaterial({ color: 0xffffff });
  const star = new THREE.Mesh(geometry, material);

  const [x, y, z] = Array(3)
    .fill()
    .map(() => THREE.MathUtils.randFloatSpread(100));

  star.position.set(x, y, z);
  scene.add(star);
}

Array(200).fill().forEach(addStar);
//============================== ascii ============================== 
scene.background = new THREE.Color(0, 0, 0);

// const ambientLight = new THREE.AmbientLight(0x0f0f0f);
const ambientLight = new THREE.AmbientLight(0x999999);
scene.add(ambientLight)

// const pointLight1 = new THREE.PointLight(0xffffff);
// pointLight1.position.set(10, 20, 10);
// scene.add(pointLight1);
// scene.add(new THREE.PointLightHelper(pointLight1))

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
  knot.rotation.z += 0.01
  knot_skeli.rotation.x -= 0.01
  knot_skeli.rotation.y += 0.01
  knot_skeli.rotation.z += 0.01

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