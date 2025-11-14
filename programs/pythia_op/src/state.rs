use anchor_lang::prelude::*;

#[account]
pub struct Sponsor {
    pub bump: u8,
    pub authority: Pubkey,
    pub name: String,  // Max 100 chars
    pub is_whitelisted: bool,
    pub creation_date: i64,
    pub total_markets_created: u64,
}

#[account]
pub struct Market {
    pub bump: u8,
    pub sponsor: Pubkey,  // Reference to Sponsor account
    pub authority: Pubkey,
    pub question: String,
    pub resolution_date: i64,
    pub window_state: MarketWindow,
    pub liquidity_cap: u64,
    pub initial_liquidity_usdc: u64,  // Track initial sponsor liquidity
    /// Encrypted market state: [yes_pool, no_pool, k, total_trades] as 32-byte ciphertexts
    pub market_state: [[u8; 32]; 4],
    pub public_yes_pool: u64,
    pub public_no_pool: u64,
    pub public_yes_price: u64,   // Price in thousandths (0-1000, where 500 = 50%)
    pub public_no_price: u64,    // Price in thousandths (0-1000, where 500 = 50%)
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
    /// Encrypted user position: [yes_tokens, no_tokens, yes_tokens_closed, no_tokens_closed] as 32-byte ciphertexts
    pub position_state: [[u8; 32]; 4],
    pub nonce: u128,
    /// Track position close events for public window reveal
    pub close_records: Vec<CloseRecord>,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone)]
pub struct CloseRecord {
    pub timestamp: i64,
    pub yes_shares_closed: u64,
    pub no_shares_closed: u64,
    pub market_price_at_close: u64,  // Will be set when switching to public window
}
