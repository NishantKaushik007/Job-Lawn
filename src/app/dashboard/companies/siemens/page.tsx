import JobCard from '../../components/JobCard/JobCard';
import Pagination from './Pagination';
import DropdownFilter from './DropdownFilter';
import { jobCategory, jobType, location, experienceLevel, category } from '../../../../Data/data';
import SearchForm from '../../components/SearchForm';

// Define the Job interface
interface Job {
    name: string;
    display_job_id: string;
    canonicalPositionUrl: string;
    locations: string[];
    id: string;
    custom_JD: {
        data_fields: {
            posting_date: string[];
        };
    };
    description: string;
}

const CACHE_EXPIRY_TIME = 60 * 1000 * 2; // 2 minutes
const RESULTS_PER_PAGE = 10; // Define how many results per page

let serverCache: Record<string, { jobs: Job[]; totalJobsCount: number }> = {};
let isClient = typeof window !== 'undefined'; // Check if running on the client side

const getLocalStorageWithExpiry = (key: string): { jobs: Job[]; totalJobsCount: number } | null => {
    if (typeof window !== 'undefined') {
        const cachedData = localStorage.getItem(key);
        if (cachedData) {
            const { data, timestamp } = JSON.parse(cachedData);
            if (Date.now() - timestamp < CACHE_EXPIRY_TIME) {
                return { jobs: data, totalJobsCount: data.length };
            }
        }
    }
    return null;
};

const saveToLocalStorage = (key: string, data: Job[]): void => {
    if (typeof window !== 'undefined') {
        const cacheObject = { data, timestamp: Date.now() };
        localStorage.setItem(key, JSON.stringify(cacheObject));
    }
};

const transformFilters = (filters: Record<string, string[] | undefined>): Record<string, string | undefined> => {
    const transformedFilters: Record<string, string | undefined> = {};
    for (const key in filters) {
        if (filters[key]) {
            transformedFilters[key] = filters[key]?.[0];
        }
    }
    return transformedFilters;
};

const fetchJobs = async (
    filters: Record<string, string[] | undefined>,
    page: number,
    keyword: string
): Promise<{ jobs: Job[]; totalJobsCount: number }> => {
    const cacheKey = `jobs-cache-${JSON.stringify(filters)}-${page}-${keyword}`;

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

    try {
        // Construct the query parameters
        const queryParams = [
            filters.location && `location=${filters.location[0]}`,
            filters.experienceLevel && `level=${filters.experienceLevel[0]}`,
            filters.jobCategory && `family=${filters.jobCategory[0]}`,
            filters.category && `is_remote=${filters.category[0]}`,
            filters.jobType && `fulltime_or_parttime=${filters.jobType[0]}`,
            filters.keyword && `query=${filters.keyword[0].replace(/\s+/g, '+')}`, // Handle spaces in keyword
            `start=${(page - 1) * RESULTS_PER_PAGE}`, // Calculate starting point
            `num=${RESULTS_PER_PAGE}`, // Results per page
        ]
            .filter(Boolean) // Filter out falsy values
            .join('&'); // Join with '&'
    
        // Construct the final URL
        const url = `https://jobs.siemens.com/api/apply/v2/jobs?domain=siemens.com&${queryParams}`;
        console.log(url);
        
    
        // Fetch data from the API
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`Failed to fetch jobs: ${response.statusText}`);
        }
    
        const data = await response.json();
        const jobs = data.positions;
    
        // Get the total jobs count
        const totalJobsCount = data?.items?.[0]?.TotalJobsCount || 0;
    
        // Cache data if on the client side
        if (isClient) {
            saveToLocalStorage(cacheKey, jobs);
        }
    
        // Save data to server-side cache
        serverCache[cacheKey] = { jobs, totalJobsCount };
    
        return { jobs, totalJobsCount };
    
    } catch (error) {
        console.error('Error fetching jobs:', error);
        throw new Error('Failed to fetch jobs');
    }
    
};

