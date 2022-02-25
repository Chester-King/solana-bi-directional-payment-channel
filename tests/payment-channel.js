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

  it('Is initialized!', async () => {
    // Add your test here.
    const program = await anchor.workspace.PaymentChannel;
    const tx = await program.rpc.initialize(
      [provider.wallet.publicKey,provider.wallet.publicKey],
      {
        accounts: {
          user : provider.wallet.publicKey,
          dataAccount : dataAccount.publicKey,
          systemProgram : anchor.web3.SystemProgram.programId

        },
        signers: [
          dataAccount
        ]
      }
    );
    await console.log("Your transaction signature", tx);
    const account = await program.account.dataAccount.fetch(
      dataAccount.publicKey
    );
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
      
  });



});
