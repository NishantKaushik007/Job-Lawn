// src/app/companies/thoughtworks/page.tsx
import React from 'react';
import DropdownFilter from './DropdownFilter';

interface Job {
  location: string;
  country: string;
  role: string;
  jobFunctions: string[];
  remoteEligible: boolean;
  name: string;
  sourceSystemId: number;
  updatedAt: string;
}

const fetchData = async (): Promise<Job[]> => {
  const res = await fetch('https://www.thoughtworks.com/rest/careers/jobs');
  const data = await res.json();
  return data.jobs || [];
};

const Thoughtworks = async () => {
  // Fetch jobs on the server-side
  const jobs = await fetchData();

  return (
    <div className="flex flex-col md:flex-row md:space-x-4 mb-6 pl-4 pr-4">
      <DropdownFilter jobs={jobs} />
    </div>
  );
};

export default Thoughtworks;
