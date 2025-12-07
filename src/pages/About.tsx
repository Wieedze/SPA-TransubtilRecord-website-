import { useState } from "react"
import { Helmet } from "react-helmet-async"
import { Send, X } from "lucide-react"

export default function About() {
  const [showDemoForm, setShowDemoForm] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    artistName: "",
    email: "",
    trackTitle: "",
    soundcloudUrl: "",
    message: "",
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)

    try {
      // Send email notification to label
      // TODO: Implement email service (Resend, SendGrid, etc.)
      const emailData = {
        to: "demos@transubtilrecords.com", // Your label email
        subject: `New Demo Submission: ${formData.trackTitle} by ${formData.artistName}`,
        body: `
          New demo submission received!

          Artist Name: ${formData.artistName}
          Email: ${formData.email}
          Track Title: ${formData.trackTitle}
          SoundCloud Link: ${formData.soundcloudUrl}

          Message:
          ${formData.message || "No message provided"}
        `,
      }

      // For now, just log it - you'll need to implement the actual email service
      console.log("Email to send:", emailData)

      // TODO: Replace with actual email API call
      // Example with fetch to your backend:
      // const response = await fetch('/api/send-demo-email', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(emailData)
      // })
      // if (!response.ok) throw new Error('Failed to send email')

      alert("Demo submitted successfully! We'll review it and get back to you soon.")
      setShowDemoForm(false)
      setFormData({
        artistName: "",
        email: "",
        trackTitle: "",
        soundcloudUrl: "",
        message: "",
      })
    } catch (error) {
      console.error("Error submitting demo:", error)
      alert("Error submitting demo. Please try again.")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <>
      <Helmet>
        <title>Transubtil Records</title>
      </Helmet>

      <section className="mx-auto max-w-3xl space-y-8">
        <h2 className="font-display text-4xl md:text-5xl font-bold tracking-wide text-center mb-8">
        </h2>

        <p className="font-sans text-base text-brand-300/70 leading-relaxed">
          Transubtil Records is a Marseille-based psychedelic-trance label born from a passion for underground sound and collective spirit. What began as a local association dedicated to supporting emerging DJs and producers has evolved into a fully active label shaping the next generation of psytrance.
        </p>

        <p className="font-sans text-base text-brand-300/70 leading-relaxed">
          Our mission goes beyond releasing music: we help artists structure their projects, navigate challenges, and access professional tools — providing a creative home for producers ready to grow.
        </p>

        <p className="font-sans text-base text-brand-300/70 leading-relaxed">
          Specialized in psychedelic trance, darkpsy, forest and night-oriented sounds, Transubtil Records embraces deep grooves, experimental textures and the raw energy of the underground — connecting Marseille's creative pulse to the global psytrance movement.
        </p>

        {/* Submit Demo Button */}
        <div className="pt-8 text-center">
          <button
            onClick={() => setShowDemoForm(true)}
            className="inline-flex items-center gap-2 px-8 py-3 border-2 border-white/80 hover:bg-white hover:text-black text-white font-sans font-medium rounded-lg transition-all"
          >
            <Send className="w-5 h-5" />
            Submit Your Demo
          </button>
        </div>

        {/* Demo Submission Form Modal */}
        {showDemoForm && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-brand-800 border border-white/20 rounded-2xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-display text-2xl font-bold">Submit Your Demo</h3>
                <button
                  onClick={() => setShowDemoForm(false)}
                  className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <p className="font-sans text-sm text-brand-300/70 mb-6">
                Send us your best psychedelic trance productions. We're looking for darkpsy, forest, and night-oriented sounds that push boundaries.
              </p>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block font-sans text-sm font-medium mb-2">
                    Artist Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.artistName}
                    onChange={(e) => setFormData({ ...formData, artistName: e.target.value })}
                    className="w-full px-4 py-2 bg-brand-700/50 border border-white/20 rounded-lg focus:border-white/40 focus:outline-none font-sans text-sm"
                    placeholder="Your artist name"
                  />
                </div>

                <div>
                  <label className="block font-sans text-sm font-medium mb-2">
                    Email *
                  </label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-4 py-2 bg-brand-700/50 border border-white/20 rounded-lg focus:border-white/40 focus:outline-none font-sans text-sm"
                    placeholder="your@email.com"
                  />
                </div>

                <div>
                  <label className="block font-sans text-sm font-medium mb-2">
                    Track Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.trackTitle}
                    onChange={(e) => setFormData({ ...formData, trackTitle: e.target.value })}
                    className="w-full px-4 py-2 bg-brand-700/50 border border-white/20 rounded-lg focus:border-white/40 focus:outline-none font-sans text-sm"
                    placeholder="Your track name"
                  />
                </div>

                <div>
                  <label className="block font-sans text-sm font-medium mb-2">
                    SoundCloud / Private Link *
                  </label>
                  <input
                    type="url"
                    required
                    value={formData.soundcloudUrl}
                    onChange={(e) => setFormData({ ...formData, soundcloudUrl: e.target.value })}
                    className="w-full px-4 py-2 bg-brand-700/50 border border-white/20 rounded-lg focus:border-white/40 focus:outline-none font-sans text-sm"
                    placeholder="https://soundcloud.com/..."
                  />
                </div>

                <div>
                  <label className="block font-sans text-sm font-medium mb-2">
                    Message (Optional)
                  </label>
                  <textarea
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    rows={4}
                    className="w-full px-4 py-2 bg-brand-700/50 border border-white/20 rounded-lg focus:border-white/40 focus:outline-none font-sans text-sm resize-none"
                    placeholder="Tell us about your music, influences, or anything else you'd like to share..."
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowDemoForm(false)}
                    disabled={submitting}
                    className="flex-1 px-6 py-3 border border-white/20 hover:border-white/40 hover:bg-white/5 rounded-lg font-sans text-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="flex-1 px-6 py-3 bg-white text-black hover:bg-white/90 rounded-lg font-sans font-medium text-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {submitting ? "Submitting..." : "Submit Demo"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </section>
    </>
  )
}
