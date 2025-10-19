use anchor_lang::prelude::*;
use arcium_anchor::prelude::*;

// Computation definition offsets for each encrypted instruction
const COMP_DEF_OFFSET_INITIALIZE_MARKET: u32 = comp_def_offset("initialize_market");
const COMP_DEF_OFFSET_PROCESS_PRIVATE_TRADE: u32 = comp_def_offset("process_private_trade");
const COMP_DEF_OFFSET_REVEAL_MARKET_STATE: u32 = comp_def_offset("reveal_market_state");
const COMP_DEF_OFFSET_HIDE_MARKET_STATE: u32 = comp_def_offset("hide_market_state");
const COMP_DEF_OFFSET_VIEW_MARKET_STATE: u32 = comp_def_offset("view_market_state");

declare_id!("5MqofGJPEaBLZPzhdevGcsgN4kraDP5wnLCCygpjQ2Yf");

#[arcium_program]
pub mod pythia_op {
    use super::*;

    pub fn init_initialize_market_comp_def(ctx: Context<InitInitializeMarketCompDef>) -> Result<()> {
        init_comp_def(ctx.accounts, true, 0, None, None)?;
        Ok(())
    }

    pub fn init_process_private_trade_comp_def(ctx: Context<InitProcessPrivateTradeCompDef>) -> Result<()> {
        init_comp_def(ctx.accounts, true, 0, None, None)?;
        Ok(())
    }

    pub fn init_reveal_market_state_comp_def(ctx: Context<InitRevealMarketStateCompDef>) -> Result<()> {
        init_comp_def(ctx.accounts, true, 0, None, None)?;
        Ok(())
    }

    pub fn init_hide_market_state_comp_def(ctx: Context<InitHideMarketStateCompDef>) -> Result<()> {
        init_comp_def(ctx.accounts, true, 0, None, None)?;
        Ok(())
    }

    pub fn init_view_market_state_comp_def(ctx: Context<InitViewMarketStateCompDef>) -> Result<()> {
        init_comp_def(ctx.accounts, true, 0, None, None)?;
        Ok(())
    }

    pub fn init_market(
        ctx: Context<InitMarket>,
        question: String,
        resolution_date: i64,
        liquidity_cap: u64,
        opp_window_duration: u64,
        pub_window_duration: u64,
    ) -> Result<()> {
        let market = &mut ctx.accounts.market;
        let clock = Clock::get()?;

        market.bump = ctx.bumps.market;
        market.sponsor = ctx.accounts.sponsor.key();
        market.authority = ctx.accounts.sponsor.key(); // Sponsor is initial authority
        market.question = question;
        market.resolution_date = resolution_date;
        market.window_state = MarketWindow::Private;
        market.liquidity_cap = liquidity_cap;
        market.nonce = 0;
        market.opp_window_duration = opp_window_duration;
        market.pub_window_duration = pub_window_duration;
        market.last_switch_ts = clock.unix_timestamp;
        market.resolved = false;
        market.outcome = None;
        market.private_state_blob = vec![]; // Will be initialized by separate instruction

        Ok(())
    }

    pub fn init_market_encrypted(
        ctx: Context<InitMarketEncrypted>,
        computation_offset: u64,
        initial_yes: u64,
        initial_no: u64,
    ) -> Result<()> {
        ctx.accounts.sign_pda_account.bump = ctx.bumps.sign_pda_account;
        let args = vec![
            Argument::PlaintextU64(initial_yes),
            Argument::PlaintextU64(initial_no),
        ];

        queue_computation(
            ctx.accounts,
            computation_offset,
            args,
            None,
            vec![InitializeMarketCallback::callback_ix(&[])],
        )?;

        Ok(())
    }

    #[arcium_callback(encrypted_ix = "initialize_market")]
    pub fn initialize_market_callback(
        ctx: Context<InitializeMarketCallback>,
        output: ComputationOutputs<InitializeMarketOutput>,
    ) -> Result<()> {
        let o = match output {
            ComputationOutputs::Success(InitializeMarketOutput { field_0 }) => field_0,
            _ => return Err(ErrorCode::AbortedComputation.into()),
        };
        ctx.accounts.market.private_state_blob = o.ciphertexts.concat();
        ctx.accounts.market.nonce = o.nonce;
        Ok(())
    }

