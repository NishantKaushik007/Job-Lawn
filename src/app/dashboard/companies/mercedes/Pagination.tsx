import React from 'react';

interface PaginationProps {
  currentPage: number;
  updatedSearchParams: Record<string, string | undefined>;
}

const Pagination: React.FC<PaginationProps> = ({ currentPage, updatedSearchParams }) => {
  const isFirstPage = currentPage === 1;

  return (
    <div className="mt-4 flex justify-between items-center space-x-4">
      {/* Previous Page Link */}
      <a
        href={`?${new URLSearchParams({ ...updatedSearchParams, page: String(currentPage - 1) }).toString()}`}
        className={`bg-gray-500 text-white py-2 px-4 rounded-md transition-colors ${isFirstPage ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-700'}`}
        aria-disabled={isFirstPage}
      >
        Previous
      </a>

      {/* Page Info */}
      <span className="text-lg font-semibold">Page {currentPage}</span>

      {/* Next Page Link */}
      <a
        href={`?${new URLSearchParams({ ...updatedSearchParams, page: String(currentPage + 1) }).toString()}`}
        className={`bg-blue-500 text-white py-2 px-4 rounded-md transition-colors hover:bg-blue-700`}
      >
        Next
      </a>
    </div>
  );
};

export default Pagination;
