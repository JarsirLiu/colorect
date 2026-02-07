/**
 * Canvas 图像处理工具函数
 */

import { BgColor, PhotoSize } from '../types';
import { BG_COLOR_OPTIONS, PHOTO_SIZE_OPTIONS } from '../constants';

/**
 * 将图像调整到指定尺寸并居中裁剪
 * @param imageUrl 原始图片 URL
 * @param targetSize 目标尺寸 { width, height }
 * @returns 处理后的图片 Blob URL
 */
export const resizeImage = async (
  imageUrl: string,
  targetSize: { width: number; height: number }
): Promise<string> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';

    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');

      if (!ctx) {
        reject(new Error('Failed to get canvas context'));
        return;
      }

      // 设置目标尺寸
      canvas.width = targetSize.width;
      canvas.height = targetSize.height;

      // 计算缩放比例（保持比例）
      const originalWidth = img.width;
      const originalHeight = img.height;
      const scale = Math.max(
        targetSize.width / originalWidth,
        targetSize.height / originalHeight
      );

      const newWidth = Math.round(originalWidth * scale);
      const newHeight = Math.round(originalHeight * scale);

      // 计算居中裁剪位置
      const x = Math.round((newWidth - targetSize.width) / 2);
      const y = Math.round((newHeight - targetSize.height) / 2);

      // 绘制缩放并居中裁剪的图片
      ctx.drawImage(
        img,
        -x,
        -y,
        newWidth,
        newHeight
      );

      // 转换为 Blob URL
      canvas.toBlob((blob) => {
        if (blob) {
          const url = URL.createObjectURL(blob);
          resolve(url);
        } else {
          reject(new Error('Failed to create blob'));
        }
      }, 'image/png');
    };

    img.onerror = () => {
      reject(new Error('Failed to load image'));
    };

    img.src = imageUrl;
  });
};

/**
 * 为透明背景图片添加背景色
 * @param imageUrl 透明背景图片 URL
 * @param bgColor 背景颜色
 * @returns 合成背景后的图片 Blob URL
 */
export const composeBackground = async (
  imageUrl: string,
  bgColor: BgColor
): Promise<string> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';

    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');

      if (!ctx) {
        reject(new Error('Failed to get canvas context'));
        return;
      }

      // 设置画布尺寸
      canvas.width = img.width;
      canvas.height = img.height;

      // 查找背景色配置
      const bgColorConfig = BG_COLOR_OPTIONS.find(opt => opt.value === bgColor);
      if (!bgColorConfig) {
        reject(new Error('Invalid background color'));
        return;
      }

      // 填充背景色
      ctx.fillStyle = bgColorConfig.hex;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // 绘制透明背景图片
      ctx.drawImage(img, 0, 0);

      // 转换为 Blob URL（JPEG 格式，质量 95%）
      canvas.toBlob((blob) => {
        if (blob) {
          const url = URL.createObjectURL(blob);
          resolve(url);
        } else {
          reject(new Error('Failed to create blob'));
        }
      }, 'image/jpeg', 0.95);
    };

    img.onerror = () => {
      reject(new Error('Failed to load image'));
    };

    img.src = imageUrl;
  });
};

/**
 * 生成最终证件照（先合成背景色，再调整尺寸）
 * @param transparentImageUrl 透明背景图片 URL
 * @param bgColor 背景颜色
 * @param photoSize 证件照尺寸
 * @returns 最终证件照 Blob URL
 */
export const generateIdPhoto = async (
  transparentImageUrl: string,
  bgColor: BgColor,
  photoSize: PhotoSize
): Promise<string> => {
  // 1. 先合成背景色（在原始尺寸上）
  const bgColorConfig = BG_COLOR_OPTIONS.find(opt => opt.value === bgColor);
  if (!bgColorConfig) {
    throw new Error('Invalid background color');
  }

  // 2. 合成背景色
  const composedImageUrl = await composeBackground(transparentImageUrl, bgColor);

  // 3. 调整到目标尺寸
  const sizeConfig = PHOTO_SIZE_OPTIONS.find(opt => opt.value === photoSize);
  if (!sizeConfig) {
    throw new Error('Invalid photo size');
  }

  // 4. 调整尺寸（保持比例，居中裁剪）
  const finalImageUrl = await resizeImage(composedImageUrl, sizeConfig.size);

  // 5. 清理临时 URL
  URL.revokeObjectURL(composedImageUrl);

  return finalImageUrl;
};

/**
 * 下载图片
 * @param imageUrl 图片 URL
 * @param filename 文件名
 */
export const downloadImage = (imageUrl: string, filename: string): void => {
  const link = document.createElement('a');
  link.href = imageUrl;
  link.download = filename;
  link.click();
};

/**
 * 清理 Blob URL
 * @param url Blob URL
 */
export const revokeBlobUrl = (url: string | null): void => {
  if (url && url.startsWith('blob:')) {
    URL.revokeObjectURL(url);
  }
};
