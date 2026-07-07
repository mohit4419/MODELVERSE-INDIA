/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useRef } from 'react';

interface TwinkleStar {
  x: number;
  y: number;
  size: number;
  alpha: number;
  speed: number;
  phase: number;
}

interface ShootingStar {
  x: number;
  y: number;
  length: number;
  dx: number;
  dy: number;
  speed: number;
  alpha: number;
  color: string;
  width: number;
}

export default function ShootingStars() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animFrameId: number;

    // Retina support layout geometry
    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Initialise subtle background stellar dots (ambient twinkling)
    const stars: TwinkleStar[] = [];
    const maxAmbientStars = 45; // balanced density so it doesn't look cluttered
    
    for (let i = 0; i < maxAmbientStars; i++) {
      stars.push({
        x: Math.random() * window.innerWidth,
        y: Math.random() * window.innerHeight,
        size: Math.random() * 1.5 + 0.6,
        alpha: Math.random(),
        speed: 0.015 + Math.random() * 0.02,
        phase: Math.random() * Math.PI * 2
      });
    }

    // Active falling/shooting stars list
    let shootingStars: ShootingStar[] = [];

    // Branded custom colors matching Core Cast's premium layout gradient
    const brandColors = [
      '#f97316', // Orange
      '#ec4899', // Pink
      '#a855f7', // Purple
      '#8b5cf6'  // Violet
    ];

    const createShootingStar = () => {
      // Spawn from top-right region of screen
      const startX = Math.random() * (window.innerWidth * 1.3);
      const startY = -40;
      
      // Angle: roughly 135 degrees (descending leftward)
      const angle = (125 + Math.random() * 20) * (Math.PI / 180);
      const speed = 10 + Math.random() * 14;

      shootingStars.push({
        x: startX,
        y: startY,
        length: 80 + Math.random() * 120,
        dx: Math.cos(angle) * speed,
        dy: Math.sin(angle) * speed,
        speed: speed,
        alpha: 1.0,
        color: brandColors[Math.floor(Math.random() * brandColors.length)],
        width: 1.8 + Math.random() * 1.2
      });
    };

    let tick = 0;

    const updateRender = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      tick++;

      // 1. Draw subtle ambient star twinkling glow
      stars.forEach(star => {
        star.phase += star.speed;
        star.alpha = 0.15 + (Math.sin(star.phase) + 1) * 0.35; // gentle pulsing
        
        ctx.fillStyle = `rgba(249, 115, 22, ${star.alpha * 0.4})`; // soft orange ambient space dust
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
        ctx.fill();
      });

      // 2. Periodically spawn shooting stars
      if (tick % 160 === 0 || (Math.random() < 0.006 && shootingStars.length < 2)) {
        createShootingStar();
      }

      // 3. Drive physical meteor motion loops
      for (let i = shootingStars.length - 1; i >= 0; i--) {
        const star = shootingStars[i];
        
        // Draw the glowing vapor trial
        ctx.save();
        
        // Setup linear gradient along the meteor's vector length
        const grad = ctx.createLinearGradient(
          star.x, star.y, 
          star.x - star.dx * (star.length / star.speed), 
          star.y - star.dy * (star.length / star.speed)
        );
        grad.addColorStop(0, star.color);
        grad.addColorStop(1, 'rgba(0, 0, 0, 0)');

        ctx.strokeStyle = grad;
        ctx.lineWidth = star.width;
        ctx.lineCap = 'round';
        
        ctx.beginPath();
        ctx.moveTo(star.x, star.y);
        ctx.lineTo(
          star.x - star.dx * (star.length / star.speed * 0.4), 
          star.y - star.dy * (star.length / star.speed * 0.4)
        );
        ctx.stroke();
        
        // draw a tiny flare circle at the front tip
        ctx.fillStyle = star.color;
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.width * 1.2, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();

        // Move the meteor coordinates forward
        star.x += star.dx;
        star.y += star.dy;

        // Fade slightly based on screen location
        if (star.x < -200 || star.y > window.innerHeight + 200) {
          shootingStars.splice(i, 1);
        }
      }

      animFrameId = requestAnimationFrame(updateRender);
    };

    updateRender();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      cancelAnimationFrame(animFrameId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-[1] select-none block"
      style={{ opacity: 0.85 }}
    />
  );
}
