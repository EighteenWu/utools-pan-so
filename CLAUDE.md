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
## MCP Rules (Codex MCP 调用规则)

### 目标
- 为 Claude code CLI 提供以下的MCP的选择与调用规范，强制使用MCP服务，控制查询粒度、速率与输出格式，保证可追溯与安全。

### 全局策略
- 工具选择：根据任务意图选择最匹配的 MCP 服务；避免无意义并发调用。
- 结果可靠性：默认返回精简要点 + 必要引用来源；标注时间与局限。
- 单轮单工具：每轮对话最多调用 1 种外部服务；确需多种时串行并说明理由。
- 最小必要：收敛查询范围（tokens/结果数/时间窗/关键词），避免过度抓取与噪声。
- 可追溯性：统一在答复末尾追加“工具调用简报”（工具、输入摘要、参数、时间、来源/重试）。
- 安全合规：默认离线优先；外呼须遵守 robots/ToS 与隐私要求，必要时先征得授权。
- 降级优先：失败按“失败与降级”执行，无法外呼时提供本地保守答案并标注不确定性。
- 冲突处理：遵循“冲突与优先级”的顺序，出现冲突时采取更保守策略。

### 速率与并发限制
- 速率限制：若收到 429/限流提示，退避 20 秒，降低结果数/范围；必要时切换备选服务。

### 安全与权限边界
- 隐私与安全：不上传敏感信息；遵循只读网络访问；遵守网站 robots 与 ToS。

### 失败与降级
- 失败回退：首选服务失败时，按优先级尝试替代；不可用时给出明确降级说明。

### Sequential Thinking（规划分解）
- 触发：分解复杂问题、规划步骤、生成执行计划、评估方案。
- 输入：简要问题、目标、约束；限制步骤数与深度。
- 输出：仅产出可执行计划与里程碑，不暴露中间推理细节。
- 约束：步骤上限 6-10；每步一句话；可附工具或数据依赖的占位符。

### DuckDuckGo（Web 搜索）
- 触发：需要最新网页信息、官方链接、新闻文档入口。
- 查询：使用 12 个精准关键词 + 限定词（如 site:, filetype:, after:YYYY-MM）。
- 结果：返回前 35 条高置信来源；避免内容农场与异常站点。
- 输出：每条含标题、简述、URL、抓取时间；必要时附二次验证建议。
- 禁用：网络受限且未授权；可离线完成；查询包含敏感数据/隐私。
- 参数与执行：safesearch=moderate；地区/语言=auto（可指定）；结果上限≤35；超时=5s；严格串行；遇 429 退避 20 秒并降低结果数；必要时切换备选服务。
- 过滤与排序：优先官方域名与权威媒体；按相关度与时效排序；域名去重；剔除内容农场/异常站点/短链重定向。
- 失败与回退：无结果/歧义→建议更具体关键词或限定词；网络受限→请求授权或请用户提供候选来源；最多一次重试，仍失败则给出降级说明与保守答案。

### 服务清单与用途
- Sequential Thinking：规划与分解复杂任务，形成可执行计划与里程碑。
- Context7：检索并引用官方文档/API，用于库/框架/版本差异与配置问题。
- DuckDuckGo：获取最新网页信息、官方链接与新闻/公告来源聚合。

### 调用策略与选择规则
- 意图映射：规划/分解 → Sequential；文档/API → Context7；最新信息 → DuckDuckGo。
- 单轮外部服务上限 1 种；确需多种，串行并说明理由与预期产出。
- 能离线完成则不外呼；涉及敏感信息或网络受限且未授权时禁用外呼。
- 失败回退遵循“失败与降级”小节的优先级与说明要求。

