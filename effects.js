/* Mga animation: puso, paputok, rosas, bituin. Gumagamit ng isang canvas (#fx). */
(function () {
    const canvas = document.getElementById("fx");
    const ctx = canvas.getContext("2d");
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    let W = 0, H = 0;
    function resize() {
        const dpr = Math.min(window.devicePixelRatio || 1, 2);
        W = window.innerWidth;
        H = window.innerHeight;
        canvas.width = W * dpr;
        canvas.height = H * dpr;
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    window.addEventListener("resize", resize);
    resize();

    const COLORS = ["#ff6f9c", "#ff4d7d", "#ff3d84", "#ffd1dc", "#ff8fb1", "#ffb3c6"];
    const PETALS = ["#ff6f9c", "#ff4d7d", "#e63e6d", "#ffb3c6", "#ff8fb1"];
    const rand = (a, b) => a + Math.random() * (b - a);
    const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
    const scale = () => Math.max(0.6, Math.min(1.2, Math.min(W, H) / 800));

    let parts = [];
    let spawners = [];
    let running = false;
    let raf = 0;
    let last = 0;
    let endAt = 0;

    /* ---------- hugis ng puso ---------- */
    function heartPath(c, s) {
        c.beginPath();
        c.moveTo(0, s * 0.3);
        c.bezierCurveTo(0, 0, -s * 0.5, 0, -s * 0.5, s * 0.3);
        c.bezierCurveTo(-s * 0.5, s * 0.6, 0, s * 0.8, 0, s);
        c.bezierCurveTo(0, s * 0.8, s * 0.5, s * 0.6, s * 0.5, s * 0.3);
        c.bezierCurveTo(s * 0.5, 0, 0, 0, 0, s * 0.3);
        c.closePath();
    }

    /* ---------- mga puso na pataas ---------- */
    function spawnHeart() {
        const s = rand(16, 46) * scale();
        const p = {
            x: rand(0, W), y: H + s, s,
            vy: rand(70, 190), sway: rand(0.8, 2), phase: rand(0, 6.28), t: 0,
            color: pick(COLORS), rot: rand(-0.3, 0.3),
            update(dt) {
                this.t += dt;
                this.y -= this.vy * dt;
                this.x += Math.sin(this.t * this.sway + this.phase) * 28 * dt;
                return this.y > -this.s * 2;
            },
            draw(c) {
                const fade = Math.min(1, Math.max(0, (this.y + this.s) / (H * 0.3)));
                c.save();
                c.globalAlpha = 0.9 * fade;
                c.translate(this.x, this.y);
                c.rotate(this.rot + Math.sin(this.t * this.sway) * 0.15);
                c.shadowColor = this.color;
                c.shadowBlur = 14;
                c.fillStyle = this.color;
                heartPath(c, this.s);
                c.fill();
                c.restore();
            }
        };
        parts.push(p);
    }

    /* ---------- paputok ---------- */
    function spark(x, y, vx, vy, color, life) {
        parts.push({
            x, y, px: x, py: y, vx, vy, life, max: life, color,
            update(dt) {
                this.px = this.x;
                this.py = this.y;
                const drag = Math.pow(0.975, dt * 60);
                this.vx *= drag;
                this.vy = this.vy * drag + 190 * dt;
                this.x += this.vx * dt;
                this.y += this.vy * dt;
                this.life -= dt;
                return this.life > 0;
            },
            draw(c) {
                c.save();
                c.globalCompositeOperation = "lighter";
                c.globalAlpha = Math.max(0, this.life / this.max);
                c.strokeStyle = this.color;
                c.lineWidth = 2.2;
                c.lineCap = "round";
                c.beginPath();
                c.moveTo(this.px, this.py);
                c.lineTo(this.x, this.y);
                c.stroke();
                c.restore();
            }
        });
    }

    function explode(x, y) {
        const n = reduce ? 28 : 84;
        const R = rand(230, 320) * scale();
        const heart = Math.random() < 0.45;
        const palette = [pick(COLORS), pick(COLORS), "#ffffff"];
        for (let i = 0; i < n; i++) {
            const color = pick(palette);
            const life = rand(1.2, 1.9);
            if (heart) {
                const t = (i / n) * Math.PI * 2;
                const hx = 16 * Math.pow(Math.sin(t), 3);
                const hy = -(13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t));
                spark(x, y, (hx / 16) * R * 0.9, (hy / 17) * R * 0.9, color, life);
            } else {
                const a = rand(0, 6.283);
                const sp = rand(0.25, 1) * R;
                spark(x, y, Math.cos(a) * sp, Math.sin(a) * sp, color, life);
            }
        }
    }

    function launchRocket() {
        const targetY = rand(H * 0.14, H * 0.46);
        parts.push({
            x: rand(W * 0.15, W * 0.85), y: H + 10,
            vx: rand(-30, 30), vy: -H * rand(0.85, 1.05), targetY,
            update(dt) {
                this.x += this.vx * dt;
                this.y += this.vy * dt;
                if (this.y <= this.targetY) {
                    explode(this.x, this.y);
                    return false;
                }
                return true;
            },
            draw(c) {
                c.save();
                c.globalCompositeOperation = "lighter";
                const g = c.createLinearGradient(this.x, this.y, this.x, this.y + 46);
                g.addColorStop(0, "rgba(255,227,236,0.95)");
                g.addColorStop(1, "rgba(255,111,156,0)");
                c.strokeStyle = g;
                c.lineWidth = 3;
                c.lineCap = "round";
                c.beginPath();
                c.moveTo(this.x, this.y);
                c.lineTo(this.x - this.vx * 0.05, this.y + 46);
                c.stroke();
                c.restore();
            }
        });
    }

    /* ---------- talulot ng rosas ---------- */
    function spawnPetal() {
        const w = rand(7, 14) * scale();
        parts.push({
            x: rand(-20, W + 20), y: -20, w, h: w * rand(0.55, 0.8),
            vy: rand(55, 120), vx: rand(-20, 20), sway: rand(0.7, 1.8), phase: rand(0, 6.28),
            rot: rand(0, 6.28), vr: rand(-2.2, 2.2), t: 0, color: pick(PETALS),
            update(dt) {
                this.t += dt;
                this.y += this.vy * dt;
                this.x += (this.vx + Math.sin(this.t * this.sway + this.phase) * 45) * dt;
                this.rot += this.vr * dt;
                return this.y < H + 30;
            },
            draw(c) {
                c.save();
                c.globalAlpha = 0.92;
                c.translate(this.x, this.y);
                c.rotate(this.rot);
                c.scale(1, Math.abs(Math.cos(this.t * 1.6 + this.phase)) * 0.6 + 0.4);
                c.fillStyle = this.color;
                c.beginPath();
                c.moveTo(-this.w, 0);
                c.quadraticCurveTo(0, -this.h * 1.6, this.w, 0);
                c.quadraticCurveTo(0, this.h * 1.3, -this.w, 0);
                c.fill();
                c.restore();
            }
        });
    }

    /* ---------- bituin ---------- */
    function spawnTwinkle() {
        const max = rand(1.2, 2.4);
        parts.push({
            x: rand(0, W), y: rand(0, H * 0.9), r: rand(2, 6) * scale(),
            life: max, max, color: pick(["#ffffff", "#ffe3ec", "#c8a8ff", "#ffd1a8"]),
            update(dt) { this.life -= dt; return this.life > 0; },
            draw(c) {
                const a = Math.sin(Math.PI * (this.life / this.max));
                c.save();
                c.globalCompositeOperation = "lighter";
                c.globalAlpha = a;
                c.fillStyle = this.color;
                c.shadowColor = this.color;
                c.shadowBlur = 14;
                c.translate(this.x, this.y);
                c.beginPath();
                const r = this.r * (0.6 + a * 0.6);
                for (let i = 0; i < 8; i++) {
                    const rad = i % 2 === 0 ? r * 2.4 : r * 0.6;
                    const ang = (i * Math.PI) / 4;
                    c.lineTo(Math.cos(ang) * rad, Math.sin(ang) * rad);
                }
                c.closePath();
                c.fill();
                c.restore();
            }
        });
    }

    function spawnShootingStar() {
        const sp = rand(900, 1300);
        const ang = rand(0.45, 0.75);
        parts.push({
            x: rand(W * 0.3, W * 1.05), y: rand(-20, H * 0.3),
            vx: -Math.cos(ang) * sp, vy: Math.sin(ang) * sp, life: 0.9, max: 0.9,
            update(dt) {
                this.x += this.vx * dt;
                this.y += this.vy * dt;
                this.life -= dt;
                return this.life > 0;
            },
            draw(c) {
                const len = 0.11;
                c.save();
                c.globalCompositeOperation = "lighter";
                c.globalAlpha = Math.min(1, this.life / this.max * 1.6);
                const g = c.createLinearGradient(this.x, this.y, this.x - this.vx * len, this.y - this.vy * len);
                g.addColorStop(0, "rgba(255,255,255,1)");
                g.addColorStop(1, "rgba(200,168,255,0)");
                c.strokeStyle = g;
                c.lineWidth = 3;
                c.lineCap = "round";
                c.beginPath();
                c.moveTo(this.x, this.y);
                c.lineTo(this.x - this.vx * len, this.y - this.vy * len);
                c.stroke();
                c.restore();
            }
        });
    }

    /* ---------- listahan ng effects ---------- */
    const EFFECTS = {
        hearts:    [{ every: reduce ? 380 : 110, fn: spawnHeart }],
        fireworks: [{ every: 650, fn: launchRocket }],
        petals:    [{ every: reduce ? 300 : 85, fn: spawnPetal }],
        stars:     [{ every: 70, fn: spawnTwinkle }, { every: 700, fn: spawnShootingStar }]
    };

    function frame(ts) {
        const dt = Math.min((ts - last) / 1000, 0.05);
        last = ts;
        ctx.clearRect(0, 0, W, H);

        if (ts < endAt) {
            for (const s of spawners) {
                s.acc += dt * 1000;
                while (s.acc >= s.every) {
                    s.acc -= s.every;
                    s.fn();
                }
            }
        }

        for (let i = parts.length - 1; i >= 0; i--) {
            if (!parts[i].update(dt)) {
                parts.splice(i, 1);
            } else {
                parts[i].draw(ctx);
            }
        }

        if (ts < endAt || parts.length) {
            raf = requestAnimationFrame(frame);
        } else {
            running = false;
            ctx.clearRect(0, 0, W, H);
        }
    }

    function start() {
        if (running) return;
        running = true;
        last = performance.now();
        raf = requestAnimationFrame(frame);
    }

    /**
     * play("hearts" | "fireworks" | "petals" | "stars" | "all", milliseconds)
     */
    function play(name, ms) {
        if (reduce) return;
        const names = Array.isArray(name) ? name : name === "all" ? ["hearts", "fireworks", "petals", "stars"] : [name];
        spawners = [];
        names.forEach((n) => (EFFECTS[n] || []).forEach((e) => spawners.push({ every: e.every, fn: e.fn, acc: e.every })));
        endAt = performance.now() + ms;
        start();
    }

    function burst(x, y) {
        explode(x, y);
        start();
    }

    function stop() {
        endAt = 0;
        spawners = [];
        parts = [];
        cancelAnimationFrame(raf);
        running = false;
        ctx.clearRect(0, 0, W, H);
    }

    window.Effects = { play, stop, burst };
})();
