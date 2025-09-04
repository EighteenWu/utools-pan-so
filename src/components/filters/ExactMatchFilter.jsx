import React from 'react';

/**
 * 精确匹配筛选器组件 - iOS风格开关
 * 严格按照API exactMatch参数实现
 */
export default function ExactMatchFilter({ 
  value, 
  onChange, 
  disabled = false 
}) {
  const handleToggle = () => {
    if (!disabled && onChange) {
      onChange(!value);
    }
  };

  const handleKeyDown = (e) => {
    if ((e.key === 'Enter' || e.key === ' ') && !disabled) {
      e.preventDefault();
      handleToggle();
    }
  };

  return (
    <div className="filter-section">
      <h3 className="filter-section-title">
        <span className="filter-section-icon">🎯</span>
        搜索选项
      </h3>
      
      <div className="filter-switch-container">
        <label 
          className="filter-switch-label"
          htmlFor="exact-match-switch"
        >
          精确匹配
        </label>
        
        <div className="filter-switch">
          <input
            id="exact-match-switch"
            type="checkbox"
            checked={value}
            onChange={handleToggle}
            onKeyDown={handleKeyDown}
            disabled={disabled}
            aria-describedby="exact-match-description"
          />
          <span className="filter-switch-slider"></span>
        </div>
      </div>
      
      <div 
        id="exact-match-description"
        className="filter-switch-description"
      >
        {value ? (
          <span className="description-active">
            <span className="description-icon" role="img" aria-hidden="true">✓</span>
            开启后将只搜索完全匹配的结果，提高搜索精度
          </span>
        ) : (
          <span className="description-inactive">
            <span className="description-icon" role="img" aria-hidden="true">○</span>
            关闭时使用模糊搜索，返回更多相关结果
          </span>
        )}
      </div>
    </div>
  );
}