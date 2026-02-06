# AI 工具平台 - 后端 API

基于 FastAPI 的高性能异步后端服务，采用企业级架构设计，支持多模块业务扩展。

## 🚀 特性

- ⚡ **高性能异步** - 基于 FastAPI + uvicorn，充分利用多核 CPU
- 🔌 **API 网关** - 统一代理工具请求，支持负载均衡
- 📦 **模块化架构** - 支持业务模块独立开发和部署
- 🎯 **企业级规范** - 遵循 FastAPI 最佳实践
- 🐳 **Docker 支持** - 开箱即用的 Docker 配置
- 📝 **完整文档** - Swagger UI + ReDoc
- 🖼️ **图像处理** - 集成 Pillow + numpy + onnxruntime
- 🔄 **数据库迁移** - Alembic 自动化迁移

## 📁 项目结构

```
api/
├── app/
│   ├── main.py              # 程序入口
│   ├── core/                # 核心配置
│   │   ├── config.py        # 环境变量配置
│   │   ├── security.py      # JWT/加密
│   │   └── logging.py       # 日志配置
│   ├── db/                  # 数据库
│   │   ├── base.py          # Base 类
│   │   ├── session.py       # Session 管理
│   │   └── init_db.py       # 初始化数据库
│   ├── utils/               # 工具函数
│   │   └── http_client.py   # HTTP 客户端
│   ├── dependencies/        # 依赖注入
│   │   └── deps.py          # 通用依赖
│   ├── api/                 # API 路由层
│   │   └── v1/
│   │       ├── api.py       # 路由汇总
│   │       └── endpoints/   # 端点
│   │           ├── tools.py # 工具管理
│   │           └── proxy.py # API 网关
│   └── modules/             # 业务模块（独立闭环）
│       ├── tools/           # 工具管理模块
│       │   ├── api.py
│       │   ├── crud.py
│       │   ├── models.py
│       │   ├── schemas.py
│       │   └── service.py
│       └── cutout/          # 抠图模块
│           ├── router.py
│           ├── schemas.py
│           └── service.py
├── tests/                   # 测试用例
├── alembic/                 # 数据库迁移
├── docs/                    # 文档
│   └── INTEGRATION_SPECIFICATION.md
├── tools_config/            # 工具配置文件
│   └── remove-bg.json
├── .env.example             # 环境变量示例
├── Dockerfile               # Docker 配置
└── requirements.txt         # 依赖清单
```

## 🛠️ 技术栈

| 技术 | 版本 | 说明 |
|------|------|------|
| FastAPI | 0.128.1 | 现代化 Web 框架 |
| uvicorn | 0.39.0 | ASGI 服务器 |
| SQLAlchemy | 2.0.46 | 异步 ORM |
| aiosqlite | 0.22.1 | SQLite 异步驱动 |
| Alembic | 1.16.5 | 数据库迁移 |
| httpx | 0.28.1 | 异步 HTTP 客户端 |
| pydantic | 2.12.5 | 数据验证 |
| pytest | 8.4.2 | 测试框架 |
| Pillow | 11.3.0 | 图像处理 |
| numpy | 2.0.2 | 数值计算 |
| onnxruntime | 1.19.2 | 模型推理 |

## 🚀 快速开始

### 本地开发

```bash
# 安装依赖
cd api
uv venv --python 3.9
source .venv/bin/activate  # Windows: .venv\Scripts\activate
uv pip install -r requirements.txt -i https://pypi.tuna.tsinghua.edu.cn/simple

# 配置环境变量
cp .env.example .env

# 启动服务
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload

# 生产启动
uvicorn app.main:app --host 0.0.0.0 --port 8000 --workers 4
```

### Docker 部署

```bash
# 构建镜像
docker build -t ai-tools-api .

# 运行容器
docker run -d -p 8000:8000 --name ai-tools-api ai-tools-api
```

## 📡 API 文档

- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

## 📡 API 接口

### 工具管理
- `GET /api/v1/tools` - 获取所有工具列表
- `GET /api/v1/tools/{tool_id}` - 获取工具详情
- `POST /api/v1/tools/refresh` - 刷新工具缓存
- `POST /api/v1/tools/record` - 记录工具使用
- `GET /api/v1/tools/usage/list` - 获取使用记录

### 抠图功能
- `POST /api/v1/cutout/segment` - 图像分割
- `GET /api/v1/cutout/health` - 健康检查

### API 网关
- `ALL /api/v1/proxy/{tool_id}/{path:path}` - 代理到工具服务

## 🧪 测试

```bash
# 运行测试
pytest

# 运行测试并生成覆盖率报告
pytest --cov=app --cov-report=html
```

## 🔧 数据库迁移

```bash
# 生成迁移脚本
alembic revision --autogenerate -m "描述"

# 执行迁移
alembic upgrade head

# 回滚迁移
alembic downgrade -1
```

## 🎯 模块开发规范

### 添加新模块

1. 在 `app/modules/` 下创建新模块目录
2. 创建 `models.py`, `schemas.py`, `crud.py`, `service.py`, `router.py`
3. 在 `app/api/v1/endpoints/` 下创建对应的 `api.py`
4. 在 `app/api/v1/api.py` 中注册路由

### 目录结构规范

每个工具模块包含以下文件：
- `__init__.py` - 模块导出
- `models.py` - SQLAlchemy 模型
- `schemas.py` - Pydantic 请求/响应模型
- `crud.py` - 数据库操作
- `service.py` - 业务逻辑
- `router.py` - FastAPI 路由

### 命名规范

| 类型 | 命名规则 | 示例 |
|------|----------|------|
| 模块目录 | `snake_case` | `cutout`, `tools` |
| 路由文件 | `router.py` | `app/modules/cutout/router.py` |
| 服务文件 | `service.py` | `app/modules/cutout/service.py` |
| Pydantic 模型 | `schemas.py` | `app/modules/cutout/schemas.py` |
| 类名 | `PascalCase` | `CutoutService` |
| 函数/变量 | `snake_case` | `process_image` |
| 常量 | `UPPER_SNAKE_CASE` | `DEFAULT_SIZE` |

## 📝 开发规范

- ✅ 使用 `APIRouter` 按模块划分路由
- ✅ Pydantic 模型分离请求和响应
- ✅ CRUD 操作封装在 `crud.py`
- ✅ 业务逻辑放在 `service.py`
- ✅ 使用 `Depends` 注入数据库会话
- ✅ 所有 API 路径使用复数名词
- ✅ 异步函数使用 `async/await`
- ✅ 使用类型注解

## 📈 性能

- QPS: 800+
- 内存占用: ~300MB
- 响应时间: <50ms

## 📚 相关文档

- [集成开发规范](./docs/INTEGRATION_SPECIFICATION.md)
- [前端文档](../web/README.md)
- [项目根目录 README](../README.md)

## 🔐 环境变量

```env
# 数据库
DATABASE_URL=sqlite+aiosqlite:///./app.db

# API 配置
API_HOST=0.0.0.0
API_PORT=8000
API_RELOAD=true

# 日志
LOG_LEVEL=INFO

# 抠图配置
CUTOUT_MODEL_PATH=data/models/model.onnx
CUTOUT_DEFAULT_SIZE=1024
CUTOUT_MAX_SIZE=2048
CUTOUT_MAX_FILE_SIZE=10
```

## 🚧 待开发功能

- [ ] 用户认证系统（JWT）
- [ ] 权限管理
- [ ] 请求限流
- [ ] 缓存优化
- [ ] 更多 AI 工具集成
