/* eslint-disable @typescript-eslint/ban-ts-comment */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { BN, Program, Spl, web3 } from "@project-serum/anchor";
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
import { Big } from "big.js";
import { Chains } from "../../../chains";
import { Messenger } from "../../../client/core-api/core-api.model";
import { AllbridgeCoreClient } from "../../../client/core-api/core-client-base";
import {
  AmountNotEnoughError,
  CCTPDoesNotSupportedError,
  JupiterError,
  MethodNotSupportedError,
  SdkError,
  SdkRootError,
} from "../../../exceptions";
import { ChainType, FeePaymentMethod, SwapParams, TxFeeParams } from "../../../models";
import { convertIntAmountToFloat } from "../../../utils/calculation";
import { RawTransaction, TransactionResponse } from "../../models";
import { SwapAndBridgeSolData, SwapAndBridgeSolDataCctpData } from "../../models/sol";
import { Bridge as BridgeType, IDL as bridgeIdl } from "../../models/sol/types/bridge";
import { CctpBridge as CctpBridgeType, IDL as cctpBridgeIdl } from "../../models/sol/types/cctp_bridge";
import { getMessage, getTokenAccountData, getVUsdAmount } from "../../utils/sol";
import {
  getAssociatedAccount,
  getAuthorityAccount,
  getBridgeTokenAccount,
  getCctpAccounts,
  getCctpAuthorityAccount,
  getCctpBridgeAccount,
  getCctpBridgeTokenAccount,
  getCctpLockAccount,
  getChainBridgeAccount,
  getConfigAccount,
  getGasUsageAccount,
  getLockAccount,
  getOtherChainTokenAccount,
  getPriceAccount,
  getSendMessageAccount,
} from "../../utils/sol/accounts";
import { buildAnchorProvider } from "../../utils/sol/anchor-provider";
import { addUnitLimitAndUnitPriceToTx, addUnitLimitAndUnitPriceToVersionedTx } from "../../utils/sol/compute-budget";
import { SendParams, TxSendParamsSol, TxSwapParamsSol } from "../models";
import { ChainBridgeService } from "../models/bridge";
import { getNonce, prepareTxSendParams, prepareTxSwapParams } from "../utils";
import { JupiterService } from "./jupiter";

export interface SolanaBridgeParams {
  wormholeMessengerProgramId: string;
  solanaLookUpTable: string;
  cctpParams: CctpParams;
  jupiterParams: JupiterParams;
}

export interface JupiterParams {
  jupiterUrl: string;
  jupiterApiKeyHeader?: string;
  jupiterMaxAccounts?: number;
}

export interface CctpParams {
  cctpTransmitterProgramId: string;
  cctpTokenMessengerMinter: string;
  cctpDomains: CctpDomains;
}

/**
 * Type representing a map of CCTP domains to their corresponding numeric values.
 *
 * @typedef {Record<string, number>} CctpDomains
 * @property {string} chainSymbol - The symbol of the chain representing one of the supported blockchain networks (e.g., "ETH" for Ethereum). For more details, see: {@link ChainSymbol}.
 * @property {number} value - The numeric value associated with the specified chain.
 */
export type CctpDomains = Record<string, number>;

const COMPUTE_UNIT_LIMIT = 1000000;

const JUP_ADD_INDEX = 1.1;

export class SolanaBridgeService extends ChainBridgeService {
  chainType: ChainType.SOLANA = ChainType.SOLANA;
  jupiterService: JupiterService;

  constructor(
    public solanaRpcUrl: string,
    public params: SolanaBridgeParams,
    public api: AllbridgeCoreClient
  ) {
    super();
    this.jupiterService = new JupiterService(solanaRpcUrl, params.jupiterParams);
  }

  async buildRawTransactionSwap(params: SwapParams): Promise<RawTransaction> {
    const txSwapParams = prepareTxSwapParams(this.chainType, params);
    return await this.buildSwapTransaction(
      txSwapParams,
      params.sourceToken.poolAddress,
      params.destinationToken.poolAddress,
      params.txFeeParams
    );
  }

  private async buildSwapTransaction(
    params: TxSwapParamsSol,
    poolAddress: string,
    toPoolAddress: string,
    txFeeParams?: TxFeeParams
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
    const provider = buildAnchorProvider(this.solanaRpcUrl, userAccount.toString());
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
        units: COMPUTE_UNIT_LIMIT,
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
    await addUnitLimitAndUnitPriceToTx(transaction, txFeeParams, this.solanaRpcUrl);
    return await this.convertToVersionedTransaction(transaction, connection);
  }

