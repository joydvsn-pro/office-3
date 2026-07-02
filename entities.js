// entities.js — Player, Enemy, Boss, Collectible classes + shared physics constants.

const PHYSICS = {
  gravity: 0.62,
  maxFall: 15,
  moveSpeed: 3.4,
  accel: 0.5,
  friction: 0.72,
  jumpVelocity: -12.6,
  groundY: 460 // baseline ground top (world coords), set per-level too
};

function aabbOverlap(a, b) {
  return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
}

// ---------------------------------------------------------------- Player
class Player {
  constructor(x, y) {
    this.x = x; this.y = y;
    this.w = 34; this.h = 46;
    this.vx = 0; this.vy = 0;
    this.onGround = false;
    this.facing = 1;
    this.state = 'idle'; // idle, run, jump, fall, win, dead
    this.animTimer = 0;
    this.animFrame = 0;
    this.invincibleTimer = 0;
    this.dead = false;
    this.won = false;
    this.stress = 0;
    this.maxStress = 20;
    this.energy = 40;
    this.maxEnergy = 100;
    this.score = 0;
    this.coffeeCount = 0;
  }

  get bottom() { return this.y + this.h; }
  get right() { return this.x + this.w; }

  hurt(amount) {
    if (this.invincibleTimer > 0 || this.dead || this.won) return false;
    this.stress = Math.min(this.maxStress, this.stress + amount);
    this.invincibleTimer = 70;
    Audio2.hit();
    if (this.stress >= this.maxStress) {
      this.triggerBurnout();
    }
    return true;
  }

  triggerBurnout() {
    if (this.dead) return;
    this.dead = true;
    this.state = 'dead';
    this.vx = 0;
    this.vy = -6;
    Audio2.lose();
  }

  triggerWin() {
    if (this.won) return;
    this.won = true;
    this.state = 'win';
    this.vx = 0;
    Audio2.win();
  }

  update(input, platforms) {
    if (this.won || this.dead) {
      this.vy = Math.min(this.vy + PHYSICS.gravity, PHYSICS.maxFall);
      this.y += this.vy;
      this._resolveVertical(platforms);
      this.animTimer++;
      return;
    }

    if (input.left) { this.vx -= PHYSICS.accel; this.facing = -1; }
    if (input.right) { this.vx += PHYSICS.accel; this.facing = 1; }
    if (!input.left && !input.right) this.vx *= PHYSICS.friction;
    this.vx = Math.max(-PHYSICS.moveSpeed, Math.min(PHYSICS.moveSpeed, this.vx));
    if (Math.abs(this.vx) < 0.03) this.vx = 0;

    if (input.jumpPressed && this.onGround) {
      this.vy = PHYSICS.jumpVelocity;
      this.onGround = false;
      Audio2.jump();
    }

    this.vy = Math.min(this.vy + PHYSICS.gravity, PHYSICS.maxFall);

    this.x += this.vx;
    this._resolveHorizontal(platforms);
    const wasFalling = this.vy > 0;
    const groundedBefore = this.onGround;
    this.y += this.vy;
    this.onGround = false;
    this._resolveVertical(platforms);
    if (this.onGround && !groundedBefore && wasFalling) Audio2.land();

    if (this.invincibleTimer > 0) this.invincibleTimer--;
    if (!this.onGround) {
      this.state = this.vy < 0 ? 'jump' : 'fall';
    } else if (Math.abs(this.vx) > 0.3) {
      this.state = 'run';
    } else {
      this.state = 'idle';
    }
    this.animTimer++;
  }

  _resolveHorizontal(platforms) {
    for (const p of platforms) {
      if (!aabbOverlap(this, p)) continue;
      if (this.vx > 0) this.x = p.x - this.w;
      else if (this.vx < 0) this.x = p.x + p.w;
      this.vx = 0;
    }
    if (this.x < 0) this.x = 0;
  }

  _resolveVertical(platforms) {
    for (const p of platforms) {
      if (!aabbOverlap(this, p)) continue;
      if (this.vy > 0) {
        this.y = p.y - this.h;
        this.vy = 0;
        this.onGround = true;
      } else if (this.vy < 0) {
        this.y = p.y + p.h;
        this.vy = 0;
      }
    }
  }
}

// ---------------------------------------------------------------- Enemy
const ENEMY_TYPES = {
  manager: { label: 'Менеджер', emoji: '🧑‍💼', w: 34, h: 42, speed: 1.1, pattern: 'patrol', color: '#5b6b8c' },
  call: { label: 'Срочный созвон', emoji: '📞', w: 30, h: 30, speed: 1.7, pattern: 'wave', color: '#ff8a65' },
  report: { label: 'Отчёт', emoji: '📄', w: 28, h: 32, speed: 1.9, pattern: 'wave', color: '#f2c94c' },
  zombie: { label: 'Выгоревший коллега', emoji: '🧟', w: 34, h: 44, speed: 0.7, pattern: 'patrol', color: '#8a9a7a' },
  quarterly: { label: 'После квартального отчёта', emoji: '😵', w: 34, h: 42, speed: 1.4, pattern: 'erratic', color: '#b06ab3' }
};

class Enemy {
  constructor(type, x, y, rangeMin, rangeMax) {
    this.type = type;
    const def = ENEMY_TYPES[type];
    this.def = def;
    this.x = x; this.y = y;
    this.w = def.w; this.h = def.h;
    this.vx = def.speed;
    this.vy = 0;
    this.rangeMin = rangeMin;
    this.rangeMax = rangeMax;
    this.baseY = y;
    this.alive = true;
    this.squash = 0;
    this.timer = Math.random() * 100;
  }

  get bottom() { return this.y + this.h; }

  update() {
    if (!this.alive) { this.squash = Math.min(1, this.squash + 0.1); return; }
    this.timer += 1;

    if (this.def.pattern === 'patrol') {
      this.x += this.vx;
      if (this.x < this.rangeMin || this.x + this.w > this.rangeMax) this.vx *= -1;
    } else if (this.def.pattern === 'wave') {
      this.x += this.vx;
      if (this.x < this.rangeMin || this.x + this.w > this.rangeMax) this.vx *= -1;
      this.y = this.baseY + Math.sin(this.timer * 0.1) * 14;
    } else if (this.def.pattern === 'erratic') {
      this.x += this.vx;
      if (this.x < this.rangeMin || this.x + this.w > this.rangeMax || Math.random() < 0.01) this.vx *= -1;
      if (Math.random() < 0.03) this.vx = this.def.speed * (Math.random() < 0.5 ? 1 : -1);
    }
  }

  defeat() {
    this.alive = false;
    Audio2.stomp();
  }
}

// ---------------------------------------------------------------- Boss
class Boss {
  constructor(x, y, w = 70, h = 110) {
    this.x = x; this.y = y; this.w = w; this.h = h;
    this.baseY = y;
    this.timer = 0;
  }
  update() {
    this.timer += 1;
    this.y = this.baseY + Math.sin(this.timer * 0.05) * 4;
  }
}

// ---------------------------------------------------------------- Collectible
class Collectible {
  constructor(type, x, y) {
    this.type = type; // 'coffee' | 'cigarette'
    this.x = x; this.y = y;
    this.w = 26; this.h = 26;
    this.collected = false;
    this.bobTimer = Math.random() * 10;
  }
  update() { this.bobTimer += 0.08; }
  get drawY() { return this.y + Math.sin(this.bobTimer) * 4; }
}

// ---------------------------------------------------------------- Sign (wall decoration)
class Sign {
  constructor(text, x, y) {
    this.text = text; this.x = x; this.y = y;
  }
}
