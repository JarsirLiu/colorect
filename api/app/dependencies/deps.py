"""
通用依赖注入函数
"""
from fastapi import Depends, Request
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.session import get_db
from app.core.logging import logger


async def get_client_ip(request: Request) -> str:
    """
    获取客户端 IP 地址

    Args:
        request: FastAPI 请求对象

    Returns:
        str: IP 地址
    """
    x_forwarded_for = request.headers.get("x-forwarded-for")
    if x_forwarded_for:
        ip = x_forwarded_for.split(",")[0].strip()
    else:
        ip = request.client.host
    return ip


def get_user_agent(request: Request) -> str:
    """
    获取用户代理

    Args:
        request: FastAPI 请求对象

    Returns:
        str: 用户代理
    """
    return request.headers.get("user-agent", "")


# 导出常用的依赖
__all__ = ["get_db", "get_client_ip", "get_user_agent"]
