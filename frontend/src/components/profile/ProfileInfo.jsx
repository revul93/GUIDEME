import { useState, useRef } from "react";
import { useTranslation } from "react-i18next";
import profileService from "../../services/profileService";

const ProfileInfo = ({ profile, user, onUpdate }) => {
  const { t } = useTranslation();
  const fileInputRef = useRef(null);

  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [errors, setErrors] = useState({});

  const [formData, setFormData] = useState({
    name: profile?.name || "",
    specialty: profile?.specialty || "",
    specialtyOther: profile?.specialtyOther || "",
    clinicName: profile?.clinicName || "",
    labName: profile?.labName || "",
  });

  const specialties = [
    { value: "GENERAL_DENTISTRY", label: t("specialty.general_dentistry") },
    { value: "ORTHODONTICS", label: t("specialty.orthodontics") },
    { value: "PERIODONTICS", label: t("specialty.periodontics") },
    { value: "ENDODONTICS", label: t("specialty.endodontics") },
    { value: "PROSTHODONTICS", label: t("specialty.prosthodontics") },
    { value: "ORAL_SURGERY", label: t("specialty.oral_surgery") },
    { value: "PEDIATRIC_DENTISTRY", label: t("specialty.pediatric_dentistry") },
    { value: "COSMETIC_DENTISTRY", label: t("specialty.cosmetic_dentistry") },
    { value: "IMPLANTOLOGY", label: t("specialty.implantology") },
    { value: "ORAL_PATHOLOGY", label: t("specialty.oral_pathology") },
    { value: "OTHER", label: t("specialty.other") },
  ];

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      alert(t("profile.errors.invalidImageType"));
      return;
    }

    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert(t("profile.errors.imageTooLarge"));
      return;
    }

    setIsUploadingImage(true);
    try {
      await profileService.uploadProfileImage(file);
      onUpdate();
      alert(t("profile.success.imageUploaded"));
    } catch (error) {
      console.error("Failed to upload image:", error);
      alert(error.message || t("profile.errors.imageUploadFailed"));
    } finally {
      setIsUploadingImage(false);
    }
  };

  const handleDeleteImage = async () => {
    if (!confirm(t("profile.confirm.deleteImage"))) return;

    setIsUploadingImage(true);
    try {
      await profileService.deleteProfileImage();
      onUpdate();
      alert(t("profile.success.imageDeleted"));
    } catch (error) {
      console.error("Failed to delete image:", error);
      alert(error.message || t("profile.errors.imageDeleteFailed"));
    } finally {
      setIsUploadingImage(false);
    }
  };

  const handleSave = async () => {
    const newErrors = {};

    if (!formData.name || formData.name.trim().length < 2) {
      newErrors.name = t("profile.errors.nameRequired");
    }

    if (formData.specialty === "OTHER" && !formData.specialtyOther) {
      newErrors.specialtyOther = t("profile.errors.specialtyOtherRequired");
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsSaving(true);
    try {
      await profileService.updateProfile({
        name: formData.name.trim(),
        specialty: formData.specialty || null,
        specialtyOther: formData.specialtyOther || null,
        clinicName: formData.clinicName || null,
        labName: formData.labName || null,
      });

      onUpdate();
      setIsEditing(false);
      alert(t("profile.success.profileUpdated"));
    } catch (error) {
      console.error("Failed to update profile:", error);
      alert(error.message || t("profile.errors.updateFailed"));
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      name: profile?.name || "",
      specialty: profile?.specialty || "",
      specialtyOther: profile?.specialtyOther || "",
      clinicName: profile?.clinicName || "",
      labName: profile?.labName || "",
    });
    setErrors({});
    setIsEditing(false);
  };

  return (
    <div className="space-y-6">
      {/* Profile Image Section */}
      <div>
        <h3 className="text-lg font-semibold text-primary dark:text-light mb-4">
          {t("profile.sections.profileImage")}
        </h3>
        <div className="flex items-center gap-6">
          <div className="relative">
            <div className="w-32 h-32 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center overflow-hidden">
              {profile?.profileImageUrl ? (
                <img
                  src={profile.profileImageUrl}
                  alt={profile.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <svg
                  className="w-16 h-16 text-gray-400"
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
            {isUploadingImage && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full">
                <div className="w-8 h-8 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
              </div>
            )}
          </div>

          <div className="space-y-2">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploadingImage}
              className="px-4 py-2 bg-primary hover:bg-primary/90 dark:bg-accent dark:hover:bg-accent/90 text-light rounded-lg font-medium transition-all disabled:opacity-50"
            >
              {t("profile.buttons.uploadImage")}
            </button>
            {profile?.profileImageUrl && (
              <button
                onClick={handleDeleteImage}
                disabled={isUploadingImage}
                className="ml-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-all disabled:opacity-50"
              >
                {t("profile.buttons.deleteImage")}
              </button>
            )}
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {t("profile.hints.imageRequirements")}
            </p>
          </div>
        </div>
      </div>

      {/* Basic Information */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-primary dark:text-light">
            {t("profile.sections.basicInfo")}
          </h3>
          {!isEditing && (
            <button
              onClick={() => setIsEditing(true)}
              className="px-4 py-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-charcoal dark:text-light rounded-lg font-medium transition-all"
            >
              {t("profile.buttons.edit")}
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-charcoal dark:text-light mb-2">
              {t("profile.fields.name")}
              <span className="text-red-500 ml-1">*</span>
            </label>
            {isEditing ? (
              <input
                type="text"
                value={formData.name}
                onChange={(e) => handleChange("name", e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-charcoal dark:text-light focus:ring-2 focus:ring-accent focus:border-transparent transition-colors"
              />
            ) : (
              <p className="text-charcoal dark:text-light py-2.5">
                {profile?.name}
              </p>
            )}
            {errors.name && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                {errors.name}
              </p>
            )}
          </div>

          {/* Email (Read-only) */}
          <div>
            <label className="block text-sm font-medium text-charcoal dark:text-light mb-2">
              {t("profile.fields.email")}
            </label>
            <p className="text-charcoal dark:text-light py-2.5">
              {user?.email}
              {user?.emailVerified && (
                <span className="ml-2 px-2 py-0.5 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400 text-xs rounded">
                  {t("profile.status.verified")}
                </span>
              )}
            </p>
          </div>

          {/* Phone (Read-only) */}
          {user?.phoneNumber && (
            <div>
              <label className="block text-sm font-medium text-charcoal dark:text-light mb-2">
                {t("profile.fields.phone")}
              </label>
              <p className="text-charcoal dark:text-light py-2.5">
                {user.phoneNumber}
                {user?.phoneVerified && (
                  <span className="ml-2 px-2 py-0.5 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400 text-xs rounded">
                    {t("profile.status.verified")}
                  </span>
                )}
              </p>
            </div>
          )}

          {/* Client Type (Read-only) */}
          <div>
            <label className="block text-sm font-medium text-charcoal dark:text-light mb-2">
              {t("profile.fields.clientType")}
            </label>
            <p className="text-charcoal dark:text-light py-2.5">
              {t(`clientType.${profile?.clientType}`)}
            </p>
          </div>

          {/* Specialty (Doctors only) */}
          {profile?.clientType === "doctor" && (
            <>
              <div>
                <label className="block text-sm font-medium text-charcoal dark:text-light mb-2">
                  {t("profile.fields.specialty")}
                </label>
                {isEditing ? (
                  <select
                    value={formData.specialty}
                    onChange={(e) => handleChange("specialty", e.target.value)}
                    className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-charcoal dark:text-light focus:ring-2 focus:ring-accent focus:border-transparent transition-colors"
                  >
                    <option value="">
                      {t("profile.placeholders.selectSpecialty")}
                    </option>
                    {specialties.map((spec) => (
                      <option key={spec.value} value={spec.value}>
                        {spec.label}
                      </option>
                    ))}
                  </select>
                ) : (
                  <p className="text-charcoal dark:text-light py-2.5">
                    {profile?.specialty
                      ? t(`specialty.${profile.specialty.toLowerCase()}`)
                      : "-"}
                  </p>
                )}
              </div>

              {formData.specialty === "OTHER" && isEditing && (
                <div>
                  <label className="block text-sm font-medium text-charcoal dark:text-light mb-2">
                    {t("profile.fields.specialtyOther")}
                    <span className="text-red-500 ml-1">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.specialtyOther}
                    onChange={(e) =>
                      handleChange("specialtyOther", e.target.value)
                    }
                    className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-charcoal dark:text-light focus:ring-2 focus:ring-accent focus:border-transparent transition-colors"
                  />
                  {errors.specialtyOther && (
                    <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                      {errors.specialtyOther}
                    </p>
                  )}
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-charcoal dark:text-light mb-2">
                  {t("profile.fields.clinicName")}
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    value={formData.clinicName}
                    onChange={(e) => handleChange("clinicName", e.target.value)}
                    className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-charcoal dark:text-light focus:ring-2 focus:ring-accent focus:border-transparent transition-colors"
                  />
                ) : (
                  <p className="text-charcoal dark:text-light py-2.5">
                    {profile?.clinicName || "-"}
                  </p>
                )}
              </div>
            </>
          )}

          {/* Lab Name (Labs only) */}
          {profile?.clientType === "lab" && (
            <div>
              <label className="block text-sm font-medium text-charcoal dark:text-light mb-2">
                {t("profile.fields.labName")}
              </label>
              {isEditing ? (
                <input
                  type="text"
                  value={formData.labName}
                  onChange={(e) => handleChange("labName", e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-charcoal dark:text-light focus:ring-2 focus:ring-accent focus:border-transparent transition-colors"
                />
              ) : (
                <p className="text-charcoal dark:text-light py-2.5">
                  {profile?.labName || "-"}
                </p>
              )}
            </div>
          )}
        </div>

        {/* Action Buttons */}
        {isEditing && (
          <div className="flex gap-3 mt-6">
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="px-6 py-2.5 bg-primary hover:bg-primary/90 dark:bg-accent dark:hover:bg-accent/90 text-light rounded-lg font-medium transition-all disabled:opacity-50"
            >
              {isSaving ? t("common.saving") : t("common.save")}
            </button>
            <button
              onClick={handleCancel}
              disabled={isSaving}
              className="px-6 py-2.5 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-charcoal dark:text-light rounded-lg font-medium transition-all disabled:opacity-50"
            >
              {t("common.cancel")}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfileInfo;
