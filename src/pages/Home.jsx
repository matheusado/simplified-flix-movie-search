import { useEffect, useMemo, useState } from "react";
import { useLocation, useSearchParams } from "react-router-dom";
import MovieGrid from "../components/MovieGrid.jsx";
import ResultsBar from "../components/ResultsBar.jsx";

const SORTS = new Set(["default", "a-z", "z-a", "newest", "oldest"]);

async function readOmdb(response) {
  const text = await response.text();

  try {
    return JSON.parse(text);
  } catch {
    return { Response: "False", Error: "" };
  }
}

function sortMovies(movies, sort) {
  const sortedMovies = [...movies];

  switch (sort) {
    case "a-z":
      sortedMovies.sort((a, b) => a.Title.localeCompare(b.Title));
      break;
    case "z-a":
      sortedMovies.sort((a, b) => b.Title.localeCompare(a.Title));
      break;
    case "newest":
      sortedMovies.sort(
        (a, b) => parseInt(b.Year, 10) - parseInt(a.Year, 10),
      );
      break;
    case "oldest":
      sortedMovies.sort(
        (a, b) => parseInt(a.Year, 10) - parseInt(b.Year, 10),
      );
      break;
    default:
      break;
  }

  return sortedMovies;
}

export default function Home() {
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();
  const query = searchParams.get("q")?.trim() ?? "";
  const sortParam = searchParams.get("sort") ?? "default";
  const sort = SORTS.has(sortParam) ? sortParam : "default";
  const submittedAt = location.state?.submittedAt;
  const [movies, setMovies] = useState([]);
  const [status, setStatus] = useState("loading");
  const [emptyMessage, setEmptyMessage] = useState("");
  const [resultsLabel, setResultsLabel] = useState(
    `Showing: ${query || "Marvel"}`,
  );

  useEffect(() => {
    if (!query) {
      setSearchParams({ q: "Marvel" }, { replace: true });
      return;
    }

    const controller = new AbortController();

    setStatus("loading");
    setEmptyMessage("");
    setResultsLabel(`Showing: ${query}`);

    async function fetchMovies() {
      try {
        const url = `https://www.omdbapi.com/?apikey=${import.meta.env.VITE_OMDB_API_KEY}&s=${encodeURIComponent(query)}`;
        const response = await fetch(url, { signal: controller.signal });

        if (!response.ok) {
          throw new Error(`HTTP Error: ${response.status}`);
        }

        const data = await readOmdb(response);

        if (controller.signal.aborted) {
          return;
        }

        if (data.Response === "True") {
          setMovies(data.Search ?? []);
          setResultsLabel(`Showing: ${query} (${data.totalResults} results)`);
          setStatus("success");
          return;
        }

        setMovies([]);
        setEmptyMessage(data.Error || "");
        setStatus("empty");
      } catch (error) {
        if (error.name === "AbortError" || controller.signal.aborted) {
          return;
        }

        console.error("Error fetching movies:", error);
        setMovies([]);
        setResultsLabel("Search failed");
        setStatus("error");
      }
    }

    fetchMovies();

    return () => controller.abort();
  }, [query, submittedAt, setSearchParams]);

  const sortedMovies = useMemo(
    () => sortMovies(movies, sort),
    [movies, sort],
  );

  function handleSortChange(nextSort) {
    setSearchParams(
      (current) => {
        const next = new URLSearchParams(current);
        if (nextSort === "default") {
          next.delete("sort");
        } else {
          next.set("sort", nextSort);
        }
        return next;
      },
      { replace: true, state: location.state },
    );
  }

  return (
    <main>
      <ResultsBar
        label={resultsLabel}
        sort={sort}
        onSortChange={handleSortChange}
      />
      <MovieGrid
        movies={sortedMovies}
        status={status}
        emptyMessage={emptyMessage}
      />
    </main>
  );
}
