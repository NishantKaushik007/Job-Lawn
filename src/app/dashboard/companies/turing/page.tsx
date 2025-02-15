import { jobCategory, country } from '../../../../Data/data';
import DropdownFilter from './DropdownFilter';
import JobCard from '../../components/JobCard/JobCard';
import Pagination from './Pagination';

interface Job {
  post_id: string;
  post_title: string;
  post_location_name: string;
}

interface TuringProps {
  searchParams: Record<string, string | undefined>;
}

// Cache expiry time (2 minutes)
const CACHE_EXPIRY_TIME = 60 * 1000 * 2;

// Global in-memory cache
const jobCache: Record<string, { data: Job[]; timestamp: number }> = {};

// Jobs per page
const JOBS_PER_PAGE = 10;

// Normalize search params
const normalizeParams = (searchParams: Record<string, string | undefined>): Record<string, string[] | undefined> => {
  const normalizedParams: Record<string, string[] | undefined> = {};
  for (const key in searchParams) {
    if (searchParams[key]) {
      normalizedParams[key] = [searchParams[key] as string];
    }
  }
  return normalizedParams;
};

// Transform filters for API
const transformFilters = (filters: Record<string, string[] | undefined>): Record<string, string | undefined> => {
  const transformedFilters: Record<string, string | undefined> = {};
  for (const key in filters) {
    if (filters[key]) {
      transformedFilters[key] = filters[key]?.[0];
    }
  }
  return transformedFilters;
};

// Get cached data from localStorage
const getFromLocalStorage = (key: string): { data: Job[]; timestamp: number } | null => {
  if (typeof window !== 'undefined') {
    const cachedData = localStorage.getItem(key);
    if (cachedData) {
      const { data, timestamp } = JSON.parse(cachedData);
      if (Date.now() - timestamp < CACHE_EXPIRY_TIME) {
        return { data, timestamp };
      }
    }
  }
  return null;
};

// Save data to localStorage
const saveToLocalStorage = (key: string, data: Job[]): void => {
  if (typeof window !== 'undefined') {
    const cacheObject = { data, timestamp: Date.now() };
    localStorage.setItem(key, JSON.stringify(cacheObject));
  }
};

// Fetch jobs
async function fetchJobs(filters: Record<string, string | undefined>): Promise<Job[]> {
  const cacheKey = JSON.stringify({ filters });

  // Check localStorage cache
  const cachedClientData = getFromLocalStorage(cacheKey);
  if (cachedClientData) {
    console.log('Using client-side cached data');
    return cachedClientData.data;
  }

  // Check server-side cache
  const cachedServerData = jobCache[cacheKey];
  if (cachedServerData && Date.now() - cachedServerData.timestamp < CACHE_EXPIRY_TIME) {
    console.log('Using server-side cached data');
    return cachedServerData.data;
  }

  // Build query params
  const queryParams = [
    filters.jobCategory && `department_id=${filters.jobCategory}`,
    filters.country && `office_id=${filters.country}`,
  ]
    .filter(Boolean)
    .join('&');

  const url = `https://careers.turing.com/api/v3/job-posts?${queryParams}`;

  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to fetch jobs: ${response.statusText}`);
    }

    const data = await response.json();

    // Map the jobs to the correct structure
    const jobs = data.map((job: any) => ({
      post_title: job.post_title,
      post_id: job.post_id,
      post_location_name: job.post_location_name,
    })) || [];

    // Cache the result
    saveToLocalStorage(cacheKey, jobs);
    jobCache[cacheKey] = { data: jobs, timestamp: Date.now() };

    return jobs;
  } catch (error) {
    console.error('Error fetching jobs:', error);
    return [];
  }
}

export default async function TuringPage({ searchParams }: TuringProps) {
  const currentPage = parseInt(searchParams.page || '1', 10);
  const normalizedParams = normalizeParams(searchParams);

  const selectedCompany = 'Turing';

  let allJobs: Job[] = [];
  let paginatedJobs: Job[] = [];
  let error: string | null = null;

  const filters = transformFilters(normalizedParams);

  try {
    allJobs = await fetchJobs(filters);

    // Paginate jobs
    const startIdx = (currentPage - 1) * JOBS_PER_PAGE;
    const endIdx = startIdx + JOBS_PER_PAGE;
    paginatedJobs = allJobs.slice(startIdx, endIdx);
  } catch (err) {
    error = (err as Error).message;
  }

  const sanitizedSearchParams = Object.entries(searchParams)
    .filter(([key, value]) => value && key !== 'status' && key !== 'value')
    .reduce((acc, [key, value]) => {
      acc[key] = value as string;
      return acc;
    }, {} as Record<string, string>);

  return (
    <div className="p-4">
      <div>
        <DropdownFilter
          jobCategory={jobCategory}
          country={country}
          currentParams={normalizedParams}
          selectedCompany={selectedCompany}
        />
      </div>

      {error ? (
        <div className="text-red-500">Error: {error}</div>
      ) : paginatedJobs.length === 0 ? (
        <div className="text-gray-500">No jobs available.</div>
      ) : (
        <ul className="space-y-4">
          {paginatedJobs.map((job) => (
            <li key={job.post_id}>
              <JobCard
                job={{
                  title: job.post_title,
                  id_icims: job.post_id,
                  posted_date: 'N/A',
                  job_path: job.post_id,
                  normalized_location: job.post_location_name || '',
                  basic_qualifications: '',
                  description: '',
                  responsibilities: '',
                }}
                onToggleDetails={() => {}}
                isSelected={false}
                baseUrl="https://careers.turing.com/job/"
              />
            </li>
          ))}
        </ul>
      )}

      <Pagination
        currentPage={currentPage}
        totalPages={Math.ceil(allJobs.length / JOBS_PER_PAGE)}
        updatedSearchParams={sanitizedSearchParams}
      />
    </div>
  );
}
