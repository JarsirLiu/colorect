import { SelectionMode } from '../../types';
import { SelectionControls } from '../selection/SelectionControls';
import { SelectionModeSwitch } from '../selection/SelectionModeSwitch';

interface EditorSidebarProps {
  selectionMode: SelectionMode;
  setSelectionMode: (mode: SelectionMode) => void;
  isLoading: boolean;
  hasSelection: boolean;
  brushSize: number;
  setBrushSize: (size: number) => void;
  onConfirm: () => void;
  onClear: () => void;
  onUndo: () => void;
  canUndo: boolean;
  resultImage: string | null;
  onDownload: () => void;
  onGoHome: () => void;
}

export const EditorSidebar = ({
  selectionMode,
  setSelectionMode,
  isLoading,
  hasSelection,
  brushSize,
  setBrushSize,
  onConfirm,
  onClear,
  onUndo,
  canUndo,
  resultImage,
  onDownload,
  onGoHome
}: EditorSidebarProps): JSX.Element => {
  return (
    <aside className="w-80 bg-white border-r border-gray-100 p-6 flex flex-col overflow-y-auto custom-scrollbar">
      <button
        onClick={onGoHome}
        className="text-[11px] font-black text-gray-400 hover:text-gray-900 mb-3 flex items-center transition-colors group"
      >
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
          hasSelection={hasSelection}
          brushSize={brushSize}
          setBrushSize={setBrushSize}
          onConfirm={onConfirm}
          onClear={onClear}
          onUndo={onUndo}
          canUndo={canUndo}
        />
      </div>
      <div className="mt-auto pt-6 border-t border-gray-100">
        <div className="flex items-center justify-between text-[10px] font-black uppercase text-gray-400 tracking-widest mb-4">
          <span>Hardware Stat</span>
          <span className="text-blue-600">API</span>
        </div>
        {resultImage && (
          <button
            onClick={onDownload}
            className="w-full bg-black text-white py-4 rounded-2xl font-bold flex items-center justify-center space-x-2 active:scale-95 transition-all"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1" />
               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v12m0 0l-4-4m4 4l4-4" />
             </svg>
            <span>下载结果</span>
          </button>
        )}
      </div>
    </aside>
  );
};
