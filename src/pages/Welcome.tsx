import { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

/* ---------------- BACKGROUND DOTS ---------------- */
const BackgroundDots = () => (
  <div
    className="absolute inset-0 opacity-[0.08]"
    style={{
      backgroundImage:
        "radial-gradient(circle, rgba(255,255,255,0.15) 1px, transparent 1px)",
      backgroundSize: "28px 28px",
    }}
  />
);

/* ---------------- LIGHTHOUSE SWEEP ---------------- */
const LighthouseBeam = ({
  active,
  reduceMotion,
}: {
  active: boolean;
  reduceMotion: boolean;
}) => {
  if (!active) return null;

  return (
    <motion.div
      className="absolute inset-0 pointer-events-none"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        className="absolute -left-1/2 -top-1/2 w-[200%] h-[200%]"
        style={{
          background:
            "conic-gradient(from 45deg, rgba(255,210,120,0.35), rgba(255,210,120,0.12), transparent 60%)",
        }}
        animate={reduceMotion ? {} : { rotate: 360 }}
        transition={{
          duration: 5,
          ease: "linear",
        }}
      />
    </motion.div>
  );
};

/* ---------------- VOICE WAVE (MIC AWARE) ---------------- */
const VoiceWave = ({ reduceMotion }: { reduceMotion: boolean }) => {
  const [levels, setLevels] = useState<number[]>([18, 30, 46, 28, 40, 24, 50]);
  const raf = useRef<number>();

  useEffect(() => {
    if (reduceMotion) return;

    navigator.mediaDevices
      ?.getUserMedia({ audio: true })
      .then((stream) => {
        const ctx = new AudioContext();
        const analyser = ctx.createAnalyser();
        analyser.fftSize = 64;

        const source = ctx.createMediaStreamSource(stream);
        source.connect(analyser);

        const data = new Uint8Array(analyser.frequencyBinCount);

        const loop = () => {
          analyser.getByteFrequencyData(data);
          setLevels(
            Array.from({ length: 7 }, (_, i) => 18 + data[i] / 6)
          );
          raf.current = requestAnimationFrame(loop);
        };

        loop();
      })
      .catch(() => {
        /* fallback animation only */
      });

    return () => raf.current && cancelAnimationFrame(raf.current);
  }, [reduceMotion]);

  return (
    <motion.div
      className="flex justify-center items-end gap-1.5 sm:gap-2 mt-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 4.6 }}
    >
      {levels.map((h, i) => (
        <motion.span
          key={i}
          className="w-2 rounded-full bg-gradient-to-t from-yellow-400 via-purple-500 to-pink-500"
          style={{ height: h }}
          animate={
            reduceMotion
              ? {}
              : { height: [h, h - 12, h] }
          }
          transition={{
            duration: 1.4,
            repeat: Infinity,
            ease: "easeInOut",
            delay: i * 0.12,
          }}
        />
      ))}
    </motion.div>
  );
};

/* ---------------- MAIN ---------------- */
const Welcome = () => {
  const navigate = useNavigate();
  const reduceMotion = useReducedMotion();
  const [phase, setPhase] = useState<"dark" | "searching" | "found">("dark");

  useEffect(() => {
    const t1 = setTimeout(() => setPhase("searching"), 600);
    const t2 = setTimeout(() => setPhase("found"), 5200);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, []);

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#070b12]">
      <div className="absolute inset-0 bg-gradient-to-b from-[#05070c] via-[#0b1220] to-black" />
      <BackgroundDots />

      <LighthouseBeam
        active={phase === "searching"}
        reduceMotion={reduceMotion}
      />

      <div className="relative z-10 min-h-screen flex items-center justify-center px-4">
        <div className="w-full max-w-3xl text-center flex flex-col items-center">
          <AnimatePresence>
            {phase === "found" && (
              <motion.div
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

                {/* CTA WITH GLOW PULSE */}
                <motion.div
                  className="mt-8 sm:mt-10"
                  animate={
                    reduceMotion
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
                    duration: 2.5,
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
