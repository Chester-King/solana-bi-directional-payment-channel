const assert = require("assert");
const anchor = require("@project-serum/anchor");
const { SystemProgram } = anchor.web3;
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
    await console.log(account);
  });
});
