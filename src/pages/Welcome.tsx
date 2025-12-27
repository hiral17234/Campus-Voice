import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  ArrowRight,
  MessageSquare,
  Users,
  Shield,
  Megaphone,
} from "lucide-react";

/* ---------------- BACKGROUND DOTS ---------------- */
const BackgroundDots = () => (
  <div className="absolute inset-0 overflow-hidden z-0 pointer-events-none">
    {[...Array(12)].map((_, i) => (
      <motion.span
        key={i}
        className="absolute w-1.5 h-1.5 rounded-full bg-primary/20"
        style={{
          left: `${Math.random() * 100}%`,
          top: `${Math.random() * 100}%`,
        }}
        animate={{ y: [0, -14, 0], opacity: [0.3, 0.6, 0.3] }}
        transition={{
          duration: 6 + Math.random() * 4,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
    ))}
  </div>
);

/* ---------------- VOICE WAVE ---------------- */
const VoiceWave = () => (
  <motion.svg
    viewBox="0 0 240 60"
    className="
      w-40 sm:w-48 md:w-56
      h-12 sm:h-14
      mx-auto my-3 sm:my-4
    "
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
  >
    {[18, 32, 48, 28, 42, 26, 50, 30].map((h, i) => (
      <motion.rect
        key={i}
        x={i * 28}
        y={60 - h}
        width="10"
        height={h}
        rx="5"
        fill="url(#grad)"
        animate={{ height: [h, h - 12, h] }}
        transition={{
          duration: 1.6,
          repeat: Infinity,
          delay: i * 0.12,
        }}
      />
    ))}
    <defs>
      <linearGradient id="grad" x1="0" y1="0" x2="0" y2="60">
        <stop stopColor="#7c3aed" />
        <stop offset="1" stopColor="#ec4899" />
      </linearGradient>
    </defs>
  </motion.svg>
);

/* ---------------- FEATURE CARD ---------------- */
const FeatureCard = ({
  icon: Icon,
  title,
  description,
  delay,
}: {
  icon: any;
  title: string;
  description: string;
  delay: number;
}) => (
  <motion.div
    initial={{ opacity: 0, y: 24 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay, duration: 0.5 }}
    className="
      flex flex-col items-center text-center
      p-5 sm:p-6
      rounded-2xl
      bg-card/80 backdrop-blur
      border border-border/50
      hover:border-primary/40
      transition
    "
  >
    <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-primary/15 flex items-center justify-center mb-4">
      <Icon className="w-6 h-6 sm:w-7 sm:h-7 text-primary" />
    </div>
    <h3 className="text-base sm:text-lg font-semibold mb-2">{title}</h3>
    <p className="text-sm text-muted-foreground leading-relaxed">
      {description}
    </p>
  </motion.div>
);

/* ---------------- MAIN ---------------- */
const Welcome = () => {
  const navigate = useNavigate();
  const [exiting, setExiting] = useState(false);

  const handleGetStarted = () => {
    setExiting(true);
    localStorage.setItem("campusvoice_welcomed", "true");
    setTimeout(() => navigate("/login"), 500);
  };

  const features = [
    {
      icon: MessageSquare,
      title: "Voice Your Concerns",
      description:
        "Report campus issues anonymously and track their resolution.",
    },
    {
      icon: Users,
      title: "Community Driven",
      description:
        "Upvote issues that matter and see what affects fellow students.",
    },
    {
      icon: Shield,
      title: "Secure & Private",
      description:
        "Your identity stays protected while your voice makes impact.",
    },
    {
      icon: Megaphone,
      title: "Get Heard",
      description:
        "Direct communication channel with campus administration.",
    },
  ];

  return (
    <AnimatePresence>
      <motion.div
        className="min-h-screen bg-background relative overflow-hidden"
        initial={{ opacity: 0 }}
        animate={{ opacity: exiting ? 0 : 1 }}
        transition={{ duration: 0.5 }}
      >
        <BackgroundDots />
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-background to-background z-0" />

        {/* CONTENT */}
        <div className="relative z-10 min-h-screen flex flex-col">
          {/* HERO */}
          <section className="flex-1 flex items-center justify-center px-4">
            <div className="w-full max-w-4xl text-center">
              <motion.img
                src="/campusvoice-logo.png"
                alt="CampusVoice"
                className="
                  w-16 h-16
                  sm:w-20 sm:h-20
                  mx-auto mb-3
                "
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
              />

              <VoiceWave />

              <motion.h1
                className="
                  text-3xl sm:text-4xl md:text-6xl
                  font-bold mb-4
                "
                initial={{ y: 14, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
              >
                <span className="bg-gradient-to-r from-primary via-purple-500 to-pink-500 bg-clip-text text-transparent">
                  CampusVoice
                </span>
              </motion.h1>

              <motion.p
                className="
                  text-base sm:text-lg md:text-xl
                  text-muted-foreground
                  max-w-xl sm:max-w-2xl
                  mx-auto mb-8
                  leading-relaxed
                "
                initial={{ y: 14, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.15 }}
              >
                Your voice matters. Report campus issues, connect with
                administration, and help improve campus life for everyone.
              </motion.p>

              <motion.div
                initial={{ y: 14, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.3 }}
              >
                <Button
                  size="lg"
                  onClick={handleGetStarted}
                  className="
                    w-full sm:w-auto
                    rounded-full
                    px-8 sm:px-10
                    py-5 sm:py-6
                    text-base sm:text-lg
                    bg-gradient-to-r from-primary to-purple-600
                    hover:opacity-90
                    shadow-lg
                  "
                >
                  Get Started <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </motion.div>
            </div>
          </section>

          {/* FEATURES */}
          <section className="px-4 pb-14 sm:pb-16">
            <h2 className="text-xl sm:text-2xl md:text-3xl font-semibold text-center mb-8 sm:mb-10">
              Why CampusVoice?
            </h2>

            <div className="
              grid
              grid-cols-1
              sm:grid-cols-2
              lg:grid-cols-4
              gap-5 sm:gap-6
              max-w-6xl mx-auto
            ">
              {features.map((f, i) => (
                <FeatureCard key={f.title} {...f} delay={0.4 + i * 0.15} />
              ))}
            </div>
          </section>

          {/* FOOTER */}
          <div className="text-center pb-6 sm:pb-8 text-xs sm:text-sm text-muted-foreground">
            Trusted by students across campus
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default Welcome;
