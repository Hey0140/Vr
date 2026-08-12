import * as THREE from "three";
import { VRButton } from "three/addons/webxr/VRButton.js";

const canvas = document.getElementById("weddingCanvas");
const scene = new THREE.Scene();
scene.background = new THREE.Color(0xe9dfd4);
scene.fog = new THREE.Fog(0xe9dfd4, 22, 55);

const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: false });
renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.08;
renderer.xr.enabled = true;
renderer.xr.setReferenceSpaceType("local-floor");

const player = new THREE.Group();
scene.add(player);

const camera = new THREE.PerspectiveCamera(61, 1, 0.08, 120);
camera.position.set(0, 1.66, 12.2);
player.add(camera);

let yaw = 0;
let pitch = 0;
let walkX = 0;
let walkZ = 12.2;
const keys = new Set();
let dragging = false;
let lastX = 0;
let lastY = 0;

const world = new THREE.Group();
scene.add(world);

const palette = {
  cream: new THREE.Color(0xeadfce),
  cream2: new THREE.Color(0xd8c4ad),
  white: new THREE.Color(0xf8f4ee),
  champagne: new THREE.Color(0xc6a77d),
  wood: new THREE.Color(0x875942),
  darkWood: new THREE.Color(0x5e3d2d),
  green: new THREE.Color(0x587257),
};

const mats = {
  wall: new THREE.MeshStandardMaterial({ color: palette.cream, roughness: 0.86 }),
  trim: new THREE.MeshStandardMaterial({ color: 0xd4bea7, roughness: 0.72 }),
  column: new THREE.MeshStandardMaterial({ color: 0xe8dac8, roughness: 0.78 }),
  floor: new THREE.MeshPhysicalMaterial({
    color: 0xe7d9c8,
    roughness: 0.22,
    metalness: 0.0,
    clearcoat: 0.5,
    clearcoatRoughness: 0.23,
  }),
  aisle: new THREE.MeshPhysicalMaterial({
    color: 0xf2ece4,
    roughness: 0.16,
    clearcoat: 0.58,
    clearcoatRoughness: 0.2,
  }),
  gold: new THREE.MeshStandardMaterial({ color: 0xc09b67, metalness: 0.62, roughness: 0.26 }),
  wood: new THREE.MeshStandardMaterial({ color: palette.wood, roughness: 0.56 }),
  darkWood: new THREE.MeshStandardMaterial({ color: palette.darkWood, roughness: 0.58 }),
  seat: new THREE.MeshStandardMaterial({ color: 0xf1ebe3, roughness: 0.68 }),
  seatTrim: new THREE.MeshStandardMaterial({ color: 0x9c805e, metalness: 0.44, roughness: 0.35 }),
  altarStone: new THREE.MeshStandardMaterial({ color: 0xb89a80, roughness: 0.9 }),
  whiteStone: new THREE.MeshStandardMaterial({ color: 0xf2ece3, roughness: 0.74 }),
};

function addMesh(geometry, material, x=0, y=0, z=0, group=world) {
  const m = new THREE.Mesh(geometry, material);
  m.position.set(x, y, z);
  m.castShadow = true;
  m.receiveShadow = true;
  group.add(m);
  return m;
}

// ---------------------
// Hall shell
// ---------------------
const hallWidth = 15.6;
const hallLength = 34;
const wallHeight = 3.25;
const vaultRadius = hallWidth / 2;

const floor = addMesh(new THREE.PlaneGeometry(hallWidth, hallLength), mats.floor, 0, 0, -3.0);
floor.rotation.x = -Math.PI / 2;

