import { useEffect, useState } from 'react';
import Search from './components/Search.jsx';
import Spinner from './components/Spinner.jsx';
import MovieCard from './components/MovieCard.jsx';
//import {useDebounce} from 'react-use';
import { updateSearchCount } from './components/appWrite.js';

const API_BASE_URL = 'https://api.themoviedb.org/3';

const API_OPTIONS = {
  method: 'GET',
  headers: {
    accept: 'application/json',
    Authorization: `Bearer ${import.meta.env.VITE_TMDB_API_KEY}`,
  },
};

const App = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [movieList, setMovieList] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  //const [debouncedSearchTerm, setDebouncedSearchTerm] = useState();

  const fetchMovies = async (query = '') => {
    try {
      setIsLoading(true);

      const endpoint = query
        ? `${API_BASE_URL}/search/movie?query=${encodeURIComponent(query)}`
        : `${API_BASE_URL}/discover/movie?sort_by=popularity.desc`;

      const response = await fetch(endpoint, API_OPTIONS);

      if (!response.ok) {
        throw new Error('Failed to fetch movies');
      }

      const data = await response.json();
      updateSearchCount();
      setMovieList(data.results || []);
      setErrorMessage('');
    } catch (error) {
      console.error(`Error fetching movies: ${error}`);
      setErrorMessage('Failed to fetch movies. Please try again later.');
      setMovieList([]);
    } finally {
      setIsLoading(false);
    }
  };

  // ✅ Fetch popular movies on first load
  useEffect(() => {
    fetchMovies();
  }, []);

  // ✅ Search automatically as user types (with debounce)
  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      if (searchTerm.trim() !== '') {
        fetchMovies(searchTerm);
      } else {
        fetchMovies(); // show popular movies if input is cleared
      }
    }, 500); // 0.5 second debounce

    return () => clearTimeout(delayDebounce);
  }, [searchTerm]);

  return (
    <main>
      <div className="pattern" />
      <div className="wrapper">
        <header>
          <img src="/hero.png" alt="Hero Banner" />
          <h1>
            Find <span className="text-gradient">Movies</span> You'll Enjoy
          </h1>
        </header>

        <Search searchTerm={searchTerm} setSearchTerm={setSearchTerm} />

        <section className="all-movies">
          <h2 className="mt-[40px]">All Movies</h2>

          {isLoading && <Spinner />}
          {errorMessage && <p className="text-red-500">{errorMessage}</p>}

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mt-4">
            {movieList.map((movie) => (
              <MovieCard key={movie.id} movie={movie} />
            ))}
          </div>
        </section>
      </div>
    </main>
  );
};

export default App;
