# Center API 后端开发规范

## 1. 架构设计原则

### 1.1 分层架构模式

采用经典的分层架构模式，通过职责分离将系统分解为四个相互协作的层次。分层的关键在于**依赖方向的内向性**——外层依赖内层，内层对外层一无所知。

```
┌─────────────────────────────────────────┐
│   表现层 (Presentation Layer)           │  ← HTTP路由、请求验证、响应封装
│   app/api/v1/endpoints/                 │
├─────────────────────────────────────────┤
│   应用层 (Application Layer)            │  ← 用例编排、事务管理、服务协调
│   app/services/                         │
├─────────────────────────────────────────┤
│   领域层 (Domain Layer)                 │  ← 业务规则、领域模型
│   app/domain/                           │
├─────────────────────────────────────────┤
│   基础设施层 (Infrastructure Layer)     │  ← 技术实现、外部服务适配
│   app/infrastructure/                   │
└─────────────────────────────────────────┘
         ↑
┌─────────────────────────────────────────┐
│   共享内核 (Shared Kernel)              │  ← 横切关注点
│   app/core/                             │
└─────────────────────────────────────────┘
```

#### 1.1.1 表现层（Presentation Layer）

表现层作为系统与外部交互的边界，承担**协议适配**与**输入输出转换**的核心职责。

- **职责**：RESTful端点映射、请求体验证、响应封装、异常转换
- **禁止**：包含业务逻辑，直接操作数据库
- **FastAPI实践**：使用`APIRouter`模块化路由，Pydantic模型验证请求/响应

```python
# ✅ 正确：表现层只负责协议转换
@router.post("/segment")
async def segment_image(
    file: UploadFile,
    service: CutoutService = Depends(get_cutout_service)
):
    result = await service.process(file)
    return StreamingResponse(result)

# ❌ 错误：表现层包含业务逻辑
@router.post("/segment")
async def segment_image(file: UploadFile):
    # 图像预处理
    image = preprocess(file)
    # 模型推理
    result = model.predict(image)
    return result
```

#### 1.1.2 应用层（Application Layer）

应用层是**用例编排**的中心，负责将用户意图转换为领域操作序列。

- **职责**：事务控制、安全上下文传递、跨服务协调
- **关键特征**：无领域规则，只关注"做什么"而非"怎么做"
- **实现**：Application Service类，每个对应一个完整业务用例

```python
class CutoutApplicationService:
    """抠图应用服务 - 编排用例"""
    
    def __init__(
        self,
        model_loader: IModelLoader,
        task_queue: ITaskQueue
    ):
        self._model_loader = model_loader
        self._task_queue = task_queue
    
    async def submit_cutout_task(self, image: Image) -> TaskId:
        """提交抠图任务用例"""
        # 1. 创建任务
        task = CutoutTask.create(image)
        
        # 2. 入队等待处理
        await self._task_queue.enqueue(task)
        
        return task.id
```

#### 1.1.3 领域层（Domain Layer）

领域层是整个架构的**战略核心**，包含业务领域的全部知识和规则。

- **构建块**：
  - **实体（Entity）**：有唯一标识和生命周期的业务对象
  - **值对象（Value Object）**：描述特征的无标识对象
  - **领域服务（Domain Service）**：封装跨对象的领域逻辑
  - **领域事件（Domain Event）**：表达业务事实

```python
# 实体示例
@dataclass
class CutoutTask:
    id: TaskId
    status: TaskStatus
    input_image: Image
    created_at: datetime
    
    def start_processing(self):
        if self.status != TaskStatus.PENDING:
            raise BusinessRuleViolation("Task not pending")
        self.status = TaskStatus.PROCESSING

# 值对象示例
@dataclass(frozen=True)
class ImageSize:
    width: int
    height: int
    
    def validate(self):
        if self.width <= 0 or self.height <= 0:
            raise ValueError("Invalid dimensions")
```

#### 1.1.4 基础设施层（Infrastructure Layer）

基础设施层为上层提供**技术能力支持**。