// tile seams
const seamMat = new THREE.MeshBasicMaterial({ color: 0xc9b8a5, transparent: true, opacity: 0.32 });
for (let z=-18; z<=13; z+=2.3) {
  const s = addMesh(new THREE.PlaneGeometry(hallWidth-0.2, 0.018), seamMat, 0, 0.008, z);
  s.rotation.x = -Math.PI/2;
}
for (let x=-7.2; x<=7.2; x+=2.4) {
  const s = addMesh(new THREE.PlaneGeometry(0.018, hallLength-0.2), seamMat, x, 0.009, -3);
  s.rotation.x = -Math.PI/2;
}

// side walls
addMesh(new THREE.BoxGeometry(0.28, wallHeight, hallLength), mats.wall, -hallWidth/2, wallHeight/2, -3);
addMesh(new THREE.BoxGeometry(0.28, wallHeight, hallLength), mats.wall, hallWidth/2, wallHeight/2, -3);

// custom barrel vault interior
function createVaultGeometry(width, length, springY, segmentsX=48, segmentsZ=34) {
  const radius = width / 2;
  const verts = [];
  const indices = [];
  for (let zi = 0; zi <= segmentsZ; zi++) {
    const z = -length/2 + (zi/segmentsZ)*length - 3;
    for (let xi = 0; xi <= segmentsX; xi++) {
      const theta = (xi/segmentsX) * Math.PI;
      const x = Math.cos(theta) * radius;
      const y = springY + Math.sin(theta) * radius;
      verts.push(x, y, z);
    }
  }
  const row = segmentsX + 1;
  for (let zi=0; zi<segmentsZ; zi++) {
    for (let xi=0; xi<segmentsX; xi++) {
      const a = zi*row + xi;
      const b = a + 1;
      const c = a + row;
      const d = c + 1;
      indices.push(a,c,b, b,c,d);
    }
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.Float32BufferAttribute(verts,3));
  geo.setIndex(indices);
  geo.computeVertexNormals();
  return geo;
}

const vaultMat = new THREE.MeshStandardMaterial({
  color: 0xf0e7da,
  roughness: 0.82,
  side: THREE.DoubleSide,
});
const vault = addMesh(createVaultGeometry(hallWidth, hallLength, wallHeight), vaultMat);

// illuminated ceiling ribs
const ribMat = new THREE.MeshStandardMaterial({
  color: 0xfff7e8,
  emissive: 0xffe8bf,
  emissiveIntensity: 0.55,
  roughness: 0.6,
});
function makeVaultRib(z) {
  const curve = new THREE.CatmullRomCurve3(
    Array.from({length: 33}, (_,i) => {
      const theta = (i/32)*Math.PI;
      return new THREE.Vector3(
        Math.cos(theta)*vaultRadius,
        wallHeight + Math.sin(theta)*vaultRadius - 0.06,
        z
      );
    })
  );
  const tube = new THREE.Mesh(new THREE.TubeGeometry(curve, 64, 0.045, 8, false), ribMat);
  world.add(tube);
}
for (let z=-17; z<=11.5; z+=3.2) makeVaultRib(z);

// side cornices
for (const x of [-hallWidth/2+0.18, hallWidth/2-0.18]) {
  addMesh(new THREE.BoxGeometry(0.55, 0.34, hallLength), mats.trim, x, wallHeight+0.05, -3);
}

// colonnades
function makeColumn(x, z) {
  const g = new THREE.Group();
  const shaft = new THREE.Mesh(new THREE.CylinderGeometry(0.22,0.28,2.8,24), mats.column);
  shaft.position.y = 1.48;
  shaft.castShadow = true;
  g.add(shaft);
  const base = new THREE.Mesh(new THREE.CylinderGeometry(0.38,0.38,0.16,24), mats.trim);
  base.position.y = 0.08;
  g.add(base);
  const cap = new THREE.Mesh(new THREE.CylinderGeometry(0.38,0.28,0.20,24), mats.trim);
  cap.position.y = 2.91;
  g.add(cap);
  g.position.set(x,0,z);
  world.add(g);
}
for (let z=-13.5; z<=8.8; z+=3.25) {
  makeColumn(-6.6,z);
  makeColumn(6.6,z);
}

