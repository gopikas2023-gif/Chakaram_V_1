/**
 * Core Game Engine for Chakaram / Chowka Bara
 * Supports 5x5 and 7x7 Matrix Boards, 4 or 6 Chozhi Dice, Safe Squares & AI Opponents
 * Enforces traditional Chowka Bara "Cut-to-Enter-Inner" rules.
 */

class ChakaramGameEngine {
    constructor() {
        this.boardSize = 5;         // 5 or 7
        this.shellCount = 6;        // 4 or 6
        this.gameMode = '1P_VS_AI';  // '1P_VS_AI', '2P_LOCAL', '4P_LOCAL'
        this.mustCutToEnterInner = true;
        
        this.currentPlayerIdx = 0;   // 0: South, 1: North, 2: East, 3: West
        this.currentRoll = null;
        this.hasRolled = false;
        this.isGameOver = false;

        this.players = [];
        this.legalMoves = [];
        
        // Event Callbacks
        this.onStateChange = null;
        this.onLogMessage = null;
        this.onCoinMoved = null;
        this.onMoveAvailable = null;
        this.onGameOver = null;

        this.initPlayers();
    }

    initPlayers() {
        let isP2AI = true;
        let isP3AI = true;
        let isP4AI = true;

        if (this.gameMode === '2P_LOCAL') {
            isP2AI = false;
            isP3AI = true;
            isP4AI = true;
        } else if (this.gameMode === '4P_LOCAL') {
            isP2AI = false;
            isP3AI = false;
            isP4AI = false;
        }

        const size = this.boardSize;
        const mid = Math.floor(size / 2);

        this.players = [
            {
                id: 1,
                name: 'தெற்கு (South P1)',
                shortName: 'தெற்கு (P1)',
                color: '#d4883b',
                wood: 'தேக்கு (Teak)',
                woodIdx: 0,
                isAI: false,
                homeRow: size - 1, homeCol: mid,
                entryRow: size - 1, entryCol: mid,
                hasCutOpponent: false,
                crownedCount: 0,
                coins: []
            },
            {
                id: 2,
                name: isP2AI ? 'வடக்கு (North AI)' : 'வடக்கு (North P2)',
                shortName: isP2AI ? 'வடக்கு (AI)' : 'வடக்கு (P2)',
                color: '#8c4323',
                wood: 'ஈட்டி (Rosewood)',
                woodIdx: 1,
                isAI: isP2AI,
                homeRow: 0, homeCol: mid,
                entryRow: 0, entryCol: mid,
                hasCutOpponent: false,
                crownedCount: 0,
                coins: []
            },
            {
                id: 3,
                name: isP3AI ? 'கிழக்கு (East AI)' : 'கிழக்கு (East P3)',
                shortName: isP3AI ? 'கிழக்கு (AI)' : 'கிழக்கு (P3)',
                color: '#d9b177',
                wood: 'சந்தனம் (Sandalwood)',
                woodIdx: 2,
                isAI: isP3AI,
                homeRow: mid, homeCol: size - 1,
                entryRow: mid, entryCol: size - 1,
                hasCutOpponent: false,
                crownedCount: 0,
                coins: []
            },
            {
                id: 4,
                name: isP4AI ? 'மேற்கு (West AI)' : 'மேற்கு (West P4)',
                shortName: isP4AI ? 'மேற்கு (AI)' : 'மேற்கு (P4)',
                color: '#a33b24',
                wood: 'செம்மரம் (Red Cedar)',
                woodIdx: 3,
                isAI: isP4AI,
                homeRow: mid, homeCol: 0,
                entryRow: mid, entryCol: 0,
                hasCutOpponent: false,
                crownedCount: 0,
                coins: []
            }
        ];

        this.players.forEach(p => {
            p.coins = [];
            for (let i = 0; i < 4; i++) {
                p.coins.push({
                    id: `${p.id}_${i}`,
                    playerId: p.id,
                    index: i,
                    status: 'HOME', // 'HOME', 'ACTIVE', 'CROWNED'
                    pathIdx: -1,
                    coord: { r: p.homeRow, c: p.homeCol }
                });
            }
        });

        this.generatePaths();
    }

    setBoardSize(size) {
        this.boardSize = parseInt(size, 10) || 5;
        this.resetGame();
    }

    setShellCount(count) {
        this.shellCount = parseInt(count, 10) || 6;
    }

    setGameMode(mode) {
        this.gameMode = mode;
        this.resetGame();
    }

