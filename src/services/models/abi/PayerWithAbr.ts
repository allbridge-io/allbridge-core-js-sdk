const artifact = {
  abi: [
    {
      inputs: [
        {
          internalType: "address",
          name: "_abrTokenAddress",
          type: "address",
        },
        {
          internalType: "uint256",
          name: "_chainPrecision",
          type: "uint256",
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
      stateMutability: "payable",
      type: "fallback",
    },
    {
      inputs: [],
      name: "abrToken",
      outputs: [
        {
          internalType: "contract IERC20Metadata",
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
          name: "_tokenAddress",
          type: "address",
        },
        {
          internalType: "address",
          name: "_bridge",
          type: "address",
        },
      ],
      name: "approveBridgeToken",
      outputs: [],
      stateMutability: "nonpayable",
      type: "function",
    },
    {
      inputs: [],
      name: "exchangeRate",
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
          name: "_amount",
          type: "uint256",
        },
      ],
      name: "nativeTokensToAbr",
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
          name: "_id",
          type: "uint256",
        },
        {
          internalType: "address",
          name: "_target",
          type: "address",
        },
        {
          internalType: "string",
          name: "_signature",
          type: "string",
        },
      ],
      name: "registerTarget",
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
          name: "_newExchangeRate",
          type: "uint256",
        },
      ],
      name: "setExchangeRate",
      outputs: [],
      stateMutability: "nonpayable",
      type: "function",
    },
    {
      inputs: [
        {
          internalType: "uint256",
          name: "id",
          type: "uint256",
        },
      ],
      name: "targets",
      outputs: [
        {
          internalType: "address",
          name: "target",
          type: "address",
        },
        {
          internalType: "bytes4",
          name: "selector",
          type: "bytes4",
        },
      ],
      stateMutability: "view",
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
          internalType: "address",
          name: "_token",
          type: "address",
        },
        {
          internalType: "uint256",
          name: "_amount",
          type: "uint256",
        },
        {
          internalType: "uint256",
          name: "_abrAmount",
          type: "uint256",
        },
        {
          internalType: "uint256",
          name: "_targetId",
          type: "uint256",
        },
        {
          internalType: "bytes",
          name: "_params",
          type: "bytes",
        },
      ],
      name: "transferTokensAndCallTarget",
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
      ],
      name: "withdrawGas",
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
      name: "withdrawTokens",
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
