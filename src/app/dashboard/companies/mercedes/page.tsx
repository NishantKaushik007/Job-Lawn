import { jobCategory, experienceLevel, country, jobType } from '../../../../Data/data';
import DropdownFilter from './DropdownFilter';
import JobCard from '../../components/JobCard/JobCard';
import Pagination from './Pagination';
import SearchForm from '../../components/SearchForm';

interface Location {
  CityName: string;
  CountryCode: string;
}

interface Job {
  MatchedObjectId: string;
  MatchedObjectDescriptor: {
    ID: string;
    PositionID: string;
    PositionTitle: string;
    PositionURI: string;
    PublicationStartDate: string;
    PositionLocation: Location[];
  };
}

interface MercedesProps {
  searchParams: Record<string, string | undefined>;
}

// Cache expiry time (2 minutes)
const CACHE_EXPIRY_TIME = 60 * 1000 * 2;

// Global in-memory cache
const jobCache: Record<string, { data: Job[]; timestamp: number }> = {};

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
async function fetchJobs(filters: Record<string, string | undefined>, page: number): Promise<Job[]> {
  const cacheKey = JSON.stringify({ filters, page });

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
    filters.keyword && `,%7B%22CriterionName%22:%22PositionFormattedDescription.Content%22,%22CriterionValue%22:[%22${filters.keyword}%22]%7D`,
    filters.country && `,%7B%22CriterionName%22:%22PositionLocation.Country%22,%22CriterionValue%22:[${filters.country}]%7D`,
    filters.jobCategory && `,%7B%22CriterionName%22:%22JobCategory.Code%22,%22CriterionValue%22:[${filters.jobCategory}]%7D`,
    filters.experienceLevel && `,%7B%22CriterionName%22:%22CareerLevel.Code%22,%22CriterionValue%22:[${filters.experienceLevel}]%7D`,
    filters.jobType && `,%7B%22CriterionName%22:%22PositionSchedule.Code%22,%22CriterionValue%22:[${filters.jobType}]%7D`,
  ]
    .filter(Boolean)
    .join('');

  const url = `https://mercedes-benz-beesite-production-gjb.app.beesite.de/search?data=%7B%22LanguageCode%22:%22EN%22,%22SearchParameters%22:%7B%22FirstItem%22:${(page - 1) * 10 + 1},%22CountItem%22:10,%22Sort%22:[%7B%22Criterion%22:%22PublicationStartDate%22,%22Direction%22:%22DESC%22%7D],%22MatchedObjectDescriptor%22:[%22ID%22,%22PositionTitle%22,%22PositionURI%22,%22PublicationStartDate%22,%22PositionLocation.CityName%22,%22PositionLocation.CountryCode%22]%7D,%22SearchCriteria%22:[%7B%22CriterionName%22:%22PublicationLanguage.Code%22,%22CriterionValue%22:[%22EN%22]%7D${queryParams}]%7D`;

  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to fetch jobs: ${response.statusText}`);
    }

    const data = await response.json();

    const jobs = data.SearchResult?.SearchResultItems?.map((job: any) => ({
      MatchedObjectId: job.MatchedObjectId,
      MatchedObjectDescriptor: {
        ID: job.MatchedObjectDescriptor.ID,
        PositionID: job.MatchedObjectDescriptor.PositionID,
        PositionTitle: job.MatchedObjectDescriptor.PositionTitle,
        PositionURI: job.MatchedObjectDescriptor.PositionURI,
        PublicationStartDate: job.MatchedObjectDescriptor.PublicationStartDate,
        PositionLocation: job.MatchedObjectDescriptor.PositionLocation || [],
      },
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

export default async function MercedesPage({ searchParams }: MercedesProps) {
  const currentPage = parseInt(searchParams.page || '1', 10);
  const normalizedParams = normalizeParams(searchParams);

  const selectedCompany = 'Mercedes';

  let jobs: Job[] = [];
  let error: string | null = null;

  const filters = transformFilters(normalizedParams);

  try {
    jobs = await fetchJobs(filters, currentPage);
  } catch (err) {
    error = (err as Error).message;
  }

  const sanitizedSearchParams = Object.entries(searchParams)
    .filter(([key, value]) => value && key !== 'status' && key !== 'value')
    .reduce((acc, [key, value]) => {
      acc[key] = value as string;
      return acc;
    }, {} as Record<string, string>);

  const initialKeyword = Array.isArray(searchParams.keyword) ? searchParams.keyword[0] : (searchParams.keyword || '');

  return (
    <div className="p-4">
      <div>
        <div className='mb-4'>
            <SearchForm initialKeyword={initialKeyword}/>
        </div>
        <DropdownFilter
          jobCategory={jobCategory}
          country={country}
          experienceLevel={experienceLevel}
          jobType={jobType}
          currentParams={normalizedParams}
          selectedCompany={selectedCompany}
        />
      </div>

      {error ? (
        <div className="text-red-500">Error: {error}</div>
      ) : jobs.length === 0 ? (
        <div className="text-gray-500">No jobs available.</div>
      ) : (
        <ul className="space-y-4">
          {jobs.map((job) => (
            <li key={job.MatchedObjectId}>
              <JobCard
                job={{
                  title: job.MatchedObjectDescriptor.PositionTitle,
                  id_icims: job.MatchedObjectDescriptor.ID,
                  posted_date: job.MatchedObjectDescriptor.PublicationStartDate,
                  job_path: job.MatchedObjectDescriptor.PositionURI,
                  normalized_location: job.MatchedObjectDescriptor.PositionLocation?.map((loc) => loc.CityName).join(', ') || '',
                  basic_qualifications: '',
                  description: '',
                  responsibilities: '',
                }}
                onToggleDetails={() => {}}
                isSelected={false}
                baseUrl=""
              />
            </li>
          ))}
        </ul>
      )}

      <Pagination currentPage={currentPage} updatedSearchParams={sanitizedSearchParams} />
    </div>
  );
}
