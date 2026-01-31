import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, Menu, X } from "lucide-react";

const navItems = [
  { id: "hero", label: "Home" },
  { id: "problem", label: "Problem" },
  { id: "solution", label: "Solution" },
  { id: "how-it-works", label: "How It Works" },
  { id: "stats", label: "Stats" },
];

export function FloatingNav() {
  const [isVisible, setIsVisible] = useState(false);
  const [activeSection, setActiveSection] = useState("hero");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsVisible(window.scrollY > window.innerHeight * 0.5);
      // Close mobile menu on scroll
      if (isMobileMenuOpen) {
        setIsMobileMenuOpen(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [isMobileMenuOpen]);

  useEffect(() => {
    const observers: IntersectionObserver[] = [];

    navItems.forEach(({ id }) => {
      const element = document.getElementById(id);
      if (element) {
        const observer = new IntersectionObserver(
          (entries) => {
            entries.forEach((entry) => {
              if (entry.isIntersecting) {
                setActiveSection(id);
              }
            });
          },
          { threshold: 0.3, rootMargin: "-20% 0px -60% 0px" }
        );
        observer.observe(element);
        observers.push(observer);
      }
    });

    return () => observers.forEach((obs) => obs.disconnect());
  }, []);

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
      setIsMobileMenuOpen(false);
    }
  };

  const scrollToCTA = () => {
    const element = document.getElementById("cta");
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
      setIsMobileMenuOpen(false);
    }
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.nav
          initial={{ y: -100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -100, opacity: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          className="fixed top-0 left-0 right-0 z-50 px-4 py-3"
        >
          <div className="max-w-6xl mx-auto">
            <div className="bg-black/40 backdrop-blur-lg border border-white/10 rounded-full px-4 sm:px-6 py-3 flex items-center justify-between gap-2">
              {/* Logo */}
              <motion.img
                src="/campusvoice-logo.png"
                alt="CampusVoice"
                className="h-6 sm:h-8 cursor-pointer"
                onClick={() => scrollToSection("hero")}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              />

              {/* Nav Links - Hidden on mobile */}
              <div className="hidden md:flex items-center gap-1">
                {navItems.map((item) => (
                  <motion.button
                    key={item.id}
                    onClick={() => scrollToSection(item.id)}
                    className={`relative px-3 py-1.5 text-sm font-medium transition-colors ${
                      activeSection === item.id
                        ? "text-white"
                        : "text-white/60 hover:text-white/80"
                    }`}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    {item.label}
                    {activeSection === item.id && (
                      <motion.div
                        layoutId="activeSection"
                        className="absolute bottom-0 left-1/2 -translate-x-1/2 w-4 h-0.5 bg-gradient-to-r from-yellow-400 to-purple-500 rounded-full"
                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                      />
                    )}
                  </motion.button>
                ))}
              </div>

              {/* Mobile Menu Button */}
              <motion.button
                className="md:hidden p-2 text-white/80 hover:text-white"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                whileTap={{ scale: 0.95 }}
              >
                {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </motion.button>

              {/* CTA Button */}
              <motion.button
                onClick={scrollToCTA}
                className="hidden sm:flex items-center gap-1 px-4 py-1.5 text-sm font-semibold rounded-full bg-gradient-to-r from-yellow-400 to-purple-600 text-black hover:opacity-90 transition-opacity"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <span>Get Started</span>
                <ArrowRight className="w-4 h-4" />
              </motion.button>
            </div>

            {/* Mobile Menu Dropdown */}
            <AnimatePresence>
              {isMobileMenuOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -10, scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                  className="md:hidden mt-2 bg-black/60 backdrop-blur-lg border border-white/10 rounded-2xl overflow-hidden"
                >
                  <div className="py-2">
                    {navItems.map((item, index) => (
                      <motion.button
                        key={item.id}
                        onClick={() => scrollToSection(item.id)}
                        className={`w-full px-6 py-3 text-left text-sm font-medium transition-colors flex items-center gap-3 ${
                          activeSection === item.id
                            ? "text-white bg-white/10"
                            : "text-white/60 hover:text-white hover:bg-white/5"
                        }`}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                      >
                        {activeSection === item.id && (
                          <span className="w-1.5 h-1.5 rounded-full bg-gradient-to-r from-yellow-400 to-purple-500" />
                        )}
                        {item.label}
                      </motion.button>
                    ))}
                    
                    {/* Mobile CTA */}
                    <motion.button
                      onClick={scrollToCTA}
                      className="w-full mt-2 mx-4 mb-2 flex items-center justify-center gap-2 px-4 py-3 text-sm font-semibold rounded-xl bg-gradient-to-r from-yellow-400 to-purple-600 text-black"
                      style={{ width: "calc(100% - 32px)" }}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.25 }}
                    >
                      Get Started
                      <ArrowRight className="w-4 h-4" />
                    </motion.button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.nav>
      )}
    </AnimatePresence>
  );
}
