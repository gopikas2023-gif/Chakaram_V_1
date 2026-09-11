/**
 * Procedural Texture Generator for Ancient Tamil Nadu Heritage Aesthetics
 * Generates:
 * - Turned Hardwood Grain Textures for Traditional Game Pawns / Coins (மரக் காய்கள்)
 * - Ultra-Realistic Cowrie Shell (சோழி / Chozhi) Complete UV-Mapped Skin
 * - Refined, elegant antique gold engraved stone textures
 * - Inlaid Rice-Flour Kolam (கோலம்) Floor
 * - Ancient Black Granite (கருங்கல்), Sandstone, Chola Bronze, Terracotta materials
 */

class ProceduralTextures {
    // 1. Turned Hardwood Grain Texture for 3D Game Pawns / Coins (மரக் காய்கள்)
    static createWoodTexture(woodColorType = 'teak', width = 512, height = 512) {
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');

        let baseColor = '#b57642';
        let grainColor = '#7a421c';
        let ringColor = 'rgba(70, 32, 10, 0.25)';

        if (woodColorType === 'rosewood') {
            baseColor = '#542817';
            grainColor = '#2b0f06';
            ringColor = 'rgba(25, 8, 3, 0.4)';
        } else if (woodColorType === 'sandalwood') {
            baseColor = '#d9b177';
            grainColor = '#9e733e';
            ringColor = 'rgba(110, 75, 30, 0.2)';
        } else if (woodColorType === 'cedar') {
            baseColor = '#8a3420';
            grainColor = '#4a150a';
            ringColor = 'rgba(45, 10, 5, 0.35)';
        }

        ctx.fillStyle = baseColor;
        ctx.fillRect(0, 0, width, height);

        // Longitudinal woodgrain fibers
        for (let y = 0; y < height; y += 3) {
            ctx.fillStyle = grainColor;
            ctx.globalAlpha = 0.15 + Math.sin(y * 0.08) * 0.1;
            ctx.fillRect(0, y, width, 2);
        }

        // Annual rings & subtle wavy grain lines
        ctx.globalAlpha = 0.35;
        for (let i = 0; i < 40; i++) {
            ctx.beginPath();
            const yStart = Math.random() * height;
            ctx.moveTo(0, yStart);
            ctx.bezierCurveTo(
                width * 0.33, yStart + (Math.random() - 0.5) * 40,
                width * 0.66, yStart + (Math.random() - 0.5) * 40,
                width, yStart + (Math.random() - 0.5) * 20
            );
            ctx.strokeStyle = ringColor;
            ctx.lineWidth = 2 + Math.random() * 3;
            ctx.stroke();
        }

        // Lathe turning micro-rings (horizontal sheen from woodturning)
        ctx.globalAlpha = 0.12;
        ctx.fillStyle = '#ffffff';
        for (let ly = 10; ly < height; ly += 25) {
            ctx.fillRect(0, ly, width, 3);
        }

        ctx.globalAlpha = 1.0;
        return canvas;
    }

    // 2. Ancient Stone / Granite / Terracotta Texture
    static createGraniteTexture(width = 512, height = 512, stoneType = 'granite') {
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');

        let baseColor = '#181512';
        if (stoneType === 'sandstone') baseColor = '#945c38';
        else if (stoneType === 'bronze') baseColor = '#382b18';
        else if (stoneType === 'terracotta') baseColor = '#7a3118';

        ctx.fillStyle = baseColor;
        ctx.fillRect(0, 0, width, height);

        const imgData = ctx.getImageData(0, 0, width, height);
        const data = imgData.data;

        for (let i = 0; i < data.length; i += 4) {
            const noise = (Math.random() - 0.5) * 35;
            data[i] = Math.min(255, Math.max(0, data[i] + noise));
            data[i + 1] = Math.min(255, Math.max(0, data[i + 1] + noise));
            data[i + 2] = Math.min(255, Math.max(0, data[i + 2] + noise));
        }
        ctx.putImageData(imgData, 0, 0);

        ctx.strokeStyle = 'rgba(0, 0, 0, 0.25)';
        ctx.lineWidth = 1.2;
        for (let j = 0; j < 25; j++) {
            ctx.beginPath();
            const sx = Math.random() * width;
            const sy = Math.random() * height;
            ctx.moveTo(sx, sy);
            ctx.lineTo(sx + (Math.random() - 0.5) * 45, sy + (Math.random() - 0.5) * 45);
            ctx.stroke();
        }

        return canvas;
    }

