import * as THREE from 'three';
import * as CANNON from 'cannon-es';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { createPhysicsWorld, createGround, createDiceBody } from './physics.js';
import { createDiceMeshes } from './dice.js';
import { SnakePath } from './snakePath.js';
import { setupUI, updateStatus, updateCoordinates } from './ui.js';

// Configuração da cena
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x1a1a1a);

const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(6, 4, 8);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
document.body.appendChild(renderer.domElement);

// Controles de câmera
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.target.set(0, 1, 0);

// Iluminação
const light = new THREE.DirectionalLight(0xffffff, 1);
light.position.set(5, 10, 5);
light.castShadow = true;
scene.add(light);
scene.add(new THREE.AmbientLight(0x404060));

// Física
const { world, diceMaterial, groundMaterial } = createPhysicsWorld();
createGround(world, groundMaterial);

// Criar dados
const { dice1, dice2 } = createDiceMeshes();
dice1.castShadow = true;
dice1.receiveShadow = true;
dice2.castShadow = true;
dice2.receiveShadow = true;
scene.add(dice1);
scene.add(dice2);

// Corpos físicos
const body1 = createDiceBody(world, -2, 3, 0, diceMaterial);
const body2 = createDiceBody(world, 2, 3, 0, diceMaterial);

// Chão visual
const groundGeo = new THREE.PlaneGeometry(20, 20);
const groundMat = new THREE.MeshStandardMaterial({ color: 0x333333 });
const groundMesh = new THREE.Mesh(groundGeo, groundMat);
groundMesh.rotation.x = -Math.PI / 2;
groundMesh.receiveShadow = true;
scene.add(groundMesh);

const gridHelper = new THREE.GridHelper(20, 20, 0x00aaff, 0x444444);
gridHelper.position.y = 0.01;
scene.add(gridHelper);

// Criar caminho de serpente
const snakePath = new SnakePath(scene);

// Gerenciador de dados para UI
const diceManager = { body1, body2 };

// Configurar UI
setupUI(snakePath, diceManager);

// Sistema de arrasto
let dragging = false;
let currentBody = null;
let currentMesh = null;
let currentButton = null;
let dragPlane = new THREE.Plane();
let dragOffset = new THREE.Vector3();
let startPoint = new THREE.Vector3();

const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

function onMouseDown(event) {
    event.preventDefault();
    
    mouse.x = (event.clientX / renderer.domElement.clientWidth) * 2 - 1;
    mouse.y = -(event.clientY / renderer.domElement.clientHeight) * 2 + 1;
    
    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObjects([dice1, dice2]);
    
    if (intersects.length > 0) {
        const hit = intersects[0];
        
        dragging = true;
        controls.enabled = false;
        
        if (hit.object === dice1) {
            currentBody = body1;
            currentMesh = dice1;
            currentButton = document.getElementById('rollBtn1');
            updateStatus('✋ Arrastando DADO AZUL', '#0066cc');
        } else {
            currentBody = body2;
            currentMesh = dice2;
            currentButton = document.getElementById('rollBtn2');
            updateStatus('✋ Arrastando DADO ROXO', '#9900cc');
        }
        
        currentButton.disabled = true;
        
        currentBody.mass = 0;
        currentBody.updateMassProperties();
        currentBody.velocity.set(0, 0, 0);
        currentBody.angularVelocity.set(0, 0, 0);
        
        startPoint.copy(hit.point);
        
        const cameraDir = camera.getWorldDirection(new THREE.Vector3());
        dragPlane.setFromNormalAndCoplanarPoint(cameraDir, startPoint);
        
        dragOffset.copy(currentBody.position).sub(new THREE.Vector3(hit.point.x, hit.point.y, hit.point.z));
    }
}

