use arcis_imports::*;

#[encrypted]
mod circuits {
    use arcis_imports::*;

    #[derive(Clone)]
    pub struct MarketState {
        pub yes_pool: u64,
        pub no_pool: u64,
        pub last_price: u64,
        pub total_trades: u64,
    }

    #[derive(Clone)]
    pub struct UserPosition {
        pub yes_tokens: u64,
        pub no_tokens: u64,
    }

    #[derive(Clone)]
    pub struct TradeInput {
        pub dollar_amount: u64,
        pub is_buy_yes: bool,
    }

    #[instruction]
    pub fn initialize_market(
        mxe: Mxe,
        initial_yes: u64,
        initial_no: u64,
    ) -> Enc<Mxe, MarketState> {
        let state = MarketState {
            yes_pool: initial_yes,
            no_pool: initial_no,
            last_price: 5000, // Starting price at 50% (5000 basis points)
            total_trades: 0,
        };
        mxe.from_arcis(state)
    }

    #[instruction]
    pub fn initialize_user_position(mxe: Mxe) -> Enc<Mxe, UserPosition> {
        let position = UserPosition {
            yes_tokens: 0, // User starts with no yes tokens
            no_tokens: 0,  // User starts with no no tokens
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

        // Update pools and price based on trade direction
        if trade.is_buy_yes {
            state.yes_pool += trade.dollar_amount;
            state.last_price += trade.dollar_amount / 100;
        } else {
            state.no_pool += trade.dollar_amount;
            state.last_price -= trade.dollar_amount / 100;
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

        // Update user's position based on trade direction
        if trade.is_buy_yes {
            position.yes_tokens += trade.dollar_amount;
        } else {
            position.no_tokens += trade.dollar_amount;
        }

        position_ctxt.owner.from_arcis(position)
    }

    #[instruction]
    pub fn reveal_market_state(market_ctxt: Enc<Mxe, MarketState>) -> (u64, u64, u64, u64) {
        let state = market_ctxt.to_arcis();
        (
            state.yes_pool.reveal(),
            state.no_pool.reveal(),
            state.last_price.reveal(),
            state.total_trades.reveal()
        )
    }

    #[instruction]
    pub fn hide_market_state(
        mxe: Mxe,
        yes_pool: u64,
        no_pool: u64,
        last_price: u64,
        total_trades: u64
    ) -> Enc<Mxe, MarketState> {
        let state = MarketState {
            yes_pool,
            no_pool,
            last_price,
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
