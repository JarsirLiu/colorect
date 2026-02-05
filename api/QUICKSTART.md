# 快速开始指南

## 📦 项目结构

```
center_api/
├── app/
│   ├── main.py              # FastAPI 应用入口
│   ├── core/                # 核心配置
│   ├── db/                  # 数据库连接
│   ├── utils/               # 工具函数
│   ├── dependencies/         # 依赖注入
│   ├── api/                 # API 路由层（分版本管理）
│   │   └── v1/
│   │       ├── api.py       # 汇总所有路由
│   │       └── endpoints/   # 具体端点
│   └── modules/             # 业务模块（独立闭环）
│       └── tools/          # 工具管理模块
│           ├── api.py
│           ├── crud.py
│           ├── models.py
│           ├── schemas.py
│           └── service.py
├── tests/                   # 测试用例
├── alembic/                 # 数据库迁移
├── requirements.txt         # Python 依赖
├── Dockerfile              # Docker 配置
└── .env.example            # 环境变量示例
```

## 🚀 本地开发

### 1. 安装依赖

```bash
cd center_api

# 使用 uv 创建虚拟环境（推荐）
uv venv --python 3.9

# 激活虚拟环境
# Windows
.venv\Scripts\activate
# Linux/Mac
source .venv/bin/activate

# 安装依赖
uv pip install -r requirements.txt
```

### 2. 配置环境变量

```bash
# 复制环境变量示例文件
cp .env.example .env

# 编辑 .env 文件
nano .env  # Linux/Mac
# 或
notepad .env  # Windows
```

推荐的 `.env` 配置：

```env
HOST=0.0.0.0
PORT=8000
WORKERS=4
DATABASE_URL=sqlite+aiosqlite:///./data/app.db
CORS_ORIGINS=*
CORS_ALLOW_CREDENTIALS=true
TOOLS_CONFIG_PATH=../center_control/tools_config
LOG_LEVEL=INFO
```

### 3. 启动服务

```bash
# 使用 uvicorn 直接启动
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload

# 或使用 Python 启动
python -m app.main
```

### 4. 访问 API 文档

- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

## 🐳 Docker 部署

### 1. 构建镜像

```bash
docker build -t center-api .
```

### 2. 运行容器

```bash
docker run -d \
  -p 8000:8000 \
  -v $(pwd)/data:/app/data \
  -e TOOLS_CONFIG_PATH=../center_control/tools_config \
  --name center-api \
  center-api
```

### 3. 查看日志

```bash
docker logs -f center-api
```

## 📡 API 接口测试

### 1. 健康检查

```bash
curl http://localhost:8000/health
```

### 2. 获取工具列表

```bash
curl http://localhost:8000/api/v1/tools
```

### 3. 获取工具详情

```bash
curl http://localhost:8000/api/v1/tools/remove-bg
```

### 4. 记录工具使用

```bash
curl -X POST http://localhost:8000/api/v1/tools/record \
  -H "Content-Type: application/json" \
  -d '{
    "tool_id": "remove-bg",
    "tool_name": "智能抠图",
    "anonymous_id": "user-123"
  }'
```

### 5. 获取使用记录

```bash
curl "http://localhost:8000/api/v1/tools/usage/list?tool_id=remove-bg&limit=10"
```

## 🔧 集成到 Docker Compose

在项目根目录的 `docker-compose.yml` 中：

```yaml
services:
  # Center API 核心服务
  center-api:
    build: ./center_api
    ports:
      - "8000:8000"
    volumes:
      - ./center_api/data:/app/data
      - ./center_control/tools_config:/app/tools_config:ro
    environment:
      - TOOLS_CONFIG_PATH=/app/tools_config
      - LOG_LEVEL=INFO
    restart: unless-stopped
    networks:
      - platform-network

networks:
  platform-network:
    driver: bridge
```

## 🧪 运行测试

```bash
# 运行所有测试
pytest

# 运行特定测试文件
pytest tests/test_api.py

# 显示详细输出
pytest -v

# 生成覆盖率报告
pytest --cov=app --cov-report=html
```

## 🔧 数据库迁移

### 初始化数据库

首次运行时，数据库会自动创建。如果需要使用 Alembic：

```bash
# 初始化 Alembic（首次）
alembic init alembic

# 生成迁移脚本
alembic revision --autogenerate -m "初始化数据库"

# 执行迁移
alembic upgrade head
```

### 回滚迁移

```bash
# 回滚一步
alembic downgrade -1

# 回滚到特定版本
alembic downgrade <revision_id>
```

## 📝 开发规范

### 1. 添加新模块

在 `app/modules/` 下创建新模块：

```
app/modules/new_module/
├── __init__.py
├── models.py      # ORM 模型
├── schemas.py     # Pydantic 模型
├── crud.py        # CRUD 操作
├── service.py     # 业务逻辑
└── api.py        # 路由定义
```

### 2. 添加新端点

在 `app/api/v1/endpoints/` 下创建新的端点文件：

```python
from fastapi import APIRouter, Depends
from app.dependencies.deps import get_db
from sqlalchemy.ext.asyncio import AsyncSession

router = APIRouter()

@router.get("/new-endpoint")
async def new_endpoint(db: AsyncSession = Depends(get_db)):
    return {"message": "Hello"}
```

然后在 `app/api/v1/api.py` 中注册：

```python
from app.api.v1.endpoints import new_endpoint

api_router.include_router(new_endpoint.router, prefix="/new-endpoint", tags=["新模块"])
```

### 3. 数据库操作

在 `crud.py` 中封装数据库操作：

```python
class NewModuleCRUD:
    async def create(self, db: AsyncSession, **kwargs):
        db_obj = NewModel(**kwargs)
        db.add(db_obj)
        await db.flush()
        return db_obj
```

### 4. Pydantic 模型

在 `schemas.py` 中定义请求和响应模型：

```python
class NewModelCreate(BaseModel):
    name: str

class NewModelResponse(BaseModel):
    id: int
    name: str

    class Config:
        from_attributes = True
```

## 🐛 常见问题

### Q: 启动时提示数据库错误？

A: 检查 `data/` 目录是否有写入权限：
```bash
chmod -R 755 data  # Linux/Mac
```

### Q: 找不到工具配置？

A: 确认 `.env` 中的 `TOOLS_CONFIG_PATH` 路径正确：
```bash
docker-compose exec center-api ls /app/tools_config
```

### Q: API 响应慢？

A: 检查工具后端服务状态，或调整 `WORKERS` 数量：
```env
WORKERS=2  # 根据CPU核心数调整
```

## 📈 性能优化建议

1. **生产环境配置**：
   ```env
   LOG_LEVEL=WARNING
   WORKERS=4  # 根据 CPU 核心数调整
   ```

2. **数据库优化**：
   - 生产环境使用 PostgreSQL 替代 SQLite
   - 为常用查询字段添加索引

3. **Nginx 反向代理**：
   ```nginx
   upstream center_api {
       least_conn;
       server center-api:8000 max_fails=3 fail_timeout=30s;
   }
   ```

## 📞 技术支持

遇到问题？
1. 检查日志：`tail -f logs/app.log`
2. 查看 API 文档：http://localhost:8000/docs
3. 运行测试：`pytest`
