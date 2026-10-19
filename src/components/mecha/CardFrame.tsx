// v1 "mecha" HUD frame drawn around artist cards (viewBox of the v1 card, 398.5 × 594.5).
// Stretches to its container; colour comes from currentColor.
export default function CardFrame({ className = "" }: { className?: string }) {
  return (
    <svg
      aria-hidden="true"
      className={`pointer-events-none absolute -left-[3%] -top-[3%] h-[106%] w-[106%] ${className}`}
      viewBox="0 0 398.5 594.5"
      preserveAspectRatio="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Main border */}
      <rect fill="none" stroke="currentColor" strokeMiterlimit="10" strokeWidth="1.5" x="12" y="18" width="374.5" height="558.5" />

      {/* Top right corner detail */}
      <path fill="none" stroke="currentColor" strokeMiterlimit="10" strokeWidth="1.5" d="M363.7,18c1.7-1.6,3.4-3.2,5.1-4.8c6.7.05,13.4.1,20.1.15.9.8,1.8,1.6,2.7,2.4.1,6.9.2,13.8.3,20.7-1.8,1.8-3.6,3.6-5.4,5.4V18h-22.9Z" />

      {/* Bottom left corner detail */}
      <path fill="none" stroke="currentColor" strokeMiterlimit="10" strokeWidth="1.5" d="M35.1,576.9c-1.7,1.6-3.4,3.2-5.1,4.8-6.7-.05-13.4-.1-20.1-.15-.9-.8-1.8-1.6-2.7-2.4-.1-6.9-.2-13.8-.3-20.7,1.8-1.8,3.6-3.6,5.4-5.4v23.9h22.9Z" />

      {/* Left side vertical detail */}
      <path fill="none" stroke="currentColor" strokeMiterlimit="10" strokeWidth="1.5" d="M12,219.5c-1.8-1.5-3.6-3.1-5.5-4.6v-113.6c1.8.1,3.6.2,5.5.3v117.9Z" />
      <path fill="currentColor" d="M4.5,100.5c1.7,1.6,3.3,3.3,5,4.9-.02,7.1-.03,14.2-.05,21.3,1.1,1.2,2.3,2.4,3.4,3.6-.003-23.8-.01-47.7-.013-71.5,0-.4,0-.7-.003-1.1.017-7.1.033-14.1.05-21.2,5.9-5.8,11.8-11.6,17.7-17.4,14.5.017,29,.033,43.5.05-2.3-2.2-4.5-4.3-6.8-6.5-17.8-.017-35.7-.033-53.5-.05-2,1.9-4,3.9-6,5.8-.05,13.3-.1,26.7-.15,40-1.1,1.1-2.1,2.1-3.2,3.2,0,12.9,0,25.9,0,38.8Z" />
      <rect fill="currentColor" x="7.9" y="57.5" width="4.8" height="2.1" transform="rotate(180 10.3 58.55)" />
    </svg>
  )
}
