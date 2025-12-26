import { Suspense, useRef, useState, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, RoundedBox, Environment, MeshTransmissionMaterial } from '@react-three/drei';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowRight, MessageSquare, Users, Shield, Megaphone } from 'lucide-react';
import * as THREE from 'three';

// 3D Shield Icon - Represents Trust & Security
const Shield3D = ({ position, speed = 1 }: { position: [number, number, number]; speed?: number }) => {
  const meshRef = useRef<THREE.Group>(null);
  
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.5 * speed) * 0.3;
      meshRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * speed) * 0.1;
    }
  });

  const shieldShape = useMemo(() => {
    const shape = new THREE.Shape();
    shape.moveTo(0, 1.2);
    shape.bezierCurveTo(0.8, 1, 1, 0.5, 1, 0);
    shape.bezierCurveTo(1, -0.8, 0.5, -1.2, 0, -1.5);
    shape.bezierCurveTo(-0.5, -1.2, -1, -0.8, -1, 0);
    shape.bezierCurveTo(-1, 0.5, -0.8, 1, 0, 1.2);
    return shape;
  }, []);

  return (
    <Float speed={speed * 0.5} rotationIntensity={0.2} floatIntensity={0.8}>
      <group ref={meshRef} position={position} scale={0.6}>
        <mesh>
          <extrudeGeometry args={[shieldShape, { depth: 0.3, bevelEnabled: true, bevelThickness: 0.05, bevelSize: 0.05 }]} />
          <meshStandardMaterial color="#10b981" metalness={0.9} roughness={0.1} />
        </mesh>
        {/* Checkmark inside shield */}
        <mesh position={[0, -0.1, 0.2]}>
          <torusGeometry args={[0.3, 0.08, 8, 16, Math.PI * 1.5]} />
          <meshStandardMaterial color="#ffffff" metalness={0.5} roughness={0.3} />
        </mesh>
      </group>
    </Float>
  );
};

// 3D Incognito/Anonymous Icon - Represents Anonymity
const AnonymousMask3D = ({ position, speed = 1 }: { position: [number, number, number]; speed?: number }) => {
  const meshRef = useRef<THREE.Group>(null);
  
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.4 * speed) * 0.2;
      meshRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.3 * speed) * 0.1;
    }
  });

  return (
    <Float speed={speed * 0.6} rotationIntensity={0.3} floatIntensity={1}>
      <group ref={meshRef} position={position} scale={0.5}>
        {/* Hat */}
        <mesh position={[0, 0.8, 0]}>
          <cylinderGeometry args={[0.8, 1, 0.3, 32]} />
          <meshStandardMaterial color="#1a1a2e" metalness={0.8} roughness={0.2} />
        </mesh>
        <mesh position={[0, 1, 0]}>
          <cylinderGeometry args={[0.5, 0.5, 0.4, 32]} />
          <meshStandardMaterial color="#1a1a2e" metalness={0.8} roughness={0.2} />
        </mesh>
        {/* Glasses */}
        <mesh position={[-0.4, 0.2, 0.5]}>
          <torusGeometry args={[0.25, 0.05, 8, 32]} />
          <meshStandardMaterial color="#1a1a2e" metalness={0.9} roughness={0.1} />
        </mesh>
        <mesh position={[0.4, 0.2, 0.5]}>
          <torusGeometry args={[0.25, 0.05, 8, 32]} />
          <meshStandardMaterial color="#1a1a2e" metalness={0.9} roughness={0.1} />
        </mesh>
        {/* Bridge */}
        <mesh position={[0, 0.2, 0.5]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.03, 0.03, 0.3, 8]} />
          <meshStandardMaterial color="#1a1a2e" metalness={0.9} roughness={0.1} />
        </mesh>
        {/* Lens glow */}
        <mesh position={[-0.4, 0.2, 0.52]}>
          <circleGeometry args={[0.2, 32]} />
          <meshStandardMaterial color="#8b5cf6" emissive="#8b5cf6" emissiveIntensity={0.5} transparent opacity={0.7} />
        </mesh>
        <mesh position={[0.4, 0.2, 0.52]}>
          <circleGeometry args={[0.2, 32]} />
          <meshStandardMaterial color="#8b5cf6" emissive="#8b5cf6" emissiveIntensity={0.5} transparent opacity={0.7} />
        </mesh>
      </group>
    </Float>
  );
};

