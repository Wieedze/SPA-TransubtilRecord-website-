import type { ReactNode } from "react"

export default function PageHeader({
  eyebrow,
  title,
  intro,
  aside,
}: {
  eyebrow: string
  title: string
  intro: string
  aside?: ReactNode
}) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-6">
      <div className="flex max-w-[640px] flex-col gap-3.5">
        <p className="eyebrow">{eyebrow}</p>
        <h1 className="font-display text-[40px] font-extrabold uppercase leading-[1.05] md:text-[56px]">{title}</h1>
        <p className="text-base leading-relaxed text-brand-300 md:text-lg">{intro}</p>
      </div>
      {aside}
    </div>
  )
}
