/**
 * Application Manager for Chakaram 3D (Chowka Bara) Game
 * Connects 3D Three.js Scene, Chowka Bara Engine, Spatial 4-House HUDs, Front Launcher Modal & Sound.
 */

document.addEventListener('DOMContentLoaded', () => {
    const container = document.getElementById('webgl-container');
    
    // 1. Initialize Game Engine
    const engine = new ChakaramGameEngine();
    window.chakaramEngine = engine;

    // 2. Initialize 3D Scene
    const scene = new Chakaram3DScene(container);

    // Selected Launcher State
    let selectedMode = '1P_VS_AI';
    let selectedBoardSize = 5;
    let selectedShellCount = 6;

    // UI Elements
    const rollBtn = document.getElementById('btn-roll-chozhi');
    const scoreCard = document.getElementById('score-card');
    const scoreNumber = document.getElementById('score-number');
    const scoreDesc = document.getElementById('score-desc');
    const chozhiVisual = document.getElementById('chozhi-visual');
    const chozhiTitle = document.getElementById('chozhi-title');
    const matchLogList = document.getElementById('match-log-list');

    const victoryModal = document.getElementById('victory-modal');
    const winnerTitle = document.getElementById('winner-title');
    const winnerDesc = document.getElementById('winner-desc');
    const btnPlayAgain = document.getElementById('btn-play-again');

    const welcomeModal = document.getElementById('welcome-modal');
    const btnDismissWelcome = document.getElementById('btn-dismiss-welcome');
    const btnStartGameHeader = document.getElementById('btn-start-game-header');
    const boardSubtitle = document.getElementById('board-subtitle');

    const tamilNumsMap = { 0: '௦', 1: '௧', 2: '௨', 3: '௩', 4: '௪', 5: '௫', 6: '௬', 8: '௮', 12: '௰௨' };

    // --- LAUNCHER MODAL SELECTION CONTROLS ---

    // Board Size Selector (5x5 vs 7x7)
    document.querySelectorAll('#board-size-group .selector-card').forEach(card => {
        card.addEventListener('click', () => {
            document.querySelectorAll('#board-size-group .selector-card').forEach(c => c.classList.remove('active'));
            card.classList.add('active');
            selectedBoardSize = parseInt(card.getAttribute('data-size'), 10) || 5;
        });
    });

    // Game Mode Pills (1P vs AI, 2P Local, 4P Local)
    document.querySelectorAll('#mode-pills-group .mode-pill-card').forEach(pill => {
        pill.addEventListener('click', () => {
            document.querySelectorAll('#mode-pills-group .mode-pill-card').forEach(p => p.classList.remove('active'));
            pill.classList.add('active');
            selectedMode = pill.getAttribute('data-mode');
        });
    });

    // Shell Count Selector Cards (6 vs 4)
    document.querySelectorAll('#shell-count-group .selector-card').forEach(card => {
        card.addEventListener('click', () => {
            document.querySelectorAll('#shell-count-group .selector-card').forEach(c => c.classList.remove('active'));
            card.classList.add('active');
            selectedShellCount = parseInt(card.getAttribute('data-shells'), 10) || 6;
        });
    });

    // --- GAME ENGINE & 3D SCENE BINDINGS ---

    scene.onChozhiRolled = (result) => {
        engine.handleRollResult(result);
        displayRollResult(result);
    };

    engine.onMoveAvailable = (legalMoves) => {
        scene.setMovableCoins(legalMoves);
        const player = engine.getCurrentPlayer();
        if (!player.isAI) {
            if (scoreCard) scoreCard.classList.add('prompt-glow');
            if (scoreDesc) scoreDesc.innerHTML = '👆 <strong>Select glowing coin</strong>';
        }
    };

    scene.onPawnClicked = (coinId, legalMove) => {
        if (!engine.hasRolled || engine.getCurrentPlayer().isAI || scene.isCoinAnimating) return;
        if (scoreCard) scoreCard.classList.remove('prompt-glow');
        engine.executeMove(legalMove.coin, engine.currentRoll.points);
    };

    engine.onCoinMoved = (data) => {
        scene.animatePawnMovement(
            data.coin.id,
            data.hopPath,
            data.capturedCoin,
            data.isGoal,
            data.onComplete
        );
    };

    engine.onStateChange = () => {
        updateUI();
    };

    engine.onLogMessage = (msg) => {
        if (matchLogList) {
            const li = document.createElement('li');
            li.textContent = msg;
            matchLogList.prepend(li);
            while (matchLogList.children.length > 6) {
                matchLogList.removeChild(matchLogList.lastChild);
            }
        }
    };

    engine.onGameOver = (winner) => {
        if (victoryModal) {
            winnerTitle.textContent = `🏆 ${winner.name} Victory!`;
            winnerDesc.textContent = `${winner.wood} coins reached Surya Chakram!`;
            victoryModal.classList.add('visible');
        }
        if (window.confetti) {
            confetti({ particleCount: 180, spread: 85, origin: { y: 0.6 } });
        }
        if (window.templeAudio) {
            window.templeAudio.playTempleBell(2.0);
        }
    };

    function displayRollResult(r) {
        const pts = r.points;
        const tamilGlyph = tamilNumsMap[pts] || pts;

        let numText = `Roll: ${pts} (${tamilGlyph})`;
        let descText = `${r.upCount} Open 🐚 • ${r.downCount} Closed 🌑`;

        if (r.isDaayam) {
            numText = `🌟 Daayam (1)`;
            descText = `1 Open 🐚 • Field Entry & Bonus Roll!`;
        } else if (r.isSix) {
            numText = `✨ Six (6)`;
            descText = `All Open 🐚 • Bonus Roll!`;
        } else if (r.isTwelve) {
            numText = `🔥 Twelve (12)`;
            descText = `All Closed 🌑 • Bonus Roll!`;
        } else if (r.isEight) {
            numText = `⚡ Ashta (8)`;
            descText = `All Closed 🌑 • Bonus Roll!`;
        }

        if (scoreNumber) scoreNumber.textContent = numText;
        if (scoreDesc) scoreDesc.textContent = descText;

        let shellIcons = '';
        for (let i = 0; i < r.upCount; i++) shellIcons += '<span class="shell-icon shell-open" title="Open">🐚</span>';
        for (let j = 0; j < r.downCount; j++) shellIcons += '<span class="shell-icon shell-closed" title="Closed">🌑</span>';
        if (chozhiVisual) chozhiVisual.innerHTML = shellIcons;

        // Update active player's HUD roll text
        const player = engine.getCurrentPlayer();
        if (player) {
            const hudRoll = document.getElementById(`hud-roll-${player.id}`);
            if (hudRoll) hudRoll.textContent = `🎲 ${pts} (${tamilGlyph})`;
        }
    }

    function updateUI() {
        const activePlayer = engine.getCurrentPlayer();
        if (!activePlayer) return;

        // 1. Update Spatial 4-House HUD Cards & Active Highlights
        engine.players.forEach(p => {
            const hudCard = document.getElementById(`player-hud-${p.id}`);
            const hudName = document.getElementById(`hud-name-${p.id}`);
            const hudHome = document.getElementById(`hud-home-${p.id}`);
            const hudActive = document.getElementById(`hud-active-${p.id}`);
            const hudCrowns = document.getElementById(`hud-crowns-${p.id}`);
            const hudRoll = document.getElementById(`hud-roll-${p.id}`);

            if (hudCard) {
                const isActive = (p.id === activePlayer.id);
                hudCard.classList.toggle('active-turn', isActive);
            }

            if (hudName) {
                const sideName = p.id === 1 ? 'SOUTH' : p.id === 2 ? 'NORTH' : p.id === 3 ? 'EAST' : 'WEST';
                const tag = p.isAI ? ' (AI)' : (p.id === 1 ? ' (YOU)' : '');
                hudName.textContent = `${sideName}${tag}`;
            }

            if (hudHome) {
                const count = p.coins.filter(c => c.status === 'HOME').length;
                hudHome.textContent = count;
            }

            if (hudActive) {
                const count = p.coins.filter(c => c.status === 'ACTIVE').length;
                hudActive.textContent = count;
            }

            if (hudCrowns) {
                hudCrowns.textContent = `${p.crownedCount}/4`;
            }

            if (hudRoll && p.id !== activePlayer.id) {
                hudRoll.textContent = '🎲 ready';
            }
        });

        // 2. Roll Button & Central Dock Status
        if (rollBtn) {
            if (activePlayer.isAI) {
                rollBtn.disabled = true;
                rollBtn.textContent = '🤖 AI Thinking...';
            } else if (engine.hasRolled) {
                rollBtn.disabled = true;
                rollBtn.textContent = '♟️ Select Coin';
            } else if (scene.isCoinAnimating || scene.isRollingChozhi) {
                rollBtn.disabled = true;
                rollBtn.textContent = '⏳ Moving...';
            } else {
                rollBtn.disabled = false;
                rollBtn.textContent = `🎲 ROLL ${engine.shellCount} CHOZHI`;
            }
        }

        if (!engine.hasRolled && !activePlayer.isAI) {
            if (scoreCard) scoreCard.classList.remove('prompt-glow');
            if (scoreNumber && !engine.currentRoll) scoreNumber.textContent = '🎲 Roll Chozhi';
            if (scoreDesc && !engine.currentRoll) scoreDesc.textContent = 'Click button to roll';
        }
    }

    // --- SETUP CONTROLS & LISTENERS ---

    if (rollBtn) {
        rollBtn.addEventListener('click', () => {
            if (!engine.hasRolled && !engine.getCurrentPlayer().isAI && !scene.isCoinAnimating && !scene.isRollingChozhi) {
                scene.rollChozhi();
            }
        });
    }

    const startNewGame = () => {
        engine.setGameMode(selectedMode);
        engine.setBoardSize(selectedBoardSize);
        engine.setShellCount(selectedShellCount);

        scene.buildMatrixBoard(selectedBoardSize);

        if (chozhiTitle) chozhiTitle.textContent = `${selectedShellCount} Chozhi Dice`;
        if (boardSubtitle) {
            boardSubtitle.textContent = `${selectedBoardSize}x${selectedBoardSize} Matrix • 4 Players • ${selectedShellCount} Chozhi`;
        }

        if (welcomeModal) welcomeModal.classList.remove('visible');
        if (victoryModal) victoryModal.classList.remove('visible');

        engine.resetGame();
        scene.resetAllPawns();
        if (window.templeAudio) window.templeAudio.playTempleBell(1.2);
    };

    if (btnDismissWelcome) btnDismissWelcome.addEventListener('click', startNewGame);
    if (btnStartGameHeader) btnStartGameHeader.addEventListener('click', () => {
        if (welcomeModal) welcomeModal.classList.add('visible');
    });
    if (btnPlayAgain) btnPlayAgain.addEventListener('click', startNewGame);

    document.querySelectorAll('[data-camera]').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('[data-camera]').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            scene.setCameraPreset(btn.getAttribute('data-camera'));
            if (window.templeAudio) window.templeAudio.playStoneClack();
        });
    });

    document.querySelectorAll('[data-theme]').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('[data-theme]').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            scene.setTheme(btn.getAttribute('data-theme'));
        });
    });

    document.querySelectorAll('[data-atmosphere]').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('[data-atmosphere]').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            scene.setAtmosphere(btn.getAttribute('data-atmosphere'));
        });
    });

    const btnMute = document.getElementById('btn-audio-mute');
    if (btnMute) {
        btnMute.addEventListener('click', () => {
            const isMuted = window.templeAudio.toggleMute();
            btnMute.innerHTML = isMuted ? '🔇 Muted' : '🔔 Sound On';
            btnMute.classList.toggle('btn-highlight', isMuted);
        });
    }

    updateUI();
});
