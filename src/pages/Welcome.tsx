import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TorchCanvas } from "@/components/TorchCanvas";

export default function Welcome() {
  const navigate = useNavigate();

  const [torchActive, setTorchActive] = useState(true);
  const [introComplete, setIntroComplete] = useState(false);

  const [pos, setPos] = useState({ x: 80, y: 80 });
  const [followCursor, setFollowCursor] = useState(false);

  // 🔦 Torch search animation
  useEffect(() => {
    if (!torchActive) return;

    const steps = [
      { x: 80, y: 80 },
      { x: window.innerWidth / 2, y: 220 },
      { x: window.innerWidth / 2, y: 330 },
      { x: window.innerWidth / 2, y: 520 },
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
  }, [torchActive]);

  // 🔊 Ambient sound
  useEffect(() => {
    if (!torchActive) return;

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
  }, [torchActive]);

  const handleGetStarted = () => {
    if (!introComplete) {
      // First click → end torch
      setTorchActive(false);
      setIntroComplete(true);
      localStorage.setItem("campusvoice_intro_done", "true");
    } else {
      // Second click → go to login
      navigate("/login");
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#070b12] text-white">
      <TorchCanvas
        active={torchActive}
        x={pos.x}
        y={pos.y}
        followCursor={followCursor}
      />

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

          <div className="mt-10">
            <Button
              size="lg"
              onClick={handleGetStarted}
              className="
                px-10 py-6 text-lg rounded-full
                bg-gradient-to-r from-yellow-400 to-purple-600
                text-black hover:opacity-90
                shadow-[0_0_60px_rgba(255,210,120,0.45)]
              "
            >
              {introComplete ? "Continue" : "Get Started"}
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
