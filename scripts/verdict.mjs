#!/usr/bin/env node
// The verdict runner.
//
//   pnpm verdict specs/<slug>/spec.md  runs each criterion and checks scope
//   pnpm verdict                      uses the current branch's spec
//   pnpm verdict --base origin/main   calculates the diff against a base branch
//   pnpm verdict --only-scope         checks scope without running commands
//   pnpm verdict --write              writes the report into the spec
//
// Exits with code 1 when a criterion fails, scope is exceeded, or assertions
// from existing tests were modified.
import { execSync, spawnSync } from 'node:child_process'
import { readFileSync, writeFileSync } from 'node:fs'
import { relative } from 'node:path'
import { matchesGlob, readSpec, normalizePath, currentBranch, activeSpecPath } from './lib/spec.mjs'

const args = process.argv.slice(2)
const hasFlag = (name) => args.includes(name)
const getOption = (name, defaultValue) => {
  const index = args.indexOf(name)
  return index === -1 ? defaultValue : args[index + 1]
}
const specPath = args.find((arg) => !arg.startsWith('--') && arg.endsWith('.md')) ?? activeSpecPath()

if (!specPath) {
  console.error('Spec not found. Pass it as an argument: pnpm verdict specs/<slug>/spec.md')
  process.exit(2)
}

const spec = readSpec(specPath)
const branch = currentBranch() ?? '(no git)'
const base = getOption('--base', branch === 'main' ? 'HEAD' : 'main')
const scopeOnly = hasFlag('--only-scope')

// Changed files include branch commits, working-tree changes, and untracked files.
function runGit(command) {
  try {
    return execSync(command, { stdio: ['ignore', 'pipe', 'ignore'] })
      .toString()
      .split(/\r?\n/)
      .filter(Boolean)
  } catch {
    return []
  }
}

const changedFiles = new Set([
  ...(base === 'HEAD' ? [] : runGit(`git diff --name-only ${base}...HEAD`)),
  ...runGit('git diff --name-only HEAD'),
  ...runGit('git ls-files --others --exclude-standard'),
].map(normalizePath))

const specDirectory = normalizePath(relative(process.cwd(), specPath)).replace(/\/spec\.md$/, '')
// The active spec, its directory, and project memory are always in scope.
const allowedScope = [...spec.scope, `${specDirectory}/**`, 'specs/INDEX.md']

const outOfScope = [...changedFiles].filter((file) => !matchesGlob(file, allowedScope))
const inScope = [...changedFiles].filter((file) => matchesGlob(file, allowedScope))

