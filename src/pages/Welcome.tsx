import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TorchCanvas } from "@/components/TorchCanvas";

export default function Welcome() {
  const navigate = useNavigate();

  const [pos, setPos] = useState({ x: 80, y: 80 });
  const [followCursor, setFollowCursor] = useState(false);

  // 🔦 Torch search animation
  useEffect(() => {
    if (typeof window === "undefined") return;

    const steps = [
      { x: 80, y: 80 },                         // corner
      { x: window.innerWidth / 2, y: 220 },     // title
      { x: window.innerWidth / 2, y: 330 },     // text
      { x: window.innerWidth / 2, y: 520 },     // button
    ];

    let i = 0;

    const interval = setInterval(() => {
      setPos(steps[i]);
      i++;

      if (i >= steps.length) {
        clearInterval(interval);
        setFollowCursor(true);
      }
    }, 1400);

    return () => clearInterval(interval);
  }, []);

  // 🔊 Ambient sound (safe autoplay)
  useEffect(() => {
    const audio = new Audio("/torch-hum.mp3");
    audio.loop = true;
    audio.volume = 0.12;

    const play = () => {
      audio.play().catch(() => {});
      window.removeEventListener("click", play);
    };

    window.addEventListener("click", play);

    return () => {
      audio.pause();
      audio.currentTime = 0;
      window.removeEventListener("click", play);
    };
  }, []);

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#070b12] text-white">
      {/* TORCH OVERLAY */}
      <TorchCanvas
        active={true}
        x={pos.x}
        y={pos.y}
        followCursor={followCursor}
      />

      {/* BACKGROUND */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#05070c] via-[#0b1220] to-black" />

      {/* CONTENT */}
      <div className="relative z-10 min-h-screen flex items-center justify-center px-4">
        <div className="w-full max-w-3xl text-center flex flex-col items-center">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-4">
            <span className="bg-gradient-to-r from-yellow-400 via-purple-500 to-pink-500 bg-clip-text text-transparent">
              CampusVoice
            </span>
          </h1>

          <p className="text-base sm:text-lg text-muted-foreground max-w-xl leading-relaxed mb-6">
            When voices are scattered, we help them get found.
            <br />
            Report issues. Be heard. Create change.
          </p>

          <div className="flex items-end gap-2 mt-6">
            {[18, 30, 46, 28, 40, 24, 50].map((h, i) => (
              <span
                key={i}
                className="w-2 rounded-full bg-gradient-to-t from-yellow-400 via-purple-500 to-pink-500 animate-pulse"
                style={{ height: h }}
              />
            ))}
          </div>

          <div className="mt-10">
            <Button
              size="lg"
              onClick={() => navigate("/login")}
              className="
                px-10 py-6 text-lg rounded-full
                bg-gradient-to-r from-yellow-400 to-purple-600
                text-black hover:opacity-90
                shadow-[0_0_60px_rgba(255,210,120,0.45)]
              "
            >
              Get Started <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
