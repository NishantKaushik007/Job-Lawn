'use client';

import React from 'react';
import { useRouter } from 'next/navigation';

interface PaginationProps {
  currentPage: number;
  totalResults: number;
  resultsPerPage: number;
  loading?: boolean;
  disableNext?: boolean;
}

const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalResults,
  resultsPerPage,
  loading = false,
  disableNext = false,
}) => {
  const router = useRouter();
  
  const totalPages = Math.ceil(totalResults / resultsPerPage); // Calculate total pages
  
  const handlePageChange = (page: number) => {
    const searchParams = new URLSearchParams(window.location.search);
    
    // Update the page number and retain existing parameters
    searchParams.set('page', String(page));

    // Update the URL without duplicating query parameters
    router.push(`?${searchParams.toString()}`);
  };

  return (
    <div className="mt-4 flex justify-between items-center space-x-4">
      <button
        onClick={() => handlePageChange(currentPage - 1)}
        disabled={loading || currentPage === 1}
        className={`bg-gray-500 text-white py-2 px-4 rounded-md transition-colors ${
          loading || currentPage === 1 ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-700'
        }`}
      >
        Previous
      </button>
      <span className="text-lg font-semibold text-white">
        Page {currentPage}
      </span>
      <button
        onClick={() => handlePageChange(currentPage + 1)}
        disabled={loading || disableNext || currentPage === totalPages}
        className={`bg-blue-500 text-white py-2 px-4 rounded-md transition-colors ${
          loading || disableNext || currentPage === totalPages ? 'opacity-50 cursor-not-allowed' : 'hover:bg-blue-700'
        }`}
      >
        Next
      </button>
    </div>
  );
};

export default Pagination;
