Dify Web 前端开发规范
1. 架构设计原则
1.1 技术栈选型
1.1.1 核心框架：React 18+ 与 TypeScript 5+
React 18 的并发特性（Concurrent Features）为 Dify 这类复杂 AI 应用提供了关键的基础设施支撑。自动批处理（Automatic Batching）减少了不必要的重渲染，过渡更新（Transitions）允许开发者标记非紧急更新以优先保障用户交互响应性，而增强的 Suspense 机制则为路由级懒加载和数据获取提供了优雅的加载状态管理。对于 AI 应用常见的流式响应场景（如 SSE 实时消息推送），这些特性能够确保界面在高负载下依然保持流畅。
TypeScript 5+ 的采用是代码质量的底线要求。严格模式（strict: true）的全量启用包括 noImplicitAny、strictNullChecks、strictFunctionTypes 等全部子选项，确保类型系统的完整性。TypeScript 5 引入的 const 类型参数、改进的模板字面量类型推断、以及装饰器元数据支持，为构建复杂的类型层提供了更强大的工具。在 Dify 的实践中，API 契约的类型安全尤为关键——后端微服务接口的类型定义通过 OpenAPI 自动生成，前端通过严格的类型守卫确保运行时安全。
技术选型的核心权衡在于：React 的生态系统成熟度与团队学习成本的平衡，TypeScript 严格模式带来的开发效率损耗与长期维护收益的权衡。对于 AI 应用平台这类需要长期演进的大型项目，类型安全的投资回报率显著高于短期开发速度。
1.1.2 应用框架：Next.js 15（App Router 模式）
Next.js 15 App Router 代表了 React 服务端渲染范式的最新演进。与 Pages Router 相比，App Router 基于 React Server Components（RSC）构建，实现了更细粒度的服务端/客户端边界控制。这一架构选择对 Dify 具有战略意义：营销页面和文档站点可采用服务端渲染以获得 SEO 优势，而复杂的交互式控制台（工作流编辑器、对话调试界面）则标记为客户端组件以保留完整的浏览器 API 访问能力。
App Router 的核心特性应用策略：
特性	应用场景	Dify 实践
嵌套布局	共享 UI 结构的页面组	(dashboard)/ 布局包裹应用管理、工作流编排等页面
流式传输	渐进式内容加载	对话列表即时渲染，消息内容流式填充
部分预渲染	混合静态/动态内容	营销页面静态生成，用户数据动态获取
并行路由	模态框、侧边面板	工作流节点详情以 @modal 插槽呈现
服务端组件与客户端组件的边界划分是架构设计的关键决策。默认情况下所有组件均为服务端组件，仅在需要浏览器 API、React Hooks 或事件处理器时添加 "use client" 指令。这种”服务端优先”的策略最大化了首屏性能，同时保持交互灵活性。
1.1.3 样式方案：TailwindCSS + CSS Modules 混合策略
Dify 采用 TailwindCSS 作为主力样式工具，辅以 CSS Modules 处理复杂场景，形成分层互补的样式架构。
层级	工具	应用场景	决策依据
基础样式	Tailwind 工具类	布局、间距、颜色、字体	开发效率、设计一致性
组件变体	Tailwind cva / 配置	按钮状态、卡片样式	类型安全的变体系统
复杂交互	CSS Modules	动画关键帧、伪元素、拖拽状态	选择器灵活性、作用域隔离
主题定制	CSS 自定义属性	明暗模式、品牌色切换	运行时动态切换
Tailwind 的配置深度定制体现在 tailwind.config.ts 中：颜色系统与 Dify 品牌色完全对齐，间距尺度基于 4px 网格系统，字体配置覆盖标题、正文、代码三种场景。暗色模式采用 class 策略，通过 dark: 变体前缀和 CSS 变量实现无闪烁切换。
CSS Modules 的保留用于解决纯 Tailwind 的局限性：复杂动画的关键帧定义、第三方组件的样式覆盖、以及需要 JavaScript 动态计算的样式值。文件命名遵循 [name].module.css，类名采用 camelCase 确保与 JavaScript 的无缝交互。
1.1.4 状态管理：Zustand 为主，React Context 为辅
状态管理架构采用 Zustand 作为全局状态的主要方案，React Context 用于主题、国际化等跨切面关注点的依赖注入。这一选择的决策矩阵如下：
方案	样板代码	类型安全	性能	学习曲线	适用场景
Redux	高	需配置	中等	陡峭	不适用
MobX	中等	需装饰器	良好	中等	不适用
Recoil/Jotai	低	良好	良好	平缓	原子化状态
Zustand	极低	原生支持	优秀	平缓	全局业务状态
Context	无	原生支持	需谨慎优化	平缓	慢变全局配置
Zustand 的核心优势在于其极简的 API 设计——一个完整的 store 定义可在 20 行代码内完成，无需 action creators、reducers 或中间件配置。Dify 的 store 按领域拆分策略：
•	useAppStore：应用级 UI 状态（侧边栏、主题、全局通知）
•	useConversationStore：对话会话状态（消息列表、流式状态、当前会话）
•	useWorkflowStore：工作流编排状态（节点图、连接边、选中状态、执行历史）
•	useModelStore：模型配置状态（提供商列表、模型参数、密钥管理）
React Context 的严格限制使用场景：主题配置、用户认证信息、功能开关等更新频率极低的全局数据。Context 的 Provider 嵌套深度控制在 3 层以内，避免渲染穿透问题。
1.2 工程化架构
1.2.1 Monorepo 结构：web / shared / sdk 分层
Dify 采用 pnpm workspace 管理的 Monorepo 架构，三层结构实现关注点分离：
层级	包路径	核心职责	依赖关系	发布策略
web	apps/web	主应用，Next.js 15 实现	依赖 shared, sdk	独立部署
shared	packages/shared	设计系统组件、通用工具、类型定义	无外部依赖	npm 包发布
sdk	packages/sdk	外部集成 JavaScript SDK	依赖 shared	npm 包发布，SemVer 管理
shared 包的框架无关性设计是关键约束——组件必须使用原生 React 实现，禁止依赖 Next.js 特有 API，以确保在 SDK 和其他消费场景的可移植性。组件库遵循 原子设计方法论，从 atoms（Button、Input）、molecules（SearchBar、FormField）、organisms（DataTable、ModalForm）到 templates（PageLayout）逐级组合。
sdk 包的设计目标包括：零运行时依赖（除 shared 外）、Tree-shaking 友好、完整的 TypeScript 声明、以及多格式构建产物（ESM/CJS/UMD）。版本管理遵循语义化版本（SemVer），破坏性变更通过 deprecation 周期和迁移指南平滑过渡。
1.2.2 构建工具：Vite 用于开发，Next.js 内置用于生产
开发环境与生产构建的工具分离策略：
阶段	工具	核心优势	配置要点
开发	Vite	极速冷启动（<500ms）、即时 HMR	库模式配置、路径别名、代理规则
生产	Next.js 内置（Turbopack/Webpack）	代码分割、SSR 优化、边缘运行时	next.config.ts 优化配置、Bundle 分析
Vite 的采用显著提升了开发迭代效率，其基于原生 ESM 的 dev server 避免了传统 bundler 的冗长打包过程。对于 shared 和 sdk 包，Vite 的库模式配置支持快速的类型生成和构建输出。
生产构建充分利用 Next.js 的优化能力：自动代码分割基于路由和动态导入，图片优化通过 next/image 实现格式转换和响应式尺寸，字体优化通过 next/font 实现子集化和预加载。Turbopack 的集成（Next.js 15 实验性）提供了 700% 的构建速度提升，已逐步用于生产环境。
1.2.3 包管理：pnpm workspace 统一依赖
pnpm 的核心优势与配置策略：
特性	机制	Dify 实践
内容可寻址存储	硬链接机制，单版本单存储	Monorepo 磁盘占用降低 70%+
严格依赖隔离	node_modules 结构扁平化	杜绝幽灵依赖问题
workspace 协议	workspace:* 本地链接	包间引用即时生效
版本锁定	pnpm-lock.yaml 提交版本控制	构建可复现性保障
依赖管理的关键原则：单一版本原则（同一依赖全局唯一）、显式声明原则（直接使用的依赖必须声明）、以及分层管理原则（根目录管理 devDependencies，子包管理 runtime dependencies）。catalog: 功能用于统一核心库版本（React、TypeScript），确保跨包兼容性。
1.3 设计模式
1.3.1 组件职责分离：UI 组件 / 容器组件 / 业务逻辑 Hook
三层组件架构的职责边界与协作模式：
层级	职责定位	典型示例	测试策略
UI 组件	纯视觉呈现，无业务逻辑	Button、ChatMessageBubble	快照测试、视觉回归
容器组件	数据获取，状态分发	ConversationListContainer	集成测试（Mock 数据）
业务逻辑 Hook	可复用状态逻辑封装	useConversationStream	Hook 测试（renderHook）
UI 组件的设计追求可配置性与可访问性的平衡。通过 Radix UI 等 Headless 库提供无障碍基础，再通过 Tailwind 添加视觉层。Props API 设计遵循一致性原则——所有表单组件支持受控模式（value/onChange），所有反馈组件支持显隐控制（open/onOpenChange）。
容器组件在 App Router 中的演进：服务端组件天然承担容器角色，直接进行数据获取；客户端容器则使用 Hooks 桥接服务端数据与交互状态。这种混合模式最大化了服务端渲染的优势，同时保留客户端的响应性。
业务逻辑 Hook 的粒度控制：单一职责原则要求每个 Hook 聚焦于一个明确的功能维度。复杂场景通过 Hook 组合实现，而非单个 Hook 的膨胀。例如，对话发送功能拆分为 useMessageInput（输入状态）、useMessageSend（发送逻辑）、useMessageStream（流式响应）三个专注的 Hook。
1.3.2 状态提升原则：局部状态优先，全局状态收敛
状态放置的决策流程与典型场景：

