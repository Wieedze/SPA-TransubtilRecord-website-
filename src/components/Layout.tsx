import { Outlet } from "react-router-dom"
import SiteNav from "./site/SiteNav.tsx"
import SiteFooter from "./site/SiteFooter.tsx"

export default function Layout() {
  return (
    <div className="flex min-h-screen flex-col bg-brand-950 text-bone">
      <div className="sticky top-0 z-30">
        <SiteNav />
      </div>
      <main className="mx-auto w-full max-w-page flex-1 px-4 py-10 md:px-6">
        <Outlet />
      </main>
      <SiteFooter />
    </div>
  )
}
