'use client';

import React from 'react';

interface PaginationProps {
  currentPage: number;
  updatedSearchParams: Record<string, string>;
  loading: boolean;
}

const Pagination: React.FC<PaginationProps> = ({ currentPage, updatedSearchParams, loading }) => {
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
      <button
        onClick={handleBackPage}
        disabled={loading || currentPage === 1}
        className={`bg-gray-500 text-white py-2 px-4 rounded-md transition-colors ${
          currentPage === 1 ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-700'
        }`}
      >
        Previous
      </button>

      <span className="text-lg font-semibold">Page {currentPage}</span>

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
