/**
 * Navigation 组件类型定义
 */

import type { Tool } from '@/config/tools'

/**
 * Navigation 主组件 Props
 */
export type NavigationProps = {
  /** 导航回调函数 */
  onNavigate?: () => void
}

/**
 * Logo 组件 Props
 */
export type LogoProps = {
  /** 当前工具名称 */
  currentToolName: string
}

/**
 * ToolButton 组件 Props
 */
export type ToolButtonProps = {
  /** 工具信息 */
  tool: Tool
  /** 点击回调 */
  onToolClick: (id: string) => void
}

/**
 * ToolDropdown 组件 Props
 */
export type ToolDropdownProps = {
  /** 工具列表 */
  tools: readonly Tool[]
  /** 工具点击回调 */
  onToolClick: (id: string) => void
}

/**
 * UserAvatar 组件 Props
 */
export type UserAvatarProps = Record<never, never>
