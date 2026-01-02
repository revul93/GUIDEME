import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import profileService from "../../services/profileService";

const AddressManager = ({ onUpdate }) => {
  const { t } = useTranslation();

  const [addresses, setAddresses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  const [formData, setFormData] = useState({
    label: "",
    country: "Saudi Arabia",
    city: "",
    district: "",
    street: "",
    building: "",
    postalCode: "",
    isDefault: false,
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    fetchAddresses();
  }, []);

  const fetchAddresses = async () => {
    setIsLoading(true);
    try {
      const data = await profileService.listAddresses();
      setAddresses(data || []);
    } catch (error) {
      console.error("Failed to fetch addresses:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      label: "",
      country: "Saudi Arabia",
      city: "",
      district: "",
      street: "",
      building: "",
      postalCode: "",
      isDefault: false,
    });
    setErrors({});
    setIsAdding(false);
    setEditingId(null);
  };

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

  const validateForm = () => {
    const newErrors = {};

    if (!formData.city || formData.city.trim().length === 0) {
      newErrors.city = t("profile.errors.cityRequired");
    }

    if (!formData.street || formData.street.trim().length === 0) {
      newErrors.street = t("profile.errors.streetRequired");
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleAdd = () => {
    setIsAdding(true);
    setEditingId(null);
  };

  const handleEdit = (address) => {
    setFormData({
      label: address.label || "",
      country: address.country || "Saudi Arabia",
      city: address.city || "",
      district: address.district || "",
      street: address.street || "",
      building: address.building || "",
      postalCode: address.postalCode || "",
      isDefault: address.isDefault || false,
    });
    setEditingId(address.id);
    setIsAdding(false);
  };

  const handleSave = async () => {
    if (!validateForm()) return;

    setIsSaving(true);
    try {
      if (editingId) {
        // Update existing
        await profileService.updateAddress(editingId, formData);
        alert(t("profile.success.addressUpdated"));
      } else {
        // Add new
        await profileService.addAddress(formData);
        alert(t("profile.success.addressAdded"));
      }

      fetchAddresses();
      resetForm();
      onUpdate();
    } catch (error) {
      console.error("Failed to save address:", error);
      alert(error.message || t("profile.errors.addressSaveFailed"));
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm(t("profile.confirm.deleteAddress"))) return;

    try {
      await profileService.deleteAddress(id);
      alert(t("profile.success.addressDeleted"));
      fetchAddresses();
      onUpdate();
    } catch (error) {
      console.error("Failed to delete address:", error);
      alert(error.message || t("profile.errors.addressDeleteFailed"));
    }
  };

  const handleSetDefault = async (id) => {
    try {
      await profileService.setDefaultAddress(id);
      alert(t("profile.success.defaultAddressSet"));
      fetchAddresses();
      onUpdate();
    } catch (error) {
      console.error("Failed to set default:", error);
      alert(error.message || t("profile.errors.setDefaultFailed"));
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="w-8 h-8 border-4 border-primary dark:border-accent border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-primary dark:text-light">
            {t("profile.sections.addresses")}
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            {t("profile.hints.maxAddresses")}
          </p>
        </div>
        {!isAdding && !editingId && addresses.length < 5 && (
          <button
            onClick={handleAdd}
            className="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary/90 dark:bg-accent dark:hover:bg-accent/90 text-light rounded-lg font-medium transition-all"
          >
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
                d="M12 4v16m8-8H4"
              />
            </svg>
            {t("profile.buttons.addAddress")}
          </button>
        )}
      </div>

      {/* Add/Edit Form */}
      {(isAdding || editingId) && (
        <div className="bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
          <h4 className="text-md font-semibold text-charcoal dark:text-light mb-4">
            {editingId
              ? t("profile.labels.editAddress")
              : t("profile.labels.addNewAddress")}
          </h4>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Label */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-charcoal dark:text-light mb-2">
                {t("profile.fields.addressLabel")}
              </label>
              <input
                type="text"
                value={formData.label}
                onChange={(e) => handleChange("label", e.target.value)}
                placeholder={t("profile.placeholders.addressLabel")}
                className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-charcoal dark:text-light focus:ring-2 focus:ring-accent focus:border-transparent transition-colors"
              />
            </div>

            {/* Country */}
            <div>
              <label className="block text-sm font-medium text-charcoal dark:text-light mb-2">
                {t("profile.fields.country")}
              </label>
              <input
                type="text"
                value={formData.country}
                onChange={(e) => handleChange("country", e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-charcoal dark:text-light focus:ring-2 focus:ring-accent focus:border-transparent transition-colors"
              />
            </div>

            {/* City */}
            <div>
              <label className="block text-sm font-medium text-charcoal dark:text-light mb-2">
                {t("profile.fields.city")}
                <span className="text-red-500 ml-1">*</span>
              </label>
              <input
                type="text"
                value={formData.city}
                onChange={(e) => handleChange("city", e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-charcoal dark:text-light focus:ring-2 focus:ring-accent focus:border-transparent transition-colors"
              />
              {errors.city && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                  {errors.city}
                </p>
              )}
            </div>

            {/* District */}
            <div>
              <label className="block text-sm font-medium text-charcoal dark:text-light mb-2">
                {t("profile.fields.district")}
              </label>
              <input
                type="text"
                value={formData.district}
                onChange={(e) => handleChange("district", e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-charcoal dark:text-light focus:ring-2 focus:ring-accent focus:border-transparent transition-colors"
              />
            </div>

            {/* Street */}
            <div>
              <label className="block text-sm font-medium text-charcoal dark:text-light mb-2">
                {t("profile.fields.street")}
                <span className="text-red-500 ml-1">*</span>
              </label>
              <input
                type="text"
                value={formData.street}
                onChange={(e) => handleChange("street", e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-charcoal dark:text-light focus:ring-2 focus:ring-accent focus:border-transparent transition-colors"
              />
              {errors.street && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                  {errors.street}
                </p>
              )}
            </div>

            {/* Building */}
            <div>
              <label className="block text-sm font-medium text-charcoal dark:text-light mb-2">
                {t("profile.fields.building")}
              </label>
              <input
                type="text"
                value={formData.building}
                onChange={(e) => handleChange("building", e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-charcoal dark:text-light focus:ring-2 focus:ring-accent focus:border-transparent transition-colors"
              />
            </div>

            {/* Postal Code */}
            <div>
              <label className="block text-sm font-medium text-charcoal dark:text-light mb-2">
                {t("profile.fields.postalCode")}
              </label>
              <input
                type="text"
                value={formData.postalCode}
                onChange={(e) => handleChange("postalCode", e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-charcoal dark:text-light focus:ring-2 focus:ring-accent focus:border-transparent transition-colors"
              />
            </div>

            {/* Is Default */}
            <div className="md:col-span-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.isDefault}
                  onChange={(e) => handleChange("isDefault", e.target.checked)}
                  className="w-5 h-5 text-primary dark:text-accent focus:ring-accent border-gray-300 dark:border-gray-700 rounded"
                />
                <span className="text-sm font-medium text-charcoal dark:text-light">
                  {t("profile.fields.setAsDefault")}
                </span>
              </label>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 mt-6">
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="px-6 py-2.5 bg-primary hover:bg-primary/90 dark:bg-accent dark:hover:bg-accent/90 text-light rounded-lg font-medium transition-all disabled:opacity-50"
            >
              {isSaving ? t("common.saving") : t("common.save")}
            </button>
            <button
              onClick={resetForm}
              disabled={isSaving}
              className="px-6 py-2.5 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-charcoal dark:text-light rounded-lg font-medium transition-all disabled:opacity-50"
            >
              {t("common.cancel")}
            </button>
          </div>
        </div>
      )}

      {/* Addresses List */}
      {addresses.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 dark:bg-gray-900 rounded-lg">
          <svg
            className="mx-auto h-12 w-12 text-gray-400"
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
          <h3 className="mt-2 text-sm font-medium text-charcoal dark:text-light">
            {t("profile.empty.noAddresses")}
          </h3>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            {t("profile.empty.addFirstAddress")}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {addresses.map((address) => (
            <div
              key={address.id}
              className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg p-4"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-semibold text-charcoal dark:text-light">
                      {address.label || t("profile.labels.address")}
                    </h4>
                    {address.isDefault && (
                      <span className="px-2 py-0.5 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400 text-xs rounded">
                        {t("common.default")}
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-charcoal dark:text-gray-400">
                    {address.street}, {address.city}
                    {address.district && `, ${address.district}`}
                  </p>
                  {address.building && (
                    <p className="text-sm text-gray-500 dark:text-gray-500">
                      {t("profile.fields.building")}: {address.building}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex gap-2">
                {!address.isDefault && (
                  <button
                    onClick={() => handleSetDefault(address.id)}
                    className="text-sm text-primary dark:text-accent hover:underline"
                  >
                    {t("profile.buttons.setDefault")}
                  </button>
                )}
                <button
                  onClick={() => handleEdit(address)}
                  className="text-sm text-primary dark:text-accent hover:underline"
                >
                  {t("common.edit")}
                </button>
                <button
                  onClick={() => handleDelete(address.id)}
                  className="text-sm text-red-600 dark:text-red-400 hover:underline"
                >
                  {t("common.delete")}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AddressManager;
