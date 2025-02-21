"use client";
import React, { useState } from 'react';
import dynamic from 'next/dynamic';
import JobCard from '../../components/JobCard/JobCard';
import { ActionMeta, SingleValue } from 'react-select';

// Dynamically import react-select to avoid SSR issues
const Select = dynamic(() => import('react-select'), { ssr: false });

interface Categories {
  commitment: string;
  location: string;
  team: string;
  allLocations: string[];
}

interface Lists {
  text: string;
  content: string;
}

interface Content {
  descriptionHtml: string;
  lists: Lists[];
  closingHtml: string;
}

interface Urls {
  show: string;
}

interface Data {
  id: string;
  text: string;
  categories: Categories;
  tags: string[];
  content: Content;
  urls: Urls;
  updatedAt: string;
}

interface PalantirClientProps {
  jobs: { data: Data[]; hasNext: boolean; next: string };
}

export const PalantirClient: React.FC<PalantirClientProps> = ({ jobs }) => {
  const [teamCode, setTeamCode] = useState<string>('');
  const [allLocationsCode, setAllLocationsCode] = useState<string>('');
  const [categoryCode, setCategoryCode] = useState<string>(''); 
  const [filteredJobs, setFilteredJobs] = useState<Data[]>(jobs.data); // Set initial filteredJobs from jobs.data
  const [currentPage, setCurrentPage] = useState<number>(1);
  const resultsPerPage = 10;

  // Extract unique teams, locations, and categories from the jobs data
  const teams = [
    ...new Set(
      (Array.isArray(filteredJobs) ? filteredJobs : []).map(job => job.categories?.team).filter(Boolean)
    ),
  ];

  const allLocations = [
    ...new Set(
      (Array.isArray(filteredJobs) ? filteredJobs : []).flatMap(job => job.categories?.allLocations || []).filter(Boolean)
    ),
  ];

  const categories = [
    ...new Set(
      (Array.isArray(filteredJobs) ? filteredJobs : []).flatMap(job =>
        job.tags
          .filter(tag => tag.startsWith('Category:'))
          .map(tag => tag.replace('Category:', '').trim())
      ).filter(Boolean)
    ),
  ];

  // Filter jobs based on selected team, location, and category
  const filteredList = (Array.isArray(filteredJobs) ? filteredJobs : []).filter(job => {
    const matchesTeam = teamCode ? job.categories.team.toLowerCase().includes(teamCode.toLowerCase()) : true;
    const matchesAllLocations = allLocationsCode
      ? job.categories.allLocations.some(loc => loc.toLowerCase().includes(allLocationsCode.toLowerCase()))
      : true;
    const matchesCategory = categoryCode
      ? job.tags.some(tag => tag.startsWith('Category:') && tag.replace('Category:', '').trim() === categoryCode)
      : true;

    return matchesTeam && matchesAllLocations && matchesCategory;
  });

  // Pagination logic
  const indexOfLastJob = currentPage * resultsPerPage;
  const indexOfFirstJob = indexOfLastJob - resultsPerPage;
  const currentJobs = filteredList.slice(indexOfFirstJob, indexOfLastJob);

  // Handlers for select components
  const handleTeamChange = (newValue: unknown, actionMeta: ActionMeta<unknown>) => {
    const selectedOption = newValue as SingleValue<{ value: string | null; label: string | null }>;
    setTeamCode(selectedOption?.value || '');
  };

  const handleAllLocationsChange = (newValue: unknown, actionMeta: ActionMeta<unknown>) => {
    const selectedOption = newValue as SingleValue<{ value: string | null; label: string | null }>;
    setAllLocationsCode(selectedOption?.value || '');
  };

  const handleCategoryChange = (newValue: unknown, actionMeta: ActionMeta<unknown>) => {
    const selectedOption = newValue as SingleValue<{ value: string | null; label: string | null }>;
    setCategoryCode(selectedOption?.value || '');
  };

  // Handlers for pagination
  const handleNextPage = () => {
    setCurrentPage(prev => prev + 1);
  };

  const handleBackPage = () => {
    setCurrentPage(prev => Math.max(prev - 1, 1));
  };

  return (
    <div>
      <div className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-4 mb-6">
        {teams.length > 0 && (
          <label className="flex flex-col text-white">
            Team:
            <Select
              inputId="team-select"
              options={teams.map(team => ({ label: team, value: team }))}
              onChange={handleTeamChange}
              isClearable
              placeholder="Select a Team"
            />
          </label>
        )}
        {allLocations.length > 0 && (
          <label className="flex flex-col text-white">
            All Locations:
            <Select
              inputId="location-select"
              options={allLocations.map(location => ({ label: location, value: location }))}
              onChange={handleAllLocationsChange}
              isClearable
              placeholder="Select a Location"
            />
          </label>
        )}
        {categories.length > 0 && (
          <label className="flex flex-col text-white">
            Category:
            <Select
              inputId="category-select"
              options={categories.map(category => ({ label: category, value: category }))}
              onChange={handleCategoryChange}
              isClearable
              placeholder="Select a Category"
            />
          </label>
        )}
      </div>

      <ul>
        {currentJobs.length > 0 ? (
          currentJobs.map((job) => (
            <li key={job.id}>
              <JobCard
                job={{
                  title: job.text,
                  id_icims: job.id,
                  job_path: job.urls.show,
                  postingDate: job.updatedAt,
                  normalized_location: (job.categories.allLocations || []).join(', '),
                  basic_qualifications: job.content.descriptionHtml,
                  description: job.content.lists.map(list => list.content).join('\n\n'),
                  preferred_qualifications: '', // Format if needed
                  responsibilities: job.content.closingHtml,
                }}
                onToggleDetails={() => {}}
                isSelected={false}
                baseUrl=""
              />
            </li>
          ))
        ) : (
          <div className="text-center text-white mt-4">
            No job found for selected criteria.
          </div>
        )}
      </ul>

      <div className="mt-4 flex justify-between space-x-2">
        <button
          onClick={handleBackPage}
          disabled={currentPage === 1}
          className={`bg-gray-500 text-white py-2 px-4 rounded-md transition-colors ${
            currentPage === 1 ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-700'
          }`}
        >
          Previous
        </button>
        <span className='text-lg font-semibold text-white'>Page {currentPage}</span>
        <button
          onClick={handleNextPage}
          disabled={currentJobs.length < resultsPerPage}
          className={`bg-blue-500 text-white py-2 px-4 rounded-md transition-colors ${
            currentJobs.length < resultsPerPage ? 'opacity-50 cursor-not-allowed' : 'hover:bg-blue-700'
          }`}
        >
          Next
        </button>
      </div>
    </div>
  );
};
