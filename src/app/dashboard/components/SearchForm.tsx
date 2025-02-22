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
        className="border rounded p-2 w-full sm:w-72 md:w-96 h-10 focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-300 ease-in-out"
      />
      <button
        type="submit"
        className="text-white bg-gradient-to-br from-purple-600 to-blue-500 hover:bg-gradient-to-bl focus:ring-1 focus:outline-none focus:ring-blue-300 dark:focus:ring-blue-800 font-medium rounded-lg text-sm px-5 py-2.5 h-10 cursor-pointer"
        disabled={!keyword}
      >
        Search
      </button>
      <button
        type="button"
        onClick={handleClear}
        className="text-white bg-gradient-to-br from-zinc-600 to-zinc-400 hover:bg-gradient-to-bl focus:ring-1 focus:outline-none focus:ring-zinc-300 font-medium rounded-lg text-sm px-5 py-2.5 h-10"
      >
        Clear
      </button>
    </form>
  );
};

export default SearchForm;
