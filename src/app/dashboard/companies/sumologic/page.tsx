// src/app/page.tsx

import React from 'react';
import DropdownFilter from './DropdownFilter';

// In-memory cache for job categories and countries
const cache = {
    defaultJobs: { data: null, timestamp: 0 },
    departmentJobs: new Map(), // Cache based on job category code
    countryJobs: new Map(), // Cache based on country code
};

// Helper function to fetch default jobs
async function fetchDefaultJobs() {
    const startTime = Date.now();

    // Check if cached data is still valid (within 2 minutes)
    if (cache.defaultJobs.data && Date.now() - cache.defaultJobs.timestamp < 120000) {
        console.log('Using cached data for Default Jobs...');
        return cache.defaultJobs.data;
    }

    console.log('Fetching Default Jobs...');
    const response = await fetch('https://api.greenhouse.io/v1/boards/sumologic/jobs/');

    if (!response.ok) {
        throw new Error('Failed to fetch default jobs');
    }

    const data = await response.json();

    // Store the fetched data in the cache with the current timestamp
    cache.defaultJobs.data = data.jobs.map((job: any) => ({
        title: job.title,
        id: job.id.toString(),
        updated_at: job.updated_at,
        absolute_url: job.absolute_url,
        location: job.location,
    }));
    cache.defaultJobs.timestamp = Date.now();

    console.log('Default Jobs Fetched:', {
        elapsedTime: `${Date.now() - startTime}ms`,
        status: response.status,
    });

    return cache.defaultJobs.data;
}

// Helper function to fetch department-specific jobs based on job category code
async function fetchDepartmentJobs(jobCategoryCode: string) {
    const startTime = Date.now();

    // Check if cached data for this job category is still valid (within 2 minutes)
    if (cache.departmentJobs.has(jobCategoryCode) &&
        Date.now() - cache.departmentJobs.get(jobCategoryCode)!.timestamp < 120000) {
        console.log(`Using cached data for Department Jobs with Code: ${jobCategoryCode}...`);
        return cache.departmentJobs.get(jobCategoryCode)!.data;
    }

    console.log(`Fetching Department Jobs for Code: ${jobCategoryCode}...`);
    const response = await fetch(
        `https://api.greenhouse.io/v1/boards/sumologic/departments/${jobCategoryCode}`
    );

    if (!response.ok) {
        throw new Error(`Failed to fetch department jobs for code ${jobCategoryCode}`);
    }

    const data = await response.json();

    // Store the fetched data in the cache with the current timestamp
    const departmentData = data.jobs.map((job: any) => ({
        title: job.title,
        id: job.id.toString(),
        updated_at: job.updated_at,
        absolute_url: job.absolute_url,
        location: job.location,
    }));

    cache.departmentJobs.set(jobCategoryCode, {
        data: departmentData,
        timestamp: Date.now(),
    });

    console.log(`Department Jobs Fetched for Code: ${jobCategoryCode}`, {
        elapsedTime: `${Date.now() - startTime}ms`,
        status: response.status,
    });

    return departmentData;
}

// Helper function to fetch country-specific jobs based on country code
async function fetchCountryJobs(countryCode: string) {
    const startTime = Date.now();

    // Check if cached data for this country is still valid (within 2 minutes)
    if (cache.countryJobs.has(countryCode) &&
        Date.now() - cache.countryJobs.get(countryCode)!.timestamp < 120000) {
        console.log(`Using cached data for Country Jobs with Code: ${countryCode}...`);
        return cache.countryJobs.get(countryCode)!.data;
    }

    console.log(`Fetching Country Jobs for Code: ${countryCode}...`);
    const response = await fetch(
        `https://api.greenhouse.io/v1/boards/sumologic/offices/${countryCode}`
    );

    if (!response.ok) {
        throw new Error(`Failed to fetch country jobs for code ${countryCode}`);
    }

    const data = await response.json();

    console.log(`Country Jobs Fetched for Code: ${countryCode}`, {
        elapsedTime: `${Date.now() - startTime}ms`,
        status: response.status,
    });

    let jobs: any[] = [];
    data.departments.forEach((dept: any) => {
        if (dept.jobs) {
            jobs = jobs.concat(
                dept.jobs.map((job: any) => ({
                    title: job.title,
                    id: job.id.toString(),
                    updated_at: job.updated_at,
                    absolute_url: job.absolute_url,
                    location: job.location,
                }))
            );
        }
    });

    // Store the fetched data in the cache with the current timestamp
    cache.countryJobs.set(countryCode, {
        data: jobs,
        timestamp: Date.now(),
    });

    return jobs;
}

// Main page component that fetches jobs based on searchParams (jobCategoryCode, countryCode)
export default async function Page({
    searchParams,
}: {
    searchParams: { jobCategoryCode?: string; countryCode?: string };
}) {
    const { jobCategoryCode, countryCode } = searchParams;

    let jobs;
    if (jobCategoryCode) {
        console.log('Fetching jobs by job category...');
        jobs = await fetchDepartmentJobs(jobCategoryCode);
    } else if (countryCode) {
        console.log('Fetching jobs by country...');
        jobs = await fetchCountryJobs(countryCode);
    } else {
        console.log('Fetching default jobs...');
        jobs = await fetchDefaultJobs();
    }

    console.log('Jobs Fetched:', { totalJobs: jobs.length });

    return (
        <div className='p-4'>
            <DropdownFilter jobs={jobs} />
        </div>
    );
}
