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
  const totalPages = Math.ceil(totalResults / resultsPerPage);

  const handlePageChange = (page: number) => {
    const searchParams = new URLSearchParams(window.location.search);
    searchParams.set('page', String(page));
    router.push(`?${searchParams.toString()}`);
  };

  return (
    <div className="mt-4 flex justify-between items-center space-x-4">
      {/* Previous Button (Zinc Button CSS) */}
      <button
        onClick={() => handlePageChange(currentPage - 1)}
        disabled={loading || currentPage === 1}
        className={`text-white bg-gradient-to-br from-zinc-600 to-zinc-400 hover:bg-gradient-to-bl focus:ring-1 focus:outline-none focus:ring-zinc-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center me-2 mb-2 ${
          loading || currentPage === 1 ? 'opacity-50 cursor-not-allowed' : ''
        }`}
      >
        Previous
      </button>

      {/* Page Info */}
      <span className="text-lg font-semibold text-white">
        Page {currentPage}
      </span>

      {/* Next Button (Purple to Blue Button CSS) */}
      <button
        onClick={() => handlePageChange(currentPage + 1)}
        disabled={loading || disableNext || currentPage === totalPages}
        className={`text-white bg-gradient-to-br from-purple-600 to-blue-500 hover:bg-gradient-to-bl focus:ring-1 focus:outline-none focus:ring-blue-300 dark:focus:ring-blue-800 font-medium rounded-lg text-sm px-5 py-2.5 text-center me-2 mb-2 ${
          loading || disableNext || currentPage === totalPages
            ? 'opacity-50 cursor-not-allowed'
            : ''
        }`}
      >
        Next
      </button>
    </div>
  );
};

export default Pagination;
