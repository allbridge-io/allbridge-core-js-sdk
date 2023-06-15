/* eslint-disable @typescript-eslint/ban-ts-comment */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { setDefaultWasm, solana } from "@certusone/wormhole-sdk";
import { AnchorProvider, BN, Program, Provider, web3 } from "@project-serum/anchor";
import { Connection, Keypair, PublicKey } from "@solana/web3.js";
import { ChainType } from "../../../chains";
import { AllbridgeCoreClient } from "../../../client/core-api";
import { Messenger } from "../../../client/core-api/core-api.model";
import { RawTransaction, TransactionResponse } from "../../models";
import { SwapAndBridgeSolData } from "../../models/sol";
import { Bridge as BridgeType, IDL as bridgeIdl } from "../../models/sol/types/bridge";
import { getMessage, getTokenAccountData, getVUsdAmount } from "../../utils/sol";
import {
  getAssociatedAccount,
  getAuthorityAccount,
  getBridgeTokenAccount,
  getChainBridgeAccount,
  getConfigAccount,
  getGasUsageAccount,
  getLockAccount,
  getOtherChainTokenAccount,
  getPriceAccount,
  getSendMessageAccount,
} from "../../utils/sol/accounts";
import { SendParams, TxSendParams } from "../models";
import { ChainBridgeService } from "../models/bridge";
import { getNonce, prepareTxSendParams } from "../utils";

export interface SolanaBridgeParams {
  solanaRpcUrl: string;
  wormholeMessengerProgramId: string;
}

export class SolanaBridgeService extends ChainBridgeService {
  chainType: ChainType.SOLANA = ChainType.SOLANA;

  constructor(public params: SolanaBridgeParams, public api: AllbridgeCoreClient) {
    super();
  }

  async buildRawTransactionSend(params: SendParams): Promise<RawTransaction> {
    params.fee = "";
    const txSendParams = await prepareTxSendParams(this.chainType, params, this.api);

    const solTxSendParams = this.prepareSolTxSendParams(params, txSendParams);

    const swapAndBridgeSolData = await this.prepareSwapAndBridgeData(solTxSendParams);
    switch (txSendParams.messenger) {
      case Messenger.ALLBRIDGE: {
        // prettier-ignore
        return this.buildSwapAndBridgeAllbridgeTransaction(swapAndBridgeSolData);
      }
      case Messenger.WORMHOLE: {
        return this.buildSwapAndBridgeWormholeTransaction(swapAndBridgeSolData);
      }
    }
  }

  private prepareSolTxSendParams(params: SendParams, txSendParams: TxSendParams): SolTxSendParams {
    return {
      ...txSendParams,
      poolAddress: params.sourceToken.poolAddress,
    };
  }

