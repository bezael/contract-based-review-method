// Reads a task contract from specs/<slug>/spec.md.
//
// Used by scripts/verdict.mjs and .claude/hooks/guard-boundaries.mjs.
// No dependencies: Node.js only.
import { existsSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { execSync } from 'node:child_process'

/** Returns the contents of a `## Title` section until the next `## `. */
export function getSection(markdown, title) {
  const lines = markdown.split(/\r?\n/)
  const start = lines.findIndex((line) => line.trim().toLowerCase() === `## ${title}`.toLowerCase())
  if (start === -1) return null
  const body = []
  for (const line of lines.slice(start + 1)) {
    if (/^## /.test(line)) break
    body.push(line)
  }
  return body.join('\n')
}

/** Parses acceptance-criteria rows from the contract table. */
export function acceptanceCriteria(markdown) {
  const text = getSection(markdown, 'Acceptance criteria')
  if (!text) return []
  const rows = []
  for (const line of text.split('\n')) {
    if (!line.trim().startsWith('|')) continue
    const cells = line.split('|').slice(1, -1).map((cell) => cell.trim())
    if (cells.length < 3) continue
    const number = Number(cells[0])
    if (!Number.isInteger(number)) continue
    const command = cells[2].match(/`([^`]+)`/)?.[1] ?? null
    rows.push({ number, criterion: cells[1], command })
  }
  return rows
}

/** Parses modification-scope bullets. Globs are supported. */
export function scope(markdown) {
  const text = getSection(markdown, 'Modification scope')
  if (!text) return []
  return [...text.matchAll(/^\s*-\s+`([^`]+)`/gm)].map((match) => normalizePath(match[1]))
}

/** Parses permanent AGENTS.md boundary bullets that contain a path. */
export function boundaries(agentsMarkdown) {
  const text = getSection(agentsMarkdown, 'Boundaries')
  if (!text) return []
  return [...text.matchAll(/^\s*-\s+`([^`]+)`/gm)]
    .map((match) => normalizePath(match[1]))
    .filter((path) => !path.includes(' '))
}

export function normalizePath(path) {
  return path.replace(/\\/g, '/').replace(/^\.\//, '')
}

/** Converts a simple glob (`**`, `*`, `?`, `dir/`) into a RegExp. */
export function globToRegex(glob) {
  let pattern = normalizePath(glob)
  if (pattern.endsWith('/')) pattern += '**'
  const doubleSlashMarker = '\u0000'
  const doubleStarMarker = '\u0001'
  const escaped = pattern
    .replace(/[.+^${}()|[\]\\]/g, '\\$&')
    .replace(/\*\*\//g, doubleSlashMarker)
    .replace(/\*\*/g, doubleStarMarker)
    .replace(/\*/g, '[^/]*')
    .replace(/\?/g, '[^/]')
    .replaceAll(doubleSlashMarker, '(?:.*/)?')
    .replaceAll(doubleStarMarker, '.*')
  return new RegExp(`^${escaped}$`)
}

export function matchesGlob(path, globs) {
  const normalizedPath = normalizePath(path)
  return globs.some((glob) => globToRegex(glob).test(normalizedPath))
}

/** Returns the current branch, or null when outside a Git repository. */
export function currentBranch(cwd = process.cwd()) {
  try {
    return execSync('git branch --show-current', { cwd, stdio: ['ignore', 'pipe', 'ignore'] })
      .toString()
      .trim()
  } catch {
    return null
  }
}

/** Resolves the active spec from the current branch or the SPEC environment variable. */
export function activeSpecPath(cwd = process.cwd()) {
  if (process.env.SPEC) return process.env.SPEC
  const branch = currentBranch(cwd)
  if (!branch) return null
  const slug = branch.split('/').pop()
  const candidate = join(cwd, 'specs', slug, 'spec.md')
  return existsSync(candidate) ? candidate : null
}

export function readSpec(path) {
  const markdown = readFileSync(path, 'utf8')
  return {
    path,
    markdown,
    title: markdown.match(/^#\s+(.+)$/m)?.[1] ?? path,
    acceptanceCriteria: acceptanceCriteria(markdown),
    scope: scope(markdown),
  }
}
