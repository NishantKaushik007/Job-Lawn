// app/page.tsx (or your server component file)

import JobCard from '../../components/JobCard/JobCard';
import Pagination from './Pagination';
import DropdownFilter from './DropdownFilter';

// Manual cache object
const cache = new Map<string, { data: any; expiresAt: number }>();

// Function to fetch data with manual caching
const fetchWithManualCache = async (key: string, ttl: number, fetchFn: () => Promise<any>) => {
  const now = Date.now();

  // Check if the cache has the key and it's not expired
  if (cache.has(key)) {
    const cachedEntry = cache.get(key)!;
    if (cachedEntry.expiresAt > now) {
      console.log(`Cache hit for key: ${key}`);
      return cachedEntry.data;
    } else {
      console.log(`Cache expired for key: ${key}`);
      cache.delete(key); // Remove expired entry
    }
  }

  // If not in cache or expired, fetch fresh data
  console.log(`Cache miss for key: ${key}. Fetching data...`);
  const data = await fetchFn();
  cache.set(key, { data, expiresAt: now + ttl }); // Store in cache with expiration time
  return data;
};

// Fetch jobs from the API with caching
const fetchJobs = async (filters: Record<string, string | undefined>, page: number): Promise<any[]> => {
  const queryParams = [
    filters.jobCategory && `category=${filters.jobCategory}`,
    filters.country && `country=${filters.country}`,
    `page=${page}`,
    `results_per_page=10`,
  ]
    .filter(Boolean)
    .join('&');

  const url = `https://careers.makemytrip.com/api/jobs?${queryParams}`;

  // Define a unique cache key based on filters and page
  const cacheKey = `jobs:${queryParams}`;

  // Fetch with manual caching (TTL: 1 hour = 3600000 ms)
  return fetchWithManualCache(cacheKey, 3600000, async () => {
    const res = await fetch(url);
    if (!res.ok) {
      throw new Error(`Error fetching data: ${res.statusText}`);
    }
    const data = await res.json();

    if (!Array.isArray(data.data)) {
      throw new Error('Fetched data is not an array');
    }

    return data.data;
  });
};

// Fetch job description with caching
const fetchJobDescription = async (jobId: string): Promise<string> => {
  const cacheKey = `jobDescription:${jobId}`;

  // Fetch with manual caching (TTL: 1 hour = 3600000 ms)
  return fetchWithManualCache(cacheKey, 3600000, async () => {
    const url = `https://careers.makemytrip.com/api/jobDetails?jobId=${jobId}`;
    const res = await fetch(url);

    if (!res.ok) {
      throw new Error(`Error fetching job description for ${jobId}`);
    }

    const data = await res.json();

    if (data.status === 1) {
      return data.data.job_decription || '';
    } else {
      return '';
    }
  });
};

export default async function MakeMyTrip({
  searchParams,
  selectedCompany = 'Make My Trip',
}: {
  searchParams: Record<string, string | undefined>;
  selectedCompany: string;
}) {
  const currentPage = parseInt(searchParams.page || '1', 10);
  const resultsPerPage = 10;

  const filters = Object.fromEntries(
    Object.entries(searchParams).map(([key, value]) => [key, value])
  );

  let jobs: any[] = [];
  let jobCategories: string[] = [];
  let countries: string[] = [];
  let jobDescriptions: Record<string, string> = {};

  try {
    // Fetch jobs with caching
    jobs = await fetchJobs(filters, currentPage);

    // Extract unique job categories and countries
    jobCategories = [...new Set(jobs.map((job) => job.business_unit))].filter(Boolean);
    countries = [...new Set(jobs.map((job) => job.location_country))].filter(Boolean);

    // Fetch job descriptions for jobs posted on the careers page
    for (const job of jobs) {
      if (job.post_on_careers_page === 1) {
        jobDescriptions[job.job_id] = await fetchJobDescription(job.job_id);
      }
    }

    // Filter and paginate jobs
    const filteredJobs = jobs.filter((job) => {
      const locationMatch = searchParams.country
        ? job.location.some((loc: string) => new RegExp(searchParams.country!, 'i').test(loc))
        : true;

      const businessUnitMatch = searchParams.jobCategory
        ? job.business_unit === searchParams.jobCategory
        : true;

      return locationMatch && businessUnitMatch && job.post_on_careers_page === 1;
    });

    const indexOfLastJob = currentPage * resultsPerPage;
    const indexOfFirstJob = indexOfLastJob - resultsPerPage;
    const currentJobs = filteredJobs.slice(indexOfFirstJob, indexOfLastJob);

    return (
      <div className="p-4">
        <div className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-4 mb-6">
          <DropdownFilter
            label="Departments"
            options={jobCategories}
            searchParamsKey="jobCategory"
            currentValue={searchParams.jobCategory}
          />
          <DropdownFilter
            label="Locations"
            options={countries}
            searchParamsKey="country"
            currentValue={searchParams.country}
          />
        </div>

        <div className="job-list">
          {currentJobs.length > 0 ? (
            currentJobs.map((job) => (
              <JobCard
                key={job.job_id}
                job={{
                  title: job.job_title,
                  id_icims: job.job_id,
                  posted_date: job.job_updated_timestamp,
                  job_path: `https://careers.makemytrip.com/prod/opportunity/${job.job_id}/${formatJobTitle(
                    job.job_title
                  )}`,
                  normalized_location: job.location.join(', ') || 'Not Specified',
                  description: jobDescriptions[job.job_id] || 'Loading description...',
                }}
                onToggleDetails={() => {}}
                isSelected={false}
                baseUrl=""
              />
            ))
          ) : (
            <div className="text-center text-white mt-4">
              No job found for selected criteria.
            </div>
          )}
        </div>

        <Pagination
          currentPage={currentPage}
          totalResults={filteredJobs.length}
          resultsPerPage={resultsPerPage}
          loading={false}
          disableNext={filteredJobs.length < 10}
        />
      </div>
    );
  } catch (error) {
    console.error('Error fetching jobs:', error);
    return <div>Error loading jobs. Please try again later.</div>;
  }
}

const formatJobTitle = (title: string | null | undefined) => {
  if (!title) return '';
  return title.replace(/\//g, '-').replace(/\s+/g, '-');
};
