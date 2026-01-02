import { useTranslation } from "react-i18next";
import { useAuth } from "../../context/AuthContext.jsx";
import WhatsAppIcon from "@mui/icons-material/WhatsApp";
import EmailIcon from "@mui/icons-material/Email";
import FacebookIcon from "@mui/icons-material/Facebook";
import XIcon from "@mui/icons-material/X";
import InstagramIcon from "@mui/icons-material/Instagram";
import LinkedInIcon from "@mui/icons-material/LinkedIn";

const Contact = ({ onSubmitCaseClick }) => {
  const { t } = useTranslation();
  const { isAuthenticated } = useAuth();

  const socialLinks = [
    { icon: FacebookIcon, href: "https://facebook.com", label: "Facebook" },
    { icon: XIcon, href: "https://x.com", label: "X" },
    { icon: InstagramIcon, href: "https://instagram.com", label: "Instagram" },
    { icon: LinkedInIcon, href: "https://linkedin.com", label: "LinkedIn" },
  ];

  const handleSubmitCase = () => {
    if (isAuthenticated) {
      window.location.href = "/dashboard/newcase";
    } else {
      onSubmitCaseClick();
    }
  };

  return (
    <section
      id="contact"
      className="py-16 md:py-20 bg-primary dark:bg-primary scroll-mt-20"
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto text-center">
          <div className="animate-fade-in">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-primary dark:text-light mb-3">
              {t("contact.title")}
            </h2>
            <p className="text-base sm:text-lg text-light/80 mb-8">
              {t("contact.subtitle")}
            </p>

            <button
              onClick={handleSubmitCase}
              className="inline-flex items-center gap-2 px-8 py-4 bg-accent hover:bg-accent/90 text-light text-lg rounded-lg font-semibold transition-all duration-300 shadow-xl hover:shadow-2xl hover:scale-105"
            >
              {t("contact.getStarted")}
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
                  d="M13 7l5 5m0 0l-5 5m5-5H6"
                />
              </svg>
            </button>
          </div>

          {/* Divider */}
          <div className="my-10 h-px bg-light/20"></div>

          {/* Contact Info - Single Line */}
          <div className="flex flex-wrap items-center justify-center gap-6 mb-8 animate-fade-in delay-100">
            <a
              href="https://wa.me/966543210987"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-light/90 hover:text-accent-secondary transition-colors"
            >
              <WhatsAppIcon className="w-5 h-5" />
              <span dir="ltr">+966 54 321 0987</span>
            </a>

            <span className="text-light/40">•</span>

            <a
              href="mailto:info@guide-me.pro"
              className="flex items-center gap-2 text-light/90 hover:text-accent-secondary transition-colors"
            >
              <EmailIcon className="w-5 h-5" />
              <span>info@guide-me.pro</span>
            </a>
          </div>

          {/* Social Media */}
          <div className="flex items-center justify-center gap-4 animate-fade-in delay-200">
            {socialLinks.map((social) => {
              const Icon = social.icon;
              return (
                <a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-11 h-11 bg-light/10 backdrop-blur-sm rounded-full flex items-center justify-center text-light transition-all duration-300 hover:bg-accent hover:scale-110 border border-light/20"
                  aria-label={social.label}
                >
                  <Icon className="w-5 h-5" />
                </a>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Contact;
