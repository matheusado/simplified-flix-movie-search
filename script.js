
const API_KEY = "3a68f5fe";

const searchForm = document.querySelector("#searchForm");
const searchInput = document.querySelector("#searchInput");
const moviesGrid = document.querySelector("#moviesGrid");
const resultsInfo = document.querySelector("#resultsInfo");
const sortSelect = document.querySelector("#sortSelect");

let currentMovies = [];
let activeRequest = 0;

// Event Listener - Search Movies
searchForm.addEventListener("submit", (e) => {
  e.preventDefault();

  const searchTerm = searchInput.value.trim();

  if (searchTerm) {
    fetchMovies(searchTerm);
  }
});

// Event Listener - Sort Movies
sortSelect.addEventListener("change", () => {
  sortMovies();
});

// Fetch Movies from OMDb API
async function fetchMovies(searchTerm) {
  const requestId = ++activeRequest;

  showSkeletons();
  resultsInfo.textContent = `Showing: ${searchTerm}`;
  sortSelect.value = "default";

  try {
    const url = `https://www.omdbapi.com/?apikey=${API_KEY}&s=${encodeURIComponent(searchTerm)}`;

    const res = await fetch(url);

    if (!res.ok) {
      throw new Error(`HTTP Error: ${res.status}`);
    }

    const data = await res.json();

    // Ignore older searches that finish later
    if (requestId !== activeRequest) {
      return;
    }

    if (data.Response === "True") {
      currentMovies = data.Search;

      resultsInfo.textContent =
        `Showing: ${searchTerm} (${data.totalResults} results)`;

      displayMovies(currentMovies);
    } else {
      currentMovies = [];

      moviesGrid.innerHTML = `
        <p>No movies found. ${escapeHTML(data.Error || "")}</p>
      `;
    }
  } catch (error) {
    if (requestId !== activeRequest) {
      return;
    }

    console.error("Error fetching movies:", error);

    currentMovies = [];

    resultsInfo.textContent = "Search failed";

    moviesGrid.innerHTML = `
      <p>Something went wrong. Please try again.</p>
    `;
  }
}

// Display Movies
function displayMovies(movies) {
  const movieResults = movies.map((movie) => {
    const title = escapeHTML(movie.Title);
    const year = escapeHTML(movie.Year);

    const poster =
      movie.Poster && movie.Poster !== "N/A"
        ? movie.Poster
        : "";

    return `
      <div class="movie-card">
        ${
          poster
            ? `
              <img
                class="movie-card__img"
                src="${escapeHTML(poster)}"
                alt="${title} poster"
                loading="lazy"
              />
            `
            : `
              <div class="movie-card__poster-placeholder">
                Movie Poster<br>Not Available
              </div>
            `
        }

        <h2 class="movie-card__title">
          ${title}
        </h2>

        <p class="movie-card__year">
          ${year}
        </p>
      </div>
    `;
  }).join("");

  moviesGrid.innerHTML = movieResults;

  // Handle Broken Poster Images
  moviesGrid
    .querySelectorAll(".movie-card__img")
    .forEach((img) => {
      img.addEventListener("error", () => {
        const placeholder = document.createElement("div");

        placeholder.className =
          "movie-card__poster-placeholder";

        placeholder.innerHTML =
          "Movie Poster<br>Not Available";

        img.replaceWith(placeholder);
      });
    });
}

// Sort Movies
function sortMovies() {
  const sortValue = sortSelect.value;

  const sortedMovies = [...currentMovies];

  switch (sortValue) {
    case "a-z":
      sortedMovies.sort((a, b) =>
        a.Title.localeCompare(b.Title)
      );
      break;

    case "z-a":
      sortedMovies.sort((a, b) =>
        b.Title.localeCompare(a.Title)
      );
      break;

    case "newest":
      sortedMovies.sort((a, b) =>
        parseInt(b.Year, 10) -
        parseInt(a.Year, 10)
      );
      break;

    case "oldest":
      sortedMovies.sort((a, b) =>
        parseInt(a.Year, 10) -
        parseInt(b.Year, 10)
      );
      break;

    default:
      break;
  }

  displayMovies(sortedMovies);
}

// Show Skeleton Loading Animation
function showSkeletons() {
  moviesGrid.innerHTML = Array.from(
    { length: 10 },
    () => `
      <div class="movie-card movie-card--skeleton">
        <div class="movie-card__img--skeleton"></div>
        <div class="movie-card__title--skeleton"></div>
        <div class="movie-card__year--skeleton"></div>
      </div>
    `
  ).join("");
}

// Escape HTML to prevent unsafe content injection
function escapeHTML(value) {
  return String(value ?? "").replace(
    /[&<>"']/g,
    (character) => {
      const entities = {
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;"
      };

      return entities[character];
    }
  );
}

// Automatically Search Marvel on Page Load
searchInput.value = "Marvel";
fetchMovies("Marvel");