- **核心模式**：适配器（Adapter）、仓库实现（Repository Implementation）
- **职责**：模型加载、数据库访问、队列实现、缓存
- **关键原则**：通过抽象接口与上层交互

```python
# 接口定义（领域层）
class IModelLoader(ABC):
    @abstractmethod
    async def infer(self, model_id: str, input_data: Any) -> Any: ...

# 实现（基础设施层）
class ONNXModelLoader(IModelLoader):
    async def infer(self, model_id: str, input_data: Any) -> Any:
        session = self._load_session(model_id)
        return session.run(None, input_data)
```

### 1.2 模块化设计原则

#### 1.2.1 垂直切片模块化（Feature-Based Modularity）

按业务功能而非技术层次组织代码，每个模块包含完成该功能所需的全部组件。

```
app/modules/
├── cutout/                    # 抠图功能模块
│   ├── router.py              # 路由定义
│   ├── service.py             # 应用服务
│   ├── schemas.py             # Pydantic模型
│   └── __init__.py
├── background_replace/        # 换底色功能模块
│   ├── router.py
│   ├── service.py
│   ├── schemas.py
│   └── __init__.py
└── face_enhance/             # 人脸增强功能模块
    ├── router.py
    ├── service.py
    ├── schemas.py
    └── __init__.py
```

**模块边界规则**：
- 模块内部文件可相互导入
- 跨模块必须通过公共服务层或明确的接口
- 禁止循环依赖

#### 1.2.2 核心域与支撑域分离

| 类型 | 示例 | 设计投入 |
|------|------|----------|
| **核心域** | 图像处理算法、任务调度 | 最高，追求模型精度 |
| **支撑域** | 工具管理、使用记录 | 中等，采用成熟方案 |
| **通用域** | 用户认证、日志记录 | 使用开源方案 |

### 1.3 可扩展性设计

#### 1.3.1 单机资源优化（4核4G场景）

| 资源 | 配置项 | 典型值 | 说明 |
|------|--------|--------|------|
| CPU | MAX_CONCURRENT_INFERENCE | 2 | 最大并发推理数 |
| CPU | THREAD_POOL_SIZE | 2 | 线程池大小 |
| 内存 | 模型懒加载 | - | 按需加载，用完可卸载 |
| 内存 | 队列最大长度 | 100 | 防止内存溢出 |

#### 1.3.2 资源管理策略

```python
# 模型加载器统一资源管理
class ModelLoader:
    def __init__(self, max_concurrent: int = 2):
        self._semaphore = asyncio.Semaphore(max_concurrent)
        self._executor = ThreadPoolExecutor(max_workers=max_concurrent)
    
    async def infer(self, model_id: str, data: Any):
        async with self._semaphore:  # 自动排队
            return await self._run_in_thread(data)
```

## 2. 项目目录结构规范

### 2.1 顶层组织

#### 2.1.1 按分层+业务域划分的一级目录

```
api/
├── app/
│   ├── main.py                    # 应用入口、生命周期管理
│   ├── core/                      # 共享内核
│   │   ├── config.py              # 配置管理
│   │   ├── constants.py           # 常量定义
│   │   ├── logging.py             # 日志配置
│   │   ├── security.py            # 安全工具
│   │   └── exceptions.py          # 异常定义
│   │
│   ├── domain/                    # 领域层
│   │   └── image_processing/      # 图片处理领域
│   │       ├── entities.py        # 实体定义
│   │       ├── value_objects.py   # 值对象
│   │       └── services.py        # 领域服务
│   │
│   ├── models/                    # ORM模型
│   │   ├── processing_task.py
│   │   └── tool_usage.py
│   │
│   ├── services/                  # 应用服务层
│   │   └── image_processing/      
│   │       ├── base_service.py    # 基类
│   │       ├── cutout_service.py
│   │       └── background_replace_service.py
│   │
│   ├── infrastructure/            # 基础设施层
│   │   ├── models/                # 模型管理
│   │   │   ├── interfaces.py
│   │   │   └── loader.py
│   │   ├── queue/                 # 任务队列
│   │   │   ├── interfaces.py
│   │   │   └── memory_queue.py
│   │   ├── cache/                 # 缓存
│   │   └── repositories/          # 仓库实现
│   │
│   ├── api/                       # 表现层
│   │   └── v1/
│   │       ├── api.py             # 路由汇总
│   │       └── endpoints/         # 端点定义
│   │           ├── image_processing.py
│   │           └── tools.py
│   │
│   ├── modules/                   # 业务模块（独立闭环）
│   │   ├── cutout/
│   │   ├── background_replace/
│   │   └── tools/
│   │
│   ├── db/                        # 数据库
│   │   ├── session.py
│   │   └── init_db.py
│   │
│   └── dependencies/              # 依赖注入
│       └── deps.py
│
├── alembic/                       # 数据库迁移
├── tests/                         # 测试
│   ├── unit/                      # 单元测试
│   ├── integration/               # 集成测试
│   └── e2e/                       # 端到端测试
│
├── requirements.txt               # 依赖清单
└── .env                           # 环境变量
```

