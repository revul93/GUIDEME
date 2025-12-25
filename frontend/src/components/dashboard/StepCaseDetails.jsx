import { useTranslation } from "react-i18next";
import { useLanguage } from "../../context/LanguageContext.jsx";
import TeethChart from "./TeethChart.jsx";

const StepCaseDetails = ({ formData, updateFormData, errors }) => {
  const { t } = useTranslation();
  const { language } = useLanguage();

  // Procedure Categories
  const procedureCategories = [
    { value: "single_implant", labelEn: "Single Implant", labelAr: "زرعة واحدة" },
    { value: "multiple_implant", labelEn: "Multiple Implants", labelAr: "زرعات متعددة" },
    { value: "full_arch", labelEn: "Full Arch", labelAr: "قوس كامل" },
    { value: "gbr", labelEn: "GBR", labelAr: "تجديد العظام الموجه" },
    { value: "other", labelEn: "Other", labelAr: "أخرى" },
  ];

  // Guide Types
  const guideTypes = [
    { value: "tooth_support", labelEn: "Tooth Support", labelAr: "دعم الأسنان" },
    { value: "tissue_support", labelEn: "Tissue Support", labelAr: "دعم الأنسجة" },
    { value: "bone_support", labelEn: "Bone Support", labelAr: "دعم العظام" },
    { value: "stackable", labelEn: "Stackable", labelAr: "قابل للتكديس" },
    { value: "hybrid", labelEn: "Hybrid", labelAr: "هجين" },
    { value: "other", labelEn: "Other", labelAr: "أخرى" },
  ];

  // Required Services
  const requiredServices = [
    {
      value: "study_only",
      labelEn: "Study Only",
      labelAr: "دراسة فقط",
      descEn: "Case study and analysis (100 SAR)",
      descAr: "دراسة وتحليل الحالة (100 ريال)",
    },
    {
      value: "full_solution",
      labelEn: "Full Solution",
      labelAr: "حل متكامل",
      descEn: "Study + Design + Physical Guide + Delivery",
      descAr: "دراسة + تصميم + دليل جراحي + توصيل",
    },
  ];

  // Implant Systems
  const implantSystems = [
    { value: "nobel_biocare", labelEn: "Nobel Biocare", labelAr: "نوبل بيوكير" },
    { value: "straumann", labelEn: "Straumann", labelAr: "ستراومان" },
    { value: "zimmer_biomet", labelEn: "Zimmer Biomet", labelAr: "زيمر بايوميت" },
    { value: "osstem", labelEn: "Osstem", labelAr: "أوستم" },
    { value: "hiossen", labelEn: "Hiossen", labelAr: "هايوسن" },
    { value: "dentium", labelEn: "Dentium", labelAr: "دنتيوم" },
    { value: "megagen", labelEn: "MegaGen", labelAr: "ميجاجين" },
    { value: "bicon", labelEn: "Bicon", labelAr: "بايكون" },
    { value: "other", labelEn: "Other", labelAr: "أخرى" },
  ];

  // Check if teeth selection should be shown
  const showTeethSelector = ["single_implant", "multiple_implant"].includes(
    formData.procedureCategory
  );

  // Handle input change
  const handleChange = (field, value) => {
    updateFormData(field, value);

    // Reset dependent fields
    if (field === "procedureCategory" && !showTeethSelector) {
      updateFormData("teethNumbers", []);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-primary dark:text-light mb-2">
          {t("newCase.caseDetails.title")}
        </h2>
        <p className="text-charcoal dark:text-gray-400">
          {t("newCase.caseDetails.subtitle")}
        </p>
      </div>

      {/* Patient Reference (Optional) */}
      <div>
        <label className="block text-sm font-medium text-charcoal dark:text-light mb-2">
          {t("newCase.fields.patientRef")}
          <span className="text-gray-400 text-xs font-normal ml-2">
            ({t("newCase.optional")})
          </span>
        </label>
        <input
          type="text"
          value={formData.patientRef}
          onChange={(e) => handleChange("patientRef", e.target.value)}
          placeholder={t("newCase.placeholders.patientRef")}
          maxLength={100}
          className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-charcoal dark:text-light focus:ring-2 focus:ring-accent focus:border-transparent transition-colors"
        />
        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
          {t("newCase.hints.patientRef")}
        </p>
      </div>

      {/* Procedure Category */}
      <div>
        <label className="block text-sm font-medium text-charcoal dark:text-light mb-2">
          {t("newCase.fields.procedureCategory")}
          <span className="text-red-500 ml-1">*</span>
        </label>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
          {procedureCategories.map((category) => (
            <button
              key={category.value}
              type="button"
              onClick={() => handleChange("procedureCategory", category.value)}
              className={`p-4 rounded-lg border-2 text-center font-medium transition-all ${
                formData.procedureCategory === category.value
                  ? "border-primary dark:border-accent bg-primary/10 dark:bg-accent/20 text-primary dark:text-accent"
                  : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 text-charcoal dark:text-light"
              }`}
            >
              {language === "ar" ? category.labelAr : category.labelEn}
            </button>
          ))}
        </div>
        {errors.procedureCategory && (
          <p className="mt-2 text-sm text-red-600 dark:text-red-400">
            {errors.procedureCategory}
          </p>
        )}
      </div>

      {/* Guide Type */}
      <div>
        <label className="block text-sm font-medium text-charcoal dark:text-light mb-2">
          {t("newCase.fields.guideType")}
          <span className="text-red-500 ml-1">*</span>
        </label>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {guideTypes.map((guide) => (
            <button
              key={guide.value}
              type="button"
              onClick={() => handleChange("guideType", guide.value)}
              className={`p-4 rounded-lg border-2 text-center font-medium transition-all ${
                formData.guideType === guide.value
                  ? "border-primary dark:border-accent bg-primary/10 dark:bg-accent/20 text-primary dark:text-accent"
                  : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 text-charcoal dark:text-light"
              }`}
            >
              {language === "ar" ? guide.labelAr : guide.labelEn}
            </button>
          ))}
        </div>
        {errors.guideType && (
          <p className="mt-2 text-sm text-red-600 dark:text-red-400">
            {errors.guideType}
          </p>
        )}
      </div>

      {/* Required Service */}
      <div>
        <label className="block text-sm font-medium text-charcoal dark:text-light mb-2">
          {t("newCase.fields.requiredService")}
          <span className="text-red-500 ml-1">*</span>
        </label>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {requiredServices.map((service) => (
            <button
              key={service.value}
              type="button"
              onClick={() => handleChange("requiredService", service.value)}
              className={`p-6 rounded-lg border-2 text-left transition-all ${
                formData.requiredService === service.value
                  ? "border-primary dark:border-accent bg-primary/10 dark:bg-accent/20"
                  : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600"
              }`}
            >
              <h3 className={`text-lg font-semibold mb-1 ${
                formData.requiredService === service.value
                  ? "text-primary dark:text-accent"
                  : "text-charcoal dark:text-light"
              }`}>
                {language === "ar" ? service.labelAr : service.labelEn}
              </h3>
              <p className="text-sm text-charcoal dark:text-gray-400">
                {language === "ar" ? service.descAr : service.descEn}
              </p>
            </button>
          ))}
        </div>
        {errors.requiredService && (
          <p className="mt-2 text-sm text-red-600 dark:text-red-400">
            {errors.requiredService}
          </p>
        )}
      </div>

      {/* Teeth Selector */}
      {showTeethSelector && (
        <div>
          <label className="block text-sm font-medium text-charcoal dark:text-light mb-2">
            {t("newCase.fields.teethSelection")}
            <span className="text-red-500 ml-1">*</span>
          </label>
          <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-6 bg-white dark:bg-gray-900">
            <TeethChart
              selectedTeeth={formData.teethNumbers}
              onSelect={(teeth) => handleChange("teethNumbers", teeth)}
              isSingleSelect={formData.procedureCategory === "single_implant"}
              error={errors.teethNumbers}
              language={language}
            />
          </div>
          {errors.teethNumbers && (
            <p className="mt-2 text-sm text-red-600 dark:text-red-400">
              {errors.teethNumbers}
            </p>
          )}
        </div>
      )}

      {/* Implant System */}
      <div>
        <label className="block text-sm font-medium text-charcoal dark:text-light mb-2">
          {t("newCase.fields.implantSystem")}
          <span className="text-gray-400 text-xs font-normal ml-2">
            ({t("newCase.optional")})
          </span>
        </label>
        <select
          value={formData.implantSystem}
          onChange={(e) => handleChange("implantSystem", e.target.value)}
          className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-charcoal dark:text-light focus:ring-2 focus:ring-accent focus:border-transparent transition-colors"
        >
          <option value="">{t("newCase.placeholders.implantSystem")}</option>
          {implantSystems.map((system) => (
            <option key={system.value} value={system.value}>
              {language === "ar" ? system.labelAr : system.labelEn}
            </option>
          ))}
        </select>

        {/* Other Implant System */}
        {formData.implantSystem === "other" && (
          <input
            type="text"
            value={formData.implantSystemOther}
            onChange={(e) => handleChange("implantSystemOther", e.target.value)}
            placeholder={t("newCase.placeholders.implantSystemOther")}
            maxLength={100}
            className="mt-3 w-full px-4 py-2.5 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-charcoal dark:text-light focus:ring-2 focus:ring-accent focus:border-transparent transition-colors"
          />
        )}
      </div>

      {/* Clinical Notes */}
      <div>
        <label className="block text-sm font-medium text-charcoal dark:text-light mb-2">
          {t("newCase.fields.clinicalNotes")}
          <span className="text-gray-400 text-xs font-normal ml-2">
            ({t("newCase.optional")})
          </span>
        </label>
        <textarea
          value={formData.clinicalNotes}
          onChange={(e) => handleChange("clinicalNotes", e.target.value)}
          placeholder={t("newCase.placeholders.clinicalNotes")}
          rows={4}
          maxLength={1000}
          className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-charcoal dark:text-light focus:ring-2 focus:ring-accent focus:border-transparent transition-colors resize-none"
        />
        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400 text-right rtl:text-left">
          {formData.clinicalNotes.length}/1000
        </p>
      </div>
    </div>
  );
};

export default StepCaseDetails;
