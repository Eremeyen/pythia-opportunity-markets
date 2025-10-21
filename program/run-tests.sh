#!/bin/bash
#
# Run Tests Only
# Assumes validator is already running
#

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

export PATH="/Users/abhinav/.cargo/bin:/Users/abhinav/.local/share/solana/install/active_release/bin:$PATH"
export ANCHOR_PROVIDER_URL=http://127.0.0.1:8899
export ANCHOR_WALLET=~/.config/solana/id.json

# Check if validator is running
if ! curl -s http://127.0.0.1:8899/health > /dev/null 2>&1; then
    echo "❌ Validator not running!"
    echo "Start it with: ./restart-local.sh"
    exit 1
fi

echo "🧪 Running tests..."
echo ""

npx ts-mocha -p ./tsconfig.json -t 100000 tests/simple-test.ts tests/test-trading.ts

echo ""
echo "✅ Done!"

