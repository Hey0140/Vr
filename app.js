import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { VRButton } from "three/addons/webxr/VRButton.js";

const canvas = document.getElementById("weddingCanvas");
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x17120f);
scene.fog = new THREE.FogExp2(0x17120f, 0.018);

const renderer = new THREE.WebGLRenderer({
  canvas,
  antialias: true,
});
renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.05;

// WebXR
renderer.xr.enabled = true;
renderer.xr.setReferenceSpaceType("local-floor");

const player = new THREE.Group();
scene.add(player);

const camera = new THREE.PerspectiveCamera(62, 1, 0.08, 120);
camera.position.set(0, 1.64, 8.4);
player.add(camera);

const orbit = new OrbitControls(camera, renderer.domElement);
orbit.enableDamping = true;
orbit.enabled = false;
orbit.target.set(0, 1.6, -7);
orbit.minDistance = 3;
orbit.maxDistance = 34;
orbit.maxPolarAngle = Math.PI * 0.49;

const hall = new THREE.Group();
scene.add(hall);

const palettes = {
  royal: {
    label: "Royal White Hotel",
    bg: 0x17120f,
    fog: 0x17120f,
    wall: 0xeee6dd,
    wallAccent: 0xd8c6b7,
    floor: 0x342c26,
    aisle: 0xf3eee7,
    metal: 0xb89568,
    flower: 0xfff8ee,
    accentFlower: 0xf0dfd1,
    leaf: 0x4f644e,
    warm: 0xffd5a0,
    drape: 0xece2d8,
  },
  garden: {
    label: "Garden Romantic",
    bg: 0x1b2119,
    fog: 0x1b2119,
    wall: 0xe7e3d5,
    wallAccent: 0xc9cdb4,
    floor: 0x302f27,
    aisle: 0xf1eee2,
    metal: 0xb49a6a,
    flower: 0xf7efe7,
    accentFlower: 0xe4c9c6,
    leaf: 0x557053,
    warm: 0xffd6a3,
    drape: 0xe8e2d4,
  },
  modern: {
    label: "Modern Champagne",
    bg: 0x171716,
    fog: 0x171716,
    wall: 0xe5e1da,
    wallAccent: 0xbab3a9,
    floor: 0x2d2c2a,
    aisle: 0xe9e4dc,
    metal: 0xbca47c,
    flower: 0xf6f1e8,
    accentFlower: 0xd8c6b4,
    leaf: 0x59645d,
    warm: 0xffe0b0,
    drape: 0xdfd9d1,
  },
};

const mats = {
  floor: new THREE.MeshStandardMaterial({ color: 0x342c26, roughness: 0.74 }),
  wall: new THREE.MeshStandardMaterial({ color: 0xeee6dd, roughness: 0.88 }),
  accent: new THREE.MeshStandardMaterial({ color: 0xd8c6b7, roughness: 0.72 }),
  aisle: new THREE.MeshStandardMaterial({ color: 0xf3eee7, roughness: 0.52 }),
  metal: new THREE.MeshStandardMaterial({ color: 0xb89568, metalness: 0.6, roughness: 0.28 }),
  drape: new THREE.MeshStandardMaterial({ color: 0xece2d8, roughness: 1 }),
  chair: new THREE.MeshStandardMaterial({ color: 0xd7c8b8, roughness: 0.7 }),
  darkChair: new THREE.MeshStandardMaterial({ color: 0x77695f, roughness: 0.74 }),
};

const flowerMat = new THREE.MeshStandardMaterial({ color: 0xfff8ee, roughness: 0.72 });
const accentFlowerMat = new THREE.MeshStandardMaterial({ color: 0xf0dfd1, roughness: 0.72 });
const leafMat = new THREE.MeshStandardMaterial({ color: 0x4f644e, roughness: 0.92 });

// Lighting
const ambient = new THREE.HemisphereLight(0xffecd7, 0x1a1512, 1.15);
scene.add(ambient);

