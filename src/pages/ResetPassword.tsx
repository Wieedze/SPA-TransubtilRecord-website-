import { useState, useMemo } from "react"
import { Link, useNavigate } from "react-router-dom"
import { Helmet } from "react-helmet-async"
import { motion } from "framer-motion"
import { Lock, AlertCircle, CheckCircle, Check, X } from "lucide-react"
import { useAuth } from "../contexts/AuthContext"

// Password validation rules
const validatePassword = (password: string) => {
  return {
    minLength: password.length >= 8,
    hasUppercase: /[A-Z]/.test(password),
    hasLowercase: /[a-z]/.test(password),
    hasNumber: /[0-9]/.test(password),
  }
}

const isPasswordValid = (password: string) => {
  const rules = validatePassword(password)
  return rules.minLength && rules.hasUppercase && rules.hasLowercase && rules.hasNumber
}

export default function ResetPassword() {
  const navigate = useNavigate()
  const { updatePassword } = useAuth()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const [formData, setFormData] = useState({
    password: "",
    confirmPassword: "",
  })

  // Password validation state
  const passwordRules = useMemo(() => validatePassword(formData.password), [formData.password])
  const passwordIsValid = useMemo(() => isPasswordValid(formData.password), [formData.password])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
    setError(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    // Validation
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match")
      setLoading(false)
      return
    }

    if (!passwordIsValid) {
      setError("Password does not meet security requirements")
      setLoading(false)
      return
    }

    const { error } = await updatePassword(formData.password)

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
          <title>Password Updated — Transubtil Records</title>
        </Helmet>

        <div className="min-h-screen flex items-center justify-center px-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center space-y-6 max-w-md"
          >
            <div className="w-20 h-20 mx-auto bg-green-500/20 rounded-full flex items-center justify-center">
              <CheckCircle className="w-10 h-10 text-green-400" />
            </div>
            <div>
              <h2 className="text-2xl font-bold mb-2">Password Updated!</h2>
              <p className="text-white/60">
                Your password has been successfully changed. You can now log in with your new password.
              </p>
            </div>
            <Link
              to="/login"
              className="inline-block px-6 py-3 border-2 border-white/80 hover:bg-white hover:text-black text-white text-sm uppercase tracking-[0.25em] rounded-lg transition-all"
            >
              Go to Login
            </Link>
          </motion.div>
        </div>
      </>
    )
  }

  return (
    <>
      <Helmet>
        <title>Set New Password — Transubtil Records</title>
      </Helmet>

      <div className="min-h-screen flex items-center justify-center px-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="w-full max-w-md"
        >
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold mb-2">Set New Password</h1>
            <p className="text-white/60 text-sm">
              Choose a strong password for your account
            </p>
          </div>

          <div className="border border-white/10 rounded-2xl p-8 bg-brand-700/10">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Password */}
              <div>
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-white/80 mb-2"
                >
                  <Lock className="w-4 h-4 inline mr-2" />
                  New Password
                </label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  minLength={8}
                  className={`w-full px-4 py-3 bg-brand-700/30 border rounded-lg text-white placeholder:text-white/40 focus:outline-none transition-colors ${
                    formData.password.length > 0
                      ? passwordIsValid
                        ? "border-green-500/50 focus:border-green-500"
                        : "border-orange-500/50 focus:border-orange-500"
                      : "border-white/10 focus:border-white/30"
                  }`}
                  placeholder="••••••••"
                />
                {/* Password Requirements */}
                {formData.password.length > 0 && (
                  <div className="mt-2 space-y-1">
                    <div className={`flex items-center gap-2 text-xs ${passwordRules.minLength ? "text-green-400" : "text-white/40"}`}>
                      {passwordRules.minLength ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
                      <span>Minimum 8 characters</span>
                    </div>
                    <div className={`flex items-center gap-2 text-xs ${passwordRules.hasUppercase ? "text-green-400" : "text-white/40"}`}>
                      {passwordRules.hasUppercase ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
                      <span>At least 1 uppercase letter (A-Z)</span>
                    </div>
                    <div className={`flex items-center gap-2 text-xs ${passwordRules.hasLowercase ? "text-green-400" : "text-white/40"}`}>
                      {passwordRules.hasLowercase ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
                      <span>At least 1 lowercase letter (a-z)</span>
                    </div>
                    <div className={`flex items-center gap-2 text-xs ${passwordRules.hasNumber ? "text-green-400" : "text-white/40"}`}>
                      {passwordRules.hasNumber ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
                      <span>At least 1 number (0-9)</span>
                    </div>
                  </div>
                )}
                {formData.password.length === 0 && (
                  <p className="text-xs text-white/40 mt-1">
                    Min. 8 characters, 1 uppercase, 1 lowercase, 1 number
                  </p>
                )}
              </div>

              {/* Confirm Password */}
              <div>
                <label
                  htmlFor="confirmPassword"
                  className="block text-sm font-medium text-white/80 mb-2"
                >
                  <Lock className="w-4 h-4 inline mr-2" />
                  Confirm New Password
                </label>
                <input
                  type="password"
                  id="confirmPassword"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 bg-brand-700/30 border border-white/10 rounded-lg text-white placeholder:text-white/40 focus:outline-none focus:border-white/30 transition-colors"
                  placeholder="••••••••"
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
                  <span>Updating...</span>
                ) : (
                  <span>Update Password</span>
                )}
              </button>
            </form>
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
