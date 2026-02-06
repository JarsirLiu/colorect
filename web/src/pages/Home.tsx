import { Link } from 'react-router-dom'

export const Home = (): JSX.Element => {
  return (
    <div className="max-w-6xl mx-auto">
      {/* Hero Section */}
      <div className="text-center mb-12">
        <h1 className="text-5xl font-bold text-gray-900 mb-4">
          Colorect 智能图片处理工具
        </h1>
        <p className="text-xl text-gray-600 mb-8">
          强大的AI技术，让图片处理更加简单高效
        </p>
        <div className="flex justify-center space-x-4">
          <Link
            to="/cutout"
            className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-8 py-3 rounded-xl hover:from-purple-700 hover:to-pink-700 transition-all duration-200 font-semibold shadow-lg hover:shadow-xl"
          >
            开始使用
          </Link>
          <button className="bg-white text-gray-700 px-8 py-3 rounded-xl border-2 border-gray-300 hover:border-purple-400 hover:bg-purple-50 transition-all duration-200 font-semibold">
            了解更多
          </button>
        </div>
      </div>

      {/* Feature Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Link
          to="/cutout"
          className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 p-6 border border-gray-100 hover:border-purple-200 cursor-pointer"
        >
          <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center mb-4 shadow-md">
            <span className="text-3xl">✂️</span>
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-3">智能抠图</h3>
          <p className="text-gray-600 mb-4 text-sm">
            一键去除背景，AI智能识别主体，效果精准
          </p>
        </Link>

        <Link
          to="/id-photo"
          className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 p-6 border border-gray-100 hover:border-blue-200 cursor-pointer"
        >
          <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center mb-4 shadow-md">
            <span className="text-3xl">🆔</span>
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-3">证件照换背景</h3>
          <p className="text-gray-600 mb-4 text-sm">
            专业证件照制作，智能换底色
          </p>
        </Link>

        <div className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 p-6 border border-gray-100 opacity-60">
          <div className="w-14 h-14 bg-gray-200 rounded-xl flex items-center justify-center mb-4">
            <span className="text-3xl grayscale">✨</span>
          </div>
          <h3 className="text-xl font-bold text-gray-400 mb-3">图片增强</h3>
          <p className="text-gray-400 mb-4 text-sm">
            自动提升图片质量，优化亮度、对比度和色彩
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 p-6 border border-gray-100 opacity-60">
          <div className="w-14 h-14 bg-gray-200 rounded-xl flex items-center justify-center mb-4">
            <span className="text-3xl grayscale">🎭</span>
          </div>
          <h3 className="text-xl font-bold text-gray-400 mb-3">滤镜效果</h3>
          <p className="text-gray-400 mb-4 text-sm">
            多种滤镜效果，一键美化您的照片
          </p>
        </div>
      </div>
    </div>
  )
}
