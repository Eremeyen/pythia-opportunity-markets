use anchor_lang::prelude::*;

use crate::state::*;

#[event]
pub struct SponsorViewMarketEvent {
    pub market: Pubkey,
    pub encrypted_state: [[u8; 32]; 4],
    pub nonce: u128,
}

#[event]
pub struct UserPositionViewEvent {
    pub user_position: Pubkey,
    pub encrypted_state: [[u8; 32]; 4],
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
    pub yes_price: u64,  // In thousandths (0-1000)
    pub no_price: u64,   // In thousandths (0-1000)
}