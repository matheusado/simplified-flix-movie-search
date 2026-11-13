import MovieCard from "./MovieCard.jsx";

const SKELETON_COUNT = 10;

export default function MovieGrid({ movies, status, emptyMessage }) {
  if (status === "loading") {
    return (
      <div className="movies-grid" id="moviesGrid">
        {Array.from({ length: SKELETON_COUNT }, (_, index) => (
          <div className="movie-card movie-card--skeleton" key={index}>
            <div className="movie-card__img--skeleton"></div>
            <div className="movie-card__title--skeleton"></div>
            <div className="movie-card__year--skeleton"></div>
          </div>
        ))}
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className="movies-grid" id="moviesGrid">
        <p>Something went wrong. Please try again.</p>
      </div>
    );
  }

  if (status === "empty") {
    return (
      <div className="movies-grid" id="moviesGrid">
        <p>No movies found. {emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="movies-grid" id="moviesGrid">
      {movies.map((movie, index) => (
        <MovieCard key={`${movie.imdbID}-${index}`} movie={movie} />
      ))}
    </div>
  );
}