### 2.2 各层内部结构

#### 2.2.1 领域层结构

```
domain/
├── image_processing/
│   ├── __init__.py
│   ├── entities.py              # 实体定义（≤200行）
│   │   ├── CutoutTask           # 抠图任务实体
│   │   ├── ProcessingTask       # 处理任务基类
│   │   └── TaskStatus           # 任务状态枚举
│   │
│   ├── value_objects.py         # 值对象（≤150行）
│   │   ├── ImageSize            # 图片尺寸
│   │   ├── TaskConfig           # 任务配置
│   │   └── ProcessingResult     # 处理结果
│   │
│   └── services.py              # 领域服务（≤300行）
│       └── ImageProcessingService
```

#### 2.2.2 基础设施层结构

```
infrastructure/
├── models/                      # 模型管理
│   ├── __init__.py
│   ├── interfaces.py            # 抽象接口
│   └── loader.py                # 加载器实现
│
├── queue/                       # 任务队列
│   ├── __init__.py
│   ├── interfaces.py
│   ├── memory_queue.py
│   └── redis_queue.py
│
└── repositories/                # 仓库实现
    ├── __init__.py
    ├── interfaces.py
    └── sqlalchemy/
```

#### 2.2.3 业务模块结构

```
modules/
└── cutout/                      # 功能模块示例
    ├── __init__.py
    ├── router.py                # 路由定义（≤200行）
    ├── service.py               # 应用服务（≤300行）
    ├── schemas.py               # Pydantic模型（≤150行）
    └── utils.py                 # 工具函数（可选）
```

## 3. 代码规范

### 3.1 文件命名规范

| 内容类型 | 命名规范 | 示例 |
|----------|----------|------|
| Python模块 | snake_case | `cutout_service.py`, `image_processing.py` |
| 类定义文件 | PascalCase（同类名） | `ModelLoader.py` → 实际用snake_case: `model_loader.py` |
| 接口文件 | 前缀`I` + PascalCase | `IModelLoader` → `interfaces.py` |
| 测试文件 | `test_` + 模块名 | `test_cutout_service.py` |
| 配置文件 | 小写 | `config.py`, `constants.py` |

### 3.2 命名约定

#### 3.2.1 类命名

| 类型 | 命名模式 | 示例 |
|------|----------|------|
| 应用服务 | `{Domain}Service` | `CutoutService`, `BackgroundReplaceService` |
| 领域服务 | `{Domain}DomainService` | `ImageProcessingDomainService` |
| 实体 | PascalCase | `CutoutTask`, `ProcessingResult` |
| 值对象 | PascalCase | `ImageSize`, `TaskConfig` |
| 接口 | 前缀`I` + PascalCase | `IModelLoader`, `ITaskQueue` |
| 异常 | 后缀`Error`/`Exception` | `BusinessRuleViolation`, `ModelLoadError` |

#### 3.2.2 函数/方法命名

