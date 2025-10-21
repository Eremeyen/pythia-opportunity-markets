#!/bin/bash
#
# Deployment Manager
# Interactive menu for managing local and devnet deployments
#

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

show_menu() {
    clear
    echo -e "${BLUE}╔═══════════════════════════════════════════════════╗${NC}"
    echo -e "${BLUE}║                                                   ║${NC}"
    echo -e "${BLUE}║   🎯 Pythia Opportunity Markets - Deploy Manager  ║${NC}"
    echo -e "${BLUE}║                                                   ║${NC}"
    echo -e "${BLUE}╚═══════════════════════════════════════════════════╝${NC}"
    echo ""
    echo -e "${GREEN}Local Testing:${NC}"
    echo "  1) Start local test (builds + runs tests)"
    echo "  2) Restart local test (cleans + rebuilds)"
    echo "  3) Stop local test (cleanup only)"
    echo ""
    echo -e "${GREEN}Devnet:${NC}"
    echo "  4) Deploy to devnet (initial deploy)"
    echo "  5) Redeploy to devnet (upgrade existing)"
    echo "  6) Check devnet status"
    echo ""
    echo -e "${GREEN}Maintenance:${NC}"
    echo "  7) Clean build artifacts"
    echo "  8) Deep clean (includes node_modules)"
    echo "  9) Check wallet balance"
    echo ""
    echo "  0) Exit"
    echo ""
    echo -n "Select option: "
}

check_balance() {
    echo ""
    echo "💰 Wallet Balance:"
    echo "  Localnet: (N/A - uses test accounts)"
    echo "  Devnet:   $(solana balance --url devnet 2>/dev/null || echo 'Not configured')"
    echo ""
    read -p "Press Enter to continue..."
}

local_test() {
    echo ""
    echo -e "${BLUE}🚀 Starting local test...${NC}"
    echo ""
    arcium test
}

restart_local() {
    echo ""
    echo -e "${BLUE}🔄 Restarting local test environment...${NC}"
    bash "$SCRIPT_DIR/restart-local.sh"
}

stop_local() {
    echo ""
    echo -e "${BLUE}🛑 Stopping local test environment...${NC}"
    bash "$SCRIPT_DIR/cleanup.sh"
}

deploy_devnet() {
    echo ""
    echo -e "${BLUE}🚀 Initial deployment to devnet...${NC}"
    echo ""
    echo "This will:"
    echo "  - Build the program"
    echo "  - Deploy to devnet"
    echo "  - Upload IDL"
    echo "  - Initialize MXE"
    echo ""
    read -p "Continue? (y/n) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        bash "$SCRIPT_DIR/redeploy-devnet.sh"
    fi
}

redeploy_devnet() {
    echo ""
    echo -e "${BLUE}🔄 Redeploying to devnet...${NC}"
    bash "$SCRIPT_DIR/redeploy-devnet.sh"
}

check_devnet() {
    echo ""
    echo -e "${BLUE}📊 Devnet Status${NC}"
    echo ""
    
    PROGRAM_ID="3u2pYisM2XDqEPDbt6avhpLvBJvoUKHbiYcEYvwfrueN"
    
    echo "Program ID: $PROGRAM_ID"
    echo ""
    
    if command -v solana &> /dev/null; then
        echo "Program Info:"
        solana program show "$PROGRAM_ID" --url devnet 2>/dev/null || echo "  Not found or not deployed"
        echo ""
        
        echo "MXE Info:"
        arcium mxe-info "$PROGRAM_ID" --rpc-url https://api.devnet.solana.com 2>/dev/null || echo "  MXE not initialized"
    else
        echo "Solana CLI not found in PATH"
    fi
    
    echo ""
    echo "Explorer: https://explorer.solana.com/address/$PROGRAM_ID?cluster=devnet"
    echo ""
    read -p "Press Enter to continue..."
}

clean_build() {
    echo ""
    echo -e "${BLUE}🧹 Cleaning build artifacts...${NC}"
    bash "$SCRIPT_DIR/cleanup.sh" --build
    echo ""
    read -p "Press Enter to continue..."
}

deep_clean() {
    echo ""
    echo -e "${YELLOW}⚠️  WARNING: This will remove node_modules and all build artifacts${NC}"
    read -p "Are you sure? (y/n) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        bash "$SCRIPT_DIR/cleanup.sh" --all
        echo ""
        echo "To rebuild, run: yarn install && arcium build"
    fi
    echo ""
    read -p "Press Enter to continue..."
}

# Main loop
while true; do
    show_menu
    read -r choice
    
    case $choice in
        1) local_test ;;
        2) restart_local ;;
        3) stop_local ;;
        4) deploy_devnet ;;
        5) redeploy_devnet ;;
        6) check_devnet ;;
        7) clean_build ;;
        8) deep_clean ;;
        9) check_balance ;;
        0) 
            echo ""
            echo "👋 Goodbye!"
            exit 0
            ;;
        *)
            echo ""
            echo -e "${RED}Invalid option${NC}"
            sleep 1
            ;;
    esac
done

