"""
FastAPI 主应用入口
"""
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from contextlib import asynccontextmanager
import logging

from app.core.config import settings
from app.core.logging import setup_logging
from app.db.init_db import init_db
from app.api.v1.api import api_router

# 配置日志
logger = setup_logging()


@asynccontextmanager
async def lifespan(app: FastAPI):
    """应用生命周期管理"""
    from app.modules.cutout.router import _cutout_service

    # 启动时
    logger.info("Starting Center API...")

    # 初始化数据库
    try:
        await init_db()
        logger.info("Database initialized")
    except Exception as e:
        logger.error(f"Failed to initialize database: {e}")
        raise

    yield

    # 关闭时清理模型资源
    logger.info("Shutting down Center API...")
    if _cutout_service._session is not None:
        await _cutout_service.cleanup()
        logger.info("Model resources released")


# 创建 FastAPI 应用
app = FastAPI(
    title="Center API",
    description="工具箱核心后端服务",
    version="1.0.0",
    lifespan=lifespan,
    docs_url="/docs",
    redoc_url="/redoc"
)

# 配置 CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=settings.CORS_ALLOW_CREDENTIALS,
    allow_methods=["*"],
    allow_headers=["*"],
)


# 全局异常处理
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    """全局异常处理"""
    logger.error(f"Unhandled exception: {exc}", exc_info=True)
    return JSONResponse(
        status_code=500,
        content={
            "success": False,
            "error": "Internal server error",
            "detail": str(exc) if settings.LOG_LEVEL == "DEBUG" else None
        }
    )


# 健康检查
@app.get("/health", tags=["系统"])
async def health_check():
    """健康检查接口"""
    return {
        "status": "healthy",
        "version": "1.0.0",
        "service": "center-api"
    }


# 根路径
@app.get("/", tags=["系统"])
async def root():
    """根路径"""
    return {
        "name": "Center API",
        "version": "1.0.0",
        "description": "工具箱核心后端服务",
        "docs": "/docs",
        "redoc": "/redoc"
    }


# 注册 API 路由
app.include_router(api_router, prefix="/api/v1")


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(
        "app.main:app",
        host=settings.HOST,
        port=settings.PORT,
        reload=settings.LOG_LEVEL == "DEBUG",
        workers=settings.WORKERS if settings.LOG_LEVEL != "DEBUG" else 1
    )
