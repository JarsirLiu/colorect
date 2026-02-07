/**
 * 上传区域组件
 */

interface UploadAreaProps {
  onFileUpload: (file: File) => void;
  fileInputRef: React.RefObject<HTMLInputElement>;
}

export const UploadArea = ({
  onFileUpload,
  fileInputRef,
}: UploadAreaProps): JSX.Element => {
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onFileUpload(file);
    }
    // 重置 input，允许重复上传同一文件
    e.target.value = '';
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
      onFileUpload(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  return (
    <div
      className="flex flex-col items-center justify-center h-full text-center"
      onDrop={handleDrop}
      onDragOver={handleDragOver}
    >
      <div className="relative">
        <div className="w-24 h-24 mb-6 mx-auto rounded-full bg-gradient-to-br from-purple-100 to-pink-100 flex items-center justify-center">
          <svg className="w-12 h-12 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        </div>
      </div>
      <h3 className="text-2xl font-black text-gray-900 mb-2">
        上传照片
      </h3>
      <p className="text-gray-400 text-sm mb-6">
        点击或拖拽上传，支持 JPG、PNG 格式
      </p>
      <input
        ref={fileInputRef}
        type="file"
        onChange={handleFileChange}
        accept="image/jpeg,image/png"
        className="hidden"
      />
      <button
        onClick={() => fileInputRef.current?.click()}
        className="px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-2xl font-bold hover:from-purple-700 hover:to-pink-700 transition-all duration-200 shadow-lg hover:shadow-xl active:scale-95"
      >
        选择照片
      </button>
      <div className="mt-8 flex items-center gap-2 text-xs text-gray-300">
        <span className="font-semibold">提示</span>
        <span>建议使用正面、背景清晰的证件照</span>
      </div>
    </div>
  );
};
