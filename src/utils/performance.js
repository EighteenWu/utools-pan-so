/**
 * 性能优化工具集
 * 基于现有的搜索防抖逻辑，提供筛选缓存和API调用优化
 */

// 防抖函数 - 基于现有逻辑优化
export function debounce(func, wait, immediate = false) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      timeout = null;
      if (!immediate) func(...args);
    };
    const callNow = immediate && !timeout;
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
    if (callNow) func(...args);
  };
}

// 节流函数 - 用于高频事件优化
export function throttle(func, limit) {
  let inThrottle;
  return function executedFunction(...args) {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
}

// 缓存管理器 - 用于筛选结果缓存
class CacheManager {
  constructor(maxSize = 50, ttl = 5 * 60 * 1000) { // 默认5分钟TTL
    this.cache = new Map();
    this.maxSize = maxSize;
    this.ttl = ttl;
  }

  // 生成缓存键
  generateKey(query, filters) {
    const filterStr = JSON.stringify(filters, Object.keys(filters).sort());
    return `${query}:${filterStr}`;
  }

  // 获取缓存
  get(key) {
    const item = this.cache.get(key);
    if (!item) return null;

    // 检查是否过期
    if (Date.now() - item.timestamp > this.ttl) {
      this.cache.delete(key);
      return null;
    }

    // 更新访问时间（LRU策略）
    item.lastAccessed = Date.now();
    return item.data;
  }

  // 设置缓存
  set(key, data) {
    // 如果缓存已满，删除最久未访问的项
    if (this.cache.size >= this.maxSize) {
      this.evictLRU();
    }

    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      lastAccessed: Date.now()
    });
  }

  // LRU淘汰策略
  evictLRU() {
    let oldestKey = null;
    let oldestTime = Date.now();

    for (const [key, item] of this.cache.entries()) {
      if (item.lastAccessed < oldestTime) {
        oldestTime = item.lastAccessed;
        oldestKey = key;
      }
    }

    if (oldestKey) {
      this.cache.delete(oldestKey);
    }
  }

  // 清空缓存
  clear() {
    this.cache.clear();
  }

  // 获取缓存统计
  getStats() {
    return {
      size: this.cache.size,
      maxSize: this.maxSize,
      ttl: this.ttl
    };
  }
}

// 创建全局缓存实例
export const searchCache = new CacheManager();

// API请求优化器
class APIOptimizer {
  constructor() {
    this.pendingRequests = new Map();
    this.requestQueue = [];
    this.isProcessing = false;
    this.maxConcurrent = 3; // 最大并发请求数
    this.requestDelay = 100; // 请求间隔（毫秒）
  }

  // 去重请求 - 相同参数的请求只发送一次
  async deduplicateRequest(url, params, requestFn) {
    const key = `${url}:${JSON.stringify(params)}`;
    
    // 如果已有相同请求在进行中，返回该请求的Promise
    if (this.pendingRequests.has(key)) {
      return this.pendingRequests.get(key);
    }

    // 创建新请求
    const requestPromise = requestFn(url, params)
      .finally(() => {
        // 请求完成后清理
        this.pendingRequests.delete(key);
      });

    this.pendingRequests.set(key, requestPromise);
    return requestPromise;
  }

  // 请求队列管理
  async queueRequest(requestFn) {
    return new Promise((resolve, reject) => {
      this.requestQueue.push({ requestFn, resolve, reject });
      this.processQueue();
    });
  }

  // 处理请求队列
  async processQueue() {
    if (this.isProcessing || this.requestQueue.length === 0) {
      return;
    }

    this.isProcessing = true;
    const activeTasks = [];

    while (this.requestQueue.length > 0 && activeTasks.length < this.maxConcurrent) {
      const { requestFn, resolve, reject } = this.requestQueue.shift();
      
      const task = requestFn()
        .then(resolve)
        .catch(reject)
        .finally(() => {
          // 从活跃任务中移除
          const index = activeTasks.indexOf(task);
          if (index > -1) {
            activeTasks.splice(index, 1);
          }
        });

      activeTasks.push(task);

      // 添加请求间隔
      if (this.requestQueue.length > 0) {
        await new Promise(resolve => setTimeout(resolve, this.requestDelay));
      }
    }

    // 等待所有活跃任务完成
    if (activeTasks.length > 0) {
      await Promise.allSettled(activeTasks);
    }

    this.isProcessing = false;

    // 如果还有待处理的请求，继续处理
    if (this.requestQueue.length > 0) {
      this.processQueue();
    }
  }

