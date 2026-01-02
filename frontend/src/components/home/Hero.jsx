import { useTranslation } from "react-i18next";
import { useAuth } from "../../context/AuthContext.jsx";

const Hero = ({ onSubmitCaseClick }) => {
  const { t } = useTranslation();
  const { isAuthenticated } = useAuth();

  const handleKnowMore = () => {
    const element = document.getElementById("who-we-are");
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  const handleSubmitCase = () => {
    if (isAuthenticated) {
      window.location.href = "/dashboard/newcase";
    } else {
      onSubmitCaseClick();
    }
  };

  return (
    <section
      id="home"
      className="relative min-h-screen flex items-center justify-center overflow-hidden scroll-mt-20"
    >
      {/* Background Image with Parallax */}
      <div className="absolute inset-0 z-0">
        <div
          className="w-full h-full bg-cover  bg-fixed"
          style={{ backgroundImage: "url(/background_1.png)" }}
        />
        {/* Overlay */}
        <div className="absolute inset-0 bg-primary/70 dark:bg-primary/80"></div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10 py-20">
        <div className="max-w-4xl mx-auto text-center space-y-6">
          {/* Main Heading - Smaller Font */}
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-primary dark:text-light mb-3">
            {t("hero.title")}
          </h1>

          {/* Subheading */}
          <p className="text-base sm:text-lg lg:text-xl text-light/90 animate-fade-in delay-100 drop-shadow-md">
            {t("hero.subtitle")}
          </p>

          {/* CTA Buttons */}
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-in delay-200">
            <button
              onClick={handleKnowMore}
              className="inline-flex items-center gap-2 px-6 py-3 bg-accent hover:bg-accent/90 text-light rounded-lg font-semibold transition-all duration-300 shadow-lg hover:shadow-xl hover:-translate-y-0.5 group"
            >
              {t("hero.cta")}
              <svg
                className="w-5 h-5 rtl:rotate-180 transition-transform group-hover:translate-x-1"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 7l5 5m0 0l-5 5m5-5H6"
                />
              </svg>
            </button>

            <button
              onClick={handleSubmitCase}
              className="inline-flex items-center gap-2 px-6 py-3 bg-light hover:bg-light/90 text-primary rounded-lg font-semibold transition-all duration-300 shadow-lg hover:shadow-xl hover:-translate-y-0.5"
            >
              {t("hero.submitCase")}
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4v16m8-8H4"
                />
              </svg>
            </button>
          </div>

          {/* Stats - Compact 
            <div className="grid grid-cols-3 gap-4 pt-6 max-w-2xl mx-auto animate-fade-in delay-300">
              <div className="text-center transform transition-transform duration-300 hover:scale-105 bg-light/10 backdrop-blur-sm rounded-lg p-4">
                <div className="text-3xl sm:text-4xl font-bold text-accent-secondary mb-1 drop-shadow-md">
                  500+
                </div>
                <div className="text-xs sm:text-sm text-light/90">
                  {t("hero.stats.cases")}
                </div>
              </div>
              <div className="text-center transform transition-transform duration-300 hover:scale-105 bg-light/10 backdrop-blur-sm rounded-lg p-4">
                <div className="text-3xl sm:text-4xl font-bold text-accent-secondary mb-1 drop-shadow-md">
                  98%
                </div>
                <div className="text-xs sm:text-sm text-light/90">
                  {t("hero.stats.success")}
                </div>
              </div>
              <div className="text-center transform transition-transform duration-300 hover:scale-105 bg-light/10 backdrop-blur-sm rounded-lg p-4">
                <div className="text-3xl sm:text-4xl font-bold text-accent-secondary mb-1 drop-shadow-md">
                  24h
                </div>
                <div className="text-xs sm:text-sm text-light/90">
                  {t("hero.stats.response")}
                </div>
              </div>
            </div>
          */}
        </div>
      </div>
    </section>
  );
};

export default Hero;
