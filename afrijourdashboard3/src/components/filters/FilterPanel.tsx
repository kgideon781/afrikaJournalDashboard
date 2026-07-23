import { FilterGroup } from "./FilterGroup";
import { useEffect, useRef } from "react";

export const FilterPanel = ({
  showFilterForm,
  toggleFilterForm,
  countries,
  thematicAreas,
  languages,
  selectedCountries,
  selectedThematicAreas,
  selectedLanguages,
  onCountryChange,
  onThematicAreaChange,
  onLanguageChange,
  onApplyFilter,
}: {
  showFilterForm: boolean;
  toggleFilterForm: () => void;
  countries: any[];
  thematicAreas: any[];
  languages: any[];
  selectedCountries: string[];
  selectedThematicAreas: string[];
  selectedLanguages: string[];
  onCountryChange: (value: string) => void;
  onThematicAreaChange: (value: string) => void;
  onLanguageChange: (value: string) => void;
  onApplyFilter: () => void;
}) => {
  const filterPanelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        filterPanelRef.current &&
        !filterPanelRef.current.contains(event.target as Node)
      ) {
        toggleFilterForm();
      }
    };

    if (showFilterForm) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showFilterForm, toggleFilterForm]);

  return (
    <div
      ref={filterPanelRef}
      className={`fixed left-0 top-0 h-full transform bg-white p-4 shadow-lg transition-transform ${
        showFilterForm ? "translate-x-0" : "-translate-x-full"
      }`}
      style={{ width: "300px", zIndex: 50 }}
      // eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions
      onClick={(e) => e.stopPropagation()}
    >
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold">Filter Options</h3>
        <button
          className="text-red-500 hover:text-red-700"
          onClick={toggleFilterForm}
        >
          Close
        </button>
      </div>

      <div className="max-h-[calc(100vh-150px)] overflow-y-auto">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            onApplyFilter();
          }}
        >
          <FilterGroup
            title="Countries"
            items={countries}
            labelKey="country"
            selectedItems={selectedCountries.map(Number)}
            onItemChange={(id: number) => onCountryChange(id.toString())}
          />

          <FilterGroup
            title="Thematic Areas"
            items={thematicAreas}
            labelKey="thematic_area"
            selectedItems={selectedThematicAreas.map(Number)}
            onItemChange={(id: number) =>
              onThematicAreaChange(id.toString())
            }
          />

          <FilterGroup
            title="Languages"
            items={languages}
            labelKey="language"
            selectedItems={selectedLanguages.map(Number)}
            onItemChange={(id: number) => onLanguageChange(id.toString())}
          />

          <button
            type="submit"
            className="w-full rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600 transition-colors"
          >
            Apply Filters
          </button>
        </form>
      </div>
    </div>
  );
};