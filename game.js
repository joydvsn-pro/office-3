// game.js — orchestrates everything: canvas setup, game loop, collisions, UI wiring.
// To add Level 2 later: create js/level2.js exporting instantiateLevel2(groundY)
// with the same return shape as instantiateLevel1, then add it to LEVELS below
// and call Game.loadLevel(2) from the win screen's Continue button.

const LEVELS = {
  1: instantiateLevel1
};

const Game = (() => {
  const canvas = document.getElementById('game-canvas');
  const ctx = canvas.getContext('2d');

  let width = 960, height = 600, dpr = 1;
  let groundY = 460;
  let camX = 0;
  let state = 'boot'; // boot | playing | win | lose
  let currentLevelNum = 1;
  let level = null;
  let player = null;
  let rafId = null;

  const els = {
    hud: document.getElementById('hud'),
    barStress: document.getElementById('bar-stress'),
    barEnergy: document.getElementById('bar-energy'),
    scoreValue: document.getElementById('score-value'),
    screenBoot: document.getElementById('screen-boot'),
    screenWin: document.getElementById('screen-win'),
    screenLose: document.getElementById('screen-lose'),
    winScore: document.getElementById('win-score'),
    winCoffee: document.getElementById('win-coffee'),
    btnStart: document.getElementById('btn-start'),
    btnRetry: document.getElementById('btn-retry'),
    btnReplayWin: document.getElementById('btn-replay-win')
  };

  function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    width = window.innerWidth;
    height = Math.max(420, Math.min(window.innerHeight, 720));
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    groundY = height - 130;
  }

  function loadLevel(num) {
    currentLevelNum = num;
    const factory = LEVELS[num];
    level = factory(groundY);
    player = new Player(level.playerStart.x, level.playerStart.y);
    camX = 0;
  }

  function resetLevel() {
    loadLevel(currentLevelNum);
    state = 'playing';
    els.screenLose.classList.add('hidden');
    els.screenWin.classList.add('hidden');
    els.hud.classList.remove('hidden');
    Audio2.startMusic();
  }

  function startGame() {
    Audio2.unlock();
    els.screenBoot.classList.add('hidden');
    resetLevel();
  }

  // ---------------------------------------------------------- collisions
  function handleCollisions() {
    // collectibles
    for (const c of level.collectibles) {
      if (c.collected) continue;
      if (aabbOverlap(player, { x: c.x, y: c.drawY, w: c.w, h: c.h })) {
        c.collected = true;
        if (c.type === 'coffee') {
          player.energy = Math.min(player.maxEnergy, player.energy + 10);
          player.stress = Math.max(0, player.stress - 2);
          player.score += 50;
          player.coffeeCount++;
          Audio2.coffee();
        } else {
          player.score += 30;
          Audio2.cigarette();
        }
      }
    }

    // enemies
    for (const e of level.enemies) {
      if (!e.alive) continue;
      if (!aabbOverlap(player, e)) continue;
      const stomping = player.vy > 0 && (player.bottom - e.y) < e.h * 0.55;
      if (stomping) {
        e.defeat();
        player.vy = PHYSICS.jumpVelocity * 0.55;
        player.score += 100;
      } else {
        const hurt = player.hurt(1);
        if (hurt) {
          player.vx = (player.x < e.x ? -1 : 1) * 4;
        }
      }
    }

    // boss
    if (!player.dead && !player.won && aabbOverlap(player, level.boss)) {
      player.triggerBurnout();
    }

    // door opens once boss is cleared
    if (!level.door.open && player.x > level.boss.x + level.boss.w - 10) {
      level.door.open = true;
    }

    // reaching the (open) door => win
    if (level.door.open && !player.won && !player.dead && aabbOverlap(player, level.door)) {
      player.triggerWin();
    }
  }

  // ---------------------------------------------------------- HUD
  function updateHud() {
    const stressPct = Math.min(100, (player.stress / player.maxStress) * 100);
    const energyPct = Math.min(100, (player.energy / player.maxEnergy) * 100);
    els.barStress.style.width = stressPct + '%';
    els.barEnergy.style.width = energyPct + '%';
    els.scoreValue.textContent = player.score;
  }

  function showWin() {
    state = 'win';
    Audio2.stopMusic();
    els.winScore.textContent = player.score;
    els.winCoffee.textContent = player.coffeeCount;
    els.hud.classList.add('hidden');
    setTimeout(() => els.screenWin.classList.remove('hidden'), 650);
  }

  function showLose() {
    state = 'lose';
    Audio2.stopMusic();
    els.hud.classList.add('hidden');
    setTimeout(() => els.screenLose.classList.remove('hidden'), 550);
  }

  // ---------------------------------------------------------- loop
  function update() {
    Input.update();
    player.update(Input.state, level.platforms);

    for (const e of level.enemies) e.update();
    for (const c of level.collectibles) c.update();
    level.boss.update();

    if (state === 'playing') {
      handleCollisions();
      updateHud();
      if (player.dead && player.y > height + 200) { /* settled off-screen, screens already scheduled */ }
      if (player.won && state === 'playing') showWin();
      if (player.dead && state === 'playing') showLose();
    }

    // camera follows player, clamped to level bounds
    const targetCamX = player.x - width * 0.38;
    camX = Math.max(0, Math.min(targetCamX, level.worldWidth - width));
  }

  function draw() {
    Renderer.drawBackground(ctx, width, height, groundY, camX);
    Renderer.drawDecorations(ctx, level.decorations, camX, groundY);
    Renderer.drawSigns(ctx, level.signs, camX);
    Renderer.drawGroundAndPlatforms(ctx, level.platforms, camX, height);
    Renderer.drawCollectibles(ctx, level.collectibles, camX);
    for (const e of level.enemies) Renderer.drawEnemy(ctx, e, camX);
    Renderer.drawBoss(ctx, level.boss, camX);
    Renderer.drawDoor(ctx, level.door, camX);
    Renderer.drawPlayer(ctx, player, camX);
  }

  function loop() {
    update();
    draw();
    rafId = requestAnimationFrame(loop);
  }

  function init() {
    resize();
    window.addEventListener('resize', resize);
    Input.init();

    els.btnStart.addEventListener('click', startGame);
    els.btnRetry.addEventListener('click', resetLevel);
    els.btnReplayWin.addEventListener('click', resetLevel);

    loadLevel(1);
    draw(); // paint one static frame behind the boot screen
    rafId = requestAnimationFrame(loop);
  }

  return { init };
})();

window.addEventListener('DOMContentLoaded', Game.init);
