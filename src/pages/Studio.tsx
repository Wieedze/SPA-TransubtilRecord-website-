import { Helmet } from "react-helmet-async"
import { Link } from "react-router-dom"
import { motion } from "framer-motion"
import { Headphones, Radio, Zap, CheckCircle } from "lucide-react"

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
  "Unlimited revisions until you're satisfied",
  "Stem mastering available",
  "Dolby Atmos & spatial audio",
]

export default function Studio() {
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
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link
              to="/studio/request"
              className="px-8 py-3 border-2 border-white/80 hover:bg-white hover:text-black text-white font-medium rounded-lg transition-all"
            >
              Submit Your Project
            </Link>
            <a
              href="mailto:studio@transubtilrecords.com"
              className="px-8 py-3 border border-white/30 hover:border-white/80 hover:bg-white/5 text-white font-medium rounded-lg transition-all"
            >
              Contact Studio
            </a>
          </div>
          <p className="text-xs text-white/40">
            <Link to="/login" className="hover:text-white/60 underline">
              Sign in
            </Link>{" "}
            or{" "}
            <Link to="/signup" className="hover:text-white/60 underline">
              create an account
            </Link>{" "}
            to submit your project
          </p>
        </motion.div>
      </section>
    </>
  )
}
