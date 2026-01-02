import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useLanguage } from "../../context/LanguageContext.jsx";
import { useAuth } from "../../context/AuthContext.jsx";
import authService from "../../services/authService.js";
import CountryCodeSelector from "../common/CountryCodeSelector.jsx";
import CloseIcon from "@mui/icons-material/Close";
import EmailIcon from "@mui/icons-material/Email";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import WhatsAppIcon from "@mui/icons-material/WhatsApp";

const AuthModal = ({ isOpen, onClose, type, onSwitchType, onSuccess }) => {
  const { t } = useTranslation();
  const { direction } = useLanguage();
  const { login } = useAuth();

  const [step, setStep] = useState(1);
  const [otpChannel, setOtpChannel] = useState("whatsapp");
  const [loginMethod, setLoginMethod] = useState("whatsapp");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [countdown, setCountdown] = useState(0);
  const [otpSent, setOtpSent] = useState(false);

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    countryCode: "+966",
    specialty: "",
    specialtyOther: "",
    clinicName: "",
    otp: "",
  });

  const isLogin = type === "login";

  const specialties = [
    {
      value: "GENERAL_DENTISTRY",
      label: t("auth.specialties.generalDentistry"),
    },
    { value: "ORTHODONTICS", label: t("auth.specialties.orthodontics") },
    { value: "PERIODONTICS", label: t("auth.specialties.periodontics") },
    { value: "ENDODONTICS", label: t("auth.specialties.endodontics") },
    { value: "PROSTHODONTICS", label: t("auth.specialties.prosthodontics") },
    { value: "ORAL_SURGERY", label: t("auth.specialties.oralSurgery") },
    {
      value: "PEDIATRIC_DENTISTRY",
      label: t("auth.specialties.pediatricDentistry"),
    },
    {
      value: "COSMETIC_DENTISTRY",
      label: t("auth.specialties.cosmeticDentistry"),
    },
    { value: "IMPLANTOLOGY", label: t("auth.specialties.implantology") },
    { value: "ORAL_PATHOLOGY", label: t("auth.specialties.oralPathology") },
    { value: "OTHER", label: t("auth.specialties.other") },
  ];

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  useEffect(() => {
    if (isOpen) {
      setFormData({
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        countryCode: "+966",
        specialty: "",
        specialtyOther: "",
        clinicName: "",
        otp: "",
      });
      setStep(1);
      setError("");
      setSuccess("");
      setCountdown(0);
      setOtpSent(false);
      setLoginMethod("whatsapp");
      setOtpChannel("whatsapp");
    }
  }, [isOpen, type]);

  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === "Escape" && isOpen) onClose();
    };
    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      return () => document.removeEventListener("keydown", handleEscape);
    }
  }, [isOpen, onClose]);

  const validateEmail = (email) => {
    if (!email?.trim())
      return { valid: false, error: t("auth.errors.emailRequired") };
    if (email.length > 254)
      return { valid: false, error: t("auth.errors.emailTooLong") };
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email))
      return { valid: false, error: t("auth.errors.invalidEmailFormat") };
    return { valid: true };
  };

  const validatePhone = (phone) => {
    if (!phone?.trim())
      return { valid: false, error: t("auth.errors.phoneRequired") };
    if (!/^\d+$/.test(phone))
      return { valid: false, error: t("auth.errors.phoneOnlyNumbers") };
    if (phone.length !== 9)
      return { valid: false, error: t("auth.errors.phoneLength") };
    if (formData.countryCode === "+966" && !phone.startsWith("5"))
      return { valid: false, error: t("auth.errors.phoneStartWith5") };
    return { valid: true };
  };

  const validateName = (name, field) => {
    if (!name?.trim())
      return { valid: false, error: t(`auth.errors.${field}Required`) };
    if (name.trim().length < 2)
      return { valid: false, error: t(`auth.errors.${field}TooShort`) };
    if (name.length > 50)
      return { valid: false, error: t(`auth.errors.${field}TooLong`) };
    const nameRegex = /^[a-zA-Z\u0600-\u06FF\s'-]+$/;
    if (!nameRegex.test(name))
      return {
        valid: false,
        error: t(`auth.errors.${field}InvalidCharacters`),
      };
    return { valid: true };
  };

  // Input handler
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setError("");

    // Auto-submit OTP
    if (name === "otp" && value.length === 6 && /^\d{6}$/.test(value)) {
      setTimeout(() => {
        e.target.form?.dispatchEvent(
          new Event("submit", { cancelable: true, bubbles: true })
        );
      }, 300);
    }
  };

  // Send OTP
  const handleSendOTP = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    try {
      setLoading(true);

      if (isLogin) {
        // LOGIN FLOW
        const identifier =
          loginMethod === "email"
            ? formData.email
            : `${formData.countryCode}${formData.phone}`;

        if (loginMethod === "email") {
          const emailValidation = validateEmail(formData.email);
          if (!emailValidation.valid) {
            setError(emailValidation.error);
            setLoading(false);
            return;
          }
        } else {
          const phoneValidation = validatePhone(formData.phone);
          if (!phoneValidation.valid) {
            setError(phoneValidation.error);
            setLoading(false);
            return;
          }
        }

        const response = await authService.requestOTP(
          identifier,
          loginMethod,
          "login"
        );

        if (response.success) {
          setSuccess(t("auth.success.otpSent"));
          setOtpSent(true);
          setCountdown(300);
        } else {
          setError(response.message || t("auth.errors.sendOtpFailed"));
        }
      } else {
        // REGISTRATION FLOW - Step 3 (Send OTP)
        const identifier =
          otpChannel === "email"
            ? formData.email
            : `${formData.countryCode}${formData.phone}`;

        const response = await authService.requestOTP(
          identifier,
          otpChannel,
          "register",
          {
            email: formData.email,
            phoneNumber: `${formData.countryCode}${formData.phone}`,
          }
        );

        if (response.success) {
          setSuccess(t("auth.success.otpSent"));
          setOtpSent(true);
          setCountdown(300);
        } else {
          setError(response.message || t("auth.errors.sendOtpFailed"));
        }
      }
    } catch (error) {
      console.error("Send OTP error:", error);
      setError(t("auth.errors.serverError"));
    } finally {
      setLoading(false);
    }
  };

  // Verify OTP
  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!formData.otp || formData.otp.length !== 6) {
      setError(t("auth.errors.otpInvalid"));
      return;
    }

    try {
      setLoading(true);

      if (isLogin) {
        const identifier =
          loginMethod === "email"
            ? formData.email
            : `${formData.countryCode}${formData.phone}`;

        const result = await authService.verifyOTP(
          identifier,
          formData.otp,
          loginMethod,
          "login"
        );

        if (result.success && result.data) {
          const { accessToken, user } = result.data;

          // Update AuthContext
          login(user, accessToken);

          setSuccess(t("auth.success.loginSuccess"));

          setTimeout(() => {
            onSuccess();
          }, 1500);
        } else {
          setError(result.message || t("auth.errors.serverError"));
        }
      } else {
        const identifier =
          otpChannel === "email"
            ? formData.email
            : `${formData.countryCode}${formData.phone}`;

        const userData = {
          name: `${formData.firstName.trim()} ${formData.lastName.trim()}`,
          email: formData.email,
          phoneNumber: `${formData.countryCode}${formData.phone}`,
          specialty: formData.specialty,
          specialtyOther:
            formData.specialty === "OTHER" ? formData.specialtyOther : null,
          clinicName: formData.clinicName,
        };

        const result = await authService.verifyOTP(
          identifier,
          formData.otp,
          otpChannel,
          "register",
          userData
        );

        if (result.success && result.data) {
          const { accessToken, user } = result.data;

          // Update AuthContext
          login(user, accessToken);

          setSuccess(t("auth.success.registerSuccess"));

          setTimeout(() => {
            onSuccess();
          }, 1500);
        } else {
          setError(result.message || t("auth.errors.serverError"));
        }
      }
    } catch (error) {
      console.error("Verify OTP error:", error);
      setError(t("auth.errors.serverError"));
    } finally {
      setLoading(false);
    }
  };

  // Resend OTP
  const handleResendOTP = async () => {
    setFormData((prev) => ({ ...prev, otp: "" }));
    setOtpSent(false);
    setCountdown(0);
  };

  // Navigation
  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
      setError("");
    }
  };

  const handleSwitchType = () => {
    onSwitchType(isLogin ? "register" : "login");
  };

  // Step validation for registration
  const handleNextStep = () => {
    setError("");

    if (!isLogin) {
      if (step === 1) {
        // Validate Step 1: User Info
        const firstNameValidation = validateName(
          formData.firstName,
          "firstName"
        );
        if (!firstNameValidation.valid) {
          setError(firstNameValidation.error);
          return;
        }

        const lastNameValidation = validateName(formData.lastName, "lastName");
        if (!lastNameValidation.valid) {
          setError(lastNameValidation.error);
          return;
        }

        if (!formData.specialty) {
          setError(t("auth.errors.specialtyRequired"));
          return;
        }

        if (formData.specialty === "OTHER" && !formData.specialtyOther) {
          setError(t("auth.errors.specialtyOtherRequired"));
          return;
        }

        if (!formData.clinicName || formData.clinicName.trim().length < 2) {
          setError(t("auth.errors.clinicNameRequired"));
          return;
        }

        setStep(2);
      } else if (step === 2) {
        // Validate Step 2: Contact Info
        const emailValidation = validateEmail(formData.email);
        if (!emailValidation.valid) {
          setError(emailValidation.error);
          return;
        }

        const phoneValidation = validatePhone(formData.phone);
        if (!phoneValidation.valid) {
          setError(phoneValidation.error);
          return;
        }

        setStep(3);
      }
    }
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[90] animate-fade-in"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
        <div
          className="bg-light dark:bg-dark rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto animate-scale-in"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="sticky top-0 bg-light dark:bg-dark border-b border-gray-200 dark:border-gray-800 px-6 py-4 flex items-center justify-between z-10">
            <h2 className="text-xl font-bold text-primary dark:text-light">
              {isLogin
                ? t("auth.login.title")
                : otpSent
                ? t("auth.fields.otp")
                : step === 1
                ? t("auth.register.title")
                : step === 2
                ? "Contact Information"
                : t("auth.otpChannel.title")}
            </h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
            >
              <CloseIcon className="w-5 h-5 text-charcoal dark:text-gray-400" />
            </button>
          </div>

          {/* Content */}
          <div className="px-6 py-6">
            {/* LOGIN FORM */}
            {isLogin ? (
              !otpSent ? (
                <form onSubmit={handleSendOTP} className="space-y-4" noValidate>
                  {/* Login Method Selection */}
                  <div className="space-y-3">
                    <label className="block text-sm font-medium text-charcoal dark:text-gray-300">
                      {t("auth.loginMethod.title")}
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        type="button"
                        onClick={() => setLoginMethod("whatsapp")}
                        className={`flex flex-col items-center gap-2 p-4 border-2 rounded-lg transition-all ${
                          loginMethod === "whatsapp"
                            ? "border-accent dark:border-accent-secondary bg-accent/10 dark:bg-accent-secondary/10"
                            : "border-gray-300 dark:border-gray-700 hover:border-accent dark:hover:border-accent-secondary"
                        }`}
                      >
                        <WhatsAppIcon className="w-8 h-8 text-accent dark:text-accent-secondary" />
                        <span className="text-sm font-medium text-charcoal dark:text-light">
                          {t("auth.loginMethod.whatsapp")}
                        </span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setLoginMethod("email")}
                        className={`flex flex-col items-center gap-2 p-4 border-2 rounded-lg transition-all ${
                          loginMethod === "email"
                            ? "border-accent dark:border-accent-secondary bg-accent/10 dark:bg-accent-secondary/10"
                            : "border-gray-300 dark:border-gray-700 hover:border-accent dark:hover:border-accent-secondary"
                        }`}
                      >
                        <EmailIcon className="w-8 h-8 text-accent dark:text-accent-secondary" />
                        <span className="text-sm font-medium text-charcoal dark:text-light">
                          {t("auth.loginMethod.email")}
                        </span>
                      </button>
                    </div>
                  </div>

                  {/* Email Input */}
                  {loginMethod === "email" && (
                    <div>
                      <label className="block text-sm font-medium text-charcoal dark:text-gray-300 mb-2">
                        {t("auth.fields.email")}
                      </label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-charcoal dark:text-light focus:ring-2 focus:ring-accent dark:focus:ring-accent-secondary focus:border-transparent transition-colors"
                        placeholder="doctor@example.com"
                        dir="ltr"
                        required
                      />
                    </div>
                  )}

                  {/* Phone Input */}
                  {loginMethod === "whatsapp" && (
                    <div>
                      <label className="block text-sm font-medium text-charcoal dark:text-gray-300 mb-2">
                        {t("auth.fields.phone")}
                      </label>
                      <div className="flex gap-2">
                        <CountryCodeSelector
                          value={formData.countryCode}
                          onChange={(code) =>
                            setFormData((prev) => ({
                              ...prev,
                              countryCode: code,
                            }))
                          }
                        />
                        <input
                          type="tel"
                          name="phone"
                          value={formData.phone}
                          onChange={handleChange}
                          className="flex-1 px-4 py-2.5 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-charcoal dark:text-light focus:ring-2 focus:ring-accent dark:focus:ring-accent-secondary focus:border-transparent transition-colors"
                          placeholder="512345678"
                          dir="ltr"
                          required
                        />
                      </div>
                    </div>
                  )}

                  {error && (
                    <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg animate-fade-in">
                      <p className="text-sm text-red-600 dark:text-red-400">
                        {error}
                      </p>
                    </div>
                  )}

                  {success && (
                    <div className="p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg animate-fade-in flex items-center gap-2">
                      <CheckCircleIcon className="w-5 h-5 text-green-600 dark:text-green-400" />
                      <p className="text-sm text-green-600 dark:text-green-400">
                        {success}
                      </p>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full px-6 py-2.5 bg-primary dark:bg-accent hover:bg-primary/90 dark:hover:bg-accent/90 disabled:bg-gray-400 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-all shadow-md hover:shadow-lg disabled:shadow-none"
                  >
                    {loading ? (
                      <span className="flex items-center justify-center">
                        <svg
                          className="animate-spin h-5 w-5 mr-3"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                            fill="none"
                          />
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          />
                        </svg>
                        {t("auth.sending")}
                      </span>
                    ) : (
                      t("auth.sendOtp")
                    )}
                  </button>

                  {/* Switch to Register */}
                  <div className="text-center pt-3 border-t border-gray-200 dark:border-gray-700">
                    <p className="text-sm text-charcoal dark:text-gray-400">
                      {t("auth.login.noAccount")}{" "}
                      <button
                        type="button"
                        onClick={handleSwitchType}
                        className="text-accent dark:text-accent-secondary font-medium hover:underline"
                      >
                        {t("auth.login.registerLink")}
                      </button>
                    </p>
                  </div>
                </form>
              ) : (
                /* LOGIN OTP VERIFICATION */
                <form
                  onSubmit={handleVerifyOTP}
                  className="space-y-4"
                  noValidate
                >
                  {/* OTP Sent Message */}
                  <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                    <p className="text-sm text-blue-800 dark:text-blue-300 text-center">
                      {t("auth.otp.sentTo")}
                      <span className="font-semibold block mt-1">
                        {loginMethod === "email"
                          ? formData.email
                          : `${formData.countryCode} ${formData.phone}`}
                      </span>
                      <span className="text-xs block mt-1 opacity-75">
                        via {loginMethod === "email" ? "Email" : "WhatsApp"}
                      </span>
                    </p>
                  </div>

                  {/* OTP Input */}
                  <div>
                    <input
                      type="text"
                      name="otp"
                      value={formData.otp}
                      onChange={handleChange}
                      className="w-full px-4 py-4 text-center text-2xl tracking-[0.5em] font-bold border-2 border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-primary dark:text-light focus:ring-2 focus:ring-accent dark:focus:ring-accent focus:border-transparent transition-colors"
                      placeholder="● ● ● ● ● ●"
                      maxLength="6"
                      inputMode="numeric"
                      dir="ltr"
                      autoFocus
                      autoComplete="one-time-code"
                    />
                  </div>

                  {/* Resend OTP */}
                  <div className="text-center">
                    {countdown > 0 ? (
                      <p className="text-sm text-charcoal dark:text-gray-400">
                        {t("auth.otp.resendIn")}{" "}
                        <span className="font-bold text-accent dark:text-accent-secondary">
                          {countdown}
                        </span>{" "}
                        {t("auth.otp.seconds")}
                      </p>
                    ) : (
                      <button
                        type="button"
                        onClick={handleResendOTP}
                        disabled={loading}
                        className="text-sm text-accent dark:text-accent-secondary font-medium hover:underline disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {t("auth.otp.resend")}
                      </button>
                    )}
                  </div>

                  {success && (
                    <div className="p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg animate-fade-in flex items-center gap-2">
                      <CheckCircleIcon className="w-5 h-5 text-green-600 dark:text-green-400" />
                      <p className="text-sm text-green-600 dark:text-green-400 text-center">
                        {success}
                      </p>
                    </div>
                  )}

                  {error && (
                    <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg animate-fade-in">
                      <p className="text-sm text-red-600 dark:text-red-400 text-center">
                        {error}
                      </p>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={loading || formData.otp.length !== 6}
                    className="w-full px-6 py-2.5 bg-primary dark:bg-accent hover:bg-primary/90 dark:hover:bg-accent/90 disabled:bg-gray-400 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-all shadow-md hover:shadow-lg disabled:shadow-none"
                  >
                    {loading ? (
                      <span className="flex items-center justify-center">
                        <svg
                          className="animate-spin h-5 w-5 mr-3"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                            fill="none"
                          />
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          />
                        </svg>
                        {t("auth.verifying")}
                      </span>
                    ) : (
                      t("auth.verify")
                    )}
                  </button>
                </form>
              )
            ) : /* REGISTRATION FORM */
            !otpSent ? (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (step === 3) {
                    handleSendOTP(e);
                  } else {
                    handleNextStep();
                  }
                }}
                className="space-y-4"
                noValidate
              >
                {/* STEP 1: User Information */}
                {step === 1 && (
                  <>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-sm font-medium text-charcoal dark:text-gray-300 mb-2">
                          {t("auth.fields.firstName")}
                        </label>
                        <input
                          type="text"
                          name="firstName"
                          value={formData.firstName}
                          onChange={handleChange}
                          className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-charcoal dark:text-light focus:ring-2 focus:ring-accent dark:focus:ring-accent-secondary focus:border-transparent transition-colors"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-charcoal dark:text-gray-300 mb-2">
                          {t("auth.fields.lastName")}
                        </label>
                        <input
                          type="text"
                          name="lastName"
                          value={formData.lastName}
                          onChange={handleChange}
                          className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-charcoal dark:text-light focus:ring-2 focus:ring-accent dark:focus:ring-accent-secondary focus:border-transparent transition-colors"
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-charcoal dark:text-gray-300 mb-2">
                        {t("auth.fields.specialty")}
                      </label>
                      <select
                        name="specialty"
                        value={formData.specialty}
                        onChange={handleChange}
                        className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-charcoal dark:text-light focus:ring-2 focus:ring-accent dark:focus:ring-accent-secondary focus:border-transparent transition-colors"
                        required
                      >
                        <option value="">Select specialty</option>
                        {specialties.map((specialty) => (
                          <option key={specialty.value} value={specialty.value}>
                            {specialty.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    {formData.specialty === "OTHER" && (
                      <div>
                        <label className="block text-sm font-medium text-charcoal dark:text-gray-300 mb-2">
                          {t("auth.fields.specialtyOther")}
                        </label>
                        <input
                          type="text"
                          name="specialtyOther"
                          value={formData.specialtyOther}
                          onChange={handleChange}
                          className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-charcoal dark:text-light focus:ring-2 focus:ring-accent dark:focus:ring-accent-secondary focus:border-transparent transition-colors"
                          required
                        />
                      </div>
                    )}

                    <div>
                      <label className="block text-sm font-medium text-charcoal dark:text-gray-300 mb-2">
                        {t("auth.fields.clinicName")}
                      </label>
                      <input
                        type="text"
                        name="clinicName"
                        value={formData.clinicName}
                        onChange={handleChange}
                        className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-charcoal dark:text-light focus:ring-2 focus:ring-accent dark:focus:ring-accent-secondary focus:border-transparent transition-colors"
                        required
                      />
                    </div>

                    {error && (
                      <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg animate-fade-in">
                        <p className="text-sm text-red-600 dark:text-red-400">
                          {error}
                        </p>
                      </div>
                    )}

                    <button
                      type="submit"
                      className="w-full px-6 py-2.5 bg-primary dark:bg-accent hover:bg-primary/90 dark:hover:bg-accent/90 text-white rounded-lg font-medium transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2"
                    >
                      <span>{t("auth.buttons.next")}</span>
                      <ArrowForwardIcon className="w-5 h-5" />
                    </button>
                  </>
                )}

                {/* STEP 2: Contact Information */}
                {step === 2 && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-charcoal dark:text-gray-300 mb-2">
                        {t("auth.fields.email")}
                      </label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-charcoal dark:text-light focus:ring-2 focus:ring-accent dark:focus:ring-accent-secondary focus:border-transparent transition-colors"
                        placeholder="doctor@example.com"
                        dir="ltr"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-charcoal dark:text-gray-300 mb-2">
                        {t("auth.fields.phone")}
                      </label>
                      <div className="flex gap-2">
                        <CountryCodeSelector
                          value={formData.countryCode}
                          onChange={(code) =>
                            setFormData((prev) => ({
                              ...prev,
                              countryCode: code,
                            }))
                          }
                        />
                        <input
                          type="tel"
                          name="phone"
                          value={formData.phone}
                          onChange={handleChange}
                          className="flex-1 px-4 py-2.5 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-charcoal dark:text-light focus:ring-2 focus:ring-accent dark:focus:ring-accent-secondary focus:border-transparent transition-colors"
                          placeholder="512345678"
                          dir="ltr"
                          required
                        />
                      </div>
                    </div>

                    {error && (
                      <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg animate-fade-in">
                        <p className="text-sm text-red-600 dark:text-red-400">
                          {error}
                        </p>
                      </div>
                    )}

                    <div className="flex gap-3">
                      <button
                        type="button"
                        onClick={handleBack}
                        className="flex items-center justify-center gap-2 px-6 py-2.5 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-charcoal dark:text-gray-300 rounded-lg font-medium transition-all"
                      >
                        <ArrowBackIcon className="w-5 h-5" />
                        <span>{t("auth.buttons.back")}</span>
                      </button>
                      <button
                        type="submit"
                        className="flex-1 px-6 py-2.5 bg-primary dark:bg-accent hover:bg-primary/90 dark:hover:bg-accent/90 text-white rounded-lg font-medium transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2"
                      >
                        <span>{t("auth.buttons.next")}</span>
                        <ArrowForwardIcon className="w-5 h-5" />
                      </button>
                    </div>
                  </>
                )}

                {/* STEP 3: Choose Verification Channel */}
                {step === 3 && (
                  <>
                    <div className="space-y-3">
                      <p className="text-sm text-center text-charcoal dark:text-gray-400">
                        {t("auth.otpChannel.hint")}
                      </p>

                      <div className="grid grid-cols-2 gap-3">
                        <button
                          type="button"
                          onClick={() => setOtpChannel("email")}
                          className={`flex flex-col items-center gap-3 p-4 border-2 rounded-lg transition-all ${
                            otpChannel === "email"
                              ? "border-accent dark:border-accent-secondary bg-accent/10 dark:bg-accent-secondary/10"
                              : "border-gray-300 dark:border-gray-700 hover:border-accent dark:hover:border-accent-secondary"
                          }`}
                        >
                          <EmailIcon className="w-8 h-8 text-accent dark:text-accent-secondary" />
                          <div className="text-center">
                            <span className="text-sm font-medium text-charcoal dark:text-light block">
                              {t("auth.contactMethod.email")}
                            </span>
                            <span className="text-xs text-gray-500 dark:text-gray-400 block mt-1 break-all">
                              {formData.email}
                            </span>
                          </div>
                        </button>

                        <button
                          type="button"
                          onClick={() => setOtpChannel("whatsapp")}
                          className={`flex flex-col items-center gap-3 p-4 border-2 rounded-lg transition-all ${
                            otpChannel === "whatsapp"
                              ? "border-accent dark:border-accent-secondary bg-accent/10 dark:bg-accent-secondary/10"
                              : "border-gray-300 dark:border-gray-700 hover:border-accent dark:hover:border-accent-secondary"
                          }`}
                        >
                          <WhatsAppIcon className="w-8 h-8 text-accent dark:text-accent-secondary" />
                          <div className="text-center">
                            <span className="text-sm font-medium text-charcoal dark:text-light block">
                              {t("auth.contactMethod.whatsapp")}
                            </span>
                            <span
                              className="text-xs text-gray-500 dark:text-gray-400 block mt-1"
                              dir="ltr"
                            >
                              {formData.countryCode} {formData.phone}
                            </span>
                          </div>
                        </button>
                      </div>
                    </div>

                    {error && (
                      <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg animate-fade-in">
                        <p className="text-sm text-red-600 dark:text-red-400">
                          {error}
                        </p>
                      </div>
                    )}

                    {success && (
                      <div className="p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg animate-fade-in flex items-center gap-2">
                        <CheckCircleIcon className="w-5 h-5 text-green-600 dark:text-green-400" />
                        <p className="text-sm text-green-600 dark:text-green-400">
                          {success}
                        </p>
                      </div>
                    )}

                    <div className="flex gap-3">
                      <button
                        type="button"
                        onClick={handleBack}
                        className="flex items-center justify-center gap-2 px-6 py-2.5 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-charcoal dark:text-gray-300 rounded-lg font-medium transition-all"
                      >
                        <ArrowBackIcon className="w-5 h-5" />
                        <span>{t("auth.buttons.back")}</span>
                      </button>
                      <button
                        type="submit"
                        disabled={loading}
                        className="flex-1 px-6 py-2.5 bg-primary dark:bg-accent hover:bg-primary/90 dark:hover:bg-accent/90 disabled:bg-gray-400 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-all shadow-md hover:shadow-lg disabled:shadow-none"
                      >
                        {loading ? (
                          <span className="flex items-center justify-center">
                            <svg
                              className="animate-spin h-5 w-5 mr-3"
                              viewBox="0 0 24 24"
                            >
                              <circle
                                className="opacity-25"
                                cx="12"
                                cy="12"
                                r="10"
                                stroke="currentColor"
                                strokeWidth="4"
                                fill="none"
                              />
                              <path
                                className="opacity-75"
                                fill="currentColor"
                                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                              />
                            </svg>
                            {t("auth.sending")}
                          </span>
                        ) : (
                          t("auth.sendOtp")
                        )}
                      </button>
                    </div>
                  </>
                )}

                {/* Switch to Login */}
                <div className="text-center pt-3 border-t border-gray-200 dark:border-gray-700">
                  <p className="text-sm text-charcoal dark:text-gray-400">
                    {t("auth.register.hasAccount")}{" "}
                    <button
                      type="button"
                      onClick={handleSwitchType}
                      className="text-accent dark:text-accent-secondary font-medium hover:underline"
                    >
                      {t("auth.register.loginLink")}
                    </button>
                  </p>
                </div>
              </form>
            ) : (
              /* REGISTRATION OTP VERIFICATION */
              <form onSubmit={handleVerifyOTP} className="space-y-4" noValidate>
                {/* OTP Sent Message */}
                <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                  <p className="text-sm text-blue-800 dark:text-blue-300 text-center">
                    {t("auth.otp.sentTo")}
                    <span className="font-semibold block mt-1">
                      {otpChannel === "email"
                        ? formData.email
                        : `${formData.countryCode} ${formData.phone}`}
                    </span>
                    <span className="text-xs block mt-1 opacity-75">
                      via {otpChannel === "email" ? "Email" : "WhatsApp"}
                    </span>
                  </p>
                </div>

                {/* OTP Input */}
                <div>
                  <input
                    type="text"
                    name="otp"
                    value={formData.otp}
                    onChange={handleChange}
                    className="w-full px-4 py-4 text-center text-2xl tracking-[0.5em] font-bold border-2 border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-primary dark:text-light focus:ring-2 focus:ring-accent dark:focus:ring-accent focus:border-transparent transition-colors"
                    placeholder="● ● ● ● ● ●"
                    maxLength="6"
                    inputMode="numeric"
                    dir="ltr"
                    autoFocus
                    autoComplete="one-time-code"
                  />
                </div>

                {/* Resend OTP */}
                <div className="text-center">
                  {countdown > 0 ? (
                    <p className="text-sm text-charcoal dark:text-gray-400">
                      {t("auth.otp.resendIn")}{" "}
                      <span className="font-bold text-accent dark:text-accent-secondary">
                        {countdown}
                      </span>{" "}
                      {t("auth.otp.seconds")}
                    </p>
                  ) : (
                    <button
                      type="button"
                      onClick={handleResendOTP}
                      disabled={loading}
                      className="text-sm text-accent dark:text-accent-secondary font-medium hover:underline disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {t("auth.otp.resend")}
                    </button>
                  )}
                </div>

                {success && (
                  <div className="p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg animate-fade-in flex items-center gap-2">
                    <CheckCircleIcon className="w-5 h-5 text-green-600 dark:text-green-400" />
                    <p className="text-sm text-green-600 dark:text-green-400 text-center">
                      {success}
                    </p>
                  </div>
                )}

                {error && (
                  <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg animate-fade-in">
                    <p className="text-sm text-red-600 dark:text-red-400 text-center">
                      {error}
                    </p>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading || formData.otp.length !== 6}
                  className="w-full px-6 py-2.5 bg-primary dark:bg-accent hover:bg-primary/90 dark:hover:bg-accent/90 disabled:bg-gray-400 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-all shadow-md hover:shadow-lg disabled:shadow-none"
                >
                  {loading ? (
                    <span className="flex items-center justify-center">
                      <svg
                        className="animate-spin h-5 w-5 mr-3"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                          fill="none"
                        />
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        />
                      </svg>
                      {t("auth.verifying")}
                    </span>
                  ) : (
                    t("auth.verify")
                  )}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default AuthModal;
