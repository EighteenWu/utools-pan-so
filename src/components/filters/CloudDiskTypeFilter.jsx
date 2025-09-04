import React from 'react';

/**
 * 网盘类型筛选器组件 - 苹果风格分段控制器
 * 基于原ResourceTypeFilter重构，采用苹果设计系统
 */
export default function CloudDiskTypeFilter({ 
  value, 
  onChange, 
  disabled = false 
}) {
  // 网盘类型选项配置 - 扩展更多网盘类型
  const diskTypes = [
    { key: 'all', label: '全部', icon: '📁' },
    { key: 'baidu', label: '百度网盘', icon: '🔵' },
    { key: 'quark', label: '夸克网盘', icon: '🟣' },
    { key: 'aliyun', label: '阿里云盘', icon: '🟢' },
    { key: 'thunder', label: '迅雷网盘', icon: '🟠' }
  ];

  const handleTypeChange = (typeKey) => {
    if (!disabled && onChange) {
      onChange(typeKey);
    }
  };

  return (
    <div className="filter-section">
      <h3 className="filter-section-title">
        <span className="filter-section-icon">💾</span>
        网盘类型
      </h3>
      
      <div className="filter-segmented-control">
        {diskTypes.map((type) => (
          <button
            key={type.key}
            className={`filter-segment ${value === type.key ? 'active' : ''}`}
            onClick={() => handleTypeChange(type.key)}
            disabled={disabled}
            type="button"
            aria-pressed={value === type.key}
            aria-label={`选择${type.label}`}
          >
            <span className="segment-icon" role="img" aria-hidden="true">
              {type.icon}
            </span>
            <span className="segment-text">{type.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}