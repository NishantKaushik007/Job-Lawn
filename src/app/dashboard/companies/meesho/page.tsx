import React from 'react';
import DropdownFilter from './DropdownFilter';
import { jobCategory, industryExp } from '../../../../Data/data';
import Pagination from './Pagination'; // Import the Pagination component
import JobCard from '../../components/JobCard/JobCard';

interface Job {
  text: string;
  id: string;
  createdAt: string;
  categories: {
    allLocations: string[];
  };
  descriptionPlain: string;
  additionalPlain: string;
  hostedUrl: string;
}

const CACHE_EXPIRY_TIME = 60 * 1000 * 2; // 2 minutes

// Caching mechanism for jobs and their last fetch time
let cachedJobs: Record<string, Job[]> = {}; // In-memory cache
let lastFetched: Record<string, number> = {}; // Timestamp of when the data was last fetched

// Fetch jobs function with caching
async function fetchJobs(
  jobCategoryCodes: string[],
  industryExpCodes: string[],
  currentPage: number
): Promise<Job[]> {
  const cacheKey = JSON.stringify({
    jobCategoryCodes,
    industryExpCodes,
    currentPage,
  });

  if (cachedJobs[cacheKey] && Date.now() - lastFetched[cacheKey] < CACHE_EXPIRY_TIME) {
    console.log('Using cached data (server-side)');
    return cachedJobs[cacheKey];
  }

  const resultsPerPage = 10;
  const queryParams = [
    jobCategoryCodes.length > 0 && `team=${jobCategoryCodes.join('&team=')}`,
    industryExpCodes.length > 0 && `commitment=${industryExpCodes.join('&commitment=')}`,
  ]
    .filter(Boolean)
    .join('&');

  const url = `https://api.lever.co/v0/postings/meesho/?${queryParams}`;

  const res = await fetch(url);
  const data = await res.json();

  const jobs = data.slice((currentPage - 1) * resultsPerPage, currentPage * resultsPerPage);

  cachedJobs[cacheKey] = jobs;
  lastFetched[cacheKey] = Date.now();

  return jobs;
}

const Page = async ({ searchParams }: { searchParams: Record<string, string | undefined> }) => {
  const jobCategoryCodes = searchParams.jobCategory ? searchParams.jobCategory.split(',') : [];
  const industryExpCodes = searchParams.industryExp ? searchParams.industryExp.split(',') : [];
  const selectedCompany = 'Meesho';

  const currentPage = searchParams.page ? parseInt(searchParams.page as string, 10) : 1;
  const selectedJobId = searchParams.jobId;

  const jobs: Job[] = await fetchJobs(jobCategoryCodes, industryExpCodes, currentPage);

  const serializableParams: Record<string, string> = Object.fromEntries(
    Object.entries(searchParams)
      .filter(([_, value]) => value !== undefined) // Filter out undefined values
      .map(([key, value]) => [key, value as string]) // Ensure all values are strings
  );  

  return (
    <div className="p-4">
      <div className="flex flex-col mb-6 space-y-4 sm:flex-row sm:space-x-4 sm:space-y-0 w-full">
        <DropdownFilter
          jobCategory={jobCategory}
          industryExp={industryExp}
          selectedCompany={selectedCompany}
          currentParams={{
            jobCategory: jobCategoryCodes,
            industryExp: industryExpCodes,
          }}
        />
      </div>

      <ul>
        {jobs.map((job: Job) => (
          <li key={job.id}>
            <JobCard
              job={{
                title: job.text,
                id_icims: job.id,
                posted_date: job.createdAt,
                description: job.additionalPlain || '',
                qualifications: job.descriptionPlain || '',
                job_path: job.hostedUrl,
                normalized_location: job.categories.allLocations.join(', '),
              }}
              onToggleDetails={() => {}}
              isSelected={searchParams.selectedJobId === job.id}
              baseUrl=""
            />
          </li>
        ))}
      </ul>

      <Pagination
        currentPage={currentPage}
        updatedSearchParams={serializableParams} // Pass only serializable data
        loading={false}
      />
    </div>
  );
};

export default Page;
