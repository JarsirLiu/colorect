import { memo } from 'react'

import type { UserAvatarProps } from '../type'

/**
 * 用户头像组件
 */
export const UserAvatar = memo(function UserAvatar(_props: UserAvatarProps) {
  // 预留 props 接口，支持未来扩展
  void _props
  return (
    <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center border border-gray-200 cursor-pointer hover:bg-gray-200 transition-colors">
      <svg className="w-6 h-6 text-gray-400" fill="currentColor" viewBox="0 0 24 24">
        <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
      </svg>
    </div>
  )
})
