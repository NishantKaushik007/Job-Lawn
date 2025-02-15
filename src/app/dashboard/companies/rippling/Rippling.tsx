import DropdownFilter from './DropdownFilter';
import { jobCategory, location } from '../../../../Data/data';

interface Job {
    uuid: string;
    name: string;
    url: string;
    workLocation: {
        id: string;
        label: string;
    };
    department: {
        id: string;
        label: string;
    };
    title: string;
    basic_qualifications: string; 
    description: string; 
    preferred_qualifications: string; 
}

interface RipplingProps {
    selectedCompany: string;
}

async function fetchBuildId() {
    const url = 'https://www.rippling.com/en-GB/careers/open-roles';
    const response = await fetch(url, { next: { revalidate: 60 } });
    const text = await response.text();
    const match = text.match(/window\.__BUILD_ID__\s*=\s*['"]([^'"]+)['"]/);
    return match ? match[1] : null;
}

async function fetchJobs(buildId: string) {
    const url = `https://www.rippling.com/_next/data/${buildId}/en-GB/careers/open-roles.json`;
    const res = await fetch(url, { next: { revalidate: 60 } });
    if (!res.ok) {
        throw new Error('Failed to fetch jobs.');
    }
    const data = await res.json();
    return data.pageProps?.jobs || [];
}

export default async function Rippling({ selectedCompany }: RipplingProps) {
    const buildId = await fetchBuildId();
    if (!buildId) {
        return <div>Failed to fetch Build ID</div>;
    }

    const jobs: Job[] = await fetchJobs(buildId);

    const filteredJobCategories = jobCategory
        .filter(option => option.company === selectedCompany)
        .map(option => ({
            label: option.value,
            value: option.code,
        }));

    const filteredLocations = location
        .filter(option => option.company === selectedCompany)
        .map(option => ({
            label: option.value,
            value: option.code,
        }));

    return (
        <div className='p-4'>
            <DropdownFilter 
                jobCategories={filteredJobCategories} 
                locations={filteredLocations} 
                jobs={jobs} 
            />
        </div>
    );
}
