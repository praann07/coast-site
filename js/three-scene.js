(function () {
  if (typeof THREE === 'undefined') {
    // Keep this in sync with the #hero fallback gradient in css/style.css.
    document.getElementById('hero').style.background = 'linear-gradient(135deg, #052419 0%, #096A4B 50%, #041B13 100%)';
    return;
  }

  const canvas = document.getElementById('three-canvas');
  if (!canvas) return;
const scene = new THREE.Scene();

const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 100);
camera.position.set(0, 2, 14);

const renderer = new THREE.WebGLRenderer({
  canvas,
  alpha: true,
  antialias: true,
});
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.2;

const group = new THREE.Group();
scene.add(group);

// Emerald, matching --brand in css/style.css and the app's theme tokens.
const BRAND = '#0F9D6E';
const BRAND_DARK = '#0B7A57';
const ACCENT = '#34D399';
const COLORS = ['#0F9D6E', '#0B7A57', '#34D399', '#096A4B', '#12B981'];

const shapes = [];
const shapeCount = 30;

function randomBetween(min, max) {
  return Math.random() * (max - min) + min;
}

for (let i = 0; i < shapeCount; i++) {
  let geometry;
  const type = Math.random();

  if (type < 0.25) {
    geometry = new THREE.TorusKnotGeometry(randomBetween(0.3, 0.7), randomBetween(0.08, 0.2), 64, 8);
  } else if (type < 0.5) {
    geometry = new THREE.IcosahedronGeometry(randomBetween(0.25, 0.55), 0);
  } else if (type < 0.75) {
    geometry = new THREE.OctahedronGeometry(randomBetween(0.25, 0.5), 0);
  } else {
    geometry = new THREE.TorusGeometry(randomBetween(0.3, 0.6), randomBetween(0.06, 0.15), 16, 32);
  }

  const color = new THREE.Color(COLORS[Math.floor(Math.random() * COLORS.length)]);
  const material = new THREE.MeshPhysicalMaterial({
    color,
    metalness: randomBetween(0.2, 0.6),
    roughness: randomBetween(0.1, 0.4),
    transparent: true,
    opacity: randomBetween(0.4, 0.85),
    envMapIntensity: 0.6,
    clearcoat: randomBetween(0, 0.3),
  });

  const mesh = new THREE.Mesh(geometry, material);

  const radius = randomBetween(3, 8);
  const theta = Math.random() * Math.PI * 2;
  const phi = Math.acos(2 * Math.random() - 1);

  mesh.position.x = radius * Math.sin(phi) * Math.cos(theta);
  mesh.position.y = radius * Math.cos(phi);
  mesh.position.z = radius * Math.sin(phi) * Math.sin(theta) - 2;

  mesh.rotation.x = Math.random() * Math.PI * 2;
  mesh.rotation.y = Math.random() * Math.PI * 2;
  mesh.rotation.z = Math.random() * Math.PI * 2;

  const scale = randomBetween(0.5, 1.5);
  mesh.scale.set(scale, scale, scale);

  const speed = randomBetween(0.2, 0.8);
  const rotSpeedX = randomBetween(-1, 1);
  const rotSpeedY = randomBetween(-1, 1);
  const rotSpeedZ = randomBetween(-1, 1);

  const floatSpeed = randomBetween(0.3, 1);
  const floatAmp = randomBetween(0.2, 0.8);
  const floatOffset = Math.random() * Math.PI * 2;

  const pulseSpeed = randomBetween(0.5, 1.5);
  const pulseAmp = randomBetween(0.05, 0.15);

  group.add(mesh);

  shapes.push({
    mesh,
    radius,
    theta,
    phi,
    speed,
    rotSpeedX,
    rotSpeedY,
    rotSpeedZ,
    floatSpeed,
    floatAmp,
    floatOffset,
    pulseSpeed,
    pulseAmp,
    origScale: scale,
  });
}

const particleCount = 1500;
const particleGeo = new THREE.BufferGeometry();
const positions = new Float32Array(particleCount * 3);
const particleSizes = new Float32Array(particleCount);
const particleSpeeds = new Float32Array(particleCount);
const particleOffsets = new Float32Array(particleCount);

for (let i = 0; i < particleCount; i++) {
  const radius = randomBetween(2, 10);
  const theta = Math.random() * Math.PI * 2;
  const phi = Math.acos(2 * Math.random() - 1);

  positions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
  positions[i * 3 + 1] = radius * Math.cos(phi) * 0.5;
  positions[i * 3 + 2] = radius * Math.sin(phi) * Math.sin(theta) - 2;

  particleSizes[i] = randomBetween(1, 4);
  particleSpeeds[i] = randomBetween(0.05, 0.2);
  particleOffsets[i] = Math.random() * Math.PI * 2;
}

particleGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
particleGeo.setAttribute('size', new THREE.BufferAttribute(particleSizes, 1));

const particleTexture = new THREE.CanvasTexture(generateParticleCanvas());

function generateParticleCanvas() {
  const canvas = document.createElement('canvas');
  canvas.width = 32;
  canvas.height = 32;
  const ctx = canvas.getContext('2d');
  const gradient = ctx.createRadialGradient(16, 16, 0, 16, 16, 16);
  gradient.addColorStop(0, 'rgba(255,255,255,1)');
  gradient.addColorStop(0.3, 'rgba(200,200,255,0.8)');
  gradient.addColorStop(1, 'rgba(255,255,255,0)');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, 32, 32);
  return canvas;
}

