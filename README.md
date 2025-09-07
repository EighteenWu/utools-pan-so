# 97网盘资源搜索 uTools 插件

<div align="center">

![97网盘资源搜索](logo.png)

一个基于 [97网盘资源搜索](https://pansoo.cn/) 官方网站 1:1 完全还原的 uTools 插件，支持搜索百度网盘、夸克网盘、阿里云盘、迅雷网盘等多种网盘资源。

[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![Version](https://img.shields.io/badge/version-1.0.7-green.svg)](public/plugin.json)
[![React](https://img.shields.io/badge/react-18.2.0-blue.svg)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/vite-5.0.0-orange.svg)](https://vitejs.dev/)

</div>

## 📖 项目简介

97网盘资源搜索 uTools 插件是一个高效、便捷的网盘资源搜索工具，完美集成在 uTools 生态系统中。该插件提供了与官方网站完全一致的用户体验，支持本地缓存搜索和联网实时搜索两种模式，帮助用户快速找到所需的网盘资源。

### ✨ 主要特性

- 🎨 **界面美观**：与官网完全一致的视觉设计
- ⚡ **响应迅速**：优化的搜索和加载体验
- 🔄 **双模式搜索**：本地缓存 + 联网实时搜索
- 📱 **完美适配**：深度集成 uTools 特有功能
- 🛡️ **资源校验**：自动校验资源有效性
- 📋 **一键复制**：快速复制分享链接
- 🔗 **直接打开**：一键跳转到网盘页面
- 📊 **统计信息**：显示资源总数和新增统计

## 🚀 快速开始

### 环境要求

- Node.js >= 16.0.0
- npm >= 7.0.0
- uTools >= 2.0.0

### 安装依赖

```bash
npm install
```

### 开发模式

```bash
npm run dev
```

启动开发服务器后，访问 `http://localhost:5173` 查看应用。uTools 会读取 `public/plugin.json` 中的 `development.main` 配置进行实时预览。

### 构建生产版本

```bash
npm run build
```

构建完成后，生成的文件会输出到 `dist/` 目录。

### 预览生产版本

```bash
npm run preview
```

### 在 uTools 中加载插件

1. 打开 uTools
2. 进入插件中心
3. 选择"本地插件"
4. 点击"安装本地插件"
5. 选择项目的 `dist/` 文件夹
6. 安装完成

## 📁 项目结构

```
97网盘资源搜索/
├── src/                    # React 源代码
│   ├── components/         # React 组件
│   │   ├── AnimatedTitle.jsx
│   │   ├── FeedbackModal.jsx
│   │   ├── FooterStats.jsx
│   │   ├── Loading.jsx
│   │   ├── Message.jsx
│   │   ├── Pagination.jsx
│   │   ├── ResourceTypeFilter.jsx
│   │   ├── ResultList.jsx
│   │   └── SearchBar.jsx
│   ├── App.jsx             # 主应用组件
│   ├── main.jsx            # 应用入口
│   ├── index.css           # 全局样式
│   └── main.css            # 主题样式
├── public/                 # 静态资源
│   ├── plugin.json         # uTools 插件配置
│   ├── preload/            # 预加载脚本
│   └── icons/              # 图标资源
├── docs/                   # 文档目录
├── 97Panso/                # 预构建版本（不编辑）
├── plugin.json             # 插件元数据
├── vite.config.js          # Vite 配置
├── package.json            # 项目依赖
└── README.md               # 项目说明
```

## 🔧 技术栈

- **前端框架**：[React 18](https://reactjs.org/)
- **构建工具**：[Vite 5](https://vitejs.dev/)
- **开发语言**：JavaScript (JSX)
- **样式方案**：CSS Modules + 全局 CSS
- **API 集成**：Fetch API + uTools API
- **状态管理**：React Hooks

## 📋 功能模块

### 搜索功能
- **双模式搜索**：本地缓存搜索和联网实时搜索
- **多网盘支持**：百度网盘、夸克网盘、阿里云盘、迅雷网盘
- **智能匹配**：权重分词匹配模式，返回最相关结果
- **分页浏览**：每页显示30条结果，支持分页导航

### 资源操作
- **资源校验**：自动校验资源有效性
- **一键打开**：直接跳转到网盘链接
- **复制链接**：复制分享链接和提取码到剪贴板
- **失效反馈**：报告失效资源（仅本地模式）

### 用户界面
- **响应式设计**：适配不同屏幕尺寸
- **动画效果**：流畅的交互动画
- **加载状态**：清晰的加载提示
- **消息提示**：友好的操作反馈

## 📖 文档

- [用户手册](USER_MANUAL.md) - 详细的使用说明
- [开发文档](docs/DEVELOPMENT.md) - 开发指南和技术细节
- [API 文档](docs/API.md) - API 接口说明
- [贡献指南](docs/CONTRIBUTING.md) - 如何参与项目贡献
- [更新日志](docs/CHANGELOG.md) - 版本更新记录

## 🤝 贡献

我们欢迎任何形式的贡献！请阅读 [贡献指南](docs/CONTRIBUTING.md) 了解如何参与项目开发。

## 📄 许可证

本项目采用 [MIT 许可证](LICENSE)。

## 🙏 致谢

- [97网盘资源搜索](https://pansoo.cn/) - 提供数据源和API支持
- [uTools](https://u.tools/) - 提供插件平台
- [React](https://reactjs.org/) - 强大的前端框架
- [Vite](https://vitejs.dev/) - 快速的构建工具

## 📞 联系我们

- **官方网站**：[https://pansoo.cn/](https://pansoo.cn/)
- **问题反馈**：[GitHub Issues](https://github.com/your-repo/issues)
- **技术支持**：通过官网"联系我们"页面留言

---

<div align="center">

Made with ❤️ by [EighteenWu](https://github.com/EighteenWu)

</div>

## 结构调整说明

- 移除根目录 `plugin.json`，避免与 `dist/plugin.json` 冲突。
- 开发：导入 `public/` 作为本地插件，读取 `public/plugin.json` 的 `development.main`。
- 生产：运行 `npm run build` 后，导入 `dist/` 作为本地插件（包含打包后的 `plugin.json`）。
- 预加载：`public/preload/services.js` 作为唯一预加载入口，并在 `development` 中显式声明。
