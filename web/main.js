// Simple Three.js prototype: pick sunflowers, place in shrine, open gift
import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.154.0/build/three.module.js';
import { OrbitControls } from 'https://cdn.jsdelivr.net/npm/three@0.154.0/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from 'https://cdn.jsdelivr.net/npm/three@0.154.0/examples/jsm/loaders/GLTFLoader.js';

(function(){
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x1c2348);
  scene.fog = new THREE.Fog(0x7a3550, 18, 100);

  const camera = new THREE.PerspectiveCamera(60, window.innerWidth/window.innerHeight, 0.1, 1000);
  camera.position.set(0, 10, 20);

  const renderer = new THREE.WebGLRenderer({antialias:false});
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1));
  renderer.setSize(window.innerWidth, window.innerHeight, false);
  document.body.appendChild(renderer.domElement);

  const controls = new OrbitControls(camera, renderer.domElement);
  controls.target.set(0,2,0);
  controls.enableDamping = true;
  controls.dampingFactor = 0.08;
  controls.enablePan = false;
  // allow rotation but constrain angles to avoid dipping below ground
  controls.enableRotate = true;
  controls.minPolarAngle = 0.35; // prevent looking too far up
  controls.maxPolarAngle = Math.PI/2 - 0.15; // prevent going under ground
  controls.minDistance = 6;
  controls.maxDistance = 40;

  const light = new THREE.DirectionalLight(0xffc27a, 1.15);
  light.position.set(5, 16, 7.5);
  scene.add(light);
  scene.add(new THREE.AmbientLight(0x6a5670, 0.75));
  const hemi = new THREE.HemisphereLight(0xffc08a, 0x405a76, 0.8);
  scene.add(hemi);

  const sun = new THREE.Mesh(
    new THREE.SphereGeometry(2.6, 16, 16),
    new THREE.MeshBasicMaterial({color:0xff9d4d})
  );
  sun.position.set(-18, 24, -25);
  scene.add(sun);

  function makeCloud(x,z,scale=1){
    const group = new THREE.Group();
    const baseMat = new THREE.MeshBasicMaterial({color:0xffffff});
    const p1 = new THREE.Mesh(new THREE.SphereGeometry(1.2 * scale, 8, 8), baseMat);
    const p2 = new THREE.Mesh(new THREE.SphereGeometry(1 * scale, 8, 8), baseMat);
    const p3 = new THREE.Mesh(new THREE.SphereGeometry(0.9 * scale, 8, 8), baseMat);
    p1.position.set(-0.8, 0, 0); p2.position.set(0.2, 0.1, 0); p3.position.set(1.0, 0, 0);
    group.add(p1,p2,p3);
    group.position.set(x, 10 + Math.random() * 3, z);
    scene.add(group);
    return group;
  }
  for(let i=0;i<4;i++) makeCloud(-14 + i*8, -18 - i*2, 0.8 + i*0.05);

  function createPrettyCharacter(){
    const group = new THREE.Group();
    group.scale.set(1.15, 1.18, 1);

    const playerBody = new THREE.Mesh(
      new THREE.BoxGeometry(0.74, 1.15, 0.5),
      new THREE.MeshStandardMaterial({color:0xffd9e8, roughness:0.8, metalness:0.02})
    );
    playerBody.position.y = 1.1;
    playerBody.name = 'playerBody';
    group.add(playerBody);

    const dress = new THREE.Mesh(
      new THREE.BoxGeometry(0.82, 1.42, 0.5),
      new THREE.MeshStandardMaterial({color:0xbfe7c2, roughness:0.7, metalness:0.01})
    );
    dress.position.set(0, 0.75, 0);
    dress.rotation.z = 0;
    group.add(dress);

    const playerHead = new THREE.Mesh(
      new THREE.SphereGeometry(0.32, 24, 24),
      new THREE.MeshStandardMaterial({color:0xffe0c2, roughness:0.95})
    );
    playerHead.position.set(0, 1.85, 0);
    playerHead.position.set(0, 2.04, 0);
    playerHead.name = 'playerHead';
    group.add(playerHead);

    const playerHair = new THREE.Group();
    
    // Full head covering - continuous back shell
    const hairCapBack = new THREE.Mesh(
      new THREE.BoxGeometry(0.76, 1.0, 0.42),
      new THREE.MeshStandardMaterial({color:0x2f1b26, roughness:0.95})
    );
    hairCapBack.position.set(0, 1.7, -0.14);
    playerHair.add(hairCapBack);

    // Top of head dome - full coverage connecting to back
    const hairTop = new THREE.Mesh(
      new THREE.SphereGeometry(0.4, 24, 24),
      new THREE.MeshStandardMaterial({color:0x2f1b26, roughness:0.95})
    );
    hairTop.scale.set(0.95, 0.75, 1.0);
    hairTop.position.set(0, 2.1, -0.05);
    playerHair.add(hairTop);

    // Side hair - very thick to block any gaps
    const hairSideL = new THREE.Mesh(
      new THREE.BoxGeometry(0.28, 1.0, 0.36),
      new THREE.MeshStandardMaterial({color:0x2a1621, roughness:0.95})
    );
    hairSideL.position.set(-0.4, 1.72, 0.02);
    playerHair.add(hairSideL);

    const hairSideR = hairSideL.clone();
    hairSideR.position.x = 0.4;
    playerHair.add(hairSideR);

    // Front bangs - cover front/top
    const hairBang = new THREE.Mesh(
      new THREE.BoxGeometry(0.7, 0.5, 0.2),
      new THREE.MeshStandardMaterial({color:0x2f1b26, roughness:0.95})
    );
    hairBang.position.set(0, 2.0, 0.15);
    playerHair.add(hairBang);

    // Long curly tails - very full back coverage
    const hairTailL = new THREE.Mesh(
      new THREE.BoxGeometry(0.22, 1.3, 0.28),
      new THREE.MeshStandardMaterial({color:0x2f1b26, roughness:0.95})
    );
    hairTailL.position.set(-0.3, 1.15, -0.1);
    hairTailL.rotation.z = -0.2;
    playerHair.add(hairTailL);

    const hairTailR = hairTailL.clone();
    hairTailR.position.x = 0.3;
    hairTailR.rotation.z = 0.2;
    playerHair.add(hairTailR);

    // Middle back hair - fill center
    const hairTailM = new THREE.Mesh(
      new THREE.BoxGeometry(0.2, 1.25, 0.3),
      new THREE.MeshStandardMaterial({color:0x2f1b26, roughness:0.95})
    );
    hairTailM.position.set(0, 1.2, -0.12);
    playerHair.add(hairTailM);

    playerHair.name = 'playerHair';
    group.add(playerHair);

    const glasses = new THREE.Group();
    const lensL = new THREE.Mesh(
      new THREE.BoxGeometry(0.12, 0.08, 0.01),
      new THREE.MeshStandardMaterial({color:0x2d3e50, transparent:true, opacity:0.8, roughness:0.25, metalness:0.15})
    );
    lensL.position.set(-0.1, 1.87, 0.27);
    glasses.add(lensL);

    const lensR = lensL.clone();
    lensR.position.x = 0.12;
    glasses.add(lensR);

    const bridge = new THREE.Mesh(
      new THREE.BoxGeometry(0.05, 0.02, 0.01),
      new THREE.MeshStandardMaterial({color:0x5a4a3a, roughness:0.8})
    );
    bridge.position.set(0, 1.87, 0.27);
    glasses.add(bridge);

    const armL = new THREE.Mesh(
      new THREE.BoxGeometry(0.12, 0.8, 0.15),
      new THREE.MeshStandardMaterial({color:0xffe0c2, roughness:0.95})
    );
    armL.position.set(-0.5, 1.15, 0);
    armL.name = 'playerArmL';
    group.add(armL);

    const armR = new THREE.Mesh(
      new THREE.BoxGeometry(0.12, 0.8, 0.15),
      new THREE.MeshStandardMaterial({color:0xffe0c2, roughness:0.95})
    );
    armR.position.set(0.5, 1.15, 0);
    armR.name = 'playerArmR';
    group.add(armR);

    const legL = new THREE.Mesh(
      new THREE.BoxGeometry(0.22, 0.95, 0.22),
      new THREE.MeshStandardMaterial({color:0x355c7d, roughness:0.95})
    );
    legL.position.set(-0.15, 0.475, 0);
    legL.name = 'playerLegL';
    group.add(legL);

    const legR = new THREE.Mesh(
      new THREE.BoxGeometry(0.22, 0.95, 0.22),
      new THREE.MeshStandardMaterial({color:0x355c7d, roughness:0.95})
    );
    legR.position.set(0.15, 0.475, 0);
    legR.name = 'playerLegR';
    group.add(legR);

    const shoeL = new THREE.Mesh(
      new THREE.BoxGeometry(0.26, 0.13, 0.3),
      new THREE.MeshStandardMaterial({color:0x30263b})
    );
    shoeL.position.set(-0.16, 0.03, 0.08);
    group.add(shoeL);

    const shoeR = shoeL.clone();
    shoeR.position.x = 0.16;
    group.add(shoeR);

    group.add(glasses);

    const eyeL = new THREE.Mesh(
      new THREE.SphereGeometry(0.04, 10, 10),
      new THREE.MeshStandardMaterial({color:0x6b4c5c})
    );
    eyeL.position.set(-0.09, 1.87, 0.26);
    group.add(eyeL);

    const eyeR = eyeL.clone();
    eyeR.position.x = 0.09;
    group.add(eyeR);

    const pupilL = new THREE.Mesh(
      new THREE.SphereGeometry(0.018, 8, 8),
      new THREE.MeshStandardMaterial({color:0x1b1324})
    );
    pupilL.position.set(-0.09, 1.87, 0.275);
    group.add(pupilL);

    const pupilR = pupilL.clone();
    pupilR.position.x = 0.09;

    const blushL = new THREE.Mesh(
      new THREE.SphereGeometry(0.035, 8, 8),
      new THREE.MeshStandardMaterial({color:0xffb3c1, transparent:true, opacity:0.5})
    );
    blushL.position.set(-0.15, 1.79, 0.27);
    group.add(blushL);

    const blushR = blushL.clone();
    blushR.position.x = 0.15;
    group.add(blushR);

    const lips = new THREE.Mesh(
      new THREE.BoxGeometry(0.12, 0.04, 0.04),
      new THREE.MeshStandardMaterial({color:0xd97a8f})
    );
    lips.position.set(0, 1.7, 0.27);
    group.add(lips);

    return group;
  }

  const player = createPrettyCharacter();
  player.position.set(0, 0, 12);
  player.rotation.y = Math.PI;
  scene.add(player);
  const playerBody = player.getObjectByName('playerBody');
  const playerHead = player.getObjectByName('playerHead');
  const playerHair = player.getObjectByName('playerHair');
  const playerArmL = player.getObjectByName('playerArmL');
  const playerArmR = player.getObjectByName('playerArmR');
  const playerLegL = player.getObjectByName('playerLegL');
  const playerLegR = player.getObjectByName('playerLegR');
  const playerAnim = {bob:0, phase:0};
  const limbBase = {
    head: new THREE.Vector3(0, 1.85, 0),
    body: new THREE.Vector3(0, 1.1, 0),
    armL: new THREE.Vector3(-0.5, 1.15, 0),
    armR: new THREE.Vector3(0.5, 1.15, 0),
    legL: new THREE.Vector3(-0.15, 0.475, 0),
    legR: new THREE.Vector3(0.15, 0.475, 0)
  };

  const moveState = {forward:false, backward:false, left:false, right:false};
  const playerSpeed = 0.13;
  const cameraOffset = new THREE.Vector3(0, 6, 14);
  const isTouchDevice = window.matchMedia('(pointer: coarse)').matches || 'ontouchstart' in window;

  window.addEventListener('keydown', (e)=>{
    if(e.key==='w' || e.key==='ArrowUp') moveState.forward = true;
    if(e.key==='s' || e.key==='ArrowDown') moveState.backward = true;
    if(e.key==='a' || e.key==='ArrowLeft') moveState.left = true;
    if(e.key==='d' || e.key==='ArrowRight') moveState.right = true;
  });
  window.addEventListener('keyup', (e)=>{
    if(e.key==='w' || e.key==='ArrowUp') moveState.forward = false;
    if(e.key==='s' || e.key==='ArrowDown') moveState.backward = false;
    if(e.key==='a' || e.key==='ArrowLeft') moveState.left = false;
    if(e.key==='d' || e.key==='ArrowRight') moveState.right = false;
  });
  // toggle rotation with R
  window.addEventListener('keydown', (e)=>{
    if(e.key.toLowerCase()==='r'){
      controls.enableRotate = !controls.enableRotate;
      const instr = document.getElementById('instructions');
      if(instr) instr.innerText = controls.enableRotate ? 'Mouse rotate: ON (drag to look around)' : 'Mouse rotate: OFF (press R to enable)';
      setTimeout(()=> updateHUD(), 900);
    }
  });

  const touchControls = document.getElementById('touchControls');
  if(touchControls && isTouchDevice){
    touchControls.classList.remove('hidden');
  }

  function setMoveState(key, value){
    if(key === 'forward') moveState.forward = value;
    if(key === 'backward') moveState.backward = value;
    if(key === 'left') moveState.left = value;
    if(key === 'right') moveState.right = value;
  }

  if(touchControls){
    for(const btn of touchControls.querySelectorAll('[data-dir]')){
      btn.addEventListener('pointerdown', (ev)=>{
        ev.preventDefault();
        setMoveState(btn.dataset.dir, true);
      });
      btn.addEventListener('pointerup', ()=> setMoveState(btn.dataset.dir, false));
      btn.addEventListener('pointerleave', ()=> setMoveState(btn.dataset.dir, false));
      btn.addEventListener('pointercancel', ()=> setMoveState(btn.dataset.dir, false));
    }
  }

  // ground
  const groundGeo = new THREE.BoxGeometry(200,0.4,200);
  const groundMat = new THREE.MeshStandardMaterial({color:0x7d5b3d, roughness:1});
  const ground = new THREE.Mesh(groundGeo, groundMat);
  ground.position.y = -0.2;
  scene.add(ground);
  const groundEdge = new THREE.LineSegments(
    new THREE.EdgesGeometry(groundGeo),
    new THREE.LineBasicMaterial({color:0x5b8d33})
  );
  groundEdge.position.copy(ground.position);
  scene.add(groundEdge);

  // shrine / placement area
  const shrineGeo = new THREE.BoxGeometry(6,0.2,6);
  const shrineMat = new THREE.MeshStandardMaterial({color:0x8b4513, roughness:0.9});
  const shrine = new THREE.Mesh(shrineGeo, shrineMat);
  shrine.position.set(10,0.1,0);
  scene.add(shrine);

  // shared sunflower geometry/materials
  const sunflowerStemGeo = new THREE.CylinderGeometry(0.05,0.05,2,6);
  const sunflowerHeadGeo = new THREE.SphereGeometry(0.4,10,10);
  const placedStemGeo = new THREE.CylinderGeometry(0.04,0.04,1.6,6);
  const placedHeadGeo = new THREE.SphereGeometry(0.36,10,10);
  const stemMat = new THREE.MeshLambertMaterial({color:0x228B22});
  const headMat = new THREE.MeshLambertMaterial({color:0xffdd33});
  const petalMat = new THREE.MeshLambertMaterial({color:0xffb300});
  const giftMat = new THREE.MeshLambertMaterial({color:0xff6699});

  const sunflowers = [];
  const placedFlowers = [];
  const flowerBases = [];
  // audio context and simple sound helper (no external files required)
  const AudioCtx = window.AudioContext || window.webkitAudioContext;
  const audioCtx = AudioCtx ? new AudioCtx() : null;
  function playBeep(freq=440, duration=0.12, type='sine', gain=0.12){
    if(!audioCtx) return;
    const o = audioCtx.createOscillator();
    const g = audioCtx.createGain();
    o.type = type; o.frequency.value = freq;
    g.gain.value = gain;
    o.connect(g); g.connect(audioCtx.destination);
    o.start();
    g.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + duration);
    setTimeout(()=>{ try{o.stop()}catch(e){} }, duration*1000+50);
  }
  function playPick(){ playBeep(880,0.09,'triangle',0.08); }
  function playPlace(){ playBeep(520,0.12,'sine',0.10); }
  function playOpen(){ playBeep(660,0.22,'sine',0.14); }
  // footsteps: play repetitive soft beeps when moving
  let lastFoot = 0;
  function tryFootstep(now){
    if(!audioCtx) return;
    if(!moveState.forward && !moveState.backward && !moveState.left && !moveState.right) return;
    if(now - lastFoot > 260){ playBeep(240,0.08,'square',0.04); lastFoot = now; }
  }
  function buildFlowerHead(group, radius, tint=0xffb300){
    const petals = 12;
    const petalMaterial = new THREE.MeshStandardMaterial({color:tint, roughness:0.9, metalness:0.02});
    for(let i=0;i<petals;i++){
      const angle = (i / petals) * Math.PI * 2;
      const petal = new THREE.Mesh(
        new THREE.BoxGeometry(0.1, 0.3, 0.05),
        petalMaterial
      );
      petal.position.set(
        Math.sin(angle) * (radius + 0.16),
        0,
        Math.cos(angle) * (radius + 0.16)
      );
      petal.rotation.set(Math.PI / 2, 0, angle);
      group.add(petal);
    }
    const center = new THREE.Mesh(
      new THREE.OctahedronGeometry(radius * 0.8, 0),
      new THREE.MeshStandardMaterial({color:0xffdf66, roughness:0.35, metalness:0.08})
    );
    group.add(center);

    const leaf = new THREE.Mesh(
      new THREE.BoxGeometry(0.16, 0.4, 0.03),
      new THREE.MeshStandardMaterial({color:0x2e8b57, roughness:0.95})
    );
    leaf.position.set(-0.08, -0.02, 0);
    leaf.rotation.z = -0.45;
    group.add(leaf);
  }
  function makeSunflower(x,z){
    const g = new THREE.Group();
    const stem = new THREE.Mesh(sunflowerStemGeo, new THREE.MeshStandardMaterial({color:0x2f8f3f, roughness:0.95}));
    stem.position.y = 1;
    g.add(stem);

    const leafL = new THREE.Mesh(
      new THREE.BoxGeometry(0.12, 0.58, 0.04),
      new THREE.MeshStandardMaterial({color:0x3ca64d, roughness:0.95})
    );
    leafL.position.set(-0.16, 1.2, 0.02);
    leafL.rotation.z = -0.35;
    g.add(leafL);

    const leafR = leafL.clone();
    leafR.position.x = 0.16;
    leafR.rotation.z = 0.35;
    g.add(leafR);

    const headGroup = new THREE.Group();
    headGroup.position.y = 2.15;
    buildFlowerHead(headGroup, 0.24, 0xffb300);
    g.add(headGroup);
    g.position.set(x,0,z);
    scene.add(g);
    sunflowers.push(g);
  }

  for(let i=0;i<12;i++){
    const x = (Math.random()-0.5)*30;
    const z = (Math.random()-0.5)*30;
    makeSunflower(x,z);
  }

  // try loading a small GLTF sample model near the shrine (optional)
  try{
    const loader = new GLTFLoader();
    const sampleUrl = 'https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Models/master/2.0/Avocado/glTF-Binary/Avocado.glb';
    loader.load(sampleUrl, (gltf)=>{
      gltf.scene.scale.set(2,2,2);
      gltf.scene.position.set(shrine.position.x + 3, 0, shrine.position.z);
      scene.add(gltf.scene);
    }, undefined, (e)=>{
      // ignore load error
    });
  }catch(e){}

  // raycaster
  const raycaster = new THREE.Raycaster();
  const mouse = new THREE.Vector2();
  let basket = 0;
  let placed = 0;
  const targetPlace = 5;

  function updateHUD(){
    document.getElementById('basket').innerText = 'Basket: ' + basket;
    document.getElementById('placed').innerText = 'Placed: ' + placed + ' / ' + targetPlace;
    const instr = document.getElementById('instructions');
    if(!instr) return;
    if(placed >= targetPlace){
      instr.innerText = 'Gift has appeared! Tap the pink box to open it.';
    } else if(basket > 0){
      instr.innerText = isTouchDevice
        ? 'Carry flowers to the shrine and tap it to place them.'
        : 'You have flowers in your basket. Walk to the shrine and click it to place.';
    } else {
      instr.innerText = isTouchDevice
        ? 'Use the on-screen buttons to move. Tap flowers to collect them.'
        : 'Use WASD / arrow keys to move. Click a flower to collect it.';
    }
  }

  function onClick(event){
    const modal = document.getElementById('giftModal');
    if(modal && !modal.classList.contains('hidden')) return;

    mouse.x = ( event.clientX / window.innerWidth ) * 2 - 1;
    mouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1;
    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObjects(scene.children, true);
    if(intersects.length===0) return;

    for(const hit of intersects){
      let obj = hit.object;
      while(obj){
        if(sunflowers.includes(obj)){
          scene.remove(obj);
          const idx = sunflowers.indexOf(obj);
          if(idx>=0) sunflowers.splice(idx,1);
          basket++;
          playPick();
          updateHUD();
          return;
        }
        if(obj === shrine){
          if(basket>0){
            const placePos = new THREE.Vector3(shrine.position.x, 0.2, (placed - targetPlace/2)*1.2 );
            makePlacedSunflower(placePos.x, placePos.z, placed);
            basket--; placed++; updateHUD();
            playPlace();
            if(placed>=targetPlace) spawnGiftBox();
          }
          return;
        }
        if(obj.userData && obj.userData.interactive && !obj.userData.opened){
          animateGiftOpen();
          return;
        }
        obj = obj.parent;
      }
    }
  }

  // hover highlight for flowers (pointer move)
  let hoveredFlower = null;
  function onPointerMove(ev){
    mouse.x = ( ev.clientX / window.innerWidth ) * 2 - 1;
    mouse.y = - ( ev.clientY / window.innerHeight ) * 2 + 1;
    raycaster.setFromCamera(mouse, camera);
    const ints = raycaster.intersectObjects(scene.children, true);
    let shrineHovered = false;
    if(ints.length>0){
      let o = ints[0].object;
      // detect shrine hover
      let a = o;
      while(a){ if(a === shrine){ shrineHovered = true; break; } a = a.parent; }
      if(shrineHovered){
        // show shrine label
        const label = document.getElementById('shrineLabel');
        if(label){ label.classList.remove('hidden'); }
        shrine.scale.set(1.02,1.02,1.02);
        document.body.style.cursor = 'pointer';
      } else {
        const label = document.getElementById('shrineLabel'); if(label) label.classList.add('hidden');
        shrine.scale.set(1,1,1);
      }

      let o2 = ints[0].object;
      while(o2 && !sunflowers.includes(o2)) o2 = o2.parent;
      if(o2 && o2 !== hoveredFlower){
        if(hoveredFlower) hoveredFlower.scale.setScalar(1);
        hoveredFlower = o2;
        hoveredFlower.scale.setScalar(1.08);
        document.body.style.cursor = 'pointer';
        return;
      }
    }
    if(hoveredFlower){ hoveredFlower.scale.setScalar(1); hoveredFlower = null; }
    document.body.style.cursor = '';
  }
  window.addEventListener('mousemove', onPointerMove);

  function makePlacedSunflower(x,z,i){
    const g = new THREE.Group();
    const stem = new THREE.Mesh(placedStemGeo, new THREE.MeshStandardMaterial({color:0x2f8f3f, roughness:0.95}));
    stem.position.y = 0.8;
    g.add(stem);
    const headGroup = new THREE.Group();
    headGroup.position.y = 1.7;
    buildFlowerHead(headGroup, 0.2, 0xff7acb);
    g.add(headGroup);
    g.position.set(x,0.1,z);
    scene.add(g);
    placedFlowers.push(g);
  }

  function showGiftModal(){
    const modal = document.getElementById('giftModal');
    modal.classList.remove('hidden');
  }

  // gift box 3D object (spawn when target reached)
  let giftBox = null;
  let confettiPieces = [];
  const confettiGeo = new THREE.PlaneGeometry(0.12,0.06);

  function spawnGiftBox(){
    if(giftBox) return;
    const group = new THREE.Group();
    const base = new THREE.Mesh(
      new THREE.BoxGeometry(2.2, 1.6, 2.2),
      new THREE.MeshStandardMaterial({color:0xff70a8, emissive:0x2f1021, emissiveIntensity:0.15, roughness:0.6})
    );
    base.position.y = 0.8;
    group.add(base);

    const lidPivot = new THREE.Group();
    lidPivot.position.set(0, 1.6, 0);
    const lid = new THREE.Mesh(
      new THREE.BoxGeometry(2.45, 0.38, 2.45),
      new THREE.MeshStandardMaterial({color:0xff4d88, emissive:0x3c1024, emissiveIntensity:0.15, roughness:0.65})
    );
    lid.position.set(0, 0.18, 0);
    lidPivot.add(lid);
    group.add(lidPivot);

    const ribbon = new THREE.Group();
    const ribbonBand = new THREE.Mesh(new THREE.BoxGeometry(1.0, 0.16, 0.16), new THREE.MeshStandardMaterial({color:0xffffff}));
    ribbonBand.position.set(0, 1.45, 0);
    ribbon.add(ribbonBand);

    const ribbonTie = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.36, 0.2), new THREE.MeshStandardMaterial({color:0xffffff}));
    ribbonTie.position.set(0, 1.32, 0);
    ribbon.add(ribbonTie);
    group.add(ribbon);

    const bow1 = new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.16, 0.16), new THREE.MeshStandardMaterial({color:0xffffff}));
    const bow2 = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.16, 0.55), new THREE.MeshStandardMaterial({color:0xffffff}));
    bow1.position.set(0, 1.62, 0);
    bow2.position.set(0, 1.62, 0);
    group.add(bow1, bow2);

    const pedestal = new THREE.Mesh(
      new THREE.BoxGeometry(3.2, 0.22, 3.2),
      new THREE.MeshStandardMaterial({color:0x6d4a2b, roughness:0.95})
    );
    pedestal.position.set(0, 0.11, 0);
    group.add(pedestal);

    group.position.set(10, 0, 0);
    group.userData.interactive = true;
    group.userData.opening = false;
    group.userData.opened = false;
    group.userData.lidPivot = lidPivot;
    scene.add(group);
    giftBox = group;
  }

  function animateGiftOpen(){
    if(!giftBox || giftBox.userData.opening || giftBox.userData.opened) return;
    giftBox.userData.opening = true;
    const lidPivot = giftBox.userData.lidPivot;
    const start = performance.now();
    const dur = 1000;
    const animate = (t)=>{
      const p = Math.min(1, (t-start)/dur);
      const ease = 1 - Math.pow(1-p, 3);
      giftBox.scale.setScalar(1 + 0.7 * ease);
      giftBox.position.y = 0.2 + 0.35 * ease;
      if(lidPivot) lidPivot.rotation.x = -Math.PI * 0.36 * ease;
      if((t-start) < dur) requestAnimationFrame(animate);
      else {
        for(let i=0;i<80;i++){
          const mat = new THREE.MeshBasicMaterial({color: new THREE.Color(Math.random(),Math.random(),Math.random()), side:THREE.DoubleSide, transparent:true});
          const p = new THREE.Mesh(confettiGeo, mat);
          p.position.copy(giftBox.position).add(new THREE.Vector3((Math.random()-0.5)*1.2,0.8, (Math.random()-0.5)*1.2));
          p.userData.v = new THREE.Vector3((Math.random()-0.5)*2.2, 2.8+Math.random()*2.4, (Math.random()-0.5)*2.2);
          p.userData.life = 1600 + Math.random()*1400;
          p.userData.start = performance.now();
          scene.add(p);
          confettiPieces.push(p);
        }
        if(giftBox){ giftBox.userData.opened = true; giftBox.visible = false; playOpen(); }
        setTimeout(()=> showGiftModal(), 600);
      }
    };
    requestAnimationFrame(animate);
  }

  // handle clicks: normal interactions + gift box click
  document.addEventListener('pointerdown', (ev)=>{
    onClick(ev);
  });

  // gift open button
  // gift save/open handling
  let giftLetterText = document.getElementById('giftLetter') ? document.getElementById('giftLetter').value : 'Surprise! Happy Birthday :)';

  const saveGiftBtn = document.getElementById('saveGift');
  if(saveGiftBtn){
    saveGiftBtn.addEventListener('click', async ()=>{
      const textarea = document.getElementById('giftLetter');
      const status = document.getElementById('giftStatus');
      const message = textarea ? textarea.value.trim() : '';
      if(!message){
        status.textContent = 'Tulis harapan (opsional).';
        textarea?.focus();
        return;
      }
      if(saveGiftBtn.disabled) return;
      saveGiftBtn.disabled = true;
      saveGiftBtn.textContent = 'Mengirim...';
      status.textContent = '';
      try{
        const response = await fetch('/api/cards', {
          method: 'POST',
          headers: {'Content-Type': 'application/json'},
          body: JSON.stringify({message})
        });
        const contentType = response.headers.get('content-type') || '';
        if(!contentType.includes('application/json')){
          throw new Error('Fitur kirim pesan belum aktif di preview lokal. Kirim melalui situs yang sudah di-deploy dengan API dan Supabase aktif.');
        }
        const result = await response.json();
        if(!response.ok) throw new Error(result.error || 'Ucapan gagal dikirim.');
        giftLetterText = message;
        status.textContent = 'Pesanmu sudah terkirim 💌';
        saveGiftBtn.textContent = 'Terkirim!';
      }catch(error){
        status.textContent = error.message || 'Tidak bisa mengirim ucapan. Coba lagi nanti.';
        saveGiftBtn.textContent = 'Coba Lagi';
      }finally{
        saveGiftBtn.disabled = false;
        if(saveGiftBtn.textContent !== 'Terkirim!'){
          setTimeout(()=> saveGiftBtn.textContent = 'Kirim ', 1800);
        }
      }
    });
  }

  const skipReflectionBtn = document.getElementById('skipReflection');
  if(skipReflectionBtn){
    skipReflectionBtn.addEventListener('click', ()=>{
      const textarea = document.getElementById('giftLetter');
      const status = document.getElementById('giftStatus');
      const reflectionPanel = document.getElementById('reflectionPanel');
      if(textarea) textarea.value = '';
      if(reflectionPanel) reflectionPanel.classList.add('hidden');
      if(status) status.textContent = 'Tidak apa-apa—kamu bisa lanjut membuka sesuatu. ✨';
    });
  }

  document.getElementById('openGift').addEventListener('click', ()=>{
    const inner = document.getElementById('giftInner');
    inner.classList.remove('hidden');
    const musicPlayer = document.getElementById('sparksPlayer');
    if(musicPlayer){
      musicPlayer.src = 'https://embed.music.apple.com/us/album/sparks/1122782080?i=1122782281';
    }
    const letter = document.getElementById('letter');
    letter.innerText = giftLetterText || letter.innerText;
  });

  const closeGiftBtn = document.getElementById('closeGift');
  if(closeGiftBtn){
    closeGiftBtn.addEventListener('click', ()=>{
      document.getElementById('giftModal').classList.add('hidden');
    });
  }

  const restartBtn = document.getElementById('restartGame');
  function resetGame(){
    basket = 0;
    placed = 0;
    for(const flower of sunflowers){ scene.remove(flower); }
    sunflowers.length = 0;
    for(const flower of placedFlowers){ scene.remove(flower); }
    placedFlowers.length = 0;
    if(giftBox){ scene.remove(giftBox); giftBox = null; }
    for(const p of confettiPieces){ scene.remove(p); }
    confettiPieces = [];

    for(let i=0;i<12;i++){
      const x = (Math.random()-0.5)*30;
      const z = (Math.random()-0.5)*30;
      makeSunflower(x,z);
    }

    const modal = document.getElementById('giftModal');
    if(modal) modal.classList.add('hidden');
    const inner = document.getElementById('giftInner');
    if(inner) inner.classList.add('hidden');
    const musicPlayer = document.getElementById('sparksPlayer');
    if(musicPlayer) musicPlayer.src = 'about:blank';
    updateHUD();
  }
  if(restartBtn){
    restartBtn.addEventListener('click', resetGame);
  }

  // resize
  window.addEventListener('resize', ()=>{
    camera.aspect = window.innerWidth/window.innerHeight; camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });

  function animate(){
    requestAnimationFrame(animate);
    const dir = new THREE.Vector3();
    if(moveState.forward) dir.z -= 1;
    if(moveState.backward) dir.z += 1;
    if(moveState.left) dir.x -= 1;
    if(moveState.right) dir.x += 1;
    if(dir.lengthSq() > 0){
      dir.normalize().multiplyScalar(playerSpeed);
      player.position.add(dir);
      player.position.x = Math.max(-80, Math.min(80, player.position.x));
      player.position.z = Math.max(-80, Math.min(80, player.position.z));
    }
    const isMoving = dir.lengthSq() > 0;
    if(isMoving){
      playerAnim.phase += 0.24;
      playerAnim.bob += 0.22;
    } else {
      playerAnim.phase *= 0.92;
    }

    const bob = Math.sin(playerAnim.bob) * (isMoving ? 0.04 : 0.01);
    const sway = Math.sin(playerAnim.phase) * (isMoving ? 0.03 : 0.006);
    const armSwing = Math.sin(playerAnim.phase) * (isMoving ? 0.5 : 0.12);
    const legSwing = Math.sin(playerAnim.phase) * (isMoving ? 0.4 : 0.06);

    player.position.y = bob;
    playerHead.position.set(limbBase.head.x + sway * 0.008, limbBase.head.y + bob * 0.18, limbBase.head.z);
    playerHead.rotation.z = sway * 0.015;
    playerBody.position.set(limbBase.body.x, limbBase.body.y + bob * 0.08, limbBase.body.z);
    playerBody.rotation.z = sway * 0.008;

    playerArmL.position.set(limbBase.armL.x, limbBase.armL.y + bob * 0.05, limbBase.armL.z);
    playerArmR.position.set(limbBase.armR.x, limbBase.armR.y + bob * 0.05, limbBase.armR.z);
    playerArmL.rotation.z = -0.6 + armSwing * 0.45;
    playerArmR.rotation.z = 0.6 - armSwing * 0.45;

    playerLegL.position.set(limbBase.legL.x, limbBase.legL.y - Math.max(0, bob * 0.06), limbBase.legL.z);
    playerLegR.position.set(limbBase.legR.x, limbBase.legR.y - Math.max(0, bob * 0.06), limbBase.legR.z);
    playerLegL.rotation.x = legSwing * 0.4;
    playerLegR.rotation.x = -legSwing * 0.4;
    playerHair.rotation.z = sway * 0.012;

    const desiredCameraPos = player.position.clone().add(cameraOffset);
    camera.position.lerp(desiredCameraPos, 0.08);
    camera.position.y = Math.max(camera.position.y, 2.2);
    controls.target.lerp(new THREE.Vector3(player.position.x, 1.5, player.position.z), 0.12);
    controls.update();
    // update shrine label screen position
    const label = document.getElementById('shrineLabel');
    if(label){
      const pos = shrine.position.clone(); pos.y += 0.6;
      pos.project(camera);
      const x = (pos.x * 0.5 + 0.5) * window.innerWidth;
      const y = ( -pos.y * 0.5 + 0.5) * window.innerHeight;
      label.style.transform = `translate(-50%, -50%) translate(${x}px, ${y}px)`;
    }
    // footsteps
    tryFootstep(performance.now());
    if(confettiPieces.length){
      const now = performance.now();
      for(let i = confettiPieces.length-1; i>=0; i--){
        const p = confettiPieces[i];
        const age = now - p.userData.start;
        const life = p.userData.life;
        if(age > life){
          scene.remove(p);
          confettiPieces.splice(i,1);
          continue;
        }
        const dt = 16/1000;
        p.position.addScaledVector(p.userData.v, dt);
        p.userData.v.y -= 9.8 * dt;
        const mat = p.material;
        const alpha = 1 - (age / life);
        if(mat && 'opacity' in mat){ mat.opacity = alpha; }
        p.rotation.x += 0.1; p.rotation.y += 0.07;
      }
    }
    renderer.render(scene,camera);
  }
  updateHUD();
  animate();

})();
