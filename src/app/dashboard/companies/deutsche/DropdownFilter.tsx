'use client';

import React, { useEffect, useState } from 'react';
import Select from 'react-select';

interface DropdownProps {
  jobCategory: { company: string; value: string; code: string }[];
  country: { company: string; value: string; code: string }[];
  category: { company: string; value: string; code: string }[];
  jobType: { company: string; value: string; code: string }[];
  experienceLevel: { company: string; value: string; code: string }[];
  selectedCompany: string;
  currentParams: Record<string, string[] | undefined>;
}

const DropdownFilter: React.FC<DropdownProps> = ({
  jobCategory,
  country,
  category,
  jobType,
  experienceLevel,
  selectedCompany,
  currentParams,
}) => {
  const [isClient, setIsClient] = useState(false); // State to track client-side rendering

  useEffect(() => {
    setIsClient(true); // Mark as client-side when the component has mounted
  }, []);

  // Function to transform options into the shape react-select expects
  const transformOptions = (data: { company: string; value: string; code: string }[]) => {
    // Filter options by selected company
    const filteredData = data.filter((item) => item.company === selectedCompany);
    return filteredData.map((item) => ({ value: item.code, label: item.value }));
  };

  // Utility function to get the selected value safely
  const getSelectedValue = (paramKey: string, options: { company: string; value: string; code: string }[]) => {
    const selectedCode = currentParams[paramKey]?.[0];
    return selectedCode
      ? { value: selectedCode, label: options.find((option) => option.code === selectedCode)?.value }
      : null;
  };

  // Client-side rendering check to avoid hydration mismatch
  if (!isClient) {
    return null; // Avoid rendering on the server side
  }

  const handleDropdownChange = (key: string) => (selectedOption: any) => {
    const newValue = selectedOption ? selectedOption.value : '';
    const params = new URLSearchParams(window.location.search);
    if (newValue) {
      params.set(key, newValue);
    } else {
      params.delete(key);
    }
    // Retain the page query parameter when updating other filters
    if (currentParams.page) {
      params.set('page', `${currentParams.page}`);
    }
    window.history.pushState({}, '', `${window.location.pathname}?${params.toString()}`);
    window.location.reload();
  };

  return (
    <div className="flex flex-col mb-6 space-y-4 sm:flex-row sm:space-x-4 sm:space-y-0 w-full">
      <Select
        value={getSelectedValue('country', country)}
        onChange={handleDropdownChange('country')}
        options={transformOptions(country)}
        className="w-full sm:flex-row sm:w-9/12"
        placeholder="Select Country"
        isClearable
        isSearchable
      />
      <Select
        value={getSelectedValue('jobCategory', jobCategory)}
        onChange={handleDropdownChange('jobCategory')}
        options={transformOptions(jobCategory)}
        className="w-full"
        placeholder="Select Profession"
        isClearable
        isSearchable
      />
      <Select
        value={getSelectedValue('category', category)}
        onChange={handleDropdownChange('category')}
        options={transformOptions(category)}
        className="w-full"
        placeholder="Select Category"
        isClearable
        isSearchable
      />
      <Select
        value={getSelectedValue('jobType', jobType)}
        onChange={handleDropdownChange('jobType')}
        options={transformOptions(jobType)}
        className="w-full"
        placeholder="Select Job Type"
        isClearable
        isSearchable
      />
      <Select
        value={getSelectedValue('experienceLevel', experienceLevel)}
        onChange={handleDropdownChange('experienceLevel')}
        options={transformOptions(experienceLevel)}
        className="w-full"
        placeholder="Select Experience Level"
        isClearable
        isSearchable
      />
    </div>
  );
};

export default DropdownFilter;
