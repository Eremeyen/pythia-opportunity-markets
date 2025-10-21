#!/bin/bash
#
# Cleanup Script
# Stops all processes and optionally cleans build artifacts
#

set -e  # Exit on error

echo "🧹 Cleaning up Pythia Opportunity Markets environment"
echo "====================================================="

# Parse arguments
CLEAN_BUILD=false
CLEAN_ALL=false

while [[ $# -gt 0 ]]; do
    case $1 in
        --build)
            CLEAN_BUILD=true
            shift
            ;;
        --all)
            CLEAN_ALL=true
            CLEAN_BUILD=true
            shift
            ;;
        *)
            echo "Unknown option: $1"
            echo "Usage: $0 [--build] [--all]"
            echo "  --build  Clean build artifacts"
            echo "  --all    Clean everything (build + node_modules)"
            exit 1
            ;;
    esac
done

echo ""
echo "🛑 Stopping all processes..."

# Kill Solana validators
echo "  - Stopping Solana validators..."
pkill -f solana-test-validator 2>/dev/null && echo "    ✓ Stopped" || echo "    Already stopped"

# Kill Arcium nodes
echo "  - Stopping Arcium nodes..."
pkill -f arcium 2>/dev/null && echo "    ✓ Stopped" || echo "    Already stopped"
pkill -f arx 2>/dev/null && echo "    ✓ Stopped" || echo "    Already stopped"

# Stop Docker containers
echo "  - Stopping Docker containers..."
if command -v docker &> /dev/null; then
    CONTAINERS=$(docker ps -q --filter "name=arcium" --filter "name=arx")
    if [ -n "$CONTAINERS" ]; then
        echo "$CONTAINERS" | xargs docker stop 2>/dev/null && echo "    ✓ Stopped containers"
    else
        echo "    No containers running"
    fi
fi

# Clean up ports
echo "  - Freeing ports..."
lsof -ti:8899 | xargs kill -9 2>/dev/null && echo "    ✓ Port 8899 freed" || true
lsof -ti:8900 | xargs kill -9 2>/dev/null && echo "    ✓ Port 8900 freed" || true
lsof -ti:9900 | xargs kill -9 2>/dev/null && echo "    ✓ Port 9900 freed" || true

sleep 1

if [ "$CLEAN_BUILD" = true ]; then
    echo ""
    echo "🗑️  Cleaning build artifacts..."
    rm -rf target/ 2>/dev/null && echo "  ✓ Removed target/" || echo "  target/ not found"
    rm -rf .anchor/ 2>/dev/null && echo "  ✓ Removed .anchor/" || echo "  .anchor/ not found"
    rm -rf artifacts/localnet/*.json 2>/dev/null && echo "  ✓ Removed localnet artifacts" || true
fi

if [ "$CLEAN_ALL" = true ]; then
    echo ""
    echo "🗑️  Deep cleaning..."
    rm -rf node_modules/ 2>/dev/null && echo "  ✓ Removed node_modules/" || echo "  node_modules/ not found"
    rm -rf encrypted-ixs/target/ 2>/dev/null && echo "  ✓ Removed encrypted-ixs/target/" || true
    rm -f yarn.lock 2>/dev/null && echo "  ✓ Removed yarn.lock" || true
    rm -f bun.lockb 2>/dev/null && echo "  ✓ Removed bun.lockb" || true
fi

echo ""
echo "✅ Cleanup complete!"

if [ "$CLEAN_ALL" = true ]; then
    echo ""
    echo "To rebuild, run:"
    echo "  yarn install"
    echo "  arcium build"
fi

