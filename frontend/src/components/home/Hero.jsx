import { useTranslation } from "react-i18next";

const Hero = () => {
  const { t } = useTranslation();

  const handleKnowMore = () => {
    const element = document.getElementById("who-we-are");
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <section
      id="home"
      className="relative min-h-screen flex items-center justify-center overflow-hidden scroll-mt-20"
    >
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <img
          src="/hero3.png"
          alt="Hero Background"
          className="w-full h-full object-cover"
        />
        {/* Overlay for better text readability */}
        <div className="absolute inset-0 bg-primary/60 dark:bg-primary/70"></div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10 py-20">
        <div className="max-w-4xl mx-auto text-center space-y-6">
          {/* Main Heading */}
          <h1 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-bold text-light leading-tight animate-fade-in drop-shadow-lg">
            {t("hero.title")}
          </h1>

          {/* Subheading */}
          <p className="text-lg sm:text-xl lg:text-2xl text-light/90 animate-fade-in delay-100 drop-shadow-md">
            {t("hero.subtitle")}
          </p>

          {/* CTA Button */}
          <div className="pt-2 animate-fade-in delay-200">
            <button
              onClick={handleKnowMore}
              className="inline-flex items-center gap-2 px-6 py-3 bg-accent hover:bg-accent/90 text-light hover:text-light rounded-lg font-semibold transition-all duration-300 shadow-lg hover:shadow-xl hover:-translate-y-0.5 cursor-pointer group"
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
          </div>

          {/* Stats - Compact */}
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
        </div>
      </div>
    </section>
  );
};

export default Hero;
