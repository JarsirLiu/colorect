import { memo, useCallback } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'

import type { NavigationProps } from './type'
import { Logo } from './components/Logo'
import { ToolDropdown } from './components/ToolDropdown'
import { UserAvatar } from './components/UserAvatar'

import { NAVIGATION_TOOL_INFO, IMAGE_TOOLS } from '@/config/tools'

/**
 * 主导航栏组件
 * 
 * 职责：
 * - 管理导航路由
 * - 组合 Logo、工具下拉菜单、用户头像等子组件
 * - 提供统一的导航回调接口
 */
export const Navigation = memo(function Navigation({ onNavigate }: NavigationProps) {
  const navigate = useNavigate()
  const location = useLocation()

  const currentToolName = NAVIGATION_TOOL_INFO[location.pathname]?.title || '图片处理'

  const handleToolClick = useCallback((toolId: string) => {
    navigate(`/${toolId}`)
    onNavigate?.()
  }, [navigate, onNavigate])

  return (
    <header className="bg-white border-b border-gray-100 sticky top-0 z-50">
      <div className="max-w-[1400px] mx-auto px-6">
        <div className="flex items-center justify-between h-[72px]">
          {/* 左侧：Logo 和工具菜单 */}
          <div className="flex items-center space-x-12">
            <Logo currentToolName={currentToolName} />

            <nav className="hidden lg:flex items-center space-x-8">
              <ToolDropdown
                tools={IMAGE_TOOLS}
                onToolClick={handleToolClick}
              />

              <a href="#" className="text-[15px] font-medium text-gray-700 hover:text-blue-600 transition-colors">
                联系我们
              </a>
            </nav>
          </div>

          {/* 右侧：用户头像 */}
          <div className="flex items-center space-x-6">
            <UserAvatar />
          </div>
        </div>
      </div>
    </header>
  )
})
