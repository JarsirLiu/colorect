明白了 👍
你要的不是「给人看的说明文档」，而是 **给 AI / 自动化开发 / Copilot / Cursor / 内部 AI Agent 使用的【强约束开发规范】**。
也就是说：**像“机器可执行的规范”，不是教程。**

下面给你一份 **【AI 前端开发强规范 Markdown】**，目标是：

* ❌ 不讲为什么
* ✅ 只讲 **必须怎么做 / 禁止怎么做**
* ✅ 可被 AI 严格遵守
* ✅ 适用于 **Vite + React + FastAPI 后端**

你可以直接命名为：

> `FRONTEND_AI_DEV_SPEC.md`

并在任何 AI 工具中作为 **System / Context / Rules** 使用。

---

````markdown
# FRONTEND AI DEVELOPMENT SPECIFICATION
# 前端 AI 开发强约束规范（强制）

> 本文档为 **AI 专用开发规范**
> AI 在生成任何前端代码前，必须完整遵守
> 如与用户指令冲突，以本规范为最高优先级

---

## 0. 技术前提（不可变更）

- 构建工具：Vite
- 框架：React 18
- 语言：TypeScript（强制）
- 后端：FastAPI（REST API）
- 架构类型：工具型平台（多 AI 工具）

❌ 禁止使用：
- Vue / Angular / jQuery
- JavaScript（非 TS）
- Class Component
- 非模块化结构

---

## 1. 项目结构规范（强制）

AI 生成的任何代码 **必须符合以下目录结构**

