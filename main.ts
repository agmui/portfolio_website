import './style.css'
// import * as THREE from 'three'
//Needs to be version 132 bc the bloom pass does not work
//FIXME: rename to THREE2 or something
import * as THREE from 'https://threejsfundamentals.org/threejs/resources/threejs/r132/build/three.module.js'
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { AsciiEffect } from 'three/addons/effects/AsciiEffect.js';
import { SVGLoader } from 'three/addons/loaders/SVGLoader.js';
import { Color } from 'three/src/math/Color.js';
import { BufferGeometry } from 'three/src/core/BufferGeometry.js';

import { GUI } from 'dat.gui'
import Stats from 'three/examples/jsm/libs/stats.module'

import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
// import { EffectPass } from 'three/addons/postprocessing/EffectPass.js';
import { UnrealBloomPass } from 'https://cdn.skypack.dev/three@0.132.2/examples/jsm/postprocessing/UnrealBloomPass.js';
import { ShaderPass } from 'https://cdn.skypack.dev/three@0.132.2/examples/jsm/postprocessing/ShaderPass.js';

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
  canvas: document.querySelector('#bg'),
  // context: GLctx,
  alpha: true,
  antialias: true,
})
// const renderer = new THREE.WebGLRenderer();

renderer.setPixelRatio(window.devicePixelRatio) //set renderer pixel ratio
renderer.setSize(window.innerWidth, window.innerHeight) // make it full screen


// const lightHelper = new THREE.PointLightHelper(pointLight) // gives wireframe to light
// const gridHelper = new THREE.GridHelper(200, 50) // adds grid to sceen
// scene.add(gridHelper)

// const controls = new OrbitControls(camera, renderer.domElement)

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

let data: any = null
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
  400, 200,//w,h
  100, 50//sections
)

ToQuads(geo);
apply_gradent(geo, 0xa746c7, 0x19F2F7)

function apply_gradent(geometry, color1, color2) {
  const color: Color = new Color()
  const colors = []
  const count = geo.attributes.position.count
  for (let index = 0; index < count; index++) {
    // const t = Math.pow(index / count, 1)// easing function
    const t = index / count
    color.lerpColors(new Color(color1), new Color(color2), t)//lerp
    colors.push(color.r, color.g, color.b);
  }
  geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));

}

let m = new THREE.LineBasicMaterial({
  // color: 0x00ffff,
  vertexColors: true
});

const grid = new THREE.LineSegments(geo, m);
// const grid = new THREE.Mesh(geo, new THREE.MeshBasicMaterial({
//   color: 0xffffff,
//   // vertexColors: true,
//   wireframe: true
// }))
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

const amb_light = new THREE.AmbientLight(0x999999); // soft white light
scene.add(amb_light);

var lights = [];
lights[0] = new THREE.DirectionalLight(0xffffff, .3);
lights[0].position.set(10, KNOT_POS - 7, 0);
lights[0].target = knot

lights[1] = new THREE.DirectionalLight(0x11E8BB, .4);
lights[1].position.set(8, KNOT_POS - 7, -7);
lights[1].target = knot

lights[2] = new THREE.DirectionalLight(0x8200C9, .4);
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

//==================== bloom pass ====================  
const params = {
  bloomStrength: 1.1,
  bloomThreshold: 0.41,
  bloomRadius: 1
};

const composer = new EffectComposer(renderer);

const renderScene = new RenderPass(scene, camera);
// composer.renderToScreen = false;
composer.addPass(renderScene);

const bloomPass = new UnrealBloomPass(new THREE.Vector2(window.innerWidth, window.innerHeight), 1.5, 0.4, 0.85);
bloomPass.threshold = params.bloomThreshold;
bloomPass.strength = params.bloomStrength;
bloomPass.radius = params.bloomRadius;
composer.addPass(bloomPass);

// ==================== gui==================== 
const stats = new Stats()
document.body.appendChild(stats.dom)

