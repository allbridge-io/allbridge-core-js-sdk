/* eslint-disable @typescript-eslint/ban-ts-comment */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { AnchorProvider, BN, Program, Provider, Spl, web3 } from "@project-serum/anchor";
import {
  Connection,
  Keypair,
  PublicKey,
  SystemProgram,
  Transaction,
  TransactionInstruction,
  TransactionMessageArgs,
  VersionedTransaction,
} from "@solana/web3.js";
import Big from "big.js";
import { ChainDecimalsByType, ChainType } from "../../../chains";
import { AllbridgeCoreClient } from "../../../client/core-api";
import { Messenger } from "../../../client/core-api/core-api.model";
import {
  AmountNotEnoughError,
  JupiterError,
  MethodNotSupportedError,
  SdkError,
  SdkRootError,
} from "../../../exceptions";
import { FeePaymentMethod, SwapParams } from "../../../models";
import { convertIntAmountToFloat } from "../../../utils/calculation";
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
import { SendParams, TxSendParams, TxSwapParams } from "../models";
import { ChainBridgeService } from "../models/bridge";
import { getNonce, prepareTxSendParams, prepareTxSwapParams } from "../utils";
import { JupiterService } from "./jupiter";

export interface SolanaBridgeParams {
  wormholeMessengerProgramId: string;
  solanaLookUpTable: string;
}

export class SolanaBridgeService extends ChainBridgeService {
  chainType: ChainType.SOLANA = ChainType.SOLANA;
  jupiterService: JupiterService;

  constructor(public solanaRpcUrl: string, public params: SolanaBridgeParams, public api: AllbridgeCoreClient) {
    super();
    this.jupiterService = new JupiterService(solanaRpcUrl);
  }

  async buildRawTransactionSwap(params: SwapParams): Promise<RawTransaction> {
    const txSwapParams = prepareTxSwapParams(this.chainType, params);
    return this.buildSwapTransaction(txSwapParams, params.sourceToken.poolAddress, params.destinationToken.poolAddress);
  }

  private async buildSwapTransaction(
    params: TxSwapParams,
    poolAddress: string,
    toPoolAddress: string
  ): Promise<VersionedTransaction> {
    const {
      fromAccountAddress,
      amount,
      contractAddress,
      fromTokenAddress,
      toTokenAddress,
      toAccountAddress,
      minimumReceiveAmount,
    } = params;
    const account = fromAccountAddress;
    const bridgeAddress = contractAddress;
    const tokenAddress = fromTokenAddress;
    const receiveTokenAddress = toTokenAddress;
    const receivePoolAddress = toPoolAddress;
    const receiverOriginal = toAccountAddress;

    const userAccount = new PublicKey(account);
    const provider = this.buildAnchorProvider(userAccount.toString());
    const bridge = new Program<BridgeType>(bridgeIdl, bridgeAddress, provider);

    const bridgeAuthority = await getAuthorityAccount(bridge.programId);
    const configAccount = await getConfigAccount(bridge.programId);

    const sendMint = new PublicKey(tokenAddress);
    const sendBridgeToken = await getBridgeTokenAccount(sendMint, bridge.programId);
    const sendPool = new PublicKey(poolAddress);
    const sendUserToken = await getAssociatedAccount(userAccount, sendMint);

    const receiverAccount = new PublicKey(receiverOriginal);
    const receiveMint = new PublicKey(receiveTokenAddress);
    const receiveBridgeToken = await getBridgeTokenAccount(receiveMint, bridge.programId);
    const receivePool = new PublicKey(receivePoolAddress);
    const receiveUserToken = await getAssociatedAccount(receiverAccount, receiveMint);

    const preInstructions: TransactionInstruction[] = [
      web3.ComputeBudgetProgram.setComputeUnitLimit({
        units: 1000000,
      }),
    ];

    try {
      await getTokenAccountData(receiveUserToken, provider);
    } catch (e) {
      const associatedProgram = Spl.associatedToken(provider);
      const createReceiveUserTokenInstruction: TransactionInstruction = await associatedProgram.methods
        .create()
        .accounts({
          mint: receiveMint,
          owner: receiverAccount,
          associatedAccount: receiveUserToken,
        })
        .instruction();
      preInstructions.push(createReceiveUserTokenInstruction);
    }
    const transaction = await bridge.methods
      .swap(new BN(amount), new BN(minimumReceiveAmount || 0))
      .accounts({
        payer: userAccount,
        config: configAccount,
        bridgeAuthority,
        user: userAccount,
        sendBridgeToken,
        sendMint,
        sendPool,
        sendUserToken,
        receiveBridgeToken,
        receiveMint,
        receivePool,
        receiveUserToken,
      })
      .preInstructions(preInstructions)
      .transaction();

    const connection = provider.connection;
    transaction.recentBlockhash = (await connection.getLatestBlockhash()).blockhash;
    transaction.feePayer = userAccount;
    return await this.convertToVersionedTransaction(transaction, connection);
  }

