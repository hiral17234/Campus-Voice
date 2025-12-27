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

/* ----------------------------------
   Subtle Animated Background Dots
-----------------------------------*/
const BackgroundDots = () => {
  return (
    <div className="absolute inset-0 overflow-hidden z-0 pointer-events-none">
      {[...Array(20)].map((_, i) => (
        <motion.span
          key={i}
          className="absolute w-2 h-2 rounded-full bg-primary/20"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
          }}
          animate={{ y: [0, -20, 0], opacity: [0.4, 0.8, 0.4] }}
          transition={{
            duration: 6 + Math.random() * 4,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  );
};

/* ----------------------------------
   Animated SVG Voice Waveform
-----------------------------------*/
const VoiceWave = () => {
  return (
    <motion.svg
      width="220"
      height="60"
      viewBox="0 0 220 60"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="mx-auto mb-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      {[20, 35, 50, 30, 45, 25, 55, 30].map((h, i) => (
        <motion.rect
          key={i}
          x={i * 25}
          y={60 - h}
          width="10"
          height={h}
          rx="5"
          fill="url(#grad)"
          animate={{ height: [h, h - 15, h] }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            delay: i * 0.1,
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
};

/* ----------------------------------
   Feature Card
-----------------------------------*/
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
    initial={{ opacity: 0, y: 30 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay, duration: 0.6 }}
    className="flex flex-col items-center text-center p-6 rounded-2xl bg-card/70 backdrop-blur border border-border/50 hover:border-primary/40 transition"
  >
    <div className="w-14 h-14 rounded-full bg-primary/15 flex items-center justify-center mb-4">
      <Icon className="w-7 h-7 text-primary" />
    </div>
    <h3 className="text-lg font-semibold mb-2">{title}</h3>
    <p className="text-sm text-muted-foreground">{description}</p>
  </motion.div>
);

/* ----------------------------------
   MAIN COMPONENT
-----------------------------------*/
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
        {/* Background */}
        <BackgroundDots />
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-background to-background z-0" />

        {/* Content */}
        <div className="relative z-10 min-h-screen flex flex-col">
          {/* HERO */}
          <div className="flex-1 flex flex-col items-center justify-center px-4 pt-20 text-center">
            <motion.img
              src="/campusvoice-logo.png"
              alt="CampusVoice"
              className="w-20 h-20 mb-4"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
            />

            <VoiceWave />

            <motion.h1
              className="text-4xl md:text-6xl font-bold mb-4"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
            >
              <span className="bg-gradient-to-r from-primary via-purple-500 to-pink-500 bg-clip-text text-transparent">
                CampusVoice
              </span>
            </motion.h1>

            <motion.p
              className="text-lg md:text-xl text-muted-foreground max-w-2xl mb-8"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              Your voice matters. Report campus issues, connect with
              administration, and help improve campus life for everyone.
            </motion.p>

            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              <Button
                size="lg"
                onClick={handleGetStarted}
                className="rounded-full px-8 py-6 text-lg bg-gradient-to-r from-primary to-purple-600 hover:opacity-90 shadow-lg"
              >
                Get Started <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </motion.div>
          </div>

          {/* FEATURES */}
          <div className="px-4 pb-16">
            <h2 className="text-2xl md:text-3xl font-semibold text-center mb-8">
              Why CampusVoice?
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 max-w-6xl mx-auto">
              {features.map((f, i) => (
                <FeatureCard key={f.title} {...f} delay={0.6 + i * 0.15} />
              ))}
            </div>
          </div>

          {/* FOOTER */}
          <div className="text-center pb-8 text-sm text-muted-foreground">
            Trusted by students across campus
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default Welcome;
