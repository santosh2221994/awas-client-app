import React, { useEffect, useRef, useState } from 'react';

const STATES = {
    dormant: { label: 'DORMANT', color: [124, 155, 255], pulse: 0.55, orbitSpeed: 0.15, particleEnergy: 0.3 },
    awake: { label: 'LISTENING', color: [124, 200, 255], pulse: 0.85, orbitSpeed: 0.4, particleEnergy: 0.6 },
    thinking: { label: 'THINKING', color: [190, 140, 255], pulse: 1.4, orbitSpeed: 1.4, particleEnergy: 1.2 },
    resolved: { label: 'RESOLVED', color: [80, 230, 190], pulse: 0.9, orbitSpeed: 0.5, particleEnergy: 0.5 },
};

export default function TheEntity({ pulseOnChange = true, showLabel = true }) {
    const [activeState, setActiveState] = useState('dormant');
    const canvasRef = useRef(null);

    const stateKeys = ['dormant', 'awake', 'thinking', 'resolved'];

    // References to preserve animation metrics without causing constant React re-renders
    const stateTRef = useRef(0);
    const t0Ref = useRef(0);
    const prevColorRef = useRef([...STATES.dormant.color]);
    const curColorRef = useRef([...STATES.dormant.color]);
    const activeStateRef = useRef('dormant');
    const particlesRef = useRef([]);
    const cometsRef = useRef([]);
    const shockwavesRef = useRef([]);
    const mouseRef = useRef({ x: 0, y: 0, targetX: 0, targetY: 0 });

    const triggerPulse = (W, H) => {
        shockwavesRef.current.push({
            x: W / 2,
            y: H / 2,
            r: 0,
            max: Math.max(W, H) * 0.9,
            alpha: 0.5,
        });
    };

    const transitionTo = (next, W, H) => {
        if (next === activeStateRef.current) return;
        prevColorRef.current = [...curColorRef.current];
        activeStateRef.current = next;
        setActiveState(next);
        stateTRef.current = 0;
        if (pulseOnChange) triggerPulse(W, H);
    };

    const handleClick = () => {
        const nextIndex = (stateKeys.indexOf(activeStateRef.current) + 1) % stateKeys.length;
        const nextState = stateKeys[nextIndex];
        if (canvasRef.current) {
            transitionTo(nextState, canvasRef.current.width, canvasRef.current.height);
        }
    };

    const onMouseMove = (e) => {
        if (!canvasRef.current) return;
        const rect = canvasRef.current.getBoundingClientRect();
        mouseRef.current.targetX = ((e.clientX - rect.left) / rect.width - 0.5) * 2;
        mouseRef.current.targetY = ((e.clientY - rect.top) / rect.height - 0.5) * 2;
    };

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const resize = () => {
            const dpr = Math.min(window.devicePixelRatio || 1, 2);
            const rect = canvas.getBoundingClientRect();
            const parentWidth = rect.width || 400;
            const parentHeight = rect.height || 400;
            canvas.width = parentWidth * dpr;
            canvas.height = parentHeight * dpr;
        };

        resize();
        window.addEventListener('resize', resize);
        canvas.addEventListener('mousemove', onMouseMove);

        const W = canvas.width;
        const H = canvas.height;

        // Seed Particles
        const initialParticles = [];
        for (let i = 0; i < 160; i++) {
            initialParticles.push({
                a: Math.random() * Math.PI * 2,
                r: 60 + Math.random() * Math.min(W, H) * 0.42,
                speed: (Math.random() * 0.4 + 0.15) * (Math.random() < 0.5 ? 1 : -1),
                size: Math.random() * 1.6 + 0.4,
                tilt: Math.random() * 0.5 + 0.15,
                twinklePhase: Math.random() * Math.PI * 2,
            });
        }
        particlesRef.current = initialParticles;

        // Seed Comets
        const initialComets = [];
        for (let i = 0; i < 5; i++) {
            initialComets.push({
                a: Math.random() * Math.PI * 2,
                speed: 0.006 + Math.random() * 0.006,
                dir: i % 2 === 0 ? 1 : -1,
                trail: [],
            });
        }
        cometsRef.current = initialComets;

        // Animation Loop
        t0Ref.current = performance.now();
        let rafId;

        const lerp = (a, b, t) => a + (b - a) * t;

        const frame = (now) => {
            const ctx = canvas.getContext('2d');
            if (!ctx) return;

            const currentW = canvas.width;
            const currentH = canvas.height;
            const dpr = Math.min(window.devicePixelRatio || 1, 2);
            const cx = currentW / 2;
            const cy = currentH / 2;

            const dt = Math.min((now - t0Ref.current) / 1000, 0.05);
            t0Ref.current = now;
            stateTRef.current += dt;

            const S = STATES[activeStateRef.current];
            const blend = Math.min(stateTRef.current / 0.8, 1);

            curColorRef.current = [0, 1, 2].map((i) =>
                lerp(prevColorRef.current[i], S.color[i], blend)
            );

            if (blend >= 1) {
                prevColorRef.current = [...S.color];
            }

            mouseRef.current.x = lerp(mouseRef.current.x, mouseRef.current.targetX, 0.06);
            mouseRef.current.y = lerp(mouseRef.current.y, mouseRef.current.targetY, 0.06);

            // Background Gradient Fill
            ctx.clearRect(0, 0, currentW, currentH);

            const [r, g, b] = curColorRef.current;
            const baseR = Math.min(currentW, currentH) * 0.11;
            const pulse = 1 + Math.sin((now / 1000) * 2 * S.pulse) * 0.06 * S.pulse;
            const coreR = baseR * pulse;

            // Render Particles
            particlesRef.current.forEach((p) => {
                p.a += p.speed * S.orbitSpeed * dt;
                const px = cx + Math.cos(p.a) * p.r + mouseRef.current.x * 20;
                const py = cy + Math.sin(p.a) * p.r * p.tilt + mouseRef.current.y * 14;
                const tw = 0.4 + Math.sin(now / 500 + p.twinklePhase) * 0.3 * S.particleEnergy;
                ctx.beginPath();
                ctx.arc(px, py, p.size * dpr, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(${r},${g},${b},${Math.max(tw, 0.08)})`;
                ctx.fill();
            });

            // Orbit guides
            ctx.strokeStyle = `rgba(${r},${g},${b},0.12)`;
            ctx.lineWidth = 1 * dpr;
            [1, 1.35, 1.7].forEach((m) => {
                ctx.beginPath();
                ctx.ellipse(cx, cy, baseR * 2.1 * m, baseR * 1.3 * m, 0.3, 0, Math.PI * 2);
                ctx.stroke();
            });

            // Comets tracking orbits
            cometsRef.current.forEach((c) => {
                c.a += c.speed * c.dir * (1 + S.orbitSpeed);
                const orbR = baseR * 2.1;
                const orbRy = baseR * 1.3;
                const x = cx + Math.cos(c.a) * orbR;
                const y = cy + Math.sin(c.a) * orbRy;

                c.trail.push({ x, y });
                if (c.trail.length > 16) c.trail.shift();

                c.trail.forEach((pt, i) => {
                    const alpha = (i / c.trail.length) * 0.5;
                    ctx.beginPath();
                    ctx.arc(pt.x, pt.y, 1.6 * dpr * (i / c.trail.length), 0, Math.PI * 2);
                    ctx.fillStyle = `rgba(${r},${g},${b},${alpha})`;
                    ctx.fill();
                });
            });

            // Shockwaves
            shockwavesRef.current = shockwavesRef.current.filter((sw) => sw.alpha > 0.01);
            shockwavesRef.current.forEach((sw) => {
                sw.r += (sw.max - sw.r) * 0.06 + 4 * dpr;
                sw.alpha *= 0.94;
                ctx.beginPath();
                ctx.arc(sw.x, sw.y, sw.r, 0, Math.PI * 2);
                ctx.strokeStyle = `rgba(${r},${g},${b},${sw.alpha})`;
                ctx.lineWidth = 2 * dpr;
                ctx.stroke();
            });

            // Core Ambient Glow Outer Layers
            for (let layer = 4; layer >= 0; layer--) {
                const rr = coreR * (1 + layer * 0.55);
                const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, rr);
                const a = layer === 0 ? 0.9 : 0.16 / layer;
                grad.addColorStop(0, `rgba(${r},${g},${b},${a})`);
                grad.addColorStop(1, `rgba(${r},${g},${b},0)`);
                ctx.beginPath();
                ctx.arc(cx + mouseRef.current.x * 6, cy + mouseRef.current.y * 4, rr, 0, Math.PI * 2);
                ctx.fillStyle = grad;
                ctx.fill();
            }

            // Main Solid Core
            const coreGrad = ctx.createRadialGradient(
                cx - coreR * 0.3 + mouseRef.current.x * 6,
                cy - coreR * 0.3 + mouseRef.current.y * 4,
                coreR * 0.05,
                cx + mouseRef.current.x * 6,
                cy + mouseRef.current.y * 4,
                coreR
            );
            coreGrad.addColorStop(0, '#ffffff');
            coreGrad.addColorStop(0.35, `rgba(${r},${g},${b},1)`);
            coreGrad.addColorStop(1, `rgba(${Math.floor(r * 0.3)},${Math.floor(g * 0.3)},${Math.floor(b * 0.4)},1)`);

            ctx.beginPath();
            ctx.arc(cx + mouseRef.current.x * 6, cy + mouseRef.current.y * 4, coreR * 0.7, 0, Math.PI * 2);
            ctx.fillStyle = coreGrad;
            ctx.fill();

            rafId = requestAnimationFrame(frame);
        };

        rafId = requestAnimationFrame(frame);

        return () => {
            cancelAnimationFrame(rafId);
            window.removeEventListener('resize', resize);
            canvas.removeEventListener('mousemove', onMouseMove);
        };
    }, [pulseOnChange]);

    return (
        <div
            className="relative w-full h-full bg-transparent overflow-hidden flex flex-col items-center justify-center select-none"
            onClick={handleClick}
        >
            <canvas
                ref={canvasRef}
                className="absolute inset-0 block w-full h-full cursor-pointer z-0"
            />
            <div
                className="absolute inset-0 pointer-events-none bg-[radial-gradient(ellipse_at_center,_transparent_35%,_rgba(0,0,0,0.75)_100%)] z-10"
            />
            {showLabel && (
                <div className="absolute left-1/2 bottom-8 -translate-x-1/2 text-center pointer-events-none select-none z-20">
                    <div className="font-mono text-[10px] uppercase tracking-[0.35em] text-[#8fa3ff] opacity-85">
                        {STATES[activeState].label}
                    </div>
                    <div className="text-[9px] text-zinc-550 mt-1 block tracking-wider font-semibold">
                        (click core to toggle states)
                    </div>
                </div>
            )}
        </div>
    );
}
