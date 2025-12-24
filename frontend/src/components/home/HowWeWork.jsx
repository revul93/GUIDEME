import { useTranslation } from "react-i18next";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import SearchIcon from "@mui/icons-material/Search";
import LocalShippingIcon from "@mui/icons-material/LocalShipping";

const HowWeWork = () => {
  const { t } = useTranslation();

  const steps = [
    {
      icon: CloudUploadIcon,
      title: t("howWeWork.steps.step1.title"),
      description: t("howWeWork.steps.step1.description"),
      color: "from-blue-500 to-blue-600",
    },
    {
      icon: SearchIcon,
      title: t("howWeWork.steps.step2.title"),
      description: t("howWeWork.steps.step2.description"),
      color: "from-purple-500 to-purple-600",
    },
    {
      icon: LocalShippingIcon,
      title: t("howWeWork.steps.step3.title"),
      description: t("howWeWork.steps.step3.description"),
      color: "from-pink-500 to-pink-600",
    },
  ];

  return (
    <section
      id="how-we-work"
      className="py-12 md:py-20 bg-cyan-50 dark:bg-cyan-950 scroll-mt-20"
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-10 md:mb-16">
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white mb-2 md:mb-4">
            {t("howWeWork.title")}
          </h2>
          <p className="text-sm sm:text-base md:text-lg text-gray-600 dark:text-gray-400">
            {t("howWeWork.subtitle")}
          </p>
        </div>

        {/* Steps Grid */}
        <div className="grid md:grid-cols-3 gap-6 md:gap-8 lg:gap-12">
          {steps.map((step, index) => {
            const Icon = step.icon;
            return (
              <div
                key={index}
                className="flex flex-col items-center text-center group"
              >
                {/* Icon Circle */}
                <div className="relative mb-4 md:mb-6">
                  <div
                    className={`w-20 md:w-24 h-20 md:h-24 rounded-full bg-gradient-to-br ${step.color} flex items-center justify-center shadow-lg group-hover:shadow-2xl transition-all duration-300 group-hover:scale-110`}
                  >
                    <Icon className="w-10 md:w-12 h-10 md:h-12 text-white" />
                  </div>
                  {/* Step Number */}
                  <div className="absolute -top-2 -right-2 rtl:-right-auto rtl:-left-2 w-8 md:w-10 h-8 md:h-10 bg-white dark:bg-gray-800 rounded-full flex items-center justify-center shadow-md border-2 border-gray-200 dark:border-gray-700">
                    <span className="text-sm md:text-base font-bold text-primary dark:text-secondary">
                      {index + 1}
                    </span>
                  </div>
                </div>

                {/* Content */}
                <h3 className="text-lg md:text-xl font-bold text-gray-900 dark:text-white mb-2 md:mb-3">
                  {step.title}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed max-w-sm">
                  {step.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default HowWeWork;
