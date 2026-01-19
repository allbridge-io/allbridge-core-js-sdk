/**
 * Program IDL in camelCase format in order to be used in JS/TS.
 *
 * Note that this is only a type helper and is not the actual IDL. The original
 * IDL can be found at `target/idl/payer_with_token.json`.
 */
export type PayerWithToken = {
  address: "6yEPb644Z6mXUGf4h9zDZgaHXHZFGdbhjBGWRqyM8u23";
  metadata: {
    name: "payerWithToken";
    version: "0.1.0";
    spec: "0.1.0";
    description: "Created with Anchor";
  };
  instructions: [
    {
      name: "addFeeToken";
      discriminator: [171, 6, 150, 97, 69, 55, 13, 136];
      accounts: [
        {
          name: "initializer";
          writable: true;
          signer: true;
        },
        {
          name: "admin";
          signer: true;
        },
        {
          name: "feeTokenMint";
        },
        {
          name: "config";
          pda: {
            seeds: [
              {
                kind: "const";
                value: [99, 111, 110, 102, 105, 103];
              },
            ];
          };
        },
        {
          name: "feeTokenConfig";
          writable: true;
          pda: {
            seeds: [
              {
                kind: "const";
                value: [102, 101, 101, 95, 116, 111, 107, 101, 110];
              },
              {
                kind: "account";
                path: "feeTokenMint";
              },
            ];
          };
        },
        {
          name: "contractFeeTokenAccount";
          writable: true;
          pda: {
            seeds: [
              {
                kind: "const";
                value: [116, 111, 107, 101, 110];
              },
              {
                kind: "account";
                path: "feeTokenMint";
              },
            ];
          };
        },
        {
          name: "systemProgram";
          address: "11111111111111111111111111111111";
        },
        {
          name: "tokenProgram";
          address: "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA";
        },
        {
          name: "rent";
          address: "SysvarRent111111111111111111111111111111111";
        },
      ];
      args: [
        {
          name: "args";
          type: {
            defined: {
              name: "addFeeTokenArgs";
            };
          };
        },
      ];
    },
    {
      name: "bridgeCctp";
      discriminator: [35, 114, 66, 117, 122, 78, 225, 186];
      accounts: [
        {
          name: "user";
          writable: true;
          signer: true;
        },
        {
          name: "mint";
          writable: true;
        },
        {
          name: "feeTokenMint";
        },
        {
          name: "config";
          writable: true;
          pda: {
            seeds: [
              {
                kind: "const";
                value: [99, 111, 110, 102, 105, 103];
              },
            ];
          };
        },
        {
          name: "feeTokenConfig";
          writable: true;
          pda: {
            seeds: [
              {
                kind: "const";
                value: [102, 101, 101, 95, 116, 111, 107, 101, 110];
              },
              {
                kind: "account";
                path: "feeTokenMint";
              },
            ];
          };
        },
        {
          name: "userFeeTokenAccount";
          writable: true;
        },
        {
          name: "contractFeeTokenAccount";
          writable: true;
          pda: {
            seeds: [
              {
                kind: "const";
                value: [116, 111, 107, 101, 110];
              },
              {
                kind: "account";
                path: "feeTokenMint";
              },
            ];
          };
        },
        {
          name: "payerAuthority";
          writable: true;
          pda: {
            seeds: [
              {
                kind: "account";
                path: "config";
              },
            ];
          };
        },
        {
          name: "cctpBridge";
        },
        {
          name: "bridgeToken";
          writable: true;
        },
        {
          name: "cctpMessenger";
        },
        {
          name: "messageTransmitterProgram";
        },
        {
          name: "messageTransmitterAccount";
          writable: true;
        },
        {
          name: "tokenMessenger";
        },
        {
          name: "tokenMinter";
        },
        {
          name: "localToken";
          writable: true;
        },
        {
          name: "remoteTokenMessengerKey";
        },
        {
          name: "authorityPda";
        },
        {
          name: "eventAuthority";
        },
        {
          name: "messageSentEventData";
          writable: true;
          signer: true;
        },
        {
          name: "lock";
          writable: true;
        },
        {
          name: "cctpBridgeConfig";
          writable: true;
        },
        {
          name: "gasPrice";
        },
        {
          name: "thisGasPrice";
        },
        {
          name: "chainBridge";
        },
        {
          name: "bridgeAuthority";
        },
        {
          name: "userTokenAccount";
          writable: true;
        },
        {
          name: "tokenProgram";
          address: "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA";
        },
        {
          name: "systemProgram";
          address: "11111111111111111111111111111111";
        },
      ];
      args: [
        {
          name: "args";
          type: {
            defined: {
              name: "payerCctpBridgeArgs";
            };
          };
        },
      ];
    },
    {
      name: "initialize";
      discriminator: [175, 175, 109, 31, 13, 152, 155, 237];
      accounts: [
        {
          name: "initializer";
          writable: true;
          signer: true;
        },
        {
          name: "admin";
          writable: true;
          signer: true;
        },
        {
          name: "config";
          writable: true;
          pda: {
            seeds: [
              {
                kind: "const";
                value: [99, 111, 110, 102, 105, 103];
              },
            ];
          };
        },
        {
          name: "payerAuthority";
          writable: true;
          pda: {
            seeds: [
              {
                kind: "account";
                path: "config";
              },
            ];
          };
        },
        {
          name: "systemProgram";
          address: "11111111111111111111111111111111";
        },
        {
          name: "tokenProgram";
          address: "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA";
        },
        {
          name: "rent";
          address: "SysvarRent111111111111111111111111111111111";
        },
      ];
      args: [
        {
          name: "args";
          type: {
            defined: {
              name: "initializeArgs";
            };
          };
        },
      ];
    },
    {
      name: "removeFeeToken";
      discriminator: [46, 96, 240, 63, 28, 173, 62, 131];
      accounts: [
        {
          name: "admin";
          writable: true;
          signer: true;
        },
        {
          name: "feeTokenMint";
        },
        {
          name: "config";
          pda: {
            seeds: [
              {
                kind: "const";
                value: [99, 111, 110, 102, 105, 103];
              },
            ];
          };
        },
        {
          name: "feeTokenConfig";
          writable: true;
          pda: {
            seeds: [
              {
                kind: "const";
                value: [102, 101, 101, 95, 116, 111, 107, 101, 110];
              },
              {
                kind: "account";
                path: "feeTokenMint";
              },
            ];
          };
        },
        {
          name: "contractFeeTokenAccount";
          writable: true;
          pda: {
            seeds: [
              {
                kind: "const";
                value: [116, 111, 107, 101, 110];
              },
              {
                kind: "account";
                path: "feeTokenMint";
              },
            ];
          };
        },
        {
          name: "tokenProgram";
          address: "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA";
        },
      ];
      args: [];
    },
    {
      name: "setAdmin";
      discriminator: [251, 163, 0, 52, 91, 194, 187, 92];
      accounts: [
        {
          name: "admin";
          writable: true;
          signer: true;
        },
        {
          name: "newAdmin";
        },
        {
          name: "config";
          writable: true;
          pda: {
            seeds: [
              {
                kind: "const";
                value: [99, 111, 110, 102, 105, 103];
              },
            ];
          };
        },
      ];
      args: [];
    },
    {
      name: "setBridgeProgramId";
      discriminator: [59, 191, 249, 155, 146, 73, 202, 139];
      accounts: [
        {
          name: "admin";
          writable: true;
          signer: true;
        },
        {
          name: "config";
          writable: true;
          pda: {
            seeds: [
              {
                kind: "const";
                value: [99, 111, 110, 102, 105, 103];
              },
            ];
          };
        },
      ];
      args: [
        {
          name: "newProgramId";
          type: "pubkey";
        },
      ];
    },
    {
      name: "setCctpBridgeProgramId";
      discriminator: [164, 36, 75, 241, 35, 30, 47, 159];
      accounts: [
        {
          name: "admin";
          writable: true;
          signer: true;
        },
        {
          name: "config";
          writable: true;
          pda: {
            seeds: [
              {
                kind: "const";
                value: [99, 111, 110, 102, 105, 103];
              },
            ];
          };
        },
      ];
      args: [
        {
          name: "newProgramId";
          type: "pubkey";
        },
      ];
    },
    {
      name: "setFeeTokenPrice";
      discriminator: [116, 201, 189, 21, 190, 10, 242, 241];
      accounts: [
        {
          name: "priceAuthority";
          signer: true;
        },
        {
          name: "config";
          writable: true;
          pda: {
            seeds: [
              {
                kind: "const";
                value: [99, 111, 110, 102, 105, 103];
              },
            ];
          };
        },
        {
          name: "feeTokenMint";
        },
        {
          name: "feeTokenConfig";
          writable: true;
          pda: {
            seeds: [
              {
                kind: "const";
                value: [102, 101, 101, 95, 116, 111, 107, 101, 110];
              },
              {
                kind: "account";
                path: "feeTokenMint";
              },
            ];
          };
        },
      ];
      args: [
        {
          name: "newPrice";
          type: "u64";
        },
      ];
    },
    {
      name: "setGasOracleProgramId";
      discriminator: [172, 152, 29, 206, 112, 239, 205, 83];
      accounts: [
        {
          name: "admin";
          writable: true;
          signer: true;
        },
        {
          name: "config";
          writable: true;
          pda: {
            seeds: [
              {
                kind: "const";
                value: [99, 111, 110, 102, 105, 103];
              },
            ];
          };
        },
      ];
      args: [
        {
          name: "newProgramId";
          type: "pubkey";
        },
      ];
    },
    {
      name: "setPriceAuthority";
      discriminator: [51, 241, 68, 137, 206, 207, 244, 107];
      accounts: [
        {
          name: "admin";
          writable: true;
          signer: true;
        },
        {
          name: "config";
          writable: true;
          pda: {
            seeds: [
              {
                kind: "const";
                value: [99, 111, 110, 102, 105, 103];
              },
            ];
          };
        },
      ];
      args: [
        {
          name: "newAddress";
          type: "pubkey";
        },
      ];
    },
    {
      name: "swapAndBridge";
      discriminator: [204, 63, 169, 171, 186, 125, 86, 159];
      accounts: [
        {
          name: "user";
          writable: true;
          signer: true;
        },
        {
          name: "mint";
        },
        {
          name: "feeTokenMint";
        },
        {
          name: "config";
          writable: true;
          pda: {
            seeds: [
              {
                kind: "const";
                value: [99, 111, 110, 102, 105, 103];
              },
            ];
          };
        },
        {
          name: "feeTokenConfig";
          writable: true;
          pda: {
            seeds: [
              {
                kind: "const";
                value: [102, 101, 101, 95, 116, 111, 107, 101, 110];
              },
              {
                kind: "account";
                path: "feeTokenMint";
              },
            ];
          };
        },
        {
          name: "userFeeTokenAccount";
          writable: true;
        },
        {
          name: "contractFeeTokenAccount";
          writable: true;
          pda: {
            seeds: [
              {
                kind: "const";
                value: [116, 111, 107, 101, 110];
              },
              {
                kind: "account";
                path: "feeTokenMint";
              },
            ];
          };
        },
        {
          name: "payerAuthority";
          writable: true;
          pda: {
            seeds: [
              {
                kind: "account";
                path: "config";
              },
            ];
          };
        },
        {
          name: "bridge";
        },
        {
          name: "bridgeToken";
          writable: true;
        },
        {
          name: "messenger";
        },
        {
          name: "messengerConfig";
          writable: true;
        },
        {
          name: "sentMessageAccount";
          writable: true;
        },
        {
          name: "messengerGasUsage";
        },
        {
          name: "lock";
          writable: true;
        },
        {
          name: "bridgeConfig";
          writable: true;
        },
        {
          name: "otherBridgeToken";
          writable: true;
        },
        {
          name: "pool";
          writable: true;
        },
        {
          name: "gasPrice";
        },
        {
          name: "thisGasPrice";
        },
        {
          name: "chainBridge";
        },
        {
          name: "bridgeAuthority";
        },
        {
          name: "userTokenAccount";
          writable: true;
        },
        {
          name: "tokenProgram";
          address: "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA";
        },
        {
          name: "systemProgram";
          address: "11111111111111111111111111111111";
        },
      ];
      args: [
        {
          name: "args";
          type: {
            defined: {
              name: "payerSwapAndBridgeArgs";
            };
          };
        },
      ];
    },
    {
      name: "swapAndBridgeWormhole";
      discriminator: [41, 91, 201, 180, 150, 117, 154, 65];
      accounts: [
        {
          name: "user";
          writable: true;
          signer: true;
        },
        {
          name: "mint";
        },
        {
          name: "feeTokenMint";
        },
        {
          name: "config";
          writable: true;
          pda: {
            seeds: [
              {
                kind: "const";
                value: [99, 111, 110, 102, 105, 103];
              },
            ];
          };
        },
        {
          name: "feeTokenConfig";
          writable: true;
          pda: {
            seeds: [
              {
                kind: "const";
                value: [102, 101, 101, 95, 116, 111, 107, 101, 110];
              },
              {
                kind: "account";
                path: "feeTokenMint";
              },
            ];
          };
        },
        {
          name: "userFeeTokenAccount";
          writable: true;
        },
        {
          name: "contractFeeTokenAccount";
          writable: true;
          pda: {
            seeds: [
              {
                kind: "const";
                value: [116, 111, 107, 101, 110];
              },
              {
                kind: "account";
                path: "feeTokenMint";
              },
            ];
          };
        },
        {
          name: "payerAuthority";
          writable: true;
          pda: {
            seeds: [
              {
                kind: "account";
                path: "config";
              },
            ];
          };
        },
        {
          name: "bridge";
        },
        {
          name: "bridgeToken";
          writable: true;
        },
        {
          name: "lock";
          writable: true;
        },
        {
          name: "bridgeConfig";
          writable: true;
        },
        {
          name: "otherBridgeToken";
          writable: true;
        },
        {
          name: "pool";
          writable: true;
        },
        {
          name: "gasPrice";
        },
        {
          name: "thisGasPrice";
        },
        {
          name: "chainBridge";
        },
        {
          name: "userTokenAccount";
          writable: true;
        },
        {
          name: "bridgeAuthority";
        },
        {
          name: "wormholeMessenger";
        },
        {
          name: "wormholeMessengerConfig";
          writable: true;
        },
        {
          name: "wormholeProgram";
        },
        {
          name: "wormholeBridge";
          writable: true;
        },
        {
          name: "message";
          writable: true;
          signer: true;
        },
        {
          name: "sequence";
          writable: true;
        },
        {
          name: "feeCollector";
          writable: true;
        },
        {
          name: "messengerGasUsage";
        },
        {
          name: "clock";
          address: "SysvarC1ock11111111111111111111111111111111";
        },
        {
          name: "rent";
          address: "SysvarRent111111111111111111111111111111111";
        },
        {
          name: "tokenProgram";
          address: "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA";
        },
        {
          name: "systemProgram";
          address: "11111111111111111111111111111111";
        },
      ];
      args: [
        {
          name: "args";
          type: {
            defined: {
              name: "payerSwapAndBridgeArgs";
            };
          };
        },
      ];
    },
    {
      name: "withdrawFeeToken";
      discriminator: [131, 103, 89, 216, 53, 78, 255, 118];
      accounts: [
        {
          name: "admin";
          signer: true;
        },
        {
          name: "config";
          writable: true;
          pda: {
            seeds: [
              {
                kind: "const";
                value: [99, 111, 110, 102, 105, 103];
              },
            ];
          };
        },
        {
          name: "feeTokenMint";
        },
        {
          name: "feeTokenConfig";
          writable: true;
          pda: {
            seeds: [
              {
                kind: "const";
                value: [102, 101, 101, 95, 116, 111, 107, 101, 110];
              },
              {
                kind: "account";
                path: "feeTokenMint";
              },
            ];
          };
        },
        {
          name: "contractFeeTokenAccount";
          writable: true;
          pda: {
            seeds: [
              {
                kind: "const";
                value: [116, 111, 107, 101, 110];
              },
              {
                kind: "account";
                path: "feeTokenMint";
              },
            ];
          };
        },
        {
          name: "adminFeeTokenAccount";
          writable: true;
        },
        {
          name: "tokenProgram";
          address: "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA";
        },
        {
          name: "systemProgram";
          address: "11111111111111111111111111111111";
        },
      ];
      args: [
        {
          name: "amount";
          type: "u64";
        },
      ];
    },
    {
      name: "withdrawGasToken";
      discriminator: [109, 117, 140, 223, 117, 175, 2, 139];
      accounts: [
        {
          name: "admin";
          signer: true;
        },
        {
          name: "recipient";
          writable: true;
        },
        {
          name: "payerAuthority";
          writable: true;
          pda: {
            seeds: [
              {
                kind: "account";
                path: "config";
              },
            ];
          };
        },
        {
          name: "config";
          pda: {
            seeds: [
              {
                kind: "const";
                value: [99, 111, 110, 102, 105, 103];
              },
            ];
          };
        },
        {
          name: "systemProgram";
          address: "11111111111111111111111111111111";
        },
      ];
      args: [
        {
          name: "amount";
          type: "u64";
        },
      ];
    },
  ];
  accounts: [
    {
      name: "chainBridge";
      discriminator: [25, 216, 147, 218, 140, 42, 98, 49];
    },
    {
      name: "config";
      discriminator: [155, 12, 170, 224, 30, 250, 204, 130];
    },
    {
      name: "feeTokenConfig";
      discriminator: [226, 113, 31, 124, 53, 31, 222, 222];
    },
    {
      name: "price";
      discriminator: [50, 107, 127, 61, 83, 36, 39, 75];
    },
  ];
  events: [
    {
      name: "extraGasSentEvent";
      discriminator: [111, 21, 139, 73, 113, 95, 104, 52];
    },
  ];
  errors: [
    {
      code: 6000;
      name: "payerFeeSlippage";
      msg: "Payer fee slippage";
    },
  ];
  types: [
    {
      name: "addFeeTokenArgs";
      type: {
        kind: "struct";
        fields: [
          {
            name: "price";
            type: "u64";
          },
        ];
      };
    },
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
          },
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
            type: "pubkey";
          },
          {
            name: "authorityBumpSeed";
            type: "u8";
          },
          {
            name: "bridgeProgramId";
            type: "pubkey";
          },
          {
            name: "cctpBridgeProgramId";
            type: "pubkey";
          },
          {
            name: "gasOracleProgramId";
            type: "pubkey";
          },
          {
            name: "priceAuthority";
            type: "pubkey";
          },
        ];
      };
    },
    {
      name: "extraGasSentEvent";
      type: {
        kind: "struct";
        fields: [
          {
            name: "feeTokenMint";
            type: "pubkey";
          },
          {
            name: "extraGasAmountInFeeToken";
            type: "u64";
          },
          {
            name: "extraGasAmountInSol";
            type: "u64";
          },
          {
            name: "extraGasAmountInUsd";
            type: "u64";
          },
        ];
      };
    },
    {
      name: "feeTokenConfig";
      type: {
        kind: "struct";
        fields: [
          {
            name: "mint";
            type: "pubkey";
          },
          {
            name: "decimals";
            type: "u8";
          },
          {
            name: "price";
            type: "u64";
          },
          {
            name: "bump";
            type: "u8";
          },
        ];
      };
    },
    {
      name: "initializeArgs";
      type: {
        kind: "struct";
        fields: [
          {
            name: "bridgeProgramId";
            type: "pubkey";
          },
          {
            name: "cctpBridgeProgramId";
            type: "pubkey";
          },
          {
            name: "gasOracleProgramId";
            type: "pubkey";
          },
        ];
      };
    },
    {
      name: "payerCctpBridgeArgs";
      type: {
        kind: "struct";
        fields: [
          {
            name: "maxFeeAmount";
            type: "u64";
          },
          {
            name: "extraGasAmountInFeeToken";
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
            name: "amount";
            type: "u64";
          },
        ];
      };
    },
    {
      name: "payerSwapAndBridgeArgs";
      type: {
        kind: "struct";
        fields: [
          {
            name: "maxFeeAmount";
            type: "u64";
          },
          {
            name: "extraGasAmountInFeeToken";
            type: "u64";
          },
          {
            name: "destinationChainId";
            type: "u8";
          },
          {
            name: "recipient";
            type: {
              array: ["u8", 32];
            };
          },
          {
            name: "recipientToken";
            type: {
              array: ["u8", 32];
            };
          },
          {
            name: "vusdAmount";
            type: "u64";
          },
          {
            name: "nonce";
            type: {
              array: ["u8", 32];
            };
          },
        ];
      };
    },
    {
      name: "price";
      type: {
        kind: "struct";
        fields: [
          {
            name: "chainId";
            type: "u8";
          },
          {
            name: "price";
            type: "u64";
          },
          {
            name: "gasPrice";
            type: "u64";
          },
        ];
      };
    },
  ];
};