    pub fn trade_private(
        ctx: Context<TradePrivate>,
        computation_offset: u64,
        ciphertext: Vec<u8>,
        pub_key: [u8; 32],
        nonce: u128,
    ) -> Result<()> {
        let market = &ctx.accounts.market;
        
        // Assert we're in private window
        require!(
            market.window_state == MarketWindow::Private,
            ErrorCode::WrongWindowState
        );

        ctx.accounts.sign_pda_account.bump = ctx.bumps.sign_pda_account;
        
        let args = vec![
            Argument::EncryptedU8(market.private_state_blob[0..32].try_into().unwrap_or([0u8; 32])),
            Argument::ArcisPubkey(pub_key),
            Argument::PlaintextU128(nonce),
            Argument::EncryptedU8(ciphertext[0..32].try_into().unwrap_or([0u8; 32])),
        ];

        queue_computation(
            ctx.accounts,
            computation_offset,
            args,
            None,
            vec![ProcessPrivateTradeCallback::callback_ix(&[])],
        )?;

        Ok(())
    }

    #[arcium_callback(encrypted_ix = "process_private_trade")]
    pub fn process_private_trade_callback(
        ctx: Context<ProcessPrivateTradeCallback>,
        output: ComputationOutputs<ProcessPrivateTradeOutput>,
    ) -> Result<()> {
        let o = match output {
            ComputationOutputs::Success(ProcessPrivateTradeOutput { field_0 }) => field_0,
            _ => return Err(ErrorCode::AbortedComputation.into()),
        };
        ctx.accounts.market.private_state_blob = o.ciphertexts.concat();
        ctx.accounts.market.nonce = o.nonce;
        
        emit!(TradeEvent {
            market: ctx.accounts.market.key(),
            window: MarketWindow::Private,
        });
        
        Ok(())
    }

    pub fn switch_to_public(
        ctx: Context<SwitchToPublic>,
        computation_offset: u64,
    ) -> Result<()> {
        let market = &ctx.accounts.market;
        let clock = Clock::get()?;
        
        // Assert we're in private window
        require!(
            market.window_state == MarketWindow::Private,
            ErrorCode::WrongWindowState
        );
        
        // Check if opportunity window has expired
        require!(
            clock.unix_timestamp >= market.last_switch_ts + market.opp_window_duration as i64,
            ErrorCode::WindowNotExpired
        );

        ctx.accounts.sign_pda_account.bump = ctx.bumps.sign_pda_account;
        
        let args = vec![Argument::EncryptedU8(market.private_state_blob[0..32].try_into().unwrap_or([0u8; 32]))];

        queue_computation(
            ctx.accounts,
            computation_offset,
            args,
            None,
            vec![RevealMarketStateCallback::callback_ix(&[])],
        )?;

        Ok(())
    }

    #[arcium_callback(encrypted_ix = "reveal_market_state")]
    pub fn reveal_market_state_callback(
        ctx: Context<RevealMarketStateCallback>,
        output: ComputationOutputs<RevealMarketStateOutput>,
    ) -> Result<()> {
        let o = match output {
            ComputationOutputs::Success(RevealMarketStateOutput { field_0 }) => field_0,
            _ => return Err(ErrorCode::AbortedComputation.into()),
        };
        
        let clock = Clock::get()?;
        let market = &mut ctx.accounts.market;
        
        // Store revealed state - o is a struct with field_0, field_1 for the tuple
        market.public_yes_pool = o.field_0;
        market.public_no_pool = o.field_1;
        market.window_state = MarketWindow::Public;
        market.last_switch_ts = clock.unix_timestamp;
        market.private_state_blob = vec![]; // Clear encrypted state
        
        emit!(WindowSwitchEvent {
            market: market.key(),
            new_window: MarketWindow::Public,
            yes_pool: o.field_0,
            no_pool: o.field_1,
        });
        
        Ok(())
    }

