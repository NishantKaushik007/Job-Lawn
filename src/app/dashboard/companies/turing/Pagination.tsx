"use client";
import React from "react";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  updatedSearchParams: Record<string, string | undefined>;
  disableNext: boolean;
}

const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  updatedSearchParams,
  disableNext,
}) => {
  const isFirstPage = currentPage === 1;
  const isLastPage = currentPage === totalPages;
  const nextDisabled = isLastPage || disableNext;
  const prevDisabled = isFirstPage;

  return (
    <div className="mt-4 flex justify-between items-center space-x-4">
      {/* Previous Page Link (Zinc Button CSS) */}
      <a
        href={
          prevDisabled
            ? "#"
            : `?${new URLSearchParams({
                ...updatedSearchParams,
                page: String(currentPage - 1),
              }).toString()}`
        }
        className={`text-white bg-gradient-to-br from-zinc-600 to-zinc-400 hover:bg-gradient-to-bl focus:ring-1 focus:outline-none focus:ring-zinc-300 font-medium rounded-md text-sm py-2 px-4 transition-colors ${
          prevDisabled ? "opacity-50 cursor-not-allowed" : ""
        }`}
        aria-disabled={prevDisabled}
        onClick={(e) => {
          if (prevDisabled) {
            e.preventDefault();
          }
        }}
      >
        Previous
      </a>

      {/* Page Info */}
      <span className="text-lg font-semibold text-white">Page {currentPage}</span>

      {/* Next Page Link (Purple to Blue Button CSS) */}
      <a
        href={
          nextDisabled
            ? "#"
            : `?${new URLSearchParams({
                ...updatedSearchParams,
                page: String(currentPage + 1),
              }).toString()}`
        }
        className={`text-white bg-gradient-to-br from-purple-600 to-blue-500 hover:bg-gradient-to-bl focus:ring-1 focus:outline-none focus:ring-blue-300 dark:focus:ring-blue-800 font-medium rounded-md text-sm py-2 px-4 transition-colors ${
          nextDisabled ? "opacity-50 cursor-not-allowed" : ""
        }`}
        aria-disabled={nextDisabled}
        onClick={(e) => {
          if (nextDisabled) {
            e.preventDefault();
          }
        }}
      >
        Next
      </a>
    </div>
  );
};

export default Pagination;
