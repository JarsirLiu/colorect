"""
模型加载器实现

提供 ONNX 模型的加载、推理和资源管理。

功能：
1. 懒加载模型（按需加载）
2. 模型复用（避免重复加载）
3. 自动排队（Semaphore 限制并发）
4. 线程池执行（CPU 密集型任务）
5. 内存管理（可卸载模型）
"""
import asyncio
import logging
from concurrent.futures import ThreadPoolExecutor
from typing import Any

import onnxruntime as ort

from app.core.constants import MAX_CONCURRENT_INFERENCE, THREAD_POOL_SIZE
from app.infrastructure.models.interfaces import IModelLoader


logger = logging.getLogger(__name__)


class ModelLoader(IModelLoader):
    """
    ONNX 模型加载器

    针对 4核4G 单机场景优化：
    - 严格限制并发数（默认 2）
    - 线程池大小与并发数匹配
    - 支持模型卸载释放内存
    """

    def __init__(
        self,
        max_concurrent: int = MAX_CONCURRENT_INFERENCE,
        thread_pool_size: int = THREAD_POOL_SIZE
    ):
        """
        初始化模型加载器

        Args:
            max_concurrent: 最大并发推理数
            thread_pool_size: 线程池大小
        """
        self._models: dict[str, ort.InferenceSession] = {}
        self._semaphore = asyncio.Semaphore(max_concurrent)
        self._executor = ThreadPoolExecutor(max_workers=thread_pool_size)
        self._max_concurrent = max_concurrent
        self._thread_pool_size = thread_pool_size
        logger.info(
            f"ModelLoader initialized: max_concurrent={max_concurrent}, "
            f"thread_pool_size={thread_pool_size}"
        )

    async def load_model(self, model_id: str) -> Any:
        """
        加载模型（懒加载，线程中执行）

        Args:
            model_id: 模型文件路径

        Returns:
            ONNX InferenceSession
        """
        if model_id not in self._models:
            logger.info(f"Loading model: {model_id}")

            # 在后台线程加载模型
            loop = asyncio.get_event_loop()
            session = await loop.run_in_executor(
                self._executor,
                ort.InferenceSession,
                str(model_id)
            )

            self._models[model_id] = session  # ← 修复：存储 session 对象
            logger.info(f"Model loaded: {model_id}")

        return self._models[model_id]

    async def unload_model(self, model_id: str):
        """
        卸载模型释放内存

        Args:
            model_id: 模型标识符
        """
        if model_id in self._models:
            del self._models[model_id]
            logger.info(f"Model unloaded: {model_id}")

    async def infer(
        self,
        model_id: str,
        input_data: Any
    ) -> Any:
        """
        推理（自动排队）

        工作流程：
        1. 获取信号量（如果达到并发数，自动排队）
        2. 加载模型（懒加载）
        3. 在后台线程执行推理
        4. 释放信号量

        Args:
            model_id: 模型标识符
            input_data: 输入数据

        Returns:
            推理结果
        """
        async with self._semaphore:
            session = await self.load_model(model_id)

            # 在后台线程执行推理
            loop = asyncio.get_event_loop()
            result = await loop.run_in_executor(
                self._executor,
                session.run,
                None,
                {session.get_inputs()[0].name: input_data}
            )

            return result

    async def cleanup(self):
        """清理所有模型"""
        logger.info("Cleaning up ModelLoader...")
        self._models.clear()
        self._executor.shutdown(wait=True)
        logger.info("ModelLoader cleanup completed")

    def get_queue_size(self) -> int:
        """
        获取当前队列大小

        Returns:
            可用的信号量数量
        """
        return self._semaphore._value if self._semaphore else 0

    def get_loaded_models(self) -> list[str]:
        """
        获取已加载的模型列表

        Returns:
            模型 ID 列表
        """
        return list(self._models.keys())
