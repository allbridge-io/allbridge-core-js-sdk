import { AllbridgeCoreSdk, ChainSymbol, Messenger, nodeRpcUrlsDefault, SendParams } from "@allbridge/bridge-core-sdk";
import { TransactionConfig } from "web3-core";
import Web3 from "web3";
import { sendRawTransaction } from "../../utils/web3";
import { ensure } from "../../utils/utils";
import { getEnvVar } from "../../utils/env";

const ETH_NODE_RPC_URL = getEnvVar("ETH_NODE_RPC_URL");
const privateKey = getEnvVar("ETH_PRIVATE_KEY");
const fromAccountAddress = getEnvVar("ETH_ACCOUNT_ADDRESS");
const toAccountAddress = getEnvVar("ARB_ACCOUNT_ADDRESS");

const web3 = new Web3(ETH_NODE_RPC_URL);
const account = web3.eth.accounts.privateKeyToAccount(privateKey);
web3.eth.accounts.wallet.add(account);

const main = async () => {
  const sdk = new AllbridgeCoreSdk({
    ...nodeRpcUrlsDefault,
    ETH: ETH_NODE_RPC_URL,
  });
  const chainDetailsMap = await sdk.chainDetailsMap();
  const sourceToken = ensure(chainDetailsMap[ChainSymbol.ETH].tokens.find((t) => t.symbol == "USDC"));
  const destinationToken = ensure(chainDetailsMap[ChainSymbol.ARB].tokens.find((t) => t.symbol == "USDC"));
  //check if tokens support cctp
  if (sourceToken.cctpAddress && destinationToken.cctpAddress) {
    //send by cctp
    const amount = "1";
    const checkAllowance = await sdk.bridge.checkAllowance({
      amount,
      token: sourceToken,
      owner: fromAccountAddress,
      messenger: Messenger.CCTP,
    });
    console.log("checkAllowance", checkAllowance);
    if (checkAllowance == false) {
      const approveParams = {
        token: sourceToken,
        owner: fromAccountAddress,
        messenger: Messenger.CCTP,
      };
      const tx = await sdk.bridge.rawTxBuilder.approve(approveParams);
      const txReceipt = await sendRawTransaction(web3, tx as TransactionConfig);
      console.log("approve tx id:", txReceipt.transactionHash);
    }
    const willBeReceived = await sdk.getAmountToBeReceived(amount, destinationToken, sourceToken, Messenger.CCTP);
    console.log("willBeReceived", willBeReceived);
    const sendParams: SendParams = {
      amount,
      fromAccountAddress,
      toAccountAddress,
      destinationToken,
      sourceToken,
      messenger: Messenger.CCTP,
    };
    const tx = await sdk.bridge.rawTxBuilder.send(sendParams);
    //sign and send raw Tx
    const txReceipt = await sendRawTransaction(web3, tx as TransactionConfig);
    console.log("tx id:", txReceipt.transactionHash);
  }
};

main()
  .then(() => {
    console.log("Done");
  })
  .catch((e) => {
    console.error(e);
  });
