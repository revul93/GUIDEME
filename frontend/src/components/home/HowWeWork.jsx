import { useTranslation } from "react-i18next";

const HowWeWork = () => {
  const { t } = useTranslation();

  const steps = [
    {
      number: "01",
      title: t("howWeWork.steps.step1.title"),
      description: t("howWeWork.steps.step1.description"),
    },
    {
      number: "02",
      title: t("howWeWork.steps.step2.title"),
      description: t("howWeWork.steps.step2.description"),
    },
    {
      number: "03",
      title: t("howWeWork.steps.step3.title"),
      description: t("howWeWork.steps.step3.description"),
    },
    {
      number: "04",
      title: t("howWeWork.steps.step4.title"),
      description: t("howWeWork.steps.step4.description"),
    },
  ];

  return (
    <section
      id="how-we-work"
      className="relative py-12 md:py-16 scroll-mt-20 overflow-hidden"
    >
      {/* Background with Parallax */}
      <div className="absolute inset-0 z-0">
        <div
          className="w-full h-full bg-cover bg-fixed"
          style={{ backgroundImage: "url(/background_2.png)" }}
        />
        {/* Overlay */}
        <div className="absolute inset-0 bg-primary/70 dark:bg-primary/80"></div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-8 md:mb-12 animate-slide-in-right">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-light mb-3">
            {t("howWeWork.title")}
          </h2>
          <p className="text-sm sm:text-base text-light/90">
            {t("howWeWork.subtitle")}
          </p>
        </div>

        {/* Steps Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
          {steps.map((step, index) => (
            <div
              key={index}
              className="relative bg-light/95 dark:bg-gray-900/95 backdrop-blur-sm rounded-xl p-6 border border-gray-200 dark:border-gray-700 hover:shadow-xl transition-all duration-300 hover:-translate-y-2 animate-fade-in-up"
              style={{ animationDelay: `${index * 150}ms` }}
            >
              {/* Step Number Badge */}
              <div className="absolute -top-3 -right-3 w-12 h-12 bg-accent dark:bg-accent-secondary rounded-full flex items-center justify-center font-bold text-light text-lg shadow-lg">
                {step.number}
              </div>

              {/* Content */}
              <h3 className="text-lg font-bold text-primary dark:text-light mb-3 text-center">
                {step.title}
              </h3>
              <p className="text-sm text-charcoal dark:text-gray-300 leading-relaxed text-center">
                {step.description}
              </p>

              {/* Connector Arrow (except last item) */}
              {index < steps.length - 1 && (
                <div className="hidden lg:block absolute top-1/2 -right-3 rtl:-right-auto rtl:-left-3 w-6 h-6 text-accent dark:text-accent-secondary transform -translate-y-1/2 z-20">
                  <svg
                    className="w-full h-full rtl:rotate-180"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M13.025 1l-2.847 2.828 6.176 6.176h-16.354v3.992h16.354l-6.176 6.176 2.847 2.828 10.975-11z" />
                  </svg>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowWeWork;