    // 3. Temple Floor with Inlaid White Rice-Flour Kolam (கோலம்)
    static createKolamFloorTexture(size = 1024) {
        const canvas = document.createElement('canvas');
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext('2d');

        ctx.fillStyle = '#141210';
        ctx.fillRect(0, 0, size, size);

        ctx.strokeStyle = '#080706';
        ctx.lineWidth = 4;
        const tileSize = size / 4;
        for (let x = 0; x <= size; x += tileSize) {
            ctx.beginPath();
            ctx.moveTo(x, 0);
            ctx.lineTo(x, size);
            ctx.stroke();
        }
        for (let y = 0; y <= size; y += tileSize) {
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(size, y);
            ctx.stroke();
        }

        const cx = size / 2;
        const cy = size / 2;

        ctx.strokeStyle = 'rgba(255, 250, 235, 0.85)';
        ctx.fillStyle = 'rgba(255, 250, 235, 0.9)';
        ctx.lineWidth = 4.0;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';

        ctx.strokeRect(cx - 400, cy - 400, 800, 800);
        ctx.strokeRect(cx - 420, cy - 420, 840, 840);

        const petals = 16;
        for (let p = 0; p < petals; p++) {
            const angle = (p * Math.PI * 2) / petals;
            const rInner = 200;
            const rOuter = 360;

            const x1 = cx + Math.cos(angle) * rInner;
            const y1 = cy + Math.sin(angle) * rInner;
            const x2 = cx + Math.cos(angle + Math.PI / petals) * rOuter;
            const y2 = cy + Math.sin(angle + Math.PI / petals) * rOuter;
            const x3 = cx + Math.cos(angle + (Math.PI * 2) / petals) * rInner;
            const y3 = cy + Math.sin(angle + (Math.PI * 2) / petals) * rInner;

            ctx.beginPath();
            ctx.moveTo(x1, y1);
            ctx.quadraticCurveTo(x2, y2, x3, y3);
            ctx.stroke();

            const bx = cx + Math.cos(angle + Math.PI / petals) * (rOuter + 25);
            const by = cy + Math.sin(angle + Math.PI / petals) * (rOuter + 25);
            ctx.beginPath();
            ctx.arc(bx, by, 5, 0, Math.PI * 2);
            ctx.fill();
        }

        ctx.beginPath();
        ctx.arc(cx, cy, 160, 0, Math.PI * 2);
        ctx.stroke();

        ctx.beginPath();
        ctx.arc(cx, cy, 100, 0, Math.PI * 2);
        ctx.stroke();

        for (let k = 0; k < 8; k++) {
            const a = (k * Math.PI * 2) / 8;
            ctx.beginPath();
            ctx.arc(cx + Math.cos(a) * 65, cy + Math.sin(a) * 65, 20, 0, Math.PI * 2);
            ctx.stroke();
        }

        for (let px = -3; px <= 3; px++) {
            for (let py = -3; py <= 3; py++) {
                ctx.beginPath();
                ctx.arc(cx + px * 40, cy + py * 40, 4, 0, Math.PI * 2);
                ctx.fill();
            }
        }

        return canvas;
    }

