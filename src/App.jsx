import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import './index.css';
import AnimatedTitle from './components/AnimatedTitle';
import SearchBar from './components/SearchBar';
import ResourceTypeFilter from './components/ResourceTypeFilter';
import ResultList from './components/ResultList';
import Pagination from './components/Pagination';
import FeedbackModal from './components/FeedbackModal';
import Message from './components/Message';
import FooterStats from './components/FooterStats';
import Loading from './components/Loading';

const PAN_TYPE_MAP = {
  baidu: 1,
  quark: 2,
  aliyun: 3,
  thunder: 4
};

const PAN_TYPE_NAME = {
  1: '百度网盘',
  2: '夸克网盘',
  3: '阿里云盘',
  4: '迅雷网盘'
};

/**
 * 工具函数：复制文本到剪贴板
 */
function copyToClipboard(text) {
  if (window.utools && window.utools.copyText) {
    window.utools.copyText(text);
    window.utools.showNotification('链接已复制');
  } else if (navigator.clipboard) {
    navigator.clipboard.writeText(text);
    alert('链接已复制');
  } else {
    const textarea = document.createElement('textarea');
    textarea.value = text;
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand('copy');
    document.body.removeChild(textarea);
    alert('链接已复制');
  }
}

/**
 * 校验资源有效性
 * @param {string} resourceId
 * @param {number} panType
 * @returns {Promise<{valid: boolean, message: string, share_url?: string}>}
 */
async function checkResourceStatus(resourceId, panType) {
  try {
    const res = await fetch(`https://pansoo.cn/api/check_resource_status?resource_id=${resourceId}&pan_type=${panType}`);
    return await res.json();
  } catch (err) {
    console.error('资源有效性校验失败:', err);
    return { valid: false, message: '校验失败' };
  }
}

/**
 * 获取分享链接（百度/夸克）
 * @param {string} platform
 * @param {string} resourceId
 * @returns {Promise<{share_url?: string, message?: string}>}
 */
async function getShareLink(platform, resourceId) {
  try {
    const res = await fetch(`https://pansoo.cn/api/get_share?platform=${platform}&resource_id=${resourceId}`, { method: 'POST' });
    return await res.json();
  } catch (err) {
    console.error('获取分享链接失败:', err);
    return { share_url: '', message: '获取分享链接失败' };
  }
}

