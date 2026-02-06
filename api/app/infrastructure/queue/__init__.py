"""
基础设施层 - 任务队列

提供统一的任务排队机制，支持多种实现（内存、Redis）。
"""

from app.infrastructure.queue.interfaces import ITaskQueue, Task, TaskPriority
from app.infrastructure.queue.memory_queue import MemoryTaskQueue


__all__ = ["ITaskQueue", "Task", "TaskPriority", "MemoryTaskQueue"]
