import { useState } from "react";
import { Link } from "react-router-dom";

export default function MovieCard({ movie }) {
  const [posterBroken, setPosterBroken] = useState(false);
  const poster = movie.Poster && movie.Poster !== "N/A" ? movie.Poster : "";
  const showPoster = poster && !posterBroken;

  return (
    <Link
      className="movie-card"
      to={`/movie/${movie.imdbID}`}
      aria-label={`View details for ${movie.Title}`}
    >
      {showPoster ? (
        <img
          className="movie-card__img"
          src={poster}
          alt={`${movie.Title} poster`}
          loading="lazy"
          onError={() => setPosterBroken(true)}
        />
      ) : (
        <div className="movie-card__poster-placeholder">
          Movie Poster
          <br />
          Not Available
        </div>
      )}
      <h2 className="movie-card__title">{movie.Title}</h2>
      <p className="movie-card__year">{movie.Year}</p>
    </Link>
  );
}
