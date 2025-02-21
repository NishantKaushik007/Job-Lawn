"use client";
import React, { useState, useMemo, useEffect } from 'react';
import Select from 'react-select';
import JobCard from '../../components/JobCard/JobCard'; // Adjust path as necessary

interface Job {
  location: string;
  country: string;
  jobFunctions: string[];
  remoteEligible: boolean;
  name: string;
  sourceSystemId: number;
  updatedAt: string;
}

interface DropdownFilterProps {
  jobs: Job[]; // Ensure this is typed as an array of Job objects
}

const CACHE_KEY = 'jobData';
const CACHE_EXPIRY_TIME = 2 * 60 * 1000; // 2 minutes in milliseconds

const DropdownFilter: React.FC<DropdownFilterProps> = ({ jobs = [] }) => {
  const [selectedCountry, setSelectedCountry] = useState<string>('');
  const [selectedJobFunction, setSelectedJobFunction] = useState<string>('');
  const [selectedRemoteEligible, setSelectedRemoteEligible] = useState<boolean | null>(null);

  // Pagination state
  const [currentPage, setCurrentPage] = useState<number>(1);
  const pageSize = 10; // Number of jobs per page

  const [isClient, setIsClient] = useState(false); // Track if the component has mounted
  const [cachedJobs, setCachedJobs] = useState<Job[]>([]);

  useEffect(() => {
    setIsClient(true); // Set to true when the component has mounted
  }, []);

  const fetchData = () => {
    const cachedData = localStorage.getItem(CACHE_KEY);
    const cachedTimestamp = localStorage.getItem(`${CACHE_KEY}_timestamp`);
    const currentTimestamp = new Date().getTime();

    if (cachedData && cachedTimestamp && currentTimestamp - Number(cachedTimestamp) < CACHE_EXPIRY_TIME) {
      console.log('Fetching data from cache');
      setCachedJobs(JSON.parse(cachedData));
    } else {
      console.log('Fetching fresh data');
      // In a real scenario, you'd fetch the jobs from an API
      // For the sake of the example, let's assume `jobs` is the fetched data:
      localStorage.setItem(CACHE_KEY, JSON.stringify(jobs));
      localStorage.setItem(`${CACHE_KEY}_timestamp`, currentTimestamp.toString());
      setCachedJobs(jobs);
    }
  };

  useEffect(() => {
    if (jobs.length > 0) {
      fetchData();
    }
  }, [jobs]);

  const countries = useMemo(() => {
    return Array.isArray(cachedJobs) ? [...new Set(cachedJobs.map((job) => job.country))] : [];
  }, [cachedJobs]);

  const jobFunctions = useMemo(() => {
    return Array.isArray(cachedJobs) ? [...new Set(cachedJobs.flatMap((job) => job.jobFunctions))] : [];
  }, [cachedJobs]);

  const filterJobs = () => {
    return Array.isArray(cachedJobs) ? cachedJobs.filter((job) => {
      const countryMatch = selectedCountry ? job.country === selectedCountry : true;
      const jobFunctionMatch = selectedJobFunction ? job.jobFunctions.includes(selectedJobFunction) : true;
      const remoteEligibleMatch = selectedRemoteEligible !== null ? job.remoteEligible === selectedRemoteEligible : true;

      return countryMatch && jobFunctionMatch && remoteEligibleMatch;
    }) : [];
  };

  const filteredJobs = filterJobs();

  // Calculate pagination details
  const totalJobs = filteredJobs.length;
  const totalPages = Math.ceil(totalJobs / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const currentPageJobs = filteredJobs.slice(startIndex, startIndex + pageSize);

  // Handle page change
  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  // Ensure the component renders only on the client side
  if (!isClient) {
    return null; // Prevent rendering on the server side
  }

  return (
    <div className="flex flex-col mb-6 space-y-4 sm:flex-col sm:space-x-4 sm:space-y-0 w-full">
      <div className="flex flex-col mb-6 space-y-4 sm:flex-row sm:space-x-4 sm:space-y-0 w-full">
        
          <Select
            id="country"
            options={countries.map((country) => ({ label: country, value: country }))}
            onChange={(selectedOption) => setSelectedCountry(selectedOption ? selectedOption.value : '')}
            placeholder="Select Country"
            className="react-select-container"
            classNamePrefix="react-select"
            isClearable
          />
        

        
          <Select
            id="jobFunction"
            options={jobFunctions.map((func) => ({ label: func, value: func }))}
            onChange={(selectedOption) => setSelectedJobFunction(selectedOption ? selectedOption.value : '')}
            placeholder="Select Job Function"
            className="react-select-container"
            classNamePrefix="react-select"
            isClearable
          />
        

       
          <Select
            id="remoteEligible"
            options={[
              { label: 'All', value: null },
              { label: 'Yes', value: true },
              { label: 'No', value: false },
            ]}
            onChange={(selectedOption) => setSelectedRemoteEligible(selectedOption ? selectedOption.value : null)}
            placeholder="Select Remote Eligibility"
            className="react-select-container"
            classNamePrefix="react-select"
            isClearable
          />
        
      </div>

      <div>
        {/* Render filtered jobs */}
        <ul>
          {currentPageJobs.length > 0 ? (
            currentPageJobs.map((job) => (
              <li key={job.sourceSystemId}>
                <JobCard
                  job={{
                    title: job.name,
                    id_icims: job.sourceSystemId.toString(),
                    posted_date: job.updatedAt,
                    job_path: job.sourceSystemId.toString(), // Update with actual job path if available
                    normalized_location: job.location || 'Remote',
                    basic_qualifications: '',
                    description: '',
                    preferred_qualifications: '',
                    responsibilities: '',
                  }}
                  onToggleDetails={() => {}}
                  isSelected={false} // Check if the job is selected
                  baseUrl="https://www.thoughtworks.com/en-in/careers/jobs/" // Update with your actual base URL
                />
              </li>
            ))
          ) : (
            <div className="text-center text-white mt-4">No job found for selected criteria.</div>
          )}
        </ul>
      </div>

      <div>
        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="mt-4 flex justify-between items-center space-x-4">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className={`bg-gray-500 text-white py-2 px-4 rounded-md transition-colors ${currentPage === 1 ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-700'}`}
            >
              Previous
            </button>
            <span className="text-lg font-semibold text-white">
              Page {currentPage}
            </span>
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className={`bg-blue-500 text-white py-2 px-4 rounded-md transition-colors ${currentPage === totalPages ? 'opacity-50 cursor-not-allowed' : 'hover:bg-blue-700'}`}
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default DropdownFilter;
