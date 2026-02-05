"""
数据库初始化
"""
from app.db.base import Base
from app.db.session import engine
from app.modules.tools.models import ToolUsage  # noqa


async def init_db():
    """初始化数据库表"""
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)


async def drop_db():
    """删除所有表（仅开发环境使用）"""
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)

