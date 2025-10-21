use anchor_lang::prelude::*;
use arcium_anchor::prelude::*;

use crate::state::*;

#[event]
pub struct SponsorViewMarketEvent {
    pub market: Pubkey,
    pub encrypted_state: [[u8; 32]; 5],
    pub nonce: u128,
}

#[event]
pub struct UserPositionViewEvent {
    pub user_position: Pubkey,
    pub encrypted_state: [[u8; 32]; 2],
    pub nonce: u128,
}

#[event]
pub struct MarketResolvedEvent {
    pub market: Pubkey,
    pub outcome: bool,
}

#[event]
pub struct TradeEvent {
    pub market: Pubkey,
    pub window: MarketWindow,
}

#[event]
pub struct WindowSwitchEvent {
    pub market: Pubkey,
    pub new_window: MarketWindow,
    pub yes_pool: u64,
    pub no_pool: u64,
}

#[event]
pub struct PayoutClaimedEvent {
    pub market: Pubkey,
    pub trader: Pubkey,
    pub amount: u64,
    pub outcome: bool,
}