function App() {
  const [keyword, setKeyword] = useState('');
  const [results, setResults] = useState([]);
  const [searched, setSearched] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [resourceType, setResourceType] = useState('quark'); // 默认夸克网盘
  const [totalCount, setTotalCount] = useState(0);
  const [searchMode, setSearchMode] = useState('online'); // 'local' or 'online'
  const pageSize = 30; // 统一为30
  const [feedbackOpen, setFeedbackOpen] = useState(false);
  const [feedbackResource, setFeedbackResource] = useState(null);
  const [feedbackStatus, setFeedbackStatus] = useState('idle'); // idle, success, error
  const [feedbackMsg, setFeedbackMsg] = useState('');
  const [feedbackSubmitting, setFeedbackSubmitting] = useState(false);
  const [feedbackForm, setFeedbackForm] = useState({
    invalid_type: 1,
    description: '',
    contact_info: ''
  });
  const [view, setView] = useState('home'); // 'home' or 'search'
  const [searchParams, setSearchParams] = useState({ keyword: '', searchType: 'local' });
  const [footerStats, setFooterStats] = useState({ total: 0, yesterday: 0 });
  const [globalActionLoading, setGlobalActionLoading] = useState(false);
  const [feedbackDoneIds, setFeedbackDoneIds] = useState(() => new Set());
  const [deletedResourceMsg, setDeletedResourceMsg] = useState('');
  const [actionLoading, setActionLoading] = useState({ id: null, type: null });

  const isUtools = typeof window !== 'undefined' && window.utools;
  const isResourceService = typeof window !== 'undefined' && window.resourceService;

  // 全局美化消息提示浮层 hooks 必须在组件体内
  const [message, setMessage] = useState({ text: '', type: 'info' });
  const [showMsg, setShowMsg] = useState(false);
  const msgTimerRef = useRef();

  function showUserMessage(text, type = 'info') {
    setMessage({ text, type });
    setShowMsg(true);
    if (msgTimerRef.current) clearTimeout(msgTimerRef.current);
    msgTimerRef.current = setTimeout(() => setShowMsg(false), 2600);
  }

  // 页脚统计数据
  useEffect(() => {
    // 获取本地资源数
    let localTotal = 0;
    // 这里无法直接读取本地 json，直接用 0
    fetch('https://pansoo.cn/api/resource_stats')
      .then(res => res.json())
      .then(data => {
        if (data.status === 'success') {
          setFooterStats({
            total: localTotal + data.total,
            yesterday: data.yesterday
          });
        }
      })
      .catch(() => {})
  }, []);

  // 搜索函数（useCallback防止重复创建）
  const search = useCallback(async (customPage, customType, customMode, customKeyword) => {
    const realKeyword = (typeof customKeyword === 'string') ? customKeyword : keyword;
    if (!realKeyword.trim()) return;
    setIsLoading(true);
    setSearched(true);
    try {
      let response;
      const panType = PAN_TYPE_MAP[customType || resourceType];
      const currentPage = customPage || page;
      const mode = customMode || searchMode;
      if (mode === 'local') {
        const url = `https://pansoo.cn/api/cached_resources?title=${encodeURIComponent(realKeyword)}&pan_type=${panType}&limit=${pageSize}&page=${currentPage}`;
        const res = await fetch(url);
        const data = await res.json();
        response = {
          results: data.resources || [],
          total: data.total || (data.resources ? data.resources.length : 0),
          status: data.status || 'success',
        };
      } else {
        if (typeof window !== 'undefined' && window.resourceService) {
          response = await window.resourceService.searchResources(
            realKeyword,
            customType || resourceType,
            currentPage,
            pageSize
          );
        } else {
          const url = `https://pansoo.cn/api/search?keyword=${encodeURIComponent(realKeyword)}&pan_type=${panType}&page=${currentPage}&limit=${pageSize}`;
          const res = await fetch(url);
          response = await res.json();
        }
      }
      if (response.status === 'error' || !response.results) {
        setResults([]);
        setTotalPages(1);
        setTotalCount(0);
      } else {
        setResults(response.results || []);
        setTotalCount(response.total || 0);
        setTotalPages(Math.ceil((response.total || 0) / pageSize));
      }
    } catch (error) {
      console.error('搜索失败:', error);
      showUserMessage('搜索失败，请稍后重试');
      setResults([]);
      setTotalPages(1);
      setTotalCount(0);
    } finally {
      setIsLoading(false);
    }
  }, [keyword, page, resourceType, searchMode]);

  // 资源卡片数据映射（useMemo缓存）
  const mappedResults = useMemo(() => results.map(item => {
    const panTypeNum = Number(item.pan_type);
    return {
      ...item,
      title: item.file_name || item.title || '',
      pan_type: panTypeNum,
      pan_type_name: PAN_TYPE_NAME[panTypeNum] || '未知网盘',
      updated_at: item.updated_at || item.created_at || '',
    };
  }), [results]);

  // 资源卡片"打开链接"按钮逻辑
  const handleOpenLink = useCallback(async (item) => {
    if (globalActionLoading) return;
    setGlobalActionLoading(true);
    try {
      const panType = item.pan_type;
      const resourceId = item.resource_id;
      const checkData = await checkResourceStatus(resourceId, panType);
      if (!checkData.valid) {
        showUserMessage(checkData.message || '资源不可用');
        return;
      }
      if (panType === 3 || panType === 4) {
        if (checkData.share_url) {
          if (window.utools && window.utools.shellOpenExternal) {
            window.utools.shellOpenExternal(checkData.share_url);
          } else {
            window.open(checkData.share_url, '_blank');
          }
        } else {
          showUserMessage('未获取到分享链接');
        }
        return;
      }
      const platform = panType === 1 ? 'baidu' : 'quark';
      const shareData = await getShareLink(platform, resourceId);
      if (!shareData.share_url) {
        showUserMessage(shareData.message || '资源不可用');
        return;
      }
      if (window.utools && window.utools.shellOpenExternal) {
        window.utools.shellOpenExternal(shareData.share_url);
      } else {
        window.open(shareData.share_url, '_blank');
      }
    } catch (err) {
      console.error('打开链接失败:', err);
      showUserMessage('校验或获取链接失败');
    } finally {
      setGlobalActionLoading(false);
    }
  }, [globalActionLoading]);

  // 资源卡片"复制链接"按钮逻辑
  const handleCopyLink = useCallback(async (item) => {
    if (globalActionLoading) return;
    setGlobalActionLoading(true);
    try {
      const panType = item.pan_type;
      const resourceId = item.resource_id;
      const checkData = await checkResourceStatus(resourceId, panType);
      if (!checkData.valid) {
        showUserMessage(checkData.message || '资源不可用');
        return;
      }
      if (panType === 3 || panType === 4) {
        if (checkData.share_url) {
          let text = checkData.share_url;
          if (item.share_pwd) text += ` 提取码：${item.share_pwd}`;
          copyToClipboard(text);
        } else {
          showUserMessage('未获取到分享链接');
        }
        return;
      }
      const platform = panType === 1 ? 'baidu' : 'quark';
      const shareData = await getShareLink(platform, resourceId);
      if (!shareData.share_url) {
        showUserMessage(shareData.message || '资源不可用');
        return;
      }
      let text = shareData.share_url;
      if (item.share_pwd) text += ` 提取码：${item.share_pwd}`;
      copyToClipboard(text);
    } catch (err) {
      console.error('复制链接失败:', err);
      showUserMessage('校验或获取链接失败');
    } finally {
      setGlobalActionLoading(false);
    }
  }, [globalActionLoading]);

  // 切换资源类型
  const handleTypeChange = (type) => {
    setResourceType(type);
    setPage(1);
    // 立即发起新请求，limit=30，pan_type严格对应
    if (keyword.trim()) {
      search(1, type);
    }
  };

  // 切换本地/联网搜索
  const handleModeChange = (mode) => {
    setSearchMode(mode);
    setPage(1);
    // 修复：切换模式时立即发起新请求
    if (keyword.trim()) {
      setTimeout(() => search(1), 0);
    }
  };

  // 切换页码
  const handlePageChange = (newPage) => {
    setPage(newPage);
    search(newPage);
  };

  // 分页切换后自动滚动到顶部，确保渲染完成后再滚动
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [page]);

  // 处理搜索表单提交
  const handleSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    search(1);
  };

  // 卡片时间格式化
  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return d.toLocaleString('zh-CN', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit' });
  };

  // 渲染分页控件
  const renderPagination = () => {
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
      <button
        key="prev"
        onClick={() => handlePageChange(page - 1)}
        disabled={page === 1 || isLoading}
        className="pagination-btn"
      >
        上一页
      </button>
    );
    if (startPage > 1) {
      pages.push(
        <button
          key="1"
          onClick={() => handlePageChange(1)}
          className="pagination-btn"
          disabled={isLoading}
        >
          1
        </button>
      );
      if (startPage > 2) {
        pages.push(<span key="dots1" className="pagination-dots">...</span>);
      }
    }
    for (let i = startPage; i <= endPage; i++) {
      pages.push(
        <button
          key={i}
          onClick={() => handlePageChange(i)}
          className={`pagination-btn ${i === page ? 'pagination-active' : ''}`}
          disabled={isLoading}
        >
          {i}
        </button>
      );
    }
    if (endPage < totalPages) {
      if (endPage < totalPages - 1) {
        pages.push(<span key="dots2" className="pagination-dots">...</span>);
      }
      pages.push(
        <button
          key={totalPages}
          onClick={() => handlePageChange(totalPages)}
          className="pagination-btn"
          disabled={isLoading}
        >
          {totalPages}
        </button>
      );
    }
    pages.push(
      <button
        key="next"
        onClick={() => handlePageChange(page + 1)}
        disabled={page === totalPages || isLoading}
        className="pagination-btn"
      >
        下一页
      </button>
    );
    return <div className="pagination">{pages}</div>;
  };

  // 打开反馈弹窗
  const openFeedback = (item) => {
    setFeedbackResource(item);
    setFeedbackForm({ invalid_type: 1, description: '', contact_info: '' });
    setFeedbackStatus('idle');
    setFeedbackMsg('');
    setFeedbackOpen(true);
  };
  // 关闭反馈弹窗并重置
  const closeFeedback = () => {
    setFeedbackOpen(false);
    setFeedbackResource(null);
    setFeedbackForm({ invalid_type: 1, description: '', contact_info: '' });
    setFeedbackStatus('idle');
    setFeedbackMsg('');
  };
  // 提交反馈
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
          // 资源已自动删除，移除卡片并提示
          setResults(prev => prev.filter(r => r.resource_id !== feedbackResource.resource_id));
          setDeletedResourceMsg('该资源已确认失效并自动删除');
          setTimeout(() => setDeletedResourceMsg(''), 3000);
        } else {
          // 反馈成功，按钮变为已反馈
          setFeedbackDoneIds(prev => new Set(prev).add(feedbackResource.resource_id));
          setFeedbackStatus('success');
          setFeedbackMsg('该资源仍然有效,感谢你的反馈。');
        }
        setTimeout(() => closeFeedback(), 1200);
      } else {
        setFeedbackStatus('error');
        setFeedbackMsg(data.message || '提交失败，请稍后重试');
      }
    } catch (err) {
      setFeedbackStatus('error');
      setFeedbackMsg('提交失败，请稍后重试');
    } finally {
      setFeedbackSubmitting(false);
    }
  };

  // 首页搜索后切换到资源卡片页
  const handleHomeSearch = (newKeyword, newSearchType) => {
    setKeyword(newKeyword);
    setSearchMode(newSearchType);
    setPage(1);
    setSearched(false);
    setView('search');
    setTimeout(() => search(1, undefined, newSearchType, newKeyword), 0);
  };

  // 资源卡片页切换搜索模式
  const handleSearchTypeChange = (mode) => {
    setSearchMode(mode);
    setPage(1);
    if (keyword.trim()) {
      setTimeout(() => search(1, undefined, mode), 0);
    }
  };

  // 监听 view 和 searchParams，进入搜索页时自动发起请求
  useEffect(() => {
    if (view === 'search' && searchParams.keyword) {
      setKeyword(searchParams.keyword);
      setSearchMode(searchParams.searchType);
      setPage(1);
      setSearched(false);
      setTimeout(() => search(1, undefined, searchParams.searchType, searchParams.keyword), 0);
    }
    // eslint-disable-next-line
  }, [view, searchParams]);

  // 结果页返回首页
  const handleBackHome = () => {
    setView('home');
    setKeyword('');
    setResults([]);
    setSearched(false);
    setPage(1);
  };

  // 修复：如果view为search但keyword为空，自动跳回首页，防止页面空白
  useEffect(() => {
    if (view === 'search' && !keyword.trim()) {
      setView('home');
    }
  }, [view, keyword]);

  return (
    <div className="container">
      <div style={{display:'none'}}>App Loaded</div>
      {/* 顶部LOGO栏 */}
      <div className="header-bar" style={{cursor:'pointer'}} onClick={handleBackHome}>
        <span className="logo-text">97 <span className="logo-gradient">PAN SO</span></span>
      </div>
      {/* 全局右上角美化消息提示浮层，始终渲染在最外层，zIndex极高 */}
      {showMsg && (
        <div style={{
          position: 'fixed',
          top: 18,
          right: 24,
          zIndex: 999999,
          minWidth: 220,
          background: message.type === 'success' ? '#f6ffed' : message.type === 'error' ? '#fff2f0' : message.type === 'warning' ? '#fffbe6' : '#e6f4ff',
          color: message.type === 'success' ? '#52c41a' : message.type === 'error' ? '#f5222d' : message.type === 'warning' ? '#faad14' : '#1677ff',
          border: `1.5px solid ${message.type === 'success' ? '#b7eb8f' : message.type === 'error' ? '#ffccc7' : message.type === 'warning' ? '#ffe58f' : '#91d5ff'}`,
          borderRadius: 8,
          boxShadow: '0 2px 12px rgba(0,0,0,0.13)',
          padding: '12px 22px 12px 18px',
          fontWeight: 500,
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          transition: 'opacity 0.25s',
          opacity: showMsg ? 1 : 0
        }}>
          <span style={{fontSize:20,display:'inline-flex',alignItems:'center'}}>
            {message.type === 'success' && (
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><circle cx="10" cy="10" r="9" stroke="#52c41a" strokeWidth="2" fill="#f6ffed"/><path d="M6.5 10.5l2 2 5-5" stroke="#52c41a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
            )}
            {message.type === 'error' && (
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><circle cx="10" cy="10" r="9" stroke="#f5222d" strokeWidth="2" fill="#fff2f0"/><path d="M10 6v5" stroke="#f5222d" strokeWidth="2" strokeLinecap="round"/><circle cx="10" cy="14" r="1" fill="#f5222d"/></svg>
            )}
            {message.type === 'warning' && (
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><circle cx="10" cy="10" r="9" stroke="#faad14" strokeWidth="2" fill="#fffbe6"/><path d="M10 6v5" stroke="#faad14" strokeWidth="2" strokeLinecap="round"/><circle cx="10" cy="14" r="1" fill="#faad14"/></svg>
            )}
            {message.type === 'info' && (
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><circle cx="10" cy="10" r="9" stroke="#1677ff" strokeWidth="2" fill="#e6f4ff"/><path d="M10 7v5" stroke="#1677ff" strokeWidth="2" strokeLinecap="round"/><circle cx="10" cy="14" r="1" fill="#1677ff"/></svg>
            )}
          </span>
          <span style={{fontSize:15,lineHeight:1.6}}>{message.text}</span>
        </div>
      )}
      {/* 右上角全局 loading-spinner，仅动画提示，不遮盖主内容 */}
      {globalActionLoading && (
        <div style={{position:'fixed',top:18,right:64,zIndex:9999}}>
          <span className="loading-spinner" style={{width:28,height:28,borderWidth:3,display:'inline-block'}}></span>
        </div>
      )}
      {view === 'home' && (
        <div className="main-home">
          <div className="main-title-wrap">
            <AnimatedTitle text="PAN SO" className="main-title-ani" />
            <div className="main-subtitle">探索、发现、分享各类网盘资源</div>
          </div>
          <div className="main-searchbar-outer">
            <SearchBar
              query={keyword}
              onQueryChange={setKeyword}
              onSearch={handleHomeSearch}
              searchType={searchMode}
              onSearchTypeChange={handleSearchTypeChange}
            />
          </div>
        </div>
      )}
      {view === 'search' && (
        <>
          <div className="main-searchbar-outer">
            <SearchBar
              query={keyword}
              onQueryChange={setKeyword}
              onSearch={handleHomeSearch}
              searchType={searchMode}
              onSearchTypeChange={handleSearchTypeChange}
            />
          </div>
          {/* 资源卡片、筛选、分页等原有内容... */}
          {/* 资源类型筛选 */}
          <div className="resource-type-filter-bar">
            <button
              className={`type-btn quark ${resourceType === 'quark' ? 'active' : ''}`}
              onClick={() => handleTypeChange('quark')}
              disabled={isLoading}
            >
              夸克网盘
            </button>
            <button
              className={`type-btn baidu ${resourceType === 'baidu' ? 'active' : ''}`}
              onClick={() => handleTypeChange('baidu')}
              disabled={isLoading}
            >
              百度网盘
            </button>
            <button
              className={`type-btn aliyun ${resourceType === 'aliyun' ? 'active' : ''}`}
              onClick={() => handleTypeChange('aliyun')}
              disabled={isLoading}
            >
              阿里云盘
            </button>
            <button
              className={`type-btn thunder ${resourceType === 'thunder' ? 'active' : ''}`}
              onClick={() => handleTypeChange('thunder')}
              disabled={isLoading}
            >
              迅雷网盘
            </button>
          </div>
          {/* 搜索结果统计 */}
          {searched && (
            <div className="search-stats">
              搜索 <span className="highlight">{keyword}</span> 的结果，共 <span className="highlight">{totalCount}</span> 条
            </div>
          )}
          {/* 搜索结果列表 */}
          {mappedResults.length > 0 && (
            <div className="results">
              <ResultList
                results={mappedResults}
                onOpenLink={handleOpenLink}
                onCopyLink={handleCopyLink}
                onFeedback={openFeedback}
                isLoading={isLoading || globalActionLoading}
                actionLoading={isLoading || globalActionLoading}
                feedbackDoneIds={feedbackDoneIds}
                formatDate={formatDate}
              />
            </div>
          )}
          {/* 无搜索结果提示 */}
          {searched && mappedResults.length === 0 && !isLoading && (
            <div className="no-results">
              未找到相关资源
            </div>
          )}
          {/* 加载中提示 */}
          {isLoading && (
            <div className="loading">
              <div className="loading-spinner"></div>
              <div>搜索中，请稍候...</div>
            </div>
          )}
          {/* 分页控件 */}
          {mappedResults.length > 0 && renderPagination()}
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
        </>
      )}
          {/* 页脚始终渲染在container内，主站风格 */}
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
    </div>
  );
}

export default App;