| 场景 | 动词选择 | 示例 |
|------|----------|------|
| 数据操作 | fetch, get, create, update, delete | `get_task_by_id()`, `create_task()` |
| 业务操作 | process, handle, execute | `process_image()`, `execute_workflow()` |
| 事件处理 | handle + 名词 | `handle_task_completed()` |
| 回调函数 | on + 动词 | `on_task_finished()` |
| 验证函数 | validate, check, is/has/can | `validate_config()`, `is_task_pending()` |

#### 3.2.3 变量/属性命名

| 类型 | 命名规范 | 示例 |
|------|----------|------|
| 普通变量 | snake_case | `task_id`, `image_size` |
| 常量 | SCREAMING_SNAKE_CASE | `MAX_CONCURRENT`, `DEFAULT_TIMEOUT` |
| 布尔值 | is_/has_/should_/can_ | `is_loading`, `has_error`, `can_retry` |
| 私有属性 | 前缀`_` | `_model_loader`, `_session` |
| 类变量 | 前缀`cls`或直接使用 | `cls.MAX_SIZE` |

#### 3.2.4 类型注解命名

| 类型 | 命名模式 | 示例 |
|------|----------|------|
| 类型别名 | PascalCase + Type | `TaskIdType`, `ImageDataType` |
| 泛型参数 | 单字母大写 | `T`, `K`, `V`, `R` |
| Optional | 明确标注 | `Optional[str]`, `str \| None` |
| 联合类型 | 使用`\|` | `str \| int` |

### 3.3 代码组织

#### 3.3.1 导入顺序

```python
# 1. 标准库
import asyncio
from typing import Optional, List
from dataclasses import dataclass

# 2. 第三方库
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from PIL import Image
import numpy as np

# 3. 内部模块（app.core优先）
from app.core.config import settings
from app.core.constants import MAX_SIZE
from app.core.exceptions import BusinessError

# 4. 同层模块
from app.infrastructure.models import IModelLoader
from app.domain.image_processing import CutoutTask

# 5. 当前包模块
from .schemas import CutoutRequest
from .utils import preprocess_image
```

#### 3.3.2 类结构顺序

```python
class CutoutService:
    """
    类文档字符串：说明职责、主要功能、使用示例
    """
    
    # 1. 类变量
    DEFAULT_SIZE = 1024
    MAX_SIZE = 2048
    
    # 2. __init__方法
    def __init__(self, model_loader: IModelLoader):
        self._model_loader = model_loader  # 3. 实例变量
        self._initialized = False
    
    # 4. 公共方法（按使用频率排序）
    async def process(self, image: Image) -> Image:
        """主要业务方法"""
        pass
    
    async def health_check(self) -> dict:
        """健康检查"""
        pass
    
    # 5. 私有方法
    def _normalize_image(self, image: Image) -> np.ndarray:
        """图像预处理"""
        pass
    
    async def _predict(self, data: np.ndarray) -> np.ndarray:
        """模型推理"""
        pass
```

#### 3.3.3 函数结构

```python
async def process_image(
    image: Image,
    config: ProcessingConfig,
    timeout: int = DEFAULT_TIMEOUT
) -> ProcessingResult:
    """
    处理图片并返回结果
    
    详细说明函数的功能、算法流程、边界情况。
    
    Args:
        image: 输入图片（PIL.Image格式）
        config: 处理配置参数
        timeout: 超时时间（秒），默认30秒
    
    Returns:
        ProcessingResult: 处理结果，包含输出图片和元数据
    
    Raises:
        ValueError: 图片格式不支持
        TimeoutError: 处理超时
        ModelError: 模型推理失败
    
    Example:
        >>> image = Image.open("input.jpg")
        >>> config = ProcessingConfig(size=1024)
        >>> result = await process_image(image, config)
        >>> result.output_image.save("output.png")
    """
    # 1. 参数验证
    if image is None:
        raise ValueError("Image cannot be None")
    
    # 2. 预处理
    normalized = await _preprocess(image, config)
    
    # 3. 核心业务逻辑
    output = await _infer(normalized)
    
    # 4. 后处理
    result = _postprocess(output)
    
    return result
```

