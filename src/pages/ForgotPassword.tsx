import { useState } from "react"
import { Link } from "react-router-dom"
import { Helmet } from "react-helmet-async"
import { motion } from "framer-motion"
import { Mail, ArrowLeft, AlertCircle, CheckCircle } from "lucide-react"
import { useAuth } from "../contexts/AuthContext"

export default function ForgotPassword() {
  const { resetPassword } = useAuth()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [email, setEmail] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const { error } = await resetPassword(email)

    if (error) {
      setError(error.message)
      setLoading(false)
    } else {
      setSuccess(true)
      setLoading(false)
    }
  }

  if (success) {
    return (
      <>
        <Helmet>
          <title>Check your email — Transubtil Records</title>
        </Helmet>

        <div className="min-h-screen flex items-center justify-center px-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center space-y-6 max-w-md"
          >
            <div className="w-20 h-20 mx-auto bg-green-500/20 rounded-full flex items-center justify-center">
              <Mail className="w-10 h-10 text-green-400" />
            </div>
            <div>
              <h2 className="text-2xl font-bold mb-2">Check your email!</h2>
              <p className="text-white/60">
                We've sent a password reset link to <strong className="text-white">{email}</strong>
              </p>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-lg p-4 text-left space-y-2">
              <p className="text-sm text-white/70">
                <span className="text-white font-medium">1.</span> Open your email inbox
              </p>
              <p className="text-sm text-white/70">
                <span className="text-white font-medium">2.</span> Click the reset password link
              </p>
              <p className="text-sm text-white/70">
                <span className="text-white font-medium">3.</span> Choose a new password
              </p>
            </div>
            <p className="text-xs text-white/40">
              Didn't receive the email? Check your spam folder or{" "}
              <button
                onClick={() => setSuccess(false)}
                className="text-white/60 hover:text-white underline"
              >
                try again
              </button>
            </p>
            <Link
              to="/login"
              className="inline-block px-6 py-3 border border-white/40 hover:border-white/80 hover:bg-white/5 text-white text-sm uppercase tracking-[0.25em] rounded-lg transition-all"
            >
              Back to Login
            </Link>
          </motion.div>
        </div>
      </>
    )
  }

  return (
    <>
      <Helmet>
        <title>Forgot Password — Transubtil Records</title>
      </Helmet>

      <div className="min-h-screen flex items-center justify-center px-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="w-full max-w-md"
        >
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold mb-2">Reset Password</h1>
            <p className="text-white/60 text-sm">
              Enter your email and we'll send you a reset link
            </p>
          </div>

          <div className="border border-white/10 rounded-2xl p-8 bg-brand-700/10">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Email */}
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-white/80 mb-2"
                >
                  <Mail className="w-4 h-4 inline mr-2" />
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value)
                    setError(null)
                  }}
                  required
                  className="w-full px-4 py-3 bg-brand-700/30 border border-white/10 rounded-lg text-white placeholder:text-white/40 focus:outline-none focus:border-white/30 transition-colors"
                  placeholder="you@example.com"
                />
              </div>

              {/* Error Message */}
              {error && (
                <div className="flex items-start gap-3 p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
                  <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
                  <p className="text-sm text-red-400">{error}</p>
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full px-6 py-3 border-2 border-white/80 hover:bg-white hover:text-black text-white font-medium rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? (
                  <span>Sending...</span>
                ) : (
                  <span>Send Reset Link</span>
                )}
              </button>
            </form>

            {/* Back to Login */}
            <div className="mt-6 text-center">
              <Link
                to="/login"
                className="text-sm text-white/60 hover:text-white inline-flex items-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Login
              </Link>
            </div>
          </div>

          {/* Back to Home */}
          <div className="mt-6 text-center">
            <Link to="/" className="text-sm text-white/40 hover:text-white/60">
              ← Back to home
            </Link>
          </div>
        </motion.div>
      </div>
    </>
  )
}
