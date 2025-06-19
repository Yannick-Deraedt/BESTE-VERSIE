import React, { useEffect, useRef } from "react";

type ConfettiProps = {
  active: boolean;
  duration?: number; // duur in ms
};

type Particle = {
  x: number;
  y: number;
  w: number;
  h: number;
  color: string;
  speed: number;
  amplitude: number;
  freq: number;
  phase: number;
  alpha: number;
  startTime: number;
};

const COLORS = [
  "#ff3850", "#ffd700", "#27c93f", "#3498db", "#e67e22",
  "#9b59b6", "#f8c291", "#ffe066", "#fd79a8", "#a29bfe"
];

const Confetti: React.FC<ConfettiProps> = ({ active, duration = 8000 }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const particlesRef = useRef<Particle[]>([]);
  const animationRef = useRef<number>();
  const fadeOutRef = useRef(false);

  useEffect(() => {
    if (!active) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const dpr = window.devicePixelRatio || 1;
    canvas.width = window.innerWidth * dpr;
    canvas.height = window.innerHeight * dpr;
    canvas.style.width = window.innerWidth + "px";
    canvas.style.height = window.innerHeight + "px";

    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.setTransform(1, 0, 0, 1, 0, 0);

    // Config
    const PARTICLE_COUNT = Math.floor(window.innerWidth / 6); // aantal confetti: schaal met breedte
    const particles: Particle[] = [];
    const now = Date.now();
    fadeOutRef.current = false;

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const x = Math.random() * window.innerWidth * dpr;
      const y = Math.random() * -window.innerHeight * dpr * 0.5;
      const w = 7 + Math.random() * 5;
      const h = 3 + Math.random() * 6;
      const color = COLORS[Math.floor(Math.random() * COLORS.length)];
      const speed = 1.7 + Math.random() * 2.2;
      const amplitude = 20 + Math.random() * 30;
      const freq = 1.6 + Math.random() * 1.7;
      const phase = Math.random() * Math.PI * 2;
      particles.push({ x, y, w, h, color, speed, amplitude, freq, phase, alpha: 1, startTime: now });
    }
    particlesRef.current = particles;

    // Animation
    function animate() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const t = (Date.now() - now) / 1000;

      let allInvisible = true;

      for (let p of particles) {
        // Zigzag: y stijgt, x wiebelt sinusvormig (golfbeweging)
        p.y += p.speed * dpr;
        p.x += Math.sin(t * p.freq + p.phase) * p.amplitude * 0.014 * dpr;

        // Fade out
        if (fadeOutRef.current) {
          p.alpha -= 0.013; // fade out snelheid (kan je aanpassen)
          if (p.alpha < 0) p.alpha = 0;
        }

        if (p.y > canvas.height + 30 * dpr) {
          // respawn bovenaan (voor een vollere animatie)
          p.y = -20 * dpr;
          p.x = Math.random() * window.innerWidth * dpr;
          p.alpha = fadeOutRef.current ? 0 : 1;
        }

        if (p.alpha > 0.01) allInvisible = false;

        ctx.globalAlpha = p.alpha;
        ctx.fillStyle = p.color;
        ctx.fillRect(p.x, p.y, p.w * dpr, p.h * dpr);
        ctx.globalAlpha = 1;
      }

      if (!allInvisible) {
        animationRef.current = requestAnimationFrame(animate);
      }
    }

    animate();

    // Stop na X seconden, dan fade out
    const fadeTimer = setTimeout(() => {
      fadeOutRef.current = true;
    }, duration - 1400); // 1.4 sec fade

    // Volledig stoppen na alles onzichtbaar
    const stopTimer = setTimeout(() => {
      cancelAnimationFrame(animationRef.current!);
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }, duration);

    // Clean up
    return () => {
      cancelAnimationFrame(animationRef.current!);
      clearTimeout(fadeTimer);
      clearTimeout(stopTimer);
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    };
  }, [active, duration]);

  return (
    <canvas
      ref={canvasRef}
      style={{
        pointerEvents: "none",
        position: "fixed",
        left: 0,
        top: 0,
        width: "100vw",
        height: "100vh",
        zIndex: 9999,
        display: active ? "block" : "none"
      }}
      width={window.innerWidth}
      height={window.innerHeight}
      aria-hidden
    />
  );
};

export default Confetti;
