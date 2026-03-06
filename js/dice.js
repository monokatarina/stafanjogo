import * as THREE from 'three';

export function createNumberTexture(number, isPurple = false) {
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 256;
    const ctx = canvas.getContext('2d');

    if (isPurple) {
        ctx.fillStyle = '#1a1a1a';
        ctx.fillRect(0, 0, 256, 256);
        ctx.strokeStyle = '#aa00ff';
        ctx.lineWidth = 8;
        ctx.strokeRect(4, 4, 248, 248);
        ctx.fillStyle = '#ff5555';
        ctx.font = 'Bold 120px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(`${number}`, 128, 128);
    } else {
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, 256, 256);
        ctx.strokeStyle = '#0066cc';
        ctx.lineWidth = 8;
        ctx.strokeRect(4, 4, 248, 248);
        ctx.fillStyle = '#0066cc';
        ctx.font = 'Bold 120px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(number, 128, 128);
    }

    return new THREE.CanvasTexture(canvas);
}

export function createDiceMeshes() {
    const diceGeo = new THREE.BoxGeometry(1, 1, 1);
    
    // Dado Azul
    const materials1 = [
        new THREE.MeshStandardMaterial({ map: createNumberTexture(1, false) }),
        new THREE.MeshStandardMaterial({ map: createNumberTexture(2, false) }),
        new THREE.MeshStandardMaterial({ map: createNumberTexture(3, false) }),
        new THREE.MeshStandardMaterial({ map: createNumberTexture(4, false) }),
        new THREE.MeshStandardMaterial({ map: createNumberTexture(5, false) }),
        new THREE.MeshStandardMaterial({ map: createNumberTexture(6, false) })
    ];
    
    // Dado Roxo
    const materials2 = [
        new THREE.MeshStandardMaterial({ map: createNumberTexture(1, true) }),
        new THREE.MeshStandardMaterial({ map: createNumberTexture(2, true) }),
        new THREE.MeshStandardMaterial({ map: createNumberTexture(3, true) }),
        new THREE.MeshStandardMaterial({ map: createNumberTexture(4, true) }),
        new THREE.MeshStandardMaterial({ map: createNumberTexture(5, true) }),
        new THREE.MeshStandardMaterial({ map: createNumberTexture(6, true) })
    ];

    const dice1 = new THREE.Mesh(diceGeo, materials1);
    const dice2 = new THREE.Mesh(diceGeo, materials2);
    
    return { dice1, dice2 };
}