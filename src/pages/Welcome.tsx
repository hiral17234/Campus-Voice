import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Welcome() {
  const navigate = useNavigate();

  // ✅ Skip welcome for returning users
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

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#05070c] via-[#0b1220] to-black text-white">
      {/* MAIN CONTENT */}
      <div className="max-w-6xl mx-auto px-6 py-20 flex flex-col items-center text-center">
        
        {/* LOGO */}
        <img
          src="/campusvoice-logo.png"
          alt="CampusVoice"
          className="h-14 mb-6 opacity-95"
        />

        {/* TITLE */}
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-5">
          <span className="bg-gradient-to-r from-yellow-400 via-purple-500 to-pink-500 bg-clip-text text-transparent">
            CampusVoice
          </span>
        </h1>

        {/* TAGLINE */}
        <p className="text-base sm:text-lg text-white/70 max-w-2xl leading-relaxed mb-10">
          When voices are scattered, we help them get found.
          <br />
          Report issues. Be heard. Create real change on your campus.
        </p>

        {/* CTA */}
        <Button
          size="lg"
          onClick={handleGetStarted}
          className="
            px-12 py-6 text-lg rounded-full
            bg-gradient-to-r from-yellow-400 to-purple-600
            text-black hover:opacity-90
            shadow-[0_0_60px_rgba(255,210,120,0.35)]
          "
        >
          Get Started
          <ArrowRight className="ml-2 w-5 h-5" />
        </Button>

        {/* WHY CAMPUSVOICE */}
        <div className="mt-24 w-full">
          <h2 className="text-2xl font-semibold mb-10 text-center">
            Why CampusVoice?
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 text-left">
            {[
              {
                title: "Raise Your Voice",
                desc: "Report academic, hostel, transport, or infrastructure issues in one trusted place.",
              },
              {
                title: "Community Driven",
                desc: "Upvote issues that matter to you and your peers to drive real attention.",
              },
              {
                title: "Transparent Resolution",
                desc: "Track the status of issues as they move from reported to resolved.",
              },
              {
                title: "Safe & Secure",
                desc: "Your identity stays protected while your voice reaches the authorities.",
              },
            ].map((item, i) => (
              <div
                key={i}
                className="
                  bg-white/5 backdrop-blur-md
                  rounded-xl p-6
                  border border-white/10
                  hover:border-white/20
                  transition
                "
              >
                <h3 className="font-semibold mb-2">{item.title}</h3>
                <p className="text-sm text-white/70 leading-relaxed">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* FOOTER */}
        <footer className="mt-24 text-sm text-white/40">
          © {new Date().getFullYear()} CampusVoice · Built for students, powered by voices
        </footer>
      </div>
    </div>
  );
}
