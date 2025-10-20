use anchor_lang::prelude::*;
use arcium_anchor::prelude::*;

#[account]
pub struct Market {
    pub bump: u8,
    pub sponsor: Pubkey,
    pub authority: Pubkey,
    pub question: String,
    pub resolution_date: i64,
    pub window_state: MarketWindow,
    pub liquidity_cap: u64,
    /// Encrypted market state: [yes_pool, no_pool, last_price, total_trades] as 32-byte ciphertexts
    pub market_state: [[u8; 32]; 4],
    pub public_yes_pool: u64,
    pub public_no_pool: u64,
    pub public_last_price: u64,
    pub public_total_trades: u64,
    pub nonce: u128,
    pub opp_window_duration: u64,
    pub pub_window_duration: u64,
    pub last_switch_ts: i64,
    pub resolved: bool,
    pub outcome: Option<bool>,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, PartialEq, Eq)]
pub enum MarketWindow {
    Private,
    Public,
}

#[account]
pub struct UserPosition {
    pub bump: u8,
    pub user: Pubkey,
    pub market: Pubkey,
    /// Encrypted user position: [yes_tokens, no_tokens] as 32-byte ciphertexts
    pub position_state: [[u8; 32]; 2],
    pub nonce: u128,
}
