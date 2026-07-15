// Small pill label shown above section headings.
// Pass `icon` to replace the default dot (e.g. a tiny play icon).
export default function Badge({ children, icon }) {
  return (
    <span className="inline-flex items-center gap-2 rounded-full border border-border-warm bg-accent/5 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-accent">
      {icon ?? (
        <svg width="8" height="8" viewBox="0 0 8 8" fill="currentColor" aria-hidden="true">
          <circle cx="4" cy="4" r="4" />
        </svg>
      )}
      {children}
    </span>
  )
}
