import { useState, useCallback, useMemo } from 'react';
import {
  createOptimizedSearch,
  performanceCollector,
  searchCache,
  debounce
} from '../utils/performance.js';

// API参数映射 - 严格按照接口规范
const API_PARAM_MAPPING = {
  // 网盘类型映射 (cloudDiskType -> pan_type)
  cloudDiskType: {
    'all': null,
    'baidu': 1,
    'quark': 2,
    'aliyun': 3,
    'thunder': 4
  },
  // 文件类型映射 (fileType -> file_type)
  fileType: {
    'all': null,
    'document': 'document',
    'video': 'video',
    'audio': 'audio',
    'image': 'image',
    'archive': 'archive',
    'application': 'application'
  },
  // 时间范围映射 (timeRange -> time_filter)
  timeRange: {
    'all': null,
    'week': 'week',
    'half_month': 'half_month',
    'month': 'month',
    'half_year': 'half_year',
    'year': 'year'
  }
};

/**
 * 筛选状态管理Hook
 * 提供统一的筛选状态管理和API参数构建功能
 */
export function useFilters(initialFilters = {}) {
  // 筛选状态 - 按照API接口规范
  const [cloudDiskType, setCloudDiskType] = useState(initialFilters.cloudDiskType || 'all');
  const [fileType, setFileType] = useState(initialFilters.fileType || 'all');
  const [exactMatch, setExactMatch] = useState(initialFilters.exactMatch || false);
  const [timeRange, setTimeRange] = useState(initialFilters.timeRange || 'all');

  // 筛选状态对象
  const filters = useMemo(() => ({
    cloudDiskType,
    fileType,
    exactMatch,
    timeRange
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
    
    // 清空搜索缓存以确保重置后的搜索是最新的
    searchCache.clear();
    console.log('🔄 筛选条件已重置，搜索缓存已清空');
  }, []);

  // 检查是否有活跃的筛选器
  const hasActiveFilters = useMemo(() => {
    return cloudDiskType !== 'all' || 
           fileType !== 'all' || 
           exactMatch || 
           timeRange !== 'all';
  }, [cloudDiskType, fileType, exactMatch, timeRange]);

  // 构建API搜索参数 - 严格按照接口规范
  const buildApiParams = useCallback((baseParams = {}) => {
    const startTime = Date.now();

    const {
      query,
      keyword,
      page = 1,
      pageSize,
      limit,
      resourceType = 'quark' // 兼容现有逻辑
    } = baseParams;

    const searchParams = new URLSearchParams();

    // 基础参数（对齐 /api/search）
    const kw = (keyword ?? query ?? '').toString();
    const lim = (limit ?? pageSize ?? 30);
    searchParams.append('keyword', kw);
    searchParams.append('page', page.toString());
    searchParams.append('limit', lim.toString());

    // 网盘类型参数 -> pan_type（数字），“全部”固定传 0，不再回落到 resourceType
    const panTypeValue = cloudDiskType === 'all' 
      ? 0 
      : API_PARAM_MAPPING.cloudDiskType[cloudDiskType];
    searchParams.append('pan_type', String(panTypeValue ?? 0));

    // 文件类型参数 -> file_type
    const fileTypeValue = API_PARAM_MAPPING.fileType[fileType];
    if (fileTypeValue !== null && fileTypeValue !== undefined) {
      searchParams.append('file_type', fileTypeValue);
    }

    // 精确匹配 -> exact
    if (exactMatch) {
      searchParams.append('exact', 'true');
    }

    // 时间范围参数 -> time_filter
    const timeRangeValue = API_PARAM_MAPPING.timeRange[timeRange];
    if (timeRangeValue !== null && timeRangeValue !== undefined) {
      searchParams.append('time_filter', timeRangeValue);
    }

    // 不再附带旧参数，避免干扰

    // 记录参数构建性能
    performanceCollector.recordRenderTime(startTime);

    return searchParams;
  }, [cloudDiskType, fileType, exactMatch, timeRange]);

  // 为resourceService构建筛选参数
  const buildResourceServiceParams = useCallback((resourceType = 'quark') => {
    const filterParams = {
      cloudDiskType: cloudDiskType !== 'all' ? cloudDiskType : resourceType,
      fileType: fileType !== 'all' ? fileType : undefined,
      exactMatch: exactMatch || undefined,
      timeRange: timeRange !== 'all' ? timeRange : undefined
    };
    
    // 移除undefined值，保持参数清洁
    Object.keys(filterParams).forEach(key => {
      if (filterParams[key] === undefined) {
        delete filterParams[key];
      }
    });

    return filterParams;
  }, [cloudDiskType, fileType, exactMatch, timeRange]);

  // 获取筛选器的显示标签
  const getFilterLabels = useCallback(() => {
    const labels = [];
    
    if (cloudDiskType !== 'all') {
      const typeLabels = {
        'baidu': '百度网盘',
        'quark': '夸克网盘',
        'aliyun': '阿里云盘',
        'thunder': '迅雷网盘'
      };
      labels.push(`网盘: ${typeLabels[cloudDiskType] || cloudDiskType}`);
    }
    
    if (fileType !== 'all') {
      const typeLabels = {
        'document': '文档',
        'video': '视频',
        'audio': '音频',
        'image': '图片',
        'software': '软件',
        'archive': '压缩包',
        'other': '其他'
      };
      labels.push(`类型: ${typeLabels[fileType] || fileType}`);
    }
    
    if (exactMatch) {
      labels.push('精确匹配');
    }
    
    if (timeRange !== 'all') {
      const timeLabels = {
        'today': '今天',
        'week': '一周内',
        'month': '一月内',
        'quarter': '三月内',
        'year': '一年内'
      };
      labels.push(`时间: ${timeLabels[timeRange] || timeRange}`);
    }
    
    return labels;
  }, [cloudDiskType, fileType, exactMatch, timeRange]);

  // 创建优化的搜索函数
  const createOptimizedSearchFn = useCallback((originalSearchFn) => {
    return createOptimizedSearch(originalSearchFn, {
      debounceDelay: 300,
      enableCache: true,
      enableDeduplication: true,
      enableQueue: false
    });
  }, []);

  // 防抖的筛选更新函数
  const debouncedFilterUpdate = useMemo(() => {
    return debounce((filterType, value, callback) => {
      console.log(`🔧 筛选条件更新: ${filterType} = ${value}`);
      if (callback) callback(value);
    }, 150);
  }, []);

  // 优化的筛选更新函数
  const updateCloudDiskType = useCallback((value) => {
    debouncedFilterUpdate('cloudDiskType', value, setCloudDiskType);
  }, [debouncedFilterUpdate]);

  const updateFileType = useCallback((value) => {
    debouncedFilterUpdate('fileType', value, setFileType);
  }, [debouncedFilterUpdate]);

  const updateTimeRange = useCallback((value) => {
    debouncedFilterUpdate('timeRange', value, setTimeRange);
  }, [debouncedFilterUpdate]);

  const updateExactMatch = useCallback((value) => {
    debouncedFilterUpdate('exactMatch', value, setExactMatch);
  }, [debouncedFilterUpdate]);

  // 获取筛选性能统计
  const getFilterStats = useCallback(() => {
    const cacheStats = searchCache.getStats();
    const perfStats = performanceCollector.getStats();
    
    return {
      cache: cacheStats,
      performance: perfStats,
      activeFilters: hasActiveFilters,
      filterCount: [cloudDiskType, fileType, timeRange, exactMatch].filter(
        (filter, index) => index === 3 ? filter : filter !== 'all'
      ).length
    };
  }, [hasActiveFilters, cloudDiskType, fileType, timeRange, exactMatch]);

  return {
    // 筛选状态
    filters,
    cloudDiskType,
    fileType,
    exactMatch,
    timeRange,
    
    // 原始状态更新方法（立即更新）
    setCloudDiskType,
    setFileType,
    setExactMatch,
    setTimeRange,
    updateFilter,
    resetFilters,
    
    // 优化的状态更新方法（防抖更新）
    updateCloudDiskType,
    updateFileType,
    updateTimeRange,
    updateExactMatch,
    
    // 工具方法
    hasActiveFilters,
    buildApiParams,
    buildResourceServiceParams,
    getFilterLabels,
    createOptimizedSearchFn,
    getFilterStats,
    
    // 常量
    API_PARAM_MAPPING
  };
}

export default useFilters;
