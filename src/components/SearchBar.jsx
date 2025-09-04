export default function SearchBar({ query, onQueryChange, onSearch, placeholder = '搜索电影、音乐、软件、文档等资源...' }) {
  const handleSubmit = (e) => {
    e.preventDefault();
    if (query.trim()) onSearch(query);
  };
  return (
    <form className="apple-search-form" onSubmit={handleSubmit} autoComplete="off">
      <div className="apple-search-container">
        <input
          className="apple-search-input"
          type="text"
          value={query}
          onChange={e => onQueryChange(e.target.value)}
          placeholder={placeholder}
        />
        <button className="apple-search-button" type="submit" aria-label="搜索" disabled={!query.trim()}>
          <svg className="apple-search-icon" viewBox="0 0 20 20" fill="none" width="20" height="20">
            <circle cx="9" cy="9" r="7" stroke="currentColor" strokeWidth="2"/>
            <path d="M15.5 15.5L13 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          </svg>
        </button>
      </div>
    </form>
  );
}