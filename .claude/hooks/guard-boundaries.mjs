#!/usr/bin/env node
// The lane, second layer: prevented, not merely declared.
//
// Claude Code PreToolUse hook. Before every Edit/Write it checks whether the
// file is inside the AGENTS.md boundaries (section "## Boundaries"). If it is,
// it only lets the write through when the active spec (specs/<slug>/spec.md,
// derived from the branch) lists it under "Modification scope". Otherwise it
// blocks and explains why.
//
// An AGENTS.md is a sign. This is a fence. See chapter 4 of the ebook.
import { readFileSync, existsSync } from 'node:fs'
import { join, relative, isAbsolute } from 'node:path'
import { matchesGlob, boundaries, readSpec, normalizePath, activeSpecPath } from '../../scripts/lib/spec.mjs'

const root = process.env.CLAUDE_PROJECT_DIR ?? process.cwd()

let input = ''
process.stdin.setEncoding('utf8')
process.stdin.on('data', (chunk) => (input += chunk))
process.stdin.on('end', () => {
  let payload
  try {
    payload = JSON.parse(input)
  } catch {
    process.exit(0) // no JSON, nothing to check
  }

  const rawPath = payload?.tool_input?.file_path ?? payload?.tool_input?.notebook_path
  if (!rawPath) process.exit(0)

  const path = normalizePath(isAbsolute(rawPath) ? relative(root, rawPath) : rawPath)
  if (path.startsWith('..')) process.exit(0) // outside the repo: not this hook's business

  const agentsPath = join(root, 'AGENTS.md')
  if (!existsSync(agentsPath)) process.exit(0)
  const protectedPaths = boundaries(readFileSync(agentsPath, 'utf8'))

  if (!matchesGlob(path, protectedPaths)) process.exit(0)

  const specPath = activeSpecPath(root)
  if (specPath) {
    const spec = readSpec(specPath)
    if (matchesGlob(path, spec.scope)) {
      process.stderr.write(`AGENTS.md boundary authorized by the spec (${normalizePath(relative(root, specPath))}): ${path}\n`)
      process.exit(0)
    }
  }

  process.stderr.write(
    [
      `BLOCKED by the lane: "${path}" is inside the AGENTS.md boundaries.`,
      specPath
        ? `The active spec (${normalizePath(relative(root, specPath))}) does not list it under "Modification scope".`
        : 'There is no active spec for this branch (specs/<slug>/spec.md).',
      'Stop and ask: if the task needs this file, it has to be added to the spec scope, with a person signing off on the change.',
    ].join('\n') + '\n',
  )
  process.exit(2)
})
