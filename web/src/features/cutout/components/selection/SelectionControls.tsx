interface SelectionControlsProps {
  selectionMode: 'quick' | 'rect' | 'contour';
  isLoading: boolean;
  hasSelection: boolean;
  brushSize: number;
  setBrushSize: (size: number) => void;
  onConfirm: () => void;
  onClear: () => void;
  onUndo: () => void;
  canUndo: boolean;
}

export const SelectionControls = ({
  selectionMode,
  isLoading,
  hasSelection,
  brushSize,
  setBrushSize,
  onConfirm,
  onClear,
  onUndo,
  canUndo
}: SelectionControlsProps): JSX.Element => {
  const showConfirmButton = selectionMode === 'quick' || hasSelection;

  const handleBrushSizeChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    setBrushSize(parseFloat(e.target.value))
  }

  return (
    <div className="flex flex-col space-y-6">
      {showConfirmButton && (
        <button
          className={`w-full flex items-center justify-center space-x-3 bg-blue-600 text-white py-3 rounded-2xl font-bold shadow-xl shadow-blue-500/20 hover:bg-blue-700 transition-all active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed animate-in fade-in zoom-in-95 duration-300`}
          onClick={onConfirm}
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <div className="relative w-4 h-4">
                <div className="absolute inset-0 border-2 border-white/20 rounded-full"></div>
                <div className="absolute inset-0 border-2 border-white rounded-full border-t-transparent animate-spin"></div>
              </div>
              <span className="tracking-tight text-sm">抠图中...</span>
            </>
          ) : (
            <>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              <span className="tracking-tight text-sm">立刻抠图</span>
            </>
          )}
        </button>
      )}

      <div className="bg-gray-50/80 rounded-2xl p-3 border border-gray-100 animate-in fade-in slide-in-from-top-2 duration-300">
        <div className="flex justify-between items-center mb-2">
          <span className="text-[10px] font-black uppercase text-gray-400 tracking-widest">Brush Size</span>
          <span className="bg-blue-600 text-white text-[10px] px-2 py-0.5 rounded-full font-bold">{brushSize}px</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-1 h-1 bg-gray-300 rounded-full"></div>
          <input
            type="range"
            min="1"
            max="5"
            step="0.5"
            value={brushSize}
            onChange={handleBrushSizeChange}
            className="flex-1 h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600 focus:outline-none"
          />
          <div className="w-3 h-3 bg-gray-300 rounded-full"></div>
        </div>
      </div>

      <div className="flex gap-3">
        <button
          className="flex-1 flex items-center justify-center space-x-2 bg-white border border-gray-100 text-gray-600 py-3 rounded-xl text-[13px] font-bold hover:bg-gray-50 hover:border-gray-200 transition-all active:scale-95 disabled:opacity-30 disabled:grayscale"
          onClick={onUndo}
          disabled={!canUndo}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
          </svg>
          <span>撤销选区</span>
        </button>

        <button
          className="flex-1 flex items-center justify-center space-x-2 bg-white border border-red-50 text-red-500 py-3 rounded-xl text-[13px] font-bold hover:bg-red-50 hover:border-red-100 transition-all active:scale-95 animate-in fade-in slide-in-from-right-4 duration-300"
          onClick={onClear}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
          <span>清空工作区</span>
        </button>
      </div>
    </div>
  );
};
