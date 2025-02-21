"use client"

import React from 'react';

interface PaginationProps {
  currentPage: number;
  updatedSearchParams: Record<string, string | undefined>;
  loading: boolean;
  disableNext?: boolean;
}

const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  updatedSearchParams,
  loading,
  disableNext = false,
}) => {
  // Only handle next/previous page navigation
  const isFirstPage = currentPage === 1;
  const isNextDisabled = disableNext || loading;

  // Ensure that all values in updatedSearchParams are strings
  const sanitizedParams = Object.fromEntries(
    Object.entries(updatedSearchParams).map(([key, value]) => [
      key,
      typeof value === 'symbol' ? String(value) : value,
    ])
  );

  return (
    <div className="mt-4 flex justify-between items-center space-x-4">
      {/* Previous Page Link */}
      <a
        href={`?${new URLSearchParams({
          ...sanitizedParams,
          page: String(currentPage - 1),
        }).toString()}`}
        className={`bg-gray-500 text-white py-2 px-4 rounded-md transition-colors ${
          isFirstPage ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-700'
        }`}
        aria-disabled={isFirstPage}
        onClick={(e) => {
          if (isFirstPage) e.preventDefault();
        }}
      >
        Previous
      </a>

      {/* Page Info */}
      <span className="text-lg font-semibold text-white">Page {currentPage}</span>

      {/* Next Page Link */}
      <a
        href={`?${new URLSearchParams({
          ...sanitizedParams,
          page: String(currentPage + 1),
        }).toString()}`}
        className={`bg-blue-500 text-white py-2 px-4 rounded-md transition-colors ${
          isNextDisabled ? 'opacity-50 cursor-not-allowed' : 'hover:bg-blue-700'
        }`}
        aria-disabled={isNextDisabled}
        onClick={(e) => {
          if (isNextDisabled) e.preventDefault();
        }}
      >
        Next
      </a>
    </div>
  );
};

export default Pagination;
