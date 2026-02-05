import { useState, useEffect, useRef } from 'react';

interface UseCanvasLayoutOptions {
  imageUrl: string | null;
  resultImage: string | null;
}

interface UseCanvasLayoutReturn {
  canvasScale: number;
  canvasRef: React.RefObject<HTMLCanvasElement>;
  imageRef: React.RefObject<HTMLImageElement>;
}

/**
 * Canvas 布局同步 Hook
 * 负责管理 Canvas 与图片的布局同步，包括：
 * - Canvas 绘图分辨率与图片原始像素同步
 * - Canvas 显示尺寸与图片显示尺寸同步
 * - 响应式布局调整
 */
export const useCanvasLayout = (
  options: UseCanvasLayoutOptions
): UseCanvasLayoutReturn => {
  const { imageUrl, resultImage } = options;
  const [canvasScale, setCanvasScale] = useState(1);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    if (!imageUrl || !imageRef.current || !canvasRef.current) return;

    const syncLayout = () => {
      const img = imageRef.current;
      const canvas = canvasRef.current;
      if (!img || !canvas) return;

      // 同步 Canvas 的绘图分辨率到图片的原始像素
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;

      // 同步 Canvas 的 CSS 显示尺寸到图片的当前显示尺寸
      canvas.style.width = `${img.offsetWidth}px`;
      canvas.style.height = `${img.offsetHeight}px`;

      // 计算缩放比，用于调整画笔粗细（原始宽度 / 显示宽度）
      const scale = img.naturalWidth / img.offsetWidth;
      setCanvasScale(scale);
    };

    // 初始化同步
    const imgElement = imageRef.current;
    if (imgElement.complete) {
      syncLayout();
    } else {
      imgElement.onload = syncLayout;
    }

    // 监听 Resize
    const resizeObserver = new ResizeObserver(() => {
      syncLayout();
    });

    resizeObserver.observe(imgElement);
    window.addEventListener('resize', syncLayout);

    return () => {
      resizeObserver.disconnect();
      window.removeEventListener('resize', syncLayout);
    };
  }, [imageUrl, resultImage]);

  return {
    canvasScale,
    canvasRef,
    imageRef,
  };
};