  async buildRawTransactionSend(params: SendParams): Promise<RawTransaction> {
    const txSendParams = await prepareTxSendParams(this.chainType, params, this.api);
    let solTxSendParams = this.addPoolAddress(params, txSendParams);

    const isJupiterForStableCoin = solTxSendParams.gasFeePaymentMethod == FeePaymentMethod.WITH_STABLECOIN;

    let jupTx;
    if (isJupiterForStableCoin) {
      try {
        solTxSendParams = await this.convertStableCoinFeeAndExtraGasToNativeCurrency(
          params.sourceToken.decimals,
          solTxSendParams
        );

        let amountToGet = Big(solTxSendParams.fee);
        if (solTxSendParams.extraGas) {
          amountToGet = amountToGet.plus(solTxSendParams.extraGas);
        }

        const { tx, amountIn } = await this.jupiterService.getJupiterSwapTx(
          params.fromAccountAddress,
          params.sourceToken.tokenAddress,
          amountToGet.toFixed(0)
        );
        jupTx = tx;
        solTxSendParams.amount = Big(solTxSendParams.amount).minus(amountIn).toFixed(0);
        if (Big(solTxSendParams.amount).lte(0)) {
          throw new AmountNotEnoughError(
            `Amount not enough to pay fee, ${convertIntAmountToFloat(
              Big(solTxSendParams.amount).neg(),
              params.sourceToken.decimals
            ).toFixed()} stables is missing`
          );
        }
      } catch (e) {
        if (e instanceof SdkRootError) {
          throw e;
        }
        if (e instanceof Error && e.message) {
          throw new JupiterError(`Some error occurred during creation Jupiter swap transaction. ${e.message}`);
        }
        throw new JupiterError("Some error occurred during creation Jupiter swap transaction");
      }
    }

    let swapAndBridgeTx: VersionedTransaction;
    let wormMessageSigner: Keypair | undefined = undefined;
    const swapAndBridgeSolData = await this.prepareSwapAndBridgeData(solTxSendParams);
    switch (txSendParams.messenger) {
      case Messenger.ALLBRIDGE: {
        swapAndBridgeTx = await this.buildSwapAndBridgeAllbridgeTransaction(swapAndBridgeSolData);
        break;
      }
      case Messenger.WORMHOLE: {
        const { transaction, messageAccount } = await this.buildSwapAndBridgeWormholeTransaction(swapAndBridgeSolData);
        swapAndBridgeTx = transaction;
        wormMessageSigner = messageAccount;
        break;
      }
    }

    if (isJupiterForStableCoin) {
      if (!jupTx) {
        throw new JupiterError("Swap tx is absent");
      }
      swapAndBridgeTx = await this.jupiterService.amendJupiterWithSdkTx(jupTx, swapAndBridgeTx);
    }

    if (wormMessageSigner) {
      swapAndBridgeTx.sign([wormMessageSigner]);
    }
    return swapAndBridgeTx;
  }

  private addPoolAddress(params: SendParams, txSendParams: TxSendParams): SolTxSendParams {
    return {
      ...txSendParams,
      poolAddress: params.sourceToken.poolAddress,
    };
  }

  async convertStableCoinFeeAndExtraGasToNativeCurrency(
    tokenDecimals: number,
    solTxSendParams: SolTxSendParams
  ): Promise<SolTxSendParams> {
    if (solTxSendParams.gasFeePaymentMethod == FeePaymentMethod.WITH_STABLECOIN) {
      const sourceNativeTokenPrice = (
        await this.api.getReceiveTransactionCost({
          sourceChainId: solTxSendParams.fromChainId,
          destinationChainId: solTxSendParams.toChainId,
          messenger: solTxSendParams.messenger,
        })
      ).sourceNativeTokenPrice;
      solTxSendParams.fee = Big(solTxSendParams.fee)
        .div(sourceNativeTokenPrice)
        .mul(Big(10).pow(ChainDecimalsByType[ChainType.SOLANA] - tokenDecimals))
        .toFixed(0);
      if (solTxSendParams.extraGas) {
        solTxSendParams.extraGas = Big(solTxSendParams.extraGas)
          .div(sourceNativeTokenPrice)
          .mul(Big(10).pow(ChainDecimalsByType[ChainType.SOLANA] - tokenDecimals))
          .toFixed(0);
      }
      solTxSendParams.gasFeePaymentMethod = FeePaymentMethod.WITH_NATIVE_CURRENCY;
    }
    return solTxSendParams;
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
  ): Promise<VersionedTransaction> {
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
    const connection = this.buildAnchorProvider(userAccount.toString()).connection;
    transaction.recentBlockhash = (await connection.getLatestBlockhash()).blockhash;
    transaction.feePayer = userAccount;
    return await this.convertToVersionedTransaction(transaction, connection);
  }

  private async convertToVersionedTransaction(tx: Transaction, connection: Connection): Promise<VersionedTransaction> {
    const allbridgeTableAccount = await connection
      .getAddressLookupTable(new PublicKey(this.params.solanaLookUpTable))
      .then((res) => res.value);
    if (!allbridgeTableAccount) {
      throw new SdkError("Cannot find allbridgeLookupTableAccount");
    }
    const messageV0 = new web3.TransactionMessage({
      payerKey: tx.feePayer,
      recentBlockhash: tx.recentBlockhash,
      instructions: tx.instructions,
    } as TransactionMessageArgs).compileToV0Message([allbridgeTableAccount]);
    return new web3.VersionedTransaction(messageV0);
  }

  private async buildSwapAndBridgeWormholeTransaction(
    swapAndBridgeData: SwapAndBridgeSolData
  ): Promise<{ transaction: VersionedTransaction; messageAccount: Keypair }> {
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
      throw new SdkError("Cannot fetch wormhole bridge account info");
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
    return { transaction: await this.convertToVersionedTransaction(transaction, provider.connection), messageAccount };
  }

  private buildAnchorProvider(accountAddress: string): Provider {
    const connection = new Connection(this.solanaRpcUrl, "confirmed");

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
    throw new MethodNotSupportedError();
  }
}

interface SolTxSendParams extends TxSendParams {
  poolAddress: string;
}
