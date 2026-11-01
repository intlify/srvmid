import { spawn } from 'node:child_process'
import path from 'node:path'
import { afterEach, describe, expect, test } from 'vite-plus/test'
import { delay, getFreePort, runCommand } from '../../shared/src/index.ts'

let serve: ReturnType<typeof spawn> | null = null

afterEach(() => {
  serve?.kill()
})

async function startPlayground(name: string): Promise<string> {
  const port = await getFreePort()
  const target = path.resolve(import.meta.dirname, `../playground/${name}/index.ts`)
  serve = spawn('pnpx', ['tsx', target], { env: { ...process.env, PORT: String(port) } })
  await delay(2000) // wait for server to start
  return `http://localhost:${port}`
}

describe('e2e', () => {
  test('util-header', async () => {
    const url = await startPlayground('util-header')
    const stdout = await runCommand(`curl -H 'Accept-Language: ja,en-US;q=0.7,en;q=0.3' ${url}`)
    expect(stdout).toContain(`ja`)
  })

  test('util-query', async () => {
    const url = await startPlayground('util-query')
    const stdout = await runCommand(`curl ${url}?locale=en`)
    expect(stdout).toContain(`en`)
  })

  test('translation', async () => {
    const url = await startPlayground('basic')
    const stdout = await runCommand(`curl -H 'Accept-Language: ja,en-US;q=0.7,en;q=0.3' ${url}`)
    expect(stdout).toContain(`こんにちは, elysia`)
  })
})