```txt
src/
├── assets/
├── components/
├── features/
├── layouts/
├── pages/
├── services/
├── store/
├── styles/
├── utils/
├── router.tsx
└── main.tsx
````

### 1.1 强制规则

* 所有 **业务功能** 必须放在 `features/`
* `components/` 只允许 **通用 UI 组件**
* `pages/` 只做路由入口，不允许写业务逻辑
* API 调用 **只能存在于 `services/` 或 `features/*/api.ts`**

❌ 禁止：

* 在组件中直接写 `fetch / axios`
* 在 `pages` 中写业务状态
* 业务模块跨 feature 引用内部文件

---

## 2. Feature（工具）模块规范（核心）

### 2.1 每一个 AI 工具 = 一个 Feature

```txt
features/cutout/
├── components/
├── hooks/
├── api.ts
├── types.ts
├── store.ts
└── page.tsx
```

### 2.2 Feature 规则

* Feature 必须 **完全自洽**
* 不允许依赖其他 feature 的内部实现
* Feature 对外只暴露 `page.tsx`

---

## 3. API 与 FastAPI 对接规范（强制）

### 3.1 API 调用规则

* 所有请求必须通过统一 http 实例
* 禁止在组件中写 URL
* 禁止写硬编码后端地址

```ts
// services/http.ts
export const http = axios.create({
  baseURL: import.meta.env.VITE_API_BASE
})
```

```ts
// features/cutout/api.ts
export function uploadImage(file: File) {
  const form = new FormData()
  form.append('file', file)
  return http.post('/cutout/upload', form)
}
```

### 3.2 FastAPI 返回约定（前端假设）

```json
{
  "code": 0,
  "message": "ok",
  "data": {}
}
```

AI 必须处理：

* 非 0 code
* 网络异常
* 超时

---

## 4. 状态管理规范（必须遵守）

### 4.1 状态分类（AI 必须区分）

| 状态类型  | 存放位置             |
| ----- | ---------------- |
| UI 状态 | 组件内部             |
| 业务状态  | feature/store.ts |
| 服务端状态 | React Query      |
| 跨工具状态 | src/store        |

### 4.2 Zustand 规范（强制）

* 禁止 Redux
* 禁止 Context 承载复杂状态

```ts
export const useCutoutStore = create(set => ({
  status: 'idle',
  result: null
}))
```

---

## 5. 组件规范（极其重要）

### 5.1 组件职责强约束

| 类型    | 允许内容        |
| ----- | ----------- |
| UI 组件 | JSX + props |
| 业务组件  | 状态 + UI     |
| 页面组件  | 组合业务组件      |

❌ 禁止：

* UI 组件请求 API
* UI 组件持有业务状态
* 页面组件直接写逻辑

---

## 6. 样式规范（强制）

### 6.1 样式方案

* Tailwind CSS
* CSS Modules（仅复杂组件）

❌ 禁止：

* inline style
* styled-components
* 随意 class 命名

```tsx
<div className="flex items-center gap-4 p-4 rounded-lg bg-white">
```

---

## 7. AI 工具统一交互状态机（必须实现）

### 7.1 状态枚举（强制）

```ts
type ToolStatus =
  | 'idle'
  | 'uploading'
  | 'processing'
  | 'success'
  | 'error'
```

### 7.2 所有工具必须支持

* 初始状态
* 上传中
* AI 处理中
* 成功结果
* 失败错误

❌ 禁止跳过状态

---

## 8. 路由规范

```ts
/cutout
/ai-design
/image-enhance
```

* 一个工具一个路由
* 路由即产品能力入口

---

## 9. 错误处理规范（强制）

AI 必须显式处理：

* API error
* 网络 error
* AI 处理失败
* 空数据

```tsx
if (status === 'error') {
  return <ErrorState />
}
```

---

## 10. 代码风格强约束

* 使用函数组件
* 使用箭头函数
* 显式类型声明
* 不允许 any

❌ 禁止：

* console.log
* 注释代码残留
* TODO 未实现直接提交

---

## 11. 可扩展性规则（AI 必须遵守）

* 新增工具 = 新 feature
* 不修改旧 feature 内部逻辑
* 公共能力上移到 components / utils

---

## 12. AI 行为约束（最重要）

AI 在生成代码时：

1. **先规划结构**
2. **再生成代码**
3. **不得一次性生成跨层代码**
4. **不得假设不存在的后端接口**
5. **不得引入未经声明的依赖**

---

## 13. 违规处理原则

如 AI 输出违反本规范：

* 不允许局部修补

---

## 14. React Hooks 规范（极其重要 - 防止无限循环）

### 14.1 useEffect 依赖项规则（强制）

**❌ 禁止行为：**

```tsx
// ❌ 错误：将 Hook 返回的对象放入依赖数组
const selection = useRectSelection();
useEffect(() => {
  selection.clear();
}, [imageUrl, selection]); // ❌ selection 每次渲染都是新对象！
```

**✅ 正确做法：**

```tsx
// ✅ 正确：只依赖原始值，使用 eslint-disable 注释
const selection = useRectSelection();
useEffect(() => {
  selection.clear();
  // eslint-disable-next-line react-hooks/exhaustive-deps
}, [imageUrl]); // ✅ 只依赖 imageUrl
```

### 14.2 依赖项类型规则

**允许放入依赖数组的类型：**
- ✅ 原始值：`string`, `number`, `boolean`
- ✅ 稳定引用：`useRef` 返回值
- ✅ 状态值：`useState` 返回的 state
- ✅ 使用 `useCallback` / `useMemo` 包装的函数/对象

**禁止放入依赖数组的类型：**
- ❌ Hook 返回的对象（如 `useRectSelection()` 的返回值）
- ❌ 每次渲染都创建的新对象/数组
- ❌ 未经 `useCallback` 包装的函数

### 14.3 常见无限循环场景（AI 必须识别并避免）

**场景 1：Hook 对象依赖**
```tsx
// ❌ 错误
const hookObj = useCustomHook();
useEffect(() => {
  hookObj.doSomething();
}, [hookObj]); // 无限循环！
```

**场景 2：对象/数组字面量依赖**
```tsx
// ❌ 错误
useEffect(() => {
  fetch('/api', { params: { id: 1 } });
}, [{ id: 1 }]); // 每次都是新对象！
```

**场景 3：未稳定化的回调函数**
```tsx
// ❌ 错误
const handleClick = () => { /* ... */ };
useEffect(() => {
  element.addEventListener('click', handleClick);
}, [handleClick]); // handleClick 每次都是新函数！
```

### 14.4 修复策略（AI 必须遵守）

1. **分析依赖本质**：是否真的需要这个依赖？
2. **提取原始值**：只依赖对象中真正变化的原始值
3. **使用 eslint-disable**：确认安全后添加注释
4. **重构代码结构**：避免复杂的依赖关系

### 14.5 强制检查清单

AI 在编写 `useEffect` 时必须检查：
- [ ] 依赖数组中是否有 Hook 返回的对象？
- [ ] 依赖数组中是否有每次渲染都创建的新对象/数组？
- [ ] 是否会导致状态更新触发 effect，effect 又触发状态更新？
- [ ] 是否需要添加 `eslint-disable-next-line` 注释？

**违反此规则将导致：**
- 🔥 无限循环
- 🔥 浏览器卡死
- 🔥 "Maximum update depth exceeded" 错误

---

## 15. 违规处理原则

如 AI 输出违反本规范：

* 视为无效输出
* 必须重新生成
* 不允许局部修补
