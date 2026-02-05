"""
抠图模块
"""
from app.modules.cutout.service import CutoutService
from app.modules.cutout.router import router

__all__ = ["CutoutService", "router"]
