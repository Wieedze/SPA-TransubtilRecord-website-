import { useEffect, useState } from "react"
import { useNavigate, useSearchParams } from "react-router-dom"
import { Helmet } from "react-helmet-async"
import { motion } from "framer-motion"
import { CheckCircle, XCircle, Loader2 } from "lucide-react"
import { Link } from "react-router-dom"

export default function AuthCallback() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading")
  const [message, setMessage] = useState("")

  useEffect(() => {
    // Supabase handles the token exchange automatically via the URL hash
    // We just need to check if there's an error in the URL params
    const error = searchParams.get("error")
    const errorDescription = searchParams.get("error_description")
    const type = searchParams.get("type")

    if (error) {
      setStatus("error")
      setMessage(errorDescription || "An error occurred during authentication")
      return
    }

    // Check the hash for access_token (Supabase puts tokens in the hash)
    const hash = window.location.hash
    if (hash && hash.includes("access_token")) {
      // Token is present, auth was successful
      setStatus("success")

      // Determine the type of confirmation
      if (type === "recovery") {
        setMessage("Password reset link verified. Redirecting...")
        setTimeout(() => navigate("/reset-password"), 2000)
      } else if (type === "signup" || type === "email_change") {
        setMessage("Email confirmed successfully! Redirecting to login...")
        setTimeout(() => navigate("/login"), 2000)
      } else {
        setMessage("Authentication successful! Redirecting...")
        setTimeout(() => navigate("/dashboard"), 2000)
      }
    } else {
      // No token and no error - might be a direct visit or expired link
      setStatus("success")
      setMessage("Email confirmed! You can now log in.")
    }
  }, [navigate, searchParams])

  return (
    <>
      <Helmet>
        <title>Verifying — Transubtil Records</title>
      </Helmet>

      <div className="min-h-screen flex items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center space-y-6 max-w-md"
        >
          {status === "loading" && (
            <>
              <div className="w-20 h-20 mx-auto bg-white/10 rounded-full flex items-center justify-center">
                <Loader2 className="w-10 h-10 text-white animate-spin" />
              </div>
              <div>
                <h2 className="text-2xl font-bold mb-2">Verifying...</h2>
                <p className="text-white/60">Please wait while we verify your request.</p>
              </div>
            </>
          )}

          {status === "success" && (
            <>
              <div className="w-20 h-20 mx-auto bg-green-500/20 rounded-full flex items-center justify-center">
                <CheckCircle className="w-10 h-10 text-green-400" />
              </div>
              <div>
                <h2 className="text-2xl font-bold mb-2">Success!</h2>
                <p className="text-white/60">{message}</p>
              </div>
              <Link
                to="/login"
                className="inline-block px-6 py-3 border border-white/40 hover:border-white/80 hover:bg-white/5 text-white text-sm uppercase tracking-[0.25em] rounded-lg transition-all"
              >
                Go to Login
              </Link>
            </>
          )}

          {status === "error" && (
            <>
              <div className="w-20 h-20 mx-auto bg-red-500/20 rounded-full flex items-center justify-center">
                <XCircle className="w-10 h-10 text-red-400" />
              </div>
              <div>
                <h2 className="text-2xl font-bold mb-2">Something went wrong</h2>
                <p className="text-white/60">{message}</p>
              </div>
              <div className="space-y-3">
                <Link
                  to="/login"
                  className="inline-block px-6 py-3 border border-white/40 hover:border-white/80 hover:bg-white/5 text-white text-sm uppercase tracking-[0.25em] rounded-lg transition-all"
                >
                  Go to Login
                </Link>
                <p className="text-xs text-white/40">
                  If you continue to have issues, please contact support.
                </p>
              </div>
            </>
          )}
        </motion.div>
      </div>
    </>
  )
}