// wall panels / doors
for (const x of [-7.63, 7.63]) {
  for (let z=-12; z<=8; z+=4.1) {
    const p = addMesh(new THREE.BoxGeometry(0.08,1.9,2.35), mats.trim, x, 1.3, z);
    p.rotation.y = Math.PI/2;
  }
}

// ---------------------
// Aisle & altar
// ---------------------
const aisle = addMesh(new THREE.BoxGeometry(2.65,0.055,23.2), mats.aisle, 0,0.04,-1.7);

for (const x of [-1.38,1.38]) {
  addMesh(new THREE.BoxGeometry(0.04,0.07,23.2), mats.gold, x,0.055,-1.7);
}

// altar steps
for (let i=0;i<3;i++) {
  addMesh(new THREE.BoxGeometry(8.1-i*0.7,0.16,1.0), mats.whiteStone, 0,0.08+i*0.15,-14.7-i*0.42);
}
addMesh(new THREE.BoxGeometry(7.2,0.28,3.4), mats.whiteStone, 0,0.42,-16.0);

// altar back wall
addMesh(new THREE.BoxGeometry(9.2,4.25,0.38), mats.altarStone, 0,2.15,-17.1);

// altar niche / arch
function makeFrontArch(radius=3.5, z=-16.82) {
  const points = [];
  for (let i=0;i<=40;i++) {
    const a=(i/40)*Math.PI;
    points.push(new THREE.Vector3(Math.cos(a)*radius, 3.4+Math.sin(a)*radius, z));
  }
  const curve=new THREE.CatmullRomCurve3(points);
  const tube=new THREE.Mesh(new THREE.TubeGeometry(curve,80,0.14,12,false), mats.trim);
  world.add(tube);
  addMesh(new THREE.CylinderGeometry(0.16,0.18,3.45,20), mats.trim, -radius,1.75,z);
  addMesh(new THREE.CylinderGeometry(0.16,0.18,3.45,20), mats.trim, radius,1.75,z);
}
makeFrontArch();

// altar table
addMesh(new THREE.BoxGeometry(2.2,0.18,0.65), mats.whiteStone, 0,1.42,-15.65);
addMesh(new THREE.BoxGeometry(0.52,1.25,0.48), mats.whiteStone, 0,0.79,-15.65);

// ---------------------
// Seating groups
// ---------------------
const chairGroup = new THREE.Group();
const pewGroup = new THREE.Group();
world.add(chairGroup, pewGroup);

function makeRoundChair(x,z,rot=0) {
  const g=new THREE.Group();
  const seat=new THREE.Mesh(new THREE.CylinderGeometry(0.29,0.29,0.09,24), mats.seat);
  seat.position.y=0.48; seat.castShadow=true; g.add(seat);
  const ring=new THREE.Mesh(new THREE.TorusGeometry(0.29,0.035,8,24), mats.seatTrim);
  ring.position.set(0,0.93,0.23); ring.castShadow=true; g.add(ring);
  const backFill=new THREE.Mesh(new THREE.CircleGeometry(0.245,24), mats.seat);
  backFill.position.set(0,0.93,0.225); g.add(backFill);
  for (const dx of [-0.19,0.19]) {
    for (const dz of [-0.18,0.18]) {
      const leg=new THREE.Mesh(new THREE.CylinderGeometry(0.015,0.015,0.46,8), mats.seatTrim);
      leg.position.set(dx,0.23,dz); g.add(leg);
    }
  }
  g.position.set(x,0,z); g.rotation.y=rot; chairGroup.add(g);
}

for (let r=0;r<10;r++) {
  const z=8.5-r*1.75;
  for (let c=0;c<4;c++) {
    const off=2.15+c*0.88;
    makeRoundChair(-off,z,0.03);
    makeRoundChair(off,z,-0.03);
  }
}

