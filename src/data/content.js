export const skills = {
  frontend: [
    { name: 'React', level: 'Advanced' },
    { name: 'JavaScript (ES6+)', level: 'Advanced' },
    { name: 'Tailwind CSS', level: 'Advanced' },
    { name: 'Redux', level: 'Intermediate' },
  ],
  backend: [
    { name: 'Java', level: 'Advanced' },
    { name: 'Spring Boot', level: 'Advanced' },
    { name: 'Spring MVC', level: 'Intermediate' },
    { name: 'Hibernate/JPA', level: 'Intermediate' },
    { name: 'REST APIs', level: 'Advanced' },
  ],
  tools: [
    { name: 'Git & GitHub', level: 'Advanced' },
    { name: 'Postman', level: 'Advanced' },
    { name: 'Cloudflare Workers / KV / D1', level: 'Intermediate' },
    { name: 'n8n Automation', level: 'Intermediate' },
  ],
}

export const projects = [
  {
    title: 'LokSetu – AI Content Automation SaaS',
    description:
      'AI-assisted content engine with image/video automation, scheduling, and multilingual support for creators.',
    tech: ['React', 'Cloudflare Workers', 'KV', 'D1'],
    live: '#',
    github: '#',
  },
  {
    title: 'FinanceFlow – Expense & Income Tracker',
    description:
      'Full-stack personal finance dashboard with user auth, analytics, and visualizations to monitor cashflow.',
    tech: ['React', 'Spring Boot', 'PostgreSQL'],
    live: '#',
    github: '#',
  },
  {
    title: 'Blog Platform (Spring MVC)',
    description:
      'Role-based blog engine featuring CRUD, authentication, and editor workflows built with Spring MVC + Hibernate.',
    tech: ['Java', 'Spring MVC', 'Hibernate'],
    live: '#',
    github: '#',
  },
]

export const articles = [
  {
    title: 'How I Built LokSetu: AI-Powered Content Automation',
    preview: 'Design decisions, infra, and lessons from shipping an automation-first content platform.',
  },
  {
    title: 'React + Spring Boot: A Pragmatic Architecture',
    preview: 'Patterns I use to keep frontends fast and backends robust without over-engineering.',
  },
  {
    title: 'Beginner Java Mistakes I Still See',
    preview: 'From DTO misuse to error handling—simple fixes that level up backend reliability.',
  },
]
