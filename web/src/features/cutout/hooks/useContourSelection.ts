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
 * 画笔轮廓选区 Hook
 */
export const useContourSelection = () => {
  const [isDrawing, setIsDrawing] = useState(false);
  const [contourPaths, setContourPaths] = useState<Point[][]>([]);
  const [currentPath, setCurrentPath] = useState<Point[]>([]);

  const startContourDraw = (pos: Point) => {
    setIsDrawing(true);
    setCurrentPath([pos]);
  };

  const updateContourDraw = (pos: Point) => {
    setCurrentPath(prev => [...prev, pos]);
  };

  const endContourDraw = () => {
    if (currentPath.length > 1) {
      setContourPaths(prev => [...prev, currentPath]);
    }
    setCurrentPath([]);
    setIsDrawing(false);
  };

  const undoLastStroke = () => {
    if (contourPaths.length > 0) {
      setContourPaths(prev => prev.slice(0, -1));
    }
  };

  const clearContours = () => {
    setContourPaths([]);
    setCurrentPath([]);
  };

  const getBoundingBox = (): BoundingBox | null => {
    const allPaths = [...contourPaths];
    if (currentPath.length > 0) {
      allPaths.push(currentPath);
    }

    if (allPaths.length === 0) return null;

    const allPoints = allPaths.flat();
    const xs = allPoints.map(p => p.x);
    const ys = allPoints.map(p => p.y);

    return {
      x: Math.min(...xs),
      y: Math.min(...ys),
      width: Math.max(...xs) - Math.min(...xs),
      height: Math.max(...ys) - Math.min(...ys)
    };
  };

  return {
    isDrawing,
    contourPaths,
    currentPath,
    startContourDraw,
    updateContourDraw,
    endContourDraw,
    undoLastStroke,
    clearContours,
    getBoundingBox
  };
};
