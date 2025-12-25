import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";

const TeethChart = ({
  selectedTeeth,
  onSelect,
  isSingleSelect,
  error,
  language,
}) => {
  const { t } = useTranslation();
  const [hoveredTooth, setHoveredTooth] = useState(null);

  // Tooth names for tooltip
  const toothNames = {
    // Upper Right (1st quadrant)
    11: { en: "Central Incisor", ar: "القاطعة المركزية", type: "I" },
    12: { en: "Lateral Incisor", ar: "القاطعة الجانبية", type: "I" },
    13: { en: "Canine", ar: "الناب", type: "C" },
    14: { en: "First Premolar", ar: "الضاحك الأول", type: "P" },
    15: { en: "Second Premolar", ar: "الضاحك الثاني", type: "P" },
    16: { en: "First Molar", ar: "الضرس الأول", type: "M" },
    17: { en: "Second Molar", ar: "الضرس الثاني", type: "M" },
    18: { en: "Third Molar", ar: "ضرس العقل", type: "M" },
    // Upper Left (2nd quadrant)
    21: { en: "Central Incisor", ar: "القاطعة المركزية", type: "I" },
    22: { en: "Lateral Incisor", ar: "القاطعة الجانبية", type: "I" },
    23: { en: "Canine", ar: "الناب", type: "C" },
    24: { en: "First Premolar", ar: "الضاحك الأول", type: "P" },
    25: { en: "Second Premolar", ar: "الضاحك الثاني", type: "P" },
    26: { en: "First Molar", ar: "الضرس الأول", type: "M" },
    27: { en: "Second Molar", ar: "الضرس الثاني", type: "M" },
    28: { en: "Third Molar", ar: "ضرس العقل", type: "M" },
    // Lower Left (3rd quadrant)
    31: { en: "Central Incisor", ar: "القاطعة المركزية", type: "I" },
    32: { en: "Lateral Incisor", ar: "القاطعة الجانبية", type: "I" },
    33: { en: "Canine", ar: "الناب", type: "C" },
    34: { en: "First Premolar", ar: "الضاحك الأول", type: "P" },
    35: { en: "Second Premolar", ar: "الضاحك الثاني", type: "P" },
    36: { en: "First Molar", ar: "الضرس الأول", type: "M" },
    37: { en: "Second Molar", ar: "الضرس الثاني", type: "M" },
    38: { en: "Third Molar", ar: "ضرس العقل", type: "M" },
    // Lower Right (4th quadrant)
    41: { en: "Central Incisor", ar: "القاطعة المركزية", type: "I" },
    42: { en: "Lateral Incisor", ar: "القاطعة الجانبية", type: "I" },
    43: { en: "Canine", ar: "الناب", type: "C" },
    44: { en: "First Premolar", ar: "الضاحك الأول", type: "P" },
    45: { en: "Second Premolar", ar: "الضاحك الثاني", type: "P" },
    46: { en: "First Molar", ar: "الضرس الأول", type: "M" },
    47: { en: "Second Molar", ar: "الضرس الثاني", type: "M" },
    48: { en: "Third Molar", ar: "ضرس العقل", type: "M" },
  };

  const handleToothClick = (toothNumber) => {
    const toothStr = toothNumber.toString();

    if (isSingleSelect) {
      if (selectedTeeth.includes(toothStr)) {
        onSelect([]);
      } else {
        onSelect([toothStr]);
      }
    } else {
      if (selectedTeeth.includes(toothStr)) {
        onSelect(selectedTeeth.filter((t) => t !== toothStr));
      } else {
        onSelect([...selectedTeeth, toothStr]);
      }
    }
  };

  const isSelected = (toothNumber) =>
    selectedTeeth.includes(toothNumber.toString());

  // Type colors for legend
  const typeColors = {
    I: "#9333ea", // Purple - Incisors
    C: "#f59e0b", // Amber - Canines
    P: "#22c55e", // Green - Premolars
    M: "#3b82f6", // Blue - Molars
  };

  // Get fill color for tooth
  const getToothFill = (toothNumber) => {
    if (isSelected(toothNumber)) {
      return "#0ea5e9"; // Selected - sky blue
    }
    if (hoveredTooth === toothNumber) {
      return "#e0f2fe"; // Hovered - light blue
    }
    return "#f5f5f4"; // Default - warm white
  };

  // Get stroke color for tooth
  const getToothStroke = (toothNumber) => {
    if (isSelected(toothNumber)) {
      return "#0284c7"; // Selected
    }
    if (hoveredTooth === toothNumber) {
      return "#38bdf8"; // Hovered
    }
    return "#d4d4d4"; // Default
  };

  // Get number color
  const getNumberColor = (toothNumber) => {
    const type = toothNames[toothNumber]?.type;
    return typeColors[type] || "#666";
  };

  return (
    <div className="border border-gray-200 dark:border-gray-700 rounded-xl p-4 sm:p-6 bg-white dark:bg-gray-900">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
          {t("newCase.fields.teethSelection", "Select Teeth")}
          <span className="text-red-500">*</span>
        </h3>
        {selectedTeeth.length > 0 && (
          <span className="text-sm text-primary dark:text-secondary font-medium">
            {selectedTeeth.length} {t("newCase.teethSelected", "selected")}
          </span>
        )}
      </div>

      {/* Instructions */}
      <div className="flex items-start gap-2 mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
        <InfoOutlinedIcon className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
        <p className="text-sm text-blue-700 dark:text-blue-300">
          {isSingleSelect
            ? t(
                "newCase.hints.singleToothSelect",
                "Click on a tooth to select it for single implant"
              )
            : t(
                "newCase.hints.multipleTeethSelect",
                "Click on teeth to select/deselect for multiple implants"
              )}
        </p>
      </div>

      {/* SVG Dental Chart */}
      <div className="relative overflow-x-auto pb-4">
        <svg
          viewBox="0 0 500 420"
          className="w-full max-w-lg mx-auto"
          style={{ minWidth: "320px" }}
        >
          {/* Background */}
          <rect width="500" height="420" fill="transparent" />

          {/* Upper Jaw Label */}
          <text
            x="450"
            y="30"
            fontSize="12"
            fill="#666"
            textAnchor="end"
            className="font-medium"
          >
            {language === "ar" ? "الفك العلوي" : "Upper jaw"}
          </text>

          {/* Upper Jaw Gum */}
          <path
            d="M 100,140 
               Q 100,50 250,45 
               Q 400,50 400,140
               L 400,150
               Q 400,90 250,85
               Q 100,90 100,150
               Z"
            fill="#c4a69d"
            stroke="#b39990"
            strokeWidth="1"
          />

          {/* Upper Teeth */}
          {/* Right side (18-11) */}
          <ToothShape
            number={18}
            x={108}
            y={115}
            type="molar"
            rotation={-40}
            isSelected={isSelected(18)}
            isHovered={hoveredTooth === 18}
            onClick={() => handleToothClick(18)}
            onMouseEnter={() => setHoveredTooth(18)}
            onMouseLeave={() => setHoveredTooth(null)}
            numberColor={getNumberColor(18)}
          />
          <ToothShape
            number={17}
            x={128}
            y={95}
            type="molar"
            rotation={-30}
            isSelected={isSelected(17)}
            isHovered={hoveredTooth === 17}
            onClick={() => handleToothClick(17)}
            onMouseEnter={() => setHoveredTooth(17)}
            onMouseLeave={() => setHoveredTooth(null)}
            numberColor={getNumberColor(17)}
          />
          <ToothShape
            number={16}
            x={148}
            y={78}
            type="molar"
            rotation={-20}
            isSelected={isSelected(16)}
            isHovered={hoveredTooth === 16}
            onClick={() => handleToothClick(16)}
            onMouseEnter={() => setHoveredTooth(16)}
            onMouseLeave={() => setHoveredTooth(null)}
            numberColor={getNumberColor(16)}
          />
          <ToothShape
            number={15}
            x={168}
            y={65}
            type="premolar"
            rotation={-12}
            isSelected={isSelected(15)}
            isHovered={hoveredTooth === 15}
            onClick={() => handleToothClick(15)}
            onMouseEnter={() => setHoveredTooth(15)}
            onMouseLeave={() => setHoveredTooth(null)}
            numberColor={getNumberColor(15)}
          />
          <ToothShape
            number={14}
            x={188}
            y={55}
            type="premolar"
            rotation={-6}
            isSelected={isSelected(14)}
            isHovered={hoveredTooth === 14}
            onClick={() => handleToothClick(14)}
            onMouseEnter={() => setHoveredTooth(14)}
            onMouseLeave={() => setHoveredTooth(null)}
            numberColor={getNumberColor(14)}
          />
          <ToothShape
            number={13}
            x={208}
            y={50}
            type="canine"
            rotation={-3}
            isSelected={isSelected(13)}
            isHovered={hoveredTooth === 13}
            onClick={() => handleToothClick(13)}
            onMouseEnter={() => setHoveredTooth(13)}
            onMouseLeave={() => setHoveredTooth(null)}
            numberColor={getNumberColor(13)}
          />
          <ToothShape
            number={12}
            x={228}
            y={47}
            type="incisor"
            rotation={0}
            isSelected={isSelected(12)}
            isHovered={hoveredTooth === 12}
            onClick={() => handleToothClick(12)}
            onMouseEnter={() => setHoveredTooth(12)}
            onMouseLeave={() => setHoveredTooth(null)}
            numberColor={getNumberColor(12)}
          />
          <ToothShape
            number={11}
            x={245}
            y={45}
            type="incisor-central"
            rotation={0}
            isSelected={isSelected(11)}
            isHovered={hoveredTooth === 11}
            onClick={() => handleToothClick(11)}
            onMouseEnter={() => setHoveredTooth(11)}
            onMouseLeave={() => setHoveredTooth(null)}
            numberColor={getNumberColor(11)}
          />

          {/* Left side (21-28) */}
          <ToothShape
            number={21}
            x={265}
            y={45}
            type="incisor-central"
            rotation={0}
            isSelected={isSelected(21)}
            isHovered={hoveredTooth === 21}
            onClick={() => handleToothClick(21)}
            onMouseEnter={() => setHoveredTooth(21)}
            onMouseLeave={() => setHoveredTooth(null)}
            numberColor={getNumberColor(21)}
          />
          <ToothShape
            number={22}
            x={285}
            y={47}
            type="incisor"
            rotation={0}
            isSelected={isSelected(22)}
            isHovered={hoveredTooth === 22}
            onClick={() => handleToothClick(22)}
            onMouseEnter={() => setHoveredTooth(22)}
            onMouseLeave={() => setHoveredTooth(null)}
            numberColor={getNumberColor(22)}
          />
          <ToothShape
            number={23}
            x={305}
            y={50}
            type="canine"
            rotation={3}
            isSelected={isSelected(23)}
            isHovered={hoveredTooth === 23}
            onClick={() => handleToothClick(23)}
            onMouseEnter={() => setHoveredTooth(23)}
            onMouseLeave={() => setHoveredTooth(null)}
            numberColor={getNumberColor(23)}
          />
          <ToothShape
            number={24}
            x={325}
            y={55}
            type="premolar"
            rotation={6}
            isSelected={isSelected(24)}
            isHovered={hoveredTooth === 24}
            onClick={() => handleToothClick(24)}
            onMouseEnter={() => setHoveredTooth(24)}
            onMouseLeave={() => setHoveredTooth(null)}
            numberColor={getNumberColor(24)}
          />
          <ToothShape
            number={25}
            x={345}
            y={65}
            type="premolar"
            rotation={12}
            isSelected={isSelected(25)}
            isHovered={hoveredTooth === 25}
            onClick={() => handleToothClick(25)}
            onMouseEnter={() => setHoveredTooth(25)}
            onMouseLeave={() => setHoveredTooth(null)}
            numberColor={getNumberColor(25)}
          />
          <ToothShape
            number={26}
            x={365}
            y={78}
            type="molar"
            rotation={20}
            isSelected={isSelected(26)}
            isHovered={hoveredTooth === 26}
            onClick={() => handleToothClick(26)}
            onMouseEnter={() => setHoveredTooth(26)}
            onMouseLeave={() => setHoveredTooth(null)}
            numberColor={getNumberColor(26)}
          />
          <ToothShape
            number={27}
            x={385}
            y={95}
            type="molar"
            rotation={30}
            isSelected={isSelected(27)}
            isHovered={hoveredTooth === 27}
            onClick={() => handleToothClick(27)}
            onMouseEnter={() => setHoveredTooth(27)}
            onMouseLeave={() => setHoveredTooth(null)}
            numberColor={getNumberColor(27)}
          />
          <ToothShape
            number={28}
            x={405}
            y={115}
            type="molar"
            rotation={40}
            isSelected={isSelected(28)}
            isHovered={hoveredTooth === 28}
            onClick={() => handleToothClick(28)}
            onMouseEnter={() => setHoveredTooth(28)}
            onMouseLeave={() => setHoveredTooth(null)}
            numberColor={getNumberColor(28)}
          />

          {/* Side Labels */}
          <text x="70" y="200" fontSize="11" fill="#888" textAnchor="middle">
            {language === "ar" ? "يمين" : "Right"}
          </text>
          <text x="70" y="215" fontSize="11" fill="#888" textAnchor="middle">
            {language === "ar" ? "" : "Side"}
          </text>
          <text x="430" y="200" fontSize="11" fill="#888" textAnchor="middle">
            {language === "ar" ? "يسار" : "Left"}
          </text>
          <text x="430" y="215" fontSize="11" fill="#888" textAnchor="middle">
            {language === "ar" ? "" : "Side"}
          </text>

          {/* Lower Jaw Label */}
          <text
            x="450"
            y="395"
            fontSize="12"
            fill="#666"
            textAnchor="end"
            className="font-medium"
          >
            {language === "ar" ? "الفك السفلي" : "Lower jaw"}
          </text>

          {/* Lower Jaw Gum */}
          <path
            d="M 100,270 
               Q 100,260 250,265
               Q 400,260 400,270
               L 400,280
               Q 400,340 250,355
               Q 100,340 100,280
               Z"
            fill="#c4a69d"
            stroke="#b39990"
            strokeWidth="1"
          />

          {/* Lower Teeth */}
          {/* Right side (48-41) */}
          <ToothShape
            number={48}
            x={108}
            y={280}
            type="molar"
            rotation={40}
            flip
            isSelected={isSelected(48)}
            isHovered={hoveredTooth === 48}
            onClick={() => handleToothClick(48)}
            onMouseEnter={() => setHoveredTooth(48)}
            onMouseLeave={() => setHoveredTooth(null)}
            numberColor={getNumberColor(48)}
          />
          <ToothShape
            number={47}
            x={128}
            y={300}
            type="molar"
            rotation={30}
            flip
            isSelected={isSelected(47)}
            isHovered={hoveredTooth === 47}
            onClick={() => handleToothClick(47)}
            onMouseEnter={() => setHoveredTooth(47)}
            onMouseLeave={() => setHoveredTooth(null)}
            numberColor={getNumberColor(47)}
          />
          <ToothShape
            number={46}
            x={148}
            y={318}
            type="molar"
            rotation={20}
            flip
            isSelected={isSelected(46)}
            isHovered={hoveredTooth === 46}
            onClick={() => handleToothClick(46)}
            onMouseEnter={() => setHoveredTooth(46)}
            onMouseLeave={() => setHoveredTooth(null)}
            numberColor={getNumberColor(46)}
          />
          <ToothShape
            number={45}
            x={170}
            y={332}
            type="premolar"
            rotation={12}
            flip
            isSelected={isSelected(45)}
            isHovered={hoveredTooth === 45}
            onClick={() => handleToothClick(45)}
            onMouseEnter={() => setHoveredTooth(45)}
            onMouseLeave={() => setHoveredTooth(null)}
            numberColor={getNumberColor(45)}
          />
          <ToothShape
            number={44}
            x={192}
            y={342}
            type="premolar"
            rotation={6}
            flip
            isSelected={isSelected(44)}
            isHovered={hoveredTooth === 44}
            onClick={() => handleToothClick(44)}
            onMouseEnter={() => setHoveredTooth(44)}
            onMouseLeave={() => setHoveredTooth(null)}
            numberColor={getNumberColor(44)}
          />
          <ToothShape
            number={43}
            x={212}
            y={348}
            type="canine"
            rotation={3}
            flip
            isSelected={isSelected(43)}
            isHovered={hoveredTooth === 43}
            onClick={() => handleToothClick(43)}
            onMouseEnter={() => setHoveredTooth(43)}
            onMouseLeave={() => setHoveredTooth(null)}
            numberColor={getNumberColor(43)}
          />
          <ToothShape
            number={42}
            x={230}
            y={352}
            type="incisor-lower"
            rotation={0}
            flip
            isSelected={isSelected(42)}
            isHovered={hoveredTooth === 42}
            onClick={() => handleToothClick(42)}
            onMouseEnter={() => setHoveredTooth(42)}
            onMouseLeave={() => setHoveredTooth(null)}
            numberColor={getNumberColor(42)}
          />
          <ToothShape
            number={41}
            x={245}
            y={354}
            type="incisor-lower"
            rotation={0}
            flip
            isSelected={isSelected(41)}
            isHovered={hoveredTooth === 41}
            onClick={() => handleToothClick(41)}
            onMouseEnter={() => setHoveredTooth(41)}
            onMouseLeave={() => setHoveredTooth(null)}
            numberColor={getNumberColor(41)}
          />

          {/* Left side (31-38) */}
          <ToothShape
            number={31}
            x={260}
            y={354}
            type="incisor-lower"
            rotation={0}
            flip
            isSelected={isSelected(31)}
            isHovered={hoveredTooth === 31}
            onClick={() => handleToothClick(31)}
            onMouseEnter={() => setHoveredTooth(31)}
            onMouseLeave={() => setHoveredTooth(null)}
            numberColor={getNumberColor(31)}
          />
          <ToothShape
            number={32}
            x={275}
            y={352}
            type="incisor-lower"
            rotation={0}
            flip
            isSelected={isSelected(32)}
            isHovered={hoveredTooth === 32}
            onClick={() => handleToothClick(32)}
            onMouseEnter={() => setHoveredTooth(32)}
            onMouseLeave={() => setHoveredTooth(null)}
            numberColor={getNumberColor(32)}
          />
          <ToothShape
            number={33}
            x={293}
            y={348}
            type="canine"
            rotation={-3}
            flip
            isSelected={isSelected(33)}
            isHovered={hoveredTooth === 33}
            onClick={() => handleToothClick(33)}
            onMouseEnter={() => setHoveredTooth(33)}
            onMouseLeave={() => setHoveredTooth(null)}
            numberColor={getNumberColor(33)}
          />
          <ToothShape
            number={34}
            x={313}
            y={342}
            type="premolar"
            rotation={-6}
            flip
            isSelected={isSelected(34)}
            isHovered={hoveredTooth === 34}
            onClick={() => handleToothClick(34)}
            onMouseEnter={() => setHoveredTooth(34)}
            onMouseLeave={() => setHoveredTooth(null)}
            numberColor={getNumberColor(34)}
          />
          <ToothShape
            number={35}
            x={335}
            y={332}
            type="premolar"
            rotation={-12}
            flip
            isSelected={isSelected(35)}
            isHovered={hoveredTooth === 35}
            onClick={() => handleToothClick(35)}
            onMouseEnter={() => setHoveredTooth(35)}
            onMouseLeave={() => setHoveredTooth(null)}
            numberColor={getNumberColor(35)}
          />
          <ToothShape
            number={36}
            x={358}
            y={318}
            type="molar"
            rotation={-20}
            flip
            isSelected={isSelected(36)}
            isHovered={hoveredTooth === 36}
            onClick={() => handleToothClick(36)}
            onMouseEnter={() => setHoveredTooth(36)}
            onMouseLeave={() => setHoveredTooth(null)}
            numberColor={getNumberColor(36)}
          />
          <ToothShape
            number={37}
            x={380}
            y={300}
            type="molar"
            rotation={-30}
            flip
            isSelected={isSelected(37)}
            isHovered={hoveredTooth === 37}
            onClick={() => handleToothClick(37)}
            onMouseEnter={() => setHoveredTooth(37)}
            onMouseLeave={() => setHoveredTooth(null)}
            numberColor={getNumberColor(37)}
          />
          <ToothShape
            number={38}
            x={400}
            y={280}
            type="molar"
            rotation={-40}
            flip
            isSelected={isSelected(38)}
            isHovered={hoveredTooth === 38}
            onClick={() => handleToothClick(38)}
            onMouseEnter={() => setHoveredTooth(38)}
            onMouseLeave={() => setHoveredTooth(null)}
            numberColor={getNumberColor(38)}
          />

          {/* Legend */}
          <g transform="translate(20, 380)">
            <text x="0" y="0" fontSize="10" fill="#9333ea" fontWeight="600">
              I - {language === "ar" ? "القواطع" : "Incisors"}
            </text>
            <text x="0" y="14" fontSize="10" fill="#f59e0b" fontWeight="600">
              C - {language === "ar" ? "الأنياب" : "Canines"}
            </text>
            <text x="90" y="0" fontSize="10" fill="#22c55e" fontWeight="600">
              P - {language === "ar" ? "الضواحك" : "Premolars"}
            </text>
            <text x="90" y="14" fontSize="10" fill="#3b82f6" fontWeight="600">
              M - {language === "ar" ? "الأضراس" : "Molars"}
            </text>
          </g>
        </svg>

        {/* Tooltip */}
        {hoveredTooth && (
          <div className="absolute top-2 left-1/2 -translate-x-1/2 px-3 py-1.5 bg-gray-900 dark:bg-gray-700 text-white text-sm rounded-lg shadow-lg z-10">
            <span className="font-bold mr-2">{hoveredTooth}</span>
            {language === "ar"
              ? toothNames[hoveredTooth]?.ar
              : toothNames[hoveredTooth]?.en}
          </div>
        )}
      </div>

      {/* Selected Teeth Display */}
      {selectedTeeth.length > 0 && (
        <div className="mt-4 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            <span className="font-medium">
              {t("newCase.selectedTeeth", "Selected")}:
            </span>{" "}
            {selectedTeeth
              .sort((a, b) => parseInt(a) - parseInt(b))
              .join(", ")}
          </p>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <p className="mt-2 text-sm text-red-600 dark:text-red-400">{error}</p>
      )}

      {/* Clear Selection Button */}
      {selectedTeeth.length > 0 && (
        <button
          type="button"
          onClick={() => onSelect([])}
          className="mt-3 text-sm text-gray-500 dark:text-gray-400 hover:text-red-500 dark:hover:text-red-400 transition-colors"
        >
          {t("newCase.clearSelection", "Clear selection")}
        </button>
      )}
    </div>
  );
};

