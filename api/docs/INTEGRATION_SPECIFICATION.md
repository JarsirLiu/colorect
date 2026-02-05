# Center API 抠图功能集成开发规范

## 1. 项目背景

将抠图功能从代理模式改为直接集成模式，简化架构：
- **当前**：Frontend → Center API → Proxy → Remove-BG Backend
- **目标**：Frontend → Center API → Model

## 2. 项目结构

```
center_api/
├── app/
│   ├── main.py                      # 应用入口
│   ├── core/                        # 核心配置
│   │   ├── config.py                # 环境变量
│   │   ├── security.py              # 安全工具
│   │   └── logging.py               # 日志配置
│   ├── db/                          # 数据库模块
│   ├── api/                         # API 路由层
│   │   └── v1/
│   │       ├── api.py               # 路由汇总
│   │       └── endpoints/           # 具体端点
│   │           ├── tools.py         # 工具管理
│   │           ├── cutout.py        # ⭐ 抠图端点（新增）
│   │           └── proxy.py         # 代理端点（保留）
│   └── modules/                     # 业务模块
│       ├── tools/                   # 工具管理
│       └── cutout/                  # ⭐ 抠图模块（新增）
│           ├── __init__.py
│           ├── schemas.py           # Pydantic 模型
│           ├── service.py           # 业务逻辑
│           └── router.py            # 路由定义
├── data/
│   └── models/                      # 模型文件
│       └── model.onnx               # RMBG 1.4 模型
└── requirements.txt
```

## 3. 目录规范

### 3.1 模块目录

每个工具模块包含 4 个核心文件：
- `__init__.py` - 模块导出
- `schemas.py` - Pydantic 请求/响应模型
- `service.py` - 业务逻辑
- `router.py` - FastAPI 路由

### 3.2 文件命名

| 文件 | 命名规则 | 示例 |
|------|----------|------|
| 模块目录 | `snake_case` | `cutout`, `tools` |
| 路由文件 | `router.py` | `app/modules/cutout/router.py` |
| 服务文件 | `service.py` | `app/modules/cutout/service.py` |
| Pydantic 模型 | `schemas.py` | `app/modules/cutout/schemas.py` |

### 3.3 命名规范

- 类名：`PascalCase`
- 函数/变量：`snake_case`
- 常量：`UPPER_SNAKE_CASE`

## 4. 代码规范

### 4.1 服务层 (service.py)

```python
# 文件：app/modules/cutout/service.py

from typing import Optional
from pathlib import Path
import logging

from PIL import Image
import numpy as np
import onnxruntime as ort

logger = logging.getLogger(__name__)


class CutoutService:
    """抠图服务类"""
    
    MODEL_PATH = Path(__file__).parent.parent.parent / "data" / "models" / "model.onnx"
    DEFAULT_SIZE = 1024
    
    def __init__(self):
        self._session: Optional[ort.InferenceSession] = None
    
    async def initialize(self) -> None:
        """初始化模型"""
        if self._session is None:
            self._session = ort.InferenceSession(str(self.MODEL_PATH))
    
    async def process(self, image: Image.Image) -> Image.Image:
        """处理图像"""
        await self.initialize()
        # 处理逻辑
        return image
    
    async def cleanup(self) -> None:
        """清理资源"""
        self._session = None
```

### 4.2 路由层 (router.py)

```python
# 文件：app/modules/cutout/router.py

from fastapi import APIRouter, UploadFile, File, HTTPException
from fastapi.responses import StreamingResponse
from PIL import Image
import io

from app.modules.cutout.service import CutoutService

router = APIRouter(prefix="/cutout", tags=["抠图工具"])


@router.post("/segment")
async def segment_image(file: UploadFile = File(...)):
    """图像分割接口"""
    # 1. 验证文件类型
    if not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="只支持图片文件")
    
    # 2. 读取图片
    contents = await file.read()
    image = Image.open(io.BytesIO(contents))
    
    # 3. 处理
    service = CutoutService()
    result = await service.process(image)
    
    # 4. 返回结果
    buffer = io.BytesIO()
    result.save(buffer, format="PNG")
    buffer.seek(0)
    
    return StreamingResponse(buffer, media_type="image/png")
```

