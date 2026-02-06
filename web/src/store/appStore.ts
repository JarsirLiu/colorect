import { create } from 'zustand'
import { devtools } from 'zustand/middleware'

interface AppState {
  sidebarOpen: boolean
  theme: 'light' | 'dark'
  notifications: Notification[]

  setSidebarOpen: (open: boolean) => void
  setTheme: (theme: 'light' | 'dark') => void
  addNotification: (notification: Notification) => void
  removeNotification: (id: string) => void
}

export interface Notification {
  id: string
  type: 'success' | 'error' | 'info' | 'warning'
  message: string
  duration?: number
}

export const useAppStore = create<AppState>()(
  devtools(
    (set) => ({
      sidebarOpen: false,
      theme: 'light',
      notifications: [],

      setSidebarOpen: (open: boolean): void => set({ sidebarOpen: open }),

      setTheme: (theme: 'light' | 'dark'): void => set({ theme }),

      addNotification: (notification: Notification): void => set((state) => ({
        notifications: [...state.notifications, notification]
      })),

      removeNotification: (id: string): void => set((state) => ({
        notifications: state.notifications.filter(n => n.id !== id)
      }))
    }),
    { name: 'AppStore' }
  )
)
