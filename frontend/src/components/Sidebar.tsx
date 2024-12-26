import { SlidersHorizontal, X, Search } from "lucide-react";
import MultiSelectDropdown from './MultiSelectDropdown';

interface SidebarProps {
  genres: Array<{ value: string; label: string }>;
  categories: Array<{ value: string; label: string }>;
  statusOptions: Array<{ value: string; label: string }>;
  selectedGenres: string[];
  selectedCategory: string;
  selectedStatus: string;
  sortBy: string;
  searchQuery: string;
  onGenreChange: (genres: string[]) => void;
  onCategoryChange: (category: string) => void;
  onStatusChange: (status: string) => void;
  onSortChange: (sort: string) => void;
  onSearchChange: (query: string) => void;
  onClose: () => void;
  isMobile: boolean;
}

const Sidebar = ({
  genres,
  categories,
  statusOptions,
  selectedGenres,
  selectedCategory,
  selectedStatus,
  sortBy,
  searchQuery,
  onGenreChange,
  onCategoryChange,
  onStatusChange,
  onSortChange,
  onSearchChange,
  onClose,
  isMobile,
}: SidebarProps) => {



  return (
    <div className="bg-white p-6 rounded-lg shadow-lg h-full lg:h-fit lg:sticky lg:top-4">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="w-5 h-5" />
          <h2 className="text-lg font-semibold">Filters</h2>
        </div>
        {isMobile && (
          <button
            onClick={onClose}
            className="lg:hidden p-2 hover:bg-gray-100 rounded-full"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Search Input */}
      <div className="mb-6">
        <div className="relative">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search Movies..."
            className="w-full pl-10 p-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
        </div>
      </div>

      {/* Genre Multi-Select Dropdown */}
      <div className="space-y-6">
        <div>
          <h3 className="text-sm font-medium text-gray-700 mb-3">Genres</h3>
          <MultiSelectDropdown
            options={genres}
            selectedValues={selectedGenres}
            onChange={onGenreChange}
            placeholder="Chose Genres..."
          />
        </div>

        {/* Category Filters */}
        <div>
          <h3 className="text-sm font-medium text-gray-700 mb-3">Category</h3>
          <div className="space-y-2">
            <div className="flex items-center">
              <input
                type="radio"
                id="all-categories"
                name="category"
                checked={selectedCategory === ""}
                onChange={() => onCategoryChange("")}
                className="w-4 h-4 text-blue-600"
              />
              <label htmlFor="all-categories" className="ml-2 text-sm">
                Tümü
              </label>
            </div>
            {categories.map((category) => (
              <div key={category.value} className="flex items-center">
                <input
                  type="radio"
                  id={category.value}
                  name="category"
                  checked={selectedCategory === category.value}
                  onChange={() => onCategoryChange(category.value)}
                  className="w-4 h-4 text-blue-600"
                />
                <label htmlFor={category.value} className="ml-2 text-sm">
                  {category.label}
                </label>
              </div>
            ))}
          </div>
        </div>

        {/* Status Filter */}
        <div>
          <h3 className="text-sm font-medium text-gray-700 mb-3">Status</h3>
          <div className="space-y-2">
            <div className="flex items-center">
              <input
                type="radio"
                id="all-status"
                name="status"
                checked={selectedStatus === ""}
                onChange={() => onStatusChange("")}
                className="w-4 h-4 text-blue-600"
              />
              <label htmlFor="all-status" className="ml-2 text-sm">
                All
              </label>
            </div>
            {statusOptions.map((status) => (
              <div key={status.value} className="flex items-center">
                <input
                  type="radio"
                  id={status.value}
                  name="status"
                  checked={selectedStatus === status.value}
                  onChange={() => onStatusChange(status.value)}
                  className="w-4 h-4 text-blue-600"
                />
                <label htmlFor={status.value} className="ml-2 text-sm">
                  {status.label}
                </label>
              </div>
            ))}
          </div>
        </div>

        {/* Sorting Options */}
        <div>
          <h3 className="text-sm font-medium text-gray-700 mb-3">Sorting</h3>
          <select
            value={sortBy}
            onChange={(e) => onSortChange(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-md text-sm"
          >
            <option value="title">Name Ascending</option>
            <option value="-title">Name Descending</option>
            <option value="-rating">Rating Descending</option>
            <option value="rating">Rating Ascending</option>
          </select>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
