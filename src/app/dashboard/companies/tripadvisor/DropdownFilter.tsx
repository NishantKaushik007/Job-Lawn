"use client";

import React, { useState, useEffect } from "react";
import Select from "react-select";
import Pagination from "./Pagination";
import JobCard from "../../components/JobCard/JobCard";

interface DropdownFilterProps {
  offices: string[];
  departments: string[];
  metadataValues: string[];
  jobs: {
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
  }[];
}

const DropdownFilter: React.FC<DropdownFilterProps> = ({ offices, departments, metadataValues, jobs }) => {
  const [filteredJobs, setFilteredJobs] = useState<DropdownFilterProps["jobs"]>(jobs);
  const [selectedOffice, setSelectedOffice] = useState<string | null>(null);
  const [selectedDepartment, setSelectedDepartment] = useState<string | null>(null);
  const [selectedMetadataValue, setSelectedMetadataValue] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const jobsPerPage = 10;
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    const filterJobs = () => {
      const filtered = jobs.filter((job) => {
        const matchesOffice =
          !selectedOffice || job.offices.some((office) => office.name === selectedOffice);
        const matchesDepartment =
          !selectedDepartment || job.departments.some((department) => department.name === selectedDepartment);
        const matchesMetadata = !selectedMetadataValue || job.metadata.some(meta => {
          if (Array.isArray(meta.value)) {
            return meta.value.includes(selectedMetadataValue);
          } else if (typeof meta.value === 'string') {
            return meta.value === selectedMetadataValue;
          }
          return false;
        });

        return matchesOffice && matchesDepartment && matchesMetadata;
      });

      setFilteredJobs(filtered);
      setCurrentPage(1);
    };

    filterJobs();
  }, [selectedOffice, selectedDepartment, selectedMetadataValue, jobs]);

  const indexOfLastJob = currentPage * jobsPerPage;
  const indexOfFirstJob = indexOfLastJob - jobsPerPage;
  const currentJobs = filteredJobs.slice(indexOfFirstJob, indexOfLastJob);

  if (!isClient) {
    return null;
  }

  return (
    <div className="flex flex-col mb-6 space-y-4 sm:flex-col sm:space-x-4 sm:space-y-0 w-full pr-4 pl-4">
      <div className="flex flex-col mb-6 space-y-4 sm:flex-row sm:space-x-4 sm:space-y-0 w-full">
        <Select
          options={offices.map((office) => ({ value: office, label: office }))}
          placeholder="Select Location"
          onChange={(selectedOption) => setSelectedOffice(selectedOption?.value || null)}
          isClearable
        />
        <Select
          options={departments.map((department) => ({ value: department, label: department }))}
          placeholder="Select Department"
          onChange={(selectedOption) => setSelectedDepartment(selectedOption?.value || null)}
          isClearable
        />
        <Select
          options={metadataValues.map((metadataValue) => ({ value: metadataValue, label: metadataValue }))}
          placeholder="Select Job Type"
          onChange={(selectedOption) => setSelectedMetadataValue(selectedOption?.value || null)}
          isClearable
        />
      </div>
      
      {filteredJobs.length === 0 ? (
        <div className='text-center text-white mt-4'>No jobs available for the selected criteria.</div>
      ) : (
        <>
          <ul>
            {currentJobs.map((job) => (
              <li key={job.id}>
                <JobCard
                  job={{
                    title: job.title,
                    id_icims: job.internal_job_id,
                    posted_date: job.updated_at,
                    job_path: `${job.absolute_url}`,
                    normalized_location: job.offices.map(office => office.name).join(' | ') || "N/A",
                    basic_qualifications: "",
                    description: job.content,
                    preferred_qualifications: "",
                    responsibilities: "",
                  }}
                  onToggleDetails={() => {}}
                  isSelected={false}
                  baseUrl=""
                />
              </li>
            ))}
          </ul>
          <Pagination
            currentPage={currentPage}
            totalPages={Math.ceil(filteredJobs.length / jobsPerPage)}
            onNext={() => setCurrentPage((prev) => prev + 1)}
            onPrevious={() => setCurrentPage((prev) => prev - 1)}
          />
        </>
      )}
    </div>
  );
};

export default DropdownFilter;