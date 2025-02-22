'use client';
import React from 'react';

interface PaginationProps {
  currentPage: number;
  onNext: () => void;
  onBack: () => void;
  hasMoreResults: boolean;
  disableNext: boolean;
}

const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  onNext,
  onBack,
  hasMoreResults,
  disableNext,
}) => {
  const disablePrev = currentPage === 1;

  return (
    <div className="mt-4 flex justify-between items-center space-x-4">
      <button
        onClick={onBack}
        disabled={disablePrev}
        className={`text-white bg-gradient-to-br from-zinc-600 to-zinc-400 hover:bg-gradient-to-bl focus:ring-1 focus:outline-none focus:ring-zinc-300 font-medium rounded-lg text-sm px-5 py-2.5 transition-colors ${
          disablePrev ? 'opacity-50 cursor-not-allowed' : ''
        }`}
      >
        Previous
      </button>
      <span className="text-lg font-semibold text-white">Page {currentPage}</span>
      <button
        onClick={onNext}
        disabled={disableNext}
        className={`text-white bg-gradient-to-br from-purple-600 to-blue-500 hover:bg-gradient-to-bl focus:ring-1 focus:outline-none focus:ring-blue-300 dark:focus:ring-blue-800 font-medium rounded-lg text-sm px-5 py-2.5 transition-colors ${
          disableNext ? 'opacity-50 cursor-not-allowed' : ''
        }`}
      >
        Next
      </button>
    </div>
  );
};

export default Pagination;
