// 导入网盘图标
import baidupanIcon from '/icons/baidupan.png';
import quarkIcon from '/icons/quark.png';
import alipanIcon from '/icons/alipan.png';
import xunleiIcon from '/icons/xunlei.png';

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
  const allDisabled = isLoading || actionLoading;
  const panIconSrc = (panType) => {
    const t = Number(panType);
    if (t === 1) return baidupanIcon;
    if (t === 2) return quarkIcon;
    if (t === 3) return alipanIcon;
    if (t === 4) return xunleiIcon;
    return quarkIcon;
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
            {feedbackDoneIds?.has(item.resource_id) ? (
              <button 
                type="button" 
                className="card-feedback-triangle-btn feedback-done" 
                disabled
                title="已反馈"
              >
                <span className="triangle-icon">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                    <path d="M12 2L2 20h20L12 2z" fill="#f59e42" stroke="#f59e42" strokeWidth="1"/>
                    <path d="M11 8v6h2V8h-2zm0 8v2h2v-2h-2z" fill="#fff"/>
                  </svg>
                </span>
              </button>
            ) : (
              <button 
                type="button" 
                className="card-feedback-triangle-btn" 
                onClick={() => onFeedback(item)} 
                disabled={allDisabled}
                title="资源失效反馈"
              >
                <span className="triangle-icon">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                    <path d="M12 2L2 20h20L12 2z" fill="#f59e42" stroke="#f59e42" strokeWidth="1"/>
                    <path d="M11 8v6h2V8h-2zm0 8v2h2v-2h-2z" fill="#fff"/>
                  </svg>
                </span>
              </button>
            )}
          </div>
        </div>
      ))}
    </div>
  );
} 

