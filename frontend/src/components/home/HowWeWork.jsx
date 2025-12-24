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
  ];

  return (
    <section
      id="how-we-work"
      className="py-12 md:py-16 bg-light dark:bg-dark scroll-mt-20"
    >
      <div className="absolute inset-0 z-0">
        <img
          src="/hero2.png"
          alt="Hero Background"
          className="w-full h-full object-cover"
        />
        {/* Overlay for better text readability */}
        <div className="absolute inset-0 bg-primary/60 dark:bg-primary/70"></div>
      </div>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-8 md:mb-12 animate-fade-in">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-primary dark:text-light mb-3">
            {t("howWeWork.title")}
          </h2>
          <p className="text-sm sm:text-base text-charcoal dark:text-gray-400">
            {t("howWeWork.subtitle")}
          </p>
        </div>

        {/* Steps Grid - Compact */}
        <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {steps.map((step, index) => (
            <div
              key={index}
              className="relative bg-gray-50 dark:bg-gray-900 rounded-xl p-6 border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-all duration-300 hover:-translate-y-1 animate-slide-in"
              style={{ animationDelay: `${index * 150}ms` }}
            >
              {/* Step Number */}
              <div className="flex items-start gap-4 mb-4">
                <div className="flex-shrink-0 w-12 h-12 bg-primary dark:bg-accent text-light rounded-lg flex items-center justify-center font-bold text-lg">
                  {step.number}
                </div>
                <h3 className="text-lg font-bold text-primary dark:text-light pt-2">
                  {step.title}
                </h3>
              </div>

              {/* Description */}
              <p className="text-sm text-charcoal dark:text-gray-400 leading-relaxed">
                {step.description}
              </p>

              {/* Connector Line (except last item) */}
              {index < steps.length - 1 && (
                <div className="hidden md:block absolute top-1/2 -right-3 rtl:-right-auto rtl:-left-3 w-6 h-0.5 bg-gray-300 dark:bg-gray-700"></div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowWeWork;
