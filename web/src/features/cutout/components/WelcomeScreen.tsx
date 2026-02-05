interface WelcomeScreenProps {
  onUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onPaste: (e: React.ClipboardEvent) => void;
  fileInputRef: React.RefObject<HTMLInputElement>;
}

export const WelcomeScreen = ({ onUpload, onPaste, fileInputRef }: WelcomeScreenProps) => {
  return (
    <div className="bg-white rounded-[32px] border border-gray-100 shadow-sm overflow-hidden flex flex-col items-center p-12" onPaste={onPaste}>
      <div className="max-w-4xl w-full flex flex-col md:flex-row gap-12 items-center">
        <div className="w-full md:w-64 shrink-0 rounded-3xl overflow-hidden shadow-2xl relative">
          <img src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=500" alt="Sample" className="w-full aspect-[3/4] object-cover" />
        </div>
        <div
          className="flex-1 min-h-[300px] border-2 border-dashed border-gray-100 rounded-[40px] flex flex-col items-center justify-center cursor-pointer hover:bg-gray-50 transition-all p-8 text-center"
          onClick={() => fileInputRef.current?.click()}
        >
          <input type="file" ref={fileInputRef} onChange={onUpload} accept="image/*" className="hidden" />
          <div className="w-16 h-16 bg-blue-600 rounded-3xl flex items-center justify-center text-white mb-6 shadow-xl"><svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg></div>
          <h3 className="text-xl font-black mb-2">上传原始图片</h3>
          <p className="text-sm text-gray-400">支持拖拽、粘贴(Ctrl+V) 或点击上传</p>
        </div>
      </div>
    </div>
  );
};
