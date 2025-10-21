#!/bin/bash
#
# Stop Local Testing Environment
# Stops validator and cleans up
#

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

echo "🛑 Stopping local testing environment..."

pkill -9 solana-test-validator 2>/dev/null && echo "  ✓ Validator stopped" || echo "  - No validator running"
lsof -ti:8899 | xargs kill -9 2>/dev/null && echo "  ✓ Port 8899 freed" || true
lsof -ti:8900 | xargs kill -9 2>/dev/null && echo "  ✓ Port 8900 freed" || true

echo ""
echo "✅ Stopped"
echo ""
echo "To restart: ./restart-local.sh"

