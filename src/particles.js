const canvas = document.getElementById('particle-canvas');
const ctx = canvas.getContext('2d');
let particles = [];
let fallingPumpkins = [];

function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}

window.addEventListener('resize', resizeCanvas);
resizeCanvas();

class Particle {
  constructor(x, y, type) {
    this.x = x;
    this.y = y;
    this.type = type;
    this.life = 1;
    this.decay = 0.01 + Math.random() * 0.02;
    this.size = 10 + Math.random() * 10;
    this.vx = (Math.random() - 0.5) * 4;
    this.vy = -2 - Math.random() * 4;
    this.gravity = 0.08;
    this.rotation = Math.random() * Math.PI * 2;
    this.rotationSpeed = (Math.random() - 0.5) * 0.1;

    if (type === 'heart') {
      this.color = `hsl(${340 + Math.random() * 30}, 80%, 60%)`;
      this.size = 12 + Math.random() * 8;
    } else if (type === 'sparkle') {
      this.color = `hsl(${40 + Math.random() * 30}, 100%, 70%)`;
      this.size = 4 + Math.random() * 6;
      this.decay = 0.02 + Math.random() * 0.03;
    } else if (type === 'confetti') {
      this.color = `hsl(${Math.random() * 360}, 80%, 60%)`;
      this.size = 8 + Math.random() * 6;
      this.vy = -6 - Math.random() * 6;
      this.vx = (Math.random() - 0.5) * 8;
      this.decay = 0.005 + Math.random() * 0.01;
    } else if (type === 'mop-sparkle') {
      this.color = `hsl(${180 + Math.random() * 40}, 80%, 70%)`;
      this.size = 3 + Math.random() * 5;
      this.decay = 0.03 + Math.random() * 0.03;
      this.vx = (Math.random() - 0.5) * 1;
      this.vy = (Math.random() - 0.5) * 1;
      this.gravity = 0;
    }
  }

  update() {
    this.x += this.vx;
    this.y += this.vy;
    this.vy += this.gravity;
    this.life -= this.decay;
    this.rotation += this.rotationSpeed;
  }

  draw(ctx) {
    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.rotate(this.rotation);
    ctx.globalAlpha = Math.max(0, this.life);

    if (this.type === 'heart') {
      this.drawHeart(ctx);
    } else if (this.type === 'sparkle' || this.type === 'mop-sparkle') {
      this.drawSparkle(ctx);
    } else if (this.type === 'confetti') {
      this.drawConfetti(ctx);
    }

    ctx.restore();
  }

  drawHeart(ctx) {
    const s = this.size;
    ctx.fillStyle = this.color;
    ctx.beginPath();
    ctx.moveTo(0, s * 0.3);
    ctx.bezierCurveTo(-s * 0.5, -s * 0.3, -s, s * 0.1, 0, s);
    ctx.bezierCurveTo(s, s * 0.1, s * 0.5, -s * 0.3, 0, s * 0.3);
    ctx.fill();
  }

  drawSparkle(ctx) {
    const s = this.size;
    ctx.fillStyle = this.color;
    // 4-pointed star
    ctx.beginPath();
    for (let i = 0; i < 4; i++) {
      const angle = (i / 4) * Math.PI * 2;
      const outerX = Math.cos(angle) * s;
      const outerY = Math.sin(angle) * s;
      const innerAngle = angle + Math.PI / 4;
      const innerX = Math.cos(innerAngle) * s * 0.3;
      const innerY = Math.sin(innerAngle) * s * 0.3;
      if (i === 0) ctx.moveTo(outerX, outerY);
      else ctx.lineTo(outerX, outerY);
      ctx.lineTo(innerX, innerY);
    }
    ctx.closePath();
    ctx.fill();
  }

  drawConfetti(ctx) {
    ctx.fillStyle = this.color;
    ctx.fillRect(-this.size / 2, -this.size / 4, this.size, this.size / 2);
  }
}

let loopRunning = false;

function renderLoop() {
  const hasParticles = particles.length > 0;
  const hasPumpkins = fallingPumpkins.length > 0;

  if (!hasParticles && !hasPumpkins) {
    loopRunning = false;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    return;
  }

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Update and draw particles
  particles = particles.filter(p => p.life > 0);
  for (const p of particles) {
    p.update();
    p.draw(ctx);
  }

  // Update and draw falling pumpkins
  fallingPumpkins = fallingPumpkins.filter(p => {
    p.y += p.vy;
    p.rotation += p.rotationSpeed;

    if (!p.caught && p.y > canvas.height - 250) {
      p.caught = true;
      if (p.onCatch) p.onCatch(p.x, p.y);
      return false;
    }

    if (p.y > canvas.height + 50) return false;

    ctx.save();
    ctx.translate(p.x, p.y);
    ctx.rotate(p.rotation);
    ctx.font = `${p.size}px serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('🎃', 0, 0);
    ctx.restore();

    return true;
  });

  requestAnimationFrame(renderLoop);
}

function startLoop() {
  if (!loopRunning) {
    loopRunning = true;
    renderLoop();
  }
}

function startAnimation() {
  startLoop();
}

export function spawnHearts(x, y, count = 5) {
  for (let i = 0; i < count; i++) {
    particles.push(new Particle(x + (Math.random() - 0.5) * 30, y, 'heart'));
  }
  startAnimation();
}

export function spawnSparkles(x, y, count = 8) {
  for (let i = 0; i < count; i++) {
    particles.push(new Particle(x + (Math.random() - 0.5) * 40, y + (Math.random() - 0.5) * 40, 'sparkle'));
  }
  startAnimation();
}

export function spawnConfetti(count = 100) {
  for (let i = 0; i < count; i++) {
    const x = Math.random() * canvas.width;
    const y = canvas.height + 20;
    particles.push(new Particle(x, y, 'confetti'));
  }
  // Also spawn from top
  for (let i = 0; i < count; i++) {
    const x = Math.random() * canvas.width;
    const y = -20;
    const p = new Particle(x, y, 'confetti');
    p.vy = 2 + Math.random() * 4;
    particles.push(p);
  }
  startAnimation();
}

export function spawnMopSparkles(x, y) {
  for (let i = 0; i < 3; i++) {
    particles.push(new Particle(x + (Math.random() - 0.5) * 20, y + (Math.random() - 0.5) * 20, 'mop-sparkle'));
  }
  startAnimation();
}

export function spawnFallingPumpkin(onCatch) {
  const x = 80 + Math.random() * (canvas.width - 160);
  fallingPumpkins.push({
    x,
    y: -30,
    vy: 1.5 + Math.random() * 1.5,
    size: 28,
    rotation: 0,
    rotationSpeed: (Math.random() - 0.5) * 0.05,
    caught: false,
    onCatch,
  });
  startLoop();
}
