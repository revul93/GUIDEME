import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useLanguage } from "../../context/LanguageContext.jsx";
import { useAuth } from "../../context/AuthContext.jsx";
import { authService } from "../../services/authService.js";
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
  const { login: authLogin, register: authRegister } = useAuth();

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
    channel: "whatsapp",
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
        channel: "whatsapp",
      });
      setStep(1);
      setError("");
      setSuccess("");
      setCountdown(0);
      setOtpSent(false);
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
    if (countryCode === "+966" && !phone.startsWith("5"))
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
      if (isLogin) {
        const identifier =
          loginMethod === "email"
            ? formData.email
            : `${formData.countryCode}${formData.phone}`;

        if (loginMethod === "email") {
          const emailValidation = validateEmail(formData.email);
          if (!emailValidation.valid) {
            setError(emailValidation.error);
            return;
          }
        } else {
          const phoneValidation = validatePhone(formData.phone);
          if (!phoneValidation.valid) {
            setError(phoneValidation.error);
            return;
          }
        }

        setLoading(true);
        const response = await authService.requestOTP(identifier, loginMethod);

        if (response.success) {
          setSuccess(t("auth.otp.sent"));
          setOtpSent(true);
          setCountdown(300); // 5 minutes
        } else {
          setError(response.message);
        }
      } else {
        // Registration - Step 2: Send OTP
        if (step === 2) {
          // Validate channel-specific field
          if (otpChannel === "email") {
            const emailValidation = validateEmail(formData.email);
            if (!emailValidation.valid) {
              setError(emailValidation.error);
              return;
            }
          } else {
            const phoneValidation = validatePhone(formData.phone);
            if (!phoneValidation.valid) {
              setError(phoneValidation.error);
              return;
            }
          }

          const identifier =
            otpChannel === "email"
              ? formData.email
              : `${formData.countryCode}${formData.phone}`;

          setLoading(true);
          const response = await authService.requestOTP(identifier, otpChannel);

          if (response.success) {
            setSuccess(t("auth.otp.sent"));
            setOtpSent(true);
            setCountdown(300);
            setFormData((prev) => ({ ...prev, channel: otpChannel }));
          } else {
            setError(response.message);
          }
        }
      }
    } catch (error) {
      setError(error.response?.data?.message || t("auth.errors.sendOtpFailed"));
    } finally {
      setLoading(false);
    }
  };

  // Verify OTP
  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    setError("");

    if (formData.otp.length !== 6) {
      setError(t("auth.errors.otpRequired"));
      return;
    }

    try {
      setLoading(true);

      if (isLogin) {
        const identifier =
          loginMethod === "email"
            ? formData.email
            : `${formData.countryCode}${formData.phone}`;
        const result = await authLogin(identifier, formData.otp, "login");

        if (result.success) {
          setSuccess(t("auth.success.loginSuccess"));
          setTimeout(() => {
            onSuccess();
          }, 500);
        } else {
          setError(result.message);
        }
      } else {
        const result = await authRegister(formData, formData.otp);

        if (result.success) {
          setSuccess(t("auth.success.registerSuccess"));
          setTimeout(() => {
            onSuccess();
          }, 500);
        } else {
          setError(result.message);
        }
      }
    } catch (error) {
      setError(
        error.response?.data?.message || t("auth.errors.verificationFailed")
      );
    } finally {
      setLoading(false);
    }
  };

  // Resend OTP
  const handleResendOTP = async () => {
    setCountdown(300);
    await handleSendOTP({ preventDefault: () => {} });
  };

  // Step navigation for registration
  const handleNext = (e) => {
    e.preventDefault();
    setError("");

    // Validate step 1
    const firstNameValidation = validateName(formData.firstName, "firstName");
    if (!firstNameValidation.valid) {
      setError(firstNameValidation.error);
      return;
    }

    const lastNameValidation = validateName(formData.lastName, "lastName");
    if (!lastNameValidation.valid) {
      setError(lastNameValidation.error);
      return;
    }

    const clinicValidation = validateName(formData.clinicName, "clinicName");
    if (!clinicValidation.valid) {
      setError(clinicValidation.error);
      return;
    }

    if (!formData.specialty) {
      setError(t("auth.errors.specialtyRequired"));
      return;
    }

    if (formData.specialty === "OTHER" && !formData.specialtyOther?.trim()) {
      setError(t("auth.errors.specialtyOtherRequired"));
      return;
    }

    setStep(2);
  };

  const handleBack = () => {
    setStep(1);
    setOtpSent(false);
    setError("");
  };

  const handleSwitchType = () => {
    onSwitchType(isLogin ? "register" : "login");
  };

  const ArrowIcon = direction === "rtl" ? ArrowBackIcon : ArrowForwardIcon;

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] animate-fade-in"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-[101] flex items-center justify-center p-4 overflow-y-auto">
        <div
          className="relative bg-light dark:bg-dark rounded-2xl shadow-2xl w-full max-w-md animate-scale-in"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 rtl:right-auto rtl:left-4 p-2 text-gray-400 hover:text-charcoal dark:hover:text-light rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors z-10"
          >
            <CloseIcon className="w-6 h-6" />
          </button>

          {/* Content */}
          <div className="p-8">
            {/* Header */}
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-primary dark:text-light mb-2">
                {isLogin ? t("auth.login.title") : t("auth.register.title")}
              </h2>
              <p className="text-charcoal dark:text-gray-400">
                {isLogin
                  ? t("auth.login.subtitle")
                  : t("auth.register.subtitle")}
              </p>
            </div>

            {/* Registration Steps */}
            {!isLogin && !otpSent && (
              <div className="flex items-center justify-center mb-6">
                {[1, 2].map((num) => (
                  <div key={num} className="flex items-center">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center font-semibold transition-all ${
                        step >= num
                          ? "bg-primary dark:bg-accent text-light"
                          : "bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400"
                      }`}
                    >
                      {num}
                    </div>
                    {num < 2 && (
                      <div
                        className={`w-16 h-0.5 mx-2 transition-all ${
                          step > num
                            ? "bg-primary dark:bg-accent"
                            : "bg-gray-200 dark:bg-gray-700"
                        }`}
                      />
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Forms */}
            {!otpSent ? (
              isLogin ? (
                /* LOGIN FORM */
                <form onSubmit={handleSendOTP} className="space-y-4" noValidate>
                  {/* Login Method Selection */}
                  <div>
                    <label className="block text-sm font-medium text-charcoal dark:text-light mb-2">
                      {t("auth.loginMethod.title")}
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        type="button"
                        onClick={() => setLoginMethod("whatsapp")}
                        className={`p-4 rounded-lg border-2 text-center transition-all ${
                          loginMethod === "whatsapp"
                            ? "border-primary dark:border-accent bg-primary/10 dark:bg-accent/20 text-primary dark:text-accent"
                            : "border-gray-200 dark:border-gray-700 text-charcoal dark:text-light hover:border-gray-300 dark:hover:border-gray-600"
                        }`}
                      >
                        <WhatsAppIcon className="w-6 h-6 mx-auto mb-1" />
                        <span className="text-sm font-medium">
                          {t("auth.loginMethod.whatsapp")}
                        </span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setLoginMethod("email")}
                        className={`p-4 rounded-lg border-2 text-center transition-all ${
                          loginMethod === "email"
                            ? "border-primary dark:border-accent bg-primary/10 dark:bg-accent/20 text-primary dark:text-accent"
                            : "border-gray-200 dark:border-gray-700 text-charcoal dark:text-light hover:border-gray-300 dark:hover:border-gray-600"
                        }`}
                      >
                        <EmailIcon className="w-6 h-6 mx-auto mb-1" />
                        <span className="text-sm font-medium">
                          {t("auth.loginMethod.email")}
                        </span>
                      </button>
                    </div>
                  </div>

                  {/* Email or Phone Input */}
                  {loginMethod === "email" ? (
                    <div>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        disabled={loading}
                        className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-charcoal dark:text-light focus:ring-2 focus:ring-accent focus:border-transparent transition-colors"
                        required
                        placeholder="yourname@email.example"
                      />
                    </div>
                  ) : (
                    <div>
                      <div className="flex gap-2">
                        <CountryCodeSelector
                          value={formData.countryCode}
                          onChange={(code) =>
                            setFormData((prev) => ({
                              ...prev,
                              countryCode: code,
                            }))
                          }
                          disabled={loading}
                        />
                        <input
                          type="tel"
                          name="phone"
                          value={formData.phone}
                          onChange={handleChange}
                          placeholder="501234567"
                          maxLength="9"
                          disabled={loading}
                          className="flex-1 px-4 py-2.5 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-charcoal dark:text-light focus:ring-2 focus:ring-accent focus:border-transparent transition-colors"
                          dir="ltr"
                          required
                        />
                      </div>
                    </div>
                  )}

                  {/* Success/Error Messages */}
                  {success && (
                    <div className="p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg animate-fade-in flex items-center gap-2">
                      <CheckCircleIcon className="w-5 h-5 text-green-600 dark:text-green-400" />
                      <p className="text-sm text-green-600 dark:text-green-400">
                        {success}
                      </p>
                    </div>
                  )}

                  {error && (
                    <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg animate-fade-in">
                      <p className="text-sm text-red-600 dark:text-red-400">
                        {error}
                      </p>
                    </div>
                  )}

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full px-6 py-2.5 bg-accent hover:bg-primary-dark disabled:bg-gray-400 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-all shadow-md hover:shadow-lg disabled:shadow-none"
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
                /* REGISTRATION FORM */
                <form
                  onSubmit={step === 1 ? handleNext : handleSendOTP}
                  className="space-y-4"
                  noValidate
                >
                  {step === 1 ? (
                    <>
                      {/* Step 1: Personal Info */}
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <input
                            type="text"
                            name="firstName"
                            value={formData.firstName}
                            onChange={handleChange}
                            className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-charcoal dark:text-light focus:ring-2 focus:ring-accent focus:border-transparent transition-colors"
                            required
                            placeholder={t("auth.fields.firstName")}
                          />
                        </div>
                        <div>
                          <input
                            type="text"
                            name="lastName"
                            value={formData.lastName}
                            onChange={handleChange}
                            className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-charcoal dark:text-light focus:ring-2 focus:ring-accent focus:border-transparent transition-colors"
                            required
                            placeholder={t("auth.fields.lastName")}
                          />
                        </div>
                      </div>

                      <div>
                        <input
                          type="text"
                          name="clinicName"
                          value={formData.clinicName}
                          onChange={handleChange}
                          className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-charcoal dark:text-light focus:ring-2 focus:ring-accent focus:border-transparent transition-colors"
                          required
                          placeholder={t("auth.fields.clinicName")}
                        />
                      </div>

                      <div>
                        <select
                          name="specialty"
                          value={formData.specialty}
                          onChange={handleChange}
                          className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-charcoal dark:text-light focus:ring-2 focus:ring-accent focus:border-transparent transition-colors"
                          required
                        >
                          <option value="">{t("auth.fields.specialty")}</option>
                          {specialties.map((specialty) => (
                            <option
                              key={specialty.value}
                              value={specialty.value}
                            >
                              {specialty.label}
                            </option>
                          ))}
                        </select>
                      </div>

                      {formData.specialty === "OTHER" && (
                        <div>
                          <input
                            type="text"
                            name="specialtyOther"
                            value={formData.specialtyOther}
                            onChange={handleChange}
                            className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-charcoal dark:text-light focus:ring-2 focus:ring-accent focus:border-transparent transition-colors"
                            required
                            placeholder={t("auth.fields.specialtyOther")}
                          />
                        </div>
                      )}

                      {error && (
                        <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg animate-fade-in">
                          <p className="text-sm text-red-600 dark:text-red-400">
                            {error}
                          </p>
                        </div>
                      )}

                      <button
                        type="submit"
                        className="w-full px-6 py-2.5 bg-accent hover:bg-primary-dark text-white rounded-lg font-medium transition-all shadow-md hover:shadow-lg"
                      >
                        {t("auth.buttons.next")}
                      </button>
                    </>
                  ) : (
                    <>
                      {/* Step 2: Contact Method */}
                      <div>
                        <label className="block text-sm font-medium text-charcoal dark:text-light mb-2">
                          {t("auth.contactMethod.title")}
                        </label>
                        <div className="grid grid-cols-2 gap-3">
                          <button
                            type="button"
                            onClick={() => setOtpChannel("whatsapp")}
                            className={`p-4 rounded-lg border-2 text-center transition-all ${
                              otpChannel === "whatsapp"
                                ? "border-primary dark:border-accent bg-primary/10 dark:bg-accent/20 text-primary dark:text-accent"
                                : "border-gray-200 dark:border-gray-700 text-charcoal dark:text-light hover:border-gray-300 dark:hover:border-gray-600"
                            }`}
                          >
                            <WhatsAppIcon className="w-6 h-6 mx-auto mb-1" />
                            <span className="text-sm font-medium">
                              {t("auth.contactMethod.whatsapp")}
                            </span>
                          </button>
                          <button
                            type="button"
                            onClick={() => setOtpChannel("email")}
                            className={`p-4 rounded-lg border-2 text-center transition-all ${
                              otpChannel === "email"
                                ? "border-primary dark:border-accent bg-primary/10 dark:bg-accent/20 text-primary dark:text-accent"
                                : "border-gray-200 dark:border-gray-700 text-charcoal dark:text-light hover:border-gray-300 dark:hover:border-gray-600"
                            }`}
                          >
                            <EmailIcon className="w-6 h-6 mx-auto mb-1" />
                            <span className="text-sm font-medium">
                              {t("auth.contactMethod.email")}
                            </span>
                          </button>
                        </div>
                      </div>

                      {otpChannel === "email" ? (
                        <div>
                          <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            disabled={loading}
                            className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-charcoal dark:text-light focus:ring-2 focus:ring-accent focus:border-transparent transition-colors"
                            required
                            placeholder="yourname@email.example"
                          />
                        </div>
                      ) : (
                        <div>
                          <div className="flex gap-2">
                            <CountryCodeSelector
                              value={formData.countryCode}
                              onChange={(code) =>
                                setFormData((prev) => ({
                                  ...prev,
                                  countryCode: code,
                                }))
                              }
                              disabled={loading}
                            />
                            <input
                              type="tel"
                              name="phone"
                              value={formData.phone}
                              onChange={handleChange}
                              placeholder="501234567"
                              maxLength="9"
                              disabled={loading}
                              className="flex-1 px-4 py-2.5 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-charcoal dark:text-light focus:ring-2 focus:ring-accent focus:border-transparent transition-colors"
                              dir="ltr"
                              required
                            />
                          </div>
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
                          disabled={loading}
                          className="flex-1 px-6 py-2.5 bg-accent hover:bg-primary-dark disabled:bg-gray-400 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-all shadow-md hover:shadow-lg disabled:shadow-none"
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
              )
            ) : (
              /* OTP VERIFICATION FORM */
              <form onSubmit={handleVerifyOTP} className="space-y-4" noValidate>
                {/* OTP Sent Message */}
                <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                  <p className="text-sm text-blue-800 dark:text-blue-300 text-center">
                    {t("auth.otp.sentTo")}
                    <span className="font-semibold block mt-1">
                      {isLogin
                        ? loginMethod === "email"
                          ? formData.email
                          : `${formData.countryCode} ${formData.phone}`
                        : otpChannel === "email"
                        ? formData.email
                        : `${formData.countryCode} ${formData.phone}`}
                    </span>
                    <span className="text-xs block mt-1 opacity-75">
                      via{" "}
                      {isLogin
                        ? loginMethod === "email"
                          ? "Email"
                          : "WhatsApp"
                        : otpChannel === "email"
                        ? "Email"
                        : "WhatsApp"}
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
                  className="w-full px-6 py-2.5 bg-primary hover:bg-primary-dark disabled:bg-gray-400 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-all shadow-md hover:shadow-lg disabled:shadow-none"
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
