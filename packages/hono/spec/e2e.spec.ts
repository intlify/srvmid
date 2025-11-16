import { exec, spawn } from 'node:child_process'
import path from 'node:path'
import { afterEach, describe, expect, test } from 'vitest'

import type { ExecOptions } from 'node:child_process'

export function runCommand(command: string, options?: ExecOptions): Promise<string> {
  return new Promise((resolve, reject) => {
    exec(
      command,
      { timeout: 30_000, ...options, env: { ...process.env, ...options?.env } },
      (error, stdout, stderr) => {
        if (error) {
          reject(new Error(`Command failed: ${command}\n${stderr}\n${error.message}`))
        } else {
          resolve(stdout.toString())
        }
      }
    )
  })
}

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

let serve: ReturnType<typeof spawn> | null = null

afterEach(async () => {
  serve?.kill()
})

describe('e2e', () => {
  test('util-header', async () => {
    const target = path.resolve(import.meta.dirname, '../playground/util-header/index.ts')
    serve = spawn('pnpx', ['tsx', target])
    await delay(2000) // wait for server to start
    const stdout = await runCommand(
      `curl -H 'Accept-Language: ja,en-US;q=0.7,en;q=0.3' http://localhost:3000`
    )
    expect(stdout).toContain(`ja`)
  })

  test('util-query', async () => {
    const target = path.resolve(import.meta.dirname, '../playground/util-query/index.ts')
    serve = spawn('pnpx', ['tsx', target])
    await delay(2000) // wait for server to start
    const stdout = await runCommand(`curl http://localhost:3000?locale=en`)
    expect(stdout).toContain(`en`)
  })

  test('translation', async () => {
    const target = path.resolve(import.meta.dirname, '../playground/basic/index.ts')
    serve = spawn('pnpx', ['tsx', target])
    await delay(2000) // wait for server to start
    const stdout = await runCommand(
      `curl -H 'Accept-Language: ja,en-US;q=0.7,en;q=0.3' http://localhost:3000`
    )
    expect(stdout).toContain(`こんにちは, h3`)
  })
})
