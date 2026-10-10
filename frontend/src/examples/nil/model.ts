export const reference = "2026-10-04T14:30:00Z"
export const seed = 4421
export const sections = ["now", "soon", "anytime", "done"] as const
export type Section = (typeof sections)[number]
export type Kind = "todo" | "note" | "scratch"
export interface NilRecord {
  id: string
  title: string
  body: string
  kind: Kind
  section: Section
  contexts: string[]
  projects: string[]
  tags: string[]
  pinned: boolean
  inbox: boolean
  archived: boolean
  priority?: number | null
  due?: string | null
  recurrence?: string
}
export const taxonomy = {
  contexts: ["desk", "studio", "outside"],
  projects: ["launch", "garden", "fieldnotes"],
  tags: ["review", "idea", "weekly"],
}
const titles = [
  "Review launch checklist",
  "Gather field notes",
  "Sketch the next iteration",
  "Review launch checklist",
  "A deliberately long title about keeping the whole operations table readable while preserving native keyboard ownership and local draft custody across narrow screens",
]
export function fixture(): NilRecord[] {
  return Array.from({ length: 42 }, (_, i) => ({
    // Opaque punctuation/Unicode identities are never parsed or normalized.
    id: i === 0 ? "__proto__" : i === 1 ? "0" : `nil:4421/${i * 37 + 11}/Ω`,
    title:
      i >= 36
        ? ""
        : i < 24
          ? `${titles[i % titles.length]}${i % 5 === 3 ? "" : ` · ${i + 1}`}`
          : `Note ${i - 23}: ${titles[i % titles.length]}`,
    body: `${i >= 36 ? "Untitled capture" : "Authored local fixture"} ${i + 1}.\n\n${Array.from({ length: i === 0 ? 22 : 3 }, (_, p) => `Paragraph ${p + 1}: source remains fixed; edits are transient fixture state. No provider or backend is connected.`).join("\n\n")}`,
    kind: i >= 36 ? "scratch" : i < 24 ? "todo" : "note",
    section: sections[i % 4],
    contexts: i % 4 === 0 ? [] : [taxonomy.contexts[i % 3]],
    projects: [taxonomy.projects[Math.floor(i / 3) % 3]],
    tags: i % 3 === 0 ? [] : [taxonomy.tags[i % 3]],
    pinned: i % 7 === 0,
    inbox: i >= 36,
    archived: false,
    ...(i % 4 === 0 ? {} : { priority: i % 4 === 1 ? 0 : i % 4 === 2 ? null : 2 }),
    ...(i % 5 === 0 ? { due: "2026-10-04" } : i % 5 === 1 ? { due: null } : {}),
    ...(i === 4 ? { recurrence: "weekly" } : {}),
  }))
}
export function label(record: NilRecord) {
  return record.title || "Untitled capture"
}
export function matches(record: NilRecord, query: string): boolean {
  return query
    .trim()
    .toLowerCase()
    .split(/\s+/)
    .every((term) => {
      if (term.startsWith("@"))
        return record.contexts.some((v) => v.toLowerCase().includes(term.slice(1)))
      if (term.startsWith("+"))
        return record.projects.some((v) => v.toLowerCase().includes(term.slice(1)))
      if (term.startsWith("#"))
        return record.tags.some((v) => v.toLowerCase().includes(term.slice(1)))
      return `${record.title} ${record.body}`.toLowerCase().includes(term)
    })
}
