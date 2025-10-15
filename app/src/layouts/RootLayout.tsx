import { Outlet } from 'react-router-dom'
import PageHeader from '../components/PageHeader'

export default function RootLayout() {
  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-50 bg-transparent">
        <div className="mx-auto max-w-[1280px] px-4 md:px-6 pt-2">
          <PageHeader />
        </div>
      </header>
      <main className="mx-auto max-w-[1280px] px-4 md:px-6 pt-4">
        <Outlet />
      </main>
    </div>
  )
}


