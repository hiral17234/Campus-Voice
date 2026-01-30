import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion, useScroll, useTransform } from "framer-motion";
import { ArrowRight, Shield, Eye, MessageCircle, Users, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Canvas } from "@react-three/fiber";
import { Float, MeshDistortMaterial, Environment } from "@react-three/drei";
import * as THREE from "three";

// 3D Shield representing Trust & Security
function TrustShield() {
  return (
    <Float speed={2} rotationIntensity={0.3} floatIntensity={0.5}>
      <mesh position={[0, 0, 0]} scale={1.2}>
        <torusKnotGeometry args={[0.6, 0.2, 100, 16]} />
        <MeshDistortMaterial
          color="#8b5cf6"
          roughness={0.2}
          metalness={0.8}
          distort={0.2}
          speed={2}
        />
      </mesh>
    </Float>
  );
}

// 3D Mask representing Anonymity
function AnonymityMask() {
  return (
    <Float speed={1.5} rotationIntensity={0.4} floatIntensity={0.6}>
      <mesh position={[0, 0, 0]} scale={1}>
        <icosahedronGeometry args={[0.8, 1]} />
        <MeshDistortMaterial
          color="#fbbf24"
          roughness={0.3}
          metalness={0.6}
          distort={0.3}
          speed={1.5}
        />
      </mesh>
    </Float>
  );
}

// 3D Voice/Megaphone representing Expression
function VoiceOrb() {
  return (
    <Float speed={2.5} rotationIntensity={0.2} floatIntensity={0.4}>
      <mesh position={[0, 0, 0]} scale={0.9}>
        <octahedronGeometry args={[0.7, 2]} />
        <MeshDistortMaterial
          color="#ec4899"
          roughness={0.2}
          metalness={0.7}
          distort={0.25}
          speed={2}
        />
      </mesh>
    </Float>
  );
}

function Scene3D() {
  return (
    <Canvas camera={{ position: [0, 0, 5], fov: 45 }}>
      <ambientLight intensity={0.5} />
      <directionalLight position={[10, 10, 5]} intensity={1} />
      <pointLight position={[-10, -10, -5]} intensity={0.5} color="#8b5cf6" />
      <group position={[-2.5, 0, 0]}>
        <TrustShield />
      </group>
      <group position={[0, 0.5, 0]}>
        <AnonymityMask />
      </group>
      <group position={[2.5, 0, 0]}>
        <VoiceOrb />
      </group>
      <Environment preset="city" />
    </Canvas>
  );
}

