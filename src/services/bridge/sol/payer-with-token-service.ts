import { BN, Program, Provider, web3 } from "@coral-xyz/anchor";
import { Keypair, PublicKey, SystemProgram, TransactionInstruction, VersionedTransaction } from "@solana/web3.js";
import { ChainType } from "../../../chains/chain.enums";
import { Messenger } from "../../../client/core-api/core-api.model";
import { AllbridgeCoreClient } from "../../../client/core-api/core-client-base";
import {
  CCTPDoesNotSupportedError,
  InvalidGasFeePaymentOptionError,
  OFTDoesNotSupportedError,
  SdkError,
} from "../../../exceptions";
import { assertNever } from "../../../utils/utils";
import { Bridge as BridgeType } from "../../models/sol/types/bridge";
import * as bridgeIdl from "../../models/sol/types/bridge.json";
import { CctpBridge as CctpBridgeType } from "../../models/sol/types/cctp_bridge";
import * as cctpBridgeIdl from "../../models/sol/types/cctp_bridge.json";
import { PayerWithToken as PayerWithTokenType } from "../../models/sol/types/payer_with_token";
import * as payerWithTokenIdl from "../../models/sol/types/payer_with_token.json";
import { getMessage, getVUsdAmount } from "../../utils/sol";
import {
  getAssociatedAccount,
  getAuthorityAccount,
  getBridgeTokenAccount,
  getCctpAccounts,
  getCctpAuthorityAccount,
  getCctpBridgeAccount,
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
import { SendParams } from "../models";
import { getNonce } from "../utils";
import { SolanaBridgeParams } from "./bridge-tx-service";
import { convertToVersionedTransaction, SolTxSendParams } from "./utils";

type BridgeConfigInfo = Awaited<ReturnType<Program<BridgeType>["account"]["config"]["fetch"]>>;

interface SwapAndBridgeBaseData {
  provider: Provider;
  payerProgram: Program<PayerWithTokenType>;
  bridgeProgram: Program<BridgeType>;
  userAccount: PublicKey;

  recipient: number[];
  recipientChain: number;
  recipientToken: number[];
  maxFeeAmount: BN;
  extraGasAmountInFeeToken: BN;

  mintAccount: PublicKey;
  feeTokenMintAccount: PublicKey;
  userTokenAccount: PublicKey;
  userFeeTokenAccount: PublicKey;
  gasPriceAccount: PublicKey;
  thisGasPriceAccount: PublicKey;

  poolAccount: PublicKey;
  bridgeConfigAccount: PublicKey;
  bridgeConfigInfo: BridgeConfigInfo;
}

interface SwapAndBridgeCommonData extends SwapAndBridgeBaseData {
  vusdAmount: BN;
  nonce: number[];
  lockAccount: PublicKey;
  chainBridgeAccount: PublicKey;
  bridgeProgramId: PublicKey;
  bridgeAuthorityAccount: PublicKey;
  bridgeTokenAccount: PublicKey;
  otherBridgeTokenAccount: PublicKey;
}

interface SwapAndBridgeAllbridgeData extends SwapAndBridgeCommonData {
  sentMessageAccount: PublicKey;
  messengerProgramId: PublicKey;
  messengerConfigAccount: PublicKey;
  messengerGasUsageAccount: PublicKey;
}

interface SwapAndBridgeWormholeData extends SwapAndBridgeCommonData {
  wormholeMessengerAccount: PublicKey;
  wormholeMessengerConfigAccount: PublicKey;
  wormholeProgramId: string;
  sequenceAccount: PublicKey;
  feeCollectorAccount: PublicKey;
  messengerGasUsageAccount: PublicKey;
  wormholeBridgeAccount: PublicKey;

  messageAccount: Keypair;
  feeInstruction: TransactionInstruction;
}

interface BridgeCctpData extends SwapAndBridgeBaseData {
  amount: BN;
  lockAccount: PublicKey;

  chainBridgeAccount: PublicKey;
  cctpBridgeProgramId: PublicKey;
  cctpBridgeAuthorityAccount: PublicKey;
  cctpBridgeTokenAccount: PublicKey;
  cctpBridgeConfigAccount: PublicKey;
  cctpTokenMessengerMinter: PublicKey;
  cctpTransmitterProgramId: PublicKey;
  messageTransmitterAccount: PublicKey;
  tokenMessenger: PublicKey;
  tokenMessengerEventAuthority: PublicKey;
  tokenMinter: PublicKey;
  localToken: PublicKey;
  remoteTokenMessengerKey: PublicKey;
  authorityPda: PublicKey;

  messageSentEventDataKeypair: Keypair;
}

const COMPUTE_UNIT_LIMIT = 1_000_000;

export class PayerWithTokenService {
  chainType: ChainType.SOLANA = ChainType.SOLANA;

  constructor(
    public solanaRpcUrl: string,
    public params: SolanaBridgeParams,
    public api: AllbridgeCoreClient
  ) {}

  async buildRawTransactionSend(
    params: SendParams,
    solTxSendParams: SolTxSendParams
  ): Promise<{ tx: VersionedTransaction; requiredMessageSigner?: Keypair }> {
    switch (params.messenger) {
      case Messenger.ALLBRIDGE: {
        const swapAndBridgeData = await this.prepareSwapAndBridgeAllbridgeData(params, solTxSendParams);
        const tx = await this.buildSwapAndBridgeTx(swapAndBridgeData);
        return { tx };
      }
      case Messenger.WORMHOLE: {
        const swapAndBridgeData = await this.prepareSwapAndBridgeWormholeData(params, solTxSendParams);
        return await this.buildSwapAndBridgeWormholeTx(swapAndBridgeData);
      }
      case Messenger.CCTP:
      case Messenger.CCTP_V2: {
        const bridgeCctpData = await this.prepareBridgeCctpData(params, solTxSendParams);
        return this.buildBridgeCctpTx(bridgeCctpData);
      }
      case Messenger.OFT:
        throw new OFTDoesNotSupportedError("Messenger OFT is not supported yet.");
      default: {
        return assertNever(params.messenger, "Unhandled Messenger type");
      }
    }
  }

  private async prepareSwapAndBridgeBaseData(
    params: SendParams,
    solTxSendParams: SolTxSendParams
  ): Promise<SwapAndBridgeBaseData> {
    const {
      fromChainId,
      fromAccountAddress,
      fromTokenAddress,
      poolAddress,
      toAccountAddress,
      toTokenAddress,
      toChainId,
      fee,
      extraGas = "0",
    } = solTxSendParams;

    const userAccount = new PublicKey(fromAccountAddress);
    const recipient = Array.from(toAccountAddress);
    const recipientToken = Array.from(toTokenAddress);
    const maxFeeAmount = new BN(fee);
    const extraGasAmountInFeeToken = new BN(extraGas);

    const provider = buildAnchorProvider(this.solanaRpcUrl, fromAccountAddress);
    const payerProgram = this.getPayerProgram(params, provider);
    const bridgeProgram = new Program<BridgeType>(
      { ...bridgeIdl, address: params.sourceToken.bridgeAddress },
      provider
    );
    const poolAccount = new PublicKey(poolAddress);

    const bridgeConfigAccount = await getConfigAccount(bridgeProgram.programId);
    const bridgeConfigInfo = await bridgeProgram.account.config.fetch(bridgeConfigAccount);

    const mintAccount = new PublicKey(fromTokenAddress);
    const feeTokenMintAccount = new PublicKey(this.getAbrFeeTokenMintAddress(params));
    const userTokenAccount = getAssociatedAccount(userAccount, mintAccount);
    const userFeeTokenAccount = getAssociatedAccount(userAccount, feeTokenMintAccount);

    const gasPriceAccount = await getPriceAccount(toChainId, bridgeConfigInfo.gasOracleProgramId);
    const thisGasPriceAccount = await getPriceAccount(fromChainId, bridgeConfigInfo.gasOracleProgramId);

    return {
      provider,
      payerProgram,
      bridgeProgram,
      userAccount,

      recipient,
      recipientToken,
      recipientChain: toChainId,
      maxFeeAmount,
      extraGasAmountInFeeToken,

      mintAccount,
      feeTokenMintAccount,
      userTokenAccount,
      userFeeTokenAccount,
      gasPriceAccount,
      thisGasPriceAccount,

      poolAccount,
      bridgeConfigAccount,
      bridgeConfigInfo,
    };
  }

  private getComputeUnitLimitInstruction(): TransactionInstruction {
    return web3.ComputeBudgetProgram.setComputeUnitLimit({ units: COMPUTE_UNIT_LIMIT });
  }

  private getPayerProgram(params: SendParams, provider: Provider): Program<PayerWithTokenType> {
    const payerAddress = params.sourceToken.abrPayer?.payerAddress;
    if (!payerAddress) {
      throw new InvalidGasFeePaymentOptionError("Payer with token not supported yet for ABR tokens");
    }
    return new Program<PayerWithTokenType>({ ...payerWithTokenIdl, address: payerAddress }, provider);
  }

  private getAbrFeeTokenMintAddress(params: SendParams): string {
    const abrTokenAddress = params.sourceToken.abrPayer?.abrToken.tokenAddress;
    if (!abrTokenAddress) {
      throw new InvalidGasFeePaymentOptionError("Payer with token not supported yet for ABR tokens");
    }
    return abrTokenAddress;
  }

  private async prepareSwapAndBridgeCommonData(
    baseData: SwapAndBridgeBaseData,
    solTxSendParams: SolTxSendParams
  ): Promise<SwapAndBridgeCommonData> {
    const { amount, toChainId, toTokenAddress } = solTxSendParams;
    const { bridgeProgram, poolAccount, mintAccount } = baseData;

    const vUsdAmount = await getVUsdAmount(amount, bridgeProgram, poolAccount);

    const nonce = Array.from(getNonce());
    const lockAccount = await getLockAccount(nonce, bridgeProgram.programId);
    const bridgeProgramId = bridgeProgram.programId;
    const chainBridgeAccount = await getChainBridgeAccount(toChainId, bridgeProgramId);
    const bridgeAuthorityAccount = await getAuthorityAccount(bridgeProgramId);
    const bridgeTokenAccount = await getBridgeTokenAccount(mintAccount, bridgeProgramId);
    const otherBridgeTokenAccount = await getOtherChainTokenAccount(
      toChainId,
      Buffer.from(toTokenAddress),
      bridgeProgramId
    );

    return {
      ...baseData,
      vusdAmount: new BN(vUsdAmount),
      nonce,
      lockAccount,
      chainBridgeAccount,
      bridgeProgramId,
      bridgeAuthorityAccount,
      bridgeTokenAccount,
      otherBridgeTokenAccount,
    };
  }

  private getWormholeProgramAddresses(
    wormholeProgramId: string,
    bridgeAuthorityAccount: PublicKey
  ): {
    wormholeBridgeAccount: PublicKey;
    wormholeSequenceAccount: PublicKey;
    wormholeFeeCollectorAccount: PublicKey;
  } {
    const programId = new PublicKey(wormholeProgramId);
    const [wormholeBridgeAccount] = PublicKey.findProgramAddressSync([Buffer.from("Bridge")], programId);
    const [wormholeSequenceAccount] = PublicKey.findProgramAddressSync(
      [Buffer.from("Sequence"), bridgeAuthorityAccount.toBuffer()],
      programId
    );
    const [wormholeFeeCollectorAccount] = PublicKey.findProgramAddressSync([Buffer.from("fee_collector")], programId);

    return {
      wormholeBridgeAccount,
      wormholeSequenceAccount,
      wormholeFeeCollectorAccount,
    };
  }

  private async getWormholeFeeInstruction(
    provider: Provider,
    wormholeBridgeAccount: PublicKey,
    userAccount: PublicKey,
    wormholeFeeCollectorAccount: PublicKey
  ): Promise<TransactionInstruction> {
    const bridgeAccountInfo = await provider.connection.getAccountInfo(wormholeBridgeAccount);
    if (bridgeAccountInfo == null) {
      throw new SdkError("Cannot fetch wormhole bridge account info");
    }

    const feeLamports = new BN(bridgeAccountInfo.data.slice(16, 24), "le").toString();
    return SystemProgram.transfer({
      fromPubkey: userAccount,
      toPubkey: wormholeFeeCollectorAccount,
      lamports: +feeLamports,
    });
  }
  private async prepareSwapAndBridgeAllbridgeData(
    params: SendParams,
    solTxSendParams: SolTxSendParams
  ): Promise<SwapAndBridgeAllbridgeData> {
    const baseData = await this.prepareSwapAndBridgeBaseData(params, solTxSendParams);
    const commonData = await this.prepareSwapAndBridgeCommonData(baseData, solTxSendParams);

    const { recipient, recipientToken, recipientChain, bridgeConfigInfo } = baseData;
    const { vusdAmount, nonce, bridgeAuthorityAccount } = commonData;
    const { fromChainId, toChainId } = solTxSendParams;

    const message = getMessage({
      amount: vusdAmount.toString(),
      recipient: Buffer.from(recipient),
      nonce: Buffer.from(nonce),
      receiveToken: Buffer.from(recipientToken),
      destinationChainId: recipientChain,
      sourceChainId: fromChainId,
      chainBridge: bridgeAuthorityAccount.toBuffer(),
    });

    const messengerProgramId = bridgeConfigInfo.allbridgeMessengerProgramId;
    const sentMessageAccount = await getSendMessageAccount(message, messengerProgramId);
    const messengerConfigAccount = await getConfigAccount(messengerProgramId);
    const messengerGasUsageAccount = await getGasUsageAccount(toChainId, messengerProgramId);

    return {
      ...commonData,
      sentMessageAccount,
      messengerProgramId,
      messengerConfigAccount,
      messengerGasUsageAccount,
    };
  }

  private async prepareSwapAndBridgeWormholeData(
    params: SendParams,
    solTxSendParams: SolTxSendParams
  ): Promise<SwapAndBridgeWormholeData> {
    const baseData = await this.prepareSwapAndBridgeBaseData(params, solTxSendParams);
    const commonData = await this.prepareSwapAndBridgeCommonData(baseData, solTxSendParams);

    const { provider, userAccount, bridgeConfigInfo } = baseData;
    const { bridgeAuthorityAccount } = commonData;
    const { toChainId } = solTxSendParams;

    const wormholeMessengerAccount = bridgeConfigInfo.wormholeMessengerProgramId;
    const wormholeMessengerConfigAccount = await getConfigAccount(wormholeMessengerAccount);
    const messengerGasUsageAccount = await getGasUsageAccount(toChainId, wormholeMessengerAccount);

    const wormholeProgramId = this.params.wormholeMessengerProgramId;
    const { wormholeBridgeAccount, wormholeSequenceAccount, wormholeFeeCollectorAccount } =
      this.getWormholeProgramAddresses(wormholeProgramId, bridgeAuthorityAccount);

    const messageAccount = Keypair.generate();
    const feeInstruction = await this.getWormholeFeeInstruction(
      provider,
      wormholeBridgeAccount,
      userAccount,
      wormholeFeeCollectorAccount
    );

    return {
      ...commonData,
      wormholeMessengerAccount,
      wormholeMessengerConfigAccount,
      wormholeProgramId,
      sequenceAccount: wormholeSequenceAccount,
      feeCollectorAccount: wormholeFeeCollectorAccount,
      messengerGasUsageAccount,
      messageAccount,
      wormholeBridgeAccount,
      feeInstruction,
    };
  }

  private async prepareBridgeCctpData(params: SendParams, solTxSendParams: SolTxSendParams): Promise<BridgeCctpData> {
    const baseData = await this.prepareSwapAndBridgeBaseData(params, solTxSendParams);

    const { mintAccount, provider } = baseData;
    const { amount, toChainId } = solTxSendParams;

    const cctpAddress = params.sourceToken.cctpAddress;
    if (!cctpAddress) {
      throw new CCTPDoesNotSupportedError("Such route does not support CCTP protocol");
    }

    const cctpBridge: Program<CctpBridgeType> = new Program<CctpBridgeType>(
      { ...cctpBridgeIdl, address: cctpAddress },
      provider
    );
    const chainBridgeAccount = await getChainBridgeAccount(toChainId, cctpBridge.programId);
    const cctpBridgeProgramId = cctpBridge.programId;
    const cctpBridgeConfigAccount = await getCctpBridgeAccount(mintAccount, cctpBridge.programId);

    const cctpBridgeAuthorityAccount = await getCctpAuthorityAccount(cctpBridgeConfigAccount, cctpBridge.programId);
    const cctpBridgeTokenAccount = await getBridgeTokenAccount(mintAccount, cctpBridge.programId);

    const destinationChainSymbol = params.destinationToken.chainSymbol;
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
    } = getCctpAccounts(domain, mintAccount, cctpTransmitterProgramId, cctpTokenMessengerMinter);

    const messageSentEventDataKeypair = Keypair.generate();
    const lockAccount = getCctpLockAccount(cctpBridge.programId, messageSentEventDataKeypair.publicKey);

    return {
      ...baseData,
      lockAccount,
      messageSentEventDataKeypair,

      amount: new BN(amount),
      chainBridgeAccount,
      cctpBridgeProgramId,
      cctpBridgeAuthorityAccount,
      cctpBridgeConfigAccount,
      cctpBridgeTokenAccount,
      cctpTokenMessengerMinter,
      cctpTransmitterProgramId,
      messageTransmitterAccount,
      tokenMessenger,
      tokenMessengerEventAuthority,
      tokenMinter,
      localToken,
      remoteTokenMessengerKey,
      authorityPda,
    };
  }

  private async buildSwapAndBridgeTx(
    swapAndBridgeAllbridgeData: SwapAndBridgeAllbridgeData
  ): Promise<VersionedTransaction> {
    const {
      provider,
      payerProgram,
      userAccount,
      vusdAmount,
      recipient,
      recipientChain,
      recipientToken,
      maxFeeAmount,
      extraGasAmountInFeeToken,
      nonce,

      lockAccount,
      chainBridgeAccount,
      bridgeProgramId,
      bridgeAuthorityAccount,
      bridgeTokenAccount,
      mintAccount,
      feeTokenMintAccount,
      userTokenAccount,
      userFeeTokenAccount,
      gasPriceAccount,
      thisGasPriceAccount,

      sentMessageAccount,
      messengerProgramId,
      messengerConfigAccount,
      messengerGasUsageAccount,
      bridgeConfigAccount,
      otherBridgeTokenAccount,
      poolAccount,
    } = swapAndBridgeAllbridgeData;

    const transaction = await payerProgram.methods
      .swapAndBridge({
        vusdAmount,
        recipient,
        recipientToken,
        maxFeeAmount,
        extraGasAmountInFeeToken,
        nonce,
        destinationChainId: recipientChain,
      })
      .accountsPartial({
        lock: lockAccount,
        chainBridge: chainBridgeAccount,
        bridge: bridgeProgramId,
        bridgeAuthority: bridgeAuthorityAccount,
        bridgeToken: bridgeTokenAccount,
        mint: mintAccount,
        feeTokenMint: feeTokenMintAccount,
        userTokenAccount,
        userFeeTokenAccount,
        gasPrice: gasPriceAccount,
        thisGasPrice: thisGasPriceAccount,
        sentMessageAccount,
        messenger: messengerProgramId,
        messengerConfig: messengerConfigAccount,
        messengerGasUsage: messengerGasUsageAccount,
        bridgeConfig: bridgeConfigAccount,
        otherBridgeToken: otherBridgeTokenAccount,
        pool: poolAccount,
      })
      .preInstructions([this.getComputeUnitLimitInstruction()])
      .transaction();

    return await this.finalizeTransaction(transaction, provider, userAccount);
  }

  private async buildSwapAndBridgeWormholeTx(
    swapAndBridgeWormholeData: SwapAndBridgeWormholeData
  ): Promise<{ tx: VersionedTransaction; requiredMessageSigner: Keypair }> {
    const {
      provider,
      payerProgram,
      userAccount,
      vusdAmount,
      recipient,
      recipientChain,
      recipientToken,
      maxFeeAmount,
      extraGasAmountInFeeToken,
      nonce,

      lockAccount,
      chainBridgeAccount,
      bridgeProgramId,
      bridgeAuthorityAccount,
      bridgeTokenAccount,
      mintAccount,
      feeTokenMintAccount,
      userTokenAccount,
      userFeeTokenAccount,
      gasPriceAccount,
      thisGasPriceAccount,

      messengerGasUsageAccount,
      bridgeConfigAccount,
      otherBridgeTokenAccount,
      poolAccount,

      wormholeMessengerAccount,
      wormholeMessengerConfigAccount,
      wormholeProgramId,
      sequenceAccount,
      feeCollectorAccount,
      messageAccount,
      wormholeBridgeAccount,

      feeInstruction,
    } = swapAndBridgeWormholeData;

    const transaction = await payerProgram.methods
      .swapAndBridgeWormhole({
        vusdAmount,
        recipient,
        recipientToken,
        maxFeeAmount,
        extraGasAmountInFeeToken,
        nonce,
        destinationChainId: recipientChain,
      })
      .accounts({
        lock: lockAccount,
        chainBridge: chainBridgeAccount,
        bridge: bridgeProgramId,
        bridgeAuthority: bridgeAuthorityAccount,
        bridgeToken: bridgeTokenAccount,
        mint: mintAccount,
        feeTokenMint: feeTokenMintAccount,
        userTokenAccount,
        userFeeTokenAccount,
        gasPrice: gasPriceAccount,
        thisGasPrice: thisGasPriceAccount,
        messengerGasUsage: messengerGasUsageAccount,
        bridgeConfig: bridgeConfigAccount,
        otherBridgeToken: otherBridgeTokenAccount,
        pool: poolAccount,
        wormholeMessenger: wormholeMessengerAccount,
        wormholeMessengerConfig: wormholeMessengerConfigAccount,
        wormholeProgram: wormholeProgramId,
        sequence: sequenceAccount,
        feeCollector: feeCollectorAccount,
        message: messageAccount.publicKey,
        wormholeBridge: wormholeBridgeAccount,
        // user: user.publicKey,
      })
      .preInstructions([this.getComputeUnitLimitInstruction(), feeInstruction])
      .signers([messageAccount])
      .transaction();

    return {
      tx: await this.finalizeTransaction(transaction, provider, userAccount),
      requiredMessageSigner: messageAccount,
    };
  }

  private async buildBridgeCctpTx(
    bridgeCctpData: BridgeCctpData
  ): Promise<{ tx: VersionedTransaction; requiredMessageSigner: Keypair }> {
    const {
      provider,
      payerProgram,

      amount,
      recipient,
      recipientToken,

      userAccount,
      recipientChain,
      maxFeeAmount,
      extraGasAmountInFeeToken,

      lockAccount,
      mintAccount,
      feeTokenMintAccount,
      userTokenAccount,
      userFeeTokenAccount,
      gasPriceAccount,
      thisGasPriceAccount,

      chainBridgeAccount,
      cctpBridgeProgramId,
      cctpBridgeAuthorityAccount,
      cctpBridgeConfigAccount,
      cctpBridgeTokenAccount,
      cctpTokenMessengerMinter,
      cctpTransmitterProgramId,
      messageTransmitterAccount,
      tokenMessenger,
      tokenMessengerEventAuthority,
      tokenMinter,
      localToken,
      remoteTokenMessengerKey,
      authorityPda,

      messageSentEventDataKeypair,
    } = bridgeCctpData;

    const transaction = await payerProgram.methods
      .bridgeCctp({
        amount,
        recipient,
        receiveToken: recipientToken,
        destinationChainId: recipientChain,
        maxFeeAmount,
        extraGasAmountInFeeToken,
      })
      .accounts({
        lock: lockAccount,
        messageSentEventData: messageSentEventDataKeypair.publicKey,
        mint: mintAccount,
        feeTokenMint: feeTokenMintAccount,
        userFeeTokenAccount,
        bridgeToken: cctpBridgeTokenAccount,
        cctpBridge: cctpBridgeProgramId,
        cctpBridgeConfig: cctpBridgeConfigAccount,
        cctpMessenger: cctpTokenMessengerMinter,
        messageTransmitterProgram: cctpTransmitterProgramId,
        messageTransmitterAccount: messageTransmitterAccount,
        tokenMessenger,
        tokenMinter,
        localToken,
        remoteTokenMessengerKey,
        authorityPda,
        eventAuthority: tokenMessengerEventAuthority,
        gasPrice: gasPriceAccount,
        thisGasPrice: thisGasPriceAccount,
        chainBridge: chainBridgeAccount,
        bridgeAuthority: cctpBridgeAuthorityAccount,
        userTokenAccount,
      })
      .preInstructions([this.getComputeUnitLimitInstruction()])
      .transaction();

    return {
      tx: await this.finalizeTransaction(transaction, provider, userAccount),
      requiredMessageSigner: messageSentEventDataKeypair,
    };
  }

  private async finalizeTransaction(
    transaction: web3.Transaction,
    provider: Provider,
    userAccount: PublicKey
  ): Promise<VersionedTransaction> {
    const connection = provider.connection;
    transaction.recentBlockhash = (await connection.getLatestBlockhash()).blockhash;
    transaction.feePayer = userAccount;
    return await convertToVersionedTransaction(transaction, connection, this.params.solanaLookUpTable);
  }
}
