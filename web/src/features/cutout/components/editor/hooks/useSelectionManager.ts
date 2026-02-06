import { useCallback, useMemo } from 'react'

import type { SelectionMode } from '../../../types'

interface UseSelectionManagerParams {
  selectionMode: SelectionMode
  rectSelection: {
    previewBox: { x: number; y: number; width: number; height: number } | null
    clearRect: () => void
    undoRect: () => void
  }
  contourSelection: {
    getBoundingBox: () => { x: number; y: number; width: number; height: number } | null
    contourPaths: Array<{ x: number; y: number }[]>
    clearContours: () => void
    undoLastStroke: () => void
  }
}

export const useSelectionManager = ({
  selectionMode,
  rectSelection,
  contourSelection
}: UseSelectionManagerParams): {
  resetSelection: () => void
  getCurrentBoundingBox: () => { x: number; y: number; width: number; height: number } | null
  handleUndoSelection: () => void
  hasSelection: boolean
  canUndo: boolean
} => {
  const resetSelection = useCallback((): void => {
    rectSelection.clearRect()
    contourSelection.clearContours()
  }, [rectSelection, contourSelection])

  const getCurrentBoundingBox = useCallback((): { x: number; y: number; width: number; height: number } | null => {
    if (selectionMode === 'rect') {
      return rectSelection.previewBox
    } else {
      return contourSelection.getBoundingBox()
    }
  }, [selectionMode, rectSelection.previewBox, contourSelection])

  const handleUndoSelection = useCallback((): void => {
    if (selectionMode === 'rect') {
      rectSelection.undoRect()
    } else {
      contourSelection.undoLastStroke()
    }
  }, [selectionMode, rectSelection, contourSelection])

  const hasContourSelection = useCallback((): boolean => {
    const bbox = contourSelection.getBoundingBox()
    return bbox !== null && bbox.width >= 10 && bbox.height >= 10
  }, [contourSelection])

  const hasSelection = useMemo((): boolean => {
    return selectionMode === 'quick' ? true :
      selectionMode === 'rect' ? rectSelection.previewBox !== null :
      hasContourSelection()
  }, [selectionMode, rectSelection.previewBox, hasContourSelection])

  const canUndo = useMemo((): boolean => {
    return selectionMode === 'rect' ? rectSelection.previewBox !== null :
      contourSelection.contourPaths.length > 0
  }, [selectionMode, rectSelection.previewBox, contourSelection.contourPaths.length])

  return {
    resetSelection,
    getCurrentBoundingBox,
    handleUndoSelection,
    hasSelection,
    canUndo
  }
}
