import { useCallback } from 'react'

interface UseMouseEventsParams {
  selectionMode: 'quick' | 'rect' | 'contour'
  rectSelection: {
    previewBox: { x: number; y: number; width: number; height: number } | null
    isDrawing: boolean
    startRectDraw: (pos: { x: number; y: number }) => void
    updateRectDraw: (pos: { x: number; y: number }) => void
    endRectDraw: () => void
  }
  contourSelection: {
    isDrawing: boolean
    startContourDraw: (pos: { x: number; y: number }) => void
    updateContourDraw: (pos: { x: number; y: number }) => void
    endContourDraw: () => void
  }
  getMousePosition: (e: React.MouseEvent<HTMLCanvasElement>) => { x: number; y: number }
  imageUrl: string | null
}

export const useMouseEvents = ({
  selectionMode,
  rectSelection,
  contourSelection,
  getMousePosition,
  imageUrl
}: UseMouseEventsParams): {
  handleMouseDown: (e: React.MouseEvent<HTMLCanvasElement>) => void
  handleMouseMove: (e: React.MouseEvent<HTMLCanvasElement>) => void
  handleMouseUp: () => void
} => {
  const handleMouseDown = useCallback((e: React.MouseEvent<HTMLCanvasElement>): void => {
    if (!imageUrl || selectionMode === 'quick') return

    const pos = getMousePosition(e)

    if (selectionMode === 'rect') {
      if (rectSelection.previewBox) return
      rectSelection.startRectDraw(pos)
    } else {
      contourSelection.startContourDraw(pos)
    }
  }, [selectionMode, imageUrl, getMousePosition, rectSelection, contourSelection])

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLCanvasElement>): void => {
    if (selectionMode === 'quick') return

    const pos = getMousePosition(e)

    if (selectionMode === 'rect') {
      if (rectSelection.isDrawing) {
        rectSelection.updateRectDraw(pos)
      }
    } else {
      if (contourSelection.isDrawing) {
        contourSelection.updateContourDraw(pos)
      }
    }
  }, [selectionMode, getMousePosition, rectSelection, contourSelection])

  const handleMouseUp = useCallback((): void => {
    if (selectionMode === 'quick') return

    if (selectionMode === 'rect') {
      rectSelection.endRectDraw()
    } else {
      contourSelection.endContourDraw()
    }
  }, [selectionMode, rectSelection, contourSelection])

  return {
    handleMouseDown,
    handleMouseMove,
    handleMouseUp
  }
}