    pub fn trade_public(
        ctx: Context<TradePublic>,
        amount: u64,
        is_buy_yes: bool,
    ) -> Result<()> {
        let market = &mut ctx.accounts.market;
        
        // Assert we're in public window
        require!(
            market.window_state == MarketWindow::Public,
            ErrorCode::WrongWindowState
        );
        
        // Simple constant-product AMM logic
        let yes_pool = market.public_yes_pool;
        let no_pool = market.public_no_pool;
        
        if is_buy_yes {
            market.public_yes_pool = yes_pool.checked_add(amount)
                .ok_or(ErrorCode::Overflow)?;
        } else {
            market.public_no_pool = no_pool.checked_add(amount)
                .ok_or(ErrorCode::Overflow)?;
        }
        
        emit!(TradeEvent {
            market: market.key(),
            window: MarketWindow::Public,
        });
        
        Ok(())
    }

    pub fn switch_to_private(
        ctx: Context<SwitchToPrivate>,
        computation_offset: u64,
    ) -> Result<()> {
        let market = &ctx.accounts.market;
        let clock = Clock::get()?;
        
        // Assert we're in public window
        require!(
            market.window_state == MarketWindow::Public,
            ErrorCode::WrongWindowState
        );
        
        // Check if public window has expired
        require!(
            clock.unix_timestamp >= market.last_switch_ts + market.pub_window_duration as i64,
            ErrorCode::WindowNotExpired
        );

        ctx.accounts.sign_pda_account.bump = ctx.bumps.sign_pda_account;
        
        // We'd need to pass the current public state here
        // For simplicity, creating a new market state with current pools
        let args = vec![
            Argument::PlaintextU64(market.public_yes_pool),
            Argument::PlaintextU64(market.public_no_pool),
        ];

        queue_computation(
            ctx.accounts,
            computation_offset,
            args,
            None,
            vec![HideMarketStateCallback::callback_ix(&[])],
        )?;

        Ok(())
    }

    #[arcium_callback(encrypted_ix = "hide_market_state")]
    pub fn hide_market_state_callback(
        ctx: Context<HideMarketStateCallback>,
        output: ComputationOutputs<HideMarketStateOutput>,
    ) -> Result<()> {
        let o = match output {
            ComputationOutputs::Success(HideMarketStateOutput { field_0 }) => field_0,
            _ => return Err(ErrorCode::AbortedComputation.into()),
        };
        
        let clock = Clock::get()?;
        let market = &mut ctx.accounts.market;
        
        market.private_state_blob = o.ciphertexts.concat();
        market.nonce = o.nonce;
        market.window_state = MarketWindow::Private;
        market.last_switch_ts = clock.unix_timestamp;
        market.public_yes_pool = 0;
        market.public_no_pool = 0;
        
        emit!(WindowSwitchEvent {
            market: market.key(),
            new_window: MarketWindow::Private,
            yes_pool: 0,
            no_pool: 0,
        });
        
        Ok(())
    }

    pub fn get_sponsor_view(
        ctx: Context<GetSponsorView>,
        computation_offset: u64,
        pub_key: [u8; 32],
    ) -> Result<()> {
        let market = &ctx.accounts.market;
        
        // Only sponsor can view
        require!(
            ctx.accounts.sponsor.key() == market.sponsor,
            ErrorCode::Unauthorized
        );
        
        // Only works in private window
        require!(
            market.window_state == MarketWindow::Private,
            ErrorCode::WrongWindowState
        );

        ctx.accounts.sign_pda_account.bump = ctx.bumps.sign_pda_account;
        
        let args = vec![
            Argument::EncryptedU8(market.private_state_blob[0..32].try_into().unwrap_or([0u8; 32])),
            Argument::ArcisPubkey(pub_key),
        ];

        queue_computation(
            ctx.accounts,
            computation_offset,
            args,
            None,
            vec![ViewMarketStateCallback::callback_ix(&[])],
        )?;

        Ok(())
    }

