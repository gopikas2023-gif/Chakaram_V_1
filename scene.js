/**
 * 3D Scene Builder for Chakaram Game (Three.js)
 * Enhanced with:
 * - Dynamic 5x5 and 7x7 Matrix Game Board Builder
 * - Zero-Overlap Multi-Coin Tile Layout Engine
 * - Smooth Parabolic 3D Hopping with Ease Transitions
 * - Ludo-style Unsafe Zone Kill / Capture Mechanics
 * - Elegant Chola Brass Thamboolam Tray & Solid Cowrie Shells
 * - Temple Mandapam Environment & Kuthuvilakku Lamps
 */

class Chakaram3DScene {
    constructor(container) {
        this.container = container;
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.controls = null;
        
        // 3D Objects
        this.boardGroup = null;
        this.tiles = []; // Matrix of tile meshes
        this.tileMaterials = [];
        this.lamps = [];
        this.flames = [];
        this.pawnMap = new Map(); // coinId -> pawnGroup mesh
        
        // Chozhi (Cowrie Shells)
        this.chozhiGroup = null;
        this.chozhiShells = [];
        this.isRollingChozhi = false;
        this.targetShellStates = [];
        this.chozhiTrayMesh = null;
        
        // State
        this.selectedCell = null;
        this.hoveredCell = null;
        this.currentTheme = 'granite';
        this.currentAtmosphere = 'night';
        this.isCoinAnimating = false;
        this.matrixSize = 5;
        
        // Raycaster
        this.raycaster = new THREE.Raycaster();
        this.mouse = new THREE.Vector2();
        
        // Callbacks
        this.onCellSelected = null;
        this.onCellHovered = null;
        this.onPawnClicked = null;
        this.onChozhiRolled = null;

        window.chakaramScene = this;
        this.init();
    }

    init() {
        // 1. Scene setup
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x0a0908);
        this.scene.fog = new THREE.FogExp2(0x0a0908, 0.024);

        // 2. Camera setup
        const aspect = this.container.clientWidth / this.container.clientHeight;
        this.camera = new THREE.PerspectiveCamera(45, aspect, 0.1, 100);
        this.camera.position.set(-5.5, 7.8, 9.2);

        // 3. Renderer setup
        this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
        this.renderer.setSize(this.container.clientWidth, this.container.clientHeight);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
        this.renderer.toneMappingExposure = 1.15;
        this.container.appendChild(this.renderer.domElement);

        // 4. Orbit Controls
        if (THREE.OrbitControls) {
            this.controls = new THREE.OrbitControls(this.camera, this.renderer.domElement);
            this.controls.enableDamping = true;
            this.controls.dampingFactor = 0.05;
            this.controls.maxPolarAngle = Math.PI / 2 - 0.05;
            this.controls.minDistance = 4;
            this.controls.maxDistance = 28;
            this.controls.target.set(0.5, 0.5, 0);
        }

        // 5. Build Scene Objects
        this.buildTempleEnvironment();
        this.buildMatrixBoard(5);
        this.buildStartingPawns();
        this.buildKuthuvilakkuLamps();
        this.buildChozhiDice();
        this.setupLighting();

        // 6. Event listeners
        window.addEventListener('resize', this.onResize.bind(this));
        this.renderer.domElement.addEventListener('mousemove', this.onMouseMove.bind(this));
        this.renderer.domElement.addEventListener('click', this.onPointerClick.bind(this));

