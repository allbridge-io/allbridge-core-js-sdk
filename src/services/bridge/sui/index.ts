import { CoinStruct, SuiClient } from "@mysten/sui/client";
import { coinWithBalance, Transaction, TransactionResult } from "@mysten/sui/transactions";
import { SUI_CLOCK_OBJECT_ID } from "@mysten/sui/utils";
import { Big } from "big.js";
import { AllbridgeCoreClient } from "../../../client/core-api/core-client-base";
import {
  ChainSymbol,
  ChainType,
  FeePaymentMethod,
  Messenger,
  OFTDoesNotSupportedError,
  RawSuiTransaction,
  SdkError,
  SwapParams,
  TransactionResponse,
} from "../../../models";
import { SuiAddresses } from "../../../tokens-info";
import { assertNever } from "../../../utils/utils";
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

  private async buildRawTransactionSwapFromParams(
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

  async buildRawTransactionSendFromCustomTx(
    baseTx: string | Uint8Array | Transaction,
    inputCoin: TransactionResult,
    params: SendParams
  ): Promise<RawSuiTransaction> {
    const transaction = Transaction.from(baseTx);
    return this.buildRawTransactionSendFromTx(params, transaction, inputCoin);
  }

  async buildRawTransactionSend(params: SendParams): Promise<RawSuiTransaction> {
    return this.buildRawTransactionSendFromTx(params, new Transaction());
  }

  private async buildRawTransactionSendFromTx(
    params: SendParams,
    tx: Transaction,
    inputCoin?: TransactionResult
  ): Promise<RawSuiTransaction> {
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
        return this.buildRawTransactionAllbridgeSend(txSendParams, suiAddresses, tx, inputCoin);
      case Messenger.WORMHOLE:
        return this.buildRawTransactionWormholeSend(txSendParams, suiAddresses, tx, inputCoin);
      case Messenger.CCTP:
      case Messenger.CCTP_V2:
        return this.buildRawTransactionCctpSend(params, txSendParams, suiAddresses, tx, inputCoin);
      case Messenger.OFT:
        throw new OFTDoesNotSupportedError("Messenger OFT is not supported yet.");
    }
  }

  private async buildRawTransactionAllbridgeSend(
    txSendParams: TxSendParamsSui,
    suiAddresses: SuiAddresses,
    tx: Transaction,
    inputCoin?: TransactionResult
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

    tx.setSender(fromAccountAddress);

    switch (gasFeePaymentMethod) {
      case FeePaymentMethod.WITH_NATIVE_CURRENCY: {
        const totalFeeCoin =
          totalFee === "0"
            ? coinWithBalance({ balance: BigInt(totalFee), useGasCoin: false })
            : coinWithBalance({ balance: BigInt(totalFee) });
        const args = {
          bridge: suiAddresses.bridgeObjectAddress,
          messenger: suiAddresses.allbridgeMessengerObjectAddress,
          amount: inputCoin ?? coinWithBalance({ balance: BigInt(amount), type: fromTokenAddress }),
          destinationChainId: toChainId,
          nonce: getNonceBigInt(),
          recipient: fromHex(tx, normalizeSuiHex(toAccountAddress)),
          receiveToken: fromHex(tx, normalizeSuiHex(toTokenAddress)),
          gasOracle: suiAddresses.gasOracleObjectAddress,
          feeTokenCoin: coinWithBalance({ balance: BigInt(0), type: fromTokenAddress }),
          feeSuiCoin: totalFeeCoin,
        };
        swapAndBridge(tx, fromTokenAddress, args);
        break;
      }
      case FeePaymentMethod.WITH_STABLECOIN: {
        const amountWithoutFee = BigInt(amount) - BigInt(totalFee);

        let amountCoin, feeTokenCoin;
        if (inputCoin) {
          const [feeTokenCoinS] = tx.splitCoins(inputCoin, [totalFee]);
          amountCoin = inputCoin;
          feeTokenCoin = feeTokenCoinS;
        } else {
          amountCoin = coinWithBalance({ balance: amountWithoutFee, type: fromTokenAddress });
          feeTokenCoin = coinWithBalance({ balance: BigInt(totalFee), type: fromTokenAddress });
        }

        const args = {
          bridge: suiAddresses.bridgeObjectAddress,
          messenger: suiAddresses.allbridgeMessengerObjectAddress,
          amount: amountCoin,
          destinationChainId: toChainId,
          nonce: getNonceBigInt(),
          recipient: fromHex(tx, normalizeSuiHex(toAccountAddress)),
          receiveToken: fromHex(tx, normalizeSuiHex(toTokenAddress)),
          gasOracle: suiAddresses.gasOracleObjectAddress,
          feeTokenCoin: feeTokenCoin,
          feeSuiCoin: coinWithBalance({ balance: BigInt(0), useGasCoin: false }),
        };
        swapAndBridge(tx, fromTokenAddress, args);
        break;
      }
      case FeePaymentMethod.WITH_ABR:
        throw new SdkError("SUI bridge does not support ARB0 payment method");
      default: {
        return assertNever(gasFeePaymentMethod, "Unhandled FeePaymentMethod");
      }
    }

    return await tx.toJSON({ client: this.client });
  }

  private async buildRawTransactionWormholeSend(
    txSendParams: TxSendParamsSui,
    suiAddresses: SuiAddresses,
    tx: Transaction,
    inputCoin?: TransactionResult
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

    tx.setSender(fromAccountAddress);

    switch (gasFeePaymentMethod) {
      case FeePaymentMethod.WITH_NATIVE_CURRENCY: {
        const totalFeeCoin =
          totalFee === "0"
            ? coinWithBalance({ balance: BigInt(totalFee), useGasCoin: false })
            : coinWithBalance({ balance: BigInt(totalFee) });
        const args = {
          bridge: suiAddresses.bridgeObjectAddress,
          messenger: suiAddresses.wormholeMessengerObjectAddress,
          wormholeState: suiAddresses.wormholeStateObjectAddress,
          theClock: SUI_CLOCK_OBJECT_ID,
          amount: inputCoin ?? coinWithBalance({ balance: BigInt(amount), type: fromTokenAddress }),
          destinationChainId: toChainId,
          nonce: getNonceBigInt(),
          recipient: fromHex(tx, normalizeSuiHex(toAccountAddress)),
          receiveToken: fromHex(tx, normalizeSuiHex(toTokenAddress)),
          gasOracle: suiAddresses.gasOracleObjectAddress,
          feeTokenCoin: coinWithBalance({ balance: BigInt(0), type: fromTokenAddress }),
          feeSuiCoin: totalFeeCoin,
        };
        swapAndBridgeWormhole(tx, fromTokenAddress, args);
        break;
      }
      case FeePaymentMethod.WITH_STABLECOIN: {
        const amountWithoutFee = BigInt(amount) - BigInt(totalFee);

        let amountCoin, feeTokenCoin;
        if (inputCoin) {
          const [feeTokenCoinS] = tx.splitCoins(inputCoin, [totalFee]);
          amountCoin = inputCoin;
          feeTokenCoin = feeTokenCoinS;
        } else {
          amountCoin = coinWithBalance({ balance: amountWithoutFee, type: fromTokenAddress });
          feeTokenCoin = coinWithBalance({ balance: BigInt(totalFee), type: fromTokenAddress });
        }

        const args = {
          bridge: suiAddresses.bridgeObjectAddress,
          messenger: suiAddresses.wormholeMessengerObjectAddress,
          wormholeState: suiAddresses.wormholeStateObjectAddress,
          theClock: SUI_CLOCK_OBJECT_ID,
          amount: amountCoin,
          destinationChainId: toChainId,
          nonce: getNonceBigInt(),
          recipient: fromHex(tx, normalizeSuiHex(toAccountAddress)),
          receiveToken: fromHex(tx, normalizeSuiHex(toTokenAddress)),
          gasOracle: suiAddresses.gasOracleObjectAddress,
          feeTokenCoin: feeTokenCoin,
          feeSuiCoin: coinWithBalance({ balance: BigInt(0), useGasCoin: false }),
        };
        swapAndBridgeWormhole(tx, fromTokenAddress, args);
        break;
      }
      case FeePaymentMethod.WITH_ABR:
        throw new SdkError("SUI bridge does not support ARB0 payment method");
      default: {
        return assertNever(gasFeePaymentMethod, "Unhandled FeePaymentMethod");
      }
    }
    return await tx.toJSON({ client: this.client });
  }

  private async buildRawTransactionCctpSend(
    params: SendParams,
    txSendParams: TxSendParamsSui,
    suiAddresses: SuiAddresses,
    tx: Transaction,
    inputCoin?: TransactionResult
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

    switch (gasFeePaymentMethod) {
      case FeePaymentMethod.WITH_NATIVE_CURRENCY: {
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
          amount: inputCoin ?? coinWithBalance({ balance: BigInt(amount), type: fromTokenAddress }),
          destinationChainId: toChainId,
          recipient: recipient,
          recipientWalletAddress: recipientWalletAddress,
          gasOracle: suiAddresses.gasOracleObjectAddress,
          feeTokenCoin: coinWithBalance({ balance: BigInt(0), type: fromTokenAddress }),
          feeSuiCoin: totalFeeCoin,
        };
        bridge(tx, fromTokenAddress, args);
        break;
      }
      case FeePaymentMethod.WITH_STABLECOIN: {
        const amountWithoutFee = BigInt(amount) - BigInt(totalFee);

        let amountCoin, feeTokenCoin;
        if (inputCoin) {
          const [feeTokenCoinS] = tx.splitCoins(inputCoin, [totalFee]);
          amountCoin = inputCoin;
          feeTokenCoin = feeTokenCoinS;
        } else {
          amountCoin = coinWithBalance({ balance: amountWithoutFee, type: fromTokenAddress });
          feeTokenCoin = coinWithBalance({ balance: BigInt(totalFee), type: fromTokenAddress });
        }

        const args = {
          cctpBridge: suiAddresses.cctpObjectAddress,
          tokenMessengerMinterState: suiAddresses.cctpTokenMessengerMinterStateObjectAddress,
          messageTransmitterState: suiAddresses.cctpMessageTransmitterStateObjectAddress,
          treasury: suiAddresses.cctpTreasuryObjectAddress,
          denyList: suiAddresses.cctpDenyListObjectAddress,
          amount: amountCoin,
          destinationChainId: toChainId,
          recipient: recipient,
          recipientWalletAddress: recipientWalletAddress,
          gasOracle: suiAddresses.gasOracleObjectAddress,
          feeTokenCoin: feeTokenCoin,
          feeSuiCoin: coinWithBalance({ balance: BigInt(0), useGasCoin: false }),
        };
        bridge(tx, fromTokenAddress, args);
        break;
      }
      case FeePaymentMethod.WITH_ABR:
        throw new SdkError("SUI bridge does not support ARB0 payment method");
      default: {
        return assertNever(gasFeePaymentMethod, "Unhandled FeePaymentMethod");
      }
    }

    return await tx.toJSON({ client: this.client });
  }
}
