'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Select from 'react-select';
import Pagination from './Pagination';
import { jobCategory, country } from '../../../../Data/data';

interface Job {
    title: string;
    id: string;
    updated_at: string;
    absolute_url: string;
    location: {
        name: string;
    };
}

interface DropdownFilterProps {
    jobs: Job[];
}

const DropdownFilter: React.FC<DropdownFilterProps> = ({ jobs }) => {
    const [filteredJobs, setFilteredJobs] = useState<Job[]>(jobs);
    const [selectedCategory, setSelectedCategory] = useState<{ value: string; label: string } | null>(null);
    const [selectedCountry, setSelectedCountry] = useState<{ value: string; label: string } | null>(null);

    // Memoize the filtered job categories and countries to avoid recalculating on every render
    const filteredJobCategories = useMemo(
        () =>
            jobCategory
                .filter(option => option.company === 'Sumo Logic')
                .map(option => ({
                    label: option.value,
                    value: option.code,
                })),
        []
    );

    const filteredCountries = useMemo(
        () =>
            country
                .filter(option => option.company === 'Sumo Logic')
                .map(option => ({
                    label: option.value,
                    value: option.code,
                })),
        []
    );

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const jobCategoryCode = params.get('jobCategoryCode');
        const countryCode = params.get('countryCode');

        if (jobCategoryCode) {
            const selectedCategoryOption = filteredJobCategories.find(option => option.value === jobCategoryCode);
            setSelectedCategory(selectedCategoryOption || null);
        }

        if (countryCode) {
            const selectedCountryOption = filteredCountries.find(option => option.value === countryCode);
            setSelectedCountry(selectedCountryOption || null);
        }
    }, [filteredJobCategories, filteredCountries]); // These are now stable due to useMemo

    const handleCategoryChange = (selectedOption: { value: string; label: string } | null) => {
        setSelectedCategory(selectedOption);

        const queryParams = new URLSearchParams(window.location.search);
        if (selectedOption) {
            queryParams.set('jobCategoryCode', selectedOption.value);
        } else {
            queryParams.delete('jobCategoryCode');
        }

        window.location.search = queryParams.toString();
    };

    const handleCountryChange = (selectedOption: { value: string; label: string } | null) => {
        setSelectedCountry(selectedOption);

        const queryParams = new URLSearchParams(window.location.search);
        if (selectedOption) {
            queryParams.set('countryCode', selectedOption.value);
        } else {
            queryParams.delete('countryCode');
        }

        window.location.search = queryParams.toString();
    };

    return (
        <div>
            <div className="flex flex-col md:flex-row md:space-x-4 mb-6">
                <label className="flex flex-col mb-4 md:mb-0">
                    <Select
                        options={filteredJobCategories}
                        value={selectedCategory}
                        onChange={handleCategoryChange}
                        isClearable={true}
                        placeholder="Select Department"
                        instanceId="job-category-select" // Add this
                    />
                </label>

                <label className="flex flex-col mb-4 md:mb-0">
                    <Select
                        options={filteredCountries}
                        value={selectedCountry}
                        onChange={handleCountryChange}
                        isClearable={true}
                        placeholder="Select Country"
                        instanceId="country-select" // Add this
                    />
                </label>
            </div>

            <Pagination jobs={filteredJobs} />
        </div>
    );
};

export default DropdownFilter;
