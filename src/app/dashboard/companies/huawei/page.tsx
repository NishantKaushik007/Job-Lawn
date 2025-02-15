import React from 'react';
import DropdownFilter from './DropdownFilter';
import { jobCategory, country } from '../../../../Data/data';
import Pagination from './Pagination'; // Import the Pagination component
import JobCard from '../../components/JobCard/JobCard';
import SearchForm from '../../components/SearchForm'; // Import the client-side form component

interface Job {
  jobname: string;
  jobId: string;
  releaseDate: string;
  jobArea: string;
  jobRequireEn: string;
  mainBusinessEn: string;
}

const CACHE_EXPIRY_TIME = 60 * 1000 * 2; // 2 minutes

// Caching mechanism for jobs and their last fetch time
let cachedJobs: Record<string, Job[]> = {}; // In-memory cache
let lastFetched: Record<string, number> = {}; // Timestamp of when the data was last fetched

// Fetch jobs function with caching
async function fetchJobs(
  jobCategoryCodes: string[],
  countryCodes: string[],
  keyword: string | undefined,
  currentPage: number
): Promise<Job[]> {
  const cacheKey = JSON.stringify({
    jobCategoryCodes,
    countryCodes,
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
    `${currentPage}?`,
    `curPage=${(currentPage)}`, // Pagination offset
    `pageSize=${resultsPerPage}`, // Results per page
    jobCategoryCodes.length > 0 && `jobFamClsCode=${jobCategoryCodes.join('&jobFamClsCode=')}`,
    countryCodes.length > 0 && `countryCode=${countryCodes.join('&countryCode=')}`,
    keyword ? `searchText=${encodeURIComponent(keyword)}` : null,
  ]
    .filter(Boolean)
    .join('&');

  const url = `https://career.huawei.com/reccampportal/services/portal/portalpub/getJob/newHr/page/10/${queryParams}&language=en_US&orderBy=ISS_STARTDATE_DESC_AND_IS_HOT_JOB`;
  const res = await fetch(url);
  const data = await res.json();
  
  const jobs = data.result;

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
  const countryCodes = searchParams.country ? searchParams.country.split(',') : [];
  const keyword = searchParams.keyword || '';
  const selectedCompany = 'Huawei';

  const currentPage = searchParams.page ? parseInt(searchParams.page as string, 10) : 1;
  const selectedJobId = searchParams.jobId;

  // Fetch jobs directly on the server
  const jobs: Job[] = await fetchJobs(
    jobCategoryCodes,
    countryCodes,
    keyword,
    currentPage
  );

  const currentParams: Record<string, string[] | undefined> = {
    jobCategory: jobCategoryCodes.length > 0 ? jobCategoryCodes : undefined,
    country: countryCodes.length > 0 ? countryCodes : undefined,
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
          country={country}
          selectedCompany={selectedCompany}
          currentParams={currentParams}
        />
      </div>

      <ul>
        {jobs.map((job: Job) => (
          <li key={job.jobId}>
            <JobCard
                job={{
                  title: job.jobname,
                  id_icims: job.jobId,
                  posted_date: job.releaseDate,
                  description: job.mainBusinessEn || '', // Passing job description
                  qualifications: job.jobRequireEn || '',
                  job_path: `https://career.huawei.com/reccampportal/portal5/campus-recruitment-detail.html?jobId=${job.jobId}&dataSource=1&jobType=3&recruitType=CR&sourceType=001`,
                  normalized_location: job.jobArea,
                }}
                onToggleDetails={() => {}}
                isSelected={searchParams.selectedJobId === job.jobId}
                baseUrl=""
              />
          </li>
        ))}
      </ul>

      <Pagination
        currentPage={currentPage}
        updatedSearchParams={cleanParams} // Use cleaned-up params here
        loading={false}
      />
    </div>
  );
};

export default Page;