  // 取消所有待处理的请求
  cancelPendingRequests() {
    this.requestQueue.length = 0;
    this.pendingRequests.clear();
  }
}

// 创建全局API优化器实例
export const apiOptimizer = new APIOptimizer();

// 搜索性能优化Hook辅助函数
export function createOptimizedSearch(searchFn, options = {}) {
  const {
    debounceDelay = 300,
    enableCache = true,
    enableDeduplication = true,
    enableQueue = false
  } = options;

  // 创建防抖搜索函数
  const debouncedSearch = debounce(searchFn, debounceDelay);

  return async function optimizedSearch(query, filters = {}) {
    // 生成缓存键
    const cacheKey = searchCache.generateKey(query, filters);

    // 尝试从缓存获取结果
    if (enableCache) {
      const cachedResult = searchCache.get(cacheKey);
      if (cachedResult) {
        console.log('🚀 从缓存返回搜索结果:', cacheKey);
        return cachedResult;
      }
    }

    // 创建搜索请求函数
    const searchRequest = async () => {
      console.log('🔍 执行新搜索请求:', { query, filters });
      const result = await searchFn(query, filters);
      
      // 缓存结果
      if (enableCache && result) {
        searchCache.set(cacheKey, result);
        console.log('💾 搜索结果已缓存:', cacheKey);
      }
      
      return result;
    };

    // 根据配置选择优化策略
    if (enableDeduplication) {
      return apiOptimizer.deduplicateRequest(
        'search',
        { query, filters },
        searchRequest
      );
    } else if (enableQueue) {
      return apiOptimizer.queueRequest(searchRequest);
    } else {
      return searchRequest();
    }
  };
}

// 虚拟滚动辅助函数
export function calculateVirtualScrollItems(
  items,
  containerHeight,
  itemHeight,
  scrollTop,
  overscan = 5
) {
  const totalItems = items.length;
  const visibleCount = Math.ceil(containerHeight / itemHeight);
  const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan);
  const endIndex = Math.min(totalItems - 1, startIndex + visibleCount + overscan * 2);

  return {
    startIndex,
    endIndex,
    visibleItems: items.slice(startIndex, endIndex + 1),
    totalHeight: totalItems * itemHeight,
    offsetY: startIndex * itemHeight
  };
}

// 图片懒加载辅助函数
export function createLazyImageLoader(options = {}) {
  const {
    rootMargin = '50px',
    threshold = 0.1,
    placeholder = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMSIgaGVpZ2h0PSIxIiB2aWV3Qm94PSIwIDAgMSAxIiBmaWxsPSJub25lIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxyZWN0IHdpZHRoPSIxIiBoZWlnaHQ9IjEiIGZpbGw9IiNGNUY1RjUiLz48L3N2Zz4='
  } = options;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const img = entry.target;
        const src = img.dataset.src;
        
        if (src) {
          img.src = src;
          img.removeAttribute('data-src');
          observer.unobserve(img);
        }
      }
    });
  }, { rootMargin, threshold });

  return {
    observe: (img) => {
      if (img.dataset.src) {
        img.src = placeholder;
        observer.observe(img);
      }
    },
    disconnect: () => observer.disconnect()
  };
}

