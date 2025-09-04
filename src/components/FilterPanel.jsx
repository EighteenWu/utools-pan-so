import React from 'react';
import PropTypes from 'prop-types';

/**
 * FilterPanel - 筛选面板主容器组件
 * 采用苹果设计风格，提供统一的筛选功能容器
 */
function FilterPanel({ 
  children, 
  title = "筛选条件", 
  hasActiveFilters = false,
  onReset,
  className = "",
  ...props 
}) {
  return (
    <div className={`apple-filter-panel ${className}`} {...props}>
      {/* 筛选面板头部 */}
      <div className="apple-filter-panel-header">
        <h3 className="apple-filter-panel-title">{title}</h3>
        {hasActiveFilters && onReset && (
          <button 
            className="apple-filter-panel-reset"
            onClick={onReset}
            type="button"
          >
            重置
          </button>
        )}
      </div>
      
      {/* 筛选面板内容 */}
      <div className="apple-filter-panel-content">
        {children}
      </div>
    </div>
  );
}

FilterPanel.propTypes = {
  children: PropTypes.node.isRequired,
  title: PropTypes.string,
  hasActiveFilters: PropTypes.bool,
  onReset: PropTypes.func,
  className: PropTypes.string
};

export default FilterPanel;