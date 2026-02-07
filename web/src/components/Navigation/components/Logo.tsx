import { Link } from 'react-router-dom'
import { memo } from 'react'

import type { LogoProps } from '../type'

import logo from '@/assets/logo.svg'
import brandText from '@/assets/brand-text.svg'

/**
 * Logo 和当前工具名称显示组件
 */
export const Logo = memo(function Logo({ currentToolName }: LogoProps) {
  return (
    <div className="flex items-center space-x-3">
      <Link to="/" className="flex items-center space-x-3 cursor-pointer">
        <img src={logo} alt="Colorect Logo" className="w-10 h-10 rounded-lg object-cover" />
        <img src={brandText} alt="Colorect" className="h-8" />
      </Link>
      <div className="w-[1px] h-4 bg-gray-300 mx-2" />
      <span className="text-lg font-medium text-gray-700">{currentToolName}</span>
    </div>
  )
})
