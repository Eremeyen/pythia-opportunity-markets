use arcis_imports::*;

#[encrypted]
mod circuits {
    use arcis_imports::*;

    // Point basis: 1 USDC = 1000 shares
    const SHARES_PER_USDC: u64 = 1000;

    #[derive(Clone)]
    pub struct MarketState {
        pub yes_pool: u64,  
        pub no_pool: u64,  
        pub k: u64,         // Constant product
        pub total_trades: u64,
    }

    #[derive(Clone)]
    pub struct UserPosition {
        pub yes_tokens: u64,  // Active yes shares
        pub no_tokens: u64,   // Active no shares
        pub yes_tokens_closed: u64,  // Closed yes shares (in escrow)
        pub no_tokens_closed: u64,   // Closed no shares (in escrow)
    }

    #[derive(Clone)]
    pub struct TradeInput {
        pub usdc_amount: u64,  // Amount in USDC (will be converted to shares)
        pub is_buy_yes: bool,
    }

    #[derive(Clone)]
    pub struct CloseInput {
        pub close_yes_tokens: u64,
        pub close_no_tokens: u64,   
    }

    #[instruction]
    pub fn initialize_market(
        mxe: Mxe,
        initial_liquidity_usdc: u64, 
    ) -> Enc<Mxe, MarketState> {
        // This creates a 50/50 market where yes_price = no_price = $0.50
        let total_shares = initial_liquidity_usdc * SHARES_PER_USDC;
        let shares_per_side = total_shares / 2;
        
        let k = (shares_per_side / 1000) * (shares_per_side / 1000);
        
        let state = MarketState {
            yes_pool: shares_per_side,
            no_pool: shares_per_side,
            k: k, 
            total_trades: 0,
        };
        mxe.from_arcis(state)
    }

    #[instruction]
    pub fn initialize_user_position(mxe: Mxe) -> Enc<Mxe, UserPosition> {
        let position = UserPosition {
            yes_tokens: 0,
            no_tokens: 0,
            yes_tokens_closed: 0,
            no_tokens_closed: 0,
        };
        mxe.from_arcis(position)
    }

    #[instruction]
    pub fn process_private_trade(
        market_nonce: u128,
        market_ctxt: Enc<Mxe, MarketState>,
        trade_ctxt: Enc<Shared, TradeInput>,
    ) -> Enc<Mxe, MarketState> {
        let mut state = market_ctxt.to_arcis();
        let trade = trade_ctxt.to_arcis();

        // Convert USDC to shares
        let shares_input = trade.usdc_amount * SHARES_PER_USDC;

        // k was stored as scaled down by 1000000 (1000^2)
        let k_scaled = state.k * 1000000;

        if trade.is_buy_yes {
            // Buying YES: user adds shares_input to no_pool, receives shares from yes_pool
            // Formula: (yes_pool - shares_out) * (no_pool + shares_input) = k_scaled
            // shares_out = yes_pool - k_scaled / (no_pool + shares_input)
            
            let new_no_pool = state.no_pool + shares_input;
            let new_yes_pool = k_scaled / new_no_pool;
            let shares_received = state.yes_pool - new_yes_pool;
            
            state.yes_pool = new_yes_pool;
            state.no_pool = new_no_pool;
            
        } else {
            // Buying NO: user adds shares_input to yes_pool, receives shares from no_pool
            // Formula: (yes_pool + shares_input) * (no_pool - shares_out) = k_scaled
            // shares_out = no_pool - k_scaled / (yes_pool + shares_input)
            
            let new_yes_pool = state.yes_pool + shares_input;
            let new_no_pool = k_scaled / new_yes_pool;
            let shares_received = state.no_pool - new_no_pool;
            
            state.yes_pool = new_yes_pool;
            state.no_pool = new_no_pool;
        }

        state.total_trades += 1;
        market_ctxt.owner.from_arcis(state)
    }

