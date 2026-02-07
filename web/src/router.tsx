import { createBrowserRouter } from 'react-router-dom'
import { Suspense, lazy } from 'react'

import { Layout } from './layouts/Layout'
import { Loading } from './components/Loading'

const Home = lazy(() => import('./pages/Home').then(module => ({ default: module.Home })))
const CutoutPage = lazy(() => import('./features/cutout/page').then(module => ({ default: module.CutoutPage })))
const IdPhotoPage = lazy(() => import('./features/idphoto/page').then(module => ({ default: module.IdPhotoPage })))

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
            <IdPhotoPage />
          </Suspense>
        ),
      },
    ],
  },
])

export { router }
