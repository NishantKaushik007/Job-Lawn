"use client"
import React from 'react';

interface PaginationProps {
  currentPage: number;
  totalResults: number;
  resultsPerPage: number;
  updatedSearchParams: Record<string, string | undefined>;
  disableNext: boolean; // New prop to disable Next button
}

const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalResults,
  resultsPerPage,
  updatedSearchParams,
  disableNext,
}) => {
  const isFirstPage = currentPage === 1;

  return (
    <div className="mt-4 flex justify-between items-center space-x-4">
      {/* Previous Page Link (Zinc Button CSS) */}
      <a
        href={`?${new URLSearchParams({
          ...updatedSearchParams,
          page: String(currentPage - 1),
          start: String((currentPage - 2) * resultsPerPage), // Calculate 'start' for previous page
        }).toString()}`}
        className={`text-white bg-gradient-to-br from-zinc-600 to-zinc-400 hover:bg-gradient-to-bl focus:ring-1 focus:outline-none focus:ring-zinc-300 font-medium rounded-lg text-sm py-2 px-4 transition-colors ${
          isFirstPage ? 'opacity-50 cursor-not-allowed' : ''
        }`}
        aria-disabled={isFirstPage}
        onClick={isFirstPage ? (e) => e.preventDefault() : undefined}
      >
        Previous
      </a>

      {/* Page Info */}
      <span className="text-lg font-semibold text-white">
        Page {currentPage}
      </span>

      {/* Next Page Link (Purple to Blue Button CSS) */}
      <a
        href={`?${new URLSearchParams({
          ...updatedSearchParams,
          page: String(currentPage + 1),
          start: String(currentPage * resultsPerPage), // Calculate 'start' for next page
        }).toString()}`}
        className={`text-white bg-gradient-to-br from-purple-600 to-blue-500 hover:bg-gradient-to-bl focus:ring-1 focus:outline-none focus:ring-blue-300 dark:focus:ring-blue-800 font-medium rounded-lg text-sm py-2 px-4 transition-colors ${
          disableNext ? 'opacity-50 cursor-not-allowed' : ''
        }`}
        aria-disabled={disableNext}
        onClick={disableNext ? (e) => e.preventDefault() : undefined}
      >
        Next
      </a>
    </div>
  );
};

export default Pagination;
