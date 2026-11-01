import { spawn } from 'node:child_process'
import path from 'node:path'
import { afterAll, afterEach, beforeAll, describe, expect, test } from 'vite-plus/test'
import { delay, runCommand } from '../../shared/src/index.ts'

const playgroundDir = path.resolve(import.meta.dirname, '../playground/basic')
const nitroBin = path.resolve(import.meta.dirname, '../node_modules/.bin/nitro')

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
    serve = spawn(nitroBin, ['dev', playgroundDir], {
      stdio: 'ignore'
    })
    await waitForServer('http://localhost:3000')
    const stdout = await runCommand(`curl -s -H 'Accept-Language: en' http://localhost:3000`)
    expect(stdout).toContain('hello, Nitro')
  })

  test('translation with Accept-Language: ja', async () => {
    serve = spawn(nitroBin, ['dev', playgroundDir], {
      stdio: 'ignore'
    })
    await waitForServer('http://localhost:3000')
    const stdout = await runCommand(`curl -s -H 'Accept-Language: ja' http://localhost:3000`)
    expect(stdout).toContain('こんにちは, Nitro')
  })
})

// A production build can drop code that `nitro dev` keeps, such as the message compiler registration of `@intlify/core`
describe('e2e with a production build', () => {
  const url = 'http://localhost:3001'
  let server: ReturnType<typeof spawn> | null = null

  beforeAll(async () => {
    await runCommand(`${nitroBin} build ${playgroundDir}`, { timeout: 60_000 })
    server = spawn(process.execPath, [path.join(playgroundDir, '.output/server/index.mjs')], {
      env: { ...process.env, PORT: '3001' },
      stdio: 'ignore'
    })
    await waitForServer(url)
  }, 60_000)

  afterAll(() => {
    server?.kill()
    server = null
  })

  test('translation with Accept-Language: en', async () => {
    const stdout = await runCommand(`curl -s -H 'Accept-Language: en' ${url}`)
    expect(stdout).toContain('hello, Nitro')
  })

  test('translation with Accept-Language: ja', async () => {
    const stdout = await runCommand(`curl -s -H 'Accept-Language: ja' ${url}`)
    expect(stdout).toContain('こんにちは, Nitro')
  })
})
