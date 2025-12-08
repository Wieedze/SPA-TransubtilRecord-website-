import { useState } from "react"
import { Helmet } from "react-helmet-async"
import { Link } from "react-router-dom"
import { motion, AnimatePresence } from "framer-motion"
import { Headphones, Radio, Zap, CheckCircle, X, Mail, User, MessageSquare } from "lucide-react"

const services = [
  {
    icon: Radio,
    title: "Mastering",
    description:
      "Professional mastering services to bring your tracks to industry standard levels with clarity and power.",
  },
  {
    icon: Headphones,
    title: "Mixing",
    description:
      "Expert mixing to balance your elements, create depth, and achieve the perfect sonic balance.",
  },
  {
    icon: Zap,
    title: "Mix + Master",
    description:
      "Complete package combining both mixing and mastering for a polished, dancefloor-ready result.",
  },
]

const features = [
  "Specialized in psychedelic trance & night music",
  "High-end analog & digital processing chain",
  "Fast turnaround time",
  "Stem mastering available",
]

export default function Studio() {
  const [showContactModal, setShowContactModal] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)

    try {
      // TODO: Implement actual email service (Resend, SendGrid, or Supabase Edge Function)
      const emailData = {
        to: "studio@transubtilrecords.com",
        subject: `Studio Contact Request from ${formData.name}`,
        body: `
Name: ${formData.name}
Email: ${formData.email}

Message:
${formData.message}
        `,
      }

      console.log("Email to send:", emailData)

      // Simulate sending
      await new Promise(resolve => setTimeout(resolve, 1000))

      alert("Your message has been sent! We'll get back to you soon.")
      setShowContactModal(false)
      setFormData({ name: "", email: "", message: "" })
    } catch (error) {
      console.error("Error sending message:", error)
      alert("Failed to send message. Please try again or email us directly at studio@transubtilrecords.com")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <>
      <Helmet>
        <title>Studio — Transubtil Records</title>
        <meta
          name="description"
          content="Professional mastering and mixing services for psychedelic trance. Get your tracks festival-ready with Transubtil Studio."
        />
      </Helmet>

      <section className="mx-auto max-w-6xl space-y-16">
        {/* Hero */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="space-y-6 text-center"
        >
          <div className="inline-flex items-center gap-2 text-brand-acid">
            <Headphones className="w-6 h-6" />
            <span className="text-xs uppercase tracking-[0.35em]">
              Transubtil Studio
            </span>
          </div>

          <h1 className="text-4xl md:text-6xl font-bold">
            Professional Audio{" "}
            <span className="text-white/90">Mastering & Mixing</span>
          </h1>

          <p className="max-w-2xl mx-auto text-white/70 leading-relaxed">
            Elevate your psychedelic productions with professional mastering and mixing
            services. Specialized in dark psy, forest, twilight and all underground
            sounds. Make your tracks hit hard on festival sound systems.
          </p>
        </motion.div>

        {/* Services */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="space-y-8"
        >
          <h2 className="text-2xl font-semibold text-center">Our Services</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {services.map((service, index) => (
              <motion.div
                key={service.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 + index * 0.1 }}
                className="border border-white/10 rounded-xl p-6 space-y-4 hover:border-white/30 hover:bg-white/5 transition-all"
              >
                <service.icon className="w-12 h-12 text-white/90" />
                <h3 className="text-xl font-semibold">{service.title}</h3>
                <p className="text-sm text-white/70 leading-relaxed">
                  {service.description}
                </p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Features */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="space-y-8"
        >
          <h2 className="text-2xl font-semibold text-center">Why Choose Us</h2>
          <div className="grid md:grid-cols-2 gap-4 max-w-3xl mx-auto">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.5 + index * 0.05 }}
                className="flex items-start gap-3"
              >
                <CheckCircle className="w-5 h-5 text-brand-acid shrink-0 mt-0.5" />
                <span className="text-sm text-white/80">{feature}</span>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="text-center space-y-6 py-12"
        >
          <h2 className="text-3xl font-bold">Ready to Start Your Project?</h2>
          <p className="text-white/60 max-w-xl mx-auto">
            Get in touch with us to discuss your project. We'll work together to bring
            your sonic vision to life.
          </p>
          <button
            onClick={() => setShowContactModal(true)}
            className="inline-flex items-center gap-3 px-8 py-3 bg-white/10 hover:bg-white/20 text-white font-medium uppercase tracking-[0.25em] text-[11px] rounded-lg transition-all duration-300"
            style={{
              boxShadow: "0 0 20px rgba(255, 255, 255, 0.15)",
              border: "1px solid rgba(255, 255, 255, 0.2)"
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.boxShadow = "0 0 30px rgba(255, 255, 255, 0.3)"
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.boxShadow = "0 0 20px rgba(255, 255, 255, 0.15)"
            }}
          >
            <MessageSquare className="w-5 h-5" />
            Contact Studio
          </button>
        </motion.div>
      </section>

      {/* Contact Modal */}
      <AnimatePresence>
        {showContactModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowContactModal(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-brand-800 border border-white/20 rounded-2xl p-6 md:p-8 max-w-lg w-full max-h-[90vh] overflow-y-auto"
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h3 className="text-2xl font-bold mb-2">Contact Studio</h3>
                  <p className="text-sm text-white/60">
                    Send us a message and we'll get back to you soon
                  </p>
                </div>
                <button
                  onClick={() => setShowContactModal(false)}
                  className="text-white/60 hover:text-white transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Name */}
                <div>
                  <label
                    htmlFor="contact-name"
                    className="block text-sm font-medium text-white/80 mb-2"
                  >
                    <User className="w-4 h-4 inline mr-2" />
                    Name *
                  </label>
                  <input
                    type="text"
                    id="contact-name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                    className="w-full px-4 py-3 bg-brand-700/30 border border-white/10 rounded-lg text-white placeholder:text-white/40 focus:outline-none focus:border-white/30 transition-colors"
                    placeholder="Your name"
                  />
                </div>

                {/* Email */}
                <div>
                  <label
                    htmlFor="contact-email"
                    className="block text-sm font-medium text-white/80 mb-2"
                  >
                    <Mail className="w-4 h-4 inline mr-2" />
                    Email *
                  </label>
                  <input
                    type="email"
                    id="contact-email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                    className="w-full px-4 py-3 bg-brand-700/30 border border-white/10 rounded-lg text-white placeholder:text-white/40 focus:outline-none focus:border-white/30 transition-colors"
                    placeholder="your@email.com"
                  />
                </div>

                {/* Message */}
                <div>
                  <label
                    htmlFor="contact-message"
                    className="block text-sm font-medium text-white/80 mb-2"
                  >
                    <MessageSquare className="w-4 h-4 inline mr-2" />
                    Message *
                  </label>
                  <textarea
                    id="contact-message"
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    required
                    rows={5}
                    className="w-full px-4 py-3 bg-brand-700/30 border border-white/10 rounded-lg text-white placeholder:text-white/40 focus:outline-none focus:border-white/30 transition-colors resize-none"
                    placeholder="Tell us about your project..."
                  />
                </div>

                {/* Buttons */}
                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowContactModal(false)}
                    className="flex-1 px-6 py-3 border border-white/20 hover:border-white/40 hover:bg-white/5 text-white rounded-lg transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="flex-1 px-6 py-3 bg-brand-500 hover:bg-brand-600 disabled:bg-brand-500/50 text-white font-medium rounded-lg transition-all disabled:cursor-not-allowed"
                  >
                    {submitting ? "Sending..." : "Send Message"}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
