"""
基础设施层 - 模型管理

提供统一的模型加载、推理和资源管理能力。
"""

from app.infrastructure.models.interfaces import IModelLoader
from app.infrastructure.models.loader import ModelLoader


__all__ = ["IModelLoader", "ModelLoader"]
