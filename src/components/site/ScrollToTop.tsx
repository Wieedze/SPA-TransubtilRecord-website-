import { useEffect } from "react"
import { useLocation } from "react-router-dom"

// Back to the top on every page change, or to the #anchor when the link has one
// (e.g. /label#demo, /legal#cookies)
export default function ScrollToTop() {
  const { pathname, hash } = useLocation()
  useEffect(() => {
    const target = hash ? document.getElementById(decodeURIComponent(hash.slice(1))) : null
    if (target) target.scrollIntoView()
    else window.scrollTo(0, 0)
  }, [pathname, hash])
  return null
}
