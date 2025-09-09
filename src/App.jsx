import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import './index.css';
import SearchBar from './components/SearchBar';
import HomeFilters from './components/HomeFilters';
import ResultList from './components/ResultList';
import Message from './components/Message';
import { useFilters } from './hooks/useFilters';

const PAN_TYPE_NAME = {
  1: '百度网盘',
  2: '夸克网盘',
  3: '阿里云盘',
  4: '迅雷网盘'
};

function copyToClipboard(text) {
  try {
    if (window.utools && window.utools.copyText) {
      window.utools.copyText(text);
      window.utools.showNotification('链接已复制');
      return;
    }
    if (navigator.clipboard?.writeText) {
      navigator.clipboard.writeText(text);
      alert('链接已复制');
      return;
    }
  } catch {}
  const textarea = document.createElement('textarea');
  textarea.value = text;
  document.body.appendChild(textarea);
  textarea.select();
  document.execCommand('copy');
  document.body.removeChild(textarea);
  alert('链接已复制');
}

async function checkResourceStatus(resourceId, panType) {
  try {
    const res = await fetch(`https://pansoo.cn/api/check_resource_status?resource_id=${resourceId}&pan_type=${panType}`);
    return await res.json();
  } catch (err) {
    console.error('资源有效性校验失败', err);
    return { valid: false, message: '校验失败' };
  }
}

