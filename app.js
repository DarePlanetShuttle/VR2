let container;
let camera, scene, renderer;
let isUserInteracting = false;
let lon = 0, lat = 0;
let phi = 0, theta = 0;
let texture;

init();
animate();

function init() {

  const loader = new THREE.TextureLoader();
  loader.load('360-image-link', function (t) {
    texture = t;
    initScene();
  });

  container = document.getElementById('container');

  camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 1, 1100);
  camera.target = new THREE.Vector3(0, 0, 0);

  renderer = new THREE.WebGLRenderer();
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(window.innerWidth, window.innerHeight);
  container.appendChild(renderer.domElement);

  window.addEventListener('resize', onWindowResize, false);
}

function initScene() {

  scene = new THREE.Scene();
  const geometry = new THREE.SphereGeometry(500, 60, 40);
  geometry.scale(-1, 1, 1);
  
  const material = new THREE.MeshBasicMaterial({
    map: texture
  });

  mesh = new THREE.Mesh(geometry, material);
  
  scene.add(mesh);
}

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}

function animate() {
  requestAnimationFrame(animate);
  update();
}

function update() {

  if (isUserInteracting === false) {
    lon += 0.1;
  }
  
  lat = Math.max(- 85, Math.min(85, lat));
  phi = THREE.Math.degToRad(90 - lat);
  theta = THREE.Math.degToRad(lon);
  
  camera.target.x = 500 * Math.sin(phi) * Math.cos(theta);
  camera.target.y = 500 * Math.cos(phi);
  camera.target.z = 500 * Math.sin(phi) * Math.sin(theta);
  
  camera.lookAt(camera.target);

  renderer.render(scene, camera);
}