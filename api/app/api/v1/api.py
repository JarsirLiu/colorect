"""
API v1 路由汇总
"""
from fastapi import APIRouter

from app.api.v1.endpoints import tools
from app.modules.cutout import router as cutout_router


api_router = APIRouter()

api_router.include_router(tools.router, prefix="/tools", tags=["工具管理"])
api_router.include_router(cutout_router, tags=["抠图工具"])
