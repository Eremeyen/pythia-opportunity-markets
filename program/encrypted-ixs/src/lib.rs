use arcis_imports::*;

#[encrypted]
mod circuits {
    use arcis_imports::*;

    // Fixed-point math constants and helpers
    const SCALE: i128 = 1_000_000; // 6 decimal places
    const LN2: i128 = 693_147; // ln(2) * 1e6
    const PRICE_SCALE: u64 = 10_000; // Price in basis points (0-10000)

    // Taylor series approximation for e^x
    pub fn exp_fixed(mut x: i128) -> i128 {
        // Clamp x to prevent overflow (approx. [-10, 10])
        if x > 10 * SCALE { x = 10 * SCALE; }
        if x < -10 * SCALE { x = -10 * SCALE; }

        // Range reduction: e^x = (e^(x/4))^4 for better stability
        let k = 4;
        x /= k;

        // Compute e^(x/k) using Taylor expansion
        let mut term = SCALE;
        let mut sum = SCALE;

        for n in 1..=10 {
            term = (term * x) / (SCALE * n as i128);
            sum += term;
        }

        // Raise (e^(x/k)) to the k-th power
        let mut result = sum;
        for _ in 1..k {
            result = (result * sum) / SCALE;
        }

        result
    }

    // Taylor series approximation for ln(x)
    pub fn ln_fixed(mut x: i128) -> i128 {
        let min_val = -10 * SCALE;
        
        // Handle invalid input with conditional assignment
        let valid = x > 0;
        x = if valid { x } else { SCALE }; // Use 1.0 for invalid

        let mut k: i128 = 0;

        // Bring x into range (0.5, 2) - use fixed iterations instead of while
        // Up to 20 iterations should be enough for reasonable values
        for _ in 0..20 {
            if x > 2 * SCALE {
                x /= 2;
                k += 1;
            }
        }
        for _ in 0..20 {
            if x < SCALE / 2 {
                x *= 2;
                k -= 1;
            }
        }

        // Now x ≈ 1 + y
        let y = x - SCALE;
        let y2 = (y * y) / SCALE;
        let y3 = (y2 * y) / SCALE;
        let y4 = (y3 * y) / SCALE;
        let y5 = (y4 * y) / SCALE;

        // Mercator expansion: ln(1+y) = y - y²/2 + y³/3 - y⁴/4 + y⁵/5
        let ln_1p_y = y - y2 / 2 + y3 / 3 - y4 / 4 + y5 / 5;

        let result = k * LN2 + ln_1p_y;
        
        // Return min_val if invalid
        if valid { result } else { min_val }
    }

    // LMSR cost function: C(q) = b * ln(e^(q_yes/b) + e^(q_no/b))
    pub fn lmsr_cost(q_yes: u64, q_no: u64, b: u64) -> i128 {
        let b_scaled = (b as i128) * SCALE / 1000; // Convert to fixed point
        let q_yes_scaled = (q_yes as i128) * SCALE / 1000;
        let q_no_scaled = (q_no as i128) * SCALE / 1000;

        let exp_yes = exp_fixed(q_yes_scaled / (b_scaled / SCALE));
        let exp_no = exp_fixed(q_no_scaled / (b_scaled / SCALE));
        
        let sum_exp = exp_yes + exp_no;
        let ln_sum = ln_fixed(sum_exp);
        
        (b_scaled * ln_sum) / SCALE
    }

    // LMSR price function: p = e^(q_yes/b) / (e^(q_yes/b) + e^(q_no/b))
    pub fn lmsr_price(q_yes: u64, q_no: u64, b: u64) -> u64 {
        let b_scaled = (b as i128) * SCALE / 1000;
        let q_yes_scaled = (q_yes as i128) * SCALE / 1000;
        let q_no_scaled = (q_no as i128) * SCALE / 1000;

        let exp_yes = exp_fixed(q_yes_scaled / (b_scaled / SCALE));
        let exp_no = exp_fixed(q_no_scaled / (b_scaled / SCALE));
        
        // Price = exp_yes / (exp_yes + exp_no)
        // Scale to 0-10000 (basis points)
        let price_scaled = (exp_yes * (PRICE_SCALE as i128)) / (exp_yes + exp_no);
        
        // Clamp to valid range using conditional assignment
        let clamped = if price_scaled < 0 {
            0
        } else if price_scaled > PRICE_SCALE as i128 {
            PRICE_SCALE as i128
        } else {
            price_scaled
        };
        
        clamped as u64
    }

