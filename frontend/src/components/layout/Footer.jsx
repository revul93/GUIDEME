import React from "react";
import { Link } from "react-router-dom";
import { useTheme } from "../../context/ThemeContext.jsx";
import { useTranslation } from "react-i18next";
import EmailIcon from "@mui/icons-material/Email";
import PhoneIcon from "@mui/icons-material/Phone";
import FacebookIcon from "@mui/icons-material/Facebook";
import XIcon from "@mui/icons-material/X";
import InstagramIcon from "@mui/icons-material/Instagram";
import LinkedInIcon from "@mui/icons-material/LinkedIn";

const Footer = () => {
  const { isDark } = useTheme();
  const { t } = useTranslation();
  const currentYear = new Date().getFullYear();

  const socialLinks = [
    { icon: FacebookIcon, href: "https://facebook.com", label: "Facebook" },
    { icon: XIcon, href: "https://x.com", label: "X" },
    { icon: InstagramIcon, href: "https://instagram.com", label: "Instagram" },
    { icon: LinkedInIcon, href: "https://linkedin.com", label: "LinkedIn" },
  ];

  return (
    <footer className="bg-gray-50 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Desktop: Single Line | Mobile: Two Lines */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Left: Logo + Contact */}
          <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 md:gap-4">
            <img
              src={isDark ? "/brand.svg" : "/brand.svg"}
              alt="GuideMe Logo"
              className="h-9 w-auto"
            />

            <div className="hidden md:block h-4 w-px bg-gray-300 dark:bg-gray-700"></div>

            <a
              href="tel:+966500000000"
              className="flex items-center gap-1.5 text-sm text-charcoal dark:text-gray-400 hover:text-accent dark:hover:text-accent-secondary transition-colors cursor-pointer"
            >
              <PhoneIcon className="w-4 h-4" />
              <span dir="ltr">+966 50 000 0000</span>
            </a>

            <a
              href="mailto:info@guideme.sa"
              className="flex items-center gap-1.5 text-sm text-charcoal dark:text-gray-400 hover:text-accent dark:hover:text-accent-secondary transition-colors cursor-pointer"
            >
              <EmailIcon className="w-4 h-4" />
              <span>info@guideme.sa</span>
            </a>
          </div>

          {/* Right: Social + Legal */}
          <div className="flex flex-wrap items-center justify-center gap-4">
            {/* Social Media */}
            <div className="flex items-center gap-3">
              {socialLinks.map((social) => {
                const Icon = social.icon;
                return (
                  <a
                    key={social.label}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-charcoal dark:text-gray-400 hover:text-accent dark:hover:text-accent-secondary transition-colors cursor-pointer"
                    aria-label={social.label}
                  >
                    <Icon className="w-4 h-4" />
                  </a>
                );
              })}
            </div>

            <div className="hidden md:block h-4 w-px bg-gray-300 dark:bg-gray-700"></div>

            {/* Legal Links + Copyright */}
            <div className="flex items-center gap-2 text-sm text-charcoal dark:text-gray-400">
              <Link
                to="/terms"
                className="hover:text-accent dark:hover:text-accent-secondary transition-colors cursor-pointer"
              >
                Terms
              </Link>
              <span>•</span>
              <Link
                to="/privacy"
                className="hover:text-accent dark:hover:text-accent-secondary transition-colors cursor-pointer"
              >
                Privacy
              </Link>
              <span>•</span>
              <span>© {currentYear} GuideMe</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
