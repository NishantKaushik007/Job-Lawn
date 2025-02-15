'use client'; // This makes it a Client Component

import React, { useState, useEffect } from 'react';

interface SearchFormProps {
  initialKeyword: string;
}

const SearchForm: React.FC<SearchFormProps> = ({ initialKeyword }) => {
  const [keyword, setKeyword] = useState<string>(initialKeyword);

  // Load the keyword from localStorage if available
  useEffect(() => {
    const cachedKeyword = localStorage.getItem('searchKeyword');
    if (cachedKeyword) {
      setKeyword(cachedKeyword);
    }
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Store the search keyword in localStorage for future use
    if (keyword) {
      localStorage.setItem('searchKeyword', keyword);
    } else {
      localStorage.removeItem('searchKeyword');
    }

    const params = new URLSearchParams(window.location.search);
    if (keyword) {
      params.set('keyword', keyword);
    } else {
      params.delete('keyword');
    }
    params.set('page', '1'); // Reset to page 1 when performing a new search
    window.history.pushState({}, '', `${window.location.pathname}?${params.toString()}`);
    window.location.reload();
  };

  const handleClear = () => {
    setKeyword(''); // Clear the keyword
    localStorage.removeItem('searchKeyword'); // Remove cached search keyword
    const params = new URLSearchParams(window.location.search);
    params.delete('keyword');
    window.history.pushState({}, '', `${window.location.pathname}?${params.toString()}`);
    window.location.reload();
  };

  return (
    <form onSubmit={handleSubmit} className="flex items-center space-x-2 w-full">
      <input
        type="text"
        name="keyword"
        value={keyword}
        onChange={(e) => setKeyword(e.target.value)}
        placeholder="Search Keyword"
        className="border rounded p-2 w-full sm:w-72 md:w-96 focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-300 ease-in-out"
      />
      <button
        type="submit"
        className="bg-blue-500 text-white p-2 rounded hover:bg-blue-600 transition duration-200 ease-in-out"
        disabled={!keyword}
      >
        Search
      </button>
      <button
        type="button"
        onClick={handleClear}
        className="bg-gray-300 text-white p-2 rounded hover:bg-gray-400 transition duration-200 ease-in-out"
      >
        Clear
      </button>
    </form>
  );
};

export default SearchForm;
