// level1.js — declarative layout for Level 1, plus a factory that builds fresh
// runtime entities so the level can be replayed cleanly. Adding Level 2 later
// just means creating level2.js with the same shape and registering it in game.js.

function buildLevel1(groundY) {

  const WORLD_WIDTH = 4200;

  const groundHeight = 200;
  const platforms = [
    { x: 0, y: groundY, w: WORLD_WIDTH, h: groundHeight, type: 'ground' }
  ];

  const floaters = [
    { x: 420, y: groundY - 110, w: 140, h: 26 },
    { x: 760, y: groundY - 170, w: 120, h: 26 },
    { x: 1180, y: groundY - 120, w: 160, h: 26 },
    { x: 1620, y: groundY - 90, w: 130, h: 26 },
    { x: 2050, y: groundY - 150, w: 150, h: 26 },
    { x: 2480, y: groundY - 110, w: 140, h: 26 },
    { x: 2900, y: groundY - 170, w: 130, h: 26 },
    { x: 3260, y: groundY - 100, w: 120, h: 26 },
    { x: 3620, y: groundY - 60, w: 90, h: 26 },
    { x: 3760, y: groundY - 130, w: 90, h: 26 }
  ];
  for (const f of floaters) platforms.push({ ...f, type: 'floater' });

  const decorations = [
    { type: 'plant', x: 120, y: groundY },
    { type: 'coffeepoint', x: 300, y: groundY },
    { type: 'desk', x: 520, y: groundY },
    { type: 'monitor', x: 560, y: groundY },
    { type: 'meetingroom', x: 850, y: groundY },
    { type: 'plant', x: 1080, y: groundY },
    { type: 'printer', x: 1300, y: groundY },
    { type: 'desk', x: 1500, y: groundY },
    { type: 'monitor', x: 1540, y: groundY },
    { type: 'dashboard', x: 1780, y: groundY },
    { type: 'plant', x: 2000, y: groundY },
    { type: 'meetingroom', x: 2220, y: groundY },
    { type: 'coffeepoint', x: 2460, y: groundY },
    { type: 'desk', x: 2650, y: groundY },
    { type: 'monitor', x: 2690, y: groundY },
    { type: 'printer', x: 2900, y: groundY },
    { type: 'plant', x: 3100, y: groundY },
    { type: 'dashboard', x: 3300, y: groundY },
    { type: 'meetingroom', x: 3500, y: groundY },
    { type: 'plant', x: 3900, y: groundY }
  ];

  const signTexts = ['Тихо, идёт совещание', 'Budget Review', 'Q3 Results', 'KPI', 'Strategy', 'Director', 'Meeting Room', 'Finance', 'Deadline'];
  const signs = [];
  let sx = 250;
  let i = 0;
  while (sx < WORLD_WIDTH - 300) {
    signs.push({ text: signTexts[i % signTexts.length], x: sx, y: groundY - 260 });
    sx += 430;
    i++;
  }

  const collectibleLayout = [
    ['coffee', 200, groundY - 40],
    ['coffee', 460, groundY - 150],
    ['cigarette', 650, groundY - 40],
    ['coffee', 800, groundY - 210],
    ['cigarette', 1000, groundY - 40],
    ['coffee', 1220, groundY - 160],
    ['coffee', 1450, groundY - 40],
    ['cigarette', 1660, groundY - 130],
    ['coffee', 1900, groundY - 40],
    ['coffee', 2090, groundY - 190],
    ['cigarette', 2300, groundY - 40],
    ['coffee', 2520, groundY - 150],
    ['cigarette', 2750, groundY - 40],
    ['coffee', 2940, groundY - 210],
    ['coffee', 3150, groundY - 40],
    ['cigarette', 3300, groundY - 140],
    ['coffee', 3480, groundY - 40]
  ];

  const enemyLayout = [
    ['manager', 560, 480, 700],
    ['call', 950, 880, 1120],
    ['report', 1350, 1280, 1520],
    ['manager', 1720, 1620, 1900],
    ['zombie', 2150, 2050, 2350],
    ['call', 2550, 2480, 2700],
    ['quarterly', 2850, 2750, 3050],
    ['report', 3200, 3120, 3400],
    ['zombie', 3480, 3400, 3600]
  ];

  const bossX = 3920;
  const boss = { x: bossX, y: groundY - 150, w: 80, h: 150 };
  const door = { x: bossX + 160, y: groundY - 140, w: 70, h: 140 };

  return {
    worldWidth: WORLD_WIDTH,
    groundY,
    platforms,
    decorations,
    signs,
    collectibleLayout,
    enemyLayout,
    bossSpec: boss,
    doorSpec: door,
    playerStart: { x: 60, y: groundY - 200 }
  };
}

function instantiateLevel1(groundY) {
  const layout = buildLevel1(groundY);

  const collectibles = layout.collectibleLayout.map(([type, x, y]) => new Collectible(type, x, y));
  const enemies = layout.enemyLayout.map(([type, x, min, max]) => new Enemy(type, x, groundY - ENEMY_TYPES[type].h, min, max));
  const boss = new Boss(layout.bossSpec.x, layout.bossSpec.y, layout.bossSpec.w, layout.bossSpec.h);
  const signs = layout.signs.map(s => new Sign(s.text, s.x, s.y));

  return {
    worldWidth: layout.worldWidth,
    groundY: layout.groundY,
    platforms: layout.platforms,
    decorations: layout.decorations,
    signs,
    collectibles,
    enemies,
    boss,
    door: { ...layout.doorSpec, open: false },
    playerStart: layout.playerStart
  };
}
