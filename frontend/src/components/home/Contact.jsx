import { useTranslation } from "react-i18next";
import PhoneIcon from "@mui/icons-material/Phone";
import EmailIcon from "@mui/icons-material/Email";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import FacebookIcon from "@mui/icons-material/Facebook";
import XIcon from "@mui/icons-material/X";
import InstagramIcon from "@mui/icons-material/Instagram";
import LinkedInIcon from "@mui/icons-material/LinkedIn";

const Contact = () => {
  const { t } = useTranslation();

  const contactInfo = [
    {
      icon: PhoneIcon,
      title: t("contact.phone"),
      value: "+966 54 321 0987",
      href: "tel:+966543210987",
    },
    {
      icon: EmailIcon,
      title: t("contact.email"),
      value: "info@guide-me.pro",
      href: "mailto:info@guide-me.pro",
    },
    {
      icon: LocationOnIcon,
      title: t("contact.location"),
      value: t("contact.address"),
      href: "#",
    },
  ];

  const socialLinks = [
    {
      icon: FacebookIcon,
      href: "https://facebook.com",
      label: "Facebook",
      color: "hover:text-blue-500",
    },
    {
      icon: XIcon,
      href: "https://x.com",
      label: "X",
      color: "hover:text-gray-900 dark:hover:text-white",
    },
    {
      icon: InstagramIcon,
      href: "https://instagram.com",
      label: "Instagram",
      color: "hover:text-pink-500",
    },
    {
      icon: LinkedInIcon,
      href: "https://linkedin.com",
      label: "LinkedIn",
      color: "hover:text-blue-600",
    },
  ];

  return (
    <section
      id="contact"
      className="py-12 md:py-16 bg-primary dark:bg-primary-dark scroll-mt-20"
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-8 md:mb-12">
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-2 md:mb-4">
            {t("contact.title")}
          </h2>
          <p className="text-sm sm:text-base md:text-lg text-white/90">
            {t("contact.subtitle")}
          </p>
        </div>

        <div className="max-w-4xl mx-auto">
          {/* Contact Info Grid - Compact */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 mb-6 md:mb-8">
            {contactInfo.map((info, index) => {
              const Icon = info.icon;
              return (
                <a
                  key={index}
                  href={info.href}
                  className="flex flex-col items-center text-center p-4 md:p-6 bg-white/10 backdrop-blur-sm rounded-xl hover:bg-white/20 transition-all duration-300 group"
                >
                  <div className="w-10 h-10 md:w-12 md:h-12 bg-white/20 rounded-full flex items-center justify-center group-hover:bg-white/30 transition-colors mb-2 md:mb-3">
                    <Icon className="w-5 h-5 md:w-6 md:h-6 text-white" />
                  </div>
                  <h3 className="text-white/70 text-xs font-medium mb-1">
                    {info.title}
                  </h3>
                  <p className="text-white text-xs md:text-sm font-semibold">
                    {info.value}
                  </p>
                </a>
              );
            })}
          </div>

          {/* CTA Text */}
          <div className="text-center mb-6 md:mb-8">
            <p className="text-sm sm:text-base md:text-lg text-white/90 mb-1 md:mb-2">
              {t("contact.ready")}
            </p>
            <p className="text-xs md:text-sm text-white/70">
              {t("contact.registerMessage")}
            </p>
          </div>

          {/* Social Media */}
          <div className="flex items-center justify-center gap-3 md:gap-4 mb-4 md:mb-6">
            {socialLinks.map((social) => {
              const Icon = social.icon;
              return (
                <a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`w-10 h-10 md:w-12 md:h-12 bg-white/10 backdrop-blur-sm rounded-full flex items-center justify-center text-white transition-all duration-300 hover:bg-white hover:scale-110 ${social.color}`}
                  aria-label={social.label}
                >
                  <Icon className="w-4 h-4 md:w-5 md:h-5" />
                </a>
              );
            })}
          </div>

          {/* Trust Badge */}
          <div className="flex items-center justify-center space-x-2 rtl:space-x-reverse text-xs md:text-sm text-white/80">
            <svg
              className="w-4 h-4 md:w-5 md:h-5 text-secondary"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                clipRule="evenodd"
              />
            </svg>
            <span>{t("contact.trustBadge")}</span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Contact;
