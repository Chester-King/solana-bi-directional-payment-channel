use anchor_lang::prelude::*;
use std::vec::Vec;

declare_id!("Fg6PaFpoGXkYsidMpWTK6W2BeZ7FEfcYkg476zPFsLnS");
// declare_id!("AK1yYpjr1fxuusVUC8jg52sSinAVcRDfzb5swgkBSnbA");

#[program]
pub mod payment_channel {
    use super::*;
    pub fn initialize(ctx: Context<Initialize>, _user_key_vector: Vec<Pubkey>) -> ProgramResult {
        let _data_account = &mut ctx.accounts.data_account;
        _data_account.user_addresses = _user_key_vector;
        _data_account.user_balances = vec![0; _data_account.user_addresses.len()];
        Ok(())
    }
}

#[derive(Accounts)]
pub struct Initialize<'info> {
    #[account(init, payer = user, space = 16 + 500)]
    pub data_account: Account<'info, DataAccount>,
    #[account(mut)]
    pub user: Signer<'info>,
    pub system_program: Program <'info, System>,
}



#[account]
pub struct DataAccount {
    pub user_addresses: Vec<Pubkey>,
    pub user_balances : Vec<u64>
}

