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

  useEffect(() => {
    if (!active) return;

    const canvas = canvasRef.current!;
    const ctx = canvas.getContext("2d")!;
    let raf: number;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    resize();
    window.addEventListener("resize", resize);

    const onMove = (e: MouseEvent) => {
      mouse.current.x = e.clientX;
      mouse.current.y = e.clientY;
    };

    if (followCursor) {
      window.addEventListener("mousemove", onMove);
    }

    const dust = Array.from({ length: 120 }).map(() => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      r: Math.random() * 1.5 + 0.5,
      v: Math.random() * 0.3 + 0.1,
    }));

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Darkness
      ctx.fillStyle = "rgba(0,0,0,0.96)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      const tx = followCursor ? mouse.current.x : x;
      const ty = followCursor ? mouse.current.y : y;

      // Cone beam
      ctx.save();
      ctx.globalCompositeOperation = "destination-out";
      ctx.translate(tx, ty);
      ctx.rotate(Math.atan2(ty - 80, tx - 80));

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

      // Dust particles (only visible in beam)
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
      window.removeEventListener("mousemove", onMove);
    };
  }, [active, x, y, followCursor]);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 z-50 pointer-events-none"
    />
  );
}
