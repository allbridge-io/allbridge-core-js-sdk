const {AllbridgeCoreSdk} = require('..');
const configs = require('../build/src/configs');
const Web3 = require("web3");
require('dotenv').config();

async function runExample() {
    const web3ProviderUrl = process.env.WEB3_PROVIDER_URL;
    const accountAddress = process.env.ACCOUNT_ADDRESS;
    const contractAddress = process.env.CONTRACT_ADDRESS;
    const tokenAddress = process.env.TOKEN_ADDRESS;
    const receiveTokenAddress = process.env.RECEIVE_TOKEN_ADDRESS;


    const web3 = new Web3(web3ProviderUrl);
    const sendParams = {
        account: accountAddress,
        contractAddress: contractAddress,
        tokenAddress: tokenAddress,
        amount: "0x10A741A462780000",//amount: 1200000000000000000 // 1.2 in 18 decimals dimension converted to hex
        receiverAddress: accountAddress,
        destinationChainId: 3,//TODO
        receiveTokenAddress: receiveTokenAddress,
        messenger: 1,//TODO
        fee: 2000000000000000//TODO //0.002 Ether
    };

    const account = web3.eth.accounts.privateKeyToAccount("d994a4d54be5bd7bdca68ac9a45bdbcc9bf9a2c6611db034be1af2b8d0603162");
    web3.eth.accounts.wallet.add(account);

    const sdk = new AllbridgeCoreSdk(configs.development);

    const response = await sdk.evmSend(web3, sendParams);
    console.log("evmSend response: ", response);
}

runExample();
