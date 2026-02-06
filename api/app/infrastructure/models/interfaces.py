"""
模型管理抽象接口

定义模型加载器的统一接口，支持不同的模型框架（ONNX、TensorFlow、PyTorch）。
"""
from abc import ABC, abstractmethod
from typing import Any


class IModelLoader(ABC):
    """模型加载器接口"""

    @abstractmethod
    async def load_model(self, model_id: str) -> Any:
        """
        加载模型到内存

        Args:
            model_id: 模型标识符（可以是文件路径、模型名称等）

        Returns:
            模型实例
        """
        pass

    @abstractmethod
    async def unload_model(self, model_id: str):
        """
        卸载模型释放内存

        Args:
            model_id: 模型标识符
        """
        pass

    @abstractmethod
    async def infer(
        self,
        model_id: str,
        input_data: Any
    ) -> Any:
        """
        推理（自动排队）

        Args:
            model_id: 模型标识符
            input_data: 输入数据

        Returns:
            推理结果
        """
        pass

    @abstractmethod
    async def cleanup(self):
        """清理所有模型"""
        pass
