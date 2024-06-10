#!/bin/bash

# Update and upgrade system
sudo apt update -y
sudo apt upgrade -y

# Install NVM
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.3/install.sh | bash

# Load NVM
export NVM_DIR="$([ -z "${XDG_CONFIG_HOME-}" ] && printf %s "${HOME}/.nvm" || printf %s "${XDG_CONFIG_HOME}/nvm")"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"

# Install Node.js
nvm install node
nvm use node
nvm alias default node

# Install Git and clone the repository
sudo apt install git -y
git clone https://github.com/memekmaklubau/kontol_sadboy_memek
cd kontol_sadboy_memek

# Install project dependencies
npm install

# Start a new tmux session and run the server
tmux new -d -s mysession 'node server.js'
