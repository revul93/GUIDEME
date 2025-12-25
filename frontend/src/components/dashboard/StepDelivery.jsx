import { useTranslation } from "react-i18next";

const StepDelivery = ({ formData, updateFormData, addresses, branches, errors }) => {
  const { t } = useTranslation();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-primary dark:text-light mb-2">
          {t("newCase.delivery.title")}
        </h2>
        <p className="text-charcoal dark:text-gray-400">
          {t("newCase.delivery.subtitle")}
        </p>
      </div>

      {/* Delivery Method */}
      <div>
        <label className="block text-sm font-medium text-charcoal dark:text-light mb-3">
          {t("newCase.fields.deliveryMethod")}
          <span className="text-red-500 ml-1">*</span>
        </label>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Delivery Option */}
          <button
            type="button"
            onClick={() => updateFormData("deliveryMethod", "delivery")}
            className={`p-6 rounded-lg border-2 text-left transition-all ${
              formData.deliveryMethod === "delivery"
                ? "border-primary dark:border-accent bg-primary/10 dark:bg-accent/20"
                : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600"
            }`}
          >
            <div className="flex items-center gap-3 mb-2">
              <svg className={`w-6 h-6 ${
                formData.deliveryMethod === "delivery"
                  ? "text-primary dark:text-accent"
                  : "text-charcoal dark:text-gray-400"
              }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
              </svg>
              <h3 className={`text-lg font-semibold ${
                formData.deliveryMethod === "delivery"
                  ? "text-primary dark:text-accent"
                  : "text-charcoal dark:text-light"
              }`}>
                {t("newCase.delivery.deliveryToAddress")}
              </h3>
            </div>
            <p className="text-sm text-charcoal dark:text-gray-400">
              {t("newCase.delivery.deliveryDesc")}
            </p>
          </button>

          {/* Pickup Option */}
          <button
            type="button"
            onClick={() => updateFormData("deliveryMethod", "pickup")}
            className={`p-6 rounded-lg border-2 text-left transition-all ${
              formData.deliveryMethod === "pickup"
                ? "border-primary dark:border-accent bg-primary/10 dark:bg-accent/20"
                : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600"
            }`}
          >
            <div className="flex items-center gap-3 mb-2">
              <svg className={`w-6 h-6 ${
                formData.deliveryMethod === "pickup"
                  ? "text-primary dark:text-accent"
                  : "text-charcoal dark:text-gray-400"
              }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
              <h3 className={`text-lg font-semibold ${
                formData.deliveryMethod === "pickup"
                  ? "text-primary dark:text-accent"
                  : "text-charcoal dark:text-light"
              }`}>
                {t("newCase.delivery.pickupFromBranch")}
              </h3>
            </div>
            <p className="text-sm text-charcoal dark:text-gray-400">
              {t("newCase.delivery.pickupDesc")}
            </p>
          </button>
        </div>
        {errors.deliveryMethod && (
          <p className="mt-2 text-sm text-red-600 dark:text-red-400">
            {errors.deliveryMethod}
          </p>
        )}
      </div>

      {/* Delivery Address Selection */}
      {formData.deliveryMethod === "delivery" && (
        <div>
          <label className="block text-sm font-medium text-charcoal dark:text-light mb-3">
            {t("newCase.fields.deliveryAddress")}
            <span className="text-red-500 ml-1">*</span>
          </label>
          
          {addresses.length === 0 ? (
            <div className="p-6 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-900 text-center">
              <svg className="w-12 h-12 text-gray-400 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <p className="text-charcoal dark:text-light font-medium mb-2">
                {t("newCase.delivery.noAddresses")}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                {t("newCase.delivery.addAddressFirst")}
              </p>
              <button
                onClick={() => window.location.href = "/dashboard/profile"}
                className="px-4 py-2 bg-primary hover:bg-primary/90 dark:bg-accent dark:hover:bg-accent/90 text-light rounded-lg font-medium transition-all"
              >
                {t("newCase.delivery.addAddress")}
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {addresses.map((address) => (
                <button
                  key={address.id}
                  type="button"
                  onClick={() => updateFormData("deliveryAddressId", address.id)}
                  className={`w-full p-4 rounded-lg border-2 text-left transition-all ${
                    formData.deliveryAddressId === address.id
                      ? "border-primary dark:border-accent bg-primary/10 dark:bg-accent/20"
                      : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600"
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <p className={`font-medium mb-1 ${
                        formData.deliveryAddressId === address.id
                          ? "text-primary dark:text-accent"
                          : "text-charcoal dark:text-light"
                      }`}>
                        {address.label}
                        {address.isDefault && (
                          <span className="ml-2 px-2 py-0.5 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400 text-xs rounded">
                            {t("common.default")}
                          </span>
                        )}
                      </p>
                      <p className="text-sm text-charcoal dark:text-gray-400">
                        {address.street}, {address.city}
                      </p>
                      {address.phone && (
                        <p className="text-sm text-gray-500 dark:text-gray-500 mt-1">
                          {address.phone}
                        </p>
                      )}
                    </div>
                    {formData.deliveryAddressId === address.id && (
                      <svg className="w-6 h-6 text-primary dark:text-accent flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    )}
                  </div>
                </button>
              ))}
            </div>
          )}
          {errors.deliveryAddressId && (
            <p className="mt-2 text-sm text-red-600 dark:text-red-400">
              {errors.deliveryAddressId}
            </p>
          )}
        </div>
      )}

      {/* Pickup Branch Selection */}
      {formData.deliveryMethod === "pickup" && (
        <div>
          <label className="block text-sm font-medium text-charcoal dark:text-light mb-3">
            {t("newCase.fields.pickupBranch")}
            <span className="text-red-500 ml-1">*</span>
          </label>
          <div className="space-y-3">
            {branches.map((branch) => (
              <button
                key={branch.id}
                type="button"
                onClick={() => updateFormData("pickupBranchId", branch.id)}
                className={`w-full p-4 rounded-lg border-2 text-left transition-all ${
                  formData.pickupBranchId === branch.id
                    ? "border-primary dark:border-accent bg-primary/10 dark:bg-accent/20"
                    : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600"
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className={`font-medium mb-1 ${
                      formData.pickupBranchId === branch.id
                        ? "text-primary dark:text-accent"
                        : "text-charcoal dark:text-light"
                    }`}>
                      {branch.name}
                    </p>
                    <p className="text-sm text-charcoal dark:text-gray-400">
                      {branch.address}
                    </p>
                    {branch.phone && (
                      <p className="text-sm text-gray-500 dark:text-gray-500 mt-1">
                        {branch.phone}
                      </p>
                    )}
                  </div>
                  {formData.pickupBranchId === branch.id && (
                    <svg className="w-6 h-6 text-primary dark:text-accent flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  )}
                </div>
              </button>
            ))}
          </div>
          {errors.pickupBranchId && (
            <p className="mt-2 text-sm text-red-600 dark:text-red-400">
              {errors.pickupBranchId}
            </p>
          )}
        </div>
      )}
    </div>
  );
};

export default StepDelivery;
