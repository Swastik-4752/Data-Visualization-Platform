"use client";

import { useEffect, useRef } from 'react';

interface Particle {
  x: number;
  y: number;
  size: number;
  speedX: number;
  speedY: number;
  opacity: number;
  color: string;
}

export default function CursorParticles() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const mouseRef = useRef({ x: 0, y: 0 });
  const animationFrameRef = useRef<number>();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Create particles
    const createParticles = () => {
      const particles: Particle[] = [];
      const particleCount = 50;
      
      for (let i = 0; i < particleCount; i++) {
        particles.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          size: Math.random() * 3 + 1,
          speedX: (Math.random() - 0.5) * 0.5,
          speedY: (Math.random() - 0.5) * 0.5,
          opacity: Math.random() * 0.5 + 0.2,
          color: `rgba(255, 255, 255, ${Math.random() * 0.3 + 0.1})`
        });
      }
      
      particlesRef.current = particles;
    };

    createParticles();

    // Mouse move handler
    const handleMouseMove = (e: MouseEvent) => {
      mouseRef.current = { x: e.clientX, y: e.clientY };
      
      // Create new particles at cursor position
      for (let i = 0; i < 3; i++) {
        particlesRef.current.push({
          x: e.clientX + (Math.random() - 0.5) * 20,
          y: e.clientY + (Math.random() - 0.5) * 20,
          size: Math.random() * 2 + 1,
          speedX: (Math.random() - 0.5) * 2,
          speedY: (Math.random() - 0.5) * 2,
          opacity: Math.random() * 0.5 + 0.5,
          color: `rgba(255, 255, 255, ${Math.random() * 0.4 + 0.3})`
        });
      }
    };

    window.addEventListener('mousemove', handleMouseMove);

    // Animation loop
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Update and draw particles
      particlesRef.current = particlesRef.current.filter(particle => {
        // Attract particles towards cursor
        const dx = mouseRef.current.x - particle.x;
        const dy = mouseRef.current.y - particle.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance < 100) {
          const force = (100 - distance) / 100;
          particle.speedX += (dx / distance) * force * 0.1;
          particle.speedY += (dy / distance) * force * 0.1;
        }

        // Update position
        particle.x += particle.speedX;
        particle.y += particle.speedY;

        // Apply friction
        particle.speedX *= 0.98;
        particle.speedY *= 0.98;

        // Fade out
        particle.opacity *= 0.99;

        // Draw particle
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
        ctx.fillStyle = particle.color.replace(/[\d\.]+\)$/g, `${particle.opacity})`);
        ctx.fill();

        // Draw connection lines between nearby particles
        particlesRef.current.forEach(otherParticle => {
          const dx = otherParticle.x - particle.x;
          const dy = otherParticle.y - particle.y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          if (distance < 100) {
            ctx.beginPath();
            ctx.moveTo(particle.x, particle.y);
            ctx.lineTo(otherParticle.x, otherParticle.y);
            ctx.strokeStyle = `rgba(255, 255, 255, ${(1 - distance / 100) * 0.05})`;
            ctx.lineWidth = 0.3;
            ctx.stroke();
          }
        });

        // Remove particles that are too faded or out of bounds
        return particle.opacity > 0.01 && 
               particle.x > -50 && particle.x < canvas.width + 50 &&
               particle.y > -50 && particle.y < canvas.height + 50;
      });

      animationFrameRef.current = requestAnimationFrame(animate);
    };

    animate();

    // Cleanup
    return () => {
      window.removeEventListener('resize', resizeCanvas);
      window.removeEventListener('mousemove', handleMouseMove);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed top-0 left-0 w-full h-full pointer-events-none z-0"
      style={{ background: 'transparent' }}
    />
  );
}

