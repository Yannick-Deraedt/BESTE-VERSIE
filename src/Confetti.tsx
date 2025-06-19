import React, { useRef, useEffect } from "react";

type ConfettiProps = {
  active: boolean;
  duration?: number; // ms
};

type Confetto = {
  x: number;
  y: number;
  w: number;
  h: number;
  color: string;
  angle: number;
  speed: number;
  zigzag: number;
  zigzagDir: number;
  opacity: number;
};

const COLORS = [
  "#ffd700", "#1679bc", "#e66472", "#50c878", "#e7effb", "#fffbe6", "#f1ffe9"
];

function random(min: number, max: number) {
  return Math.random() * (max - min) + min;
}

const Confetti: React.FC<ConfettiProps> = ({ active, duration = 7000 }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animFrame = useRef<number>();
  const confetti = useRef<Confetto[]>([]);
  const fadeOut = useRef(false);
  const fadeStart = useRef(0);

  // Sizing
  useEffect(() => {
    function resize() {
      if (canvasRef.current) {
        canvasRef.current.width = window.innerWidth;
        canvasRef.current.height = window.innerHeight;
      }
    }
    resize();
    window.addEventListener("resize", resize);
    return () => window.removeEventListener("resize", resize);
  }, []);

  useEffect(() => {
    let running = true;
    if (active) {
      const width = window.innerWidth;
      const height = window.innerHeight;
      const amount = Math.floor(width / 9); // veel confetti

      confetti.current = Array.from({ length: amount }).map(() => ({
        x: random(0, width),
        y: random(-height * random(0.04, 0.3), 0),
        w: random(10, 22),
        h: random(4, 13),
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
        angle: random(0, 360),
        speed: random(1.3, 2.5),
        zigzag: random(1.0, 2.2),
        zigzagDir: Math.random() < 0.5 ? -1 : 1,
        opacity: 1
      }));
      fadeOut.current = false;
      fadeStart.current = 0;

      const start = performance.now();
      const total = duration;
      let lastNow = start;

      function animate(now: number) {
        if (!running) return;
        const elapsed = now - start;
        const width = window.innerWidth;
        const height = window.innerHeight;
        const ctx = canvasRef.current?.getContext("2d");
        if (!ctx || !canvasRef.current) return;

        ctx.clearRect(0, 0, width, height);

        // Start fade-out 1.5s voor einde
        if (!fadeOut.current && elapsed > total - 1500) {
          fadeOut.current = true;
          fadeStart.current = now;
        }
        let fadeFac = 1;
        if (fadeOut.current) {
          fadeFac = Math.max(0, 1 - (now - fadeStart.current) / 1500);
        }

        for (let conf of confetti.current) {
          // Zigzag-move
          conf.x += Math.sin((conf.y + conf.w * 5) * 0.05) * conf.zigzag * conf.zigzagDir;
          conf.y += conf.speed;
          conf.angle += conf.speed * 0.5;
          conf.opacity = fadeFac;

          // Draw as rechthoek
          ctx.save();
          ctx.globalAlpha = conf.opacity;
          ctx.translate(conf.x, conf.y);
          ctx.rotate((conf.angle * Math.PI) / 180);
          ctx.fillStyle = conf.color;
          ctx.fillRect(-conf.w / 2, -conf.h / 2, conf.w, conf.h);
          ctx.restore();
        }

        animFrame.current = requestAnimationFrame(animate);
      }

      animFrame.current = requestAnimationFrame(animate);

      // Stop na duration
      setTimeout(() => {
        running = false;
        if (canvasRef.current) {
          const ctx = canvasRef.current.getContext("2d");
          ctx && ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
        }
      }, duration + 500);
    }
    return () => {
      running = false;
      if (animFrame.current) cancelAnimationFrame(animFrame.current);
      if (canvasRef.current) {
        const ctx = canvasRef.current.getContext("2d");
        ctx && ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
      }
    };
  }, [active, duration]);

  return (
    <canvas
      ref={canvasRef}
      style={{
        pointerEvents: "none",
        position: "fixed",
        inset: 0,
        width: "100vw",
        height: "100vh",
        zIndex: 90
      }}
      aria-hidden="true"
    />
  );
};

export default Confetti;
