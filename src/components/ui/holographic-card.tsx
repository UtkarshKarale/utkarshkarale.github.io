"use client"

import React, { useRef } from "react"

const skills = [
  "React / TypeScript",
  "Java / Spring Boot",
  "Tailwind CSS",
  "GSAP / Three.js",
  "REST APIs",
  "PostgreSQL",
]

const HolographicCard: React.FC = () => {
  const cardRef = useRef<HTMLDivElement | null>(null)

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return
    const card = cardRef.current
    const rect = card.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    const centerX = rect.width / 2
    const centerY = rect.height / 2
    const rotateX = (y - centerY) / 10
    const rotateY = (centerX - x) / 10

    card.style.setProperty("--x", `${x}px`)
    card.style.setProperty("--y", `${y}px`)
    card.style.setProperty("--bg-x", `${(x / rect.width) * 100}%`)
    card.style.setProperty("--bg-y", `${(y / rect.height) * 100}%`)
    card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`
  }

  const handleMouseLeave = () => {
    if (!cardRef.current) return
    const card = cardRef.current
    card.style.transform = "perspective(1000px) rotateX(0deg) rotateY(0deg)"
    card.style.setProperty("--x", `50%`)
    card.style.setProperty("--y", `50%`)
    card.style.setProperty("--bg-x", "50%")
    card.style.setProperty("--bg-y", "50%")
  }

  return (
    <div className="flex justify-center px-4 py-10">
      <div
        className="relative w-full max-w-3xl overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-purple-500/20 via-blue-500/10 to-slate-900 p-8 shadow-[0_30px_80px_-50px_rgba(0,0,0,0.8)] transition hover:-translate-y-1 hover:border-purple-400/60 hover:shadow-[0_40px_120px_-60px_rgba(147,51,234,0.6)]"
        ref={cardRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        style={{
          transformStyle: "preserve-3d",
        }}
      >
        <div className="relative z-10 text-center">
          <h3 className="text-xl font-bold text-white">Holographic Skills</h3>
          <p className="text-sm text-slate-200/80">Hover to see the glow</p>
          <ul className="mt-4 grid gap-2 md:grid-cols-3">
            {skills.map((skill) => (
              <li
                key={skill}
                className="rounded-full border border-white/10 bg-white/5 px-3 py-2 text-sm text-slate-50 transition hover:border-purple-300/60"
              >
                {skill}
              </li>
            ))}
          </ul>
        </div>
        <div className="absolute inset-[-50%] bg-[radial-gradient(circle_at_var(--x,50%)_var(--y,50%),rgba(255,255,255,0.4),rgba(147,51,234,0.18),rgba(0,0,0,0))] blur-3xl" />
      </div>
    </div>
  )
}

export default HolographicCard
