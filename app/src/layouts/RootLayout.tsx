import { Outlet } from 'react-router-dom'
import PageHeader from '../components/PageHeader'

export default function RootLayout() {
  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-50 bg-transparent border-b border-black/1000">
        <div className="mx-auto max-w-screen-2x px-2 md:px-3 pt-2">
          <PageHeader />
        </div>
      </header>
      <main className="mx-auto max-w-[1200px] pl-2 md:pl-4 pr-4 md:pr-6 pt-4">
        <Outlet />
      </main>
    </div>
  )
}


