export default function ResourceTypeFilter({ resourceType, onTypeChange, isLoading }) {
  return (
    <div className="resource-type-filter-bar">
      <button
        className={`type-btn quark ${resourceType === 'quark' ? 'active' : ''}`}
        onClick={() => onTypeChange('quark')}
        disabled={isLoading}
      >
        夸克网盘
      </button>
      <button
        className={`type-btn baidu ${resourceType === 'baidu' ? 'active' : ''}`}
        onClick={() => onTypeChange('baidu')}
        disabled={isLoading}
      >
        百度网盘
      </button>
      <button
        className={`type-btn aliyun ${resourceType === 'aliyun' ? 'active' : ''}`}
        onClick={() => onTypeChange('aliyun')}
        disabled={isLoading}
      >
        阿里云盘
      </button>
      <button
        className={`type-btn thunder ${resourceType === 'thunder' ? 'active' : ''}`}
        onClick={() => onTypeChange('thunder')}
        disabled={isLoading}
      >
        迅雷网盘
      </button>
    </div>
  );
} 