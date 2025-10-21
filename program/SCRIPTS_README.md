# Deployment Scripts Guide

## 🎯 Quick Start

### Interactive Menu (Recommended)
```bash
./deploy-manager.sh
```

This opens an interactive menu with all options.

---

## 📜 Available Scripts

### 1. `deploy-manager.sh` - Interactive Menu
**Main deployment management interface**

```bash
./deploy-manager.sh
```

Features:
- ✅ Start/restart local testing
- ✅ Deploy/redeploy to devnet
- ✅ Check status
- ✅ Clean artifacts
- ✅ Check wallet balance

**Use this for most operations!**

---

### 2. `restart-local.sh` - Restart Local Testing
**Stops all processes and restarts local test environment**

```bash
./restart-local.sh
```

What it does:
1. Kills all Solana validators
2. Kills all Arcium nodes
3. Stops Docker containers
4. Frees ports (8899, 8900, 9900)
5. Rebuilds program
6. Runs `arcium test`

**Use when**: Local test is stuck or you want fresh start

---

### 3. `redeploy-devnet.sh` - Redeploy to Devnet
**Upgrades the deployed program on devnet**

```bash
./redeploy-devnet.sh
```

What it does:
1. Checks wallet balance
2. Cleans old binaries
3. Rebuilds program
4. Deploys to devnet
5. Verifies deployment

Configuration (edit script to change):
- Program ID: `3u2pYisM2XDqEPDbt6avhpLvBJvoUKHbiYcEYvwfrueN`
- Cluster: `1078779259`
- RPC: `https://api.devnet.solana.com`

**Use when**: You've made code changes and want to upgrade devnet

---

### 4. `cleanup.sh` - Cleanup Build Artifacts
**Stops processes and optionally cleans build files**

```bash
# Basic cleanup (stops processes only)
./cleanup.sh

# Clean build artifacts
./cleanup.sh --build

# Deep clean (includes node_modules)
./cleanup.sh --all
```

Options:
- `--build` - Removes `target/`, `.anchor/`, artifacts
- `--all` - Removes everything including `node_modules/`

**Use when**: 
- Tests are hanging
- Want to free disk space
- Encountering weird build errors

---

## 🔄 Common Workflows

### Local Development Cycle

```bash
# 1. Start fresh
./cleanup.sh --build

# 2. Run tests
./restart-local.sh

# 3. Make code changes...

# 4. Test again
./restart-local.sh
```

### Devnet Deployment Cycle

```bash
# 1. Make sure you have SOL
solana balance --url devnet

# 2. Build and deploy
./redeploy-devnet.sh

# 3. Verify
solana program show 3u2pYisM2XDqEPDbt6avhpLvBJvoUKHbiYcEYvwfrueN --url devnet
```

### Quick Test (Most Common)

```bash
# Option 1: Interactive menu
./deploy-manager.sh
# Then select option 1 or 2

# Option 2: Direct command
./restart-local.sh
```

### Emergency Cleanup

```bash
# If everything is stuck/broken
./cleanup.sh --all
yarn install
arcium build
./restart-local.sh
```

---

## 🐛 Troubleshooting

### "Port already in use"

```bash
./cleanup.sh
# Waits 2 seconds, then try again
./restart-local.sh
```

### "Command not found: arcium"

Add Arcium to PATH:
```bash
export PATH="$HOME/.cargo/bin:$PATH"
./restart-local.sh
```

Or run via the full path in the script.

### "Insufficient funds"

```bash
# Check balance
solana balance --url devnet

# Get more SOL
# Visit: https://faucet.solana.com/
# Or use CLI (if not rate-limited):
solana airdrop 2 --url devnet
```

### "MXE already exists" error

This is normal! The script tries to create MXE but it already exists from previous deployment. The program upgrade still succeeds.

### Tests hang or timeout

```bash
# Nuclear option - kill everything
./cleanup.sh
pkill -9 solana
pkill -9 docker
sleep 5
./restart-local.sh
```

### Docker errors

```bash
# Stop all Docker containers
docker stop $(docker ps -aq)
./cleanup.sh
./restart-local.sh
```

---

## 📋 Script Checklist

Before running scripts, ensure:

- [ ] You're in the `/program` directory
- [ ] Scripts are executable (`chmod +x *.sh`)
- [ ] `arcium` is in PATH
- [ ] `solana` is in PATH (for devnet operations)
- [ ] Docker is running (for local testing)
- [ ] You have devnet SOL (for devnet operations)

---

## 🎨 Customization

### Change Devnet RPC

Edit `redeploy-devnet.sh`:
```bash
RPC_URL="https://devnet.helius-rpc.com/?api-key=YOUR_KEY"
```

### Change Program ID (after new deployment)

Edit `redeploy-devnet.sh` and `deploy-manager.sh`:
```bash
PROGRAM_ID="YOUR_NEW_PROGRAM_ID"
```

### Adjust Test Timeout

Edit `Anchor.toml`:
```toml
[scripts]
test = "bunx ts-mocha -p ./tsconfig.json -t 2000000 \"tests/**/*.ts\""
#                                           ^^^^^^^ milliseconds
```

---

## 🚀 Advanced Usage

### Run Specific Test

```bash
# Stop everything first
./cleanup.sh

# Run specific test file
arcium test tests/specific_test.ts
```

### Deploy to Different Cluster

```bash
# Edit the script or run manually:
arcium deploy \
  --cluster-offset YOUR_CLUSTER \
  --keypair-path ~/.config/solana/id.json \
  --rpc-url https://api.devnet.solana.com
```

### Monitor Logs

```bash
# Terminal 1: Start tests
./restart-local.sh

# Terminal 2: Watch Solana logs
solana logs --url http://127.0.0.1:8899

# Terminal 3: Watch Docker logs
docker compose -f artifacts/docker-compose-arx-env.yml logs -f
```

---

## 📊 Script Summary

| Script | Time | Use Case |
|--------|------|----------|
| `deploy-manager.sh` | Instant | Interactive menu - best for beginners |
| `restart-local.sh` | ~60s | Quick local testing |
| `redeploy-devnet.sh` | ~30s | Update deployed program |
| `cleanup.sh` | ~5s | Free resources |
| `cleanup.sh --all` | ~10s | Nuclear reset |

---

## 💡 Pro Tips

1. **Use the interactive menu** (`deploy-manager.sh`) when learning
2. **Bookmark these commands**:
   ```bash
   alias local-test='cd ~/Projects/pythia-opportunity-markets/program && ./restart-local.sh'
   alias deploy-dev='cd ~/Projects/pythia-opportunity-markets/program && ./redeploy-devnet.sh'
   ```
3. **Always check balance** before devnet operations
4. **Run cleanup** if anything seems stuck
5. **Local testing is faster** than devnet for development

---

## 🆘 Getting Help

If scripts fail:
1. Read the error message carefully
2. Try `./cleanup.sh --build` first
3. Check `DEPLOYMENT_STATUS.md` for known issues
4. Check `DEPLOYMENT_GUIDE.md` for detailed steps

---

*These scripts were generated to simplify deployment management. Feel free to customize them!*

