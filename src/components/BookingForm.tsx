import { useState } from "react"
import { Calendar, MapPin, Mail, User, Music } from "lucide-react"
import type { BookingRequest } from "../types/artist"

interface BookingFormProps {
  artistId: number
  artistName: string
}

export default function BookingForm({ artistId, artistName }: BookingFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [formData, setFormData] = useState<Omit<BookingRequest, "artistId" | "artistName">>({
    promoterName: "",
    promoterEmail: "",
    eventName: "",
    eventDate: "",
    eventLocation: "",
    message: "",
  })

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)

    const bookingData: BookingRequest = {
      ...formData,
      artistId,
      artistName,
    }

    try {
      // TODO: Replace with actual API endpoint when backend is ready
      // For now, just simulate a successful submission
      console.log("Booking request:", bookingData)

      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 1500))

      setIsSuccess(true)
      setFormData({
        promoterName: "",
        promoterEmail: "",
        eventName: "",
        eventDate: "",
        eventLocation: "",
        message: "",
      })
    } catch (err) {
      setError("Failed to submit booking request. Please try again.")
      console.error("Booking error:", err)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isSuccess) {
    return (
      <div className="border border-brand-300/40 rounded-xl p-8 bg-brand-700/20">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 mx-auto bg-brand-500/20 rounded-full flex items-center justify-center">
            <Mail className="w-8 h-8 text-brand-300" />
          </div>
          <h3 className="text-xl font-semibold text-brand-300">Request Sent!</h3>
          <p className="text-sm text-white/70">
            Thank you for your booking request for {artistName}. We'll get back to you
            shortly at the email address you provided.
          </p>
          <button
            onClick={() => setIsSuccess(false)}
            className="text-sm text-brand-300 hover:text-brand-200 transition-colors"
          >
            Send another request
          </button>
        </div>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        {/* Artist Name (Read-only) */}
        <div>
          <label className="block text-sm font-medium text-white/80 mb-2">
            <Music className="w-4 h-4 inline mr-2" />
            Artist
          </label>
          <input
            type="text"
            value={artistName}
            disabled
            className="w-full px-4 py-2 bg-brand-700/20 border border-white/10 rounded-lg text-white/60 cursor-not-allowed"
          />
        </div>

        {/* Promoter Name */}
        <div>
          <label htmlFor="promoterName" className="block text-sm font-medium text-white/80 mb-2">
            <User className="w-4 h-4 inline mr-2" />
            Your Name *
          </label>
          <input
            type="text"
            id="promoterName"
            name="promoterName"
            value={formData.promoterName}
            onChange={handleChange}
            required
            className="w-full px-4 py-2 bg-brand-700/30 border border-white/10 rounded-lg text-white placeholder:text-white/40 focus:outline-none focus:border-brand-300/60 transition-colors"
            placeholder="John Doe"
          />
        </div>

        {/* Promoter Email */}
        <div>
          <label htmlFor="promoterEmail" className="block text-sm font-medium text-white/80 mb-2">
            <Mail className="w-4 h-4 inline mr-2" />
            Your Email *
          </label>
          <input
            type="email"
            id="promoterEmail"
            name="promoterEmail"
            value={formData.promoterEmail}
            onChange={handleChange}
            required
            className="w-full px-4 py-2 bg-brand-700/30 border border-white/10 rounded-lg text-white placeholder:text-white/40 focus:outline-none focus:border-brand-300/60 transition-colors"
            placeholder="you@example.com"
          />
        </div>

        {/* Event Name */}
        <div>
          <label htmlFor="eventName" className="block text-sm font-medium text-white/80 mb-2">
            Event Name *
          </label>
          <input
            type="text"
            id="eventName"
            name="eventName"
            value={formData.eventName}
            onChange={handleChange}
            required
            className="w-full px-4 py-2 bg-brand-700/30 border border-white/10 rounded-lg text-white placeholder:text-white/40 focus:outline-none focus:border-brand-300/60 transition-colors"
            placeholder="Psychedelic Forest Festival"
          />
        </div>

        {/* Event Date */}
        <div>
          <label htmlFor="eventDate" className="block text-sm font-medium text-white/80 mb-2">
            <Calendar className="w-4 h-4 inline mr-2" />
            Event Date *
          </label>
          <input
            type="date"
            id="eventDate"
            name="eventDate"
            value={formData.eventDate}
            onChange={handleChange}
            required
            className="w-full px-4 py-2 bg-brand-700/30 border border-white/10 rounded-lg text-white focus:outline-none focus:border-brand-300/60 transition-colors"
          />
        </div>

        {/* Event Location */}
        <div>
          <label htmlFor="eventLocation" className="block text-sm font-medium text-white/80 mb-2">
            <MapPin className="w-4 h-4 inline mr-2" />
            Event Location *
          </label>
          <input
            type="text"
            id="eventLocation"
            name="eventLocation"
            value={formData.eventLocation}
            onChange={handleChange}
            required
            className="w-full px-4 py-2 bg-brand-700/30 border border-white/10 rounded-lg text-white placeholder:text-white/40 focus:outline-none focus:border-brand-300/60 transition-colors"
            placeholder="City, Country"
          />
        </div>

        {/* Message */}
        <div>
          <label htmlFor="message" className="block text-sm font-medium text-white/80 mb-2">
            Additional Details
          </label>
          <textarea
            id="message"
            name="message"
            value={formData.message}
            onChange={handleChange}
            rows={5}
            className="w-full px-4 py-2 bg-brand-700/30 border border-white/10 rounded-lg text-white placeholder:text-white/40 focus:outline-none focus:border-brand-300/60 transition-colors resize-none"
            placeholder="Tell us more about your event, expected attendance, venue details, etc."
          />
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
          <p className="text-sm text-red-400">{error}</p>
        </div>
      )}

      {/* Submit Button */}
      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full px-6 py-3 bg-brand-500 hover:bg-brand-600 disabled:bg-brand-700 text-white font-medium rounded-lg transition-colors disabled:cursor-not-allowed"
      >
        {isSubmitting ? "Sending Request..." : "Send Booking Request"}
      </button>

      <p className="text-xs text-white/40 text-center">
        By submitting this form, you agree to be contacted regarding your booking inquiry.
      </p>
    </form>
  )
}
