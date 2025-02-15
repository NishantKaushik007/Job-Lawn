import DropdownFilter from './DropdownFilter';
import JobCard from '../../components/JobCard/JobCard';
import Pagination from './Pagination'; // Import the client Pagination component
import { jobCategory, industryExp, jobType, country, category, discipline } from '../../../../Data/data';
import SearchForm from '../../components/SearchForm'; // Import the SearchForm

interface Job {
  title: string;
  jobId: string;
  postingDate: string;
  properties: {
    locations: string[];
  };
  description: string;
  qualifications: string;
  responsibilities: string;
}

interface MicrosoftProps {
  searchParams: Record<string, string | undefined>;
}

// Constants
const CACHE_EXPIRY_TIME = 60 * 1000 * 2; // 2 minutes

// Utility: Normalize search parameters
const normalizeParams = (searchParams: Record<string, string | undefined>): Record<string, string[] | undefined> => {
  const normalizedParams: Record<string, string[] | undefined> = {};
  for (const key in searchParams) {
    if (searchParams[key]) {
      normalizedParams[key] = [searchParams[key] as string];
    }
  }
  return normalizedParams;
};

// Utility: Get cached data with expiry check
function getLocalStorageWithExpiry(key: string) {
  const item = localStorage.getItem(key);
  if (!item) return null;

  const { value, expiry } = JSON.parse(item);
  if (Date.now() > expiry) {
    localStorage.removeItem(key); // Remove expired cache
    return null;
  }
  return value;
}

// Utility: Set cached data with expiry
function setLocalStorageWithExpiry(key: string, value: any, expiryTime: number) {
  const expiry = Date.now() + expiryTime;
  const data = { value, expiry };
  localStorage.setItem(key, JSON.stringify(data));
}

// Server-side in-memory cache
const serverCache: Record<string, Job[]> = {};

// Check if running on client-side
const isClient = typeof window !== 'undefined';

// Fetch jobs with hybrid caching
async function fetchJobs(filters: Record<string, string | undefined>, page: number): Promise<Job[]> {
  const queryParams = [
    filters.jobCategory && `p=${filters.jobCategory}`,
    filters.jobType && `et=${filters.jobType}`,
    filters.country && `lc=${filters.country}`,
    filters.industryExp && `exp=${filters.industryExp}`,
    filters.category && `ws=${filters.category}`,
    filters.discipline && `d=${filters.discipline}`,
    filters.keyword && `q=${filters.keyword}`,
    `pg=${page}`,
  ]
    .filter(Boolean)
    .join('&');

  const cacheKey = `${queryParams}_${page}`;

  // Check server-side cache
  if (serverCache[cacheKey]) {
    console.log('Returning data from server-side cache');
    return serverCache[cacheKey];
  }

  // Check client-side cache with expiry
  if (isClient) {
    const cachedData = getLocalStorageWithExpiry(cacheKey);
    if (cachedData) {
      console.log('Returning data from client-side cache (localStorage)');
      return cachedData;
    }
  }

  // Fetch from API
  const url = `https://gcsservices.careers.microsoft.com/search/api/v1/search?${queryParams}&l=en_us&pgSz=10&o=Relevance&flt=true`;
  
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Error fetching data: ${res.statusText}`);
  }

  const data = await res.json();
  const jobs = data.operationResult?.result?.jobs || [];

  // Cache results
  serverCache[cacheKey] = jobs;
  if (isClient) {
    setLocalStorageWithExpiry(cacheKey, jobs, CACHE_EXPIRY_TIME);
  }

  console.log('Caching new data');
  return jobs;
}

// Fetch job details in batches
async function fetchJobDetails(jobIds: string[]): Promise<Record<string, Partial<Job>>> {
  const jobDetails: Record<string, Partial<Job>> = {};

  const detailPromises = jobIds.map(async (jobId) => {
    const aiResumeUrl = `https://gcsservices.careers.microsoft.com/search/api/v1/job/${jobId}?lang=en_us`;
    const res = await fetch(aiResumeUrl);

    if (res.ok) {
      const data = await res.json();
      jobDetails[jobId] = {
        description: data.operationResult.result.description || '',
        qualifications: data.operationResult.result.qualifications || '',
        responsibilities: data.operationResult.result.responsibilities || '',
      };
    }
  });

  await Promise.all(detailPromises);
  return jobDetails;
}

const Microsoft = async ({ searchParams }: MicrosoftProps) => {
  const currentPage = parseInt(searchParams.page || '1', 10);
  const normalizedParams = normalizeParams(searchParams);
  const selectedCompany = 'Microsoft';

  let jobs: Job[] = [];
  let error: string | null = null;

  try {
    // Fetch jobs with filters
    jobs = await fetchJobs(searchParams, currentPage);

    // Fetch job details concurrently
    const jobIds = jobs.map((job) => job.jobId);
    const jobDetails = await fetchJobDetails(jobIds);

    // Merge job details with job objects
    jobs = jobs.map((job) => ({
      ...job,
      description: jobDetails[job.jobId]?.description || '',
      qualifications: jobDetails[job.jobId]?.qualifications || '',
      responsibilities: jobDetails[job.jobId]?.responsibilities || '',
    }));
  } catch (err) {
    error = (err as Error).message;
  }

  const sanitizedSearchParams = Object.entries(searchParams)
    .filter(([key, value]) => value)
    .reduce((acc, [key, value]) => {
      acc[key] = value as string;
      return acc;
    }, {} as Record<string, string>);

  return (
    <div className="p-4">
      {/* Search Form */}
      <div className="mb-4">
        <SearchForm initialKeyword={searchParams.keyword || ''} />
      </div>

      {/* Dropdown Filters */}
      <div className="flex flex-col mb-6 space-y-4 sm:flex-row sm:space-x-4 sm:space-y-0 w-full">
        <DropdownFilter
          jobCategory={jobCategory}
          category={category}
          jobType={jobType}
          country={country}
          industryExp={industryExp}
          discipline={discipline}
          currentParams={normalizedParams}
          selectedCompany={selectedCompany}
        />
      </div>

      {/* Job Listings */}
      {error ? (
        <div>{error}</div>
      ) : jobs.length === 0 ? (
        <div>No jobs available.</div>
      ) : (
        <ul>
          {jobs.map((job) => (
            <li key={job.jobId}>
              <JobCard
                job={{
                  title: job.title,
                  id_icims: job.jobId,
                  posted_date: job.postingDate,
                  job_path: `https://jobs.careers.microsoft.com/global/en/job/${job.jobId}`,
                  normalized_location: job.properties.locations.join(', '),
                  basic_qualifications: job.qualifications,
                  description: job.description,
                  responsibilities: job.responsibilities,
                }}
                onToggleDetails={() => {}}
                isSelected={false}
                baseUrl=""
              />
            </li>
          ))}
        </ul>
      )}

      {/* Pagination */}
      <Pagination
        currentPage={currentPage}
        updatedSearchParams={sanitizedSearchParams}
        loading={false}
      />
    </div>
  );
};

export default Microsoft;
