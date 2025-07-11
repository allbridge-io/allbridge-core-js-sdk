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
          internalType: "contract IGasOracle",
          name: "gasOracle_",
          type: "address",
        },
      ],
      stateMutability: "nonpayable",
      type: "constructor",
    },
    {
      inputs: [
        {
          internalType: "uint16",
          name: "optionType",
          type: "uint16",
        },
      ],
      name: "InvalidOptionType",
      type: "error",
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
          internalType: "address",
          name: "tokenAddress",
          type: "address",
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
          name: "relayerFeeWithExtraGas",
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
        {
          indexed: false,
          internalType: "uint256",
          name: "extraGasDestinationToken",
          type: "uint256",
        },
      ],
      name: "OftTokensSent",
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
      stateMutability: "payable",
      type: "fallback",
    },
    {
      inputs: [
        {
          internalType: "address",
          name: "oft_",
          type: "address",
        },
      ],
      name: "addToken",
      outputs: [],
      stateMutability: "nonpayable",
      type: "function",
    },
    {
      inputs: [
        {
          internalType: "address",
          name: "tokenAddress",
          type: "address",
        },
      ],
      name: "adminFeeShareBP",
      outputs: [
        {
          internalType: "uint256",
          name: "feeShare",
          type: "uint256",
        },
      ],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [
        {
          internalType: "address",
          name: "tokenAddress",
          type: "address",
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
          internalType: "uint256",
          name: "relayerFeeTokenAmount",
          type: "uint256",
        },
        {
          internalType: "uint256",
          name: "extraGasInDestinationToken",
          type: "uint256",
        },
        {
          internalType: "uint256",
          name: "slippageBP",
          type: "uint256",
        },
      ],
      name: "bridge",
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
          internalType: "address",
          name: "tokenAddress_",
          type: "address",
        },
        {
          internalType: "uint256",
          name: "destinationChainId_",
          type: "uint256",
        },
        {
          internalType: "uint128",
          name: "extraGasAmount_",
          type: "uint128",
        },
      ],
      name: "extraGasPrice",
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
      name: "getEidByChainId",
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
          internalType: "address",
          name: "tokenAddress",
          type: "address",
        },
      ],
      name: "oftAddress",
      outputs: [
        {
          internalType: "address",
          name: "oftAddress",
          type: "address",
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
          name: "eid_",
          type: "uint32",
        },
        {
          internalType: "uint128",
          name: "lzGasLimit_",
          type: "uint128",
        },
      ],
      name: "registerBridgeDestination",
      outputs: [],
      stateMutability: "nonpayable",
      type: "function",
    },
    {
      inputs: [
        {
          internalType: "address",
          name: "tokenAddress_",
          type: "address",
        },
        {
          internalType: "uint256",
          name: "destinationChainId_",
          type: "uint256",
        },
      ],
      name: "relayerFee",
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
          internalType: "address",
          name: "oft_",
          type: "address",
        },
      ],
      name: "removeToken",
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
          internalType: "address",
          name: "tokenAddress_",
          type: "address",
        },
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
          name: "chainId_",
          type: "uint256",
        },
        {
          internalType: "uint128",
          name: "lzGasLimit_",
          type: "uint128",
        },
      ],
      name: "setLzGasLimit",
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
        {
          internalType: "uint256",
          name: "maxExtraGas_",
          type: "uint256",
        },
      ],
      name: "setMaxExtraGas",
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
      inputs: [
        {
          internalType: "contract IERC20",
          name: "token_",
          type: "address",
        },
      ],
      name: "withdrawFeeInTokens",
      outputs: [],
      stateMutability: "nonpayable",
      type: "function",
    },
    {
      inputs: [
        {
          internalType: "uint256",
          name: "amount_",
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
