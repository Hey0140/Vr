import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.165.0/+esm";
import { OrbitControls } from "https://cdn.jsdelivr.net/npm/three@0.165.0/examples/jsm/controls/OrbitControls.js/+esm";

const canvas = document.getElementById("weddingCanvas");

const scene = new THREE.Scene();
scene.background = new THREE.Color(0xf3efe9);

const camera = new THREE.PerspectiveCamera(55, 1, 0.1, 100);
camera.position.set(0, 7.5, 15);

const renderer = new THREE.WebGLRenderer({
  canvas,
  antialias: true,
});

renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.outputColorSpace = THREE.SRGBColorSpace;

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.target.set(0, 1.5, -2);
controls.minDistance = 4;
controls.maxDistance = 28;
controls.maxPolarAngle = Math.PI * 0.48;

const world = new THREE.Group();
scene.add(world);

const ambient = new THREE.HemisphereLight(0xfff8ef, 0x5a5148, 2.2);
scene.add(ambient);

const key = new THREE.DirectionalLight(0xfff1d8, 3.2);
key.position.set(4, 10, 7);
key.castShadow = true;
scene.add(key);

const fill = new THREE.PointLight(0xffd8c8, 35, 35, 2);
fill.position.set(0, 6, -7);
scene.add(fill);

// -------------------------
// Hall geometry
// -------------------------
const floorMat = new THREE.MeshStandardMaterial({
  color: 0xe7dfd3,
  roughness: 0.72,
});

const floor = new THREE.Mesh(
  new THREE.PlaneGeometry(20, 30),
  floorMat
);
floor.rotation.x = -Math.PI / 2;
floor.position.z = -2;
floor.receiveShadow = true;
world.add(floor);

const wallMat = new THREE.MeshStandardMaterial({
  color: 0xf4efe8,
  roughness: 0.95,
});

const backWall = new THREE.Mesh(
  new THREE.BoxGeometry(20, 9, 0.35),
  wallMat
);
backWall.position.set(0, 4.5, -16.5);
backWall.receiveShadow = true;
world.add(backWall);

const sideWallL = new THREE.Mesh(
  new THREE.BoxGeometry(0.3, 9, 30),
  wallMat
);
sideWallL.position.set(-10, 4.5, -2);
world.add(sideWallL);

const sideWallR = sideWallL.clone();
sideWallR.position.x = 10;
world.add(sideWallR);

const aisleMat = new THREE.MeshStandardMaterial({
  color: 0xf7f3ee,
  roughness: 0.45,
});

const aisle = new THREE.Mesh(
  new THREE.BoxGeometry(2.2, 0.07, 22),
  aisleMat
);
aisle.position.set(0, 0.06, -1.7);
aisle.receiveShadow = true;
world.add(aisle);

const stage = new THREE.Mesh(
  new THREE.BoxGeometry(8.5, 0.55, 3.5),
  new THREE.MeshStandardMaterial({
    color: 0xd8cec1,
    roughness: 0.65,
  })
);
stage.position.set(0, 0.28, -13.4);
stage.castShadow = true;
stage.receiveShadow = true;
world.add(stage);

// -------------------------
// Ceremony arch
// -------------------------
const archGroup = new THREE.Group();
world.add(archGroup);

function makeColumn(x, y, z, h, color, radius = 0.12) {
  const mesh = new THREE.Mesh(
    new THREE.CylinderGeometry(radius, radius, h, 20),
    new THREE.MeshStandardMaterial({
      color,
      roughness: 0.5,
    })
  );
  mesh.position.set(x, y, z);
  mesh.castShadow = true;
  return mesh;
}

archGroup.add(makeColumn(-2.6, 2.6, -14.2, 4.8, 0xd7c4a7));
archGroup.add(makeColumn(2.6, 2.6, -14.2, 4.8, 0xd7c4a7));

const archTop = new THREE.Mesh(
  new THREE.BoxGeometry(5.4, 0.22, 0.22),
  new THREE.MeshStandardMaterial({ color: 0xd7c4a7 })
);
archTop.position.set(0, 5, -14.2);
archTop.castShadow = true;
archGroup.add(archTop);

// -------------------------
// Chairs
// -------------------------
const chairGroup = new THREE.Group();
world.add(chairGroup);

