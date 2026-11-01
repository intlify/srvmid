/**
 * @author kazuya kawaguchi (a.k.a. kazupon)
 * @license MIT
 */

import { exec } from 'node:child_process'
import { createServer } from 'node:net'

import type { ExecOptions } from 'node:child_process'
import type { AddressInfo } from 'node:net'

export function runCommand(command: string, options?: ExecOptions): Promise<string> {
  return new Promise((resolve, reject) => {
    exec(
      command,
      { timeout: 30_000, ...options, env: { ...process.env, ...options?.env } },
      (error, stdout, stderr) => {
        if (error) {
          reject(new Error(`Command failed: ${command}\n${stderr.toString()}\n${error.message}`))
        } else {
          resolve(stdout.toString())
        }
      }
    )
  })
}

export function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}

// The e2e tests start each server on a free port, so that the requests do not reach another server, such as one left by an earlier run
export function getFreePort(): Promise<number> {
  return new Promise((resolve, reject) => {
    const server = createServer()
    server.once('error', reject)
    server.listen(0, () => {
      const { port } = server.address() as AddressInfo
      server.close(() => resolve(port))
    })
  })
}
