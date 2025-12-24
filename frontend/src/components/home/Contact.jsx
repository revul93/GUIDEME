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
    },
    {
      icon: XIcon,
      href: "https://x.com",
      label: "X",
    },
    {
      icon: InstagramIcon,
      href: "https://instagram.com",
      label: "Instagram",
    },
    {
      icon: LinkedInIcon,
      href: "https://linkedin.com",
      label: "LinkedIn",
    },
  ];

  return (
    <section
      id="contact"
      className="py-12 md:py-16 bg-primary dark:bg-primary scroll-mt-20"
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-8 animate-fade-in">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-light mb-3">
            {t("contact.title")}
          </h2>
          <p className="text-sm sm:text-base text-light/90">
            {t("contact.subtitle")}
          </p>
        </div>

        <div className="max-w-4xl mx-auto">
          {/* Contact Info Grid - Compact */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 animate-fade-in delay-100">
            {contactInfo.map((info, index) => {
              const Icon = info.icon;
              return (
                <a
                  key={index}
                  href={info.href}
                  className="flex flex-col items-center text-center p-5 bg-light/10 backdrop-blur-sm rounded-xl hover:bg-light/20 transition-all duration-300 border border-light/20"
                >
                  <div className="w-12 h-12 bg-light/20 rounded-full flex items-center justify-center mb-3">
                    <Icon className="w-6 h-6 text-light" />
                  </div>
                  <h3 className="text-light/70 text-xs font-medium mb-1">
                    {info.title}
                  </h3>
                  <p className="text-light text-sm font-semibold">
                    {info.value}
                  </p>
                </a>
              );
            })}
          </div>

          {/* CTA Text */}
          <div className="text-center mb-6 animate-fade-in delay-200">
            <p className="text-base text-light/90 mb-1">{t("contact.ready")}</p>
            <p className="text-sm text-light/70">
              {t("contact.registerMessage")}
            </p>
          </div>

          {/* Social Media */}
          <div className="flex items-center justify-center gap-3 mb-6 animate-fade-in delay-300">
            {socialLinks.map((social) => {
              const Icon = social.icon;
              return (
                <a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-11 h-11 bg-light/10 backdrop-blur-sm rounded-full flex items-center justify-center text-light transition-all duration-300 hover:bg-light hover:text-primary border border-light/20 hover:scale-110"
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
