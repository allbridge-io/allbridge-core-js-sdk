import type { Response, TypedAbiArg, TypedAbiFunction, TypedAbiMap, TypedAbiVariable } from "@clarigen/core";

export const stacksContracts = {
  bridge: {
    functions: {
      assertCanSwap: {
        name: "assert-can-swap",
        access: "private",
        args: [],
        outputs: { type: { response: { ok: "bool", error: "uint128" } } },
      } as TypedAbiFunction<[], Response<boolean, bigint>>,
      assertGasOracle: {
        name: "assert-gas-oracle",
        access: "private",
        args: [{ name: "gas-oracle-ref", type: "trait_reference" }],
        outputs: { type: { response: { ok: "bool", error: "uint128" } } },
      } as TypedAbiFunction<[gasOracleRef: TypedAbiArg<string, "gasOracleRef">], Response<boolean, bigint>>,
      assertMessenger: {
        name: "assert-messenger",
        access: "private",
        args: [
          { name: "messenger-ref", type: "trait_reference" },
          { name: "messenger-id", type: "uint128" },
        ],
        outputs: { type: { response: { ok: "bool", error: "uint128" } } },
      } as TypedAbiFunction<
        [messengerRef: TypedAbiArg<string, "messengerRef">, messengerId: TypedAbiArg<number | bigint, "messengerId">],
        Response<boolean, bigint>
      >,
      convertBridgingFeeInTokensToNative: {
        name: "convert-bridging-fee-in-tokens-to-native",
        access: "private",
        args: [
          { name: "ft-ref", type: "trait_reference" },
          { name: "gas-oracle-ref", type: "trait_reference" },
          { name: "fee-token-amount", type: "uint128" },
        ],
        outputs: { type: { response: { ok: "uint128", error: "uint128" } } },
      } as TypedAbiFunction<
        [
          ftRef: TypedAbiArg<string, "ftRef">,
          gasOracleRef: TypedAbiArg<string, "gasOracleRef">,
          feeTokenAmount: TypedAbiArg<number | bigint, "feeTokenAmount">,
        ],
        Response<bigint, bigint>
      >,
      onlyOwner: {
        name: "only-owner",
        access: "private",
        args: [],
        outputs: { type: { response: { ok: "bool", error: "uint128" } } },
      } as TypedAbiFunction<[], Response<boolean, bigint>>,
      onlyStopAuthority: {
        name: "only-stop-authority",
        access: "private",
        args: [],
        outputs: { type: { response: { ok: "bool", error: "uint128" } } },
      } as TypedAbiFunction<[], Response<boolean, bigint>>,
      receiveAndSwapFromVusd: {
        name: "receive-and-swap-from-vusd",
        access: "private",
        args: [
          { name: "pool-ref", type: "trait_reference" },
          { name: "ft-ref", type: "trait_reference" },
          { name: "recipient", type: "principal" },
          { name: "vusd-amount", type: "uint128" },
          { name: "receive-amount-min", type: "uint128" },
        ],
        outputs: { type: { response: { ok: "uint128", error: "uint128" } } },
      } as TypedAbiFunction<
        [
          poolRef: TypedAbiArg<string, "poolRef">,
          ftRef: TypedAbiArg<string, "ftRef">,
          recipient: TypedAbiArg<string, "recipient">,
          vusdAmount: TypedAbiArg<number | bigint, "vusdAmount">,
          receiveAmountMin: TypedAbiArg<number | bigint, "receiveAmountMin">,
        ],
        Response<bigint, bigint>
      >,
      sendAndSwapToVusd: {
        name: "send-and-swap-to-vusd",
        access: "private",
        args: [
          { name: "pool-ref", type: "trait_reference" },
          { name: "ft-ref", type: "trait_reference" },
          { name: "user", type: "principal" },
          { name: "amount", type: "uint128" },
        ],
        outputs: { type: { response: { ok: "uint128", error: "uint128" } } },
      } as TypedAbiFunction<
        [
          poolRef: TypedAbiArg<string, "poolRef">,
          ftRef: TypedAbiArg<string, "ftRef">,
          user: TypedAbiArg<string, "user">,
          amount: TypedAbiArg<number | bigint, "amount">,
        ],
        Response<bigint, bigint>
      >,
      sendTokens: {
        name: "send-tokens",
        access: "private",
        args: [
          { name: "messenger-ref", type: "trait_reference" },
          { name: "gas-oracle-ref", type: "trait_reference" },
          { name: "amount", type: "uint128" },
          { name: "recipient", type: { buffer: { length: 32 } } },
          { name: "destination-chain-id", type: "uint128" },
          { name: "receive-token", type: { buffer: { length: 32 } } },
          { name: "nonce", type: { buffer: { length: 32 } } },
          { name: "messenger-id", type: "uint128" },
          { name: "bridging-fee", type: "uint128" },
        ],
        outputs: {
          type: {
            response: {
              ok: {
                tuple: [
                  { name: "bridge-tx-cost", type: "uint128" },
                  { name: "message-tx-cost", type: "uint128" },
                ],
              },
              error: "uint128",
            },
          },
        },
      } as TypedAbiFunction<
        [
          messengerRef: TypedAbiArg<string, "messengerRef">,
          gasOracleRef: TypedAbiArg<string, "gasOracleRef">,
          amount: TypedAbiArg<number | bigint, "amount">,
          recipient: TypedAbiArg<Uint8Array, "recipient">,
          destinationChainId: TypedAbiArg<number | bigint, "destinationChainId">,
          receiveToken: TypedAbiArg<Uint8Array, "receiveToken">,
          nonce: TypedAbiArg<Uint8Array, "nonce">,
          messengerId: TypedAbiArg<number | bigint, "messengerId">,
          bridgingFee: TypedAbiArg<number | bigint, "bridgingFee">,
        ],
        Response<
          {
            bridgeTxCost: bigint;
            messageTxCost: bigint;
          },
          bigint
        >
      >,
      addBridgeToken: {
        name: "add-bridge-token",
        access: "public",
        args: [
          { name: "chain-id_", type: "uint128" },
          { name: "token-address", type: { buffer: { length: 32 } } },
        ],
        outputs: { type: { response: { ok: "bool", error: "uint128" } } },
      } as TypedAbiFunction<
        [chainId_: TypedAbiArg<number | bigint, "chainId_">, tokenAddress: TypedAbiArg<Uint8Array, "tokenAddress">],
        Response<boolean, bigint>
      >,
      addPool: {
        name: "add-pool",
        access: "public",
        args: [
          { name: "pool-ref", type: "trait_reference" },
          { name: "ft-ref", type: "trait_reference" },
        ],
        outputs: { type: { response: { ok: "bool", error: "uint128" } } },
      } as TypedAbiFunction<
        [poolRef: TypedAbiArg<string, "poolRef">, ftRef: TypedAbiArg<string, "ftRef">],
        Response<boolean, bigint>
      >,
      getTransactionCost: {
        name: "get-transaction-cost",
        access: "public",
        args: [
          { name: "gas-oracle-ref", type: "trait_reference" },
          { name: "chain-id_", type: "uint128" },
        ],
        outputs: { type: { response: { ok: "uint128", error: "uint128" } } },
      } as TypedAbiFunction<
        [gasOracleRef: TypedAbiArg<string, "gasOracleRef">, chainId_: TypedAbiArg<number | bigint, "chainId_">],
        Response<bigint, bigint>
      >,
      init: {
        name: "init",
        access: "public",
        args: [
          { name: "this-chain-id_", type: "uint128" },
          { name: "gas-oracle", type: "principal" },
        ],
        outputs: { type: { response: { ok: "bool", error: "uint128" } } },
      } as TypedAbiFunction<
        [thisChainId_: TypedAbiArg<number | bigint, "thisChainId_">, gasOracle: TypedAbiArg<string, "gasOracle">],
        Response<boolean, bigint>
      >,
      receiveTokens: {
        name: "receive-tokens",
        access: "public",
        args: [
          { name: "messenger-ref", type: "trait_reference" },
          { name: "amount", type: "uint128" },
          { name: "recipient", type: "principal" },
          { name: "source-chain-id", type: "uint128" },
          { name: "pool-ref", type: "trait_reference" },
          { name: "ft-ref", type: "trait_reference" },
          { name: "nonce", type: { buffer: { length: 32 } } },
          { name: "messenger-id", type: "uint128" },
          { name: "receive-amount-min", type: "uint128" },
          { name: "extra-gas", type: "uint128" },
        ],
        outputs: { type: { response: { ok: "bool", error: "uint128" } } },
      } as TypedAbiFunction<
        [
          messengerRef: TypedAbiArg<string, "messengerRef">,
          amount: TypedAbiArg<number | bigint, "amount">,
          recipient: TypedAbiArg<string, "recipient">,
          sourceChainId: TypedAbiArg<number | bigint, "sourceChainId">,
          poolRef: TypedAbiArg<string, "poolRef">,
          ftRef: TypedAbiArg<string, "ftRef">,
          nonce: TypedAbiArg<Uint8Array, "nonce">,
          messengerId: TypedAbiArg<number | bigint, "messengerId">,
          receiveAmountMin: TypedAbiArg<number | bigint, "receiveAmountMin">,
          extraGas: TypedAbiArg<number | bigint, "extraGas">,
        ],
        Response<boolean, bigint>
      >,
      registerBridge: {
        name: "register-bridge",
        access: "public",
        args: [
          { name: "chain-id_", type: "uint128" },
          { name: "bridge-address", type: { buffer: { length: 32 } } },
        ],
        outputs: { type: { response: { ok: "bool", error: "uint128" } } },
      } as TypedAbiFunction<
        [chainId_: TypedAbiArg<number | bigint, "chainId_">, bridgeAddress: TypedAbiArg<Uint8Array, "bridgeAddress">],
        Response<boolean, bigint>
      >,
      removeBridge: {
        name: "remove-bridge",
        access: "public",
        args: [{ name: "chain-id_", type: "uint128" }],
        outputs: { type: { response: { ok: "bool", error: "uint128" } } },
      } as TypedAbiFunction<[chainId_: TypedAbiArg<number | bigint, "chainId_">], Response<boolean, bigint>>,
      removeBridgeToken: {
        name: "remove-bridge-token",
        access: "public",
        args: [
          { name: "chain-id_", type: "uint128" },
          { name: "token-address", type: { buffer: { length: 32 } } },
        ],
        outputs: { type: { response: { ok: "bool", error: "uint128" } } },
      } as TypedAbiFunction<
        [chainId_: TypedAbiArg<number | bigint, "chainId_">, tokenAddress: TypedAbiArg<Uint8Array, "tokenAddress">],
        Response<boolean, bigint>
      >,
      removeMessenger: {
        name: "remove-messenger",
        access: "public",
        args: [{ name: "messenger-id", type: "uint128" }],
        outputs: { type: { response: { ok: "bool", error: "uint128" } } },
      } as TypedAbiFunction<[messengerId: TypedAbiArg<number | bigint, "messengerId">], Response<boolean, bigint>>,
      setGasUsage: {
        name: "set-gas-usage",
        access: "public",
        args: [
          { name: "chain-id_", type: "uint128" },
          { name: "gas", type: "uint128" },
        ],
        outputs: { type: { response: { ok: "bool", error: "uint128" } } },
      } as TypedAbiFunction<
        [chainId_: TypedAbiArg<number | bigint, "chainId_">, gas: TypedAbiArg<number | bigint, "gas">],
        Response<boolean, bigint>
      >,
      setMessenger: {
        name: "set-messenger",
        access: "public",
        args: [
          { name: "messenger-id", type: "uint128" },
          { name: "new-messenger", type: "principal" },
        ],
        outputs: { type: { response: { ok: "bool", error: "uint128" } } },
      } as TypedAbiFunction<
        [messengerId: TypedAbiArg<number | bigint, "messengerId">, newMessenger: TypedAbiArg<string, "newMessenger">],
        Response<boolean, bigint>
      >,
      setOwner: {
        name: "set-owner",
        access: "public",
        args: [{ name: "new-owner", type: "principal" }],
        outputs: { type: { response: { ok: "bool", error: "uint128" } } },
      } as TypedAbiFunction<[newOwner: TypedAbiArg<string, "newOwner">], Response<boolean, bigint>>,
      setRebalancer: {
        name: "set-rebalancer",
        access: "public",
        args: [{ name: "new-rebalancer", type: "principal" }],
        outputs: { type: { response: { ok: "bool", error: "uint128" } } },
      } as TypedAbiFunction<[newRebalancer: TypedAbiArg<string, "newRebalancer">], Response<boolean, bigint>>,
      setStopAuthority: {
        name: "set-stop-authority",
        access: "public",
        args: [{ name: "new-authority", type: "principal" }],
        outputs: { type: { response: { ok: "bool", error: "uint128" } } },
      } as TypedAbiFunction<[newAuthority: TypedAbiArg<string, "newAuthority">], Response<boolean, bigint>>,
      startSwap: {
        name: "start-swap",
        access: "public",
        args: [],
        outputs: { type: { response: { ok: "bool", error: "uint128" } } },
      } as TypedAbiFunction<[], Response<boolean, bigint>>,
      stopSwap: {
        name: "stop-swap",
        access: "public",
        args: [],
        outputs: { type: { response: { ok: "bool", error: "uint128" } } },
      } as TypedAbiFunction<[], Response<boolean, bigint>>,
      swap: {
        name: "swap",
        access: "public",
        args: [
          { name: "amount", type: "uint128" },
          { name: "send-pool-ref", type: "trait_reference" },
          { name: "send-ft-ref", type: "trait_reference" },
          { name: "receive-pool-ref", type: "trait_reference" },
          { name: "receive-ft-ref", type: "trait_reference" },
          { name: "recipient", type: "principal" },
          { name: "receive-amount-min", type: "uint128" },
        ],
        outputs: { type: { response: { ok: "bool", error: "uint128" } } },
      } as TypedAbiFunction<
        [
          amount: TypedAbiArg<number | bigint, "amount">,
          sendPoolRef: TypedAbiArg<string, "sendPoolRef">,
          sendFtRef: TypedAbiArg<string, "sendFtRef">,
          receivePoolRef: TypedAbiArg<string, "receivePoolRef">,
          receiveFtRef: TypedAbiArg<string, "receiveFtRef">,
          recipient: TypedAbiArg<string, "recipient">,
          receiveAmountMin: TypedAbiArg<number | bigint, "receiveAmountMin">,
        ],
        Response<boolean, bigint>
      >,
      swapAndBridge: {
        name: "swap-and-bridge",
        access: "public",
        args: [
          { name: "pool-ref", type: "trait_reference" },
          { name: "ft-ref", type: "trait_reference" },
          { name: "messenger-ref", type: "trait_reference" },
          { name: "gas-oracle-ref", type: "trait_reference" },
          { name: "amount", type: "uint128" },
          { name: "recipient", type: { buffer: { length: 32 } } },
          { name: "destination-chain-id", type: "uint128" },
          { name: "receive-token", type: { buffer: { length: 32 } } },
          { name: "nonce", type: { buffer: { length: 32 } } },
          { name: "messenger-id", type: "uint128" },
          { name: "fee-native-amount", type: "uint128" },
          { name: "fee-token-amount", type: "uint128" },
        ],
        outputs: { type: { response: { ok: "bool", error: "uint128" } } },
      } as TypedAbiFunction<
        [
          poolRef: TypedAbiArg<string, "poolRef">,
          ftRef: TypedAbiArg<string, "ftRef">,
          messengerRef: TypedAbiArg<string, "messengerRef">,
          gasOracleRef: TypedAbiArg<string, "gasOracleRef">,
          amount: TypedAbiArg<number | bigint, "amount">,
          recipient: TypedAbiArg<Uint8Array, "recipient">,
          destinationChainId: TypedAbiArg<number | bigint, "destinationChainId">,
          receiveToken: TypedAbiArg<Uint8Array, "receiveToken">,
          nonce: TypedAbiArg<Uint8Array, "nonce">,
          messengerId: TypedAbiArg<number | bigint, "messengerId">,
          feeNativeAmount: TypedAbiArg<number | bigint, "feeNativeAmount">,
          feeTokenAmount: TypedAbiArg<number | bigint, "feeTokenAmount">,
        ],
        Response<boolean, bigint>
      >,
      withdrawBridgingFeeInTokens: {
        name: "withdraw-bridging-fee-in-tokens",
        access: "public",
        args: [
          { name: "ft-ref", type: "trait_reference" },
          { name: "amount", type: "uint128" },
        ],
        outputs: { type: { response: { ok: "bool", error: "uint128" } } },
      } as TypedAbiFunction<
        [ftRef: TypedAbiArg<string, "ftRef">, amount: TypedAbiArg<number | bigint, "amount">],
        Response<boolean, bigint>
      >,
      withdrawGasTokens: {
        name: "withdraw-gas-tokens",
        access: "public",
        args: [{ name: "amount", type: "uint128" }],
        outputs: { type: { response: { ok: "bool", error: "uint128" } } },
      } as TypedAbiFunction<[amount: TypedAbiArg<number | bigint, "amount">], Response<boolean, bigint>>,
      getGasOracleAddress: {
        name: "get-gas-oracle-address",
        access: "read_only",
        args: [],
        outputs: { type: "principal" },
      } as TypedAbiFunction<[], string>,
      getGasUsage: {
        name: "get-gas-usage",
        access: "read_only",
        args: [{ name: "chain-id_", type: "uint128" }],
        outputs: { type: { response: { ok: "uint128", error: "uint128" } } },
      } as TypedAbiFunction<[chainId_: TypedAbiArg<number | bigint, "chainId_">], Response<bigint, bigint>>,
      getMessenger: {
        name: "get-messenger",
        access: "read_only",
        args: [{ name: "messenger-id", type: "uint128" }],
        outputs: { type: { response: { ok: "principal", error: "uint128" } } },
      } as TypedAbiFunction<[messengerId: TypedAbiArg<number | bigint, "messengerId">], Response<string, bigint>>,
      getOtherBridge: {
        name: "get-other-bridge",
        access: "read_only",
        args: [{ name: "chain-id_", type: "uint128" }],
        outputs: { type: { response: { ok: { buffer: { length: 32 } }, error: "uint128" } } },
      } as TypedAbiFunction<[chainId_: TypedAbiArg<number | bigint, "chainId_">], Response<Uint8Array, bigint>>,
      getOwner: {
        name: "get-owner",
        access: "read_only",
        args: [],
        outputs: { type: "principal" },
      } as TypedAbiFunction<[], string>,
      getProcessedMessageStatus: {
        name: "get-processed-message-status",
        access: "read_only",
        args: [{ name: "message-hash", type: { buffer: { length: 32 } } }],
        outputs: { type: { response: { ok: "bool", error: "none" } } },
      } as TypedAbiFunction<[messageHash: TypedAbiArg<Uint8Array, "messageHash">], Response<boolean, null>>,
      getRebalancer: {
        name: "get-rebalancer",
        access: "read_only",
        args: [],
        outputs: { type: "principal" },
      } as TypedAbiFunction<[], string>,
      getSentMessageStatus: {
        name: "get-sent-message-status",
        access: "read_only",
        args: [{ name: "message-hash", type: { buffer: { length: 32 } } }],
        outputs: { type: { response: { ok: "bool", error: "none" } } },
      } as TypedAbiFunction<[messageHash: TypedAbiArg<Uint8Array, "messageHash">], Response<boolean, null>>,
      getStopAuthority: {
        name: "get-stop-authority",
        access: "read_only",
        args: [],
        outputs: { type: "principal" },
      } as TypedAbiFunction<[], string>,
      getThisChainId: {
        name: "get-this-chain-id",
        access: "read_only",
        args: [],
        outputs: { type: "uint128" },
      } as TypedAbiFunction<[], bigint>,
      getTokenInfo: {
        name: "get-token-info",
        access: "read_only",
        args: [{ name: "token-principal-hash", type: { buffer: { length: 32 } } }],
        outputs: {
          type: {
            response: {
              ok: {
                tuple: [
                  { name: "bridging-fee-conversion-scaling-factor", type: "uint128" },
                  { name: "from-gas-oracle-scaling-factor", type: "uint128" },
                  { name: "pool", type: "principal" },
                  { name: "token", type: "principal" },
                ],
              },
              error: "uint128",
            },
          },
        },
      } as TypedAbiFunction<
        [tokenPrincipalHash: TypedAbiArg<Uint8Array, "tokenPrincipalHash">],
        Response<
          {
            bridgingFeeConversionScalingFactor: bigint;
            fromGasOracleScalingFactor: bigint;
            pool: string;
            token: string;
          },
          bigint
        >
      >,
      isBridgeTokenSupported: {
        name: "is-bridge-token-supported",
        access: "read_only",
        args: [
          { name: "chain-id_", type: "uint128" },
          { name: "token-address", type: { buffer: { length: 32 } } },
        ],
        outputs: { type: { response: { ok: "bool", error: "none" } } },
      } as TypedAbiFunction<
        [chainId_: TypedAbiArg<number | bigint, "chainId_">, tokenAddress: TypedAbiArg<Uint8Array, "tokenAddress">],
        Response<boolean, null>
      >,
      isSwapEnabled: {
        name: "is-swap-enabled",
        access: "read_only",
        args: [],
        outputs: { type: "bool" },
      } as TypedAbiFunction<[], boolean>,
    },
    maps: {
      gasUsageMap: { name: "gas-usage-map", key: "uint128", value: "uint128" } as TypedAbiMap<number | bigint, bigint>,
      messengers: { name: "messengers", key: "uint128", value: "principal" } as TypedAbiMap<number | bigint, string>,
      otherBridgeTokens: {
        name: "other-bridge-tokens",
        key: {
          tuple: [
            { name: "chain-id", type: "uint128" },
            { name: "token-address", type: { buffer: { length: 32 } } },
          ],
        },
        value: "bool",
      } as TypedAbiMap<
        {
          chainId: number | bigint;
          tokenAddress: Uint8Array;
        },
        boolean
      >,
      otherBridges: { name: "other-bridges", key: "uint128", value: { buffer: { length: 32 } } } as TypedAbiMap<
        number | bigint,
        Uint8Array
      >,
      processedMessages: { name: "processed-messages", key: { buffer: { length: 32 } }, value: "bool" } as TypedAbiMap<
        Uint8Array,
        boolean
      >,
      sentMessages: { name: "sent-messages", key: { buffer: { length: 32 } }, value: "bool" } as TypedAbiMap<
        Uint8Array,
        boolean
      >,
      tokenInfos: {
        name: "token-infos",
        key: { buffer: { length: 32 } },
        value: {
          tuple: [
            { name: "bridging-fee-conversion-scaling-factor", type: "uint128" },
            { name: "from-gas-oracle-scaling-factor", type: "uint128" },
            { name: "pool", type: "principal" },
            { name: "token", type: "principal" },
          ],
        },
      } as TypedAbiMap<
        Uint8Array,
        {
          bridgingFeeConversionScalingFactor: bigint;
          fromGasOracleScalingFactor: bigint;
          pool: string;
          token: string;
        }
      >,
    },
    variables: {
      chainPrecision: {
        name: "chain-precision",
        type: "uint128",
        access: "constant",
      } as TypedAbiVariable<bigint>,
      errAlreadyInitialized: {
        name: "err-already-initialized",
        type: {
          response: {
            ok: "none",
            error: "uint128",
          },
        },
        access: "constant",
      } as TypedAbiVariable<Response<null, bigint>>,
      errAlreadyProcessed: {
        name: "err-already-processed",
        type: {
          response: {
            ok: "none",
            error: "uint128",
          },
        },
        access: "constant",
      } as TypedAbiVariable<Response<null, bigint>>,
      errAlreadySent: {
        name: "err-already-sent",
        type: {
          response: {
            ok: "none",
            error: "uint128",
          },
        },
        access: "constant",
      } as TypedAbiVariable<Response<null, bigint>>,
      errBridgeSourceNotRegistered: {
        name: "err-bridge-source-not-registered",
        type: {
          response: {
            ok: "none",
            error: "uint128",
          },
        },
        access: "constant",
      } as TypedAbiVariable<Response<null, bigint>>,
      errDepositAmountTooSmall: {
        name: "err-deposit-amount-too-small",
        type: {
          response: {
            ok: "none",
            error: "uint128",
          },
        },
        access: "constant",
      } as TypedAbiVariable<Response<null, bigint>>,
      errGasUsageNotSet: {
        name: "err-gas-usage-not-set",
        type: {
          response: {
            ok: "none",
            error: "uint128",
          },
        },
        access: "constant",
      } as TypedAbiVariable<Response<null, bigint>>,
      errMessengerNotRegistered: {
        name: "err-messenger-not-registered",
        type: {
          response: {
            ok: "none",
            error: "uint128",
          },
        },
        access: "constant",
      } as TypedAbiVariable<Response<null, bigint>>,
      errNoMessage: {
        name: "err-no-message",
        type: {
          response: {
            ok: "none",
            error: "uint128",
          },
        },
        access: "constant",
      } as TypedAbiVariable<Response<null, bigint>>,
      errNotEnoughFee: {
        name: "err-not-enough-fee",
        type: {
          response: {
            ok: "none",
            error: "uint128",
          },
        },
        access: "constant",
      } as TypedAbiVariable<Response<null, bigint>>,
      errNotInitialized: {
        name: "err-not-initialized",
        type: {
          response: {
            ok: "none",
            error: "uint128",
          },
        },
        access: "constant",
      } as TypedAbiVariable<Response<null, bigint>>,
      errSwapProhibited: {
        name: "err-swap-prohibited",
        type: {
          response: {
            ok: "none",
            error: "uint128",
          },
        },
        access: "constant",
      } as TypedAbiVariable<Response<null, bigint>>,
      errTokenNotSupported: {
        name: "err-token-not-supported",
        type: {
          response: {
            ok: "none",
            error: "uint128",
          },
        },
        access: "constant",
      } as TypedAbiVariable<Response<null, bigint>>,
      errUnauthorized: {
        name: "err-unauthorized",
        type: {
          response: {
            ok: "none",
            error: "uint128",
          },
        },
        access: "constant",
      } as TypedAbiVariable<Response<null, bigint>>,
      errWrongGasOracle: {
        name: "err-wrong-gas-oracle",
        type: {
          response: {
            ok: "none",
            error: "uint128",
          },
        },
        access: "constant",
      } as TypedAbiVariable<Response<null, bigint>>,
      errWrongMessenger: {
        name: "err-wrong-messenger",
        type: {
          response: {
            ok: "none",
            error: "uint128",
          },
        },
        access: "constant",
      } as TypedAbiVariable<Response<null, bigint>>,
      errWrongTokenForPool: {
        name: "err-wrong-token-for-pool",
        type: {
          response: {
            ok: "none",
            error: "uint128",
          },
        },
        access: "constant",
      } as TypedAbiVariable<Response<null, bigint>>,
      oraclePrecision: {
        name: "oracle-precision",
        type: "uint128",
        access: "constant",
      } as TypedAbiVariable<bigint>,
      canSwap: {
        name: "can-swap",
        type: "bool",
        access: "variable",
      } as TypedAbiVariable<boolean>,
      gasOraclePrincipal: {
        name: "gas-oracle-principal",
        type: {
          optional: "principal",
        },
        access: "variable",
      } as TypedAbiVariable<string | null>,
      owner: {
        name: "owner",
        type: "principal",
        access: "variable",
      } as TypedAbiVariable<string>,
      rebalancer: {
        name: "rebalancer",
        type: "principal",
        access: "variable",
      } as TypedAbiVariable<string>,
      stopAuthority: {
        name: "stop-authority",
        type: "principal",
        access: "variable",
      } as TypedAbiVariable<string>,
      thisChainId: {
        name: "this-chain-id",
        type: {
          optional: "uint128",
        },
        access: "variable",
      } as TypedAbiVariable<bigint | null>,
    },
    constants: {
      canSwap: false,
      chainPrecision: 6n,
      errAlreadyInitialized: {
        isOk: false,
        value: 1_004n,
      },
      errAlreadyProcessed: {
        isOk: false,
        value: 1_010n,
      },
      errAlreadySent: {
        isOk: false,
        value: 1_005n,
      },
      errBridgeSourceNotRegistered: {
        isOk: false,
        value: 1_009n,
      },
      errDepositAmountTooSmall: {
        isOk: false,
        value: 1_001n,
      },
      errGasUsageNotSet: {
        isOk: false,
        value: 1_008n,
      },
      errMessengerNotRegistered: {
        isOk: false,
        value: 1_014n,
      },
      errNoMessage: {
        isOk: false,
        value: 1_011n,
      },
      errNotEnoughFee: {
        isOk: false,
        value: 1_007n,
      },
      errNotInitialized: {
        isOk: false,
        value: 1_006n,
      },
      errSwapProhibited: {
        isOk: false,
        value: 1_012n,
      },
      errTokenNotSupported: {
        isOk: false,
        value: 1_002n,
      },
      errUnauthorized: {
        isOk: false,
        value: 1_000n,
      },
      errWrongGasOracle: {
        isOk: false,
        value: 1_013n,
      },
      errWrongMessenger: {
        isOk: false,
        value: 1_015n,
      },
      errWrongTokenForPool: {
        isOk: false,
        value: 1_003n,
      },
      gasOraclePrincipal: null,
      oraclePrecision: 18n,
      owner: "ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM",
      rebalancer: "ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM",
      stopAuthority: "ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM",
      thisChainId: null,
    },
    non_fungible_tokens: [],
    fungible_tokens: [],
    epoch: "Epoch31",
    clarity_version: "Clarity3",
    contractName: "bridge",
  },
  ftToken: {
    functions: {
      getTokenUri: {
        name: "get-token-uri",
        access: "public",
        args: [],
        outputs: { type: { response: { ok: { optional: { "string-utf8": { length: 19 } } }, error: "none" } } },
      } as TypedAbiFunction<[], Response<string | null, null>>,
      mint: {
        name: "mint",
        access: "public",
        args: [
          { name: "amount", type: "uint128" },
          { name: "recipient", type: "principal" },
        ],
        outputs: { type: { response: { ok: "bool", error: "uint128" } } },
      } as TypedAbiFunction<
        [amount: TypedAbiArg<number | bigint, "amount">, recipient: TypedAbiArg<string, "recipient">],
        Response<boolean, bigint>
      >,
      transfer: {
        name: "transfer",
        access: "public",
        args: [
          { name: "amount", type: "uint128" },
          { name: "sender", type: "principal" },
          { name: "recipient", type: "principal" },
          { name: "memo", type: { optional: { buffer: { length: 34 } } } },
        ],
        outputs: { type: { response: { ok: "bool", error: "uint128" } } },
      } as TypedAbiFunction<
        [
          amount: TypedAbiArg<number | bigint, "amount">,
          sender: TypedAbiArg<string, "sender">,
          recipient: TypedAbiArg<string, "recipient">,
          memo: TypedAbiArg<Uint8Array | null, "memo">,
        ],
        Response<boolean, bigint>
      >,
      getBalance: {
        name: "get-balance",
        access: "read_only",
        args: [{ name: "owner", type: "principal" }],
        outputs: { type: { response: { ok: "uint128", error: "none" } } },
      } as TypedAbiFunction<[owner: TypedAbiArg<string, "owner">], Response<bigint, null>>,
      getDecimals: {
        name: "get-decimals",
        access: "read_only",
        args: [],
        outputs: { type: { response: { ok: "uint128", error: "none" } } },
      } as TypedAbiFunction<[], Response<bigint, null>>,
      getName: {
        name: "get-name",
        access: "read_only",
        args: [],
        outputs: { type: { response: { ok: { "string-ascii": { length: 13 } }, error: "none" } } },
      } as TypedAbiFunction<[], Response<string, null>>,
      getSymbol: {
        name: "get-symbol",
        access: "read_only",
        args: [],
        outputs: { type: { response: { ok: { "string-ascii": { length: 7 } }, error: "none" } } },
      } as TypedAbiFunction<[], Response<string, null>>,
      getTotalSupply: {
        name: "get-total-supply",
        access: "read_only",
        args: [],
        outputs: { type: { response: { ok: "uint128", error: "none" } } },
      } as TypedAbiFunction<[], Response<bigint, null>>,
    },
    maps: {},
    variables: {},
    constants: {},
    non_fungible_tokens: [],
    fungible_tokens: [{ name: "example-token" }],
    epoch: "Epoch31",
    clarity_version: "Clarity3",
    contractName: "ft-token",
  },
  gasOracle: {
    functions: {
      setChainData: {
        name: "set-chain-data",
        access: "public",
        args: [
          { name: "chain-id_", type: "uint128" },
          { name: "new-price", type: "uint128" },
          { name: "new-gas-price", type: "uint128" },
        ],
        outputs: { type: { response: { ok: "bool", error: "uint128" } } },
      } as TypedAbiFunction<
        [
          chainId_: TypedAbiArg<number | bigint, "chainId_">,
          newPrice: TypedAbiArg<number | bigint, "newPrice">,
          newGasPrice: TypedAbiArg<number | bigint, "newGasPrice">,
        ],
        Response<boolean, bigint>
      >,
      setGasPrice: {
        name: "set-gas-price",
        access: "public",
        args: [
          { name: "chain-id_", type: "uint128" },
          { name: "new-gas-price", type: "uint128" },
        ],
        outputs: { type: { response: { ok: "bool", error: "uint128" } } },
      } as TypedAbiFunction<
        [chainId_: TypedAbiArg<number | bigint, "chainId_">, newGasPrice: TypedAbiArg<number | bigint, "newGasPrice">],
        Response<boolean, bigint>
      >,
      setPrice: {
        name: "set-price",
        access: "public",
        args: [
          { name: "chain-id_", type: "uint128" },
          { name: "new-price", type: "uint128" },
        ],
        outputs: { type: { response: { ok: "bool", error: "uint128" } } },
      } as TypedAbiFunction<
        [chainId_: TypedAbiArg<number | bigint, "chainId_">, newPrice: TypedAbiArg<number | bigint, "newPrice">],
        Response<boolean, bigint>
      >,
      crossRate: {
        name: "cross-rate",
        access: "read_only",
        args: [{ name: "other-chain-id", type: "uint128" }],
        outputs: { type: { response: { ok: "uint128", error: "uint128" } } },
      } as TypedAbiFunction<[otherChainId: TypedAbiArg<number | bigint, "otherChainId">], Response<bigint, bigint>>,
      getChainData: {
        name: "get-chain-data",
        access: "read_only",
        args: [{ name: "chain-id_", type: "uint128" }],
        outputs: {
          type: {
            response: {
              ok: {
                tuple: [
                  { name: "gas-price", type: "uint128" },
                  { name: "price", type: "uint128" },
                ],
              },
              error: "uint128",
            },
          },
        },
      } as TypedAbiFunction<
        [chainId_: TypedAbiArg<number | bigint, "chainId_">],
        Response<
          {
            gasPrice: bigint;
            price: bigint;
          },
          bigint
        >
      >,
      getGasPrice: {
        name: "get-gas-price",
        access: "read_only",
        args: [{ name: "chain-id_", type: "uint128" }],
        outputs: { type: { response: { ok: "uint128", error: "uint128" } } },
      } as TypedAbiFunction<[chainId_: TypedAbiArg<number | bigint, "chainId_">], Response<bigint, bigint>>,
      getPrice: {
        name: "get-price",
        access: "read_only",
        args: [{ name: "chain-id_", type: "uint128" }],
        outputs: { type: { response: { ok: "uint128", error: "uint128" } } },
      } as TypedAbiFunction<[chainId_: TypedAbiArg<number | bigint, "chainId_">], Response<bigint, bigint>>,
      getTransactionGasCostInNativeToken: {
        name: "get-transaction-gas-cost-in-native-token",
        access: "read_only",
        args: [
          { name: "other-chain-id", type: "uint128" },
          { name: "gas-amount", type: "uint128" },
        ],
        outputs: { type: { response: { ok: "uint128", error: "uint128" } } },
      } as TypedAbiFunction<
        [
          otherChainId: TypedAbiArg<number | bigint, "otherChainId">,
          gasAmount: TypedAbiArg<number | bigint, "gasAmount">,
        ],
        Response<bigint, bigint>
      >,
      getTransactionGasCostInUsd: {
        name: "get-transaction-gas-cost-in-usd",
        access: "read_only",
        args: [
          { name: "other-chain-id", type: "uint128" },
          { name: "gas-amount", type: "uint128" },
        ],
        outputs: { type: { response: { ok: "uint128", error: "uint128" } } },
      } as TypedAbiFunction<
        [
          otherChainId: TypedAbiArg<number | bigint, "otherChainId">,
          gasAmount: TypedAbiArg<number | bigint, "gasAmount">,
        ],
        Response<bigint, bigint>
      >,
    },
    maps: {
      chainData: {
        name: "chain-data",
        key: "uint128",
        value: {
          tuple: [
            { name: "gas-price", type: "uint128" },
            { name: "price", type: "uint128" },
          ],
        },
      } as TypedAbiMap<
        number | bigint,
        {
          gasPrice: bigint;
          price: bigint;
        }
      >,
    },
    variables: {
      errNotFound: {
        name: "err-not-found",
        type: {
          response: {
            ok: "none",
            error: "uint128",
          },
        },
        access: "constant",
      } as TypedAbiVariable<Response<null, bigint>>,
      errUnauthorized: {
        name: "err-unauthorized",
        type: {
          response: {
            ok: "none",
            error: "uint128",
          },
        },
        access: "constant",
      } as TypedAbiVariable<Response<null, bigint>>,
      oracleScalingFactor: {
        name: "oracle-scaling-factor",
        type: "uint128",
        access: "constant",
      } as TypedAbiVariable<bigint>,
      contractOwner: {
        name: "contract-owner",
        type: "principal",
        access: "variable",
      } as TypedAbiVariable<string>,
      fromOracleToChainScalingFactor: {
        name: "from-oracle-to-chain-scaling-factor",
        type: "uint128",
        access: "variable",
      } as TypedAbiVariable<bigint>,
      thisChainId: {
        name: "this-chain-id",
        type: "uint128",
        access: "variable",
      } as TypedAbiVariable<bigint>,
    },
    constants: {
      contractOwner: "ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM",
      errNotFound: {
        isOk: false,
        value: 4_001n,
      },
      errUnauthorized: {
        isOk: false,
        value: 4_000n,
      },
      fromOracleToChainScalingFactor: 1_000_000_000_000n,
      oracleScalingFactor: 1_000_000_000_000_000_000n,
      thisChainId: 16n,
    },
    non_fungible_tokens: [],
    fungible_tokens: [],
    epoch: "Epoch31",
    clarity_version: "Clarity3",
    contractName: "gas-oracle",
  },
  gasOracleTrait: {
    functions: {},
    maps: {},
    variables: {},
    constants: {},
    non_fungible_tokens: [],
    fungible_tokens: [],
    epoch: "Epoch31",
    clarity_version: "Clarity3",
    contractName: "gas-oracle-trait",
  },
  messenger: {
    functions: {
      assertGasOracle: {
        name: "assert-gas-oracle",
        access: "private",
        args: [{ name: "gas-oracle-ref", type: "trait_reference" }],
        outputs: { type: { response: { ok: "bool", error: "uint128" } } },
      } as TypedAbiFunction<[gasOracleRef: TypedAbiArg<string, "gasOracleRef">], Response<boolean, bigint>>,
      onlyOwner: {
        name: "only-owner",
        access: "private",
        args: [],
        outputs: { type: { response: { ok: "bool", error: "uint128" } } },
      } as TypedAbiFunction<[], Response<boolean, bigint>>,
      addSecondaryValidator: {
        name: "add-secondary-validator",
        access: "public",
        args: [{ name: "val", type: { buffer: { length: 33 } } }],
        outputs: { type: { response: { ok: "bool", error: "uint128" } } },
      } as TypedAbiFunction<[val: TypedAbiArg<Uint8Array, "val">], Response<boolean, bigint>>,
      getTransactionCost: {
        name: "get-transaction-cost",
        access: "public",
        args: [
          { name: "gas-oracle-ref", type: "trait_reference" },
          { name: "chain-id_", type: "uint128" },
        ],
        outputs: { type: { response: { ok: "uint128", error: "uint128" } } },
      } as TypedAbiFunction<
        [gasOracleRef: TypedAbiArg<string, "gasOracleRef">, chainId_: TypedAbiArg<number | bigint, "chainId_">],
        Response<bigint, bigint>
      >,
      init: {
        name: "init",
        access: "public",
        args: [
          { name: "this-chain-id_", type: "uint128" },
          { name: "gas-oracle", type: "principal" },
        ],
        outputs: { type: { response: { ok: "bool", error: "uint128" } } },
      } as TypedAbiFunction<
        [thisChainId_: TypedAbiArg<number | bigint, "thisChainId_">, gasOracle: TypedAbiArg<string, "gasOracle">],
        Response<boolean, bigint>
      >,
      receiveMessage: {
        name: "receive-message",
        access: "public",
        args: [
          { name: "message", type: { buffer: { length: 32 } } },
          { name: "signature1", type: { buffer: { length: 65 } } },
          { name: "signature2", type: { buffer: { length: 65 } } },
        ],
        outputs: { type: { response: { ok: "bool", error: "uint128" } } },
      } as TypedAbiFunction<
        [
          message: TypedAbiArg<Uint8Array, "message">,
          signature1: TypedAbiArg<Uint8Array, "signature1">,
          signature2: TypedAbiArg<Uint8Array, "signature2">,
        ],
        Response<boolean, bigint>
      >,
      removeSecondaryValidator: {
        name: "remove-secondary-validator",
        access: "public",
        args: [{ name: "val", type: { buffer: { length: 33 } } }],
        outputs: { type: { response: { ok: "bool", error: "uint128" } } },
      } as TypedAbiFunction<[val: TypedAbiArg<Uint8Array, "val">], Response<boolean, bigint>>,
      sendMessage: {
        name: "send-message",
        access: "public",
        args: [
          { name: "gas-oracle-ref", type: "trait_reference" },
          { name: "message", type: { buffer: { length: 32 } } },
        ],
        outputs: { type: { response: { ok: "uint128", error: "uint128" } } },
      } as TypedAbiFunction<
        [gasOracleRef: TypedAbiArg<string, "gasOracleRef">, message: TypedAbiArg<Uint8Array, "message">],
        Response<bigint, bigint>
      >,
      setGasUsage: {
        name: "set-gas-usage",
        access: "public",
        args: [
          { name: "chain-id_", type: "uint128" },
          { name: "gas", type: "uint128" },
        ],
        outputs: { type: { response: { ok: "bool", error: "uint128" } } },
      } as TypedAbiFunction<
        [chainId_: TypedAbiArg<number | bigint, "chainId_">, gas: TypedAbiArg<number | bigint, "gas">],
        Response<boolean, bigint>
      >,
      setOtherChainIds: {
        name: "set-other-chain-ids",
        access: "public",
        args: [{ name: "value", type: { buffer: { length: 32 } } }],
        outputs: { type: { response: { ok: "bool", error: "uint128" } } },
      } as TypedAbiFunction<[value: TypedAbiArg<Uint8Array, "value">], Response<boolean, bigint>>,
      setPrimaryValidator: {
        name: "set-primary-validator",
        access: "public",
        args: [{ name: "val", type: { buffer: { length: 33 } } }],
        outputs: { type: { response: { ok: "bool", error: "uint128" } } },
      } as TypedAbiFunction<[val: TypedAbiArg<Uint8Array, "val">], Response<boolean, bigint>>,
      withdrawGasTokens: {
        name: "withdraw-gas-tokens",
        access: "public",
        args: [{ name: "amount", type: "uint128" }],
        outputs: { type: { response: { ok: "bool", error: "uint128" } } },
      } as TypedAbiFunction<[amount: TypedAbiArg<number | bigint, "amount">], Response<boolean, bigint>>,
      getGasOracle: {
        name: "get-gas-oracle",
        access: "read_only",
        args: [],
        outputs: { type: { response: { ok: "principal", error: "uint128" } } },
      } as TypedAbiFunction<[], Response<string, bigint>>,
      getGasUsage: {
        name: "get-gas-usage",
        access: "read_only",
        args: [{ name: "chain-id_", type: "uint128" }],
        outputs: { type: { response: { ok: "uint128", error: "uint128" } } },
      } as TypedAbiFunction<[chainId_: TypedAbiArg<number | bigint, "chainId_">], Response<bigint, bigint>>,
      getOtherChainIds: {
        name: "get-other-chain-ids",
        access: "read_only",
        args: [],
        outputs: { type: { response: { ok: { buffer: { length: 32 } }, error: "none" } } },
      } as TypedAbiFunction<[], Response<Uint8Array, null>>,
      getSentMessageBlock: {
        name: "get-sent-message-block",
        access: "read_only",
        args: [{ name: "message", type: { buffer: { length: 32 } } }],
        outputs: { type: { response: { ok: "uint128", error: "uint128" } } },
      } as TypedAbiFunction<[message: TypedAbiArg<Uint8Array, "message">], Response<bigint, bigint>>,
      getThisChainId: {
        name: "get-this-chain-id",
        access: "read_only",
        args: [],
        outputs: { type: { response: { ok: "uint128", error: "uint128" } } },
      } as TypedAbiFunction<[], Response<bigint, bigint>>,
      isMessageReceived: {
        name: "is-message-received",
        access: "read_only",
        args: [{ name: "message", type: { buffer: { length: 32 } } }],
        outputs: { type: { response: { ok: "bool", error: "none" } } },
      } as TypedAbiFunction<[message: TypedAbiArg<Uint8Array, "message">], Response<boolean, null>>,
    },
    maps: {
      gasUsageMap: { name: "gas-usage-map", key: "uint128", value: "uint128" } as TypedAbiMap<number | bigint, bigint>,
      receivedMessages: { name: "received-messages", key: { buffer: { length: 32 } }, value: "bool" } as TypedAbiMap<
        Uint8Array,
        boolean
      >,
      secondaryValidators: {
        name: "secondary-validators",
        key: { buffer: { length: 33 } },
        value: "bool",
      } as TypedAbiMap<Uint8Array, boolean>,
      sentMessagesBlock: {
        name: "sent-messages-block",
        key: { buffer: { length: 32 } },
        value: "uint128",
      } as TypedAbiMap<Uint8Array, bigint>,
    },
    variables: {
      errAlreadyInitialized: {
        name: "err-already-initialized",
        type: {
          response: {
            ok: "none",
            error: "uint128",
          },
        },
        access: "constant",
      } as TypedAbiVariable<Response<null, bigint>>,
      errAlreadySent: {
        name: "err-already-sent",
        type: {
          response: {
            ok: "none",
            error: "uint128",
          },
        },
        access: "constant",
      } as TypedAbiVariable<Response<null, bigint>>,
      errGasUsageNotSet: {
        name: "err-gas-usage-not-set",
        type: {
          response: {
            ok: "none",
            error: "uint128",
          },
        },
        access: "constant",
      } as TypedAbiVariable<Response<null, bigint>>,
      errInvalidChainId: {
        name: "err-invalid-chain-id",
        type: {
          response: {
            ok: "none",
            error: "uint128",
          },
        },
        access: "constant",
      } as TypedAbiVariable<Response<null, bigint>>,
      errInvalidDestination: {
        name: "err-invalid-destination",
        type: {
          response: {
            ok: "none",
            error: "uint128",
          },
        },
        access: "constant",
      } as TypedAbiVariable<Response<null, bigint>>,
      errInvalidPrimary: {
        name: "err-invalid-primary",
        type: {
          response: {
            ok: "none",
            error: "uint128",
          },
        },
        access: "constant",
      } as TypedAbiVariable<Response<null, bigint>>,
      errInvalidSecondary: {
        name: "err-invalid-secondary",
        type: {
          response: {
            ok: "none",
            error: "uint128",
          },
        },
        access: "constant",
      } as TypedAbiVariable<Response<null, bigint>>,
      errMessageNotFound: {
        name: "err-message-not-found",
        type: {
          response: {
            ok: "none",
            error: "uint128",
          },
        },
        access: "constant",
      } as TypedAbiVariable<Response<null, bigint>>,
      errNotInitialized: {
        name: "err-not-initialized",
        type: {
          response: {
            ok: "none",
            error: "uint128",
          },
        },
        access: "constant",
      } as TypedAbiVariable<Response<null, bigint>>,
      errUnauthorized: {
        name: "err-unauthorized",
        type: {
          response: {
            ok: "none",
            error: "uint128",
          },
        },
        access: "constant",
      } as TypedAbiVariable<Response<null, bigint>>,
      errWrongBufferLength: {
        name: "err-wrong-buffer-length",
        type: {
          response: {
            ok: "none",
            error: "uint128",
          },
        },
        access: "constant",
      } as TypedAbiVariable<Response<null, bigint>>,
      errWrongGasOracle: {
        name: "err-wrong-gas-oracle",
        type: {
          response: {
            ok: "none",
            error: "uint128",
          },
        },
        access: "constant",
      } as TypedAbiVariable<Response<null, bigint>>,
      gasOraclePrincipal: {
        name: "gas-oracle-principal",
        type: {
          optional: "principal",
        },
        access: "variable",
      } as TypedAbiVariable<string | null>,
      otherChainIds: {
        name: "other-chain-ids",
        type: {
          buffer: {
            length: 32,
          },
        },
        access: "variable",
      } as TypedAbiVariable<Uint8Array>,
      owner: {
        name: "owner",
        type: "principal",
        access: "variable",
      } as TypedAbiVariable<string>,
      primaryValidator: {
        name: "primary-validator",
        type: {
          buffer: {
            length: 33,
          },
        },
        access: "variable",
      } as TypedAbiVariable<Uint8Array>,
      thisChainId: {
        name: "this-chain-id",
        type: {
          optional: "uint128",
        },
        access: "variable",
      } as TypedAbiVariable<bigint | null>,
    },
    constants: {
      errAlreadyInitialized: {
        isOk: false,
        value: 3_008n,
      },
      errAlreadySent: {
        isOk: false,
        value: 3_003n,
      },
      errGasUsageNotSet: {
        isOk: false,
        value: 3_010n,
      },
      errInvalidChainId: {
        isOk: false,
        value: 3_002n,
      },
      errInvalidDestination: {
        isOk: false,
        value: 3_004n,
      },
      errInvalidPrimary: {
        isOk: false,
        value: 3_005n,
      },
      errInvalidSecondary: {
        isOk: false,
        value: 3_006n,
      },
      errMessageNotFound: {
        isOk: false,
        value: 3_001n,
      },
      errNotInitialized: {
        isOk: false,
        value: 3_011n,
      },
      errUnauthorized: {
        isOk: false,
        value: 3_000n,
      },
      errWrongBufferLength: {
        isOk: false,
        value: 3_009n,
      },
      errWrongGasOracle: {
        isOk: false,
        value: 3_007n,
      },
      gasOraclePrincipal: null,
      otherChainIds: Uint8Array.from([
        0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
      ]),
      owner: "ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM",
      primaryValidator: Uint8Array.from([
        0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
      ]),
      thisChainId: null,
    },
    non_fungible_tokens: [],
    fungible_tokens: [],
    epoch: "Epoch31",
    clarity_version: "Clarity3",
    contractName: "messenger",
  },
  messengerTrait: {
    functions: {},
    maps: {},
    variables: {},
    constants: {},
    non_fungible_tokens: [],
    fungible_tokens: [],
    epoch: "Epoch31",
    clarity_version: "Clarity3",
    contractName: "messenger-trait",
  },
  pool: {
    functions: {
      addRewards: {
        name: "add-rewards",
        access: "private",
        args: [{ name: "amount", type: "uint128" }],
        outputs: { type: { response: { ok: "bool", error: "none" } } },
      } as TypedAbiFunction<[amount: TypedAbiArg<number | bigint, "amount">], Response<boolean, null>>,
      assertBalanceReatio: {
        name: "assert-balance-reatio",
        access: "private",
        args: [],
        outputs: { type: { response: { ok: "bool", error: "uint128" } } },
      } as TypedAbiFunction<[], Response<boolean, bigint>>,
      assertCanDeposit: {
        name: "assert-can-deposit",
        access: "private",
        args: [],
        outputs: { type: { response: { ok: "bool", error: "uint128" } } },
      } as TypedAbiFunction<[], Response<boolean, bigint>>,
      assertCanSwap: {
        name: "assert-can-swap",
        access: "private",
        args: [],
        outputs: { type: { response: { ok: "bool", error: "uint128" } } },
      } as TypedAbiFunction<[], Response<boolean, bigint>>,
      assertCanWithdraw: {
        name: "assert-can-withdraw",
        access: "private",
        args: [],
        outputs: { type: { response: { ok: "bool", error: "uint128" } } },
      } as TypedAbiFunction<[], Response<boolean, bigint>>,
      assertToken: {
        name: "assert-token",
        access: "private",
        args: [{ name: "ft-ref", type: "trait_reference" }],
        outputs: { type: { response: { ok: "bool", error: "uint128" } } },
      } as TypedAbiFunction<[ftRef: TypedAbiArg<string, "ftRef">], Response<boolean, bigint>>,
      depositLp: {
        name: "deposit-lp",
        access: "private",
        args: [
          { name: "ft-ref", type: "trait_reference" },
          { name: "to", type: "principal" },
          { name: "lp-amount", type: "uint128" },
        ],
        outputs: { type: { response: { ok: "bool", error: "uint128" } } },
      } as TypedAbiFunction<
        [
          ftRef: TypedAbiArg<string, "ftRef">,
          to: TypedAbiArg<string, "to">,
          lpAmount: TypedAbiArg<number | bigint, "lpAmount">,
        ],
        Response<boolean, bigint>
      >,
      leCube_q: {
        name: "le-cube?",
        access: "private",
        args: [
          { name: "x", type: "uint128" },
          { name: "n", type: "uint128" },
        ],
        outputs: { type: "bool" },
      } as TypedAbiFunction<[x: TypedAbiArg<number | bigint, "x">, n: TypedAbiArg<number | bigint, "n">], boolean>,
      newtonStep: {
        name: "newton-step",
        access: "private",
        args: [
          { name: "n", type: "uint128" },
          { name: "x", type: "uint128" },
        ],
        outputs: { type: "uint128" },
      } as TypedAbiFunction<[n: TypedAbiArg<number | bigint, "n">, x: TypedAbiArg<number | bigint, "x">], bigint>,
      onlyBridge: {
        name: "only-bridge",
        access: "private",
        args: [],
        outputs: { type: { response: { ok: "bool", error: "uint128" } } },
      } as TypedAbiFunction<[], Response<boolean, bigint>>,
      onlyOwner: {
        name: "only-owner",
        access: "private",
        args: [],
        outputs: { type: { response: { ok: "bool", error: "uint128" } } },
      } as TypedAbiFunction<[], Response<boolean, bigint>>,
      onlyStopAuthority: {
        name: "only-stop-authority",
        access: "private",
        args: [],
        outputs: { type: { response: { ok: "bool", error: "uint128" } } },
      } as TypedAbiFunction<[], Response<boolean, bigint>>,
      refine: {
        name: "refine",
        access: "private",
        args: [
          { name: "n", type: "uint128" },
          { name: "x", type: "uint128" },
        ],
        outputs: { type: "uint128" },
      } as TypedAbiFunction<[n: TypedAbiArg<number | bigint, "n">, x: TypedAbiArg<number | bigint, "x">], bigint>,
      withdrawLp: {
        name: "withdraw-lp",
        access: "private",
        args: [
          { name: "ft-ref", type: "trait_reference" },
          { name: "from", type: "principal" },
          { name: "lp-amount", type: "uint128" },
        ],
        outputs: { type: { response: { ok: "bool", error: "uint128" } } },
      } as TypedAbiFunction<
        [
          ftRef: TypedAbiArg<string, "ftRef">,
          from: TypedAbiArg<string, "from">,
          lpAmount: TypedAbiArg<number | bigint, "lpAmount">,
        ],
        Response<boolean, bigint>
      >,
      adjustTotalLpAmount: {
        name: "adjust-total-lp-amount",
        access: "public",
        args: [{ name: "ft-ref", type: "trait_reference" }],
        outputs: { type: { response: { ok: "bool", error: "uint128" } } },
      } as TypedAbiFunction<[ftRef: TypedAbiArg<string, "ftRef">], Response<boolean, bigint>>,
      claimAdminFee: {
        name: "claim-admin-fee",
        access: "public",
        args: [{ name: "ft-ref", type: "trait_reference" }],
        outputs: { type: { response: { ok: "bool", error: "uint128" } } },
      } as TypedAbiFunction<[ftRef: TypedAbiArg<string, "ftRef">], Response<boolean, bigint>>,
      claimRewards: {
        name: "claim-rewards",
        access: "public",
        args: [{ name: "ft-ref", type: "trait_reference" }],
        outputs: { type: { response: { ok: "bool", error: "uint128" } } },
      } as TypedAbiFunction<[ftRef: TypedAbiArg<string, "ftRef">], Response<boolean, bigint>>,
      deposit: {
        name: "deposit",
        access: "public",
        args: [
          { name: "amount", type: "uint128" },
          { name: "ft-ref", type: "trait_reference" },
        ],
        outputs: { type: { response: { ok: "bool", error: "uint128" } } },
      } as TypedAbiFunction<
        [amount: TypedAbiArg<number | bigint, "amount">, ftRef: TypedAbiArg<string, "ftRef">],
        Response<boolean, bigint>
      >,
      init: {
        name: "init",
        access: "public",
        args: [
          { name: "token", type: "trait_reference" },
          { name: "bridge-address", type: "principal" },
          { name: "fee-share-bp-arg", type: "uint128" },
          { name: "balance-ratio-min-bp-arg", type: "uint128" },
        ],
        outputs: { type: { response: { ok: "bool", error: "uint128" } } },
      } as TypedAbiFunction<
        [
          token: TypedAbiArg<string, "token">,
          bridgeAddress: TypedAbiArg<string, "bridgeAddress">,
          feeShareBpArg: TypedAbiArg<number | bigint, "feeShareBpArg">,
          balanceRatioMinBpArg: TypedAbiArg<number | bigint, "balanceRatioMinBpArg">,
        ],
        Response<boolean, bigint>
      >,
      serBalanceRetioMinBp: {
        name: "ser-balance-retio-min-bp",
        access: "public",
        args: [{ name: "new-balance-ratio-min-bp", type: "uint128" }],
        outputs: { type: { response: { ok: "bool", error: "uint128" } } },
      } as TypedAbiFunction<
        [newBalanceRatioMinBp: TypedAbiArg<number | bigint, "newBalanceRatioMinBp">],
        Response<boolean, bigint>
      >,
      setAdminFeeSahreBp: {
        name: "set-admin-fee-sahre-bp",
        access: "public",
        args: [{ name: "new-admin-fee-share-bp", type: "uint128" }],
        outputs: { type: { response: { ok: "bool", error: "uint128" } } },
      } as TypedAbiFunction<
        [newAdminFeeShareBp: TypedAbiArg<number | bigint, "newAdminFeeShareBp">],
        Response<boolean, bigint>
      >,
      setBridge: {
        name: "set-bridge",
        access: "public",
        args: [{ name: "new-bridge", type: "principal" }],
        outputs: { type: { response: { ok: "bool", error: "uint128" } } },
      } as TypedAbiFunction<[newBridge: TypedAbiArg<string, "newBridge">], Response<boolean, bigint>>,
      setFeeShare: {
        name: "set-fee-share",
        access: "public",
        args: [{ name: "fee-share-bp_", type: "uint128" }],
        outputs: { type: { response: { ok: "bool", error: "uint128" } } },
      } as TypedAbiFunction<[feeShareBp_: TypedAbiArg<number | bigint, "feeShareBp_">], Response<boolean, bigint>>,
      setOwner: {
        name: "set-owner",
        access: "public",
        args: [{ name: "new-owner", type: "principal" }],
        outputs: { type: { response: { ok: "bool", error: "uint128" } } },
      } as TypedAbiFunction<[newOwner: TypedAbiArg<string, "newOwner">], Response<boolean, bigint>>,
      setStopAuthority: {
        name: "set-stop-authority",
        access: "public",
        args: [{ name: "new-stop-authority", type: "principal" }],
        outputs: { type: { response: { ok: "bool", error: "uint128" } } },
      } as TypedAbiFunction<[newStopAuthority: TypedAbiArg<string, "newStopAuthority">], Response<boolean, bigint>>,
      startDeposit: {
        name: "start-deposit",
        access: "public",
        args: [],
        outputs: { type: { response: { ok: "bool", error: "uint128" } } },
      } as TypedAbiFunction<[], Response<boolean, bigint>>,
      startSwap: {
        name: "start-swap",
        access: "public",
        args: [],
        outputs: { type: { response: { ok: "bool", error: "uint128" } } },
      } as TypedAbiFunction<[], Response<boolean, bigint>>,
      startWithdraw: {
        name: "start-withdraw",
        access: "public",
        args: [],
        outputs: { type: { response: { ok: "bool", error: "uint128" } } },
      } as TypedAbiFunction<[], Response<boolean, bigint>>,
      stopDeposit: {
        name: "stop-deposit",
        access: "public",
        args: [],
        outputs: { type: { response: { ok: "bool", error: "uint128" } } },
      } as TypedAbiFunction<[], Response<boolean, bigint>>,
      stopSwap: {
        name: "stop-swap",
        access: "public",
        args: [],
        outputs: { type: { response: { ok: "bool", error: "uint128" } } },
      } as TypedAbiFunction<[], Response<boolean, bigint>>,
      stopWithdraw: {
        name: "stop-withdraw",
        access: "public",
        args: [],
        outputs: { type: { response: { ok: "bool", error: "uint128" } } },
      } as TypedAbiFunction<[], Response<boolean, bigint>>,
      swapFromVusd: {
        name: "swap-from-vusd",
        access: "public",
        args: [
          { name: "ft-ref", type: "trait_reference" },
          { name: "user", type: "principal" },
          { name: "amount", type: "uint128" },
          { name: "receive-amount-min", type: "uint128" },
          { name: "zero-fee", type: "bool" },
        ],
        outputs: { type: { response: { ok: "uint128", error: "uint128" } } },
      } as TypedAbiFunction<
        [
          ftRef: TypedAbiArg<string, "ftRef">,
          user: TypedAbiArg<string, "user">,
          amount: TypedAbiArg<number | bigint, "amount">,
          receiveAmountMin: TypedAbiArg<number | bigint, "receiveAmountMin">,
          zeroFee: TypedAbiArg<boolean, "zeroFee">,
        ],
        Response<bigint, bigint>
      >,
      swapToVusd: {
        name: "swap-to-vusd",
        access: "public",
        args: [
          { name: "ft-ref", type: "trait_reference" },
          { name: "user", type: "principal" },
          { name: "amount", type: "uint128" },
          { name: "zero-fee", type: "bool" },
        ],
        outputs: { type: { response: { ok: "uint128", error: "uint128" } } },
      } as TypedAbiFunction<
        [
          ftRef: TypedAbiArg<string, "ftRef">,
          user: TypedAbiArg<string, "user">,
          amount: TypedAbiArg<number | bigint, "amount">,
          zeroFee: TypedAbiArg<boolean, "zeroFee">,
        ],
        Response<bigint, bigint>
      >,
      withdraw: {
        name: "withdraw",
        access: "public",
        args: [
          { name: "amount-lp", type: "uint128" },
          { name: "ft-ref", type: "trait_reference" },
        ],
        outputs: { type: { response: { ok: "bool", error: "uint128" } } },
      } as TypedAbiFunction<
        [amountLp: TypedAbiArg<number | bigint, "amountLp">, ftRef: TypedAbiArg<string, "ftRef">],
        Response<boolean, bigint>
      >,
      calcD: {
        name: "calc-d",
        access: "read_only",
        args: [
          { name: "x", type: "uint128" },
          { name: "y", type: "uint128" },
        ],
        outputs: { type: "uint128" },
      } as TypedAbiFunction<[x: TypedAbiArg<number | bigint, "x">, y: TypedAbiArg<number | bigint, "y">], bigint>,
      calcY: {
        name: "calc-y",
        access: "read_only",
        args: [
          { name: "x", type: "uint128" },
          { name: "d_", type: "uint128" },
        ],
        outputs: { type: "uint128" },
      } as TypedAbiFunction<[x: TypedAbiArg<number | bigint, "x">, d_: TypedAbiArg<number | bigint, "d_">], bigint>,
      cbrt: {
        name: "cbrt",
        access: "read_only",
        args: [{ name: "n", type: "uint128" }],
        outputs: { type: "uint128" },
      } as TypedAbiFunction<[n: TypedAbiArg<number | bigint, "n">], bigint>,
      fromSystemPrecision: {
        name: "from-system-precision",
        access: "read_only",
        args: [{ name: "amount", type: "uint128" }],
        outputs: { type: "uint128" },
      } as TypedAbiFunction<[amount: TypedAbiArg<number | bigint, "amount">], bigint>,
      getAccRewardPerShareP: {
        name: "get-acc-reward-per-share-p",
        access: "read_only",
        args: [],
        outputs: { type: "uint128" },
      } as TypedAbiFunction<[], bigint>,
      getAdminFeeAmount: {
        name: "get-admin-fee-amount",
        access: "read_only",
        args: [],
        outputs: { type: "uint128" },
      } as TypedAbiFunction<[], bigint>,
      getAdminFeeShareBp: {
        name: "get-admin-fee-share-bp",
        access: "read_only",
        args: [],
        outputs: { type: "uint128" },
      } as TypedAbiFunction<[], bigint>,
      getBalanceRatioMinBp: {
        name: "get-balance-ratio-min-bp",
        access: "read_only",
        args: [],
        outputs: { type: "uint128" },
      } as TypedAbiFunction<[], bigint>,
      getBridge: {
        name: "get-bridge",
        access: "read_only",
        args: [],
        outputs: { type: { optional: "principal" } },
      } as TypedAbiFunction<[], string | null>,
      getCanDeposit: {
        name: "get-can-deposit",
        access: "read_only",
        args: [],
        outputs: { type: "bool" },
      } as TypedAbiFunction<[], boolean>,
      getCanSwap: {
        name: "get-can-swap",
        access: "read_only",
        args: [],
        outputs: { type: "bool" },
      } as TypedAbiFunction<[], boolean>,
      getCanWithdraw: {
        name: "get-can-withdraw",
        access: "read_only",
        args: [],
        outputs: { type: "bool" },
      } as TypedAbiFunction<[], boolean>,
      getD: { name: "get-d", access: "read_only", args: [], outputs: { type: "uint128" } } as TypedAbiFunction<
        [],
        bigint
      >,
      getFeeShareBp: {
        name: "get-fee-share-bp",
        access: "read_only",
        args: [],
        outputs: { type: "uint128" },
      } as TypedAbiFunction<[], bigint>,
      getLpBalance: {
        name: "get-lp-balance",
        access: "read_only",
        args: [{ name: "user", type: "principal" }],
        outputs: { type: "uint128" },
      } as TypedAbiFunction<[user: TypedAbiArg<string, "user">], bigint>,
      getLpTotalSupply: {
        name: "get-lp-total-supply",
        access: "read_only",
        args: [],
        outputs: { type: "uint128" },
      } as TypedAbiFunction<[], bigint>,
      getOwner: {
        name: "get-owner",
        access: "read_only",
        args: [],
        outputs: { type: "principal" },
      } as TypedAbiFunction<[], string>,
      getReserves: {
        name: "get-reserves",
        access: "read_only",
        args: [],
        outputs: { type: "uint128" },
      } as TypedAbiFunction<[], bigint>,
      getStopAuthority: {
        name: "get-stop-authority",
        access: "read_only",
        args: [],
        outputs: { type: "principal" },
      } as TypedAbiFunction<[], string>,
      getTokenAddress: {
        name: "get-token-address",
        access: "read_only",
        args: [],
        outputs: { type: { response: { ok: "principal", error: "uint128" } } },
      } as TypedAbiFunction<[], Response<string, bigint>>,
      getTokenBalance: {
        name: "get-token-balance",
        access: "read_only",
        args: [],
        outputs: { type: "uint128" },
      } as TypedAbiFunction<[], bigint>,
      getUserRewardDebt: {
        name: "get-user-reward-debt",
        access: "read_only",
        args: [{ name: "user", type: "principal" }],
        outputs: { type: "uint128" },
      } as TypedAbiFunction<[user: TypedAbiArg<string, "user">], bigint>,
      getVusdBalance: {
        name: "get-vusd-balance",
        access: "read_only",
        args: [],
        outputs: { type: "uint128" },
      } as TypedAbiFunction<[], bigint>,
      pendingRewards: {
        name: "pending-rewards",
        access: "read_only",
        args: [{ name: "user", type: "principal" }],
        outputs: { type: { response: { ok: "uint128", error: "none" } } },
      } as TypedAbiFunction<[user: TypedAbiArg<string, "user">], Response<bigint, null>>,
      toSystemPrecision: {
        name: "to-system-precision",
        access: "read_only",
        args: [{ name: "amount", type: "uint128" }],
        outputs: { type: "uint128" },
      } as TypedAbiFunction<[amount: TypedAbiArg<number | bigint, "amount">], bigint>,
    },
    maps: {
      lpBalances: { name: "lp-balances", key: "principal", value: "uint128" } as TypedAbiMap<string, bigint>,
      userRewardDebt: { name: "user-reward-debt", key: "principal", value: "uint128" } as TypedAbiMap<string, bigint>,
    },
    variables: {
      BP: {
        name: "BP",
        type: "uint128",
        access: "constant",
      } as TypedAbiVariable<bigint>,
      P: {
        name: "P",
        type: "uint128",
        access: "constant",
      } as TypedAbiVariable<bigint>,
      a: {
        name: "a",
        type: "uint128",
        access: "constant",
      } as TypedAbiVariable<bigint>,
      errAlreadyInitialized: {
        name: "err-already-initialized",
        type: {
          response: {
            ok: "none",
            error: "uint128",
          },
        },
        access: "constant",
      } as TypedAbiVariable<Response<null, bigint>>,
      errDepositAmountTooSmall: {
        name: "err-deposit-amount-too-small",
        type: {
          response: {
            ok: "none",
            error: "uint128",
          },
        },
        access: "constant",
      } as TypedAbiVariable<Response<null, bigint>>,
      errDepositProhibited: {
        name: "err-deposit-prohibited",
        type: {
          response: {
            ok: "none",
            error: "uint128",
          },
        },
        access: "constant",
      } as TypedAbiVariable<Response<null, bigint>>,
      errLowTokenBalance: {
        name: "err-low-token-balance",
        type: {
          response: {
            ok: "none",
            error: "uint128",
          },
        },
        access: "constant",
      } as TypedAbiVariable<Response<null, bigint>>,
      errLowVusdBalance: {
        name: "err-low-vusd-balance",
        type: {
          response: {
            ok: "none",
            error: "uint128",
          },
        },
        access: "constant",
      } as TypedAbiVariable<Response<null, bigint>>,
      errNotEnoughLp: {
        name: "err-not-enough-lp",
        type: {
          response: {
            ok: "none",
            error: "uint128",
          },
        },
        access: "constant",
      } as TypedAbiVariable<Response<null, bigint>>,
      errNotEnoughReserves: {
        name: "err-not-enough-reserves",
        type: {
          response: {
            ok: "none",
            error: "uint128",
          },
        },
        access: "constant",
      } as TypedAbiVariable<Response<null, bigint>>,
      errNotInitialized: {
        name: "err-not-initialized",
        type: {
          response: {
            ok: "none",
            error: "uint128",
          },
        },
        access: "constant",
      } as TypedAbiVariable<Response<null, bigint>>,
      errPoolBalanceTooBig: {
        name: "err-pool-balance-too-big",
        type: {
          response: {
            ok: "none",
            error: "uint128",
          },
        },
        access: "constant",
      } as TypedAbiVariable<Response<null, bigint>>,
      errSlippage: {
        name: "err-slippage",
        type: {
          response: {
            ok: "none",
            error: "uint128",
          },
        },
        access: "constant",
      } as TypedAbiVariable<Response<null, bigint>>,
      errSwapProhibited: {
        name: "err-swap-prohibited",
        type: {
          response: {
            ok: "none",
            error: "uint128",
          },
        },
        access: "constant",
      } as TypedAbiVariable<Response<null, bigint>>,
      errTooLarge: {
        name: "err-too-large",
        type: {
          response: {
            ok: "none",
            error: "uint128",
          },
        },
        access: "constant",
      } as TypedAbiVariable<Response<null, bigint>>,
      errUnauthorized: {
        name: "err-unauthorized",
        type: {
          response: {
            ok: "none",
            error: "uint128",
          },
        },
        access: "constant",
      } as TypedAbiVariable<Response<null, bigint>>,
      errWithdrawProhibited: {
        name: "err-withdraw-prohibited",
        type: {
          response: {
            ok: "none",
            error: "uint128",
          },
        },
        access: "constant",
      } as TypedAbiVariable<Response<null, bigint>>,
      errWrongToken: {
        name: "err-wrong-token",
        type: {
          response: {
            ok: "none",
            error: "uint128",
          },
        },
        access: "constant",
      } as TypedAbiVariable<Response<null, bigint>>,
      errZeroChanges: {
        name: "err-zero-changes",
        type: {
          response: {
            ok: "none",
            error: "uint128",
          },
        },
        access: "constant",
      } as TypedAbiVariable<Response<null, bigint>>,
      errZeroDChanges: {
        name: "err-zero-d-changes",
        type: {
          response: {
            ok: "none",
            error: "uint128",
          },
        },
        access: "constant",
      } as TypedAbiVariable<Response<null, bigint>>,
      maxTokenBalance: {
        name: "max-token-balance",
        type: "uint128",
        access: "constant",
      } as TypedAbiVariable<bigint>,
      systemPrecision: {
        name: "system-precision",
        type: "uint128",
        access: "constant",
      } as TypedAbiVariable<bigint>,
      accRewardPerShareP: {
        name: "acc-reward-per-share-p",
        type: "uint128",
        access: "variable",
      } as TypedAbiVariable<bigint>,
      adminFeeAmount: {
        name: "admin-fee-amount",
        type: "uint128",
        access: "variable",
      } as TypedAbiVariable<bigint>,
      adminFeeShareBp: {
        name: "admin-fee-share-bp",
        type: "uint128",
        access: "variable",
      } as TypedAbiVariable<bigint>,
      balanceRatioMinBp: {
        name: "balance-ratio-min-bp",
        type: "uint128",
        access: "variable",
      } as TypedAbiVariable<bigint>,
      bridge: {
        name: "bridge",
        type: {
          optional: "principal",
        },
        access: "variable",
      } as TypedAbiVariable<string | null>,
      canDeposit: {
        name: "can-deposit",
        type: "bool",
        access: "variable",
      } as TypedAbiVariable<boolean>,
      canSwap: {
        name: "can-swap",
        type: "bool",
        access: "variable",
      } as TypedAbiVariable<boolean>,
      canWithdraw: {
        name: "can-withdraw",
        type: "bool",
        access: "variable",
      } as TypedAbiVariable<boolean>,
      d: {
        name: "d",
        type: "uint128",
        access: "variable",
      } as TypedAbiVariable<bigint>,
      feeShareBp: {
        name: "fee-share-bp",
        type: "uint128",
        access: "variable",
      } as TypedAbiVariable<bigint>,
      lpTotalSupply: {
        name: "lp-total-supply",
        type: "uint128",
        access: "variable",
      } as TypedAbiVariable<bigint>,
      owner: {
        name: "owner",
        type: "principal",
        access: "variable",
      } as TypedAbiVariable<string>,
      reserves: {
        name: "reserves",
        type: "uint128",
        access: "variable",
      } as TypedAbiVariable<bigint>,
      stopAuthority: {
        name: "stop-authority",
        type: "principal",
        access: "variable",
      } as TypedAbiVariable<string>,
      tokenAmountIncrease: {
        name: "token-amount-increase",
        type: "uint128",
        access: "variable",
      } as TypedAbiVariable<bigint>,
      tokenAmountReduce: {
        name: "token-amount-reduce",
        type: "uint128",
        access: "variable",
      } as TypedAbiVariable<bigint>,
      tokenBalance: {
        name: "token-balance",
        type: "uint128",
        access: "variable",
      } as TypedAbiVariable<bigint>,
      tokenPrincipal: {
        name: "token-principal",
        type: {
          optional: "principal",
        },
        access: "variable",
      } as TypedAbiVariable<string | null>,
      vusdBalance: {
        name: "vusd-balance",
        type: "uint128",
        access: "variable",
      } as TypedAbiVariable<bigint>,
    },
    constants: {
      BP: 10_000n,
      P: 48n,
      a: 20n,
      accRewardPerShareP: 0n,
      adminFeeAmount: 0n,
      adminFeeShareBp: 0n,
      balanceRatioMinBp: 0n,
      bridge: null,
      canDeposit: true,
      canSwap: true,
      canWithdraw: true,
      d: 0n,
      errAlreadyInitialized: {
        isOk: false,
        value: 2_007n,
      },
      errDepositAmountTooSmall: {
        isOk: false,
        value: 2_001n,
      },
      errDepositProhibited: {
        isOk: false,
        value: 2_013n,
      },
      errLowTokenBalance: {
        isOk: false,
        value: 2_012n,
      },
      errLowVusdBalance: {
        isOk: false,
        value: 2_011n,
      },
      errNotEnoughLp: {
        isOk: false,
        value: 2_010n,
      },
      errNotEnoughReserves: {
        isOk: false,
        value: 2_005n,
      },
      errNotInitialized: {
        isOk: false,
        value: 2_006n,
      },
      errPoolBalanceTooBig: {
        isOk: false,
        value: 2_002n,
      },
      errSlippage: {
        isOk: false,
        value: 2_009n,
      },
      errSwapProhibited: {
        isOk: false,
        value: 2_015n,
      },
      errTooLarge: {
        isOk: false,
        value: 2_016n,
      },
      errUnauthorized: {
        isOk: false,
        value: 2_000n,
      },
      errWithdrawProhibited: {
        isOk: false,
        value: 2_014n,
      },
      errWrongToken: {
        isOk: false,
        value: 2_008n,
      },
      errZeroChanges: {
        isOk: false,
        value: 2_003n,
      },
      errZeroDChanges: {
        isOk: false,
        value: 2_004n,
      },
      feeShareBp: 0n,
      lpTotalSupply: 0n,
      maxTokenBalance: 1_000_000_000_000n,
      owner: "ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM",
      reserves: 0n,
      stopAuthority: "ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM",
      systemPrecision: 3n,
      tokenAmountIncrease: 0n,
      tokenAmountReduce: 0n,
      tokenBalance: 0n,
      tokenPrincipal: null,
      vusdBalance: 0n,
    },
    non_fungible_tokens: [],
    fungible_tokens: [],
    epoch: "Epoch31",
    clarity_version: "Clarity3",
    contractName: "pool",
  },
  poolTrait: {
    functions: {},
    maps: {},
    variables: {},
    constants: {},
    non_fungible_tokens: [],
    fungible_tokens: [],
    epoch: "Epoch31",
    clarity_version: "Clarity3",
    contractName: "pool-trait",
  },
  sip010TraitFtStandard: {
    functions: {},
    maps: {},
    variables: {},
    constants: {},
    non_fungible_tokens: [],
    fungible_tokens: [],
    epoch: "Epoch21",
    clarity_version: "Clarity1",
    contractName: "sip-010-trait-ft-standard",
  },
  utils: {
    functions: {
      assertNotEmptyBuff32: {
        name: "assert-not-empty-buff-32",
        access: "read_only",
        args: [{ name: "b", type: { buffer: { length: 32 } } }],
        outputs: { type: { response: { ok: "bool", error: "uint128" } } },
      } as TypedAbiFunction<[b: TypedAbiArg<Uint8Array, "b">], Response<boolean, bigint>>,
      bufferByte: {
        name: "buffer-byte",
        access: "read_only",
        args: [
          { name: "b", type: { buffer: { length: 32 } } },
          { name: "i", type: "uint128" },
        ],
        outputs: { type: { response: { ok: { buffer: { length: 1 } }, error: "uint128" } } },
      } as TypedAbiFunction<
        [b: TypedAbiArg<Uint8Array, "b">, i: TypedAbiArg<number | bigint, "i">],
        Response<Uint8Array, bigint>
      >,
      bufferByteUint: {
        name: "buffer-byte-uint",
        access: "read_only",
        args: [
          { name: "b", type: { buffer: { length: 32 } } },
          { name: "i", type: "uint128" },
        ],
        outputs: { type: { response: { ok: "uint128", error: "uint128" } } },
      } as TypedAbiFunction<
        [b: TypedAbiArg<Uint8Array, "b">, i: TypedAbiArg<number | bigint, "i">],
        Response<bigint, bigint>
      >,
      hashMessage: {
        name: "hash-message",
        access: "read_only",
        args: [
          { name: "amount", type: "uint128" },
          { name: "recipient", type: { buffer: { length: 32 } } },
          { name: "source-chain-id", type: "uint128" },
          { name: "destination-chain-id", type: "uint128" },
          { name: "receive-token", type: { buffer: { length: 32 } } },
          { name: "nonce", type: { buffer: { length: 32 } } },
          { name: "messenger-id", type: "uint128" },
        ],
        outputs: { type: { response: { ok: { buffer: { length: 32 } }, error: "uint128" } } },
      } as TypedAbiFunction<
        [
          amount: TypedAbiArg<number | bigint, "amount">,
          recipient: TypedAbiArg<Uint8Array, "recipient">,
          sourceChainId: TypedAbiArg<number | bigint, "sourceChainId">,
          destinationChainId: TypedAbiArg<number | bigint, "destinationChainId">,
          receiveToken: TypedAbiArg<Uint8Array, "receiveToken">,
          nonce: TypedAbiArg<Uint8Array, "nonce">,
          messengerId: TypedAbiArg<number | bigint, "messengerId">,
        ],
        Response<Uint8Array, bigint>
      >,
      hashWithSenderAddress: {
        name: "hash-with-sender-address",
        access: "read_only",
        args: [
          { name: "message", type: { buffer: { length: 32 } } },
          { name: "sender", type: { buffer: { length: 32 } } },
        ],
        outputs: { type: { response: { ok: { buffer: { length: 32 } }, error: "uint128" } } },
      } as TypedAbiFunction<
        [message: TypedAbiArg<Uint8Array, "message">, sender: TypedAbiArg<Uint8Array, "sender">],
        Response<Uint8Array, bigint>
      >,
      principalHash: {
        name: "principal-hash",
        access: "read_only",
        args: [{ name: "value", type: "principal" }],
        outputs: { type: { buffer: { length: 32 } } },
      } as TypedAbiFunction<[value: TypedAbiArg<string, "value">], Uint8Array>,
      principalToBuff32: {
        name: "principal-to-buff32",
        access: "read_only",
        args: [{ name: "value", type: "principal" }],
        outputs: { type: { buffer: { length: 32 } } },
      } as TypedAbiFunction<[value: TypedAbiArg<string, "value">], Uint8Array>,
      stringToBuff: {
        name: "string-to-buff",
        access: "read_only",
        args: [{ name: "str", type: { "string-ascii": { length: 40 } } }],
        outputs: { type: { buffer: { length: 45 } } },
      } as TypedAbiFunction<[str: TypedAbiArg<string, "str">], Uint8Array>,
      uintToBuff1: {
        name: "uint-to-buff-1",
        access: "read_only",
        args: [{ name: "value", type: "uint128" }],
        outputs: { type: { buffer: { length: 17 } } },
      } as TypedAbiFunction<[value: TypedAbiArg<number | bigint, "value">], Uint8Array>,
      uintToBuff32: {
        name: "uint-to-buff-32",
        access: "read_only",
        args: [{ name: "value", type: "uint128" }],
        outputs: { type: { buffer: { length: 33 } } },
      } as TypedAbiFunction<[value: TypedAbiArg<number | bigint, "value">], Uint8Array>,
    },
    maps: {},
    variables: {
      errEmptyBuffer: {
        name: "err-empty-buffer",
        type: {
          response: {
            ok: "none",
            error: "uint128",
          },
        },
        access: "constant",
      } as TypedAbiVariable<Response<null, bigint>>,
      errWrongBufferLength: {
        name: "err-wrong-buffer-length",
        type: {
          response: {
            ok: "none",
            error: "uint128",
          },
        },
        access: "constant",
      } as TypedAbiVariable<Response<null, bigint>>,
      errWrongMsgLength: {
        name: "err-wrong-msg-length",
        type: {
          response: {
            ok: "none",
            error: "uint128",
          },
        },
        access: "constant",
      } as TypedAbiVariable<Response<null, bigint>>,
      thisChainId: {
        name: "this-chain-id",
        type: "uint128",
        access: "constant",
      } as TypedAbiVariable<bigint>,
      zeroBytes12: {
        name: "zero-bytes-12",
        type: {
          buffer: {
            length: 12,
          },
        },
        access: "constant",
      } as TypedAbiVariable<Uint8Array>,
      zeroBytes16: {
        name: "zero-bytes-16",
        type: {
          buffer: {
            length: 16,
          },
        },
        access: "constant",
      } as TypedAbiVariable<Uint8Array>,
      zeroBytes32: {
        name: "zero-bytes-32",
        type: {
          buffer: {
            length: 32,
          },
        },
        access: "constant",
      } as TypedAbiVariable<Uint8Array>,
    },
    constants: {
      errEmptyBuffer: {
        isOk: false,
        value: 5_002n,
      },
      errWrongBufferLength: {
        isOk: false,
        value: 5_000n,
      },
      errWrongMsgLength: {
        isOk: false,
        value: 5_001n,
      },
      thisChainId: 16n,
      zeroBytes12: Uint8Array.from([0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]),
      zeroBytes16: Uint8Array.from([0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]),
      zeroBytes32: Uint8Array.from([
        0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
      ]),
    },
    non_fungible_tokens: [],
    fungible_tokens: [],
    epoch: "Epoch31",
    clarity_version: "Clarity3",
    contractName: "utils",
  },
} as const;
