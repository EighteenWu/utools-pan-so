import React from 'react';

/**
 * 时间范围筛选器组件 - iOS风格选择器
 * 严格按照API_PARAM_MAPPING.timeRange实现
 */
export default function TimeRangeFilter({ 
  value, 
  onChange, 
  disabled = false 
}) {
  // 时间范围选项配置 - 严格按照API_PARAM_MAPPING.timeRange
  const timeRanges = [
    { key: 'all', label: '全部时间', icon: '📅', description: '不限制时间范围' },
    { key: 'today', label: '今天', icon: '🌅', description: '最近24小时' },
    { key: 'week', label: '一周内', icon: '📆', description: '最近7天' },
    { key: 'month', label: '一月内', icon: '🗓️', description: '最近30天' },
    { key: 'quarter', label: '三月内', icon: '📊', description: '最近90天' },
    { key: 'year', label: '一年内', icon: '🗂️', description: '最近365天' }
  ];

  const handleRangeChange = (rangeKey) => {
    if (!disabled && onChange) {
      onChange(rangeKey);
    }
  };

  return (
    <div className="filter-section">
      <h3 className="filter-section-title">
        <span className="filter-section-icon">⏰</span>
        时间范围
      </h3>
      
      <div className="filter-time-range-selector">
        {timeRanges.map((range) => (
          <div
            key={range.key}
            className={`filter-time-option ${value === range.key ? 'active' : ''}`}
            onClick={() => handleRangeChange(range.key)}
            role="button"
            tabIndex={disabled ? -1 : 0}
            aria-pressed={value === range.key}
            aria-label={`选择${range.label}时间范围`}
            onKeyDown={(e) => {
              if ((e.key === 'Enter' || e.key === ' ') && !disabled) {
                e.preventDefault();
                handleRangeChange(range.key);
              }
            }}
          >
            <div className="time-option-content">
              <div className="time-option-header">
                <span className="time-option-icon" role="img" aria-hidden="true">
                  {range.icon}
                </span>
                <span className="time-option-label">{range.label}</span>
                {value === range.key && (
                  <span className="time-option-check" role="img" aria-hidden="true">
                    ✓
                  </span>
                )}
              </div>
              <div className="time-option-description">
                {range.description}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}