### 4.3 Pydantic 模型 (schemas.py)

```python
# 文件：app/modules/cutout/schemas.py

from pydantic import BaseModel, Field


class CutoutResponse(BaseModel):
    """抠图响应模型"""
    status: str = Field(..., description="服务状态")
    model_loaded: bool = Field(..., description="模型是否已加载")


class CutoutErrorResponse(BaseModel):
    """错误响应模型"""
    success: bool = False
    error: str = Field(..., description="错误信息")
```

### 4.4 模块导出 (__init__.py)

```python
# 文件：app/modules/cutout/__init__.py

from app.modules.cutout.service import CutoutService
from app.modules.cutout.router import router

__all__ = ["CutoutService", "router"]
```

## 5. API 接口设计

### 5.1 接口清单

| 方法 | 路径 | 描述 |
|------|------|------|
| POST | `/api/v1/cutout/segment` | 图像分割 |
| GET | `/api/v1/cutout/health` | 健康检查 |

### 5.2 请求/响应

**POST** `/api/v1/cutout/segment`

- **请求**：`multipart/form-data`，包含 `file` 字段
- **响应**：PNG 图片流
- **错误**：JSON 格式错误信息

## 6. 依赖管理

### 6.1 新增依赖

```txt
# requirements.txt 新增
pillow>=10.0.0
numpy>=1.24.0
onnxruntime>=1.15.0
```

### 6.2 安装

```bash
cd center_api
.venv\Scripts\activate
pip install -r requirements.txt
```

## 7. 配置管理

### 7.1 环境变量

```env
# .env
CUTOUT_MODEL_PATH=data/models/model.onnx
CUTOUT_DEFAULT_SIZE=1024
CUTOUT_MAX_SIZE=2048
CUTOUT_MAX_FILE_SIZE=10
```

### 7.2 模型文件

将 `tools/remove-bg-tool/backend/models/model.onnx` 复制到：
```
center_api/data/models/model.onnx
```

## 8. 前端适配

修改 `frontend/src/features/cutout/api.ts`：

```typescript
export const uploadImage = (file: File) => {
  const form = new FormData()
  form.append('file', file)
  return http.post('/cutout/segment', form, {  // 修改路径
    responseType: 'blob',
  })
}
```

## 9. Docker 部署

### 9.1 docker-compose.yml

```yaml
services:
  center-api:
    build: ./center_api
    volumes:
      - ./center_api/data:/app/data  # 挂载模型目录
    # 移除 remove-bg-tool 相关服务
```

### 9.2 Dockerfile

```dockerfile
# 复制模型文件
COPY ./data/models/ /app/data/models/
RUN chmod -R 755 /app/data/models/
```

## 10. 可扩展性设计

### 10.1 设计原则

- **模块独立**：每个工具独立目录，互不影响
- **统一接口**：遵循相同的服务和路由模式
- **配置驱动**：通过配置文件管理工具启用/禁用

### 10.2 添加新工具

1. 在 `app/modules/` 下创建新目录
2. 创建 `service.py`、`router.py`、`schemas.py`
3. 注册到 `app/api/v1/api.py`

### 10.3 工具配置

```json
// tools_config/{tool_id}.json
{
  "id": "tool_id",
  "name": "工具名称",
  "enabled": true
}
```

## 11. 迁移检查清单

- [ ] 1. 添加依赖到 `requirements.txt`
- [ ] 2. 复制模型文件到 `data/models/`
- [ ] 3. 创建 `app/modules/cutout/` 目录结构
- [ ] 4. 实现 `service.py`
- [ ] 5. 实现 `router.py`
- [ ] 6. 实现 `schemas.py`
- [ ] 7. 注册路由到 `api/v1/api.py`
- [ ] 8. 修改前端 API 路径
- [ ] 9. 更新 docker-compose.yml
- [ ] 10. 测试验证

## 12. 风险与应对

| 风险 | 级别 | 应对 |
|------|------|------|
| 模型加载失败 | 中 | 添加详细日志和健康检查 |
| 大文件超时 | 中 | 添加文件大小限制 |
| 内存溢出 | 低 | 限制并发请求 |

---

**文档版本**: v1.0
**创建日期**: 2025-02-05
