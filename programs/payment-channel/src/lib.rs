use anchor_lang::prelude::*;
use anchor_lang::require;
use std::vec::Vec;

declare_id!("Fg6PaFpoGXkYsidMpWTK6W2BeZ7FEfcYkg476zPFsLnS");
// declare_id!("AK1yYpjr1fxuusVUC8jg52sSinAVcRDfzb5swgkBSnbA");

#[program]
pub mod payment_channel {
    use super::*;
    pub fn initialize(ctx: Context<Initialize>, _user_key_vector: Vec<Pubkey>, _expiry_time: u64, _challenge_time: u64) -> ProgramResult {
        let _data_account = &mut ctx.accounts.data_account;
        let now_ts = Clock::get().unwrap().unix_timestamp as u64;
        require!(_user_key_vector.len()==2,CustomError::WrongInput);
        require!(now_ts<_expiry_time,CustomError::TimeError);
        require!(_challenge_time>0,CustomError::WrongInput);
        // require!(_user_key_vector[0]!=_user_key_vector[1],CustomError::SameUser);
        _data_account.expiry_time = _expiry_time;
        _data_account.challenge_time = _challenge_time;
        _data_account.user_addresses = _user_key_vector;
        _data_account.user_balances = vec![0; _data_account.user_addresses.len()];
        Ok(())
    }

   

    pub fn proposal_update(ctx: Context<Dataupdate>,_user_id: u64, _proposal_count: u64,_balance1: u64,_balance2: u64) -> ProgramResult {
        let signer_address = &mut ctx.accounts.signer;
        let _data_account = &mut ctx.accounts.data_account;
        let _proposal_account = &mut ctx.accounts.proposal_account;
        require!(_user_id<2,CustomError::WrongInput);
        require!(_data_account.user_addresses[_user_id as usize]==signer_address.to_account_info().key(),CustomError::WrongUser);
        require!(_proposal_account.count+1==_proposal_count,CustomError::WrongInput);
        require!(Clock::get().unwrap().unix_timestamp as u64 <= _data_account.expiry_time,CustomError::ChallengeExpired);
        // To-Do - Add balance Check as well
        require!(_data_account.to_account_info().lamports()>_balance1+_balance2,CustomError::NotEnoughFunds);
        _proposal_account.count+=1;
        if _user_id==0{
            _proposal_account.vote1=true;
            _proposal_account.vote2=false;
        } else {
            _proposal_account.vote1=false;
            _proposal_account.vote2=true;
        }
        _proposal_account.balance1=_balance1;
        _proposal_account.balance2=_balance2;
        _data_account.expiry_time = Clock::get().unwrap().unix_timestamp as u64 + _data_account.challenge_time;
        Ok(())
    }

    pub fn proposal_vote(ctx: Context<Dataupdate>,_user_id: u64, _proposal_count: u64,_vote: bool) -> ProgramResult {
        let signer_address = &mut ctx.accounts.signer;
        let _data_account = &mut ctx.accounts.data_account;
        let _proposal_account = &mut ctx.accounts.proposal_account;
        require!(_user_id<2,CustomError::WrongInput);
        require!(_data_account.user_addresses[_user_id as usize]==signer_address.to_account_info().key(),CustomError::WrongUser);
        require!(_proposal_account.count==_proposal_count,CustomError::WrongInput);
        require!(Clock::get().unwrap().unix_timestamp as u64 <= _data_account.expiry_time,CustomError::ChallengeExpired);
        if _user_id==0{
            _proposal_account.vote1=_vote;
        }else{
            _proposal_account.vote2=_vote;
        }
        _data_account.expiry_time = Clock::get().unwrap().unix_timestamp as u64 + _data_account.challenge_time;
        Ok(())
    }

    pub fn execute_proposal(ctx: Context<Dataupdate>, _user_id: u64, _proposal_count: u64, _time_test: bool)  -> ProgramResult {
        let signer_address = &mut ctx.accounts.signer;
        let _data_account = &mut ctx.accounts.data_account;
        let _proposal_account = &mut ctx.accounts.proposal_account;
        require!(_user_id<2,CustomError::WrongInput);
        require!(_proposal_account.vote1 && _proposal_account.vote2,CustomError::NoFullConsent);
        require!(Clock::get().unwrap().unix_timestamp as u64>_data_account.expiry_time || _time_test,CustomError::ChallengeNotExpired);
        require!(_data_account.user_addresses[_user_id as usize]==signer_address.to_account_info().key(),CustomError::WrongUser);
        _data_account.user_balances[0] = _proposal_account.balance1;
        _data_account.user_balances[1] = _proposal_account.balance2;
        let balance = _data_account.user_balances[_user_id as usize];
        require!(_data_account.to_account_info().lamports()>balance,CustomError::NotEnoughFunds);
        **_data_account.to_account_info().try_borrow_mut_lamports()? -= balance;
        **ctx.accounts.signer.try_borrow_mut_lamports()? += balance;
        _data_account.user_balances[_user_id as usize] = 0;
        Ok(())
    }

    

}


// An enum for custom error codes
#[error]
pub enum CustomError {
    WrongInput,
    TimeError,
    SameUser,
    WrongUser,
    ChallengeNotExpired,
    ChallengeExpired,
    NoFullConsent,
    NotEnoughFunds
}


#[derive(Accounts)]
pub struct Initialize<'info> {
    #[account(init, payer = user, space = 16 + 500)]
    pub data_account: Account<'info, DataAccount>,
    #[account(init, payer = user, space = 16 + 500)]
    pub proposal_account: Account<'info, ProposalAccount>,
    #[account(mut)]
    pub user: Signer<'info>,
    pub system_program: Program <'info, System>,
}

#[derive(Accounts)]
pub struct Dataupdate<'info> {
    #[account(mut)]
    pub data_account: Account<'info, DataAccount>,
    #[account(mut)]
    pub proposal_account: Account<'info, ProposalAccount>,
    pub signer: Signer<'info>,
    pub system_program: Program <'info, System>,
}

#[account]
pub struct DataAccount {
    pub expiry_time : u64,
    pub challenge_time : u64,
    pub user_addresses: Vec<Pubkey>,
    pub user_balances : Vec<u64>
}

#[account]
pub struct ProposalAccount {
    pub count : u64,
    pub balance1 : u64,
    pub balance2 : u64,
    pub vote1 : bool,
    pub vote2 : bool,

}



