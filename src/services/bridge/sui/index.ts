import { SuiClient } from "@mysten/sui/client";
import { CoinStruct } from "@mysten/sui/src/client/types/generated";
import { coinWithBalance, Transaction, TransactionResult } from "@mysten/sui/transactions";
import { SUI_CLOCK_OBJECT_ID } from "@mysten/sui/utils";
import { Big } from "big.js";
import { AllbridgeCoreClient } from "../../../client/core-api/core-client-base";
import {
  ChainSymbol,
  ChainType,
  FeePaymentMethod,
  Messenger,
  RawSuiTransaction,
  SdkError,
  SwapParams,
  TransactionResponse,
} from "../../../models";
import { SuiAddresses } from "../../../tokens-info";
import { NodeRpcUrlsConfig } from "../../index";
import { setAddress } from "../../models/sui/bridge";
import { swap, swapAndBridge, swapAndBridgeWormhole } from "../../models/sui/bridge/bridge-interface/functions";
import { setAddress as setCctpAddress } from "../../models/sui/cctp-bridge";
import { bridge } from "../../models/sui/cctp-bridge/cctp-bridge-interface/functions";
import { setAddress as setUtilsAddress } from "../../models/sui/utils";
import { fromHex } from "../../models/sui/utils/bytes32/functions";
import { fetchAllPagesRecursive } from "../../utils/sui/paginated";
import { getCctpSolTokenRecipientAddress } from "../get-cctp-sol-token-recipient-address";
import { ChainBridgeService, SendParams, TxSendParamsSui, TxSwapParamsSui } from "../models";
import { getNonceBigInt, normalizeSuiHex, prepareTxSendParams, prepareTxSwapParams } from "../utils";

export class SuiBridgeService extends ChainBridgeService {
  chainType: ChainType.SUI = ChainType.SUI;
  chainSymbol: ChainSymbol.SUI = ChainSymbol.SUI;

  private readonly client: SuiClient;

  constructor(
    private nodeRpcUrlsConfig: NodeRpcUrlsConfig,
    public api: AllbridgeCoreClient
  ) {
    super();
    this.client = new SuiClient({
      url: nodeRpcUrlsConfig.getNodeRpcUrl(this.chainSymbol),
    });
  }

  send(): Promise<TransactionResponse> {
    throw new SdkError("Method send not implemented.");
  }

  async buildRawTransactionSwap(params: SwapParams): Promise<RawSuiTransaction> {
    const suiAddresses = params.sourceToken.suiAddresses;
    if (!suiAddresses) {
      throw new SdkError("SUI token must contain 'suiAddresses'");
    }
    setAddress(suiAddresses.bridgeAddress, suiAddresses.bridgeAddressOrigin);

    const txSwapParams = prepareTxSwapParams(this.chainType, params);
    return await this.buildRawTransactionSwapFromParams(txSwapParams, suiAddresses);
  }

  async buildRawTransactionSwapFromParams(
    params: TxSwapParamsSui,
    suiAddresses: SuiAddresses
  ): Promise<RawSuiTransaction> {
    const { amount, fromAccountAddress, fromTokenAddress, toTokenAddress, minimumReceiveAmount } = params;

    const tx = new Transaction();
    tx.setSender(fromAccountAddress);

    const args = {
      bridge: suiAddresses.bridgeObjectAddress,
      coin: coinWithBalance({ balance: BigInt(amount), type: fromTokenAddress }),
      receiveAmountMin: BigInt(minimumReceiveAmount),
    };
    const swapResult = swap(tx, [fromTokenAddress, toTokenAddress], args);

    const coins: CoinStruct[] = await fetchAllPagesRecursive((cursor: string | null | undefined) =>
      this.client.getCoins({
        owner: params.toAccountAddress,
        coinType: toTokenAddress,
        cursor,
      })
    );
    if (coins.length === 0 || !coins[0]) {
      tx.transferObjects([swapResult], params.toAccountAddress);
    } else {
      tx.mergeCoins(coins[0].coinObjectId, [swapResult]);
    }
    return await tx.toJSON({ client: this.client });
  }

  async buildRawTransactionSend(params: SendParams): Promise<RawSuiTransaction> {
    const txSendParams = await prepareTxSendParams(this.chainType, params, this.api);
    const { messenger } = txSendParams;

    const suiAddresses = params.sourceToken.suiAddresses;
    if (!suiAddresses) {
      throw new SdkError("SUI token must contain 'suiAddresses'");
    }
    setAddress(suiAddresses.bridgeAddress, suiAddresses.bridgeAddressOrigin);
    setUtilsAddress(suiAddresses.utilsAddress);

    switch (messenger) {
      case Messenger.ALLBRIDGE:
        return this.buildRawTransactionAllbridgeSend(txSendParams, suiAddresses);
      case Messenger.WORMHOLE:
        return this.buildRawTransactionWormholeSend(txSendParams, suiAddresses);
      case Messenger.CCTP:
        return this.buildRawTransactionCctpSend(params, txSendParams, suiAddresses);
    }
  }