    #[arcium_callback(encrypted_ix = "view_market_state")]
    pub fn view_market_state_callback(
        ctx: Context<ViewMarketStateCallback>,
        output: ComputationOutputs<ViewMarketStateOutput>,
    ) -> Result<()> {
        let o = match output {
            ComputationOutputs::Success(ViewMarketStateOutput { field_0 }) => field_0,
            _ => return Err(ErrorCode::AbortedComputation.into()),
        };

        emit!(SponsorViewEvent {
            market: ctx.accounts.market.key(),
            encrypted_state: o.ciphertexts.concat(),
            nonce: o.nonce,
        });
        
        Ok(())
    }

    pub fn resolve_market(
        ctx: Context<ResolveMarket>,
        outcome: bool,
    ) -> Result<()> {
        let market = &mut ctx.accounts.market;
        let clock = Clock::get()?;
        
        // Only authority can resolve
        require!(
            ctx.accounts.authority.key() == market.authority,
            ErrorCode::Unauthorized
        );
        
        // Must be past resolution date
        require!(
            clock.unix_timestamp >= market.resolution_date,
            ErrorCode::NotYetResolvable
        );
        
        market.resolved = true;
        market.outcome = Some(outcome);
        
        emit!(MarketResolvedEvent {
            market: market.key(),
            outcome,
        });
        
        Ok(())
    }

    // pub fn claim_payout(
    //     _ctx: Context<ClaimPayout>,
    // ) -> Result<()> {
    //     Ok(())
    // }
}


#[account]
pub struct Market {
    pub bump: u8,
    pub sponsor: Pubkey,
    pub authority: Pubkey,
    pub question: String,
    pub resolution_date: i64,
    pub window_state: MarketWindow,
    pub liquidity_cap: u64,
    pub private_state_blob: Vec<u8>,
    pub public_yes_pool: u64,
    pub public_no_pool: u64,
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


#[derive(Accounts)]
#[instruction(question: String)]
pub struct InitMarket<'info> {
    #[account(mut)]
    pub sponsor: Signer<'info>,
    
    #[account(
        init,
        payer = sponsor,
        space = 8 + 1 + 32 + 32 + (4 + 200) + 8 + 1 + 8 + (4 + 10000) + 8 + 8 + 16 + 8 + 8 + 8 + 1 + 2,
        seeds = [b"market", sponsor.key().as_ref(), question.as_bytes()],
        bump
    )]
    pub market: Account<'info, Market>,
    
    pub system_program: Program<'info, System>,
}

#[queue_computation_accounts("initialize_market", payer)]
#[derive(Accounts)]
#[instruction(computation_offset: u64)]
pub struct InitMarketEncrypted<'info> {
    #[account(mut)]
    pub payer: Signer<'info>,
    
    #[account(mut)]
    pub market: Account<'info, Market>,
    
    #[account(
        init_if_needed,
        space = 9,
        payer = payer,
        seeds = [&SIGN_PDA_SEED],
        bump,
        address = derive_sign_pda!(),
    )]
    pub sign_pda_account: Account<'info, SignerAccount>,
    
    #[account(address = derive_mxe_pda!())]
    pub mxe_account: Account<'info, MXEAccount>,
    
    #[account(mut, address = derive_mempool_pda!())]
    /// CHECK: mempool_account, checked by the arcium program.
    pub mempool_account: UncheckedAccount<'info>,
    
    #[account(mut, address = derive_execpool_pda!())]
    /// CHECK: executing_pool, checked by the arcium program.
    pub executing_pool: UncheckedAccount<'info>,
    
    #[account(mut, address = derive_comp_pda!(computation_offset))]
    /// CHECK: computation_account, checked by the arcium program.
    pub computation_account: UncheckedAccount<'info>,
    
    #[account(address = derive_comp_def_pda!(COMP_DEF_OFFSET_INITIALIZE_MARKET))]
    pub comp_def_account: Account<'info, ComputationDefinitionAccount>,
    
    #[account(mut, address = derive_cluster_pda!(mxe_account))]
    pub cluster_account: Account<'info, Cluster>,
    
    #[account(mut, address = ARCIUM_FEE_POOL_ACCOUNT_ADDRESS)]
    pub pool_account: Account<'info, FeePool>,
    
    #[account(address = ARCIUM_CLOCK_ACCOUNT_ADDRESS)]
    pub clock_account: Account<'info, ClockAccount>,
    
    pub system_program: Program<'info, System>,
    pub arcium_program: Program<'info, Arcium>,
}

