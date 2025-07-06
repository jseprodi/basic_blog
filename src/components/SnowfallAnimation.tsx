'use client';

import { useEffect, useRef, useState } from 'react';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  opacity: number;
  baseHue: number;
  swirlSeed: number;
}

export default function SnowfallAnimation() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number | undefined>(undefined);
  const [mounted, setMounted] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const animationInitializedRef = useRef(false);

  useEffect(() => {
    setIsClient(true);
    setMounted(true);
    console.log("SnowfallAnimation: setMounted(true) called");
  }, []);

  useEffect(() => {
    if (!mounted || !isClient) {
      console.log("SnowfallAnimation: not mounted or not client, skipping animation setup");
      return;
    }
    if (animationInitializedRef.current) {
      console.log("SnowfallAnimation: animation already initialized, skipping");
      return;
    }
    console.log("SnowfallAnimation: starting animation setup");
    animationInitializedRef.current = true;
    
    const canvas = canvasRef.current;
    if (!canvas) {
      console.log("SnowfallAnimation: canvas ref is null");
      return;
    }
    console.log("SnowfallAnimation: canvas found, getting context");
    
    const ctx = canvas.getContext("2d");
    if (!ctx) {
      console.log("SnowfallAnimation: could not get 2d context");
      return;
    }
    console.log("SnowfallAnimation: 2d context obtained");

    // Particle system
    const particleCount = 700;
    let particles: Particle[] = [];
    const baseHue = 200 + Math.random() * 40; // bluish-white

    function createParticle(): Particle {
      if (!canvas) return {
        x: 0,
        y: 0,
        vx: 0,
        vy: 0,
        size: 1,
        opacity: 0.5,
        baseHue: baseHue,
        swirlSeed: 0,
      };
      return {
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: 0,
        vy: 0,
        size: Math.random() * 2.5 + 1.5,
        opacity: Math.random() * 0.5 + 0.3,
        baseHue: baseHue + Math.random() * 20 - 10,
        swirlSeed: Math.random() * 1000,
      };
    }

    // Responsive canvas - ensure it stays within container bounds
    const resizeCanvas = () => {
      if (!canvas) return;
      const container = canvas.parentElement;
      console.log("SnowfallAnimation: container found:", !!container);
      if (container) {
        const rect = container.getBoundingClientRect();
        console.log("SnowfallAnimation: container rect:", rect);
        // Only resize if dimensions have actually changed significantly
        if (Math.abs(canvas.width - rect.width) > 1 || Math.abs(canvas.height - rect.height) > 1) {
          canvas.width = rect.width;
          canvas.height = rect.height;
          console.log("SnowfallAnimation: resized canvas to", rect.width, "x", rect.height);
          // Reposition all particles randomly across the new canvas area
          particles.forEach(p => {
            p.x = Math.random() * canvas.width;
            p.y = Math.random() * canvas.height;
          });
        }
      } else {
        // Fallback to viewport-based sizing
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight * 0.5;
        console.log("SnowfallAnimation: fallback resize to", canvas.width, "x", canvas.height);
        particles.forEach(p => {
          p.x = Math.random() * canvas.width;
          p.y = Math.random() * canvas.height;
        });
      }
    };
    // Delay to ensure DOM is fully rendered
    setTimeout(() => {
      resizeCanvas();
      // Only create particles after canvas is sized
      particles = [];
      for (let i = 0; i < particleCount; i++) {
        particles.push(createParticle());
      }
    }, 100);
    window.addEventListener("resize", resizeCanvas);

    let time = 0;
    function animate() {
      if (!canvas || !ctx) return;
      // Debug log to confirm animation is running
      if (time % 1 < 0.02) console.log("SnowfallAnimation: animation frame", time.toFixed(2), "canvas size:", canvas.width, "x", canvas.height);
      time += 0.012;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Set clipping path to ensure content stays within bounds
      ctx.save();
      ctx.beginPath();
      ctx.rect(0, 0, canvas.width, canvas.height);
      ctx.clip();

      // Subtle background gradient
      const grad = ctx.createLinearGradient(0, 0, 0, canvas.height);
      grad.addColorStop(0, "rgba(30,40,60,0.12)");
      grad.addColorStop(1, "rgba(10,20,30,0.22)");
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw particles
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        // Swirling wind field (per-particle)
        const swirlAngle =
          Math.sin(time * 1.2 + p.swirlSeed) * 2.5 +
          Math.cos(time * 0.7 + p.x * 0.002 + p.swirlSeed) * 1.5;
        const swirlStrength = 0.7 + Math.sin(time * 0.5 + p.swirlSeed) * 0.5;
        const windX = Math.cos(swirlAngle) * swirlStrength;
        const windY = Math.sin(swirlAngle) * swirlStrength;
        // Update velocity (add some inertia)
        p.vx += (windX - p.vx) * 0.02 + (Math.random() - 0.5) * 0.01;
        p.vy += (windY - p.vy) * 0.02 + (Math.random() - 0.5) * 0.01;
        // Move
        p.x += p.vx;
        p.y += p.vy;
        // Wrap around edges for endless blizzard - with stricter boundaries
        if (p.x < -10) p.x = canvas.width + 10;
        if (p.x > canvas.width + 10) p.x = -10;
        if (p.y < -10) p.y = canvas.height + 10;
        if (p.y > canvas.height + 10) p.y = -10;
        // Draw as glowing orb - with reduced shadow blur to prevent overflow
        ctx.save();
        ctx.globalAlpha = p.opacity;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.closePath();
        ctx.shadowColor = `hsla(${p.baseHue}, 60%, 90%, 0.8)`;
        ctx.shadowBlur = p.size * 3; // Reduced from 6 to 3
        ctx.fillStyle = `hsla(${p.baseHue}, 60%, 95%, 1)`;
        ctx.fill();
        ctx.restore();
      }
      // Occasional wind gust overlay (subtle)
      if (Math.random() < 0.01) {
        ctx.save();
        ctx.globalAlpha = 0.07;
        ctx.beginPath();
        ctx.ellipse(
          canvas.width * Math.random(),
          canvas.height * Math.random(),
          canvas.width * 0.5 * Math.random(),
          canvas.height * 0.2 * Math.random(),
          Math.random() * Math.PI,
          0,
          Math.PI * 2
        );
        ctx.fillStyle = `hsla(${baseHue}, 60%, 100%, 1)`;
        ctx.fill();
        ctx.restore();
      }
      // Restore the clipping path
      ctx.restore();
      animationRef.current = requestAnimationFrame(animate);
    }
    
    console.log("SnowfallAnimation: starting animation loop");
    animate();

    return () => {
      console.log("SnowfallAnimation: cleaning up animation");
      window.removeEventListener("resize", resizeCanvas);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      animationInitializedRef.current = false;
    };
  }, [mounted, isClient]);

  // Don't render anything until we're on the client and mounted
  if (!isClient || !mounted) {
    return <div className="relative w-full overflow-hidden h-full" />;
  }
  // DEBUG MARKER: SnowfallAnimation v2
  // eslint-disable-next-line
  return (
    <>
      <div style={{display:'none'}}>SnowfallAnimation v2</div>
      <div className="relative w-full overflow-hidden h-full">
        <canvas
          ref={canvasRef}
          className="absolute inset-0 w-full h-full"
          style={{ zIndex: 1 }}
        />
        <div className="absolute inset-0 pointer-events-none" style={{ zIndex: 2 }} />
      </div>
    </>
  );
} 