    #[derive(Clone)]
    pub struct MarketState {
        pub yes_pool: u64,
        pub no_pool: u64,
        pub last_price: u64,
        pub total_trades: u64,
        pub liquidity_param: u64,  // The 'b' parameter for LMSR
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
        liquidity_param: u64,
    ) -> Enc<Mxe, MarketState> {
        let price = lmsr_price(initial_yes, initial_no, liquidity_param);
        let state = MarketState {
            yes_pool: initial_yes,
            no_pool: initial_no,
            last_price: price,
            total_trades: 0,
            liquidity_param,
        };
        mxe.from_arcis(state)
    }

    #[instruction]
    pub fn initialize_user_position(mxe: Mxe) -> Enc<Mxe, UserPosition> {
        let position = UserPosition {
            yes_tokens: 0,
            no_tokens: 0,
        };
        mxe.from_arcis(position)
    }

    #[instruction]
    pub fn process_private_trade(
        market_ctxt: Enc<Mxe, MarketState>,
        trade_ctxt: Enc<Shared, TradeInput>,
    ) -> Enc<Mxe, MarketState> {
        let mut state = market_ctxt.to_arcis();
        let trade = trade_ctxt.to_arcis();

        // Calculate old cost
        let old_cost = lmsr_cost(state.yes_pool, state.no_pool, state.liquidity_param);

        // Update pools based on LMSR
        // The trader pays dollar_amount to get shares
        // We need to find how many shares they get
        // Simplified: assume dollar_amount buys proportional shares
        // In reality, we'd solve: cost(q + shares) - cost(q) = dollar_amount
        // For now, approximate shares ≈ dollar_amount (will refine)
        
        let shares = trade.dollar_amount; // Simplified for v1
        
        if trade.is_buy_yes {
            state.yes_pool += shares;
        } else {
            state.no_pool += shares;
        }

        // Update price using LMSR formula
        state.last_price = lmsr_price(state.yes_pool, state.no_pool, state.liquidity_param);
        state.total_trades += 1;
        
        market_ctxt.owner.from_arcis(state)
    }

    #[instruction]
    pub fn update_user_position(
        position_ctxt: Enc<Mxe, UserPosition>,
        trade_ctxt: Enc<Shared, TradeInput>,
    ) -> Enc<Mxe, UserPosition> {
        let mut position = position_ctxt.to_arcis();
        let trade = trade_ctxt.to_arcis();

        if trade.is_buy_yes {
            position.yes_tokens += trade.dollar_amount;
        } else {
            position.no_tokens += trade.dollar_amount;
        }

        position_ctxt.owner.from_arcis(position)
    }

    #[instruction]
    pub fn reveal_market_state(market_ctxt: Enc<Mxe, MarketState>) -> (u64, u64, u64, u64, u64) {
        let state = market_ctxt.to_arcis();
        (
            state.yes_pool.reveal(),
            state.no_pool.reveal(),
            state.last_price.reveal(),
            state.total_trades.reveal(),
            state.liquidity_param.reveal()
        )
    }

    #[instruction]
    pub fn hide_market_state(
        mxe: Mxe,
        yes_pool: u64,
        no_pool: u64,
        last_price: u64,
        total_trades: u64,
        liquidity_param: u64
    ) -> Enc<Mxe, MarketState> {
        let state = MarketState {
            yes_pool,
            no_pool,
            last_price,
            total_trades,
            liquidity_param,
        };
        mxe.from_arcis(state)
    }

    // Sponsor view of market state
    #[instruction]
    pub fn view_market_state(
        market_ctxt: Enc<Mxe, MarketState>,
        sponsor_ctx: Shared,
    ) -> Enc<Shared, MarketState> {
        let state = market_ctxt.to_arcis();
        sponsor_ctx.from_arcis(state)
    }

    // Sponsor view of user position
    #[instruction]
    pub fn view_user_position(
        position_ctxt: Enc<Mxe, UserPosition>,
        sponsor_ctx: Shared,
    ) -> Enc<Shared, UserPosition> {
        let position = position_ctxt.to_arcis();
        sponsor_ctx.from_arcis(position)
    }
}
