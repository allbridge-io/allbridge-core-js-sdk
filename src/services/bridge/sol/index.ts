/* eslint-disable @typescript-eslint/ban-ts-comment */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { AnchorProvider, BN, Program, Provider, web3 } from "@project-serum/anchor";
import { Connection, Keypair, PublicKey, SystemProgram, TransactionInstruction } from "@solana/web3.js";
import Big from "big.js";
import { ChainType } from "../../../chains";
import { AllbridgeCoreClient } from "../../../client/core-api";
import { Messenger } from "../../../client/core-api/core-api.model";
import { FeePaymentMethod } from "../../../models";
import { RawTransaction, TransactionResponse } from "../../models";
import { SwapAndBridgeSolData } from "../../models/sol";
import { Bridge as BridgeType, IDL as bridgeIdl } from "../../models/sol/types/bridge";
import { getMessage, getVUsdAmount } from "../../utils/sol";
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
import { getGasFeeOptions, getNonce, prepareTxSendParams } from "../utils";

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
    const txSendParams = await prepareTxSendParams(this.chainType, params, this.api);

    const solTxSendParams = await this.prepareSolTxSendParams(params, txSendParams);

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

  private async prepareSolTxSendParams(params: SendParams, txSendParams: TxSendParams): Promise<SolTxSendParams> {
    const gasFeeOptions = await getGasFeeOptions(
      txSendParams.fromChainId,
      txSendParams.toChainId,
      params.sourceToken.decimals,
      txSendParams.messenger,
      this.api
    );
    const fee = gasFeeOptions[txSendParams.gasFeePaymentMethod];
    let extraGas;
    if (fee) {
      switch (txSendParams.gasFeePaymentMethod) {
        case FeePaymentMethod.WITH_NATIVE_CURRENCY:
          extraGas = Big(txSendParams.fee).minus(fee).toFixed();
          txSendParams.fee = fee;
          break;
        case FeePaymentMethod.WITH_STABLECOIN:
          extraGas = Big(txSendParams.amount).minus(fee).toFixed();
          txSendParams.amount = Big(txSendParams.amount).minus(extraGas).toFixed();
          throw Error("Solana does not support extraGas feature for payment with Stable-coins yet.");
          break;
      }
    }
    if (extraGas) {
      return {
        ...txSendParams,
        extraGas,
        poolAddress: params.sourceToken.poolAddress,
      };
    }
    return {
      ...txSendParams,
      poolAddress: params.sourceToken.poolAddress,
    };
  }

  private getExtraGasInstruction(
    extraGas: string,
    userAccount: PublicKey,
    configAccount: PublicKey
  ): TransactionInstruction | undefined {
    return web3.SystemProgram.transfer({
      fromPubkey: userAccount,
      toPubkey: configAccount,
      lamports: +extraGas,
    });
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
      extraGas,
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

    if (extraGas) {
      swapAndBridgeData.extraGasInstruction = this.getExtraGasInstruction(
        extraGas,
        swapAndBridgeData.userAccount,
        configAccount
      );
    }
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
      extraGasInstruction,
    } = swapAndBridgeData;
    const allbridgeMessengerProgramId = configAccountInfo.allbridgeMessengerProgramId;
    const messengerGasUsageAccount = await getGasUsageAccount(destinationChainId, allbridgeMessengerProgramId);
    const messengerConfig = await getConfigAccount(allbridgeMessengerProgramId);

    const sentMessageAccount = await getSendMessageAccount(message, allbridgeMessengerProgramId);

    const instructions: TransactionInstruction[] = [];
    if (extraGasInstruction) {
      instructions.push(extraGasInstruction);
    }

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
      .postInstructions(instructions)
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
      extraGasInstruction,
    } = swapAndBridgeData;
    const wormholeProgramId = this.params.wormholeMessengerProgramId;

    const [whBridgeAccount] = PublicKey.findProgramAddressSync(
      [Buffer.from("Bridge")],
      new PublicKey(wormholeProgramId)
    );
    const [whFeeCollectorAccount] = PublicKey.findProgramAddressSync(
      [Buffer.from("fee_collector")],
      new PublicKey(wormholeProgramId)
    );
    const [whSequenceAccount] = PublicKey.findProgramAddressSync(
      [Buffer.from("Sequence"), bridgeAuthority.toBuffer()],
      new PublicKey(wormholeProgramId)
    );

    const messengerGasUsageAccount = await getGasUsageAccount(
      destinationChainId,
      configAccountInfo.wormholeMessengerProgramId
    );
    const wormholeMessengerConfigAccount = await getConfigAccount(configAccountInfo.wormholeMessengerProgramId);
    const messageAccount = Keypair.generate();

    const provider = this.buildAnchorProvider(userAccount.toString());

    const bridgeAccountInfo = await provider.connection.getAccountInfo(whBridgeAccount);
    if (bridgeAccountInfo == null) {
      throw new Error("Cannot fetch wormhole bridge account info");
    }
    const feeLamports = new BN(bridgeAccountInfo.data.slice(16, 24), "le").toString();

    const feeInstruction = SystemProgram.transfer({
      fromPubkey: userAccount,
      toPubkey: whFeeCollectorAccount,
      lamports: +feeLamports,
    });

    const instructions: TransactionInstruction[] = [];
    if (extraGasInstruction) {
      instructions.push(extraGasInstruction);
    }

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
      message: messageAccount.publicKey,
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
      .postInstructions(instructions)
      .signers([messageAccount])
      .transaction();
    transaction.recentBlockhash = (await provider.connection.getLatestBlockhash()).blockhash;
    transaction.feePayer = userAccount;
    transaction.partialSign(messageAccount);
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
  extraGas?: string;
}
