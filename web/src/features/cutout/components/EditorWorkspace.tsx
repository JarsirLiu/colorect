import { useState, useEffect } from 'react';
import { useRectSelection, useContourSelection, useCanvasLayout, useCanvasSizeSync } from '../hooks';
import { drawRect, drawContours } from '../utils/canvasRenderer';
import { SelectionModeSwitch } from './SelectionModeSwitch';
import { SelectionControls } from './SelectionControls';
import { ImageDisplay } from './ImageDisplay';

interface EditorWorkspaceProps {
  imageUrl: string | null;
  resultImage: string | null;
  isLoading: boolean;
  error: string | null;
  onSegment: (bbox: { x: number; y: number; width: number; height: number } | null) => void;
  onReset: () => void;
  onGoHome: () => void;
  onDownload: () => void;
  onPaste: (e: React.ClipboardEvent) => void;
  fileInputRef: React.RefObject<HTMLInputElement>;
  onFileUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  setError: (error: string | null) => void;
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
}: EditorWorkspaceProps) => {
  const [brushSize, setBrushSize] = useState(1);
  const [selectionMode, setSelectionMode] = useState<'quick' | 'rect' | 'contour'>('quick');

  const rectSelection = useRectSelection();
  const contourSelection = useContourSelection();
  const { canvasScale, canvasRef, imageRef } = useCanvasLayout({
    imageUrl,
    resultImage,
  });

  useCanvasSizeSync({
    imageUrl,
    imageRef,
    canvasRef
  });

  const resetSelection = () => {
    rectSelection.clearRect();
    contourSelection.clearContours();
  };

  const getMousePosition = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };

    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY
    };
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!imageUrl || selectionMode === 'quick') return;

    const pos = getMousePosition(e);

    if (selectionMode === 'rect') {
      if (rectSelection.previewBox) return;
      rectSelection.startRectDraw(pos);
    } else {
      contourSelection.startContourDraw(pos);
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (selectionMode === 'quick') return;

    const pos = getMousePosition(e);

    if (selectionMode === 'rect') {
      if (rectSelection.isDrawing) {
        rectSelection.updateRectDraw(pos);
      }
    } else {
      if (contourSelection.isDrawing) {
        contourSelection.updateContourDraw(pos);
      }
    }
  };

  const handleMouseUp = () => {
    if (selectionMode === 'quick') return;

    if (selectionMode === 'rect') {
      rectSelection.endRectDraw();
    } else {
      contourSelection.endContourDraw();
    }
  };

  const getCurrentBoundingBox = () => {
    if (selectionMode === 'rect') {
      return rectSelection.previewBox;
    } else {
      return contourSelection.getBoundingBox();
    }
  };

  const hasSelection = () => {
    if (selectionMode === 'quick') return true;
    if (selectionMode === 'rect') {
      return rectSelection.previewBox !== null;
    } else {
      const bbox = contourSelection.getBoundingBox();
      return bbox !== null && bbox.width >= 10 && bbox.height >= 10;
    }
  };

  const handleSegmentClick = async () => {
    const bbox = selectionMode === 'quick' ? null : getCurrentBoundingBox();
    
    if (selectionMode !== 'quick') {
      if (!bbox || bbox.width < 10 || bbox.height < 10) {
        setError('请先选择区域');
        return;
      }
    }

    await onSegment(bbox);
    resetSelection();
  };

  const handleUndoSelection = () => {
    if (selectionMode === 'rect') {
      rectSelection.undoRect();
    } else {
      contourSelection.undoLastStroke();
    }
  };

  const canUndoSelection = () => {
    if (selectionMode === 'rect') {
      return rectSelection.previewBox !== null;
    } else {
      return contourSelection.contourPaths.length > 0;
    }
  };

  const handleResetWrapper = () => {
    onReset();
    resetSelection();
  };

  const handleGoHomeWrapper = () => {
    onGoHome();
    resetSelection();
  };

  const handleFileUploadWrapper = (e: React.ChangeEvent<HTMLInputElement>) => {
    onFileUpload(e);
    resetSelection();
  };

  const handlePasteWrapper = (e: React.ClipboardEvent) => {
    onPaste(e);
    resetSelection();
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (selectionMode === 'rect') {
      if (rectSelection.currentBox) {
        drawRect(ctx, rectSelection.currentBox, false, canvasScale, brushSize);
      }
      if (rectSelection.previewBox) {
        drawRect(ctx, rectSelection.previewBox, true, canvasScale, brushSize);
      }
    } else if (selectionMode === 'contour') {
      drawContours(
        ctx,
        contourSelection.contourPaths,
        contourSelection.currentPath,
        canvasScale,
        brushSize
      );
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
  ]);

  useEffect(() => {
    rectSelection.clearRect();
    contourSelection.clearContours();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [imageUrl]);

  return (
    <div className="bg-white flex h-[calc(100vh-120px)] overflow-hidden rounded-[32px] border border-gray-100" onPaste={handlePasteWrapper}>
      <aside className="w-80 bg-white border-r border-gray-100 p-6 flex flex-col overflow-y-auto custom-scrollbar">
        <button onClick={handleGoHomeWrapper} className="text-[11px] font-black text-gray-400 hover:text-gray-900 mb-3 flex items-center transition-colors group">
          <svg className="w-4 h-4 mr-1 relative top-[0.5px] transition-transform group-hover:-translate-x-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path d="M10 19l-7-7m0 0l7-7m-7 7h18" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <span className="relative top-[0.5px]">返回首页</span>
        </button>
        <h3 className="text-xl font-black italic mb-3">AI SEGMENTER</h3>
        <SelectionModeSwitch mode={selectionMode} setMode={setSelectionMode} />
        <div className="mt-8">
          <SelectionControls
            selectionMode={selectionMode}
            isLoading={isLoading}
            hasSelection={hasSelection()}
            brushSize={brushSize}
            setBrushSize={setBrushSize}
            onConfirm={handleSegmentClick}
            onClear={handleResetWrapper}
            onUndo={handleUndoSelection}
            canUndo={canUndoSelection()}
          />
        </div>
        <div className="mt-auto pt-6 border-t border-gray-100">
          <div className="flex items-center justify-between text-[10px] font-black uppercase text-gray-400 tracking-widest mb-4">
            <span>Hardware Stat</span>
            <span className="text-blue-600">
              API
            </span>
          </div>
          {resultImage && (
            <button onClick={onDownload} className="w-full bg-black text-white py-4 rounded-2xl font-bold flex items-center justify-center space-x-2 active:scale-95 transition-all"><svg className="w-5 h-5" fill="none" stroke="currentColor"><path d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0L8 8m4-4v12" strokeWidth={2} /></svg><span>下载结果</span></button>
          )}
        </div>
      </aside>

      <main className="flex-1 bg-gray-50/50 p-8 flex flex-col relative overflow-hidden">
        <div className="flex-1 bg-white rounded-[40px] border border-gray-100 shadow-inner flex items-center justify-center p-8 relative overflow-hidden">
          <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'radial-gradient(#000 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>

          {imageUrl ? (
            <div className="flex items-center gap-8 max-w-full max-h-full relative z-10">
              <div className={`transition-all duration-700 ${resultImage ? 'w-1/2' : 'w-full'} flex flex-col items-center`}>
                <ImageDisplay
                  imageUrl={imageUrl}
                  imageRef={imageRef}
                  canvasRef={canvasRef}
                  selectionMode={selectionMode}
                  onMouseDown={handleMouseDown}
                  onMouseMove={handleMouseMove}
                  onMouseUp={handleMouseUp}
                  onMouseLeave={handleMouseUp}
                />
              </div>

              {resultImage && (
                <div className="w-1/2 flex flex-col items-center animate-in fade-in slide-in-from-right-10 duration-700">
                  <div className="relative rounded-2xl p-1 bg-white shadow-2xl border border-gray-50 checkerboard-bg inline-block">
                    <img src={resultImage} alt="Result" className="max-h-[60vh] rounded-xl" />
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div
              className="relative z-10 flex flex-col items-center justify-center w-full h-full min-h-[300px] border-2 border-dashed border-gray-100 rounded-[40px] cursor-pointer hover:bg-gray-50 transition-all p-8 text-center"
              onClick={() => fileInputRef.current?.click()}
            >
              <input type="file" ref={fileInputRef} onChange={handleFileUploadWrapper} accept="image/*" className="hidden" />
              <div className="w-16 h-16 bg-blue-600 rounded-3xl flex items-center justify-center text-white mb-6 shadow-xl"><svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg></div>
              <h3 className="text-xl font-black mb-2">上传图片</h3>
              <p className="text-sm text-gray-400">支持拖拽、粘贴(Ctrl+V) 或点击上传</p>
            </div>
          )}
        </div>
        {error && (
          <div className="absolute bottom-12 left-1/2 -translate-x-1/2 bg-white border border-red-50 px-6 py-4 rounded-2xl shadow-xl flex items-center space-x-3 text-red-500 font-bold text-sm">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" /></svg>
            <span>{error}</span>
          </div>
        )}
      </main>
    </div>
  );
};
