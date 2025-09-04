import React from 'react';

/**
 * 文件类型筛选器组件 - 苹果风格标签选择器
 * 严格按照API_PARAM_MAPPING.fileType实现
 */
export default function FileTypeFilter({ 
  value, 
  onChange, 
  disabled = false 
}) {
  // 文件类型选项配置 - 严格按照API_PARAM_MAPPING.fileType
  const fileTypes = [
    { key: 'all', label: '全部类型', icon: '📁', color: 'default' },
    { key: 'document', label: '文档', icon: '📄', color: 'blue' },
    { key: 'video', label: '视频', icon: '🎬', color: 'red' },
    { key: 'audio', label: '音频', icon: '🎵', color: 'purple' },
    { key: 'image', label: '图片', icon: '🖼️', color: 'green' },
    { key: 'software', label: '软件', icon: '💿', color: 'orange' },
    { key: 'archive', label: '压缩包', icon: '📦', color: 'yellow' },
    { key: 'other', label: '其他', icon: '📋', color: 'gray' }
  ];

  const handleTypeChange = (typeKey) => {
    if (!disabled && onChange) {
      onChange(typeKey);
    }
  };

  return (
    <div className="filter-section">
      <h3 className="filter-section-title">
        <span className="filter-section-icon">🗂️</span>
        文件类型
      </h3>
      
      <div className="filter-tags">
        {fileTypes.map((type) => (
          <button
            key={type.key}
            className={`filter-tag ${value === type.key ? 'active' : ''} filter-tag-${type.color}`}
            onClick={() => handleTypeChange(type.key)}
            disabled={disabled}
            type="button"
            aria-pressed={value === type.key}
            aria-label={`选择${type.label}文件类型`}
          >
            <span className="tag-icon" role="img" aria-hidden="true">
              {type.icon}
            </span>
            <span className="tag-text">{type.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}