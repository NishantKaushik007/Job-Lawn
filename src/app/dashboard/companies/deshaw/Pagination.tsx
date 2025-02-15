"use client"; // Ensure the component is client-rendered

import { useRouter } from "next/navigation"; // Correct import for App Router

interface PaginationProps {
  currentPage: number;
  totalPages: number;
}

const Pagination = ({ currentPage, totalPages }: PaginationProps) => {
  const router = useRouter();

  const handlePageChange = (newPage: number) => {
    const params = new URLSearchParams(window.location.search);
    params.set("page", newPage.toString());
    router.push(`?${params.toString()}`);
  };

  return (
    <div className="mt-4 flex justify-between items-center space-x-4">
      <button
        disabled={currentPage === 1}
        onClick={() => handlePageChange(currentPage - 1)}
        className={`bg-gray-500 text-white py-2 px-4 rounded-md transition-colors ${
          currentPage === 1 ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-700'
        }`}
      >
        Previous
      </button>
      <span className="text-lg font-semibold">
        Page {currentPage}
      </span>
      <button
        disabled={currentPage === totalPages}
        onClick={() => handlePageChange(currentPage + 1)}
        className={`bg-blue-500 text-white py-2 px-4 rounded-md transition-colors ${
          currentPage === totalPages ? 'opacity-50 cursor-not-allowed' : 'hover:bg-blue-700'
        }`}
      >
        Next
      </button>
    </div>
  );
};

export default Pagination;
