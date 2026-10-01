// Fixture for specs/verdict-git-color/spec.md. Not a task contract.
//
// Builds a throwaway git repository where an existing `expect(` line changed
// in the working tree, then runs the verdict inside it with git color forced
// on (color.ui=always, through GIT_CONFIG_* so no config file is touched).
// The verdict must report that assertion as MODIFIED and exit 1.
import { cpSync, mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join, resolve } from 'node:path'
import { execSync, spawnSync } from 'node:child_process'

const root = process.cwd()
const repo = mkdtempSync(join(tmpdir(), 'verdict-git-color-'))
const git = (command) =>
  execSync(`git -c user.name=fixture -c user.email=fixture@example.com ${command}`, { cwd: repo, stdio: 'pipe' })

try {
  mkdirSync(join(repo, 'scripts/lib'), { recursive: true })
  cpSync(resolve(root, 'scripts/verdict.mjs'), join(repo, 'scripts/verdict.mjs'))
  cpSync(resolve(root, 'scripts/lib/spec.mjs'), join(repo, 'scripts/lib/spec.mjs'))

  mkdirSync(join(repo, 'specs/task'), { recursive: true })
  writeFileSync(
    join(repo, 'specs/task/spec.md'),
    '# Spec: fixture\n\n## Acceptance criteria\n\n## Modification scope\n\n- `src/**`\n',
  )

  mkdirSync(join(repo, 'src'))
  const test = (expected) => `it('adds', () => {\n  expect(1 + 1).toBe(${expected})\n})\n`
  writeFileSync(join(repo, 'src/a.test.ts'), test(2))
  git('init -q -b main')
  git('add -A')
  git('commit -q -m fixture')
  writeFileSync(join(repo, 'src/a.test.ts'), test(3))

  const env = { ...process.env, GIT_CONFIG_COUNT: '1', GIT_CONFIG_KEY_0: 'color.ui', GIT_CONFIG_VALUE_0: 'always' }
  const result = spawnSync(process.execPath, ['scripts/verdict.mjs', 'specs/task/spec.md', '--only-scope'], {
    cwd: repo,
    env,
    encoding: 'utf8',
  })
  const output = `${result.stdout}${result.stderr}`
  process.stdout.write(output)

  if (result.status !== 1) throw new Error(`expected exit 1, got ${result.status}`)
  if (!/MODIFIED\s+src\/a\.test\.ts/.test(output)) {
    throw new Error('the changed expect() was not reported as MODIFIED: git color hid it')
  }
} finally {
  rmSync(repo, { recursive: true, force: true })
}
