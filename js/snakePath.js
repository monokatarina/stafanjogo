import * as THREE from 'three';

export class SnakePath {
    constructor(scene) {
        this.scene = scene;
        this.pathPoints = [];
        this.pathMesh = null;
        this.pathVisible = true;
        this.snakeMode = false;
        this.startPoint = null;
        this.endPoint = null;
        
        this.createPathPoints();
    }
    
    createPathPoints() {
        // Criar pontos em formato de S (serpente)
        for (let i = 0; i <= 20; i++) {
            const t = i / 20;
            const x = (t - 0.5) * 15;
            const y = 0.1;
            const z = Math.sin(t * Math.PI * 4) * 3;
            this.pathPoints.push(new THREE.Vector3(x, y, z));
        }
        
        this.createPathVisualization();
        this.createPathMarkers();
    }
    
    createPathVisualization() {
        const points = this.pathPoints.map(p => [p.x, p.y, p.z]).flat();
        const indices = [];
        
        for (let i = 0; i < this.pathPoints.length - 1; i++) {
            indices.push(i, i + 1);
        }
        
        const geometry = new THREE.BufferGeometry();
        geometry.setAttribute('position', new THREE.Float32BufferAttribute(points, 3));
        geometry.setIndex(indices);
        
        const material = new THREE.LineBasicMaterial({ color: 0xffaa00, linewidth: 3 });
        this.pathMesh = new THREE.LineSegments(geometry, material);
        this.scene.add(this.pathMesh);
        
        // Adicionar tubo mais grosso para melhor visualização
        const tubePoints = this.pathPoints.map(p => new THREE.Vector3(p.x, p.y + 0.05, p.z));
        const tubeGeometry = new THREE.TubeGeometry(
            new THREE.CatmullRomCurve3(tubePoints),
            64, 0.1, 8, false
        );
        const tubeMaterial = new THREE.MeshStandardMaterial({ 
            color: 0xffaa00,
            emissive: 0x442200,
            transparent: true,
            opacity: 0.3
        });
        this.tubeMesh = new THREE.Mesh(tubeGeometry, tubeMaterial);
        this.scene.add(this.tubeMesh);
    }
    
    createPathMarkers() {
        // Adicionar marcadores nos pontos do caminho
        this.markers = [];
        this.pathPoints.forEach((point, index) => {
            const sphereGeo = new THREE.SphereGeometry(0.15, 16, 16);
            const sphereMat = new THREE.MeshStandardMaterial({ 
                color: index % 2 === 0 ? 0x00ff00 : 0xffaa00,
                emissive: 0x222222
            });
            const sphere = new THREE.Mesh(sphereGeo, sphereMat);
            sphere.position.copy(point);
            sphere.position.y += 0.15;
            this.scene.add(sphere);
            this.markers.push(sphere);
        });
    }
    
    togglePath() {
        this.pathVisible = !this.pathVisible;
        if (this.pathMesh) this.pathMesh.visible = this.pathVisible;
        if (this.tubeMesh) this.tubeMesh.visible = this.pathVisible;
        this.markers.forEach(m => m.visible = this.pathVisible);
    }
    
    toggleSnakeMode() {
        this.snakeMode = !this.snakeMode;
        if (this.snakeMode) {
            // Mudar cor para indicar modo ativo
            if (this.tubeMesh) {
                this.tubeMesh.material.color.setHex(0xff5500);
                this.tubeMesh.material.emissive.setHex(0x442200);
            }
        } else {
            if (this.tubeMesh) {
                this.tubeMesh.material.color.setHex(0xffaa00);
                this.tubeMesh.material.emissive.setHex(0x442200);
            }
        }
        return this.snakeMode;
    }
    
    getNearestPoint(position) {
        let nearest = this.pathPoints[0];
        let minDist = Infinity;
        
        this.pathPoints.forEach(point => {
            const dist = position.distanceTo(point);
            if (dist < minDist) {
                minDist = dist;
                nearest = point;
            }
        });
        
        return nearest;
    }
    
    attractToPath(body) {
        if (!this.snakeMode) return;
        
        const pos = new THREE.Vector3().copy(body.position);
        const target = this.getNearestPoint(pos);
        
        // Força de atração suave para o caminho
        const direction = new THREE.Vector3().subVectors(target, pos);
        const distance = direction.length();
        
        if (distance > 0.1) {
            direction.normalize();
            const force = direction.multiplyScalar(Math.min(distance * 2, 5));
            
            body.velocity.x += force.x * 0.1;
            body.velocity.z += force.z * 0.1;
            
            // Reduzir velocidade quando próximo ao alvo
            if (distance < 1) {
                body.velocity.x *= 0.95;
                body.velocity.z *= 0.95;
            }
        }
    }
    
    resetToPath(body) {
        if (!this.snakeMode) return;
        
        const pos = new THREE.Vector3().copy(body.position);
        const target = this.getNearestPoint(pos);
        
        // Teletransportar para o ponto mais próximo do caminho
        body.position.copy(target);
        body.position.y = 0.5;
        
        // Parar movimento
        body.velocity.set(0, 0, 0);
        body.angularVelocity.set(0, 0, 0);
    }
}