function makePew(side,z) {
  const x=side*4.25;
  const g=new THREE.Group();
  const seat=new THREE.Mesh(new THREE.BoxGeometry(4.2,0.18,0.62), mats.wood);
  seat.position.y=0.52; g.add(seat);
  const back=new THREE.Mesh(new THREE.BoxGeometry(4.2,0.74,0.14), mats.wood);
  back.position.set(0,0.96,0.27); g.add(back);
  for (const xx of [-1.75,0,1.75]) {
    const leg=new THREE.Mesh(new THREE.BoxGeometry(0.12,0.52,0.46), mats.darkWood);
    leg.position.set(xx,0.26,0); g.add(leg);
  }
  g.position.set(x,0,z);
  pewGroup.add(g);
}
for (let r=0;r<10;r++) {
  const z=8.5-r*1.78;
  makePew(-1,z);
  makePew(1,z);
}

// ---------------------
// Flowers
// ---------------------
const flowerGroup = new THREE.Group();
world.add(flowerGroup);

let flowerBloomMat = new THREE.MeshStandardMaterial({ color: 0xfaf7f0, roughness: 0.7 });
let flowerAccentMat = new THREE.MeshStandardMaterial({ color: 0xe8ddd0, roughness: 0.72 });
const leafMat = new THREE.MeshStandardMaterial({ color: 0x587257, roughness: 0.9 });

function cluster(x,y,z,scale=1,density=1) {
  const g=new THREE.Group();
  const blooms=Math.round(12+16*density);
  const leaves=Math.round(8+10*density);
  for (let i=0;i<leaves;i++) {
    const leaf=new THREE.Mesh(new THREE.SphereGeometry(0.13*scale,8,7), leafMat);
    const a=(i/leaves)*Math.PI*2;
    leaf.position.set(
      Math.cos(a)*(0.34+(i%3)*0.09)*scale,
      ((i%5)-2)*0.075*scale,
      Math.sin(a)*(0.25+(i%2)*0.09)*scale
    );
    leaf.scale.set(.72,1.75,.72);
    g.add(leaf);
  }
  for (let i=0;i<blooms;i++) {
    const mat=i%5===0?flowerAccentMat:flowerBloomMat;
    const bloom=new THREE.Mesh(new THREE.SphereGeometry(0.11*scale,9,7), mat);
    const a=(i/blooms)*Math.PI*2;
    bloom.position.set(
      Math.cos(a)*(0.30+(i%4)*0.055)*scale,
      ((i%6)-2.5)*0.07*scale,
      Math.sin(a)*(0.22+(i%3)*0.055)*scale
    );
    g.add(bloom);
  }
  g.position.set(x,y,z);
  return g;
}

function rebuildFlowers(amount=88) {
  flowerGroup.clear();
  const d=THREE.MathUtils.mapLinear(amount,35,100,.45,1.5);
  const s=THREE.MathUtils.mapLinear(amount,35,100,.72,1.18);

  const positions=[9.2,6.8,4.3,1.8,-0.7,-3.2,-5.7,-8.2,-10.7];
  positions.forEach((z,i)=>{
    const scale=s*(i%3===0?1.12:.92);
    flowerGroup.add(cluster(-1.72,0.46,z,scale,d));
    flowerGroup.add(cluster(1.72,0.46,z,scale,d));
  });

  // tall arrangements near entrance / altar
  for (const x of [-2.15,2.15]) {
    const stem=new THREE.Mesh(new THREE.CylinderGeometry(.025,.035,1.85,8),mats.gold);
    stem.position.set(x,.92,8.9); flowerGroup.add(stem);
    flowerGroup.add(cluster(x,1.9,8.9,1.6*s,d+0.3));

    const stem2=stem.clone();
    stem2.position.set(x,.92,-11.3); flowerGroup.add(stem2);
    flowerGroup.add(cluster(x,1.9,-11.3,1.65*s,d+0.35));
  }

  flowerGroup.add(cluster(0,1.66,-15.7,1.7*s,d+0.3));
}

