# 贡献指南

感谢你对 AI 工具平台的关注！我们欢迎任何形式的贡献。

## 如何贡献

### 报告问题

如果你发现了 bug 或有功能建议，请：

1. 检查 [Issues](../../issues) 是否已存在类似问题
2. 如果不存在，创建新的 Issue，包含：
   - 清晰的标题
   - 详细的问题描述
   - 复现步骤
   - 预期行为和实际行为
   - 环境信息（操作系统、Python/Node 版本等）

### 提交代码

#### 1. Fork 本仓库

点击右上角的 Fork 按钮，将仓库 fork 到你的账号下。

#### 2. 克隆仓库

```bash
git clone https://github.com/你的用户名/extract.git
cd extract
```

#### 3. 创建特性分支

```bash
git checkout -b feature/你的特性名称
```

#### 4. 进行开发

##### 后端开发规范

- ✅ 遵循 FastAPI 最佳实践
- ✅ 使用类型注解
- ✅ 编写测试用例
- ✅ 更新相关文档
- ✅ 确保代码通过 `pytest`

##### 前端开发规范

- ✅ 遵循 React Hooks 规范
- ✅ 使用 TypeScript 类型
- ✅ 提交前运行 `npm run validate`
- ✅ 确保通过 ESLint 和类型检查
- ✅ 更新相关文档

#### 5. 提交代码

```bash
git add .
git commit -m "feat: 添加新功能描述"
```

提交信息规范：

- `feat:` 新功能
- `fix:` 修复 bug
- `docs:` 文档更新
- `style:` 代码格式调整
- `refactor:` 重构
- `test:` 测试相关
- `chore:` 构建/工具链相关

#### 6. 推送到你的 Fork

```bash
git push origin feature/你的特性名称
```

#### 7. 发起 Pull Request

1. 访问你的 Fork 仓库页面
2. 点击 "New Pull Request"
3. 填写 PR 模板
4. 等待代码审查

## 代码审查标准

所有 PR 需要通过以下检查：

### 后端

- [ ] 代码通过 `pytest` 测试
- [ ] 遵循 PEP 8 代码风格
- [ ] 添加了必要的测试用例
- [ ] 更新了相关文档
- [ ] 没有引入安全漏洞

### 前端

- [ ] 代码通过 `npm run validate`
- [ ] 没有 ESLint 警告
- [ ] 没有 TypeScript 类型错误
- [ ] 遵循 React Hooks 规范
- [ ] 更新了相关文档

## 添加新工具

### 后端

1. 在 `app/modules/` 下创建新模块目录
2. 创建 `models.py`, `schemas.py`, `crud.py`, `service.py`
3. 在 `app/api/v1/endpoints/` 下创建对应的 `api.py`
4. 在 `app/api/v1/api.py` 中注册路由
5. 编写测试用例

### 前端

1. 在 `src/features/` 下创建新 feature 目录
2. 创建 `components/`, `hooks/`, `utils/`, `api.ts`, `page.tsx`
3. 在 `src/router.tsx` 中添加路由
4. 在 `src/pages/` 中添加页面入口

## 行为准则

- 尊重所有贡献者
- 建设性反馈
- 关注问题本身，而非个人
- 遵循项目的代码规范
- 编写清晰的提交信息

## 许可证

通过贡献代码，你同意你的贡献将采用 MIT 许可证。