  private async buildRawTransactionAllbridgeSend(
    txSendParams: TxSendParamsSui,
    suiAddresses: SuiAddresses
  ): Promise<RawSuiTransaction> {
    const {
      amount,
      fromAccountAddress,
      fromTokenAddress,
      toChainId,
      toAccountAddress,
      toTokenAddress,
      fee,
      gasFeePaymentMethod,
      extraGas,
    } = txSendParams;
    let totalFee = fee;
    if (extraGas) {
      totalFee = Big(totalFee).plus(extraGas).toFixed();
    }

    const tx = new Transaction();
    tx.setSender(fromAccountAddress);
    if (gasFeePaymentMethod === FeePaymentMethod.WITH_STABLECOIN) {
      const amountWithoutFee = BigInt(amount) - BigInt(totalFee);
      const args = {
        bridge: suiAddresses.bridgeObjectAddress,
        messenger: suiAddresses.allbridgeMessengerObjectAddress,
        amount: coinWithBalance({ balance: amountWithoutFee, type: fromTokenAddress }),
        destinationChainId: toChainId,
        nonce: getNonceBigInt(),
        recipient: fromHex(tx, normalizeSuiHex(toAccountAddress)),
        receiveToken: fromHex(tx, normalizeSuiHex(toTokenAddress)),
        gasOracle: suiAddresses.gasOracleObjectAddress,
        feeTokenCoin: coinWithBalance({ balance: BigInt(totalFee), type: fromTokenAddress }),
        feeSuiCoin: coinWithBalance({ balance: BigInt(0), useGasCoin: false }),
      };
      swapAndBridge(tx, fromTokenAddress, args);
    } else {
      const totalFeeCoin =
        totalFee === "0"
          ? coinWithBalance({ balance: BigInt(totalFee), useGasCoin: false })
          : coinWithBalance({ balance: BigInt(totalFee) });
      const args = {
        bridge: suiAddresses.bridgeObjectAddress,
        messenger: suiAddresses.allbridgeMessengerObjectAddress,
        amount: coinWithBalance({ balance: BigInt(amount), type: fromTokenAddress }),
        destinationChainId: toChainId,
        nonce: getNonceBigInt(),
        recipient: fromHex(tx, normalizeSuiHex(toAccountAddress)),
        receiveToken: fromHex(tx, normalizeSuiHex(toTokenAddress)),
        gasOracle: suiAddresses.gasOracleObjectAddress,
        feeTokenCoin: coinWithBalance({ balance: BigInt(0), type: fromTokenAddress }),
        feeSuiCoin: totalFeeCoin,
      };
      swapAndBridge(tx, fromTokenAddress, args);
    }
    return await tx.toJSON({ client: this.client });
  }

  private async buildRawTransactionWormholeSend(
    txSendParams: TxSendParamsSui,
    suiAddresses: SuiAddresses
  ): Promise<RawSuiTransaction> {
    const {
      amount,
      fromAccountAddress,
      fromTokenAddress,
      toChainId,
      toAccountAddress,
      toTokenAddress,
      fee,
      gasFeePaymentMethod,
      extraGas,
    } = txSendParams;
    let totalFee = fee;
    if (extraGas) {
      totalFee = Big(totalFee).plus(extraGas).toFixed();
    }

    const tx = new Transaction();
    tx.setSender(fromAccountAddress);
    if (gasFeePaymentMethod === FeePaymentMethod.WITH_STABLECOIN) {
      const amountWithoutFee = BigInt(amount) - BigInt(totalFee);
      const args = {
        bridge: suiAddresses.bridgeObjectAddress,
        messenger: suiAddresses.wormholeMessengerObjectAddress,
        wormholeState: suiAddresses.wormholeStateObjectAddress,
        theClock: SUI_CLOCK_OBJECT_ID,
        amount: coinWithBalance({ balance: amountWithoutFee, type: fromTokenAddress }),
        destinationChainId: toChainId,
        nonce: getNonceBigInt(),
        recipient: fromHex(tx, normalizeSuiHex(toAccountAddress)),
        receiveToken: fromHex(tx, normalizeSuiHex(toTokenAddress)),
        gasOracle: suiAddresses.gasOracleObjectAddress,
        feeTokenCoin: coinWithBalance({ balance: BigInt(totalFee), type: fromTokenAddress }),
        feeSuiCoin: coinWithBalance({ balance: BigInt(0), useGasCoin: false }),
      };
      swapAndBridgeWormhole(tx, fromTokenAddress, args);
    } else {
      const totalFeeCoin =
        totalFee === "0"
          ? coinWithBalance({ balance: BigInt(totalFee), useGasCoin: false })
          : coinWithBalance({ balance: BigInt(totalFee) });
      const args = {
        bridge: suiAddresses.bridgeObjectAddress,
        messenger: suiAddresses.wormholeMessengerObjectAddress,
        wormholeState: suiAddresses.wormholeStateObjectAddress,
        theClock: SUI_CLOCK_OBJECT_ID,
        amount: coinWithBalance({ balance: BigInt(amount), type: fromTokenAddress }),
        destinationChainId: toChainId,
        nonce: getNonceBigInt(),
        recipient: fromHex(tx, normalizeSuiHex(toAccountAddress)),
        receiveToken: fromHex(tx, normalizeSuiHex(toTokenAddress)),
        gasOracle: suiAddresses.gasOracleObjectAddress,
        feeTokenCoin: coinWithBalance({ balance: BigInt(0), type: fromTokenAddress }),
        feeSuiCoin: totalFeeCoin,
      };
      swapAndBridgeWormhole(tx, fromTokenAddress, args);
    }
    return await tx.toJSON({ client: this.client });
  }

