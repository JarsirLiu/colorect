# 架构重构说明

## 重构目标

基于 Dify 后端架构规范，针对 4核4G 单机场景，重构 API 项目架构。

## 主要改进

### 1. 基础设施层统一管理

#### 新增目录结构
```
app/infrastructure/
├── models/                  # 模型管理
│   ├── interfaces.py        # 抽象接口
│   └── loader.py          # ONNX 模型加载器
└── queue/                  # 任务队列
    ├── interfaces.py        # 抽象接口
    └── memory_queue.py     # 内存队列实现
```

#### 核心功能

**ModelLoader（模型加载器）**
- ✅ 懒加载模型（按需加载）
- ✅ 模型复用（避免重复加载）
- ✅ 自动排队（Semaphore 限制并发数）
- ✅ 线程池执行（CPU 密集型任务）
- ✅ 内存管理（可卸载模型）

**MemoryTaskQueue（任务队列）**
- ✅ 简单高效（无需 Redis）
- ✅ 支持优先级
- ✅ 适合单机部署

### 2. 业务服务重构

#### CutoutService 重构

**改进前**：
```python
def __init__(self):
    self._session: Optional[ort.InferenceSession] = None

async def initialize(self):
    if self._session is None:
        self._session = ort.InferenceSession(...)
```

**改进后**：
```python
def __init__(self, model_loader: IModelLoader):
    self._model_loader = model_loader

async def _predict(self, img: Image.Image):
    # 自动排队，线程池执行
    result = await self._model_loader.infer(...)
```

### 3. 路由重构

**改进前**：
```python
def get_cutout_service():
    global _cutout_service
    if _cutout_service is None:
        from app.modules.cutout.service import CutoutService
        _cutout_service = CutoutService()
    return _cutout_service
```

**改进后**：
```python
def get_cutout_service() -> CutoutService:
    global _cutout_service
    if _cutout_service is None:
        raise RuntimeError("CutoutService not initialized")
    return _cutout_service

def set_cutout_service(service: CutoutService):
    global _cutout_service
    _cutout_service = service
```

### 4. 生命周期管理

**改进前**：
```python
@asynccontextmanager
async def lifespan(app: FastAPI):
    from app.modules.cutout.router import _cutout_service
    
    yield
    
    if _cutout_service._session is not None:
        await _cutout_service.cleanup()
```

**改进后**：
```python
@asynccontextmanager
async def lifespan(app: FastAPI):
    # 启动时初始化
    model_loader = ModelLoader()
    app.state.model_loader = model_loader
    
    cutout_service = CutoutService(model_loader)
    cutout_router.set_cutout_service(cutout_service)
    
    yield
    
    # 关闭时清理
    await model_loader.cleanup()
```

## 配置优化

### 单机资源限制（4核4G）

```python
# app/core/config.py
class Settings(BaseSettings):
    WORKERS: int = 1  # 单进程，避免重复加载模型
    
    MAX_CONCURRENT_INFERENCE: int = 2  # 最大并发推理数
    THREAD_POOL_SIZE: int = 2  # 线程池大小
    QUEUE_MAX_SIZE: int = 100  # 队列最大长度
```

### 常量定义

```python
# app/core/constants.py
MAX_CONCURRENT_INFERENCE = 2
THREAD_POOL_SIZE = 2
CUTOUT_MODEL_PATH = MODELS_DIR / "model.onnx"
```

## 架构优势

### 1. 资源管理统一
- ✅ 所有模型统一管理，避免重复加载
- ✅ 自动排队，防止内存溢出
- ✅ 线程池复用，提高性能

### 2. 可扩展性强
- ✅ 添加新功能只需创建新的 Service
- ✅ 复用 ModelLoader 和 TaskQueue
- ✅ 支持多种模型格式（ONNX、TensorFlow、PyTorch）

### 3. 易于维护
- ✅ 职责清晰：基础设施层 → 业务层 → 表现层
- ✅ 依赖注入，易于测试
- ✅ 接口抽象，易于替换实现

### 4. 单机优化
- ✅ 单进程部署，避免重复加载模型
- ✅ 严格限制并发数，防止内存溢出
- ✅ 线程池大小匹配 CPU 核心数

## 未来扩展

### 添加新功能（换底色）

```python
# app/modules/background_replace/service.py
class BackgroundReplaceService:
    def __init__(self, model_loader: IModelLoader):
        self._model_loader = model_loader
    
    async def process(self, image: Image.Image, color: str) -> Image.Image:
        # 使用同一个 ModelLoader
        result = await self._model_loader.infer(...)
        return result
```

### 添加 Redis 任务队列

```python
# app/infrastructure/queue/redis_queue.py
class RedisTaskQueue(ITaskQueue):
    async def enqueue(self, task: Task):
        await self._redis.zadd(...)
```

### 添加模型缓存

```python
# app/infrastructure/cache/redis_cache.py
class RedisCache:
    async def get(self, key: str):
        return await self._redis.get(key)
```

## 部署命令

```bash
# 开发环境
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload

# 生产环境（单进程，避免重复加载模型）
uvicorn app.main:app --host 0.0.0.0 --port 8000 --workers 1
```

## 总结

本次重构基于 Dify 后端架构规范，实现了：

1. ✅ 基础设施层统一管理（模型、队列）
2. ✅ 自动排队和并发控制
3. ✅ 生命周期统一管理
4. ✅ 单机资源优化（4核4G）
5. ✅ 易于扩展（添加新功能）
6. ✅ 依赖注入，易于测试
