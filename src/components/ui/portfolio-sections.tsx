import HolographicCard from "@/components/ui/holographic-card"

const skills = {
  frontend: ["React", "TypeScript", "Tailwind CSS", "Vite", "Framer Motion", "Three.js / WebGL"],
  backend: ["Java", "Spring Boot", "REST APIs", "PostgreSQL", "Hibernate", "Cloudflare Workers"],
  tools: ["Git/GitHub", "CI/CD", "GSAP", "A11y & Lighthouse", "Design Systems"],
}

const projects = [
  {
    title: "LokSetu – AI Content Automation",
    desc: "Automation-first SaaS for generating, scheduling, and localizing multimedia content.",
    stack: ["React", "Cloudflare Workers", "KV", "D1"],
  },
  {
    title: "FinanceFlow",
    desc: "Full-stack expense and income tracker with analytics dashboards.",
    stack: ["React", "Spring Boot", "PostgreSQL"],
  },
  {
    title: "Blog Platform",
    desc: "Role-based blog engine with authentication and editorial workflow.",
    stack: ["Java", "Spring MVC", "Hibernate"],
  },
]

const articles = [
  {
    title: "How I Built LokSetu",
    blurb: "Designing an AI-first automation pipeline on Cloudflare Workers.",
  },
  {
    title: "React + Spring Boot: Pragmatic Pairing",
    blurb: "Patterns that keep frontends fast and backends robust.",
  },
  {
    title: "Java Mistakes I Still See",
    blurb: "Simple fixes that harden production services.",
  },
]

export function PortfolioSections() {
  return (
    <div className="relative z-10 text-slate-900 dark:text-slate-100">
      <Section id="skills" title="Skills" kicker="Toolkit" bgClass="bg-slate-950 text-white" accent="text-purple-300">
        <div className="grid gap-6 md:grid-cols-3">
          <div className="md:col-span-3">
            <HolographicCard />
          </div>
          {Object.entries(skills).map(([key, items]) => (
            <Card key={key} title={key}>
              <ul className="space-y-2 text-sm text-slate-200">
                {items.map((item) => (
                  <li
                    key={item}
                    className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 transition hover:-translate-y-1 hover:border-purple-400/60"
                  >
                    {item}
                  </li>
                ))}
              </ul>
            </Card>
          ))}
        </div>
      </Section>

      <Section id="projects" title="Projects" kicker="Selected Work" bgClass="bg-slate-900 text-white" accent="text-cyan-300">
        <div className="grid gap-6 md:grid-cols-3">
          {projects.map((p) => (
            <Card key={p.title} title={p.title}>
              <p className="text-sm text-slate-200 mb-3">{p.desc}</p>
              <div className="flex flex-wrap gap-2 text-xs text-slate-100">
                {p.stack.map((t) => (
                  <span key={t} className="rounded-full border border-white/15 bg-white/5 px-3 py-1">
                    {t}
                  </span>
                ))}
              </div>
            </Card>
          ))}
        </div>
      </Section>

      <Section id="writing" title="Writing" kicker="Utkarsh Writes" bgClass="bg-slate-950 text-white" accent="text-amber-300">
        <div className="grid gap-4 md:grid-cols-3">
          {articles.map((a) => (
            <Card key={a.title} title={a.title}>
              <p className="text-sm text-slate-200">{a.blurb}</p>
            </Card>
          ))}
        </div>
      </Section>

      <Section id="contact" title="Contact" kicker="Let’s Talk" bgClass="bg-slate-900 text-white" accent="text-lime-300">
        <p className="text-lg text-slate-200 mb-4">
          Open to full-time roles and selective freelance. Let’s build something meaningful.
        </p>
        <div className="flex gap-3 text-sm">
          <a className="rounded-full bg-accent-500 px-4 py-2 text-slate-900" href="mailto:karaleutkarsh3696@gmail.com">
            Email Me
          </a>
          <a className="rounded-full border border-white/20 px-4 py-2" href="https://github.com/">
            GitHub
          </a>
          <a className="rounded-full border border-white/20 px-4 py-2" href="https://www.linkedin.com/in/utkarshkarale/">
            LinkedIn
          </a>
          <a className="rounded-full border border-white/20 px-4 py-2" href="https://www.instagram.com/utkarsh.karale/">
            Instagram
          </a>
        </div>
      </Section>
    </div>
  )
}

function Section({
  id,
  title,
  kicker,
  children,
  bgClass,
  accent = "text-purple-300",
}: {
  id: string
  title: string
  kicker: string
  children: React.ReactNode
  bgClass?: string
  accent?: string
}) {
  return (
    <section id={id} className={`px-6 py-16 md:px-12 lg:px-16 ${bgClass ?? ""}`}>
      <div className="mb-6 space-y-1">
        <p className={`text-xs uppercase tracking-[0.3em] ${accent}`}>{kicker}</p>
        <h2 className="text-3xl font-semibold text-white">{title}</h2>
      </div>
      {children}
    </section>
  )
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-5 shadow-sm dark:border-white/10 dark:bg-surface-800/80 transition hover:-translate-y-1 hover:border-white/30">
      <h3 className="text-lg font-semibold mb-3 text-white">{title}</h3>
      {children}
    </div>
  )
}
