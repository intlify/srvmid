import { spawn } from 'node:child_process'
import path from 'node:path'
import { afterEach, describe, expect, test } from 'vitest'
import { delay, runCommand } from '../../shared/src/index.ts'

let serve: ReturnType<typeof spawn> | null = null

async function waitForServer(url: string, maxRetries = 20, interval = 500): Promise<void> {
  for (let i = 0; i < maxRetries; i++) {
    try {
      await runCommand(`curl -s -o /dev/null -w '%{http_code}' ${url}`)
      return
    } catch {
      await delay(interval)
    }
  }
  throw new Error(`Server at ${url} did not become ready`)
}

afterEach(() => {
  serve?.kill()
  serve = null
})

describe('e2e', () => {
  test('translation with Accept-Language: en', async () => {
    const playgroundDir = path.resolve(import.meta.dirname, '../playground/basic')
    const nitroBin = path.resolve(import.meta.dirname, '../node_modules/.bin/nitro')
    serve = spawn(nitroBin, ['dev', playgroundDir], {
      stdio: 'ignore'
    })
    await waitForServer('http://localhost:3000')
    const stdout = await runCommand(`curl -s -H 'Accept-Language: en' http://localhost:3000`)
    expect(stdout).toContain('hello, Nitro')
  })

  test('translation with Accept-Language: ja', async () => {
    const playgroundDir = path.resolve(import.meta.dirname, '../playground/basic')
    const nitroBin = path.resolve(import.meta.dirname, '../node_modules/.bin/nitro')
    serve = spawn(nitroBin, ['dev', playgroundDir], {
      stdio: 'ignore'
    })
    await waitForServer('http://localhost:3000')
    const stdout = await runCommand(`curl -s -H 'Accept-Language: ja' http://localhost:3000`)
    expect(stdout).toContain('こんにちは, Nitro')
  })
})
