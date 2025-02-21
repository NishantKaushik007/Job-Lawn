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
      {/* Previous Page Link */}
      <a
        href={isFirstPage ? undefined : previousUrl}
        className={`bg-gray-500 text-white py-2 px-4 rounded-md transition-colors ${
          isFirstPage ? 'opacity-50 cursor-not-allowed pointer-events-none' : 'hover:bg-gray-700'
        }`}
        aria-disabled={isFirstPage}
      >
        Previous
      </a>

      {/* Page Info */}
      <span className="text-lg font-semibold text-white">Page {currentPage}</span>

      {/* Next Page Link */}
      <a
        href={loading || disableNext ? undefined : nextUrl}
        className={`bg-blue-500 text-white py-2 px-4 rounded-md transition-colors ${
          loading || disableNext
            ? 'opacity-50 cursor-not-allowed pointer-events-none'
            : 'hover:bg-blue-700'
        }`}
        aria-disabled={loading || disableNext}
      >
        Next
      </a>
    </div>
  );
};

export default Pagination;
