"""
API v1 路由汇总
"""
from fastapi import APIRouter

from app.modules.cutout import router as cutout_router


api_router = APIRouter()

api_router.include_router(cutout_router, tags=["抠图工具"])
