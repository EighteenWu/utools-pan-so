import React from 'react';

/**
 * 首页筛选（下拉版）
 * - 网盘类型、文件类型、时间范围全部使用<select>
 */
export default function HomeFilters({
  cloudDiskType,
  fileType,
  timeRange,
  exactMatch = false,
  onChange,
  onReset,
}) {
  return (
    <div className="home-filters">
      <div className="home-filter-group">
        <label className="home-filter-label">网盘类型</label>
        <select
          className="home-filter-select"
          value={cloudDiskType}
          onChange={(e) => onChange('cloudDiskType', e.target.value)}
        >
          <option value="all">全部</option>
          <option value="baidu">百度网盘</option>
          <option value="quark">夸克网盘</option>
          <option value="aliyun">阿里云盘</option>
          <option value="thunder">迅雷网盘</option>
        </select>
      </div>

      <div className="home-filter-group">
        <label className="home-filter-label">文件类型</label>
        <select
          className="home-filter-select"
          value={fileType}
          onChange={(e) => onChange('fileType', e.target.value)}
        >
          <option value="all">全部类型</option>
          <option value="document">文档</option>
          <option value="video">视频</option>
          <option value="audio">音频</option>
          <option value="image">图片</option>
          <option value="archive">压缩包</option>
          <option value="application">应用/软件</option>
        </select>
      </div>

      <div className="home-filter-group">
        <label className="home-filter-label">时间范围</label>
        <select
          className="home-filter-select"
          value={timeRange}
          onChange={(e) => onChange('timeRange', e.target.value)}
        >
          <option value="all">全部时间</option>
          <option value="week">一周内</option>
          <option value="half_month">半月内</option>
          <option value="month">一月内</option>
          <option value="half_year">半年内</option>
          <option value="year">一年内</option>
        </select>
      </div>

      <div className="home-filter-group">
        <label className="home-filter-label" style={{display:'flex', alignItems:'center', gap:6}}>
          <input
            type="checkbox"
            checked={!!exactMatch}
            onChange={(e) => onChange('exactMatch', e.target.checked)}
          />
          精确匹配
        </label>
      </div>

      <button type="button" className="home-filter-reset" onClick={onReset}>重置</button>
    </div>
  );
}
