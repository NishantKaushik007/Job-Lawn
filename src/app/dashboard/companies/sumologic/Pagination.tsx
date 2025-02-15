// src/components/Pagination.tsx

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

    const indexOfLastJob = currentPage * jobsPerPage;
    const indexOfFirstJob = indexOfLastJob - jobsPerPage;
    const currentJobs = jobs.slice(indexOfFirstJob, indexOfLastJob);

    const totalPages = Math.ceil(jobs.length / jobsPerPage);

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
                    className={`bg-gray-500 text-white py-2 px-4 rounded-md transition-colors ${currentPage === 1 ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-700'}`}
                >
                    Previous
                </button>
                <span>Page {currentPage}</span>
                <button
                    onClick={handleNextPage}
                    disabled={currentPage === totalPages}
                    className={`bg-blue-500 text-white py-2 px-4 rounded-md transition-colors ${currentPage === totalPages ? 'opacity-50 cursor-not-allowed' : 'hover:bg-blue-700'}`}
                >
                    Next
                </button>
            </div>
        </div>
    );
};

export default Pagination;
