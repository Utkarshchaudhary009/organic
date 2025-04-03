"use client";

import { useState, useRef, useEffect } from "react";
import { Search, X } from "lucide-react";
import { useRouter } from "next/navigation";

export default function SearchInput({ mobile = false }: { mobile?: boolean }) {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/search?q=${encodeURIComponent(query.trim())}`);
      setIsOpen(false);
      setQuery("");
    }
  };

  const toggleSearch = () => {
    setIsOpen(!isOpen);
    if (!isOpen) {
      setQuery("");
    }
  };

  if (mobile) {
    return (
      <form
        onSubmit={handleSubmit}
        className='w-full relative'
      >
        <input
          type='text'
          placeholder='Search products...'
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className='w-full py-2 px-4 pr-10 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-green-500'
        />
        <button
          type='submit'
          className='absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-gray-400'
        >
          <Search size={18} />
        </button>
      </form>
    );
  }

  return (
    <div className='relative'>
      <button
        onClick={toggleSearch}
        className='p-2 text-gray-700 dark:text-gray-200 hover:text-green-600 dark:hover:text-green-400'
        aria-label={isOpen ? "Close search" : "Open search"}
      >
        {isOpen ? <X size={20} /> : <Search size={20} />}
      </button>

      {isOpen && (
        <div className='absolute right-0 top-full mt-2 w-64 bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden z-50'>
          <form
            onSubmit={handleSubmit}
            className='w-full relative'
          >
            <input
              ref={inputRef}
              type='text'
              placeholder='Search products...'
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className='w-full py-2 px-4 pr-10 border-none bg-transparent text-gray-900 dark:text-gray-100 focus:outline-none'
            />
            <button
              type='submit'
              className='absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-gray-400'
            >
              <Search size={18} />
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
