import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useTheme } from "../../context/ThemeContext.jsx";
import { useLanguage } from "../../context/LanguageContext.jsx";
import { useAuth } from "../../context/AuthContext.jsx";
import { useTranslation } from "react-i18next";
import MenuIcon from "@mui/icons-material/Menu";
import CloseIcon from "@mui/icons-material/Close";
import LanguageIcon from "@mui/icons-material/Language";
import LightModeIcon from "@mui/icons-material/LightMode";
import DarkModeIcon from "@mui/icons-material/DarkMode";
import LoginIcon from "@mui/icons-material/Login";
import PersonAddIcon from "@mui/icons-material/PersonAdd";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import NotificationsIcon from "@mui/icons-material/Notifications";
import LogoutIcon from "@mui/icons-material/Logout";
import MobileMenu from "./MobileMenu.jsx";
import AuthModal from "./AuthModal.jsx";

const Header = () => {
  const { isDark, toggleTheme } = useTheme();
  const { language, toggleLanguage } = useLanguage();
  const { isAuthenticated, user, logout } = useAuth();
  const { t } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();

  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authModalType, setAuthModalType] = useState("login");
  const [activeSection, setActiveSection] = useState("home");

  // Scroll detection
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener("scroll", handleScroll);
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Section detection for home page
  useEffect(() => {
    if (location.pathname !== "/") {
      setActiveSection("home");
      return;
    }

    const observerOptions = {
      rootMargin: "-20% 0px -60% 0px",
      threshold: [0, 0.25, 0.5, 0.75, 1],
    };

    const observerCallback = (entries) => {
      let maxRatio = 0;
      let mostVisibleSection = null;

      entries.forEach((entry) => {
        if (entry.intersectionRatio > maxRatio) {
          maxRatio = entry.intersectionRatio;
          mostVisibleSection = entry.target.id;
        }
      });

      if (mostVisibleSection && maxRatio > 0) {
        setActiveSection(mostVisibleSection);
      }
    };

    const observer = new IntersectionObserver(
      observerCallback,
      observerOptions
    );

    const sections = [
      "home",
      "who-we-are",
      "how-we-work",
      "values",
      "services",
      "team",
      "contact",
    ];

    sections.forEach((sectionId) => {
      const element = document.getElementById(sectionId);
      if (element) observer.observe(element);
    });

    return () => observer.disconnect();
  }, [location.pathname]);

  const navLinks = [
    { id: "home", label: t("nav.home"), section: "home" },
    { id: "who-we-are", label: t("nav.whoWeAre"), section: "who-we-are" },
    { id: "how-we-work", label: t("nav.howWeWork"), section: "how-we-work" },
    { id: "values", label: t("nav.values"), section: "values" },
    { id: "services", label: t("nav.services"), section: "services" },
    { id: "team", label: t("nav.team"), section: "team" },
    { id: "contact", label: t("nav.contact"), section: "contact" },
  ];

  const scrollToSection = (sectionId) => {
    if (location.pathname !== "/") {
      navigate("/");
      setTimeout(() => {
        const element = document.getElementById(sectionId);
        if (element) {
          const offset = 80;
          const elementPosition =
            element.getBoundingClientRect().top + window.pageYOffset;
          window.scrollTo({
            top: elementPosition - offset,
            behavior: "smooth",
          });
        }
      }, 100);
    } else {
      const element = document.getElementById(sectionId);
      if (element) {
        const offset = 80;
        const elementPosition =
          element.getBoundingClientRect().top + window.pageYOffset;
        window.scrollTo({
          top: elementPosition - offset,
          behavior: "smooth",
        });
      }
    }
  };

  const handleLoginClick = () => {
    setAuthModalType("login");
    setAuthModalOpen(true);
  };

  const handleRegisterClick = () => {
    setAuthModalType("register");
    setAuthModalOpen(true);
  };

  const handleLogout = async () => {
    await logout();
  };

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          isScrolled
            ? "bg-light/95 dark:bg-dark/95 backdrop-blur-md shadow-lg"
            : "bg-transparent"
        }`}
      >
        <nav className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link to="/" className="flex-shrink-0">
              <img
                src={isDark ? "/brand.svg" : "/brand.svg"}
                alt="GuideMe Logo"
                className="h-8 w-auto object-contain"
              />
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center gap-1">
              {navLinks.map((link) => (
                <button
                  key={link.id}
                  onClick={() => scrollToSection(link.section)}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                    activeSection === link.section
                      ? "text-primary dark:text-accent bg-primary/10 dark:bg-accent/10"
                      : "text-charcoal dark:text-gray-300 hover:text-primary dark:hover:text-accent hover:bg-gray-100 dark:hover:bg-gray-800"
                  }`}
                >
                  {link.label}
                </button>
              ))}
            </div>

            {/* Desktop Actions */}
            <div className="hidden lg:flex items-center gap-3">
              {/* Theme Toggle */}
              <button
                onClick={toggleTheme}
                className="p-2 text-charcoal dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                aria-label="Toggle theme"
              >
                {isDark ? (
                  <LightModeIcon className="w-5 h-5" />
                ) : (
                  <DarkModeIcon className="w-5 h-5" />
                )}
              </button>

              {/* Language Toggle */}
              <button
                onClick={toggleLanguage}
                className="p-2 text-charcoal dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors flex items-center gap-1"
                aria-label="Toggle language"
              >
                <LanguageIcon className="w-5 h-5" />
                <span className="text-sm font-bold">
                  {language === "en" ? "العربية" : "EN"}
                </span>
              </button>

              {/* Auth Buttons or User Menu */}
              {!isAuthenticated ? (
                <>
                  <button
                    onClick={handleLoginClick}
                    className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-charcoal dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                  >
                    <LoginIcon className="w-4 h-4" />
                    <span>{t("nav.login")}</span>
                  </button>
                  <button
                    onClick={handleRegisterClick}
                    className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-light bg-primary dark:bg-accent hover:bg-primary/90 dark:hover:bg-accent/90 rounded-lg transition-colors shadow-md"
                  >
                    <PersonAddIcon className="w-4 h-4" />
                    <span>{t("nav.register")}</span>
                  </button>
                </>
              ) : (
                <>
                  {/* Notifications */}
                  <button className="relative p-2 text-charcoal dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors">
                    <NotificationsIcon className="w-5 h-5" />
                    <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
                  </button>

                  {/* Profile Dropdown */}
                  <div className="relative group">
                    <button className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-charcoal dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors">
                      <AccountCircleIcon className="w-5 h-5" />
                      <span>{user?.profile?.name || "Profile"}</span>
                    </button>

                    {/* Dropdown Menu */}
                    <div className="absolute right-0 mt-2 w-48 bg-light dark:bg-dark border border-gray-200 dark:border-gray-700 rounded-lg shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                      <div className="py-2">
                        <Link
                          to="/dashboard/profile"
                          className="flex items-center gap-2 px-4 py-2 text-sm text-charcoal dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                        >
                          <AccountCircleIcon className="w-4 h-4" />
                          <span>Profile</span>
                        </Link>
                        <Link
                          to="/dashboard/cases"
                          className="flex items-center gap-2 px-4 py-2 text-sm text-charcoal dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                        >
                          <span>My Cases</span>
                        </Link>
                        <hr className="my-2 border-gray-200 dark:border-gray-700" />
                        <button
                          onClick={handleLogout}
                          className="flex items-center gap-2 w-full px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
                        >
                          <LogoutIcon className="w-4 h-4" />
                          <span>Logout</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden p-2 text-charcoal dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
              aria-label="Toggle menu"
            >
              {isMobileMenuOpen ? (
                <CloseIcon className="w-6 h-6" />
              ) : (
                <MenuIcon className="w-6 h-6" />
              )}
            </button>
          </div>
        </nav>
      </header>

      {/* Mobile Menu */}
      <MobileMenu
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
        navLinks={navLinks}
        activeSection={activeSection}
        scrollToSection={scrollToSection}
        onLoginClick={handleLoginClick}
        onRegisterClick={handleRegisterClick}
        isLoggedIn={isAuthenticated}
        user={user}
        onLogout={handleLogout}
      />

      {/* Auth Modal */}
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        type={authModalType}
        onSwitchType={(type) => setAuthModalType(type)}
        onSuccess={() => {
          setAuthModalOpen(false);
        }}
      />
    </>
  );
};

export default Header;
