import * as dotenv from "dotenv";
import { getEnvVar } from "../../../utils/env";
import {
  AllbridgeCoreSdk,
  assertYieldIsSupported,
  ChainSymbol,
  nodeRpcUrlsDefault,
  RawEvmTransaction,
} from "@allbridge/bridge-core-sdk";
import { ensure } from "../../../utils/utils";
import { sendEvmRawTransaction } from "../../../utils/web3";

dotenv.config({ path: ".env" });

const main = async () => {
  // sender address
  const accountAddress = getEnvVar("ETH_ACCOUNT_ADDRESS");
  const tokenAddress = getEnvVar("ETH_TOKEN_ADDRESS");
  const rpcNode = getEnvVar("WEB3_PROVIDER_URL");

  const sdk = new AllbridgeCoreSdk({ ...nodeRpcUrlsDefault, ETH: rpcNode });
  const token = ensure((await sdk.tokens()).find((tokenInfo) => tokenInfo.tokenAddress === tokenAddress));

  assertYieldIsSupported(token); // you can also use if(isYieldSupported(token))

  const cydTokens = await sdk.yield.getCYDTokens();
  const cydToken = ensure(cydTokens.find((token) => token.chainSymbol === ChainSymbol.ETH));
  console.log("CYD token", cydToken.chainSymbol);

  const amount = "1"; //1 token

  console.log("allowance", await sdk.yield.getAllowance({ token: token, owner: accountAddress }));
  const checkAllowance = await sdk.yield.checkAllowance({ amount, token: token, owner: accountAddress });
  console.log("checkAllowance", checkAllowance);

  if (!checkAllowance) {
    const approveTx = await sdk.yield.rawTxBuilder.approve({ token: token, owner: accountAddress });
    const txReceipt = await sendEvmRawTransaction(approveTx as RawEvmTransaction);
    console.log("Approve tx:", txReceipt.transactionHash);
  }

  console.log("balanceOf", await sdk.yield.balanceOf({ token: cydToken, owner: accountAddress }));
  console.log(
    `getEstimatedAmountOnDeposit ${amount}->`,
    await sdk.yield.getEstimatedAmountOnDeposit({ amount, token: token })
  );
  const proportionAmount = await sdk.yield.getWithdrawAmounts({
    amount,
    owner: accountAddress,
    cydToken,
  });
  let proportionAmountMsg = "";
  proportionAmount.forEach(
    (prop) => (proportionAmountMsg = proportionAmountMsg + `${prop.token.symbol}: ${prop.amount}; `)
  );
  console.log(`getWithdrawProportionAmount ${amount}->`, proportionAmountMsg);

  // create deposit raw transaction
  const rawTransactionDeposit = (await sdk.yield.rawTxBuilder.deposit({
    amount,
    owner: accountAddress,
    token: token,
    minVirtualAmount: "0.95",
  })) as RawEvmTransaction;

  const txReceiptDeposit = await sendEvmRawTransaction(rawTransactionDeposit);
  console.log("Token deposit:", txReceiptDeposit.transactionHash);

  // create withdraw raw transaction
  const rawTransactionWithdraw = (await sdk.yield.rawTxBuilder.withdraw({
    amount,
    owner: accountAddress,
    token: cydToken,
  })) as RawEvmTransaction;

  const txReceiptWithdraw = await sendEvmRawTransaction(rawTransactionWithdraw);
  console.log("Token withdraw:", txReceiptWithdraw.transactionHash);
};

main()
  .then(() => {
    console.log("Done");
  })
  .catch((e) => {
    console.error(e);
  });