状态变更频率评估
    ↓
高频变更？ ──是──→ 评估作用范围
    ↓否              ↓
useState/useReducer  单组件？ ──是──→ 本地状态
    ↓                ↓否
  派生状态(useMemo)  父子组件？ ──是──→ Props 提升
                        ↓否
                      跨领域？ ──是──→ Zustand Store
                        ↓否
                      Context（慢变配置）
局部状态优先原则的实践要点：表单输入、展开折叠等纯 UI 状态严格保留在组件内部；需要父子共享时通过 props 提升，而非过早全局化。这一原则避免了全局 store 的膨胀，降低了状态变更的不可预测性。
全局状态收敛策略要求：相同领域的数据集中在单一 store，派生状态通过 selector 计算而非冗余存储。例如，useConversationStore 管理原始消息数组，当前会话的过滤消息通过 currentMessages selector 实时计算，避免数据同步问题。
1.3.3 领域驱动设计（DDD）：按业务域组织代码边界
Dify 的核心业务域划分与边界定义：
领域	核心概念	典型页面/功能	与其他领域的关系
conversation	会话、消息、流式响应	聊天界面、消息历史、实时对话	依赖 model 获取模型配置
workflow	节点、连接边、执行图	可视化编排器、调试面板、运行记录	依赖 knowledge 引用知识库
knowledge	文档、分段、向量检索	文档上传、分段配置、检索测试	被 workflow、conversation 依赖
model	提供商、模型、参数配置	密钥管理、模型选择、参数调优	被所有 AI 功能领域依赖
app	应用、发布、版本、监控	应用创建、配置向导、用量统计	聚合其他领域的配置
领域目录的自包含结构确保高内聚：组件、Hooks、服务、类型、状态全部在领域内闭环。跨领域交互通过明确的公共服务层或事件机制进行，禁止直接导入内部模块。这种边界清晰性为未来的微前端拆分奠定了基础——每个领域可独立构建为 Module Federation 的远程应用。
2. 项目目录结构
2.1 顶层组织
2.1.1 apps/web：主应用入口
apps/web 作为 Next.js 15 应用的根目录，其关键配置与约定：
文件/目录	用途	技术约束
app/	App Router 路由定义	服务端组件默认，"use client" 显式标记客户端边界
features/	业务领域模块（DDD 核心）	每个领域独立目录，完整自包含
components/	应用级通用组件	非领域特定，跨领域复用
hooks/	应用级自定义 Hooks	跨领域的通用逻辑
stores/	Zustand 全局状态	按领域拆分，禁止单一超大 store
services/	API 客户端封装	与后端 Swagger/OpenAPI 严格对齐
utils/	工具函数与常量	纯函数，无副作用，100% 单元测试覆盖
types/	全局类型定义	跨领域的共享类型
styles/	全局样式与主题	Tailwind 配置、CSS 变量、字体定义
middleware.ts	Next.js 中间件	认证、国际化、A/B 测试路由
next.config.ts	Next.js 配置	环境变量、实验性功能、构建优化
2.1.2 packages/shared：跨应用共享模块
shared 包的原子设计组件层级：
层级	目录	复杂度上限	典型组件	复用范围
Atoms	components/atoms/	50 行	Button, Input, Icon, Badge	所有项目
Molecules	components/molecules/	150 行	SearchBar, FormField, ToggleGroup	所有项目
Organisms	components/organisms/	300 行	DataTable, ModalForm, RichEditor	Web 应用
Templates	components/templates/	500 行	DashboardLayout, SettingsLayout	Web 应用
组件开发的关键约束：零外部依赖（除 React 外）、完整的 TypeScript 类型、Storybook 文档、以及视觉回归测试。主题系统通过 CSS 变量驱动，支持运行时切换而无需重新构建。
2.1.3 packages/sdk：外部集成 SDK
SDK 的模块设计与 API 表面：
模块	核心功能	典型使用场景
auth	API Key 管理、令牌刷新	服务端集成、自动化脚本
chat	会话创建、消息发送、流式响应	嵌入聊天窗口、客服系统
workflow	工作流执行、状态查询、结果获取	业务流程自动化
knowledge	文档上传、检索查询	企业知识库集成
SDK 的构建输出格式：ESM（index.mjs）用于现代打包器，CJS（index.cjs）用于 Node.js，UMD（index.umd.js）用于浏览器直接引用。类型声明文件（.d.ts）完整覆盖所有公共 API。
2.2 应用内部结构（apps/web）
2.2.1 app/：Next.js App Router 路由与页面
App Router 的约定文件与渲染环境：
文件	用途	渲染环境	关键特性
layout.tsx	嵌套布局	服务端/客户端	状态持久、共享 UI 框架
page.tsx	路由页面	服务端（默认）	异步数据获取、SEO 友好
loading.tsx	加载状态	服务端	Suspense 边界、渐进呈现
error.tsx	错误边界	客户端	错误恢复、降级 UI
not-found.tsx	404 页面	服务端	自定义设计、导航引导
route.ts	API 端点	服务端	Edge/Node Runtime 可选
template.tsx	重新挂载模板	客户端	导航时状态重置
default.tsx	并行路由默认	服务端	未匹配插槽回退
路由组（Route Groups）的组织策略：(marketing)/ 包含官网、文档等营销页面，独立布局；(dashboard)/ 包含应用控制台，共享侧边栏导航；(auth)/ 包含登录注册，极简布局。动态路由 [id] 配合 generateStaticParams 实现静态生成与动态渲染的混合。
2.2.2 components/：通用 UI 组件（原子/分子/组织）
应用级组件与 shared 包组件的区别：components/ 中的组件更贴近 Dify 的具体业务场景，如 AppHeader（包含 Logo、全局搜索、用户菜单、通知中心）、Sidebar（支持多级菜单、徽章提示、折叠状态）。这些组件可能依赖 shared 的原子组件，但添加了业务特定的交互和状态。
2.2.3 features/：业务功能模块（按领域划分）
features/ 目录是 DDD 的核心落地，以 workflow 领域为例的完整结构：