// 内存使用监控
export function createMemoryMonitor() {
  const monitor = {
    checkMemoryUsage() {
      if (performance.memory) {
        const { usedJSHeapSize, totalJSHeapSize, jsHeapSizeLimit } = performance.memory;
        const usagePercent = (usedJSHeapSize / jsHeapSizeLimit) * 100;
        
        return {
          used: Math.round(usedJSHeapSize / 1024 / 1024), // MB
          total: Math.round(totalJSHeapSize / 1024 / 1024), // MB
          limit: Math.round(jsHeapSizeLimit / 1024 / 1024), // MB
          usagePercent: Math.round(usagePercent * 100) / 100
        };
      }
      return null;
    },

    logMemoryUsage(label = 'Memory Usage') {
      const usage = this.checkMemoryUsage();
      if (usage) {
        console.log(`📊 ${label}:`, usage);
        
        // 内存使用率过高时警告
        if (usage.usagePercent > 80) {
          console.warn('⚠️ 内存使用率过高:', usage.usagePercent + '%');
        }
      }
    },

    startMonitoring(interval = 30000) { // 默认30秒检查一次
      return setInterval(() => {
        this.logMemoryUsage('定期内存检查');
      }, interval);
    }
  };

  return monitor;
}

// 性能指标收集
export function createPerformanceCollector() {
  const metrics = {
    searchTimes: [],
    renderTimes: [],
    apiCallTimes: []
  };

  return {
    // 记录搜索性能
    recordSearchTime(startTime, endTime = Date.now()) {
      const duration = endTime - startTime;
      metrics.searchTimes.push(duration);
      console.log(`🔍 搜索耗时: ${duration}ms`);
      return duration;
    },

    // 记录渲染性能
    recordRenderTime(startTime, endTime = Date.now()) {
      const duration = endTime - startTime;
      metrics.renderTimes.push(duration);
      console.log(`🎨 渲染耗时: ${duration}ms`);
      return duration;
    },

    // 记录API调用性能
    recordApiCallTime(startTime, endTime = Date.now()) {
      const duration = endTime - startTime;
      metrics.apiCallTimes.push(duration);
      console.log(`🌐 API调用耗时: ${duration}ms`);
      return duration;
    },

    // 获取性能统计
    getStats() {
      const calculateStats = (times) => {
        if (times.length === 0) return { avg: 0, min: 0, max: 0, count: 0 };
        
        const avg = times.reduce((a, b) => a + b, 0) / times.length;
        const min = Math.min(...times);
        const max = Math.max(...times);
        
        return { avg: Math.round(avg), min, max, count: times.length };
      };

      return {
        search: calculateStats(metrics.searchTimes),
        render: calculateStats(metrics.renderTimes),
        apiCall: calculateStats(metrics.apiCallTimes)
      };
    },

    // 清空统计数据
    clearStats() {
      metrics.searchTimes.length = 0;
      metrics.renderTimes.length = 0;
      metrics.apiCallTimes.length = 0;
    }
  };
}

// 导出默认性能收集器实例
export const performanceCollector = createPerformanceCollector();

// 导出默认内存监控器实例
export const memoryMonitor = createMemoryMonitor();

// 工具函数：检查是否为慢设备
export function isSlowDevice() {
  // 检查硬件并发数
  const cores = navigator.hardwareConcurrency || 1;
  
  // 检查内存（如果可用）
  const memory = navigator.deviceMemory || 1;
  
  // 检查连接速度（如果可用）
  const connection = navigator.connection;
  const isSlowConnection = connection && 
    (connection.effectiveType === 'slow-2g' || connection.effectiveType === '2g');
  
  // 综合判断
  return cores <= 2 || memory <= 2 || isSlowConnection;
}

// 工具函数：获取优化建议
export function getOptimizationRecommendations() {
  const recommendations = [];
  
  if (isSlowDevice()) {
    recommendations.push('检测到性能较低的设备，建议启用性能优化模式');
  }
  
  const cacheStats = searchCache.getStats();
  if (cacheStats.size === 0) {
    recommendations.push('搜索缓存为空，建议进行一些搜索以提升后续性能');
  }
  
  const perfStats = performanceCollector.getStats();
  if (perfStats.search.avg > 1000) {
    recommendations.push('搜索平均耗时较长，建议检查网络连接或优化搜索参数');
  }
  
  return recommendations;
}