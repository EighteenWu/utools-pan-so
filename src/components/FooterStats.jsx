export default function FooterStats({ total, yesterday }) {
  return (
    <div className="footer-stats">
      <span className="footer-stat-item">
        <svg className="footer-icon" viewBox="0 0 20 20" fill="none" width="16" height="16"><path d="M4.5 4.5A1.5 1.5 0 0 1 6 3h8a1.5 1.5 0 0 1 1.5 1.5v12A1.5 1.5 0 0 1 14 18H6a1.5 1.5 0 0 1-1.5-1.5v-12Z" stroke="#2997ff" strokeWidth="1.2"/><path d="M7 7h6M7 10h6M7 13h4" stroke="#2997ff" strokeWidth="1.2" strokeLinecap="round"/></svg>
        资源总数: <b>{total.toLocaleString()}</b>
      </span>
      <span className="footer-stat-item">
        <svg className="footer-icon" viewBox="0 0 20 20" fill="none" width="16" height="16"><path d="M10 2v8l6 3.5" stroke="#2997ff" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/><circle cx="10" cy="10" r="8.5" stroke="#2997ff" strokeWidth="1.2"/></svg>
        昨日新增: <b>{yesterday.toLocaleString()}</b>
      </span>
    </div>
  );
} 