import { useEffect, useRef } from "react";

type TorchProps = {
  active: boolean;
  x: number;
  y: number;
};

export function TorchCanvas({ active, x, y }: TorchProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

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

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // 1️⃣ Darkness
      ctx.fillStyle = "rgba(0,0,0,0.94)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // 2️⃣ Real flashlight gradient
      const gradient = ctx.createRadialGradient(
        x,
        y,
        40,     // bright core
        x,
        y,
        320     // beam radius
      );

      gradient.addColorStop(0, "rgba(255,240,200,1)");
      gradient.addColorStop(0.25, "rgba(255,220,160,0.7)");
      gradient.addColorStop(0.55, "rgba(255,200,120,0.25)");
      gradient.addColorStop(1, "rgba(0,0,0,0)");

      ctx.globalCompositeOperation = "destination-out";
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(x, y, 320, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalCompositeOperation = "source-over";

      raf = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
    };
  }, [active, x, y]);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 z-50 pointer-events-none"
    />
  );
}
