export default function SearchBar({ query, onQueryChange, onSearch, searchType, onSearchTypeChange, placeholder = '搜索电影、音乐、软件、文档等资源...' }) {
  const handleSubmit = (e) => {
    e.preventDefault();
    if (query.trim()) onSearch(query, searchType);
  };
  return (
    <form className="main-searchbar-form" onSubmit={handleSubmit} autoComplete="off">
      <div className="main-searchbar-wrap">
        <input
          className="main-searchbar-input"
          type="text"
          value={query}
          onChange={e => onQueryChange(e.target.value)}
          placeholder={placeholder}
        />
        <button className="main-searchbar-btn" type="submit" aria-label="搜索" disabled={!query.trim()}>
          <svg className="main-searchbar-icon" viewBox="0 0 20 20" fill="none" width="20" height="20"><circle cx="9" cy="9" r="7" stroke="currentColor" strokeWidth="2"/><path d="M15.5 15.5L13 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
        </button>
      </div>
      <div className="main-searchbar-modebar">
        <button
          type="button"
          className={`main-mode-btn${searchType === 'local' ? ' active' : ''}`}
          onClick={() => onSearchTypeChange('local')}
        >
          本地
        </button>
        <button
          type="button"
          className={`main-mode-btn${searchType === 'online' ? ' active' : ''}`}
          onClick={() => onSearchTypeChange('online')}
        >
          联网
        </button>
      </div>
      <div className="main-searchbar-tip">
        {searchType === 'local' ? '本地模式：优先搜索已缓存资源' : '联网模式：实时搜索网盘资源'}
      </div>
    </form>
  );
} 