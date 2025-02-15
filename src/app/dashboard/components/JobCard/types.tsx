export interface SecondaryLocation {
    Name: string; // Name of the secondary location
}

export interface Job {
    title: string;
    id_icims?: string; // Optional for backward compatibility
    req_id?: string;
    jobId?: string; // Optional for backward compatibility
    posted_date?: string; // Optional for backward compatibility
    postingDate?: string; // Optional for backward compatibility
    job_path?: string;
    canonical_url?: string;
    url?: string;
    location_name?: string;
    normalized_location?: string; // Optional for backward compatibility
    secondaryLocations?: SecondaryLocation[]; // Added secondary locations
    basic_qualifications?: string;
    qualifications?: string;
    description: string;
    preferred_qualifications?: string;
    responsibilities?: string; // Made optional
    salary_range?: string;
}