const mainLight = new THREE.DirectionalLight(0xffdfb8, 3.5);
mainLight.position.set(2, 10, 5);
mainLight.castShadow = true;
mainLight.shadow.mapSize.set(2048, 2048);
mainLight.shadow.camera.left = -12;
mainLight.shadow.camera.right = 12;
mainLight.shadow.camera.top = 12;
mainLight.shadow.camera.bottom = -18;
scene.add(mainLight);

const altarLight = new THREE.SpotLight(0xffd2a0, 85, 30, Math.PI / 5, 0.45, 1.25);
altarLight.position.set(0, 7.5, -10);
altarLight.target.position.set(0, 1.3, -14);
scene.add(altarLight);
scene.add(altarLight.target);

const aisleLight = new THREE.SpotLight(0xffe1bd, 60, 28, Math.PI / 6, 0.5, 1.3);
aisleLight.position.set(0, 7.6, 3);
aisleLight.target.position.set(0, 0, -6);
scene.add(aisleLight);
scene.add(aisleLight.target);

function mesh(geometry, material, x, y, z) {
  const m = new THREE.Mesh(geometry, material);
  m.position.set(x, y, z);
  m.castShadow = true;
  m.receiveShadow = true;
  hall.add(m);
  return m;
}

// Hall shell: 18m x 28m x 8m
mesh(new THREE.PlaneGeometry(18, 28), mats.floor, 0, 0, -4).rotation.x = -Math.PI / 2;
mesh(new THREE.BoxGeometry(18, 8, 0.32), mats.wall, 0, 4, -18);
mesh(new THREE.BoxGeometry(0.3, 8, 28), mats.wall, -9, 4, -4);
mesh(new THREE.BoxGeometry(0.3, 8, 28), mats.wall, 9, 4, -4);

// Ceiling
const ceiling = mesh(new THREE.BoxGeometry(18, 0.24, 28), mats.wall, 0, 8, -4);
ceiling.receiveShadow = true;

// Ceiling coffers / beams
for (let z = -16; z <= 7; z += 4) {
  mesh(new THREE.BoxGeometry(17.4, 0.22, 0.28), mats.accent, 0, 7.72, z);
}
for (const x of [-6, -3, 3, 6]) {
  mesh(new THREE.BoxGeometry(0.22, 0.25, 27), mats.accent, x, 7.7, -4);
}

// Wall molding
for (const x of [-7.7, -5.2, 5.2, 7.7]) {
  mesh(new THREE.BoxGeometry(0.1, 5.6, 0.14), mats.accent, x, 3.6, -17.78);
}
mesh(new THREE.BoxGeometry(15.5, 0.12, 0.14), mats.accent, 0, 6.5, -17.78);
mesh(new THREE.BoxGeometry(15.5, 0.12, 0.14), mats.accent, 0, 1.0, -17.78);

// Drapes at altar
for (const x of [-6.3, -4.7, 4.7, 6.3]) {
  const drape = mesh(new THREE.CylinderGeometry(0.34, 0.55, 6.6, 18), mats.drape, x, 4.25, -17.45);
  drape.scale.z = 0.35;
}

// Main aisle
const aisle = mesh(new THREE.BoxGeometry(2.15, 0.045, 19), mats.aisle, 0, 0.035, -4.2);
aisle.receiveShadow = true;

// Aisle border strips
for (const x of [-1.12, 1.12]) {
  mesh(new THREE.BoxGeometry(0.045, 0.06, 19), mats.metal, x, 0.055, -4.2);
}

// Altar platform
const platform = mesh(new THREE.BoxGeometry(9.5, 0.38, 4.4), mats.accent, 0, 0.19, -15.3);
platform.receiveShadow = true;

const altarRiser = mesh(new THREE.BoxGeometry(7.2, 0.2, 2.7), mats.aisle, 0, 0.48, -15.4);
altarRiser.receiveShadow = true;

// Elegant altar arch
const arch = new THREE.Group();
hall.add(arch);

function addArchPost(x) {
  const p = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.1, 5.2, 18), mats.metal);
  p.position.set(x, 3.15, -16);
  p.castShadow = true;
  arch.add(p);
}
addArchPost(-3.1);
addArchPost(3.1);