features/workflow/
├── components/              # 领域专属组件
│   ├── WorkflowCanvas/      # 核心画布组件（复杂目录结构）
│   │   ├── index.tsx
│   │   ├── type.ts
│   │   ├── style.module.css
│   │   ├── hooks/
│   │   │   ├── useCanvasZoom.ts
│   │   │   ├── useNodeDrag.ts
│   │   │   └── useAutoLayout.ts
│   │   └── components/
│   │       ├── CanvasGrid.tsx
│   │       ├── NodePalette.tsx
│   │       └── MiniMap.tsx
│   ├── NodeConfigPanel.tsx  # 节点配置侧边栏
│   └── ExecutionLog.tsx     # 执行记录面板
├── hooks/                   # 领域业务逻辑
│   ├── useWorkflow.ts       # 主 Hook，组合其他逻辑
│   ├── useNodeTypes.ts      # 节点类型注册
│   ├── useExecution.ts      # 执行控制与监控
│   └── index.ts             # 公开导出
├── services/                # 领域 API 调用
│   ├── workflowApi.ts       # CRUD 操作
│   ├── executionApi.ts      # 执行控制
│   └── types.ts             # API 类型定义
├── types/                   # 领域模型类型
│   ├── node.ts              # 节点定义
│   ├── edge.ts              # 连接边定义
│   └── execution.ts         # 执行状态
├── stores/                  # 领域状态（可选）
│   └── workflowStore.ts     # Zustand store
├── constants.ts             # 领域常量
└── index.ts                 # 领域公开 API
2.2.4 hooks/：自定义 React Hooks
应用级 Hooks 的分类与示例：
类别	命名模式	典型实现	使用场景
数据获取	use[Resource]Query	useModelsQuery, useAppsQuery	React Query 封装
交互逻辑	use[Interaction]	useDisclosure, usePagination	UI 状态管理
副作用	use[Effect]	useLocalStorage, useMediaQuery	浏览器 API 封装
性能优化	use[Optimized]	useDebounce, useThrottle	高频事件控制
业务抽象	use[Domain]	useAppContext, usePermission	跨领域业务逻辑
2.2.5 stores/：Zustand 状态定义
Store 的标准实现模式（以 conversationStore 为例）：

