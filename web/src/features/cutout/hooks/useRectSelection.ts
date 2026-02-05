import { useState } from 'react';

export interface Point {
  x: number;
  y: number;
}

export interface BoundingBox {
  x: number;
  y: number;
  width: number;
  height: number;
}

/**
 * 矩形框选区 Hook
 */
export const useRectSelection = () => {
  const [isDrawing, setIsDrawing] = useState(false);
  const [startPoint, setStartPoint] = useState<Point | null>(null);
  const [currentBox, setCurrentBox] = useState<BoundingBox | null>(null);
  const [previewBox, setPreviewBox] = useState<BoundingBox | null>(null);

  const startRectDraw = (pos: Point) => {
    setIsDrawing(true);
    setStartPoint(pos);
    setCurrentBox({ x: pos.x, y: pos.y, width: 0, height: 0 });
  };

  const updateRectDraw = (pos: Point) => {
    if (!startPoint) return;

    const width = pos.x - startPoint.x;
    const height = pos.y - startPoint.y;

    setCurrentBox({
      x: width > 0 ? startPoint.x : pos.x,
      y: height > 0 ? startPoint.y : pos.y,
      width: Math.abs(width),
      height: Math.abs(height)
    });
  };

  const endRectDraw = () => {
    if (isDrawing && currentBox) {
      setIsDrawing(false);
      if (currentBox.width > 10 && currentBox.height > 10) {
        setPreviewBox(currentBox);
      }
      setStartPoint(null);
      setCurrentBox(null);
    }
  };

  const clearRect = () => {
    setStartPoint(null);
    setCurrentBox(null);
    setPreviewBox(null);
  };

  const undoRect = clearRect; // rect 模式的撤销就是清除选区

  return {
    isDrawing,
    startPoint,
    currentBox,
    previewBox,
    startRectDraw,
    updateRectDraw,
    endRectDraw,
    clearRect,
    undoRect
  };
};
