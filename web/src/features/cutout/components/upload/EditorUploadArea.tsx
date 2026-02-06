interface EditorUploadAreaProps {
  fileInputRef: React.RefObject<HTMLInputElement>;
  onFileUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onFileClick: () => void;
}

export const EditorUploadArea = ({ fileInputRef, onFileUpload, onFileClick }: EditorUploadAreaProps): JSX.Element => {
  return (
    <div
      className="relative z-10 flex flex-col items-center justify-center w-full h-full min-h-[300px] border-2 border-dashed border-gray-100 rounded-[40px] cursor-pointer hover:bg-gray-50 transition-all p-8 text-center"
      onClick={onFileClick}
    >
      <input type="file" ref={fileInputRef} onChange={onFileUpload} accept="image/*" className="hidden" />
      <div className="w-16 h-16 bg-blue-600 rounded-3xl flex items-center justify-center text-white mb-6 shadow-xl">
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
        </svg>
      </div>
      <h3 className="text-xl font-black mb-2">上传图片</h3>
      <p className="text-sm text-gray-400">支持拖拽、粘贴(Ctrl+V) 或点击上传</p>
    </div>
  );
};
