import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import profileService from "../services/profileService";

// Tab Components
import ProfileInfo from "../components/profile/ProfileInfo";
import AddressManager from "../components/profile/AddressManager";
import PreferencesSettings from "../components/profile/PreferencesSettings";
import AccountStats from "../components/profile/AccountStats";

const Profile = () => {
  const { t } = useTranslation();

  const [activeTab, setActiveTab] = useState("info");
  const [profile, setProfile] = useState(null);
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await profileService.getProfile();
      setProfile(data.profile);
      setUser(data.user);
    } catch (error) {
      console.error("Failed to fetch profile:", error);
      setError(error.message || t("profile.errors.loadFailed"));
    } finally {
      setIsLoading(false);
    }
  };

  const tabs = [
    {
      id: "info",
      label: t("profile.tabs.info"),
      icon: (
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
          />
        </svg>
      ),
    },
    {
      id: "addresses",
      label: t("profile.tabs.addresses"),
      icon: (
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
          />
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
          />
        </svg>
      ),
    },
    {
      id: "preferences",
      label: t("profile.tabs.preferences"),
      icon: (
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
          />
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
          />
        </svg>
      ),
    },
    {
      id: "stats",
      label: t("profile.tabs.stats"),
      icon: (
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
          />
        </svg>
      ),
    },
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <div className="w-12 h-12 border-4 border-primary dark:border-accent border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-charcoal dark:text-gray-400">
                {t("common.loading")}
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg
                  className="w-8 h-8 text-red-600 dark:text-red-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </div>
              <p className="text-charcoal dark:text-light font-medium mb-4">
                {error}
              </p>
              <button
                onClick={fetchProfile}
                className="px-6 py-2.5 bg-primary hover:bg-primary/90 dark:bg-accent dark:hover:bg-accent/90 text-light rounded-lg font-medium transition-all"
              >
                {t("common.retry")}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-primary dark:text-light">
            {t("profile.title")}
          </h1>
          <p className="mt-1 text-charcoal dark:text-gray-400">
            {t("profile.subtitle")}
          </p>
        </div>

        {/* Profile Card */}
        <div className="bg-light dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden mb-6">
          {/* Profile Header */}
          <div className="bg-gradient-to-r from-primary to-primary/80 dark:from-accent dark:to-accent/80 px-6 py-8">
            <div className="flex items-center gap-6">
              {/* Profile Image */}
              <div className="w-24 h-24 rounded-full bg-white dark:bg-gray-700 flex items-center justify-center overflow-hidden">
                {profile?.profileImageUrl ? (
                  <img
                    src={profile.profileImageUrl}
                    alt={profile.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <svg
                    className="w-12 h-12 text-primary dark:text-accent"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                    />
                  </svg>
                )}
              </div>

              {/* Profile Info */}
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-white mb-1">
                  {profile?.name}
                </h2>
                <p className="text-white/80 text-sm">{user?.email}</p>
                <div className="flex items-center gap-4 mt-3">
                  <span className="px-3 py-1 bg-white/20 text-white text-xs font-medium rounded-full">
                    {t(`clientType.${profile?.clientType}`)}
                  </span>
                  {user?.accountStatus === "active" && (
                    <span className="px-3 py-1 bg-green-500/20 text-white text-xs font-medium rounded-full">
                      {t("profile.status.active")}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="border-b border-gray-200 dark:border-gray-700">
            <div className="flex overflow-x-auto">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-6 py-4 text-sm font-medium transition-all whitespace-nowrap ${
                    activeTab === tab.id
                      ? "text-primary dark:text-accent border-b-2 border-primary dark:border-accent bg-primary/5 dark:bg-accent/5"
                      : "text-charcoal dark:text-gray-400 hover:text-primary dark:hover:text-accent hover:bg-gray-50 dark:hover:bg-gray-700/50"
                  }`}
                >
                  {tab.icon}
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {activeTab === "info" && (
              <ProfileInfo
                profile={profile}
                user={user}
                onUpdate={fetchProfile}
              />
            )}
            {activeTab === "addresses" && (
              <AddressManager onUpdate={fetchProfile} />
            )}
            {activeTab === "preferences" && (
              <PreferencesSettings user={user} onUpdate={fetchProfile} />
            )}
            {activeTab === "stats" && <AccountStats />}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
