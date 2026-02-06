import { createBrowserRouter } from 'react-router-dom'
import { Suspense, lazy } from 'react'

import { Layout } from './layouts/Layout'
import { Loading } from './components/Loading'

const Home = lazy(() => import('./pages/Home').then(module => ({ default: module.Home })))
const CutoutPage = lazy(() => import('./features/cutout/page').then(module => ({ default: module.CutoutPage })))

const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
    children: [
      {
        index: true,
        element: (
          <Suspense fallback={<Loading />}>
            <Home />
          </Suspense>
        ),
      },
      {
        path: 'cutout',
        element: (
          <Suspense fallback={<Loading />}>
            <CutoutPage />
          </Suspense>
        ),
      },
      {
        path: 'id-photo',
        element: (
          <Suspense fallback={<Loading />}>
            <div className="flex flex-col items-center justify-center py-24 bg-gray-50 rounded-[32px] border border-dashed border-gray-200">
              <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mb-4 text-3xl">
                🆔
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">证件照工具开发中</h3>
              <p className="text-gray-500">该功能即将上线，敬请期待...</p>
            </div>
          </Suspense>
        ),
      },
    ],
  },
])

export { router }
