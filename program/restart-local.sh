#!/bin/bash
#
# Start Local Testing Environment
# Starts validator, deploys program, runs tests
#

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

# Set PATH
export PATH="/Users/abhinav/.cargo/bin:/Users/abhinav/.local/share/solana/install/active_release/bin:$PATH"

echo "🛑 Stopping any existing processes..."
pkill -9 solana-test-validator 2>/dev/null || true
lsof -ti:8899 | xargs kill -9 2>/dev/null || true
sleep 2

echo "🧹 Cleaning old test data..."
rm -rf test-ledger .anchor

echo "🔨 Building program..."
arcium build || { echo "❌ Build failed"; exit 1; }

echo "🚀 Starting Solana test validator..."
nohup solana-test-validator > validator.log 2>&1 &
VALIDATOR_PID=$!
echo "  Validator PID: $VALIDATOR_PID"

echo "⏳ Waiting for validator to be ready..."
for i in {1..30}; do
    if curl -s http://127.0.0.1:8899/health > /dev/null 2>&1; then
        echo "✅ Validator is ready!"
        break
    fi
    sleep 1
done

echo "📦 Deploying program to localnet..."
anchor deploy --provider.cluster localnet --provider.wallet ~/.config/solana/id.json || {
    echo "❌ Deploy failed"
    pkill -9 solana-test-validator
    exit 1
}

echo "🧪 Running tests..."
export ANCHOR_PROVIDER_URL=http://127.0.0.1:8899
export ANCHOR_WALLET=~/.config/solana/id.json

npx ts-mocha -p ./tsconfig.json -t 100000 tests/simple-test.ts tests/test-trading.ts

echo ""
echo "✅ Tests complete!"
echo ""
echo "To stop: ./stop-local.sh"
echo "Validator log: tail -f validator.log"