// 3D Megaphone - Represents Voice
const Megaphone3D = ({ position, speed = 1 }: { position: [number, number, number]; speed?: number }) => {
  const meshRef = useRef<THREE.Group>(null);
  
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.z = Math.sin(state.clock.elapsedTime * 0.6 * speed) * 0.15;
      meshRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.4 * speed) * 0.1;
    }
  });

  return (
    <Float speed={speed * 0.7} rotationIntensity={0.2} floatIntensity={0.9}>
      <group ref={meshRef} position={position} rotation={[0, 0, -0.3]} scale={0.4}>
        {/* Main cone */}
        <mesh rotation={[0, 0, Math.PI / 2]}>
          <coneGeometry args={[0.8, 1.8, 32, 1, true]} />
          <meshStandardMaterial color="#f59e0b" metalness={0.7} roughness={0.2} side={THREE.DoubleSide} />
        </mesh>
        {/* Handle */}
        <mesh position={[-1.2, -0.3, 0]} rotation={[0, 0, Math.PI / 4]}>
          <cylinderGeometry args={[0.12, 0.12, 0.8, 16]} />
          <meshStandardMaterial color="#1a1a2e" metalness={0.8} roughness={0.2} />
        </mesh>
        {/* Sound waves */}
        <mesh position={[1.2, 0, 0]} rotation={[0, Math.PI / 2, 0]}>
          <torusGeometry args={[0.5, 0.03, 8, 32, Math.PI]} />
          <meshStandardMaterial color="#f59e0b" emissive="#f59e0b" emissiveIntensity={0.5} transparent opacity={0.6} />
        </mesh>
        <mesh position={[1.5, 0, 0]} rotation={[0, Math.PI / 2, 0]}>
          <torusGeometry args={[0.7, 0.03, 8, 32, Math.PI]} />
          <meshStandardMaterial color="#f59e0b" emissive="#f59e0b" emissiveIntensity={0.4} transparent opacity={0.4} />
        </mesh>
      </group>
    </Float>
  );
};

// 3D Lock - Represents Security
const Lock3D = ({ position, speed = 1 }: { position: [number, number, number]; speed?: number }) => {
  const meshRef = useRef<THREE.Group>(null);
  
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y = state.clock.elapsedTime * 0.3 * speed;
    }
  });

  return (
    <Float speed={speed * 0.5} rotationIntensity={0.3} floatIntensity={0.7}>
      <group ref={meshRef} position={position} scale={0.35}>
        {/* Lock body */}
        <RoundedBox args={[1.2, 1, 0.5]} radius={0.1} smoothness={4}>
          <meshStandardMaterial color="#3b82f6" metalness={0.8} roughness={0.2} />
        </RoundedBox>
        {/* Lock shackle */}
        <mesh position={[0, 0.7, 0]}>
          <torusGeometry args={[0.4, 0.1, 16, 32, Math.PI]} />
          <meshStandardMaterial color="#60a5fa" metalness={0.9} roughness={0.1} />
        </mesh>
        {/* Keyhole */}
        <mesh position={[0, -0.1, 0.26]}>
          <circleGeometry args={[0.12, 32]} />
          <meshStandardMaterial color="#1a1a2e" />
        </mesh>
        <mesh position={[0, -0.25, 0.26]}>
          <boxGeometry args={[0.08, 0.2, 0.01]} />
          <meshStandardMaterial color="#1a1a2e" />
        </mesh>
      </group>
    </Float>
  );
};

