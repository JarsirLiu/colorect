"""
工具管理端点
"""
from fastapi import APIRouter, HTTPException, Depends, Request, Query
from sqlalchemy.ext.asyncio import AsyncSession

from app.dependencies.deps import get_db, get_client_ip, get_user_agent
from app.modules.tools.service import tool_service
from app.modules.tools.schemas import (
    ToolListResponse,
    ToolDetailResponse,
    ToolRefreshResponse
)

router = APIRouter()


@router.get("", response_model=ToolListResponse, summary="获取所有工具列表")
async def get_tools():
    """
    获取所有已启用的工具列表

    Returns:
        ToolListResponse: 工具列表
    """
    tools = tool_service.load_tools()
    return ToolListResponse(success=True, tools=tools)


@router.get("/{tool_id}", response_model=ToolDetailResponse, summary="获取工具详情")
async def get_tool(tool_id: str):
    """
    根据工具ID获取工具详情

    Args:
        tool_id: 工具ID

    Returns:
        ToolDetailResponse: 工具详情

    Raises:
        HTTPException: 工具不存在时抛出404错误
    """
    tool = tool_service.get_tool_by_id(tool_id)

    if not tool:
        raise HTTPException(status_code=404, detail=f"Tool {tool_id} not found")

    return ToolDetailResponse(success=True, tool=tool)


@router.post("/refresh", response_model=ToolRefreshResponse, summary="刷新工具缓存")
async def refresh_tools():
    """
    刷新工具配置缓存

    当工具配置文件更新后，调用此接口重新加载配置

    Returns:
        ToolRefreshResponse: 刷新结果
    """
    tool_service.clear_cache()
    tools = tool_service.load_tools()

    return ToolRefreshResponse(
        success=True,
        message="Tools cache refreshed",
        tools_count=len(tools)
    )


@router.post("/record", summary="记录工具使用")
async def record_usage(
    request: Request,
    db: AsyncSession = Depends(get_db)
):
    """
    记录工具使用情况

    Args:
        request: FastAPI 请求对象
        db: 数据库会话（依赖注入）

    Returns:
        记录ID

    Raises:
        HTTPException: 参数错误时抛出400错误
    """
    try:
        from app.modules.tools.crud import tool_usage_crud

        # 解析请求体
        data = await request.json()

        tool_id = data.get("tool_id")
        tool_name = data.get("tool_name")
        anonymous_id = data.get("anonymous_id")
        extra_data = data.get("extra_data")

        if not tool_id or not tool_name:
            raise HTTPException(status_code=400, detail="tool_id and tool_name are required")

        # 获取客户端信息
        ip_address = get_client_ip(request)
        user_agent = get_user_agent(request)

        # 创建使用记录
        usage = await tool_usage_crud.create(
            db=db,
            tool_id=tool_id,
            tool_name=tool_name,
            ip_address=ip_address,
            user_agent=user_agent,
            anonymous_id=anonymous_id,
            extra_data=extra_data
        )

        await db.commit()

        return {
            "success": True,
            "usage_id": usage.id
        }

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/usage/list", summary="获取工具使用记录")
async def get_usage_list(
    tool_id: str = Query(None, description="工具ID"),
    skip: int = Query(0, ge=0, description="跳过数量"),
    limit: int = Query(100, ge=1, le=1000, description="返回数量"),
    db: AsyncSession = Depends(get_db)
):
    """
    获取工具使用记录列表

    Args:
        tool_id: 工具ID（可选）
        skip: 跳过数量
        limit: 返回数量
        db: 数据库会话

    Returns:
        使用记录列表
    """
    from app.modules.tools.crud import tool_usage_crud
    from app.modules.tools.schemas import ToolUsageResponse

    if tool_id:
        usages = await tool_usage_crud.get_by_tool_id(db, tool_id=tool_id, limit=limit)
    else:
        usages = await tool_usage_crud.get_multi(db, skip=skip, limit=limit)

    return {
        "success": True,
        "items": [ToolUsageResponse.model_validate(u) for u in usages],
        "total": len(usages)
    }
