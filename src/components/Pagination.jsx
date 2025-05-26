export default function Pagination({ page, totalPages, onPageChange, isLoading }) {
  if (totalPages <= 1) return null;
  const pages = [];
  const maxDisplayedPages = 5;
  const halfMaxPages = Math.floor(maxDisplayedPages / 2);
  let startPage = Math.max(1, page - halfMaxPages);
  const endPage = Math.min(totalPages, startPage + maxDisplayedPages - 1);
  if (endPage - startPage + 1 < maxDisplayedPages) {
    startPage = Math.max(1, endPage - maxDisplayedPages + 1);
  }
  pages.push(
    <button key="prev" onClick={() => onPageChange(page - 1)} disabled={page === 1 || isLoading} className="pagination-btn">上一页</button>
  );
  if (startPage > 1) {
    pages.push(
      <button key="1" onClick={() => onPageChange(1)} className="pagination-btn" disabled={isLoading}>1</button>
    );
    if (startPage > 2) {
      pages.push(<span key="dots1" className="pagination-dots">...</span>);
    }
  }
  for (let i = startPage; i <= endPage; i++) {
    pages.push(
      <button key={i} onClick={() => onPageChange(i)} className={`pagination-btn ${i === page ? 'pagination-active' : ''}`} disabled={isLoading}>{i}</button>
    );
  }
  if (endPage < totalPages) {
    if (endPage < totalPages - 1) {
      pages.push(<span key="dots2" className="pagination-dots">...</span>);
    }
    pages.push(
      <button key={totalPages} onClick={() => onPageChange(totalPages)} className="pagination-btn" disabled={isLoading}>{totalPages}</button>
    );
  }
  pages.push(
    <button key="next" onClick={() => onPageChange(page + 1)} disabled={page === totalPages || isLoading} className="pagination-btn">下一页</button>
  );
  return <div className="pagination">{pages}</div>;
} 