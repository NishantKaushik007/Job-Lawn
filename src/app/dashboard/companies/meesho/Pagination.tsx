'use client';

import React from 'react';

interface PaginationProps {
  currentPage: number;
  updatedSearchParams: Record<string, string>;
  loading: boolean;
  disableNext?: boolean;
}

const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  updatedSearchParams,
  loading,
  disableNext = false,
}) => {
  const handleBackPage = () => {
    if (currentPage > 1) {
      const newPage = currentPage - 1;
      const params = { ...updatedSearchParams, page: String(newPage) };
      window.location.href = `?${new URLSearchParams(params).toString()}`;
    }
  };

  const handleNextPage = () => {
    const newPage = currentPage + 1;
    const params = { ...updatedSearchParams, page: String(newPage) };
    window.location.href = `?${new URLSearchParams(params).toString()}`;
  };

  return (
    <div className="mt-4 flex justify-between items-center space-x-4">
      {/* Previous Button (Zinc Button CSS) */}
      <button
        onClick={handleBackPage}
        disabled={loading || currentPage === 1}
        className={`text-white bg-gradient-to-br from-zinc-600 to-zinc-400 hover:bg-gradient-to-bl focus:ring-1 focus:outline-none focus:ring-zinc-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center ${
          currentPage === 1 ? 'opacity-50 cursor-not-allowed' : ''
        }`}
      >
        Previous
      </button>

      <span className="text-lg font-semibold text-white">Page {currentPage}</span>

      {/* Next Button (Purple to Blue Button CSS) */}
      <button
        onClick={handleNextPage}
        disabled={loading || disableNext}
        className={`text-white bg-gradient-to-br from-purple-600 to-blue-500 hover:bg-gradient-to-bl focus:ring-1 focus:outline-none focus:ring-blue-300 dark:focus:ring-blue-800 font-medium rounded-lg text-sm px-5 py-2.5 text-center ${
          loading || disableNext ? 'opacity-50 cursor-not-allowed' : ''
        }`}
      >
        Next
      </button>
    </div>
  );
};

export default Pagination;