### 3.4 代码行数限制

| 代码单元 | 最大行数 | 说明 |
|----------|----------|------|
| 模块文件 | 500行 | 超过则拆分子模块 |
| 类 | 300行 | 单一职责，复杂功能拆分为多个类 |
| 函数/方法 | 50行 | 超过则提取子函数 |
| 单行长度 | 100字符 | 过长则换行 |
| 参数数量 | 5个 | 超过则使用配置对象 |

### 3.5 文档字符串规范

所有公共API必须包含Google风格的文档字符串：

```python
def complex_function(param1: int, param2: str) -> bool:
    """
    简要描述（一行）
    
    详细描述，可以有多行。说明功能、使用场景、注意事项。
    
    Args:
        param1: 参数1的说明
        param2: 参数2的说明
    
    Returns:
        返回值的说明
    
    Raises:
        ValueError: 当参数无效时
        RuntimeError: 当运行时错误发生时
    
    Example:
        >>> result = complex_function(1, "test")
        >>> print(result)
        True
    """
    pass
```

## 4. 类型注解规范

### 4.1 强制类型注解

所有函数参数和返回值必须添加类型注解：

```python
# ✅ 正确
def process_image(image: Image, config: Config) -> Result:
    pass

# ❌ 错误
def process_image(image, config):  # 缺少类型注解
    pass
```

### 4.2 常用类型模式

```python
from typing import Optional, List, Dict, Tuple, Union, Callable
from pathlib import Path

# Optional - 可能为None
async def find_task(task_id: str) -> Optional[Task]:
    pass

# List - 列表类型
def batch_process(images: List[Image]) -> List[Result]:
    pass

# Dict - 字典类型
config: Dict[str, Union[str, int, float]] = {}

# Union - 联合类型（Python 3.10+用|）
def parse_value(value: str | int | float) -> float:
    pass

# Callable - 回调函数
CallbackType = Callable[[str], None]

# 自定义类型别名
TaskId = str
ImageData = bytes
```

### 4.3 Pydantic模型规范

```python
from pydantic import BaseModel, Field, validator

class ProcessingRequest(BaseModel):
    """处理请求模型"""
    
    # 字段定义：类型 + Field配置
    image_url: str = Field(
        ...,
        description="图片URL",
        example="https://example.com/image.jpg"
    )
    size: int = Field(
        default=1024,
        ge=256,
        le=2048,
        description="处理尺寸"
    )
    
    # 自定义验证器
    @validator('image_url')
    def validate_url(cls, v):
        if not v.startswith(('http://', 'https://')):
            raise ValueError('Invalid URL format')
        return v
    
    class Config:
        """模型配置"""
        schema_extra = {
            "example": {
                "image_url": "https://example.com/image.jpg",
                "size": 1024
            }
        }
```

## 5. 错误处理规范

### 5.1 异常层次结构

```
BaseException (Python内置)
└── AppException (应用基础异常)
    ├── DomainException (领域层)
    │   ├── ValidationError (验证失败)
    │   ├── BusinessRuleViolation (业务规则违反)
    │   └── InsufficientQuota (配额不足)
    ├── ApplicationException (应用层)
    │   ├── ResourceNotFound (资源不存在)
    │   └── PermissionDenied (权限不足)
    ├── InfrastructureException (基础设施层)
    │   ├── ModelLoadError (模型加载失败)
    │   ├── DatabaseError (数据库错误)
    │   └── QueueError (队列错误)
    └── SecurityException (安全层)
        ├── AuthenticationError (认证失败)
        └── AuthorizationError (授权失败)
```

### 5.2 异常定义

