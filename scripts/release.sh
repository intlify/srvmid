#!/bin/bash

set -e

# Restore all git changes
git restore --source=HEAD --staged --worktree -- package.json pnpm-lock.yaml

TAG="beta"

# Release packages for npm registry
for PKG in packages/* ; do
  if [[ -d $PKG ]]; then
    echo "⚡ Publishing $PKG with tag $TAG"
    pnpm publish --access public --no-git-checks --tag $TAG
    popd > /dev/null
  fi
done

# Release packages for jsr registry
for PKG in packages/* ; do
  if [[ -d $PKG ]]; then
    pushd $PKG
    pnpx tsx ../../scripts/jsr.ts --package $PKG --tag $TAG
    pnpm install --no-frozen-lockfile
    echo "⚡ Publishing $PKG for jsr registry"
    pnpx jsr publish -c jsr.json --allow-dirty
    popd > /dev/null
  fi
done
