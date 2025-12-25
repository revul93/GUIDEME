export const validateCaseData = (data) => {
  const errors = {};

  // Required fields
  if (!data.procedureCategory) {
    errors.procedureCategory = "Procedure category is required";
  }

  if (!data.guideType) {
    errors.guideType = "Guide type is required";
  }

  if (!data.requiredService) {
    errors.requiredService = "Required service is required";
  }

  // Validate teeth numbers for specific procedure categories
  if (["single_implant", "multiple_implant"].includes(data.procedureCategory)) {
    if (!data.teethNumbers || data.teethNumbers.length === 0) {
      errors.teethNumbers = "Teeth selection is required for this procedure";
    }
  }

  // Validate delivery details for full solution
  if (data.requiredService === "full_solution") {
    if (!data.deliveryMethod) {
      errors.deliveryMethod = "Delivery method is required for full solution";
    }

    if (data.deliveryMethod === "delivery" && !data.deliveryAddressId) {
      errors.deliveryAddressId = "Delivery address is required";
    }

    if (data.deliveryMethod === "pickup" && !data.pickupBranchId) {
      errors.pickupBranchId = "Pickup branch is required";
    }
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors,
  };
};
