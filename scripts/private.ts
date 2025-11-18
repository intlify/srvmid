#!/usr/bin/env node

/**
 * Check if a package is private
 * Usage: node scripts/private.ts <package-path>
 * Returns: "true" if package is private, "false" otherwise
 */

import path from 'node:path'
import { pathToFileURL } from 'node:url'

async function isPrivatePackage(packagePath: string): Promise<boolean> {
  try {
    const packageJsonPath = path.resolve(packagePath, 'package.json')
    const packageJsonUrl = pathToFileURL(packageJsonPath).href
    const packageJson = (
      (await import(packageJsonUrl, { with: { type: 'json' } })) as { default: { private?: true } }
    ).default
    return packageJson.private === true
  } catch {
    // If package.json doesn't exist or can't be parsed, treat as non-private
    return false
  }
}

const packagePath = process.argv[2]

if (!packagePath) {
  console.error('Error: Package path is required')
  console.error('Usage: node scripts/private.ts <package-path>')
  process.exit(1)
}

const isPrivate = await isPrivatePackage(packagePath)
console.log(isPrivate)