    // 4. COMPLETE UV-MAPPED TEXTURE FOR SOLID COWRIE SHELL
    static createCompleteChozhiTexture(width = 1024, height = 512) {
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');

        ctx.fillStyle = '#f8f5ee';
        ctx.fillRect(0, 0, width, height);

        // --- TOP HALF: DORSAL BACK (முதுகு) ---
        const topH = height / 2;
        const cx = width / 2;
        const cyTop = topH / 2;

        const dorsalGrad = ctx.createRadialGradient(cx, cyTop, 30, cx, cyTop, 380);
        dorsalGrad.addColorStop(0, '#fdfbf5');
        dorsalGrad.addColorStop(0.3, '#f5efdc');
        dorsalGrad.addColorStop(0.65, '#e5d7ba');
        dorsalGrad.addColorStop(0.85, '#d4c2a0');
        dorsalGrad.addColorStop(1, '#c5b08c');
        ctx.fillStyle = dorsalGrad;
        ctx.fillRect(0, 0, width, topH);

        ctx.strokeStyle = 'rgba(255, 255, 255, 0.7)';
        ctx.lineWidth = 18;
        ctx.beginPath();
        ctx.ellipse(cx, cyTop - 25, 220, 70, 0, 0, Math.PI * 2);
        ctx.stroke();

        // --- BOTTOM HALF: VENTRAL MOUTH (வாய்) ---
        const cyBot = topH + topH / 2;

        const ventralGrad = ctx.createRadialGradient(cx, cyBot, 40, cx, cyBot, 380);
        ventralGrad.addColorStop(0, '#faf7ee');
        ventralGrad.addColorStop(0.6, '#ede4d4');
        ventralGrad.addColorStop(1, '#d8cbb5');
        ctx.fillStyle = ventralGrad;
        ctx.fillRect(0, topH, width, topH);

        ctx.save();
        ctx.beginPath();
        ctx.moveTo(80, cyBot);
        ctx.bezierCurveTo(width * 0.35, cyBot - 18, width * 0.65, cyBot + 18, width - 80, cyBot);
        ctx.strokeStyle = '#2b1b10';
        ctx.lineWidth = 24;
        ctx.lineCap = 'round';
        ctx.stroke();

        ctx.strokeStyle = '#0d0704';
        ctx.lineWidth = 10;
        ctx.stroke();
        ctx.restore();

        const teethCount = 26;
        const startX = 120;
        const endX = width - 120;
        const step = (endX - startX) / teethCount;

        for (let i = 0; i <= teethCount; i++) {
            const x = startX + i * step;
            const curveOffset = Math.sin((i / teethCount) * Math.PI);
            const toothLength = 55 * curveOffset + 14;

            ctx.beginPath();
            ctx.moveTo(x, cyBot - 6);
            ctx.lineTo(x + (Math.random() - 0.5) * 3, cyBot - 6 - toothLength);
            ctx.strokeStyle = '#ffffff';
            ctx.lineWidth = 7.0;
            ctx.stroke();

            ctx.beginPath();
            ctx.moveTo(x + 3, cyBot - 6);
            ctx.lineTo(x + 3, cyBot - 6 - toothLength);
            ctx.strokeStyle = 'rgba(165, 135, 100, 0.5)';
            ctx.lineWidth = 2.5;
            ctx.stroke();

            ctx.beginPath();
            ctx.moveTo(x, cyBot + 6);
            ctx.lineTo(x + (Math.random() - 0.5) * 3, cyBot + 6 + toothLength);
            ctx.strokeStyle = '#ffffff';
            ctx.lineWidth = 7.0;
            ctx.stroke();

            ctx.beginPath();
            ctx.moveTo(x + 3, cyBot + 6);
            ctx.lineTo(x + 3, cyBot + 6 + toothLength);
            ctx.strokeStyle = 'rgba(165, 135, 100, 0.5)';
            ctx.lineWidth = 2.5;
            ctx.stroke();
        }

        ctx.fillStyle = '#bda88e';
        ctx.beginPath();
        ctx.arc(75, cyBot, 24, 0, Math.PI * 2);
        ctx.arc(width - 75, cyBot, 24, 0, Math.PI * 2);
        ctx.fill();

        return canvas;
    }