        // 7. Start render loop
        this.animate = this.animate.bind(this);
        requestAnimationFrame(this.animate);
    }

    // --- TEMPLE MANDAPAM ENVIRONMENT ---
    buildTempleEnvironment() {
        const floorGeo = new THREE.PlaneGeometry(38, 38);
        const kolamCanvas = ProceduralTextures.createKolamFloorTexture(1024);
        const floorTex = new THREE.CanvasTexture(kolamCanvas);
        floorTex.wrapS = THREE.RepeatWrapping;
        floorTex.wrapT = THREE.RepeatWrapping;

        const floorMat = new THREE.MeshStandardMaterial({
            map: floorTex,
            roughness: 0.85,
            metalness: 0.15
        });

        const floor = new THREE.Mesh(floorGeo, floorMat);
        floor.rotation.x = -Math.PI / 2;
        floor.position.y = 0;
        floor.receiveShadow = true;
        this.scene.add(floor);

        const pillarCanvas = ProceduralTextures.createPillarTexture(256, 512);
        const pillarTex = new THREE.CanvasTexture(pillarCanvas);
        const pillarMat = new THREE.MeshStandardMaterial({
            map: pillarTex,
            roughness: 0.9,
            metalness: 0.2
        });

        const pillarPositions = [
            [-9.5, -9.0], [9.5, -9.0],
            [-9.5, 9.0], [9.5, 9.0],
            [-9.5, 0], [9.5, 0]
        ];

        pillarPositions.forEach(([px, pz]) => {
            const pillarGroup = new THREE.Group();

            const baseGeo = new THREE.BoxGeometry(1.6, 0.6, 1.6);
            const baseMesh = new THREE.Mesh(baseGeo, pillarMat);
            baseMesh.position.y = 0.3;
            baseMesh.castShadow = true;
            baseMesh.receiveShadow = true;
            pillarGroup.add(baseMesh);

            const shaftGeo = new THREE.BoxGeometry(1.1, 10, 1.1);
            const shaftMesh = new THREE.Mesh(shaftGeo, pillarMat);
            shaftMesh.position.y = 5.3;
            shaftMesh.castShadow = true;
            shaftMesh.receiveShadow = true;
            pillarGroup.add(shaftMesh);

            const capGeo = new THREE.BoxGeometry(2.0, 0.8, 2.0);
            const capMesh = new THREE.Mesh(capGeo, pillarMat);
            capMesh.position.y = 10.4;
            capMesh.castShadow = true;
            pillarGroup.add(capMesh);

            pillarGroup.position.set(px, 0, pz);
            this.scene.add(pillarGroup);
        });

        const wallGeo = new THREE.BoxGeometry(38, 12, 1);
        const wallMat = new THREE.MeshStandardMaterial({
            map: floorTex,
            roughness: 0.9,
            color: 0x22201d
        });
        const backWall = new THREE.Mesh(wallGeo, wallMat);
        backWall.position.set(0, 6, -14);
        backWall.receiveShadow = true;
        this.scene.add(backWall);
    }

    // --- MATRIX GAME BOARD (5x5 or 7x7) ---
    buildMatrixBoard(matrixSize = 5) {
        if (this.boardGroup) this.scene.remove(this.boardGroup);

        this.matrixSize = matrixSize;
        this.boardGroup = new THREE.Group();

        const tileSize = matrixSize === 5 ? 1.35 : 1.05;
        const tileGap = 0.05;
        const tileThickness = 0.18;
        const baseWidth = matrixSize * (tileSize + tileGap) + 0.6;
        const baseHeight = 0.45;

        const peedamGeo = new THREE.BoxGeometry(baseWidth, baseHeight, baseWidth);
        const graniteCanvas = ProceduralTextures.createGraniteTexture(512, 512, this.currentTheme);
        const graniteTex = new THREE.CanvasTexture(graniteCanvas);
        
        const peedamMat = new THREE.MeshStandardMaterial({
            map: graniteTex,
            roughness: 0.75,
            metalness: 0.25
        });
        const peedam = new THREE.Mesh(peedamGeo, peedamMat);
        peedam.position.y = baseHeight / 2;
        peedam.receiveShadow = true;
        peedam.castShadow = true;
        this.boardGroup.add(peedam);

        const rimGeo = new THREE.BoxGeometry(baseWidth + 0.12, 0.08, baseWidth + 0.12);
        const goldMat = new THREE.MeshStandardMaterial({
            color: 0xd4af37,
            roughness: 0.35,
            metalness: 0.85
        });
        const rimMesh = new THREE.Mesh(rimGeo, goldMat);
        rimMesh.position.y = baseHeight;
        this.boardGroup.add(rimMesh);

        const startOffset = -((matrixSize - 1) / 2) * (tileSize + tileGap);

        this.tiles = [];
        this.tileMaterials = [];

        for (let row = 0; row < matrixSize; row++) {
            this.tiles[row] = [];
            for (let col = 0; col < matrixSize; col++) {
                const tileCanvas = ProceduralTextures.createTileTexture(row, col, false, this.currentTheme, matrixSize);
                const tileTex = new THREE.CanvasTexture(tileCanvas);

                const topMat = new THREE.MeshStandardMaterial({
                    map: tileTex,
                    roughness: 0.68,
                    metalness: 0.18
                });

                const sideMat = new THREE.MeshStandardMaterial({
                    map: graniteTex,
                    roughness: 0.85,
                    metalness: 0.2
                });

                const mats = [sideMat, sideMat, topMat, sideMat, sideMat, sideMat];
                this.tileMaterials.push({ row, col, topMat, tileTex });

                const tileGeo = new THREE.BoxGeometry(tileSize, tileThickness, tileSize);
                const tileMesh = new THREE.Mesh(tileGeo, mats);

                const posX = startOffset + col * (tileSize + tileGap);
                const posZ = startOffset + row * (tileSize + tileGap);
                const posY = baseHeight + tileThickness / 2;

                tileMesh.position.set(posX, posY, posZ);
                tileMesh.castShadow = true;
                tileMesh.receiveShadow = true;

                tileMesh.userData = {
                    row,
                    col,
                    index: row * matrixSize + col + 1,
                    baseY: posY
                };

                this.boardGroup.add(tileMesh);
                this.tiles[row][col] = tileMesh;
            }
        }

        this.scene.add(this.boardGroup);
    }

    // --- DYNAMIC ZERO-OVERLAP TILE COIN LAYOUT ENGINE ---
    layoutCoinsOnTile(tile) {
        if (!tile) return;

        const pawns = tile.children.filter(c => c.userData && c.userData.isPawn);
        const count = pawns.length;
        if (count === 0) return;

        let layoutOffsets = [];
        if (count === 1) {
            layoutOffsets = [[0, 0]];
        } else if (count === 2) {
            layoutOffsets = [[-0.24, 0], [0.24, 0]];
        } else if (count === 3) {
            layoutOffsets = [
                [0, -0.22],
                [-0.23, 0.20],
                [0.23, 0.20]
            ];
        } else if (count === 4) {
            layoutOffsets = [
                [-0.24, -0.24],
                [0.24, -0.24],
                [-0.24, 0.24],
                [0.24, 0.24]
            ];
        } else {
            for (let i = 0; i < count; i++) {
                const angle = (i * Math.PI * 2) / count;
                layoutOffsets.push([Math.cos(angle) * 0.30, Math.sin(angle) * 0.30]);
            }
        }

        pawns.forEach((pawn, idx) => {
            const [ox, oz] = layoutOffsets[idx] || [0, 0];
            pawn.position.set(ox, 0.09, oz);
        });
    }

    // --- 4 PLAYERS x 4 COINS = 16 HARDWOOD PAWNS ---
    buildStartingPawns() {
        this.pawnMap.forEach(p => { if (p.parent) p.parent.remove(p); });
        this.pawnMap.clear();

        const woodTypes = ['teak', 'rosewood', 'sandalwood', 'cedar'];
        const woodMaterials = woodTypes.map(type => {
            const canvas = ProceduralTextures.createWoodTexture(type, 512, 512);
            return new THREE.MeshStandardMaterial({
                map: new THREE.CanvasTexture(canvas),
                roughness: 0.38,
                metalness: 0.04
            });
        });

        const engine = window.chakaramEngine;
        if (!engine) return;

        engine.players.forEach((playerObj, idx) => {
            const mat = woodMaterials[playerObj.woodIdx || idx];
            const tile = this.tiles[playerObj.homeRow][playerObj.homeCol];

            for (let pIdx = 0; pIdx < 4; pIdx++) {
                const pawnGroup = new THREE.Group();
                const coinId = `${playerObj.id}_${pIdx}`;

                if (idx === 0) {
                    const baseGeo = new THREE.CylinderGeometry(0.10, 0.16, 0.20, 18);
                    const base = new THREE.Mesh(baseGeo, mat);
                    base.position.y = 0.10; base.castShadow = true; pawnGroup.add(base);
                    const topGeo = new THREE.CylinderGeometry(0.15, 0.09, 0.18, 18);
                    const top = new THREE.Mesh(topGeo, mat);
                    top.position.y = 0.29; top.castShadow = true; pawnGroup.add(top);
                } else if (idx === 1) {
                    const bodyGeo = new THREE.CylinderGeometry(0.09, 0.16, 0.28, 18);
                    const body = new THREE.Mesh(bodyGeo, mat);
                    body.position.y = 0.14; body.castShadow = true; pawnGroup.add(body);
                    const knobGeo = new THREE.SphereGeometry(0.11, 16, 14);
                    const knob = new THREE.Mesh(knobGeo, mat);
                    knob.position.y = 0.32; knob.castShadow = true; pawnGroup.add(knob);
                } else {
                    const bodyGeo = new THREE.CylinderGeometry(0.13, 0.16, 0.24, 18);
                    const body = new THREE.Mesh(bodyGeo, mat);
                    body.position.y = 0.12; body.castShadow = true; pawnGroup.add(body);
                    const domeGeo = new THREE.SphereGeometry(0.13, 16, 12, 0, Math.PI * 2, 0, Math.PI / 2);
                    const dome = new THREE.Mesh(domeGeo, mat);
                    dome.position.y = 0.24; dome.castShadow = true; pawnGroup.add(dome);
                }

                // Glowing Selection Aura
                const ringGeo = new THREE.RingGeometry(0.18, 0.26, 24);
                ringGeo.rotateX(-Math.PI / 2);
                const ringMat = new THREE.MeshBasicMaterial({
                    color: 0xffd700,
                    side: THREE.DoubleSide,
                    transparent: true,
                    opacity: 0
                });
                const selectionRing = new THREE.Mesh(ringGeo, ringMat);
                selectionRing.position.y = 0.01;
                pawnGroup.add(selectionRing);

                pawnGroup.userData = {
                    isPawn: true,
                    coinId: coinId,
                    playerId: playerObj.id,
                    playerName: playerObj.name,
                    pawnIndex: pIdx,
                    homeRow: playerObj.homeRow,
                    homeCol: playerObj.homeCol,
                    currentTile: tile,
                    selectionRing: selectionRing,
                    isMovable: false
                };

                tile.add(pawnGroup);
                this.pawnMap.set(coinId, pawnGroup);
            }

            this.layoutCoinsOnTile(tile);
        });
    }

    // --- SLEEK BRASS THAMBOOLAM TRAY & COWRIE SHELLS ---
    buildChozhiDice() {
        if (this.chozhiGroup) this.scene.remove(this.chozhiGroup);

        this.chozhiGroup = new THREE.Group();

        const trayRadius = 2.0;
        const trayBaseGeo = new THREE.CylinderGeometry(trayRadius, trayRadius * 0.92, 0.28, 36);
        const brassMat = new THREE.MeshStandardMaterial({
            color: 0xd4af37,
            roughness: 0.25,
            metalness: 0.90
        });
        this.chozhiTrayMesh = new THREE.Mesh(trayBaseGeo, brassMat);
        this.chozhiTrayMesh.position.y = 0.14;
        this.chozhiTrayMesh.receiveShadow = true;
        this.chozhiTrayMesh.castShadow = true;
        this.chozhiGroup.add(this.chozhiTrayMesh);

        const trayRimGeo = new THREE.TorusGeometry(trayRadius - 0.04, 0.09, 16, 40);
        trayRimGeo.rotateX(Math.PI / 2);
        const trayRim = new THREE.Mesh(trayRimGeo, brassMat);
        trayRim.position.y = 0.28;
        this.chozhiGroup.add(trayRim);

        const velvetGeo = new THREE.CylinderGeometry(trayRadius - 0.14, trayRadius - 0.14, 0.05, 36);
        const velvetMat = new THREE.MeshStandardMaterial({
            color: 0x731a1a,
            roughness: 0.95,
            metalness: 0.02
        });
        const velvetMesh = new THREE.Mesh(velvetGeo, velvetMat);
        velvetMesh.position.y = 0.27;
        velvetMesh.receiveShadow = true;
        this.chozhiGroup.add(velvetMesh);

        const shellTextureCanvas = ProceduralTextures.createCompleteChozhiTexture(1024, 512);
        const shellTex = new THREE.CanvasTexture(shellTextureCanvas);
        shellTex.wrapS = THREE.ClampToEdgeWrapping;
        shellTex.wrapT = THREE.ClampToEdgeWrapping;

        const solidShellMaterial = new THREE.MeshStandardMaterial({
            map: shellTex,
            roughness: 0.14,
            metalness: 0.04
        });

        const baseSphere = new THREE.SphereGeometry(0.44, 32, 24);
        const posAttr = baseSphere.attributes.position;
        const uvAttr = baseSphere.attributes.uv;

        for (let i = 0; i < posAttr.count; i++) {
            let px = posAttr.getX(i);
            let py = posAttr.getY(i);
            let pz = posAttr.getZ(i);

            px *= 1.55; pz *= 0.92;
            const taper = Math.max(0.25, 1.0 - Math.pow(Math.abs(px) / 0.75, 2) * 0.42);
            py *= taper; pz *= taper;

            if (py >= 0) {
                const distFromCenterSlit = Math.abs(pz);
                if (distFromCenterSlit < 0.16) py = py * 0.22 - 0.04 * (1.0 - distFromCenterSlit / 0.16);
                else py = py * 0.52;
            } else py = py * 0.82;

            posAttr.setXYZ(i, px, py, pz);

            const u = (px / 1.55 + 0.46) / 0.92;
            let v = 0.5;
            if (py >= 0) v = 0.5 + Math.min(0.5, Math.abs(pz) / 0.46 * 0.5);
            else v = 0.5 - Math.min(0.5, Math.abs(py) / 0.46 * 0.5);

            uvAttr.setXY(i, Math.max(0, Math.min(1, u)), Math.max(0, Math.min(1, v)));
        }

        baseSphere.computeVertexNormals();

        this.chozhiShells = [];
        const shellPositions = [
            [-0.75, -0.50], [0.0, -0.58], [0.75, -0.50],
            [-0.75, 0.50], [0.0, 0.58], [0.75, 0.50]
        ];

        for (let i = 0; i < 6; i++) {
            const shellMesh = new THREE.Mesh(baseSphere.clone(), solidShellMaterial);
            const [sx, sz] = shellPositions[i];

            shellMesh.position.set(sx, 0.30, sz);
            shellMesh.castShadow = true;
            shellMesh.receiveShadow = true;

            const isUpViewing = i < 3;
            shellMesh.rotation.x = isUpViewing ? 0 : Math.PI;
            shellMesh.rotation.y = (Math.random() - 0.5) * 0.4 + (i * Math.PI) / 3;

            shellMesh.userData = { index: i, baseX: sx, baseZ: sz, baseY: 0.30, isUpViewing };

            this.chozhiGroup.add(shellMesh);
            this.chozhiShells.push(shellMesh);
        }

        this.chozhiGroup.position.set(5.3, 0, 0);
        this.scene.add(this.chozhiGroup);
    }

    setMovableCoins(legalMoves) {
        this.pawnMap.forEach(pawn => {
            pawn.userData.isMovable = false;
            pawn.userData.selectionRing.material.opacity = 0;
        });

        if (!legalMoves || legalMoves.length === 0) return;

        legalMoves.forEach(move => {
            const pawn = this.pawnMap.get(move.coin.id);
            if (pawn) {
                pawn.userData.isMovable = true;
                pawn.userData.legalMove = move;
                pawn.userData.selectionRing.material.opacity = 0.85;
            }
        });
    }

    // Smooth Multi-Step Parabolic 3D Hopping
    animatePawnMovement(coinId, hopPath, capturedCoin, isGoal, onComplete) {
        const pawn = this.pawnMap.get(coinId);
        if (!pawn || hopPath.length === 0) {
            if (onComplete) onComplete();
            return;
        }

        this.isCoinAnimating = true;
        this.setMovableCoins([]);

        const originTile = pawn.userData.currentTile;
        let currentHopIdx = 0;

        const executeSingleHop = () => {
            if (currentHopIdx >= hopPath.length) {
                const finalCoord = hopPath[hopPath.length - 1];
                const finalTile = this.tiles[finalCoord.r][finalCoord.c];

                finalTile.attach(pawn);
                pawn.userData.currentTile = finalTile;

                this.layoutCoinsOnTile(originTile);
                this.layoutCoinsOnTile(finalTile);

                if (isGoal) this.animateCrownedPawn(pawn);

                if (capturedCoin) {
                    this.animateCapturedPawn(capturedCoin.id, () => {
                        this.layoutCoinsOnTile(finalTile);
                        this.isCoinAnimating = false;
                        if (onComplete) onComplete();
                    });
                } else {
                    this.isCoinAnimating = false;
                    if (onComplete) onComplete();
                }
                return;
            }

            const nextCoord = hopPath[currentHopIdx];
            const nextTile = this.tiles[nextCoord.r][nextCoord.c];

            this.scene.attach(pawn);

            const startPos = pawn.position.clone();
            const targetPos = new THREE.Vector3(
                nextTile.position.x,
                nextTile.position.y + 0.18,
                nextTile.position.z
            );

            const hopDuration = 240;
            const startTime = performance.now();

            const hopStep = (now) => {
                const elapsed = now - startTime;
                const progress = Math.min(1.0, elapsed / hopDuration);
                const t = progress;
                const ease = t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;

                const hopArc = Math.sin(progress * Math.PI) * 0.45;
                pawn.position.x = THREE.MathUtils.lerp(startPos.x, targetPos.x, ease);
                pawn.position.z = THREE.MathUtils.lerp(startPos.z, targetPos.z, ease);
                pawn.position.y = THREE.MathUtils.lerp(startPos.y, targetPos.y, ease) + hopArc;

                if (progress < 1.0) {
                    requestAnimationFrame(hopStep);
                } else {
                    pawn.position.copy(targetPos);
                    if (window.templeAudio) window.templeAudio.playStoneClack();
                    currentHopIdx++;
                    setTimeout(executeSingleHop, 25);
                }
            };

            requestAnimationFrame(hopStep);
        };

        executeSingleHop();
    }

    animateCapturedPawn(capturedCoinId, onComplete) {
        const pawn = this.pawnMap.get(capturedCoinId);
        if (!pawn) { if (onComplete) onComplete(); return; }

        if (window.templeAudio) window.templeAudio.playCaptureSound();

        const homeTile = this.tiles[pawn.userData.homeRow][pawn.userData.homeCol];
        this.scene.attach(pawn);

        const startPos = pawn.position.clone();
        const targetPos = new THREE.Vector3(
            homeTile.position.x,
            homeTile.position.y + 0.18,
            homeTile.position.z
        );

        const duration = 550;
        const startTime = performance.now();

        const captureAnim = (now) => {
            const elapsed = now - startTime;
            const progress = Math.min(1.0, elapsed / duration);
            const arc = Math.sin(progress * Math.PI) * 1.6;

            pawn.position.x = THREE.MathUtils.lerp(startPos.x, targetPos.x, progress);
            pawn.position.z = THREE.MathUtils.lerp(startPos.z, targetPos.z, progress);
            pawn.position.y = THREE.MathUtils.lerp(startPos.y, targetPos.y, progress) + arc;
            pawn.rotation.y += 0.25;

            if (progress < 1.0) {
                requestAnimationFrame(captureAnim);
            } else {
                homeTile.attach(pawn);
                pawn.userData.currentTile = homeTile;
                this.layoutCoinsOnTile(homeTile);
                if (window.templeAudio) window.templeAudio.playStoneClack();
                if (onComplete) onComplete();
            }
        };

        requestAnimationFrame(captureAnim);
    }

    animateCrownedPawn(pawn) {
        pawn.scale.set(1.2, 1.2, 1.2);
        if (window.templeAudio) window.templeAudio.playTempleBell(1.5);
    }

    resetAllPawns() {
        this.buildStartingPawns();
    }

    // --- ROLL 6 or 4 CHOZHI ---
    rollChozhi() {
        if (this.isRollingChozhi || this.isCoinAnimating) return;
        this.isRollingChozhi = true;

        if (window.templeAudio) window.templeAudio.playChozhiRattle();

        const engine = window.chakaramEngine;
        const shellCount = engine ? engine.shellCount : 6;

        let upCount = 0;
        if (shellCount === 4) {
            const dist = [0, 1, 1, 1, 2, 2, 2, 2, 3, 3, 3, 3, 4, 4];
            upCount = dist[Math.floor(Math.random() * dist.length)];
        } else {
            const dist = [
                1, 1, 1, 1, 1, 1,
                2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2,
                3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3,
                4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4,
                5, 5, 5, 5, 5,
                6, 6, 6,
                0, 0, 0
            ];
            upCount = dist[Math.floor(Math.random() * dist.length)];
        }

        let points = upCount;
        if (shellCount === 4) {
            if (upCount === 0) points = 8;
        } else {
            if (upCount === 0) points = 12;
        }

        const indices = [0, 1, 2, 3, 4, 5].sort(() => Math.random() - 0.5);
        const upIndices = new Set(indices.slice(0, upCount));

        this.targetShellStates = [];
        for (let i = 0; i < 6; i++) {
            const isUp = i < shellCount ? upIndices.has(i) : false;
            this.targetShellStates.push({
                isUpViewing: isUp,
                targetRotX: isUp ? 0 : Math.PI,
                targetRotZ: (Math.random() - 0.5) * 0.1,
                targetRotY: Math.random() * Math.PI * 2,
                jitterX: (Math.random() - 0.5) * 0.22,
                jitterZ: (Math.random() - 0.5) * 0.22,
                spinSpeed: 7 + Math.random() * 5
            });
        }

        this.chozhiShells.forEach((shell, i) => {
            shell.visible = i < shellCount;
        });

        const rollDuration = 1.25;
        const startTime = performance.now();

        const rollAnim = (now) => {
            const elapsed = (now - startTime) / 1000;
            const progress = Math.min(1.0, elapsed / rollDuration);

            this.chozhiShells.forEach((shell, i) => {
                if (i >= shellCount) return;
                const target = this.targetShellStates[i];

                if (progress < 0.6) {
                    const tossP = progress / 0.6;
                    const tossHeight = Math.sin(tossP * Math.PI) * 1.5;
                    shell.position.y = shell.userData.baseY + tossHeight;
                    shell.rotation.x += target.spinSpeed * 0.02;
                    shell.rotation.y += 0.14;
                    shell.rotation.z += 0.06;
                    shell.position.x = shell.userData.baseX + Math.sin(tossP * 5 + i) * 0.12;
                    shell.position.z = shell.userData.baseZ + Math.cos(tossP * 5 + i) * 0.12;
                } else {
                    shell.position.y = shell.userData.baseY;
                    shell.rotation.x = THREE.MathUtils.lerp(shell.rotation.x, target.targetRotX, 0.25);
                    shell.rotation.z = THREE.MathUtils.lerp(shell.rotation.z, target.targetRotZ, 0.25);
                    shell.rotation.y = THREE.MathUtils.lerp(shell.rotation.y, target.targetRotY, 0.25);
                }
            });

            if (progress < 1.0) {
                requestAnimationFrame(rollAnim);
            } else {
                this.isRollingChozhi = false;
                this.chozhiShells.forEach((shell, i) => {
                    if (i >= shellCount) return;
                    const target = this.targetShellStates[i];
                    shell.rotation.x = target.targetRotX;
                    shell.rotation.z = target.targetRotZ;
                    shell.rotation.y = target.targetRotY;
                    shell.position.y = shell.userData.baseY;
                    shell.userData.isUpViewing = target.isUpViewing;
                });

                if (window.templeAudio) {
                    if (points === 1 || points === 4 || points === 6 || points === 8 || points === 12) {
                        window.templeAudio.playTempleBell(1.4);
                    }
                }

                if (this.onChozhiRolled) {
                    this.onChozhiRolled({
                        points: points,
                        upCount: upCount,
                        downCount: shellCount - upCount,
                        shellCount: shellCount,
                        isDaayam: points === 1,
                        isTwelve: points === 12,
                        isSix: points === 6,
                        isEight: points === 8,
                        isFour: points === 4
                    });
                }
            }
        };

        requestAnimationFrame(rollAnim);
    }

    // --- TRADITIONAL BRASS KUTHUVILAKKU LAMPS ---
    buildKuthuvilakkuLamps() {
        const brassMat = new THREE.MeshStandardMaterial({
            color: 0xd4af37,
            roughness: 0.3,
            metalness: 0.85
        });

        const lampPositions = [
            [-5.5, -4.8], [5.5, -4.8],
            [-5.5, 4.8], [5.5, 4.8]
        ];

        this.lamps = [];
        this.flames = [];

        lampPositions.forEach(([lx, lz]) => {
            const lamp = new THREE.Group();

            const baseGeo = new THREE.CylinderGeometry(0.55, 0.75, 0.35, 24);
            const baseMesh = new THREE.Mesh(baseGeo, brassMat);
            baseMesh.position.y = 0.175; baseMesh.castShadow = true; lamp.add(baseMesh);

            const shaftGeo = new THREE.CylinderGeometry(0.12, 0.18, 2.4, 20);
            const shaftMesh = new THREE.Mesh(shaftGeo, brassMat);
            shaftMesh.position.y = 1.4; shaftMesh.castShadow = true; lamp.add(shaftMesh);

            const bowlGeo = new THREE.CylinderGeometry(0.65, 0.35, 0.22, 24);
            const bowlMesh = new THREE.Mesh(bowlGeo, brassMat);
            bowlMesh.position.y = 2.6; lamp.add(bowlMesh);

            const flameLight = new THREE.PointLight(0xff9933, 2.2, 14, 1.8);
            flameLight.position.set(0, 2.85, 0); flameLight.castShadow = true; lamp.add(flameLight);

            const flameGeo = new THREE.ConeGeometry(0.09, 0.28, 12);
            const flameMat = new THREE.MeshBasicMaterial({ color: 0xffe082, transparent: true, opacity: 0.95 });
            const flameMesh = new THREE.Mesh(flameGeo, flameMat);
            flameMesh.position.set(0, 2.82, 0); lamp.add(flameMesh);

            lamp.position.set(lx, 0, lz);
            this.scene.add(lamp);

            this.lamps.push(lamp);
            this.flames.push({ light: flameLight, mesh: flameMesh, baseIntensity: 2.2, seed: Math.random() * 100 });
        });
    }

    setupLighting() {
        this.ambientLight = new THREE.AmbientLight(0x2a221a, 1.0);
        this.scene.add(this.ambientLight);

        this.mainDirLight = new THREE.DirectionalLight(0xfff0d6, 1.2);
        this.mainDirLight.position.set(6, 16, 8);
        this.mainDirLight.castShadow = true;
        this.mainDirLight.shadow.mapSize.width = 2048;
        this.mainDirLight.shadow.mapSize.height = 2048;
        this.scene.add(this.mainDirLight);
    }

    onMouseMove(event) {
        const rect = this.renderer.domElement.getBoundingClientRect();
        this.mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
        this.mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

        this.raycaster.setFromCamera(this.mouse, this.camera);
        const flatTiles = this.tiles.flat();
        const intersects = this.raycaster.intersectObjects(flatTiles, true);

        if (intersects.length > 0) {
            let hitObj = intersects[0].object;
            while (hitObj.parent && hitObj.parent !== this.boardGroup && !hitObj.userData.index && !hitObj.userData.isPawn) {
                hitObj = hitObj.parent;
            }

            if (hitObj.userData.isPawn && hitObj.userData.isMovable) {
                document.body.style.cursor = 'pointer';
            } else if (hitObj.userData.index && this.hoveredCell !== hitObj) {
                this.hoveredCell = hitObj;
                document.body.style.cursor = 'pointer';
            }
        } else {
            document.body.style.cursor = 'default';
        }
    }

    onPointerClick(event) {
        if (this.isCoinAnimating) return;

        const rect = this.renderer.domElement.getBoundingClientRect();
        this.mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
        this.mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

        this.raycaster.setFromCamera(this.mouse, this.camera);

        const chozhiIntersects = this.raycaster.intersectObjects(this.chozhiGroup.children, true);
        if (chozhiIntersects.length > 0) {
            const engine = window.chakaramEngine;
            if (engine && !engine.hasRolled && !engine.getCurrentPlayer().isAI) {
                this.rollChozhi();
            }
            return;
        }

        const flatTiles = this.tiles.flat();
        const intersects = this.raycaster.intersectObjects(flatTiles, true);

        if (intersects.length > 0) {
            let hitObj = intersects[0].object;
            while (hitObj.parent && !hitObj.userData.isPawn && !hitObj.userData.index) {
                hitObj = hitObj.parent;
            }

            if (hitObj.userData.isPawn && hitObj.userData.isMovable && this.onPawnClicked) {
                this.onPawnClicked(hitObj.userData.coinId, hitObj.userData.legalMove);
            }
        }
    }

    setTheme(themeName) {
        this.currentTheme = themeName;
        this.buildMatrixBoard(this.matrixSize);
        this.resetAllPawns();
        if (window.templeAudio) window.templeAudio.playStoneClack();
    }

    setAtmosphere(mode) {
        this.currentAtmosphere = mode;
        if (mode === 'night') {
            this.scene.background.setHex(0x0a0908);
            this.scene.fog.color.setHex(0x0a0908);
            this.ambientLight.color.setHex(0x2a221a);
            this.ambientLight.intensity = 1.0;
        } else if (mode === 'dawn') {
            this.scene.background.setHex(0x1a120b);
            this.scene.fog.color.setHex(0x1a120b);
            this.ambientLight.color.setHex(0x5c4228);
            this.ambientLight.intensity = 1.4;
        } else if (mode === 'golden') {
            this.scene.background.setHex(0x261409);
            this.scene.fog.color.setHex(0x261409);
            this.ambientLight.color.setHex(0x733d18);
            this.ambientLight.intensity = 1.6;
        }
    }

    setCameraPreset(preset) {
        if (!this.controls) return;

        let targetPos = { x: -5.5, y: 7.8, z: 9.2 };
        let targetLook = { x: 0.5, y: 0.5, z: 0 };

        if (preset === 'topdown') {
            targetPos = { x: 0, y: 15.5, z: 0.01 };
            targetLook = { x: 0, y: 0.5, z: 0 };
        } else if (preset === 'chozhi') {
            targetPos = { x: 5.3, y: 3.5, z: 3.2 };
            targetLook = { x: 5.3, y: 0.3, z: 0 };
        }

        this.camera.position.set(targetPos.x, targetPos.y, targetPos.z);
        this.controls.target.set(targetLook.x, targetLook.y, targetLook.z);
    }

    onResize() {
        const width = this.container.clientWidth;
        const height = this.container.clientHeight;
        this.camera.aspect = width / height;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(width, height);
    }

    animate(time) {
        requestAnimationFrame(this.animate);

        const sec = time * 0.001;

        this.flames.forEach((flame) => {
            const flicker = Math.sin(sec * 18 + flame.seed) * 0.16 + Math.cos(sec * 27 + flame.seed) * 0.12;
            flame.light.intensity = flame.baseIntensity + flicker;
            flame.mesh.scale.set(1 + flicker * 0.4, 1 + flicker * 0.8, 1 + flicker * 0.4);
        });

        this.pawnMap.forEach(pawn => {
            if (pawn.userData.isMovable) {
                const ring = pawn.userData.selectionRing;
                const pulse = (Math.sin(sec * 6) + 1) * 0.5;
                ring.material.opacity = 0.5 + pulse * 0.45;
                ring.scale.set(1 + pulse * 0.2, 1 + pulse * 0.2, 1);
            }
        });

        if (this.controls) this.controls.update();
        this.renderer.render(this.scene, this.camera);
    }
}

window.Chakaram3DScene = Chakaram3DScene;
