import { spawn } from 'node:child_process'
import path from 'node:path'
import { afterAll, afterEach, beforeAll, describe, expect, test } from 'vite-plus/test'
import { delay, getFreePort, runCommand } from '../../shared/src/index.ts'

const playgroundDir = path.resolve(import.meta.dirname, '../playground/basic')
const hooksPlaygroundDir = path.resolve(import.meta.dirname, '../playground/hooks')
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

async function startDevServer(dir: string = playgroundDir): Promise<string> {
  const port = await getFreePort()
  serve = spawn(nitroBin, ['dev', dir, '--port', String(port)], {
    stdio: 'ignore'
  })
  const url = `http://localhost:${port}`
  await waitForServer(url)
  return url
}

async function startProductionServer(
  dir: string
): Promise<{ url: string; server: ReturnType<typeof spawn> }> {
  await runCommand(`${nitroBin} build ${dir}`, { timeout: 60_000 })
  const port = await getFreePort()
  const server = spawn(process.execPath, [path.join(dir, '.output/server/index.mjs')], {
    env: { ...process.env, PORT: String(port) },
    stdio: 'ignore'
  })
  const url = `http://localhost:${port}`
  await waitForServer(url)
  return { url, server }
}

// A header of the hooks playground:
// - `x-early-greeting`: a plugin registered before the intlify plugin translates in its `request` hook
// - `x-greeting`: a plugin registered after the intlify plugin translates in its `response` hook
async function fetchHeader(url: string, name: string): Promise<string> {
  const res = await fetch(url, { headers: { 'accept-language': 'ja' } })
  return decodeURIComponent(res.headers.get(name) ?? '')
}

// the body of `/stream`, which is translated after the handler returns
async function fetchStreamedBody(url: string): Promise<string> {
  const res = await fetch(`${url}/stream`, { headers: { 'accept-language': 'ja' } })
  return res.text()
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
    ;({ url, server } = await startProductionServer(playgroundDir))
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

// The hooks of the other plugins, before and after the intlify plugin, and a streamed body.
// The context of the intlify plugin is ready from the start (#23) to the end (#430) of the request
describe('e2e with hooks', () => {
  test('translation in the request hook of an earlier plugin', async () => {
    const url = await startDevServer(hooksPlaygroundDir)
    expect(await fetchHeader(url, 'x-early-greeting')).toBe('こんにちは, Nitro')
  })

  test('translation in the response hook of a later plugin', async () => {
    const url = await startDevServer(hooksPlaygroundDir)
    expect(await fetchHeader(url, 'x-greeting')).toBe('こんにちは, Nitro')
  })

  test('translation while streaming the body', async () => {
    const url = await startDevServer(hooksPlaygroundDir)
    expect(await fetchStreamedBody(url)).toBe('こんにちは, Nitro')
  })
})

describe('e2e with hooks, with a production build', () => {
  let url = ''
  let server: ReturnType<typeof spawn> | null = null

  beforeAll(async () => {
    ;({ url, server } = await startProductionServer(hooksPlaygroundDir))
  }, 60_000)

  afterAll(() => {
    server?.kill()
    server = null
  })

  test('translation in the request hook of an earlier plugin', async () => {
    expect(await fetchHeader(url, 'x-early-greeting')).toBe('こんにちは, Nitro')
  })

  test('translation in the response hook of a later plugin', async () => {
    expect(await fetchHeader(url, 'x-greeting')).toBe('こんにちは, Nitro')
  })

  test('translation while streaming the body', async () => {
    expect(await fetchStreamedBody(url)).toBe('こんにちは, Nitro')
  })
})
