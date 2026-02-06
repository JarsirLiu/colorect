"""
应用配置管理
"""
from functools import lru_cache
from pathlib import Path

from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    """应用配置"""

    # 服务器配置（4核4G 单机优化）
    HOST: str = "0.0.0.0"
    PORT: int = 8000
    WORKERS: int = 1  # 单进程，避免重复加载模型

    # 数据库配置
    DATABASE_URL: str = "sqlite+aiosqlite:///./data/app.db"

    # CORS 配置
    CORS_ORIGINS: str = "*"
    CORS_ALLOW_CREDENTIALS: bool = True

    # 工具配置目录
    TOOLS_CONFIG_PATH: str = "tools_config"

    # 日志配置
    LOG_LEVEL: str = "INFO"

    # 模型配置
    MODEL_PATH: Path = Path("./data/models/model.onnx")

    # 单机资源限制配置
    MAX_CONCURRENT_INFERENCE: int = 2  # 最大并发推理数
    THREAD_POOL_SIZE: int = 2  # 线程池大小
    QUEUE_MAX_SIZE: int = 100  # 队列最大长度

    class Config:
        env_file = ".env"
        case_sensitive = True

    @property
    def cors_origins_list(self) -> list[str]:
        """将 CORS_ORIGINS 字符串转换为列表"""
        if self.CORS_ORIGINS == "*":
            return ["*"]
        return [origin.strip() for origin in self.CORS_ORIGINS.split(",")]


@lru_cache
def get_settings() -> Settings:
    """获取配置单例"""
    return Settings()


settings = get_settings()