### 服务选择与调用
- 意图判定：规划/分解 → Sequential；文档/API → Context7；最新信息 → DuckDuckGo。
- 前置检查：网络与权限、敏感信息、是否可离线完成、范围是否最小必要。
- 单轮单工具：按“全局策略”执行；确需多种，串行并说明理由与预期产出。
- 调用流程：
  - 设定目标与范围（关键词/库ID/topic/tokens/结果数/时间窗）。
  - 执行调用（遵守速率限制与安全边界）。
  - 失败回退（按“失败与降级”）。
  - 输出简报（来源/参数/时间/重试），确保可追溯。
- 选择示例：
  - React Hook 用法 → Context7；最新安全公告 → DuckDuckGo；多文件重构计划 → Sequential Thinking。
- 终止条件：获得足够证据或达到步数/结果上限；超限则请求澄清。

### Context7（技术文档知识聚合）
- 触发：查询 SDK/API/框架官方文档、快速知识提要、参数示例片段。
- 流程：先 resolve-library-id；确认最相关库；再 get-library-docs。
- 主题与查询：提供 topic/关键词聚焦；tokens 默认 5000，按需下调以避免冗长（示例 topic：hooks、routing、auth）。
- 筛选：多库匹配时优先信任度高与覆盖度高者；歧义时请求澄清或说明选择理由。
- 输出：精炼答案 + 引用文档段落链接或出处标识；标注库 ID/版本；给出关键片段摘要与定位（标题/段落/路径）；避免大段复制。
- 限制：网络受限或未授权不调用；遵守许可与引用规范。
- 失败与回退：无法 resolve 或无结果时，请求澄清或基于本地经验给出保守答案并标注不确定性。
- 无 Key 策略：可直接调用；若限流则提示并降级到 DuckDuckGo（优先官方站点）。

### 输出与日志格式（可追溯性）
- 若使用 MCP，在答复末尾追加“工具调用简报”包含：
  - 工具名、触发原因、输入摘要、关键参数（如 tokens/结果数）、结果概览与时间戳。
  - 重试与退避信息；来源标注（Context7 的库 ID/版本；DuckDuckGo 的来源域名）。
- 不记录或输出敏感信息；链接与库 ID 可公开；仅在会话中保留，不写入代码。

### 输出格式（对话侧）
- 语言与风格：跟随用户语言；无明确时使用简体中文。语气简洁、直接、友好，避免冗长与重复。
- 结构：先结论后细节；按需使用简短小标题；正文以短段或 4–6 条要点为主，避免嵌套列表与长段落。
- 结构（模板）：任务复述、使用的服务、结果条目计划、引用与时间、下一步建议。
- 可读性：每条不超过两行；避免冗长引用；必要时提供“展开更多”的提示语。
- 引用与时间：在正文中标注来源域名/文档路径与时间点；详细链接可置于“来源”小节或行尾。
- 代码与命令：用反引号包裹命令/路径/标识符；多行示例用代码块；示例可复制可运行；避免粘贴长文件，必要时提供关键片段或差异。
- 隐私与保密：不回显敏感信息；必要时脱敏或使用占位符（例如 <TOKEN>、<EMAIL>）。
- 结果数量：未指定时默认列出 3–5 条来源；如任务明确要求（如 35 条）则严格遵循。
- 局限与下一步：在结尾补充 1–3 条“局限/假设/下一步”，当存在不确定性或外部依赖时必须给出。
- 工具调用简报：若调用 MCP，正文之后附上统一“工具调用简报”；不暴露中间推理链。

### 冲突与优先级
- 指令优先级：系统 > 开发者 > 用户当前指令 > 本文件（AGENTS.md） > 其他文档。
- 发生冲突时，先告知冲突点与可选处理，默认采取更保守方案；必要时征求用户决定。
- 权限与网络冲突：严格遵循当前环境设置；需越权访问时须先获得用户明确授权。

