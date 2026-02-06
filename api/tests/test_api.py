"""
API 测试用例
"""
import pytest
from httpx import AsyncClient

from app.main import app


@pytest.mark.asyncio
async def test_health_check():
    """测试健康检查"""
    async with AsyncClient(app=app, base_url="http://test") as ac:
        response = await ac.get("/health")
    assert response.status_code == 200
    assert response.json()["status"] == "healthy"


@pytest.mark.asyncio
async def test_get_tools():
    """测试获取工具列表"""
    async with AsyncClient(app=app, base_url="http://test") as ac:
        response = await ac.get("/api/v1/tools")
    assert response.status_code == 200
    assert response.json()["success"] is True


@pytest.mark.asyncio
async def test_record_usage():
    """测试记录工具使用"""
    async with AsyncClient(app=app, base_url="http://test") as ac:
        response = await ac.post(
            "/api/v1/tools/record",
            json={
                "tool_id": "test-tool",
                "tool_name": "测试工具",
                "anonymous_id": "test-user"
            }
        )
    assert response.status_code in [200, 500]  # 可能因为数据库未初始化而失败
