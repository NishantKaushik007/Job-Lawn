"use client";
import React from 'react';

interface PaginationProps {
  currentPage: number;
  totalResults: number;
  resultsPerPage: number;
  updatedSearchParams: Record<string, string | undefined>;
  disableNext?: boolean;
}

const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalResults,
  resultsPerPage,
  updatedSearchParams,
  disableNext = false,
}) => {
  const isFirstPage = currentPage === 1;
  const totalPages = Math.ceil(totalResults / resultsPerPage);
  const nextDisabled = disableNext || currentPage === totalPages;

  return (
    <div className="mt-4 flex justify-between items-center space-x-4">
      {/* Previous Page Link */}
      <a
        href={`?${new URLSearchParams({
          ...updatedSearchParams,
          page: String(currentPage - 1),
        }).toString()}`}
        className={`bg-gray-500 text-white py-2 px-4 rounded-md transition-colors ${
          isFirstPage ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-700'
        }`}
        aria-disabled={isFirstPage}
        onClick={isFirstPage ? (e) => e.preventDefault() : undefined}
      >
        Previous
      </a>

      {/* Page Info */}
      <span className="text-lg font-semibold text-white">Page {currentPage}</span>

      {/* Next Page Link */}
      <a
        href={`?${new URLSearchParams({
          ...updatedSearchParams,
          page: String(currentPage + 1),
        }).toString()}`}
        className={`bg-blue-500 text-white py-2 px-4 rounded-md transition-colors ${
          nextDisabled ? 'opacity-50 cursor-not-allowed' : 'hover:bg-blue-700'
        }`}
        aria-disabled={nextDisabled}
        onClick={nextDisabled ? (e) => e.preventDefault() : undefined}
      >
        Next
      </a>
    </div>
  );
};

export default Pagination;
