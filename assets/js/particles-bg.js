/**
 * 粒子三角形网格背景
 * 顶点缓慢漂移，距离近的顶点之间连线构成三角形
 */
(function () {
    const canvas = document.createElement('canvas');
    canvas.id = 'particles-bg';
    canvas.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;z-index:-1;pointer-events:none;';
    document.body.prepend(canvas);

    const ctx = canvas.getContext('2d');
    let w, h, particles = [];
    // 移动端减少粒子数量，提升性能
    const isMobile = window.innerWidth < 768;
    const PARTICLE_COUNT = isMobile ? 30 : 60;
    const MAX_DIST = isMobile ? 120 : 150;
    const SPEED = 0.3;

    function resize() {
        w = canvas.width = window.innerWidth;
        h = canvas.height = window.innerHeight;
    }

    function initParticles() {
        particles = [];
        for (let i = 0; i < PARTICLE_COUNT; i++) {
            particles.push({
                x: Math.random() * w,
                y: Math.random() * h,
                vx: (Math.random() - 0.5) * SPEED * 2,
                vy: (Math.random() - 0.5) * SPEED * 2,
                r: Math.random() * 1.5 + 1
            });
        }
    }

    function getColor() {
        // 跟随主题：深色模式用亮色粒子，浅色模式用暗色粒子
        const isDark = document.body.classList.contains('dark-theme');
        return isDark
            ? { dot: 'rgba(145,130,255,0.8)', line: 'rgba(145,130,255,', fill: 'rgba(145,130,255,' }
            : { dot: 'rgba(100,80,180,0.6)', line: 'rgba(100,80,180,', fill: 'rgba(100,80,180,' };
    }

    function draw() {
        ctx.clearRect(0, 0, w, h);
        const color = getColor();

        // 更新位置
        for (const p of particles) {
            p.x += p.vx;
            p.y += p.vy;
            if (p.x < 0 || p.x > w) p.vx *= -1;
            if (p.y < 0 || p.y > h) p.vy *= -1;
        }

        // 找近邻，画三角形和连线
        const len = particles.length;
        for (let i = 0; i < len; i++) {
            const a = particles[i];

            // 画顶点
            ctx.beginPath();
            ctx.arc(a.x, a.y, a.r, 0, Math.PI * 2);
            ctx.fillStyle = color.dot;
            ctx.fill();

            for (let j = i + 1; j < len; j++) {
                const b = particles[j];
                const dAB = Math.hypot(a.x - b.x, a.y - b.y);
                if (dAB > MAX_DIST) continue;

                // 画连线
                const alphaLine = 1 - dAB / MAX_DIST;
                ctx.beginPath();
                ctx.moveTo(a.x, a.y);
                ctx.lineTo(b.x, b.y);
                ctx.strokeStyle = color.line + (alphaLine * 0.4) + ')';
                ctx.lineWidth = 0.5;
                ctx.stroke();

                // 找第三个点构成三角形
                for (let k = j + 1; k < len; k++) {
                    const c = particles[k];
                    const dAC = Math.hypot(a.x - c.x, a.y - c.y);
                    const dBC = Math.hypot(b.x - c.x, b.y - c.y);
                    if (dAC > MAX_DIST || dBC > MAX_DIST) continue;

                    const alphaFill = (1 - dAB / MAX_DIST) * (1 - dAC / MAX_DIST) * (1 - dBC / MAX_DIST);
                    ctx.beginPath();
                    ctx.moveTo(a.x, a.y);
                    ctx.lineTo(b.x, b.y);
                    ctx.lineTo(c.x, c.y);
                    ctx.closePath();
                    ctx.fillStyle = color.fill + (alphaFill * 0.08) + ')';
                    ctx.fill();
                }
            }
        }

        requestAnimationFrame(draw);
    }

    window.addEventListener('resize', () => { resize(); });
    resize();
    initParticles();
    draw();
})();
