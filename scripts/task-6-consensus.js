const { Client, PrivateKey, TopicCreateTransaction, TopicMessageSubmitTransaction, TopicMessageQuery } = require("@hashgraph/sdk");
require('dotenv').config();

// Get account id and private key from the .env file
const accountId1 = process.env.ACCOUNT_ID_1;
const privateKey1 = PrivateKey.fromString(process.env.PRIVATE_KEY_1);

async function main() {
    // Get connection to Hedera
    const client = Client.forTestnet();

    // Set the operator account ID and operator private key
    client.setOperator(accountId1, privateKey1);

    // Create topic
    let transactionResponse = await new TopicCreateTransaction().execute(client);
    let receipt = await transactionResponse.getReceipt(client);

    let topicId = receipt.topicId;

    console.log(`The newly created topic ID is: ${topicId}`);

    // Timeout to get the network time to process this request before continuing with another action
    await new Promise((resolve) => setTimeout(resolve, 5000));

    const sendResponse = await new TopicMessageSubmitTransaction({
        topicId,
        message: new Date().toTimeString()
    })
        .execute(client);

    const getReceipt = await sendResponse.getReceipt(client);

    console.log('Message receipt:');
    console.log(JSON.stringify(getReceipt));

    console.log(`The message transaction status is: ${getReceipt.status}`);

    console.log(`Link to topic: https://hashscan.io/testnet/topic/${topicId}`);

    // SUBSCRIBE/READ TOPIC
    new TopicMessageQuery()
        .setTopicId(topicId)
        .setStartTime(0)
        .subscribe(
            client,
            (message) => console.log(Buffer.from(message.contents, "utf8").toString())
        );

    process.exit();
}

main();