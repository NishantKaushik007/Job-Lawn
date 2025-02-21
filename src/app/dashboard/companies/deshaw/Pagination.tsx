"use client"; // Ensure the component is client-rendered

import { useRouter } from "next/navigation"; // Correct import for App Router

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  loading?: boolean;
  disableNext?: boolean;
}

const Pagination = ({
  currentPage,
  totalPages,
  loading = false,
  disableNext = false,
}: PaginationProps) => {
  const router = useRouter();

  const handlePageChange = (newPage: number) => {
    const params = new URLSearchParams(window.location.search);
    params.set("page", newPage.toString());
    router.push(`?${params.toString()}`);
  };

  return (
    <div className="mt-4 flex justify-between items-center space-x-4">
      <button
        disabled={loading || currentPage === 1}
        onClick={() => handlePageChange(currentPage - 1)}
        className={`bg-gray-500 text-white py-2 px-4 rounded-md transition-colors ${
          loading || currentPage === 1 ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-700'
        }`}
      >
        Previous
      </button>
      <span className="text-lg font-semibold text-white">
        Page {currentPage}
      </span>
      <button
        disabled={loading || disableNext || currentPage === totalPages}
        onClick={() => handlePageChange(currentPage + 1)}
        className={`bg-blue-500 text-white py-2 px-4 rounded-md transition-colors ${
          loading || disableNext || currentPage === totalPages
            ? 'opacity-50 cursor-not-allowed'
            : 'hover:bg-blue-700'
        }`}
      >
        Next
      </button>
    </div>
  );
};

export default Pagination;
