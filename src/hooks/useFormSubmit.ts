import { useState, type FormEvent } from "react"

export type FormState = "idle" | "sending" | "sent" | "error"

const ERRORS: Record<string, string> = {
  rate_limited: "Too many messages from your connection. Please try again in an hour.",
  missing_fields: "Please fill in the required fields.",
  invalid_email: "Please enter a valid email address.",
  captcha_failed: "The anti-bot check didn't pass. Please try again.",
  invalid_email_domain: "This email address can't receive mail. Please check it for typos.",
  disposable_email: "Please use a permanent email address, not a temporary one.",
  too_many_links: "Your message has too many links. Please keep it to 3 at most.",
}
const FALLBACK = "Something went wrong. Please try again, or email us at transubtilrec@gmail.com."

// Posts a form's fields as JSON to a Pages Function and tracks the result
export function useFormSubmit(endpoint: string, successMessage: string) {
  const [state, setState] = useState<FormState>("idle")
  const [message, setMessage] = useState<string | null>(null)
  // Bumped after every attempt: use as the Turnstile key so it issues a fresh token
  const [attempt, setAttempt] = useState(0)

  const submit = async (event: FormEvent<HTMLFormElement>, extra: Record<string, string> = {}) => {
    event.preventDefault()
    const formElement = event.currentTarget
    const data = { ...Object.fromEntries(new FormData(formElement).entries()), ...extra }
    setState("sending")
    setMessage(null)
    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })
      const result = (await response.json().catch(() => ({}))) as { ok?: boolean; already?: boolean; error?: string }
      if (!response.ok || !result.ok) throw new Error(result.error ?? "unknown")
      setState("sent")
      setMessage(result.already ? "You're already subscribed. Thanks!" : successMessage)
      formElement.reset()
    } catch (error) {
      setState("error")
      setMessage(ERRORS[(error as Error).message] ?? FALLBACK)
    } finally {
      setAttempt((n) => n + 1)
    }
  }

  return { state, message, submit, sending: state === "sending", attempt }
}