// ---------------------
// Chandeliers
// ---------------------
const chandelierLights=[];
function makeRingChandelier(z, radius=1.35, y=8.15) {
  const g=new THREE.Group();
  const stem=new THREE.Mesh(new THREE.CylinderGeometry(.025,.025,1.05,8), mats.gold);
  stem.position.y=y+.5; g.add(stem);

  const ring=new THREE.Mesh(new THREE.TorusGeometry(radius,.045,10,48),mats.gold);
  ring.rotation.x=Math.PI/2; ring.position.y=y; g.add(ring);

  for (let i=0;i<18;i++) {
    const a=(i/18)*Math.PI*2;
    const candle=new THREE.Mesh(
      new THREE.CylinderGeometry(.018,.025,.24,8),
      new THREE.MeshStandardMaterial({color:0xfff6e7,emissive:0xffd59a,emissiveIntensity:1.6})
    );
    candle.position.set(Math.cos(a)*radius,y+.13,Math.sin(a)*radius);
    g.add(candle);
  }
  g.position.z=z;
  world.add(g);

  const p=new THREE.PointLight(0xffd6a4,34,11,1.6);
  p.position.set(0,y-.25,z);
  scene.add(p);
  chandelierLights.push(p);
}
[-10,-4,2,8].forEach((z,i)=>makeRingChandelier(z, i===0?1.0:1.25));

// center crystal chandelier near altar
function makeCrystalChandelier(z=-13.6,y=7.15) {
  const g=new THREE.Group();
  const chain=new THREE.Mesh(new THREE.CylinderGeometry(.018,.018,1.2,8),mats.gold);
  chain.position.y=y+.6; g.add(chain);
  for (let layer=0;layer<4;layer++) {
    const count=12-layer*2;
    const rr=.92-layer*.17;
    const yy=y-layer*.25;
    for (let i=0;i<count;i++) {
      const a=(i/count)*Math.PI*2;
      const crystal=new THREE.Mesh(
        new THREE.SphereGeometry(.07,10,8),
        new THREE.MeshPhysicalMaterial({
          color:0xfff8ec, roughness:.05, transmission:.45, thickness:.2,
          emissive:0xffe3b9, emissiveIntensity:.55
        })
      );
      crystal.position.set(Math.cos(a)*rr,yy,Math.sin(a)*rr);
      g.add(crystal);
    }
  }
  g.position.z=z;
  world.add(g);
}
makeCrystalChandelier();

// ---------------------
// Light
// ---------------------
const hemi=new THREE.HemisphereLight(0xfff4e4,0x67564a,1.65);
scene.add(hemi);

const sun=new THREE.DirectionalLight(0xffe6c7,2.2);
sun.position.set(4,11,7);
sun.castShadow=true;
sun.shadow.mapSize.set(2048,2048);
sun.shadow.camera.left=-12;
sun.shadow.camera.right=12;
sun.shadow.camera.top=12;
sun.shadow.camera.bottom=-20;
scene.add(sun);

const altarSpot=new THREE.SpotLight(0xffdfb5,62,34,Math.PI/6,.5,1.3);
altarSpot.position.set(0,9,-8);
altarSpot.target.position.set(0,1.3,-15.5);
scene.add(altarSpot,altarSpot.target);

const aisleSpot=new THREE.SpotLight(0xffebcf,48,28,Math.PI/7,.58,1.2);
aisleSpot.position.set(0,8,7);
aisleSpot.target.position.set(0,0,-3);
scene.add(aisleSpot,aisleSpot.target);

