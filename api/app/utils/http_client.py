"""
HTTP 客户端工具
"""
import logging
from typing import Any, Optional

import httpx


logger = logging.getLogger(__name__)


class HTTPClient:
    """异步 HTTP 客户端"""

    def __init__(self, timeout: float = 30.0):
        self.timeout = timeout

    async def request(
        self,
        method: str,
        url: str,
        headers: Optional[dict[str, str]] = None,
        params: Optional[dict[str, Any]] = None,
        json: Optional[dict[str, Any]] = None,
        data: Optional[bytes] = None
    ) -> httpx.Response:
        """
        发送 HTTP 请求

        Args:
            method: HTTP 方法
            url: 请求 URL
            headers: 请求头
            params: 查询参数
            json: JSON 请求体
            data: 二进制请求体

        Returns:
            httpx.Response: 响应对象
        """
        async with httpx.AsyncClient(timeout=self.timeout) as client:
            try:
                response = await client.request(
                    method=method,
                    url=url,
                    headers=headers or {},
                    params=params,
                    json=json,
                    content=data
                )
                return response
            except httpx.TimeoutException:
                logger.error(f"Request timeout: {method} {url}")
                raise
            except httpx.RequestException as e:
                logger.error(f"Request failed: {method} {url} - {e}")
                raise


# 全局 HTTP 客户端实例
http_client = HTTPClient()