const fetchJobDetails = async (jobId: string, postingDateAccumulator: { [key: string]: string }): Promise<Partial<Job>> => {
    try {
        // Ensure jobId is valid
        if (!jobId) {
            throw new Error('Invalid jobId provided');
        }
    
        const url = `https://jobs.siemens.com/api/apply/v2/jobs/${jobId}?domain=siemens.com`;
        const response = await fetch(url);
    
        if (!response.ok) {
            throw new Error(`Failed to fetch job details: ${response.statusText}`);
        }
    
        const data = await response.json();
    
        // Safely access the posted date, ensure it's an array and not empty
        const postingDate = Array.isArray(data.custom_JD.data_fields?.posting_date) && data.custom_JD.data_fields?.posting_date.length
            ? data.custom_JD.data_fields.posting_date[0]
            : '';
    
        // Store the posting date in accumulator
        postingDateAccumulator[jobId] = postingDate;
    
        return {
            description: data?.job_description || '', // Fallback to empty string if no description is found
        };
    } catch (error) {
        console.error('Error fetching job details:', error);
        return {}; // Return an empty object on error
    }
    
};

const MorganStanley = async ({ searchParams }: { searchParams: Record<string, string | undefined> }) => {
    const { location: selectedLocation, jobCategory: selectedJobCategory, experienceLevel: selectedExperienceLevel, jobType: selectedJobType, category: selectedCategory, page, keyword } = searchParams;

    const selectedCompany = 'Siemens';

    const jobCategoryDropdown = (jobCategory ?? []).filter((item) => item.company === selectedCompany);
    const locationDropdown = (location ?? []).filter((item) => item.company === selectedCompany);
    const jobTypeDropdown = (jobType ?? []).filter((item) => item.company === selectedCompany);
    const experienceLevelDropdown = (experienceLevel ?? []).filter((item) => item.company === selectedCompany);
    const categoryDropdown = (category ?? []).filter((item) => item.company === selectedCompany);

    const filters: Record<string, string[] | undefined> = {
        location: selectedLocation ? [selectedLocation] : undefined,
        jobCategory: selectedJobCategory ? [selectedJobCategory] : undefined,
        experienceLevel: selectedExperienceLevel ? [selectedExperienceLevel] : undefined,
        jobType: selectedJobType ? [selectedJobType] : undefined,
        category: selectedCategory ? [selectedCategory] : undefined,
        keyword: keyword ? [keyword] : undefined,
    };

    const transformedFilters = transformFilters(filters);
    const currentPage = parseInt(page || '1', 10);
    const searchKeyword = keyword || '';

    // Initialize posting date accumulator
    const newPostingDates: { [key: string]: string } = {};

    // Fetch jobs and append job descriptions
    const { jobs, totalJobsCount } = await fetchJobs(filters, currentPage, searchKeyword);
    const jobsWithDetails = await Promise.all(
        jobs.map(async (job) => {
            const details = await fetchJobDetails(job.id, newPostingDates);
            return {
                ...job, // Spread the original job object
                description: details.description || job.description || '', // Merge the description
            };
        })
    );

    return (
        <div className="p-4">
            {/* Search Form */}
            <div className="mb-4">
                <SearchForm initialKeyword={searchKeyword} />
            </div>

            {/* Filters */}
            <div className="filters">
                <DropdownFilter
                    jobCategory={jobCategoryDropdown}
                    location={locationDropdown}
                    jobType={jobTypeDropdown}
                    experienceLevel={experienceLevelDropdown}
                    category={categoryDropdown}
                    currentParams={filters}
                    selectedCompany={selectedCompany}
                />
            </div>

            {/* Job Cards */}
            <div className="job-list">
                {jobsWithDetails.length === 0 ? (
                    <div className='text-center text-white mt-4'>No jobs available for the selected criteria.</div>
                ) : (
                    jobsWithDetails.map((job) => (
                        <JobCard
                            key={job.id}
                            job={{
                                title: job.name,
                                id_icims: job.display_job_id,
                                posted_date: newPostingDates[job.id] || '', // Use posting date from accumulator
                                job_path: job.canonicalPositionUrl,
                                normalized_location: job.locations.join(' | '),
                                basic_qualifications: '',
                                description: job.description,
                                preferred_qualifications: '',
                                responsibilities: '',
                            }}
                            onToggleDetails={() => console.log(`Toggled details for job ID: ${job.id}`)}
                            isSelected={searchParams.selectedJobId === job.id}
                            baseUrl=""
                        />
                    ))
                )}
            </div>

            {/* Pagination */}
            <Pagination currentPage={currentPage} totalResults={totalJobsCount} resultsPerPage={10} updatedSearchParams={transformedFilters} disableNext={jobs.length < 10} />
        </div>
    );
};

export default MorganStanley;