#[callback_accounts("initialize_market")]
#[derive(Accounts)]
pub struct InitializeMarketCallback<'info> {
    #[account(mut)]
    pub market: Account<'info, Market>,
    pub arcium_program: Program<'info, Arcium>,
    #[account(address = derive_comp_def_pda!(COMP_DEF_OFFSET_INITIALIZE_MARKET))]
    pub comp_def_account: Account<'info, ComputationDefinitionAccount>,
    #[account(address = ::anchor_lang::solana_program::sysvar::instructions::ID)]
    /// CHECK: instructions_sysvar, checked by the account constraint
    pub instructions_sysvar: AccountInfo<'info>,
}

#[queue_computation_accounts("process_private_trade", payer)]
#[derive(Accounts)]
#[instruction(computation_offset: u64)]
pub struct TradePrivate<'info> {
    #[account(mut)]
    pub payer: Signer<'info>,
    
    #[account(mut)]
    pub market: Account<'info, Market>,
    
    #[account(
        init_if_needed,
        space = 9,
        payer = payer,
        seeds = [&SIGN_PDA_SEED],
        bump,
        address = derive_sign_pda!(),
    )]
    pub sign_pda_account: Account<'info, SignerAccount>,
    
    #[account(address = derive_mxe_pda!())]
    pub mxe_account: Account<'info, MXEAccount>,
    
    #[account(mut, address = derive_mempool_pda!())]
    /// CHECK: mempool_account, checked by the arcium program.
    pub mempool_account: UncheckedAccount<'info>,
    
    #[account(mut, address = derive_execpool_pda!())]
    /// CHECK: executing_pool, checked by the arcium program.
    pub executing_pool: UncheckedAccount<'info>,
    
    #[account(mut, address = derive_comp_pda!(computation_offset))]
    /// CHECK: computation_account, checked by the arcium program.
    pub computation_account: UncheckedAccount<'info>,
    
    #[account(address = derive_comp_def_pda!(COMP_DEF_OFFSET_PROCESS_PRIVATE_TRADE))]
    pub comp_def_account: Account<'info, ComputationDefinitionAccount>,
    
    #[account(mut, address = derive_cluster_pda!(mxe_account))]
    pub cluster_account: Account<'info, Cluster>,
    
    #[account(mut, address = ARCIUM_FEE_POOL_ACCOUNT_ADDRESS)]
    pub pool_account: Account<'info, FeePool>,
    
    #[account(address = ARCIUM_CLOCK_ACCOUNT_ADDRESS)]
    pub clock_account: Account<'info, ClockAccount>,
    
    pub system_program: Program<'info, System>,
    pub arcium_program: Program<'info, Arcium>,
}

#[callback_accounts("process_private_trade")]
#[derive(Accounts)]
pub struct ProcessPrivateTradeCallback<'info> {
    #[account(mut)]
    pub market: Account<'info, Market>,
    pub arcium_program: Program<'info, Arcium>,
    #[account(address = derive_comp_def_pda!(COMP_DEF_OFFSET_PROCESS_PRIVATE_TRADE))]
    pub comp_def_account: Account<'info, ComputationDefinitionAccount>,
    #[account(address = ::anchor_lang::solana_program::sysvar::instructions::ID)]
    /// CHECK: instructions_sysvar, checked by the account constraint
    pub instructions_sysvar: AccountInfo<'info>,
}

