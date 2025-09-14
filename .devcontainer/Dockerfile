FROM node:20

ARG TZ
ENV TZ="$TZ"

ARG CLAUDE_CODE_VERSION=latest

# Install basic development tools, iptables/ipset, and Python environment
RUN apt-get update && apt-get install -y --no-install-recommends \
  less \
  git \
  procps \
  sudo \
  fzf \
  zsh \
  man-db \
  unzip \
  gnupg2 \
  gh \
  iptables \
  ipset \
  iproute2 \
  dnsutils \
  aggregate \
  jq \
  nano \
  vim \
  python3 \
  python3-pip \
  python3-venv \
  curl \
  && apt-get clean && rm -rf /var/lib/apt/lists/*

# Ensure default node user has access to /usr/local/share
RUN mkdir -p /workspace /home/node/.claude /home/node/.pnpm-store /home/node/.pnpm \
  /workspace/node_modules /workspace/apps/blog/node_modules /workspace/apps/portfolio/node_modules \
  /workspace/packages/ui/node_modules /workspace/packages/tailwind-config/node_modules \
  /workspace/packages/tsconfig/node_modules /workspace/packages/test-utils/node_modules && \
  chown -R node:node /workspace /home/node

ARG USERNAME=node

# Persist bash history.
RUN SNIPPET="export PROMPT_COMMAND='history -a' && export HISTFILE=/commandhistory/.bash_history" \
  && mkdir /commandhistory \
  && touch /commandhistory/.bash_history \
  && chown -R $USERNAME /commandhistory

# Set `DEVCONTAINER` environment variable to help with orientation
ENV DEVCONTAINER=true

WORKDIR /workspace

ARG GIT_DELTA_VERSION=0.18.2
RUN ARCH=$(dpkg --print-architecture) && \
  wget "https://github.com/dandavison/delta/releases/download/${GIT_DELTA_VERSION}/git-delta_${GIT_DELTA_VERSION}_${ARCH}.deb" && \
  sudo dpkg -i "git-delta_${GIT_DELTA_VERSION}_${ARCH}.deb" && \
  rm "git-delta_${GIT_DELTA_VERSION}_${ARCH}.deb"

# Install Claude and pnpm
RUN npm install -g pnpm @anthropic-ai/claude-code@${CLAUDE_CODE_VERSION} && \
  pnpm config set store-dir /home/node/.pnpm-store

# Set up non-root user
USER node

# Set the pnpm paths
ENV PNPM_HOME="/home/node/.pnpm"
ENV PNPM_STORE_DIR="/home/node/.pnpm-store"
ENV PATH="${PNPM_HOME}:${PATH}"

# Set the default shell to zsh rather than sh
ENV SHELL=/bin/zsh

# Set the default editor and visual
ENV EDITOR nano
ENV VISUAL nano

# Default powerline10k theme
ARG ZSH_IN_DOCKER_VERSION=1.2.0
RUN sh -c "$(wget -O- https://github.com/deluan/zsh-in-docker/releases/download/v${ZSH_IN_DOCKER_VERSION}/zsh-in-docker.sh)" -- \
  -p git \
  -p fzf \
  -a "source /usr/share/doc/fzf/examples/key-bindings.zsh" \
  -a "source /usr/share/doc/fzf/examples/completion.zsh" \
  -a "export PROMPT_COMMAND='history -a' && export HISTFILE=/commandhistory/.bash_history" \
  -x

# Install uv (Python package manager) for the node user
RUN curl -LsSf https://astral.sh/uv/0.4.18/install.sh | sh

# Add uv to PATH for the node user
ENV PATH="/home/node/.local/bin:$PATH"

# Switch to root for permission configuration
USER root

# Copy and set up firewall script
COPY init-firewall.sh /usr/local/bin/
RUN chmod +x /usr/local/bin/init-firewall.sh

# Create permissions fix script
RUN cat << 'EOF' > /usr/local/bin/fix-node-modules-permissions.sh
#!/bin/bash

ALLOWED_DIRS=(
"/workspace/node_modules"
"/workspace/apps/blog/node_modules"
"/workspace/apps/portfolio/node_modules"
"/workspace/packages/ui/node_modules"
"/workspace/packages/tailwind-config/node_modules"
"/workspace/packages/tsconfig/node_modules"
"/workspace/packages/test-utils/node_modules"
"/home/node/.pnpm-store"
)

for dir in "${ALLOWED_DIRS[@]}"; do
if [ -d "$dir" ]; then
/bin/chown -R node:node "$dir"
fi
done
EOF

# Set up all sudo permissions
RUN chmod 755 /usr/local/bin/fix-node-modules-permissions.sh && \
  echo "node ALL=(root) NOPASSWD: /usr/local/bin/init-firewall.sh" > /etc/sudoers.d/node-permissions && \
  echo "node ALL=(root) NOPASSWD: /bin/chown -R node\\:node /workspace/node_modules, /bin/chown -R node\\:node /workspace/apps/blog/node_modules, /bin/chown -R node\\:node /workspace/apps/portfolio/node_modules, /bin/chown -R node\\:node /workspace/packages/ui/node_modules, /bin/chown -R node\\:node /workspace/packages/tailwind-config/node_modules, /bin/chown -R node\\:node /workspace/packages/tsconfig/node_modules, /bin/chown -R node\\:node /workspace/packages/test-utils/node_modules, /bin/chown -R node\\:node /home/node/.pnpm-store" >> /etc/sudoers.d/node-permissions && \
  echo "node ALL=(root) NOPASSWD: /usr/local/bin/fix-node-modules-permissions.sh" >> /etc/sudoers.d/node-permissions && \
  chmod 0440 /etc/sudoers.d/node-permissions

USER node
