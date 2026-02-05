import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import logo from '../assets/logo.jpg'

interface LayoutProps {
  children: React.ReactNode
  bottomContent?: React.ReactNode
}

export const Layout = ({ children, bottomContent }: LayoutProps) => {
  const navigate = useNavigate()
  const location = useLocation()
  const [dropdownOpen, setDropdownOpen] = useState(false)

  const toolInfo: Record<string, { title: string }> = {
    '/': { title: '图片处理' },
    '/cutout': { title: '智能抠图' },
    '/id-photo': { title: '证件照换背景' }
  }

  const currentToolName = toolInfo[location.pathname]?.title || '图片处理'

  const imageTools = [
    { id: 'cutout', name: '智能抠图', icon: '✂️', description: '一键去除背景' },
    { id: 'id-photo', name: '证件照换背景', icon: '🆔', description: '专业证件照制作' }
  ]

  const handleToolClick = (toolId: string) => {
    navigate(`/${toolId}`)
    setDropdownOpen(false)
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-white border-b border-gray-100 sticky top-0 z-50">
        <div className="max-w-[1400px] mx-auto px-6">
          <div className="flex items-center justify-between h-[72px]">
            {/* Logo */}
            <div className="flex items-center space-x-12">
              <div className="flex items-center space-x-3">
                <Link to="/" className="flex items-center space-x-3 cursor-pointer">
                  <img src={logo} alt="Colorect Logo" className="w-16 h-16 rounded-lg object-cover" />
                  <span className="text-xl font-bold text-gray-900 tracking-tight">Colorect</span>
                </Link>
                <div className="w-[1px] h-4 bg-gray-300 mx-2"></div>
                <span className="text-lg font-medium text-gray-700">{currentToolName}</span>
              </div>

              {/* Navigation */}
              <nav className="hidden lg:flex items-center space-x-8">
                <div
                  className="relative group cursor-pointer"
                  onMouseEnter={() => setDropdownOpen(true)}
                  onMouseLeave={() => setDropdownOpen(false)}
                >
                  <button className="flex items-center space-x-1 py-4 text-[15px] font-medium text-gray-700 hover:text-blue-600 transition-colors">
                    <span>图片处理工具</span>
                    <svg className={`w-4 h-4 transition-transform duration-200 ${dropdownOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>

                  {/* Dropdown */}
                  {dropdownOpen && (
                    <div className="absolute left-0 top-full w-64 bg-white rounded-xl shadow-2xl border border-gray-100 py-3 z-50 transform transition-all duration-200">
                      {imageTools.map((tool) => (
                        <button
                          key={tool.id}
                          onClick={() => handleToolClick(tool.id)}
                          className="w-full flex items-center space-x-3 px-4 py-3 hover:bg-gray-50 transition-colors text-left"
                        >
                          <span className="text-xl">{tool.icon}</span>
                          <div>
                            <div className="font-semibold text-gray-900 text-sm">{tool.name}</div>
                            <div className="text-xs text-gray-500">{tool.description}</div>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                <a href="#" className="text-[15px] font-medium text-gray-700 hover:text-blue-600 transition-colors">联系我们</a>
              </nav>
            </div>

            {/* Right Actions */}
            <div className="flex items-center space-x-6">
              {/* User Avatar Placeholder */}
              <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center border border-gray-200 cursor-pointer hover:bg-gray-200 transition-colors">
                <svg className="w-6 h-6 text-gray-400" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Content Areas */}
      <main className="flex-grow">
        <div className="w-full">
          {children}
        </div>

        {/* Fixed Bottom Section */}
        {bottomContent && (
          <div className="pt-6 pb-16 bg-gray-50 border-t border-gray-100">
            <div className="max-w-[1200px] mx-auto px-6">
              {bottomContent}
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-100 py-12">
        <div className="max-w-[1200px] mx-auto px-6 flex flex-col md:flex-row justify-between items-center text-gray-500 text-sm">
          <p>© 2026 Colorect. All rights reserved.</p>
          <div className="flex space-x-8 mt-4 md:mt-0">
            <a href="#" className="hover:text-gray-900 transition-colors">隐私政策</a>
            <a href="#" className="hover:text-gray-900 transition-colors">服务协议</a>
            <a href="#" className="hover:text-gray-900 transition-colors">在线客服</a>
          </div>
        </div>
      </footer>
    </div>
  )
}