### 调用示例（伪指令）
- 规划类（Sequential Thinking）
  - 调用：
    - name: SequentialThinking
    - input: 问题/目标/约束（简述）
    - params: total_thoughts=6-10, nextThoughtNeeded=true
  - 期望输出：可执行计划（1-5 要点）+ 里程碑，不暴露中间推理。
  - 期望：6 步计划 + 估时 + 风险与缓解，不展示推理链。
  - 示例任务：为 React/Vite 项目添加暗黑模式，估时并列风险。
    - 调用：
      - name: SequentialThinking
      - input: 问题=为 React/Vite 项目添加暗黑模式；目标=支持主题切换/系统偏好/持久化；约束=不引入重型依赖、兼容现有样式与构建。
      - params: total_thoughts=6-8, nextThoughtNeeded=true
    - 期望输出（示例计划，每步一句话）：
      1) 审核现有样式与硬编码颜色，梳理影响面。
      2) 定义 CSS 变量主题令牌（light/dark），建立基础调色板。
      3) 在 `:root`/`html[data-theme]` 建立切换机制并接入 `prefers-color-scheme`。
      4) 实现 `ThemeProvider`/`useTheme`（含 localStorage 与首屏无闪烁策略）。
      5) 重构全局样式与关键组件以使用变量，处理图片/图标/阴影边界。
      6) 添加可访问的主题切换控件（ARIA/键盘/焦点状态）。
      7) 校验对比度与可读性，编制回归清单与最少量视觉测试。
      8) 更新文档与回滚策略，提供特性开关与监控点。
    - 里程碑与估时（工作日）：
      - M1 主题令牌与切换骨架：0.5d
      - M2 全局样式改造与关键组件适配：1.0d
      - M3 QA 校验与修正：1.0d
      - M4 文档与发布：0.5d
      - 合计：约 3.0d ± 0.5d（团队熟悉度影响系数）。
    - 风险与缓解：
      - 硬编码颜色分布广 → 先扫描与脚本化替换，分批提交。
      - 第三方组件不可主题化 → 覆盖样式或评估替换/降级方案。
      - 首屏闪烁（FOUC/FOIT）→ 内联首选主题脚本、避免延迟切换。
      - 对比度不达标 → 采用 WCAG AA 工具调优并留验收项。
      - 构建体积/依赖膨胀 → 禁止引入重型 UI 库，优先原生/CSS 方案。

- 文档类（Context7）
  - 第一步（解析库ID）：
    - name: Context7.resolve-library-id
    - input: libraryName="next.js"
  - 第二步（获取文档）：
    - name: Context7.get-library-docs
    - params: context7CompatibleLibraryID="/vercel/next.js", tokens=5000, topic="routing"
  - 期望输出：精炼答案 + 文档段落链接/出处标识，标注库ID与版本。
  - 期望：关键段落摘要 + 指向官方文档位置；若限流则切换到 DuckDuckGo。
  - 任务：查官方文档「Next.js App Router 路由与动态段示例与版本差异」。
    - 期望：返回精炼要点 + 段落链接/出处；标注库ID/版本；附≤20行的最小示例或伪代码。
  - 任务：pnpm workspace 配置与常见坑的官方说明。
    - 第一步（解析库ID）：
      - name: Context7.resolve-library-id
      - input: libraryName="pnpm"
    - 第二步（获取文档）：
      - name: Context7.get-library-docs
      - params: context7CompatibleLibraryID="<resolved from step 1>", tokens=5000, topic="workspaces"
    - 期望：返回官方文档链接与关键片段（workspaces 配置、monorepo 根/子包规则、import/hoist 策略），常见错误与修复建议（如 workspace: 协议不匹配、循环依赖、peer 依赖解析），并标注文档版本；附最小 pnpm-workspace.yaml 示例。

