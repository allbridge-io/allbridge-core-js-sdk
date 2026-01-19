import { BN, Program, Provider, web3 } from "@coral-xyz/anchor";
import { createAssociatedTokenAccountInstruction, getAssociatedTokenAddressSync } from "@solana/spl-token";
import { Keypair, PublicKey, SystemProgram, TransactionInstruction, VersionedTransaction } from "@solana/web3.js";
import { Messenger } from "../../../client/core-api/core-api.model";
import { AllbridgeCoreClient } from "../../../client/core-api/core-client-base";
import { CCTPDoesNotSupportedError, OFTDoesNotSupportedError, SdkError } from "../../../exceptions";
import { CctpParams, ChainType, SwapParams, TxFeeParams } from "../../../models";
import { assertNever } from "../../../utils/utils";
import { RawTransaction } from "../../models";
import { Bridge as BridgeType } from "../../models/sol/types/bridge";
import * as bridgeIdl from "../../models/sol/types/bridge.json";
import { CctpBridge as CctpBridgeType } from "../../models/sol/types/cctp_bridge";
import * as cctpBridgeIdl from "../../models/sol/types/cctp_bridge.json";
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
import { addUnitLimitAndUnitPriceToTx } from "../../utils/sol/compute-budget";
import { SendParams, TxSwapParamsSol } from "../models";
import { getNonce, prepareTxSwapParams } from "../utils";
import { convertToVersionedTransaction, SolTxSendParams } from "./utils";

interface SwapAndBridgeSolData {
  bridge: Program<BridgeType>;
  amount: BN;
  vusdAmount: BN;
  nonce: number[];
  recipient: number[];
  receiveToken: number[];
  poolAccount: PublicKey;
  lockAccount: PublicKey;
  bridgeAuthority: PublicKey;
  userToken: PublicKey;
  bridgeTokenAccount: PublicKey;
  chainBridgeAccount: PublicKey;
  otherBridgeTokenAccount: PublicKey;
  userAccount: PublicKey;
  destinationChainId: number;
  mint: PublicKey;
  config: PublicKey;
  configAccountInfo: ConfigAccountInfo;
  gasPrice: PublicKey;
  thisGasPrice: PublicKey;
  message: Buffer;
  extraGasInstruction?: TransactionInstruction;
  provider: Provider;
}

interface ConfigAccountInfo {
  allbridgeMessengerProgramId: PublicKey;
  wormholeMessengerProgramId: PublicKey;
  gasOracleProgramId: PublicKey;
}

interface SwapAndBridgeSolDataCctpData {
  cctpBridge: Program<CctpBridgeType>;
  cctpBridgeAccount: PublicKey;
  cctpAddressAccount: PublicKey;
  amount: BN;
  recipient: number[];
  receiveToken: number[];
  userToken: PublicKey;
  bridgeAuthority: PublicKey;
  bridgeTokenAccount: PublicKey;
  chainBridgeAccount: PublicKey;
  userAccount: PublicKey;
  destinationChainId: number;
  mint: PublicKey;
  gasPrice: PublicKey;
  thisGasPrice: PublicKey;
  extraGasInstruction?: TransactionInstruction;
  provider: Provider;
}

export interface SolanaBridgeParams {
  wormholeMessengerProgramId: string;
  solanaLookUpTable: string;
  cctpParams: CctpParams;
}

const COMPUTE_UNIT_LIMIT = 1_000_000;

export class BridgeTxService {
  chainType: ChainType.SOLANA = ChainType.SOLANA;

  constructor(
    public solanaRpcUrl: string,
    public params: SolanaBridgeParams,
    public api: AllbridgeCoreClient
  ) {}

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
    const bridge = new Program<BridgeType>({ ...bridgeIdl, address: bridgeAddress }, provider);

    const bridgeAuthority = await getAuthorityAccount(bridge.programId);
    const configAccount = await getConfigAccount(bridge.programId);

