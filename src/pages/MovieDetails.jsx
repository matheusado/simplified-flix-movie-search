import { useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";

const SUMMARY_FIELDS = [
  ["Year", "Year"],
  ["Rating", "imdbRating"],
  ["Released", "Released"],
];

const INFO_FIELDS = [
  ["Genre", "Genre"],
  ["Director", "Director"],
  ["Writer", "Writer"],
  ["Actors", "Actors"],
  ["Plot", "Plot"],
  ["Language", "Language"],
  ["Awards", "Awards"],
];

async function readOmdb(response) {
  const text = await response.text();

  try {
    return JSON.parse(text);
  } catch {
    return { Response: "False", Error: "" };
  }
}

function displayValue(value) {
  const text = String(value ?? "").trim();
  if (!text || text === "N/A") {
    return "";
  }
  return text;
}

export default function MovieDetails() {
  const { imdbID } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const [movie, setMovie] = useState(null);
  const [status, setStatus] = useState("loading");
  const [errorMessage, setErrorMessage] = useState("");
  const [posterBroken, setPosterBroken] = useState(false);

  useEffect(() => {
    const controller = new AbortController();

    setMovie(null);
    setPosterBroken(false);
    setErrorMessage("");
    setStatus("loading");

    async function fetchMovie() {
      try {
        const url = `https://www.omdbapi.com/?apikey=${import.meta.env.VITE_OMDB_API_KEY}&i=${encodeURIComponent(imdbID)}`;
        const response = await fetch(url, { signal: controller.signal });

        if (!response.ok) {
          throw new Error(`HTTP Error: ${response.status}`);
        }

        const data = await readOmdb(response);

        if (controller.signal.aborted) {
          return;
        }

        if (data.Response === "True") {
          setMovie(data);
          setStatus("success");
          return;
        }

        setErrorMessage(data.Error || "");
        setStatus("empty");
      } catch (error) {
        if (error.name === "AbortError" || controller.signal.aborted) {
          return;
        }

        console.error("Error fetching movie:", error);
        setStatus("error");
      }
    }

    fetchMovie();

    return () => controller.abort();
  }, [imdbID]);

  function handleBack() {
    if (location.key === "default") {
      navigate("/");
      return;
    }

    navigate(-1);
  }

  const poster = displayValue(movie?.Poster);
  const showPoster = poster && !posterBroken;
  const summary = SUMMARY_FIELDS.map(([label, key]) => {
    let value = displayValue(movie?.[key]);
    if (key === "imdbRating" && /^\d+(\.\d+)?$/.test(value)) {
      value = `${value}/10`;
    }
    return { label, value };
  }).filter((field) => field.value);
  const info = INFO_FIELDS.map(([label, key]) => ({
    label,
    value: displayValue(movie?.[key]),
  })).filter((field) => field.value);

  return (
    <main>
      <div className="movie-details">
        <button className="movie-details__back" type="button" onClick={handleBack}>
          ← Back
        </button>

        {status === "loading" && (
          <div
            className="movie-details__layout"
            role="status"
            aria-label="Loading movie details"
          >
            <div>
              <div className="movie-details__poster--skeleton"></div>
              <div className="movie-details__title--skeleton"></div>
              <div className="movie-details__line--skeleton"></div>
              <div className="movie-details__line--skeleton"></div>
            </div>
            <div>
              <div className="movie-details__line--skeleton"></div>
              <div className="movie-details__line--skeleton"></div>
              <div className="movie-details__line--skeleton"></div>
            </div>
          </div>
        )}

        {status === "error" && (
          <p className="movie-details__message">
            Something went wrong. Please try again.
          </p>
        )}

        {status === "empty" && (
          <p className="movie-details__message">
            No movie found.{errorMessage ? ` ${errorMessage}` : ""}
          </p>
        )}

        {status === "success" && movie && (
          <article className="movie-details__layout">
            <div className="movie-details__summary">
              {showPoster ? (
                <img
                  className="movie-details__poster"
                  src={poster}
                  alt={`${movie.Title} poster`}
                  onError={() => setPosterBroken(true)}
                />
              ) : (
                <div className="movie-card__poster-placeholder movie-details__poster-placeholder">
                  Movie Poster
                  <br />
                  Not Available
                </div>
              )}
              <h1 className="movie-details__title">{movie.Title}</h1>
              {summary.length > 0 && (
                <dl className="movie-details__facts">
                  {summary.map((field) => (
                    <div className="movie-details__fact" key={field.label}>
                      <dt>{field.label}:</dt>
                      <dd>{field.value}</dd>
                    </div>
                  ))}
                </dl>
              )}
            </div>
            {info.length > 0 && (
              <dl className="movie-details__sections">
                {info.map((field) => (
                  <div className="movie-details__section" key={field.label}>
                    <dt className="movie-details__section-label">{field.label}</dt>
                    <dd className="movie-details__section-value">{field.value}</dd>
                  </div>
                ))}
              </dl>
            )}
          </article>
        )}
      </div>
    </main>
  );
}
