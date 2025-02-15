import DropdownFilter from './DropdownFilter';
import JobCard from '../../components/JobCard/JobCard';
import Pagination from './Pagination';

interface JobDescription {
  websiteDescription: string;
  responsibilities: string;
  peopleWeAreLookingForStr: string;
}

interface JobLocations {
  name: string;
}

interface JobMetadata {
  activeOnWebsite: boolean;
  jobLocations: JobLocations[];
  workStatus: string;
  jobSeekerCategories: string[];
}

interface Department {
  name: string;
}

interface Job {
  id: string;
  displayName: string;
  jobDescription: JobDescription;
  jobHeaders: string[];
  jobMetadata: JobMetadata;
  department: Department;
  jobUrl: string;
}

// Cache expiry time (2 minutes in milliseconds)
const CACHE_EXPIRY_TIME = 2 * 60 * 1000;

// In-memory server-side cache
const jobCache: Record<string, { data: any; timestamp: number }> = {};

// Function to get data from localStorage with expiry validation
const getFromLocalStorage = (key: string) => {
  if (typeof window !== 'undefined') {
    const cachedData = localStorage.getItem(key);
    if (cachedData) {
      const { data, timestamp } = JSON.parse(cachedData);
      if (Date.now() - timestamp < CACHE_EXPIRY_TIME) {
        return data;
      }
    }
  }
  return null;
};

// Function to save data to localStorage
const saveToLocalStorage = (key: string, data: any) => {
  if (typeof window !== 'undefined') {
    const cacheObject = { data, timestamp: Date.now() };
    localStorage.setItem(key, JSON.stringify(cacheObject));
  }
};

// Fetch jobs function with hybrid caching
const fetchJobs = async (
  filters: Record<string, string | null>,
  page: number
): Promise<{ jobs: Job[]; totalPages: number; filterValues: { locations: string[]; departments: string[]; jobSeekerCategories: string[] } }> => {
  const cacheKey = JSON.stringify({ filters, page });

  // Check client-side cache
  const cachedClientData = getFromLocalStorage(cacheKey);
  if (cachedClientData) {
    console.log('Using client-side cached data');
    return cachedClientData;
  }

  // Check server-side cache
  const cachedServerData = jobCache[cacheKey];
  if (cachedServerData && Date.now() - cachedServerData.timestamp < CACHE_EXPIRY_TIME) {
    console.log('Using server-side cached data');
    return cachedServerData.data;
  }

  try {
    const response1 = await fetch(`https://www.apply.deshaw.com/services/jobs/getJobsActiveOnApplicationPages/1`, { cache: 'no-store' });
    const response2 = await fetch(`https://www.apply.deshaw.com/services/jobs/getJobsActiveOnApplicationPages/2`, { cache: 'no-store' });

    if (!response1.ok || !response2.ok) {
      throw new Error('Failed to fetch jobs');
    }

    const data1 = await response1.json();
    const data2 = await response2.json();
    const combinedJobs = [...data1, ...data2];
    const allJobs: Job[] = combinedJobs;

    // Filter active jobs
    const activeJobs = allJobs.filter((job) => job.jobMetadata.activeOnWebsite);

    // Extract unique filter values
    const uniqueLocations = [...new Set(activeJobs.flatMap((job) => job.jobMetadata.jobLocations.map((loc) => loc.name)))];
    const uniqueDepartments = [...new Set(activeJobs.map((job) => job.jobHeaders[0]))];
    const uniqueJobSeekerCategories = [...new Set(activeJobs.flatMap((job) => job.jobMetadata.jobSeekerCategories))];

    // Apply filters
    const filteredJobs = activeJobs.filter((job) => {
      const locationMatch = filters.location
        ? job.jobMetadata.jobLocations.some((location) => location.name === filters.location)
        : true;
      const departmentMatch = filters.department
        ? job.jobHeaders[0] === filters.department
        : true;
      const jobSeekerCategoryMatch = filters.jobSeekerCategory
        ? job.jobMetadata.jobSeekerCategories?.includes(filters.jobSeekerCategory) ?? false
        : true;
      return locationMatch && departmentMatch && jobSeekerCategoryMatch;
    });

    // Pagination logic
    const jobsPerPage = 10;
    const totalPages = Math.ceil(filteredJobs.length / jobsPerPage);
    const paginatedJobs = filteredJobs.slice((page - 1) * jobsPerPage, page * jobsPerPage);

    const result = { 
      jobs: paginatedJobs, 
      totalPages, 
      filterValues: { 
        locations: uniqueLocations, 
        departments: uniqueDepartments, 
        jobSeekerCategories: uniqueJobSeekerCategories 
      } 
    };

    // Cache result in both client-side and server-side caches
    saveToLocalStorage(cacheKey, result);
    jobCache[cacheKey] = { data: result, timestamp: Date.now() };

    console.log('Fetching fresh data');
    return result;
  } catch (error) {
    console.error('Error fetching jobs:', error);
    throw new Error('Failed to fetch jobs');
  }
};

const DeShaw = async ({ searchParams }: { searchParams: Record<string, string | undefined> }) => {
  const { location, department, jobSeekerCategory, page } = searchParams;

  const filters = {
    location: location || null,
    department: department || null,
    jobSeekerCategory: jobSeekerCategory || null,
  };

  const currentPage = parseInt(page || '1', 10);
  const { jobs, totalPages, filterValues } = await fetchJobs(filters, currentPage);

  const handleToggleDetails = (jobId: string) => {
    console.log(`Toggled details for job ID: ${jobId}`);
  };

  return (
    <div className='p-4'>

      {/* Filters */}
      <div className="filters flex flex-col mb-6 space-y-4 sm:flex-row sm:space-x-4 sm:space-y-0 w-full">
        <DropdownFilter
          label="Location"
          options={filterValues.locations}
          selectedValue={filters.location}
          paramKey="location"
        />
        <DropdownFilter
          label="Department"
          options={filterValues.departments}
          selectedValue={filters.department}
          paramKey="department"
        />
        <DropdownFilter
          label="Job Seeker Category"
          options={filterValues.jobSeekerCategories}
          selectedValue={filters.jobSeekerCategory}
          paramKey="jobSeekerCategory"
        />
      </div>

      {/* Job Cards */}
      <div className="job-list">
        {jobs.map((job) => {
          const baseUrl =
            job.jobMetadata.jobLocations.some(location => location.name === 'Gurugram' || location.name === 'Hyderabad' || location.name === 'Bengaluru')
              ? 'https://www.deshawindia.com/careers/'
              : 'https://www.deshaw.com/careers/';

          return (
            <JobCard
              key={job.id + job.jobUrl}
              job={{
                title: job.displayName,
                id_icims: job.id,
                posted_date: '',
                job_path: job.jobUrl.toLowerCase(),
                normalized_location: job.jobMetadata.jobLocations.map((location) => location.name).join(', ') || '',
                basic_qualifications: job.jobDescription.peopleWeAreLookingForStr || '',
                description: job.jobDescription.websiteDescription || '',
                preferred_qualifications: '',
                responsibilities: job.jobDescription.responsibilities || '',
              }}
              onToggleDetails={() => handleToggleDetails(job.id)}
              isSelected={filters.location === job.id}
              baseUrl={baseUrl}
            />
          );
        })}
      </div>

      {/* Pagination */}
      <Pagination currentPage={currentPage} totalPages={totalPages} />
    </div>
  );
};

export default DeShaw;
