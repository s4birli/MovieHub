import { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "../redux/hooks";
import { fetchMovies, fetchFilterOptions, updateMovieStatus, deleteMovie } from "../redux/movieSlice";
import MovieCard from "../components/MovieCard";
import Sidebar from "../components/Sidebar";
import { Menu } from "lucide-react";
import Navbar from "../components/Navbar";
import { Movie } from '../types/movie';
import { toast } from "react-hot-toast";

const MovieList = () => {
  const dispatch = useAppDispatch();
  const { movies, pagination, filterOptions, loading } = useAppSelector((state) => state.movie);
  const [selectedGenres, setSelectedGenres] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [sortBy, setSortBy] = useState("rating");
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState("unwatched");
  const [pageSize, setPageSize] = useState(60);

  // Initial fetch for filter options
  useEffect(() => {
    dispatch(fetchFilterOptions());
  }, [dispatch]);

  // Fetch movies when filters change
  useEffect(() => {
    const fetchData = async () => {
      await dispatch(fetchMovies({
        page: currentPage,
        limit: pageSize,
        genres: selectedGenres,
        mediaType: selectedCategory,
        status: selectedStatus || undefined,
        sortBy,
        sortOrder,
        search: searchQuery
      }));
    };

    fetchData();
  }, [dispatch, currentPage, pageSize, selectedGenres, selectedCategory, selectedStatus, sortBy, sortOrder, searchQuery]);

  const handleSortChange = (value: string) => {
    if (value.startsWith('-')) {
      setSortBy(value.slice(1));
      setSortOrder('desc');
    } else {
      setSortBy(value);
      setSortOrder('asc');
    }
  };

  const handleStatusChange = async (movieId: number, status: 'watched' | 'unwatched') => {
    try {
      const result = await dispatch(updateMovieStatus({ movieId, status })).unwrap();
      if (result) {
        toast.success(`Movie status updated successfully`);
        // Listeyi yenile
        await dispatch(fetchMovies({
          page: currentPage,
          limit: pageSize,
          genres: selectedGenres,
          mediaType: selectedCategory,
          status: selectedStatus || undefined,
          sortBy,
          sortOrder,
          search: searchQuery
        }));
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to update status');
    }
  };

  const handleRemove = async (movieId: number) => {
    try {
      const result = await dispatch(deleteMovie(movieId)).unwrap();
      if (result) {
        toast.success(`Movie removed successfully`);
        // Listeyi yenile
        await dispatch(fetchMovies({
          page: currentPage,
          limit: pageSize,
          genres: selectedGenres,
          mediaType: selectedCategory,
          status: selectedStatus || undefined,
          sortBy,
          sortOrder,
          search: searchQuery
        }));
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to remove movie');
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar
        currentPage={currentPage}
        pageSize={pageSize}
        selectedGenres={selectedGenres}
        selectedCategory={selectedCategory}
        selectedStatus={selectedStatus}
        sortBy={sortBy}
        sortOrder={sortOrder}
        search={searchQuery}
      />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Movie List</h1>
          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsMobileFilterOpen(!isMobileFilterOpen)}
              className="lg:hidden flex items-center gap-2 px-4 py-2 bg-white rounded-lg shadow-sm hover:bg-gray-50"
            >
              <Menu className="w-5 h-5" />
              <span>Filters</span>
            </button>
            <select
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="text-sm border border-gray-300 rounded-md px-2 py-1.5 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value={60}>60 per page</option>
              <option value={120}>120 per page</option>
              <option value={180}>180 per page</option>
            </select>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-6">
          <div
            className={`
            lg:w-1/4
            fixed lg:relative top-0 left-0 h-full lg:h-auto w-3/4 lg:w-auto
            transform lg:transform-none
            ${isMobileFilterOpen
                ? "translate-x-0"
                : "-translate-x-full lg:translate-x-0"
              }
            transition-transform duration-300 ease-in-out
            z-30 lg:z-auto
            bg-gray-100 lg:bg-transparent
            p-4 lg:p-0
          `}
          >
            <Sidebar
              genres={filterOptions.genres}
              categories={filterOptions.mediaTypes}
              statusOptions={filterOptions.statusOptions}
              selectedGenres={selectedGenres}
              selectedCategory={selectedCategory}
              selectedStatus={selectedStatus}
              sortBy={`${sortOrder === 'desc' ? '-' : ''}${sortBy}`}
              searchQuery={searchQuery}
              onGenreChange={(genres) => {
                setSelectedGenres(genres);
                setCurrentPage(1);
                setIsMobileFilterOpen(false);
              }}
              onCategoryChange={(category) => {
                setSelectedCategory(category);
                setCurrentPage(1);
                setIsMobileFilterOpen(false);
              }}
              onStatusChange={(status) => {
                setSelectedStatus(status);
                setCurrentPage(1);
              }}
              onSortChange={handleSortChange}
              onSearchChange={(query) => {
                setSearchQuery(query);
                setCurrentPage(1);
              }}
              onClose={() => setIsMobileFilterOpen(false)}
              isMobile={isMobileFilterOpen}
            />
          </div>

          {isMobileFilterOpen && (
            <div
              className="fixed inset-0 bg-black bg-opacity-50 z-20 lg:hidden"
              onClick={() => setIsMobileFilterOpen(false)}
            />
          )}

          <div className="lg:w-3/4">
            {loading ? (
              <div className="flex items-center justify-center min-h-[400px]">
                <div className="flex flex-col items-center gap-4">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                  <p className="text-gray-500 text-sm">Loading movies...</p>
                </div>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {movies.map((movie: Movie) => (
                    <MovieCard
                      key={`movie-${movie.tmdbId}`}
                      movie={movie}
                      onStatusChange={(status) => handleStatusChange(movie.tmdbId, status)}
                      onRemove={() => handleRemove(movie.tmdbId)}
                    />
                  ))}
                </div>

                {movies.length === 0 && (
                  <div className="text-center py-12">
                    <p className="text-gray-500">No movies found.</p>
                  </div>
                )}

                {pagination && pagination.totalPages > 1 && (
                  <div className="mt-6 flex justify-center">
                    <nav className="flex gap-2">
                      <button
                        onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                        disabled={currentPage === 1}
                        className={`px-3 py-1 rounded ${currentPage === 1
                          ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                          : "bg-white hover:bg-gray-100"
                          }`}
                      >
                        Previous
                      </button>

                      {Array.from({ length: pagination.totalPages }, (_, i) => (
                        <button
                          key={`page-${i + 1}`}
                          onClick={() => setCurrentPage(i + 1)}
                          className={`px-3 py-1 rounded ${currentPage === i + 1
                            ? "bg-blue-600 text-white"
                            : "bg-white hover:bg-gray-100"
                            }`}
                        >
                          {i + 1}
                        </button>
                      ))}

                      <button
                        onClick={() => setCurrentPage(prev => Math.min(prev + 1, pagination.totalPages))}
                        disabled={currentPage === pagination.totalPages}
                        className={`px-3 py-1 rounded ${currentPage === pagination.totalPages
                          ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                          : "bg-white hover:bg-gray-100"
                          }`}
                      >
                        Next
                      </button>
                    </nav>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MovieList;
