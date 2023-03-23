const {
    PrivateKey,
    Transaction,
    TransferTransaction,
    Hbar,
    ScheduleCreateTransaction,
    Client
} = require("@hashgraph/sdk")
require('dotenv').config()

// account 1 data
const account1PrivateKey = PrivateKey.fromString(process.env.PRIVATE_KEY_1)
const account1Id = process.env.ACCOUNT_ID_1

// account 2 data
const account2PrivateKey = PrivateKey.fromString(process.env.PRIVATE_KEY_2)
const account2Id = process.env.ACCOUNT_ID_2

// throw error if account ids or private keys don't exist
if (!account1PrivateKey || !account1Id || !account2PrivateKey || !account2Id) {
    throw new Error('Environment variables for specified accounts must be present');
}

const client = Client.forTestnet();
client.setOperator(account1Id, account1PrivateKey);

async function scheduleTransaction(from, to, amount, fromPrivateKey) {
    // create transfer transaction: 10Hbar from account 1 to account 2
    const transaction = new TransferTransaction()
        .addHbarTransfer(from, new Hbar(`-${amount}`))
        .addHbarTransfer(to, new Hbar(amount));

    // create schedule transaction
    const transactionBytes = new ScheduleCreateTransaction()
        .setScheduledTransaction(transaction)
        .setAdminKey(fromPrivateKey)
        .freezeWith(client)
        .toBytes();

    // convert to base64 format
    const base64Transaction = Buffer.from(transactionBytes).toString('base64');
    console.log(`Base64 encoded tx: ${base64Transaction}`)
    return base64Transaction
}

async function deserializeTransaction(base64Tx) {
    // create transaction from bytes
    const transaction = await Transaction.fromBytes(Buffer.from(base64Tx, 'base64'))
        .sign(account1PrivateKey);

    // execute transaction
    await transaction.execute(client)
    console.log(`\nTransaction: ${transaction.transactionId}`)
}

async function main() {
    const serializedTx = await scheduleTransaction(account1Id, account2Id, 10, account1PrivateKey);
    await deserializeTransaction(serializedTx);
    process.exit()
}

main()