"""
任务队列抽象接口

定义任务队列的统一接口，支持不同的实现。
"""
from abc import ABC, abstractmethod
from dataclasses import dataclass
from enum import Enum
from typing import Optional


class TaskPriority(Enum):
    """任务优先级"""
    LOW = 0
    NORMAL = 1
    HIGH = 2
    URGENT = 3


@dataclass
class Task:
    """任务"""
    id: str
    type: str
    payload: dict
    priority: TaskPriority = TaskPriority.NORMAL


class ITaskQueue(ABC):
    """任务队列接口"""

    @abstractmethod
    async def enqueue(self, task: Task) -> str:
        """
        入队

        Args:
            task: 任务对象

        Returns:
            任务 ID
        """
        pass

    @abstractmethod
    async def dequeue(self) -> Optional[Task]:
        """
        出队

        Returns:
            任务对象，如果队列为空返回 None
        """
        pass

    @abstractmethod
    async def get_queue_size(self) -> int:
        """
        获取队列大小

        Returns:
            队列中任务数量
        """
        pass

    @abstractmethod
    async def clear(self):
        """清空队列"""
        pass
