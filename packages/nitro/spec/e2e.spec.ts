import { spawn } from 'node:child_process'
import { createServer } from 'node:net'
import path from 'node:path'
import { afterAll, afterEach, beforeAll, describe, expect, test } from 'vite-plus/test'
import { delay, runCommand } from '../../shared/src/index.ts'

import type { AddressInfo } from 'node:net'

const playgroundDir = path.resolve(import.meta.dirname, '../playground/basic')
const nitroBin = path.resolve(import.meta.dirname, '../node_modules/.bin/nitro')

let serve: ReturnType<typeof spawn> | null = null

// Start each server on a free port, so that the requests do not reach another server, such as one left by an earlier run
function getFreePort(): Promise<number> {
  return new Promise((resolve, reject) => {
    const server = createServer()
    server.once('error', reject)
    server.listen(0, () => {
      const { port } = server.address() as AddressInfo
      server.close(() => resolve(port))
    })
  })
}

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

async function startDevServer(): Promise<string> {
  const port = await getFreePort()
  serve = spawn(nitroBin, ['dev', playgroundDir, '--port', String(port)], {
    stdio: 'ignore'
  })
  const url = `http://localhost:${port}`
  await waitForServer(url)
  return url
}

afterEach(() => {
  serve?.kill()
  serve = null
})

describe('e2e', () => {
  test('translation with Accept-Language: en', async () => {
    const url = await startDevServer()
    const stdout = await runCommand(`curl -s -H 'Accept-Language: en' ${url}`)
    expect(stdout).toContain('hello, Nitro')
  })

  test('translation with Accept-Language: ja', async () => {
    const url = await startDevServer()
    const stdout = await runCommand(`curl -s -H 'Accept-Language: ja' ${url}`)
    expect(stdout).toContain('こんにちは, Nitro')
  })
})

// A production build can drop code that `nitro dev` keeps, such as the message compiler registration of `@intlify/core`
describe('e2e with a production build', () => {
  let url = ''
  let server: ReturnType<typeof spawn> | null = null

  beforeAll(async () => {
    await runCommand(`${nitroBin} build ${playgroundDir}`, { timeout: 60_000 })
    const port = await getFreePort()
    server = spawn(process.execPath, [path.join(playgroundDir, '.output/server/index.mjs')], {
      env: { ...process.env, PORT: String(port) },
      stdio: 'ignore'
    })
    url = `http://localhost:${port}`
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
