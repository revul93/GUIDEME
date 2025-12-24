import { useTranslation } from "react-i18next";
import BrushIcon from "@mui/icons-material/Brush";
import PrecisionManufacturingIcon from "@mui/icons-material/PrecisionManufacturing";
import ViewInArIcon from "@mui/icons-material/ViewInAr";
import ScienceIcon from "@mui/icons-material/Science";

const Services = () => {
  const { t } = useTranslation();

  const services = [
    {
      icon: BrushIcon,
      title: t("services.studyDesign.title"),
      description: t("services.studyDesign.description"),
      features: [
        t("services.studyDesign.feature1"),
        t("services.studyDesign.feature2"),
        t("services.studyDesign.feature3"),
      ],
    },
    {
      icon: PrecisionManufacturingIcon,
      title: t("services.production.title"),
      description: t("services.production.description"),
      features: [
        t("services.production.feature1"),
        t("services.production.feature2"),
        t("services.production.feature3"),
      ],
    },
    {
      icon: ViewInArIcon,
      title: t("services.fullArch.title"),
      description: t("services.fullArch.description"),
      features: [
        t("services.fullArch.feature1"),
        t("services.fullArch.feature2"),
        t("services.fullArch.feature3"),
      ],
    },
    {
      icon: ScienceIcon,
      title: t("services.gbr.title"),
      description: t("services.gbr.description"),
      features: [
        t("services.gbr.feature1"),
        t("services.gbr.feature2"),
        t("services.gbr.feature3"),
      ],
    },
  ];

  return (
    <section
      id="services"
      className="py-12 md:py-16 bg-light dark:bg-dark scroll-mt-20"
    >
      <div className="absolute inset-0 z-0">
        <img
          src="/hero.png"
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
            {t("services.title")}
          </h2>
          <p className="text-sm sm:text-base text-charcoal dark:text-gray-400">
            {t("services.subtitle")}
          </p>
        </div>

        {/* Services Grid - Compact */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
          {services.map((service, index) => {
            const Icon = service.icon;
            return (
              <div
                key={index}
                className="bg-gray-50 dark:bg-gray-900 rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-all duration-300 hover:-translate-y-1 animate-fade-in-up"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                {/* Header */}
                <div className="bg-primary dark:bg-accent p-5 flex items-center justify-center">
                  <Icon className="w-12 h-12 text-light" />
                </div>

                {/* Content */}
                <div className="p-5">
                  <h3 className="text-lg font-bold text-primary dark:text-light mb-2">
                    {service.title}
                  </h3>
                  <p className="text-sm text-charcoal dark:text-gray-400 mb-4 leading-relaxed">
                    {service.description}
                  </p>

                  {/* Features */}
                  <ul className="space-y-2">
                    {service.features.map((feature, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-xs">
                        <svg
                          className="w-4 h-4 text-accent-secondary dark:text-accent-secondary flex-shrink-0 mt-0.5"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                            clipRule="evenodd"
                          />
                        </svg>
                        <span className="text-charcoal dark:text-gray-300">
                          {feature}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default Services;
