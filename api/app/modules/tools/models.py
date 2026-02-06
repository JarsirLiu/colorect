"""
工具管理模型
"""
from sqlalchemy import JSON, Column, Index, String

from app.db.base import BaseModel, TimestampMixin


class ToolUsage(BaseModel, TimestampMixin):
    """工具使用记录模型"""

    __tablename__ = "tool_usage"

    # 工具信息
    tool_id = Column(String(100), index=True, nullable=False, comment="工具ID")
    tool_name = Column(String(200), nullable=False, comment="工具名称")

    # 用户追踪
    anonymous_id = Column(String(50), index=True, nullable=True, comment="匿名用户ID")
    ip_address = Column(String(45), index=True, nullable=False, comment="IP地址")
    user_agent = Column(String(500), nullable=True, comment="用户代理")

    # 额外数据
    extra_data = Column(JSON, default={}, nullable=False, comment="额外数据")

    __table_args__ = (
        Index('idx_tool_id_created', 'tool_id', 'created_at'),
    )

    def __repr__(self):
        return f"<ToolUsage {self.tool_name} - {self.created_at}>"