const archCurve = new THREE.Mesh(
  new THREE.TorusGeometry(3.1, 0.09, 14, 40, Math.PI),
  mats.metal
);
archCurve.rotation.z = Math.PI;
archCurve.position.set(0, 5.73, -16);
arch.add(archCurve);

// Flower helpers
const flowerGroup = new THREE.Group();
hall.add(flowerGroup);

function makeFlowerCluster(x, y, z, scale = 1, richness = 1) {
  const g = new THREE.Group();
  const flowerCount = Math.round(8 + richness * 10);
  const leafCount = Math.round(6 + richness * 8);

  for (let i = 0; i < leafCount; i++) {
    const leaf = new THREE.Mesh(new THREE.SphereGeometry(0.12 * scale, 10, 8), leafMat);
    const a = (i / leafCount) * Math.PI * 2;
    leaf.position.set(
      Math.cos(a) * (0.36 + (i % 3) * 0.07) * scale,
      ((i % 5) - 2) * 0.07 * scale,
      Math.sin(a) * (0.28 + (i % 2) * 0.06) * scale
    );
    leaf.scale.set(0.75, 1.8, 0.75);
    g.add(leaf);
  }

  for (let i = 0; i < flowerCount; i++) {
    const mat = i % 4 === 0 ? accentFlowerMat : flowerMat;
    const bloom = new THREE.Mesh(new THREE.SphereGeometry(0.105 * scale, 10, 8), mat);
    const a = (i / flowerCount) * Math.PI * 2;
    bloom.position.set(
      Math.cos(a) * (0.30 + (i % 3) * 0.05) * scale,
      ((i % 4) - 1.5) * 0.09 * scale,
      Math.sin(a) * (0.24 + (i % 2) * 0.05) * scale
    );
    g.add(bloom);
  }

  g.position.set(x, y, z);
  return g;
}

function rebuildFlowers(amount) {
  flowerGroup.clear();
  const richness = THREE.MathUtils.mapLinear(amount, 25, 100, 0.55, 1.55);
  const s = THREE.MathUtils.mapLinear(amount, 25, 100, 0.72, 1.22);

  // aisle flowers
  const zPoints = [4, 1, -2, -5, -8, -11];
  for (const z of zPoints) {
    flowerGroup.add(makeFlowerCluster(-1.45, 0.5, z, s, richness));
    flowerGroup.add(makeFlowerCluster(1.45, 0.5, z, s, richness));
  }

  // altar
  flowerGroup.add(makeFlowerCluster(-3.1, 5.65, -16, 1.45 * s, richness));
  flowerGroup.add(makeFlowerCluster(3.1, 5.65, -16, 1.45 * s, richness));
  flowerGroup.add(makeFlowerCluster(0, 6.25, -16, 1.7 * s, richness));
  flowerGroup.add(makeFlowerCluster(-2.0, 0.85, -14.4, 1.45 * s, richness));
  flowerGroup.add(makeFlowerCluster(2.0, 0.85, -14.4, 1.45 * s, richness));
}

// Chairs
const chairs = new THREE.Group();
hall.add(chairs);

function makeChair(x, z, rotation = 0) {
  const g = new THREE.Group();

  const frame = new THREE.Mesh(new THREE.BoxGeometry(0.52, 0.10, 0.52), mats.chair);
  frame.position.y = 0.47;
  frame.castShadow = true;
  g.add(frame);

  const cushion = new THREE.Mesh(new THREE.BoxGeometry(0.47, 0.11, 0.47), mats.drape);
  cushion.position.y = 0.56;
  cushion.castShadow = true;
  g.add(cushion);

  const back = new THREE.Mesh(new THREE.BoxGeometry(0.52, 0.76, 0.08), mats.chair);
  back.position.set(0, 0.92, 0.23);
  back.castShadow = true;
  g.add(back);

  for (const dx of [-0.20, 0.20]) {
    for (const dz of [-0.19, 0.19]) {
      const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.018, 0.018, 0.47, 8), mats.metal);
      leg.position.set(dx, 0.23, dz);
      g.add(leg);
    }
  }

  g.position.set(x, 0, z);
  g.rotation.y = rotation;
  return g;
}

