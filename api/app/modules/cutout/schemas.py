"""
抠图 Pydantic 模型
"""
from pydantic import BaseModel, Field


class CutoutResponse(BaseModel):
    """抠图响应模型"""
    status: str = Field(..., description="服务状态")
    model_loaded: bool = Field(..., description="模型是否已加载")


class CutoutErrorResponse(BaseModel):
    """错误响应模型"""
    success: bool = False
    error: str = Field(..., description="错误信息")
    detail: str | None = Field(default=None, description="详细信息")
