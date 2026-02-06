"""
抠图 API 路由

提供图像分割 RESTful 接口。
"""
import io
import logging
import urllib.parse

from fastapi import APIRouter, Depends, HTTPException, Request, UploadFile
from fastapi.responses import StreamingResponse
from PIL import Image

from app.core.constants import MAX_UPLOAD_SIZE
from app.modules.cutout.service import CutoutService


logger = logging.getLogger(__name__)

router = APIRouter(prefix="/cutout", tags=["抠图工具"])


def get_cutout_service(request: Request) -> CutoutService:
    """从 app.state 获取抠图服务"""
    if not hasattr(request.app.state, 'cutout_service') or request.app.state.cutout_service is None:
        raise RuntimeError("CutoutService not initialized. Please check main.py")
    return request.app.state.cutout_service


@router.post("/segment")
async def segment_image(
    file: UploadFile,
    service: CutoutService = Depends(get_cutout_service)
):
    """图像分割接口"""
    try:
        contents = await file.read()
        if len(contents) == 0:
            raise HTTPException(status_code=400, detail="文件内容为空")

        if len(contents) > MAX_UPLOAD_SIZE * 1024 * 1024:
            raise HTTPException(status_code=413, detail=f"文件大小超过限制 {MAX_UPLOAD_SIZE}MB")

        input_image = Image.open(io.BytesIO(contents))
        if input_image.mode != "RGB":
            input_image = input_image.convert("RGB")

        output_image = await service.process(input_image)

        output_buffer = io.BytesIO()
        output_image.save(output_buffer, format="PNG")
        output_buffer.seek(0)

        encoded_filename = urllib.parse.quote(f"{file.filename}_no_bg.png")

        return StreamingResponse(
            output_buffer,
            media_type="image/png",
            headers={
                "Content-Disposition": f"attachment; filename*=UTF-8''{encoded_filename}"
            }
        )

    except HTTPException:
        raise
    except Exception as e:
        import traceback
        logger.error(f"错误: {e}\n{traceback.format_exc()}")
        raise HTTPException(status_code=500, detail=f"处理失败: {str(e)}")


@router.get("/health")
async def cutout_health(
    service: CutoutService = Depends(get_cutout_service)
):
    """抠图服务健康检查"""
    return await service.health_check()
