import {
  AmbientLight,
  Box3,
  Box3Helper,
  Color,
  DirectionalLight,
  PerspectiveCamera,
  Scene,
  Vector3,
  WebGLRenderer,
} from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import Stats from 'stats.js';
import GUI from 'lil-gui';
import { Flock } from './boids/flock';
import type { BoidWeights } from './boids/types';
import { WindField } from './boids/wind-field';
import { BoidRenderer } from './render/boid-renderer';

const canvas = document.querySelector<HTMLCanvasElement>('#app');
if (!canvas) throw new Error('Canvas element #app not found');

const renderer = new WebGLRenderer({ canvas, antialias: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setSize(window.innerWidth, window.innerHeight, false);

const scene = new Scene();
scene.background = new Color(0x0a0a14);

const camera = new PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(0, 30, 140);

const controls = new OrbitControls(camera, canvas);
controls.enableDamping = true;

scene.add(new AmbientLight(0xffffff, 0.5));
const sun = new DirectionalLight(0xffffff, 0.9);
sun.position.set(10, 20, 10);
scene.add(sun);

const weights: BoidWeights = {
  alignment: 1.0,
  cohesion: 1.0,
  separation: 1.5,
  speed: 1.0,
};

const wind = new WindField({
  strength: 1.5,
  scale: 0.04,
  drift: 0.2,
});

const settings = {
  count: 500,
};

let flock = new Flock(weights, { count: settings.count }, wind);
let flockRenderer = new BoidRenderer(flock.boids.length);
scene.add(flockRenderer.mesh);

function rebuildFlock(count: number): void {
  scene.remove(flockRenderer.mesh);
  flockRenderer.dispose();
  flock = new Flock(weights, { count }, wind);
  flockRenderer = new BoidRenderer(flock.boids.length);
  scene.add(flockRenderer.mesh);
}

const bounds = flock.options.bounds;
const boundsBox = new Box3(
  new Vector3(-bounds, -bounds, -bounds),
  new Vector3(bounds, bounds, bounds),
);
const boundsHelper = new Box3Helper(boundsBox, new Color(0x223344));
scene.add(boundsHelper);

const gui = new GUI({ title: 'Murmuration' });
const flockFolder = gui.addFolder('Flock');
flockFolder
  .add(settings, 'count', 50, 5000, 1)
  .name('count (reload)')
  .onFinishChange((v: number) => {
    rebuildFlock(v);
  });

const boidsFolder = gui.addFolder('Boids');
boidsFolder.add(weights, 'alignment', 0, 3, 0.05);
boidsFolder.add(weights, 'cohesion', 0, 3, 0.05);
boidsFolder.add(weights, 'separation', 0, 3, 0.05);
boidsFolder.add(weights, 'speed', 0.1, 3, 0.05);

const windFolder = gui.addFolder('Wind');
windFolder.add(wind.options, 'strength', 0, 8, 0.1);
windFolder.add(wind.options, 'scale', 0.005, 0.2, 0.005);
windFolder.add(wind.options, 'drift', 0, 1, 0.01);

const stats = new Stats();
stats.showPanel(0);
document.body.appendChild(stats.dom);

window.addEventListener('resize', () => {
  const w = window.innerWidth;
  const h = window.innerHeight;
  camera.aspect = w / h;
  camera.updateProjectionMatrix();
  renderer.setSize(w, h, false);
});

// Fixed-timestep simulation, render-rate-independent.
const SIM_STEP = 1 / 60;
const MAX_STEPS_PER_FRAME = 5;
const MAX_FRAME_DT = 0.25;
let lastTime = performance.now() / 1000;
let accumulator = 0;

function tick(): void {
  stats.begin();

  const now = performance.now() / 1000;
  let frameDt = now - lastTime;
  lastTime = now;
  if (frameDt > MAX_FRAME_DT) frameDt = MAX_FRAME_DT;
  accumulator += frameDt;

  let steps = 0;
  while (accumulator >= SIM_STEP && steps < MAX_STEPS_PER_FRAME) {
    flock.update(SIM_STEP);
    accumulator -= SIM_STEP;
    steps++;
  }

  flockRenderer.sync(flock.boids);
  controls.update();
  renderer.render(scene, camera);

  stats.end();
  requestAnimationFrame(tick);
}

requestAnimationFrame(tick);
