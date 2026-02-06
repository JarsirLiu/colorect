"""
抠图服务数据模型

定义请求和响应的 Pydantic 模型。
"""

from pydantic import BaseModel


class CutoutHealthResponse(BaseModel):
    """抠图服务健康检查响应"""
    service: str
    model_loaded: bool
    queue_size: int


class CutoutResponse(BaseModel):
    """抠图响应（用于 OpenAPI 文档）"""
    pass  # 实际返回 PNG 图片流，这里仅用于文档
