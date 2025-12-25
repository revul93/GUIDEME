import { useTranslation } from "react-i18next";
import { useLanguage } from "../../context/LanguageContext.jsx";

const StepReview = ({ formData, updateFormData, errors }) => {
  const { t } = useTranslation();
  const { language } = useLanguage();

  // Format label based on language
  const getLabel = (item) => {
    return language === "ar" ? item.labelAr : item.labelEn;
  };

  // Get procedure category label
  const getProcedureCategoryLabel = () => {
    const categories = {
      single_implant: { labelEn: "Single Implant", labelAr: "زرعة واحدة" },
      multiple_implant: { labelEn: "Multiple Implants", labelAr: "زرعات متعددة" },
      full_arch: { labelEn: "Full Arch", labelAr: "قوس كامل" },
      gbr: { labelEn: "GBR", labelAr: "تجديد العظام الموجه" },
      other: { labelEn: "Other", labelAr: "أخرى" },
    };
    return getLabel(categories[formData.procedureCategory] || { labelEn: "-", labelAr: "-" });
  };

  // Get guide type label
  const getGuideTypeLabel = () => {
    const types = {
      tooth_support: { labelEn: "Tooth Support", labelAr: "دعم الأسنان" },
      tissue_support: { labelEn: "Tissue Support", labelAr: "دعم الأنسجة" },
      bone_support: { labelEn: "Bone Support", labelAr: "دعم العظام" },
      stackable: { labelEn: "Stackable", labelAr: "قابل للتكديس" },
      hybrid: { labelEn: "Hybrid", labelAr: "هجين" },
      other: { labelEn: "Other", labelAr: "أخرى" },
    };
    return getLabel(types[formData.guideType] || { labelEn: "-", labelAr: "-" });
  };

  // Get required service label
  const getRequiredServiceLabel = () => {
    const services = {
      study_only: { labelEn: "Study Only", labelAr: "دراسة فقط" },
      full_solution: { labelEn: "Full Solution", labelAr: "حل متكامل" },
    };
    return getLabel(services[formData.requiredService] || { labelEn: "-", labelAr: "-" });
  };

  // Get implant system label
  const getImplantSystemLabel = () => {
    if (!formData.implantSystem) return "-";
    if (formData.implantSystem === "other") return formData.implantSystemOther || "-";
    
    const systems = {
      nobel_biocare: { labelEn: "Nobel Biocare", labelAr: "نوبل بيوكير" },
      straumann: { labelEn: "Straumann", labelAr: "ستراومان" },
      zimmer_biomet: { labelEn: "Zimmer Biomet", labelAr: "زيمر بايوميت" },
      osstem: { labelEn: "Osstem", labelAr: "أوستم" },
      hiossen: { labelEn: "Hiossen", labelAr: "هايوسن" },
      dentium: { labelEn: "Dentium", labelAr: "دنتيوم" },
      megagen: { labelEn: "MegaGen", labelAr: "ميجاجين" },
      bicon: { labelEn: "Bicon", labelAr: "بايكون" },
    };
    return getLabel(systems[formData.implantSystem] || { labelEn: "-", labelAr: "-" });
  };

  // Get delivery method label
  const getDeliveryMethodLabel = () => {
    if (!formData.deliveryMethod) return "-";
    const methods = {
      delivery: { labelEn: "Delivery to Address", labelAr: "توصيل للعنوان" },
      pickup: { labelEn: "Pickup from Branch", labelAr: "استلام من الفرع" },
    };
    return getLabel(methods[formData.deliveryMethod] || { labelEn: "-", labelAr: "-" });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-primary dark:text-light mb-2">
          {t("newCase.review.title")}
        </h2>
        <p className="text-charcoal dark:text-gray-400">
          {t("newCase.review.subtitle")}
        </p>
      </div>

      {/* Case Details Summary */}
      <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
        <div className="bg-gray-50 dark:bg-gray-800 px-6 py-3 border-b border-gray-200 dark:border-gray-700">
          <h3 className="font-semibold text-charcoal dark:text-light">
            {t("newCase.review.caseDetails")}
          </h3>
        </div>
        <div className="p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">
                {t("newCase.fields.patientRef")}
              </p>
              <p className="font-medium text-charcoal dark:text-light">
                {formData.patientRef || "-"}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">
                {t("newCase.fields.procedureCategory")}
              </p>
              <p className="font-medium text-charcoal dark:text-light">
                {getProcedureCategoryLabel()}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">
                {t("newCase.fields.guideType")}
              </p>
              <p className="font-medium text-charcoal dark:text-light">
                {getGuideTypeLabel()}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">
                {t("newCase.fields.requiredService")}
              </p>
              <p className="font-medium text-charcoal dark:text-light">
                {getRequiredServiceLabel()}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">
                {t("newCase.fields.implantSystem")}
              </p>
              <p className="font-medium text-charcoal dark:text-light">
                {getImplantSystemLabel()}
              </p>
            </div>
            {formData.teethNumbers && formData.teethNumbers.length > 0 && (
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">
                  {t("newCase.fields.teethSelection")}
                </p>
                <p className="font-medium text-charcoal dark:text-light">
                  {formData.teethNumbers.join(", ")}
                </p>
              </div>
            )}
          </div>
          
          {formData.clinicalNotes && (
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">
                {t("newCase.fields.clinicalNotes")}
              </p>
              <p className="font-medium text-charcoal dark:text-light whitespace-pre-wrap">
                {formData.clinicalNotes}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Files Summary */}
      {formData.uploadedFiles && formData.uploadedFiles.length > 0 && (
        <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
          <div className="bg-gray-50 dark:bg-gray-800 px-6 py-3 border-b border-gray-200 dark:border-gray-700">
            <h3 className="font-semibold text-charcoal dark:text-light">
              {t("newCase.review.uploadedFiles")}
            </h3>
          </div>
          <div className="p-6">
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="font-medium text-charcoal dark:text-light">
                {formData.uploadedFiles.length} {t("newCase.review.filesUploaded")}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Delivery Summary */}
      {formData.requiredService === "full_solution" && (
        <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
          <div className="bg-gray-50 dark:bg-gray-800 px-6 py-3 border-b border-gray-200 dark:border-gray-700">
            <h3 className="font-semibold text-charcoal dark:text-light">
              {t("newCase.review.deliveryDetails")}
            </h3>
          </div>
          <div className="p-6">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">
                {t("newCase.fields.deliveryMethod")}
              </p>
              <p className="font-medium text-charcoal dark:text-light">
                {getDeliveryMethodLabel()}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Terms and Conditions */}
      <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-6">
        <label className="flex items-start gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={formData.termsAccepted}
            onChange={(e) => updateFormData("termsAccepted", e.target.checked)}
            className="mt-1 w-5 h-5 text-primary dark:text-accent focus:ring-accent border-gray-300 dark:border-gray-700 rounded"
          />
          <div className="flex-1">
            <p className="text-charcoal dark:text-light">
              {t("newCase.review.termsText")}
              <span className="text-red-500 ml-1">*</span>
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              {t("newCase.review.termsDescription")}
            </p>
          </div>
        </label>
        {errors.termsAccepted && (
          <p className="mt-2 text-sm text-red-600 dark:text-red-400">
            {errors.termsAccepted}
          </p>
        )}
      </div>

      {/* Important Notice */}
      <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
        <div className="flex gap-3">
          <svg className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div>
            <p className="text-sm font-medium text-blue-800 dark:text-blue-300 mb-1">
              {t("newCase.review.importantNotice")}
            </p>
            <p className="text-sm text-blue-700 dark:text-blue-400">
              {t("newCase.review.paymentNotice")}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StepReview;