// 状态结构定义
interface ConversationState {
  // 原始状态
  conversations: Conversation[]
  currentId: string | null
  isStreaming: boolean
  
  // 派生状态（selector）
  currentConversation: () => Conversation | undefined
  messagesByCurrent: () => Message[]
  
  // 动作
  setCurrentId: (id: string | null) => void
  addMessage: (message: Message) => void
  updateStreaming: (streaming: boolean) => void
}

// Store 创建 with 中间件组合
export const useConversationStore = create<ConversationState>()(
  devtools(                    // Redux DevTools 调试
    persist(                   // localStorage 持久化
      immer((set, get) => ({   // 不可变更新语法糖
        // 初始状态
        conversations: [],
        currentId: null,
        isStreaming: false,
        
        // 派生状态实现
        currentConversation: () => 
          get().conversations.find(c => c.id === get().currentId),
        messagesByCurrent: () => 
          get().currentConversation()?.messages ?? [],
        
        // 动作实现
        setCurrentId: (id) => set({ currentId: id }),
        addMessage: (message) => set((state) => {
          const conv = state.conversations.find(c => c.id === message.conversationId)
          conv?.messages.push(message)
        }),
        updateStreaming: (streaming) => set({ isStreaming: streaming }),
      })),
      { name: 'conversation-storage', partialize: (s) => ({ currentId: s.currentId }) }
    ),
    { name: 'ConversationStore' }
  )
)
2.2.6 services/：API 调用与数据层
服务层的分层架构：
层级	文件	职责	技术要点
HTTP 客户端	client.ts	请求配置、拦截器、错误处理	axios/fetch 封装，请求取消
领域服务	[domain]Api.ts	具体端点调用	与 OpenAPI 契约严格对齐
类型定义	types.ts	请求/响应类型	运行时校验（zod/valibot）
Mock 数据	mocks/	开发环境模拟	MSW 集成
React Query 的集成封装模式：原始 API 函数（fetchConversations）与 Query Hook（useConversations）分离，前者可直接使用，后者提供缓存、重试、背景更新等高级能力。
2.2.7 utils/：工具函数与常量
工具函数的纯度要求与测试策略：所有工具函数必须为纯函数（无副作用、相同输入恒定输出），配套 100% 单元测试覆盖。分类组织包括 date/（国际化日期处理）、string/（slugify、truncate）、number/（clamp、formatNumber）、object/（deepMerge、pickOmit）、validation/（zod 校验模式）。
2.2.8 types/：全局 TypeScript 类型定义
全局类型与领域类型的分工：全局类型存放跨领域的通用结构（ApiResponse<T>、PaginatedResult<T>、Nullable<T>），领域类型存放业务模型（Conversation、WorkflowNode 等）。类型定义的严格性要求：禁止 any，unknown 配合类型守卫，优先 type 而非 interface。
2.3 组件内聚结构
2.3.1 复杂组件：index.tsx / type.ts / style.module.css / hooks/ 子目录
复杂组件的目录结构与文件职责：
文件/目录	职责	内容规范
index.tsx	主组件实现	组合子组件与 Hook，不超过 150 行
type.ts	类型定义	Props、事件、内部状态类型，全部导出
style.module.css	局部样式	CSS Modules，camelCase 类名，CSS 变量驱动
hooks/	子 Hooks	单一职责，以 use[Component][Feature] 命名
components/	子组件	仅本组件使用，不对外导出
utils.ts	工具函数	纯函数，组件专属
2.3.2 简单组件：单文件承载，不超过 200 行
简单组件的紧凑结构：类型定义（内联或文件顶部）、组件实现（函数声明，显式返回类型）、样式（Tailwind 工具类或 styled-jsx）。200 行限制是强制性的代码异味指标，超过即触发重构审查。
3. 代码风格规范
3.1 格式化配置
3.1.1 ESLint：继承 @antfu/eslint-config + React Hooks 规则
ESLint 配置的分层继承策略：

