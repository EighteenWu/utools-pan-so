import { useState, useCallback, useMemo } from 'react';

// API 参数映射
const API_PARAM_MAPPING = {
  // 网盘类型映射 (cloudDiskType -> pan_type)
  cloudDiskType: {
    all: null,
    baidu: 1,
    quark: 2,
    aliyun: 3,
    thunder: 4,
  },
  // 文件类型映射 (fileType -> file_type)
  fileType: {
    all: null,
    document: 'document',
    video: 'video',
    audio: 'audio',
    image: 'image',
    archive: 'archive',
    application: 'application',
  },
  // 时间范围映射 (timeRange -> time_filter)
  timeRange: {
    all: null,
    week: 'week',
    half_month: 'half_month',
    month: 'month',
    half_year: 'half_year',
    year: 'year',
  },
};

export function useFilters(initialFilters = {}) {
  // 筛选状态
  const [cloudDiskType, setCloudDiskType] = useState(initialFilters.cloudDiskType || 'all');
  const [fileType, setFileType] = useState(initialFilters.fileType || 'all');
  const [exactMatch, setExactMatch] = useState(initialFilters.exactMatch || false);
  const [timeRange, setTimeRange] = useState(initialFilters.timeRange || 'all');

  const filters = useMemo(() => ({
    cloudDiskType,
    fileType,
    exactMatch,
    timeRange,
  }), [cloudDiskType, fileType, exactMatch, timeRange]);

  // 更新筛选器的统一接口
  const updateFilter = useCallback((filterType, value) => {
    switch (filterType) {
      case 'cloudDiskType':
        setCloudDiskType(value);
        break;
      case 'fileType':
        setFileType(value);
        break;
      case 'exactMatch':
        setExactMatch(value);
        break;
      case 'timeRange':
        setTimeRange(value);
        break;
      default:
        console.warn(`Unknown filter type: ${filterType}`);
    }
  }, []);

  // 重置所有筛选器
  const resetFilters = useCallback(() => {
    setCloudDiskType('all');
    setFileType('all');
    setExactMatch(false);
    setTimeRange('all');
    console.log('筛选条件已重置');
  }, []);

  const hasActiveFilters = useMemo(() => (
    cloudDiskType !== 'all' || fileType !== 'all' || exactMatch || timeRange !== 'all'
  ), [cloudDiskType, fileType, exactMatch, timeRange]);

  // 构建 API 搜索参数
  const buildApiParams = useCallback((baseParams = {}) => {
    const {
      query,
      keyword,
      page = 1,
      pageSize,
      limit,
    } = baseParams;

    const searchParams = new URLSearchParams();
    const kw = (keyword ?? query ?? '').toString();
    const lim = (limit ?? pageSize ?? 15);

    searchParams.append('keyword', kw);
    searchParams.append('page', String(page));
    searchParams.append('limit', String(lim));

    // 网盘类型 -> pan_type（数字），“全部”固定传 0
    const panTypeValue = cloudDiskType === 'all' ? 0 : API_PARAM_MAPPING.cloudDiskType[cloudDiskType];
    searchParams.append('pan_type', String(panTypeValue ?? 0));

    // 文件类型 -> file_type
    const fileTypeValue = API_PARAM_MAPPING.fileType[fileType];
    if (fileTypeValue !== null && fileTypeValue !== undefined) {
      searchParams.append('file_type', fileTypeValue);
    }

    // 精确匹配 -> exact
    if (exactMatch) {
      searchParams.append('exact', '1');
    }

    // 时间范围 -> time_filter
    const timeRangeValue = API_PARAM_MAPPING.timeRange[timeRange];
    if (timeRangeValue !== null && timeRangeValue !== undefined) {
      searchParams.append('time_filter', timeRangeValue);
    }

    return searchParams;
  }, [cloudDiskType, fileType, exactMatch, timeRange]);

  // 为 resourceService 构建筛选参数
  const buildResourceServiceParams = useCallback((resourceType = 'quark') => {
    const filterParams = {
      cloudDiskType: cloudDiskType !== 'all' ? cloudDiskType : resourceType,
      fileType: fileType !== 'all' ? fileType : undefined,
      exactMatch: exactMatch || undefined,
      timeRange: timeRange !== 'all' ? timeRange : undefined,
    };
    Object.keys(filterParams).forEach((key) => {
      if (filterParams[key] === undefined) delete filterParams[key];
    });
    return filterParams;
  }, [cloudDiskType, fileType, exactMatch, timeRange]);

  // 获取筛选器的显示标签
  const getFilterLabels = useCallback(() => {
    const labels = [];
    if (cloudDiskType !== 'all') {
      const typeLabels = { baidu: '百度网盘', quark: '夸克网盘', aliyun: '阿里云盘', thunder: '迅雷网盘' };
      labels.push(`网盘: ${typeLabels[cloudDiskType] || cloudDiskType}`);
    }
    if (fileType !== 'all') {
      const typeLabels = { document: '文档', video: '视频', audio: '音频', image: '图片', archive: '压缩包', application: '应用/软件' };
      labels.push(`类型: ${typeLabels[fileType] || fileType}`);
    }
    if (exactMatch) labels.push('精确匹配');
    if (timeRange !== 'all') {
      const timeLabels = { week: '一周内', half_month: '半月内', month: '一月内', half_year: '半年内', year: '一年内' };
      labels.push(`时间: ${timeLabels[timeRange] || timeRange}`);
    }
    return labels;
  }, [cloudDiskType, fileType, exactMatch, timeRange]);

  return {
    // 状态
    filters,
    cloudDiskType,
    fileType,
    exactMatch,
    timeRange,
    // 更新
    setCloudDiskType,
    setFileType,
    setExactMatch,
    setTimeRange,
    updateFilter,
    resetFilters,
    // 工具
    hasActiveFilters,
    buildApiParams,
    buildResourceServiceParams,
    getFilterLabels,
    // 常量
    API_PARAM_MAPPING,
  };
}

export default useFilters;