function makeChair(x, z, side) {
  const group = new THREE.Group();

  const mat = new THREE.MeshStandardMaterial({
    color: 0xc7b49f,
    roughness: 0.68,
  });

  const seat = new THREE.Mesh(
    new THREE.BoxGeometry(0.72, 0.12, 0.72),
    mat
  );
  seat.position.y = 0.55;
  seat.castShadow = true;
  group.add(seat);

  const back = new THREE.Mesh(
    new THREE.BoxGeometry(0.72, 0.85, 0.1),
    mat
  );
  back.position.set(0, 0.95, 0.31);
  back.castShadow = true;
  group.add(back);

  for (const dx of [-0.26, 0.26]) {
    for (const dz of [-0.24, 0.24]) {
      const leg = new THREE.Mesh(
        new THREE.BoxGeometry(0.06, 0.55, 0.06),
        mat
      );
      leg.position.set(dx, 0.27, dz);
      group.add(leg);
    }
  }

  group.position.set(x, 0, z);
  group.rotation.y = side === "L" ? 0.03 : -0.03;

  return group;
}

function rebuildChairs(count) {
  chairGroup.clear();

  const rows = Math.max(
    4,
    Math.min(10, Math.round(count / 20))
  );

  const perSide = Math.max(
    3,
    Math.min(5, Math.round(count / (rows * 2)))
  );

  for (let row = 0; row < rows; row++) {
    const z = -9.5 + row * 1.7;

    for (let i = 0; i < perSide; i++) {
      const offset = 2.15 + i * 1.0;
      chairGroup.add(makeChair(-offset, z, "L"));
      chairGroup.add(makeChair(offset, z, "R"));
    }
  }
}

// -------------------------
// Flowers
// -------------------------
const flowerGroup = new THREE.Group();
world.add(flowerGroup);

function flowerCluster(x, y, z, scale, palette) {
  const group = new THREE.Group();

  const leafMat = new THREE.MeshStandardMaterial({
    color: palette.leaf,
    roughness: 0.8,
  });

  const petalMat = new THREE.MeshStandardMaterial({
    color: palette.flower,
    roughness: 0.65,
  });

  for (let i = 0; i < 10; i++) {
    const leaf = new THREE.Mesh(
      new THREE.SphereGeometry(0.22 * scale, 12, 10),
      leafMat
    );

    const angle = (i / 10) * Math.PI * 2;
    leaf.position.set(
      Math.cos(angle) * 0.42 * scale,
      (i % 3) * 0.13 * scale,
      Math.sin(angle) * 0.42 * scale
    );
    leaf.scale.y = 1.6;
    group.add(leaf);
  }

  for (let i = 0; i < 8; i++) {
    const petal = new THREE.Mesh(
      new THREE.SphereGeometry(0.18 * scale, 12, 10),
      petalMat
    );

    const angle = (i / 8) * Math.PI * 2;
    petal.position.set(
      Math.cos(angle) * 0.3 * scale,
      0.22 * scale + (i % 2) * 0.16 * scale,
      Math.sin(angle) * 0.3 * scale
    );
    group.add(petal);
  }

  group.position.set(x, y, z);
  return group;
}

const styles = {
  classic: {
    label: "클래식 호텔",
    floor: 0xe7dfd3,
    wall: 0xf4efe8,
    aisle: 0xf7f3ee,
    leaf: 0x66745b,
    flower: 0xfffdf8,
    light: 0xffe7c9,
    bg: 0xf3efe9,
  },
  romantic: {
    label: "로맨틱 플라워",
    floor: 0xe9ddd8,
    wall: 0xf8efed,
    aisle: 0xfff7f5,
    leaf: 0x718166,
    flower: 0xf6cfd6,
    light: 0xffd8d2,
    bg: 0xf7eeed,
  },
  modern: {
    label: "모던 미니멀",
    floor: 0xd9d9d5,
    wall: 0xeeeeeb,
    aisle: 0xf6f6f2,
    leaf: 0x59665d,
    flower: 0xf2f0e9,
    light: 0xe5e6ff,
    bg: 0xededeb,
  },
};

function rebuildFlowers(amount, styleKey) {
  flowerGroup.clear();

  const style = styles[styleKey];
  const palette = {
    leaf: style.leaf,
    flower: style.flower,
  };

  const density = Math.max(2, Math.round(amount / 15));

  for (let i = 0; i < density; i++) {
    const z = -11.5 + i * 3.2;

    flowerGroup.add(
      flowerCluster(
        -1.45,
        0.35,
        z,
        0.78 + amount / 300,
        palette
      )
    );

    flowerGroup.add(
      flowerCluster(
        1.45,
        0.35,
        z,
        0.78 + amount / 300,
        palette
      )
    );
  }

  flowerGroup.add(
    flowerCluster(
      -2.6,
      4.65,
      -14.2,
      1.1 + amount / 250,
      palette
    )
  );

  flowerGroup.add(
    flowerCluster(
      2.6,
      4.65,
      -14.2,
      1.1 + amount / 250,
      palette
    )
  );

  flowerGroup.add(
    flowerCluster(
      0,
      5.05,
      -14.2,
      1.2 + amount / 220,
      palette
    )
  );
}