// Individual Tooth Shape Component
const ToothShape = ({
  number,
  x,
  y,
  type,
  rotation = 0,
  flip = false,
  isSelected,
  isHovered,
  onClick,
  onMouseEnter,
  onMouseLeave,
  numberColor,
}) => {
  // Get tooth path based on type
  const getToothPath = () => {
    switch (type) {
      case "molar":
        return "M -12,-15 Q -14,-10 -13,0 Q -12,12 -8,15 Q 0,18 8,15 Q 12,12 13,0 Q 14,-10 12,-15 Q 6,-18 0,-17 Q -6,-18 -12,-15 Z";
      case "premolar":
        return "M -8,-12 Q -10,-6 -9,0 Q -8,10 -5,12 Q 0,14 5,12 Q 8,10 9,0 Q 10,-6 8,-12 Q 4,-14 0,-14 Q -4,-14 -8,-12 Z";
      case "canine":
        return "M -6,-14 Q -8,-8 -7,0 Q -6,10 -4,13 Q 0,16 4,13 Q 6,10 7,0 Q 8,-8 6,-14 Q 3,-16 0,-16 Q -3,-16 -6,-14 Z";
      case "incisor":
        return "M -5,-12 Q -7,-6 -6,0 Q -5,8 -3,11 Q 0,13 3,11 Q 5,8 6,0 Q 7,-6 5,-12 Q 2,-14 0,-14 Q -2,-14 -5,-12 Z";
      case "incisor-central":
        return "M -6,-12 Q -8,-6 -7,0 Q -6,8 -4,11 Q 0,13 4,11 Q 6,8 7,0 Q 8,-6 6,-12 Q 3,-14 0,-14 Q -3,-14 -6,-12 Z";
      case "incisor-lower":
        return "M -4,-10 Q -6,-5 -5,0 Q -4,7 -3,9 Q 0,11 3,9 Q 4,7 5,0 Q 6,-5 4,-10 Q 2,-12 0,-12 Q -2,-12 -4,-10 Z";
      default:
        return "M -8,-12 Q -10,-6 -9,0 Q -8,10 -5,12 Q 0,14 5,12 Q 8,10 9,0 Q 10,-6 8,-12 Q 4,-14 0,-14 Q -4,-14 -8,-12 Z";
    }
  };

  const getFill = () => {
    if (isSelected) return "#0ea5e9";
    if (isHovered) return "#e0f2fe";
    return "#f9fafb";
  };

  const getStroke = () => {
    if (isSelected) return "#0284c7";
    if (isHovered) return "#38bdf8";
    return "#d1d5db";
  };

  const scaleY = flip ? -1 : 1;
  const numberOffset = flip ? 30 : -25;

  return (
    <g
      transform={`translate(${x}, ${y}) rotate(${rotation}) scale(1, ${scaleY})`}
      onClick={onClick}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      style={{ cursor: "pointer" }}
    >
      {/* Tooth shape */}
      <path
        d={getToothPath()}
        fill={getFill()}
        stroke={getStroke()}
        strokeWidth={isSelected ? 2 : 1.5}
        className="transition-all duration-150"
      />

      {/* Tooth surface detail */}
      {(type === "molar" || type === "premolar") && (
        <ellipse
          cx="0"
          cy={flip ? 2 : -2}
          rx={type === "molar" ? 6 : 4}
          ry={type === "molar" ? 4 : 3}
          fill={isSelected ? "#0284c7" : "#e5e7eb"}
          opacity="0.5"
        />
      )}

      {/* Tooth number */}
      <text
        x="0"
        y={numberOffset * scaleY}
        fontSize="10"
        fontWeight="600"
        fill={numberColor}
        textAnchor="middle"
        transform={flip ? `scale(1, -1) translate(0, ${numberOffset * 2})` : ""}
      >
        {number}
      </text>
    </g>
  );
};

export default TeethChart;
