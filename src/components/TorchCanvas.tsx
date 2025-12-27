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
    const lastAngle = useRef(0);



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

  // 1️⃣ Darkness layer
  ctx.save();
  ctx.fillStyle = "rgba(0,0,0,0.92)";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Torch origin
  const tx = followCursor ? mouse.current.x : x;
  const ty = followCursor ? mouse.current.y : y;

  // 2️⃣ Smooth movement (LERP)
  const lerp = 0.35;
  lastPos.current.x += (tx - lastPos.current.x) * lerp;
  lastPos.current.y += (ty - lastPos.current.y) * lerp;

  const dx = lastPos.current.x - (lastPos.current.prevX ?? lastPos.current.x);
  const dy = lastPos.current.y - (lastPos.current.prevY ?? lastPos.current.y);

  const targetAngle =
    Math.abs(dx) + Math.abs(dy) > 0.01
      ? Math.atan2(dy, dx)
      : lastAngle.current;

  lastAngle.current += (targetAngle - lastAngle.current) * 0.25;

  lastPos.current.prevX = lastPos.current.x;
  lastPos.current.prevY = lastPos.current.y;

  // 3️⃣ Light cut (ONLY ONCE)
  ctx.globalCompositeOperation = "destination-out";
  ctx.translate(lastPos.current.x, lastPos.current.y);
  ctx.rotate(lastAngle.current);

  const gradient = ctx.createRadialGradient(0, 0, 40, 0, 0, 520);
  gradient.addColorStop(0, "rgba(255,240,200,1)");
  gradient.addColorStop(0.4, "rgba(255,220,160,0.7)");
  gradient.addColorStop(1, "rgba(0,0,0,0)");

  ctx.fillStyle = gradient;
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.arc(0, 0, 520, -0.22, 0.22);
  ctx.closePath();
  ctx.fill();

  ctx.restore();
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
