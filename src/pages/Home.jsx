import { useEffect, useMemo, useState } from "react";
import { useLocation, useSearchParams } from "react-router-dom";
import MovieGrid from "../components/MovieGrid.jsx";
import ResultsBar from "../components/ResultsBar.jsx";
import { getDiscoverSelection, saveDiscoverMovies } from "../data/discoverMovies.js";

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
    query ? `Showing: ${query}` : "Discover Movies",
  );

  useEffect(() => {
    if (!query) {
      const cached = getDiscoverSelection().movies;
      if (cached) {
        setMovies(cached);
        setEmptyMessage("");
        setResultsLabel("Discover Movies");
        setStatus("success");
        return;
      }
    }

    const controller = new AbortController();

    setStatus("loading");
    setEmptyMessage("");
    setResultsLabel(query ? `Showing: ${query}` : "Discover Movies");

    async function fetchSearch() {
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
    }

    async function fetchDiscover() {
      const { ids } = getDiscoverSelection();
      const responses = await Promise.all(
        ids.map(async (id) => {
          const url = `https://www.omdbapi.com/?apikey=${import.meta.env.VITE_OMDB_API_KEY}&i=${encodeURIComponent(id)}`;
          const response = await fetch(url, { signal: controller.signal });

          if (!response.ok) {
            throw new Error(`HTTP Error: ${response.status}`);
          }

          return readOmdb(response);
        }),
      );

      if (controller.signal.aborted) {
        return;
      }

      const seen = new Set();
      const discovered = responses.filter((movie) => {
        if (movie.Response !== "True" || !movie.imdbID || seen.has(movie.imdbID)) {
          return false;
        }
        seen.add(movie.imdbID);
        return true;
      });

      if (discovered.length === 0) {
        setMovies([]);
        setStatus("error");
        return;
      }

      saveDiscoverMovies(discovered);
      setMovies(discovered);
      setStatus("success");
    }

    async function fetchMovies() {
      try {
        if (query) {
          await fetchSearch();
          return;
        }

        await fetchDiscover();
      } catch (error) {
        if (error.name === "AbortError" || controller.signal.aborted) {
          return;
        }

        console.error("Error fetching movies:", error);
        setMovies([]);
        setResultsLabel(query ? "Search failed" : "Discover Movies");
        setStatus("error");
      }
    }

    fetchMovies();

    return () => controller.abort();
  }, [query, submittedAt]);

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
        heading={!query}
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
