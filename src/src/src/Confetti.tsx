import React, { useEffect, useRef, useState } from "react";

type ConfettiParticle = {
  x: number;
  y: number;
  r: number;
  d: number;
  color: string;
  tilt: number;
  tiltAngle: number;
  tiltAngleIncremental: number;
};

const COLORS = [
  "#f44336", "#e91e63", "#9c27b0", "#673ab7", "#3f51b5",
  "#2196f3", "#03a9f4", "#00bcd4", "#009688", "#4caf50",
  "#8bc34a", "#cddc39", "#ffeb3b", "#ffc107", "#ff9800", "#ff5722"
];

function randomColor() {
  return COLORS[Math.floor(Math.random() * COLORS.length)];
}

function randomInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

interface ConfettiProps {
  active: boolean;
  duration: number; // in ms
}

const Confetti: React.FC<ConfettiProps> = ({ active, duration }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [fade, setFade] = useState(false);

  useEffect(() => {
    if (!active) return;
    setFade(false);

    const W = window.innerWidth;
    const H = window.innerHeight;
    const count = Math.floor(W / 8); // responsive aantal
    const particles: ConfettiParticle[] = [];

    for (let i = 0; i < count; i++) {
      particles.push({
        x: Math.random() * W,
        y: Math.random() * H - H,
        r: randomInt(7, 15),
        d: randomInt(10, 40),
        color: randomColor(),
        tilt: Math.floor(Math.random() * 10) - 10,
        tiltAngle: 0,
        tiltAngleIncremental: Math.random() * 0.07 + 0.05,
      });
    }

    let angle = 0;
    let animationFrame: number;

    const draw = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      ctx.clearRect(0, 0, W, H);

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        ctx.beginPath();
        ctx.lineWidth = p.r;
        ctx.strokeStyle = p.color;
        ctx.moveTo(p.x + p.tilt + p.r / 3, p.y);
        ctx.lineTo(p.x + p.tilt, p.y + p.tilt + p.r / 3);
        ctx.stroke();
      }

      update();
      animationFrame = requestAnimationFrame(draw);
    };

    const update = () => {
      angle += 0.02;
      for (let i = 0; i < particles.length; i++) {
        let p = particles[i];
        p.y += (Math.cos(angle + p.d) + 3 + p.r / 3) / 2;
        p.x += Math.sin(angle);
        p.tiltAngle += p.tiltAngleIncremental;
        p.tilt = Math.sin(p.tiltAngle) * 15;

        // weer op bovenkant als buiten scherm
        if (p.y > H) {
          p.x = Math.random() * W;
          p.y = -20;
          p.tilt = Math.floor(Math.random() * 10) - 10;
        }
      }
    };

    draw();

    // Fade-out laten starten laatste 500ms
    const fadeTimeout = setTimeout(() => setFade(true), duration - 500);
    // Stop en clean-up na duration
    const stopTimeout = setTimeout(() => {
      cancelAnimationFrame(animationFrame);
      setFade(false);
    }, duration);

    return () => {
      clearTimeout(fadeTimeout);
      clearTimeout(stopTimeout);
      cancelAnimationFrame(animationFrame);
      setFade(false);
    };
  }, [active, duration]);

  // canvas altijd op top van layout
  return active ? (
    <canvas
      ref={canvasRef}
      width={window.innerWidth}
      height={window.innerHeight}
      style={{
        position: "fixed",
        left: 0,
        top: 0,
        pointerEvents: "none",
        zIndex: 9999,
        opacity: fade ? 0 : 1,
        transition: "opacity 0.5s linear",
      }}
    />
  ) : null;
};

export default Confetti;
