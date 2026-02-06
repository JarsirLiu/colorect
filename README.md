# AI 工具平台

前后端分离的 AI 工具集合平台，支持多工具集成和统一管理。

## 项目概述

本项目是一个现代化的 AI 工具平台，采用前后端分离架构：

- **后端**：基于 FastAPI 的高性能异步服务，支持多模块业务扩展
- **前端**：基于 React 18 + TypeScript + Vite 的现代化 SPA 应用

## 项目结构

```
extract/
├── api/                    # FastAPI 后端服务
│   ├── app/
│   │   ├── main.py         # 应用入口
│   │   ├── core/           # 核心配置（环境变量、日志、安全）
│   │   ├── db/             # 数据库层（SQLAlchemy + Alembic）
│   │   ├── api/            # API 路由层
│   │   ├── modules/        # 业务模块
│   │   ├── utils/          # 工具函数
│   │   └── dependencies/   # 依赖注入
│   ├── tests/              # 测试用例
│   ├── alembic/            # 数据库迁移
│   ├── tools_config/       # 工具配置文件
│   ├── requirements.txt    # Python 依赖
│   └── Dockerfile          # Docker 配置
│
└── web/                    # React 前端应用
    ├── src/
    │   ├── components/      # 通用 UI 组件
    │   ├── features/       # 业务功能模块
    │   ├── layouts/        # 页面布局
    │   ├── pages/          # 路由页面
    │   ├── services/       # API 请求封装
    │   ├── styles/         # 全局样式
    │   ├── utils/          # 工具函数
    │   ├── App.tsx         # 根组件
    │   ├── main.tsx        # 应用入口
    │   └── router.tsx      # 路由配置
    ├── package.json        # Node 依赖
    └── vite.config.ts      # Vite 配置
```

## 快速开始

### 环境要求

- Python 3.9+
- Node.js 18+
- SQLite 3+

### 后端启动

```bash
cd api

# 创建虚拟环境
uv venv --python 3.9
source .venv/bin/activate  # Windows: .venv\Scripts\activate

# 安装依赖
uv pip install -r requirements.txt -i https://pypi.tuna.tsinghua.edu.cn/simple

# 配置环境变量
cp .env.example .env

# 启动开发服务器
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

访问 API 文档：http://localhost:8000/docs

### 前端启动

```bash
cd web

# 安装依赖
npm install

# 配置环境变量
cp .env.example .env

# 启动开发服务器
npm run dev
```

访问前端应用：http://localhost:3000

## 技术栈

### 后端

| 技术 | 说明 |
|------|------|
| FastAPI | 现代化 Web 框架，高性能异步支持 |
| SQLAlchemy | Python ORM，支持异步操作 |
| aiosqlite | SQLite 异步驱动 |
| Alembic | 数据库迁移工具 |
| uvicorn | ASGI 服务器 |
| httpx | 异步 HTTP 客户端 |
| Pydantic | 数据验证和序列化 |
| pytest | 测试框架 |
| Pillow | 图像处理 |
| numpy | 数值计算 |
| onnxruntime | 模型推理 |

### 前端

| 技术 | 说明 |
|------|------|
| React 18 | 前端核心框架 |
| TypeScript | 类型安全的 JavaScript |
| Vite | 下一代前端构建工具 |
| React Router | 路由管理 |
| Tailwind CSS | 原子化 CSS 框架 |
| Axios | HTTP 请求库 |
| Zustand | 轻量级状态管理 |
| @tanstack/react-query | 服务器状态管理 |
| ESLint + Prettier | 代码规范和格式化 |

## 核心功能

### 已实现

- ✅ 智能抠图工具（一键抠图、智能框选、自由勾勒）
- ✅ 工具管理模块（配置加载、使用记录）
- ✅ API 网关（统一代理工具请求）
- ✅ 实时选区绘制（Canvas 交互）
- ✅ 图片预处理（压缩、格式转换）
- ✅ 抠图结果下载

### 规划中

- 🚧 AI 设计工具
- 🚧 图片处理工具
- 🚧 用户认证系统
- 🚧 工作历史记录
- 🚧 更多 AI 工具集成

## 开发规范

### 后端

- ✅ 使用 `APIRouter` 按模块划分路由
- ✅ Pydantic 模型分离请求和响应
- ✅ CRUD 操作封装在 `crud.py`
- ✅ 业务逻辑放在 `service.py`
- ✅ 使用 `Depends` 注入数据库会话
- ✅ 所有 API 路径使用复数名词

### 前端

- ✅ 使用函数组件 + Hooks
- ✅ 遵循 React Hooks 规范（防止无限循环）
- ✅ 组件文件使用 PascalCase 命名
- ✅ 合理拆分 UI 组件和业务组件
- ✅ 优先使用 Tailwind CSS utility classes
- ✅ 提交前必须运行 `npm run validate`

## 测试

### 后端测试

```bash
cd api
pytest
```

### 前端测试

```bash
cd web
npm run validate
```

## 文档

- [后端文档](./api/README.md)
- [前端文档](./web/README.md)
- [后端集成规范](./api/docs/INTEGRATION_SPECIFICATION.md)
- [前端开发规范](./web/dev.md)
- [前端类型检查指南](./web/TYPE_CHECK_GUIDE.md)

## 许可证

本项目采用 **Creative Commons Attribution-NonCommercial 4.0 International** 许可证。

**重要说明：**
- ✅ 允许学习、研究、个人使用
- ✅ 允许分享和修改代码
- ❌ **禁止商业用途**
- ✅ 使用时需注明出处

查看完整许可：[CC BY-NC 4.0](https://creativecommons.org/licenses/by-nc/4.0/)

## 贡献

欢迎贡献！请查看 [CONTRIBUTING.md](./CONTRIBUTING.md) 了解详情。

## 联系方式

如有问题或建议，请提交 Issue。