    const sendMint = new PublicKey(tokenAddress);
    const sendBridgeToken = await getBridgeTokenAccount(sendMint, bridge.programId);
    const sendPool = new PublicKey(poolAddress);
    const sendUserToken = getAssociatedAccount(userAccount, sendMint);

    const receiverAccount = new PublicKey(receiverOriginal);
    const receiveMint = new PublicKey(receiveTokenAddress);
    const receiveBridgeToken = await getBridgeTokenAccount(receiveMint, bridge.programId);
    const receivePool = new PublicKey(receivePoolAddress);
    const receiveUserToken = getAssociatedAccount(receiverAccount, receiveMint);

    const preInstructions: TransactionInstruction[] = [
      web3.ComputeBudgetProgram.setComputeUnitLimit({
        units: COMPUTE_UNIT_LIMIT,
      }),
    ];

    try {
      await getTokenAccountData(receiveUserToken, provider);
    } catch (ignoreError) {
      const receiveUserToken = getAssociatedTokenAddressSync(receiveMint, receiverAccount);
      const createReceiveUserTokenInstruction = createAssociatedTokenAccountInstruction(
        userAccount,
        receiveUserToken,
        receiverAccount,
        receiveMint
      );
      preInstructions.push(createReceiveUserTokenInstruction);
    }
    const transaction = await bridge.methods
      .swap(new BN(amount), new BN(minimumReceiveAmount || 0))
      .accountsPartial({
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
    return await convertToVersionedTransaction(transaction, connection, this.params.solanaLookUpTable);
  }

  async buildRawTransactionSend(
    params: SendParams,
    solTxSendParams: SolTxSendParams
  ): Promise<{ tx: VersionedTransaction; requiredMessageSigner: Keypair | undefined }> {
    let swapAndBridgeTx: VersionedTransaction;
    let requiredMessageSigner: Keypair | undefined = undefined;
    switch (params.messenger) {
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
      case Messenger.CCTP:
      case Messenger.CCTP_V2: {
        const swapAndBridgeSolData = await this.prepareSwapAndBridgeCctpData(solTxSendParams);
        const { transaction, messageSentEventDataKeypair } = await this.buildSwapAndBridgeCctpTransaction(
          params.destinationToken.chainSymbol,
          swapAndBridgeSolData
        );
        swapAndBridgeTx = transaction;
        requiredMessageSigner = messageSentEventDataKeypair;
        break;
      }
      case Messenger.OFT:
        throw new OFTDoesNotSupportedError("Messenger OFT is not supported yet.");
      default: {
        return assertNever(params.messenger, "Unhandled Messenger type");
      }
    }
    return { tx: swapAndBridgeTx, requiredMessageSigner };
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
    const bridge = new Program<BridgeType>({ ...bridgeIdl, address: bridgeAddress }, provider);
    const nonce = Array.from(getNonce());
    const poolAccount = new PublicKey(poolAddress);
    const vUsdAmount = await getVUsdAmount(amount, bridge, poolAccount);

    const lockAccount = await getLockAccount(nonce, bridge.programId);
    const bridgeAuthority = await getAuthorityAccount(bridge.programId);
    const userToken = getAssociatedAccount(new PublicKey(account), new PublicKey(tokenAddress));
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
      .accountsPartial({
        payer: userAccount,
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
    return await convertToVersionedTransaction(transaction, connection, this.params.solanaLookUpTable);
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
      payer: userAccount,
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
    return {
      transaction: await convertToVersionedTransaction(transaction, provider.connection, this.params.solanaLookUpTable),
      messageAccount,
    };
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
    const cctpBridge: Program<CctpBridgeType> = new Program<CctpBridgeType>(
      { ...cctpBridgeIdl, address: cctpAddress },
      provider
    );
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
    swapAndBridgeData.userToken = getAssociatedAccount(userAccount, mint);
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
      .accountsPartial({
        mint: mint,
        user: userAccount,
        cctpBridge: cctpBridgeAccount,
        payer: userAccount,

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
    return {
      transaction: await convertToVersionedTransaction(tx, connection, this.params.solanaLookUpTable),
      messageSentEventDataKeypair,
    };
  }
}
