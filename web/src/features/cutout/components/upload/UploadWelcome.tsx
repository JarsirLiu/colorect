import { TOOL_INFO } from '../../../../config/tools'

interface UploadWelcomeProps {
  onUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onPaste: (e: React.ClipboardEvent) => void;
  fileInputRef: React.RefObject<HTMLInputElement>;
}

export const UploadWelcome = ({ onUpload, onPaste, fileInputRef }: UploadWelcomeProps): JSX.Element => {
  const handleClick = (): void => {
    fileInputRef.current?.click()
  }

  const toolInfo = TOOL_INFO['/cutout']

  return (
    <div className="w-full" onPaste={onPaste}>
      <div className="text-center mb-10">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl mb-4 shadow-lg">
          <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
        </div>
        <h1 className="text-4xl font-bold text-gray-900 mb-3">
          {toolInfo?.title || '智能抠图'}
        </h1>
        <p className="text-lg text-gray-600 max-w-xl mx-auto">
          {toolInfo?.subtitle || '一秒一键抠图，快速去除背景'}
        </p>
        <div className="flex items-center justify-center gap-4 mt-4 text-sm text-gray-500">
          <span className="flex items-center gap-1">
            <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            一秒出图
          </span>
          <span className="flex items-center gap-1">
            <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            100% 准确
          </span>
          <span className="flex items-center gap-1">
            <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            完全免费
          </span>
        </div>
      </div>

      <div className="bg-white rounded-[32px] border border-gray-100 shadow-sm overflow-hidden flex flex-col items-center p-8 md:p-12">
        <div className="max-w-4xl w-full flex flex-col md:flex-row gap-8 md:gap-12 items-center">
          <div className="w-full md:w-56 shrink-0 rounded-2xl overflow-hidden shadow-xl relative">
            <img src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=500" alt="Sample" className="w-full aspect-[3/4] object-cover" />
          </div>
          <div
            className="flex-1 min-h-[240px] md:min-h-[280px] border-2 border-dashed border-gray-200 rounded-[32px] flex flex-col items-center justify-center cursor-pointer hover:bg-gray-50 hover:border-purple-300 transition-all p-6 md:p-8 text-center group"
            onClick={handleClick}
          >
            <input type="file" ref={fileInputRef} onChange={onUpload} accept="image/*" className="hidden" />
            <div className="w-14 h-14 md:w-16 md:h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center text-white mb-4 md:mb-6 shadow-lg group-hover:scale-110 transition-transform duration-200">
              <svg className="w-7 h-7 md:w-8 md:h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
              </svg>
            </div>
            <h3 className="text-lg md:text-xl font-bold text-gray-900 mb-2">上传原始图片</h3>
            <p className="text-sm text-gray-500">支持拖拽、粘贴（Ctrl+V）或点击上传</p>
            <p className="text-xs text-gray-400 mt-2">支持 JPG、PNG 格式，最大 10MB</p>
          </div>
        </div>
      </div>
    </div>
  );
};
