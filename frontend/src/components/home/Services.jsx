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
      gradient: "from-blue-500 to-cyan-500",
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
      gradient: "from-purple-500 to-pink-500",
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
      gradient: "from-secondary to-green-600",
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
      gradient: "from-primary to-blue-700",
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
      className="py-12 md:py-20 bg-teal-50 dark:bg-teal-950 scroll-mt-20"
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-10 md:mb-16">
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white mb-2 md:mb-4">
            {t("services.title")}
          </h2>
          <p className="text-sm sm:text-base md:text-lg text-gray-600 dark:text-gray-400">
            {t("services.subtitle")}
          </p>
        </div>

        {/* Services Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          {services.map((service, index) => {
            const Icon = service.icon;
            return (
              <div
                key={index}
                className="group bg-white dark:bg-gray-800 rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2"
              >
                {/* Gradient Header */}
                <div
                  className={`h-28 md:h-32 bg-gradient-to-br ${service.gradient} relative overflow-hidden`}
                >
                  <div className="absolute inset-0 bg-black/10"></div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Icon className="w-14 md:w-16 h-14 md:h-16 text-white opacity-90" />
                  </div>
                  {/* Decorative circles */}
                  <div className="absolute -top-10 -right-10 w-32 h-32 bg-white/10 rounded-full"></div>
                  <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-white/10 rounded-full"></div>
                </div>

                {/* Content */}
                <div className="p-5 md:p-6">
                  <h3 className="text-lg md:text-xl font-bold text-gray-900 dark:text-white mb-2 md:mb-3">
                    {service.title}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 md:mb-4 leading-relaxed">
                    {service.description}
                  </p>

                  {/* Features */}
                  <ul className="space-y-1.5 md:space-y-2">
                    {service.features.map((feature, idx) => (
                      <li
                        key={idx}
                        className="flex items-center space-x-2 rtl:space-x-reverse text-xs md:text-sm"
                      >
                        <svg
                          className="w-3.5 h-3.5 md:w-4 md:h-4 text-secondary flex-shrink-0"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                            clipRule="evenodd"
                          />
                        </svg>
                        <span className="text-gray-700 dark:text-gray-300">
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