  private async prepareSwapAndBridgeData(txSendParams: SolTxSendParams): Promise<SwapAndBridgeSolData> {
    const {
      amount,
      contractAddress,
      fromChainId,
      fromAccountAddress,
      fromTokenAddress,
      toChainId,
      toAccountAddress,
      toTokenAddress,
      poolAddress,
    } = txSendParams;
    const tokenAddress = fromTokenAddress;
    const account = fromAccountAddress;
    const destinationChainId = toChainId;
    const receiveTokenAddress = toTokenAddress;
    const receiverInBuffer32 = toAccountAddress;
    const bridgeAddress = contractAddress;
    const sourceChainId = fromChainId;

    const provider = this.buildAnchorProvider(account);
    const bridge = new Program<BridgeType>(bridgeIdl, bridgeAddress, provider);
    const nonce = Array.from(getNonce());
    const poolAccount = new PublicKey(poolAddress);
    const vUsdAmount = await getVUsdAmount(amount, bridge, poolAccount);

    const lockAccount = await getLockAccount(nonce, bridge.programId);
    const bridgeAuthority = await getAuthorityAccount(bridge.programId);
    const userToken = await getAssociatedAccount(new PublicKey(account), new PublicKey(tokenAddress));
    const bridgeTokenAccount = await getBridgeTokenAccount(new PublicKey(tokenAddress), bridge.programId);
    const chainBridgeAccount = await getChainBridgeAccount(destinationChainId, bridge.programId);
    const otherBridgeTokenAccount = await getOtherChainTokenAccount(
      destinationChainId,
      Buffer.from(receiveTokenAddress),
      bridge.programId
    );

    const configAccount = await getConfigAccount(bridge.programId);
    const configAccountInfo = await bridge.account.config.fetch(configAccount);
    const priceAccount = await getPriceAccount(destinationChainId, configAccountInfo.gasOracleProgramId);
    const thisGasPriceAccount = await getPriceAccount(sourceChainId, configAccountInfo.gasOracleProgramId);

    const message = getMessage({
      amount: vUsdAmount,
      recipient: Buffer.from(receiverInBuffer32),
      nonce: Buffer.from(nonce),
      receiveToken: Buffer.from(receiveTokenAddress),
      destinationChainId,
      sourceChainId,
      chainBridge: (await getAuthorityAccount(bridge.programId)).toBuffer(),
    });

    const swapAndBridgeData = {} as SwapAndBridgeSolData;

    swapAndBridgeData.bridge = bridge;
    swapAndBridgeData.amount = new BN(amount);
    swapAndBridgeData.vusdAmount = new BN(vUsdAmount);
    swapAndBridgeData.nonce = nonce;
    // @ts-expect-error
    swapAndBridgeData.recipient = Array.from(receiverInBuffer32);
    // @ts-expect-error
    swapAndBridgeData.receiveToken = Array.from(receiveTokenAddress);
    swapAndBridgeData.poolAccount = poolAccount;
    swapAndBridgeData.lockAccount = lockAccount;
    swapAndBridgeData.bridgeAuthority = bridgeAuthority;
    swapAndBridgeData.userToken = userToken;
    swapAndBridgeData.bridgeTokenAccount = bridgeTokenAccount;
    swapAndBridgeData.chainBridgeAccount = chainBridgeAccount;
    swapAndBridgeData.otherBridgeTokenAccount = otherBridgeTokenAccount;
    swapAndBridgeData.userAccount = new PublicKey(account);
    swapAndBridgeData.destinationChainId = destinationChainId;
    // @ts-expect-error
    swapAndBridgeData.mint = new PublicKey(tokenAddress);
    swapAndBridgeData.config = configAccount;
    swapAndBridgeData.configAccountInfo = configAccountInfo;
    swapAndBridgeData.gasPrice = priceAccount;
    swapAndBridgeData.thisGasPrice = thisGasPriceAccount;
    swapAndBridgeData.message = message;

    return swapAndBridgeData;
  }

  private async buildSwapAndBridgeAllbridgeTransaction(
    swapAndBridgeData: SwapAndBridgeSolData
  ): Promise<RawTransaction> {
    const {
      bridge,
      vusdAmount,
      nonce,
      recipient,
      receiveToken,
      poolAccount,
      lockAccount,
      bridgeAuthority,
      userToken,
      bridgeTokenAccount,
      chainBridgeAccount,
      otherBridgeTokenAccount,
      userAccount,
      destinationChainId,
      mint,
      config,
      configAccountInfo,
      gasPrice,
      thisGasPrice,
      message,
    } = swapAndBridgeData;
    const allbridgeMessengerProgramId = configAccountInfo.allbridgeMessengerProgramId;
    const messengerGasUsageAccount = await getGasUsageAccount(destinationChainId, allbridgeMessengerProgramId);
    const messengerConfig = await getConfigAccount(allbridgeMessengerProgramId);

    const sentMessageAccount = await getSendMessageAccount(message, allbridgeMessengerProgramId);

    const transaction = await bridge.methods
      .swapAndBridge({
        vusdAmount,
        nonce,
        destinationChainId,
        recipient,
        receiveToken,
      })
      .accounts({
        mint,
        user: userAccount,
        config,
        lock: lockAccount,
        pool: poolAccount,
        gasPrice,
        thisGasPrice,
        bridgeAuthority,
        userToken,
        bridgeToken: bridgeTokenAccount,
        chainBridge: chainBridgeAccount,
        messenger: allbridgeMessengerProgramId,
        messengerGasUsage: messengerGasUsageAccount,
        messengerConfig,
        sentMessageAccount,
        otherBridgeToken: otherBridgeTokenAccount,
      })
      .preInstructions([
        web3.ComputeBudgetProgram.setComputeUnitLimit({
          units: 1000000,
        }),
      ])
      .transaction();
    transaction.recentBlockhash = (
      await this.buildAnchorProvider(userAccount.toString()).connection.getLatestBlockhash()
    ).blockhash;
    transaction.feePayer = userAccount;
    return transaction;
  }

