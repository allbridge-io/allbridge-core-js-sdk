const {AllbridgeCoreSdk} = require('..');
const configs = require('../build/src/configs');

async function runExample() {

    const sdk = new AllbridgeCoreSdk(configs.development);

    const tokensInfo = await sdk.api.getTokensInfo();
    console.log("tokensInfo =", JSON.stringify(tokensInfo.entries, null, 2));
}

runExample();
