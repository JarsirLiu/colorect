"""
API 网关代理端点
"""
from fastapi import APIRouter, Request, HTTPException, Response
from app.modules.tools.service import tool_service
from app.utils.http_client import http_client
import httpx

router = APIRouter()


@router.api_route("/{tool_id}/{path:path}", methods=["GET", "POST", "PUT", "DELETE", "PATCH"], summary="代理请求到工具服务")
async def proxy_to_tool(tool_id: str, path: str, request: Request):
    """
    代理请求到工具服务

    Args:
        tool_id: 工具ID
        path: 请求路径
        request: FastAPI 请求对象

    Returns:
        工具服务的响应

    Raises:
        HTTPException: 工具不存在或代理失败时抛出错误
    """
    # 获取工具配置
    tool = tool_service.get_tool_by_id(tool_id)

    if not tool:
        raise HTTPException(status_code=404, detail=f"Tool {tool_id} not found")

    # 获取工具后端 URL
    backend_url = tool_service.get_tool_url(tool_id)

    if not backend_url:
        raise HTTPException(status_code=500, detail=f"Tool {tool_id} backend URL not configured")

    # 构建完整目标 URL
    target_url = f"{backend_url}/{path}"

    # 准备请求头（排除特定头）
    headers = {
        key: value for key, value in request.headers.items()
        if key.lower() not in ["host", "content-length", "transfer-encoding", "connection"]
    }

    # 准备请求体
    content_type = request.headers.get("content-type", "")
    body = await request.body()

    try:
        # 使用 httpx 异步客户端
        async with httpx.AsyncClient(timeout=60.0) as client:
            if "multipart/form-data" in content_type:
                # 对于 multipart/form-data，使用原始数据
                response = await client.request(
                    method=request.method,
                    url=target_url,
                    headers=headers,
                    content=body,
                    params=request.query_params
                )
            else:
                # 其他请求类型
                response = await client.request(
                    method=request.method,
                    url=target_url,
                    headers=headers,
                    content=body,
                    params=request.query_params
                )

        # 返回响应
        response_content_type = response.headers.get("content-type", "application/json")

        if "application/json" in response_content_type:
            return response.json()
        elif "image/" in response_content_type or "application/octet-stream" in response_content_type:
            # 对于图片或二进制文件，直接返回原始内容
            return Response(
                content=response.content,
                status_code=response.status_code,
                media_type=response_content_type,
                headers={
                    key: value for key, value in response.headers.items()
                    if key.lower() not in ["content-length", "transfer-encoding", "connection"]
                }
            )
        else:
            return {
                "status_code": response.status_code,
                "headers": dict(response.headers),
                "content": response.text
            }

    except Exception as e:
        import traceback
        error_detail = f"Proxy error: {str(e)}\n{traceback.format_exc()}"
        print(error_detail)  # 打印详细错误信息
        raise HTTPException(status_code=500, detail=f"Proxy error: {str(e)}")