for (let row = 0; row < 9; row++) {
  const z = 4.4 - row * 1.65;
  for (let col = 0; col < 4; col++) {
    const offset = 2.25 + col * 1.05;
    chairs.add(makeChair(-offset, z, 0.03));
    chairs.add(makeChair(offset, z, -0.03));
  }
}

// A few seated guest silhouettes
const guests = new THREE.Group();
hall.add(guests);
const guestMat = new THREE.MeshStandardMaterial({ color: 0x514841, roughness: 0.9 });

function addGuest(x, z, h = 1) {
  const g = new THREE.Group();
  const body = new THREE.Mesh(new THREE.CapsuleGeometry(0.18, 0.45, 5, 8), guestMat);
  body.position.y = 0.88;
  body.scale.set(1, h, 1);
  g.add(body);
  const head = new THREE.Mesh(new THREE.SphereGeometry(0.15, 10, 8), new THREE.MeshStandardMaterial({ color: 0xb99882, roughness: 0.9 }));
  head.position.y = 1.35;
  g.add(head);
  g.position.set(x, 0, z);
  guests.add(g);
}

[
  [-2.3, 2.8], [3.3, 1.1], [-4.4, -0.6], [2.3, -2.3],
  [-5.4, -5.6], [4.4, -7.3], [-3.3, -9], [5.4, -10.6]
].forEach(([x,z], i) => addGuest(x, z, 0.9 + (i % 3) * 0.08));

// Chandeliers
const chandeliers = new THREE.Group();
hall.add(chandeliers);

function makeChandelier(z) {
  const g = new THREE.Group();
  const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.025, 1.15, 8), mats.metal);
  stem.position.y = 7.1;
  g.add(stem);

  for (let i = 0; i < 10; i++) {
    const a = (i / 10) * Math.PI * 2;
    const arm = new THREE.Mesh(new THREE.CylinderGeometry(0.014, 0.014, 1.0, 6), mats.metal);
    arm.rotation.z = Math.PI / 2;
    arm.rotation.y = a;
    arm.position.set(Math.cos(a) * 0.32, 6.55, Math.sin(a) * 0.32);
    g.add(arm);

    const bulb = new THREE.Mesh(
      new THREE.SphereGeometry(0.09, 10, 8),
      new THREE.MeshStandardMaterial({ color: 0xffe4b5, emissive: 0xffc77d, emissiveIntensity: 2 })
    );
    bulb.position.set(Math.cos(a) * 0.82, 6.55, Math.sin(a) * 0.82 + z);
    hall.add(bulb);
  }

  const center = new THREE.PointLight(0xffcf91, 42, 14, 1.8);
  center.position.set(0, 6.3, z);
  scene.add(center);

  g.position.z = z;
  chandeliers.add(g);
}

[-11, -4, 3].forEach(makeChandelier);

// Decorative candles
for (const side of [-1, 1]) {
  for (const z of [3.5, 0.5, -2.5, -5.5, -8.5, -11.5]) {
    const candle = new THREE.Mesh(
      new THREE.CylinderGeometry(0.04, 0.05, 0.34, 10),
      new THREE.MeshStandardMaterial({ color: 0xf7eee1, roughness: 0.8 })
    );
    candle.position.set(side * 1.75, 0.37, z);
    hall.add(candle);

    const flame = new THREE.Mesh(
      new THREE.SphereGeometry(0.035, 8, 6),
      new THREE.MeshStandardMaterial({ color: 0xffd276, emissive: 0xff9d3f, emissiveIntensity: 3 })
    );
    flame.scale.y = 1.7;
    flame.position.set(side * 1.75, 0.58, z);
    hall.add(flame);
  }
}

// Teleport pads for XR
const teleportPads = [];
const teleportGroup = new THREE.Group();
hall.add(teleportGroup);

