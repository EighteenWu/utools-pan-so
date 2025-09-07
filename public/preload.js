// uTools 预加载脚本
const fs = require('node:fs');
const path = require('node:path');

// 通过 window 对象向渲染进程注入 Node.js 能力
window.services = {
  // 读文件
  readFile(file) {
    return fs.readFileSync(file, { encoding: 'utf-8' });
  },
  // 文本写入到下载目录
  writeTextFile(text) {
    const filePath = path.join(window.utools.getPath('downloads'), Date.now().toString() + '.txt');
    fs.writeFileSync(filePath, text, { encoding: 'utf-8' });
    return filePath;
  },
  // 图片写入到下载目录
  writeImageFile(base64Url) {
    const matchs = /^data:image\/([a-z]{1,20});base64,/i.exec(base64Url);
    if (!matchs) return;
    const filePath = path.join(window.utools.getPath('downloads'), Date.now().toString() + '.' + matchs[1]);
    fs.writeFileSync(filePath, base64Url.substring(matchs[0].length), { encoding: 'base64' });
    return filePath;
  }
};

// 97网盘资源搜索提供 uTools 特有功能
window.customApis = {
  // 复制文本到剪贴板
  copyText(text) {
    if (window.utools && window.utools.copyText) {
      window.utools.copyText(text);
      window.utools.showNotification('链接已复制');
    }
  },
  // 打开外部链接
  shellOpenExternal(url) {
    if (window.utools && window.utools.shellOpenExternal) {
      window.utools.shellOpenExternal(url);
    }
  },
  // 显示通知
  showNotification(message) {
    if (window.utools && window.utools.showNotification) {
      window.utools.showNotification(message);
    }
  },
  // 原有的文件操作方法（保持向后兼容）
  readFile(filePath) {
    return fs.readFileSync(filePath, { encoding: 'utf-8' });
  },
  writeTextFile(text) {
    const filePath = path.join(window.utools.getPath('downloads'), Date.now().toString() + '.txt');
    fs.writeFileSync(filePath, text, { encoding: 'utf-8' });
    return filePath;
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
        };
      },
      // 搜索时调用 - 这里移除了对 resourceService 的依赖
      search: async ({ type, payload }) => {
        try {
          if (!payload.trim()) {
            return {
              type: "text",
              data: {
                text: "请输入搜索关键词"
              }
            };
          }

          // TODO: 这里应该调用实际的搜索服务
          // 当前返回提示信息，因为 resourceService 尚未实现
          return {
            type: "text",
            data: {
              text: `正在搜索"${payload}"...，搜索功能需要在 React 应用中实现`
            }
          };
        } catch (error) {
          console.error('搜索失败:', error);
          return {
            type: "text",
            data: {
              text: "搜索失败，请稍后重试"
            }
          };
        }
      },
      // 选择结果时调用
      select: async ({ type, payload }) => {
        const url = payload.url;
        
        if (url) {
          window.utools.shellOpenExternal(url);
        }
        
        return null;
      }
    }
  }
};

