/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect, useRef } from "react";
import {
  Search,
  ChevronDown,
  LogOut,
  User,
  Menu as MenuIcon,
  X as CloseIcon,
  Link as LinkIcon,
  Plus,
  Info
} from "lucide-react";
import { useAppDispatch, useAppSelector } from "../redux/hooks";
import { logout } from "../redux/authSlice";
import { useNavigate, Link } from "react-router-dom";
import noImage from "../assets/images/no-image.png";
import { debounce } from "lodash";
import { searchMovies, addMovie, addMovieFromInstagram, fetchMovies } from "../redux/movieSlice";
import { toast } from 'react-toastify';

interface NavbarProps {
  currentPage: number;
  pageSize: number;
  selectedGenres: string[];
  selectedCategory: string;
  selectedStatus: string;
  sortBy: string;
  sortOrder: 'asc' | 'desc';
}

const Navbar = ({
  currentPage,
  pageSize,
  selectedGenres,
  selectedCategory,
  selectedStatus,
  sortBy,
  sortOrder
}: NavbarProps) => {
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [showMobileResults, setShowMobileResults] = useState(false);
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [urlInput, setUrlInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchLoading, setIsSearchLoading] = useState(false);

  const user = useAppSelector((state) => state.auth.user);
  const searchResults = useAppSelector((state) => state.movie.searchResults);

  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const searchRef = useRef<HTMLDivElement>(null);
  const mobileSearchRef = useRef<HTMLDivElement>(null);

  const handleLogout = () => {
    dispatch(logout());
    navigate("/login");
  };

  const handleSearch = debounce(async (value: string) => {
    setSearchQuery(value);
    if (value.trim().length >= 3) {
      setIsSearchLoading(true);
      try {
        await dispatch(searchMovies(value));
        setShowResults(true);
        setShowMobileResults(true);
      } finally {
        setIsSearchLoading(false);
      }
    } else {
      setShowResults(false);
      setShowMobileResults(false);
    }
  }, 500);

  const handleUrlSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (urlInput) {
      setIsLoading(true);
      try {
        const result = await dispatch(addMovieFromInstagram(urlInput)).unwrap();
        if (result) {
          toast.success(`🎬 "${result.title}" has been added successfully!`);

          // Mevcut filtrelere göre listeyi yenile
          await dispatch(fetchMovies({
            page: currentPage,
            limit: pageSize,
            genres: selectedGenres,
            mediaType: selectedCategory,
            status: selectedStatus || undefined,
            sortBy,
            sortOrder
          }));
        }
        setUrlInput('');
        setShowUrlInput(false);
      } catch (error: any) {
        toast.error(error.message || 'Error adding movie');
      } finally {
        setIsLoading(false);
      }
    }
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        (searchRef.current && !searchRef.current.contains(event.target as Node)) &&
        (mobileSearchRef.current && !mobileSearchRef.current.contains(event.target as Node))
      ) {
        setShowResults(false);
        setShowMobileResults(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [searchRef, mobileSearchRef]);

  const handleAddMovie = async (movie: any) => {
    try {
      const movieData = {
        tmdbId: movie.tmdbId,
        title: movie.title,
        originalTitle: movie.originalTitle,
        year: movie.year?.split('-')[0],
        mediaType: movie.mediaType,
        posterPath: movie.posterPath ? `https://image.tmdb.org/t/p/w500${movie.posterPath}` : null,
        backdropPath: movie.backdropPath ? `https://image.tmdb.org/t/p/original${movie.backdropPath}` : null,
        overview: movie.overview,
        voteAverage: movie.voteAverage,
        voteCount: movie.voteCount,
        popularity: movie.popularity,
        originalLanguage: movie.originalLanguage,
        genres: movie.genres,
        status: 'unwatched'
      };

      const result = await dispatch(addMovie(movieData)).unwrap();
      if (result) {
        toast.success(`🎬 "${movie.title}" has been added to your list`);

        // Mevcut filtrelere göre listeyi yenile
        await dispatch(fetchMovies({
          page: currentPage,
          limit: pageSize,
          genres: selectedGenres,
          mediaType: selectedCategory,
          status: selectedStatus || undefined,
          sortBy,
          sortOrder
        }));
      }
      setShowResults(false);
    } catch (error: any) {
      toast.error(error.message || 'Failed to add movie');
    }
  };

  const handleDetailMovie = (movie: any) => {
    navigate(`/movie/${movie.tmdbId}/${movie.mediaType}`);
  };

  return (
    <>
      <nav className="bg-white shadow-md relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo and App Name */}
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Link to="/movies" className="text-2xl font-bold text-blue-600 hover:text-blue-700 transition-colors">
                  🎬 MovieHub
                </Link>
              </div>
            </div>

            {/* Desktop Search Bar */}
            <div className="hidden md:flex flex-1 max-w-lg mx-8 relative" ref={searchRef}>
              {showUrlInput ? (
                <form onSubmit={handleUrlSubmit} className="flex gap-2 w-full">
                  <div className="relative flex-1">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <LinkIcon className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="url"
                      value={urlInput}
                      onChange={(e) => setUrlInput(e.target.value)}
                      placeholder="Paste movie URL..."
                      className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      disabled={isLoading}
                    />
                  </div>
                  <button
                    type="submit"
                    className={`px-4 py-2 rounded-md text-sm transition-colors flex items-center gap-2
                      ${isLoading
                        ? 'bg-blue-400 cursor-not-allowed'
                        : 'bg-blue-600 hover:bg-blue-700'} text-white`}
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        <span>Processing...</span>
                      </>
                    ) : (
                      <>
                        <span>Add</span>
                      </>
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowUrlInput(false)}
                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md text-sm hover:bg-gray-50 transition-colors"
                    disabled={isLoading}
                  >
                    Cancel
                  </button>
                </form>
              ) : (
                <div className="flex gap-2 w-full">
                  <div className="relative flex-1">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      {isSearchLoading ? (
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-gray-400" />
                      ) : (
                        <Search className="h-5 w-5 text-gray-400" />
                      )}
                    </div>
                    <input
                      type="text"
                      placeholder="Enter at least 3 characters to search..."
                      onChange={(e) => handleSearch(e.target.value)}
                      className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    />
                  </div>
                  <button
                    onClick={() => setShowUrlInput(true)}
                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md text-sm hover:bg-gray-50 transition-colors flex items-center gap-2"
                  >
                    <LinkIcon className="h-4 w-4" />
                    Add URL
                  </button>
                </div>
              )}

              {/* Desktop Search Results Dropdown */}
              {showResults && searchResults.length > 0 && (
                <div className="absolute mt-1 w-full bg-white border border-gray-300 rounded-md shadow-lg z-40 mt-10">
                  <ul className="max-h-60 overflow-y-auto">
                    {searchResults.map((movie: any) => (
                      <li
                        key={movie.tmdbId}
                        className="flex items-center p-2 hover:bg-gray-100 cursor-pointer"
                        onClick={() => handleDetailMovie(movie)}
                      >
                        <img
                          src={movie.posterPath || noImage}
                          alt={movie.title}
                          className="w-12 h-16 object-cover rounded-md mr-3"
                        />
                        <div className="flex-1">
                          <p className="text-sm font-medium">{movie.title}</p>
                          <p className="text-xs text-gray-500">
                            {movie.year} • {movie.mediaType.toUpperCase()}
                          </p>
                          {movie.genres && movie.genres.length > 0 && (
                            <p className="text-xs text-gray-500">
                              {movie.genres.slice(0, 3).join(", ")}
                            </p>
                          )}
                        </div>
                        <div className="flex flex-col gap-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation(); // Tıklamanın üst öğeye yayılmasını engelle
                              handleAddMovie(movie);
                            }}
                            className="p-1.5 rounded-full hover:bg-gray-200 text-gray-600"
                            title="Add to List"
                          >
                            <Plus className="h-5 w-5" />
                          </button>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* Mobile Menu Button */}
            <div className="flex md:hidden">
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="text-gray-500 hover:text-gray-700 focus:outline-none focus:text-gray-700"
              >
                {isMobileMenuOpen ? (
                  <CloseIcon className="h-6 w-6" />
                ) : (
                  <MenuIcon className="h-6 w-6" />
                )}
              </button>
            </div>

            {/* Desktop Profile Menu */}
            <div className="hidden md:block relative">
              <button
                onClick={() => setIsProfileOpen(!isProfileOpen)}
                className="flex items-center gap-2 bg-gray-50 p-2 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <img
                  src={user?.avatar || noImage}
                  alt={user?.name || "User"}
                  className="h-8 w-8 rounded-full object-cover"
                />
                <span className="hidden sm:block text-sm font-medium text-gray-700">
                  {user?.name || "Guest"}
                </span>
                <ChevronDown className="h-4 w-4 text-gray-500" />
              </button>

              {/* Dropdown Menu */}
              {isProfileOpen && (
                <div className="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-50">
                  <div className="py-1" role="menu">
                    <Link
                      to="/profile"
                      className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
                    >
                      <User className="h-4 w-4" />
                      Profile
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100 flex items-center gap-2"
                      role="menuitem"
                    >
                      <LogOut className="h-4 w-4" />
                      Logout
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden">
            <div className="px-4 pt-2 pb-3 space-y-1 sm:px-3">
              {/* Mobile Search Bar */}
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  {isSearchLoading ? (
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-gray-400" />
                  ) : (
                    <Search className="h-5 w-5 text-gray-400" />
                  )}
                </div>
                <input
                  type="text"
                  placeholder="Search..."
                  value={searchQuery}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2 mb-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
              </div>

              {/* Mobile Search Results */}
              {showMobileResults && searchResults.length > 0 && (
                <div className="bg-white border border-gray-300 rounded-md shadow-lg mt-1">
                  <ul className="max-h-60 overflow-y-auto">
                    {searchResults.map((movie: any) => (
                      <li
                        key={movie.tmdbId}
                        className="flex items-center p-2 hover:bg-gray-100 cursor-pointer"
                        onClick={() => handleDetailMovie(movie)}
                      >
                        <img
                          src={movie.posterPath || noImage}
                          alt={movie.title}
                          className="w-12 h-16 object-cover rounded-md mr-3"
                        />
                        <div className="flex-1">
                          <p className="text-sm font-medium">{movie.title}</p>
                          <p className="text-xs text-gray-500">
                            {movie.year} • {movie.mediaType.toUpperCase()}
                          </p>
                          {movie.genres && movie.genres.length > 0 && (
                            <p className="text-xs text-gray-500">
                              {movie.genres.slice(0, 3).join(", ")}
                            </p>
                          )}
                        </div>
                        <div className="flex flex-col gap-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleAddMovie(movie);
                            }}
                            className="p-1.5 rounded-full hover:bg-gray-200 text-gray-600"
                            title="Add to List"
                          >
                            <Plus className="h-5 w-5" />
                          </button>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Mobile Profile Menu */}
              <div className="mt-4">
                <button
                  onClick={() => setIsProfileOpen(!isProfileOpen)}
                  className="w-full flex items-center gap-2 px-4 py-2 text-left text-gray-700 hover:bg-gray-100 rounded-md"
                >
                  <img
                    src={user?.avatar || noImage}
                    alt={user?.name || "User"}
                    className="h-8 w-8 rounded-full object-cover"
                  />
                  <span className="text-sm font-medium">
                    {user?.name || "Guest"}
                  </span>
                  <ChevronDown className="h-4 w-4 text-gray-500 ml-auto" />
                </button>

                {isProfileOpen && (
                  <div className="mt-2 space-y-1">
                    <Link
                      to="/profile"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md"
                    >
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4" />
                        Profile
                      </div>
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100 rounded-md flex items-center gap-2"
                    >
                      <LogOut className="h-4 w-4" />
                      Logout
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </nav>

      {/* Loading Overlay */}
      {isLoading && (
        <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="bg-white p-8 rounded-lg shadow-xl flex flex-col items-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mb-4"></div>
            <p className="text-gray-700 text-xl font-medium">Film ekleniyor...</p>
            <p className="text-gray-500 text-sm mt-2">Instagram'dan bilgiler alınıyor</p>
            <p className="text-gray-500 text-xs mt-1">Bu işlem biraz zaman alabilir</p>
          </div>
        </div>
      )}
    </>
  );
};

export default Navbar;
