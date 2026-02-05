import { useRef, useState } from 'react'

interface UploadAreaProps {
  onFileSelect: (file: File) => void
}

export const UploadArea = ({ onFileSelect }: UploadAreaProps) => {
  const inputRef = useRef<HTMLInputElement>(null)
  const [isDragOver, setIsDragOver] = useState(false)

  const handleFile = (file: File) => {
    // 校验文件类型
    if (!file.type.startsWith('image/')) {
      alert('请上传图片文件')
      return
    }

    // 校验文件大小 (10MB)
    if (file.size > 10 * 1024 * 1024) {
      alert('图片大小不能超过10MB')
      return
    }

    onFileSelect(file)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)

    const file = e.dataTransfer.files[0]
    if (file) {
      handleFile(file)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      handleFile(file)
    }
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div
        className={`
          border-2 border-dashed rounded-2xl p-12 text-center cursor-pointer transition-all duration-300
          ${isDragOver ? 'border-purple-500 bg-purple-50 scale-105' : 'border-gray-300 hover:border-purple-400 hover:bg-gray-50'}
        `}
        onDragOver={(e) => {
          e.preventDefault()
          setIsDragOver(true)
        }}
        onDragLeave={() => setIsDragOver(false)}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
      >
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          onChange={handleInputChange}
          className="hidden"
        />

        <div className="w-20 h-20 bg-gradient-to-br from-purple-100 to-pink-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg className="w-10 h-10 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        </div>
        <h3 className="text-2xl font-bold text-gray-800 mb-2">
          上传图片开始抠图
        </h3>
        <p className="text-gray-600 mb-6">
          拖拽图片到此处，或点击选择文件
        </p>
        <button className="inline-flex items-center px-8 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl hover:from-purple-700 hover:to-pink-700 transition-all duration-200 font-semibold shadow-md hover:shadow-lg">
          <span className="mr-2">📁</span>
          选择图片
        </button>
        <div className="mt-6 flex items-center justify-center space-x-6 text-sm text-gray-500">
          <span>支持 JPG、PNG、WebP 格式</span>
          <span>•</span>
          <span>最大 10MB</span>
          <span>•</span>
          <span>AI智能识别</span>
        </div>
      </div>

      {/* 示例图片 */}
      <div className="mt-8">
        <p className="text-center text-gray-600 mb-4 font-medium">或者使用示例图片</p>
        <div className="flex justify-center space-x-4">
          {['示例图片 1', '示例图片 2', '示例图片 3'].map((label, idx) => (
            <button
              key={idx}
              className="px-6 py-3 bg-white border-2 border-gray-200 rounded-xl hover:border-purple-400 hover:bg-purple-50 transition-all text-gray-700 font-medium shadow-sm hover:shadow-md"
            >
              {label}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
