import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useTheme } from "../../context/ThemeContext.jsx";
import { useLanguage } from "../../context/LanguageContext.jsx";
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
  const { t } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();

  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authModalType, setAuthModalType] = useState("login");
  const [activeSection, setActiveSection] = useState("home");

  // Auth state
  const [user, setUser] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // Check authentication status
  useEffect(() => {
    const checkAuth = () => {
      const token = localStorage.getItem("accessToken");
      const userData = localStorage.getItem("user");

      if (token && userData) {
        try {
          const parsedUser = JSON.parse(userData);
          setUser(parsedUser);
          setIsLoggedIn(true);
        } catch (error) {
          console.error("Error parsing user data:", error);
          setIsLoggedIn(false);
          setUser(null);
        }
      } else {
        setIsLoggedIn(false);
        setUser(null);
      }
    };

    checkAuth();
    window.addEventListener("storage", checkAuth);
    return () => window.removeEventListener("storage", checkAuth);
  }, []);

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
      "services",
      "portfolio",
      "values",
      "team",
      "contact",
    ];

    sections.forEach((sectionId) => {
      const element = document.getElementById(sectionId);
      if (element) observer.observe(element);
    });

    return () => observer.disconnect();
  }, [location.pathname]);

  // Navigation handlers
  const scrollToSection = (sectionId) => {
    if (sectionId === "home") {
      if (location.pathname === "/") {
        window.scrollTo({ top: 0, behavior: "smooth" });
      } else {
        navigate("/");
      }
    } else {
      if (location.pathname !== "/") {
        navigate("/");
        setTimeout(() => {
          const element = document.getElementById(sectionId);
          if (element) {
            const yOffset = -100;
            const y =
              element.getBoundingClientRect().top +
              window.pageYOffset +
              yOffset;
            window.scrollTo({ top: y, behavior: "smooth" });
          }
        }, 100);
      } else {
        const element = document.getElementById(sectionId);
        if (element) {
          const yOffset = -100;
          const y =
            element.getBoundingClientRect().top + window.pageYOffset + yOffset;
          window.scrollTo({ top: y, behavior: "smooth" });
        }
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

  const handleLogout = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("user");
    setIsLoggedIn(false);
    setUser(null);
    navigate("/");
  };

  // Get navigation links based on user role
  const getNavLinks = () => {
    if (!isLoggedIn) {
      return [
        { id: "home", label: t("nav.home"), section: "home" },
        { id: "who-we-are", label: t("nav.whoWeAre"), section: "who-we-are" },
        {
          id: "how-we-work",
          label: t("nav.howWeWork"),
          section: "how-we-work",
        },
        { id: "values", label: t("nav.values"), section: "values" },
        { id: "services", label: t("nav.services"), section: "services" },
        { id: "team", label: t("nav.team"), section: "team" },
        { id: "contact", label: t("nav.contact"), section: "contact" },
      ];
    }

    const role = user?.role;

    switch (role) {
      case "client":
        return [
          { id: "home", label: t("nav.home"), path: "/" },
          {
            id: "my-cases",
            label: t("nav.myCases"),
            path: "/dashboard/cases",
          },
          {
            id: "new-case",
            label: t("nav.newCase"),
            path: "/dashboard/new-case",
          },
          {
            id: "my-payments",
            label: t("nav.payments"),
            path: "/dashboard/payments",
          },
          {
            id: "my-info",
            label: t("nav.myInfo"),
            path: "/dashboard/myinfo",
          },
        ];

      case "designer":
        return [
          { id: "home", label: t("nav.home"), path: "/" },
          {
            id: "available-cases",
            label: t("nav.availableCases"),
            path: "/dashboard/available-cases",
          },
          {
            id: "my-designs",
            label: t("nav.myDesigns"),
            path: "/dashboard/my-designs",
          },
          {
            id: "payments",
            label: t("nav.myPayments"),
            path: "/dashboard/payments",
          },
        ];

      case "LAB":
        return [
          { id: "home", label: t("nav.home"), path: "/" },
          {
            id: "lab-orders",
            label: t("nav.labOrders"),
            path: "/dashboard/orders",
          },
          {
            id: "production",
            label: t("nav.production"),
            path: "/dashboard/production",
          },
          {
            id: "payments",
            label: t("nav.myPayments"),
            path: "/dashboard/payments",
          },
        ];

      case "ADMIN":
        return [
          { id: "home", label: t("nav.home"), path: "/" },
          { id: "users", label: t("nav.users"), path: "/dashboard/users" },
          { id: "cases", label: t("nav.myCases"), path: "/dashboard/cases" },
          {
            id: "settings",
            label: t("nav.systemSettings"),
            path: "/dashboard/settings",
          },
        ];

      default:
        return [{ id: "home", label: t("nav.home"), path: "/" }];
    }
  };

  const navLinks = getNavLinks();

  return (
    <>
      <header
        className={`fixed top-0 w-full z-50 transition-all duration-300 ${
          isScrolled
            ? "bg-light/90 dark:bg-dark/90 backdrop-blur-lg shadow-lg"
            : "bg-light dark:bg-dark"
        }`}
      >
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 border-b border-gray-200/50 dark:border-gray-700/50">
            <Link
              to="/"
              className="flex items-center transition-all duration-300"
            >
              <img
                src={isDark ? "/brand.svg" : "/brand.svg"}
                alt="GuideMe Logo"
                className="h-10 w-auto object-contain"
              />
            </Link>

            <div className="flex items-center gap-2">
              <div className="hidden lg:flex items-center gap-2">
                {!isLoggedIn ? (
                  <>
                    <button
                      onClick={handleLoginClick}
                      className="inline-flex items-center gap-2 px-4 py-2 text-charcoal dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg font-medium transition-all cursor-pointer"
                    >
                      <LoginIcon className="w-5 h-5" />
                      <span>{t("nav.login")}</span>
                    </button>
                    <button
                      onClick={handleRegisterClick}
                      className="inline-flex items-center gap-2 px-4 py-2 bg-primary dark:bg-accent text-light hover:bg-primary/90 dark:hover:bg-accent/90 rounded-lg font-medium transition-all shadow-md hover:shadow-lg cursor-pointer"
                    >
                      <PersonAddIcon className="w-5 h-5" />
                      <span>{t("nav.register")}</span>
                    </button>
                  </>
                ) : (
                  <>
                    <Link
                      to="/dashboard/profile"
                      className="p-2 text-charcoal dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-all cursor-pointer"
                      title={t("nav.profile")}
                    >
                      <AccountCircleIcon className="w-6 h-6" />
                    </Link>
                    <button
                      className="p-2 text-charcoal dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-all relative cursor-pointer"
                      title={t("nav.notifications")}
                    >
                      <NotificationsIcon className="w-6 h-6" />
                      <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
                    </button>
                    <button
                      onClick={handleLogout}
                      className="inline-flex items-center gap-2 px-4 py-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg font-medium transition-all cursor-pointer"
                    >
                      <LogoutIcon className="w-5 h-5" />
                      <span>{t("nav.logout")}</span>
                    </button>
                  </>
                )}
              </div>

              {/* Theme & Language Toggles */}
              <div className="flex items-center gap-1">
                <button
                  onClick={toggleTheme}
                  className="p-2 text-charcoal dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-all cursor-pointer"
                  aria-label="Toggle theme"
                >
                  {isDark ? (
                    <LightModeIcon className="w-5 h-5" />
                  ) : (
                    <DarkModeIcon className="w-5 h-5" />
                  )}
                </button>
                <button
                  onClick={toggleLanguage}
                  className="p-2 text-charcoal dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-all cursor-pointer"
                  aria-label="Toggle language"
                >
                  <div className="flex items-center gap-1">
                    <LanguageIcon className="w-5 h-5" />
                    <span className="text-xs font-bold">
                      {language.toUpperCase()}
                    </span>
                  </div>
                </button>
              </div>

              {/* Mobile Menu Button */}
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="lg:hidden p-2 text-charcoal dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-all cursor-pointer"
                aria-label="Toggle menu"
              >
                {isMobileMenuOpen ? (
                  <CloseIcon className="w-6 h-6" />
                ) : (
                  <MenuIcon className="w-6 h-6" />
                )}
              </button>
            </div>
          </div>

          {/* Second Line: Navigation (Desktop Only) */}
          <nav className="hidden lg:flex items-center justify-center gap-1 h-12">
            {navLinks.map((link) => (
              <button
                key={link.id}
                onClick={() =>
                  link.path
                    ? navigate(link.path)
                    : scrollToSection(link.section)
                }
                className={`px-4 py-2 text-sm font-medium rounded-lg transition-all cursor-pointer ${
                  (link.path && location.pathname === link.path) ||
                  activeSection === link.section
                    ? "bg-primary dark:bg-accent text-light shadow-md"
                    : "text-charcoal dark:text-gray-300 hover:bg-accent/20 dark:hover:bg-accent/20 hover:text-accent dark:hover:text-accent-secondary"
                }`}
              >
                {link.label}
              </button>
            ))}
          </nav>
        </div>
      </header>

      {/* Spacer */}
      <div className="h-16 lg:h-28"></div>

      {/* Mobile Menu */}
      <MobileMenu
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
        navLinks={navLinks}
        activeSection={activeSection}
        scrollToSection={scrollToSection}
        onLoginClick={handleLoginClick}
        onRegisterClick={handleRegisterClick}
        isLoggedIn={isLoggedIn}
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
          window.location.reload(); // Reload to update auth state
        }}
      />
    </>
  );
};

export default Header;
