import React from 'react';
import JobCardClient from './JobCardClient'; // Import the client component
import { Job } from './types'; // Import the Job type

interface JobCardProps {
    job: Job;
    isSelected: boolean;
    onToggleDetails: (jobId: string) => void;
    baseUrl: string;
}

const JobCard: React.FC<JobCardProps> = ({ job, isSelected, baseUrl }) => {
    return (
        <div className="job-card-container">
            {/* Pass only the necessary data to the client component */}
            <JobCardClient
                job={job}
                isSelected={isSelected}
                baseUrl={baseUrl}
            />
        </div>
    );
};

export default JobCard;
