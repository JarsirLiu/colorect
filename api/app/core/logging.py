"""
日志配置
"""
import logging
import sys
from app.core.config import settings


def setup_logging():
    """配置日志系统"""

    log_level = getattr(logging, settings.LOG_LEVEL.upper(), logging.INFO)

    # 配置根日志记录器
    logging.basicConfig(
        level=log_level,
        format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
        handlers=[
            logging.StreamHandler(sys.stdout)
        ]
    )

    return logging.getLogger(__name__)


logger = setup_logging()