function onMouseMove(event) {
    if (!dragging) return;
    event.preventDefault();
    
    mouse.x = (event.clientX / renderer.domElement.clientWidth) * 2 - 1;
    mouse.y = -(event.clientY / renderer.domElement.clientHeight) * 2 + 1;
    
    raycaster.setFromCamera(mouse, camera);
    const targetPoint = new THREE.Vector3();
    
    if (raycaster.ray.intersectPlane(dragPlane, targetPoint)) {
        targetPoint.add(dragOffset);
        
        targetPoint.x = Math.max(-8, Math.min(8, targetPoint.x));
        targetPoint.y = Math.max(0.2, Math.min(6, targetPoint.y));
        targetPoint.z = Math.max(-8, Math.min(8, targetPoint.z));
        
        currentBody.position.copy(targetPoint);
        updateCoordinates(targetPoint);
    }
}

function onMouseUp(event) {
    if (dragging) {
        currentBody.mass = 1;
        currentBody.updateMassProperties();
        
        currentBody.velocity.set(
            (Math.random() - 0.5) * 2,
            (Math.random() - 0.5) * 1,
            (Math.random() - 0.5) * 2
        );
        currentBody.angularVelocity.set(
            (Math.random() - 0.5) * 5,
            (Math.random() - 0.5) * 5,
            (Math.random() - 0.5) * 5
        );
        
        currentButton.disabled = false;
        
        dragging = false;
        currentBody = null;
        currentMesh = null;
        currentButton = null;
        controls.enabled = true;
        
        updateStatus('👆 Arraste os dados', '#00aaff');
    }
}

// Eventos de mouse
renderer.domElement.addEventListener('mousedown', onMouseDown);
window.addEventListener('mousemove', onMouseMove);
window.addEventListener('mouseup', onMouseUp);

// Eventos de touch
renderer.domElement.addEventListener('touchstart', (e) => {
    e.preventDefault();
    const touch = e.touches[0];
    mouse.x = (touch.clientX / renderer.domElement.clientWidth) * 2 - 1;
    mouse.y = -(touch.clientY / renderer.domElement.clientHeight) * 2 + 1;
    onMouseDown(e);
});

window.addEventListener('touchmove', (e) => {
    e.preventDefault();
    const touch = e.touches[0];
    mouse.x = (touch.clientX / renderer.domElement.clientWidth) * 2 - 1;
    mouse.y = -(touch.clientY / renderer.domElement.clientHeight) * 2 + 1;
    onMouseMove(e);
});

window.addEventListener('touchend', onMouseUp);
window.addEventListener('touchcancel', onMouseUp);

// Função para jogar dado
function throwDice(body, offsetX) {
    if (dragging) return;
    
    body.position.set(offsetX, 8, 0);
    
    body.velocity.set(
        (Math.random() - 0.5) * 3,
        7 + Math.random() * 3,
        (Math.random() - 0.5) * 5
    );
    
    body.angularVelocity.set(
        (Math.random() - 0.5) * 25,
        (Math.random() - 0.5) * 25,
        (Math.random() - 0.5) * 25
    );
    
    body.quaternion.set(
        Math.random() * Math.PI * 2,
        Math.random() * Math.PI * 2,
        Math.random() * Math.PI * 2,
        1
    );
}

// Botões
document.getElementById('rollBtn1').addEventListener('click', () => {
    throwDice(body1, -2);
});

document.getElementById('rollBtn2').addEventListener('click', () => {
    throwDice(body2, 2);
});

// Animação
function animate() {
    requestAnimationFrame(animate);

    if (!dragging) {
        world.step(1/60);
        
        // Aplicar atração do caminho de serpente
        snakePath.attractToPath(body1);
        snakePath.attractToPath(body2);
    }

    // Sincroniza posições e rotações
    dice1.position.copy(body1.position);
    dice1.quaternion.copy(body1.quaternion);
    
    dice2.position.copy(body2.position);
    dice2.quaternion.copy(body2.quaternion);

    if (!dragging && body1) {
        updateCoordinates(body1.position);
    }

    controls.update();
    renderer.render(scene, camera);
}

animate();

// Resize
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

// Lançamento inicial
setTimeout(() => {
    throwDice(body1, -2);
    throwDice(body2, 2);
}, 500);