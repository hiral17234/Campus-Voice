import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { 
  ArrowRight, 
  Shield, 
  Lock, 
  Megaphone, 
  AlertTriangle, 
  MessageSquareOff,
  FileEdit,
  Users,
  CheckCircle,
  Sparkles,
  ChevronDown,
  Code2,
  GraduationCap,
  MapPin
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { FloatingParticles } from "@/components/welcome/FloatingParticles";
import { AnimatedText, AnimatedCharacters } from "@/components/welcome/AnimatedText";
import { CountUp } from "@/components/welcome/CountUp";
import { ScrollProgress } from "@/components/welcome/ScrollProgress";
import { FloatingNav } from "@/components/welcome/FloatingNav";

export default function Welcome() {
  const navigate = useNavigate();

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

  const pillars = [
    {
      icon: Shield,
      title: "Complete Anonymity",
      description: "Your identity stays hidden. Report without fear of judgment or backlash.",
      gradient: "from-yellow-400 to-orange-500"
    },
    {
      icon: Lock,
      title: "Secure & Private",
      description: "Enterprise-grade security protects your data and privacy.",
      gradient: "from-purple-400 to-pink-500"
    },
    {
      icon: Megaphone,
      title: "Voice Amplified",
      description: "Community upvotes ensure important issues get the attention they deserve.",
      gradient: "from-blue-400 to-cyan-500"
    }
  ];

  const steps = [
    { icon: FileEdit, title: "Report", description: "Submit your issue anonymously with details and media" },
    { icon: Users, title: "Community Votes", description: "Students upvote issues that matter most" },
    { icon: CheckCircle, title: "Faculty Action", description: "Administration reviews prioritized concerns" },
    { icon: Sparkles, title: "Resolution", description: "Issues get resolved and you see real change" }
  ];

  const stats = [
    { value: 15000, suffix: "+", label: "Issues Raised" },
    { value: 95, suffix: "%", label: "Resolution Rate" },
    { value: 100, suffix: "%", label: "Anonymous" }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#05070c] via-[#0b1220] to-[#0f172a] text-white overflow-x-hidden">
      <ScrollProgress />
      <FloatingParticles />
      <FloatingNav />

      {/* Hero Section */}
      <section id="hero" className="min-h-screen relative flex flex-col items-center justify-center px-4 sm:px-6">
        {/* Vignette overlay */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,rgba(5,7,12,0.8)_70%)] pointer-events-none z-10" />
        
        <motion.div 
          className="relative z-20 text-center max-w-5xl mx-auto"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1 }}
        >
          {/* Animated Glowy Logo */}
          <motion.div
            className="relative mx-auto mb-8 w-fit"
            initial={{ opacity: 0, scale: 0.8, y: -30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.8, type: "spring" }}
          >
            <motion.div
              className="absolute inset-0 blur-2xl bg-gradient-to-r from-yellow-400/40 via-purple-500/40 to-pink-500/40 rounded-full"
              animate={{ 
                scale: [1, 1.2, 1],
                opacity: [0.5, 0.8, 0.5]
              }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            />
            <motion.img
              src="/campusvoice-logo.png"
              alt="CampusVoice"
              className="relative h-14 sm:h-20 drop-shadow-[0_0_30px_rgba(251,191,36,0.6)]"
              animate={{ 
                filter: [
                  "drop-shadow(0 0 20px rgba(251,191,36,0.4))",
                  "drop-shadow(0 0 40px rgba(251,191,36,0.7))",
                  "drop-shadow(0 0 20px rgba(251,191,36,0.4))"
                ]
              }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            />
          </motion.div>
          
          <h1 className="text-4xl sm:text-6xl md:text-8xl font-bold mb-6">
            <AnimatedCharacters 
              text="Your Voice," 
              className="bg-gradient-to-r from-yellow-400 via-purple-500 to-pink-500 bg-clip-text text-transparent"
              delay={0.3}
            />
            <br />
            <AnimatedCharacters 
              text="CampusVoice" 
              className="text-white"
              delay={0.8}
            />
          </h1>
          
          <motion.p 
            className="text-lg sm:text-xl md:text-2xl text-white/60 max-w-2xl mx-auto mb-10 px-4"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 1.2 }}
          >
            Where scattered whispers become a powerful roar
          </motion.p>
          
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 1.5 }}
          >
            <Button
              size="lg"
              onClick={handleGetStarted}
              className="px-10 sm:px-14 py-6 sm:py-7 text-lg sm:text-xl rounded-full bg-gradient-to-r from-yellow-400 to-purple-600 text-black font-semibold hover:opacity-90 shadow-[0_0_80px_rgba(251,191,36,0.4)] transition-all hover:scale-105 hover:shadow-[0_0_100px_rgba(251,191,36,0.5)]"
            >
              Get Started
              <ArrowRight className="ml-2 w-6 h-6" />
            </Button>
          </motion.div>
        </motion.div>
        
        {/* Scroll Indicator */}
        <motion.div 
          className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20"
          animate={{ y: [0, 12, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        >
          <ChevronDown className="w-8 h-8 text-white/40" />
        </motion.div>
      </section>

      {/* Problem Section */}
      <section id="problem" className="min-h-screen flex items-center justify-center px-4 sm:px-6 py-20">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 1 }}
          >
            <h2 className="text-3xl sm:text-5xl md:text-6xl font-bold mb-8 leading-tight">
              <AnimatedText 
                text="Issues go unheard." 
                className="text-white/80"
              />
              <br />
              <AnimatedText 
                text="Fear silences change." 
                className="text-red-400/80"
                delay={0.5}
              />
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mt-12">
            <motion.div
              className="bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10"
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              <AlertTriangle className="w-12 h-12 text-yellow-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Broken Infrastructure</h3>
              <p className="text-white/50 text-sm">Problems persist because reporting feels pointless or risky</p>
            </motion.div>

            <motion.div
              className="bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10"
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.5 }}
            >
              <MessageSquareOff className="w-12 h-12 text-red-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Ignored Complaints</h3>
              <p className="text-white/50 text-sm">Individual voices get lost without collective support</p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Solution Section */}
      <section id="solution" className="min-h-screen flex items-center justify-center px-4 sm:px-6 py-20 relative">
        {/* Glow effect */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-[600px] h-[600px] bg-purple-500/10 rounded-full blur-[120px]" />
        </div>

        <div className="max-w-6xl mx-auto text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <img
              src="/campusvoice-logo.png"
              alt="CampusVoice"
              className="h-16 sm:h-24 mx-auto mb-6 drop-shadow-[0_0_30px_rgba(251,191,36,0.5)]"
            />
            <h2 className="text-2xl sm:text-4xl md:text-5xl font-bold mb-4">
              <AnimatedText text="Where scattered whispers become" className="text-white" />
              <br />
              <span className="bg-gradient-to-r from-yellow-400 to-purple-500 bg-clip-text text-transparent">
                <AnimatedText text="a powerful roar" delay={0.3} />
              </span>
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-16">
            {pillars.map((pillar, i) => (
              <motion.div
                key={pillar.title}
                className="bg-white/5 backdrop-blur-md rounded-2xl p-8 border border-white/10 hover:border-white/20 transition-all group"
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: i * 0.15 }}
                whileHover={{ y: -5, scale: 1.02 }}
              >
                <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${pillar.gradient} flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform shadow-lg`}>
                  <pillar.icon className="w-8 h-8 text-white" />
                </div>
                <h3 className="font-bold text-xl mb-3">{pillar.title}</h3>
                <p className="text-white/60 text-sm leading-relaxed">{pillar.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-20 sm:py-32 px-4 sm:px-6">
        <div className="max-w-5xl mx-auto">
          <motion.div 
            className="text-center mb-16"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl sm:text-5xl font-bold mb-4">
              <span className="bg-gradient-to-r from-yellow-400 to-purple-500 bg-clip-text text-transparent">
                How It Works
              </span>
            </h2>
            <p className="text-white/50">Four simple steps to create real change</p>
          </motion.div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {steps.map((step, i) => (
              <motion.div
                key={step.title}
                className="relative"
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
              >
                <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10 h-full">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-yellow-400 to-purple-600 flex items-center justify-center text-black font-bold text-sm">
                      {String(i + 1).padStart(2, '0')}
                    </div>
                    <step.icon className="w-6 h-6 text-purple-400" />
                  </div>
                  <h3 className="font-semibold text-lg mb-2">{step.title}</h3>
                  <p className="text-white/50 text-sm">{step.description}</p>
                </div>
                
                {i < steps.length - 1 && (
                  <div className="hidden lg:block absolute top-1/2 -right-3 w-6 h-[2px] bg-gradient-to-r from-purple-500/50 to-transparent" />
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section id="stats" className="py-20 px-4 sm:px-6">
        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
            {stats.map((stat, i) => (
              <motion.div
                key={stat.label}
                className="text-center"
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
              >
                <div className="text-4xl sm:text-6xl font-bold bg-gradient-to-r from-yellow-400 to-purple-500 bg-clip-text text-transparent mb-2">
                  <CountUp end={stat.value} suffix={stat.suffix} />
                </div>
                <p className="text-white/60 text-sm sm:text-base">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section id="cta" className="py-20 sm:py-32 px-4 sm:px-6">
        <motion.div 
          className="max-w-3xl mx-auto text-center"
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h2 className="text-3xl sm:text-5xl font-bold mb-6">
            Ready to Make a{" "}
            <span className="bg-gradient-to-r from-yellow-400 to-purple-500 bg-clip-text text-transparent">
              Difference?
            </span>
          </h2>
          <p className="text-white/60 mb-10 text-lg">
            Join thousands of students creating positive change on their campus.
          </p>
          <Button
            size="lg"
            onClick={handleGetStarted}
            className="px-12 py-7 text-xl rounded-full bg-gradient-to-r from-yellow-400 to-purple-600 text-black font-semibold hover:opacity-90 shadow-[0_0_60px_rgba(251,191,36,0.3)] transition-all hover:scale-105 animate-pulse"
          >
            Get Started Now
            <ArrowRight className="ml-2 w-6 h-6" />
          </Button>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="py-16 sm:py-20 px-4 sm:px-6 border-t border-white/10">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-8"
          >
            <img
              src="/campusvoice-logo.png"
              alt="CampusVoice"
              className="h-10 sm:h-12 mx-auto mb-4 opacity-80"
            />
            <p className="text-white/40 text-sm">
              Built for students, powered by collective voice
            </p>
          </motion.div>
          
          {/* Professional Developer Credits Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="relative group"
          >
            {/* Gradient border effect */}
            <div className="absolute -inset-0.5 bg-gradient-to-r from-yellow-400 via-purple-500 to-pink-500 rounded-2xl opacity-30 group-hover:opacity-50 blur transition-opacity" />
            
            <div className="relative bg-[#0a0f1a] rounded-2xl p-8 sm:p-10 border border-white/10">
              {/* Developer badge */}
              <div className="flex items-center justify-center gap-2 mb-6">
                <Code2 className="w-5 h-5 text-yellow-400" />
                <span className="text-xs font-semibold tracking-[0.2em] text-white/60 uppercase">Developer</span>
              </div>
              
              {/* Name */}
              <h3 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-yellow-400 to-purple-500 bg-clip-text text-transparent mb-6">
                HIRAL GOYAL
              </h3>
              
              {/* Details */}
              <div className="space-y-3">
                <div className="flex items-center justify-center gap-2 text-white/70">
                  <GraduationCap className="w-4 h-4 text-purple-400" />
                  <span className="text-sm sm:text-base">Mathematics and Computing</span>
                </div>
                <div className="flex items-center justify-center gap-2 text-white/50">
                  <MapPin className="w-4 h-4 text-pink-400" />
                  <span className="text-xs sm:text-sm">Madhav Institute of Technology and Science, Gwalior</span>
                </div>
              </div>
            </div>
          </motion.div>
          
          <p className="mt-10 text-white/30 text-xs">
            © {new Date().getFullYear()} CampusVoice · All rights reserved
          </p>
        </div>
      </footer>
    </div>
  );
}
