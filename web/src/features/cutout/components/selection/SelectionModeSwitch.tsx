interface SelectionModeSwitchProps {
  mode: 'quick' | 'rect' | 'contour';
  setMode: (mode: 'quick' | 'rect' | 'contour') => void;
}

export const SelectionModeSwitch = ({ mode, setMode }: SelectionModeSwitchProps): JSX.Element => {
  const handleQuickMode = (): void => setMode('quick');
  const handleRectMode = (): void => setMode('rect');
  const handleContourMode = (): void => setMode('contour');

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between px-1">
        <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Segmentation Mode</p>
      </div>

      <div className="grid grid-cols-1 gap-2">
        <button
          onClick={handleQuickMode}
          className={`group flex items-center p-2.5 rounded-xl border-2 transition-all duration-150 text-left relative overflow-hidden ${mode === 'quick'
            ? 'bg-blue-600 border-blue-600 shadow-xl shadow-blue-500/20 ring-2 ring-blue-50'
            : 'bg-white border-gray-100 hover:border-blue-200 hover:bg-blue-50/50'
            }`}
        >
          <div className={`w-8 h-8 rounded-lg flex items-center justify-center mr-3 shrink-0 transition-all duration-150 ${mode === 'quick' ? 'bg-white text-blue-600 scale-105' : 'bg-gray-50 text-gray-400 group-hover:bg-white group-hover:text-blue-500'
            }`}>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <div className="relative z-10">
            <div className={`font-black text-[13px] tracking-tight ${mode === 'quick' ? 'text-white' : 'text-gray-900'}`}>一键抠图</div>
            <div className={`text-[10px] mt-0.5 font-medium leading-tight ${mode === 'quick' ? 'text-blue-100' : 'text-gray-400'}`}>
              AI 自动识别主体，无需手动选区
            </div>
          </div>
          {mode === 'quick' && (
            <div className="absolute top-0 right-0 p-2">
              <div className="w-1 h-1 bg-white rounded-full animate-ping"></div>
            </div>
          )}
        </button>

        <button
          onClick={handleRectMode}
          className={`group flex items-center p-2.5 rounded-xl border-2 transition-all duration-150 text-left relative overflow-hidden ${mode === 'rect'
            ? 'bg-blue-600 border-blue-600 shadow-xl shadow-blue-500/20 ring-2 ring-blue-50'
            : 'bg-white border-gray-100 hover:border-blue-200 hover:bg-blue-50/50'
            }`}
        >
          <div className={`w-8 h-8 rounded-lg flex items-center justify-center mr-3 shrink-0 transition-all duration-150 ${mode === 'rect' ? 'bg-white text-blue-600 scale-105' : 'bg-gray-50 text-gray-400 group-hover:bg-white group-hover:text-blue-500'
            }`}>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <rect x="4" y="4" width="16" height="16" rx="2" strokeWidth="2.5" />
            </svg>
          </div>
          <div className="relative z-10">
            <div className={`font-black text-[13px] tracking-tight ${mode === 'rect' ? 'text-white' : 'text-gray-900'}`}>智能框选</div>
            <div className={`text-[10px] mt-0.5 font-medium leading-tight ${mode === 'rect' ? 'text-blue-100' : 'text-gray-400'}`}>
              快捷物体识别，AI 自动边缘优化
            </div>
          </div>
          {mode === 'rect' && (
            <div className="absolute top-0 right-0 p-2">
              <div className="w-1 h-1 bg-white rounded-full animate-ping"></div>
            </div>
          )}
        </button>

        <button
          onClick={handleContourMode}
          className={`group flex items-center p-2.5 rounded-xl border-2 transition-all duration-150 text-left relative overflow-hidden ${mode === 'contour'
            ? 'bg-blue-600 border-blue-600 shadow-xl shadow-blue-500/20 ring-2 ring-blue-50'
            : 'bg-white border-gray-100 hover:border-blue-200 hover:bg-blue-50/50'
            }`}
        >
          <div className={`w-8 h-8 rounded-lg flex items-center justify-center mr-3 shrink-0 transition-all duration-150 ${mode === 'contour' ? 'bg-white text-blue-600 scale-105' : 'bg-gray-50 text-gray-400 group-hover:bg-white group-hover:text-blue-500'
            }`}>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 20l9-9a1 1 0 00-4-4l-9 9V15z" />
            </svg>
          </div>
          <div className="relative z-10">
            <div className={`font-black text-[13px] tracking-tight ${mode === 'contour' ? 'text-white' : 'text-gray-900'}`}>自由勾勒</div>
            <div className={`text-[10px] mt-0.5 font-medium leading-tight ${mode === 'contour' ? 'text-blue-100' : 'text-gray-400'}`}>
              精细边缘处理，支持复杂背景分离
            </div>
          </div>
          {mode === 'contour' && (
            <div className="absolute top-0 right-0 p-2">
              <div className="w-1 h-1 bg-white rounded-full animate-ping"></div>
            </div>
          )}
        </button>
      </div>
    </div>
  );
};
