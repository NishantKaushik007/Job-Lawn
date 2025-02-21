import React from 'react';

interface PaginationProps {
  currentPage: number;
  totalResults: number;
  resultsPerPage: number;
  updatedSearchParams: Record<string, string | undefined>;
  loading?: boolean;
  disableNext?: boolean;
}

const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalResults,
  resultsPerPage,
  updatedSearchParams,
  loading = false,
  disableNext = false,
}) => {
  const totalPages = Math.ceil(totalResults / resultsPerPage);
  const isFirstPage = currentPage === 1;
  const isLastPage = currentPage === totalPages;

  const previousUrl = `?${new URLSearchParams({
    ...updatedSearchParams,
    page: String(currentPage - 1),
    start: String((currentPage - 2) * resultsPerPage), // Calculate 'start' for previous page
  }).toString()}`;

  const nextUrl = `?${new URLSearchParams({
    ...updatedSearchParams,
    page: String(currentPage + 1),
    start: String(currentPage * resultsPerPage), // Calculate 'start' for next page
  }).toString()}`;

  return (
    <div className="mt-4 flex justify-between items-center space-x-4">
      {/* Previous Page Link */}
      <a
        href={isFirstPage || loading ? undefined : previousUrl}
        className={`bg-gray-500 text-white py-2 px-4 rounded-md transition-colors ${
          isFirstPage || loading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-700'
        }`}
        aria-disabled={isFirstPage || loading}
      >
        Previous
      </a>

      {/* Page Info */}
      <span className="text-lg font-semibold text-white">
        Page {currentPage}
      </span>

      {/* Next Page Link */}
      <a
        href={loading || disableNext || isLastPage ? undefined : nextUrl}
        className={`bg-blue-500 text-white py-2 px-4 rounded-md transition-colors ${
          loading || disableNext || isLastPage ? 'opacity-50 cursor-not-allowed' : 'hover:bg-blue-700'
        }`}
        aria-disabled={loading || disableNext || isLastPage}
      >
        Next
      </a>
    </div>
  );
};

export default Pagination;
