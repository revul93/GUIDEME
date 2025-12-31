import { useState, useRef, useEffect } from "react";

const CountryCodeSelector = ({ value, onChange, disabled }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const dropdownRef = useRef(null);

  // Common countries list with flags and codes
  const countries = [
    { code: "+966", country: "Saudi Arabia", flag: "🇸🇦", dialCode: "966" },
    {
      code: "+971",
      country: "United Arab Emirates",
      flag: "🇦🇪",
      dialCode: "971",
    },
    { code: "+965", country: "Kuwait", flag: "🇰🇼", dialCode: "965" },
    { code: "+968", country: "Oman", flag: "🇴🇲", dialCode: "968" },
    { code: "+974", country: "Qatar", flag: "🇶🇦", dialCode: "974" },
    { code: "+973", country: "Bahrain", flag: "🇧🇭", dialCode: "973" },
    { code: "+962", country: "Jordan", flag: "🇯🇴", dialCode: "962" },
    { code: "+961", country: "Lebanon", flag: "🇱🇧", dialCode: "961" },
    { code: "+20", country: "Egypt", flag: "🇪🇬", dialCode: "20" },
    { code: "+212", country: "Morocco", flag: "🇲🇦", dialCode: "212" },
    { code: "+213", country: "Algeria", flag: "🇩🇿", dialCode: "213" },
    { code: "+216", country: "Tunisia", flag: "🇹🇳", dialCode: "216" },
    { code: "+964", country: "Iraq", flag: "🇮🇶", dialCode: "964" },
    { code: "+963", country: "Syria", flag: "🇸🇾", dialCode: "963" },
    { code: "+970", country: "Palestine", flag: "🇵🇸", dialCode: "970" },
    { code: "+967", country: "Yemen", flag: "🇾🇪", dialCode: "967" },
    { code: "+249", country: "Sudan", flag: "🇸🇩", dialCode: "249" },
    { code: "+218", country: "Libya", flag: "🇱🇾", dialCode: "218" },
    { code: "+252", country: "Somalia", flag: "🇸🇴", dialCode: "252" },
    { code: "+253", country: "Djibouti", flag: "🇩🇯", dialCode: "253" },
    { code: "+98", country: "Iran", flag: "🇮🇷", dialCode: "98" },
    { code: "+90", country: "Turkey", flag: "🇹🇷", dialCode: "90" },
    { code: "+1", country: "United States", flag: "🇺🇸", dialCode: "1" },
    { code: "+44", country: "United Kingdom", flag: "🇬🇧", dialCode: "44" },
    { code: "+91", country: "India", flag: "🇮🇳", dialCode: "91" },
    { code: "+92", country: "Pakistan", flag: "🇵🇰", dialCode: "92" },
    { code: "+880", country: "Bangladesh", flag: "🇧🇩", dialCode: "880" },
    { code: "+60", country: "Malaysia", flag: "🇲🇾", dialCode: "60" },
    { code: "+62", country: "Indonesia", flag: "🇮🇩", dialCode: "62" },
    { code: "+63", country: "Philippines", flag: "🇵🇭", dialCode: "63" },
    { code: "+86", country: "China", flag: "🇨🇳", dialCode: "86" },
    { code: "+82", country: "South Korea", flag: "🇰🇷", dialCode: "82" },
    { code: "+81", country: "Japan", flag: "🇯🇵", dialCode: "81" },
  ];

  // Filter countries based on search
  const filteredCountries = countries.filter(
    (country) =>
      country.country.toLowerCase().includes(searchTerm.toLowerCase()) ||
      country.dialCode.includes(searchTerm)
  );

  // Find selected country
  const selectedCountry =
    countries.find((c) => c.code === value) || countries[0];

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
        setSearchTerm("");
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () =>
        document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [isOpen]);

  const handleSelect = (country) => {
    onChange(country.code);
    setIsOpen(false);
    setSearchTerm("");
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Selected Country Button */}
      <button
        type="button"
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        className="flex items-center gap-2 px-3 py-2.5 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-charcoal dark:text-light hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <span className="text-xl">{selectedCountry.flag}</span>
        <span className="font-medium" dir="ltr">
          {selectedCountry.code}
        </span>
        <svg
          className={`w-4 h-4 transition-transform ${
            isOpen ? "rotate-180" : ""
          }`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute z-50 mt-2 w-80 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg shadow-xl">
          {/* Search Input */}
          <div className="p-2 border-b border-gray-200 dark:border-gray-700">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search country..."
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-charcoal dark:text-light focus:ring-2 focus:ring-accent focus:border-transparent"
              autoFocus
            />
          </div>

          {/* Country List */}
          <div className="max-h-64 overflow-y-auto">
            {filteredCountries.length > 0 ? (
              filteredCountries.map((country) => (
                <button
                  key={country.dialCode}
                  type="button"
                  onClick={() => handleSelect(country)}
                  className={`w-full flex items-center gap-3 px-4 py-2.5 text-left hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors ${
                    value === country.code
                      ? "bg-primary/10 dark:bg-accent/10"
                      : ""
                  }`}
                >
                  <span className="text-xl">{country.flag}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-charcoal dark:text-light truncate">
                      {country.country}
                    </p>
                  </div>
                  <span
                    className="text-sm text-gray-500 dark:text-gray-400"
                    dir="ltr"
                  >
                    {country.code}
                  </span>
                  {value === country.code && (
                    <svg
                      className="w-5 h-5 text-primary dark:text-accent"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  )}
                </button>
              ))
            ) : (
              <div className="px-4 py-8 text-center text-gray-500 dark:text-gray-400">
                No countries found
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default CountryCodeSelector;
