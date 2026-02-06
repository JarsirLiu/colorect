import { PreprocessOptions, PreprocessResult } from '../../types';

const DEFAULT_CONFIG = {
  maxSize: 2048,
  quality: 0.85,
  format: 'image/jpeg' as const
};

export const preprocessImage = async (
  file: File,
  options: PreprocessOptions = {}
): Promise<PreprocessResult> => {
  const config = { ...DEFAULT_CONFIG, ...options };

  return new Promise((resolve, reject) => {
    const img = new Image();
    const objectUrl = URL.createObjectURL(file);

    const cleanup = (): void => {
      URL.revokeObjectURL(objectUrl);
    };

    try {
      img.onload = (): void => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');

        if (!ctx) {
          cleanup();
          reject(new Error('无法获取 Canvas 上下文'));
          return;
        }

        const originalWidth = img.width;
        const originalHeight = img.height;

        const scale = Math.min(1, config.maxSize / Math.max(originalWidth, originalHeight));
        const width = Math.round(originalWidth * scale);
        const height = Math.round(originalHeight * scale);

        canvas.width = width;
        canvas.height = height;

        ctx.drawImage(img, 0, 0, width, height);

        canvas.toBlob(
          (blob) => {
            if (blob) {
              const ext = config.format === 'image/jpeg' ? '.jpg' : 
                          config.format === 'image/png' ? '.png' : '.webp';
              const baseName = file.name.replace(/\.[^/.]+$/, '');
              const processedFile = new File([blob], `${baseName}${ext}`, {
                type: config.format,
                lastModified: Date.now()
              });

              cleanup();
              resolve({
                file: processedFile,
                originalSize: { width: originalWidth, height: originalHeight },
                processedSize: { width, height },
                compressionRatio: blob.size / file.size
              });
            } else {
              cleanup();
              reject(new Error('图片处理失败'));
            }
          },
          config.format,
          config.quality
        );
      };
      
      img.onerror = (): void => {
        cleanup();
        reject(new Error('图片加载失败'));
      };
      
      img.src = objectUrl;
    } catch (error) {
      cleanup();
      reject(error);
    }
  });
};