// eslint.config.js
import antfu from '@antfu/eslint-config'

export default antfu({
  typescript: true,
  react: true,
  stylistic: {
    indent: 2,
    quotes: 'single',
    semi: false,
  },
}, {
  rules: {
    // 强制 type 优先
    '@typescript-eslint/consistent-type-definitions': ['error', 'type'],
    // React Hooks 严格规则
    'react-hooks/rules-of-hooks': 'error',
    'react-hooks/exhaustive-deps': 'warn',
    // 项目特定
    'no-console': ['warn', { allow: ['error', 'warn'] }],
    'import/no-self-import': 'error',
  },
})
@antfu/eslint-config 的核心价值：预设 200+ 最佳实践规则，覆盖 TypeScript、React、JSON、Markdown，无需冗长的自定义配置。项目级覆盖仅针对团队特定约定，保持配置的简洁可维护。
3.1.2 类型定义：强制使用 type 而非 interface
type 优先的决策依据与例外管理：
特性	type 支持	interface 支持	Dify 选择
联合类型	✅ 原生	❌ 需模拟	type Status = 'idle' \| 'loading'
交叉类型	✅ &	✅ extends	type AdminUser = User & Admin
映射类型	✅ 原生	❌ 不支持	type Readonly<T> = { readonly  - T[K] }
声明合并	❌ 不支持	✅ 原生	例外场景使用，需注释说明
例外场景：扩展第三方库类型定义时，可使用 interface 的声明合并能力，但需附注释说明理由。
3.1.3 缩进：2 空格，无 Tab 混用
配置一致性保障：.editorconfig（indent_size = 2）、Prettier（tabWidth: 2）、ESLint（indent 规则）三重同步。Git 钩子 lint-staged 在提交前自动修复格式问题。
3.1.4 行长度：最大 100 字符
换行策略与典型场景：
场景	换行位置	示例
函数参数	逗号后，每参数一行	超过 3 个参数或单参数过长
JSX 属性	属性名后，每属性一行	超过 2 个属性
链式调用	方法点前，每方法一行	超过 3 级链式
对象/数组	逗号后，每元素一行	超过 3 个元素或单元素过长
3.2 命名约定
3.2.1 文件命名：kebab-case（通用）/ PascalCase（组件）
内容类型	命名规范	示例
通用模块	kebab-case	use-debounce.ts, date-utils.ts
React 组件	PascalCase	Button.tsx, ChatMessage/
组件目录	PascalCase	WorkflowCanvas/
样式文件	同名 + .module.css	Button.module.css
测试文件	同名 + .test.tsx	Button.test.tsx
3.2.2 变量/函数：camelCase，布尔值前缀 is/has/should
布尔变量前缀的语义区分：
前缀	含义	示例
is	状态/条件判断	isLoading, isOpen, isAuthenticated
has	拥有/包含关系	hasError, hasPermission, hasUnsavedChanges
should	行为建议/预期	shouldRetry, shouldShowWarning, shouldValidate
can	能力/权限判断	canEdit, canDelete, canSubmit
函数命名的动词选择：数据操作（fetch, get, update, delete, create）、事件处理（handle + 名词，如 handleSubmit）、回调传递（on + 动词，如 onChange）。
3.2.3 常量：SCREAMING_SNAKE_CASE（全局）/ camelCase（局部）
作用域	命名规范	示例
模块级/全局导出	SCREAMING_SNAKE_CASE	API_BASE_URL, MAX_RETRY_COUNT
函数内局部	camelCase	const maxItems = 100
3.2.4 类型定义：PascalCase，泛型参数 T/K/V 等
类型类别	命名模式	示例
对象类型	描述性名词	User, Message, ApiResponse
Props 类型	组件名 + Props	ButtonProps, ChatMessageProps
状态类型	领域 + State	ConversationState, WorkflowState
事件类型	动作 + Event	MessageSendEvent, UserLoginEvent
工具类型	描述性形容词	Nullable<T>, DeepPartial<T>, AsyncReturnType<T>
泛型参数	单字母约定	T (Type), K (Key), V (Value), E (Error), R (Return)
3.3 代码组织
3.3.1 导入顺序：React/Next → 第三方库 → 内部模块 → 相对路径
强制分组与排序规则：

