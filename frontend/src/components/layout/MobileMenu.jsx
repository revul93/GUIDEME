import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useTheme } from "../../context/ThemeContext.jsx";
import { useLanguage } from "../../context/LanguageContext.jsx";
import CloseIcon from "@mui/icons-material/Close";
import LightModeIcon from "@mui/icons-material/LightMode";
import DarkModeIcon from "@mui/icons-material/DarkMode";
import LanguageIcon from "@mui/icons-material/Language";
import LoginIcon from "@mui/icons-material/Login";
import PersonAddIcon from "@mui/icons-material/PersonAdd";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import NotificationsIcon from "@mui/icons-material/Notifications";
import LogoutIcon from "@mui/icons-material/Logout";

const MobileMenu = ({
  isOpen,
  onClose,
  navLinks,
  activeSection,
  scrollToSection,
  onLoginClick,
  onRegisterClick,
  isLoggedIn,
  user,
  onLogout,
}) => {
  const { t } = useTranslation();
  const { isDark, toggleTheme } = useTheme();
  const { language, toggleLanguage } = useLanguage();
  const navigate = useNavigate();

  if (!isOpen) return null;

  const handleNavClick = (link) => {
    if (link.path) {
      navigate(link.path);
    } else {
      scrollToSection(link.section);
    }
    onClose();
  };

  const handleLoginClick = () => {
    onLoginClick();
    onClose();
  };

  const handleRegisterClick = () => {
    onRegisterClick();
    onClose();
  };

  const handleLogoutClick = () => {
    onLogout();
    onClose();
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[60] lg:hidden"
        onClick={onClose}
      />

      {/* Full Page Menu */}
      <div className="fixed inset-0 bg-white dark:bg-dark z-[70] lg:hidden flex flex-col">
        {/* Header */}
        <div className="flex-shrink-0 flex items-center justify-between px-4 h-16 border-b border-gray-200 dark:border-gray-800">
          <img
            src={isDark ? "/logo-inversed.png" : "/logo.png"}
            alt="GuideMe Logo"
            className="h-8 w-auto object-contain"
          />
          <button
            onClick={onClose}
            className="p-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors cursor-pointer"
          >
            <CloseIcon className="w-6 h-6" />
          </button>
        </div>

        {/* Main Content - Scrollable if needed */}
        <div className="flex-1 overflow-y-auto">
          <div className="flex flex-col min-h-full justify-center px-6 py-8">
            {/* User Info - If logged in */}
            {isLoggedIn && user && (
              <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <div className="flex items-center gap-3">
                  <AccountCircleIcon className="w-12 h-12 text-primary dark:text-secondary" />
                  <div>
                    <p className="font-semibold text-gray-900 dark:text-white">
                      {user.firstName} {user.lastName}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {user.email}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Navigation Links - Centered & Compact */}
            <div className="w-full max-w-sm mx-auto space-y-2 mb-6">
              {navLinks.map((link) => (
                <button
                  key={link.id}
                  onClick={() => handleNavClick(link)}
                  className={`w-full text-center px-4 py-2.5 rounded-lg transition-all font-medium text-sm cursor-pointer ${
                    activeSection === link.section
                      ? "bg-primary dark:bg-secondary text-white shadow-md"
                      : "text-gray-700 dark:text-gray-300 hover:bg-secondary/20 dark:hover:bg-secondary/20 hover:text-secondary-dark dark:hover:text-secondary"
                  }`}
                >
                  {link.label}
                </button>
              ))}
            </div>

            {/* Auth/Profile Actions */}
            {!isLoggedIn ? (
              <div className="space-y-3 mb-6">
                <button
                  onClick={handleLoginClick}
                  className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-900 dark:text-white rounded-lg font-medium transition-all cursor-pointer"
                >
                  <LoginIcon className="w-5 h-5" />
                  <span>{t("nav.login")}</span>
                </button>
                <button
                  onClick={handleRegisterClick}
                  className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 bg-primary dark:bg-secondary text-white hover:bg-primary-dark dark:hover:bg-secondary-dark rounded-lg font-medium transition-all shadow-md cursor-pointer"
                >
                  <PersonAddIcon className="w-5 h-5" />
                  <span>{t("nav.register")}</span>
                </button>
              </div>
            ) : (
              <div className="space-y-3 mb-6">
                <Link
                  to="/dashboard/profile"
                  onClick={onClose}
                  className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-900 dark:text-white rounded-lg font-medium transition-all cursor-pointer"
                >
                  <AccountCircleIcon className="w-5 h-5" />
                  <span>{t("nav.profile")}</span>
                </Link>
                <button className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-900 dark:text-white rounded-lg font-medium transition-all relative cursor-pointer">
                  <NotificationsIcon className="w-5 h-5" />
                  <span>{t("nav.notifications")}</span>
                  <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full"></span>
                </button>
                <button
                  onClick={handleLogoutClick}
                  className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/30 text-red-600 dark:text-red-400 rounded-lg font-medium transition-all cursor-pointer"
                >
                  <LogoutIcon className="w-5 h-5" />
                  <span>{t("nav.logout")}</span>
                </button>
              </div>
            )}

            {/* Settings */}
            <div className="space-y-2 pt-4 border-t border-gray-200 dark:border-gray-800">
              <button
                onClick={() => {
                  toggleTheme();
                }}
                className="w-full flex items-center justify-between px-4 py-3 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-all cursor-pointer"
              >
                <span className="font-medium">{t("settings.theme")}</span>
                <div className="flex items-center gap-2">
                  {isDark ? (
                    <>
                      <LightModeIcon className="w-5 h-5" />
                      <span className="text-sm">{t("settings.lightMode")}</span>
                    </>
                  ) : (
                    <>
                      <DarkModeIcon className="w-5 h-5" />
                      <span className="text-sm">{t("settings.darkMode")}</span>
                    </>
                  )}
                </div>
              </button>

              <button
                onClick={() => {
                  toggleLanguage();
                }}
                className="w-full flex items-center justify-between px-4 py-3 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-all cursor-pointer"
              >
                <span className="font-medium">{t("settings.language")}</span>
                <div className="flex items-center gap-2">
                  <LanguageIcon className="w-5 h-5" />
                  <span className="text-sm font-bold">
                    {language === "en" ? "العربية" : "English"}
                  </span>
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default MobileMenu;