// ---------------------
// XR teleport
// ---------------------
const teleportPads=[];
const teleportGroup=new THREE.Group();
world.add(teleportGroup);
function addPad(z,label) {
  const m=new THREE.Mesh(
    new THREE.RingGeometry(.2,.31,30),
    new THREE.MeshBasicMaterial({color:0xffdfb2,transparent:true,opacity:.13,depthWrite:false})
  );
  m.rotation.x=-Math.PI/2;
  m.position.set(0,.06,z);
  m.userData.teleportZ=z;
  m.userData.label=label;
  teleportPads.push(m);
  teleportGroup.add(m);
}
[[10.2,"입구"],[6.5,"입장"],[2.5,"버진로드"],[-1.5,"중앙"],[-5.5,"후반"],[-9.5,"단상 앞"]]
  .forEach(([z,l])=>addPad(z,l));

// ---------------------
// UI + interaction
// ---------------------
const hallStyle=document.getElementById("hallStyle");
const seatingType=document.getElementById("seatingType");
const aisleType=document.getElementById("aisleType");
const flowerAmount=document.getElementById("flowerAmount");
const lightLevel=document.getElementById("lightLevel");
const flowerTone=document.getElementById("flowerTone");
const flowerAmountValue=document.getElementById("flowerAmountValue");
const lightLevelValue=document.getElementById("lightLevelValue");
const modeBadge=document.getElementById("modeBadge");
const xrStatus=document.getElementById("xrStatus");

function updateCameraRotation() {
  camera.rotation.order="YXZ";
  camera.rotation.y=yaw;
  camera.rotation.x=pitch;
}

function resetWalk(position="entrance") {
  const presets={
    entrance:{x:0,z:12.2,yaw:0,pitch:0},
    middle:{x:0,z:-1.4,yaw:0,pitch:0},
    altar:{x:0,z:-10.3,yaw:0,pitch:0},
    guest:{x:4.7,z:0.8,yaw:.62,pitch:0},
  };
  const p=presets[position]||presets.entrance;
  walkX=p.x; walkZ=p.z; yaw=p.yaw; pitch=p.pitch;
  camera.position.set(walkX,1.66,walkZ);
  player.position.set(0,0,0);
  updateCameraRotation();
  modeBadge.textContent="👰 버진로드 체험";
}

function move(step) {
  if (renderer.xr.isPresenting) return;
  walkZ=THREE.MathUtils.clamp(walkZ-Math.cos(yaw)*step,-11.0,12.4);
  walkX=THREE.MathUtils.clamp(walkX-Math.sin(yaw)*step,-6.2,6.2);
  camera.position.set(walkX,1.66,walkZ);
}

function turn(step) {
  if (renderer.xr.isPresenting) return;
  yaw+=step;
  updateCameraRotation();
}

document.getElementById("moveForward").addEventListener("click",()=>move(.65));
document.getElementById("moveBackward").addEventListener("click",()=>move(-.65));
document.getElementById("turnLeft").addEventListener("click",()=>turn(.15));
document.getElementById("turnRight").addEventListener("click",()=>turn(-.15));

window.addEventListener("keydown",(e)=>keys.add(e.key.toLowerCase()));
window.addEventListener("keyup",(e)=>keys.delete(e.key.toLowerCase()));

canvas.addEventListener("pointerdown",(e)=>{
  if (renderer.xr.isPresenting) return;
  dragging=true; lastX=e.clientX; lastY=e.clientY;
  canvas.setPointerCapture?.(e.pointerId);
});
canvas.addEventListener("pointermove",(e)=>{
  if (!dragging || renderer.xr.isPresenting) return;
  const dx=e.clientX-lastX;
  const dy=e.clientY-lastY;
  lastX=e.clientX; lastY=e.clientY;
  yaw-=dx*.0042;
  pitch=THREE.MathUtils.clamp(pitch-dy*.0032,-.6,.55);
  updateCameraRotation();
});
canvas.addEventListener("pointerup",()=>dragging=false);
canvas.addEventListener("pointercancel",()=>dragging=false);

