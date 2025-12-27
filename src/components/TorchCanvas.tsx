import { useEffect, useRef } from "react";

type TorchProps = {
  active: boolean;
  x: number;
  y: number;
  followCursor: boolean;
};

export function TorchCanvas({ active, x, y, followCursor }: TorchProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouse = useRef({ x, y });
  const lastPos = useRef({ x, y });


  useEffect(() => {
// allow fade-out instead of instant cut
if (!canvasRef.current) return;

    const canvas = canvasRef.current!;
    const ctx = canvas.getContext("2d")!;
    let raf: number;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    resize();
    window.addEventListener("resize", resize);

    // 🔥 DESKTOP
    const onMouseMove = (e: MouseEvent) => {
      mouse.current.x = e.clientX;
      mouse.current.y = e.clientY;
    };

    // 📱 MOBILE
    const onTouchMove = (e: TouchEvent) => {
      if (e.touches.length > 0) {
        mouse.current.x = e.touches[0].clientX;
        mouse.current.y = e.touches[0].clientY;
      }
    };

    if (followCursor) {
      window.addEventListener("mousemove", onMouseMove);
      window.addEventListener("touchmove", onTouchMove, { passive: true });
    }

    // Start centered on mobile
    if ("ontouchstart" in window) {
      mouse.current.x = window.innerWidth / 2;
      mouse.current.y = window.innerHeight / 2;
    }

    lastPos.current = { x: mouse.current.x, y: mouse.current.y };


    const dust = Array.from({ length: 120 }).map(() => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      r: Math.random() * 1.5 + 0.5,
      v: Math.random() * 0.3 + 0.1,
    }));

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Darkness
      ctx.fillStyle = "rgba(0,0,0,0.93)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Torch origin = cursor position
const tx = followCursor ? mouse.current.x : x;
const ty = followCursor ? mouse.current.y : y;

      const ambient = ctx.createRadialGradient(tx, ty, 0, tx, ty, 260);
ambient.addColorStop(0, "rgba(255,220,160,0.12)");
ambient.addColorStop(1, "rgba(0,0,0,0)");

ctx.globalCompositeOperation = "destination-out";
ctx.fillStyle = ambient;
ctx.beginPath();
ctx.arc(tx, ty, 260, 0, Math.PI * 2);
ctx.fill();
ctx.globalCompositeOperation = "source-over";


      // 🌫️ Soft ambient reveal so content is visible


      
// Torch origin = cursor position


      // 🔁 Calculate torch direction based on movement
const dx = tx - lastPos.current.x;
const dy = ty - lastPos.current.y;

const angle =
  Math.abs(dx) + Math.abs(dy) > 0.5
    ? Math.atan2(dy, dx)
    : 0;

lastPos.current = { x: tx, y: ty };


      // 🔆 Cursor / finger glow
if (followCursor) {
  ctx.beginPath();
  ctx.arc(tx, ty, 18, 0, Math.PI * 2);
  ctx.fillStyle = "rgba(255,220,150,0.15)";
  ctx.fill();
}

// 🔅 Smooth fade control
ctx.globalAlpha = active ? 1 : 0;

      // 🔆 Soft halo at torch head
const halo = ctx.createRadialGradient(tx, ty, 0, tx, ty, 120);
halo.addColorStop(0, "rgba(255,230,180,0.25)");
halo.addColorStop(0.5, "rgba(255,200,120,0.08)");
halo.addColorStop(1, "rgba(255,200,120,0)");

ctx.fillStyle = halo;
ctx.beginPath();
ctx.arc(tx, ty, 120, 0, Math.PI * 2);
ctx.fill();



      // Cone beam
      ctx.save();
      ctx.globalCompositeOperation = "destination-out";
      ctx.translate(tx, ty);
      ctx.rotate(angle);

// Direction torch is pointing (upwards from cursor)



      const gradient = ctx.createRadialGradient(0, 0, 20, 0, 0, 420);
      gradient.addColorStop(0, "rgba(255,240,200,1)");
      gradient.addColorStop(0.4, "rgba(255,220,160,0.6)");
      gradient.addColorStop(1, "rgba(0,0,0,0)");

      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.arc(0, 0, 420, -0.35, 0.35);
      ctx.closePath();
      ctx.fill();
      ctx.restore();

      // Dust
      ctx.globalCompositeOperation = "destination-out";
      dust.forEach((p) => {
        p.y += p.v;
        if (p.y > canvas.height) p.y = 0;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(255,255,255,0.15)";
        ctx.fill();
      });
      ctx.globalCompositeOperation = "source-over";

      raf = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("touchmove", onTouchMove);
    };
  }, [active, x, y, followCursor]);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 z-50 pointer-events-none"
    />
  );
}