export default function App() {
  const [keyword, setKeyword] = useState('');
  const [searchedKeyword, setSearchedKeyword] = useState('');
  const [results, setResults] = useState([]);
  const [searched, setSearched] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [resourceType, setResourceType] = useState('quark');
  const [totalCount, setTotalCount] = useState(0);
  const [searchMode] = useState('online');
  const pageSize = 15;

  const {
    filters,
    cloudDiskType,
    fileType,
    exactMatch,
    timeRange,
    updateFilter,
    resetFilters,
    hasActiveFilters,
    buildApiParams,
    buildResourceServiceParams
  } = useFilters({
    cloudDiskType: 'all',
    fileType: 'all',
    exactMatch: false,
    timeRange: 'all'
  });

  const [feedbackOpen, setFeedbackOpen] = useState(false);
  const [feedbackResource, setFeedbackResource] = useState(null);
  const [feedbackStatus, setFeedbackStatus] = useState('idle');
  const [feedbackMsg, setFeedbackMsg] = useState('');
  const [feedbackSubmitting, setFeedbackSubmitting] = useState(false);
  const [feedbackForm, setFeedbackForm] = useState({ invalid_type: 1, description: '', contact_info: '' });
  const [footerStats, setFooterStats] = useState({ total: 0, yesterday: 0 });
  const [globalActionLoading, setGlobalActionLoading] = useState(false);
  const [feedbackDoneIds, setFeedbackDoneIds] = useState(() => new Set());
  const [deletedResourceMsg, setDeletedResourceMsg] = useState('');
  const [showBackToTop, setShowBackToTop] = useState(false);

  const [message, setMessage] = useState({ text: '', type: 'info' });
  const [showMsg, setShowMsg] = useState(false);
  const msgTimerRef = useRef();

  const showUserMessage = (text, type = 'info') => {
    setMessage({ text, type });
    setShowMsg(true);
    if (msgTimerRef.current) clearTimeout(msgTimerRef.current);
    msgTimerRef.current = setTimeout(() => setShowMsg(false), 2600);
  };

  const search = useCallback(async (currentPage = 1, customType, mode = searchMode, customKeyword) => {
    const realKeyword = (customKeyword ?? keyword).trim();
    if (!realKeyword) return;
    setIsLoading(true);
    setSearched(true);
    setSearchedKeyword(realKeyword);
    try {
      const params = buildApiParams({
        keyword: realKeyword,
        page: currentPage,
        pageSize,
        resourceType: customType || resourceType
      });
      const url = `https://pansoo.cn/api/${mode === 'local' ? 'cached_resources' : 'search'}?${params.toString()}`;
      const res = await fetch(url);
      const data = await res.json();
      const response = mode === 'local'
        ? { results: data.resources || [], total: data.total || (data.resources ? data.resources.length : 0), status: data.status || 'success' }
        : data;
      if (response.status === 'error' || !response.results) {
        setResults([]);
        setTotalPages(1);
        setTotalCount(0);
      } else {
        setResults(response.results || []);
        setTotalCount(response.total || 0);
        setTotalPages(Math.ceil((response.total || 0) / pageSize) || 1);
      }
    } catch (e) {
      console.error('搜索失败:', e);
      showUserMessage('搜索失败，请稍后重试');
      setResults([]);
      setTotalPages(1);
      setTotalCount(0);
    } finally {
      setIsLoading(false);
    }
  }, [keyword, resourceType, searchMode, pageSize, buildApiParams]);

  const searchedRef = useRef(searched);
  useEffect(() => { searchedRef.current = searched; }, [searched]);

  // 筛选器变化时自动触发搜索（只在已经搜索过的情况下）
  useEffect(() => {
    if (!searchedRef.current || !searchedKeyword.trim()) return;
    setPage(1);
    const t = setTimeout(() => search(1, undefined, undefined, searchedKeyword), 100);
    return () => clearTimeout(t);
  }, [filters, search, searchedKeyword]);

  const mappedResults = useMemo(() => results.map(item => {
    const panTypeNum = Number(item.pan_type);
    return {
      ...item,
      title: item.file_name || item.title || '',
      pan_type: panTypeNum,
      pan_type_name: PAN_TYPE_NAME[panTypeNum] || '未知网盘',
      updated_at: item.updated_at || item.created_at || ''
    };
  }), [results]);

  const handleOpenLink = useCallback(async (item) => {
    if (globalActionLoading) return;
    setGlobalActionLoading(true);
    try {
      const checkData = await checkResourceStatus(item.resource_id, item.pan_type);
      if (!checkData.valid) {
        showUserMessage(checkData.message || '资源不可用');
        return;
      }
      if (checkData.share_url) {
        if (window.utools?.shellOpenExternal) {
          window.utools.shellOpenExternal(checkData.share_url);
        } else {
          window.open(checkData.share_url, '_blank');
        }
      } else {
        showUserMessage('未获取到分享链接');
      }
    } catch (e) {
      console.error('打开链接失败:', e);
      showUserMessage('校验或获取链接失败');
    } finally {
      setGlobalActionLoading(false);
    }
  }, [globalActionLoading]);

  const handleCopyLink = useCallback(async (item) => {
    if (globalActionLoading) return;
    setGlobalActionLoading(true);
    try {
      const checkData = await checkResourceStatus(item.resource_id, item.pan_type);
      if (!checkData.valid) {
        showUserMessage(checkData.message || '资源不可用');
        return;
      }
      if (checkData.share_url) {
        copyToClipboard(checkData.share_url);
      } else {
        showUserMessage('未获取到分享链接');
      }
    } catch (e) {
      console.error('复制链接失败:', e);
      showUserMessage('校验或获取链接失败');
    } finally {
      setGlobalActionLoading(false);
    }
  }, [globalActionLoading]);

  const handlePageChange = useCallback((newPage) => {
    setPage(newPage);
    search(newPage, undefined, searchMode, keyword);
  }, [search, searchMode, keyword]);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [page]);

  const handleHomeSearch = useCallback((newKeyword) => {
    const searchKeyword = newKeyword || keyword;
    if (!searchKeyword.trim()) return;
    setKeyword(searchKeyword);
    setPage(1);
    setSearched(false);
    setTimeout(() => search(1, undefined, searchMode, searchKeyword), 0);
  }, [keyword, search, searchMode]);

  const closeFeedback = () => {
    setFeedbackOpen(false);
    setFeedbackResource(null);
    setFeedbackForm({ invalid_type: 1, description: '', contact_info: '' });
    setFeedbackStatus('idle');
    setFeedbackMsg('');
  };

  const submitFeedback = async (e) => {
    e.preventDefault();
    if (!feedbackResource) return;
    setFeedbackSubmitting(true);
    setFeedbackStatus('idle');
    setFeedbackMsg('');
    try {
      const res = await fetch('https://pansoo.cn/api/report_invalid_resource', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          resource_id: feedbackResource.resource_id,
          pan_type: feedbackResource.pan_type,
          ...feedbackForm
        })
      });
      const data = await res.json();
      if (res.ok && data.status !== 'error') {
        if (data.is_deleted) {
          setResults(prev => prev.filter(r => r.resource_id !== feedbackResource.resource_id));
          setDeletedResourceMsg('该资源已确认失效并自动删除');
          setTimeout(() => setDeletedResourceMsg(''), 3000);
        } else {
          setFeedbackDoneIds(prev => new Set(prev).add(feedbackResource.resource_id));
          setFeedbackStatus('success');
          setFeedbackMsg('该资源仍然有效，感谢你的反馈');
        }
        setTimeout(() => closeFeedback(), 1200);
      } else {
        setFeedbackStatus('error');
        setFeedbackMsg(data.message || '提交失败，请稍后重试');
      }
    } catch (e) {
      setFeedbackStatus('error');
      setFeedbackMsg('提交失败，请稍后重试');
    } finally {
      setFeedbackSubmitting(false);
    }
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // 加载页脚统计数据
  const loadFooterStats = useCallback(async () => {
    try {
      const res = await fetch('https://pansoo.cn/api/resource_stats');
      const data = await res.json();
      if (data.status === 'success') {
        setFooterStats({
          total: data.total || 0,
          yesterday: data.yesterday || 0
        });
      }
    } catch (error) {
      console.error('加载统计数据失败:', error);
      // 保持默认值，不影响页面正常使用
    }
  }, []);

  // 页面加载时获取统计数据
  useEffect(() => {
    loadFooterStats();
  }, [loadFooterStats]);

  return (
    <div className="container">
      {/* Header */}
      <div className="top-header-row">
        <div className="header-title" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
          <span className="logo-text">97盘搜</span>
        </div>
        <div className="search-section">
          <SearchBar
            query={keyword}
            onQueryChange={setKeyword}
            onSearch={handleHomeSearch}
          />
        </div>
        <div className="filters-section">
          <HomeFilters
            cloudDiskType={cloudDiskType}
            fileType={fileType}
            timeRange={timeRange}
            exactMatch={exactMatch}
            onChange={updateFilter}
            onReset={resetFilters}
          />
        </div>
      </div>

      {/* 提示消息 */}
      <Message show={showMsg} message={message} />

      {/* 右上角全局 loading-spinner，仅动画提示，不遮盖主内容 */}
      {globalActionLoading && (
        <div style={{position:'fixed',top:18,right:64,zIndex:9999}}>
          <span className="loading-spinner" style={{width:28,height:28,borderWidth:3,display:'inline-block'}}></span>
        </div>
      )}

      {/* 搜索结果统计 */}
      {searched && (
        <div className="search-stats">
          搜索 <span className="highlight">{searchedKeyword}</span> 的结果，共 <span className="highlight">{totalCount}</span> 条
        </div>
      )}

      {/* 搜索结果列表 */}
      {mappedResults.length > 0 && (
        <div className="results">
          <ResultList
            results={mappedResults}
            onOpenLink={handleOpenLink}
            onCopyLink={handleCopyLink}
            onFeedback={(item) => { setFeedbackResource(item); setFeedbackOpen(true); }}
            isLoading={isLoading || globalActionLoading}
            actionLoading={isLoading || globalActionLoading}
            feedbackDoneIds={feedbackDoneIds}
            formatDate={(s) => {
              if (!s) return '';
              const d = new Date(s);
              if (Number.isNaN(d.getTime())) return s;
              return d.toLocaleString('zh-CN', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit' });
            }}
          />
        </div>
      )}

      {/* 无结果提示 */}
      {searched && mappedResults.length === 0 && !isLoading && (
        <div className="no-results">未找到相关资源</div>
      )}

      {/* 加载中 */}
      {isLoading && (
        <div className="loading">
          <div className="loading-spinner"></div>
          <div>搜索中，请稍候...</div>
        </div>
      )}

      {/* 分页控件（简易） */}
      {mappedResults.length > 0 && totalPages > 1 && (
        <div className="pagination">
          <button type="button" className="pagination-btn" disabled={page === 1 || isLoading} onClick={() => handlePageChange(page - 1)}>上一页</button>
          {Array.from({ length: totalPages }).slice(Math.max(0, page - 3), Math.min(totalPages, page + 2)).map((_, idx) => {
            const p = Math.max(1, page - 2) + idx;
            if (p > totalPages) return null;
            return (
              <button key={p} type="button" className={`pagination-btn ${p === page ? 'pagination-active' : ''}`} disabled={isLoading} onClick={() => handlePageChange(p)}>{p}</button>
            );
          })}
          <button type="button" className="pagination-btn" disabled={page === totalPages || isLoading} onClick={() => handlePageChange(page + 1)}>下一页</button>
        </div>
      )}

      {/* 资源失效反馈弹窗 */}
      {feedbackOpen && feedbackResource && (
        <div className="feedback-modal-bg">
          <div className="feedback-modal">
            <div className="feedback-modal-header">
              <span>资源失效反馈</span>
              <button className="feedback-modal-close" onClick={closeFeedback}>×</button>
            </div>
            <form className="feedback-form" onSubmit={submitFeedback}>
              <div className="feedback-form-group">
                <label>失效类型 <span style={{color:'red'}}>*</span></label>
                <select value={feedbackForm.invalid_type} onChange={e=>setFeedbackForm(f=>({...f,invalid_type:Number(e.target.value)}))} required>
                  <option value={1}>链接错误</option>
                  <option value={2}>资源失效</option>
                  <option value={3}>文件不存在</option>
                </select>
              </div>
              <div className="feedback-form-group">
                <label>补充说明</label>
                <textarea value={feedbackForm.description} onChange={e=>setFeedbackForm(f=>({...f,description:e.target.value}))} placeholder="请详细描述资源失效的具体情况..." rows={3} />
              </div>
              <div className="feedback-form-group">
                <label>联系方式</label>
                <input type="text" value={feedbackForm.contact_info} onChange={e=>setFeedbackForm(f=>({...f,contact_info:e.target.value}))} placeholder="您的邮箱或其他联系方式（选填）" />
              </div>
              {feedbackStatus === 'error' && <div className="feedback-error">{feedbackMsg}</div>}
              {feedbackStatus === 'success' && <div className="feedback-success">{feedbackMsg}</div>}
              <div className="feedback-form-actions">
                <button type="button" onClick={closeFeedback} className="feedback-cancel">取消</button>
                <button type="submit" disabled={feedbackSubmitting} className="feedback-submit">{feedbackSubmitting ? '提交中...' : '提交反馈'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 右上角资源已删除提示 */}
      {deletedResourceMsg && (
        <div style={{position:'fixed',top:60,right:24,zIndex:9999,background:'#fffbe6',color:'#faad14',padding:'10px 18px',borderRadius:8,boxShadow:'0 2px 8px rgba(0,0,0,0.08)',fontWeight:500}}>
          {deletedResourceMsg}
        </div>
      )}

      {/* 页脚 */}
      <footer className="apple-footer">
        <div className="footer-main">
          <div className="footer-stats">
            <span className="footer-stat-item"><svg className="footer-icon" viewBox="0 0 20 20" fill="none" width="16" height="16"><path d="M4.5 4.5A1.5 1.5 0 0 1 6 3h8a1.5 1.5 0 0 1 1.5 1.5v12A1.5 1.5 0 0 1 14 18H6a1.5 1.5 0 0 1-1.5-1.5v-12Z" stroke="#2997ff" strokeWidth="1.2"/><path d="M7 7h6M7 10h6M7 13h4" stroke="#2997ff" strokeWidth="1.2" strokeLinecap="round"/></svg> 资源总数: <b>{footerStats.total.toLocaleString()}</b></span>
            <span className="footer-stat-item"><svg className="footer-icon" viewBox="0 0 20 20" fill="none" width="16" height="16"><path d="M10 2v8l6 3.5" stroke="#2997ff" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/><circle cx="10" cy="10" r="8.5" stroke="#2997ff" strokeWidth="1.2"/></svg> 昨日新增: <b>{footerStats.yesterday.toLocaleString()}</b></span>
          </div>
          <div className="footer-links">
            <a href="https://pan.baidu.com" target="_blank" rel="noopener noreferrer">百度网盘</a>
            <a href="https://pan.quark.cn" target="_blank" rel="noopener noreferrer">夸克网盘</a>
            <a href="https://pan.xunlei.com" target="_blank" rel="noopener noreferrer">迅雷云盘</a>
            <a href="https://www.aliyundrive.com" target="_blank" rel="noopener noreferrer">阿里云盘</a>
          </div>
        </div>
        <div className="footer-copyright">&copy; {new Date().getFullYear()} 97盘搜 · 保留所有权利
          <span className="footer-origin-link"> | <a href="https://pansoo.cn/" target="_blank" rel="noopener noreferrer">97盘搜</a></span>
        </div>
      </footer>

      {/* 回到顶部按钮 */}
      <button 
        className={`back-to-top ${showBackToTop ? 'visible' : ''}`}
        onClick={scrollToTop}
        title="回到顶部"
      >
        ↑
      </button>
    </div>
  );
}