```python
# app/core/exceptions.py

class AppException(Exception):
    """应用基础异常"""
    def __init__(self, message: str, code: str = None):
        self.message = message
        self.code = code
        super().__init__(message)

class DomainException(AppException):
    """领域层异常"""
    pass

class BusinessRuleViolation(DomainException):
    """业务规则违反"""
    def __init__(self, message: str):
        super().__init__(message, code="BUSINESS_RULE_VIOLATION")

class InfrastructureException(AppException):
    """基础设施层异常"""
    pass

class ModelLoadError(InfrastructureException):
    """模型加载失败"""
    def __init__(self, model_id: str, reason: str):
        super().__init__(
            f"Failed to load model {model_id}: {reason}",
            code="MODEL_LOAD_ERROR"
        )
```

### 5.3 错误响应格式

```python
# 统一错误响应
{
    "success": False,
    "error": {
        "code": "MODEL_LOAD_ERROR",
        "message": "Failed to load model: file not found",
        "details": {
            "model_id": "cutout-v1",
            "path": "/models/model.onnx"
        }
    },
    "request_id": "req_abc123"
}
```

## 6. 日志规范

### 6.1 日志级别使用

| 级别 | 使用场景 | 示例 |
|------|----------|------|
| DEBUG | 开发调试 | 函数入参、中间结果 |
| INFO | 业务流程 | 请求开始/完成、资源创建 |
| WARNING | 非预期但可恢复 | 重试、降级、慢查询 |
| ERROR | 功能失败 | 请求处理失败、外部服务错误 |
| CRITICAL | 系统级故障 | 数据库连接失败、内存不足 |

### 6.2 结构化日志

```python
import logging
import structlog

logger = logging.getLogger(__name__)

# 业务日志
logger.info(
    "Processing image",
    extra={
        "task_id": task_id,
        "image_size": {"width": 1024, "height": 768},
        "model_id": "cutout-v1"
    }
)

# 错误日志
logger.error(
    "Failed to process image",
    exc_info=True,
    extra={
        "task_id": task_id,
        "error_code": "MODEL_ERROR"
    }
)
```

### 6.3 日志格式

```python
# 标准格式
"%(asctime)s - %(name)s - %(levelname)s - %(message)s"

# 输出示例
2024-01-15 08:30:00,123 - app.modules.cutout - INFO - Processing image: task_id=abc123 size=1024x768
```

## 7. 测试规范

### 7.1 测试金字塔

| 层级 | 占比 | 范围 | 工具 | 速度 |
|------|------|------|------|------|
| 单元测试 | 70% | 领域逻辑、工具函数 | pytest | <10ms |
| 集成测试 | 20% | 服务、仓库、数据库 | pytest + TestContainers | <1s |
| E2E测试 | 10% | 完整API流程 | pytest + httpx | <10s |

### 7.2 单元测试规范

```python
# test_cutout_service.py
import pytest
from unittest.mock import Mock, AsyncMock

from app.modules.cutout.service import CutoutService

class TestCutoutService:
    """CutoutService单元测试"""
    
    @pytest.fixture
    def mock_model_loader(self):
        """模拟模型加载器"""
        loader = Mock()
        loader.infer = AsyncMock(return_value=np.zeros((1, 1024, 1024)))
        return loader
    
    @pytest.fixture
    def service(self, mock_model_loader):
        """测试服务实例"""
        return CutoutService(model_loader=mock_model_loader)
    
    @pytest.mark.asyncio
    async def test_process_image_success(self, service, mock_model_loader):
        """测试图片处理成功"""
        # Arrange
        image = Image.new('RGB', (1024, 1024))
        
        # Act
        result = await service.process(image)
        
        # Assert
        assert result is not None
        mock_model_loader.infer.assert_called_once()
    
    @pytest.mark.asyncio
    async def test_process_image_invalid_input(self, service):
        """测试无效输入"""
        with pytest.raises(ValueError):
            await service.process(None)
```

### 7.3 集成测试规范

```python
# test_cutout_integration.py
import pytest
from httpx import AsyncClient

@pytest.mark.asyncio
async def test_cutout_endpoint(client: AsyncClient):
    """测试抠图接口"""
    # 准备测试数据
    files = {"file": ("test.jpg", open("test.jpg", "rb"), "image/jpeg")}
    
    # 发送请求
    response = await client.post("/api/v1/cutout/segment", files=files)
    
    # 验证响应
    assert response.status_code == 200
    assert response.headers["content-type"] == "image/png"
```