    // 5. MATRIX CELL TEXTURE (5x5 or 7x7 Matrix Tile Generator)
    static createTileTexture(row, col, isSelected = false, stoneTheme = 'granite', matrixSize = 5) {
        const size = 1024;
        const canvas = document.createElement('canvas');
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext('2d');

        const baseGranite = this.createGraniteTexture(size, size, stoneTheme);
        ctx.drawImage(baseGranite, 0, 0);

        const cx = size / 2;
        const cy = size / 2;

        const borderWidth = 38;
        ctx.lineWidth = isSelected ? 12 : 7;
        ctx.strokeStyle = isSelected ? '#ffd700' : 'rgba(218, 178, 65, 0.85)';
        ctx.shadowColor = isSelected ? 'rgba(255, 215, 0, 0.6)' : 'rgba(0, 0, 0, 0.6)';
        ctx.shadowBlur = isSelected ? 14 : 4;
        ctx.strokeRect(borderWidth, borderWidth, size - borderWidth * 2, size - borderWidth * 2);

        ctx.shadowBlur = 0;
        ctx.lineWidth = 3;
        ctx.strokeStyle = 'rgba(0, 0, 0, 0.55)';
        ctx.strokeRect(borderWidth + 14, borderWidth + 14, size - (borderWidth + 14) * 2, size - (borderWidth + 14) * 2);

        const cornerOffset = borderWidth + 14;
        const rosettes = [
            [cornerOffset, cornerOffset],
            [size - cornerOffset, cornerOffset],
            [cornerOffset, size - cornerOffset],
            [size - cornerOffset, size - cornerOffset]
        ];
        ctx.fillStyle = '#d8b04a';
        rosettes.forEach(([rx, ry]) => {
            ctx.beginPath();
            ctx.arc(rx, ry, 8, 0, Math.PI * 2);
            ctx.fill();
            ctx.strokeStyle = 'rgba(0,0,0,0.7)';
            ctx.lineWidth = 2;
            ctx.stroke();
        });

        const tamilNumerals = [
            '௧', '௨', '௩', '௪', '௫',
            '௬', '௭', '௮', '௯', '௰',
            '௰௧', '௰௨', '௰௩', '௰௪', '௰௫',
            '௰௬', '௰௭', '௰௮', '௰௯', '௨௰',
            '௨௰௧', '௨௰௨', '௨௰௩', '௨௰௪', '௨௰௫',
            '௨௰௬', '௨௰௭', '௨௰௮', '௨௰௯', '௩௰',
            '௩௰௧', '௩௰௨', '௩௰௩', '௩௰௪', '௩௰௫',
            '௩௰௬', '௩௰௭', '௩௰௮', '௩௰௯', '௪௰',
            '௪௰௧', '௪௰௨', '௪௰௩', '௪௰௪', '௪௰௫',
            '௪௰௬', '௪௰௭', '௪௰௮', '௪௰௯'
        ];

        const index = row * matrixSize + col;
        const mid = Math.floor(matrixSize / 2);
        const isCenter = (row === mid && col === mid);

        let isSafeHouse = false;
        if (matrixSize === 5) {
            const isCorner = (row === 0 || row === 4) && (col === 0 || col === 4);
            const isEdgeMid = (row === 2 && (col === 0 || col === 4)) || (col === 2 && (row === 0 || row === 4));
            isSafeHouse = isCorner || isEdgeMid;
        } else {
            const isOuterEntry = (row === 6 && col === 3) || (row === 0 && col === 3) || (row === 3 && col === 0) || (row === 3 && col === 6);
            const isInnerEntry = (row === 5 && col === 3) || (row === 1 && col === 3) || (row === 3 && col === 1) || (row === 3 && col === 5);
            const isCorner7 = (row === 0 || row === 6) && (col === 0 || col === 6);
            isSafeHouse = isOuterEntry || isInnerEntry || isCorner7;
        }

        const tNum = tamilNumerals[index] || `${index + 1}`;

        if (isCenter) {
            this.drawCenterChakram(ctx, cx, cy, isSelected);
        } else if (isSafeHouse) {
            this.drawFortressEngraving(ctx, cx, cy, tNum, index + 1, isSelected);
        } else {
            this.drawStandardCell(ctx, cx, cy, tNum, index + 1, isSelected);
        }

        return canvas;
    }

