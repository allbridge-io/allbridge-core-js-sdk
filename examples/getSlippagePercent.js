const {AllbridgeCoreSdk} = require('..');
const configs = require('../build/src/configs');

async function runExample() {

    const sdk = new AllbridgeCoreSdk(configs.development);

    const tokensInfo = await sdk.getTokensInfo();

    const tokens = tokensInfo.tokens();
    const sourceToken = tokens[0];
    const destinationToken = tokens[tokens.length - 1];
    const amount = '100.5';

    console.log("%d %s on %s to %s on %s", amount, sourceToken.symbol, sourceToken.chainSymbol, destinationToken.symbol, destinationToken.chainSymbol);

    const sourceSlippagePercent = sdk.calculateSlippagePercentOnSourceChain(amount, sourceToken);
    console.log("Slippage on source chain = %s%", sourceSlippagePercent.toFixed(2));

    const destinationSlippagePercent = sdk.calculateSlippagePercentOnDestinationChain(amount, sourceToken, destinationToken);
    console.log("Slippage on destination chain = %s%", destinationSlippagePercent.toFixed(2));

}

runExample();