## 8. 数据库规范

### 8.1 ORM模型定义

```python
# models/processing_task.py
from sqlalchemy import Column, String, Integer, DateTime, Enum, JSON
from app.db.base import Base

class ProcessingTask(Base):
    """处理任务表"""
    __tablename__ = "processing_tasks"
    
    id = Column(String(36), primary_key=True, index=True)
    type = Column(String(50), nullable=False, index=True)
    status = Column(Enum(TaskStatus), nullable=False, default=TaskStatus.PENDING)
    input_data = Column(JSON)
    output_data = Column(JSON)
    error_message = Column(String(500))
    created_at = Column(DateTime, default=datetime.utcnow)
    completed_at = Column(DateTime)
    
    # 索引
    __table_args__ = (
        Index('ix_tasks_status_created', 'status', 'created_at'),
    )
```

### 8.2 数据库迁移

```bash
# 生成迁移脚本
alembic revision --autogenerate -m "add_processing_task_table"

# 执行迁移
alembic upgrade head

# 回滚迁移
alembic downgrade -1
```

## 9. 性能优化规范

### 9.1 异步编程规范

```python
# ✅ 正确：IO操作使用await
async def fetch_data(url: str) -> dict:
    async with httpx.AsyncClient() as client:
        response = await client.get(url)
        return response.json()

# ✅ 正确：CPU密集型任务使用线程池
async def process_image(image: Image) -> Image:
    loop = asyncio.get_event_loop()
    return await loop.run_in_executor(
        executor,
        cpu_intensive_function,
        image
    )

# ❌ 错误：在异步函数中阻塞
async def bad_example():
    time.sleep(1)  # 阻塞整个事件循环！
```

### 9.2 资源管理

```python
# ✅ 正确：使用上下文管理器
async with database.session() as session:
    result = await session.execute(query)

# ✅ 正确：使用asynccontextmanager
@asynccontextmanager
async def managed_resource():
    resource = await create_resource()
    try:
        yield resource
    finally:
        await resource.cleanup()
```

## 10. 部署与运维

### 10.1 环境配置

```bash
# .env 文件
# 服务器配置
HOST=0.0.0.0
PORT=8000
WORKERS=1  # 单进程，避免重复加载模型

# 数据库配置
DATABASE_URL=sqlite+aiosqlite:///./data/app.db

# 资源限制
MAX_CONCURRENT_INFERENCE=2
THREAD_POOL_SIZE=2
QUEUE_MAX_SIZE=100

# 日志配置
LOG_LEVEL=INFO
```

### 10.2 启动命令

```bash
# 开发环境
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload

# 生产环境（单进程）
uvicorn app.main:app --host 0.0.0.0 --port 8000 --workers 1

# 使用gunicorn（推荐生产环境）
gunicorn app.main:app \
  -k uvicorn.workers.UvicornWorker \
  --workers 1 \
  --worker-connections 1000 \
  --timeout 120
```

### 10.3 监控指标

```python
# 关键指标
METRICS = {
    "http_requests_total": "HTTP请求总数",
    "http_request_duration_seconds": "HTTP请求耗时",
    "model_inference_duration_seconds": "模型推理耗时",
    "model_inference_errors_total": "推理错误数",
    "queue_size": "任务队列长度",
    "active_tasks": "活跃任务数"
}
```

## 11. 代码审查清单

### 11.1 功能审查

- [ ] 功能是否符合需求
- [ ] 边界情况是否处理
- [ ] 错误处理是否完善
- [ ] 日志记录是否充分

### 11.2 架构审查

- [ ] 分层是否正确
- [ ] 依赖方向是否正确（内层不依赖外层）
- [ ] 接口与实现是否分离
- [ ] 是否遵循单一职责原则

### 11.3 代码质量

- [ ] 类型注解是否完整
- [ ] 文档字符串是否规范
- [ ] 函数行数是否超过50行
- [ ] 类行数是否超过300行
- [ ] 是否有重复代码