  private async buildSwapAndBridgeWormholeTransaction(
    swapAndBridgeData: SwapAndBridgeSolData
  ): Promise<RawTransaction> {
    const {
      bridge,
      vusdAmount,
      nonce,
      recipient,
      receiveToken,
      poolAccount,
      lockAccount,
      bridgeAuthority,
      userToken,
      bridgeTokenAccount,
      chainBridgeAccount,
      otherBridgeTokenAccount,
      userAccount,
      destinationChainId,
      mint,
      config,
      configAccountInfo,
      gasPrice,
      thisGasPrice,
      message,
    } = swapAndBridgeData;
    const wormholeProgramId = this.params.wormholeMessengerProgramId;
    const messengerGasUsageAccount = await getGasUsageAccount(
      destinationChainId,
      configAccountInfo.wormholeMessengerProgramId
    );
    setDefaultWasm("node");
    const core = await solana.importCoreWasm();
    const wormholeMessengerConfigAccount = await getConfigAccount(configAccountInfo.wormholeMessengerProgramId);
    const messageAccount = Keypair.generate();

    const instruction = solana.ixFromRust(
      await core.post_message_ix(
        wormholeProgramId,
        userAccount.toBase58(),
        bridgeAuthority.toBase58(),
        messageAccount.publicKey.toBase58(),
        0,
        message,
        "FINALIZED"
      )
    );

    const [
      whBridgeAccount,
      whMessageAccount,
      whEmitterAccount,
      whSequenceAccount,
      whPayerAccount,
      whFeeCollectorAccount,
    ] = instruction.keys.map((v) => v.pubkey);

    const provider = this.buildAnchorProvider(userAccount.toString());

    const feeInstruction = await solana.getBridgeFeeIx(provider.connection, wormholeProgramId, userAccount.toBase58());

    const accounts = {
      mint,
      user: userAccount,
      config,
      lock: lockAccount,
      pool: poolAccount,
      gasPrice,
      thisGasPrice,
      bridgeAuthority,
      userToken,
      bridgeToken: bridgeTokenAccount,
      chainBridge: chainBridgeAccount,
      otherBridgeToken: otherBridgeTokenAccount,
      messengerGasUsage: messengerGasUsageAccount,
      wormholeProgram: wormholeProgramId,
      bridge: whBridgeAccount,
      message: whMessageAccount,
      wormholeMessenger: configAccountInfo.wormholeMessengerProgramId,
      sequence: whSequenceAccount,
      feeCollector: whFeeCollectorAccount,
      wormholeMessengerConfig: wormholeMessengerConfigAccount,
      clock: web3.SYSVAR_CLOCK_PUBKEY,
    };

    const transaction = await bridge.methods
      .swapAndBridgeWormhole({
        vusdAmount,
        nonce: nonce,
        destinationChainId,
        recipient,
        receiveToken,
      })
      .accounts(accounts)
      .preInstructions([
        web3.ComputeBudgetProgram.setComputeUnitLimit({
          units: 1000000,
        }),
        feeInstruction,
      ])
      .signers([messageAccount])
      .transaction();
    transaction.recentBlockhash = (await provider.connection.getLatestBlockhash()).blockhash;
    transaction.feePayer = userAccount;
    transaction.sign(messageAccount);
    return transaction;
  }

  private buildAnchorProvider(accountAddress: string): Provider {
    const connection = new Connection(this.params.solanaRpcUrl, "confirmed");

    const publicKey = new PublicKey(accountAddress);

    return new AnchorProvider(
      connection,
      // @ts-expect-error enough wallet for fetch actions
      { publicKey: publicKey },
      {
        preflightCommitment: "processed",
        commitment: "finalized",
      }
    );
  }

  sendTx(params: TxSendParams): Promise<TransactionResponse> {
    throw new Error("NOT SUPPORTED");
  }
}

interface SolTxSendParams extends TxSendParams {
  poolAddress: string;
}
