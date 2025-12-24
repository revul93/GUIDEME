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
      {/* Gradient Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-light via-white to-gray-50 dark:from-dark dark:via-gray-900 dark:to-gray-800"></div>

      {/* Animated Moving Gradient Lights */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Light 1 - Top Left */}
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-gradient-to-br from-primary/20 to-primary/5 dark:from-secondary/20 dark:to-secondary/5 rounded-full blur-3xl animate-float"></div>

        {/* Light 2 - Top Right */}
        <div
          className="absolute -top-20 -right-20 w-80 h-80 bg-gradient-to-bl from-secondary/15 to-secondary/5 dark:from-primary/15 dark:to-primary/5 rounded-full blur-3xl animate-float"
          style={{ animationDelay: "1s", animationDuration: "8s" }}
        ></div>

        {/* Light 3 - Bottom Left */}
        <div
          className="absolute -bottom-32 -left-32 w-[28rem] h-[28rem] bg-gradient-to-tr from-primary/15 to-transparent dark:from-secondary/15 dark:to-transparent rounded-full blur-3xl animate-float"
          style={{ animationDelay: "2s", animationDuration: "10s" }}
        ></div>

        {/* Light 4 - Bottom Right */}
        <div
          className="absolute -bottom-20 -right-40 w-[32rem] h-[32rem] bg-gradient-to-tl from-secondary/20 to-transparent dark:from-primary/20 dark:to-transparent rounded-full blur-3xl animate-float"
          style={{ animationDelay: "3s", animationDuration: "12s" }}
        ></div>

        {/* Light 5 - Center */}
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[36rem] h-[36rem] bg-gradient-to-r from-primary/10 via-secondary/10 to-primary/10 dark:from-secondary/10 dark:via-primary/10 dark:to-secondary/10 rounded-full blur-3xl animate-pulse-slow"
          style={{ animationDuration: "6s" }}
        ></div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          {/* Main Heading */}
          <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold text-gray-900 dark:text-white leading-tight animate-fade-in-up">
            {t("hero.title")}
          </h1>

          {/* Subheading */}
          <p
            className="text-xl sm:text-2xl lg:text-3xl text-gray-600 dark:text-gray-300 font-medium animate-fade-in-up"
            style={{ animationDelay: "0.2s" }}
          >
            {t("hero.subtitle")}
          </p>

          {/* CTA Button */}
          <div
            className="pt-4 animate-fade-in-up"
            style={{ animationDelay: "0.4s" }}
          >
            <button
              onClick={handleKnowMore}
              className="inline-flex items-center gap-2 px-8 py-4 bg-primary hover:bg-primary-dark dark:bg-secondary dark:hover:bg-secondary-dark text-white text-lg font-semibold rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 cursor-pointer"
            >
              {t("hero.cta")}
              <svg
                className="w-5 h-5 rtl:rotate-180"
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

          {/* Stats */}
          <div
            className="grid grid-cols-3 gap-8 pt-12 max-w-3xl mx-auto animate-fade-in-up"
            style={{ animationDelay: "0.6s" }}
          >
            <div className="text-center">
              <div className="text-4xl sm:text-5xl font-bold text-primary dark:text-secondary mb-2">
                500+
              </div>
              <div className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
                {t("hero.stats.cases")}
              </div>
            </div>
            <div className="text-center">
              <div className="text-4xl sm:text-5xl font-bold text-primary dark:text-secondary mb-2">
                98%
              </div>
              <div className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
                {t("hero.stats.success")}
              </div>
            </div>
            <div className="text-center">
              <div className="text-4xl sm:text-5xl font-bold text-primary dark:text-secondary mb-2">
                24h
              </div>
              <div className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
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
