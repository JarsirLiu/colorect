"""
应用配置管理
"""
from pydantic_settings import BaseSettings
from functools import lru_cache
from typing import List
from pathlib import Path


class Settings(BaseSettings):
    """应用配置"""

    # 服务器配置
    HOST: str = "0.0.0.0"
    PORT: int = 8000
    WORKERS: int = 4

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

    class Config:
        env_file = ".env"
        case_sensitive = True

    @property
    def cors_origins_list(self) -> List[str]:
        """将 CORS_ORIGINS 字符串转换为列表"""
        if self.CORS_ORIGINS == "*":
            return ["*"]
        return [origin.strip() for origin in self.CORS_ORIGINS.split(",")]


@lru_cache()
def get_settings() -> Settings:
    """获取配置单例"""
    return Settings()


settings = get_settings()