    static drawCenterChakram(ctx, cx, cy, isSelected) {
        ctx.save();

        const radGrad = ctx.createRadialGradient(cx, cy, 20, cx, cy, 360);
        radGrad.addColorStop(0, 'rgba(218, 175, 60, 0.4)');
        radGrad.addColorStop(0.5, 'rgba(160, 110, 20, 0.25)');
        radGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
        ctx.fillStyle = radGrad;
        ctx.beginPath();
        ctx.arc(cx, cy, 360, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = 'rgba(16, 12, 8, 0.7)';
        ctx.beginPath();
        ctx.arc(cx, cy, 330, 0, Math.PI * 2);
        ctx.fill();

        ctx.strokeStyle = isSelected ? '#ffd700' : '#d8b04a';
        ctx.lineWidth = 10;
        ctx.shadowColor = 'rgba(0,0,0,0.8)';
        ctx.shadowBlur = 6;
        ctx.beginPath();
        ctx.arc(cx, cy, 310, 0, Math.PI * 2);
        ctx.stroke();

        ctx.strokeStyle = '#b8860b';
        ctx.lineWidth = 5;
        ctx.beginPath();
        ctx.arc(cx, cy, 275, 0, Math.PI * 2);
        ctx.stroke();

        const spokes = 16;
        for (let i = 0; i < spokes; i++) {
            const angle = (i * Math.PI * 2) / spokes;
            ctx.strokeStyle = '#e2be62';
            ctx.lineWidth = 6;
            ctx.beginPath();
            ctx.moveTo(cx + Math.cos(angle) * 75, cy + Math.sin(angle) * 75);
            ctx.lineTo(cx + Math.cos(angle) * 275, cy + Math.sin(angle) * 275);
            ctx.stroke();

            const tx = cx + Math.cos(angle + Math.PI / spokes) * 292;
            const ty = cy + Math.sin(angle + Math.PI / spokes) * 292;
            ctx.fillStyle = '#e8c978';
            ctx.beginPath();
            ctx.arc(tx, ty, 6, 0, Math.PI * 2);
            ctx.fill();
        }

        ctx.fillStyle = '#d4af37';
        ctx.beginPath();
        ctx.arc(cx, cy, 75, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#1c150c';
        ctx.beginPath();
        ctx.arc(cx, cy, 42, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#e2be62';
        ctx.beginPath();
        ctx.arc(cx, cy, 18, 0, Math.PI * 2);
        ctx.fill();

        ctx.font = 'bold 78px "Mukta Malar", "Noto Sans Tamil", sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        ctx.fillStyle = '#000000';
        ctx.fillText('சக்கரம்', cx + 3, cy + 383);

        ctx.fillStyle = '#f0d388';
        ctx.shadowColor = 'rgba(0,0,0,0.8)';
        ctx.shadowBlur = 4;
        ctx.fillText('சக்கரம்', cx, cy + 380);

        ctx.restore();
    }

    static drawFortressEngraving(ctx, cx, cy, tamilNum, englishNum, isSelected) {
        ctx.save();

        ctx.fillStyle = 'rgba(10, 8, 6, 0.55)';
        ctx.fillRect(80, 80, 1024 - 160, 1024 - 160);

        const span = 350;

        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 18;
        ctx.beginPath();
        ctx.moveTo(cx - span, cy - span);
        ctx.lineTo(cx + span, cy + span);
        ctx.moveTo(cx + span, cy - span);
        ctx.lineTo(cx - span, cy + span);
        ctx.stroke();

        ctx.strokeStyle = isSelected ? '#ffd700' : '#d4af37';
        ctx.lineWidth = 10;
        ctx.beginPath();
        ctx.moveTo(cx - span, cy - span);
        ctx.lineTo(cx + span, cy + span);
        ctx.moveTo(cx + span, cy - span);
        ctx.lineTo(cx - span, cy + span);
        ctx.stroke();

        ctx.lineWidth = 5;
        ctx.strokeStyle = 'rgba(212, 175, 55, 0.7)';
        ctx.strokeRect(cx - span + 60, cy - span + 60, (span - 60) * 2, (span - 60) * 2);

        ctx.fillStyle = '#140f0a';
        ctx.beginPath();
        ctx.arc(cx, cy, 135, 0, Math.PI * 2);
        ctx.fill();

        ctx.strokeStyle = '#d4af37';
        ctx.lineWidth = 6;
        ctx.stroke();

        ctx.font = 'bold 110px "Mukta Malar", "Noto Sans Tamil", sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        ctx.fillStyle = '#000000';
        ctx.fillText(tamilNum, cx + 3, cy - 8);

        ctx.fillStyle = isSelected ? '#ffffff' : '#f5dfa2';
        ctx.shadowColor = 'rgba(0,0,0,0.85)';
        ctx.shadowBlur = 4;
        ctx.fillText(tamilNum, cx, cy - 10);

        ctx.font = 'bold 42px monospace';
        ctx.fillStyle = 'rgba(245, 230, 200, 0.75)';
        ctx.fillText(`(${englishNum})`, cx, cy + 80);

        ctx.restore();
    }

    static drawStandardCell(ctx, cx, cy, tamilNum, englishNum, isSelected) {
        ctx.save();

        ctx.fillStyle = 'rgba(14, 11, 8, 0.4)';
        ctx.beginPath();
        ctx.arc(cx, cy, 210, 0, Math.PI * 2);
        ctx.fill();

        ctx.strokeStyle = isSelected ? '#ffd700' : '#d4af37';
        ctx.lineWidth = isSelected ? 8 : 5;
        ctx.shadowColor = 'rgba(0,0,0,0.7)';
        ctx.shadowBlur = 4;
        ctx.beginPath();
        ctx.arc(cx, cy, 210, 0, Math.PI * 2);
        ctx.stroke();

        ctx.font = 'bold 136px "Mukta Malar", "Noto Sans Tamil", sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        ctx.fillStyle = '#000000';
        ctx.fillText(tamilNum, cx + 4, cy - 16);

        ctx.fillStyle = isSelected ? '#ffffff' : '#eed695';
        ctx.shadowColor = 'rgba(0,0,0,0.85)';
        ctx.shadowBlur = 5;
        ctx.fillText(tamilNum, cx, cy - 20);

        ctx.font = 'bold 46px monospace';
        ctx.fillStyle = 'rgba(240, 225, 195, 0.65)';
        ctx.fillText(`(${englishNum})`, cx, cy + 120);

        ctx.restore();
    }

    static createPillarTexture(width = 256, height = 512) {
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');

        const granite = this.createGraniteTexture(width, height, 'granite');
        ctx.drawImage(granite, 0, 0);

        const flutes = 8;
        const step = width / flutes;
        for (let i = 0; i < flutes; i++) {
            const x = i * step + step / 2;
            ctx.fillStyle = 'rgba(0, 0, 0, 0.35)';
            ctx.fillRect(x - 2, 0, 4, height);
            ctx.fillStyle = 'rgba(255, 255, 255, 0.08)';
            ctx.fillRect(x + 2, 0, 2, height);
        }

        return canvas;
    }
}

window.ProceduralTextures = ProceduralTextures;
