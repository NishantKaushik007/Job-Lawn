"use client"
import React from 'react';
import { useRouter } from 'next/navigation';

interface DropdownFilterProps {
  label: string;
  options: string[]; // Now expecting an array of strings
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

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedValue = e.target.value;
    const searchParams = new URLSearchParams(window.location.search);

    // Update the search params based on selection
    if (selectedValue) {
      searchParams.set(searchParamsKey, selectedValue);
    } else {
      searchParams.delete(searchParamsKey);
    }

    // Update the URL with the new search parameter
    router.push(`?${searchParams.toString()}`);
  };

  return (
    <div className="flex flex-col">
      <label htmlFor={searchParamsKey} className="font-semibold mb-2">
        {label}
      </label>
      <select
        id={searchParamsKey}
        value={currentValue || ''}
        onChange={handleChange}
        className="p-2 border rounded-md"
      >
        <option value="">All</option>
        {options.map((option, index) => (
          <option key={index} value={option}>
            {option}
          </option>
        ))}
      </select>
    </div>
  );
};

export default DropdownFilter;
