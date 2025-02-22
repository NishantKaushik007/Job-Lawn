"use client";

import React from "react";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onNext: () => void;
  onPrevious: () => void;
  disableNext: boolean;
}

const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  onNext,
  onPrevious,
  disableNext,
}) => {
  return (
    <div className="mt-4 flex justify-between space-x-2">
      <button
        onClick={onPrevious}
        disabled={currentPage === 1}
        className={`text-white bg-gradient-to-br from-zinc-600 to-zinc-400 hover:bg-gradient-to-bl focus:ring-1 focus:outline-none focus:ring-zinc-300 font-medium rounded-md text-sm py-2 px-4 transition-colors ${
          currentPage === 1 ? "opacity-50 cursor-not-allowed" : ""
        }`}
      >
        Previous
      </button>
      <span className="text-lg font-semibold text-white">Page {currentPage}</span>
      <button
        onClick={onNext}
        disabled={disableNext}
        className={`text-white bg-gradient-to-br from-purple-600 to-blue-500 hover:bg-gradient-to-bl focus:ring-1 focus:outline-none focus:ring-blue-300 dark:focus:ring-blue-800 font-medium rounded-md text-sm py-2 px-4 transition-colors ${
          disableNext ? "opacity-50 cursor-not-allowed" : ""
        }`}
      >
        Next
      </button>
    </div>
  );
};

export default Pagination;
