// renderer.js — all Canvas 2D drawing code. Pure functions of (ctx, camera, world state).

const Renderer = (() => {

  function drawBackground(ctx, width, height, groundY, camX) {
    const g = ctx.createLinearGradient(0, 0, 0, height);
    g.addColorStop(0, '#eaf3ff');
    g.addColorStop(0.55, '#d7e8fb');
    g.addColorStop(1, '#c3dbf3');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, width, height);

    const parX = -camX * 0.25;
    ctx.save();
    ctx.globalAlpha = 0.35;
    ctx.fillStyle = '#ffffff';
    const winW = 70, winH = 90, gap = 40;
    const startCol = Math.floor(-parX / (winW + gap)) - 1;
    for (let c = startCol; c < startCol + Math.ceil(width / (winW + gap)) + 2; c++) {
      const wx = c * (winW + gap) + parX;
      const wy = groundY - 340;
      roundRect(ctx, wx, wy, winW, winH, 10);
      ctx.fill();
    }
    ctx.restore();

    ctx.save();
    ctx.globalAlpha = 0.18;
    ctx.fillStyle = '#7893c2';
    ctx.fillRect(0, groundY - 4, width, 4);
    ctx.restore();
  }

  function roundRect(ctx, x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
  }

  function drawGroundAndPlatforms(ctx, platforms, camX, height) {
    for (const p of platforms) {
      const sx = p.x - camX;
      if (sx + p.w < -50 || sx > 4000) continue;
      if (p.type === 'ground') {
        const g = ctx.createLinearGradient(0, p.y, 0, p.y + 40);
        g.addColorStop(0, '#dfe7f4');
        g.addColorStop(1, '#c7d3e8');
        ctx.fillStyle = g;
        ctx.fillRect(sx, p.y, p.w, height - p.y);
        ctx.fillStyle = '#b9c6e0';
        ctx.fillRect(sx, p.y, p.w, 6);
        ctx.strokeStyle = 'rgba(160,175,205,.35)';
        ctx.lineWidth = 1;
        for (let x = 0; x < p.w; x += 90) {
          ctx.beginPath();
          ctx.moveTo(sx + x, p.y + 10);
          ctx.lineTo(sx + x, p.y + 40);
          ctx.stroke();
        }
      } else {
        ctx.save();
        ctx.shadowColor = 'rgba(30,40,70,.25)';
        ctx.shadowBlur = 10;
        ctx.shadowOffsetY = 6;
        const g = ctx.createLinearGradient(0, p.y, 0, p.y + p.h);
        g.addColorStop(0, '#ffffff');
        g.addColorStop(1, '#e3ebf7');
        ctx.fillStyle = g;
        roundRect(ctx, sx, p.y, p.w, p.h, 8);
        ctx.fill();
        ctx.restore();
        ctx.fillStyle = '#c7d3e8';
        ctx.fillRect(sx + 6, p.y + p.h - 3, p.w - 12, 3);
      }
    }
  }

  function drawSigns(ctx, signs, camX) {
    for (const s of signs) {
      const sx = s.x - camX;
      if (sx < -220 || sx > 4000) continue;
      ctx.save();
      ctx.shadowColor = 'rgba(30,40,70,.2)';
      ctx.shadowBlur = 8;
      ctx.fillStyle = '#ffffff';
      ctx.font = '600 15px Inter, sans-serif';
      const textW = ctx.measureText(s.text).width;
      const padX = 16;
      roundRect(ctx, sx - textW / 2 - padX, s.y, textW + padX * 2, 34, 10);
      ctx.fill();
      ctx.restore();
      ctx.fillStyle = '#3a4460';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(s.text, sx, s.y + 18);
    }
  }

  function drawDecorations(ctx, decorations, camX, groundY) {
    for (const d of decorations) {
      const sx = d.x - camX;
      if (sx < -140 || sx > 4000) continue;
      const gy = groundY;
      ctx.save();
      ctx.translate(sx, gy);
      switch (d.type) {
        case 'plant': drawPlant(ctx); break;
        case 'coffeepoint': drawCoffeePoint(ctx); break;
        case 'desk': drawDesk(ctx); break;
        case 'monitor': drawMonitor(ctx); break;
        case 'meetingroom': drawMeetingRoom(ctx); break;
        case 'printer': drawPrinter(ctx); break;
        case 'dashboard': drawDashboard(ctx); break;
      }
      ctx.restore();
    }
  }

  function drawPlant(ctx) {
    ctx.fillStyle = '#c98552';
    roundRect(ctx, -14, -34, 28, 34, 4); ctx.fill();
    ctx.fillStyle = '#4caf7d';
    for (let i = 0; i < 5; i++) {
      ctx.beginPath();
      const ang = -Math.PI / 2 + (i - 2) * 0.4;
      ctx.ellipse(Math.cos(ang) * 10, -34 + Math.sin(ang) * 22, 8, 18, ang, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  function drawCoffeePoint(ctx) {
    ctx.fillStyle = '#8a5a3c';
    roundRect(ctx, -30, -60, 60, 60, 6); ctx.fill();
    ctx.fillStyle = '#c8925f';
    roundRect(ctx, -26, -56, 52, 14, 4); ctx.fill();
    ctx.font = '26px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('☕', 0, -20);
  }

  function drawDesk(ctx) {
    ctx.fillStyle = '#b9c6e0';
    ctx.fillRect(-40, -6, 80, 6);
    ctx.fillStyle = '#8d9bc2';
    ctx.fillRect(-34, 0, 6, 40);
    ctx.fillRect(28, 0, 6, 40);
    ctx.fillStyle = '#dfe7f4';
    roundRect(ctx, -40, -12, 80, 8, 3); ctx.fill();
  }

  function drawMonitor(ctx) {
    ctx.fillStyle = '#3a4460';
    roundRect(ctx, -22, -46, 44, 32, 4); ctx.fill();
    ctx.fillStyle = '#7fd8ff';
    roundRect(ctx, -18, -42, 36, 24, 3); ctx.fill();
    ctx.fillStyle = '#3a4460';
    ctx.fillRect(-4, -14, 8, 8);
  }

  function drawMeetingRoom(ctx) {
    ctx.save();
    ctx.globalAlpha = 0.85;
    ctx.strokeStyle = '#9fb3d8';
    ctx.lineWidth = 4;
    ctx.strokeRect(-46, -150, 92, 150);
    ctx.fillStyle = 'rgba(255,255,255,.5)';
    ctx.fillRect(-42, -146, 84, 142);
    ctx.restore();
    ctx.fillStyle = '#4b5468';
    ctx.font = '600 11px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('MEETING ROOM', 0, -156);
  }

  function drawPrinter(ctx) {
    ctx.fillStyle = '#c7d3e8';
    roundRect(ctx, -24, -38, 48, 38, 6); ctx.fill();
    ctx.fillStyle = '#8d9bc2';
    ctx.fillRect(-24, -14, 48, 6);
    ctx.font = '20px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('🖨️', 0, -20);
  }

  function drawDashboard(ctx) {
    ctx.fillStyle = '#ffffff';
    roundRect(ctx, -34, -70, 68, 50, 8); ctx.fill();
    ctx.fillStyle = '#33c2a4';
    ctx.fillRect(-26, -34, 10, 16);
    ctx.fillStyle = '#ff8a65';
    ctx.fillRect(-12, -44, 10, 26);
    ctx.fillStyle = '#ffb648';
    ctx.fillRect(2, -28, 10, 10);
    ctx.fillStyle = '#4b5468';
    ctx.font = '600 10px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('DASHBOARD', 0, -74);
  }

  function drawCollectibles(ctx, items, camX) {
    for (const c of items) {
      if (c.collected) continue;
      const sx = c.x - camX;
      if (sx < -60 || sx > 4000) continue;
      const sy = c.drawY;
      ctx.save();
      ctx.shadowColor = 'rgba(30,40,70,.25)';
      ctx.shadowBlur = 8;
      ctx.font = '26px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(c.type === 'coffee' ? '☕' : '🚬', sx + c.w / 2, sy + c.h / 2);
      ctx.restore();
    }
  }

  function drawEnemy(ctx, e, camX) {
    const sx = e.x - camX;
    if (sx < -80 || sx > 4000) return;
    ctx.save();
    const squashY = e.squash;
    ctx.translate(sx + e.w / 2, e.y + e.h);
    ctx.scale(1, 1 - squashY * 0.8);
    ctx.globalAlpha = e.alive ? 1 : Math.max(0, 1 - squashY * 1.4);

    ctx.shadowColor = 'rgba(30,40,70,.3)';
    ctx.shadowBlur = 6;
    ctx.fillStyle = e.def.color;
    roundRect(ctx, -e.w / 2, -e.h, e.w, e.h, 8);
    ctx.fill();

    ctx.font = `${Math.floor(e.h * 0.7)}px sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(e.def.emoji, 0, -e.h / 2);
    ctx.restore();
  }

  function drawBoss(ctx, boss, camX) {
    const sx = boss.x - camX;
    ctx.save();
    ctx.translate(sx, boss.y);
    ctx.shadowColor = 'rgba(30,40,70,.35)';
    ctx.shadowBlur = 14;
    ctx.shadowOffsetY = 8;
    ctx.fillStyle = '#2b2f45';
    ctx.fillRect(10, boss.h - 30, 22, 30);
    ctx.fillRect(boss.w - 32, boss.h - 30, 22, 30);
    const g = ctx.createLinearGradient(0, 0, 0, boss.h);
    g.addColorStop(0, '#3c4468');
    g.addColorStop(1, '#242a44');
    ctx.fillStyle = g;
    roundRect(ctx, 0, 20, boss.w, boss.h - 40, 14);
    ctx.fill();
    ctx.fillStyle = '#f4f6fb';
    ctx.beginPath();
    ctx.moveTo(boss.w / 2 - 14, 26);
    ctx.lineTo(boss.w / 2 + 14, 26);
    ctx.lineTo(boss.w / 2, 60);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = '#d4a24c';
    ctx.beginPath();
    ctx.moveTo(boss.w / 2 - 6, 30);
    ctx.lineTo(boss.w / 2 + 6, 30);
    ctx.lineTo(boss.w / 2, boss.h - 50);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = '#e7b98c';
    ctx.beginPath();
    ctx.ellipse(boss.w / 2, 0, 22, 24, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#5a4632';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(boss.w / 2 - 14, -6); ctx.lineTo(boss.w / 2 - 4, -3);
    ctx.moveTo(boss.w / 2 + 14, -6); ctx.lineTo(boss.w / 2 + 4, -3);
    ctx.stroke();
    ctx.restore();
  }

  function drawDoor(ctx, door, camX) {
    const sx = door.x - camX;
    ctx.save();
    ctx.shadowColor = 'rgba(30,40,70,.3)';
    ctx.shadowBlur = 12;
    const frameColor = door.open ? '#33c2a4' : '#8d9bc2';
    ctx.fillStyle = frameColor;
    roundRect(ctx, sx - 6, door.y - 6, door.w + 12, door.h + 6, 10);
    ctx.fill();
    ctx.fillStyle = door.open ? '#eafff7' : '#3a4460';
    roundRect(ctx, sx, door.y, door.w, door.h, 8);
    ctx.fill();
    if (door.open) {
      ctx.fillStyle = 'rgba(255,255,255,.9)';
      ctx.font = '26px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('🚪', sx + door.w / 2, door.y + door.h / 2 + 10);
    } else {
      ctx.fillStyle = '#c7d3e8';
      ctx.beginPath();
      ctx.arc(sx + door.w - 12, door.y + door.h / 2, 4, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
    ctx.fillStyle = '#4b5468';
    ctx.font = '700 12px "Baloo 2", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('ВЫХОД', sx + door.w / 2, door.y - 14);
  }

  function drawPlayer(ctx, p, camX) {
    const sx = p.x - camX;
    ctx.save();
    ctx.translate(sx + p.w / 2, p.y + p.h / 2);

    if (p.invincibleTimer > 0 && Math.floor(p.invincibleTimer / 5) % 2 === 0) {
      ctx.globalAlpha = 0.4;
    }

    const facing = p.facing;
    ctx.scale(facing, 1);

    const t = p.animTimer;
    let legSwing = 0, armSwing = 0, bodyTilt = 0, bob = 0;

    if (p.state === 'run') {
      legSwing = Math.sin(t * 0.35) * 12;
      armSwing = Math.sin(t * 0.35 + Math.PI) * 10;
      bob = Math.abs(Math.sin(t * 0.35)) * 2;
    } else if (p.state === 'jump') {
      legSwing = -6; armSwing = -14; bodyTilt = -0.05;
    } else if (p.state === 'fall') {
      legSwing = 6; armSwing = 10; bodyTilt = 0.05;
    } else if (p.state === 'win') {
      armSwing = -20 - Math.sin(t * 0.2) * 6;
    } else if (p.state === 'dead') {
      bodyTilt = 0.5;
    }

    ctx.rotate(bodyTilt);
    ctx.translate(0, -bob);

    const isZombie = p.state === 'dead';
    const skin = isZombie ? '#9db08a' : '#f0c29a';
    const shirt = isZombie ? '#c9d3c0' : '#ffffff';
    const tie = isZombie ? '#6b7a5e' : '#2c3e66';
    const pants = isZombie ? '#5c6b52' : '#33415c';

    ctx.save();
    ctx.translate(-6, 6);
    ctx.rotate(legSwing * 0.03);
    ctx.fillStyle = pants;
    roundRect(ctx, -4, 0, 8, 16, 3); ctx.fill();
    ctx.restore();
    ctx.save();
    ctx.translate(6, 6);
    ctx.rotate(-legSwing * 0.03);
    ctx.fillStyle = pants;
    roundRect(ctx, -4, 0, 8, 16, 3); ctx.fill();
    ctx.restore();

    ctx.fillStyle = shirt;
    ctx.save();
    ctx.shadowColor = 'rgba(30,40,70,.2)';
    ctx.shadowBlur = 4;
    roundRect(ctx, -13, -14, 26, 26, 8);
    ctx.fill();
    ctx.restore();

    ctx.fillStyle = tie;
    ctx.beginPath();
    ctx.moveTo(-4, -12);
    ctx.lineTo(4, -12);
    ctx.lineTo(0, -4);
    ctx.closePath();
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(-3, -4);
    ctx.lineTo(3, -4);
    ctx.lineTo(2, 10);
    ctx.lineTo(0, 13);
    ctx.lineTo(-2, 10);
    ctx.closePath();
    ctx.fill();

    ctx.save();
    ctx.translate(-13, -8);
    ctx.rotate(armSwing * 0.04 + (p.state === 'win' ? -1.4 : 0));
    ctx.fillStyle = shirt;
    roundRect(ctx, -4, 0, 8, 16, 4); ctx.fill();
    ctx.restore();
    ctx.save();
    ctx.translate(13, -8);
    ctx.rotate(-armSwing * 0.04 + (p.state === 'win' ? 1.4 : 0));
    ctx.fillStyle = shirt;
    roundRect(ctx, -4, 0, 8, 16, 4); ctx.fill();
    ctx.restore();

    ctx.fillStyle = skin;
    ctx.beginPath();
    ctx.ellipse(0, -26, 13, 13, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = isZombie ? '#4a5540' : '#3a2e26';
    ctx.beginPath();
    ctx.ellipse(0, -34, 13, 8, 0, Math.PI, 0);
    ctx.fill();

    if (p.state === 'dead') {
      ctx.strokeStyle = '#2a331f';
      ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.moveTo(-6, -28); ctx.lineTo(-2, -24); ctx.moveTo(-2, -28); ctx.lineTo(-6, -24); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(2, -28); ctx.lineTo(6, -24); ctx.moveTo(6, -28); ctx.lineTo(2, -24); ctx.stroke();
      ctx.beginPath(); ctx.arc(0, -18, 3, 0, Math.PI); ctx.stroke();
    } else if (p.state === 'win') {
      ctx.fillStyle = '#2a2a2a';
      ctx.beginPath(); ctx.arc(-4, -27, 1.6, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.arc(4, -27, 1.6, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = '#2a2a2a'; ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.arc(0, -22, 4, 0, Math.PI); ctx.stroke();
    } else {
      ctx.fillStyle = '#2a2a2a';
      ctx.beginPath(); ctx.arc(-4, -27, 1.6, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.arc(4, -27, 1.6, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = '#c98860'; ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.arc(0, -21, 2.4, 0, Math.PI); ctx.stroke();
    }

    ctx.restore();
  }

  return {
    drawBackground, drawGroundAndPlatforms, drawSigns, drawDecorations,
    drawCollectibles, drawEnemy, drawBoss, drawDoor, drawPlayer
  };
})();
