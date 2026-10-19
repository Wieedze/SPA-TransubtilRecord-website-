import type { ReactNode } from "react"

export default function PageHeader({
  title,
  meta,
  intro,
  aside,
}: {
  title: string
  meta?: string
  intro: string
  aside?: ReactNode
}) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-6 border-b border-brand-700 pb-8">
      <div className="flex max-w-[640px] flex-col gap-4">
        <h1 className="font-display text-[30px] uppercase leading-[1.1] md:text-[46px]">{title}</h1>
        {meta && <p className="meta">{meta}</p>}
        <p className="text-base leading-relaxed text-body md:text-lg">{intro}</p>
      </div>
      {aside}
    </div>
  )
}
