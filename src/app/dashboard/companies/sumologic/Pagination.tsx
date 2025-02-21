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

  // If no jobs are available, display a message
  if (jobs.length === 0) {
    return (
      <div className="p-4">
        <div className="text-center text-white mt-4">No job found for selected criteria.</div>
      </div>
    );
  }

  const totalPages = Math.ceil(jobs.length / jobsPerPage);

  const indexOfLastJob = currentPage * jobsPerPage;
  const indexOfFirstJob = indexOfLastJob - jobsPerPage;
  const currentJobs = jobs.slice(indexOfFirstJob, indexOfLastJob);

  // disableNext logic: disable when current page is the last page
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
        {currentJobs.map((job) => (
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
        <button
          onClick={handleBackPage}
          disabled={currentPage === 1}
          className={`bg-gray-500 text-white py-2 px-4 rounded-md transition-colors ${
            currentPage === 1 ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-700'
          }`}
        >
          Previous
        </button>
        <span className="text-lg font-semibold text-white">Page {currentPage}</span>
        <button
          onClick={handleNextPage}
          disabled={disableNext}
          className={`bg-blue-500 text-white py-2 px-4 rounded-md transition-colors ${
            disableNext ? 'opacity-50 cursor-not-allowed' : 'hover:bg-blue-700'
          }`}
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default Pagination;
