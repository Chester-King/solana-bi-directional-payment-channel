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

    pub fn transfer_sol(ctx: Context<Transfersol>) -> ProgramResult {
        let _data_account = &mut ctx.accounts.data_account;
        let signer_address = &mut ctx.accounts.signer;
        let _data_key = _data_account.to_account_info().key();
        // transfer(from_pubkey: &_data_key, to_pubkey: &_data_key, lamports: 500000000);
        
        // anchor_lang::solana_program::system_instruction::transfer(
        //     &_data_key,
        //     &signer_address.to_account_info().key(),
        //     500000000,
        // );

        **ctx.accounts.data_account.to_account_info().try_borrow_mut_lamports()? -= 5000000000;
        **ctx.accounts.signer.try_borrow_mut_lamports()? += 5000000000;

        // Execute transfer instruction
        // anchor_lang::solana_program::program::invoke(
        //     &instruction,
        //     &[
        //         _data_account.to_account_info(),
        //         ctx.accounts.signer.to_account_info(),
        //         ctx.accounts.system_program.to_account_info(),
        //     ],
        // );
        
        
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

#[derive(Accounts)]
pub struct Transfersol<'info> {
    #[account(mut)]
    pub data_account: Account<'info, DataAccount>,
    pub signer: Signer<'info>,
    pub system_program: Program <'info, System>,
}

#[account]
pub struct DataAccount {
    pub user_addresses: Vec<Pubkey>,
    pub user_balances : Vec<u64>
}

