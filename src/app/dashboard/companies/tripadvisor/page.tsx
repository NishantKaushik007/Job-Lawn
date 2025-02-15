import DropdownFilter from "./DropdownFilter";

// Cache expiry time (2 minutes in milliseconds)
const CACHE_EXPIRY_TIME = 2 * 60 * 1000;

// Simple in-memory cache
const cache: { data?: any; timestamp?: number } = {};

export default async function Page() {
  const currentTime = Date.now();

  if (cache.data && currentTime - (cache.timestamp || 0) < CACHE_EXPIRY_TIME) {
    console.log("Fetching data from cache...");
    return <DropdownFilter {...cache.data} />;
  }

  console.log("Fetching fresh data from API...");

  try {
    const res = await fetch("https://boards-api.greenhouse.io/v1/boards/tripadvisor/jobs?content=true");

    if (!res.ok) {
      throw new Error(`Failed to fetch jobs: ${res.status} ${res.statusText}`);
    }

    const data = await res.json();
    const jobs = data.jobs || [];

    type Job = {
      internal_job_id: string;
      id: number;
      title: string;
      absolute_url: string;
      location: { name: string };
      metadata: { id: number; name: string; value: string | string[] | null }[];
      updated_at: string;
      content: string;
      offices: { id: number; name: string; location: string }[];
      departments: { id: number; name: string; child_ids: number[]; parent_id: number | null }[];
      requisition_id: string;
      data_compliance: { type: string; requires_consent: boolean; requires_processing_consent: boolean; requires_retention_consent: boolean; retention_period: null | any; demographic_data_consent_applies: boolean }[];
    };

    const jobList: Job[] = jobs;

    const offices = Array.from(new Set(jobList.flatMap((job) => job.offices.map((office) => office.name))));
    const departments = Array.from(new Set(jobList.flatMap((job) => job.departments.map((department) => department.name))));

    // Correctly extract all metadata values as strings, handling nulls and arrays
    const metadataValues = Array.from(new Set(jobList.flatMap(job => 
        job.metadata.flatMap(meta => 
            meta.value ? (Array.isArray(meta.value) ? meta.value : [meta.value]) : []
        ).map(String)
    )));

    cache.data = { offices, departments, metadataValues, jobs: jobList };
    cache.timestamp = currentTime;

    return (
      <DropdownFilter
        offices={offices.filter((office): office is string => typeof office === "string")}
        departments={departments.filter((department): department is string => typeof department === "string")}
        metadataValues={metadataValues.filter((metadataValue): metadataValue is string => typeof metadataValue === "string")}
        jobs={jobList}
      />
    );
  } catch (error) {
    console.error("Error fetching or processing data:", error);
    return <div>Error loading data.</div>;
  }
}