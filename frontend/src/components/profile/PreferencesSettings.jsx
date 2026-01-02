import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useLanguage } from "../../context/LanguageContext";
import profileService from "../../services/profileService";

const PreferencesSettings = ({ user, onUpdate }) => {
  const { t } = useTranslation();
  const { language, setLanguage } = useLanguage();

  const [preferences, setPreferences] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const [formData, setFormData] = useState({
    language: "en",
    timezone: "Asia/Riyadh",
    emailNotifications: true,
    whatsappNotifications: true,
    webNotifications: true,
  });

  useEffect(() => {
    fetchPreferences();
  }, []);

  const fetchPreferences = async () => {
    setIsLoading(true);
    try {
      const data = await profileService.getPreferences();
      setPreferences(data);
      setFormData({
        language: data.language || "en",
        timezone: data.timezone || "Asia/Riyadh",
        emailNotifications: data.emailNotifications ?? true,
        whatsappNotifications: data.whatsappNotifications ?? true,
        webNotifications: data.webNotifications ?? true,
      });
    } catch (error) {
      console.error("Failed to fetch preferences:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLanguageChange = async (newLanguage) => {
    setFormData((prev) => ({ ...prev, language: newLanguage }));
    setIsSaving(true);
    try {
      await profileService.updateLanguage(newLanguage);
      setLanguage(newLanguage);
      onUpdate();
      alert(t("profile.success.languageUpdated"));
    } catch (error) {
      console.error("Failed to update language:", error);
      alert(error.message || t("profile.errors.updateFailed"));
    } finally {
      setIsSaving(false);
    }
  };

  const handleTimezoneChange = async (newTimezone) => {
    setFormData((prev) => ({ ...prev, timezone: newTimezone }));
    setIsSaving(true);
    try {
      await profileService.updateTimezone(newTimezone);
      onUpdate();
      alert(t("profile.success.timezoneUpdated"));
    } catch (error) {
      console.error("Failed to update timezone:", error);
      alert(error.message || t("profile.errors.updateFailed"));
    } finally {
      setIsSaving(false);
    }
  };

  const handleNotificationChange = async (key, value) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
    setIsSaving(true);
    try {
      await profileService.updateNotificationPreferences({
        emailNotifications:
          key === "emailNotifications" ? value : formData.emailNotifications,
        whatsappNotifications:
          key === "whatsappNotifications"
            ? value
            : formData.whatsappNotifications,
        webNotifications:
          key === "webNotifications" ? value : formData.webNotifications,
      });
      onUpdate();
      alert(t("profile.success.notificationsUpdated"));
    } catch (error) {
      console.error("Failed to update notifications:", error);
      alert(error.message || t("profile.errors.updateFailed"));
    } finally {
      setIsSaving(false);
    }
  };

  const timezones = [
    { value: "Asia/Riyadh", label: "Riyadh (GMT+3)" },
    { value: "Asia/Dubai", label: "Dubai (GMT+4)" },
    { value: "Asia/Kuwait", label: "Kuwait (GMT+3)" },
    { value: "Asia/Bahrain", label: "Bahrain (GMT+3)" },
    { value: "Asia/Qatar", label: "Qatar (GMT+3)" },
    { value: "Asia/Muscat", label: "Muscat (GMT+4)" },
    { value: "Asia/Baghdad", label: "Baghdad (GMT+3)" },
    { value: "Africa/Cairo", label: "Cairo (GMT+2)" },
    { value: "Europe/London", label: "London (GMT)" },
    { value: "America/New_York", label: "New York (GMT-5)" },
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="w-8 h-8 border-4 border-primary dark:border-accent border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Language Settings */}
      <div>
        <h3 className="text-lg font-semibold text-primary dark:text-light mb-4">
          {t("profile.sections.language")}
        </h3>
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
          <label className="block text-sm font-medium text-charcoal dark:text-light mb-3">
            {t("profile.fields.interfaceLanguage")}
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <button
              onClick={() => handleLanguageChange("en")}
              disabled={isSaving}
              className={`p-4 rounded-lg border-2 text-left transition-all disabled:opacity-50 ${
                formData.language === "en"
                  ? "border-primary dark:border-accent bg-primary/10 dark:bg-accent/20"
                  : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600"
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="text-2xl">🇬🇧</div>
                <div>
                  <p
                    className={`font-semibold ${
                      formData.language === "en"
                        ? "text-primary dark:text-accent"
                        : "text-charcoal dark:text-light"
                    }`}
                  >
                    English
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    United States
                  </p>
                </div>
              </div>
            </button>

            <button
              onClick={() => handleLanguageChange("ar")}
              disabled={isSaving}
              className={`p-4 rounded-lg border-2 text-left transition-all disabled:opacity-50 ${
                formData.language === "ar"
                  ? "border-primary dark:border-accent bg-primary/10 dark:bg-accent/20"
                  : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600"
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="text-2xl">🇸🇦</div>
                <div>
                  <p
                    className={`font-semibold ${
                      formData.language === "ar"
                        ? "text-primary dark:text-accent"
                        : "text-charcoal dark:text-light"
                    }`}
                  >
                    العربية
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Saudi Arabia
                  </p>
                </div>
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* Timezone Settings */}
      <div>
        <h3 className="text-lg font-semibold text-primary dark:text-light mb-4">
          {t("profile.sections.timezone")}
        </h3>
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
          <label className="block text-sm font-medium text-charcoal dark:text-light mb-3">
            {t("profile.fields.timezone")}
          </label>
          <select
            value={formData.timezone}
            onChange={(e) => handleTimezoneChange(e.target.value)}
            disabled={isSaving}
            className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-charcoal dark:text-light focus:ring-2 focus:ring-accent focus:border-transparent transition-colors"
          >
            {timezones.map((tz) => (
              <option key={tz.value} value={tz.value}>
                {tz.label}
              </option>
            ))}
          </select>
          <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
            {t("profile.hints.timezoneInfo")}
          </p>
        </div>
      </div>

      {/* Notification Preferences */}
      <div>
        <h3 className="text-lg font-semibold text-primary dark:text-light mb-4">
          {t("profile.sections.notifications")}
        </h3>
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg p-6 space-y-6">
          {/* Email Notifications */}
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <svg
                  className="w-5 h-5 text-primary dark:text-accent"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                  />
                </svg>
                <h4 className="font-semibold text-charcoal dark:text-light">
                  {t("profile.fields.emailNotifications")}
                </h4>
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {t("profile.hints.emailNotifications")}
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer ml-4">
              <input
                type="checkbox"
                checked={formData.emailNotifications}
                onChange={(e) =>
                  handleNotificationChange(
                    "emailNotifications",
                    e.target.checked
                  )
                }
                disabled={isSaving}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-accent/20 dark:peer-focus:ring-accent/30 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary dark:peer-checked:bg-accent"></div>
            </label>
          </div>

          {/* WhatsApp Notifications */}
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <svg
                  className="w-5 h-5 text-green-600 dark:text-green-400"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
                </svg>
                <h4 className="font-semibold text-charcoal dark:text-light">
                  {t("profile.fields.whatsappNotifications")}
                </h4>
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {t("profile.hints.whatsappNotifications")}
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer ml-4">
              <input
                type="checkbox"
                checked={formData.whatsappNotifications}
                onChange={(e) =>
                  handleNotificationChange(
                    "whatsappNotifications",
                    e.target.checked
                  )
                }
                disabled={isSaving}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-accent/20 dark:peer-focus:ring-accent/30 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary dark:peer-checked:bg-accent"></div>
            </label>
          </div>

          {/* Web Notifications */}
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <svg
                  className="w-5 h-5 text-primary dark:text-accent"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                  />
                </svg>
                <h4 className="font-semibold text-charcoal dark:text-light">
                  {t("profile.fields.webNotifications")}
                </h4>
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {t("profile.hints.webNotifications")}
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer ml-4">
              <input
                type="checkbox"
                checked={formData.webNotifications}
                onChange={(e) =>
                  handleNotificationChange("webNotifications", e.target.checked)
                }
                disabled={isSaving}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-accent/20 dark:peer-focus:ring-accent/30 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary dark:peer-checked:bg-accent"></div>
            </label>
          </div>
        </div>
      </div>

      {/* Contact Verification Info */}
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
        <div className="flex gap-3">
          <svg
            className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <div>
            <p className="text-sm font-medium text-blue-800 dark:text-blue-300">
              {t("profile.info.contactVerification")}
            </p>
            <p className="text-sm text-blue-700 dark:text-blue-400 mt-1">
              {t("profile.info.verificationHint")}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PreferencesSettings;