    // Generate anti-clockwise spiral paths for 5x5 or 7x7 matrix
    generatePaths() {
        const size = this.boardSize;
        if (size === 5) {
            // 5x5 Matrix: 16 outer ring cells, 8 inner ring cells, 1 center goal cell
            const p1Path = [
                // Outer Ring (Steps 0-15)
                { r: 4, c: 2 }, { r: 4, c: 1 }, { r: 4, c: 0 }, { r: 3, c: 0 },
                { r: 2, c: 0 }, { r: 1, c: 0 }, { r: 0, c: 0 }, { r: 0, c: 1 },
                { r: 0, c: 2 }, { r: 0, c: 3 }, { r: 0, c: 4 }, { r: 1, c: 4 },
                { r: 2, c: 4 }, { r: 3, c: 4 }, { r: 4, c: 4 }, { r: 4, c: 3 },
                // Inner Ring (Steps 16-23) - Unlocked ONLY if player has cut an opponent!
                { r: 3, c: 3 }, { r: 3, c: 2 }, { r: 3, c: 1 }, { r: 2, c: 1 },
                { r: 1, c: 1 }, { r: 1, c: 2 }, { r: 1, c: 3 }, { r: 2, c: 3 },
                // Center Goal (Step 24)
                { r: 2, c: 2 }
            ];

            this.players[0].path = p1Path;
            this.players[1].path = p1Path.map(pt => ({ r: 4 - pt.r, c: 4 - pt.c })); // North (180°)
            this.players[2].path = p1Path.map(pt => ({ r: 4 - pt.c, c: pt.r }));     // East (270°)
            this.players[3].path = p1Path.map(pt => ({ r: pt.c, c: 4 - pt.r }));     // West (90°)
            this.outerRingCount = 16;
        } else {
            // 7x7 Matrix: 24 outer ring cells, 16 middle ring cells, 8 inner ring cells, 1 center goal cell
            const p1Path7 = [
                // Outer Ring (Steps 0-23)
                { r: 6, c: 3 }, { r: 6, c: 2 }, { r: 6, c: 1 }, { r: 6, c: 0 }, { r: 5, c: 0 }, { r: 4, c: 0 },
                { r: 3, c: 0 }, { r: 2, c: 0 }, { r: 1, c: 0 }, { r: 0, c: 0 }, { r: 0, c: 1 }, { r: 0, c: 2 },
                { r: 0, c: 3 }, { r: 0, c: 4 }, { r: 0, c: 5 }, { r: 0, c: 6 }, { r: 1, c: 6 }, { r: 2, c: 6 },
                { r: 3, c: 6 }, { r: 4, c: 6 }, { r: 5, c: 6 }, { r: 6, c: 6 }, { r: 6, c: 5 }, { r: 6, c: 4 },
                // Inner Rings (Steps 24-47) - Unlocked ONLY if player has cut an opponent!
                { r: 5, c: 4 }, { r: 5, c: 3 }, { r: 5, c: 2 }, { r: 5, c: 1 }, { r: 4, c: 1 }, { r: 3, c: 1 },
                { r: 2, c: 1 }, { r: 1, c: 1 }, { r: 1, c: 2 }, { r: 1, c: 3 }, { r: 1, c: 4 }, { r: 1, c: 5 },
                { r: 2, c: 5 }, { r: 3, c: 5 }, { r: 4, c: 5 }, { r: 4, c: 4 },
                { r: 4, c: 3 }, { r: 4, c: 2 }, { r: 3, c: 2 }, { r: 2, c: 2 }, { r: 2, c: 3 }, { r: 2, c: 4 },
                { r: 3, c: 4 },
                // Center Goal (Step 48)
                { r: 3, c: 3 }
            ];

            this.players[0].path = p1Path7;
            this.players[1].path = p1Path7.map(pt => ({ r: 6 - pt.r, c: 6 - pt.c })); // North
            this.players[2].path = p1Path7.map(pt => ({ r: 6 - pt.c, c: pt.r }));     // East
            this.players[3].path = p1Path7.map(pt => ({ r: pt.c, c: 6 - pt.r }));     // West
            this.outerRingCount = 24;
        }
    }

    getCurrentPlayer() {
        return this.players[this.currentPlayerIdx];
    }