- 搜索类（DuckDuckGo）
  - 调用：
    - name: DuckDuckGo.search
    - query: 12 个精准关键词 + 限定词（如 site:, filetype:, after:YYYY-MM）
    - params: safesearch=moderate, maxResults=35, timeout=5s
  - 期望输出：精简要点 + 前 35 条高置信来源（标题/URL/时间/简述），附二次验证建议。
  - 任务：查官方公告「Vite 5 最低 Node 版本与迁移指引」。
    - 示例查询（组合其一即可）：
      - vite 5 最低 node 版本 迁移 指南 breaking changes migration guide site:vitejs.dev OR site:github.com/vitejs after:2023-10 filetype:md
      - Vite 5 Node version requirement migration guide site:vitejs.dev after:2023-10
      - Vite 5 breaking changes migration site:github.com/vitejs
    - 偏好/过滤：优先 vitejs.dev 与 github.com/vitejs；域名去重；剔除内容农场与异常站点。
    - 期望：返回 35 条来自 vitejs.dev/GitHub 的链接，附一句话摘要。
  - 失败与回退：遭遇限流/超时→退避 20 秒并降低结果数；仍失败→提示降级与让用户提供候选来源或时间范围。

- 工具调用简报（模板）
  - 工具: <SequentialThinking|Context7|DuckDuckGo>
  - 触发原因: <为何需要该工具>
  - 输入摘要: <关键词/库/topic/查询意图>
  - 参数: <关键参数，例如 tokens/结果数/时间窗>
  - 结果概览: <条数/库ID或主要来源域名/是否命中>
  - 重试/退避: <是否重试/退避时长或“无”>
  - 时间: <UTC 时间戳>

### 附：当前服务配置（参考）
- 通用
  - 单轮单工具：启用；严格串行，不并发外呼。
  - 重试策略：最多一次重试；429 退避 20s，5xx/超时退避 2s；仍失败则降级。
  - 记录与时间：统一附“工具调用简报”；时间戳使用 UTC。
  - 语言：跟随用户语言，默认简体中文。
- Sequential Thinking（规划类）
  - total_thoughts：6-10（可按需下调/上调）。
  - 分支：最多 2 个轻量分支，尽快收敛。
  - 输出：仅计划与里程碑；不暴露中间推理链。
- Context7（文档类）
  - 必需流程：resolve-library-id → get-library-docs。
  - tokens：默认 5000；按需下调避免冗长。
  - topic：建议提供，尽量具体（如 hooks、routing、auth）。
  - 限流回退：429 时退避 20s 并可切换至 DuckDuckGo（优先官方站）。
- DuckDuckGo（搜索类）
  - safesearch：moderate；地区/语言：auto（可指定）。
  - maxResults：35；timeout：5s；严格串行。
  - 查询：12 个精准关键词 + 限定词（site:, filetype:, after:YYYY-MM）。
  - 过滤：优先官方与权威域名；域名去重；剔除内容农场与异常站点。
  - MCP 服务器（名称 → 命令）
    - sequentialthinking: `npx -y mcp-sequential-thinking` (stdio)
    - duckduckgo: `npx -y duckduckgo-mcp-server` (stdio)
    - context7: `npx -y @upstash/context7-mcp` (stdio，API Key 可选用于更高配额)

### 错误与降级
- 错误分类：
  - 用户错误：输入不全/相互冲突 → 请求澄清或给出可选填空模板。
  - 服务错误：429/5xx/超时 → 遵循重试与退避策略；必要时降级。
  - 权限/网络：网络受限或未授权 → 请求授权或转为离线/用户提供线索。
  - 数据问题：无结果/歧义/低置信 → 缩小范围、改写关键词或标注不确定性。
  - 空结果歧义：提示需要用户澄清或调整关键词；给出 23 个改写建议。
  - 网络异常：明确错误类型（DNS、超时、TLS）；提供离线建议或下一步。
- 重试与退避：
  - 429（限流）：退避 20 秒并降低结果数/范围参数（如结果数、tokens）；必要时切换备选服务。
  - 5xx/超时：至多一次重试，固定退避 2 秒；仍失败则降级或返回保守答案。
  - 严格串行：不并发重试，不多窗重复查询。
