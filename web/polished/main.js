import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.154.0/build/three.module.js';
import { OrbitControls } from 'https://cdn.jsdelivr.net/npm/three@0.154.0/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from 'https://cdn.jsdelivr.net/npm/three@0.154.0/examples/jsm/loaders/GLTFLoader.js';
import { EffectComposer } from 'https://cdn.jsdelivr.net/npm/three@0.154.0/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'https://cdn.jsdelivr.net/npm/three@0.154.0/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'https://cdn.jsdelivr.net/npm/three@0.154.0/examples/jsm/postprocessing/UnrealBloomPass.js';
import { SSAOPass } from 'https://cdn.jsdelivr.net/npm/three@0.154.0/examples/jsm/postprocessing/SSAOPass.js';

// Polished prototype: PBR terrain, GLTF loader for sunflower/gift (if present), first-person-ish camera
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x99d6ff);

const camera = new THREE.PerspectiveCamera(60, innerWidth/innerHeight, 0.1, 1000);
camera.position.set(0, 6, 12);

const renderer = new THREE.WebGLRenderer({antialias:true});
renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(innerWidth, innerHeight);
renderer.outputEncoding = THREE.sRGBEncoding;
document.body.appendChild(renderer.domElement);

const controls = new OrbitControls(camera, renderer.domElement);
controls.target.set(0,1.5,0);
controls.enableDamping = true;

const dir = new THREE.DirectionalLight(0xffffff, 1.0);
dir.position.set(10,20,10);
dir.castShadow = true;
scene.add(dir);
scene.add(new THREE.AmbientLight(0x666666));

// Terrain: plane with height displacement
const size = 200; const segments = 200;
const geom = new THREE.PlaneGeometry(size, size, segments, segments);
geom.rotateX(-Math.PI/2);
// simple procedural height
for(let i=0;i<geom.attributes.position.count;i++){
  const x = geom.attributes.position.getX(i);
  const z = geom.attributes.position.getZ(i);
  const h = Math.sin(x*0.05)*2 + Math.cos(z*0.04)*1.2 + (Math.random()-0.5)*0.6;
  geom.attributes.position.setY(i, h);
}
geom.computeVertexNormals();

const terrainMat = new THREE.MeshStandardMaterial({color:0x7fb66a, roughness:0.9, metalness:0.0});
const terrain = new THREE.Mesh(geom, terrainMat);
terrain.receiveShadow = true;
scene.add(terrain);

// shrine area
const shrine = new THREE.Mesh(new THREE.BoxGeometry(4,0.25,4), new THREE.MeshStandardMaterial({color:0x8b5a2b}));
shrine.position.set(8,0.125,0);
scene.add(shrine);

// load models (if assets present) or use placeholders
const loader = new GLTFLoader();
const sunflowers = [];
function createSunflowerPlaceholder(x,z){
  const g = new THREE.Group();
  const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.04,0.04,1.8), new THREE.MeshStandardMaterial({color:0x2b9b2b}));
  stem.position.y = 0.9; g.add(stem);
  const head = new THREE.Mesh(new THREE.SphereGeometry(0.28,12,12), new THREE.MeshStandardMaterial({color:0xffdd44}));
  head.position.y = 1.8; g.add(head);
  g.position.set(x,0,z);
  scene.add(g); sunflowers.push(g);
}

// populate a small field
for(let i=0;i<40;i++){
  const x = (Math.random()-0.5)*30;
  const z = (Math.random()-0.5)*30;
  createSunflowerPlaceholder(x,z);
}

// Raycasting interactions
const raycaster = new THREE.Raycaster();
const pointer = new THREE.Vector2();
let basket = 0; let placed = 0; const targetPlace=5;
function updateHUD(){
  document.getElementById('basket').innerText = 'Basket: ' + basket;
  document.getElementById('placed').innerText = 'Placed: ' + placed + ' / ' + targetPlace;
}
updateHUD();

function onPointerDown(ev){
  pointer.x = (ev.clientX / innerWidth) * 2 - 1;
  pointer.y = - (ev.clientY / innerHeight) * 2 + 1;
  raycaster.setFromCamera(pointer, camera);
  const intersects = raycaster.intersectObjects(scene.children, true);
  if(intersects.length>0){
    const obj = intersects[0].object;
    // check sunflower groups
    for(const g of sunflowers){ if(g.children.includes(obj) || g===obj || g===obj.parent){
      // pick
      scene.remove(g); sunflowers.splice(sunflowers.indexOf(g),1); basket++; updateHUD(); return; }
    }
    if(obj===shrine || obj.parent===shrine){ if(basket>0){
      // place decorative sunflower
      const placedObj = createSunflowerPlaceholder(shrine.position.x + (placed-2)*0.9, shrine.position.z);
      basket--; placed++; updateHUD();
      if(placed>=targetPlace){ spawnGift(); }
    }}
  }
}
window.addEventListener('pointerdown', onPointerDown);

// Post-processing
const composer = new EffectComposer(renderer);
composer.addPass(new RenderPass(scene, camera));
composer.addPass(new UnrealBloomPass(new THREE.Vector2(innerWidth, innerHeight), 0.4, 0.6, 0.1));
composer.addPass(new SSAOPass(scene, camera, innerWidth, innerHeight));

// gift spawn
let giftMesh = null;
function spawnGift(){
  if(giftMesh) return;
  giftMesh = new THREE.Mesh(new THREE.BoxGeometry(1,0.8,1), new THREE.MeshStandardMaterial({color:0xff66aa}));
  giftMesh.position.set(shrine.position.x, 0.6, shrine.position.z);
  scene.add(giftMesh);
}

function animateGiftOpen(){
  if(!giftMesh) return; scene.remove(giftMesh); document.getElementById('giftModal').classList.remove('hidden');
}

window.addEventListener('click', (ev)=>{
  // if gift present and clicked
  if(giftMesh){ pointer.x = (ev.clientX / innerWidth) * 2 - 1; pointer.y = - (ev.clientY / innerHeight) * 2 + 1; raycaster.setFromCamera(pointer,camera);
    const ints = raycaster.intersectObject(giftMesh, true); if(ints.length>0) animateGiftOpen(); }
});

// resize
window.addEventListener('resize', ()=>{ camera.aspect = innerWidth/innerHeight; camera.updateProjectionMatrix(); renderer.setSize(innerWidth, innerHeight); composer.setSize(innerWidth, innerHeight); });

// render loop
function render(){ requestAnimationFrame(render); controls.update(); composer.render(); }
render();
