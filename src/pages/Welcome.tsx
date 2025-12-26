import { Suspense, useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, Text3D, Center, MeshDistortMaterial, Sphere, Box, Torus, Environment } from '@react-three/drei';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowRight, MessageSquare, Users, Shield, Megaphone } from 'lucide-react';
import * as THREE from 'three';

// 3D Floating Icon Component
const FloatingIcon = ({ position, color, shape, speed = 1 }: { 
  position: [number, number, number]; 
  color: string; 
  shape: 'sphere' | 'box' | 'torus';
  speed?: number;
}) => {
  const meshRef = useRef<THREE.Mesh>(null);
  
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.x = state.clock.elapsedTime * 0.3 * speed;
      meshRef.current.rotation.y = state.clock.elapsedTime * 0.5 * speed;
    }
  });

  const renderShape = () => {
    switch (shape) {
      case 'sphere':
        return <Sphere args={[0.5, 32, 32]} ref={meshRef}>
          <MeshDistortMaterial color={color} speed={2} distort={0.3} radius={1} />
        </Sphere>;
      case 'box':
        return <Box args={[0.7, 0.7, 0.7]} ref={meshRef}>
          <meshStandardMaterial color={color} metalness={0.8} roughness={0.2} />
        </Box>;
      case 'torus':
        return <Torus args={[0.4, 0.2, 16, 32]} ref={meshRef}>
          <meshStandardMaterial color={color} metalness={0.6} roughness={0.3} />
        </Torus>;
    }
  };

  return (
    <Float speed={speed} rotationIntensity={0.5} floatIntensity={1.5} position={position}>
      {renderShape()}
    </Float>
  );
};

// Main 3D Scene
const Scene3D = () => {
  return (
    <>
      <Environment preset="city" />
      <ambientLight intensity={0.5} />
      <directionalLight position={[10, 10, 5]} intensity={1} />
      <pointLight position={[-10, -10, -5]} intensity={0.5} color="#8b5cf6" />
      
      {/* Floating shapes */}
      <FloatingIcon position={[-3, 2, -2]} color="#8b5cf6" shape="sphere" speed={1.2} />
      <FloatingIcon position={[3, 1, -3]} color="#06b6d4" shape="box" speed={0.8} />
      <FloatingIcon position={[-2, -1.5, -2]} color="#f59e0b" shape="torus" speed={1} />
      <FloatingIcon position={[2.5, -1, -2]} color="#10b981" shape="sphere" speed={0.9} />
      <FloatingIcon position={[0, 2.5, -4]} color="#ec4899" shape="box" speed={1.1} />
      <FloatingIcon position={[-3.5, 0, -3]} color="#3b82f6" shape="torus" speed={0.7} />
      <FloatingIcon position={[4, 0.5, -4]} color="#f97316" shape="sphere" speed={1.3} />
    </>
  );
};

// Feature Card Component
const FeatureCard = ({ icon: Icon, title, description, delay }: {
  icon: React.ElementType;
  title: string;
  description: string;
  delay: number;
}) => (
  <motion.div
    initial={{ opacity: 0, y: 30 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay, duration: 0.6, ease: "easeOut" }}
    className="flex flex-col items-center text-center p-6 rounded-2xl bg-card/50 backdrop-blur-sm border border-border/50 hover:border-primary/50 transition-all duration-300 hover:scale-105"
  >
    <div className="w-14 h-14 rounded-full bg-primary/20 flex items-center justify-center mb-4">
      <Icon className="w-7 h-7 text-primary" />
    </div>
    <h3 className="text-lg font-semibold text-foreground mb-2">{title}</h3>
    <p className="text-sm text-muted-foreground">{description}</p>
  </motion.div>
);

const Welcome = () => {
  const navigate = useNavigate();
  const [isExiting, setIsExiting] = useState(false);

  const handleGetStarted = () => {
    setIsExiting(true);
    localStorage.setItem('campusvoice_welcomed', 'true');
    setTimeout(() => {
      navigate('/login');
    }, 500);
  };

  const features = [
    {
      icon: MessageSquare,
      title: "Voice Your Concerns",
      description: "Report campus issues anonymously and track their resolution in real-time."
    },
    {
      icon: Users,
      title: "Community Driven",
      description: "Upvote issues that matter to you and see what affects your peers."
    },
    {
      icon: Shield,
      title: "Secure & Private",
      description: "Your identity is protected while your voice makes an impact."
    },
    {
      icon: Megaphone,
      title: "Get Heard",
      description: "Direct communication channel between students and administration."
    }
  ];

  return (
    <AnimatePresence>
      <motion.div 
        className="min-h-screen bg-background relative overflow-hidden"
        initial={{ opacity: 0 }}
        animate={{ opacity: isExiting ? 0 : 1 }}
        transition={{ duration: 0.5 }}
      >
        {/* 3D Canvas Background */}
        <div className="absolute inset-0 z-0">
          <Canvas camera={{ position: [0, 0, 5], fov: 75 }}>
            <Suspense fallback={null}>
              <Scene3D />
            </Suspense>
          </Canvas>
        </div>

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-background/70 via-background/50 to-background z-10" />

        {/* Content */}
        <div className="relative z-20 min-h-screen flex flex-col">
          {/* Hero Section */}
          <div className="flex-1 flex flex-col items-center justify-center px-4 pt-20 pb-10">
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="mb-6"
            >
              <img 
                src="/campusvoice-logo.png" 
                alt="CampusVoice" 
                className="w-20 h-20 md:w-24 md:h-24 object-contain"
              />
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.6 }}
              className="text-4xl md:text-6xl lg:text-7xl font-bold text-center mb-4"
            >
              <span className="bg-gradient-to-r from-primary via-purple-500 to-pink-500 bg-clip-text text-transparent">
                CampusVoice
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.6 }}
              className="text-lg md:text-xl text-muted-foreground text-center max-w-2xl mb-8 px-4"
            >
              Your voice matters. Report campus issues, connect with administration, 
              and make your campus a better place for everyone.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.6 }}
            >
              <Button 
                size="lg" 
                onClick={handleGetStarted}
                className="text-lg px-8 py-6 rounded-full bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
              >
                Get Started
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </motion.div>
          </div>

          {/* Features Section */}
          <div className="px-4 pb-16">
            <motion.h2
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
              className="text-2xl md:text-3xl font-semibold text-center mb-8 text-foreground"
            >
              Why CampusVoice?
            </motion.h2>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 max-w-6xl mx-auto">
              {features.map((feature, index) => (
                <FeatureCard
                  key={feature.title}
                  icon={feature.icon}
                  title={feature.title}
                  description={feature.description}
                  delay={1 + index * 0.15}
                />
              ))}
            </div>
          </div>

          {/* Footer hint */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.8 }}
            className="text-center pb-8"
          >
            <p className="text-sm text-muted-foreground">
              Trusted by students across campus
            </p>
          </motion.div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default Welcome;
