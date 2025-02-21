import { jobCategory, category, country, jobType, experienceLevel } from '../../../../Data/data';
import DropdownFilter from './DropdownFilter';
import JobCard from '../../components/JobCard/JobCard';
import Pagination from './Pagination';
import SearchForm from '../../components/SearchForm';

interface Location {
  CityName: string;
  CountryName: string;
}

interface Job {
  MatchedObjectId: string;
  MatchedObjectDescriptor: {
    PositionID: string;
    PositionTitle: string;
    PositionURI: string;
    PublicationStartDate: string;
    PositionLocation: Location[];
    PositionFormattedDescription?: {
      Content: string;
    };
  };
  description?: string;
}

interface DeutscheProps {
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

// Fetch jobs
async function fetchJobs(filters: Record<string, string | undefined>, page: number): Promise<Job[]> {
  const cacheKey = JSON.stringify({ filters, page });

  // Check local cache
  const cachedData = jobCache[cacheKey];
  if (cachedData && Date.now() - cachedData.timestamp < CACHE_EXPIRY_TIME) {
    console.log('Using cached data');
    return cachedData.data;
  }

  const searchCriteria = [
    filters.keyword ? `{%22CriterionName%22:%22PositionFormattedDescription.Content%22,%22CriterionValue%22:%22${filters.keyword}%22}` : null,
    filters.jobCategory ? `{%22CriterionName%22:%22Profession.Code%22,%22CriterionValue%22:${filters.jobCategory}}` : null,
    filters.country ? `{%22CriterionName%22:%22PositionLocation.Country%22,%22CriterionValue%22:${filters.country}}` : null,
    filters.category ? `{%22CriterionName%22:%22PositionOfferingType.Code%22,%22CriterionValue%22:${filters.category}}` : null,
    filters.jobType ? `{%22CriterionName%22:%22PositionSchedule.Code%22,%22CriterionValue%22:${filters.jobType}}` : null,
    filters.experienceLevel ? `{%22CriterionName%22:%22CareerLevel.Code%22,%22CriterionValue%22:${filters.experienceLevel}}` : null,
  ].filter((criteria) => criteria !== null);

  const url = `https://api-deutschebank.beesite.de/search/?data={
    %22LanguageCode%22:%22en%22,
    %22SearchParameters%22:{
      %22FirstItem%22:${(page - 1) * 10 + 1},
      %22CountItem%22:10,
      %22MatchedObjectDescriptor%22:[
        %22PositionID%22,%22PositionTitle%22,%22PositionURI%22,
        %22PublicationStartDate%22,%22PositionLocation.CityName%22,
        %22PositionLocation.CountryName%22,%22PositionFormattedDescription.Content%22
      ],
      %22Sort%22:[{%22Criterion%22:%22PublicationStartDate%22,%22Direction%22:%22DESC%22}]
    },
    %22SearchCriteria%22:[${searchCriteria.join(',')}]
  }`;

  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to fetch jobs: ${response.statusText}`);
    }

    const data = await response.json();
    const jobs = data.SearchResult?.SearchResultItems?.map((job: any) => ({
      MatchedObjectId: job.MatchedObjectId,
      MatchedObjectDescriptor: {
        PositionID: job.MatchedObjectDescriptor.PositionID,
        PositionTitle: job.MatchedObjectDescriptor.PositionTitle,
        PositionURI: job.MatchedObjectDescriptor.PositionURI,
        PublicationStartDate: job.MatchedObjectDescriptor.PublicationStartDate,
        PositionLocation: job.MatchedObjectDescriptor.PositionLocation || [],
        PositionFormattedDescription: job.MatchedObjectDescriptor.PositionFormattedDescription,
      },
    })) || [];

    // Cache the result
    jobCache[cacheKey] = { data: jobs, timestamp: Date.now() };

    return jobs;
  } catch (error) {
    console.error('Error fetching jobs:', error);
    return [];
  }
}

// Fetch job details using fetch instead of axios
const fetchJobDetails = async (jobId: string) => {
  const aiResumeUrl = `https://api-deutschebank.beesite.de/jobhtml/${jobId}`;

  try {
    const response = await fetch(aiResumeUrl);
    if (!response.ok) {
      throw new Error(`Error fetching job details: ${response.statusText}`);
    }
    const jobDetails = await response.json();

    return jobDetails.html || '';
  } catch (error) {
    console.error('Error fetching job details:', error);
    return '';
  }
};

export default async function DeutschePage({ searchParams }: DeutscheProps) {
  const currentPage = parseInt(searchParams.page || '1', 10);
  const normalizedParams = normalizeParams(searchParams);

  const selectedCompany = 'Deutsche Bank';

  let jobs: Job[] = [];
  let error: string | null = null;

  const filters = transformFilters(normalizedParams);

  try {
    jobs = await fetchJobs(filters, currentPage);
    // Fetch job details for each job asynchronously
    for (let job of jobs) {
      job.description = await fetchJobDetails(job.MatchedObjectDescriptor.PositionID);
    }
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
        <div className="mb-4">
          <SearchForm initialKeyword={initialKeyword} />
        </div>
        <DropdownFilter
          jobCategory={jobCategory}
          country={country}
          category={category}
          jobType={jobType}
          experienceLevel={experienceLevel}
          currentParams={normalizedParams}
          selectedCompany={selectedCompany}
        />
      </div>

      {error ? (
        <div className="text-red-500">Error: {error}</div>
      ) : jobs.length === 0 ? (
        <div className="text-center text-white mt-4">No job found for selected criteria.</div>
      ) : (
        <ul className="space-y-4">
          {jobs.map((job) => (
            <li key={job.MatchedObjectId}>
              <JobCard
                job={{
                  title: job.MatchedObjectDescriptor.PositionTitle,
                  id_icims: job.MatchedObjectDescriptor.PositionID,
                  posted_date: job.MatchedObjectDescriptor.PublicationStartDate,
                  job_path: job.MatchedObjectDescriptor.PositionID,
                  normalized_location: job.MatchedObjectDescriptor.PositionLocation
                    ?.map((loc) => `${loc.CityName}`)
                    .join(' | ') || 'Location not specified',
                  description: job.description || '',
                }}
                onToggleDetails={() => {}}
                isSelected={false}
                baseUrl="https://careers.db.com/professionals/search-roles/#/professional/job/"
              />
            </li>
          ))}
        </ul>
      )}

      <Pagination currentPage={currentPage} updatedSearchParams={sanitizedSearchParams} loading={false}  disableNext={jobs.length < 10} />
    </div>
  );
}
