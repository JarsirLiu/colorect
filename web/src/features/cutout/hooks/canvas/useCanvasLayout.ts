import { useState, useEffect, useRef, useCallback } from 'react';

interface UseCanvasLayoutOptions {
  imageUrl: string | null;
  resultImage: string | null;
}

interface UseCanvasLayoutReturn {
  canvasScale: number;
  canvasRef: React.RefObject<HTMLCanvasElement>;
  imageRef: React.RefObject<HTMLImageElement>;
}

export const useCanvasLayout = (
  options: UseCanvasLayoutOptions
): UseCanvasLayoutReturn => {
  const { imageUrl, resultImage } = options;
  const [canvasScale, setCanvasScale] = useState(1);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);

  const syncLayout = useCallback((): void => {
    const img = imageRef.current;
    const canvas = canvasRef.current;
    if (!img || !canvas) return;

    canvas.width = img.naturalWidth;
    canvas.height = img.naturalHeight;

    canvas.style.width = `${img.offsetWidth}px`;
    canvas.style.height = `${img.offsetHeight}px`;

    const scale = img.naturalWidth / img.offsetWidth;
    setCanvasScale(scale);
  }, []);

  useEffect(() => {
    if (!imageUrl || !imageRef.current || !canvasRef.current) return;

    const imgElement = imageRef.current;
    if (imgElement.complete) {
      syncLayout();
    } else {
      imgElement.onload = syncLayout;
    }

    const resizeObserver = new ResizeObserver(() => {
      syncLayout();
    });

    resizeObserver.observe(imgElement);
    window.addEventListener('resize', syncLayout);

    return (): void => {
      resizeObserver.disconnect();
      window.removeEventListener('resize', syncLayout);
    };
  }, [imageUrl, resultImage, syncLayout]);

  return {
    canvasScale,
    canvasRef,
    imageRef,
  };
};
