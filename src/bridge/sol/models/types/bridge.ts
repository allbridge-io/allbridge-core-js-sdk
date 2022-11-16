export interface Bridge {
  version: "0.1.0";
  name: "bridge";
  instructions: [
    {
      name: "initialize";
      accounts: [
        {
          name: "admin";
          isMut: true;
          isSigner: true;
        },
        {
          name: "config";
          isMut: true;
          isSigner: false;
        },
        {
          name: "systemProgram";
          isMut: false;
          isSigner: false;
        }
      ];
      args: [
        {
          name: "args";
          type: {
            defined: "InitializeArgs";
          };
        }
      ];
    },
    {
      name: "initializePool";
      accounts: [
        {
          name: "payer";
          isMut: true;
          isSigner: true;
        },
        {
          name: "admin";
          isMut: false;
          isSigner: true;
        },
        {
          name: "config";
          isMut: false;
          isSigner: false;
        },
        {
          name: "pool";
          isMut: true;
          isSigner: false;
        },
        {
          name: "bridgeAuthority";
          isMut: false;
          isSigner: false;
        },
        {
          name: "mint";
          isMut: false;
          isSigner: false;
        },
        {
          name: "token";
          isMut: true;
          isSigner: false;
        },
        {
          name: "tokenProgram";
          isMut: false;
          isSigner: false;
        },
        {
          name: "systemProgram";
          isMut: false;
          isSigner: false;
        },
        {
          name: "rent";
          isMut: false;
          isSigner: false;
        }
      ];
      args: [
        {
          name: "args";
          type: {
            defined: "InitializePoolArgs";
          };
        }
      ];
    },
    {
      name: "initDepositAccount";
      accounts: [
        {
          name: "user";
          isMut: true;
          isSigner: true;
        },
        {
          name: "payer";
          isMut: true;
          isSigner: true;
        },
        {
          name: "mint";
          isMut: false;
          isSigner: false;
        },
        {
          name: "userDeposit";
          isMut: true;
          isSigner: false;
        },
        {
          name: "systemProgram";
          isMut: false;
          isSigner: false;
        }
      ];
      args: [];
    },
    {
      name: "deposit";
      accounts: [
        {
          name: "user";
          isMut: true;
          isSigner: true;
        },
        {
          name: "mint";
          isMut: false;
          isSigner: false;
        },
        {
          name: "config";
          isMut: false;
          isSigner: false;
        },
        {
          name: "pool";
          isMut: true;
          isSigner: false;
        },
        {
          name: "bridgeToken";
          isMut: true;
          isSigner: false;
        },
        {
          name: "userToken";
          isMut: true;
          isSigner: false;
        },
        {
          name: "userDeposit";
          isMut: true;
          isSigner: false;
        },
        {
          name: "bridgeAuthority";
          isMut: false;
          isSigner: false;
        },
        {
          name: "tokenProgram";
          isMut: false;
          isSigner: false;
        },
        {
          name: "systemProgram";
          isMut: false;
          isSigner: false;
        }
      ];
      args: [
        {
          name: "amount";
          type: "u64";
        }
      ];
    },
    {
      name: "withdraw";
      accounts: [
        {
          name: "user";
          isMut: true;
          isSigner: true;
        },
        {
          name: "mint";
          isMut: false;
          isSigner: false;
        },
        {
          name: "config";
          isMut: false;
          isSigner: false;
        },
        {
          name: "pool";
          isMut: true;
          isSigner: false;
        },
        {
          name: "bridgeToken";
          isMut: true;
          isSigner: false;
        },
        {
          name: "userToken";
          isMut: true;
          isSigner: false;
        },
        {
          name: "userDeposit";
          isMut: true;
          isSigner: false;
        },
        {
          name: "bridgeAuthority";
          isMut: false;
          isSigner: false;
        },
        {
          name: "tokenProgram";
          isMut: false;
          isSigner: false;
        },
        {
          name: "systemProgram";
          isMut: false;
          isSigner: false;
        }
      ];
      args: [
        {
          name: "amountLp";
          type: "u64";
        }
      ];
    },
    {
      name: "swapAndBridge";
      accounts: [
        {
          name: "user";
          isMut: true;
          isSigner: true;
        },
        {
          name: "payer";
          isMut: true;
          isSigner: true;
        },
        {
          name: "lock";
          isMut: true;
          isSigner: false;
        },
        {
          name: "mint";
          isMut: false;
          isSigner: false;
        },
        {
          name: "config";
          isMut: true;
          isSigner: false;
        },
        {
          name: "otherBridgeToken";
          isMut: true;
          isSigner: false;
        },
        {
          name: "messenger";
          isMut: false;
          isSigner: false;
        },
        {
          name: "messengerConfig";
          isMut: true;
          isSigner: false;
        },
        {
          name: "sentMessageAccount";
          isMut: true;
          isSigner: false;
        },
        {
          name: "messengerGasUsage";
          isMut: true;
          isSigner: false;
        },
        {
          name: "pool";
          isMut: true;
          isSigner: false;
        },
        {
          name: "bridgeToken";
          isMut: true;
          isSigner: false;
        },
        {
          name: "gasPrice";
          isMut: false;
          isSigner: false;
        },
        {
          name: "chainBridge";
          isMut: false;
          isSigner: false;
        },
        {
          name: "userToken";
          isMut: true;
          isSigner: false;
        },
        {
          name: "bridgeAuthority";
          isMut: false;
          isSigner: false;
        },
        {
          name: "tokenProgram";
          isMut: false;
          isSigner: false;
        },
        {
          name: "systemProgram";
          isMut: false;
          isSigner: false;
        }
      ];
      args: [
        {
          name: "args";
          type: {
            defined: "BridgeArgs";
          };
        }
      ];
    },
    {
      name: "swapAndBridgeWormhole";
      accounts: [
        {
          name: "user";
          isMut: false;
          isSigner: true;
        },
        {
          name: "payer";
          isMut: true;
          isSigner: true;
        },
        {
          name: "lock";
          isMut: true;
          isSigner: false;
        },
        {
          name: "mint";
          isMut: false;
          isSigner: false;
        },
        {
          name: "config";
          isMut: false;
          isSigner: false;
        },
        {
          name: "otherBridgeToken";
          isMut: true;
          isSigner: false;
        },
        {
          name: "pool";
          isMut: true;
          isSigner: false;
        },
        {
          name: "bridgeToken";
          isMut: true;
          isSigner: false;
        },
        {
          name: "gasPrice";
          isMut: false;
          isSigner: false;
        },
        {
          name: "chainBridge";
          isMut: false;
          isSigner: false;
        },
        {
          name: "userToken";
          isMut: true;
          isSigner: false;
        },
        {
          name: "bridgeAuthority";
          isMut: false;
          isSigner: false;
        },
        {
          name: "wormholeMessenger";
          isMut: false;
          isSigner: false;
        },
        {
          name: "wormholeMessengerConfig";
          isMut: true;
          isSigner: false;
        },
        {
          name: "wormholeProgram";
          isMut: false;
          isSigner: false;
        },
        {
          name: "bridge";
          isMut: true;
          isSigner: false;
        },
        {
          name: "message";
          isMut: true;
          isSigner: true;
        },
        {
          name: "sequence";
          isMut: true;
          isSigner: false;
        },
        {
          name: "feeCollector";
          isMut: true;
          isSigner: false;
        },
        {
          name: "messengerGasUsage";
          isMut: true;
          isSigner: false;
        },
        {
          name: "clock";
          isMut: false;
          isSigner: false;
        },
        {
          name: "rent";
          isMut: false;
          isSigner: false;
        },
        {
          name: "tokenProgram";
          isMut: false;
          isSigner: false;
        },
        {
          name: "systemProgram";
          isMut: false;
          isSigner: false;
        }
      ];
      args: [
        {
          name: "args";
          type: {
            defined: "BridgeArgs";
          };
        }
      ];
    },
    {
      name: "swap";
      accounts: [
        {
          name: "user";
          isMut: true;
          isSigner: true;
        },
        {
          name: "payer";
          isMut: true;
          isSigner: true;
        },
        {
          name: "sendMint";
          isMut: false;
          isSigner: false;
        },
        {
          name: "receiveMint";
          isMut: false;
          isSigner: false;
        },
        {
          name: "config";
          isMut: true;
          isSigner: false;
        },
        {
          name: "sendPool";
          isMut: true;
          isSigner: false;
        },
        {
          name: "receivePool";
          isMut: true;
          isSigner: false;
        },
        {
          name: "sendBridgeToken";
          isMut: true;
          isSigner: false;
        },
        {
          name: "receiveBridgeToken";
          isMut: true;
          isSigner: false;
        },
        {
          name: "sendUserToken";
          isMut: true;
          isSigner: false;
        },
        {
          name: "receiveUserToken";
          isMut: true;
          isSigner: false;
        },
        {
          name: "bridgeAuthority";
          isMut: false;
          isSigner: false;
        },
        {
          name: "tokenProgram";
          isMut: false;
          isSigner: false;
        }
      ];
      args: [
        {
          name: "amount";
          type: "u64";
        }
      ];
    },
    {
      name: "registerChainBridge";
      accounts: [
        {
          name: "amin";
          isMut: false;
          isSigner: true;
        },
        {
          name: "payer";
          isMut: true;
          isSigner: true;
        },
        {
          name: "config";
          isMut: false;
          isSigner: false;
        },
        {
          name: "chainBridge";
          isMut: true;
          isSigner: false;
        },
        {
          name: "systemProgram";
          isMut: false;
          isSigner: false;
        }
      ];
      args: [
        {
          name: "args";
          type: {
            defined: "RegisterChainBridgeArgs";
          };
        }
      ];
    },
    {
      name: "updateChainBridge";
      accounts: [
        {
          name: "amin";
          isMut: false;
          isSigner: true;
        },
        {
          name: "config";
          isMut: false;
          isSigner: false;
        },
        {
          name: "chainBridge";
          isMut: true;
          isSigner: false;
        }
      ];
      args: [
        {
          name: "args";
          type: {
            defined: "UpdateChainBridgeArgs";
          };
        }
      ];
    },
    {
      name: "receiveAndSwap";
      accounts: [
        {
          name: "user";
          isMut: true;
          isSigner: false;
        },
        {
          name: "payer";
          isMut: true;
          isSigner: true;
        },
        {
          name: "mint";
          isMut: false;
          isSigner: false;
        },
        {
          name: "config";
          isMut: false;
          isSigner: false;
        },
        {
          name: "pool";
          isMut: true;
          isSigner: false;
        },
        {
          name: "bridgeToken";
          isMut: true;
          isSigner: false;
        },
        {
          name: "receivedMessageAccount";
          isMut: false;
          isSigner: false;
        },
        {
          name: "unlock";
          isMut: true;
          isSigner: false;
        },
        {
          name: "chainBridge";
          isMut: false;
          isSigner: false;
        },
        {
          name: "userToken";
          isMut: true;
          isSigner: false;
        },
        {
          name: "bridgeAuthority";
          isMut: false;
          isSigner: false;
        },
        {
          name: "tokenProgram";
          isMut: false;
          isSigner: false;
        },
        {
          name: "systemProgram";
          isMut: false;
          isSigner: false;
        },
        {
          name: "messengerProgram";
          isMut: false;
          isSigner: false;
        }
      ];
      args: [
        {
          name: "args";
          type: {
            defined: "UnlockArgs";
          };
        }
      ];
    },
    {
      name: "receiveAndSwapWormhole";
      accounts: [
        {
          name: "user";
          isMut: true;
          isSigner: false;
        },
        {
          name: "payer";
          isMut: true;
          isSigner: true;
        },
        {
          name: "mint";
          isMut: false;
          isSigner: false;
        },
        {
          name: "config";
          isMut: false;
          isSigner: false;
        },
        {
          name: "pool";
          isMut: true;
          isSigner: false;
        },
        {
          name: "bridgeToken";
          isMut: true;
          isSigner: false;
        },
        {
          name: "receivedMessageAccount";
          isMut: false;
          isSigner: false;
        },
        {
          name: "unlock";
          isMut: true;
          isSigner: false;
        },
        {
          name: "chainBridge";
          isMut: false;
          isSigner: false;
        },
        {
          name: "userToken";
          isMut: true;
          isSigner: false;
        },
        {
          name: "bridgeAuthority";
          isMut: false;
          isSigner: false;
        },
        {
          name: "tokenProgram";
          isMut: false;
          isSigner: false;
        },
        {
          name: "systemProgram";
          isMut: false;
          isSigner: false;
        },
        {
          name: "messengerProgram";
          isMut: false;
          isSigner: false;
        }
      ];
      args: [
        {
          name: "args";
          type: {
            defined: "UnlockArgs";
          };
        }
      ];
    },
    {
      name: "withdrawGasToken";
      accounts: [
        {
          name: "admin";
          isMut: false;
          isSigner: true;
        },
        {
          name: "recipient";
          isMut: true;
          isSigner: false;
        },
        {
          name: "config";
          isMut: true;
          isSigner: false;
        }
      ];
      args: [
        {
          name: "amount";
          type: "u64";
        }
      ];
    },
    {
      name: "claimRewards";
      accounts: [
        {
          name: "user";
          isMut: true;
          isSigner: true;
        },
        {
          name: "mint";
          isMut: false;
          isSigner: false;
        },
        {
          name: "config";
          isMut: false;
          isSigner: false;
        },
        {
          name: "pool";
          isMut: true;
          isSigner: false;
        },
        {
          name: "bridgeToken";
          isMut: true;
          isSigner: false;
        },
        {
          name: "userToken";
          isMut: true;
          isSigner: false;
        },
        {
          name: "userDeposit";
          isMut: true;
          isSigner: false;
        },
        {
          name: "bridgeAuthority";
          isMut: false;
          isSigner: false;
        },
        {
          name: "tokenProgram";
          isMut: false;
          isSigner: false;
        },
        {
          name: "systemProgram";
          isMut: false;
          isSigner: false;
        }
      ];
      args: [];
    },
    {
      name: "setAdmin";
      accounts: [
        {
          name: "admin";
          isMut: false;
          isSigner: true;
        },
        {
          name: "newAdmin";
          isMut: false;
          isSigner: true;
        },
        {
          name: "config";
          isMut: true;
          isSigner: false;
        }
      ];
      args: [];
    },
    {
      name: "setAllbridgeMessengerProgramId";
      accounts: [
        {
          name: "admin";
          isMut: false;
          isSigner: true;
        },
        {
          name: "config";
          isMut: true;
          isSigner: false;
        }
      ];
      args: [
        {
          name: "newProgramId";
          type: "publicKey";
        }
      ];
    },
    {
      name: "setWormholeMessengerProgramId";
      accounts: [
        {
          name: "admin";
          isMut: false;
          isSigner: true;
        },
        {
          name: "config";
          isMut: true;
          isSigner: false;
        }
      ];
      args: [
        {
          name: "newProgramId";
          type: "publicKey";
        }
      ];
    },
    {
      name: "setGasOracleProgramId";
      accounts: [
        {
          name: "admin";
          isMut: false;
          isSigner: true;
        },
        {
          name: "config";
          isMut: true;
          isSigner: false;
        }
      ];
      args: [
        {
          name: "newProgramId";
          type: "publicKey";
        }
      ];
    },
    {
      name: "setPoolFeeShare";
      accounts: [
        {
          name: "admin";
          isMut: false;
          isSigner: true;
        },
        {
          name: "config";
          isMut: false;
          isSigner: false;
        },
        {
          name: "pool";
          isMut: true;
          isSigner: false;
        }
      ];
      args: [
        {
          name: "feeShareBp";
          type: "u64";
        }
      ];
    },
    {
      name: "setPoolAdminFeeShare";
      accounts: [
        {
          name: "admin";
          isMut: false;
          isSigner: true;
        },
        {
          name: "config";
          isMut: false;
          isSigner: false;
        },
        {
          name: "pool";
          isMut: true;
          isSigner: false;
        }
      ];
      args: [
        {
          name: "feeShareBp";
          type: "u64";
        }
      ];
    },
    {
      name: "addOtherBridgeToken";
      accounts: [
        {
          name: "admin";
          isMut: false;
          isSigner: true;
        },
        {
          name: "payer";
          isMut: true;
          isSigner: true;
        },
        {
          name: "config";
          isMut: false;
          isSigner: false;
        },
        {
          name: "otherBridgeToken";
          isMut: true;
          isSigner: false;
        },
        {
          name: "systemProgram";
          isMut: false;
          isSigner: false;
        }
      ];
      args: [
        {
          name: "chainId";
          type: "u8";
        },
        {
          name: "tokenAddress";
          type: {
            array: ["u8", 32];
          };
        }
      ];
    },
    {
      name: "removeOtherBridgeToken";
      accounts: [
        {
          name: "admin";
          isMut: false;
          isSigner: true;
        },
        {
          name: "payer";
          isMut: true;
          isSigner: true;
        },
        {
          name: "config";
          isMut: true;
          isSigner: false;
        },
        {
          name: "otherBridgeToken";
          isMut: true;
          isSigner: false;
        },
        {
          name: "systemProgram";
          isMut: false;
          isSigner: false;
        }
      ];
      args: [
        {
          name: "chainId";
          type: "u8";
        },
        {
          name: "tokenAddress";
          type: {
            array: ["u8", 32];
          };
        }
      ];
    },
    {
      name: "withdrawAdminFee";
      accounts: [
        {
          name: "admin";
          isMut: false;
          isSigner: true;
        },
        {
          name: "mint";
          isMut: false;
          isSigner: false;
        },
        {
          name: "config";
          isMut: false;
          isSigner: false;
        },
        {
          name: "pool";
          isMut: true;
          isSigner: false;
        },
        {
          name: "bridgeToken";
          isMut: true;
          isSigner: false;
        },
        {
          name: "adminToken";
          isMut: true;
          isSigner: false;
        },
        {
          name: "bridgeAuthority";
          isMut: false;
          isSigner: false;
        },
        {
          name: "tokenProgram";
          isMut: false;
          isSigner: false;
        },
        {
          name: "systemProgram";
          isMut: false;
          isSigner: false;
        }
      ];
      args: [];
    }
  ];
  accounts: [
    {
      name: "chainBridge";
      type: {
        kind: "struct";
        fields: [
          {
            name: "address";
            type: {
              array: ["u8", 32];
            };
          },
          {
            name: "chainId";
            type: "u8";
          },
          {
            name: "gasUsage";
            type: "u64";
          }
        ];
      };
    },
    {
      name: "config";
      type: {
        kind: "struct";
        fields: [
          {
            name: "admin";
            type: "publicKey";
          },
          {
            name: "allbridgeMessengerProgramId";
            type: "publicKey";
          },
          {
            name: "wormholeMessengerProgramId";
            type: "publicKey";
          },
          {
            name: "gasOracleProgramId";
            type: "publicKey";
          },
          {
            name: "authorityBumpSeed";
            type: "u8";
          }
        ];
      };
    },
    {
      name: "lock";
      type: {
        kind: "struct";
        fields: [
          {
            name: "sender";
            type: "publicKey";
          },
          {
            name: "sentTokenAddress";
            type: "publicKey";
          },
          {
            name: "amount";
            type: "u64";
          },
          {
            name: "vusdAmount";
            type: "u64";
          },
          {
            name: "recipient";
            type: {
              array: ["u8", 32];
            };
          },
          {
            name: "destinationChainId";
            type: "u8";
          },
          {
            name: "receiveToken";
            type: {
              array: ["u8", 32];
            };
          },
          {
            name: "nonce";
            type: {
              array: ["u8", 32];
            };
          },
          {
            name: "messenger";
            type: {
              defined: "Messenger";
            };
          },
          {
            name: "slot";
            type: "u64";
          },
          {
            name: "fee";
            type: "u64";
          }
        ];
      };
    },
    {
      name: "otherBridgeToken";
      type: {
        kind: "struct";
        fields: [];
      };
    },
    {
      name: "pool";
      type: {
        kind: "struct";
        fields: [
          {
            name: "mint";
            type: "publicKey";
          },
          {
            name: "a";
            type: "u64";
          },
          {
            name: "d";
            type: "u64";
          },
          {
            name: "tokenBalance";
            type: "u64";
          },
          {
            name: "vUsdBalance";
            type: "u64";
          },
          {
            name: "decimals";
            type: "u8";
          },
          {
            name: "totalLpAmount";
            type: "u64";
          },
          {
            name: "feeShareBp";
            type: "u64";
          },
          {
            name: "adminFeeShareBp";
            type: "u64";
          },
          {
            name: "accRewardPerShareP";
            type: "u128";
          },
          {
            name: "adminFeeAmount";
            type: "u64";
          }
        ];
      };
    },
    {
      name: "unlock";
      type: {
        kind: "struct";
        fields: [
          {
            name: "hash";
            type: {
              array: ["u8", 32];
            };
          },
          {
            name: "amount";
            type: "u64";
          },
          {
            name: "fee";
            type: "u64";
          },
          {
            name: "vUsdAmount";
            type: "u64";
          },
          {
            name: "slot";
            type: "u64";
          }
        ];
      };
    },
    {
      name: "userDeposit";
      type: {
        kind: "struct";
        fields: [
          {
            name: "userAddress";
            type: "publicKey";
          },
          {
            name: "mint";
            type: "publicKey";
          },
          {
            name: "lpAmount";
            type: "u64";
          },
          {
            name: "rewardDebt";
            type: "u64";
          }
        ];
      };
    }
  ];
  types: [
    {
      name: "RegisterChainBridgeArgs";
      type: {
        kind: "struct";
        fields: [
          {
            name: "chainBridgeAddress";
            type: {
              array: ["u8", 32];
            };
          },
          {
            name: "chainId";
            type: "u8";
          },
          {
            name: "gasUsage";
            type: "u64";
          }
        ];
      };
    },
    {
      name: "UpdateChainBridgeArgs";
      type: {
        kind: "struct";
        fields: [
          {
            name: "chainBridgeAddress";
            type: {
              array: ["u8", 32];
            };
          },
          {
            name: "chainId";
            type: "u8";
          },
          {
            name: "gasUsage";
            type: "u64";
          }
        ];
      };
    },
    {
      name: "InitializeArgs";
      type: {
        kind: "struct";
        fields: [
          {
            name: "allbridgeMessengerProgramId";
            type: "publicKey";
          },
          {
            name: "wormholeMessengerProgramId";
            type: "publicKey";
          },
          {
            name: "gasOracleProgramId";
            type: "publicKey";
          }
        ];
      };
    },
    {
      name: "InitializePoolArgs";
      type: {
        kind: "struct";
        fields: [
          {
            name: "a";
            type: "u64";
          },
          {
            name: "feeShareBp";
            type: "u64";
          },
          {
            name: "adminFeeShareBp";
            type: "u64";
          }
        ];
      };
    },
    {
      name: "BridgeArgs";
      type: {
        kind: "struct";
        fields: [
          {
            name: "nonce";
            type: {
              array: ["u8", 32];
            };
          },
          {
            name: "recipient";
            type: {
              array: ["u8", 32];
            };
          },
          {
            name: "destinationChainId";
            type: "u8";
          },
          {
            name: "receiveToken";
            type: {
              array: ["u8", 32];
            };
          },
          {
            name: "vusdAmount";
            type: "u64";
          }
        ];
      };
    },
    {
      name: "UnlockArgs";
      type: {
        kind: "struct";
        fields: [
          {
            name: "nonce";
            type: {
              array: ["u8", 32];
            };
          },
          {
            name: "amount";
            type: "u64";
          },
          {
            name: "recipient";
            type: "publicKey";
          },
          {
            name: "sourceChainId";
            type: "u8";
          },
          {
            name: "receiveToken";
            type: "publicKey";
          },
          {
            name: "messenger";
            type: {
              defined: "Messenger";
            };
          },
          {
            name: "hash";
            type: {
              array: ["u8", 32];
            };
          }
        ];
      };
    },
    {
      name: "Messenger";
      type: {
        kind: "enum";
        variants: [
          {
            name: "None";
          },
          {
            name: "Allbridge";
          },
          {
            name: "Wormhole";
          }
        ];
      };
    }
  ];
  errors: [
    {
      code: 6000;
      name: "AccountAlreadyInitialized";
      msg: "This account has already been initialized";
    },
    {
      code: 6001;
      name: "AdminAuthorityInvalid";
      msg: "This instruction requires admin authority";
    },
    {
      code: 6002;
      name: "InvalidSignature";
      msg: "Provided signature has wrong signer or message";
    },
    {
      code: 6003;
      name: "InvalidHash";
      msg: "Wrong unlock message hash";
    },
    {
      code: 6004;
      name: "PoolOverflow";
      msg: "Pool overflow";
    },
    {
      code: 6005;
      name: "ZeroAmount";
      msg: "Zero amount";
    },
    {
      code: 6006;
      name: "HighVusdAmount";
      msg: "vUSD amount is too high";
    }
  ];
}

