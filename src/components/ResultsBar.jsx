export default function ResultsBar({ label, sort, onSortChange }) {
  return (
    <div className="controls">
      <p id="resultsInfo" className="resultsInfo">
        {label}
      </p>
      <div>
        <label htmlFor="sortSelect">Sort:</label>
        <select
          id="sortSelect"
          value={sort}
          onChange={(event) => onSortChange(event.target.value)}
        >
          <option value="default">Default</option>
          <option value="a-z">A - Z</option>
          <option value="z-a">Z - A</option>
          <option value="newest">Newest</option>
          <option value="oldest">Oldest</option>
        </select>
      </div>
    </div>
  );
}
