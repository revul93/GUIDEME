import { useTranslation } from "react-i18next";

const WhoWeAre = () => {
  const { t } = useTranslation();

  return (
    <section
      id="who-we-are"
      className="py-12 md:py-16 bg-gray-50 dark:bg-gray-900 scroll-mt-20"
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto">
          {/* About Us Content - Centered */}
          <div className="text-center space-y-6 animate-fade-in-up delay-100">
            <div className="bg-light dark:bg-gray-800 rounded-xl p-8 border border-gray-200 dark:border-gray-700 shadow-lg">
              <div className="text-center mb-8 md:mb-12 animate-slide-in-left">
                <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-primary dark:text-light mb-3">
                  {t("whoWeAre.title")}
                </h2>
                <div className="w-16 h-1 bg-accent dark:bg-accent-secondary mx-auto rounded-full"></div>
              </div>
              <div className="space-y-4 text-charcoal dark:text-gray-300 leading-relaxed">
                <p>{t("whoWeAre.p1")}</p>
                <p>{t("whoWeAre.p2")}</p>
              </div>
            </div>
          </div>

          {/* Core Values - Three Pillars */}
          <div className="grid md:grid-cols-3 gap-6 mt-8">
            {/* Card 1 */}
            <div className="bg-light dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-all duration-300 hover:-translate-y-1 animate-scale-in delay-200 text-center">
              <h3 className="text-lg font-bold text-accent dark:text-accent-secondary mb-3">
                {t("whoWeAre.cloud.title")}
              </h3>
              <p className="text-sm text-charcoal dark:text-gray-300 leading-relaxed">
                {t("whoWeAre.cloud.text")}
              </p>
            </div>

            {/* Card 2 */}
            <div className="bg-light dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-all duration-300 hover:-translate-y-1 animate-scale-in delay-300 text-center">
              <h3 className="text-lg font-bold text-accent dark:text-accent-secondary mb-3">
                {t("whoWeAre.precision.title")}
              </h3>
              <p className="text-sm text-charcoal dark:text-gray-300 leading-relaxed">
                {t("whoWeAre.precision.text")}
              </p>
            </div>

            {/* Card 3 */}
            <div className="bg-light dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-all duration-300 hover:-translate-y-1 animate-scale-in delay-400 text-center">
              <h3 className="text-lg font-bold text-accent dark:text-accent-secondary mb-3">
                {t("whoWeAre.outcomes.title")}
              </h3>
              <p className="text-sm text-charcoal dark:text-gray-300 leading-relaxed">
                {t("whoWeAre.outcomes.text")}
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default WhoWeAre;
