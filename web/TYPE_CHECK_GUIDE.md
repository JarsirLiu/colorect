# TypeScript 类型检查与验证指南

## 🎯 目标

**在启动时自动检查类型错误，而不是运行时才发现问题**

---

## 📋 可用的检查命令

### 1. 类型检查（TypeScript）

```bash
# 一次性检查所有类型错误
npm run type-check

# 持续监听模式（推荐开发时使用）
npm run type-check:watch
```

**作用：**
- 检查所有 `.ts` 和 `.tsx` 文件的类型错误
- 不生成编译文件（`--noEmit`）
- 发现未使用的变量、参数等

### 2. 代码规范检查（ESLint）

```bash
# 检查代码规范
npm run lint

# 自动修复可修复的问题
npm run lint:fix
```

**作用：**
- 检查代码风格问题
- 检查 React Hooks 规则（防止无限循环）
- 检查潜在的 bug

### 3. 完整验证（推荐）

```bash
# 同时运行类型检查和代码规范检查
npm run validate
```

**作用：**
- 一次性运行所有检查
- 适合提交代码前使用

---

## 🚀 推荐的开发工作流

### 方案 1：双终端模式（推荐）

**终端 1 - 开发服务器：**
```bash
npm run dev
```

**终端 2 - 类型检查监听：**
```bash
npm run type-check:watch
```

**优点：**
- 实时发现类型错误
- 不影响开发服务器性能
- 错误立即可见

### 方案 2：提交前验证

在提交代码前手动运行：
```bash
npm run validate
```

如果有错误，**禁止提交**。

---

## 🔧 自动化配置（可选）

### 使用 Git Hooks 自动检查

如果想要在 `git commit` 时自动检查，可以安装：

```bash
npm install --save-dev husky lint-staged
```

然后配置 `package.json`：

```json
{
  "lint-staged": {
    "*.{ts,tsx}": [
      "eslint --fix",
      "tsc --noEmit"
    ]
  }
}
```

**注意：** 这会让提交变慢，但能保证代码质量。

---

## 📊 TypeScript 严格模式说明

当前 `tsconfig.json` 已启用严格模式：

```json
{
  "strict": true,                      // 启用所有严格检查
  "noUnusedLocals": true,              // 禁止未使用的局部变量
  "noUnusedParameters": true,          // 禁止未使用的参数
  "noFallthroughCasesInSwitch": true   // 禁止 switch 穿透
}
```

**这意味着：**
- ❌ 不允许隐式 `any` 类型
- ❌ 不允许 `null` 和 `undefined` 混用
- ❌ 不允许未使用的变量
- ✅ 强制类型安全

---

## 🐛 常见类型错误及修复

### 1. FormData 类型问题

**错误：**
```tsx
const form = new FormData()
form.append('file', file)
// ❌ Content-Type 被错误设置
```

**修复：**
```tsx
// 在 http.ts 拦截器中处理
if (config.data instanceof FormData) {
  delete config.headers['Content-Type']
}
```

### 2. Hook 依赖项问题

**错误：**
```tsx
const selection = useRectSelection()
useEffect(() => {
  selection.clear()
}, [selection]) // ❌ 无限循环
```

**修复：**
```tsx
useEffect(() => {
  selection.clear()
  // eslint-disable-next-line react-hooks/exhaustive-deps
}, [imageUrl]) // ✅ 只依赖原始值
```

### 3. Axios 响应类型

**错误：**
```tsx
const blob = await uploadImage(file) as Blob // ❌ 类型不兼容
```

**修复：**
```tsx
const blob = await uploadImage(file) as unknown as Blob // ✅ 双重断言
```

---

## ✅ 检查清单

开发新功能时，请确保：

- [ ] 运行 `npm run type-check` 无错误
- [ ] 运行 `npm run lint` 无警告
- [ ] 浏览器控制台无错误
- [ ] 没有 `console.log` 残留
- [ ] 没有 `@ts-ignore` 注释（除非必要）

---

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

---

## 🔍 IDE 配置（VSCode）

确保安装以下扩展：

1. **ESLint** - 代码规范检查
2. **TypeScript Vue Plugin (Volar)** - TypeScript 支持
3. **Prettier** - 代码格式化

在 `.vscode/settings.json` 中配置：

```json
{
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
  "typescript.tsdk": "node_modules/typescript/lib",
  "typescript.enablePromptUseWorkspaceTsdk": true
}
```

---

## 📚 相关文档

- [TypeScript 官方文档](https://www.typescriptlang.org/)
- [ESLint 规则](https://eslint.org/docs/rules/)
- [React Hooks 规则](https://react.dev/reference/react/hooks#rules-of-hooks)

---

**记住：类型检查不是负担，而是保护！**
