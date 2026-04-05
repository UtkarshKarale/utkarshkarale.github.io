export default function SectionTitle({ eyebrow, title, caption, align = 'center' }) {
  const alignment = align === 'left' ? 'items-start text-left' : 'items-center text-center'

  return (
    <div className={`flex flex-col gap-2 ${alignment}`}>
      {eyebrow && <div className="text-[11px] uppercase tracking-[0.3em] text-slate-400">{eyebrow}</div>}
      <h2 className="text-3xl font-semibold text-white md:text-4xl">{title}</h2>
      {caption && <p className="text-sm text-slate-400 md:text-base max-w-2xl">{caption}</p>}
    </div>
  )
}
