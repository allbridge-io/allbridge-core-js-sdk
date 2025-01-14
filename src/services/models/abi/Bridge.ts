const artifact = {
  abi: [
    {
      inputs: [
        {
          internalType: "uint256",
          name: "_chainId",
          type: "uint256",
        },
        {
          internalType: "uint256",
          name: "_chainPrecision",
          type: "uint256",
        },
        {
          internalType: "contract Messenger",
          name: "_allbridgeMessenger",
          type: "address",
        },
        {
          internalType: "contract WormholeMessenger",
          name: "_wormholeMessenger",
          type: "address",
        },
        {
          internalType: "contract IGasOracle",
          name: "_gasOracle",
          type: "address",
        },
      ],
      stateMutability: "nonpayable",
      type: "constructor",
    },
    {
      anonymous: false,
      inputs: [
        {
          indexed: false,
          internalType: "uint256",
          name: "gas",
          type: "uint256",
        },
      ],
      name: "BridgingFeeFromTokens",
      type: "event",
    },
    {
      anonymous: false,
      inputs: [
        {
          indexed: true,
          internalType: "address",
          name: "previousOwner",
          type: "address",
        },
        {
          indexed: true,
          internalType: "address",
          name: "newOwner",
          type: "address",
        },
      ],
      name: "OwnershipTransferred",
      type: "event",
    },
    {
      anonymous: false,
      inputs: [
        {
          indexed: false,
          internalType: "uint256",
          name: "bridgeTransactionCost",
          type: "uint256",
        },
        {
          indexed: false,
          internalType: "uint256",
          name: "messageTransactionCost",
          type: "uint256",
        },
      ],
      name: "ReceiveFee",
      type: "event",
    },
    {
      anonymous: false,
      inputs: [
        {
          indexed: false,
          internalType: "address",
          name: "sender",
          type: "address",
        },
        {
          indexed: false,
          internalType: "uint256",
          name: "amount",
          type: "uint256",
        },
      ],
      name: "Received",
      type: "event",
    },
    {
      anonymous: false,
      inputs: [
        {
          indexed: false,
          internalType: "address",
          name: "sender",
          type: "address",
        },
        {
          indexed: false,
          internalType: "address",
          name: "recipient",
          type: "address",
        },
        {
          indexed: false,
          internalType: "bytes32",
          name: "sendToken",
          type: "bytes32",
        },
        {
          indexed: false,
          internalType: "bytes32",
          name: "receiveToken",
          type: "bytes32",
        },
        {
          indexed: false,
          internalType: "uint256",
          name: "sendAmount",
          type: "uint256",
        },
        {
          indexed: false,
          internalType: "uint256",
          name: "receiveAmount",
          type: "uint256",
        },
      ],
      name: "Swapped",
      type: "event",
    },
    {
      anonymous: false,
      inputs: [
        {
          indexed: false,
          internalType: "uint256",
          name: "amount",
          type: "uint256",
        },
        {
          indexed: false,
          internalType: "bytes32",
          name: "recipient",
          type: "bytes32",
        },
        {
          indexed: false,
          internalType: "uint256",
          name: "nonce",
          type: "uint256",
        },
        {
          indexed: false,
          internalType: "enum MessengerProtocol",
          name: "messenger",
          type: "uint8",
        },
        {
          indexed: false,
          internalType: "bytes32",
          name: "message",
          type: "bytes32",
        },
      ],
      name: "TokensReceived",
      type: "event",
    },
    {
      anonymous: false,
      inputs: [
        {
          indexed: false,
          internalType: "uint256",
          name: "amount",
          type: "uint256",
        },
        {
          indexed: false,
          internalType: "bytes32",
          name: "recipient",
          type: "bytes32",
        },
        {
          indexed: false,
          internalType: "uint256",
          name: "destinationChainId",
          type: "uint256",
        },
        {
          indexed: false,
          internalType: "bytes32",
          name: "receiveToken",
          type: "bytes32",
        },
        {
          indexed: false,
          internalType: "uint256",
          name: "nonce",
          type: "uint256",
        },
        {
          indexed: false,
          internalType: "enum MessengerProtocol",
          name: "messenger",
          type: "uint8",
        },
      ],
      name: "TokensSent",
      type: "event",
    },
    {
      stateMutability: "payable",
      type: "fallback",
    },
    {
      inputs: [
        {
          internalType: "uint256",
          name: "_chainId",
          type: "uint256",
        },
        {
          internalType: "bytes32",
          name: "tokenAddress",
          type: "bytes32",
        },
      ],
      name: "addBridgeToken",
      outputs: [],
      stateMutability: "nonpayable",
      type: "function",
    },
    {
      inputs: [
        {
          internalType: "contract Pool",
          name: "pool",
          type: "address",
        },
        {
          internalType: "bytes32",
          name: "token",
          type: "bytes32",
        },
      ],
      name: "addPool",
      outputs: [],
      stateMutability: "nonpayable",
      type: "function",
    },
    {
      inputs: [],
      name: "canSwap",
      outputs: [
        {
          internalType: "uint8",
          name: "",
          type: "uint8",
        },
      ],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [],
      name: "chainId",
      outputs: [
        {
          internalType: "uint256",
          name: "",
          type: "uint256",
        },
      ],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [
        {
          internalType: "uint256",
          name: "chainId",
          type: "uint256",
        },
      ],
      name: "gasUsage",
      outputs: [
        {
          internalType: "uint256",
          name: "amount",
          type: "uint256",
        },
      ],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [
        {
          internalType: "uint256",
          name: "destinationChainId",
          type: "uint256",
        },
        {
          internalType: "enum MessengerProtocol",
          name: "messenger",
          type: "uint8",
        },
        {
          internalType: "address",
          name: "tokenAddress",
          type: "address",
        },
      ],
      name: "getBridgingCostInTokens",
      outputs: [
        {
          internalType: "uint256",
          name: "",
          type: "uint256",
        },
      ],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [
        {
          internalType: "uint256",
          name: "chainId",
          type: "uint256",
        },
        {
          internalType: "enum MessengerProtocol",
          name: "protocol",
          type: "uint8",
        },
      ],
      name: "getMessageCost",
      outputs: [
        {
          internalType: "uint256",
          name: "",
          type: "uint256",
        },
      ],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [
        {
          internalType: "uint256",
          name: "chainId",
          type: "uint256",
        },
        {
          internalType: "enum MessengerProtocol",
          name: "protocol",
          type: "uint8",
        },
      ],
      name: "getMessageGasUsage",
      outputs: [
        {
          internalType: "uint256",
          name: "",
          type: "uint256",
        },
      ],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [
        {
          internalType: "uint256",
          name: "chainId",
          type: "uint256",
        },
      ],
      name: "getTransactionCost",
      outputs: [
        {
          internalType: "uint256",
          name: "",
          type: "uint256",
        },
      ],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [
        {
          internalType: "bytes32",
          name: "message",
          type: "bytes32",
        },
        {
          internalType: "enum MessengerProtocol",
          name: "protocol",
          type: "uint8",
        },
      ],
      name: "hasReceivedMessage",
      outputs: [
        {
          internalType: "bool",
          name: "",
          type: "bool",
        },
      ],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [
        {
          internalType: "bytes32",
          name: "message",
          type: "bytes32",
        },
      ],
      name: "hasSentMessage",
      outputs: [
        {
          internalType: "bool",
          name: "",
          type: "bool",
        },
      ],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [
        {
          internalType: "uint256",
          name: "amount",
          type: "uint256",
        },
        {
          internalType: "bytes32",
          name: "recipient",
          type: "bytes32",
        },
        {
          internalType: "uint256",
          name: "sourceChainId",
          type: "uint256",
        },
        {
          internalType: "uint256",
          name: "destinationChainId",
          type: "uint256",
        },
        {
          internalType: "bytes32",
          name: "receiveToken",
          type: "bytes32",
        },
        {
          internalType: "uint256",
          name: "nonce",
          type: "uint256",
        },
        {
          internalType: "enum MessengerProtocol",
          name: "messenger",
          type: "uint8",
        },
      ],
      name: "hashMessage",
      outputs: [
        {
          internalType: "bytes32",
          name: "",
          type: "bytes32",
        },
      ],
      stateMutability: "pure",
      type: "function",
    },
    {
      inputs: [
        {
          internalType: "uint256",
          name: "chainId",
          type: "uint256",
        },
        {
          internalType: "bytes32",
          name: "tokenAddress",
          type: "bytes32",
        },
      ],
      name: "otherBridgeTokens",
      outputs: [
        {
          internalType: "bool",
          name: "isSupported",
          type: "bool",
        },
      ],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [
        {
          internalType: "uint256",
          name: "chainId",
          type: "uint256",
        },
      ],
      name: "otherBridges",
      outputs: [
        {
          internalType: "bytes32",
          name: "bridgeAddress",
          type: "bytes32",
        },
      ],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [],
      name: "owner",
      outputs: [
        {
          internalType: "address",
          name: "",
          type: "address",
        },
      ],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [
        {
          internalType: "bytes32",
          name: "tokenId",
          type: "bytes32",
        },
      ],
      name: "pools",
      outputs: [
        {
          internalType: "contract Pool",
          name: "",
          type: "address",
        },
      ],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [
        {
          internalType: "bytes32",
          name: "messageHash",
          type: "bytes32",
        },
      ],
      name: "processedMessages",
      outputs: [
        {
          internalType: "uint256",
          name: "isProcessed",
          type: "uint256",
        },
      ],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [
        {
          internalType: "uint256",
          name: "amount",
          type: "uint256",
        },
        {
          internalType: "bytes32",
          name: "recipient",
          type: "bytes32",
        },
        {
          internalType: "uint256",
          name: "sourceChainId",
          type: "uint256",
        },
        {
          internalType: "bytes32",
          name: "receiveToken",
          type: "bytes32",
        },
        {
          internalType: "uint256",
          name: "nonce",
          type: "uint256",
        },
        {
          internalType: "enum MessengerProtocol",
          name: "messenger",
          type: "uint8",
        },
        {
          internalType: "uint256",
          name: "receiveAmountMin",
          type: "uint256",
        },
      ],
      name: "receiveTokens",
      outputs: [],
      stateMutability: "payable",
      type: "function",
    },
    {
      inputs: [
        {
          internalType: "uint256",
          name: "_chainId",
          type: "uint256",
        },
        {
          internalType: "bytes32",
          name: "bridgeAddress",
          type: "bytes32",
        },
      ],
      name: "registerBridge",
      outputs: [],
      stateMutability: "nonpayable",
      type: "function",
    },
    {
      inputs: [
        {
          internalType: "uint256",
          name: "_chainId",
          type: "uint256",
        },
        {
          internalType: "bytes32",
          name: "tokenAddress",
          type: "bytes32",
        },
      ],
      name: "removeBridgeToken",
      outputs: [],
      stateMutability: "nonpayable",
      type: "function",
    },
    {
      inputs: [],
      name: "renounceOwnership",
      outputs: [],
      stateMutability: "nonpayable",
      type: "function",
    },
    {
      inputs: [
        {
          internalType: "bytes32",
          name: "messageHash",
          type: "bytes32",
        },
      ],
      name: "sentMessages",
      outputs: [
        {
          internalType: "uint256",
          name: "isSent",
          type: "uint256",
        },
      ],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [
        {
          internalType: "contract Messenger",
          name: "_allbridgeMessenger",
          type: "address",
        },
      ],
      name: "setAllbridgeMessenger",
      outputs: [],
      stateMutability: "nonpayable",
      type: "function",
    },
    {
      inputs: [
        {
          internalType: "contract IGasOracle",
          name: "_gasOracle",
          type: "address",
        },
      ],
      name: "setGasOracle",
      outputs: [],
      stateMutability: "nonpayable",
      type: "function",
    },
    {
      inputs: [
        {
          internalType: "uint256",
          name: "chainId",
          type: "uint256",
        },
        {
          internalType: "uint256",
          name: "gasAmount",
          type: "uint256",
        },
      ],
      name: "setGasUsage",
      outputs: [],
      stateMutability: "nonpayable",
      type: "function",
    },
    {
      inputs: [
        {
          internalType: "address",
          name: "_rebalancer",
          type: "address",
        },
      ],
      name: "setRebalancer",
      outputs: [],
      stateMutability: "nonpayable",
      type: "function",
    },
    {
      inputs: [
        {
          internalType: "address",
          name: "_stopAuthority",
          type: "address",
        },
      ],
      name: "setStopAuthority",
      outputs: [],
      stateMutability: "nonpayable",
      type: "function",
    },
    {
      inputs: [
        {
          internalType: "contract WormholeMessenger",
          name: "_wormholeMessenger",
          type: "address",
        },
      ],
      name: "setWormholeMessenger",
      outputs: [],
      stateMutability: "nonpayable",
      type: "function",
    },
    {
      inputs: [],
      name: "startSwap",
      outputs: [],
      stateMutability: "nonpayable",
      type: "function",
    },
    {
      inputs: [],
      name: "stopSwap",
      outputs: [],
      stateMutability: "nonpayable",
      type: "function",
    },
    {
      inputs: [
        {
          internalType: "uint256",
          name: "amount",
          type: "uint256",
        },
        {
          internalType: "bytes32",
          name: "token",
          type: "bytes32",
        },
        {
          internalType: "bytes32",
          name: "receiveToken",
          type: "bytes32",
        },
        {
          internalType: "address",
          name: "recipient",
          type: "address",
        },
        {
          internalType: "uint256",
          name: "receiveAmountMin",
          type: "uint256",
        },
      ],
      name: "swap",
      outputs: [],
      stateMutability: "nonpayable",
      type: "function",
    },
    {
      inputs: [
        {
          internalType: "bytes32",
          name: "token",
          type: "bytes32",
        },
        {
          internalType: "uint256",
          name: "amount",
          type: "uint256",
        },
        {
          internalType: "bytes32",
          name: "recipient",
          type: "bytes32",
        },
        {
          internalType: "uint256",
          name: "destinationChainId",
          type: "uint256",
        },
        {
          internalType: "bytes32",
          name: "receiveToken",
          type: "bytes32",
        },
        {
          internalType: "uint256",
          name: "nonce",
          type: "uint256",
        },
        {
          internalType: "enum MessengerProtocol",
          name: "messenger",
          type: "uint8",
        },
        {
          internalType: "uint256",
          name: "feeTokenAmount",
          type: "uint256",
        },
      ],
      name: "swapAndBridge",
      outputs: [],
      stateMutability: "payable",
      type: "function",
    },
    {
      inputs: [
        {
          internalType: "address",
          name: "newOwner",
          type: "address",
        },
      ],
      name: "transferOwnership",
      outputs: [],
      stateMutability: "nonpayable",
      type: "function",
    },
    {
      inputs: [
        {
          internalType: "contract IERC20",
          name: "token",
          type: "address",
        },
      ],
      name: "withdrawBridgingFeeInTokens",
      outputs: [],
      stateMutability: "nonpayable",
      type: "function",
    },
    {
      inputs: [
        {
          internalType: "uint256",
          name: "amount",
          type: "uint256",
        },
      ],
      name: "withdrawGasTokens",
      outputs: [],
      stateMutability: "nonpayable",
      type: "function",
    },
    {
      stateMutability: "payable",
      type: "receive",
    },
  ],
} as const;
export default artifact;
