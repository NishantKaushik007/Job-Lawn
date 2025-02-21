"use client";

import React, { useState, useEffect } from "react";
import Select from "react-select";
import Pagination from "./Pagination";
import JobCard from "../../components/JobCard/JobCard";

interface DropdownFilterProps {
  locations: string[];
  disciplines: string[];
  programs: string[];
  jobs: {
    id: number;
    title: string;
    absolute_url: string;
    location: { name: string };
    metadata: { id: number; name: string; value: string | string[] | null }[];
    updated_at: string;
  }[];
}

const DropdownFilter: React.FC<DropdownFilterProps> = ({
  locations,
  disciplines,
  programs,
  jobs,
}) => {
  const [filteredJobs, setFilteredJobs] = useState<DropdownFilterProps["jobs"]>([]);
  const [selectedLocation, setSelectedLocation] = useState<string | null>(null);
  const [selectedDiscipline, setSelectedDiscipline] = useState<string | null>(null);
  const [selectedProgram, setSelectedProgram] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const jobsPerPage = 10;
  const [isClient, setIsClient] = useState(false); // Track client-side rendering

  useEffect(() => {
    setIsClient(true); // Ensure it's only rendered on the client
  }, []);

  useEffect(() => {
    const filterJobs = () => {
      const filtered = jobs.filter((job) => {
        const matchesLocation =
          !selectedLocation || job.location.name === selectedLocation;
        const matchesDiscipline =
          !selectedDiscipline ||
          job.metadata.some(
            (meta) =>
              meta.name === "Discipline" && meta.value === selectedDiscipline
          );
        const matchesProgram =
          !selectedProgram ||
          job.metadata.some(
            (meta) =>
              meta.name === "Program" &&
              Array.isArray(meta.value) &&
              meta.value.includes(selectedProgram)
          );

        return matchesLocation && matchesDiscipline && matchesProgram;
      });

      setFilteredJobs(filtered);
      setCurrentPage(1); // Reset to the first page when filters change
    };

    filterJobs();
  }, [selectedLocation, selectedDiscipline, selectedProgram, jobs]);

  const indexOfLastJob = currentPage * jobsPerPage;
  const indexOfFirstJob = indexOfLastJob - jobsPerPage;
  const currentJobs = filteredJobs.slice(indexOfFirstJob, indexOfLastJob);

  if (!isClient) {
    return null; // Prevent rendering of Select components on the server
  }

  return (
    <div className="flex flex-col mb-6 space-y-4 sm:flex-col sm:space-x-4 sm:space-y-0 w-full pr-4 pl-4">
      <div className="flex flex-col mb-6 space-y-4 sm:flex-row sm:space-x-4 sm:space-y-0 w-full">
        <Select
          options={locations.map((loc) => ({ value: loc, label: loc }))}
          placeholder="Filter by Location"
          onChange={(selectedOption) =>
            setSelectedLocation(selectedOption?.value || null)
          }
          isClearable
        />
        <Select
          options={disciplines.map((disc) => ({ value: disc, label: disc }))}
          placeholder="Filter by Discipline"
          onChange={(selectedOption) =>
            setSelectedDiscipline(selectedOption?.value || null)
          }
          isClearable
        />
        <Select
          options={programs.map((prog) => ({ value: prog, label: prog }))}
          placeholder="Filter by Program"
          onChange={(selectedOption) =>
            setSelectedProgram(selectedOption?.value || null)
          }
          isClearable
        />
      </div>

      {currentJobs.length === 0 ? (
        <div className='text-center text-white mt-4'>No jobs available for the selected criteria.</div>
      ) : (
        <ul>
          {currentJobs.map((job) => (
            <li key={job.id}>
              <JobCard
                job={{
                  title: job.title,
                  id_icims: job.id.toString(),
                  posted_date: job.updated_at,
                  job_path: `${job.absolute_url}`,
                  normalized_location: job.location.name || "Remote",
                  basic_qualifications: "",
                  description: "",
                  preferred_qualifications: "",
                  responsibilities: "",
                }}
                onToggleDetails={() => {}}
                isSelected={false} // Check if the job is selected
                baseUrl="" // Update with your actual base URL
              />
            </li>
          ))}
        </ul>
      )}

      <Pagination
        currentPage={currentPage}
        totalPages={Math.ceil(filteredJobs.length / jobsPerPage)}
        onNext={() => setCurrentPage((prev) => prev + 1)}
        onPrevious={() => setCurrentPage((prev) => prev - 1)}
        disableNext={currentJobs.length < 10}
      />
    </div>
  );
};

export default DropdownFilter;
