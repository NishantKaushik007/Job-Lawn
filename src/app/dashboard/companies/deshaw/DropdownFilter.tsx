"use client"; // This ensures the component is rendered on the client

import { useRouter } from "next/navigation"; // Use next/navigation instead of next/router
import { ChangeEvent, useState } from "react";

interface DropdownFilterProps {
  label: string;
  options: string[];
  selectedValue: string | null;
  paramKey: string;
}

const DropdownFilter = ({
  label,
  options,
  selectedValue,
  paramKey,
}: DropdownFilterProps) => {
  const router = useRouter(); // Correct usage for App Router
  const [value, setValue] = useState(selectedValue || "");

  const handleChange = (event: ChangeEvent<HTMLSelectElement>) => {
    const newValue = event.target.value;
    setValue(newValue);

    // Construct the updated search parameters
    const params = new URLSearchParams(window.location.search);
    if (newValue) {
      params.set(paramKey, newValue);
    } else {
      params.delete(paramKey);
    }

    // Update the URL
    router.push(`?${params.toString()}`);
  };

  return (
    <div className="filter">
      <label htmlFor={`${paramKey}-filter`} className="block mb-2">
        {label}
      </label>
      <select
        id={`${paramKey}-filter`}
        value={value}
        onChange={handleChange}
        className="border p-2 rounded w-full"
      >
        <option value="">All</option>
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </div>
  );
};

export default DropdownFilter;