// 1. React/Next 核心
import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'

// 2. 第三方库
import { create } from 'zustand'
import { clsx, type ClassValue } from 'clsx'

// 3. 内部模块（@/ 别名）
import { useConversationStore } from '@/stores/conversationStore'
import { Button } from '@/components/ui/Button'

// 4. 相对路径
import { useMessageInput } from './hooks/useMessageInput'
import type { MessageInputProps } from './type'
ESLint import/order 规则自动强制执行，组内按字母序排序。
3.3.2 导出模式：命名导出优先，默认导出仅用于页面组件
场景	导出方式	说明
通用组件/工具/Hook	命名导出	export function Button()
页面组件（Next.js）	默认导出	export default function Page()
聚合模块（index.ts）	命名重新导出	export { Button } from './Button'
配置对象	默认导出	export default config
3.3.3 注释规范：JSDoc 用于公共 API，行内注释解释复杂逻辑
JSDoc 的完整要素：功能描述、@param 参数说明（含类型）、@returns 返回值、@throws 异常说明、@example 使用示例。行内注释聚焦”为什么”——设计决策、边界情况、性能考量，而非显而易见的”做什么”。
4. 组件开发规范
4.1 组件设计原则
4.1.1 单一职责：一个组件只做一件事
职责边界的量化指标与重构信号：
指标	健康阈值	超过时的重构策略
代码行数	≤ 200 行	提取子组件或自定义 Hook
Props 数量	≤ 7 个	分组为对象类型或拆分组件
独立 state 片段	≤ 3 个	使用 useReducer 或提取 Hook
useEffect 数量	≤ 2 个	提取自定义 Hook 或合并逻辑
4.1.2 props 最小化：只接收必要数据，回调函数明确命名
数据传递的优化策略：传递完整对象而非解构字段（子组件按需解构），避免传递可由子组件计算的数据，回调命名采用 on + 动词 + 名词（onMessageSend 优于 onClick）。
4.1.3 可组合性：优先组合而非继承，支持 children 透传
组合模式的实现：children 透传（容器组件）、render props（自定义渲染逻辑）、compound components（隐式状态共享，如 Select.Trigger / Select.Content）。
4.2 函数组件标准
4.2.1 类型注解：显式返回类型或 React.FC 替代方案
推荐方式（显式 Props + 推断返回）：

type ButtonProps = {
  children: React.ReactNode
  onClick?: () => void
}

function Button({ children, onClick }: ButtonProps): React.ReactElement {
  return <button onClick={onClick}>{children}</button>
}
避免 React.FC 的隐式 children，需要时显式声明。
4.2.2 Props 类型：独立 type 定义，命名 PropsType
Props 类型的位置与导出：简单组件内联定义，复杂组件同级 type.ts 文件，需要外部使用时显式导出 export type ButtonProps。
4.2.3 默认参数：解构时赋予默认值，非空断言谨慎使用