function addTeleportPad(z, label) {
  const mat = new THREE.MeshBasicMaterial({
    color: 0xffe0b3,
    transparent: true,
    opacity: 0.18,
    depthWrite: false,
  });
  const disc = new THREE.Mesh(new THREE.RingGeometry(0.22, 0.34, 32), mat);
  disc.rotation.x = -Math.PI / 2;
  disc.position.set(0, 0.05, z);
  disc.userData.teleportZ = z;
  disc.userData.label = label;
  teleportGroup.add(disc);
  teleportPads.push(disc);
}
[
  [6.2, "입구"],
  [2.5, "입장"],
  [-1, "버진로드 1/3"],
  [-4.5, "버진로드 중앙"],
  [-8, "버진로드 2/3"],
  [-11.5, "단상 앞"],
].forEach(([z, label]) => addTeleportPad(z, label));

// Controls / state
const styleSelect = document.getElementById("styleSelect");
const flowerRange = document.getElementById("flowerRange");
const lightRange = document.getElementById("lightRange");
const flowerValue = document.getElementById("flowerValue");
const lightValue = document.getElementById("lightValue");
const conceptLabel = document.getElementById("conceptLabel");
const flowerStatus = document.getElementById("flowerStatus");
const modeBadge = document.getElementById("modeBadge");
const positionBadge = document.getElementById("positionBadge");
const modeHelp = document.getElementById("modeHelp");
const crosshair = document.getElementById("crosshair");
const touchWalk = document.querySelector(".touch-walk");

let walkMode = true;
let yaw = 0;
let walkZ = 8.4;
let walkX = 0;
const keys = new Set();

function updateCameraForWalk() {
  camera.position.set(walkX, 1.64, walkZ);
  camera.rotation.set(0, yaw, 0);
  player.position.set(0, 0, 0);
  const progressed = Math.max(0, 8.4 - walkZ);
  positionBadge.textContent = `${walkZ > 5 ? "입구" : walkZ > -10 ? "버진로드" : "단상 앞"} · ${progressed.toFixed(1)}m`;
}

function setWalkMode() {
  walkMode = true;
  orbit.enabled = false;
  camera.fov = 62;
  camera.updateProjectionMatrix();
  walkX = 0;
  walkZ = 8.4;
  yaw = 0;
  updateCameraForWalk();
  modeBadge.textContent = "👰 WALK MODE";
  modeHelp.textContent = "버진로드 시작점에서 1인칭 시점으로 체험합니다.";
  crosshair.style.display = "";
  touchWalk.style.display = "";
  document.getElementById("walkMode").classList.add("primary");
  document.getElementById("overviewMode").classList.remove("primary");
}

function setOverviewMode() {
  walkMode = false;
  orbit.enabled = true;
  camera.position.set(10.5, 8.2, 14.5);
  camera.rotation.set(0, 0, 0);
  orbit.target.set(0, 2.0, -5.5);
  orbit.update();
  modeBadge.textContent = "🏛 OVERVIEW MODE";
  modeHelp.textContent = "홀 전체를 회전·확대하며 확인합니다.";
  crosshair.style.display = "none";
  touchWalk.style.display = "none";
  document.getElementById("overviewMode").classList.add("primary");
  document.getElementById("walkMode").classList.remove("primary");
}

function moveForward(step) {
  if (!walkMode || renderer.xr.isPresenting) return;
  walkZ = THREE.MathUtils.clamp(walkZ - Math.cos(yaw) * step, -12.0, 8.4);
  walkX = THREE.MathUtils.clamp(walkX - Math.sin(yaw) * step, -0.88, 0.88);
  updateCameraForWalk();
}

function turn(step) {
  if (!walkMode || renderer.xr.isPresenting) return;
  yaw += step;
  updateCameraForWalk();
}

document.getElementById("walkMode").addEventListener("click", setWalkMode);
document.getElementById("overviewMode").addEventListener("click", setOverviewMode);

document.getElementById("moveForward").addEventListener("click", () => moveForward(0.65));
document.getElementById("moveBackward").addEventListener("click", () => moveForward(-0.65));
document.getElementById("turnLeft").addEventListener("click", () => turn(0.16));
document.getElementById("turnRight").addEventListener("click", () => turn(-0.16));

