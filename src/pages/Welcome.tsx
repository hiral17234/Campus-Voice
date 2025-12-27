import { useEffect, useState, useRef } from "react";
import {
  motion,
  AnimatePresence,
  useReducedMotion,
  useAnimation,
} from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, Volume2, VolumeX } from "lucide-react";

/* ---------------- BACKGROUND DOTS ---------------- */
const BackgroundDots = () => (
  <div
    className="absolute inset-0 opacity-[0.06]"
    style={{
      backgroundImage:
        "radial-gradient(circle, rgba(255,255,255,0.15) 1px, transparent 1px)",
      backgroundSize: "28px 28px",
    }}
  />
);

/* ---------------- DUST PARTICLES ---------------- */
const DustParticles = () => {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {Array.from({ length: 14 }).map((_, i) => (
        <motion.span
          key={i}
          className="absolute w-1 h-1 rounded-full bg-white/20"
          style={{
            left: `${Math.random() * 60}%`,
            top: `${Math.random() * 60}%`,
          }}
          animate={{
            y: [-10, 10],
            opacity: [0.1, 0.4, 0.1],
          }}
          transition={{
            duration: 2 + Math.random() * 2,
            repeat: Infinity,
            ease: "easeInOut",
            delay: Math.random() * 2,
          }}
        />
      ))}
    </div>
  );
};

/* ---------------- TORCH BEAM ---------------- */
const TorchBeam = ({
  phase,
  paused,
  reduceMotion,
}: {
  phase: "dark" | "searching" | "found";
  paused: boolean;
  reduceMotion: boolean;
}) => {
  if (reduceMotion || phase === "dark") return null;

  return (
    <svg
      className="absolute inset-0 pointer-events-none"
      viewBox="0 0 100 100"
      preserveAspectRatio="none"
    >
      <defs>
        {/* Soft blur for realism */}
        <filter id="blur">
          <feGaussianBlur stdDeviation="2.5" />
        </filter>

        {/* Torch gradient */}
        <linearGradient id="beamGrad" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="rgba(255,230,160,0.95)" />
          <stop offset="45%" stopColor="rgba(255,210,120,0.45)" />
          <stop offset="100%" stopColor="rgba(255,210,120,0)" />
        </linearGradient>
      </defs>

      {phase === "searching" && (
        <motion.polygon
          points="0,0 8,4 55,40"
          fill="url(#beamGrad)"
          filter="url(#blur)"
          animate={
            paused
              ? {}
              : {
                  points: [
                    // logo
                    "0,0 10,6 40,30",
                    // text
                    "0,0 12,10 50,42",
                    // CTA
                    "0,0 15,20 60,65",
                  ],
                }
          }
          transition={{
            duration: 4.5,
            ease: "easeInOut",
            times: [0, 0.55, 1],
          }}
        />
      )}

      {phase === "found" && (
        <motion.ellipse
          cx="55"
          cy="70"
          rx="28"
          ry="18"
          fill="rgba(255,210,120,0.25)"
          filter="url(#blur)"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6 }}
        />
      )}
    </svg>
  );
};


/* ---------------- VOICE WAVE ---------------- */
const VoiceWave = ({ reduceMotion }: { reduceMotion: boolean }) => (
  <motion.div
    className="flex justify-center items-end gap-1.5 sm:gap-2 mt-6"
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    transition={{ delay: 4.8 }}
  >
    {[18, 30, 46, 28, 40, 24, 50].map((h, i) => (
      <motion.span
        key={i}
        className="w-2 rounded-full bg-gradient-to-t from-yellow-400 via-purple-500 to-pink-500"
        style={{ height: h }}
        animate={reduceMotion ? {} : { height: [h, h - 14, h] }}
        transition={{
          duration: 1.4,
          repeat: Infinity,
          delay: i * 0.12,
          ease: "easeInOut",
        }}
      />
    ))}
  </motion.div>
);

/* ---------------- MAIN ---------------- */
const Welcome = () => {
  const navigate = useNavigate();
  const reduceMotion = useReducedMotion();
  const [phase, setPhase] = useState<"dark" | "searching" | "found">("dark");
  const [paused, setPaused] = useState(false);
  const [soundOn, setSoundOn] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    const t1 = setTimeout(() => setPhase("searching"), 600);
    const t2 = setTimeout(() => setPhase("found"), 5400);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, []);

  useEffect(() => {
    if (!audioRef.current) return;
    if (soundOn && phase === "searching") {
      audioRef.current.volume = 0.08;
      audioRef.current.play().catch(() => {});
    } else {
      audioRef.current.pause();
    }
  }, [soundOn, phase]);

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#070b12]">
      <audio ref={audioRef} loop src="/lighthouse-hum.mp3" />

      <div className="absolute inset-0 bg-gradient-to-b from-[#05070c] via-[#0b1220] to-black" />
      <BackgroundDots />

      <TorchBeam
        phase={phase}
        paused={paused}
        reduceMotion={reduceMotion}
      />

      {/* Sound Toggle */}
      <button
        onClick={() => setSoundOn((s) => !s)}
        className="absolute bottom-4 right-4 z-20 text-white/60 hover:text-white"
      >
        {soundOn ? <Volume2 size={20} /> : <VolumeX size={20} />}
      </button>

      <div className="relative z-10 min-h-screen flex items-center justify-center px-4">
        <div className="w-full max-w-3xl text-center flex flex-col items-center">
          <AnimatePresence>
            {phase === "found" && (
              <motion.div
                onMouseEnter={() => setPaused(true)}
                onMouseLeave={() => setPaused(false)}
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8 }}
                className="flex flex-col items-center"
              >
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

                <VoiceWave reduceMotion={reduceMotion} />

                <motion.div
                  className="mt-8 sm:mt-10"
                  animate={
                    paused || reduceMotion
                      ? {}
                      : {
                          boxShadow: [
                            "0 0 30px rgba(255,210,120,0.25)",
                            "0 0 55px rgba(255,210,120,0.45)",
                            "0 0 30px rgba(255,210,120,0.25)",
                          ],
                        }
                  }
                  transition={{
                    duration: 2.6,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                >
                  <Button
                    size="lg"
                    onClick={() => navigate("/login")}
                    className="
                      px-10 py-6 text-lg rounded-full
                      bg-gradient-to-r from-yellow-400 to-purple-600
                      text-black hover:opacity-90
                    "
                  >
                    Get Started <ArrowRight className="ml-2 w-5 h-5" />
                  </Button>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default Welcome;
