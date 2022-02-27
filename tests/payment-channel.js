const assert = require("assert");
const anchor = require("@project-serum/anchor");
const { 
  Connection,
  TransactionInstruction,
  Transaction,
  sendAndConfirmTransaction,
  PublicKey,
  SystemProgram

} = anchor.web3;
var BigNumber = require('big-number');

describe('payment-channel', () => {

  const provider = anchor.Provider.local();
  anchor.setProvider(provider);

  const dataAccount = anchor.web3.Keypair.generate();
  const proposalAccount = anchor.web3.Keypair.generate();

  it('Is initialized!', async () => {
    // Add your test here.
    const program = await anchor.workspace.PaymentChannel;
    const tx = await program.rpc.initialize(
      [provider.wallet.publicKey,provider.wallet.publicKey],
      new anchor.BN(1648270221),
      new anchor.BN(600),
      {
        accounts: {
          user : provider.wallet.publicKey,
          dataAccount : dataAccount.publicKey,
          proposalAccount : proposalAccount.publicKey,
          systemProgram : anchor.web3.SystemProgram.programId

        },
        signers: [
          dataAccount,
          proposalAccount
        ]
      }
    );
    await console.log("Your transaction signature", tx);
    let account = await program.account.dataAccount.fetch(
      dataAccount.publicKey
    );
    await console.log(account)
    let v1 = await anchor.getProvider().connection.getBalance(provider.wallet.publicKey);
    let v2 = await anchor.getProvider().connection.getBalance(dataAccount.publicKey);
    await console.log(v1," - ",v2);
    const lamports = 5000000000;
    await console.log(lamports);
    
    let transaction = new Transaction();

    // Add an instruction to execute
    transaction.add(SystemProgram.transfer({
        fromPubkey: provider.wallet.publicKey,
        toPubkey: dataAccount.publicKey,
        lamports: lamports,
    }));
    await console.log(typeof provider.wallet);
    await console.log(provider.wallet.payer._keypair.secretKey);
    await sendAndConfirmTransaction(anchor.getProvider().connection, transaction, [provider.wallet.payer])
    
    
    v1 = await anchor.getProvider().connection.getBalance(provider.wallet.publicKey);
    v2 = await anchor.getProvider().connection.getBalance(dataAccount.publicKey);
    await console.log(v1," - ",v2);
    let account2 = await program.account.proposalAccount.fetch(
      proposalAccount.publicKey
    );
    await console.log(account2)
    
  });

  it('Updating Proposal', async () => {
    const program = await anchor.workspace.PaymentChannel;
      const tx = await program.rpc.proposalUpdate(
        new anchor.BN(0),
        new anchor.BN(1),
        new anchor.BN(3000000000),
        new anchor.BN(2000000000),
      {
        accounts: {
          dataAccount : dataAccount.publicKey,
          proposalAccount : proposalAccount.publicKey,
          signer : provider.wallet.publicKey,
          systemProgram : anchor.web3.SystemProgram.programId
        },
        
      }
    );

    let account = await program.account.dataAccount.fetch(
      dataAccount.publicKey
    );
    await console.log(account)
    let account2 = await program.account.proposalAccount.fetch(
      proposalAccount.publicKey
    );
    await console.log(account2)
    let v1 = await anchor.getProvider().connection.getBalance(provider.wallet.publicKey);
    let v2 = await anchor.getProvider().connection.getBalance(dataAccount.publicKey);
    await console.log(v1," - ",v2);



  });

  it('Proposal Voting 1', async () => {
    const program = await anchor.workspace.PaymentChannel;
      const tx = await program.rpc.proposalVote(
        new anchor.BN(0),
        new anchor.BN(1),
        false,
      {
        accounts: {
          dataAccount : dataAccount.publicKey,
          proposalAccount : proposalAccount.publicKey,
          signer : provider.wallet.publicKey,
          systemProgram : anchor.web3.SystemProgram.programId
        },
        
      }
    );

    let account = await program.account.dataAccount.fetch(
      dataAccount.publicKey
    );
    await console.log(account)
    let account2 = await program.account.proposalAccount.fetch(
      proposalAccount.publicKey
    );
    await console.log(account2)
    let v1 = await anchor.getProvider().connection.getBalance(provider.wallet.publicKey);
    let v2 = await anchor.getProvider().connection.getBalance(dataAccount.publicKey);
    await console.log(v1," - ",v2);
  })

  it('Execute fail 1', async () => {
    const program = await anchor.workspace.PaymentChannel;
    try{

      const tx = await program.rpc.executeProposal(
        new anchor.BN(0),
        new anchor.BN(1),
        {
          accounts: {
            dataAccount : dataAccount.publicKey,
            proposalAccount : proposalAccount.publicKey,
            signer : provider.wallet.publicKey,
            systemProgram : anchor.web3.SystemProgram.programId
          },
          
        }
        );
    }catch(error){
      await console.log("Failed as expected");
    }
   
    let account = await program.account.dataAccount.fetch(
      dataAccount.publicKey
    );
    await console.log(account)
    let account2 = await program.account.proposalAccount.fetch(
      proposalAccount.publicKey
    );
    await console.log(account2)
    let v1 = await anchor.getProvider().connection.getBalance(provider.wallet.publicKey);
    let v2 = await anchor.getProvider().connection.getBalance(dataAccount.publicKey);
    await console.log(v1," - ",v2);
  })

  it('Proposal Voting 2', async () => {
    const program = await anchor.workspace.PaymentChannel;
      const tx = await program.rpc.proposalVote(
        new anchor.BN(0),
        new anchor.BN(1),
        true,
      {
        accounts: {
          dataAccount : dataAccount.publicKey,
          proposalAccount : proposalAccount.publicKey,
          signer : provider.wallet.publicKey,
          systemProgram : anchor.web3.SystemProgram.programId
        },
        
      }
    );
      const tx2 = await program.rpc.proposalVote(
        new anchor.BN(1),
        new anchor.BN(1),
        true,
      {
        accounts: {
          dataAccount : dataAccount.publicKey,
          proposalAccount : proposalAccount.publicKey,
          signer : provider.wallet.publicKey,
          systemProgram : anchor.web3.SystemProgram.programId
        },
        
      }
    );

    let account = await program.account.dataAccount.fetch(
      dataAccount.publicKey
    );
    await console.log(account)
    let account2 = await program.account.proposalAccount.fetch(
      proposalAccount.publicKey
    );
    await console.log(account2)
    let v1 = await anchor.getProvider().connection.getBalance(provider.wallet.publicKey);
    let v2 = await anchor.getProvider().connection.getBalance(dataAccount.publicKey);
    await console.log(v1," - ",v2);
  })

  it('Execute 1', async () => {
    const program = await anchor.workspace.PaymentChannel;
    

    
      const tx = await program.rpc.executeProposal(
        new anchor.BN(0),
        new anchor.BN(1),
        true,
        {
          accounts: {
            dataAccount : dataAccount.publicKey,
            proposalAccount : proposalAccount.publicKey,
            signer : provider.wallet.publicKey,
            systemProgram : anchor.web3.SystemProgram.programId
          },
          
        }
        );
    
   
    let account = await program.account.dataAccount.fetch(
      dataAccount.publicKey
    );
    await console.log(account)
    let account2 = await program.account.proposalAccount.fetch(
      proposalAccount.publicKey
    );
    await console.log(account2)
    let v1 = await anchor.getProvider().connection.getBalance(provider.wallet.publicKey);
    let v2 = await anchor.getProvider().connection.getBalance(dataAccount.publicKey);
    await console.log(v1," - ",v2);
  })
  
  it('Execute 2', async () => {
    const program = await anchor.workspace.PaymentChannel;
    

    
      const tx = await program.rpc.executeProposal(
        new anchor.BN(1),
        new anchor.BN(1),
        true,
        {
          accounts: {
            dataAccount : dataAccount.publicKey,
            proposalAccount : proposalAccount.publicKey,
            signer : provider.wallet.publicKey,
            systemProgram : anchor.web3.SystemProgram.programId
          },
          
        }
        );
    
   
    let account = await program.account.dataAccount.fetch(
      dataAccount.publicKey
    );
    await console.log(account)
    let account2 = await program.account.proposalAccount.fetch(
      proposalAccount.publicKey
    );
    await console.log(account2)
    let v1 = await anchor.getProvider().connection.getBalance(provider.wallet.publicKey);
    let v2 = await anchor.getProvider().connection.getBalance(dataAccount.publicKey);
    await console.log(v1," - ",v2);
  })



});
