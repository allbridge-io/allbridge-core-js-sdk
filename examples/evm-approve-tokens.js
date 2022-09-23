const {AllbridgeCoreSdk} = require('..');
const configs = require('../build/src/configs');
const Web3 = require("web3");
require('dotenv').config();

async function runExample() {
    const web3ProviderUrl = process.env.WEB3_PROVIDER_URL;
    const privateKey = process.env.PRIVATE_KEY;
    const tokenAddress = process.env.TOKEN_ADDRESS;
    const accountAddress = process.env.ACCOUNT_ADDRESS;
    const contractAddress = process.env.CONTRACT_ADDRESS;

    const web3 = new Web3(web3ProviderUrl);
    const account = web3.eth.accounts.privateKeyToAccount(privateKey);
    web3.eth.accounts.wallet.add(account);
    const sdk = new AllbridgeCoreSdk(configs.development);
    const approveData = {
        tokenAddress: tokenAddress,
        owner: accountAddress,
        spender: contractAddress
    }
    const approveResponse = await sdk.evmApprove(web3, approveData);
    console.log("approve response: ", approveResponse);
}

runExample();
