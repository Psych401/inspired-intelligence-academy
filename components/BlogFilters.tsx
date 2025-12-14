/**
 * Blog Filters Component
 * 
 * Provides search, category, author, and sort filters for blog posts
 */

'use client';

import { useState } from 'react';
import { Search, X, ChevronDown } from 'lucide-react';
import { BlogCategory, BlogAuthor } from '@/hooks/useWordPressPosts';

interface BlogFiltersProps {
  categories: BlogCategory[];
  authors: BlogAuthor[];
  onFilterChange: (filters: FilterState) => void;
}

export interface FilterState {
  search: string;
  selectedCategories: string[];
  selectedAuthors: string[];
  sortBy: 'newest' | 'oldest';
}

export default function BlogFilters({ categories, authors, onFilterChange }: BlogFiltersProps) {
  const [search, setSearch] = useState('');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedAuthors, setSelectedAuthors] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState<'newest' | 'oldest'>('newest');
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  const [showAuthorDropdown, setShowAuthorDropdown] = useState(false);
  const [showSortDropdown, setShowSortDropdown] = useState(false);

  const handleCategoryToggle = (categoryId: string) => {
    setSelectedCategories(prev => {
      const newCategories = prev.includes(categoryId)
        ? prev.filter(id => id !== categoryId)
        : [...prev, categoryId];
      onFilterChange({
        search,
        selectedCategories: newCategories,
        selectedAuthors,
        sortBy,
      });
      return newCategories;
    });
  };

  const handleAuthorToggle = (authorId: string) => {
    setSelectedAuthors(prev => {
      const newAuthors = prev.includes(authorId)
        ? prev.filter(id => id !== authorId)
        : [...prev, authorId];
      onFilterChange({
        search,
        selectedCategories,
        selectedAuthors: newAuthors,
        sortBy,
      });
      return newAuthors;
    });
  };

  const handleSearchChange = (value: string) => {
    setSearch(value);
    onFilterChange({
      search: value,
      selectedCategories,
      selectedAuthors,
      sortBy,
    });
  };

  const handleSortChange = (value: 'newest' | 'oldest') => {
    setSortBy(value);
    setShowSortDropdown(false);
    onFilterChange({
      search,
      selectedCategories,
      selectedAuthors,
      sortBy: value,
    });
  };

  const clearFilters = () => {
    setSearch('');
    setSelectedCategories([]);
    setSelectedAuthors([]);
    setSortBy('newest');
    onFilterChange({
      search: '',
      selectedCategories: [],
      selectedAuthors: [],
      sortBy: 'newest',
    });
  };

  const hasActiveFilters = search || selectedCategories.length > 0 || selectedAuthors.length > 0;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-8">
      <div className="flex flex-col lg:flex-row gap-4">
        {/* Search */}
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Search posts..."
            value={search}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-200 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-brand-blue/20 focus:border-brand-blue outline-none transition-all"
          />
        </div>

        {/* Categories Dropdown */}
        <div className="relative">
          <button
            onClick={() => {
              setShowCategoryDropdown(!showCategoryDropdown);
              setShowAuthorDropdown(false);
              setShowSortDropdown(false);
            }}
            className="px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg hover:bg-gray-100 transition-colors flex items-center gap-2 min-w-[160px] justify-between"
          >
            <span className="text-sm font-medium text-gray-700">
              Categories {selectedCategories.length > 0 && `(${selectedCategories.length})`}
            </span>
            <ChevronDown size={16} className={`text-gray-400 transition-transform ${showCategoryDropdown ? 'rotate-180' : ''}`} />
          </button>
          {showCategoryDropdown && (
            <div className="absolute top-full left-0 mt-2 w-64 bg-white border border-gray-200 rounded-lg shadow-lg z-10 max-h-80 overflow-y-auto">
              <div className="p-4 space-y-2">
                {categories.length === 0 ? (
                  <p className="text-sm text-gray-500">No categories available</p>
                ) : (
                  categories.map((category) => (
                    <label key={category.id} className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-2 rounded">
                      <input
                        type="checkbox"
                        checked={selectedCategories.includes(category.id)}
                        onChange={() => handleCategoryToggle(category.id)}
                        className="w-4 h-4 text-brand-indigo border-gray-300 rounded focus:ring-brand-blue"
                      />
                      <span className="text-sm text-gray-700">{category.name}</span>
                      {category.count !== undefined && (
                        <span className="text-xs text-gray-400 ml-auto">({category.count})</span>
                      )}
                    </label>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* Authors Dropdown */}
        <div className="relative">
          <button
            onClick={() => {
              setShowAuthorDropdown(!showAuthorDropdown);
              setShowCategoryDropdown(false);
              setShowSortDropdown(false);
            }}
            className="px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg hover:bg-gray-100 transition-colors flex items-center gap-2 min-w-[160px] justify-between"
          >
            <span className="text-sm font-medium text-gray-700">
              Authors {selectedAuthors.length > 0 && `(${selectedAuthors.length})`}
            </span>
            <ChevronDown size={16} className={`text-gray-400 transition-transform ${showAuthorDropdown ? 'rotate-180' : ''}`} />
          </button>
          {showAuthorDropdown && (
            <div className="absolute top-full left-0 mt-2 w-64 bg-white border border-gray-200 rounded-lg shadow-lg z-10 max-h-80 overflow-y-auto">
              <div className="p-4 space-y-2">
                {authors.length === 0 ? (
                  <p className="text-sm text-gray-500">No authors available</p>
                ) : (
                  authors.map((author) => (
                    <label key={author.id} className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-2 rounded">
                      <input
                        type="checkbox"
                        checked={selectedAuthors.includes(author.id)}
                        onChange={() => handleAuthorToggle(author.id)}
                        className="w-4 h-4 text-brand-indigo border-gray-300 rounded focus:ring-brand-blue"
                      />
                      <span className="text-sm text-gray-700">{author.name}</span>
                    </label>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* Sort Dropdown */}
        <div className="relative">
          <button
            onClick={() => {
              setShowSortDropdown(!showSortDropdown);
              setShowCategoryDropdown(false);
              setShowAuthorDropdown(false);
            }}
            className="px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg hover:bg-gray-100 transition-colors flex items-center gap-2 min-w-[160px] justify-between"
          >
            <span className="text-sm font-medium text-gray-700">
              Sort: {sortBy === 'newest' ? 'Newest' : 'Oldest'}
            </span>
            <ChevronDown size={16} className={`text-gray-400 transition-transform ${showSortDropdown ? 'rotate-180' : ''}`} />
          </button>
          {showSortDropdown && (
            <div className="absolute top-full right-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
              <div className="p-2">
                <button
                  onClick={() => handleSortChange('newest')}
                  className={`w-full text-left px-3 py-2 rounded text-sm hover:bg-gray-50 ${
                    sortBy === 'newest' ? 'text-brand-indigo font-semibold' : 'text-gray-700'
                  }`}
                >
                  Newest First
                </button>
                <button
                  onClick={() => handleSortChange('oldest')}
                  className={`w-full text-left px-3 py-2 rounded text-sm hover:bg-gray-50 ${
                    sortBy === 'oldest' ? 'text-brand-indigo font-semibold' : 'text-gray-700'
                  }`}
                >
                  Oldest First
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Clear Filters */}
        {hasActiveFilters && (
          <button
            onClick={clearFilters}
            className="px-4 py-3 text-sm font-medium text-gray-600 hover:text-gray-800 flex items-center gap-2"
          >
            <X size={16} />
            Clear
          </button>
        )}
      </div>
    </div>
  );
}

