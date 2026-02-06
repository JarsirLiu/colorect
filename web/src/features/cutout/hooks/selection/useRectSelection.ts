import { useState } from 'react';

import { Point, BoundingBox } from '../../types';

interface UseRectSelectionReturn {
  isDrawing: boolean;
  startPoint: Point | null;
  currentBox: BoundingBox | null;
  previewBox: BoundingBox | null;
  startRectDraw: (pos: Point) => void;
  updateRectDraw: (pos: Point) => void;
  endRectDraw: () => void;
  clearRect: () => void;
  undoRect: () => void;
}

export const useRectSelection = (): UseRectSelectionReturn => {
  const [isDrawing, setIsDrawing] = useState(false);
  const [startPoint, setStartPoint] = useState<Point | null>(null);
  const [currentBox, setCurrentBox] = useState<BoundingBox | null>(null);
  const [previewBox, setPreviewBox] = useState<BoundingBox | null>(null);

  const startRectDraw = (pos: Point): void => {
    setIsDrawing(true);
    setStartPoint(pos);
    setCurrentBox({ x: pos.x, y: pos.y, width: 0, height: 0 });
  };

  const updateRectDraw = (pos: Point): void => {
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

  const endRectDraw = (): void => {
    if (isDrawing && currentBox) {
      setIsDrawing(false);
      if (currentBox.width > 10 && currentBox.height > 10) {
        setPreviewBox(currentBox);
      }
      setStartPoint(null);
      setCurrentBox(null);
    }
  };

  const clearRect = (): void => {
    setStartPoint(null);
    setCurrentBox(null);
    setPreviewBox(null);
  };

  const undoRect = clearRect;

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