    handleRollResult(rollData) {
        this.currentRoll = rollData;
        this.hasRolled = true;

        const player = this.getCurrentPlayer();
        const pts = rollData.points;

        this.log(`${player.shortName}: ${pts} (${rollData.upCount} 🐚, ${rollData.downCount} 🌑)`);

        this.legalMoves = this.calculateLegalMoves(player, pts);

        if (this.onStateChange) this.onStateChange();

        if (this.legalMoves.length > 0) {
            if (this.onMoveAvailable) this.onMoveAvailable(this.legalMoves);

            if (player.isAI) {
                setTimeout(() => this.executeAIMove(), 700);
            }
        } else {
            this.log(`⚠️ ${player.shortName}-ற்கு நகர்த்த வழியில்லை (No valid moves).`);
            const hasBonusRoll = (this.shellCount === 6 ? (pts === 1 || pts === 6 || pts === 12) : (pts === 1 || pts === 4 || pts === 8));
            setTimeout(() => this.finishTurn(hasBonusRoll), 1000);
        }
    }

    calculateLegalMoves(player, pts) {
        const moves = [];
        const path = player.path;
        const outerLimit = this.outerRingCount; // 16 for 5x5, 24 for 7x7

        player.coins.forEach(coin => {
            if (coin.status === 'CROWNED') return;

            if (coin.status === 'HOME') {
                if (pts === 1) { // Need Daayam (1) to unlock coin from Home base onto start cell
                    moves.push({
                        coin: coin,
                        targetIdx: 0,
                        targetCoord: path[0],
                        hopPath: [path[0]]
                    });
                }
            } else if (coin.status === 'ACTIVE') {
                let targetIdx = coin.pathIdx + pts;

                // Traditional Chowka Bara Rule: Must cut opponent to enter inner ring!
                if (!player.hasCutOpponent) {
                    // If coin is currently on outer ring and movement would push it past outerLimit-1
                    if (coin.pathIdx < outerLimit && targetIdx >= outerLimit) {
                        // Loop around the outer perimeter!
                        targetIdx = (coin.pathIdx + pts) % outerLimit;
                    }
                }

                if (targetIdx < path.length) {
                    const hopPath = [];
                    if (coin.pathIdx < outerLimit && targetIdx < outerLimit && targetIdx < coin.pathIdx) {
                        // Outer loop wraparound pathing
                        for (let step = coin.pathIdx + 1; step < outerLimit; step++) {
                            hopPath.push(path[step]);
                        }
                        for (let step = 0; step <= targetIdx; step++) {
                            hopPath.push(path[step]);
                        }
                    } else {
                        for (let step = coin.pathIdx + 1; step <= targetIdx; step++) {
                            hopPath.push(path[step]);
                        }
                    }

                    moves.push({
                        coin: coin,
                        targetIdx: targetIdx,
                        targetCoord: path[targetIdx],
                        hopPath: hopPath
                    });
                }
            }
        });

        return moves;
    }

    executeMove(coin, pts) {
        const player = this.getCurrentPlayer();
        const move = this.legalMoves.find(m => m.coin.id === coin.id);
        if (!move) return;

        const targetCoord = move.targetCoord;
        let capturedCoin = null;

        const isSafeTile = this.isSafeSquare(targetCoord.r, targetCoord.c);
        const isGoalTile = (move.targetIdx === player.path.length - 1);

        if (!isSafeTile && !isGoalTile) {
            this.players.forEach(opp => {
                if (opp.id !== player.id) {
                    opp.coins.forEach(oppCoin => {
                        if (oppCoin.status === 'ACTIVE' && oppCoin.coord.r === targetCoord.r && oppCoin.coord.c === targetCoord.c) {
                            capturedCoin = oppCoin;
                        }
                    });
                }
            });
        }

        if (this.onCoinMoved) {
            this.onCoinMoved({
                coin: coin,
                hopPath: move.hopPath,
                capturedCoin: capturedCoin,
                isGoal: isGoalTile,
                onComplete: () => {
                    this.applyMoveState(coin, move.targetIdx, targetCoord, capturedCoin, isGoalTile);
                }
            });
        } else {
            this.applyMoveState(coin, move.targetIdx, targetCoord, capturedCoin, isGoalTile);
        }
    }

