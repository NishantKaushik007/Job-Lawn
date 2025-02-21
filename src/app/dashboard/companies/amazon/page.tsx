import React from 'react';
import DropdownFilter from './DropdownFilter';
import { jobCategory, industryExp, jobType, country, category } from '../../../../Data/data';
import Pagination from './Pagination'; // Import the Pagination component
import JobCard from '../../components/JobCard/JobCard';
import SearchForm from '../../components/SearchForm'; // Import the client-side form component

interface Job {
  title: string;
  id_icims: string;
  posted_date: string;
  job_path: string;
  normalized_location: string;
  basic_qualifications: string;
  description: string;
  preferred_qualifications: string;
  salary_range?: string;
}

const CACHE_EXPIRY_TIME = 60 * 1000 * 2; // 2 minutes

// Caching mechanism for jobs and their last fetch time
let cachedJobs: Record<string, Job[]> = {}; // In-memory cache
let lastFetched: Record<string, number> = {}; // Timestamp of when the data was last fetched

// Fetch jobs function with caching
async function fetchJobs(
  jobCategoryCodes: string[],
  categoryCode: string,
  jobTypeCodes: string[],
  countryCodes: string[],
  industryExpCodes: string[],
  keyword: string | undefined,
  currentPage: number
): Promise<Job[]> {
  const cacheKey = JSON.stringify({
    jobCategoryCodes,
    categoryCode,
    jobTypeCodes,
    countryCodes,
    industryExpCodes,
    keyword,
    currentPage
  });

  // Check if cached data exists and is still valid in server-side cache
  if (cachedJobs[cacheKey] && Date.now() - lastFetched[cacheKey] < CACHE_EXPIRY_TIME) {
    console.log('Using cached data (server-side)');
    return cachedJobs[cacheKey];
  }

  // Check for client-side cache (localStorage) if running in the browser
  if (typeof window !== 'undefined') {
    const cachedData = localStorage.getItem(cacheKey);
    if (cachedData) {
      console.log('Using cached data (client-side)');
      return JSON.parse(cachedData);
    }
  }

  // If not cached or cache expired, fetch fresh data
  const resultsPerPage = 10;
  const queryParams = [
    jobCategoryCodes.length > 0 && `category[]=${jobCategoryCodes.join('&category[]=')}`,
    jobTypeCodes.length > 0 && `schedule_type_id[]=${jobTypeCodes.join('&schedule_type_id[]=')}`,
    countryCodes.length > 0 && `normalized_country_code[]=${countryCodes.join('&normalized_country_code[]=')}`,
    industryExpCodes.length > 0 && `industry_experience[]=${industryExpCodes.join('&industry_experience[]=')}`,
    categoryCode === 'student-programs' ? `business_category[]=student-programs` : null,
    categoryCode === 'virtual-locations' ? `location[]=virtual-locations` : null,
    keyword ? `base_query=${encodeURIComponent(keyword)}` : null,
    `offset=${(currentPage - 1) * resultsPerPage}`, // Pagination offset
    `result_limit=${resultsPerPage}`, // Results per page
  ]
    .filter(Boolean)
    .join('&');

  const url = `https://amazon.jobs/en-gb/search.json?${queryParams}&radius=24km`;
  const res = await fetch(url);
  const data = await res.json();
  const jobs = data.jobs;

  // Cache the result and update the last fetched timestamp
  cachedJobs[cacheKey] = jobs;
  lastFetched[cacheKey] = Date.now();

  // Store the result in localStorage for future client-side use
  if (typeof window !== 'undefined') {
    localStorage.setItem(cacheKey, JSON.stringify(jobs));
  }

  console.log('Fetching fresh data');
  return jobs;
}

const Page = async ({ searchParams }: { searchParams: Record<string, string | undefined> }) => {
  const jobCategoryCodes = searchParams.jobCategory ? searchParams.jobCategory.split(',') : [];
  const categoryCode = searchParams.category || '';
  const jobTypeCodes = searchParams.jobType ? searchParams.jobType.split(',') : [];
  const countryCodes = searchParams.country ? searchParams.country.split(',') : [];
  const industryExpCodes = searchParams.industryExp ? searchParams.industryExp.split(',') : [];
  const keyword = searchParams.keyword || '';
  const selectedCompany = 'Amazon';

  const currentPage = searchParams.page ? parseInt(searchParams.page as string, 10) : 1;
  const selectedJobId = searchParams.jobId;

  // Fetch jobs directly on the server
  const jobs: Job[] = await fetchJobs(
    jobCategoryCodes,
    categoryCode,
    jobTypeCodes,
    countryCodes,
    industryExpCodes,
    keyword,
    currentPage
  );

  const currentParams: Record<string, string[] | undefined> = {
    jobCategory: jobCategoryCodes.length > 0 ? jobCategoryCodes : undefined,
    category: categoryCode ? [categoryCode] : undefined,
    jobType: jobTypeCodes.length > 0 ? jobTypeCodes : undefined,
    country: countryCodes.length > 0 ? countryCodes : undefined,
    industryExp: industryExpCodes.length > 0 ? industryExpCodes : undefined,
  };

  // Filter out any unwanted or invalid parameters from the URL
  const cleanParams = Object.fromEntries(
    Object.entries(searchParams).filter(([key, value]) => {
      return value !== undefined && value !== null && value !== 'null';
    })
  );

  const toggleJobDetails = (jobId: string) => {
    return selectedJobId === jobId ? null : jobId;
  };

  return (
    <div className="p-4">
      <div className="mb-4">
        <SearchForm initialKeyword={keyword} />
      </div>

      <div className="flex flex-col mb-6 space-y-4 sm:flex-row sm:space-x-4 sm:space-y-0 w-full">
        <DropdownFilter
          jobCategory={jobCategory}
          category={category}
          jobType={jobType}
          country={country}
          industryExp={industryExp}
          selectedCompany={selectedCompany}
          currentParams={currentParams}
        />
      </div>

      {jobs.length === 0 ? (
        <p className="text-center text-white mt-4">No job found for selected criteria</p>
      ) : (
        <ul>
          {jobs.map((job: Job) => (
            <li key={job.id_icims}>
              <JobCard
                job={job}
                onToggleDetails={toggleJobDetails} // Placeholder function
                isSelected={selectedJobId === job.id_icims}
                baseUrl="https://amazon.jobs"
              />
            </li>
          ))}
        </ul>
      )}

      <Pagination
        currentPage={currentPage}
        updatedSearchParams={cleanParams} // Use cleaned-up params here
        loading={false}
        disableNext={jobs.length < 10} // Disables Next button when no jobs are found
      />
    </div>
  );
};

export default Page;
