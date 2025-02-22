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
      {/* Previous Button (Zinc Button CSS) */}
      <button
        disabled={loading || currentPage === 1}
        onClick={() => handlePageChange(currentPage - 1)}
        className={`text-white bg-gradient-to-br from-zinc-600 to-zinc-400 hover:bg-gradient-to-bl focus:ring-1 focus:outline-none focus:ring-zinc-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center me-2 mb-2 ${
          loading || currentPage === 1 ? 'opacity-50 cursor-not-allowed' : ''
        }`}
      >
        Previous
      </button>

      <span className="text-lg font-semibold text-white">
        Page {currentPage}
      </span>

      {/* Next Button (Purple to Blue Button CSS) */}
      <button
        disabled={loading || disableNext || currentPage === totalPages}
        onClick={() => handlePageChange(currentPage + 1)}
        className={`text-white bg-gradient-to-br from-purple-600 to-blue-500 hover:bg-gradient-to-bl focus:ring-1 focus:outline-none focus:ring-blue-300 dark:focus:ring-blue-800 font-medium rounded-lg text-sm px-5 py-2.5 text-center me-2 mb-2 ${
          loading || disableNext || currentPage === totalPages
            ? 'opacity-50 cursor-not-allowed'
            : ''
        }`}
      >
        Next
      </button>
    </div>
  );
};

export default Pagination;
