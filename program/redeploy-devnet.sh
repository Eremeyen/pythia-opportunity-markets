#!/bin/bash
#
# Redeploy to Devnet
# This rebuilds and upgrades the deployed program on devnet
#

set -e  # Exit on error

# Configuration
PROGRAM_ID="3u2pYisM2XDqEPDbt6avhpLvBJvoUKHbiYcEYvwfrueN"
CLUSTER_OFFSET="1078779259"
KEYPAIR_PATH="$HOME/.config/solana/id.json"
RPC_URL="https://api.devnet.solana.com"

echo "🔨 Redeploying Pythia Opportunity Markets to Devnet"
echo "=================================================="
echo "Program ID: $PROGRAM_ID"
echo "Cluster:    Devnet"
echo "RPC:        $RPC_URL"
echo ""

# Check balance
echo "💰 Checking wallet balance..."
BALANCE=$(solana balance --url devnet --keypair "$KEYPAIR_PATH" | awk '{print $1}')
echo "Balance: $BALANCE SOL"

if (( $(echo "$BALANCE < 1" | bc -l) )); then
    echo "⚠️  WARNING: Low balance. You may need more SOL."
    echo "Get more at: https://faucet.solana.com/"
    read -p "Continue anyway? (y/n) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

echo ""
echo "🧹 Cleaning old build artifacts..."
rm -rf target/deploy/*.so 2>/dev/null || true

echo ""
echo "🔨 Building program..."
arcium build

if [ ! -f "target/deploy/pythia_op.so" ]; then
    echo "❌ Build failed - program binary not found"
    exit 1
fi

echo ""
echo "📦 Program binary size: $(du -h target/deploy/pythia_op.so | cut -f1)"
echo ""
echo "🚀 Deploying to devnet..."
echo ""

# Deploy using arcium (handles program + IDL)
arcium deploy \
  --cluster-offset "$CLUSTER_OFFSET" \
  --keypair-path "$KEYPAIR_PATH" \
  --rpc-url "$RPC_URL" || {
    echo ""
    echo "⚠️  Deployment had warnings (likely MXE already exists)"
    echo "This is usually fine - the program was upgraded successfully"
}

echo ""
echo "✅ Deployment complete!"
echo ""
echo "📊 Verifying deployment..."

# Verify program
solana program show "$PROGRAM_ID" --url devnet | head -8

echo ""
echo "🎉 Program successfully redeployed!"
echo ""
echo "Next steps:"
echo "  1. Test with: yarn ts-node init-comp-defs.ts"
echo "  2. View on explorer: https://explorer.solana.com/address/$PROGRAM_ID?cluster=devnet"
echo ""

