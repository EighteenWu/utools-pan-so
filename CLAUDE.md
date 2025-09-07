# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 项目概述

这是一个基于 uTools 插件平台的网盘资源搜索工具，使用 React + Vite 构建。插件允许用户搜索多个网盘平台的资源，包括百度网盘、阿里云盘、夸克网盘等。

## 核心架构

### uTools 插件架构
- **preload.js**: uTools 预加载脚本，定义插件关键字和入口点
- **plugin.json**: 插件配置文件，定义插件元数据、关键字和预加载脚本路径
- **public/plugin.json**: 生产环境的插件配置副本

### React 应用架构
- **src/App.jsx**: 主应用组件，集成搜索功能和结果展示
- **src/components/ResultList.jsx**: 搜索结果列表组件，处理结果渲染和交互
- **src/hooks/useFilters.js**: 自定义 Hook，管理搜索过滤器状态
- **src/services/searchService.js**: 搜索服务，封装多个网盘平台的 API 调用

### 关键设计模式
1. **服务层模式**: searchService.js 抽象了不同网盘平台的 API 差异
2. **Hook 模式**: useFilters.js 封装了复杂的过滤器状态逻辑
3. **组件组合**: ResultList.jsx 作为可复用的结果展示组件

## 开发环境设置

### 安装依赖
```bash
npm install
```

### 开发模式
```bash
npm run dev
```
开发服务器将在 http://localhost:5173 运行

### 构建生产版本
```bash
npm run build
```
构建产物输出到 `dist/` 目录

### 预览生产版本
```bash
npm run preview
```

### uTools 开发调试
1. 在 uTools 中启用开发者模式
2. 将项目根目录作为插件目录导入
3. 开发时修改代码后需重新构建并在 uTools 中重新加载插件

## 关键文件修改注意事项

### plugin.json 同步
- 根目录的 `plugin.json` 是开发版本
- `public/plugin.json` 是生产版本，需要保持同步
- 修改插件配置时两个文件都需要更新

### preload.js 的 uTools API
- 该文件运行在 uTools 环境中，可访问 uTools 专有 API
- 不能使用 ES6 模块语法，需要使用 CommonJS
- 负责与 uTools 主程序的通信和插件生命周期管理

### 搜索服务扩展
- 新增网盘平台时在 `src/services/searchService.js` 中添加对应的 API 实现
- 保持统一的返回数据结构：`{ title, size, link, source }`
- 处理不同平台的 API 限制和错误情况

## 调试和测试

### uTools 环境调试
- 使用 uTools 开发者工具调试前端代码
- preload.js 中可使用 `console.log` 输出到 uTools 控制台
- 插件错误会在 uTools 插件管理界面显示

### 本地开发调试
- Vite 开发服务器支持热重载
- 浏览器环境下 uTools API 不可用，需要模拟或条件调用

## MCP 服务使用规则

### Sequential Thinking（推理分析）
- **触发**：复杂问题分析、多步骤规划、设计决策需要深入思考
- **服务**：mcp__thinking__sequentialthinking 和 mcp__sequential-thinking__sequentialthinking（两个实现版本）
- **约束**：步骤限制 6-10 步，每步一句话描述，支持分支和修订思路
- **输出**：结构化思维过程，包含假设验证、公理应用、批判性质疑
- **用例**：架构设计分析、问题拆解、技术方案评估、复杂决策制定

### Context7（技术文档查询）
- **触发**：查询库文档、API 参考、框架使用指南
- **流程**：先用 resolve-library-id 获取库 ID，再用 get-library-docs 获取文档
- **限制**：默认 5000 tokens，可通过 topic 参数聚焦查询
- **输出**：精炼文档内容 + 代码示例 + 官方链接
- **用例**：React/Vite/uTools API 查询、第三方库集成、最新技术规范

### Memory（知识图谱）
- **触发**：需要记录实体关系、项目知识管理、上下文记忆
- **操作**：create_entities（创建实体）、create_relations（建立关系）、search_nodes（查询）
- **数据结构**：实体包含名称、类型、观察记录；关系使用主动语态
- **用例**：记录项目组件关系、API 依赖图、开发决策历史、用户需求跟踪

### Playwright（Web 自动化）
- **触发**：需要浏览器操作、网页测试、UI 自动化、网页数据采集
- **功能**：页面导航、元素交互、截图、表单填写、HTTP 请求、控制台日志
- **配置**：支持 chromium/firefox/webkit，可设置 headless 模式、视窗大小
- **输出**：操作结果、页面内容、性能数据、网络请求响应
- **用例**：网盘平台API测试、UI自动化测试、网页内容抓取、表单自动填写

### Shrimp Task Manager（任务管理）
- **触发**：复杂项目规划、任务分解、进度跟踪、团队协作管理
- **流程**：plan_task → analyze_task → reflect_task → split_tasks → execute_task → verify_task
- **约束**：单任务 1-2 工作日完成，最多 10 个子任务，树深度不超过 3 层
- **输出**：结构化任务列表、依赖关系、验收标准、实施指南
- **用例**：功能开发规划、Bug修复流程、代码重构任务、插件发布准备

### DuckDuckGo（搜索引擎）
- **触发**：需要进行网络搜索、获取实时信息、查找技术资料或解决方案
- **功能**：search（DuckDuckGo 搜索）、fetch_content（网页内容获取）
- **限制**：默认最多返回 10 个搜索结果，可通过 max_results 参数调整
- **输出**：格式化搜索结果 + 网页标题链接 + 内容摘要，网页完整解析内容
- **用例**：技术问题查询、API 文档搜索、错误解决方案、最新技术趋势、网盘平台政策更新

### MCP Resource Management（资源管理）
- **触发**：需要查看或管理其他MCP服务的资源和状态
- **功能**：ListMcpResourcesTool（列出资源）、ReadMcpResourceTool（读取资源内容）
- **用途**：服务状态检查、资源发现、跨服务数据访问
- **输出**：资源列表、资源内容、服务状态信息

### MCP 使用最佳实践
1. **服务选择**：根据任务类型选择合适的 MCP 服务，避免功能重复
2. **错误处理**：MCP 调用失败时应提供降级方案或提示用户
3. **数据一致性**：跨 MCP 服务的数据应保持结构一致
4. **性能优化**：避免频繁调用，合理使用缓存和批量操作
