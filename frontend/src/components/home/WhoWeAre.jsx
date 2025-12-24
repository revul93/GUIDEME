import { useTranslation } from "react-i18next";

const WhoWeAre = () => {
  const { t } = useTranslation();

  return (
    <section
      id="who-we-are"
      className="py-12 md:py-20 bg-slate-50 dark:bg-slate-900 scroll-mt-20"
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          {/* Section Title */}
          <div className="text-center mb-10 md:mb-16">
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white mb-2 md:mb-4">
              {t("whoWeAre.title")}
            </h2>
            <div className="w-20 md:w-24 h-1 bg-primary dark:bg-secondary mx-auto rounded-full"></div>
          </div>

          {/* Content Grid */}
          <div className="grid md:grid-cols-3 gap-4 md:gap-8">
            {/* Card 1 - Green Theme */}
            <div className="bg-green-100 dark:bg-green-900 rounded-2xl p-6 md:p-8 hover:shadow-xl transition-all duration-300 hover:-translate-y-2 text-center">
              <div className="w-14 md:w-16 h-14 md:h-16 bg-green-500/20 dark:bg-green-400/20 rounded-xl flex items-center justify-center mb-4 md:mb-6 mx-auto">
                <svg
                  className="w-7 md:w-8 h-7 md:h-8 text-green-600 dark:text-green-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                  />
                </svg>
              </div>
              <h3 className="text-lg md:text-xl font-bold text-gray-900 dark:text-white mb-3 md:mb-4">
                {t("whoWeAre.cloud.title")}
              </h3>
              <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                {t("whoWeAre.cloud.text")}
              </p>
            </div>

            {/* Card 2 - Pink Theme */}
            <div className="bg-pink-100 dark:bg-pink-900 rounded-2xl p-6 md:p-8 hover:shadow-xl transition-all duration-300 hover:-translate-y-2 text-center">
              <div className="w-14 md:w-16 h-14 md:h-16 bg-pink-500/20 dark:bg-pink-400/20 rounded-xl flex items-center justify-center mb-4 md:mb-6 mx-auto">
                <svg
                  className="w-7 md:w-8 h-7 md:h-8 text-pink-600 dark:text-pink-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                  />
                </svg>
              </div>
              <h3 className="text-lg md:text-xl font-bold text-gray-900 dark:text-white mb-3 md:mb-4">
                {t("whoWeAre.precision.title")}
              </h3>
              <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                {t("whoWeAre.precision.text")}
              </p>
            </div>

            {/* Card 3 - Yellow Theme */}
            <div className="bg-yellow-100 dark:bg-yellow-900 rounded-2xl p-6 md:p-8 hover:shadow-xl transition-all duration-300 hover:-translate-y-2 text-center">
              <div className="w-14 md:w-16 h-14 md:h-16 bg-yellow-500/20 dark:bg-yellow-400/20 rounded-xl flex items-center justify-center mb-4 md:mb-6 mx-auto">
                <svg
                  className="w-7 md:w-8 h-7 md:h-8 text-yellow-600 dark:text-yellow-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 10V3L4 14h7v7l9-11h-7z"
                  />
                </svg>
              </div>
              <h3 className="text-lg md:text-xl font-bold text-gray-900 dark:text-white mb-3 md:mb-4">
                {t("whoWeAre.outcomes.title")}
              </h3>
              <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                {t("whoWeAre.outcomes.text")}
              </p>
            </div>
          </div>

          {/* Bottom Statement */}
          <div className="mt-8 md:mt-12 text-center">
            <p className="text-sm sm:text-base md:text-lg text-gray-700 dark:text-gray-300 max-w-3xl mx-auto leading-relaxed">
              {t("whoWeAre.statement")}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default WhoWeAre;
