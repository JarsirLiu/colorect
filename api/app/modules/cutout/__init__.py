"""
抠图模块
"""
from app.modules.cutout.router import router
from app.modules.cutout.service import CutoutService


__all__ = ["CutoutService", "router"]