#[queue_computation_accounts("reveal_market_state", payer)]
#[derive(Accounts)]
#[instruction(computation_offset: u64)]
pub struct SwitchToPublic<'info> {
    #[account(mut)]
    pub payer: Signer<'info>,
    
    #[account(mut)]
    pub market: Account<'info, Market>,
    
    #[account(
        init_if_needed,
        space = 9,
        payer = payer,
        seeds = [&SIGN_PDA_SEED],
        bump,
        address = derive_sign_pda!(),
    )]
    pub sign_pda_account: Account<'info, SignerAccount>,
    
    #[account(address = derive_mxe_pda!())]
    pub mxe_account: Account<'info, MXEAccount>,
    
    #[account(mut, address = derive_mempool_pda!())]
    /// CHECK: mempool_account, checked by the arcium program.
    pub mempool_account: UncheckedAccount<'info>,
    
    #[account(mut, address = derive_execpool_pda!())]
    /// CHECK: executing_pool, checked by the arcium program.
    pub executing_pool: UncheckedAccount<'info>,
    
    #[account(mut, address = derive_comp_pda!(computation_offset))]
    /// CHECK: computation_account, checked by the arcium program.
    pub computation_account: UncheckedAccount<'info>,
    
    #[account(address = derive_comp_def_pda!(COMP_DEF_OFFSET_REVEAL_MARKET_STATE))]
    pub comp_def_account: Account<'info, ComputationDefinitionAccount>,
    
    #[account(mut, address = derive_cluster_pda!(mxe_account))]
    pub cluster_account: Account<'info, Cluster>,
    
    #[account(mut, address = ARCIUM_FEE_POOL_ACCOUNT_ADDRESS)]
    pub pool_account: Account<'info, FeePool>,
    
    #[account(address = ARCIUM_CLOCK_ACCOUNT_ADDRESS)]
    pub clock_account: Account<'info, ClockAccount>,
    
    pub system_program: Program<'info, System>,
    pub arcium_program: Program<'info, Arcium>,
}

#[callback_accounts("reveal_market_state")]
#[derive(Accounts)]
pub struct RevealMarketStateCallback<'info> {
    #[account(mut)]
    pub market: Account<'info, Market>,
    pub arcium_program: Program<'info, Arcium>,
    #[account(address = derive_comp_def_pda!(COMP_DEF_OFFSET_REVEAL_MARKET_STATE))]
    pub comp_def_account: Account<'info, ComputationDefinitionAccount>,
    #[account(address = ::anchor_lang::solana_program::sysvar::instructions::ID)]
    /// CHECK: instructions_sysvar, checked by the account constraint
    pub instructions_sysvar: AccountInfo<'info>,
}

#[derive(Accounts)]
pub struct TradePublic<'info> {
    #[account(mut)]
    pub trader: Signer<'info>,
    
    #[account(mut)]
    pub market: Account<'info, Market>,
}

#[queue_computation_accounts("hide_market_state", payer)]
#[derive(Accounts)]
#[instruction(computation_offset: u64)]
pub struct SwitchToPrivate<'info> {
    #[account(mut)]
    pub payer: Signer<'info>,
    
    #[account(mut)]
    pub market: Account<'info, Market>,
    
    #[account(
        init_if_needed,
        space = 9,
        payer = payer,
        seeds = [&SIGN_PDA_SEED],
        bump,
        address = derive_sign_pda!(),
    )]
    pub sign_pda_account: Account<'info, SignerAccount>,
    
    #[account(address = derive_mxe_pda!())]
    pub mxe_account: Account<'info, MXEAccount>,
    
    #[account(mut, address = derive_mempool_pda!())]
    /// CHECK: mempool_account, checked by the arcium program.
    pub mempool_account: UncheckedAccount<'info>,
    
    #[account(mut, address = derive_execpool_pda!())]
    /// CHECK: executing_pool, checked by the arcium program.
    pub executing_pool: UncheckedAccount<'info>,
    
    #[account(mut, address = derive_comp_pda!(computation_offset))]
    /// CHECK: computation_account, checked by the arcium program.
    pub computation_account: UncheckedAccount<'info>,
    
    #[account(address = derive_comp_def_pda!(COMP_DEF_OFFSET_HIDE_MARKET_STATE))]
    pub comp_def_account: Account<'info, ComputationDefinitionAccount>,
    
    #[account(mut, address = derive_cluster_pda!(mxe_account))]
    pub cluster_account: Account<'info, Cluster>,
    
    #[account(mut, address = ARCIUM_FEE_POOL_ACCOUNT_ADDRESS)]
    pub pool_account: Account<'info, FeePool>,
    
    #[account(address = ARCIUM_CLOCK_ACCOUNT_ADDRESS)]
    pub clock_account: Account<'info, ClockAccount>,
    
    pub system_program: Program<'info, System>,
    pub arcium_program: Program<'info, Arcium>,
}

