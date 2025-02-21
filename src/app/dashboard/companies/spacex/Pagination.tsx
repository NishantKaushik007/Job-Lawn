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
        className={`bg-gray-500 text-white py-2 px-4 rounded-md transition-colors ${
          currentPage === 1 ? "opacity-50 cursor-not-allowed" : "hover:bg-gray-700"
        }`}
      >
        Previous
      </button>
      <span className="text-lg font-semibold text-white">Page {currentPage}</span>
      <button
        onClick={onNext}
        disabled={disableNext}
        className={`bg-blue-500 text-white py-2 px-4 rounded-md transition-colors ${
          disableNext ? "opacity-50 cursor-not-allowed" : "hover:bg-blue-700"
        }`}
      >
        Next
      </button>
    </div>
  );
};

export default Pagination;
