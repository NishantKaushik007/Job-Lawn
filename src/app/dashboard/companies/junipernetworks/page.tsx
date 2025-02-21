import JobCard from '../../components/JobCard/JobCard';
import Pagination from './Pagination';
import DropdownFilter from './DropdownFilter';
import { jobCategory, location, industryExp, experienceLevel, skills } from '../../../../Data/data';
import SearchForm from '../../components/SearchForm';

// Define the Job interface
interface Job {
    name: string;
    display_job_id: string;
    canonicalPositionUrl: string;
    locations: string[];
    id: string;
    description?: string; // Added description field
}

interface JobDetails {
    Description: string;
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
        const { location, jobCategory, industryExp, experienceLevel, skills } = filters;

        const queryParams = [
            location && `location=${location[0]}`,
            jobCategory && `Category=${jobCategory[0]}`,
            industryExp && `Job%20Type=${industryExp[0]}`,
            experienceLevel && `Seniority=${experienceLevel[0]}`,
            skills && `Skills=${skills[0]}`,
            filters.keyword && `query=${filters.keyword}`, // Updated as per your request
            `start=${(page - 1) * RESULTS_PER_PAGE}`, // Calculate the starting point
            `num=${RESULTS_PER_PAGE}`, // Results per page
        ]
            .filter(Boolean) // Filter out undefined/null values
            .join('&');

        const url = `https://jobs.juniper.net/api/apply/v2/jobs?domain=juniper.net&${queryParams}&triggerGoButton=false`;

        const response = await fetch(url);
        if (!response.ok) {
            throw new Error('Failed to fetch jobs');
        }

        const data = await response.json();
        const jobs = data.positions;
        const totalJobsCount = data?.items?.[0]?.TotalJobsCount || 0;

        // Save to client-side cache (localStorage) if applicable
        if (isClient) {
            saveToLocalStorage(cacheKey, jobs);
        }

        // Save to server-side cache
        serverCache[cacheKey] = { jobs, totalJobsCount };

        return { jobs, totalJobsCount };
    } catch (error) {
        console.error('Error fetching jobs:', error);
        throw new Error('Failed to fetch jobs');
    }
};

const fetchJobDetails = async (jobId: string): Promise<JobDetails | null> => {
    try {
        const url = `https://jobs.juniper.net/api/apply/v2/jobs/${jobId}?domain=juniper.net`;
        const response = await fetch(url);

        if (!response.ok) {
            throw new Error('Failed to fetch job details');
        }

        const data = await response.json();

        return {
            Description: data.job_description || '',
        };
    } catch (error) {
        console.error('Error fetching job details:', error);
        return null;
    }
};

const JuniperNetworks = async ({ searchParams }: { searchParams: Record<string, string | undefined> }) => {
    const { location: selectedLocation, jobCategory: selectedJobCategory, industryExp: selectedIndustryExp, experienceLevel: selectedExperienceLevel, skills: selectedSkills, page, keyword } = searchParams;

    const selectedCompany = 'Juniper Networks';

    const jobCategoryDropdown = (jobCategory ?? []).filter((item) => item.company === selectedCompany);
    const locationDropdown = (location ?? []).filter((item) => item.company === selectedCompany);
    const industryExpDropdown = (industryExp ?? []).filter((item) => item.company === selectedCompany);
    const experienceLevelDropdown = (experienceLevel ?? []).filter((item) => item.company === selectedCompany);
    const skillsDropdown = (skills ?? []).filter((item) => item.company === selectedCompany);

    const filters: Record<string, string[] | undefined> = {
        location: selectedLocation ? [selectedLocation] : undefined,
        jobCategory: selectedJobCategory ? [selectedJobCategory] : undefined,
        industryExp: selectedIndustryExp ? [selectedIndustryExp] : undefined,
        experienceLevel: selectedExperienceLevel ? [selectedExperienceLevel] : undefined,
        skills: selectedSkills ? [selectedSkills] : undefined,
        keyword: keyword ? [keyword] : undefined, // Ensure keyword is part of filters
    };

    const transformedFilters = transformFilters(filters);
    const currentPage = parseInt(page || '1', 10);
    const searchKeyword = keyword || '';

    // Fetch jobs and append job descriptions
    const { jobs, totalJobsCount } = await fetchJobs(filters, currentPage, searchKeyword);
    const jobsWithDetails = await Promise.all(
        jobs.map(async (job) => {
            const details = await fetchJobDetails(job.id);
            return {
                ...job,
                description: details?.Description || '', // Append the description
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
                    industryExp={industryExpDropdown}
                    experienceLevel={experienceLevelDropdown}
                    skills={skillsDropdown}
                    currentParams={filters}
                    selectedCompany={selectedCompany}
                />
            </div>

            {/* Job Cards or No Jobs Message */}
            {jobsWithDetails.length > 0 ? (
                <div className="job-list">
                    {jobsWithDetails.map((job) => (
                        <JobCard
                            key={job.id}
                            job={{
                                title: job.name,
                                id_icims: job.display_job_id,
                                posted_date: '',
                                job_path: job.canonicalPositionUrl,
                                normalized_location: job.locations.join(', '),
                                basic_qualifications: '',
                                description: job.description, // Access description from job object
                                preferred_qualifications: '',
                                responsibilities: '',
                            }}
                            onToggleDetails={() => console.log(`Toggled details for job ID: ${job.id}`)}
                            isSelected={searchParams.selectedJobId === job.id}
                            baseUrl=""
                        />
                    ))}
                </div>
            ) : (
                <div className="text-center text-white mt-4">No job found for selected criteria.</div>
            )}

            {/* Pagination */}
            <Pagination
                currentPage={currentPage}
                totalResults={totalJobsCount}
                resultsPerPage={RESULTS_PER_PAGE}
                updatedSearchParams={transformedFilters}
                loading={false}
                disableNext={jobsWithDetails.length < 10}
            />
        </div>
    );
};

export default JuniperNetworks;
