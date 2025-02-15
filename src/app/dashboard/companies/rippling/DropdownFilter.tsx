'use client';

import { useState, useEffect } from 'react';
import Select from 'react-select';
import JobCard from '../../components/JobCard/JobCard';
import Pagination from './Pagination';

interface Job {
  uuid: string;
  name: string;
  url: string;
  workLocation: {
    id: string;
    label: string;
  };
  department: {
    id: string;
    label: string;
  };
  title: string;
  basic_qualifications: string;
  description: string;
  preferred_qualifications: string;
}

interface DropdownFilterProps {
  jobCategories: { label: string; value: string }[];
  locations: { label: string; value: string }[];
  jobs: Job[];
}

const CACHE_EXPIRY_TIME = 60 * 1000 * 2; // 2 minutes

const DropdownFilter: React.FC<DropdownFilterProps> = ({ jobCategories, locations, jobs }) => {
  const [jobCategoryCode, setJobCategoryCode] = useState<string>('');
  const [locationCode, setLocationCode] = useState<string>('');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [isClient, setIsClient] = useState(false);
  const resultsPerPage = 10;

  // Check if data is in localStorage and if it has expired
  useEffect(() => {
    setIsClient(true);
    const cachedJobCategories = localStorage.getItem('jobCategories');
    const cachedLocations = localStorage.getItem('locations');
    const cachedJobs = localStorage.getItem('jobs');
    const cachedTimestamp = localStorage.getItem('cacheTimestamp');

    const currentTime = new Date().getTime();

    // If cache exists and is not expired
    if (cachedJobCategories && cachedLocations && cachedJobs && cachedTimestamp) {
      const cacheTime = parseInt(cachedTimestamp, 10);
      if (currentTime - cacheTime < CACHE_EXPIRY_TIME) {
        console.log("Loading data from cache...");
        const parsedJobCategories = JSON.parse(cachedJobCategories);
        const parsedLocations = JSON.parse(cachedLocations);
        const parsedJobs = JSON.parse(cachedJobs);
        
        // Use cached data
        jobCategories = parsedJobCategories;
        locations = parsedLocations;
        jobs = parsedJobs;
      } else {
        console.log("Cache expired. Loading fresh data...");
        // Cache expired, clear and load fresh data
        localStorage.removeItem('jobCategories');
        localStorage.removeItem('locations');
        localStorage.removeItem('jobs');
        localStorage.removeItem('cacheTimestamp');
        cacheData();
      }
    } else {
      console.log("No cache found. Loading fresh data...");
      cacheData();
    }

    function cacheData() {
      // Cache the fresh data along with the timestamp
      localStorage.setItem('jobCategories', JSON.stringify(jobCategories));
      localStorage.setItem('locations', JSON.stringify(locations));
      localStorage.setItem('jobs', JSON.stringify(jobs));
      localStorage.setItem('cacheTimestamp', currentTime.toString());
    }
  }, [jobCategories, locations, jobs]);

  const handleDepartmentChange = (selectedOption: { value: string; label: string } | null) => {
    setJobCategoryCode(selectedOption ? selectedOption.value : '');
  };

  const handleLocationChange = (selectedOption: { value: string; label: string } | null) => {
    setLocationCode(selectedOption ? selectedOption.value : '');
  };

  const filteredJobs = jobs.filter((job) => {
    const matchesLocation = locationCode ? job.workLocation.id === locationCode : true;
    const matchesDepartment = jobCategoryCode ? job.department.id === jobCategoryCode : true;
    return matchesLocation && matchesDepartment;
  });

  const indexOfLastJob = currentPage * resultsPerPage;
  const indexOfFirstJob = indexOfLastJob - resultsPerPage;
  const currentJobs = filteredJobs.slice(indexOfFirstJob, indexOfLastJob);

  const handleNextPage = () => {
    setCurrentPage((prev) => prev + 1);
  };

  const handleBackPage = () => {
    setCurrentPage((prev) => Math.max(prev - 1, 1));
  };

  // If the client-side hasn't mounted yet, render nothing or a loading state.
  if (!isClient) {
    return null;
  }

  return (
    <div>
      <div className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-4 mb-6">
        <label className="flex flex-col">
          <Select
            options={jobCategories}
            onChange={handleDepartmentChange}
            isClearable
            placeholder="Select Department"
          />
        </label>
        <label className="flex flex-col">
          <Select
            options={locations}
            onChange={handleLocationChange}
            isClearable
            placeholder="Select Location"
          />
        </label>
      </div>

      <ul>
        {currentJobs.length > 0 ? (
          currentJobs.map((job, index) => (
            <li key={`${job.uuid}-${index}`}> {/* Ensure unique keys */}
              <JobCard
                job={{
                  title: job.name,
                  id_icims: job.uuid,
                  job_path: job.url,
                  normalized_location: job.workLocation.label,
                  basic_qualifications: job.basic_qualifications || '',
                  description: job.description || '',
                  preferred_qualifications: job.preferred_qualifications || '',
                  responsibilities: '',
                }}
                onToggleDetails={() => {}} // Add toggle logic as needed
                isSelected={false} // Update selection logic if needed
                baseUrl=""
              />
            </li>
          ))
        ) : (
          <div>No jobs available for the selected criteria.</div>
        )}
      </ul>

      <Pagination
        currentPage={currentPage}
        onNext={handleNextPage}
        onBack={handleBackPage}
        hasMoreResults={indexOfLastJob < filteredJobs.length}
      />
    </div>
  );
};

export default DropdownFilter;
