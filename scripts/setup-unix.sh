#!/usr/bin/env bash
set -e
STATE_FILE=".vibe.json"
LOG_FILE="setup.log"
TOTAL_STEPS=6
STEP=1

# Log a message with a timestamp
log() {
  echo "$(date '+%Y-%m-%d %H:%M:%S') $1" | tee -a "$LOG_FILE"
}

# Step progress logging
step_log() {
  log "[$STEP/$TOTAL_STEPS] $1"
  STEP=$((STEP + 1))
}

log "🚀 Starting ViBe Setup Script"

# boolian wasclones true or false
WASCLONED=false

clone_repo() {
  log "📦 Cloning ViBe repository..."
  git clone https://github.com/continuousactivelearning/vibe.git
  if [ $? -ne 0 ]; then
    log "❌ Failed to clone the repository."
    exit 1
  fi
  WASCLONED=true
  cd vibe

}
check_repo() {
  if ! command -v git &>/dev/null; then
    log "Git is not installed."
      if command -v apt >/dev/null 2>&1; then
        sudo apt update
        sudo apt install -y git
      elif command -v dnf >/dev/null 2>&1; then
        sudo dnf install -y git
      elif command -v yum >/dev/null 2>&1; then
        sudo yum install -y git
      elif command -v pacman >/dev/null 2>&1; then
        sudo pacman -Sy --noconfirm git
      elif command -v brew >/dev/null 2>&1; then
        brew install git
      else
        log "No package manager found. Please install Git manually."
        exit 1
      fi
    fi
    log "Git installed successfully."
  if git rev-parse --is-inside-work-tree >/dev/null 2>&1; then
    log "This is a Git repository."
  else
    log "No Git repository found."
    clone_repo
  fi
}

detect_and_source_shell_config() {
  if [ -f "$HOME/.bashrc" ]; then
    source "$HOME/.bashrc"
  elif [ -f "$HOME/.bash_profile" ]; then
    source "$HOME/.bash_profile"
  elif [ -f "$HOME/.zshrc" ]; then
    source "$HOME/.zshrc"
  elif [ -f "$HOME/.zprofile" ]; then
    source "$HOME/.zprofile"
  elif [ -f "$HOME/.config/fish/config.fish" ]; then
    source "$HOME/.config/fish/config.fish"
  else
    log "⚠️ No shell config file found; you may need to add pnpm to your PATH manually."
  fi
}

install_pnpm() {
  if ! command -v pnpm >/dev/null 2>&1; then
    log "📦 Installing pnpm..."
    if command -v curl >/dev/null 2>&1; then
      curl -fsSL https://get.pnpm.io/install.sh | sh -
    elif command -v wget >/dev/null 2>&1; then
      wget -qO- https://get.pnpm.io/install.sh | sh -
    else
      log "❌ curl or wget is required to install pnpm."
      exit 1
    fi
  fi

  detect_and_source_shell_config

  if ! command -v pnpm >/dev/null 2>&1; then
    log "❌ Failed to install pnpm. Restart the setup."
    exit 1
  else
    log "✅ pnpm: $(pnpm -v)"
  fi
}


verify_node() {
  if command -v node >/dev/null 2>&1; then
    log "✅ Node.js found at version $(node -v)."
    current_node=$(node -v)
    required_node="v23.0.0"
    if ! [ "$(printf '%s\n' "${required_node#v}" "${current_node#v}" | sort -V | head -n1)" = "${required_node#v}" ]; then
      log "❌ Node.js version is too old. Updating to v23.0.0 or higher."
      curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.2/install.sh | bash
      # in lieu of restarting the shell
      \. "$HOME/.nvm/nvm.sh"
      # Download and install Node.js:
      nvm install 23
      detect_and_source_shell_config
      if command -v node >/dev/null 2>&1; then
        log "✅ Node.js updated to $(node -v)."
      else
        log "❌ Failed to update Node.js. Please update it manually."
        exit 1
      fi
    fi
  else
    curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.2/install.sh | bash
    # in lieu of restarting the shell
    \. "$HOME/.nvm/nvm.sh"
    # Download and install Node.js:
    nvm install 23
    detect_and_source_shell_config
  fi
}


install_node_deps() {
  log "📦 Installing required Node.js dependencies..."
  pnpm i -g tsx
  if ! command -v firebase >/dev/null 2>&1; then
    pnpm i -g firebase-tools
  fi
  sudo chown -R "$USER:$(id -gn)" ./
  pnpm i
}

install_cli() {
  log "⚙ Installing CLI..."
  cd cli
  pnpm link --global
  cd ..
  log "✅ Vibe CLI installed and linked globally."
}

init_state() {
  if [ ! -f "$STATE_FILE" ]; then
    echo "{}" >"$STATE_FILE"
    log "📄 Created $STATE_FILE"
  fi
}


detect_and_source_shell_config

if [[ "$(pwd)" == */scripts ]]; then
  cd ..
fi

step_log "Checking Git and Repository..."
check_repo

step_log "Installing pnpm..."
install_pnpm

step_log "Verifying Node.js..."
verify_node

step_log "Installing Node.js dependencies..."
install_node_deps

step_log "Linking CLI..."
install_cli

step_log "Initializing state and running vibe setup..."
init_state
vibe setup
if [ "$WASCLONED" = true ]; then
  log "Do 'cd vibe' to enter the directory."
fi
log "✅ Setup complete! To use CLI restart the terminal or source the rc file."