const gui = new GUI()
const bloomFolder = gui.addFolder('bloom')
bloomFolder.add(bloomPass, 'threshold', 0, 1)
bloomFolder.add(bloomPass, 'strength', 0, 3)
bloomFolder.add(bloomPass, 'radius', 0, 1)
// bloomFolder.add(bloomPass, 'exposure', 0, 2)
bloomFolder.open()
const lightFolder = gui.addFolder('lights')
lightFolder.add(lights[0], 'intensity', 0, 1)
lightFolder.add(lights[1], 'intensity', 0, 1)
lightFolder.add(lights[2], 'intensity', 0, 1)

lightFolder.open()
const amb_lightFolder = gui.addFolder('ambient lights')
amb_lightFolder.add(amb_light, 'intensity', 0, 1)
let p = {
  color: 0xff00ff
}
amb_lightFolder.addColor(p, 'color').onChange((params) => {
  amb_light.color.set(params)
})
amb_lightFolder.open()
// const cameraFolder = gui.addFolder('Camera')
// cameraFolder.add(camera.position, 'z', 0, 10)
// cameraFolder.open()

//==================== cam ====================

function lerp(a, b, t: float) { return a + (b - a) * t }
function ease(t) { return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t }


//m stands for max hight
let points = [
  { m: 0, x: 0, y: 10, z: 30, lookAt: { x: 0, y: 0, z: 0 } },
  { m: 500, x: 0, y: 10, z: 20, lookAt: { x: 0, y: 0, z: 0 } },
  { m: 1000, x: 0, y: 20, z: 10, lookAt: { x: 0, y: 0, z: 0 } },
  { m: 1500, x: 0, y: 50, z: 0, lookAt: { x: 0, y: 100, z: 0 } },
]

camera.position.set(points[0].x, points[0].y, points[0].z)

//====================move cam on scroll==================== 
//TODO: make a class

type point = {
  m: number, x: number, y: number, z: number, lookAt: { x: number, y: number, z: number }
}
class CameraLerp {

  camera: THREE.Camera;
  points: Array<point>;
  point_index: number;
  last_index: number;
  currentPoint: point;
  pastPoint: point;
  t: number;

  constructor(camera: THREE.Camera, points: Array<point>) {
    this.camera = camera;
    this.points = points;
    this.point_index = 1;
    this.last_index = points.length - 1;
    this.currentPoint = points[0];
    this.pastPoint = points[1];
    this.t = 0;
  }

  lerp(a: number, b: number, t: number) { return a + (b - a) * t }
  ease(t: number) { return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t }

  showPoints() {
    const points_vec = []
    for (let i = 0; i < points.length; i++) {
      const p = points[i];
      points_vec.push(new THREE.Vector3(p.x, p.y, p.z))// for lines
      const geometry = new THREE.SphereGeometry(1, 1, 1);
      const material = new THREE.MeshBasicMaterial({ color: 0xffff00, wireframe: true });
      const sphere = new THREE.Mesh(geometry, material);
      sphere.position.set(p.x, p.y, p.z)
      scene.add(sphere);
    }
    const material = new THREE.LineBasicMaterial({ color: 0xffff00 });
    const geometry = new THREE.BufferGeometry().setFromPoints(points);
    const line = new THREE.Line(geometry, material);
    scene.add(line)
  }

  calculatePosition() {
    if (this.point_index < 1) this.point_index = 1 // first point stop
    if (this.point_index > this.last_index) this.point_index = this.last_index // last point stop

    this.t = document.body.getBoundingClientRect().top //NOTE: always negitive
    this.currentPoint = this.points[this.point_index]
    this.pastPoint = this.points[this.point_index - 1]
    this.t = (this.t + this.pastPoint.m) / (this.currentPoint.m - this.pastPoint.m)// t has to stay between 0 and 1

    if (this.t < -1) {
      this.point_index++
    } else if (this.t > 0) {
      this.point_index--
    } else {
      return true
    }
    return false
  }