function Button({ 
  variant = 'primary',   // 解构默认值
  size = 'md',
  disabled = false,
  onClick
}: ButtonProps) { }
非空断言 ! 需配套运行时检查或注释说明理由。
4.3 状态管理规范
4.3.1 本地状态：useState/useReducer 管理 UI 状态
选择策略：独立简单状态用 useState，相关联的多字段或复杂转换用 useReducer。状态更新优先使用函数形式（setCount(c => c + 1)）避免闭包陷阱。
4.3.2 派生状态：useMemo 缓存计算，useCallback 稳定引用
useMemo 用于昂贵计算（过滤、排序、复杂对象构造），useCallback 用于传递给子组件的回调或作为其他 Hook 的依赖。依赖数组必须完整，ESLint exhaustive-deps 规则强制检查。
4.3.3 全局状态：Zustand store 按领域拆分，避免单一超大 store
Store 拆分的领域边界：用户域（useUserStore）、对话域（useConversationStore）、工作流域（useWorkflowStore）等。跨 store 通信通过订阅或组件层组合实现。
4.4 副作用处理
4.4.1 数据获取：React Query / SWR 优先，useEffect 次之
React Query 的核心优势：自动缓存、后台重新验证、乐观更新、错误重试。useEffect 中的原始 fetch 被视为技术债务，逐步迁移至 React Query。
4.4.2 订阅清理：useEffect 返回清理函数，防止内存泄漏
必须清理的资源：定时器（setInterval/setTimeout）、事件监听器（addEventListener）、WebSocket 连接、外部库实例。清理函数在组件卸载或依赖变化时执行。
4.4.3 防抖节流：自定义 useDebounce / useThrottle Hook
高频事件的优化策略：搜索输入用防抖（延迟执行，停止输入后触发），滚动/resize 用节流（固定间隔执行）。Hook 封装确保逻辑复用和测试覆盖。
5. 样式开发规范
5.1 TailwindCSS 使用
5.1.1 工具类优先：基础样式用 Tailwind，复杂样式用 CSS Modules
决策矩阵：
场景	工具	理由
布局（flex/grid/position）	Tailwind	快速、一致、响应式
间距（margin/padding）	Tailwind	设计系统 token 约束
颜色/字体	Tailwind	主题变量驱动
复杂动画/关键帧	CSS Modules	选择器灵活性
伪元素精细控制	CSS Modules	::before/::after 复杂样式
第三方组件覆盖	CSS Modules	作用域隔离，避免 !important
5.1.2 自定义配置：tailwind.config.ts 定义主题 token
核心配置项：颜色系统（品牌色、语义色、中性色阶）、间距尺度（4px 基准网格）、字体配置（字族、字号、行高、字重）、断点定义（sm/md/lg/xl/2xl）、动画预设。
5.1.3 暗色模式：class 策略，CSS 变量驱动主题切换
实现机制：darkMode: 'class' 配置，HTML 元素动态添加/移除 dark 类，CSS 变量在 :root 和 .dark 下分别定义，Tailwind dark: 变体前缀应用暗色样式。
5.2 CSS Modules 规范
5.2.1 文件命名：[name].module.css / [name].module.scss
与组件文件同名，构建时自动哈希化类名，实现作用域隔离。
5.2.2 类名命名：camelCase，语义化描述
语义化示例：.button、.buttonDisabled、.buttonLoading（描述用途/状态），避免 .blueButton、.bigButton（描述视觉）。
5.2.3 变量管理：CSS 自定义属性定义主题变量
主题变量的分层定义：基础变量（颜色原始值）、语义变量（--color-primary、 --color-background）、组件变量（--button-bg-primary）。暗色模式通过变量值切换实现，无需重复定义组件样式。
5.3 响应式设计
5.3.1 断点系统：sm/md/lg/xl/2xl 标准断点
断点	宽度	典型场景
sm	640px	大屏手机横屏
md	768px	平板竖屏
lg	1024px	小型桌面/平板横屏
xl	1280px	标准桌面
2xl	1536px	大屏桌面
5.3.2 移动优先：基础样式针对移动端，断点向上扩展

<!-- 移动优先：默认 1 列，md 2 列，lg 3 列 -->
<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
6. 类型系统规范
6.1 TypeScript 严格模式
6.1.1 配置启用：strict: true，noImplicitAny: true
tsconfig.json 核心配置项全部启用，确保类型系统的完整性。
6.1.2 禁止 any：显式 unknown 替代，类型守卫收窄
unknown 作为 any 的类型安全替代，配合类型守卫（typeof、instanceof、自定义守卫函数）或类型断言（谨慎使用）进行收窄。
6.1.3 空值处理：可选链 ?. 与非空断言 ! 区分场景
场景	推荐方式	说明
可能为空的属性访问	可选链 ?.	user?.profile?.name
确定存在的值（已校验）	非空断言 !	需注释说明
默认值提供	空值合并 ??	value ?? defaultValue
6.2 类型定义组织
6.2.1 领域类型：features/[domain]/types.ts
领域模型的类型定义集中管理，包括实体类型、值对象类型、事件类型等。
6.2.2 API 类型：services/[api]/types.ts，与后端契约对齐
请求参数、响应数据的 TypeScript 类型与后端 OpenAPI/Swagger 定义严格一致，通过代码生成工具自动同步。
6.2.3 组件类型：组件文件内定义或同级 type.ts
简单组件内联定义，复杂组件提取到同级 type.ts 文件，需要外部使用时显式导出。
7. 测试规范
7.1 测试策略
7.1.1 测试金字塔：单元测试（70%）→ 集成测试（20%）→ E2E（10%）
层级	占比	覆盖范围	工具	速度
单元测试	70%	函数、Hook、纯组件	Vitest	毫秒级
集成测试	20%	组件组合、页面交互	Vitest + RTL	秒级
E2E 测试	10%	完整用户流程	Playwright	分钟级
7.1.2 测试框架：Vitest + React Testing Library
Vitest 提供与 Vite 开发环境一致的快速测试运行，React Testing Library 强调从用户视角测试组件行为。
7.1.3 覆盖率门槛：行覆盖率 ≥ 80%，核心模块 ≥ 90%
模块类型	行覆盖率	分支覆盖率
核心工具/Hook/服务	≥ 90%	≥ 85%
业务组件	≥ 80%	≥ 75%
页面组件	≥ 60%	≥ 50%
7.2 测试编写规范
7.2.1 测试文件：与被测文件同级，命名 [name].test.ts(x)
物理位置与命名约定确保快速定位对应测试。
7.2.2 测试描述：行为驱动，描述”应该做什么”而非”如何工作”
推荐：it('should display error message when submission fails')，避免：it('calls setError when catch block executes')。
7.2.3 Mock 原则：外部依赖 mock，业务逻辑真实测试
依赖类型	Mock 策略
API 请求	MSW / 手动 mock
浏览器 API	vi.fn() / jest-dom mock
第三方库	部分 mock，保留类型
业务逻辑	不 mock，真实测试
8. 提交与版本控制
8.1 Commit Message 规范
8.1.1 格式：type(scope): subject

