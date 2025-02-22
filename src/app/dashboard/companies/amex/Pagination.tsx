import React from 'react';

interface PaginationProps {
  currentPage: number;
  updatedSearchParams: Record<string, string | undefined>;
  loading?: boolean;
  disableNext?: boolean;
}

const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  updatedSearchParams,
  loading = false,
  disableNext = false,
}) => {
  // Only handle next/previous page navigation
  const isFirstPage = currentPage === 1;

  // Ensure that all values in updatedSearchParams are strings
  const sanitizedParams = Object.fromEntries(
    Object.entries(updatedSearchParams).map(([key, value]) => [
      key,
      typeof value === 'symbol' ? String(value) : value ?? '',
    ])
  );

  // Build URL for previous and next pages
  const previousUrl = `?${new URLSearchParams({
    ...sanitizedParams,
    page: String(currentPage - 1),
  }).toString()}`;

  const nextUrl = `?${new URLSearchParams({
    ...sanitizedParams,
    page: String(currentPage + 1),
  }).toString()}`;

  return (
    <div className="mt-4 flex justify-between items-center space-x-4">
      {/* Previous Page Link (Zinc Button CSS) */}
      <a
        href={isFirstPage ? undefined : previousUrl}
        className={`text-white bg-gradient-to-br from-zinc-600 to-zinc-400 hover:bg-gradient-to-bl focus:ring-1 focus:outline-none focus:ring-zinc-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center me-2 mb-2 ${
          isFirstPage ? 'opacity-50 cursor-not-allowed pointer-events-none' : ''
        }`}
        aria-disabled={isFirstPage}
      >
        Previous
      </a>

      {/* Page Info */}
      <span className="text-lg font-semibold text-white">Page {currentPage}</span>

      {/* Next Page Link (Purple to Blue Button CSS) */}
      <a
        href={loading || disableNext ? undefined : nextUrl}
        className={`text-white bg-gradient-to-br from-purple-600 to-blue-500 hover:bg-gradient-to-bl focus:ring-1 focus:outline-none focus:ring-blue-300 dark:focus:ring-blue-800 font-medium rounded-lg text-sm px-5 py-2.5 text-center me-2 mb-2 ${
          loading || disableNext ? 'opacity-50 cursor-not-allowed pointer-events-none' : ''
        }`}
        aria-disabled={loading || disableNext}
      >
        Next
      </a>
    </div>
  );
};

export default Pagination;