export const IDL: Bridge = {
  version: "0.1.0",
  name: "bridge",
  instructions: [
    {
      name: "initialize",
      accounts: [
        {
          name: "admin",
          isMut: true,
          isSigner: true,
        },
        {
          name: "config",
          isMut: true,
          isSigner: false,
        },
        {
          name: "systemProgram",
          isMut: false,
          isSigner: false,
        },
      ],
      args: [
        {
          name: "args",
          type: {
            defined: "InitializeArgs",
          },
        },
      ],
    },
    {
      name: "initializePool",
      accounts: [
        {
          name: "payer",
          isMut: true,
          isSigner: true,
        },
        {
          name: "admin",
          isMut: false,
          isSigner: true,
        },
        {
          name: "config",
          isMut: false,
          isSigner: false,
        },
        {
          name: "pool",
          isMut: true,
          isSigner: false,
        },
        {
          name: "bridgeAuthority",
          isMut: false,
          isSigner: false,
        },
        {
          name: "mint",
          isMut: false,
          isSigner: false,
        },
        {
          name: "token",
          isMut: true,
          isSigner: false,
        },
        {
          name: "tokenProgram",
          isMut: false,
          isSigner: false,
        },
        {
          name: "systemProgram",
          isMut: false,
          isSigner: false,
        },
        {
          name: "rent",
          isMut: false,
          isSigner: false,
        },
      ],
      args: [
        {
          name: "args",
          type: {
            defined: "InitializePoolArgs",
          },
        },
      ],
    },
    {
      name: "initDepositAccount",
      accounts: [
        {
          name: "user",
          isMut: true,
          isSigner: true,
        },
        {
          name: "payer",
          isMut: true,
          isSigner: true,
        },
        {
          name: "mint",
          isMut: false,
          isSigner: false,
        },
        {
          name: "userDeposit",
          isMut: true,
          isSigner: false,
        },
        {
          name: "systemProgram",
          isMut: false,
          isSigner: false,
        },
      ],
      args: [],
    },
    {
      name: "deposit",
      accounts: [
        {
          name: "user",
          isMut: true,
          isSigner: true,
        },
        {
          name: "mint",
          isMut: false,
          isSigner: false,
        },
        {
          name: "config",
          isMut: false,
          isSigner: false,
        },
        {
          name: "pool",
          isMut: true,
          isSigner: false,
        },
        {
          name: "bridgeToken",
          isMut: true,
          isSigner: false,
        },
        {
          name: "userToken",
          isMut: true,
          isSigner: false,
        },
        {
          name: "userDeposit",
          isMut: true,
          isSigner: false,
        },
        {
          name: "bridgeAuthority",
          isMut: false,
          isSigner: false,
        },
        {
          name: "tokenProgram",
          isMut: false,
          isSigner: false,
        },
        {
          name: "systemProgram",
          isMut: false,
          isSigner: false,
        },
      ],
      args: [
        {
          name: "amount",
          type: "u64",
        },
      ],
    },
    {
      name: "withdraw",
      accounts: [
        {
          name: "user",
          isMut: true,
          isSigner: true,
        },
        {
          name: "mint",
          isMut: false,
          isSigner: false,
        },
        {
          name: "config",
          isMut: false,
          isSigner: false,
        },
        {
          name: "pool",
          isMut: true,
          isSigner: false,
        },
        {
          name: "bridgeToken",
          isMut: true,
          isSigner: false,
        },
        {
          name: "userToken",
          isMut: true,
          isSigner: false,
        },
        {
          name: "userDeposit",
          isMut: true,
          isSigner: false,
        },
        {
          name: "bridgeAuthority",
          isMut: false,
          isSigner: false,
        },
        {
          name: "tokenProgram",
          isMut: false,
          isSigner: false,
        },
        {
          name: "systemProgram",
          isMut: false,
          isSigner: false,
        },
      ],
      args: [
        {
          name: "amountLp",
          type: "u64",
        },
      ],
    },
    {
      name: "swapAndBridge",
      accounts: [
        {
          name: "user",
          isMut: true,
          isSigner: true,
        },
        {
          name: "payer",
          isMut: true,
          isSigner: true,
        },
        {
          name: "lock",
          isMut: true,
          isSigner: false,
        },
        {
          name: "mint",
          isMut: false,
          isSigner: false,
        },
        {
          name: "config",
          isMut: true,
          isSigner: false,
        },
        {
          name: "otherBridgeToken",
          isMut: true,
          isSigner: false,
        },
        {
          name: "messenger",
          isMut: false,
          isSigner: false,
        },
        {
          name: "messengerConfig",
          isMut: true,
          isSigner: false,
        },
        {
          name: "sentMessageAccount",
          isMut: true,
          isSigner: false,
        },
        {
          name: "messengerGasUsage",
          isMut: true,
          isSigner: false,
        },
        {
          name: "pool",
          isMut: true,
          isSigner: false,
        },
        {
          name: "bridgeToken",
          isMut: true,
          isSigner: false,
        },
        {
          name: "gasPrice",
          isMut: false,
          isSigner: false,
        },
        {
          name: "chainBridge",
          isMut: false,
          isSigner: false,
        },
        {
          name: "userToken",
          isMut: true,
          isSigner: false,
        },
        {
          name: "bridgeAuthority",
          isMut: false,
          isSigner: false,
        },
        {
          name: "tokenProgram",
          isMut: false,
          isSigner: false,
        },
        {
          name: "systemProgram",
          isMut: false,
          isSigner: false,
        },
      ],
      args: [
        {
          name: "args",
          type: {
            defined: "BridgeArgs",
          },
        },
      ],
    },
    {
      name: "swapAndBridgeWormhole",
      accounts: [
        {
          name: "user",
          isMut: false,
          isSigner: true,
        },
        {
          name: "payer",
          isMut: true,
          isSigner: true,
        },
        {
          name: "lock",
          isMut: true,
          isSigner: false,
        },
        {
          name: "mint",
          isMut: false,
          isSigner: false,
        },
        {
          name: "config",
          isMut: false,
          isSigner: false,
        },
        {
          name: "otherBridgeToken",
          isMut: true,
          isSigner: false,
        },
        {
          name: "pool",
          isMut: true,
          isSigner: false,
        },
        {
          name: "bridgeToken",
          isMut: true,
          isSigner: false,
        },
        {
          name: "gasPrice",
          isMut: false,
          isSigner: false,
        },
        {
          name: "chainBridge",
          isMut: false,
          isSigner: false,
        },
        {
          name: "userToken",
          isMut: true,
          isSigner: false,
        },
        {
          name: "bridgeAuthority",
          isMut: false,
          isSigner: false,
        },
        {
          name: "wormholeMessenger",
          isMut: false,
          isSigner: false,
        },
        {
          name: "wormholeMessengerConfig",
          isMut: true,
          isSigner: false,
        },
        {
          name: "wormholeProgram",
          isMut: false,
          isSigner: false,
        },
        {
          name: "bridge",
          isMut: true,
          isSigner: false,
        },
        {
          name: "message",
          isMut: true,
          isSigner: true,
        },
        {
          name: "sequence",
          isMut: true,
          isSigner: false,
        },
        {
          name: "feeCollector",
          isMut: true,
          isSigner: false,
        },
        {
          name: "messengerGasUsage",
          isMut: true,
          isSigner: false,
        },
        {
          name: "clock",
          isMut: false,
          isSigner: false,
        },
        {
          name: "rent",
          isMut: false,
          isSigner: false,
        },
        {
          name: "tokenProgram",
          isMut: false,
          isSigner: false,
        },
        {
          name: "systemProgram",
          isMut: false,
          isSigner: false,
        },
      ],
      args: [
        {
          name: "args",
          type: {
            defined: "BridgeArgs",
          },
        },
      ],
    },
    {
      name: "swap",
      accounts: [
        {
          name: "user",
          isMut: true,
          isSigner: true,
        },
        {
          name: "payer",
          isMut: true,
          isSigner: true,
        },
        {
          name: "sendMint",
          isMut: false,
          isSigner: false,
        },
        {
          name: "receiveMint",
          isMut: false,
          isSigner: false,
        },
        {
          name: "config",
          isMut: true,
          isSigner: false,
        },
        {
          name: "sendPool",
          isMut: true,
          isSigner: false,
        },
        {
          name: "receivePool",
          isMut: true,
          isSigner: false,
        },
        {
          name: "sendBridgeToken",
          isMut: true,
          isSigner: false,
        },
        {
          name: "receiveBridgeToken",
          isMut: true,
          isSigner: false,
        },
        {
          name: "sendUserToken",
          isMut: true,
          isSigner: false,
        },
        {
          name: "receiveUserToken",
          isMut: true,
          isSigner: false,
        },
        {
          name: "bridgeAuthority",
          isMut: false,
          isSigner: false,
        },
        {
          name: "tokenProgram",
          isMut: false,
          isSigner: false,
        },
      ],
      args: [
        {
          name: "amount",
          type: "u64",
        },
      ],
    },
    {
      name: "registerChainBridge",
      accounts: [
        {
          name: "amin",
          isMut: false,
          isSigner: true,
        },
        {
          name: "payer",
          isMut: true,
          isSigner: true,
        },
        {
          name: "config",
          isMut: false,
          isSigner: false,
        },
        {
          name: "chainBridge",
          isMut: true,
          isSigner: false,
        },
        {
          name: "systemProgram",
          isMut: false,
          isSigner: false,
        },
      ],
      args: [
        {
          name: "args",
          type: {
            defined: "RegisterChainBridgeArgs",
          },
        },
      ],
    },
    {
      name: "updateChainBridge",
      accounts: [
        {
          name: "amin",
          isMut: false,
          isSigner: true,
        },
        {
          name: "config",
          isMut: false,
          isSigner: false,
        },
        {
          name: "chainBridge",
          isMut: true,
          isSigner: false,
        },
      ],
      args: [
        {
          name: "args",
          type: {
            defined: "UpdateChainBridgeArgs",
          },
        },
      ],
    },
    {
      name: "receiveAndSwap",
      accounts: [
        {
          name: "user",
          isMut: true,
          isSigner: false,
        },
        {
          name: "payer",
          isMut: true,
          isSigner: true,
        },
        {
          name: "mint",
          isMut: false,
          isSigner: false,
        },
        {
          name: "config",
          isMut: false,
          isSigner: false,
        },
        {
          name: "pool",
          isMut: true,
          isSigner: false,
        },
        {
          name: "bridgeToken",
          isMut: true,
          isSigner: false,
        },
        {
          name: "receivedMessageAccount",
          isMut: false,
          isSigner: false,
        },
        {
          name: "unlock",
          isMut: true,
          isSigner: false,
        },
        {
          name: "chainBridge",
          isMut: false,
          isSigner: false,
        },
        {
          name: "userToken",
          isMut: true,
          isSigner: false,
        },
        {
          name: "bridgeAuthority",
          isMut: false,
          isSigner: false,
        },
        {
          name: "tokenProgram",
          isMut: false,
          isSigner: false,
        },
        {
          name: "systemProgram",
          isMut: false,
          isSigner: false,
        },
        {
          name: "messengerProgram",
          isMut: false,
          isSigner: false,
        },
      ],
      args: [
        {
          name: "args",
          type: {
            defined: "UnlockArgs",
          },
        },
      ],
    },
    {
      name: "receiveAndSwapWormhole",
      accounts: [
        {
          name: "user",
          isMut: true,
          isSigner: false,
        },
        {
          name: "payer",
          isMut: true,
          isSigner: true,
        },
        {
          name: "mint",
          isMut: false,
          isSigner: false,
        },
        {
          name: "config",
          isMut: false,
          isSigner: false,
        },
        {
          name: "pool",
          isMut: true,
          isSigner: false,
        },
        {
          name: "bridgeToken",
          isMut: true,
          isSigner: false,
        },
        {
          name: "receivedMessageAccount",
          isMut: false,
          isSigner: false,
        },
        {
          name: "unlock",
          isMut: true,
          isSigner: false,
        },
        {
          name: "chainBridge",
          isMut: false,
          isSigner: false,
        },
        {
          name: "userToken",
          isMut: true,
          isSigner: false,
        },
        {
          name: "bridgeAuthority",
          isMut: false,
          isSigner: false,
        },
        {
          name: "tokenProgram",
          isMut: false,
          isSigner: false,
        },
        {
          name: "systemProgram",
          isMut: false,
          isSigner: false,
        },
        {
          name: "messengerProgram",
          isMut: false,
          isSigner: false,
        },
      ],
      args: [
        {
          name: "args",
          type: {
            defined: "UnlockArgs",
          },
        },
      ],
    },
    {
      name: "withdrawGasToken",
      accounts: [
        {
          name: "admin",
          isMut: false,
          isSigner: true,
        },
        {
          name: "recipient",
          isMut: true,
          isSigner: false,
        },
        {
          name: "config",
          isMut: true,
          isSigner: false,
        },
      ],
      args: [
        {
          name: "amount",
          type: "u64",
        },
      ],
    },
    {
      name: "claimRewards",
      accounts: [
        {
          name: "user",
          isMut: true,
          isSigner: true,
        },
        {
          name: "mint",
          isMut: false,
          isSigner: false,
        },
        {
          name: "config",
          isMut: false,
          isSigner: false,
        },
        {
          name: "pool",
          isMut: true,
          isSigner: false,
        },
        {
          name: "bridgeToken",
          isMut: true,
          isSigner: false,
        },
        {
          name: "userToken",
          isMut: true,
          isSigner: false,
        },
        {
          name: "userDeposit",
          isMut: true,
          isSigner: false,
        },
        {
          name: "bridgeAuthority",
          isMut: false,
          isSigner: false,
        },
        {
          name: "tokenProgram",
          isMut: false,
          isSigner: false,
        },
        {
          name: "systemProgram",
          isMut: false,
          isSigner: false,
        },
      ],
      args: [],
    },
    {
      name: "setAdmin",
      accounts: [
        {
          name: "admin",
          isMut: false,
          isSigner: true,
        },
        {
          name: "newAdmin",
          isMut: false,
          isSigner: true,
        },
        {
          name: "config",
          isMut: true,
          isSigner: false,
        },
      ],
      args: [],
    },
    {
      name: "setAllbridgeMessengerProgramId",
      accounts: [
        {
          name: "admin",
          isMut: false,
          isSigner: true,
        },
        {
          name: "config",
          isMut: true,
          isSigner: false,
        },
      ],
      args: [
        {
          name: "newProgramId",
          type: "publicKey",
        },
      ],
    },
    {
      name: "setWormholeMessengerProgramId",
      accounts: [
        {
          name: "admin",
          isMut: false,
          isSigner: true,
        },
        {
          name: "config",
          isMut: true,
          isSigner: false,
        },
      ],
      args: [
        {
          name: "newProgramId",
          type: "publicKey",
        },
      ],
    },
    {
      name: "setGasOracleProgramId",
      accounts: [
        {
          name: "admin",
          isMut: false,
          isSigner: true,
        },
        {
          name: "config",
          isMut: true,
          isSigner: false,
        },
      ],
      args: [
        {
          name: "newProgramId",
          type: "publicKey",
        },
      ],
    },
    {
      name: "setPoolFeeShare",
      accounts: [
        {
          name: "admin",
          isMut: false,
          isSigner: true,
        },
        {
          name: "config",
          isMut: false,
          isSigner: false,
        },
        {
          name: "pool",
          isMut: true,
          isSigner: false,
        },
      ],
      args: [
        {
          name: "feeShareBp",
          type: "u64",
        },
      ],
    },
    {
      name: "setPoolAdminFeeShare",
      accounts: [
        {
          name: "admin",
          isMut: false,
          isSigner: true,
        },
        {
          name: "config",
          isMut: false,
          isSigner: false,
        },
        {
          name: "pool",
          isMut: true,
          isSigner: false,
        },
      ],
      args: [
        {
          name: "feeShareBp",
          type: "u64",
        },
      ],
    },
    {
      name: "addOtherBridgeToken",
      accounts: [
        {
          name: "admin",
          isMut: false,
          isSigner: true,
        },
        {
          name: "payer",
          isMut: true,
          isSigner: true,
        },
        {
          name: "config",
          isMut: false,
          isSigner: false,
        },
        {
          name: "otherBridgeToken",
          isMut: true,
          isSigner: false,
        },
        {
          name: "systemProgram",
          isMut: false,
          isSigner: false,
        },
      ],
      args: [
        {
          name: "chainId",
          type: "u8",
        },
        {
          name: "tokenAddress",
          type: {
            array: ["u8", 32],
          },
        },
      ],
    },
    {
      name: "removeOtherBridgeToken",
      accounts: [
        {
          name: "admin",
          isMut: false,
          isSigner: true,
        },
        {
          name: "payer",
          isMut: true,
          isSigner: true,
        },
        {
          name: "config",
          isMut: true,
          isSigner: false,
        },
        {
          name: "otherBridgeToken",
          isMut: true,
          isSigner: false,
        },
        {
          name: "systemProgram",
          isMut: false,
          isSigner: false,
        },
      ],
      args: [
        {
          name: "chainId",
          type: "u8",
        },
        {
          name: "tokenAddress",
          type: {
            array: ["u8", 32],
          },
        },
      ],
    },
    {
      name: "withdrawAdminFee",
      accounts: [
        {
          name: "admin",
          isMut: false,
          isSigner: true,
        },
        {
          name: "mint",
          isMut: false,
          isSigner: false,
        },
        {
          name: "config",
          isMut: false,
          isSigner: false,
        },
        {
          name: "pool",
          isMut: true,
          isSigner: false,
        },
        {
          name: "bridgeToken",
          isMut: true,
          isSigner: false,
        },
        {
          name: "adminToken",
          isMut: true,
          isSigner: false,
        },
        {
          name: "bridgeAuthority",
          isMut: false,
          isSigner: false,
        },
        {
          name: "tokenProgram",
          isMut: false,
          isSigner: false,
        },
        {
          name: "systemProgram",
          isMut: false,
          isSigner: false,
        },
      ],
      args: [],
    },
  ],
  accounts: [
    {
      name: "chainBridge",
      type: {
        kind: "struct",
        fields: [
          {
            name: "address",
            type: {
              array: ["u8", 32],
            },
          },
          {
            name: "chainId",
            type: "u8",
          },
          {
            name: "gasUsage",
            type: "u64",
          },
        ],
      },
    },
    {
      name: "config",
      type: {
        kind: "struct",
        fields: [
          {
            name: "admin",
            type: "publicKey",
          },
          {
            name: "allbridgeMessengerProgramId",
            type: "publicKey",
          },
          {
            name: "wormholeMessengerProgramId",
            type: "publicKey",
          },
          {
            name: "gasOracleProgramId",
            type: "publicKey",
          },
          {
            name: "authorityBumpSeed",
            type: "u8",
          },
        ],
      },
    },
    {
      name: "lock",
      type: {
        kind: "struct",
        fields: [
          {
            name: "sender",
            type: "publicKey",
          },
          {
            name: "sentTokenAddress",
            type: "publicKey",
          },
          {
            name: "amount",
            type: "u64",
          },
          {
            name: "vusdAmount",
            type: "u64",
          },
          {
            name: "recipient",
            type: {
              array: ["u8", 32],
            },
          },
          {
            name: "destinationChainId",
            type: "u8",
          },
          {
            name: "receiveToken",
            type: {
              array: ["u8", 32],
            },
          },
          {
            name: "nonce",
            type: {
              array: ["u8", 32],
            },
          },
          {
            name: "messenger",
            type: {
              defined: "Messenger",
            },
          },
          {
            name: "slot",
            type: "u64",
          },
          {
            name: "fee",
            type: "u64",
          },
        ],
      },
    },
    {
      name: "otherBridgeToken",
      type: {
        kind: "struct",
        fields: [],
      },
    },
    {
      name: "pool",
      type: {
        kind: "struct",
        fields: [
          {
            name: "mint",
            type: "publicKey",
          },
          {
            name: "a",
            type: "u64",
          },
          {
            name: "d",
            type: "u64",
          },
          {
            name: "tokenBalance",
            type: "u64",
          },
          {
            name: "vUsdBalance",
            type: "u64",
          },
          {
            name: "decimals",
            type: "u8",
          },
          {
            name: "totalLpAmount",
            type: "u64",
          },
          {
            name: "feeShareBp",
            type: "u64",
          },
          {
            name: "adminFeeShareBp",
            type: "u64",
          },
          {
            name: "accRewardPerShareP",
            type: "u128",
          },
          {
            name: "adminFeeAmount",
            type: "u64",
          },
        ],
      },
    },
    {
      name: "unlock",
      type: {
        kind: "struct",
        fields: [
          {
            name: "hash",
            type: {
              array: ["u8", 32],
            },
          },
          {
            name: "amount",
            type: "u64",
          },
          {
            name: "fee",
            type: "u64",
          },
          {
            name: "vUsdAmount",
            type: "u64",
          },
          {
            name: "slot",
            type: "u64",
          },
        ],
      },
    },
    {
      name: "userDeposit",
      type: {
        kind: "struct",
        fields: [
          {
            name: "userAddress",
            type: "publicKey",
          },
          {
            name: "mint",
            type: "publicKey",
          },
          {
            name: "lpAmount",
            type: "u64",
          },
          {
            name: "rewardDebt",
            type: "u64",
          },
        ],
      },
    },
  ],
  types: [
    {
      name: "RegisterChainBridgeArgs",
      type: {
        kind: "struct",
        fields: [
          {
            name: "chainBridgeAddress",
            type: {
              array: ["u8", 32],
            },
          },
          {
            name: "chainId",
            type: "u8",
          },
          {
            name: "gasUsage",
            type: "u64",
          },
        ],
      },
    },
    {
      name: "UpdateChainBridgeArgs",
      type: {
        kind: "struct",
        fields: [
          {
            name: "chainBridgeAddress",
            type: {
              array: ["u8", 32],
            },
          },
          {
            name: "chainId",
            type: "u8",
          },
          {
            name: "gasUsage",
            type: "u64",
          },
        ],
      },
    },
    {
      name: "InitializeArgs",
      type: {
        kind: "struct",
        fields: [
          {
            name: "allbridgeMessengerProgramId",
            type: "publicKey",
          },
          {
            name: "wormholeMessengerProgramId",
            type: "publicKey",
          },
          {
            name: "gasOracleProgramId",
            type: "publicKey",
          },
        ],
      },
    },
    {
      name: "InitializePoolArgs",
      type: {
        kind: "struct",
        fields: [
          {
            name: "a",
            type: "u64",
          },
          {
            name: "feeShareBp",
            type: "u64",
          },
          {
            name: "adminFeeShareBp",
            type: "u64",
          },
        ],
      },
    },
    {
      name: "BridgeArgs",
      type: {
        kind: "struct",
        fields: [
          {
            name: "nonce",
            type: {
              array: ["u8", 32],
            },
          },
          {
            name: "recipient",
            type: {
              array: ["u8", 32],
            },
          },
          {
            name: "destinationChainId",
            type: "u8",
          },
          {
            name: "receiveToken",
            type: {
              array: ["u8", 32],
            },
          },
          {
            name: "vusdAmount",
            type: "u64",
          },
        ],
      },
    },
    {
      name: "UnlockArgs",
      type: {
        kind: "struct",
        fields: [
          {
            name: "nonce",
            type: {
              array: ["u8", 32],
            },
          },
          {
            name: "amount",
            type: "u64",
          },
          {
            name: "recipient",
            type: "publicKey",
          },
          {
            name: "sourceChainId",
            type: "u8",
          },
          {
            name: "receiveToken",
            type: "publicKey",
          },
          {
            name: "messenger",
            type: {
              defined: "Messenger",
            },
          },
          {
            name: "hash",
            type: {
              array: ["u8", 32],
            },
          },
        ],
      },
    },
    {
      name: "Messenger",
      type: {
        kind: "enum",
        variants: [
          {
            name: "None",
          },
          {
            name: "Allbridge",
          },
          {
            name: "Wormhole",
          },
        ],
      },
    },
  ],
  errors: [
    {
      code: 6000,
      name: "AccountAlreadyInitialized",
      msg: "This account has already been initialized",
    },
    {
      code: 6001,
      name: "AdminAuthorityInvalid",
      msg: "This instruction requires admin authority",
    },
    {
      code: 6002,
      name: "InvalidSignature",
      msg: "Provided signature has wrong signer or message",
    },
    {
      code: 6003,
      name: "InvalidHash",
      msg: "Wrong unlock message hash",
    },
    {
      code: 6004,
      name: "PoolOverflow",
      msg: "Pool overflow",
    },
    {
      code: 6005,
      name: "ZeroAmount",
      msg: "Zero amount",
    },
    {
      code: 6006,
      name: "HighVusdAmount",
      msg: "vUSD amount is too high",
    },
  ],
};
