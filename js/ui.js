export function setupUI(snakePath, diceManager) {
    // Criar botões de controle do caminho
    const pathControls = document.createElement('div');
    pathControls.className = 'path-controls';
    
    const togglePathBtn = document.createElement('button');
    togglePathBtn.className = 'path-btn';
    togglePathBtn.innerHTML = '👁️ Mostrar/Esconder Caminho';
    togglePathBtn.onclick = () => snakePath.togglePath();
    
    const snakeModeBtn = document.createElement('button');
    snakeModeBtn.className = 'path-btn';
    snakeModeBtn.innerHTML = '🐍 Modo Serpente: OFF';
    snakeModeBtn.onclick = () => {
        const active = snakePath.toggleSnakeMode();
        snakeModeBtn.innerHTML = active ? '🐍 Modo Serpente: ON' : '🐍 Modo Serpente: OFF';
        snakeModeBtn.style.background = active ? '#ffaa00' : '#444';
        snakeModeBtn.style.color = active ? '#000' : '#fff';
    };
    
    const resetPathBtn = document.createElement('button');
    resetPathBtn.className = 'path-btn';
    resetPathBtn.innerHTML = '🎯 Alinhar ao Caminho';
    resetPathBtn.onclick = () => {
        if (diceManager.body1 && diceManager.body2) {
            snakePath.resetToPath(diceManager.body1);
            snakePath.resetToPath(diceManager.body2);
        }
    };
    
    pathControls.appendChild(togglePathBtn);
    pathControls.appendChild(snakeModeBtn);
    pathControls.appendChild(resetPathBtn);
    document.body.appendChild(pathControls);
    
    return { togglePathBtn, snakeModeBtn, resetPathBtn };
}

export function updateStatus(text, color = '#00aaff') {
    const status = document.getElementById('status');
    status.innerHTML = text;
    status.style.color = color;
    status.style.borderColor = color;
}

export function updateCoordinates(pos) {
    const coordsElement = document.getElementById('coordinates');
    if (coordsElement) {
        coordsElement.innerHTML = `X: ${pos.x.toFixed(2)} | Y: ${pos.y.toFixed(2)} | Z: ${pos.z.toFixed(2)}`;
    }
}