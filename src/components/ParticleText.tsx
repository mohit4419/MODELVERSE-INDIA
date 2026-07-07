/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useRef } from 'react';

interface Particle {
  x: number;
  y: number;
  originX: number;
  originY: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  alpha: number;
  angle: number;
  speed: number;
}

export default function ParticleText() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return;

    // Retina support layout geometry
    const dpr = window.devicePixelRatio || 1;
    const width = 420;
    const height = 32;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    ctx.scale(dpr, dpr);

    const textStr = "INDIA'S PREMIUM CASTING ECOSYSTEM • V2.0 LIVE";
    
    // Draw crisp virtual offscreen canvas for exact letter vector outlines
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = width;
    tempCanvas.height = height;
    const tempCtx = tempCanvas.getContext('2d', { willReadFrequently: true });
    
    let particles: Particle[] = [];
    
    if (tempCtx) {
      tempCtx.font = "bold 11px ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace";
      tempCtx.fillStyle = "#ffffff";
      tempCtx.textAlign = "center";
      tempCtx.textBaseline = "middle";
      tempCtx.fillText(textStr, width / 2, height / 2);

      const imgData = tempCtx.getImageData(0, 0, width, height);
      const data = imgData.data;

      // Fine resolution sampling for high-density letter definition (sand-art crisp readable fidelity)
      const sampleRate = 1.3;
      for (let y = 0; y < height; y += sampleRate) {
        for (let x = 0; x < width; x += sampleRate) {
          const pxY = Math.floor(y);
          const pxX = Math.floor(x);
          const index = (pxY * width + pxX) * 4;
          const alpha = data[index + 3];

          if (alpha > 115) {
            // Stunning gradient mapping along the horizontal coordinates
            const percent = x / width;
            let color = "#f97316"; // Bright Orange
            if (percent > 0.3 && percent < 0.65) {
              color = "#ec4899"; // Vibrant Pink
            } else if (percent >= 0.65) {
              color = "#a855f7"; // Glowing Purple
            }

            // Generate particles dispersed in background coordinates initially
            particles.push({
              x: Math.random() * width,
              y: Math.random() * height,
              originX: x,
              originY: y,
              vx: (Math.random() - 0.5) * 1.5,
              vy: (Math.random() - 0.5) * 1.5,
              size: Math.random() * 0.7 + 0.6, // Fine micro-dust particles
              color,
              alpha: Math.random() * 0.3 + 0.7,
              angle: Math.random() * Math.PI * 2,
              speed: Math.random() * 0.08 + 0.04,
            });
          }
        }
      }
    }

    // 10-second exact repeating cycle running at 60fps (total 600 frames)
    let frameCount = 0;
    let state: "assembled" | "disintegrating" | "floating" | "assembling" = "assembled";
    let animationFrameId: number;

    const playCycle = () => {
      ctx.clearRect(0, 0, width, height);
      frameCount = (frameCount + 1) % 600;

      // Strict frame intervals for modern professional staging
      if (frameCount < 300) {
        state = "assembled";       // [0.0s - 5.0s] : Particles lock perfectly into crisp text
      } else if (frameCount < 360) {
        state = "disintegrating";  // [5.0s - 6.0s] : Explode and start dispersion
      } else if (frameCount < 500) {
        state = "floating";        // [6.0s - 8.3s] : Float gracefully like glowing wind dust
      } else {
        state = "assembling";      // [8.3s - 10.0s]: Magnetize back to original locations
      }

      particles.forEach((p) => {
        if (state === "assembled") {
          // Absolute structural locking with micro-vibrations for static readability
          p.x += (p.originX - p.x) * 0.45;
          p.y += (p.originY - p.y) * 0.45;
          p.alpha = 1;
        } 
        else if (state === "disintegrating") {
          // Instant shockwave and radial wind displacement on transition frame
          if (frameCount === 300) {
            const angle = Math.random() * Math.PI * 2;
            const speed = Math.random() * 3.0 + 1.5;
            p.vx = Math.cos(angle) * speed;
            p.vy = Math.sin(angle) * speed - 0.6; // upward hot draft
          }
          p.vx *= 0.94; // atmospheric resistance 
          p.vy *= 0.94;
          p.x += p.vx;
          p.y += p.vy;
          // Slowly dim as they dissolve
          p.alpha = Math.max(p.alpha - 0.015, 0.35);
        } 
        else if (state === "floating") {
          // Ambient organic Brownian thermal drifts
          p.angle += p.speed;
          p.x += Math.cos(p.angle) * 0.18 + (Math.random() - 0.5) * 0.06;
          p.y += Math.sin(p.angle) * 0.12 + (Math.random() - 0.5) * 0.06 - 0.03; // Soft upper lift
          
          if (p.alpha > 0.4) p.alpha -= 0.005;

          // Seamless boundary bounce
          if (p.x < 0) p.x = width;
          if (p.x > width) p.x = 0;
          if (p.y < 0) p.y = height;
          if (p.y > height) p.y = 0;
        } 
        else if (state === "assembling") {
          // Magnetic gravitational field centered on original pixel targets
          const dx = p.originX - p.x;
          const dy = p.originY - p.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          // Spring dynamics: Accelerate fast when far, snap cleanly with zero wobble
          const pull = Math.min(dist * 0.14, 4.2);
          
          p.vx = p.vx * 0.76 + (dx / (dist || 1)) * pull;
          p.vy = p.vy * 0.76 + (dy / (dist || 1)) * pull;

          p.x += p.vx;
          p.y += p.vy;
          p.alpha = Math.min(p.alpha + 0.04, 1.0);
        }

        // Render micro-particle glows
        ctx.fillStyle = p.color;
        ctx.globalAlpha = p.alpha;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
      });

      animationFrameId = requestAnimationFrame(playCycle);
    };

    playCycle();

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <div className="relative flex items-center justify-center rounded-full border border-orange-500/15 bg-orange-500/5 px-4 py-1 select-none pointer-events-none min-h-[38px] overflow-hidden">
      {/* 
        Pure Canvas Particle rendering 
        - High-density vector sand layout
        - Dynamic 10s cycle structure lock and explode dust vanish cycle
      */}
      <canvas ref={canvasRef} className="block overflow-hidden" />
    </div>
  );
}

