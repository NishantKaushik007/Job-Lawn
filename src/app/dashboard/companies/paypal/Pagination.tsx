"use client";
import React from 'react';

interface PaginationProps {
  currentPage: number;
  updatedSearchParams: Record<string, string | undefined>;
  loading: boolean;
  disableNext: boolean;
}

const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  updatedSearchParams,
  loading,
  disableNext,
}) => {
  const isFirstPage = currentPage === 1;
  const isNextDisabled = loading || disableNext;

  // Ensure that all values in updatedSearchParams are strings
  const sanitizedParams = Object.fromEntries(
    Object.entries(updatedSearchParams).map(([key, value]) => [
      key,
      typeof value === 'symbol' ? String(value) : value,
    ])
  );

  return (
    <div className="mt-4 flex justify-between items-center space-x-4">
      {/* Previous Page Link (Zinc Button CSS) */}
      <a
        href={`?${new URLSearchParams({ ...sanitizedParams, page: String(currentPage - 1) }).toString()}`}
        className={`text-white bg-gradient-to-br from-zinc-600 to-zinc-400 hover:bg-gradient-to-bl focus:ring-1 focus:outline-none focus:ring-zinc-300 font-medium rounded-lg text-sm px-5 py-2.5 transition-colors ${
          isFirstPage || loading ? 'opacity-50 cursor-not-allowed' : ''
        }`}
        aria-disabled={isFirstPage || loading}
        onClick={isFirstPage || loading ? (e) => e.preventDefault() : undefined}
      >
        Previous
      </a>

      {/* Page Info */}
      <span className="text-lg font-semibold text-white">Page {currentPage}</span>

      {/* Next Page Link (Purple to Blue Button CSS) */}
      <a
        href={`?${new URLSearchParams({ ...sanitizedParams, page: String(currentPage + 1) }).toString()}`}
        className={`text-white bg-gradient-to-br from-purple-600 to-blue-500 hover:bg-gradient-to-bl focus:ring-1 focus:outline-none focus:ring-blue-300 dark:focus:ring-blue-800 font-medium rounded-lg text-sm px-5 py-2.5 transition-colors ${
          isNextDisabled ? 'opacity-50 cursor-not-allowed' : ''
        }`}
        aria-disabled={isNextDisabled}
        onClick={isNextDisabled ? (e) => e.preventDefault() : undefined}
      >
        Next
      </a>
    </div>
  );
};

export default Pagination;
