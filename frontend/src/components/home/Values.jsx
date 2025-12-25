import { useTranslation } from "react-i18next";

const Values = () => {
  const { t } = useTranslation();

  const values = [
    {
      title: t("values.precision.title"),
      description: t("values.precision.description"),
    },
    {
      title: t("values.transparency.title"),
      description: t("values.transparency.description"),
    },
    {
      title: t("values.reliability.title"),
      description: t("values.reliability.description"),
    },
    {
      title: t("values.innovation.title"),
      description: t("values.innovation.description"),
    },
    {
      title: t("values.partnership.title"),
      description: t("values.partnership.description"),
    },
  ];

  return (
    <section
      id="values"
      className="py-12 md:py-16 bg-gray-50 dark:bg-gray-900 scroll-mt-20"
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-8 md:mb-12 animate-fade-in">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-primary dark:text-light mb-3">
            {t("values.title")}
          </h2>
          <p className="text-sm sm:text-base text-charcoal dark:text-gray-400">
            {t("values.subtitle")}
          </p>
        </div>

        {/* Values Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto mb-12 animate-fade-in delay-100">
          {values.map((value, index) => (
            <div
              key={index}
              className="bg-light dark:bg-gray-800 rounded-xl p-6 border border-accent/30 dark:border-accent-secondary/30 hover:border-accent dark:hover:border-accent-secondary hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
            >
              <h3 className="text-center text-lg font-bold text-accent dark:text-accent-secondary mb-3">
                {value.title}
              </h3>
              <p className="text-center text-sm text-charcoal dark:text-gray-300 leading-relaxed">
                {value.description}
              </p>
            </div>
          ))}
        </div>

        {/* Divider */}
        <div className="max-w-6xl mx-auto mb-8">
          <div className="h-px bg-gradient-to-r from-transparent via-accent/30 dark:via-accent-secondary/30 to-transparent"></div>
        </div>

        {/* Mission & Vision Section */}
        <div className="max-w-6xl mx-auto animate-fade-in delay-200">
          {/* Title */}
          <h3 className="text-center text-xl sm:text-2xl font-bold text-primary dark:text-light text-center mb-6">
            {t("values.missionVisionTitle")}
          </h3>

          {/* Mission & Vision Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Mission */}
            <div className="bg-light dark:bg-gray-800 rounded-xl p-6 border-2 border-accent dark:border-accent-secondary hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
              <h4 className="text-xl font-bold text-accent dark:text-accent-secondary mb-3">
                {t("values.mission.title")}
              </h4>
              <p className="text-sm text-charcoal dark:text-gray-300 leading-relaxed">
                {t("values.mission.description")}
              </p>
            </div>

            {/* Vision */}
            <div className="bg-light dark:bg-gray-800 rounded-xl p-6 border-2 border-accent dark:border-accent-secondary hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
              <h4 className="text-xl font-bold text-accent dark:text-accent-secondary mb-3">
                {t("values.vision.title")}
              </h4>
              <p className="text-sm text-charcoal dark:text-gray-300 leading-relaxed">
                {t("values.vision.description")}
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Values;