### 11.4 测试审查

- [ ] 单元测试是否覆盖核心逻辑
- [ ] 测试名称是否描述行为
- [ ] 是否有集成测试
- [ ] 测试是否独立

## 12. 示例代码库

### 12.1 完整模块示例

```python
# modules/cutout/service.py
"""
抠图服务

提供图像背景移除功能，使用RMBG模型。
"""
from typing import Optional
import logging
from PIL import Image
import numpy as np

from app.infrastructure.models import IModelLoader
from app.core.constants import CUTOUT_MODEL_PATH, CUTOUT_DEFAULT_SIZE

logger = logging.getLogger(__name__)


class CutoutService:
    """
    抠图服务类
    
    使用ONNX模型进行图像分割，自动管理模型加载和推理排队。
    
    Attributes:
        _model_loader: 模型加载器实例
        _model_id: 模型标识符
    """
    
    def __init__(self, model_loader: IModelLoader):
        """
        初始化服务
        
        Args:
            model_loader: 模型加载器，用于加载和推理
        """
        self._model_loader = model_loader
        self._model_id = str(CUTOUT_MODEL_PATH)
    
    async def process(self, image: Image.Image) -> Image.Image:
        """
        处理图像并移除背景
        
        工作流程：
        1. 转换图像格式
        2. 调用模型推理（自动排队）
        3. 应用mask生成透明背景
        
        Args:
            image: 输入图像（PIL.Image）
            
        Returns:
            带透明背景的图像
            
        Raises:
            ValueError: 输入图像无效
            ModelError: 模型推理失败
        """
        if image is None:
            raise ValueError("Image cannot be None")
        
        input_image = image.convert("RGB")
        logger.info(f"Processing image: {input_image.size}")
        
        # 推理（自动排队）
        mask = await self._predict(input_image)
        
        # 应用mask
        output_image = input_image.convert("RGBA")
        output_image.putalpha(mask)
        
        logger.info("Image processing completed")
        return output_image
    
    async def _predict(self, image: Image.Image) -> Image.Image:
        """
        模型预测（内部方法）
        
        Args:
            image: 预处理后的图像
            
        Returns:
            分割mask
        """
        input_data = self._normalize_image(image)
        
        # 调用模型（自动排队）
        ort_outs = await self._model_loader.infer(
            model_id=self._model_id,
            input_data=input_data
        )
        
        # 后处理
        mask = self._postprocess_mask(ort_outs[0], image.size)
        return mask
    
    def _normalize_image(self, image: Image.Image) -> np.ndarray:
        """图像归一化（私有方法）"""
        im = image.resize((CUTOUT_DEFAULT_SIZE, CUTOUT_DEFAULT_SIZE), Image.LANCZOS)
        im_ary = np.array(im, dtype=np.float32)
        im_ary = im_ary / 255.0 - 0.5
        im_ary = im_ary.transpose((2, 0, 1))
        im_ary = np.expand_dims(im_ary, 0)
        return im_ary
    
    def _postprocess_mask(
        self,
        pred: np.ndarray,
        original_size: tuple
    ) -> Image.Image:
        """Mask后处理（私有方法）"""
        if len(pred.shape) == 4:
            pred = pred[0, 0, :, :]
        
        ma, mi = np.max(pred), np.min(pred)
        if ma - mi > 0:
            pred = (pred - mi) / (ma - mi)
        
        mask = Image.fromarray((pred * 255).astype("uint8"), mode="L")
        mask = mask.resize(original_size, Image.LANCZOS)
        return mask
    
    async def health_check(self) -> dict:
        """
        健康检查
        
        Returns:
            服务状态信息
        """
        return {
            "service": "CutoutService",
            "model_loaded": self._model_id in self._model_loader.get_loaded_models(),
            "queue_size": self._model_loader.get_queue_size()
        }
```

---

**文档版本**: 1.0  
**最后更新**: 2026-02-06  
**维护者**: Center API Team
