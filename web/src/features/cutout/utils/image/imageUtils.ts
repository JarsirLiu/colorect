import { BoundingBox } from '../../types';

export const cropSelectedArea = (imageUrl: string, bbox: BoundingBox): Promise<{ blob: Blob; bbox: BoundingBox }> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = (): void => {
      const cropCanvas = document.createElement('canvas');
      const width = Math.round(bbox.width);
      const height = Math.round(bbox.height);
      const x = Math.round(bbox.x);
      const y = Math.round(bbox.y);

      cropCanvas.width = width;
      cropCanvas.height = height;
      const ctx = cropCanvas.getContext('2d');

      if (!ctx) {
        reject(new Error('无法获取 Canvas 上下文'));
        return;
      }

      ctx.imageSmoothingEnabled = false;

      ctx.drawImage(
        img,
        x, y, width, height,
        0, 0, width, height
      );

      cropCanvas.toBlob((blob) => {
        if (blob) {
          resolve({ blob, bbox });
        } else {
          reject(new Error('图片裁剪失败'));
        }
      }, 'image/png');
    };
    img.onerror = (): void => {
      reject(new Error('图片加载失败'));
    };
    img.crossOrigin = 'anonymous';
    img.src = imageUrl;
  });
};