feat(conversation): add message streaming support
8.1.2 类型：feat/fix/docs/style/refactor/perf/test/chore
类型	用途	语义化版本
feat	新功能	MINOR
fix	缺陷修复	PATCH
docs	文档更新	-
style	代码格式	-
refactor	重构（无功能变化）	-
perf	性能优化	PATCH
test	测试相关	-
chore	构建/工具/依赖	-
8.1.3 关联需求：footer 标注关联 issue/需求编号

Fixes #456
Relates to #789
8.2 分支管理
8.2.1 分支模型：Git Flow 简化版（main/develop/feature）
分支	用途	保护规则
main	生产代码	强制 PR，2 人批准
develop	集成开发	强制 PR，CI 通过
feature/*	功能开发	合并后删除
hotfix/*	紧急修复	从 main 切出，合并至 main+develop
8.2.2 分支命名：feature/需求编号-功能描述
示例：feature/1234-message-streaming、hotfix/9012-auth-token-refresh。
8.2.3 合并策略：Squash Merge，保持主线清晰
功能分支合并时压缩为单个提交，提交信息遵循 Conventional Commits 格式。
9. 性能与质量
9.1 性能优化
9.1.1 代码分割：动态导入，路由级懒加载
Next.js 自动代码分割 + 显式 dynamic() 用于重型组件，Suspense 边界提供加载状态。
9.1.2 资源优化：图片 WebP/AVIF，字体子集化
next/image 自动格式转换和响应式尺寸，next/font 自动子集化和预加载。
9.1.3 渲染优化：React.memo/useMemo 控制重渲染
组件级：React.memo 用于纯展示组件，useMemo/useCallback 用于稳定引用。应用级：Zustand 选择器优化、React Query 缓存策略。
9.2 代码质量门禁
9.2.1 提交前：husky + lint-staged 自动检查
Git 钩子流程：ESLint 修复 → Prettier 格式化 → 类型检查 → 单元测试（相关文件）。
9.2.2 CI/CD：构建/测试/扫描流水线阻断
流水线阶段：依赖安装 → Lint → 类型检查 → 单元测试 → 构建 → E2E 测试 → 安全扫描。任一阶段失败阻断合并。
9.2.3 代码审查：强制 PR Review，至少 1 人批准
审查清单：功能正确性、架构符合性、测试覆盖、性能影响、安全考量。
10. 文档与协作
10.1 代码文档
10.1.1 README：项目结构、启动命令、环境变量
根目录 README 包含：项目简介、技术栈、快速开始、目录结构、开发指南、部署说明。
10.1.2 组件文档：复杂组件附使用说明与 props 表格
Storybook 集成：组件变体展示、交互测试、文档生成。Props 表格自动生成自 TypeScript 类型定义。
10.1.3 架构决策：ADR 记录重大技术选型
Architecture Decision Records 记录：决策背景、考虑选项、最终选择、 trade-off 分析、后续评估。
10.2 AI 协作规范
10.2.1 需求输入：明确功能描述、数据流、UI 参考
AI 提示模板：
•	功能描述：用户故事或功能目标
•	数据流：涉及的 API、状态变化、事件序列
•	UI 参考：设计稿链接或类似组件
•	边界情况：错误状态、空状态、加载状态、性能要求
10.2.2 输出验收：代码符合本规范，通过自动化检查
验收标准：ESLint 无错误、TypeScript 编译通过、测试覆盖达标、功能符合需求。
10.2.3 迭代优化：基于 Review 反馈持续 refine
迭代流程：AI 生成 → 自动检查 → 人工 Review → 结构化反馈 → AI 修改 → 验收合并。
