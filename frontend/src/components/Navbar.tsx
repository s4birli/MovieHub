/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect, useRef } from "react";
import {
  Search,
  ChevronDown,
  LogOut,
  Settings,
  User,
  Menu as MenuIcon,
  X as CloseIcon,
} from "lucide-react";
import { useAppDispatch, useAppSelector } from "../redux/hooks";
import { logout } from "../redux/authSlice";
import { useNavigate } from "react-router-dom";
import noImage from "../assets/images/no-image.png";
import { debounce } from "lodash";
import { searchMovies, addMovie } from "../redux/movieSlice";
import { TMDB_GENRES } from "../models/TMDBTypes";

const Navbar = () => {
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showResults, setShowResults] = useState(false);

  const user = useAppSelector((state) => state.auth.user);
  const searchResults = useAppSelector((state) => state.movie.searchResults);

  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const searchRef = useRef<HTMLDivElement>(null);

  const handleLogout = () => {
    dispatch(logout());
    navigate("/login");
  };

  const handleSearch = debounce((value: string) => {
    if (value.trim() !== "") {
      dispatch(searchMovies(value));
      setShowResults(true);
    } else {
      setShowResults(false);
    }
  }, 500);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        searchRef.current &&
        !searchRef.current.contains(event.target as Node)
      ) {
        setShowResults(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [searchRef]);

  const handleAddMovie = (movie: any) => {
    console.log(movie);
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
    dispatch(addMovie(movieData));
  };

  return (
    <nav className="bg-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo and App Name */}
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <span className="text-2xl font-bold text-blue-600">
                🎬 MovieHub
              </span>
            </div>
          </div>

          {/* Desktop Search Bar */}
          <div
            className="hidden md:flex flex-1 max-w-lg mx-8 relative"
            ref={searchRef}
          >
            <div className="relative w-full">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search Movies..."
                onChange={(e) => handleSearch(e.target.value)}
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              />
              {/* Search Results Dropdown */}
              {showResults && searchResults.length > 0 && (
                <div className="absolute mt-1 w-full bg-white border border-gray-300 rounded-md shadow-lg z-50">
                  <ul className="max-h-60 overflow-y-auto">
                    {searchResults.map((movie: any) => (
                      <li
                        key={movie.tmdbId}
                        className="flex items-center p-2 hover:bg-gray-100"
                      >
                        <img
                          src={movie.posterPath || noImage}
                          alt={movie.title}
                          className="w-12 h-16 object-cover rounded-md mr-3"
                        />
                        <div className="flex-1">
                          <p className="text-sm font-medium">{movie.title}</p>
                          <p className="text-xs text-gray-500">
                            {movie.year} • {movie.genre}
                          </p>
                        </div>
                        <button
                          onClick={() => handleAddMovie(movie)}
                          className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                        >
                          Add to List
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
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
                  <button
                    className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
                    role="menuitem"
                  >
                    <User className="h-4 w-4" />
                    Profil
                  </button>
                  <button
                    className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
                    role="menuitem"
                  >
                    <Settings className="h-4 w-4" />
                    Ayarlar
                  </button>
                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100 flex items-center gap-2"
                    role="menuitem"
                  >
                    <LogOut className="h-4 w-4" />
                    Çıkış Yap
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
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search Movies..."
                onChange={(e) => handleSearch(e.target.value)}
                className="block w-full pl-10 pr-3 py-2 mb-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              />
            </div>

            {/* Mobile Profile Menu */}
            <button
              onClick={() => setIsProfileOpen(!isProfileOpen)}
              className="w-full flex items-center gap-2 px-4 py-2 text-left text-gray-700 hover:bg-gray-100"
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

            {/* Mobile Profile Dropdown */}
            {isProfileOpen && (
              <div className="px-2 mt-2 space-y-1">
                <button
                  className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
                  role="menuitem"
                >
                  <User className="h-4 w-4" />
                  Profil
                </button>
                <button
                  className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
                  role="menuitem"
                >
                  <Settings className="h-4 w-4" />
                  Ayarlar
                </button>
                <button
                  onClick={handleLogout}
                  className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100 flex items-center gap-2"
                  role="menuitem"
                >
                  <LogOut className="h-4 w-4" />
                  Çıkış Yap
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