#[callback_accounts("hide_market_state")]
#[derive(Accounts)]
pub struct HideMarketStateCallback<'info> {
    #[account(mut)]
    pub market: Account<'info, Market>,
    pub arcium_program: Program<'info, Arcium>,
    #[account(address = derive_comp_def_pda!(COMP_DEF_OFFSET_HIDE_MARKET_STATE))]
    pub comp_def_account: Account<'info, ComputationDefinitionAccount>,
    #[account(address = ::anchor_lang::solana_program::sysvar::instructions::ID)]
    /// CHECK: instructions_sysvar, checked by the account constraint
    pub instructions_sysvar: AccountInfo<'info>,
}

#[queue_computation_accounts("view_market_state", sponsor)]
#[derive(Accounts)]
#[instruction(computation_offset: u64)]
pub struct GetSponsorView<'info> {
    #[account(mut)]
    pub sponsor: Signer<'info>,
    
    #[account(mut)]
    pub market: Account<'info, Market>,
    
    #[account(
        init_if_needed,
        space = 9,
        payer = sponsor,
        seeds = [&SIGN_PDA_SEED],
        bump,
        address = derive_sign_pda!(),
    )]
    pub sign_pda_account: Account<'info, SignerAccount>,
    
    #[account(address = derive_mxe_pda!())]
    pub mxe_account: Account<'info, MXEAccount>,
    
    #[account(mut, address = derive_mempool_pda!())]
    /// CHECK: mempool_account, checked by the arcium program.
    pub mempool_account: UncheckedAccount<'info>,
    
    #[account(mut, address = derive_execpool_pda!())]
    /// CHECK: executing_pool, checked by the arcium program.
    pub executing_pool: UncheckedAccount<'info>,
    
    #[account(mut, address = derive_comp_pda!(computation_offset))]
    /// CHECK: computation_account, checked by the arcium program.
    pub computation_account: UncheckedAccount<'info>,
    
    #[account(address = derive_comp_def_pda!(COMP_DEF_OFFSET_VIEW_MARKET_STATE))]
    pub comp_def_account: Account<'info, ComputationDefinitionAccount>,
    
    #[account(mut, address = derive_cluster_pda!(mxe_account))]
    pub cluster_account: Account<'info, Cluster>,
    
    #[account(mut, address = ARCIUM_FEE_POOL_ACCOUNT_ADDRESS)]
    pub pool_account: Account<'info, FeePool>,
    
    #[account(address = ARCIUM_CLOCK_ACCOUNT_ADDRESS)]
    pub clock_account: Account<'info, ClockAccount>,
    
    pub system_program: Program<'info, System>,
    pub arcium_program: Program<'info, Arcium>,
}

#[callback_accounts("view_market_state")]
#[derive(Accounts)]
pub struct ViewMarketStateCallback<'info> {
    #[account(mut)]
    pub market: Account<'info, Market>,
    pub arcium_program: Program<'info, Arcium>,
    #[account(address = derive_comp_def_pda!(COMP_DEF_OFFSET_VIEW_MARKET_STATE))]
    pub comp_def_account: Account<'info, ComputationDefinitionAccount>,
    #[account(address = ::anchor_lang::solana_program::sysvar::instructions::ID)]
    /// CHECK: instructions_sysvar, checked by the account constraint
    pub instructions_sysvar: AccountInfo<'info>,
}

#[derive(Accounts)]
pub struct ResolveMarket<'info> {
    #[account(mut)]
    pub authority: Signer<'info>,
    
    #[account(mut)]
    pub market: Account<'info, Market>,
}

