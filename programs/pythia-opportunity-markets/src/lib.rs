use anchor_lang::prelude::*;

declare_id!("FUMfgwKJpmXPp6oMBf1YkzgJm8QxwmzBh5WeKva8YPxS");

#[program]
pub mod pythia_opportunity_markets {
    use super::*;

    pub fn initialize(ctx: Context<Initialize>) -> Result<()> {
        msg!("Greetings from: {:?}", ctx.program_id);
        Ok(())
    }
}

#[derive(Accounts)]
pub struct Initialize {}
