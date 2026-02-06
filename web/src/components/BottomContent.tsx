import { memo } from 'react'
import { Link } from 'react-router-dom'

export const BottomContent = memo(function BottomContent() {
  return (
    <div className="pt-4">
      <div className="text-center mb-12">
        <h2 className="text-3xl font-bold text-gray-900 mb-4">
          为什么选择我们的图片处理工具
        </h2>
        <p className="text-xl text-gray-600">
          免费使用，精准识别，隐私安全
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto mb-16">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-blue-100">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">免费使用</h3>
          <p className="text-gray-600">免费使用，拒绝收费套路</p>
        </div>

        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-purple-100">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">精准识别</h3>
          <p className="text-gray-600">智能识别，结果准确可靠</p>
        </div>

        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-cyan-500 to-cyan-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-cyan-100">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">安全可靠</h3>
          <p className="text-gray-600">数据安全，保护您的隐私</p>
        </div>
      </div>

      <div className="max-w-[1200px] mx-auto pt-16 border-t border-gray-100">
        <div className="flex items-center justify-between mb-8">
          <h3 className="text-2xl font-bold text-gray-900">探索更多工具</h3>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <Link
            to="/cutout"
            className="group bg-white p-6 rounded-2xl border border-gray-100 hover:border-blue-500 hover:shadow-xl transition-all duration-300 cursor-pointer"
          >
            <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <span className="text-2xl">✂️</span>
            </div>
            <h4 className="font-bold text-gray-900 mb-1">智能抠图</h4>
            <p className="text-xs text-gray-500">一键去除背景，AI智能识别</p>
          </Link>
          <Link
            to="/id-photo"
            className="group bg-white p-6 rounded-2xl border border-gray-100 hover:border-purple-500 hover:shadow-xl transition-all duration-300 cursor-pointer"
          >
            <div className="w-12 h-12 bg-purple-50 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <span className="text-2xl">🆔</span>
            </div>
            <h4 className="font-bold text-gray-900 mb-1">证件照制作</h4>
            <p className="text-xs text-gray-500">专业换底色，智能识别主体</p>
          </Link>
          <div className="group bg-gray-50/50 p-6 rounded-2xl border border-gray-100 opacity-60">
            <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center mb-4">
              <span className="text-2xl grayscale">✨</span>
            </div>
            <h4 className="font-bold text-gray-400 mb-1">图片增强</h4>
            <p className="text-xs text-gray-400">即将上线</p>
          </div>
          <div className="group bg-gray-50/50 p-6 rounded-2xl border border-gray-100 opacity-60">
            <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center mb-4">
              <span className="text-2xl grayscale">🎭</span>
            </div>
            <h4 className="font-bold text-gray-400 mb-1">滤镜美化</h4>
            <p className="text-xs text-gray-400">即将上线</p>
          </div>
        </div>
      </div>
    </div>
  )
})
