#!/usr/bin/env bash
set -e

LOG_FILE="deploy.log"

# Log a message with a timestamp
log() {
  echo "$(date '+%Y-%m-%d %H:%M:%S') $1" | tee -a "$LOG_FILE"
}

log "🚀 Starting deployment process"

# Save current branch
CURRENT_BRANCH=$(git rev-parse --abbrev-ref HEAD)

log "📍 Current branch: $CURRENT_BRANCH"

# Stash current changes
log "💾 Stashing current changes..."
git stash push -m "Deploy stash $(date '+%Y-%m-%d %H:%M:%S')"

# Switch to deploy branch
log "🔄 Switching to deploy branch..."
if git show-ref --verify --quiet refs/heads/deploy; then
  git checkout deploy
else
  git checkout -b deploy
fi

# Copy all files from source branch
log "📦 Copying code from $CURRENT_BRANCH..."
git checkout $CURRENT_BRANCH -- .

# Apply the stash to deploy branch
log "🔧 Applying stashed changes..."
git stash pop || log "⚠️ No stash to apply or conflicts occurred"

# Build and deploy
log "🏗️ Building project..."
pnpm install
pnpm vite build

log "🚀 Deploying to Firebase..."
firebase deploy

# Commit changes with timestamp
COMMIT_MSG="Deploy: $(date '+%Y-%m-%d %H:%M:%S')"
log "💾 Committing changes: $COMMIT_MSG"
git add .
git commit -m "$COMMIT_MSG" || log "⚠️ Nothing to commit"

# Go back to the original branch
log "🔙 Switching back to original branch: $CURRENT_BRANCH"
git checkout "$CURRENT_BRANCH" || log "⚠️ Failed to switch back to $CURRENT_BRANCH"

# Pop the stash back
log "🔄 Restoring stashed changes..."
git stash pop || log "⚠️ No stash to restore"

log "✅ Deployment complete! Back to $CURRENT_BRANCH with original state restored."