import { Link, useLocation } from "react-router-dom"
import Seo from "../components/site/Seo"

export default function NotFound() {
  const { pathname } = useLocation()
  return (
    <section className="flex min-h-[50vh] flex-col items-start justify-center gap-5">
      <Seo title="Page not found — Transubtil Records" description="This page does not exist." path={pathname} noindex />
      <p className="meta">Error 404</p>
      <h1 className="font-display text-[30px] uppercase leading-[1.1] md:text-[46px]">Page not found</h1>
      <p className="text-body">The page you are looking for does not exist.</p>
      <div className="flex flex-wrap items-center gap-x-8 gap-y-4">
        <Link to="/" className="btn-primary">
          Back to home
        </Link>
        <Link to="/artists" className="text-link">
          See the artists
        </Link>
      </div>
    </section>
  )
}
