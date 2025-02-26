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

  // Format the posting date
  useEffect(() => {
    const date = job.posted_date || job.postingDate;
    if (date) {
      const formattedDate = new Date(date).toLocaleDateString();
      setFormattedPostingDate(formattedDate);
    } else {
      setFormattedPostingDate(null);
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

  // GridItem component with tooltip support.
  // It uses touch events to show a tooltip on mobile and hover for desktop.
  const GridItem = ({
    icon,
    text,
    alt,
    iconWidth = 'w-7',
    iconHeight = 'h-7',
    extraClass = '',
  }: {
    icon: string;
    text: string;
    alt: string;
    iconWidth?: string;
    iconHeight?: string;
    extraClass?: string;
  }) => {
    const [mobileTooltipVisible, setMobileTooltipVisible] = useState(false);

    return (
      <div
        className={`group relative flex items-center text-white ${extraClass}`}
        style={{ maxWidth: '100%' }}
        onTouchStart={() => setMobileTooltipVisible(true)}
        onTouchEnd={() => setMobileTooltipVisible(false)}
        onTouchCancel={() => setMobileTooltipVisible(false)}
      >
        <img src={icon} alt={alt} className={`mr-1 ${iconWidth} ${iconHeight} flex-shrink-0`} />
        {/* Truncated text container */}
        <span className="block truncate max-w-[120px]">{text || 'N/A'}</span>
        {/* Tooltip container positioned above the text.
            It appears on hover (desktop) or if the touch state is active (mobile). */}
        <div
          className={`absolute bottom-full mb-1 z-10 left-1/2 transform -translate-x-1/2 ${
            mobileTooltipVisible ? 'block' : 'hidden'
          } group-hover:block`}
        >
          <div className="bg-gray-700 text-xs text-white p-1 rounded whitespace-normal break-words max-w-[200px]">
            {text || 'N/A'}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div
      className={`select-none rounded-lg shadow-md p-4 mb-4 border-4 border-transparent ${
        isDetailsVisible ? 'bg--[#1c1c1c]' : 'backdrop-blur-lg bg-opacity-30'
      }`}
      style={{ borderImage: 'linear-gradient(to right, #3b82f6, #1e3a8a) 0' }}
    >
      <h3 className="text-lg font-semibold text-center md:text-left text-white">
        {job.title}
      </h3>
      {/* Responsive Grid Layout remains unchanged in mobile view */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-1 justify-items-center">
        {/* On desktop, force jobId to the left */}
        <GridItem
          icon="/JobCard Logo/JobID.png"
          text={jobId || 'N/A'}
          alt="Job ID Icon"
          extraClass="md:justify-self-start"
        />
        <GridItem
          icon="/JobCard Logo/Salary.png"
          text={job.salary_range || 'N/A'}
          alt="Salary Icon"
          iconWidth="w-10"
          iconHeight="h-10"
        />
        <GridItem
          icon="/JobCard Logo/Calendar.png"
          text={formattedPostingDate || 'N/A'}
          alt="Calendar Icon"
        />
        {/* On desktop, force fullLocation to the right */}
        <GridItem
          icon="/JobCard Logo/Location.png"
          text={fullLocation || 'N/A'}
          alt="Location Icon"
          iconWidth="w-6"
          iconHeight="h-6"
          extraClass="md:justify-self-end"
        />
      </div>
      <div className="flex flex-col md:flex-row justify-between mt-2">
        <button
          onClick={handleViewJob}
          className="text-white bg-gradient-to-r from-purple-500 to-pink-500 hover:bg-gradient-to-l focus:ring-1 focus:outline-none focus:ring-purple-200 dark:focus:ring-purple-800 font-medium rounded-lg text-sm px-5 py-2.5 text-center me-2 mb-2 md:mb-0 order-1 md:order-2"
          aria-label="View job posting"
        >
          View Job
        </button>
        <button
          onClick={handleToggleDetails}
          className="text-white bg-gradient-to-br from-green-400 to-blue-600 hover:bg-gradient-to-bl focus:ring-1 focus:outline-none focus:ring-green-200 dark:focus:ring-green-800 font-medium rounded-lg text-sm px-5 py-2.5 text-center me-2 mb-2"
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
          <div
            dangerouslySetInnerHTML={{ __html: job.basic_qualifications || job.qualifications || '' }}
          />
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
