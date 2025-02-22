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
  const isFirstPage = currentPage === 1;
  const nextDisabled = loading || disableNext;

  const previousUrl = `?${new URLSearchParams({
    ...updatedSearchParams,
    page: String(currentPage - 1),
  }).toString()}`;

  const nextUrl = `?${new URLSearchParams({
    ...updatedSearchParams,
    page: String(currentPage + 1),
  }).toString()}`;

  return (
    <div className="mt-4 flex justify-between items-center space-x-4">
      {/* Previous Page Link (Zinc Button CSS) */}
      <a
        href={isFirstPage || loading ? undefined : previousUrl}
        className={`text-white bg-gradient-to-br from-zinc-600 to-zinc-400 hover:bg-gradient-to-bl focus:ring-1 focus:outline-none focus:ring-zinc-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center ${
          isFirstPage || loading
            ? 'opacity-50 cursor-not-allowed pointer-events-none'
            : ''
        }`}
        aria-disabled={isFirstPage || loading}
      >
        Previous
      </a>

      {/* Page Info */}
      <span className="text-lg font-semibold text-white">Page {currentPage}</span>

      {/* Next Page Link (Purple to Blue Button CSS) */}
      <a
        href={nextDisabled ? undefined : nextUrl}
        className={`text-white bg-gradient-to-br from-purple-600 to-blue-500 hover:bg-gradient-to-bl focus:ring-1 focus:outline-none focus:ring-blue-300 dark:focus:ring-blue-800 font-medium rounded-lg text-sm px-5 py-2.5 text-center ${
          nextDisabled
            ? 'opacity-50 cursor-not-allowed pointer-events-none'
            : ''
        }`}
        aria-disabled={nextDisabled}
      >
        Next
      </a>
    </div>
  );
};

export default Pagination;