window.addEventListener("keydown", (event) => {
  keys.add(event.key.toLowerCase());
});
window.addEventListener("keyup", (event) => {
  keys.delete(event.key.toLowerCase());
});

document.querySelectorAll("[data-view]").forEach((button) => {
  button.addEventListener("click", () => {
    setWalkMode();
    const view = button.dataset.view;
    if (view === "entrance") {
      walkX = 0; walkZ = 8.4; yaw = 0;
    } else if (view === "mid") {
      walkX = 0; walkZ = -4.4; yaw = 0;
    } else if (view === "stage") {
      walkX = 0; walkZ = -11.3; yaw = 0;
    } else if (view === "guest") {
      walkX = 4.5; walkZ = -2.5; yaw = 0.55;
    }
    updateCameraForWalk();
  });
});

function applyStyle() {
  const p = palettes[styleSelect.value];
  scene.background.setHex(p.bg);
  scene.fog.color.setHex(p.fog);
  mats.wall.color.setHex(p.wall);
  mats.accent.color.setHex(p.wallAccent);
  mats.floor.color.setHex(p.floor);
  mats.aisle.color.setHex(p.aisle);
  mats.metal.color.setHex(p.metal);
  mats.drape.color.setHex(p.drape);
  flowerMat.color.setHex(p.flower);
  accentFlowerMat.color.setHex(p.accentFlower);
  leafMat.color.setHex(p.leaf);
  conceptLabel.textContent = p.label;
  rebuildFlowers(Number(flowerRange.value));
}

function applyFlowers() {
  const amount = Number(flowerRange.value);
  flowerValue.textContent = `${amount}%`;
  flowerStatus.textContent = amount >= 80 ? "풍성함" : amount >= 55 ? "균형형" : "미니멀";
  rebuildFlowers(amount);
}

function applyLight() {
  const light = Number(lightRange.value);
  lightValue.textContent = `${light}%`;
  renderer.toneMappingExposure = 0.76 + light / 160;
  ambient.intensity = 0.7 + light / 110;
  mainLight.intensity = 1.7 + light / 33;
  altarLight.intensity = 45 + light * 0.55;
  aisleLight.intensity = 30 + light * 0.48;
}

styleSelect.addEventListener("change", applyStyle);
flowerRange.addEventListener("input", applyFlowers);
lightRange.addEventListener("input", applyLight);

// VR Button
const vrHost = document.getElementById("vrButtonHost");
const xrStatus = document.getElementById("xrStatus");
const vrButton = VRButton.createButton(renderer, {
  optionalFeatures: ["hand-tracking", "bounded-floor"],
});
vrButton.textContent = "🥽 VR로 입장하기";
vrHost.appendChild(vrButton);

if (!("xr" in navigator)) {
  xrStatus.textContent = "이 브라우저에서는 WebXR이 감지되지 않았습니다. Galaxy XR의 Chrome에서 HTTPS 주소로 다시 열어보세요.";
} else {
  navigator.xr.isSessionSupported("immersive-vr")
    .then((supported) => {
      xrStatus.textContent = supported
        ? "immersive VR 지원이 확인되었습니다. 위 버튼으로 웨딩홀에 입장할 수 있습니다."
        : "WebXR은 있지만 immersive VR 세션이 지원되지 않는 환경입니다.";
    })
    .catch(() => {
      xrStatus.textContent = "XR 지원 여부 확인 중 오류가 발생했습니다.";
    });
}

// XR player setup
renderer.xr.addEventListener("sessionstart", () => {
  walkMode = true;
  orbit.enabled = false;
  player.position.set(0, 0, 6.2);
  camera.position.set(0, 0, 0);
  modeBadge.textContent = "🥽 XR MODE";
  xrStatus.textContent = "XR 입장 완료. 버진로드의 원형 이동 지점을 가리킨 뒤 선택/핀치해 이동하세요.";
});

renderer.xr.addEventListener("sessionend", () => {
  player.position.set(0, 0, 0);
  setWalkMode();
  xrStatus.textContent = "XR 세션이 종료되었습니다.";
});

