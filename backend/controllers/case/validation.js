export const validateCaseData = (data) => {
  const {
    procedureCategory,
    guideType,
    requiredService,
    implantSystem,
    implantSystemOther,
    isDraft,
  } = data;

  const errors = [];

  const validProcedureCategories = [
    "single_implant",
    "multiple_implant",
    "full_arch",
    "gbr",
    "other",
  ];

  const validGuideTypes = [
    "tooth_support",
    "tissue_support",
    "bone_support",
    "stackable",
    "hybrid",
    "other",
  ];

  const validRequiredServices = ["study_only", "full_solution"];

  const validImplantSystems = [
    "nobel_biocare",
    "straumann",
    "zimmer_biomet",
    "osstem",
    "hiossen",
    "dentium",
    "megagen",
    "bicon",
    "neodent",
    "other",
  ];

  if (!isDraft) {
    if (!procedureCategory) {
      errors.push("Procedure category is required");
    } else if (!validProcedureCategories.includes(procedureCategory)) {
      errors.push("Invalid procedure category");
    }

    if (!guideType) {
      errors.push("Guide type is required");
    } else if (!validGuideTypes.includes(guideType)) {
      errors.push("Invalid guide type");
    }

    if (!requiredService) {
      errors.push("Required service is required");
    } else if (!validRequiredServices.includes(requiredService)) {
      errors.push("Invalid required service");
    }
  } else {
    if (procedureCategory && !validProcedureCategories.includes(procedureCategory)) {
      errors.push("Invalid procedure category");
    }

    if (guideType && !validGuideTypes.includes(guideType)) {
      errors.push("Invalid guide type");
    }

    if (requiredService && !validRequiredServices.includes(requiredService)) {
      errors.push("Invalid required service");
    }
  }

  if (implantSystem) {
    if (!validImplantSystems.includes(implantSystem)) {
      errors.push("Invalid implant system");
    }

    if (implantSystem === "other" && !implantSystemOther) {
      errors.push("Please specify implant system");
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
};
