# AI 工具平台 - 前端应用

基于 React 18 + TypeScript + Vite + Tailwind CSS 构建的现代化 AI 工具平台前端项目。

## 🚀 特性

- ⚡ **极速开发** - Vite 提供极快的冷启动和热更新
- 🎨 **原子化 CSS** - Tailwind CSS 快速构建现代 UI
- 📦 **类型安全** - TypeScript 全程类型检查
- 🎯 **模块化架构** - Feature-based 目录结构
- 🔌 **统一 API** - 集中式 HTTP 请求管理
- 🎭 **状态管理** - Zustand + React Query
- 🧪 **代码质量** - ESLint + Prettier + Husky
- 📱 **响应式设计** - 适配各种设备尺寸

## 📁 项目结构

```
src/
├── assets/                # 静态资源
│   ├── logo.jpg
│   └── logo.png
├── components/            # 通用 UI 组件
│   ├── Button/
│   ├── Loading/
│   ├── Navigation/
│   ├── BottomContent.tsx
│   └── ErrorBoundary.tsx
├── features/              # 业务功能模块
│   └── cutout/            # 智能抠图工具
│       ├── components/    # 业务组件
│       │   ├── editor/
│       │   ├── selection/
│       │   └── upload/
│       ├── hooks/         # 自定义 Hooks
│       │   ├── canvas/
│       │   ├── selection/
│       │   └── useCutoutOperations.ts
│       ├── utils/         # 工具函数
│       │   ├── canvas/
│       │   └── image/
│       ├── api.ts         # API 接口
│       ├── types.ts       # 类型定义
│       ├── page.tsx       # 页面入口
│       └── page.module.css
├── layouts/               # 页面布局
│   └── Layout.tsx
├── pages/                 # 路由页面
│   ├── Home.tsx
│   └── index.ts
├── services/              # 后端 API 统一封装
│   ├── http.ts
│   └── index.ts
├── store/                 # 全局状态管理
│   ├── appStore.ts
│   ├── toolStore.ts
│   └── index.ts
├── styles/                # 全局样式
│   └── index.css
├── types/                 # 全局类型定义
│   ├── api.ts
│   └── index.ts
├── utils/                 # 通用工具函数
│   ├── cn.ts
│   ├── file.ts
│   └── index.ts
├── main.tsx               # 应用入口
└── router.tsx             # 路由配置
```

## 🛠 技术栈

| 技术 | 版本 | 说明 |
|------|------|------|
| React | 18.3.1 | 前端核心框架 |
| TypeScript | 5.6.2 | 类型安全的 JavaScript |
| Vite | 6.0.7 | 下一代前端构建工具 |
| React Router | 7.1.3 | 路由管理 |
| Tailwind CSS | 3.4.17 | 原子化 CSS 框架 |
| Axios | 1.7.9 | HTTP 请求库 |
| Zustand | 5.0.2 | 轻量级状态管理 |
| @tanstack/react-query | 5.62.7 | 服务器状态管理 |
| clsx | 2.1.0 | 条件类名工具 |
| tailwind-merge | 2.2.0 | Tailwind 类名合并 |
| ESLint | 9.18.0 | 代码规范检查 |
| Prettier | 3.4.2 | 代码格式化 |

## 🚀 快速开始

### 1. 安装依赖

```bash
npm install
```

### 2. 配置环境变量

```bash
cp .env.example .env
```

编辑 `.env` 文件：

```env
VITE_API_BASE_URL=http://localhost:8000/api/v1
```

### 3. 启动开发服务器

```bash
npm run dev
```

访问 `http://localhost:3000` 查看应用。

### 4. 构建生产版本

```bash
npm run build
```

### 5. 预览生产构建

```bash
npm run preview
```

## 📦 可用脚本

| 命令 | 说明 |
|---|---|
| `npm run dev` | 启动开发服务器 |
| `npm run build` | 构建生产版本 |
| `npm run preview` | 预览生产构建 |
| `npm run lint` | 运行 ESLint 检查 |
| `npm run lint:fix` | 自动修复 ESLint 问题 |
| `npm run type-check` | 运行 TypeScript 类型检查 |
| `npm run type-check:watch` | 持续监听类型错误 |
| `npm run validate` | **提交前必须运行：类型检查 + 代码规范** |
| `npm run format` | 使用 Prettier 格式化代码 |

## ⚠️ 提交代码前必做

**在提交代码前，务必运行以下命令确保代码质量：**

```bash
npm run validate
```

此命令会：
1. ✅ 检查所有 TypeScript 类型错误
2. ✅ 检查所有 ESLint 代码规范问题
3. ✅ 检查 React Hooks 规则（防止无限循环）

**如果有任何错误，禁止提交代码！**

### 推荐的开发工作流

**双终端模式（推荐）：**

终端 1 - 开发服务器：
```bash
npm run dev
```

终端 2 - 类型检查监听：
```bash
npm run type-check:watch
```

这样可以实时发现类型错误，不需要等到运行时！

## 📝 开发规范

### 1. 代码风格

- 使用 ESLint + Prettier 保持代码风格统一
- 使用 TypeScript 进行类型检查
- 遵循 React Hooks 规范
- 提交前必须运行 `npm run validate`

### 2. 组件开发

