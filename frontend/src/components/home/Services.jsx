import { useState } from "react";
import { useTranslation } from "react-i18next";

const ServicesExpandable = () => {
  const { t } = useTranslation();
  const [expandedCategory, setExpandedCategory] = useState(null);

  const services = [
    {
      id: 1,
      title: t("services.digitalSurgical.title"),
      description: t("services.digitalSurgical.description"),
      items: [
        t("services.digitalSurgical.items.fullyDigitalGuides"),
        t("services.digitalSurgical.items.toothSupported"),
        t("services.digitalSurgical.items.tissueSupported"),
        t("services.digitalSurgical.items.boneSupported"),
        t("services.digitalSurgical.items.stackableGuides"),
        t("services.digitalSurgical.items.pilotDrill"),
        t("services.digitalSurgical.items.fullyGuided"),
        t("services.digitalSurgical.items.sinusLift"),
        t("services.digitalSurgical.items.endoGuides"),
        t("services.digitalSurgical.items.apicoectomy"),
        t("services.digitalSurgical.items.gingivectomy"),
        t("services.digitalSurgical.items.boneReduction"),
        t("services.digitalSurgical.items.cbctIntegration"),
        t("services.digitalSurgical.items.prostheticallyDriven"),
        t("services.digitalSurgical.items.multiUnitSupport"),
        t("services.digitalSurgical.items.predictablePlacement"),
        t("services.digitalSurgical.items.fullArchGuided"),
        t("services.digitalSurgical.items.allOnX"),
        t("services.digitalSurgical.items.immediateLoading"),
      ],
      color: "from-blue-500 to-blue-600",
    },
    {
      id: 2,
      title: t("services.prosthetic.title"),
      description: t("services.prosthetic.description"),
      items: [
        t("services.prosthetic.items.precisionTitanium"),
        t("services.prosthetic.items.screwRetained"),
        t("services.prosthetic.items.passiveFit"),
        t("services.prosthetic.items.stackableWorkflow"),
        t("services.prosthetic.items.fullArchProsthetics"),
        t("services.prosthetic.items.allOnBars"),
        t("services.prosthetic.items.hybridDentures"),
        t("services.prosthetic.items.pmmaPrototypes"),
        t("services.prosthetic.items.finalProstheses"),
        t("services.prosthetic.items.customComponents"),
        t("services.prosthetic.items.customAbutments"),
        t("services.prosthetic.items.multiUnitDesigns"),
      ],
      color: "from-purple-500 to-purple-600",
    },
    {
      id: 3,
      title: t("services.manufacturing.title"),
      description: t("services.manufacturing.description"),
      items: [
        t("services.manufacturing.items.highPrecision3d"),
        t("services.manufacturing.items.surgicalResin"),
        t("services.manufacturing.items.temporaryResin"),
        t("services.manufacturing.items.millingMetal"),
        t("services.manufacturing.items.titaniumMilled"),
        t("services.manufacturing.items.pmmaManufacturing"),
        t("services.manufacturing.items.slmTechnology"),
        t("services.manufacturing.items.qualityAssurance"),
        t("services.manufacturing.items.fastTurnaround"),
        t("services.manufacturing.items.clinicalValidation"),
      ],
      color: "from-green-500 to-green-600",
    },
    {
      id: 4,
      title: t("services.planning.title"),
      description: t("services.planning.description"),
      items: [
        t("services.planning.items.digitalImplant"),
        t("services.planning.items.caseVisualization"),
        t("services.planning.items.prostheticallyDriven"),
        t("services.planning.items.fullArchPlanning"),
        t("services.planning.items.smileDesign"),
        t("services.planning.items.comprehensiveStudy"),
      ],
      color: "from-orange-500 to-orange-600",
    },
    {
      id: 5,
      title: t("services.supply.title"),
      description: t("services.supply.description"),
      items: [
        t("services.supply.items.dentalImplants"),
        t("services.supply.items.surgicalKits"),
        t("services.supply.items.multiUnitAbutments"),
        t("services.supply.items.screwsDrivers"),
        t("services.supply.items.guidedAccessories"),
      ],
      color: "from-red-500 to-red-600",
    },
  ];

  const toggleCategory = (id) => {
    setExpandedCategory(expandedCategory === id ? null : id);
  };

  return (
    <section
      id="services"
      className="relative py-12 md:py-16 scroll-mt-20 overflow-hidden"
    >
      {/* Background with Parallax */}
      <div className="absolute inset-0 z-0">
        <div
          className="w-full h-full bg-fixed bg_cover"
          style={{ backgroundImage: "url(/background_3.png)" }}
        />
        {/* Overlay */}
        <div className="absolute inset-0 bg-primary/70 dark:bg-primary/80"></div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-8 md:mb-12 animate-slide-in-left">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-light mb-3">
            {t("services.title")}
          </h2>
          <p className="text-sm sm:text-base text-light/90">
            {t("services.subtitle")}
          </p>
        </div>

        {/* Services Expandable Cards */}
        <div className="max-w-5xl mx-auto space-y-4">
          {services.map((service, index) => (
            <div
              key={service.id}
              className="bg-light/95 dark:bg-gray-900/95 backdrop-blur-sm rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700 shadow-lg hover:shadow-2xl transition-all"
            >
              {/* Header - Clickable */}
              <button
                onClick={() => toggleCategory(service.id)}
                className="w-full p-6 text-left flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-4 mb-2">
                    <h3 className="text-xl font-bold text-primary dark:text-light mx-auto">
                      {service.title}
                    </h3>
                  </div>
                  <p className="text-sm text-charcoal dark:text-gray-300 ml-16 text-center">
                    {service.description}
                  </p>
                </div>
                <svg
                  className={`w-6 h-6 text-primary dark:text-accent transition-transform duration-300 flex-shrink-0 ml-4 ${
                    expandedCategory === service.id ? "rotate-180" : ""
                  }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </button>

              {/* Expandable Content */}
              {expandedCategory === service.id && (
                <div className="px-6 pb-6 border-t border-gray-200 dark:border-gray-700 animate-slide-in">
                  <div className="pt-6 grid grid-cols-1 md:grid-cols-2 gap-3">
                    {service.items.map((item, idx) => (
                      <div
                        key={idx}
                        className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                      >
                        <svg
                          className="w-5 h-5 text-accent dark:text-accent-secondary flex-shrink-0"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                            clipRule="evenodd"
                          />
                        </svg>
                        <span className="text-sm text-charcoal dark:text-gray-300">
                          {item}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ServicesExpandable;
