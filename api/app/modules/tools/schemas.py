"""
工具管理 Pydantic 模型
"""
from datetime import datetime
from typing import Any, Optional

from pydantic import BaseModel, Field


# ============ 请求模型 ============

class ToolUsageCreate(BaseModel):
    """工具使用记录创建"""
    tool_id: str = Field(..., description="工具ID")
    tool_name: str = Field(..., description="工具名称")
    anonymous_id: Optional[str] = Field(None, description="匿名用户ID")
    extra_data: Optional[dict[str, Any]] = Field(default_factory=dict, description="额外数据")


class ToolUsageUpdate(BaseModel):
    """工具使用记录更新"""
    extra_data: Optional[dict[str, Any]] = Field(None, description="额外数据")


# ============ 响应模型 ============

class ToolUsageResponse(BaseModel):
    """工具使用记录响应"""
    id: int
    tool_id: str
    tool_name: str
    anonymous_id: Optional[str]
    ip_address: str
    user_agent: Optional[str]
    extra_data: dict[str, Any]
    created_at: datetime
    updated_at: Optional[datetime]

    class Config:
        from_attributes = True


class ToolConfig(BaseModel):
    """工具配置"""
    id: str
    name: str
    description: str
    category: str
    tags: list[str]
    enabled: bool
    development: dict[str, Any]
    production: Optional[dict[str, Any]] = None


class ToolListResponse(BaseModel):
    """工具列表响应"""
    success: bool = Field(..., description="是否成功")
    tools: list[ToolConfig] = Field(..., description="工具列表")


class ToolDetailResponse(BaseModel):
    """工具详情响应"""
    success: bool = Field(..., description="是否成功")
    tool: ToolConfig = Field(..., description="工具配置")


class ToolRefreshResponse(BaseModel):
    """刷新工具缓存响应"""
    success: bool = Field(..., description="是否成功")
    message: str = Field(..., description="消息")
    tools_count: int = Field(..., description="工具数量")
