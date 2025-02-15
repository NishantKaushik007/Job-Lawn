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
    <div className="container mx-auto flex flex-col space-y-6 p-4">
      <DropdownFilter jobs={jobs} />
    </div>
  );
};

export default Thoughtworks;