// 3D Chat Bubble - Represents Communication
const ChatBubble3D = ({ position, speed = 1 }: { position: [number, number, number]; speed?: number }) => {
  const meshRef = useRef<THREE.Group>(null);
  
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.scale.setScalar(0.4 + Math.sin(state.clock.elapsedTime * 2 * speed) * 0.02);
      meshRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.5 * speed) * 0.2;
    }
  });

  return (
    <Float speed={speed * 0.8} rotationIntensity={0.2} floatIntensity={1.2}>
      <group ref={meshRef} position={position} scale={0.4}>
        {/* Main bubble */}
        <RoundedBox args={[1.8, 1.2, 0.4]} radius={0.3} smoothness={4}>
          <MeshTransmissionMaterial
            backside
            samples={4}
            thickness={0.5}
            chromaticAberration={0.1}
            anisotropy={0.3}
            distortion={0.1}
            distortionScale={0.2}
            temporalDistortion={0.1}
            color="#ec4899"
            transmission={0.9}
          />
        </RoundedBox>
        {/* Bubble tail */}
        <mesh position={[-0.6, -0.7, 0]} rotation={[0, 0, Math.PI / 4]}>
          <coneGeometry args={[0.25, 0.4, 3]} />
          <meshStandardMaterial color="#ec4899" transparent opacity={0.8} />
        </mesh>
        {/* Dots inside */}
        <mesh position={[-0.4, 0, 0.22]}>
          <sphereGeometry args={[0.1, 16, 16]} />
          <meshStandardMaterial color="#ffffff" />
        </mesh>
        <mesh position={[0, 0, 0.22]}>
          <sphereGeometry args={[0.1, 16, 16]} />
          <meshStandardMaterial color="#ffffff" />
        </mesh>
        <mesh position={[0.4, 0, 0.22]}>
          <sphereGeometry args={[0.1, 16, 16]} />
          <meshStandardMaterial color="#ffffff" />
        </mesh>
      </group>
    </Float>
  );
};

// Main 3D Scene
const Scene3D = () => {
  return (
    <>
      <Environment preset="night" />
      <ambientLight intensity={0.4} />
      <directionalLight position={[10, 10, 5]} intensity={1.2} color="#ffffff" />
      <pointLight position={[-10, 5, -5]} intensity={0.8} color="#8b5cf6" />
      <pointLight position={[10, -5, 5]} intensity={0.6} color="#10b981" />
      
      {/* Meaningful 3D Icons */}
      <AnonymousMask3D position={[-2.5, 1.5, -1]} speed={0.8} />
      <Shield3D position={[2.5, 1.2, -1.5]} speed={1} />
      <Megaphone3D position={[-3, -0.8, -1]} speed={0.9} />
      <Lock3D position={[3, -0.5, -1.5]} speed={1.1} />
      <ChatBubble3D position={[0, 2.2, -2]} speed={0.7} />
      
      {/* Secondary decorative elements */}
      <Float speed={0.5} floatIntensity={0.5}>
        <mesh position={[-4, 0, -3]}>
          <sphereGeometry args={[0.15, 16, 16]} />
          <meshStandardMaterial color="#8b5cf6" emissive="#8b5cf6" emissiveIntensity={0.5} />
        </mesh>
      </Float>
      <Float speed={0.6} floatIntensity={0.6}>
        <mesh position={[4, 1.5, -3]}>
          <sphereGeometry args={[0.12, 16, 16]} />
          <meshStandardMaterial color="#10b981" emissive="#10b981" emissiveIntensity={0.5} />
        </mesh>
      </Float>
      <Float speed={0.7} floatIntensity={0.4}>
        <mesh position={[0, -1.5, -2.5]}>
          <sphereGeometry args={[0.1, 16, 16]} />
          <meshStandardMaterial color="#f59e0b" emissive="#f59e0b" emissiveIntensity={0.5} />
        </mesh>
      </Float>
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
