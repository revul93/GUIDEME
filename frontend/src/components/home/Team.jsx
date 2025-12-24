import { useTranslation } from "react-i18next";

const Team = () => {
  const { t } = useTranslation();

  const teamMembers = [
    {
      id: 1,
      name: t("team.member1.name"),
      role: t("team.member1.role"),
      bio: t("team.member1.bio"),
      cases: 150,
      experience: "15y",
    },
    {
      id: 2,
      name: t("team.member2.name"),
      role: t("team.member2.role"),
      bio: t("team.member2.bio"),
      cases: 120,
      experience: "10y",
    },
    {
      id: 3,
      name: t("team.member3.name"),
      role: t("team.member3.role"),
      bio: t("team.member3.bio"),
      cases: 200,
      experience: "8y",
    },
    {
      id: 4,
      name: t("team.member4.name"),
      role: t("team.member4.role"),
      bio: t("team.member4.bio"),
      cases: 300,
      experience: "5y",
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

  const getColorFromName = (name) => {
    const colors = [
      "from-blue-500 to-blue-600",
      "from-purple-500 to-purple-600",
      "from-pink-500 to-pink-600",
      "from-secondary to-secondary-dark",
      "from-primary to-primary-dark",
      "from-orange-500 to-orange-600",
    ];
    const index = name.charCodeAt(0) % colors.length;
    return colors[index];
  };

  return (
    <section
      id="team"
      className="py-12 md:py-20 bg-slate-50 dark:bg-slate-900 scroll-mt-20"
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-10 md:mb-16">
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white mb-2 md:mb-4">
            {t("team.title")}
          </h2>
          <p className="text-sm sm:text-base md:text-lg text-gray-600 dark:text-gray-400">
            {t("team.subtitle")}
          </p>
        </div>

        {/* Team Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-8">
          {teamMembers.map((member) => (
            <div
              key={member.id}
              className="group bg-white dark:bg-gray-800 rounded-2xl p-4 md:p-6 text-center hover:shadow-xl transition-all duration-300 hover:-translate-y-2"
            >
              {/* Avatar */}
              <div className="relative inline-block mb-3 md:mb-4">
                <div
                  className={`w-20 md:w-24 h-20 md:h-24 rounded-full bg-gradient-to-br ${getColorFromName(
                    member.name
                  )} flex items-center justify-center shadow-lg group-hover:shadow-xl transition-shadow`}
                >
                  <span className="text-xl md:text-2xl font-bold text-white">
                    {getInitials(member.name)}
                  </span>
                </div>
                <div className="absolute bottom-0 right-0 rtl:right-auto rtl:left-0 w-5 md:w-6 h-5 md:h-6 bg-secondary border-2 md:border-4 border-white dark:border-gray-800 rounded-full"></div>
              </div>

              {/* Info */}
              <h3 className="text-base md:text-xl font-bold text-gray-900 dark:text-white mb-1 md:mb-2">
                {member.name}
              </h3>
              <p className="text-xs md:text-sm text-secondary font-medium mb-2 md:mb-3">
                {member.role}
              </p>
              <p className="text-xs text-gray-600 dark:text-gray-400">
                {member.bio}
              </p>

              {/* Stats */}
              <div className="mt-4 md:mt-6 pt-4 md:pt-6 border-t border-gray-200 dark:border-gray-700">
                <div className="grid grid-cols-2 gap-2 md:gap-4">
                  <div>
                    <div className="text-xl md:text-2xl font-bold text-primary dark:text-secondary">
                      {member.cases}
                    </div>
                    <div className="text-xs text-gray-600 dark:text-gray-400">
                      {t("team.cases")}
                    </div>
                  </div>
                  <div>
                    <div className="text-xl md:text-2xl font-bold text-primary dark:text-secondary">
                      {member.experience}
                    </div>
                    <div className="text-xs text-gray-600 dark:text-gray-400">
                      {t("team.experience")}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Team;