    #[instruction]
    pub fn update_user_position(
        position_nonce: u128,
        position_ctxt: Enc<Mxe, UserPosition>,
        trade_ctxt: Enc<Shared, TradeInput>,
    ) -> Enc<Mxe, UserPosition> {
        let mut position = position_ctxt.to_arcis();
        let trade = trade_ctxt.to_arcis();

        // Convert USDC to shares
        let shares = trade.usdc_amount * SHARES_PER_USDC;

        if trade.is_buy_yes {
            position.yes_tokens += shares;
        } else {
            position.no_tokens += shares;
        }

        position_ctxt.owner.from_arcis(position)
    }

    #[instruction]
    pub fn close_position(
        position_nonce: u128,
        position_ctxt: Enc<Mxe, UserPosition>,
        close_ctxt: Enc<Shared, CloseInput>,
    ) -> Enc<Mxe, UserPosition> {
        let mut position = position_ctxt.to_arcis();
        let close = close_ctxt.to_arcis();

        // Move active token amounts to closed (escrow)
        if close.close_yes_tokens > 0 {
            position.yes_tokens -= close.close_yes_tokens;
            position.yes_tokens_closed += close.close_yes_tokens;
        }
        if close.close_no_tokens > 0 {
            position.no_tokens -= close.close_no_tokens;
            position.no_tokens_closed += close.close_no_tokens;
        }

        position_ctxt.owner.from_arcis(position)
    }

    #[instruction]
    pub fn reveal_market_state(market_ctxt: Enc<Mxe, MarketState>) -> (u64, u64, u64, u64, u64) {
        let state = market_ctxt.to_arcis();
        
        // Calculate current prices:
        // yes_price = no_pool / (yes_pool + no_pool) * 1000 (in thousandths)
        // no_price = yes_pool / (yes_pool + no_pool) * 1000 (in thousandths)
        let total_pool = state.yes_pool + state.no_pool;
        let yes_price = if total_pool > 0 {
            (state.no_pool * 1000) / total_pool
        } else {
            500  // Default to 50%
        };
        let no_price = 1000 - yes_price;  // Ensure they sum to 1000
        
        (
            state.yes_pool.reveal(),
            state.no_pool.reveal(),
            yes_price.reveal(),
            no_price.reveal(),
            state.total_trades.reveal()
        )
    }

    #[instruction]
    pub fn reveal_user_position(position_ctxt: Enc<Mxe, UserPosition>) -> (u64, u64, u64, u64) {
        let position = position_ctxt.to_arcis();
        (
            position.yes_tokens.reveal(),
            position.no_tokens.reveal(),
            position.yes_tokens_closed.reveal(),
            position.no_tokens_closed.reveal()
        )
    }

    #[instruction]
    pub fn hide_market_state(
        mxe: Mxe,
        yes_pool: u64,
        no_pool: u64,
        total_trades: u64
    ) -> Enc<Mxe, MarketState> {
        let k = (yes_pool / 1000) * (no_pool / 1000);
        
        let state = MarketState {
            yes_pool,
            no_pool,
            k,
            total_trades,
        };
        mxe.from_arcis(state)
    }

    // Sponsor view of market state - re-encrypt for sponsor's viewing
    #[instruction]
    pub fn view_market_state(
        market_ctxt: Enc<Mxe, MarketState>,
        sponsor_ctx: Shared,
    ) -> Enc<Shared, MarketState> {
        let state = market_ctxt.to_arcis();
        sponsor_ctx.from_arcis(state)
    }

    // Sponsor view of user position - re-encrypt for sponsor's viewing
    #[instruction]
    pub fn view_user_position(
        position_ctxt: Enc<Mxe, UserPosition>,
        sponsor_ctx: Shared,
    ) -> Enc<Shared, UserPosition> {
        let position = position_ctxt.to_arcis();
        sponsor_ctx.from_arcis(position)
    }
}
