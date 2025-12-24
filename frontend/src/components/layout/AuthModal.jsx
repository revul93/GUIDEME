import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useLanguage } from "../../context/LanguageContext.jsx";
import axios from "axios";
import CloseIcon from "@mui/icons-material/Close";
import EmailIcon from "@mui/icons-material/Email";
import PhoneIcon from "@mui/icons-material/Phone";
import PersonIcon from "@mui/icons-material/Person";
import BusinessIcon from "@mui/icons-material/Business";
import MedicalServicesIcon from "@mui/icons-material/MedicalServices";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import WhatsAppIcon from "@mui/icons-material/WhatsApp";

const AuthModal = ({ isOpen, onClose, type, onSwitchType, onSuccess }) => {
  const { t } = useTranslation();
  const { direction } = useLanguage();

  const [step, setStep] = useState(1);
  const [otpChannel, setOtpChannel] = useState("whatsapp");
  const [loginMethod, setLoginMethod] = useState("whatsapp");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [countdown, setCountdown] = useState(0);

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
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

  // Countdown timer for OTP resend
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  // Reset form when modal opens/closes or type changes
  useEffect(() => {
    if (isOpen) {
      setFormData({
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        specialty: "",
        specialtyOther: "",
        clinicName: "",
        otp: "",
      });
      setStep(1);
      setError("");
      setSuccess("");
      setCountdown(0);
    }
  }, [isOpen, type]);

  // Handle ESC key to close modal
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      return () => document.removeEventListener("keydown", handleEscape);
    }
  }, [isOpen, onClose]);

  // Validation functions
  const validateEmail = (email) => {
    if (!email || email.trim() === "") {
      return { valid: false, error: t("auth.errors.emailRequired") };
    }
    if (email.length > 254) {
      return { valid: false, error: t("auth.errors.emailTooLong") };
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return { valid: false, error: t("auth.errors.invalidEmailFormat") };
    }
    return { valid: true, error: "" };
  };

  const validatePhone = (phone) => {
    if (!phone || phone.trim() === "") {
      return { valid: false, error: t("auth.errors.phoneRequired") };
    }
    if (!/^\d+$/.test(phone)) {
      return { valid: false, error: t("auth.errors.phoneOnlyNumbers") };
    }
    if (phone.length !== 9) {
      return { valid: false, error: t("auth.errors.phoneLength") };
    }
    if (!phone.startsWith("5")) {
      return { valid: false, error: t("auth.errors.phoneStartWith5") };
    }
    return { valid: true, error: "" };
  };

  const validateName = (name, field) => {
    if (!name || name.trim() === "") {
      return { valid: false, error: t(`auth.errors.${field}Required`) };
    }
    if (name.trim().length < 2) {
      return { valid: false, error: t(`auth.errors.${field}TooShort`) };
    }
    if (name.length > 50) {
      return { valid: false, error: t(`auth.errors.${field}TooLong`) };
    }
    const nameRegex = /^[a-zA-Z\u0600-\u06FF\s'-]+$/;
    if (!nameRegex.test(name)) {
      return {
        valid: false,
        error: t(`auth.errors.${field}InvalidCharacters`),
      };
    }
    return { valid: true, error: "" };
  };

  const validateClinicName = (clinicName) => {
    if (!clinicName || clinicName.trim() === "") {
      return { valid: false, error: t("auth.errors.clinicNameRequired") };
    }
    if (clinicName.trim().length < 2) {
      return { valid: false, error: t("auth.errors.clinicNameTooShort") };
    }
    if (clinicName.length > 100) {
      return { valid: false, error: t("auth.errors.clinicNameTooLong") };
    }
    return { valid: true, error: "" };
  };

  const validateSpecialty = (specialty, specialtyOther) => {
    if (!specialty || specialty === "") {
      return { valid: false, error: t("auth.errors.specialtyRequired") };
    }
    if (
      specialty === "OTHER" &&
      (!specialtyOther || specialtyOther.trim() === "")
    ) {
      return { valid: false, error: t("auth.errors.specialtyOtherRequired") };
    }
    return { valid: true, error: "" };
  };

  // Input handlers
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setError("");

    // Auto-submit OTP when 6 digits are entered
    if (name === "otp" && value.length === 6 && /^\d{6}$/.test(value)) {
      // Delay slightly to show the last digit, then trigger verification
      setTimeout(() => {
        const form = e.target.form;
        if (form) {
          form.dispatchEvent(
            new Event("submit", { cancelable: true, bubbles: true })
          );
        }
      }, 300);
    }
  };

  // Submit handlers
  const handleSendOTP = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    try {
      if (isLogin) {
        // Login: validate contact method
        const contact =
          loginMethod === "email" ? formData.email : formData.phone;
        const validation =
          loginMethod === "email"
            ? validateEmail(contact)
            : validatePhone(contact);

        if (!validation.valid) {
          setError(validation.error);
          return;
        }

        setLoading(true);

        const response = await axios.post("/api/auth/request-otp", {
          identifier: loginMethod === "email" ? contact : `+966${contact}`,
          channel: loginMethod === "email" ? "email" : "whatsapp",
          purpose: "login",
        });

        setSuccess(t("auth.success.otpSent"));
        setCountdown(60);
        setStep(2);
      } else {
        // Register: validate step 1 or step 2
        if (step === 1) {
          const firstNameValidation = validateName(
            formData.firstName,
            "firstName"
          );
          if (!firstNameValidation.valid) {
            setError(firstNameValidation.error);
            return;
          }

          const lastNameValidation = validateName(
            formData.lastName,
            "lastName"
          );
          if (!lastNameValidation.valid) {
            setError(lastNameValidation.error);
            return;
          }

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

          // Move to step 2
          setStep(2);
        } else if (step === 2) {
          const specialtyValidation = validateSpecialty(
            formData.specialty,
            formData.specialtyOther
          );
          if (!specialtyValidation.valid) {
            setError(specialtyValidation.error);
            return;
          }

          const clinicValidation = validateClinicName(formData.clinicName);
          if (!clinicValidation.valid) {
            setError(clinicValidation.error);
            return;
          }

          setLoading(true);

          const response = await axios.post("/api/auth/request-otp", {
            identifier:
              otpChannel === "email" ? formData.email : `+966${formData.phone}`,
            channel: otpChannel,
            purpose: "register",
            email: formData.email,
            phoneNumber: `+966${formData.phone}`,
          });

          setSuccess(t("auth.success.otpSent"));
          setCountdown(60);
          setStep(3);
        }
      }
    } catch (err) {
      setError(err.response?.data?.message || t("auth.errors.serverError"));
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    setError("");

    if (formData.otp.length !== 6) {
      setError(t("auth.errors.otpInvalid"));
      return;
    }

    setLoading(true);

    try {
      const identifier = isLogin
        ? loginMethod === "email"
          ? formData.email
          : `+966${formData.phone}`
        : otpChannel === "email"
        ? formData.email
        : `+966${formData.phone}`;

      const payload = {
        identifier,
        code: formData.otp,
        channel: isLogin ? loginMethod : otpChannel,
        purpose: isLogin ? "login" : "register",
      };

      // Add registration data if registering
      if (!isLogin) {
        payload.name = `${formData.firstName.trim()} ${formData.lastName.trim()}`;
        payload.email = formData.email.trim();
        payload.phoneNumber = `+966${formData.phone.trim()}`;
        payload.specialty =
          formData.specialty === "OTHER"
            ? formData.specialtyOther.trim()
            : formData.specialty;
        payload.clinicName = formData.clinicName.trim();
      }

      const response = await axios.post("/api/auth/verify-otp", payload);

      // Store tokens and user data
      localStorage.setItem("accessToken", response.data.data.accessToken);
      localStorage.setItem("user", JSON.stringify(response.data.data.user));

      setSuccess(
        isLogin
          ? t("auth.success.loginSuccess")
          : t("auth.success.registerSuccess")
      );

      // Call success callback
      setTimeout(() => {
        if (onSuccess) onSuccess();
      }, 1500);
    } catch (err) {
      setError(err.response?.data?.message || t("auth.errors.serverError"));
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    setCountdown(60);
    setError("");

    try {
      const identifier = isLogin
        ? loginMethod === "email"
          ? formData.email
          : `+966${formData.phone}`
        : otpChannel === "email"
        ? formData.email
        : `+966${formData.phone}`;

      const payload = {
        identifier,
        channel: isLogin ? loginMethod : otpChannel,
        purpose: isLogin ? "login" : "register",
      };

      // Add registration data if registering
      if (!isLogin) {
        payload.email = formData.email;
        payload.phoneNumber = `+966${formData.phone}`;
      }

      await axios.post("/api/auth/request-otp", payload);

      setSuccess(t("auth.success.otpSent"));
    } catch (err) {
      setError(err.response?.data?.message || t("auth.errors.serverError"));
    }
  };

  const handleSwitchType = () => {
    onSwitchType(isLogin ? "register" : "login");
    setStep(1);
    setError("");
    setSuccess("");
  };

  const handleBack = () => {
    setStep(step - 1);
    setError("");
  };

  if (!isOpen) return null;

  const ArrowIcon = direction === "rtl" ? ArrowForwardIcon : ArrowBackIcon;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[80] animate-fade-in"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-[90] flex items-center justify-center p-4">
        <div className="bg-light dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto animate-scale-in">
          {/* Header */}
          <div className="sticky top-0 bg-light dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4 flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-primary dark:text-light">
                {isLogin ? t("auth.login.title") : t("auth.register.title")}
              </h2>
              <p className="text-sm text-charcoal dark:text-gray-400 mt-1">
                {isLogin
                  ? t("auth.login.subtitle")
                  : t("auth.register.subtitle")}
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-charcoal hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-all cursor-pointer"
            >
              <CloseIcon className="w-6 h-6" />
            </button>
          </div>

          {/* Progress Steps (Register Only) */}
          {!isLogin && step < 3 && (
            <div className="px-6 py-4 bg-gray-50 dark:bg-gray-900">
              <div className="flex items-center justify-between">
                {[1, 2].map((stepNum) => (
                  <div key={stepNum} className="flex items-center flex-1">
                    <div
                      className={`flex items-center justify-center w-8 h-8 rounded-full font-bold ${
                        step >= stepNum
                          ? "bg-primary dark:bg-accent text-white"
                          : "bg-gray-300 dark:bg-gray-700 text-charcoal dark:text-gray-400"
                      }`}
                    >
                      {stepNum}
                    </div>
                    {stepNum < 2 && (
                      <div
                        className={`flex-1 h-1 mx-2 ${
                          step > stepNum
                            ? "bg-primary dark:bg-accent"
                            : "bg-gray-300 dark:bg-gray-700"
                        }`}
                      />
                    )}
                  </div>
                ))}
              </div>
              <div className="flex justify-between mt-2 text-xs text-charcoal dark:text-gray-400">
                <span>{t("auth.steps.step1")}</span>
                <span>{t("auth.steps.step2")}</span>
              </div>
            </div>
          )}

          {/* Content */}
          <div className="p-6">
            {(isLogin && step === 1) || (!isLogin && step < 3) ? (
              <form onSubmit={handleSendOTP} className="space-y-4" noValidate>
                {/* Login Method Selection */}
                {isLogin && (
                  <div>
                    <label className="block text-sm font-medium text-charcoal dark:text-gray-300 mb-2">
                      {t("auth.loginMethod.title")}
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        type="button"
                        onClick={() => setLoginMethod("whatsapp")}
                        className={`flex items-center justify-center gap-2 py-3 px-4 rounded-lg border-2 transition-all cursor-pointer ${
                          loginMethod === "whatsapp"
                            ? "border-accent bg-accent/10 text-accent dark:border-accent dark:bg-accent/20 dark:text-accent"
                            : "border-gray-300 dark:border-gray-600 text-charcoal dark:text-gray-400 hover:border-accent/50"
                        }`}
                      >
                        <WhatsAppIcon className="w-5 h-5" />
                        <span className="font-medium">
                          {t("auth.loginMethod.whatsapp")}
                        </span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setLoginMethod("email")}
                        className={`flex items-center justify-center gap-2 py-3 px-4 rounded-lg border-2 transition-all cursor-pointer ${
                          loginMethod === "email"
                            ? "border-accent bg-accent/10 text-accent dark:border-accent dark:bg-accent/20 dark:text-accent"
                            : "border-gray-300 dark:border-gray-600 text-charcoal dark:text-gray-400 hover:border-accent/50"
                        }`}
                      >
                        <EmailIcon className="w-5 h-5" />
                        <span className="font-medium">
                          {t("auth.loginMethod.email")}
                        </span>
                      </button>
                    </div>
                  </div>
                )}

                {/* Step 1: Personal Info (Register) */}
                {!isLogin && step === 1 && (
                  <>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <div className="relative">
                          <PersonIcon className="absolute left-3 rtl:left-auto rtl:right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                          <input
                            type="text"
                            name="firstName"
                            value={formData.firstName}
                            onChange={handleChange}
                            placeholder={t("auth.fields.firstName")}
                            className="w-full pl-10 rtl:pl-4 rtl:pr-10 pr-4 py-2.5 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-primary dark:text-light placeholder:text-charcoal dark:placeholder:text-gray-400 focus:ring-2 focus:ring-accent dark:focus:ring-accent focus:border-transparent transition-colors"
                            required
                          />
                        </div>
                      </div>
                      <div>
                        <div className="relative">
                          <PersonIcon className="absolute left-3 rtl:left-auto rtl:right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                          <input
                            type="text"
                            name="lastName"
                            value={formData.lastName}
                            onChange={handleChange}
                            placeholder={t("auth.fields.lastName")}
                            className="w-full pl-10 rtl:pl-4 rtl:pr-10 pr-4 py-2.5 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-primary dark:text-light placeholder:text-charcoal dark:placeholder:text-gray-400 focus:ring-2 focus:ring-accent dark:focus:ring-accent focus:border-transparent transition-colors"
                            required
                          />
                        </div>
                      </div>
                    </div>

                    <div>
                      <div className="relative" dir="ltr">
                        <EmailIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                          type="email"
                          name="email"
                          value={formData.email}
                          onChange={handleChange}
                          placeholder={t("auth.fields.email")}
                          className="w-full pl-10 pr-4 py-2.5 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-primary dark:text-light placeholder:text-charcoal dark:placeholder:text-gray-400 focus:ring-2 focus:ring-accent dark:focus:ring-accent focus:border-transparent transition-colors"
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <div className="relative" dir="ltr">
                        <div className="absolute left-3 top-1/2 -translate-y-1/2 flex items-center">
                          <PhoneIcon className="w-5 h-5 text-gray-400" />
                          <span className="ml-2 text-charcoal dark:text-gray-400">
                            +966
                          </span>
                        </div>
                        <input
                          type="tel"
                          name="phone"
                          value={formData.phone}
                          onChange={handleChange}
                          placeholder="5xxxxxxxx"
                          className="w-full pl-[5.5rem] pr-4 py-2.5 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-primary dark:text-light placeholder:text-charcoal dark:placeholder:text-gray-400 focus:ring-2 focus:ring-accent dark:focus:ring-accent focus:border-transparent transition-colors"
                          maxLength="9"
                          required
                        />
                      </div>
                      <p className="text-xs text-charcoal dark:text-gray-400 mt-1">
                        {t("auth.fields.phoneHint")}
                      </p>
                    </div>
                  </>
                )}

                {/* Step 2: Professional Info (Register) */}
                {!isLogin && step === 2 && (
                  <>
                    <div>
                      <div className="relative">
                        <MedicalServicesIcon className="absolute left-3 rtl:left-auto rtl:right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <select
                          name="specialty"
                          value={formData.specialty}
                          onChange={handleChange}
                          className="w-full pl-10 rtl:pl-4 rtl:pr-10 pr-4 py-2.5 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-primary dark:text-light focus:ring-2 focus:ring-accent dark:focus:ring-accent focus:border-transparent transition-colors appearance-none"
                          required
                        >
                          <option value="">{t("auth.fields.specialty")}</option>
                          {specialties.map((spec) => (
                            <option key={spec.value} value={spec.value}>
                              {spec.label}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {formData.specialty === "OTHER" && (
                      <div>
                        <input
                          type="text"
                          name="specialtyOther"
                          value={formData.specialtyOther}
                          onChange={handleChange}
                          placeholder={t("auth.fields.specialtyOther")}
                          className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-primary dark:text-light placeholder:text-charcoal dark:placeholder:text-gray-400 focus:ring-2 focus:ring-accent dark:focus:ring-accent focus:border-transparent transition-colors"
                          required
                        />
                      </div>
                    )}

                    <div>
                      <div className="relative">
                        <BusinessIcon className="absolute left-3 rtl:left-auto rtl:right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                          type="text"
                          name="clinicName"
                          value={formData.clinicName}
                          onChange={handleChange}
                          placeholder={t("auth.fields.clinicName")}
                          className="w-full pl-10 rtl:pl-4 rtl:pr-10 pr-4 py-2.5 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-primary dark:text-light placeholder:text-charcoal dark:placeholder:text-gray-400 focus:ring-2 focus:ring-accent dark:focus:ring-accent focus:border-transparent transition-colors"
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-charcoal dark:text-gray-300 mb-2">
                        {t("auth.otpChannel.title")}
                      </label>
                      <div className="grid grid-cols-2 gap-3">
                        <button
                          type="button"
                          onClick={() => setOtpChannel("whatsapp")}
                          className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg border-2 transition-all cursor-pointer ${
                            otpChannel === "whatsapp"
                              ? "border-accent bg-accent/10 text-accent dark:border-accent dark:bg-accent/20 dark:text-accent"
                              : "border-gray-300 dark:border-gray-600 text-charcoal dark:text-gray-400 hover:border-accent/50"
                          }`}
                        >
                          <WhatsAppIcon className="w-5 h-5" />
                          <span className="font-medium">WhatsApp</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setOtpChannel("email")}
                          className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg border-2 transition-all cursor-pointer ${
                            otpChannel === "email"
                              ? "border-accent bg-accent/10 text-accent dark:border-accent dark:bg-accent/20 dark:text-accent"
                              : "border-gray-300 dark:border-gray-600 text-charcoal dark:text-gray-400 hover:border-accent/50"
                          }`}
                        >
                          <EmailIcon className="w-5 h-5" />
                          <span className="font-medium">
                            {t("auth.contactMethod.email")}
                          </span>
                        </button>
                      </div>
                      <p className="text-xs text-charcoal dark:text-gray-400 mt-1">
                        {t("auth.otpChannel.hint")}
                      </p>
                    </div>
                  </>
                )}

                {/* Login Contact Field */}
                {isLogin && (
                  <div>
                    <div className="relative" dir="ltr">
                      {loginMethod === "email" ? (
                        <>
                          <EmailIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                          <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            placeholder={t("auth.fields.email")}
                            className="w-full pl-10 pr-4 py-2.5 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-primary dark:text-light placeholder:text-charcoal dark:placeholder:text-gray-400 focus:ring-2 focus:ring-accent dark:focus:ring-accent focus:border-transparent transition-colors"
                            required
                          />
                        </>
                      ) : (
                        <>
                          <div className="absolute left-3 top-1/2 -translate-y-1/2 flex items-center">
                            <PhoneIcon className="w-5 h-5 text-gray-400" />
                            <span className="ml-2 text-charcoal dark:text-gray-400">
                              +966
                            </span>
                          </div>
                          <input
                            type="tel"
                            name="phone"
                            value={formData.phone}
                            onChange={handleChange}
                            placeholder="5xxxxxxxx"
                            className="w-full pl-[5.5rem] pr-4 py-2.5 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-primary dark:text-light placeholder:text-charcoal dark:placeholder:text-gray-400 focus:ring-2 focus:ring-accent dark:focus:ring-accent focus:border-transparent transition-colors"
                            maxLength="9"
                            required
                          />
                        </>
                      )}
                    </div>
                  </div>
                )}

                {/* Success Message */}
                {success && (
                  <div className="p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg animate-fade-in flex items-center gap-2">
                    <CheckCircleIcon className="w-5 h-5 text-green-600 dark:text-green-400" />
                    <p className="text-sm text-green-600 dark:text-green-400">
                      {success}
                    </p>
                  </div>
                )}

                {/* Error Message */}
                {error && (
                  <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg animate-fade-in">
                    <p className="text-sm text-red-600 dark:text-red-400">
                      {error}
                    </p>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex gap-3">
                  {!isLogin && step === 2 && (
                    <button
                      type="button"
                      onClick={handleBack}
                      className="flex items-center justify-center gap-2 px-6 py-2.5 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-charcoal dark:text-gray-300 rounded-lg font-medium transition-all cursor-pointer"
                    >
                      <ArrowIcon className="w-5 h-5" />
                      <span>{t("auth.buttons.back")}</span>
                    </button>
                  )}
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 px-6 py-2.5 bg-primary hover:bg-primary-dark disabled:bg-gray-400 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-all shadow-md hover:shadow-lg disabled:shadow-none cursor-pointer"
                  >
                    {loading ? (
                      <span className="flex items-center justify-center">
                        <svg
                          className="animate-spin h-5 w-5 mr-3 rtl:mr-0 rtl:ml-3"
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
                    ) : !isLogin && step === 1 ? (
                      t("auth.buttons.next")
                    ) : (
                      t("auth.sendOtp")
                    )}
                  </button>
                </div>

                {/* Switch Type */}
                <div className="text-center pt-3 border-t border-gray-200 dark:border-gray-700">
                  <p className="text-sm text-charcoal dark:text-gray-400">
                    {isLogin
                      ? t("auth.login.noAccount")
                      : t("auth.register.hasAccount")}{" "}
                    <button
                      type="button"
                      onClick={handleSwitchType}
                      className="text-accent dark:text-accent-secondary font-medium hover:underline cursor-pointer"
                    >
                      {isLogin
                        ? t("auth.login.registerLink")
                        : t("auth.register.loginLink")}
                    </button>
                  </p>
                </div>
              </form>
            ) : (
              <form onSubmit={handleVerifyOTP} className="space-y-4" noValidate>
                {/* OTP Sent Message */}
                <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                  <p className="text-sm text-blue-800 dark:text-blue-300 text-center">
                    {t("auth.otp.sentTo")}{" "}
                    <span className="font-semibold block mt-1">
                      {isLogin
                        ? loginMethod === "email"
                          ? formData.email
                          : `+966 ${formData.phone}`
                        : otpChannel === "email"
                        ? formData.email
                        : `+966 ${formData.phone}`}
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
                      className="text-sm text-accent dark:text-accent-secondary font-medium hover:underline disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                    >
                      {t("auth.otp.resend")}
                    </button>
                  )}
                </div>

                {/* Success Message */}
                {success && (
                  <div className="p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg animate-fade-in flex items-center gap-2">
                    <CheckCircleIcon className="w-5 h-5 text-green-600 dark:text-green-400" />
                    <p className="text-sm text-green-600 dark:text-green-400 text-center">
                      {success}
                    </p>
                  </div>
                )}

                {/* Error Message */}
                {error && (
                  <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg animate-fade-in">
                    <p className="text-sm text-red-600 dark:text-red-400 text-center">
                      {error}
                    </p>
                  </div>
                )}

                {/* Verify Button */}
                <button
                  type="submit"
                  disabled={loading || formData.otp.length !== 6}
                  className="w-full px-6 py-2.5 bg-primary hover:bg-primary-dark disabled:bg-gray-400 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-all shadow-md hover:shadow-lg disabled:shadow-none cursor-pointer"
                >
                  {loading ? (
                    <span className="flex items-center justify-center">
                      <svg
                        className="animate-spin h-5 w-5 mr-3 rtl:mr-0 rtl:ml-3"
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
