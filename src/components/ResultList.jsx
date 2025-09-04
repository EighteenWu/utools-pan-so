export default function ResultList({
  results,
  onOpenLink,
  onCopyLink,
  onFeedback,
  isLoading,
  actionLoading,
  feedbackDoneIds,
  formatDate
}) {
  // 全局 loading 状态，所有按钮都禁用
  const allDisabled = isLoading || actionLoading;
  const panIconSrc = (panType) => {
    const t = Number(panType);
    if (t === 1) return '/icons/baidupan.png';
    if (t === 2) return '/icons/quark.png';
    if (t === 3) return '/icons/alipan.png';
    if (t === 4) return '/icons/xunlei.png';
    return '/icons/quark.png';
  };
  return (
    <div className="results">
      {results.map((item, index) => (
        <div key={item.resource_id || index} className="result-item card-pansoo">
          <div className="card-title-row">
            <span className="card-title">{item.title}</span>
            <span className="card-badge card-badge-plain">
              <img src={panIconSrc(item.pan_type)} alt="" className="badge-icon-img" />
              {item.pan_type_name}
            </span>
          </div>
          <div className="card-desc">{item.pan_type_name}缓存资源</div>
          <div className="card-meta">
            <span>大小：{item.file_size || '未知大小'}</span>
            <span>日期：{formatDate(item.updated_at)}</span>
          </div>
          <div className="card-actions">
            <button
              className="card-btn"
              onClick={() => onOpenLink(item)}
              disabled={allDisabled}
            >
              打开
            </button>
            <button
              className="card-btn"
              onClick={() => onCopyLink(item)}
              disabled={allDisabled}
            >
              复制链接
            </button>
          </div>
          <div>
            {feedbackDoneIds?.has(item.resource_id) ? (
              <button type="button" className="card-feedback-btn" disabled>
                <span className="icon" style={{fontSize:'17px',marginRight:'4px'}}>
                  <svg width="17" height="17" viewBox="0 0 20 20" fill="none" style={{verticalAlign:'middle'}}><circle cx="10" cy="10" r="9" stroke="#f59e42" strokeWidth="2" fill="#fff7e6"/><rect x="9.1" y="5.2" width="1.8" height="7.2" rx="0.9" fill="#f59e42"/><rect x="9.1" y="14.1" width="1.8" height="1.8" rx="0.9" fill="#f59e42"/></svg>
                </span>
                已反馈
              </button>
            ) : (
              <button type="button" className="card-feedback-btn" onClick={() => onFeedback(item)} disabled={allDisabled}>
                <span className="icon" style={{fontSize:'17px',marginRight:'4px'}}>
                  <svg width="17" height="17" viewBox="0 0 20 20" fill="none" style={{verticalAlign:'middle'}}><circle cx="10" cy="10" r="9" stroke="#f59e42" strokeWidth="2" fill="#fff7e6"/><rect x="9.1" y="5.2" width="1.8" height="7.2" rx="0.9" fill="#f59e42"/><rect x="9.1" y="14.1" width="1.8" height="1.8" rx="0.9" fill="#f59e42"/></svg>
                </span>
                资源失效反馈
              </button>
            )}
          </div>
        </div>
      ))}
    </div>
  );
} 
