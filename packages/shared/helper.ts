import { exec } from 'node:child_process'

import type { ExecOptions } from 'node:child_process'

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

export function delay(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms))
}
