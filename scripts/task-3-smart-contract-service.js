const {
    Client,
    Hbar,
    ContractCreateFlow,
    ContractExecuteTransaction,
    ContractFunctionParameters,
} = require("@hashgraph/sdk");
require('dotenv').config();

const account1 = process.env.PRIVATE_KEY_1;
const account1Id = process.env.ACCOUNT_ID_1;

const client = Client.forTestnet();
client.setOperator(account1Id, account1);
client.setDefaultMaxTransactionFee(new Hbar(100));

const contractJson = require("../Contracts/CertificationC1.json");

// Deploy contract with 100000 gas fee and return contract id
async function deployContract() {
    const contractTransaction = await new ContractCreateFlow()
        .setBytecode(contractJson.bytecode)
        .setGas(100_000)
        .execute(client);

    const contractId = (await contractTransaction.getReceipt(client)).contractId;
    return contractId
}

// Call function1 with 2 integer parameters, then return function result
async function interactWithContractFunction1(contractId, parameter1, parameter2) {
    const transaction = await new ContractExecuteTransaction()
        .setContractId(contractId)
        .setGas(100_000)
        .setFunction("function1", new ContractFunctionParameters().addUint16(parameter1).addUint16(parameter2))
        .execute(client);

    let record = await transaction.getRecord(client);

    return Buffer.from((record).contractFunctionResult.bytes).toJSON().data.at(-1)
}

// Call function2 with integer parameter n, then return function result
async function interactWithContractFunction2(contractId, n) {
    const transaction = await new ContractExecuteTransaction()
        .setContractId(contractId)
        .setGas(100_000)
        .setFunction("function2", new ContractFunctionParameters().addUint16(n))
        .execute(client);

    return Buffer.from((await transaction.getRecord(client)).contractFunctionResult.bytes).toJSON().data.at(-1)
}

async function main() {
    //get contract id
    let contractId = await deployContract();
    console.log("ContractId: " + contractId);
    //call function1 with parameters 4 and 3
    let result1 = await interactWithContractFunction1(contractId, 4, 3);
    //print out result of function2
    console.log("function1 result: " + result1);
    let result2 = await interactWithContractFunction2(contractId, result1);
    //print out result of function2
    console.log("function2 result: " + result2);

    process.exit()
}

main()