// -------------------------
// Controls
// -------------------------
const styleSelect = document.getElementById("styleSelect");
const flowerRange = document.getElementById("flowerRange");
const lightRange = document.getElementById("lightRange");
const guestSelect = document.getElementById("guestSelect");

const flowerValue = document.getElementById("flowerValue");
const lightValue = document.getElementById("lightValue");
const conceptLabel = document.getElementById("conceptLabel");
const costValue = document.getElementById("costValue");
const spaceScore = document.getElementById("spaceScore");

function updateScene() {
  const styleKey = styleSelect.value;
  const flower = Number(flowerRange.value);
  const light = Number(lightRange.value);
  const guests = Number(guestSelect.value);

  const style = styles[styleKey];

  scene.background.setHex(style.bg);
  floorMat.color.setHex(style.floor);
  wallMat.color.setHex(style.wall);
  aisleMat.color.setHex(style.aisle);
  fill.color.setHex(style.light);

  ambient.intensity = 1.1 + light / 70;
  key.intensity = 1.5 + light / 38;
  fill.intensity = 12 + light / 2.2;

  rebuildFlowers(flower, styleKey);
  rebuildChairs(guests);

  flowerValue.textContent = `${flower}%`;
  lightValue.textContent = `${light}%`;
  conceptLabel.textContent = style.label;

  const base = 260;
  const flowerCost = flower * 3.2;
  const guestCost = guests * 0.8;
  const styleExtra =
    styleKey === "romantic"
      ? 55
      : styleKey === "classic"
      ? 35
      : 10;

  const estimate =
    Math.round(
      (base + flowerCost + guestCost + styleExtra) / 10
    ) * 10;

  costValue.textContent = `약 ${estimate}만원`;

  const score = Math.max(
    78,
    Math.min(
      97,
      95 -
        Math.abs(120 - guests) / 16 -
        Math.abs(70 - flower) / 18
    )
  );

  spaceScore.textContent = `${Math.round(score)}%`;
}

styleSelect.addEventListener("change", updateScene);
flowerRange.addEventListener("input", updateScene);
lightRange.addEventListener("input", updateScene);
guestSelect.addEventListener("change", updateScene);

// -------------------------
// Camera presets
// -------------------------
function moveCamera(position, target) {
  camera.position.set(...position);
  controls.target.set(...target);
  controls.update();
}

document
  .getElementById("viewEntrance")
  .addEventListener("click", () =>
    moveCamera([0, 1.65, 10.8], [0, 1.8, -12])
  );

document
  .getElementById("viewGuest")
  .addEventListener("click", () =>
    moveCamera([5.2, 1.7, -2.5], [0, 1.8, -13])
  );

document
  .getElementById("viewStage")
  .addEventListener("click", () =>
    moveCamera([0, 1.8, -12.2], [0, 1.5, 3])
  );

document
  .getElementById("viewTop")
  .addEventListener("click", () =>
    moveCamera([0, 12, 14], [0, 0, -4])
  );

// -------------------------
// XR availability check
// NOTE: immersive VR entry is NOT implemented yet.
// -------------------------
document
  .getElementById("xrCheck")
  .addEventListener("click", async () => {
    const status = document.getElementById("xrStatus");

    if (!("xr" in navigator)) {
      status.textContent =
        "현재 브라우저에서는 WebXR을 사용할 수 없어요. 일반 3D/360° 모드는 정상 이용 가능합니다.";
      return;
    }

    try {
      const supported =
        await navigator.xr.isSessionSupported("immersive-vr");

      status.textContent = supported
        ? "이 환경은 immersive VR을 지원합니다. 다음 단계에서 실제 VR 진입 버튼을 연결할 수 있어요."
        : "WebXR API는 있지만 immersive VR 기기가 현재 연결되어 있지 않아요.";
    } catch {
      status.textContent =
        "현재 실행 환경에서는 XR 지원 여부를 확인할 수 없어요.";
    }
  });

// -------------------------
// Responsive renderer
// -------------------------
function resizeRenderer() {
  const rect = canvas.getBoundingClientRect();
  const width = Math.max(1, rect.width);
  const height = Math.max(1, rect.height);

  renderer.setSize(width, height, false);

  camera.aspect = width / height;
  camera.updateProjectionMatrix();
}

const resizeObserver = new ResizeObserver(resizeRenderer);
resizeObserver.observe(canvas);

updateScene();
resizeRenderer();

function animate() {
  controls.update();
  renderer.render(scene, camera);
  requestAnimationFrame(animate);
}

animate();