const particleMaterial = new THREE.PointsMaterial({
  size: 0.08,
  map: particleTexture,
  blending: THREE.AdditiveBlending,
  depthWrite: false,
  transparent: true,
  opacity: 0.6,
  color: new THREE.Color(BRAND),
  sizeAttenuation: true,
});

const particleSystem = new THREE.Points(particleGeo, particleMaterial);
particleSystem.position.y = 0;
group.add(particleSystem);

const fog = new THREE.FogExp2(0x0a0a1a, 0.025);
scene.fog = fog;

let mouseX = 0;
let mouseY = 0;

document.addEventListener('mousemove', (e) => {
  mouseX = (e.clientX / window.innerWidth - 0.5) * 2;
  mouseY = (e.clientY / window.innerHeight - 0.5) * 2;
});

let time = 0;

function animate() {
  requestAnimationFrame(animate);
  time += 0.01;

  group.rotation.y += 0.002;
  group.rotation.x = Math.sin(time * 0.1) * 0.05 + mouseY * 0.05;
  group.rotation.z = Math.cos(time * 0.08) * 0.03 + mouseX * 0.03;

  for (const s of shapes) {
    s.theta += s.speed * 0.008;
    s.phi += s.speed * 0.004;

    const r = s.radius + Math.sin(time * s.floatSpeed + s.floatOffset) * s.floatAmp;
    s.mesh.position.x = r * Math.sin(s.phi) * Math.cos(s.theta);
    s.mesh.position.y = r * Math.cos(s.phi) + Math.sin(time * s.floatSpeed + s.floatOffset) * 0.3;
    s.mesh.position.z = r * Math.sin(s.phi) * Math.sin(s.theta) - 2;

    s.mesh.rotation.x += s.rotSpeedX * 0.005;
    s.mesh.rotation.y += s.rotSpeedY * 0.005;
    s.mesh.rotation.z += s.rotSpeedZ * 0.005;

    const pulse = 1 + Math.sin(time * s.pulseSpeed + s.floatOffset) * s.pulseAmp;
    const s2 = s.origScale * pulse;
    s.mesh.scale.set(s2, s2, s2);
  }

  const pos = particleSystem.geometry.attributes.position.array;
  for (let i = 0; i < particleCount; i++) {
    pos[i * 3 + 1] += particleSpeeds[i] * 0.02;
    if (pos[i * 3 + 1] > 4) {
      pos[i * 3 + 1] = -4;
    }
  }
  particleSystem.geometry.attributes.position.needsUpdate = true;

  renderer.render(scene, camera);
}

animate();

window.addEventListener('resize', () => {
  const w = window.innerWidth;
  const h = window.innerHeight;
  camera.aspect = w / h;
  camera.updateProjectionMatrix();
  renderer.setSize(w, h);
});
})();
