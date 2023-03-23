const { Client, PrivateKey, AccountCreateTransaction, Hbar } = require("@hashgraph/sdk");
require("dotenv").config();

async function main() {
    // Get account ID and private key from your .env file
    const myAccountId = process.env.MY_ACCOUNT_ID;
    const myPrivateKey = process.env.MY_PRIVATE_KEY;

    // If we weren't able to grab it, we should throw a new error
    if (!myAccountId || !myPrivateKey) {
        throw new Error("Environment variables MY_ACCOUNT_ID and MY_PRIVATE_KEY must be present");
    }

    // Create connection to Hedera network
    const client = Client.forTestnet();
    client.setOperator(myAccountId, myPrivateKey);

    for (let i = 1; i <= 5; i++) {
        // Create private and public key
        const newAccountPrivateKey = PrivateKey.generateED25519();
        const newAccountPublicKey = newAccountPrivateKey.publicKey;

        // Create a new account with 500 hbar starting balance
        const newAccount = await new AccountCreateTransaction()
            .setKey(newAccountPublicKey)
            .setInitialBalance(new Hbar(500))
            .execute(client);

        // Get the new account ID
        const getReceipt = await newAccount.getReceipt(client);
        const newAccountId = getReceipt.accountId;

        // Print the new account ID, public and private key
        console.log(`ACCOUNT_ID_${i} = ${newAccountId.toString()}`);
        console.log(`PUBLIC_KEY_${i} = ${newAccountPublicKey.toString()}`);
        console.log(`PRIVATE_KEY_${i} = ${newAccountPrivateKey.toString()}`);
        console.log('\n')
    };
}
main();