  async buildRawTransactionSend(params: SendParams): Promise<RawTransaction> {
    const txSendParams = await prepareTxSendParams(this.chainType, params, this.api);
    let solTxSendParams = this.addPoolAddress(params, txSendParams);

    const isJupiterForStableCoin = solTxSendParams.gasFeePaymentMethod == FeePaymentMethod.WITH_STABLECOIN;

    let jupTx;
    if (isJupiterForStableCoin) {
      try {
        const { tx, solTxSendUpdatedParams } = await this.processJup(solTxSendParams, params, true);
        jupTx = tx;
        solTxSendParams = { ...solTxSendParams, ...solTxSendUpdatedParams };
      } catch (e) {
        try {
          const { tx, solTxSendUpdatedParams } = await this.processJup(solTxSendParams, params, false);
          jupTx = tx;
          solTxSendParams = { ...solTxSendParams, ...solTxSendUpdatedParams };
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
    }

    let swapAndBridgeTx: VersionedTransaction;
    let requiredMessageSigner: Keypair | undefined = undefined;
    switch (txSendParams.messenger) {
      case Messenger.ALLBRIDGE: {
        const swapAndBridgeSolData = await this.prepareSwapAndBridgeData(solTxSendParams);
        swapAndBridgeTx = await this.buildSwapAndBridgeAllbridgeTransaction(swapAndBridgeSolData);
        break;
      }
      case Messenger.WORMHOLE: {
        const swapAndBridgeSolData = await this.prepareSwapAndBridgeData(solTxSendParams);
        const { transaction, messageAccount } = await this.buildSwapAndBridgeWormholeTransaction(swapAndBridgeSolData);
        swapAndBridgeTx = transaction;
        requiredMessageSigner = messageAccount;
        break;
      }
      case Messenger.CCTP: {
        const swapAndBridgeSolData = await this.prepareSwapAndBridgeCctpData(solTxSendParams);
        const { transaction, messageSentEventDataKeypair } = await this.buildSwapAndBridgeCctpTransaction(
          params.destinationToken.chainSymbol,
          swapAndBridgeSolData
        );
        swapAndBridgeTx = transaction;
        requiredMessageSigner = messageSentEventDataKeypair;
        break;
      }
    }

    if (isJupiterForStableCoin) {
      if (!jupTx) {
        throw new JupiterError("Swap tx is absent");
      }
      swapAndBridgeTx = await this.jupiterService.amendJupiterWithSdkTx(jupTx, swapAndBridgeTx);
    }

    await addUnitLimitAndUnitPriceToVersionedTx(swapAndBridgeTx, params.txFeeParams, this.solanaRpcUrl);

    if (requiredMessageSigner) {
      swapAndBridgeTx.sign([requiredMessageSigner]);
    }
    return swapAndBridgeTx;
  }

  private async processJup(
    solTxSendParams: SolTxSendParams,
    params: SendParams,
    exactOut: boolean
  ): Promise<{
    tx: VersionedTransaction;
    solTxSendUpdatedParams: {
      amount: string;
      fee: string;
      extraGas?: string;
      gasFeePaymentMethod: FeePaymentMethod;
    };
  }> {
    const { fee, extraGas, gasFeePaymentMethod } = await this.convertStableCoinFeeAndExtraGasToNativeCurrency(
      params.sourceToken.decimals,
      solTxSendParams
    );

    let amountToProcess = exactOut ? Big(fee) : Big(solTxSendParams.fee);
    if (extraGas) {
      amountToProcess = amountToProcess.plus(extraGas);
    }
    if (!exactOut) {
      amountToProcess = amountToProcess.mul(JUP_ADD_INDEX);
    }

    const { tx, amountIn } = await this.jupiterService.getJupiterSwapTx(
      params.fromAccountAddress,
      params.sourceToken.tokenAddress,
      amountToProcess.toFixed(0),
      exactOut
    );

    let newAmount: string;
    if (exactOut) {
      if (!amountIn) {
        throw new JupiterError("Cannot get inAmount");
      }
      newAmount = Big(solTxSendParams.amount).minus(Big(amountIn).mul(JUP_ADD_INDEX)).toFixed(0);
    } else {
      newAmount = Big(solTxSendParams.amount).minus(amountToProcess).toFixed(0);
    }
    if (Big(newAmount).lte(0)) {
      throw new AmountNotEnoughError(
        `Amount not enough to pay fee, ${convertIntAmountToFloat(
          Big(newAmount).minus(1).neg(),
          params.sourceToken.decimals
        ).toFixed()} stables is missing`
      );
    }
    return {
      tx: tx,
      solTxSendUpdatedParams: {
        amount: newAmount,
        fee: fee,
        extraGas: extraGas,
        gasFeePaymentMethod: gasFeePaymentMethod,
      },
    };
  }

  private addPoolAddress(params: SendParams, txSendParams: TxSendParamsSol): SolTxSendParams {
    return {
      ...txSendParams,
      poolAddress: params.sourceToken.poolAddress,
    };
  }

  async convertStableCoinFeeAndExtraGasToNativeCurrency(
    tokenDecimals: number,
    solTxSendParams: SolTxSendParams
  ): Promise<{ fee: string; extraGas?: string; gasFeePaymentMethod: FeePaymentMethod }> {
    if (solTxSendParams.gasFeePaymentMethod == FeePaymentMethod.WITH_STABLECOIN) {
      const sourceNativeTokenPrice = (
        await this.api.getReceiveTransactionCost({
          sourceChainId: solTxSendParams.fromChainId,
          destinationChainId: solTxSendParams.toChainId,
          messenger: solTxSendParams.messenger,
        })
      ).sourceNativeTokenPrice;
      const fee = Big(solTxSendParams.fee)
        .div(sourceNativeTokenPrice)
        .mul(Big(10).pow(Chains.getChainDecimalsByType(ChainType.SOLANA) - tokenDecimals))
        .toFixed(0);
      let extraGas;
      if (solTxSendParams.extraGas) {
        extraGas = Big(solTxSendParams.extraGas)
          .div(sourceNativeTokenPrice)
          .mul(Big(10).pow(Chains.getChainDecimalsByType(ChainType.SOLANA) - tokenDecimals))
          .toFixed(0);
      }
      return { fee, extraGas, gasFeePaymentMethod: FeePaymentMethod.WITH_NATIVE_CURRENCY };
    }
    return {
      fee: solTxSendParams.fee,
      extraGas: solTxSendParams.extraGas,
      gasFeePaymentMethod: FeePaymentMethod.WITH_NATIVE_CURRENCY,
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

    const provider = buildAnchorProvider(this.solanaRpcUrl, account);
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
    swapAndBridgeData.recipient = Array.from(receiverInBuffer32);
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
          units: COMPUTE_UNIT_LIMIT,
        }),
      ])
      .postInstructions(instructions)
      .transaction();
    const connection = buildAnchorProvider(this.solanaRpcUrl, userAccount.toString()).connection;
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

