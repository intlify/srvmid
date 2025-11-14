#!/bin/bash

set -e

# Restore all git changes
git restore --source=HEAD --staged --worktree -- package.json pnpm-lock.yaml

TAG="alpha"

# Release packages for npm registry
for PKG in packages/* ; do
  if [[ -d $PKG ]]; then
    echo "⚡ Publishing $PKG with tag $TAG"
    pnpm publish --access public --no-git-checks --tag $TAG
    popd > /dev/null
  fi
done
