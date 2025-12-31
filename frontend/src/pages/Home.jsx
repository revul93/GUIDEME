import { useEffect, useState } from "react";
import Hero from "../components/home/Hero.jsx";
import WhoWeAre from "../components/home/WhoWeAre.jsx";
import HowWeWork from "../components/home/HowWeWork.jsx";
import Services from "../components/home/Services.jsx";
import Team from "../components/home/Team.jsx";
import Contact from "../components/home/Contact.jsx";
import Values from "../components/home/Values.jsx";
import AuthModal from "../components/layout/AuthModal.jsx";

const Home = ({ onSubmitCaseClick }) => {
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authModalType, setAuthModalType] = useState("register");
  useEffect(() => {
    // Smooth scroll behavior
    document.documentElement.style.scrollBehavior = "smooth";

    // Intersection Observer for 3D fade-in animations
    const observerOptions = {
      threshold: 0.15,
      rootMargin: "0px 0px -10% 0px",
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("animate-fade-in-up");
          entry.target.style.opacity = "1";
          observer.unobserve(entry.target);
        }
      });
    }, observerOptions);

    // Observe all sections with slight delay for cascade effect
    const sections = document.querySelectorAll(".section-animate");
    sections.forEach((section, index) => {
      setTimeout(() => {
        observer.observe(section);
      }, index * 50);
    });

    return () => {
      observer.disconnect();
      document.documentElement.style.scrollBehavior = "auto";
    };
  }, []);

  const handleSubmitCaseClick = () => {
    setAuthModalType("register");
    setAuthModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-light dark:bg-dark">
      <Hero onSubmitCaseClick={handleSubmitCaseClick} />

      <div className="section-animate opacity-0 transition-all duration-700">
        <WhoWeAre />
      </div>

      <div className="section-animate opacity-0 transition-all duration-700">
        <HowWeWork />
      </div>

      <div className="section-animate opacity-0 transition-all duration-700">
        <Values />
      </div>

      <div className="section-animate opacity-0 transition-all duration-700">
        <Services />
      </div>

      <div className="section-animate opacity-0 transition-all duration-700">
        <Team />
      </div>

      <div className="section-animate opacity-0 transition-all duration-700">
        <Contact onSubmitCaseClick={handleSubmitCaseClick} />
      </div>

      {/* Auth Modal */}
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        type={authModalType}
        onSwitchType={(type) => setAuthModalType(type)}
        onSuccess={() => {
          setAuthModalOpen(false);
          window.location.reload();
        }}
      />
    </div>
  );
};

export default Home;