document.querySelectorAll("[data-view]").forEach(btn=>{
  btn.addEventListener("click",()=>resetWalk(btn.dataset.view));
});
document.getElementById("walkMode").addEventListener("click",()=>resetWalk("entrance"));
document.getElementById("resetView").addEventListener("click",()=>resetWalk("entrance"));

const panel=document.getElementById("floatingPanel");
const panelBody=document.getElementById("panelBody");
const collapse=document.getElementById("collapsePanel");
collapse.addEventListener("click",()=>{
  const collapsed=panel.classList.toggle("collapsed");
  collapse.textContent=collapsed?"+":"−";
});

function applyHallStyle() {
  if (hallStyle.value==="chapel") {
    mats.wall.color.set(0xeadfce);
    mats.trim.color.set(0xd4bea7);
    mats.column.color.set(0xe8dac8);
    vaultMat.color.set(0xf0e7da);
    scene.background.set(0xe9dfd4);
    scene.fog.color.set(0xe9dfd4);
  } else {
    mats.wall.color.set(0xf0ece6);
    mats.trim.color.set(0xd7cdbc);
    mats.column.color.set(0xeee8df);
    vaultMat.color.set(0xf7f3ee);
    scene.background.set(0xefebe5);
    scene.fog.color.set(0xefebe5);
  }
}

function applySeating() {
  chairGroup.visible=seatingType.value==="chairs";
  pewGroup.visible=seatingType.value==="pews";
}

function applyAisle() {
  if (aisleType.value==="glossy") {
    mats.aisle.color.set(0xf2ece4);
    mats.aisle.roughness=.16;
  } else if (aisleType.value==="wood") {
    mats.aisle.color.set(0xb78d68);
    mats.aisle.roughness=.46;
  } else {
    mats.aisle.color.set(0xffffff);
    mats.aisle.roughness=.38;
  }
}

function applyFlowerTone() {
  if (flowerTone.value==="white") {
    flowerBloomMat.color.set(0xfaf7f0);
    flowerAccentMat.color.set(0xe8ddd0);
    leafMat.color.set(0x587257);
  } else if (flowerTone.value==="ivory") {
    flowerBloomMat.color.set(0xf4ead8);
    flowerAccentMat.color.set(0xdcc7aa);
    leafMat.color.set(0x64705b);
  } else {
    flowerBloomMat.color.set(0xfbf4ef);
    flowerAccentMat.color.set(0xe7c9c7);
    leafMat.color.set(0x5d735d);
  }
}

function applyFlowerAmount() {
  const v=Number(flowerAmount.value);
  flowerAmountValue.textContent=`${v}%`;
  rebuildFlowers(v);
}

function applyLight() {
  const v=Number(lightLevel.value);
  lightLevelValue.textContent=`${v}%`;
  renderer.toneMappingExposure=.72+v/180;
  hemi.intensity=.85+v/95;
  sun.intensity=1.1+v/48;
  altarSpot.intensity=28+v*.5;
  aisleSpot.intensity=20+v*.38;
  ribMat.emissiveIntensity=.2+v/140;
  chandelierLights.forEach((l,i)=>l.intensity=14+v*.28);
}

hallStyle.addEventListener("change",applyHallStyle);
seatingType.addEventListener("change",applySeating);
aisleType.addEventListener("change",applyAisle);
flowerAmount.addEventListener("input",applyFlowerAmount);
lightLevel.addEventListener("input",applyLight);
flowerTone.addEventListener("change",applyFlowerTone);

// ---------------------
// WebXR
// ---------------------
const vrHost=document.getElementById("vrButtonHost");
const vrButton=VRButton.createButton(renderer,{
  optionalFeatures:["hand-tracking","bounded-floor"]
});
vrButton.textContent="🥽 Galaxy XR로 입장";
vrHost.appendChild(vrButton);

