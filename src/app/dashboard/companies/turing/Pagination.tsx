"use client"

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  updatedSearchParams: Record<string, string | undefined>;
  disableNext: boolean;
}

const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  updatedSearchParams,
  disableNext,
}) => {
  const isFirstPage = currentPage === 1;
  const isLastPage = currentPage === totalPages;
  const nextDisabled = isLastPage || disableNext;
  const prevDisabled = isFirstPage;

  return (
    <div className="mt-4 flex justify-between items-center space-x-4">
      {/* Previous Page Link */}
      <a
        href={
          prevDisabled
            ? "#"
            : `?${new URLSearchParams({
                ...updatedSearchParams,
                page: String(currentPage - 1),
              }).toString()}`
        }
        className={`bg-gray-500 text-white py-2 px-4 rounded-md transition-colors ${
          prevDisabled ? "opacity-50 cursor-not-allowed" : "hover:bg-gray-700"
        }`}
        aria-disabled={prevDisabled}
        onClick={(e) => {
          if (prevDisabled) {
            e.preventDefault();
          }
        }}
      >
        Previous
      </a>

      {/* Page Info */}
      <span className="text-lg font-semibold text-white">Page {currentPage}</span>

      {/* Next Page Link */}
      <a
        href={
          nextDisabled
            ? "#"
            : `?${new URLSearchParams({
                ...updatedSearchParams,
                page: String(currentPage + 1),
              }).toString()}`
        }
        className={`bg-blue-500 text-white py-2 px-4 rounded-md transition-colors ${
          nextDisabled ? "opacity-50 cursor-not-allowed" : "hover:bg-blue-700"
        }`}
        aria-disabled={nextDisabled}
        onClick={(e) => {
          if (nextDisabled) {
            e.preventDefault();
          }
        }}
      >
        Next
      </a>
    </div>
  );
};

export default Pagination;
