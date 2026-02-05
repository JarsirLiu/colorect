"""
抠图 API 路由

提供图像分割 RESTful 接口。
"""
from fastapi import APIRouter, HTTPException, Request
from fastapi.responses import StreamingResponse
from PIL import Image
import io
import urllib.parse
import logging
from typing import Optional

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/cutout", tags=["抠图工具"])

_cutout_service = None


def get_cutout_service():
    global _cutout_service
    if _cutout_service is None:
        from app.modules.cutout.service import CutoutService
        _cutout_service = CutoutService()
    return _cutout_service


def parse_multipart_form_data(body: bytes, content_type: str) -> dict:
    """解析 multipart/form-data"""
    import email
    from io import BytesIO
    
    result = {}
    
    try:
        if 'boundary' not in content_type:
            return result
            
        boundary = content_type.split('boundary=')[1]
        if '"' in boundary:
            boundary = boundary.split('"')[0]
        
        parts = body.split(b'--' + boundary.encode())
        
        for part in parts:
            if not part or part == b'--\r\n' or part == b'--':
                continue
                
            if b'\r\n\r\n' not in part:
                continue
                
            header_str, content = part.split(b'\r\n\r\n', 1)
            content = content.rstrip(b'\r\n--')
            
            header_str = header_str.decode('utf-8', errors='ignore')
            
            filename = None
            content_type_part = None
            
            if 'filename=' in header_str:
                import re
                filename_match = re.search(r'filename="([^"]*)"', header_str)
                if filename_match:
                    filename = filename_match.group(1)
                    
            if 'Content-Type:' in header_str:
                import re
                ct_match = re.search(r'Content-Type:\s*([^\r\n]+)', header_str)
                if ct_match:
                    content_type_part = ct_match.group(1).strip()
            
            if filename:
                result['file'] = {
                    'filename': filename,
                    'content_type': content_type_part,
                    'content': content
                }
                break
                
    except Exception as e:
        logger.error(f"解析 multipart 失败: {e}")
        
    return result


@router.post("/segment")
async def segment_image(request: Request):
    """图像分割接口"""
    try:
        content_type = request.headers.get("content-type", "")
        
        if "multipart/form-data" not in content_type:
            raise HTTPException(status_code=400, detail="需要 multipart/form-data")
        
        body = await request.body()
        
        parsed = parse_multipart_form_data(body, content_type)
        
        if 'file' not in parsed:
            raise HTTPException(status_code=400, detail="未找到文件")
        
        file_info = parsed['file']
        contents = file_info['content']
        filename = file_info['filename']
        content_type_file = file_info['content_type']
        
        if len(contents) == 0:
            raise HTTPException(status_code=400, detail="文件内容为空")
        
        input_image = Image.open(io.BytesIO(contents))
        
        if input_image.mode != "RGB":
            input_image = input_image.convert("RGB")
        
        service = get_cutout_service()
        output_image = await service.process(input_image)
        
        output_buffer = io.BytesIO()
        output_image.save(output_buffer, format="PNG")
        output_buffer.seek(0)
        
        encoded_filename = urllib.parse.quote(f"{filename}_no_bg.png")
        
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
async def cutout_health():
    """抠图服务健康检查"""
    service = get_cutout_service()
    return await service.health_check()