#[derive(Accounts)]
pub struct ClaimPayout<'info> {
    #[account(mut)]
    pub trader: Signer<'info>,
    
    #[account(mut)]
    pub market: Account<'info, Market>,
}

// ========== Computation Definition Init Accounts ==========

#[init_computation_definition_accounts("initialize_market", payer)]
#[derive(Accounts)]
pub struct InitInitializeMarketCompDef<'info> {
    #[account(mut)]
    pub payer: Signer<'info>,
    #[account(mut, address = derive_mxe_pda!())]
    pub mxe_account: Box<Account<'info, MXEAccount>>,
    #[account(mut)]
    /// CHECK: comp_def_account, checked by arcium program.
    pub comp_def_account: UncheckedAccount<'info>,
    pub arcium_program: Program<'info, Arcium>,
    pub system_program: Program<'info, System>,
}

#[init_computation_definition_accounts("process_private_trade", payer)]
#[derive(Accounts)]
pub struct InitProcessPrivateTradeCompDef<'info> {
    #[account(mut)]
    pub payer: Signer<'info>,
    #[account(mut, address = derive_mxe_pda!())]
    pub mxe_account: Box<Account<'info, MXEAccount>>,
    #[account(mut)]
    /// CHECK: comp_def_account, checked by arcium program.
    pub comp_def_account: UncheckedAccount<'info>,
    pub arcium_program: Program<'info, Arcium>,
    pub system_program: Program<'info, System>,
}

#[init_computation_definition_accounts("reveal_market_state", payer)]
#[derive(Accounts)]
pub struct InitRevealMarketStateCompDef<'info> {
    #[account(mut)]
    pub payer: Signer<'info>,
    #[account(mut, address = derive_mxe_pda!())]
    pub mxe_account: Box<Account<'info, MXEAccount>>,
    #[account(mut)]
    /// CHECK: comp_def_account, checked by arcium program.
    pub comp_def_account: UncheckedAccount<'info>,
    pub arcium_program: Program<'info, Arcium>,
    pub system_program: Program<'info, System>,
}

#[init_computation_definition_accounts("hide_market_state", payer)]
#[derive(Accounts)]
pub struct InitHideMarketStateCompDef<'info> {
    #[account(mut)]
    pub payer: Signer<'info>,
    #[account(mut, address = derive_mxe_pda!())]
    pub mxe_account: Box<Account<'info, MXEAccount>>,
    #[account(mut)]
    /// CHECK: comp_def_account, checked by arcium program.
    pub comp_def_account: UncheckedAccount<'info>,
    pub arcium_program: Program<'info, Arcium>,
    pub system_program: Program<'info, System>,
}

#[init_computation_definition_accounts("view_market_state", payer)]
#[derive(Accounts)]
pub struct InitViewMarketStateCompDef<'info> {
    #[account(mut)]
    pub payer: Signer<'info>,
    #[account(mut, address = derive_mxe_pda!())]
    pub mxe_account: Box<Account<'info, MXEAccount>>,
    #[account(mut)]
    /// CHECK: comp_def_account, checked by arcium program.
    pub comp_def_account: UncheckedAccount<'info>,
    pub arcium_program: Program<'info, Arcium>,
    pub system_program: Program<'info, System>,
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
pub struct SponsorViewEvent {
    pub market: Pubkey,
    pub encrypted_state: Vec<u8>,
    pub nonce: u128,
}

#[event]
pub struct MarketResolvedEvent {
    pub market: Pubkey,
    pub outcome: bool,
}

#[error_code]
pub enum ErrorCode {
    #[msg("The computation was aborted")]
    AbortedComputation,
    #[msg("Wrong window state for this operation")]
    WrongWindowState,
    #[msg("Window duration has not expired yet")]
    WindowNotExpired,
    #[msg("Unauthorized")]
    Unauthorized,
    #[msg("Market cannot be resolved yet")]
    NotYetResolvable,
    #[msg("Arithmetic overflow")]
    Overflow,
    #[msg("Cluster not set")]
    ClusterNotSet,
}
