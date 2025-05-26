// 只暴露本地 Node 能力，不做任何网络请求
const fs = require('fs');
const path = require('path');

window.customApis = {
  readFile(filePath) {
    return fs.readFileSync(filePath, { encoding: 'utf-8' });
  },
  writeTextFile(text) {
    const filePath = path.join(window.utools.getPath('downloads'), Date.now().toString() + '.txt');
    fs.writeFileSync(filePath, text, { encoding: 'utf-8' });
    return filePath;
  },
  copyText(text) {
    if (window.utools && window.utools.copyText) {
      window.utools.copyText(text);
      window.utools.showNotification('已复制');
    }
  },
  shellOpenExternal(url) {
    if (window.utools && window.utools.shellOpenExternal) {
      window.utools.shellOpenExternal(url);
    }
  }
};

// 插件进入时触发
window.exports = {
  "97panso": {
    mode: "list",
    args: {
      // 进入插件时调用
      enter: async ({ type, payload }) => {
        return {
          type: "text",
          data: {
            text: "请输入搜索关键词"
          }
        }
      },
      // 搜索时调用
      search: async ({ type, payload }) => {
        try {
          if (!payload.trim()) {
            return {
              type: "text",
              data: {
                text: "请输入搜索关键词"
              }
            }
          }

          const response = await resourceService.searchResources(payload, 'quark', 1, 10);
          
          if (response.status === 'error' || !response.results || response.results.length === 0) {
            return {
              type: "text",
              data: {
                text: response.message || "未找到相关资源"
              }
            }
          }

          return {
            type: "list",
            data: response.results.map(item => ({
              title: item.file_name || '未知资源',
              description: `${item.file_size || '未知大小'} | ${item.platform || '未知平台'}`,
              url: item.share_url || '',
              searchKey: item.resource_id
            }))
          }
        } catch (error) {
          console.error('搜索失败:', error);
          return {
            type: "text",
            data: {
              text: "搜索失败，请稍后重试"
            }
          }
        }
      },
      // 选择结果时调用
      select: async ({ type, payload }) => {
        const resourceId = payload.searchKey;
        const url = payload.url;
        
        if (url) {
          window.utools.shellOpenExternal(url);
        }
        
        return null;
      }
    }
  }
} 