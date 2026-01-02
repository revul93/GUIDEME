import { useTranslation } from "react-i18next";
const Team = () => {
  const { t } = useTranslation();

  const teamMembers = [
    {
      id: 1,
      name: t("team.member1.name"),
      role: t("team.member1.role"),
      bio: t("team.member1.bio"),
    },
    {
      id: 2,
      name: t("team.member2.name"),
      role: t("team.member2.role"),
      bio: t("team.member2.bio"),
    },
    {
      id: 3,
      name: t("team.member3.name"),
      role: t("team.member3.role"),
      bio: t("team.member3.bio"),
    },
    {
      id: 4,
      name: t("team.member4.name"),
      role: t("team.member4.role"),
      bio: t("team.member4.bio"),
    },
  ];

  const getInitials = (name) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <section
      id="team"
      className="py-12 md:py-16 bg-gray-50 dark:bg-gray-900 scroll-mt-20"
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-8 md:mb-12 animate-fade-in">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-primary dark:text-light mb-3">
            {t("team.title")}
          </h2>
          <p className="text-sm sm:text-base text-charcoal dark:text-gray-400">
            {t("team.subtitle")}
          </p>
        </div>

        {/* Team Grid - Compact */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
          {teamMembers.map((member) => (
            <div
              key={member.id}
              className="bg-light dark:bg-gray-800 rounded-xl p-5 text-center border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-all duration-300 hover:-translate-y-1 hover:shadow-xl animate-scale-in"
              style={{ animationDelay: `${member.id * 100}ms` }}
            >
              {/* Avatar */}
              <div className="relative inline-block mb-3">
                <div className="w-20 h-20 rounded-full bg-primary dark:bg-accent flex items-center justify-center shadow-md">
                  <span className="text-xl font-bold text-light">
                    {getInitials(member.name)}
                  </span>
                </div>
                <div className="absolute bottom-0 right-0 rtl:right-auto rtl:left-0 w-5 h-5 bg-accent-secondary dark:bg-accent border-3 border-light dark:border-gray-800 rounded-full"></div>
              </div>

              {/* Info */}
              <h3 className="text-base font-bold text-primary dark:text-light mb-1">
                {member.name}
              </h3>
              <p className="text-xs text-accent dark:text-accent-secondary font-medium mb-2">
                {member.role}
              </p>
              <p className="text-xs text-charcoal dark:text-gray-400 mb-4">
                {member.bio}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Team;
