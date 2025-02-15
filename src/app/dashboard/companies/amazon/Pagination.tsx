'use client';

import React from 'react';

interface PaginationProps {
  currentPage: number;
  updatedSearchParams: Record<string, string | undefined>;
  loading: boolean; // Add loading prop
}

const Pagination: React.FC<PaginationProps> = ({ currentPage, updatedSearchParams, loading }) => {
  const handleBackPage = () => {
    if (currentPage > 1) {
      const newPage = currentPage - 1;
      // Update URL with the previous page number while retaining other query params
      window.location.href = `?${new URLSearchParams({ ...updatedSearchParams, page: String(newPage) }).toString()}`;
    }
  };

  const handleNextPage = () => {
    const newPage = currentPage + 1;
    // Update URL with the next page number while retaining other query params
    window.location.href = `?${new URLSearchParams({ ...updatedSearchParams, page: String(newPage) }).toString()}`;
  };

  return (
    <div className="mt-4 flex justify-between items-center space-x-4">
      {/* Previous Button */}
      <button
        onClick={handleBackPage}
        disabled={loading || currentPage === 1}
        className={`bg-gray-500 text-white py-2 px-4 rounded-md transition-colors ${
          currentPage === 1 ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-700'
        }`}
      >
        Previous
      </button>

      {/* Current Page */}
      <span className="text-lg font-semibold">Page {currentPage}</span>

      {/* Next Button */}
      <button
        onClick={handleNextPage}
        disabled={loading}
        className={`bg-blue-500 text-white py-2 px-4 rounded-md transition-colors ${
          loading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-blue-700'
        }`}
      >
        Next
      </button>
    </div>
  );
};

export default Pagination;
