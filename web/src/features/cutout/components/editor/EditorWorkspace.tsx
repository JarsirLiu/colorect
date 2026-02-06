import { useState, useEffect } from 'react'

import { useRectSelection, useContourSelection, useCanvasLayout, useCanvasSizeSync } from '../../hooks'
import { drawRect, drawContours } from '../../utils/canvas/canvasRenderer'
import type { SelectionMode } from '../../types'
import { EditorSidebar } from './EditorSidebar'
import { EditorMain } from './EditorMain'
import { ErrorOverlay } from './ErrorOverlay'
import { useMouseEvents } from './hooks/useMouseEvents'
import { useSelectionManager } from './hooks/useSelectionManager'

interface EditorWorkspaceProps {
  imageUrl: string | null
  resultImage: string | null
  isLoading: boolean
  error: string | null
  onSegment: (bbox: { x: number; y: number; width: number; height: number } | null) => void
  onReset: () => void
  onGoHome: () => void
  onDownload: () => void
  onPaste: (e: React.ClipboardEvent) => void
  fileInputRef: React.RefObject<HTMLInputElement>
  onFileUpload: (e: React.ChangeEvent<HTMLInputElement>) => void
  setError: (error: string | null) => void
}

export const EditorWorkspace = ({
  imageUrl,
  resultImage,
  isLoading,
  error,
  onSegment,
  onReset,
  onGoHome,
  onDownload,
  onPaste,
  fileInputRef,
  onFileUpload,
  setError
}: EditorWorkspaceProps): JSX.Element => {
  const [brushSize, setBrushSize] = useState(1)
  const [selectionMode, setSelectionMode] = useState<SelectionMode>('quick')

  const rectSelection = useRectSelection()
  const contourSelection = useContourSelection()
  const { canvasScale, canvasRef, imageRef } = useCanvasLayout({
    imageUrl,
    resultImage,
  })

  useCanvasSizeSync({
    imageUrl,
    imageRef,
    canvasRef
  })

  const getMousePosition = (e: React.MouseEvent<HTMLCanvasElement>): { x: number; y: number } => {
    const canvas = canvasRef.current
    if (!canvas) return { x: 0, y: 0 }

    const rect = canvas.getBoundingClientRect()
    const scaleX = canvas.width / rect.width
    const scaleY = canvas.height / rect.height

    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY
    }
  }

  const { handleMouseDown, handleMouseMove, handleMouseUp } = useMouseEvents({
    selectionMode,
    rectSelection,
    contourSelection,
    getMousePosition,
    imageUrl
  })

  const {
    resetSelection,
    getCurrentBoundingBox,
    handleUndoSelection,
    hasSelection,
    canUndo
  } = useSelectionManager({
    selectionMode,
    rectSelection,
    contourSelection
  })

  const handleReset = (): void => {
    onReset()
    resetSelection()
  }

  const handleGoHome = (): void => {
    onGoHome()
    resetSelection()
  }

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>): void => {
    onFileUpload(e)
    resetSelection()
  }

  const handlePaste = (e: React.ClipboardEvent): void => {
    onPaste(e)
    resetSelection()
  }

  const handleSegmentClick = (): void => {
    const bbox = selectionMode === 'quick' ? null : getCurrentBoundingBox()

    if (selectionMode !== 'quick') {
      if (!bbox || bbox.width < 10 || bbox.height < 10) {
        setError('请先选择区域')
        return
      }
    }

    onSegment(bbox)
    // 不在这里重置选择状态，而是在图片更换时重置（已有的 useEffect）
  }

  const handleDownload = (): void => {
    onDownload()
  }

  const handleFileUploadClick = (): void => {
    fileInputRef.current?.click()
  }

  const handleMouseLeave = (): void => {
    handleMouseUp()
  }

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    ctx.clearRect(0, 0, canvas.width, canvas.height)

    if (selectionMode === 'rect') {
      if (rectSelection.currentBox) {
        drawRect(ctx, rectSelection.currentBox, false, canvasScale, brushSize)
      }
      if (rectSelection.previewBox) {
        drawRect(ctx, rectSelection.previewBox, true, canvasScale, brushSize)
      }
    } else if (selectionMode === 'contour') {
      drawContours(
        ctx,
        contourSelection.contourPaths,
        contourSelection.currentPath,
        canvasScale,
        brushSize
      )
    }
  }, [
    selectionMode,
    rectSelection.currentBox,
    rectSelection.previewBox,
    contourSelection.contourPaths,
    contourSelection.currentPath,
    canvasScale,
    brushSize,
    canvasRef
  ])

  useEffect(() => {
    rectSelection.clearRect()
    contourSelection.clearContours()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [imageUrl])

  useEffect(() => {
    // 抠图结果返回后，清空选择框
    if (resultImage) {
      rectSelection.clearRect()
      contourSelection.clearContours()
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resultImage])

  return (
    <div className="bg-white flex h-[calc(100vh-120px)] overflow-hidden rounded-[32px] border border-gray-100" onPaste={handlePaste}>
      <EditorSidebar
        selectionMode={selectionMode}
        setSelectionMode={setSelectionMode}
        isLoading={isLoading}
        hasSelection={hasSelection}
        brushSize={brushSize}
        setBrushSize={setBrushSize}
        onConfirm={handleSegmentClick}
        onClear={handleReset}
        onUndo={handleUndoSelection}
        canUndo={canUndo}
        resultImage={resultImage}
        onDownload={handleDownload}
        onGoHome={handleGoHome}
      />
      <EditorMain
        imageUrl={imageUrl}
        resultImage={resultImage}
        fileInputRef={fileInputRef}
        onFileUpload={handleFileUpload}
        onFileClick={handleFileUploadClick}
        selectionMode={selectionMode}
        imageRef={imageRef}
        canvasRef={canvasRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseLeave}
      />
      <ErrorOverlay error={error} />
    </div>
  )
}
