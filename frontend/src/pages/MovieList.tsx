/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "../redux/hooks";
import { setMovies, setFilteredMovies, fetchMovies } from "../redux/movieSlice";
import MovieCard from "../components/MovieCard";
import Sidebar from "../components/Sidebar";
import { Menu } from "lucide-react";
import Navbar from "../components/Navbar";
import axios from "axios";

const initialMovies = [
  {
    id: 1,
    title: "Inception",
    poster:
      "https://images.unsplash.com/photo-1440404653325-ab127d49abc1?w=500",
    genre: "Bilim Kurgu",
    category: "Hollywood",
    rating: 8.8,
    watched: false,
  },
  {
    id: 2,
    title: "The Shawshank Redemption",
    poster:
      "https://images.unsplash.com/photo-1485846234645-a62644f84728?w=500",
    genre: "Drama",
    category: "Hollywood",
    rating: 9.3,
    watched: true,
  },
  {
    id: 3,
    title: "Pulp Fiction",
    poster:
      "https://images.unsplash.com/photo-1594909122845-11baa439b7bf?w=500",
    genre: "Suç",
    category: "Bağımsız",
    rating: 8.9,
    watched: false,
  },
];

const MovieList = () => {
  const dispatch = useAppDispatch();
  const { movies, filteredMovies } = useAppSelector((state) => state.movie);
  const [selectedGenre, setSelectedGenre] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [sortBy, setSortBy] = useState("title");
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [genres, setGenres] = useState([]);
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    getMovies();
  }, [dispatch]);

  useEffect(() => {
    filterMovies();
  }, [movies, searchQuery, selectedGenre, selectedCategory, sortBy]);

  const getMovies = async () => {
    const movieList = (await dispatch(fetchMovies())).payload as [];
    dispatch(setMovies(movieList));
    if (movieList.length > 0) {
      const genresList = [...new Set(movieList.map((movie: { genre: any; }) => movie.genre))];
      const categoriesList = [
        ...new Set(movieList.map((movie: { category: string }) => movie.category)),
      ];
      if (genresList && categoriesList) {
        setGenres(genresList as []);
        setCategories(categoriesList as []);
      }
    }
  };

  const filterMovies = async () => {
    if (movies.length > 0) {
      let filtered = movies.filter((movie) =>
        movie.title.toLowerCase().includes(searchQuery.toLowerCase())
      );

      if (selectedGenre) {
        filtered = filtered.filter((movie) => movie.genre === selectedGenre);
      }

      if (selectedCategory) {
        filtered = filtered.filter(
          (movie) => movie.category === selectedCategory
        );
      }

      const sortField = sortBy.startsWith("-") ? sortBy.slice(1) : sortBy;
      const sortOrder = sortBy.startsWith("-") ? -1 : 1;

      filtered.sort((a, b) => {
        if (sortField === "title") {
          return sortOrder * a.title.localeCompare(b.title);
        }
        return (
          sortOrder *
          (a[sortField as keyof typeof a] < b[sortField as keyof typeof b]
            ? -1
            : 1)
        );
      });

      dispatch(setFilteredMovies(filtered));
    } else {
      dispatch(setFilteredMovies([]));
    }
  };

  const handleToggleWatched = (id: number) => {
    const updatedMovies = movies.map((movie) =>
      movie.id === id ? { ...movie, watched: !movie.watched } : movie
    );
    dispatch(setMovies(updatedMovies));
  };

  const handleDelete = (id: number) => {
    const updatedMovies = movies.filter((movie) => movie.id !== id);
    dispatch(setMovies(updatedMovies));
  };



  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Film Listesi</h1>
          <button
            onClick={() => setIsMobileFilterOpen(!isMobileFilterOpen)}
            className="lg:hidden flex items-center gap-2 px-4 py-2 bg-white rounded-lg shadow-sm hover:bg-gray-50"
          >
            <Menu className="w-5 h-5" />
            <span>Filtreler</span>
          </button>
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
              genres={genres}
              categories={categories}
              selectedGenre={selectedGenre}
              selectedCategory={selectedCategory}
              sortBy={sortBy}
              searchQuery={searchQuery}
              onGenreChange={(genre) => {
                setSelectedGenre(genre);
                setIsMobileFilterOpen(false);
              }}
              onCategoryChange={(category) => {
                setSelectedCategory(category);
                setIsMobileFilterOpen(false);
              }}
              onSortChange={(sort) => {
                setSortBy(sort);
                setIsMobileFilterOpen(false);
              }}
              onSearchChange={(query) => {
                setSearchQuery(query);
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
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredMovies.map((movie) => (
                <MovieCard
                  key={`movie-${movie.id}`}
                  movie={movie}
                  onToggleWatched={handleToggleWatched}
                  onDelete={handleDelete}
                />
              ))}
            </div>

            {filteredMovies.length === 0 && (
              <div className="text-center py-12">
                <p className="text-gray-500">Film bulunamadı.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MovieList;