- 组件文件使用 PascalCase 命名
- 使用函数组件 + Hooks
- 合理拆分 UI 组件和业务组件
- 避免组件过大，保持单一职责

### 3. 状态管理

| 状态类型 | 存放位置 | 说明 |
|---|---|---|
| UI 状态 | 组件内部 | 表单输入、开关状态等 |
| 业务状态 | feature/store.ts | 跨组件的业务状态 |
| 服务端状态 | React Query | 从 API 获取的数据 |
| 跨工具状态 | src/store | 全局共享状态 |

### 4. 样式

- 优先使用 Tailwind CSS utility classes
- 避免内联样式
- 避免随意自定义 class 名称
- 复杂组件使用 CSS Modules

### 5. React Hooks 规范（极其重要）

**❌ 禁止将 Hook 返回的对象放入依赖数组：**

```tsx
// ❌ 错误：会导致无限循环
const selection = useRectSelection();
useEffect(() => {
  selection.clear();
}, [selection]); // selection 每次渲染都是新对象！
```

**✅ 正确做法：**

```tsx
// ✅ 正确：只依赖原始值
const selection = useRectSelection();
useEffect(() => {
  selection.clear();
  // eslint-disable-next-line react-hooks/exhaustive-deps
}, [imageUrl]); // 只依赖 imageUrl
```

**允许放入依赖数组的类型：**
- ✅ 原始值：`string`, `number`, `boolean`
- ✅ 稳定引用：`useRef` 返回值
- ✅ 状态值：`useState` 返回的 state
- ✅ 使用 `useCallback` / `useMemo` 包装的函数/对象

**禁止放入依赖数组的类型：**
- ❌ Hook 返回的对象
- ❌ 每次渲染都创建的新对象/数组
- ❌ 未经 `useCallback` 包装的函数

## 🔌 API 对接

所有 API 请求统一通过 `services/http.ts` 封装的 axios 实例。

### 使用示例

```typescript
import { http } from '@/services/http'

export const uploadImage = async (file: File): Promise<Blob> => {
  const form = new FormData()
  form.append('file', file)

  return await http.post('/cutout/segment', form, {
    responseType: 'blob',
    headers: {
      'Accept': 'image/png'
    }
  })
}
```

### API 基础 URL

通过环境变量配置：

```env
VITE_API_BASE_URL=http://localhost:8000/api/v1
```

## 🎯 功能模块

### 智能抠图 (`/cutout`)

- 支持图片上传（拖拽/点击选择/粘贴）
- 三种抠图模式：一键抠图、智能框选、自由勾勒
- Canvas 实时选区绘制
- AI 处理状态展示
- 抠图结果对比展示
- 图片下载功能

### 首页 (`/`)

- 工具导航
- 工具卡片展示
- 快速入口

## 🚧 待开发功能

- [ ] AI 设计工具
- [ ] 图片处理工具
- [ ] 用户认证系统
- [ ] 工作历史记录
- [ ] 更多 AI 工具集成

## 📚 相关文档

- [前端开发规范](./dev.md)
- [类型检查指南](./TYPE_CHECK_GUIDE.md)
- [后端文档](../api/README.md)
- [项目根目录 README](../README.md)

## 🔧 配置文件

### TypeScript 配置

`tsconfig.json` - TypeScript 编译配置

```json
{
  "compilerOptions": {
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true
  }
}
```

### Tailwind 配置

`tailwind.config.js` - Tailwind CSS 配置

### ESLint 配置

`eslint.config.js` - ESLint 规则配置

### Vite 配置

`vite.config.ts` - Vite 构建配置

## 🎓 最佳实践

1. **开发时始终开启类型检查监听**
   ```bash
   npm run type-check:watch
   ```

2. **提交前运行完整验证**
   ```bash
   npm run validate
   ```

3. **不要忽略类型错误**
   - 不要使用 `any` 类型
   - 不要使用 `@ts-ignore`
   - 正确定义类型

4. **利用 IDE 提示**
   - VSCode 会实时显示类型错误
   - 鼠标悬停查看类型定义
   - 使用自动补全

5. **遵循 Feature-based 架构**
   - 每个 AI 工具独立为一个 feature
   - Feature 内部完全自洽
   - 不跨 feature 引用内部文件

## 🐛 常见问题

### 1. 类型错误：`Property 'xxx' does not exist on type '...'`

**原因**：类型定义不完整或类型推断错误

**解决**：
- 检查类型定义是否正确
- 使用类型断言（谨慎使用）
- 扩展接口定义

### 2. Hook 依赖项警告

**原因**：依赖数组中包含了不稳定的引用

**解决**：
- 只依赖原始值
- 使用 `useCallback` / `useMemo` 稳定化
- 添加 `eslint-disable` 注释（确认安全后）

### 3. FormData 上传失败

**原因**：Content-Type 被错误设置

**解决**：
- 在 http.ts 拦截器中处理 FormData
- 删除 FormData 的 Content-Type header

## 📖 参考资料

- [React 官方文档](https://react.dev/)
- [Vite 官方文档](https://vitejs.dev/)
- [Tailwind CSS 文档](https://tailwindcss.com/)
- [Zustand 文档](https://zustand-demo.pmnd.rs/)
- [React Query 文档](https://tanstack.com/query/latest)
- [TypeScript 官方文档](https://www.typescriptlang.org/)