    const provider = buildAnchorProvider(this.solanaRpcUrl, userAccount.toString());

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
          units: COMPUTE_UNIT_LIMIT,
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

  private async prepareSwapAndBridgeCctpData(txSendParams: SolTxSendParams): Promise<SwapAndBridgeSolDataCctpData> {
    const {
      contractAddress,
      amount,
      fromAccountAddress,
      fromTokenAddress,
      toChainId,
      toAccountAddress,
      toTokenAddress,
      extraGas,
    } = txSendParams;
    const cctpAddress = contractAddress;
    if (!cctpAddress) {
      throw new CCTPDoesNotSupportedError("Such route does not support CCTP protocol");
    }
    const CHAIN_ID = 4;

    const account = fromAccountAddress;
    const receiveTokenAddress = toTokenAddress;
    const receiverInBuffer32 = toAccountAddress;

    const provider = buildAnchorProvider(this.solanaRpcUrl, account);
    const cctpBridge: Program<CctpBridgeType> = new Program<CctpBridgeType>(cctpBridgeIdl, cctpAddress, provider);
    const mint = new PublicKey(fromTokenAddress);
    const cctpBridgeAccount = await getCctpBridgeAccount(mint, cctpBridge.programId);
    const userAccount = new PublicKey(account);

    const configAccountInfo = await cctpBridge.account.cctpBridge.fetch(cctpBridgeAccount);

    const swapAndBridgeData = {} as SwapAndBridgeSolDataCctpData;

    swapAndBridgeData.cctpBridge = cctpBridge;
    swapAndBridgeData.cctpBridgeAccount = cctpBridgeAccount;
    swapAndBridgeData.cctpAddressAccount = new PublicKey(cctpAddress);
    swapAndBridgeData.amount = new BN(amount);
    swapAndBridgeData.recipient = Array.from(receiverInBuffer32);
    swapAndBridgeData.receiveToken = Array.from(receiveTokenAddress);
    swapAndBridgeData.userToken = await getAssociatedAccount(userAccount, mint);
    swapAndBridgeData.bridgeAuthority = await getCctpAuthorityAccount(cctpBridgeAccount, cctpBridge.programId);
    swapAndBridgeData.bridgeTokenAccount = await getCctpBridgeTokenAccount(mint, cctpBridge.programId);
    swapAndBridgeData.chainBridgeAccount = await getChainBridgeAccount(toChainId, cctpBridge.programId);
    swapAndBridgeData.userAccount = userAccount;
    swapAndBridgeData.destinationChainId = toChainId;
    swapAndBridgeData.mint = mint;
    swapAndBridgeData.gasPrice = await getPriceAccount(toChainId, configAccountInfo.gasOracleProgramId);
    swapAndBridgeData.thisGasPrice = await getPriceAccount(CHAIN_ID, configAccountInfo.gasOracleProgramId);
    swapAndBridgeData.provider = provider;

    if (extraGas) {
      swapAndBridgeData.extraGasInstruction = this.getExtraGasInstruction(
        extraGas,
        swapAndBridgeData.userAccount,
        cctpBridgeAccount
      );
    }
    return swapAndBridgeData;
  }