- 降级路径：
  - Context7 → DuckDuckGo（优先官方站点），或给出保守答案并标注不确定性。
  - DuckDuckGo → 请求授权/用户提供候选来源或时间窗口 → 保守答案。
  - Sequential Thinking → 请求澄清或产出最小可行计划（明确假设）。
- 用户告知：在“工具调用简报”中标注错误类型、退避/重试与最终降级结果。
- 终止条件：达到重试上限或多次无增量信息时停止外呼，返回当前最佳结论并说明局限。



### serena.mcp 使用规则
- 目标: 为 Codex CLI 引入 Serena 能力（检索/RAG/总结/规划），坚持最小必要调用与可追溯输出。
- 触发: 离线无法可靠完成且需要 Serena 的语义检索/跨文档聚合/多步规划。
- 单轮单工具: 本轮仅调用 serena.mcp；确需其他服务，串行到下一轮并说明理由与预期产出。
- 使用流程: 设定目标与范围 → 选择数据域/索引 → 设定参数 → 执行调用 → 验证与引用 → 规范化输出。
- 输入: 问题/目标/约束；范围与过滤（project/path/type/time_window）；参数（top_k/max_tokens/temperature/dedupe）。
- 输出: 精炼要点；证据引用与定位（来源ID/路径/段落/时间）；局限与下一步；工具调用简报。

服务清单与用途（占位，待确认 Serena 能力）
- Retrieve: 语义检索，返回片段与来源ID；用于 RAG 上下文准备。
- Answer: 基于检索结果生成精炼回答；携带引用与限制说明。
- Summarize: 长文档/多文件摘要与要点抽取；可限定章节/范围。
- Plan: 复杂任务分解与里程碑建议；仅输出计划与里程碑。
- Tools: 如支持代码/依赖图等分析，仅以只读方式、最小必要调用。

参数建议（按需最小化）
- Retrieve: `top_k=5`, `dedupe=true`, `time_window=180d`, `filters={project|path|type}`
- Answer/Summarize: `max_tokens=600-900`, `temperature=0.2-0.5`, `citations=true`
- Plan: `steps<=8`, `milestones<=4`, `time_estimate=true`

速率与并发
- 上限: 每轮最多一次调用；不并发。
- 限流: 429 退避 20s 并降低范围/结果数；5xx/超时退避 2s 后仅重试一次。

失败与降级
- 无结果/歧义: 缩小范围、改写关键词或请求澄清。
- 服务不可用: 给出保守离线答案并标注不确定性；记录失败与退避。
- 降级路径: Serena → 保守离线答案/请求具体数据域或路径 → 再试。

安全与权限
- 不上传密钥/个人数据/专有源码；必要时脱敏或用占位符（如 `<TOKEN>`）。
- 严格只读；遵守 robots/ToS；遵循 workspace 边界。

调用示例（伪指令）
- `Serena.retrieve` 输入: `query="如何重建 Meilisearch 索引？"`, `filters={project:"backend", path:"app/services"}`, `top_k=5`
- `Serena.answer` 输入: `question="最小可行步骤？"`, `context="<retrieve 的证据ID>"`, `max_tokens=700`, `citations=true`
- `Serena.summarize` 输入: `target="docs/meili/*.md"`, `length="short"`, `headings=true`
- `Serena.plan` 输入: 目标="新增审计日志模块"，约束="不改动现有用户模型"，`steps<=8`

输出与日志（可追溯性）
- 工具: Serena；触发原因/输入摘要/关键参数（top_k/max_tokens/time_window/temperature）
- 结果概览: 条数/是否命中/主要数据域；重试与退避；UTC 时间戳

集成配置（占位，待确认）
- MCP 服务器: 名称=`serena`；启动命令=`npx -y <serena-mcp 包名>`；连接=`stdio`
- 默认参数: `retrieve.top_k=5`、`answer.max_tokens=700`；如涉及外部检索则 `safesearch=moderate`
- 数据域: `<索引/项目/路径 列表>`；权限: 只读、禁写文件/网络
