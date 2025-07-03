'use client';

import { useEffect, useRef } from 'react';

interface Snowflake {
  x: number;
  y: number;
  z: number; // Depth from viewer (0 = closest, 1 = farthest)
  size: number;
  speed: number;
  opacity: number;
  rotation: number;
  rotationSpeed: number;
  drift: number;
  wobble: number;
  pulse: number;
}

export default function SnowfallComponent() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number | undefined>(undefined);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight * 0.4;
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    const snowflakes: Snowflake[] = [];
    const maxSnowflakes = 800; // More snowflakes for better atmospheric density
    let time = 0;

    const createSnowflake = (): Snowflake => {
      const z = Math.random(); // Depth from 0 (closest) to 1 (farthest)
      const baseSize = Math.random() * 1.5 + 0.3; // Much smaller base size
      const depthSize = 1 + (1 - z) * 1.2; // More subtle depth scaling
      
      return {
        x: Math.random() * canvas.width,
        y: -10 - Math.random() * canvas.height,
        z: z,
        size: baseSize * depthSize, // Size affected by depth
        speed: (Math.random() * 2 + 1) * (1 + (1 - z) * 0.3), // Slower, more gentle fall
        opacity: Math.random() * 0.6 + 0.1, // Lower opacity for more atmospheric feel
        rotation: Math.random() * Math.PI * 2,
        rotationSpeed: (Math.random() - 0.5) * 0.04, // Slower rotation
        drift: (Math.random() - 0.5) * 4, // Less drift
        wobble: Math.random() * 0.05, // Subtle wobble
        pulse: Math.random() * 0.05, // Subtle pulse
      };
    };

    for (let i = 0; i < maxSnowflakes; i++) {
      snowflakes.push(createSnowflake());
    }

    const animate = () => {
      time += 0.02;
      
      // Clear the canvas completely
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Draw a subtle background gradient
      const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
      gradient.addColorStop(0, 'rgba(20, 20, 30, 0.05)');
      gradient.addColorStop(1, 'rgba(10, 10, 20, 0.1)');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Sort snowflakes by depth (farthest first, closest last) for proper layering
      snowflakes.sort((a, b) => a.z - b.z);

      snowflakes.forEach((flake, index) => {
        // Depth-based effects
        const depthFactor = 1 - flake.z; // 0 = far, 1 = close
        const windIntensity = 1.5 + depthFactor * 1.0; // Reduced wind effect
        const windDirection = Math.sin(time * 0.8 + flake.drift * 0.5) * windIntensity;
        
        // Vertical speed affected by depth
        const verticalSpeed = flake.speed * (1 + depthFactor * 0.2); // More gentle
        const horizontalSpeed = windDirection * (1 + depthFactor * 0.2);
        
        // Gust effects more subtle
        const gust = Math.sin(time * 1.8 + flake.x * 0.005) * (0.8 + depthFactor * 0.8);
        
        flake.y += verticalSpeed + gust * 0.1;
        flake.x += horizontalSpeed + Math.sin(time * 1.2 + flake.drift) * 1.0 * depthFactor + gust * 0.2;
        flake.rotation += flake.rotationSpeed;
        
        // Subtle wobble and pulse based on depth
        const wobbleIntensity = 0.8 + depthFactor * 1.0;
        const pulseIntensity = 0.2 + depthFactor * 0.3;
        
        const wobble = Math.sin(time * 2.5 + flake.x * 0.02) * wobbleIntensity;
        const pulse = Math.sin(time * 3.0 + flake.y * 0.03) * pulseIntensity + 0.7;
        
        // Reset snowflakes that go off screen
        if (flake.y > canvas.height + 10) {
          snowflakes[index] = createSnowflake();
          snowflakes[index].y = -10;
        }
        if (flake.x > canvas.width + 10) flake.x = -10;
        if (flake.x < -10) flake.x = canvas.width + 10;

        ctx.save();
        ctx.translate(flake.x + wobble, flake.y);
        ctx.rotate(flake.rotation);
        
        // Opacity affected by depth and pulse
        const finalOpacity = flake.opacity * pulse * (0.4 + depthFactor * 0.4);
        ctx.globalAlpha = finalOpacity;
        
        // Size affected by depth - more subtle
        const finalSize = flake.size * (0.6 + depthFactor * 0.8);
        ctx.fillStyle = `rgba(255, 255, 255, ${finalOpacity})`;
        
        // Draw simpler, more delicate snowflake
        const complexity = Math.floor(3 + depthFactor * 2); // Simpler structure
        
        for (let i = 0; i < complexity; i++) {
          ctx.save();
          ctx.rotate((Math.PI / (complexity / 2)) * i);
          
          // Main arms - thinner and more delicate
          ctx.fillRect(-finalSize * 0.05, -finalSize, finalSize * 0.1, finalSize);
          
          // Secondary arms only for closer snowflakes - very subtle
          if (depthFactor > 0.5) {
            ctx.fillRect(-finalSize * 0.2, -finalSize * 0.4, finalSize * 0.4, finalSize * 0.05);
          }
          
          ctx.restore();
        }
        
        // Very subtle glow effect for closer snowflakes
        if (depthFactor > 0.7) {
          ctx.shadowColor = 'rgba(255, 255, 255, 0.4)';
          ctx.shadowBlur = finalSize * (0.5 + depthFactor * 0.5);
        }
        
        ctx.restore();
      });

      // Atmospheric depth layers - much more subtle
      for (let layer = 0; layer < 2; layer++) {
        const layerDepth = layer / 1; // 0, 1
        const opacity = 0.005 + layerDepth * 0.008; // Very subtle
        
        const atmosphericGradient = ctx.createRadialGradient(
          canvas.width * 0.5, canvas.height * 0.5, 0,
          canvas.width * 0.5, canvas.height * 0.5, canvas.width * (0.8 + layerDepth * 0.1)
        );
        atmosphericGradient.addColorStop(0, `rgba(120, 120, 160, ${opacity * 0.2})`);
        atmosphericGradient.addColorStop(1, `rgba(80, 80, 120, ${opacity})`);
        ctx.fillStyle = atmosphericGradient;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }

      // Depth-based horizontal lines for atmospheric effect - very subtle
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.002)';
      ctx.lineWidth = 0.3;
      for (let i = 0; i < canvas.height; i += 8) {
        const depth = i / canvas.height;
        ctx.globalAlpha = 0.002 + depth * 0.005;
        ctx.beginPath();
        ctx.moveTo(0, i);
        ctx.lineTo(canvas.width, i);
        ctx.stroke();
      }

      animationRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  return (
    <div className="relative w-full overflow-hidden" style={{ height: '40vh' }}>
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full"
      />
      <div className="absolute inset-0 pointer-events-none" />
    </div>
  );
} 