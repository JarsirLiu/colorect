"""
抠图服务模块

提供图像分割业务逻辑，使用 RMBG 1.4 模型进行背景移除。

改进点：
1. 使用统一的 ModelLoader 管理模型
2. 自动排队和并发控制
3. 支持资源管理
"""
import logging

import numpy as np
from PIL import Image

from app.core.constants import CUTOUT_DEFAULT_SIZE, CUTOUT_MODEL_PATH
from app.infrastructure.models import IModelLoader


logger = logging.getLogger(__name__)


class CutoutService:
    """抠图服务类"""

    def __init__(self, model_loader: IModelLoader):
        """
        初始化服务

        Args:
            model_loader: 模型加载器
        """
        self._model_loader = model_loader
        self._model_id = str(CUTOUT_MODEL_PATH)

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

    async def _predict(self, img: Image.Image) -> Image.Image:
        """
        模型预测（异步，自动排队）
        """
        input_data = self._normalize_image(img, target_size=CUTOUT_DEFAULT_SIZE)

        # 调用模型加载器进行推理（自动排队）
        ort_outs = await self._model_loader.infer(
            model_id=self._model_id,
            input_data=input_data
        )

        pred = ort_outs[0]

        if len(pred.shape) == 4:
            pred = pred[0, 0, :, :]
        elif len(pred.shape) == 3:
            pred = pred[0, :, :]

        ma = np.max(pred)
        mi = np.min(pred)
        pred = (pred - mi) / (ma - mi) if ma - mi > 0 else np.zeros_like(pred)

        mask = Image.fromarray((pred * 255).astype("uint8"), mode="L")
        mask = mask.resize(img.size, Image.LANCZOS)

        return mask

    async def process(self, image: Image.Image) -> Image.Image:
        """
        处理图像并移除背景

        Args:
            image: 输入图像 (PIL.Image)

        Returns:
            带透明背景的图像 (PIL.Image)
        """
        input_image = image.convert("RGB")

        logger.info(f"Processing image: {input_image.size}")

        # 推理（自动排队）
        mask = await self._predict(input_image)

        output_image = input_image.convert("RGBA")
        output_image.putalpha(mask)

        logger.info("Image processing completed")

        return output_image

    async def health_check(self) -> dict:
        """健康检查"""
        return {
            "service": "CutoutService",
            "model_loaded": self._model_id in self._model_loader.get_loaded_models(),
            "queue_size": self._model_loader.get_queue_size(),
        }
