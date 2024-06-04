let camera, scene, renderer, controls;
const scenes = [];
let currentScene = 0;
const hotspots = [];
let sceneNames = [];
let scenesData = [];
let INTERSECTED;
const originalTextures = {};

async function init() {
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(0, 0, 0.1);

    scene = new THREE.Scene();

    renderer = new THREE.WebGLRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.xr.enabled = true;
    document.body.appendChild(renderer.domElement);
    document.body.appendChild(VRButton.createButton(renderer));

    controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.enableZoom = false;
    controls.enablePan = false;

    try {
        scenesData = await fetchScenesData('./public/data.json');
        sceneNames = scenesData.map(scene => scene.name);
        populateImageList(scenesData);
        const textures = await loadTextures(scenesData);
        createMeshes(textures);
        updateSelectedSceneName();
    } catch (error) {
        console.error('Error loading JSON or textures:', error);
    }

    window.addEventListener('resize', onWindowResize, false);

    document.getElementById('removeFurnitureButton').addEventListener('click', handleRemoveFurnitureButtonClick);
    document.getElementById('redesignButton').addEventListener('click', handleRedesignButtonClick);
}

async function fetchScenesData(url) {
    const response = await fetch(url);
    const data = await response.json();
    return data.scenes;
}

function loadTextures(imagesData) {
    const textureLoader = new THREE.TextureLoader();
    const texturePromises = imagesData.map(scene => {
        return new Promise((resolve, reject) => {
            textureLoader.load(
                scene.image,
                texture => resolve(texture),
                undefined,
                err => reject(err)
            );
        });
    });

    return Promise.all(texturePromises);
}

function createMeshes(textures) {
    const geometry = new THREE.SphereGeometry(500, 60, 40);
    geometry.scale(-1, 1, 1);

    textures.forEach((texture, index) => {
        const material = new THREE.MeshBasicMaterial({ map: texture });
        const mesh = new THREE.Mesh(geometry, material);
        scenes.push(mesh);
    });

    scene.add(scenes[currentScene]);
}

function changeScene(index) {
    if (index >= 0 && index < scenes.length) {
        scene.remove(scenes[currentScene]);
        clearButtons();
        hotspots.length = 0;

        currentScene = index;
        scene.add(scenes[currentScene]);
        updateSelectedSceneName();
        checkAndPrintButtons(scenesData[currentScene]);
    } else {
        console.error(`Invalid scene index: ${index}`);
    }
}

function handleRemoveFurnitureButtonClick() {
    const currentSceneData = scenesData[currentScene];
    if (currentSceneData.remove_furniture) {
        toggleTexture(currentSceneData.remove_furniture);
    } else {
        console.error('No remove_furniture link found for the current scene');
    }
}

function handleRedesignButtonClick() {
    const currentSceneData = scenesData[currentScene];
    if (currentSceneData.redesign) {
        toggleTexture(currentSceneData.redesign);
    } else {
        console.error('No redesign link found for the current scene');
    }
}

function toggleTexture(texturePath) {
    const currentMaterial = scenes[currentScene].material;
    const currentTexture = currentMaterial.map;

    if (!originalTextures[currentScene]) {
        originalTextures[currentScene] = currentTexture;
        changeTexture(texturePath);
    } else {
        scenes[currentScene].material = new THREE.MeshBasicMaterial({ map: originalTextures[currentScene] });
        delete originalTextures[currentScene];
    }
}

function changeTexture(texturePath) {
    const textureLoader = new THREE.TextureLoader();
    textureLoader.load(
        texturePath,
        (texture) => {
            const material = new THREE.MeshBasicMaterial({ map: texture });
            scenes[currentScene].material = material;
        },
        undefined,
        (err) => {
            console.error(`Error loading texture: ${texturePath}`, err);
        }
    );
}

function changeSceneByLink(link) {
    const targetSceneIndex = scenesData.findIndex(scene => scene.image === link);

    if (targetSceneIndex >= 0) {
        changeScene(targetSceneIndex);
    } else {
        console.error(`Scene with link ${link} not found`);
    }
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}



function animate() {
    renderer.setAnimationLoop(render);
}

function render() {
    controls.update();
    renderer.render(scene, camera);
}

function populateImageList(scenesData) {
    const imageMenu = document.getElementById('imageMenu');
    scenesData.forEach((scene, index) => {
        const li = document.createElement('li');
        li.textContent = scene.name;
        li.onclick = () => changeScene(index);
        imageMenu.appendChild(li);
    });
}

function updateSelectedSceneName() {
    const selectedSpan = document.querySelector('.selected');
    if (selectedSpan) {
        selectedSpan.textContent = sceneNames[currentScene];
    }
}