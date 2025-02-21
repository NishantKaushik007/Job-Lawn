'use client';  // This makes the component client-side only

import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { Job } from './types';

interface JobCardClientProps {
    job: Job;
    isSelected: boolean;
    baseUrl: string;
}

const JobCardClient: React.FC<JobCardClientProps> = ({ job, isSelected, baseUrl }) => {
    const [isDetailsVisible, setIsDetailsVisible] = useState(isSelected);
    const [formattedPostingDate, setFormattedPostingDate] = useState<string | null>(null);

    // Memoize the job ID
    const jobId = useMemo(() => job.id_icims || job.jobId || job.req_id, [job]);
    
    // Memoize the full location string
    const fullLocation = useMemo(() => {
        const primaryLocation = job.normalized_location || job.location_name || '';
        const secondaryLocations = job.secondaryLocations?.map(location => location.Name) || [];
        return [primaryLocation, ...secondaryLocations].filter(Boolean).join(', ');
    }, [job]);

    // Memoize the formatted posting date
    useEffect(() => {
        const date = job.posted_date || job.postingDate;
        if (date) {
            const formattedDate = new Date(date).toLocaleDateString();
            setFormattedPostingDate(formattedDate);
        } else {
            setFormattedPostingDate(null); // or a default value like 'N/A'
        }
    }, [job.posted_date, job.postingDate]);

    const handleToggleDetails = useCallback(() => {
        setIsDetailsVisible(prev => !prev);
    }, []);

    const handleViewJob = useCallback(() => {
        const jobPath = job.job_path || job.url || job.canonical_url;
        if (jobPath) {
            window.open(`${baseUrl}${jobPath}`, '_blank');
        } else {
            console.error('Job path is not defined');
            alert('Job URL is not available.');
        }
    }, [baseUrl, job]);

    return (
        <div className={`rounded-lg shadow-md p-4 mb-4 border-4 border-transparent ${
            isDetailsVisible ? 'bg--[#1c1c1c]' : 'backdrop-blur-lg bg-opacity-30'
          }`}
          style={{ borderImage: 'linear-gradient(to right, #3b82f6, #1e3a8a) 0' }}
        >
            <h3 className="text-lg font-semibold text-center md:text-left text-white">{job.title}</h3>
            <div className="flex flex-col md:flex-row items-center mt-1 gap-x-10 justify-between">
                <span className="flex flex-row items-center text-white">
                    <img
                        src="/JobCard Logo/JobID.png"
                        alt="Job ID Icon"
                        className="mr-1 w-7 h-7"
                    />
                    <span>{jobId || 'N/A'}</span>
                </span>
                <span className="flex flex-row items-center text-white">
                    <img
                        src="/JobCard Logo/Salary.png"
                        alt="Salary Icon"
                        className="mr-1 w-10 h-10"
                    />
                    <span>{job.salary_range || 'N/A'}</span>
                </span>
                <span className="flex flex-row items-center text-white">
                    <img
                        src="/JobCard Logo/Calendar.png"
                        alt="Calendar Icon"
                        className="mr-1 w-7 h-7"
                    />
                    <span>{formattedPostingDate || 'N/A'}</span>
                </span>
                <span className="flex flex-row items-center text-white">
                    <img
                        src="/JobCard Logo/Location.png"
                        alt="Location Icon"
                        className="mr-1 w-6 h-6"
                    />
                    <span>{fullLocation || 'N/A'}</span>
                </span>
            </div>
            <div className="flex flex-col md:flex-row justify-between mt-2">
                <button
                    onClick={handleViewJob}
                    className="text-white bg-green-500 hover:bg-green-600 rounded px-4 py-2 mb-2 md:mb-0 order-1 md:order-2"
                    aria-label="View job posting"
                >
                    View Job
                </button>
                <button
                    onClick={handleToggleDetails}
                    className="text-white bg-blue-500 hover:bg-blue-600 rounded px-4 py-2 order-2 md:order-1"
                    aria-expanded={isDetailsVisible}
                    aria-label={isDetailsVisible ? 'Hide job details' : 'View job details'}
                >
                    {isDetailsVisible ? 'Hide Details' : 'View Details'}
                </button>
            </div>

            {isDetailsVisible && (
                <div className="mt-2 border-t pt-2 backdrop-blur-lg bg-opacity-30 text-white">
                    <h4 className="font-semibold">Description:</h4>
                    <div dangerouslySetInnerHTML={{ __html: job.description || '' }} />
                    <h4 className="font-semibold">Basic Qualifications:</h4>
                    <div dangerouslySetInnerHTML={{ __html: job.basic_qualifications || job.qualifications || '' }} />
                    <h4 className="font-semibold">Preferred Qualifications:</h4>
                    <div dangerouslySetInnerHTML={{ __html: job.preferred_qualifications || '' }} />
                    {job.responsibilities && (
                        <>
                            <h4 className="font-semibold">Responsibilities:</h4>
                            <div dangerouslySetInnerHTML={{ __html: job.responsibilities }} />
                        </>
                    )}
                </div>
            )}
        </div>
    );
};

export default JobCardClient;
