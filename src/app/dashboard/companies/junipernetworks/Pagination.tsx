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
    start: String((currentPage - 2) * resultsPerPage),
  }).toString()}`;

  const nextUrl = `?${new URLSearchParams({
    ...updatedSearchParams,
    page: String(currentPage + 1),
    start: String(currentPage * resultsPerPage),
  }).toString()}`;

  return (
    <div className="mt-4 flex justify-between items-center space-x-4">
      {/* Previous Page Link (Zinc Button CSS) */}
      <a
        href={isFirstPage || loading ? undefined : previousUrl}
        className={`text-white bg-gradient-to-br from-zinc-600 to-zinc-400 hover:bg-gradient-to-bl focus:ring-1 focus:outline-none focus:ring-zinc-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center ${
          isFirstPage || loading ? 'opacity-50 cursor-not-allowed' : ''
        }`}
        aria-disabled={isFirstPage || loading}
      >
        Previous
      </a>

      {/* Page Info */}
      <span className="text-lg font-semibold text-white">
        Page {currentPage}
      </span>

      {/* Next Page Link (Purple to Blue Button CSS) */}
      <a
        href={loading || disableNext || isLastPage ? undefined : nextUrl}
        className={`text-white bg-gradient-to-br from-purple-600 to-blue-500 hover:bg-gradient-to-bl focus:ring-1 focus:outline-none focus:ring-blue-300 dark:focus:ring-blue-800 font-medium rounded-lg text-sm px-5 py-2.5 text-center ${
          loading || disableNext || isLastPage ? 'opacity-50 cursor-not-allowed' : ''
        }`}
        aria-disabled={loading || disableNext || isLastPage}
      >
        Next
      </a>
    </div>
  );
};

export default Pagination;