if (!("xr" in navigator)) {
  xrStatus.textContent="현재 브라우저에서 WebXR이 감지되지 않았습니다. Galaxy XR의 Chrome에서 HTTPS 주소로 열어보세요.";
} else {
  navigator.xr.isSessionSupported("immersive-vr").then(supported=>{
    xrStatus.textContent=supported
      ?"immersive VR 지원 확인됨. ‘Galaxy XR로 입장’을 눌러 체험하세요."
      :"WebXR은 감지되지만 immersive VR 세션은 지원되지 않습니다.";
  }).catch(()=>{});
}

renderer.xr.addEventListener("sessionstart",()=>{
  player.position.set(0,0,10.2);
  camera.position.set(0,0,0);
  modeBadge.textContent="🥽 Galaxy XR";
  xrStatus.textContent="VR 입장 완료. 버진로드의 원형 포인트를 가리키고 선택하면 이동합니다.";
});

renderer.xr.addEventListener("sessionend",()=>{
  player.position.set(0,0,0);
  resetWalk("entrance");
});

const raycaster=new THREE.Raycaster();
const tempMatrix=new THREE.Matrix4();

function setupController(index) {
  const controller=renderer.xr.getController(index);
  player.add(controller);

  const ray=new THREE.Line(
    new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(0,0,0),
      new THREE.Vector3(0,0,-4),
    ]),
    new THREE.LineBasicMaterial({color:0xffd9a4,transparent:true,opacity:.8})
  );
  controller.add(ray);

  controller.addEventListener("selectstart",()=>{
    tempMatrix.identity().extractRotation(controller.matrixWorld);
    raycaster.ray.origin.setFromMatrixPosition(controller.matrixWorld);
    raycaster.ray.direction.set(0,0,-1).applyMatrix4(tempMatrix);
    const hits=raycaster.intersectObjects(teleportPads,false);
    if (hits.length) {
      const z=hits[0].object.userData.teleportZ;
      player.position.set(0,0,z);
      xrStatus.textContent=`${hits[0].object.userData.label} 위치로 이동했습니다.`;
    }
  });
}
setupController(0);
setupController(1);

function updateXRStick() {
  if (!renderer.xr.isPresenting) return;
  const session=renderer.xr.getSession();
  if (!session) return;
  for (const source of session.inputSources) {
    if (!source.gamepad || source.gamepad.axes.length<2) continue;
    const axes=source.gamepad.axes;
    const x=axes[axes.length-2]||0;
    const y=axes[axes.length-1]||0;
    if (Math.abs(y)>.18 || Math.abs(x)>.18) {
      player.position.z=THREE.MathUtils.clamp(player.position.z+y*.04,-10.5,10.5);
      player.position.x=THREE.MathUtils.clamp(player.position.x+x*.025,-1.0,1.0);
    }
  }
}

// ---------------------
// resize / animation
// ---------------------
function resize() {
  const w=Math.max(1,canvas.clientWidth);
  const h=Math.max(1,canvas.clientHeight);
  renderer.setSize(w,h,false);
  camera.aspect=w/h;
  camera.updateProjectionMatrix();
}
new ResizeObserver(resize).observe(canvas);

let lastTime=performance.now();
renderer.setAnimationLoop((time)=>{
  const dt=Math.min(.05,(time-lastTime)/1000);
  lastTime=time;

  if (!renderer.xr.isPresenting) {
    if (keys.has("w")||keys.has("arrowup")) move(2.25*dt);
    if (keys.has("s")||keys.has("arrowdown")) move(-2.25*dt);
    if (keys.has("a")||keys.has("arrowleft")) turn(1.22*dt);
    if (keys.has("d")||keys.has("arrowright")) turn(-1.22*dt);
  }

  updateXRStick();

  teleportPads.forEach((pad,i)=>{
    pad.material.opacity=.08+.08*(.5+.5*Math.sin(time*.002+i));
  });

  renderer.render(scene,camera);
});

applyHallStyle();
applySeating();
applyAisle();
applyFlowerTone();
applyFlowerAmount();
applyLight();
resetWalk("entrance");
resize();