export default function Welcome() {
  const navigate = useNavigate();
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ container: containerRef });
  
  const opacity = useTransform(scrollYProgress, [0, 0.2], [1, 0]);
  const scale = useTransform(scrollYProgress, [0, 0.2], [1, 0.9]);

  useEffect(() => {
    const seen = localStorage.getItem("campusvoice_intro_done");
    if (seen === "true") {
      navigate("/login");
    }
  }, [navigate]);

  const handleGetStarted = () => {
    localStorage.setItem("campusvoice_intro_done", "true");
    navigate("/login");
  };

  const features = [
    {
      icon: Eye,
      title: "Stay Anonymous",
      description: "Your identity is completely protected. Report issues without fear of backlash or judgment.",
      gradient: "from-yellow-400 to-orange-500"
    },
    {
      icon: Shield,
      title: "Trusted Platform",
      description: "Built with security-first architecture. Your data stays private and secure.",
      gradient: "from-purple-400 to-pink-500"
    },
    {
      icon: MessageCircle,
      title: "Be Heard",
      description: "Every voice matters. Community upvotes ensure important issues get attention.",
      gradient: "from-blue-400 to-cyan-500"
    },
    {
      icon: Users,
      title: "Community Driven",
      description: "Join thousands of students making their campus better, together.",
      gradient: "from-green-400 to-emerald-500"
    }
  ];

  const howItWorks = [
    { step: "01", title: "Report Anonymously", desc: "Describe your issue with details and optional media" },
    { step: "02", title: "Community Votes", desc: "Students upvote issues that matter to them" },
    { step: "03", title: "Faculty Reviews", desc: "Administration sees prioritized issues" },
    { step: "04", title: "Resolution Tracking", desc: "Watch as issues move from pending to resolved" }
  ];

  return (
    <div 
      ref={containerRef}
      className="h-screen overflow-y-auto bg-gradient-to-b from-[#05070c] via-[#0b1220] to-[#0f172a] text-white scroll-smooth"
    >
      {/* Hero Section */}
      <section className="min-h-screen relative flex flex-col items-center justify-center px-4 sm:px-6">
        {/* 3D Background */}
        <div className="absolute inset-0 z-0">
          <Scene3D />
        </div>
        
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#05070c]/50 to-[#05070c] z-10 pointer-events-none" />
        
        {/* Content */}
        <motion.div 
          style={{ opacity, scale }}
          className="relative z-20 text-center max-w-4xl mx-auto"
        >
          <motion.img
            src="/campusvoice-logo.png"
            alt="CampusVoice"
            className="h-12 sm:h-16 mx-auto mb-6 opacity-95"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          />
          
          <motion.h1 
            className="text-4xl sm:text-5xl md:text-7xl font-bold mb-4 sm:mb-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <span className="bg-gradient-to-r from-yellow-400 via-purple-500 to-pink-500 bg-clip-text text-transparent">
              Your Voice,
            </span>
            <br />
            <span className="text-white">Protected</span>
          </motion.h1>
          
          <motion.p 
            className="text-base sm:text-lg md:text-xl text-white/70 max-w-2xl mx-auto mb-8 sm:mb-10 px-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            Report campus issues anonymously. Get heard. Create real change.
            <br className="hidden sm:block" />
            <span className="text-white/50">Where scattered voices find their power.</span>
          </motion.p>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
          >
            <Button
              size="lg"
              onClick={handleGetStarted}
              className="px-8 sm:px-12 py-5 sm:py-6 text-base sm:text-lg rounded-full bg-gradient-to-r from-yellow-400 to-purple-600 text-black hover:opacity-90 shadow-[0_0_60px_rgba(255,210,120,0.35)] transition-all hover:scale-105"
            >
              Get Started
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </motion.div>
        </motion.div>
        
        {/* Scroll Indicator */}
        <motion.div 
          className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20"
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <ChevronDown className="w-6 h-6 text-white/50" />
        </motion.div>
      </section>

      {/* Features Section */}
      <section className="min-h-screen py-16 sm:py-24 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto">
          <motion.div 
            className="text-center mb-12 sm:mb-16"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4">
              Why <span className="bg-gradient-to-r from-yellow-400 to-purple-500 bg-clip-text text-transparent">CampusVoice</span>?
            </h2>
            <p className="text-white/60 text-base sm:text-lg max-w-xl mx-auto">
              Built for students, powered by trust and transparency.
            </p>
          </motion.div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {features.map((feature, i) => (
              <motion.div
                key={feature.title}
                className="bg-white/5 backdrop-blur-md rounded-2xl p-5 sm:p-6 border border-white/10 hover:border-white/20 transition-all hover:bg-white/10 group"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
              >
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                  <feature.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="font-semibold text-lg mb-2">{feature.title}</h3>
                <p className="text-sm text-white/60 leading-relaxed">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-16 sm:py-24 px-4 sm:px-6 bg-gradient-to-b from-transparent to-purple-900/10">
        <div className="max-w-4xl mx-auto">
          <motion.div 
            className="text-center mb-12 sm:mb-16"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">How It Works</h2>
            <p className="text-white/60 text-sm sm:text-base">Simple steps to make your voice heard</p>
          </motion.div>
          
          <div className="space-y-4 sm:space-y-6">
            {howItWorks.map((item, i) => (
              <motion.div
                key={item.step}
                className="flex items-start gap-4 sm:gap-6 bg-white/5 rounded-xl p-4 sm:p-6 border border-white/10"
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
              >
                <div className="flex-shrink-0 w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-gradient-to-br from-yellow-400 to-purple-600 flex items-center justify-center">
                  <span className="text-lg sm:text-xl font-bold text-black">{item.step}</span>
                </div>
                <div>
                  <h3 className="font-semibold text-base sm:text-lg mb-1">{item.title}</h3>
                  <p className="text-white/60 text-sm">{item.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 sm:py-24 px-4 sm:px-6">
        <motion.div 
          className="max-w-2xl mx-auto text-center"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h2 className="text-3xl sm:text-4xl font-bold mb-4 sm:mb-6">Ready to Make a Difference?</h2>
          <p className="text-white/60 mb-6 sm:mb-8 text-sm sm:text-base">Join your campus community and start reporting issues today.</p>
          <Button
            size="lg"
            onClick={handleGetStarted}
            className="px-8 sm:px-10 py-5 sm:py-6 text-base sm:text-lg rounded-full bg-gradient-to-r from-yellow-400 to-purple-600 text-black hover:opacity-90"
          >
            Get Started Now
            <ArrowRight className="ml-2 w-5 h-5" />
          </Button>
        </motion.div>
      </section>

      {/* Footer with Creator Info */}
      <footer className="py-12 sm:py-16 px-4 sm:px-6 border-t border-white/10">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-6"
          >
            <img
              src="/campusvoice-logo.png"
              alt="CampusVoice"
              className="h-8 sm:h-10 mx-auto mb-4 opacity-70"
            />
            <p className="text-white/50 text-xs sm:text-sm">
              Built for students, powered by voices
            </p>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="bg-gradient-to-r from-purple-500/10 via-pink-500/10 to-yellow-500/10 rounded-2xl p-6 sm:p-8 border border-white/10"
          >
            <h3 className="text-base sm:text-lg font-semibold mb-3 bg-gradient-to-r from-yellow-400 to-purple-500 bg-clip-text text-transparent">
              Created with ❤️ by
            </h3>
            <p className="text-xl sm:text-2xl font-bold text-white mb-2">HIRAL GOYAL</p>
            <p className="text-white/60 text-sm sm:text-base mb-1">
              Mathematics and Computing
            </p>
            <p className="text-white/50 text-xs sm:text-sm">
              Madhav Institute of Technology and Science, Gwalior
            </p>
          </motion.div>
          
          <p className="mt-8 text-white/30 text-xs">
            © {new Date().getFullYear()} CampusVoice · All rights reserved
          </p>
        </div>
      </footer>
    </div>
  );
}
