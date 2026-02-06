"""
日志配置模块

遵循 DEVELOPMENT_GUIDE.md 规范：
- 使用标准 logging 模块
- 日志格式：%(asctime)s - %(name)s - %(levelname)s - %(message)s
- 统一日志文件输出（按大小轮转，最大10MB，保留5个备份）
"""
import logging
import logging.handlers
import sys
from pathlib import Path

from app.core.config import settings


_logging_initialized = False


# 日志目录
LOG_DIR = Path("./logs")
LOG_DIR.mkdir(exist_ok=True)


def setup_logging():
    """
    配置日志系统
    
    特性：
    - 控制台输出
    - 统一文件输出（按大小轮转，最大10MB，保留5个备份）
    
    Returns:
        logging.Logger: 配置好的日志记录器
    """
    
    global _logging_initialized
    
    if _logging_initialized:
        return logging.getLogger(__name__)
    
    _logging_initialized = True
    
    log_level = getattr(logging, settings.LOG_LEVEL.upper(), logging.INFO)
    
    # 日志格式（遵循开发规范）
    log_format = '%(asctime)s - %(name)s - %(levelname)s - %(message)s'
    detailed_format = '%(asctime)s - %(name)s - %(levelname)s - [%(filename)s:%(lineno)d] - %(message)s'
    
    # 时间格式（与规范一致）
    date_format = '%Y-%m-%d %H:%M:%S'
    
    # 创建根日志记录器
    root_logger = logging.getLogger()
    root_logger.setLevel(log_level)
    
    # 清除已有的处理器
    root_logger.handlers.clear()
    
    # ============================================
    # 控制台处理器
    # ============================================
    console_handler = logging.StreamHandler(sys.stdout)
    console_handler.setLevel(log_level)
    console_formatter = logging.Formatter(log_format, datefmt=date_format)
    console_handler.setFormatter(console_formatter)
    root_logger.addHandler(console_handler)
    
    # ============================================
    # 文件处理器 - 统一日志（按大小轮转）
    # ============================================
    # 最大 10MB，保留 5 个备份
    main_log_file = LOG_DIR / "app.log"
    file_handler = logging.handlers.RotatingFileHandler(
        filename=main_log_file,
        maxBytes=10 * 1024 * 1024,
        backupCount=5,
        encoding='utf-8'
    )
    file_handler.setLevel(log_level)
    file_formatter = logging.Formatter(detailed_format, datefmt=date_format)
    file_handler.setFormatter(file_formatter)
    root_logger.addHandler(file_handler)
    
    # ============================================
    # 第三方库日志级别设置
    # ============================================
    logging.getLogger("uvicorn").setLevel(logging.INFO)
    logging.getLogger("uvicorn.access").setLevel(logging.WARNING)
    logging.getLogger("fastapi").setLevel(logging.INFO)
    logging.getLogger("sqlalchemy").setLevel(logging.WARNING)
    
    # 记录初始化信息
    logger = logging.getLogger(__name__)
    logger.info("Logging system initialized")
    logger.info(f"Log directory: {LOG_DIR.absolute()}")
    logger.info(f"Log level: {settings.LOG_LEVEL}")
    
    return logger


def get_logger(name: str) -> logging.Logger:
    """
    获取指定名称的日志记录器
    
    Args:
        name: 日志记录器名称（通常使用 __name__）
        
    Returns:
        logging.Logger: 日志记录器实例
    """
    return logging.getLogger(name)


class RequestLogger:
    """请求日志记录器
    
    用于记录 HTTP 请求的详细信息，包括方法、路径、IP、状态码和耗时。
    
    使用示例：
        logger = RequestLogger()
        logger.log_request("POST", "/api/v1/cutout", "192.168.1.1", 200, 1234.5)
    """
    
    def __init__(self, logger_name: str = "app.requests"):
        """
        初始化请求日志记录器
        
        Args:
            logger_name: 日志记录器名称
        """
        self.logger = get_logger(logger_name)
    
    def log_request(self, method: str, path: str, client_ip: str, 
                   status_code: int, duration_ms: float):
        """
        记录请求日志
        
        Args:
            method: HTTP 方法（GET, POST, PUT, DELETE 等）
            path: 请求路径
            client_ip: 客户端 IP 地址
            status_code: HTTP 状态码
            duration_ms: 请求处理耗时（毫秒）
        """
        self.logger.info(
            f"{method} {path} - {client_ip} - "
            f"{status_code} - {duration_ms:.2f}ms"
        )


logger = setup_logging()