const raycaster = new THREE.Raycaster();
const tempMatrix = new THREE.Matrix4();

function setupXRController(index) {
  const controller = renderer.xr.getController(index);
  player.add(controller);

  const ray = new THREE.Line(
    new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(0, 0, 0),
      new THREE.Vector3(0, 0, -3.5),
    ]),
    new THREE.LineBasicMaterial({
      color: 0xffddb0,
      transparent: true,
      opacity: 0.75,
    })
  );
  controller.add(ray);

  controller.addEventListener("selectstart", () => {
    tempMatrix.identity().extractRotation(controller.matrixWorld);
    raycaster.ray.origin.setFromMatrixPosition(controller.matrixWorld);
    raycaster.ray.direction.set(0, 0, -1).applyMatrix4(tempMatrix);

    const hits = raycaster.intersectObjects(teleportPads, false);
    if (hits.length) {
      const z = hits[0].object.userData.teleportZ;
      player.position.x = 0;
      player.position.z = z;
      xrStatus.textContent = `${hits[0].object.userData.label} 위치로 이동했습니다.`;
    }
  });

  return controller;
}

setupXRController(0);
setupXRController(1);

function updateXRGamepadMovement() {
  if (!renderer.xr.isPresenting) return;
  const session = renderer.xr.getSession();
  if (!session) return;

  for (const source of session.inputSources) {
    if (!source.gamepad || source.gamepad.axes.length < 2) continue;
    const axes = source.gamepad.axes;
    const x = axes[axes.length - 2] || 0;
    const y = axes[axes.length - 1] || 0;
    if (Math.abs(y) > 0.18) {
      player.position.z = THREE.MathUtils.clamp(player.position.z + y * 0.045, -11.5, 6.2);
      player.position.x = THREE.MathUtils.clamp(player.position.x + x * 0.025, -0.9, 0.9);
    }
  }
}

// Pointer drag look for phone/desktop walk mode
let dragging = false;
let lastX = 0;
renderer.domElement.addEventListener("pointerdown", (event) => {
  if (!walkMode || renderer.xr.isPresenting) return;
  dragging = true;
  lastX = event.clientX;
  renderer.domElement.setPointerCapture?.(event.pointerId);
});
renderer.domElement.addEventListener("pointermove", (event) => {
  if (!dragging || !walkMode || renderer.xr.isPresenting) return;
  const dx = event.clientX - lastX;
  lastX = event.clientX;
  yaw -= dx * 0.004;
  updateCameraForWalk();
});
renderer.domElement.addEventListener("pointerup", () => dragging = false);
renderer.domElement.addEventListener("pointercancel", () => dragging = false);

// Resize
function resize() {
  const rect = canvas.getBoundingClientRect();
  renderer.setSize(Math.max(1, rect.width), Math.max(1, rect.height), false);
  camera.aspect = rect.width / Math.max(1, rect.height);
  camera.updateProjectionMatrix();
}
new ResizeObserver(resize).observe(canvas);

// Animate
let lastTime = performance.now();
renderer.setAnimationLoop((time) => {
  const dt = Math.min(0.05, (time - lastTime) / 1000);
  lastTime = time;

  if (walkMode && !renderer.xr.isPresenting) {
    if (keys.has("w") || keys.has("arrowup")) moveForward(2.25 * dt);
    if (keys.has("s") || keys.has("arrowdown")) moveForward(-2.25 * dt);
    if (keys.has("a") || keys.has("arrowleft")) turn(1.25 * dt);
    if (keys.has("d") || keys.has("arrowright")) turn(-1.25 * dt);
  }

  updateXRGamepadMovement();

  // Soft pulse on teleport pads
  const t = time * 0.001;
  for (let i = 0; i < teleportPads.length; i++) {
    teleportPads[i].material.opacity = 0.12 + 0.08 * (0.5 + 0.5 * Math.sin(t * 2 + i));
  }

  if (orbit.enabled) orbit.update();
  renderer.render(scene, camera);
});

applyStyle();
applyFlowers();
applyLight();
setWalkMode();
resize();
