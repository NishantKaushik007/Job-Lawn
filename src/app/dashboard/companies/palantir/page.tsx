'use server';

import { PalantirServer } from './PalantirServer';

interface Categories {
  commitment: string;
  location: string;
  team: string;
  allLocations: string[];
}

interface Lists {
  text: string;
  content: string;
}

interface Content {
  descriptionHtml: string;
  lists: Lists[];
  closingHtml: string;
}

interface Urls {
  show: string;
}

interface Data {
  id: string;
  text: string;
  categories: Categories;
  tags: string[];
  content: Content;
  urls: Urls;
  updatedAt: string;
}

// Cache to store job data and the time it was fetched
const jobsCache: {
  data: Data[] | null;
  lastFetched: number | null;
} = {
  data: null,
  lastFetched: null,
};

// Cache expiration time (in milliseconds)
const CACHE_EXPIRATION_TIME = 60 * 1000 * 2; // 2 minute

const fetchJobsData = async (initialJobs: Data[]) => {
  const now = Date.now();

  // Check if cached data exists and is still valid
  if (jobsCache.data && jobsCache.lastFetched && now - jobsCache.lastFetched < CACHE_EXPIRATION_TIME) {
    console.log('Returning cached jobs data');
    return jobsCache.data;
  }

  console.log('Fetching fresh jobs data');

  let allJobs: Data[] = [...initialJobs]; // Start with initial jobs
  let fetchUrl = `https://www.palantir.com/api/lever/v1/postings?state=published`; // Start from offset 0

  while (fetchUrl) {
    const res = await fetch(fetchUrl);
    const data = await res.json();

    if (data && Array.isArray(data.data)) {
      allJobs = [...allJobs, ...data.data];
    } else {
      console.error('Invalid response structure: data.data is not an array');
      break;
    }

    if (data.hasNext && data.next) {
      fetchUrl = `https://www.palantir.com/api/lever/v1/postings?state=published&offset=${encodeURIComponent(data.next)}`;
    } else {
      fetchUrl = ''; // End fetching when there is no next URL
    }
  }

  // Update the cache
  jobsCache.data = allJobs;
  jobsCache.lastFetched = now;

  return allJobs;
};

const PalantirPage = async () => {
  // Fetch job listings data server-side and apply pagination
  const jobListings = await fetchJobsData([]);

  return (
    <div className="p-4">
      <PalantirServer jobs={{ data: jobListings, hasNext: false, next: '' }} />
    </div>
  );
};

export default PalantirPage;