    applyMoveState(coin, targetIdx, targetCoord, capturedCoin, isGoalTile) {
        const player = this.getCurrentPlayer();

        if (coin.status === 'HOME') {
            coin.status = 'ACTIVE';
            this.log(`✨ ${player.shortName} காய் களம் புகுந்தது!`);
        }

        coin.pathIdx = targetIdx;
        coin.coord = targetCoord;

        if (capturedCoin) {
            capturedCoin.status = 'HOME';
            capturedCoin.pathIdx = -1;
            const oppPlayer = this.players.find(p => p.id === capturedCoin.playerId);
            capturedCoin.coord = { r: oppPlayer.homeRow, c: oppPlayer.homeCol };
            player.hasCutOpponent = true;
            this.log(`⚔️ ${player.shortName} ${oppPlayer.shortName} காயை வெட்டியது! (உள் வட்டம் திறந்தது 🔓)`);
        }

        if (isGoalTile) {
            coin.status = 'CROWNED';
            player.crownedCount++;
            this.log(`🏆 ${player.shortName} காய் சக்கரத்தை அடைந்தது! (${player.crownedCount}/4)`);
        }

        if (player.crownedCount === 4) {
            this.isGameOver = true;
            if (this.onGameOver) this.onGameOver(player);
            return;
        }

        const isBonusRoll = (
            this.currentRoll.isDaayam || 
            this.currentRoll.isTwelve || 
            this.currentRoll.isSix || 
            this.currentRoll.isEight || 
            capturedCoin !== null
        );
        this.finishTurn(isBonusRoll);
    }

    executeAIMove() {
        if (!this.hasRolled || this.legalMoves.length === 0) return;

        let chosenMove = this.legalMoves[0];

        let maxVal = -999;

        for (const move of this.legalMoves) {
            let val = move.targetIdx;

            const isGoal = move.targetIdx === this.getCurrentPlayer().path.length - 1;
            if (isGoal) val += 100;

            const isSafe = this.isSafeSquare(move.targetCoord.r, move.targetCoord.c);
            if (isSafe) val += 15;

            if (!isSafe) {
                const captures = this.players.some(opp =>
                    opp.id !== this.getCurrentPlayer().id &&
                    opp.coins.some(c => c.status === 'ACTIVE' && c.coord.r === move.targetCoord.r && c.coord.c === move.targetCoord.c)
                );
                if (captures) val += 80;
            }

            if (move.coin.status === 'HOME') val += 30;

            if (val > maxVal) {
                maxVal = val;
                chosenMove = move;
            }
        }

        this.executeMove(chosenMove.coin, this.currentRoll.points);
    }

    finishTurn(hasBonusRoll) {
        this.hasRolled = false;
        this.currentRoll = null;
        this.legalMoves = [];

        if (hasBonusRoll && !this.isGameOver) {
            this.log(`🌟 கூடுதல் வாய்ப்பு! (Bonus Roll for ${this.getCurrentPlayer().shortName})`);
            if (this.onStateChange) this.onStateChange();
            if (this.getCurrentPlayer().isAI) {
                setTimeout(() => {
                    if (window.chakaramScene) window.chakaramScene.rollChozhi();
                }, 800);
            }
        } else {
            this.currentPlayerIdx = (this.currentPlayerIdx + 1) % 4;
            if (this.onStateChange) this.onStateChange();

            const nextPlayer = this.getCurrentPlayer();
            if (nextPlayer.isAI && !this.isGameOver) {
                setTimeout(() => {
                    if (window.chakaramScene) window.chakaramScene.rollChozhi();
                }, 800);
            }
        }
    }

    isSafeSquare(r, c) {
        if (this.boardSize === 5) {
            return (r === 4 && c === 2) || (r === 0 && c === 2) || (r === 2 && c === 0) || (r === 2 && c === 4) || (r === 2 && c === 2) ||
                   ((r === 0 || r === 4) && (c === 0 || c === 4));
        } else {
            return (r === 6 && c === 3) || (r === 0 && c === 3) || (r === 3 && c === 0) || (r === 3 && c === 6) ||
                   (r === 5 && c === 3) || (r === 1 && c === 3) || (r === 3 && c === 1) || (r === 3 && c === 5) || (r === 3 && c === 3) ||
                   ((r === 0 || r === 6) && (c === 0 || c === 6));
        }
    }

    resetGame() {
        this.currentPlayerIdx = 0;
        this.hasRolled = false;
        this.currentRoll = null;
        this.isGameOver = false;
        this.initPlayers();
        this.log(`⚔️ புதிய சக்கர ஆட்டம் துவங்கியது! (${this.boardSize}x${this.boardSize} • ${this.gameMode})`);
        if (this.onStateChange) this.onStateChange();
    }

    log(msg) {
        if (this.onLogMessage) this.onLogMessage(msg);
    }
}

window.ChakaramGameEngine = ChakaramGameEngine;
