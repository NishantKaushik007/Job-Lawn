'use client';

interface PaginationProps {
    currentPage: number;
    onNext: () => void;
    onBack: () => void;
    hasMoreResults: boolean;
    disableNext: boolean;
}

const Pagination: React.FC<PaginationProps> = ({
    currentPage,
    onNext,
    onBack,
    hasMoreResults,
    disableNext,
}) => {
    const disablePrev = currentPage === 1;

    return (
        <div className="mt-4 flex justify-between items-center space-x-4">
            <button
                onClick={onBack}
                disabled={disablePrev}
                className={`bg-gray-500 text-white py-2 px-4 rounded-md transition-colors ${
                    disablePrev ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-700'
                }`}
            >
                Previous
            </button>
            <span className="text-lg font-semibold text-white">Page {currentPage}</span>
            <button
                onClick={onNext}
                disabled={disableNext}
                className={`bg-blue-500 text-white py-2 px-4 rounded-md transition-colors ${
                    disableNext ? 'opacity-50 cursor-not-allowed' : 'hover:bg-blue-700'
                }`}
            >
                Next
            </button>
        </div>
    );
};

export default Pagination;
