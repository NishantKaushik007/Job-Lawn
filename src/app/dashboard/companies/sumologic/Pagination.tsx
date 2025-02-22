'use client';
import React, { useState } from 'react';
import JobCard from '../../components/JobCard/JobCard';

interface Job {
  title: string;
  id: string;
  updated_at: string;
  absolute_url: string;
  location: {
    name: string;
  };
}

interface PaginationProps {
  jobs: Job[];
}

const Pagination: React.FC<PaginationProps> = ({ jobs }) => {
  const [currentPage, setCurrentPage] = useState<number>(1);
  const jobsPerPage = 10;

  if (jobs.length === 0) {
    return (
      <div className="p-4">
        <div className="text-center text-white mt-4">
          No job found for selected criteria.
        </div>
      </div>
    );
  }

  const totalPages = Math.ceil(jobs.length / jobsPerPage);
  const indexOfLastJob = currentPage * jobsPerPage;
  const indexOfFirstJob = indexOfLastJob - jobsPerPage;
  const currentJobs = jobs.slice(indexOfFirstJob, indexOfLastJob);
  const disableNext = currentPage === totalPages;

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(prevPage => prevPage + 1);
    }
  };

  const handleBackPage = () => {
    if (currentPage > 1) {
      setCurrentPage(prevPage => prevPage - 1);
    }
  };

  return (
    <div>
      <ul>
        {currentJobs.map(job => (
          <li key={job.id}>
            <JobCard
              job={{
                title: job.title,
                id_icims: job.id,
                posted_date: job.updated_at,
                job_path: job.absolute_url,
                normalized_location: job.location.name,
                basic_qualifications: '',
                description: '',
                preferred_qualifications: '',
                responsibilities: '',
              }}
              onToggleDetails={() => {}}
              isSelected={false}
              baseUrl=""
            />
          </li>
        ))}
      </ul>

      <div className="mt-4 flex justify-between space-x-2">
        {/* Previous Button (Zinc Button CSS) */}
        <button
          onClick={handleBackPage}
          disabled={currentPage === 1}
          className={`text-white bg-gradient-to-br from-zinc-600 to-zinc-400 hover:bg-gradient-to-bl focus:ring-1 focus:outline-none focus:ring-zinc-300 font-medium rounded-md text-sm py-2 px-4 transition-colors ${
            currentPage === 1 ? 'opacity-50 cursor-not-allowed' : ''
          }`}
        >
          Previous
        </button>
        <span className="text-lg font-semibold text-white">Page {currentPage}</span>
        {/* Next Button (Purple to Blue Button CSS) */}
        <button
          onClick={handleNextPage}
          disabled={disableNext}
          className={`text-white bg-gradient-to-br from-purple-600 to-blue-500 hover:bg-gradient-to-bl focus:ring-1 focus:outline-none focus:ring-blue-300 dark:focus:ring-blue-800 font-medium rounded-md text-sm py-2 px-4 transition-colors ${
            disableNext ? 'opacity-50 cursor-not-allowed' : ''
          }`}
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default Pagination;
