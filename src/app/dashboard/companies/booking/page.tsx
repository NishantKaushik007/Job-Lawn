import { jobCategory, location } from '../../../../Data/data';
import DropdownFilter from './DropdownFilter';
import JobCard from '../../components/JobCard/JobCard';
import Pagination from './Pagination';
import SearchForm from '../../components/SearchForm'; // Import SearchForm

interface Job {
    title: string;
    req_id: string;
    posted_date: string;
    location_name: string;
    qualifications: string;
    description: string;
    responsibilities: string;
    canonical_url: string;
    salary_range: string;
    full_location: string;
}

interface BookingProps {
    searchParams: Record<string, string | undefined>;
}

// Set cache expiry time (in milliseconds)
const CACHE_EXPIRY_TIME = 60 * 1000 * 2; // 2 minutes

// Global in-memory cache object
const jobCache: Record<string, { data: Job[]; timestamp: number }> = {};

// Normalize search params to wrap values in arrays
const normalizeParams = (searchParams: Record<string, string | undefined>): Record<string, string[] | undefined> => {
  const normalizedParams: Record<string, string[] | undefined> = {};
  for (const key in searchParams) {
    if (searchParams[key]) {
      normalizedParams[key] = [searchParams[key] as string];
    }
  }
  return normalizedParams;
};

// Helper function to convert normalized parameters to the correct shape for the API
const transformFilters = (filters: Record<string, string[] | undefined>): Record<string, string | undefined> => {
  const transformedFilters: Record<string, string | undefined> = {};
  for (const key in filters) {
    if (filters[key]) {
      transformedFilters[key] = filters[key]?.[0];
    }
  }
  return transformedFilters;
};

// Function to retrieve data from localStorage with cache expiry check
const getFromLocalStorage = (key: string): { data: Job[]; timestamp: number } | null => {
  if (typeof window !== "undefined") { // Check if running on the client side
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

// Function to save data to localStorage
const saveToLocalStorage = (key: string, data: Job[]): void => {
  if (typeof window !== "undefined") { // Check if running on the client side
    const cacheObject = { data, timestamp: Date.now() };
    localStorage.setItem(key, JSON.stringify(cacheObject));
  }
};

// Fetch jobs based on filters with caching logic (hybrid caching)
async function fetchJobs(filters: Record<string, string | undefined>, page: number): Promise<Job[]> {
    const cacheKey = JSON.stringify(filters);

    // Check client-side cache (localStorage) first
    const cachedClientData = getFromLocalStorage(cacheKey);
    if (cachedClientData) {
      console.log('Using client-side cached data');
      return cachedClientData.data;
    }

    // Check server-side cache if client-side cache is unavailable
    const cachedServerData = jobCache[cacheKey];
    if (cachedServerData && Date.now() - cachedServerData.timestamp < CACHE_EXPIRY_TIME) {
      console.log('Using server-side cached data');
      return cachedServerData.data;
    }

    // If no cached data, fetch from API
    const queryParams = [
        filters.keyword && `keywords=${filters.keyword}`,  // Include keyword in queryParams
        filters.location && `locations=${filters.location}`,
        `page=${page}`, // Calculate the offset for pagination
        filters.jobCategory && `categories=${filters.jobCategory}`,
    ]
    .filter(Boolean)
    .join('&');

    const url = `https://jobs.booking.com/api/jobs?${queryParams}&sortBy=relevance&descending=false&internal=false&tags1=Booking.com%20Company%20Hierarchy%7CTransport%20Company%20Hierarchy`;
    console.log(url);
    

    try {
    const response = await fetch(url);
    if (!response.ok) {
        throw new Error(`Failed to fetch jobs: ${response.statusText}`);
    }

    const data = await response.json();
    const jobs = data.jobs.map((job: any) => ({
        title: job.data.title,
        req_id: `Req ID: ${job.data.req_id}`,
        posted_date: job.data.posted_date,
        location_name: job.data.full_location,
        qualifications: job.data.qualifications || '',
        description: job.data.description || '',
        responsibilities: job.data.responsibilities || '',
        canonical_url: job.data.meta_data.canonical_url || '',
        salary_range: `N/A`,
    }));

    // Cache the result in both client and server caches
    saveToLocalStorage(cacheKey, jobs); // Save to localStorage
    jobCache[cacheKey] = { data: jobs, timestamp: Date.now() }; // Save to server-side cache

    console.log('Fetching fresh data');
    return jobs;
    } catch (error) {
    console.error('Error fetching jobs:', error);
    return [];
    }
}

export default async function BookingPage({ searchParams }: BookingProps) {
    const currentPage = parseInt(searchParams.page || '1', 10); // Default to page 1
    const normalizedParams = normalizeParams(searchParams);

    const selectedCompany = 'Booking.com';

    let jobs: Job[] = [];
    let error: string | null = null;

    // Transform normalized params to match the expected shape for the fetchJobs function
    const filters = transformFilters(normalizedParams);

    try {
      jobs = await fetchJobs(filters, currentPage);
    } catch (err) {
      error = (err as Error).message;
    }

    // Clean up search parameters and add keyword in sanitizedParams
    const sanitizedSearchParams = Object.entries(searchParams)
      .filter(([key, value]) => value && key !== 'status' && key !== 'value')
      .reduce((acc, [key, value]) => {
        acc[key] = value as string;
        return acc;
      }, {} as Record<string, string>);

    // Ensure the keyword is a string for the SearchForm
    const initialKeyword = Array.isArray(searchParams.keyword) ? searchParams.keyword[0] : (searchParams.keyword || '');

    return (
      <div className="p-4">
        <div className="flex flex-col mb-6 space-y-4 sm:flex-row sm:space-x-4 sm:space-y-0 w-full">
          {/* Pass only initialKeyword */}
          <SearchForm 
            initialKeyword={initialKeyword} 
          />
        </div>
        <DropdownFilter
            jobCategory={jobCategory}
            location={location}
            currentParams={normalizedParams} // Pass normalizedParams here
            selectedCompany={selectedCompany}
          />

        {error ? (
          <div className="text-red-500">Error: {error}</div>
        ) : jobs.length === 0 ? (
          <div className="text-gray-500">No jobs available.</div>
        ) : (
          <ul className="space-y-4">
            {jobs.map((job) => (
              <li key={job.req_id}>
                <JobCard
                  job={job}
                  onToggleDetails={() => {}}
                  isSelected={false}
                  baseUrl=''
                />
              </li>
            ))}
          </ul>
        )}

        <Pagination
          currentPage={currentPage}
          updatedSearchParams={sanitizedSearchParams}
        />
      </div>
    );
}
