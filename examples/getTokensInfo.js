const {AllbridgeCoreSdk} = require('..');
const configs = require('../build/src/configs');

async function runExample() {

    const sdk = new AllbridgeCoreSdk(configs.development);

    const tokensInfo = await sdk.getTokensInfo();
    console.log("tokensInfo =", JSON.stringify(tokensInfo.tokens(), null, 2));
}

runExample();
