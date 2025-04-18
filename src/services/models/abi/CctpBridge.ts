const artifact = {
  abi: [
    {
      inputs: [
        {
          internalType: "uint256",
          name: "chainId_",
          type: "uint256",
        },
        {
          internalType: "uint256",
          name: "chainPrecision_",
          type: "uint256",
        },
        {
          internalType: "address",
          name: "tokenAddress",
          type: "address",
        },
        {
          internalType: "address",
          name: "cctpMessenger_",
          type: "address",
        },
        {
          internalType: "address",
          name: "cctpTransmitter_",
          type: "address",
        },
        {
          internalType: "contract IGasOracle",
          name: "gasOracle_",
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
          internalType: "address",
          name: "recipient",
          type: "address",
        },
        {
          indexed: false,
          internalType: "uint256",
          name: "amount",
          type: "uint256",
        },
      ],
      name: "ReceivedExtraGas",
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
      name: "ReceivedGas",
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
          name: "nonce",
          type: "uint256",
        },
        {
          indexed: false,
          internalType: "bytes32",
          name: "newRecipient",
          type: "bytes32",
        },
      ],
      name: "RecipientReplaced",
      type: "event",
    },
    {
      anonymous: false,
      inputs: [
        {
          indexed: false,
          internalType: "bytes32",
          name: "recipientWalletAddress",
          type: "bytes32",
        },
      ],
      name: "TokensSentExtras",
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
          internalType: "address",
          name: "sender",
          type: "address",
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
          internalType: "uint256",
          name: "nonce",
          type: "uint256",
        },
        {
          indexed: false,
          internalType: "uint256",
          name: "receivedRelayerFeeFromGas",
          type: "uint256",
        },
        {
          indexed: false,
          internalType: "uint256",
          name: "receivedRelayerFeeFromTokens",
          type: "uint256",
        },
        {
          indexed: false,
          internalType: "uint256",
          name: "relayerFee",
          type: "uint256",
        },
        {
          indexed: false,
          internalType: "uint256",
          name: "receivedRelayerFeeTokenAmount",
          type: "uint256",
        },
        {
          indexed: false,
          internalType: "uint256",
          name: "adminFeeTokenAmount",
          type: "uint256",
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
      inputs: [],
      name: "adminFeeShareBP",
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
          internalType: "uint256",
          name: "relayerFeeTokenAmount",
          type: "uint256",
        },
      ],
      name: "bridge",
      outputs: [],
      stateMutability: "payable",
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
          internalType: "bytes32",
          name: "recipientWalletAddress",
          type: "bytes32",
        },
        {
          internalType: "uint256",
          name: "destinationChainId",
          type: "uint256",
        },
        {
          internalType: "uint256",
          name: "relayerFeeTokenAmount",
          type: "uint256",
        },
      ],
      name: "bridgeWithWalletAddress",
      outputs: [],
      stateMutability: "payable",
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
          internalType: "bytes",
          name: "originalMessage",
          type: "bytes",
        },
        {
          internalType: "bytes",
          name: "originalAttestation",
          type: "bytes",
        },
        {
          internalType: "bytes32",
          name: "newRecipient",
          type: "bytes32",
        },
      ],
      name: "changeRecipient",
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
          name: "chainId_",
          type: "uint256",
        },
      ],
      name: "getDomainByChainId",
      outputs: [
        {
          internalType: "uint32",
          name: "",
          type: "uint32",
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
          internalType: "uint256",
          name: "sourceChainId",
          type: "uint256",
        },
        {
          internalType: "uint64",
          name: "nonce",
          type: "uint64",
        },
      ],
      name: "isMessageProcessed",
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
          internalType: "address",
          name: "recipient",
          type: "address",
        },
        {
          internalType: "bytes",
          name: "message",
          type: "bytes",
        },
        {
          internalType: "bytes",
          name: "signature",
          type: "bytes",
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
          name: "chainId_",
          type: "uint256",
        },
        {
          internalType: "uint32",
          name: "domain",
          type: "uint32",
        },
      ],
      name: "registerBridgeDestination",
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
          internalType: "uint256",
          name: "adminFeeShareBP_",
          type: "uint256",
        },
      ],
      name: "setAdminFeeShare",
      outputs: [],
      stateMutability: "nonpayable",
      type: "function",
    },
    {
      inputs: [
        {
          internalType: "contract IGasOracle",
          name: "gasOracle_",
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
          internalType: "uint256",
          name: "chainId_",
          type: "uint256",
        },
      ],
      name: "unregisterBridgeDestination",
      outputs: [],
      stateMutability: "nonpayable",
      type: "function",
    },
    {
      inputs: [],
      name: "withdrawFeeInTokens",
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
      name: "withdrawGas",
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