  async buildSwapAndBridgeCctpTransaction(
    destinationChainSymbol: string,
    swapAndBridgeData: SwapAndBridgeSolDataCctpData
  ): Promise<{ transaction: VersionedTransaction; messageSentEventDataKeypair: Keypair }> {
    const {
      cctpBridge,
      cctpBridgeAccount,
      amount,
      recipient,
      receiveToken,
      bridgeAuthority,
      userToken,
      bridgeTokenAccount,
      chainBridgeAccount,
      userAccount,
      destinationChainId,
      mint,
      gasPrice,
      thisGasPrice,
      extraGasInstruction,
      provider,
    } = swapAndBridgeData;
    const domain = this.params.cctpParams.cctpDomains[destinationChainSymbol];
    const cctpTransmitterProgramIdAddress = this.params.cctpParams.cctpTransmitterProgramId;
    const cctpTokenMessengerMinterAddress = this.params.cctpParams.cctpTokenMessengerMinter;
    if (domain == undefined || !cctpTransmitterProgramIdAddress || !cctpTokenMessengerMinterAddress) {
      throw new SdkError("CCTP is not configured");
    }
    const cctpTransmitterProgramId = new PublicKey(cctpTransmitterProgramIdAddress);
    const cctpTokenMessengerMinter = new PublicKey(cctpTokenMessengerMinterAddress);
    const {
      messageTransmitterAccount,
      tokenMessenger,
      tokenMessengerEventAuthority,
      tokenMinter,
      localToken,
      remoteTokenMessengerKey,
      authorityPda,
    } = getCctpAccounts(domain, mint, cctpTransmitterProgramId, cctpTokenMessengerMinter);

    const instructions: TransactionInstruction[] = [];
    if (extraGasInstruction) {
      instructions.push(extraGasInstruction);
    }

    const messageSentEventDataKeypair = Keypair.generate();
    const lockAccount = getCctpLockAccount(cctpBridge.programId, messageSentEventDataKeypair.publicKey);

    const tx = await cctpBridge.methods
      .bridge({
        amount,
        destinationChainId,
        recipient,
        receiveToken,
      })
      .accounts({
        mint: mint,
        user: userAccount,
        cctpBridge: cctpBridgeAccount,

        messageSentEventData: messageSentEventDataKeypair.publicKey,
        lock: lockAccount,

        cctpMessenger: cctpTokenMessengerMinter,
        messageTransmitterProgram: cctpTransmitterProgramId,
        messageTransmitterAccount: messageTransmitterAccount,
        tokenMessenger: tokenMessenger,
        tokenMinter: tokenMinter,
        localToken: localToken,
        remoteTokenMessengerKey: remoteTokenMessengerKey,
        authorityPda: authorityPda,
        eventAuthority: tokenMessengerEventAuthority,

        bridgeToken: bridgeTokenAccount,
        gasPrice: gasPrice,
        thisGasPrice: thisGasPrice,
        chainBridge: chainBridgeAccount,
        userToken,
        bridgeAuthority: bridgeAuthority,
      })
      .preInstructions([
        web3.ComputeBudgetProgram.setComputeUnitLimit({
          units: 2000000,
        }),
      ])
      .postInstructions(instructions)
      .transaction();
    const connection = provider.connection;
    tx.recentBlockhash = (await connection.getLatestBlockhash()).blockhash;
    tx.feePayer = userAccount;
    return { transaction: await this.convertToVersionedTransaction(tx, connection), messageSentEventDataKeypair };
  }

  send(params: SendParams): Promise<TransactionResponse> {
    throw new MethodNotSupportedError();
  }
}

interface SolTxSendParams extends TxSendParamsSol {
  poolAddress: string;
}
