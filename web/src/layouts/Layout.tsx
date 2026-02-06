import { Outlet } from 'react-router-dom'

import { Navigation } from '../components/Navigation'
import { BottomContent } from '../components/BottomContent'

export const Layout = (): JSX.Element => {
  return (
    <div className="min-h-screen bg-white">
      <Navigation />

      <main className="flex-grow">
        <div className="w-full">
          <Outlet />
        </div>
      </main>

      <div className="pt-6 pb-16 bg-gray-50 border-t border-gray-100">
        <div className="max-w-[1200px] mx-auto px-6">
          <BottomContent />
        </div>
      </div>

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
