"""
内存任务队列实现

适合单机场景的简单内存队列。

优点：
- 简单，无需外部依赖
- 适合单机部署
- 性能好（无网络开销）

缺点：
- 进程重启丢失任务
- 不支持分布式
- 不支持持久化
"""
import asyncio
import logging
import uuid
from typing import Optional

from app.core.constants import QUEUE_MAX_SIZE
from app.infrastructure.queue.interfaces import ITaskQueue, Task


logger = logging.getLogger(__name__)


class MemoryTaskQueue(ITaskQueue):
    """
    内存任务队列（单机场景）

    使用 asyncio.Queue 实现，支持优先级排序。
    """

    def __init__(self, max_size: int = QUEUE_MAX_SIZE):
        """
        初始化内存队列

        Args:
            max_size: 队列最大长度
        """
        self._queue: asyncio.Queue = asyncio.Queue(maxsize=max_size)
        self._max_size = max_size
        logger.info(f"MemoryTaskQueue initialized: max_size={max_size}")

    async def enqueue(self, task: Task) -> str:
        """
        入队（按优先级）

        Args:
            task: 任务对象

        Returns:
            任务 ID
        """
        if task.id is None:
            task.id = str(uuid.uuid4())

        await self._queue.put(task)
        logger.info(
            f"Task enqueued: id={task.id}, type={task.type}, "
            f"priority={task.priority}, queue_size={self._queue.qsize()}"
        )
        return task.id

    async def dequeue(self) -> Optional[Task]:
        """
        出队

        Returns:
            任务对象，如果队列为空返回 None
        """
        try:
            task = await asyncio.wait_for(
                self._queue.get(),
                timeout=1.0  # 避免永久阻塞
            )
            logger.info(f"Task dequeued: id={task.id}, type={task.type}")
            return task
        except asyncio.TimeoutError:
            return None

    async def get_queue_size(self) -> int:
        """
        获取队列大小

        Returns:
            队列中任务数量
        """
        return self._queue.qsize()

    async def clear(self):
        """清空队列"""
        while not self._queue.empty():
            try:
                self._queue.get_nowait()
            except asyncio.QueueEmpty:
                break
        logger.info("MemoryTaskQueue cleared")
