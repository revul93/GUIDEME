import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import caseService from "../services/caseService";
import fileService from "../services/fileService";
import profileService from "../services/profileService";

// Step Components
import StepCaseDetails from "../components/dashboard/CaseDetails.jsx";
import StepFileUpload from "../components/dashboard/StepFileUpload.jsx";
import StepDelivery from "../components/dashboard/StepDelivery.jsx";
import StepReview from "../components/dashboard/StepReview.jsx";

const SubmitCase = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  // Auth check
  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    if (!token) {
      navigate("/");
    }
  }, [navigate]);

  // State
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadProgress, setUploadProgress] = useState({
    current: 0,
    total: 0,
    fileName: "",
  });
  const [notification, setNotification] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState("success");
  const [modalMessage, setModalMessage] = useState("");
  const [errors, setErrors] = useState({});

  // Form data
  const [formData, setFormData] = useState({
    patientRef: "",
    procedureCategory: "",
    guideType: "",
    requiredService: "",
    implantSystem: "",
    implantSystemOther: "",
    teethNumbers: [],
    clinicalNotes: "",
    stagedFiles: [], // Files selected but not uploaded yet
    deliveryMethod: "",
    deliveryAddressId: null,
    pickupBranchId: null,
    termsAccepted: false,
  });

  // Addresses and branches
  const [addresses, setAddresses] = useState([]);
  const [branches, setBranches] = useState([]);

  // Fetch data on mount
  useEffect(() => {
    fetchBranches();
    fetchAddresses();
  }, []);

  const fetchBranches = async () => {
    try {
      // NOTE: Add getBranches to your API service
      const response = await fetch("/api/branches", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
        },
      });
      const data = await response.json();
      if (data.success) {
        setBranches(data.data || []);
      }
    } catch (error) {
      console.error("Failed to fetch branches:", error);
    }
  };

  const fetchAddresses = async () => {
    try {
      const addresses = await profileService.listAddresses();
      setAddresses(addresses || []);
    } catch (error) {
      console.error("Failed to fetch addresses:", error);
    }
  };

  // Steps configuration
  const steps = [
    {
      id: 1,
      label: t("newCase.steps.caseDetails"),
      component: StepCaseDetails,
    },
    { id: 2, label: t("newCase.steps.fileUpload"), component: StepFileUpload },
    {
      id: 3,
      label: t("newCase.steps.delivery"),
      component: StepDelivery,
      conditional: true,
    },
    { id: 4, label: t("newCase.steps.review"), component: StepReview },
  ];

  const activeSteps = steps.filter((step) => {
    if (step.conditional) {
      return formData.requiredService === "full_solution";
    }
    return true;
  });

  const totalSteps = activeSteps.length;
  const currentStepIndex = activeSteps.findIndex((s) => s.id === currentStep);

  // Update form data
  const updateFormData = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  // Show notification
  const showNotification = (type, message) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 5000);
  };

  // Show modal
  const showModalDialog = (type, message) => {
    setModalType(type);
    setModalMessage(message);
    setShowModal(true);
  };

  // Validate current step
  const validateStep = (step) => {
    const newErrors = {};

    if (step === 1) {
      if (!formData.procedureCategory) {
        newErrors.procedureCategory = t(
          "newCase.errors.procedureCategoryRequired"
        );
      }
      if (!formData.guideType) {
        newErrors.guideType = t("newCase.errors.guideTypeRequired");
      }
      if (!formData.requiredService) {
        newErrors.requiredService = t("newCase.errors.requiredServiceRequired");
      }
      if (formData.implantSystem === "other" && !formData.implantSystemOther) {
        newErrors.implantSystemOther = t(
          "newCase.errors.implantSystemOtherRequired"
        );
      }
      if (
        ["single_implant", "multiple_implant"].includes(
          formData.procedureCategory
        ) &&
        formData.teethNumbers.length === 0
      ) {
        newErrors.teethNumbers = t("newCase.errors.teethRequired");
      }
    }

    if (step === 3 && formData.requiredService === "full_solution") {
      if (!formData.deliveryMethod) {
        newErrors.deliveryMethod = t("newCase.errors.deliveryMethodRequired");
      }
      if (
        formData.deliveryMethod === "delivery" &&
        !formData.deliveryAddressId
      ) {
        newErrors.deliveryAddressId = t(
          "newCase.errors.deliveryAddressRequired"
        );
      }
      if (formData.deliveryMethod === "pickup" && !formData.pickupBranchId) {
        newErrors.pickupBranchId = t("newCase.errors.pickupBranchRequired");
      }
    }

    if (step === 4) {
      if (!formData.termsAccepted) {
        newErrors.termsAccepted = t("newCase.errors.termsRequired");
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Navigation handlers
  const handleNext = () => {
    if (!validateStep(currentStep)) {
      showNotification("error", t("newCase.errors.validationFailed"));
      return;
    }

    if (currentStepIndex < activeSteps.length - 1) {
      setCurrentStep(activeSteps[currentStepIndex + 1].id);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handleBack = () => {
    if (currentStepIndex > 0) {
      setCurrentStep(activeSteps[currentStepIndex - 1].id);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  // Submit case with file uploads - REFACTORED TO USE SERVICES
  const handleSubmit = async () => {
    if (!validateStep(currentStep)) {
      showNotification("error", t("newCase.errors.validationFailed"));
      return;
    }

    setIsSubmitting(true);
    setUploadProgress({ current: 0, total: 0, fileName: "" });

    try {
      // Step 1: Create case using service
      const caseData = {
        patientRef: formData.patientRef || null,
        procedureCategory: formData.procedureCategory,
        guideType: formData.guideType,
        requiredService: formData.requiredService,
        implantSystem:
          formData.implantSystem === "other"
            ? formData.implantSystemOther
            : formData.implantSystem,
        teethNumbers:
          formData.teethNumbers.length > 0 ? formData.teethNumbers : null, // Service handles JSON.stringify
        clinicalNotes: formData.clinicalNotes || null,
        deliveryMethod: formData.deliveryMethod || null,
        deliveryAddressId: formData.deliveryAddressId || null,
        pickupBranchId: formData.pickupBranchId || null,
      };

      const createdCase = await caseService.createCase(caseData);
      const caseId = createdCase.id;

      // Step 2: Upload files if any using fileService
      if (formData.stagedFiles && formData.stagedFiles.length > 0) {
        const totalFiles = formData.stagedFiles.length;
        setUploadProgress({ current: 0, total: totalFiles, fileName: "" });

        for (let i = 0; i < formData.stagedFiles.length; i++) {
          const stagedFile = formData.stagedFiles[i];
          setUploadProgress({
            current: i + 1,
            total: totalFiles,
            fileName: stagedFile.name,
          });

          try {
            // Upload and link file to case in one step
            await fileService.uploadFile(
              stagedFile.file,
              caseId,
              stagedFile.category
            );
          } catch (fileError) {
            console.error("File upload error:", fileError);
            // Continue with other files even if one fails
          }
        }
      }

      // Step 3: Show success
      showModalDialog("success", t("newCase.success.caseSubmitted"));

      // Redirect after 2 seconds
      setTimeout(() => {
        navigate(`/dashboard/cases/${caseId}`);
      }, 2000);
    } catch (error) {
      console.error("Submit error:", error);
      showModalDialog(
        "error",
        error.message || t("newCase.errors.submitFailed")
      );
    } finally {
      setIsSubmitting(false);
      setUploadProgress({ current: 0, total: 0, fileName: "" });
    }
  };

  // Render current step
  const CurrentStepComponent = activeSteps[currentStepIndex]?.component;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Upload Progress Modal */}
        {isSubmitting && uploadProgress.total > 0 && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-md w-full p-6">
              <div className="text-center">
                <div className="w-16 h-16 border-4 border-primary dark:border-accent border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <h3 className="text-xl font-bold text-charcoal dark:text-light mb-2">
                  {t("newCase.upload.uploading")}
                </h3>
                <p className="text-sm text-charcoal dark:text-gray-400 mb-4">
                  {t("newCase.upload.progress")} {uploadProgress.current}{" "}
                  {t("newCase.upload.of")} {uploadProgress.total}
                </p>
                <div className="mb-3">
                  <p className="text-xs text-gray-500 dark:text-gray-400 truncate mb-2">
                    {uploadProgress.fileName}
                  </p>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div
                      className="bg-primary dark:bg-accent h-2 rounded-full transition-all"
                      style={{
                        width: `${
                          (uploadProgress.current / uploadProgress.total) * 100
                        }%`,
                      }}
                    />
                  </div>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {t("newCase.upload.pleaseWait")}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Success/Error Modal */}
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-md w-full p-6 animate-fade-in">
              <div className="text-center">
                {modalType === "success" ? (
                  <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg
                      className="w-8 h-8 text-green-600 dark:text-green-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  </div>
                ) : (
                  <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg
                      className="w-8 h-8 text-red-600 dark:text-red-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </div>
                )}
                <h3 className="text-xl font-bold text-charcoal dark:text-light mb-2">
                  {modalType === "success"
                    ? t("newCase.modal.successTitle")
                    : t("newCase.modal.errorTitle")}
                </h3>
                <p className="text-charcoal dark:text-gray-400 mb-6">
                  {modalMessage}
                </p>
                <button
                  onClick={() => setShowModal(false)}
                  className="w-full px-6 py-3 bg-primary hover:bg-primary/90 dark:bg-accent dark:hover:bg-accent/90 text-light rounded-lg font-medium transition-all"
                >
                  {t("common.close")}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Notification Toast */}
        {notification && (
          <div className="fixed top-4 right-4 z-50 animate-slide-in">
            <div
              className={`px-6 py-4 rounded-lg shadow-lg border ${
                notification.type === "success"
                  ? "bg-green-50 dark:bg-green-900/30 border-green-200 dark:border-green-800"
                  : "bg-red-50 dark:bg-red-900/30 border-red-200 dark:border-red-800"
              }`}
            >
              <div className="flex items-center gap-3">
                {notification.type === "success" ? (
                  <svg
                    className="w-5 h-5 text-green-600 dark:text-green-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                ) : (
                  <svg
                    className="w-5 h-5 text-red-600 dark:text-red-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                )}
                <p
                  className={`text-sm font-medium ${
                    notification.type === "success"
                      ? "text-green-800 dark:text-green-300"
                      : "text-red-800 dark:text-red-300"
                  }`}
                >
                  {notification.message}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Back Button */}
        <button
          onClick={() => navigate("/dashboard/cases")}
          className="flex items-center gap-2 text-charcoal dark:text-gray-400 hover:text-primary dark:hover:text-accent mb-6 transition-colors"
        >
          <svg
            className="w-5 h-5 rtl:rotate-180"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
          <span>{t("newCase.backToCases")}</span>
        </button>

        {/* Main Content */}
        <div className="bg-light dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
          {/* Steps Progress */}
          <div className="border-b border-gray-200 dark:border-gray-700 px-6 py-4">
            <div className="flex items-center justify-between">
              {activeSteps.map((step, index) => (
                <div key={step.id} className="flex items-center flex-1">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-all ${
                        index < currentStepIndex
                          ? "bg-green-500 text-white"
                          : index === currentStepIndex
                          ? "bg-primary dark:bg-accent text-white"
                          : "bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400"
                      }`}
                    >
                      {index < currentStepIndex ? (
                        <svg
                          className="w-6 h-6"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                      ) : (
                        index + 1
                      )}
                    </div>
                    <span
                      className={`text-sm font-medium hidden sm:block ${
                        index === currentStepIndex
                          ? "text-primary dark:text-accent"
                          : "text-charcoal dark:text-gray-400"
                      }`}
                    >
                      {step.label}
                    </span>
                  </div>
                  {index < activeSteps.length - 1 && (
                    <div className="flex-1 h-0.5 bg-gray-200 dark:bg-gray-700 mx-4" />
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Step Content */}
          <div className="p-6">
            {CurrentStepComponent && (
              <CurrentStepComponent
                formData={formData}
                updateFormData={updateFormData}
                addresses={addresses}
                branches={branches}
                errors={errors}
              />
            )}
          </div>

          {/* Navigation Buttons */}
          <div className="border-t border-gray-200 dark:border-gray-700 px-6 py-4">
            <div className="flex justify-between">
              <button
                onClick={handleBack}
                disabled={currentStepIndex === 0}
                className="px-6 py-2.5 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-charcoal dark:text-light rounded-lg font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {t("newCase.navigation.back")}
              </button>

              {currentStepIndex < activeSteps.length - 1 ? (
                <button
                  onClick={handleNext}
                  className="px-6 py-2.5 bg-primary hover:bg-primary/90 dark:bg-accent dark:hover:bg-accent/90 text-light rounded-lg font-medium transition-all shadow-md hover:shadow-lg"
                >
                  {t("newCase.navigation.next")}
                </button>
              ) : (
                <button
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className="px-6 py-2.5 bg-primary hover:bg-primary/90 dark:bg-accent dark:hover:bg-accent/90 text-light rounded-lg font-medium transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <span className="flex items-center gap-2">
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      {t("newCase.navigation.submitting")}
                    </span>
                  ) : (
                    t("newCase.navigation.submit")
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SubmitCase;
