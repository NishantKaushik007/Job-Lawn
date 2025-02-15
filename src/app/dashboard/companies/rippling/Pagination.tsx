'use client';

interface PaginationProps {
    currentPage: number;
    onNext: () => void;
    onBack: () => void;
    hasMoreResults: boolean;
}

const Pagination: React.FC<PaginationProps> = ({ currentPage, onNext, onBack, hasMoreResults }) => {
    return (
        <div className="mt-4 flex justify-between items-center space-x-4">
            <button
                onClick={onBack}
                disabled={currentPage === 1}
                className="bg-gray-500 text-white py-2 px-4 rounded-md transition-colors hover:bg-gray-700"
            >
                Previous
            </button>
            <span>Page {currentPage}</span>
            <button
                onClick={onNext}
                disabled={!hasMoreResults}
                className="bg-blue-500 text-white py-2 px-4 rounded-md transition-colors hover:bg-blue-700"
            >
                Next
            </button>
        </div>
    );
};

export default Pagination;
