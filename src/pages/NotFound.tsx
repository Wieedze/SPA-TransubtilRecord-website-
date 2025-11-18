import { Link } from "react-router-dom"

export default function NotFound() {
  return (
    <section className="min-h-[50vh] flex items-center justify-center">
      <div className="text-center space-y-4">
        <p className="text-xs uppercase tracking-[0.35em] text-white/40">
          Error 404
        </p>
        <h1 className="text-3xl font-semibold">Page not found</h1>
        <p className="text-sm text-white/60">
          The page you&apos;re looking for doesn&apos;t exist.
        </p>
        <Link
          to="/"
          className="inline-flex text-xs uppercase tracking-[0.3em] border border-white/40 px-4 py-2 rounded-full hover:border-brand-300 hover:text-brand-300 transition-colors"
        >
          Back to home
        </Link>
      </div>
    </section>
  )
}
