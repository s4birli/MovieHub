import { SlidersHorizontal, X, Search } from "lucide-react";

interface SidebarProps {
  genres: string[];
  categories: string[];
  selectedGenre: string;
  selectedCategory: string;
  sortBy: string;
  searchQuery: string;
  onGenreChange: (genre: string) => void;
  onCategoryChange: (category: string) => void;
  onSortChange: (sort: string) => void;
  onSearchChange: (query: string) => void;
  onClose: () => void;
  isMobile: boolean;
}

const Sidebar = ({
  genres,
  categories,
  selectedGenre,
  selectedCategory,
  sortBy,
  searchQuery,
  onGenreChange,
  onCategoryChange,
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
          <h2 className="text-lg font-semibold">Filtreler</h2>
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
            placeholder="Film ara..."
            className="w-full pl-10 p-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
        </div>
      </div>

      {/* Genre Filters */}
      <div className="space-y-6">
        <div>
          <h3 className="text-sm font-medium text-gray-700 mb-3">Tür</h3>
          <div className="space-y-2">
            <div className="flex items-center">
              <input
                type="radio"
                id="all-genres"
                name="genre"
                checked={selectedGenre === ""}
                onChange={() => onGenreChange("")}
                className="w-4 h-4 text-blue-600"
              />
              <label htmlFor="all-genres" className="ml-2 text-sm">
                Tümü
              </label>
            </div>
            {genres.map((genre) => (
              <div key={genre} className="flex items-center">
                <input
                  type="radio"
                  id={genre}
                  name="genre"
                  checked={selectedGenre === genre}
                  onChange={() => onGenreChange(genre)}
                  className="w-4 h-4 text-blue-600"
                />
                <label htmlFor={genre} className="ml-2 text-sm">
                  {genre}
                </label>
              </div>
            ))}
          </div>
        </div>

        {/* Category Filters */}
        <div>
          <h3 className="text-sm font-medium text-gray-700 mb-3">Kategori</h3>
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
              <div key={category} className="flex items-center">
                <input
                  type="radio"
                  id={category}
                  name="category"
                  checked={selectedCategory === category}
                  onChange={() => onCategoryChange(category)}
                  className="w-4 h-4 text-blue-600"
                />
                <label htmlFor={category} className="ml-2 text-sm">
                  {category}
                </label>
              </div>
            ))}
          </div>
        </div>

        {/* Sorting Options */}
        <div>
          <h3 className="text-sm font-medium text-gray-700 mb-3">Sıralama</h3>
          <select
            value={sortBy}
            onChange={(e) => onSortChange(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-md text-sm"
          >
            <option value="title">İsme Göre (A-Z)</option>
            <option value="-title">İsme Göre (Z-A)</option>
            <option value="-rating">Puana Göre (Yüksek-Düşük)</option>
            <option value="rating">Puana Göre (Düşük-Yüksek)</option>
          </select>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
