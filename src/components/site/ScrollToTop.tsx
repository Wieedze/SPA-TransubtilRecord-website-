import { useEffect } from "react"
import { useLocation } from "react-router-dom"

// Back to the top on every page change (in-page #anchors are left alone)
export default function ScrollToTop() {
  const { pathname } = useLocation()
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])
  return null
}