  init() {
    // runs func everytime user scrolls
    document.body.onscroll = () => { this.moveCamera() } // js being cringe

    //precalculate point_index
    for (let i = 0; i < points.length - 2; i++) {
      if (this.calculatePosition()) break
    }
    //move cam to last point
    if (this.point_index == this.last_index) {
      this.changePos(
        this.points[this.point_index].x,
        this.points[this.point_index].y,
        this.points[this.point_index].z,
        this.points[this.point_index].lookAt
      )
    }

    this.changePos(
      this.lerp(this.pastPoint.x, this.currentPoint.x, this.ease(-this.t)),
      this.lerp(this.pastPoint.y, this.currentPoint.y, this.ease(-this.t)),
      this.lerp(this.pastPoint.z, this.currentPoint.z, this.ease(-this.t)),
      this.points[this.point_index].lookAt
    )
  }

  moveCamera() {
    this.calculatePosition()

    if (this.point_index > this.last_index) return //TODO: come up with a better solution for the end

    this.changePos(
      this.lerp(this.pastPoint.x, this.currentPoint.x, this.ease(-this.t)),
      this.lerp(this.pastPoint.y, this.currentPoint.y, this.ease(-this.t)),
      this.lerp(this.pastPoint.z, this.currentPoint.z, this.ease(-this.t)),
      this.points[this.point_index].lookAt
    )
    const t_deg = -document.body.getBoundingClientRect().top /points[this.last_index].m
    camera.rotation.x = lerp(0,Math.PI/2,t_deg)
  }

  changePos(x: number, y: number, z: number, lookAt: { x: number, y: number, z: number }) {
    this.camera.position.x = x
    this.camera.position.y = y
    this.camera.position.z = z
    // this.camera.lookAt(lookAt.x, lookAt.y, lookAt.z)
  }
}
/*
let point_index = 1
const POINT_EDGE = points.length - 1
let curPoint = points[1]
let pastPoint = points[0]
let t = 0

function calculate_position() {
  if (point_index < 1) point_index = 1 // first point stop
  if (point_index > POINT_EDGE) point_index = POINT_EDGE // last point stop

  t = document.body.getBoundingClientRect().top //NOTE: always negitive
  curPoint = points[point_index]
  pastPoint = points[point_index - 1]
  t = (t + pastPoint.m) / (curPoint.m - pastPoint.m)// t has to stay between 0 and 1

  if (t < -1) {
    point_index++
  } else if (t > 0) {
    point_index--
  } else {
    return true
  }
}

//precalculate point_index
for (let i = 0; i < points.length - 2; i++) {
  if (calculate_position()) break
}
//move cam to last point
if (point_index == POINT_EDGE) {
  camera.position.x = points[point_index].x
  camera.position.y = points[point_index].y
  camera.position.z = points[point_index].z
  camera.lookAt(0, 10, 0)
}

function moveCamera() {
  calculate_position()

  if (point_index > POINT_EDGE) return //TODO: come up with a better solution for the end
  camera.position.x = lerp(pastPoint.x, curPoint.x, ease(-t))
  camera.position.y = lerp(pastPoint.y, curPoint.y, ease(-t))
  camera.position.z = lerp(pastPoint.z, curPoint.z, ease(-t))
  camera.lookAt(0, 10, 0)
}
*/


const camLerp = new CameraLerp(camera, points)
camLerp.showPoints()
camLerp.init()
//========================= window resize ==================== 
window.addEventListener('resize', onWindowResize);
function onWindowResize() {

  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();

  renderer.setSize(window.innerWidth, window.innerHeight);
  // effect.setSize(window.innerWidth, window.innerHeight); //acsii stuff

}

//====================  main control loop (game loop) ====================

// update_wave(0, 0)
let frame_index = 0;
let spacer = 0;
function animate() {
  requestAnimationFrame(animate) // tells browser to perform an animation

  composer.render();

  knot.rotation.z += 0.01
  knot_skeli.rotation.x -= 0.01
  knot_skeli.rotation.y += 0.01
  knot_skeli.rotation.z += 0.01


  spacer += .17
  if (spacer >= 1 && data != null) {
    frame_index++
    frame_index %= data.length
  }
  spacer %= 1
  update_wave(frame_index, spacer)


  // controls.update()//lets us move around in the browser
  // effect.render(scene, camera) // updates ascii UI
  stats.update()
}
animate()