// Existing assertions are part of the examination and must not be changed.
function findModifiedAssertions() {
  const diffs = [
    ...(base === 'HEAD' ? [] : runGit(`git diff --unified=0 ${base}...HEAD -- "*.test.ts"`)),
    ...runGit('git diff --unified=0 HEAD -- "*.test.ts"'),
  ]
  const assertions = []
  let file = ''
  for (const line of diffs) {
    if (line.startsWith('--- a/')) file = normalizePath(line.slice(6))
    else if (line.startsWith('-') && !line.startsWith('---') && /\bexpect\s*\(/.test(line)) {
      assertions.push({ file, line: line.slice(1).trim() })
    }
  }
  return assertions
}

const modifiedAssertions = findModifiedAssertions()

const results = []
if (!scopeOnly) {
  for (const criterion of spec.acceptanceCriteria) {
    if (!criterion.command) {
      results.push({ ...criterion, status: 'MANUAL', elapsedMs: 0, output: '' })
      continue
    }

    const startedAt = Date.now()
    const commandResult = spawnSync(criterion.command, { shell: true, encoding: 'utf8', stdio: 'pipe' })
    const elapsedMs = Date.now() - startedAt
    const combinedOutput = `${commandResult.stdout ?? ''}${commandResult.stderr ?? ''}`
    let output = combinedOutput.trim().split(/\r?\n/).slice(-12).join('\n')
    let status = commandResult.status === 0 ? 'PASS' : 'FAIL'

    // Vitest exits with 0 when a -t filter matches no tests. That is not a pass.
    if (status === 'PASS' && /vitest/.test(criterion.command) && !/Tests\s+\d+\s+passed/.test(combinedOutput)) {
      status = 'FAIL'
      output = 'The command ran no tests: the -t filter matched no test name.'
    }

    results.push({
      ...criterion,
      status,
      exitCode: commandResult.status,
      elapsedMs,
      output,
    })
  }
}

const formatSeconds = (milliseconds) => `${(milliseconds / 1000).toFixed(1)}s`
const pad = (value, width) => String(value).padEnd(width)

console.log('')
console.log(`VERDICT · ${spec.title}`)
console.log(`Spec: ${normalizePath(relative(process.cwd(), specPath))} · Branch: ${branch} · Base: ${base}`)
console.log('')

if (!scopeOnly) {
  console.log('Acceptance criteria')
  if (results.length === 0) console.log('  (the spec has no executable acceptance criteria)')
  for (const result of results) {
    console.log(`  ${pad(result.number, 3)}${pad(result.status, 9)}${pad(formatSeconds(result.elapsedMs), 7)} ${result.criterion}`)
    if (result.status === 'FAIL') {
      console.log(`       ↳ ${result.command} (exit ${result.exitCode})`)
      for (const line of result.output.split('\n')) console.log(`         ${line}`)
    }
    if (result.status === 'MANUAL') console.log('       ↳ no command: this criterion requires manual review.')
  }
  console.log('')
}

console.log(`Scope (${changedFiles.size} changed files)`)
for (const file of inScope) console.log(`  IN_SCOPE      ${file}`)
for (const file of outOfScope) console.log(`  OUT_OF_SCOPE  ${file} ← not included in the spec scope`)
if (changedFiles.size === 0) console.log('  (no changes relative to the base)')
console.log('')

console.log('Existing test assertions')
if (modifiedAssertions.length === 0) console.log('  UNCHANGED')
for (const assertion of modifiedAssertions) console.log(`  MODIFIED  ${assertion.file}: ${assertion.line}`)
console.log('')

const failedCriteria = results.filter((result) => result.status === 'FAIL').length
const manualCriteria = results.filter((result) => result.status === 'MANUAL').length
const passed = failedCriteria === 0 && outOfScope.length === 0 && modifiedAssertions.length === 0

const summary = []
if (failedCriteria) summary.push(`${failedCriteria} failed criterion${failedCriteria > 1 ? 's' : ''}`)
if (outOfScope.length) summary.push(`${outOfScope.length} file${outOfScope.length > 1 ? 's' : ''} out of scope`)
if (modifiedAssertions.length) summary.push(`${modifiedAssertions.length} existing assertion${modifiedAssertions.length > 1 ? 's' : ''} modified`)
if (manualCriteria) summary.push(`${manualCriteria} manual criterion${manualCriteria > 1 ? 's' : ''}`)

console.log(`Result: ${passed ? 'PASS' : 'FAIL'}${summary.length ? ' · ' + summary.join(' · ') : ''}`)
console.log('')

// --write stores the report in the spec while preserving the contract heading.
if (hasFlag('--write')) {
  const generatedAt = new Date().toISOString().slice(0, 16).replace('T', ' ')
  const rows = results
    .map((result) => `| ${result.number} | ${result.criterion} | ${result.status} | ${result.command ? `\`${result.command}\` → exit ${result.exitCode ?? '-'} (${formatSeconds(result.elapsedMs)})` : 'manual review'} |`)
    .join('\n')
  const report = [
    '## Verdict',
    '',
    `> Generated by \`pnpm verdict --write\` on ${generatedAt} UTC · branch \`${branch}\` · base \`${base}\``,
    '',
    '| # | Criterion | Status | Evidence |',
    '|---|---|---|---|',
    rows || '| - | (no executable acceptance criteria) | - | - |',
    '',
    `**Scope:** ${outOfScope.length === 0 ? 'all changes are in scope' : `out of scope: ${outOfScope.map((file) => `\`${file}\``).join(', ')}`}`,
    `**Existing assertions:** ${modifiedAssertions.length === 0 ? 'unchanged' : `${modifiedAssertions.length} modified`}`,
    `**Result:** ${passed ? 'PASS' : 'FAIL'}`,
    '',
  ].join('\n')

  const original = readFileSync(specPath, 'utf8')
  const verdictSection = /^## Verdict\b[\s\S]*?(?=\n## |$(?![\s\S]))/m
  const updated = verdictSection.test(original)
    ? original.replace(verdictSection, report.trimEnd())
    : `${original.trimEnd()}\n\n${report}`
  writeFileSync(specPath, updated)
  console.log(`Verdict written to ${normalizePath(relative(process.cwd(), specPath))}`)
}

process.exit(passed ? 0 : 1)
