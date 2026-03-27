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
          internalType: "address",
          name: "tokenAddress",
          type: "address",
        },
        {
          internalType: "address",
          name: "xReserve_",
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
          name: "amount",
          type: "uint256",
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
          name: "adminFeeTokenAmount",
          type: "uint256",
        },
        {
          indexed: false,
          internalType: "uint256",
          name: "maxFee",
          type: "uint256",
        },
      ],
      name: "TokensSent",
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
      ],
      name: "bridge",
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
      ],
      name: "bridgeWithWalletAddress",
      outputs: [],
      stateMutability: "nonpayable",
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
      inputs: [],
      name: "maxFeeShare",
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
          internalType: "uint256",
          name: "maxFeeShare_",
          type: "uint256",
        },
      ],
      name: "setMaxFeeShare",
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
      stateMutability: "payable",
      type: "receive",
    },
  ],
} as const;
export default artifact;
