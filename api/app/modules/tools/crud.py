"""
工具管理 CRUD 操作
"""
from typing import List, Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, desc
from app.modules.tools.models import ToolUsage


class ToolUsageCRUD:
    """工具使用记录 CRUD"""

    async def create(
        self,
        db: AsyncSession,
        *,
        tool_id: str,
        tool_name: str,
        ip_address: str,
        user_agent: Optional[str] = None,
        anonymous_id: Optional[str] = None,
        extra_data: Optional[dict] = None
    ) -> ToolUsage:
        """
        创建工具使用记录

        Args:
            db: 数据库会话
            tool_id: 工具ID
            tool_name: 工具名称
            ip_address: IP地址
            user_agent: 用户代理
            anonymous_id: 匿名用户ID
            extra_data: 额外数据

        Returns:
            ToolUsage: 创建的记录
        """
        db_obj = ToolUsage(
            tool_id=tool_id,
            tool_name=tool_name,
            ip_address=ip_address,
            user_agent=user_agent or "",
            anonymous_id=anonymous_id,
            extra_data=extra_data or {}
        )
        db.add(db_obj)
        await db.flush()
        return db_obj

    async def get(self, db: AsyncSession, id: int) -> Optional[ToolUsage]:
        """根据 ID 获取工具使用记录"""
        result = await db.execute(select(ToolUsage).where(ToolUsage.id == id))
        return result.scalar_one_or_none()

    async def get_by_tool_id(
        self,
        db: AsyncSession,
        tool_id: str,
        limit: int = 100
    ) -> List[ToolUsage]:
        """
        根据工具ID获取使用记录

        Args:
            db: 数据库会话
            tool_id: 工具ID
            limit: 返回数量限制

        Returns:
            List[ToolUsage]: 使用记录列表
        """
        result = await db.execute(
            select(ToolUsage)
            .where(ToolUsage.tool_id == tool_id)
            .order_by(desc(ToolUsage.created_at))
            .limit(limit)
        )
        return result.scalars().all()

    async def get_multi(
        self,
        db: AsyncSession,
        skip: int = 0,
        limit: int = 100
    ) -> List[ToolUsage]:
        """
        获取多条使用记录

        Args:
            db: 数据库会话
            skip: 跳过数量
            limit: 返回数量

        Returns:
            List[ToolUsage]: 使用记录列表
        """
        result = await db.execute(
            select(ToolUsage)
            .order_by(desc(ToolUsage.created_at))
            .offset(skip)
            .limit(limit)
        )
        return result.scalars().all()


# 全局 CRUD 实例
tool_usage_crud = ToolUsageCRUD()
