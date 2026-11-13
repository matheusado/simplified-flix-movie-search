import { useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";

export default function Nav() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const query = searchParams.get("q") ?? "";
  const [term, setTerm] = useState(query);

  useEffect(() => {
    setTerm(query);
  }, [query]);

  function handleSubmit(event) {
    event.preventDefault();

    const nextTerm = term.trim();
    if (!nextTerm) {
      return;
    }

    navigate(
      { pathname: "/", search: `?q=${encodeURIComponent(nextTerm)}` },
      {
        replace: nextTerm === query,
        state: { submittedAt: Date.now() },
      },
    );
  }

  return (
    <nav>
      <Link className="logo" to="/?q=Marvel" aria-label="Simplified Flix home">
        <img
          src="/assets/fes-logo.png"
          alt=""
          className="logo__img"
          width="50"
        />
        <div className="logo__title">
          <span>Simplified</span> Flix
        </div>
      </Link>
      <form className="search-form" id="searchForm" onSubmit={handleSubmit}>
        <div className="search-form__group">
          <input
            className="search-form__input"
            type="text"
            id="searchInput"
            placeholder="Search movies..."
            value={term}
            onChange={(event) => setTerm(event.target.value)}
            required
          />
          <button className="search-form__button" type="submit" aria-label="Search">
            <svg
              className="search-form__icon"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="11" cy="11" r="7"></circle>
              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            </svg>
          </button>
        </div>
      </form>
    </nav>
  );
}
