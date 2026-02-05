"""
抠图服务模块

提供图像分割业务逻辑，使用 RMBG 1.4 模型进行背景移除。
"""
from typing import Optional
from pathlib import Path
import logging

from PIL import Image
import numpy as np
import onnxruntime as ort

logger = logging.getLogger(__name__)

# 项目根目录（相对于此文件向上 3 级）
PROJECT_ROOT = Path(__file__).parent.parent.parent.parent.resolve()


class CutoutService:
    """抠图服务类"""
    
    MODEL_PATH = PROJECT_ROOT / "data" / "models" / "model.onnx"
    DEFAULT_SIZE = 1024
    
    def __init__(self):
        self._session: Optional[ort.InferenceSession] = None
    
    def _normalize_image(self, img: Image.Image, target_size: int = 1024) -> np.ndarray:
        """
        图像归一化预处理
        使用 pixel / 255 - 0.5 的归一化方式
        """
        im = img.convert("RGB").resize((target_size, target_size), Image.LANCZOS)
        im_ary = np.array(im, dtype=np.float32)
        
        im_ary = im_ary / 255.0
        im_ary = im_ary - 0.5
        im_ary = im_ary.transpose((2, 0, 1))
        im_ary = np.expand_dims(im_ary, 0)
        
        return im_ary
    
    def _predict(self, img: Image.Image) -> Image.Image:
        """
        模型预测
        """
        input_data = self._normalize_image(img, target_size=1024)
        
        input_name = self._session.get_inputs()[0].name
        ort_outs = self._session.run(None, {input_name: input_data})
        
        pred = ort_outs[0]
        
        if len(pred.shape) == 4:
            pred = pred[0, 0, :, :]
        elif len(pred.shape) == 3:
            pred = pred[0, :, :]
        
        ma = np.max(pred)
        mi = np.min(pred)
        if ma - mi > 0:
            pred = (pred - mi) / (ma - mi)
        else:
            pred = np.zeros_like(pred)
        
        mask = Image.fromarray((pred * 255).astype("uint8"), mode="L")
        mask = mask.resize(img.size, Image.LANCZOS)
        
        return mask
    
    async def initialize(self) -> None:
        """初始化模型"""
        if self._session is None:
            self._session = ort.InferenceSession(str(self.MODEL_PATH))
    
    async def process(self, image: Image.Image) -> Image.Image:
        """
        处理图像并移除背景
        
        Args:
            image: 输入图像 (PIL.Image)
            
        Returns:
            带透明背景的图像 (PIL.Image)
        """
        await self.initialize()
        
        input_image = image.convert("RGB")
        
        logger.info(f"Processing image: {input_image.size}")
        
        mask = self._predict(input_image)
        
        output_image = input_image.convert("RGBA")
        output_image.putalpha(mask)
        
        logger.info("Image processing completed")
        
        return output_image
    
    async def cleanup(self) -> None:
        """清理资源"""
        if self._session is not None:
            self._session = None
    
    async def health_check(self) -> dict:
        """健康检查"""
        return {
            "status": "healthy",
            "model_loaded": self._session is not None
        }
