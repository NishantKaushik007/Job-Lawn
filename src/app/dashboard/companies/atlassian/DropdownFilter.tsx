'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

interface DropdownFilterProps {
  label: string;
  options: { company: string; value: string; code: string }[]; // The original shape
  searchParamsKey: string;
  currentValue: string | undefined;
}

const DropdownFilter: React.FC<DropdownFilterProps> = ({
  label,
  options,
  searchParamsKey,
  currentValue,
}) => {
  const router = useRouter();
  const [selectedOption, setSelectedOption] = useState(currentValue || '');

  // Update selected option if currentValue changes (e.g., from URL params)
  useEffect(() => {
    if (currentValue !== selectedOption) {
      setSelectedOption(currentValue || '');
    }
  }, [currentValue]);

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedValue = e.target.value;
    setSelectedOption(selectedValue);

    const searchParams = new URLSearchParams(window.location.search);
    if (selectedValue) {
      searchParams.set(searchParamsKey, selectedValue);
    } else {
      searchParams.delete(searchParamsKey);
    }

    // Update the URL with the new search parameter
    router.push(`?${searchParams.toString()}`);
  };

  // Map options to match the expected { label, value } format
  const mappedOptions = options.map((opt) => ({
    label: opt.value, // Using 'value' as label or customize as needed
    value: opt.value,
  }));

  return (
    <div className="flex flex-col">
      <label htmlFor={searchParamsKey} className="font-semibold mb-2">
        {label}
      </label>
      <select
        id={searchParamsKey}
        value={selectedOption}
        onChange={handleChange}
        className="p-2 border rounded-md"
      >
        <option value="">All</option>
        {mappedOptions.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
};

export default DropdownFilter;
