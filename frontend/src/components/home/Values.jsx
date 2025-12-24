import { useTranslation } from "react-i18next";

const Values = () => {
  const { t } = useTranslation();

  return (
    <section
      id="values"
      className="py-12 md:py-20 bg-gray-100 dark:bg-gray-900 scroll-mt-20"
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-10 md:mb-16">
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white mb-2 md:mb-4">
            {t("values.title")}
          </h2>
          <p className="text-sm sm:text-base md:text-lg text-gray-600 dark:text-gray-400">
            {t("values.subtitle")}
          </p>
        </div>

        {/* Mission & Vision - Centered */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 max-w-5xl mx-auto">
          {/* Mission */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 md:p-8 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 text-center">
            <div className="inline-flex items-center justify-center w-14 md:w-16 h-14 md:h-16 bg-primary/10 dark:bg-primary/20 rounded-full mb-4 md:mb-6 mx-auto">
              <span className="text-2xl md:text-3xl">🎯</span>
            </div>
            <h3 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white mb-3 md:mb-4">
              {t("values.mission.title")}
            </h3>
            <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
              {t("values.mission.description")}
            </p>
          </div>

          {/* Vision */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 md:p-8 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 text-center">
            <div className="inline-flex items-center justify-center w-14 md:w-16 h-14 md:h-16 bg-secondary/10 dark:bg-secondary/20 rounded-full mb-4 md:mb-6 mx-auto">
              <span className="text-2xl md:text-3xl">🚀</span>
            </div>
            <h3 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white mb-3 md:mb-4">
              {t("values.vision.title")}
            </h3>
            <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
              {t("values.vision.description")}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Values;