  private async buildRawTransactionCctpSend(
    params: SendParams,
    txSendParams: TxSendParamsSui,
    suiAddresses: SuiAddresses
  ): Promise<RawSuiTransaction> {
    const {
      amount,
      fromAccountAddress,
      fromTokenAddress,
      toChainId,
      toAccountAddress,
      fee,
      gasFeePaymentMethod,
      extraGas,
    } = txSendParams;

    setCctpAddress(suiAddresses.cctpAddress, suiAddresses.cctpAddressOrigin);

    let totalFee = fee;
    if (extraGas) {
      totalFee = Big(totalFee).plus(extraGas).toFixed();
    }

    const tx = new Transaction();
    tx.setSender(fromAccountAddress);

    const recipientWalletAddress = fromHex(tx, normalizeSuiHex(toAccountAddress));
    let recipient: TransactionResult;
    if (params.destinationToken.chainType === ChainType.SOLANA) {
      const recipientStr = await getCctpSolTokenRecipientAddress(
        this.chainType,
        params.toAccountAddress,
        params.destinationToken.tokenAddress,
        this.nodeRpcUrlsConfig.getNodeRpcUrl(ChainSymbol.SOL)
      );
      recipient = fromHex(tx, normalizeSuiHex(recipientStr));
    } else {
      recipient = recipientWalletAddress;
    }

    if (gasFeePaymentMethod === FeePaymentMethod.WITH_STABLECOIN) {
      const amountWithoutFee = BigInt(amount) - BigInt(totalFee);
      const args = {
        cctpBridge: suiAddresses.cctpObjectAddress,
        tokenMessengerMinterState: suiAddresses.cctpTokenMessengerMinterStateObjectAddress,
        messageTransmitterState: suiAddresses.cctpMessageTransmitterStateObjectAddress,
        treasury: suiAddresses.cctpTreasuryObjectAddress,
        denyList: suiAddresses.cctpDenyListObjectAddress,
        amount: coinWithBalance({ balance: amountWithoutFee, type: fromTokenAddress }),
        destinationChainId: toChainId,
        recipient: recipient,
        recipientWalletAddress: recipientWalletAddress,
        gasOracle: suiAddresses.gasOracleObjectAddress,
        feeTokenCoin: coinWithBalance({ balance: BigInt(totalFee), type: fromTokenAddress }),
        feeSuiCoin: coinWithBalance({ balance: BigInt(0), useGasCoin: false }),
      };
      bridge(tx, fromTokenAddress, args);
    } else {
      const totalFeeCoin =
        totalFee === "0"
          ? coinWithBalance({ balance: BigInt(totalFee), useGasCoin: false })
          : coinWithBalance({ balance: BigInt(totalFee) });
      const args = {
        cctpBridge: suiAddresses.cctpObjectAddress,
        tokenMessengerMinterState: suiAddresses.cctpTokenMessengerMinterStateObjectAddress,
        messageTransmitterState: suiAddresses.cctpMessageTransmitterStateObjectAddress,
        treasury: suiAddresses.cctpTreasuryObjectAddress,
        denyList: suiAddresses.cctpDenyListObjectAddress,
        amount: coinWithBalance({ balance: BigInt(amount), type: fromTokenAddress }),
        destinationChainId: toChainId,
        recipient: recipient,
        recipientWalletAddress: recipientWalletAddress,
        gasOracle: suiAddresses.gasOracleObjectAddress,
        feeTokenCoin: coinWithBalance({ balance: BigInt(0), type: fromTokenAddress }),
        feeSuiCoin: totalFeeCoin,
      };
      bridge(tx, fromTokenAddress, args);
    }
    return await tx.toJSON({ client: this.client });
  }
}
