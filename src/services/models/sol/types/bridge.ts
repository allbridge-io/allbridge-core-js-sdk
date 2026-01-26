/**
 * Program IDL in camelCase format in order to be used in JS/TS.
 *
 * Note that this is only a type helper and is not the actual IDL. The original
 * IDL can be found at `target/idl/bridge.json`.
 */
export type Bridge = {
  address: "EmLt85sXNvqjzZo3C6BCq55ZzSuvSNFomVnf6b1PgY8R";
  metadata: {
    name: "bridge";
    version: "0.1.0";
    spec: "0.1.0";
    description: "Created with Anchor";
  };
  instructions: [
    {
      name: "addOtherBridgeToken";
      discriminator: [103, 180, 1, 186, 219, 156, 185, 114];
      accounts: [
        {
          name: "admin";
          signer: true;
        },
        {
          name: "payer";
          writable: true;
          signer: true;
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
          name: "otherBridgeToken";
          writable: true;
        },
        {
          name: "systemProgram";
          address: "11111111111111111111111111111111";
        },
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
        },
      ];
    },
    {
      name: "adjustTotalLpAmount";
      discriminator: [8, 190, 6, 31, 121, 124, 62, 241];
      accounts: [
        {
          name: "admin";
          signer: true;
        },
        {
          name: "mint";
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
          name: "pool";
          writable: true;
          pda: {
            seeds: [
              {
                kind: "const";
                value: [112, 111, 111, 108];
              },
              {
                kind: "account";
                path: "mint";
              },
            ];
          };
        },
        {
          name: "bridgeToken";
          writable: true;
          pda: {
            seeds: [
              {
                kind: "const";
                value: [116, 111, 107, 101, 110];
              },
              {
                kind: "account";
                path: "mint";
              },
            ];
          };
        },
        {
          name: "userToken";
          writable: true;
        },
        {
          name: "userDeposit";
          writable: true;
          pda: {
            seeds: [
              {
                kind: "const";
                value: [117, 115, 101, 114, 95, 100, 101, 112, 111, 115, 105, 116];
              },
              {
                kind: "account";
                path: "mint";
              },
              {
                kind: "account";
                path: "admin";
              },
            ];
          };
        },
        {
          name: "bridgeAuthority";
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
          name: "tokenProgram";
          address: "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA";
        },
      ];
      args: [];
    },
    {
      name: "claimRewards";
      discriminator: [4, 144, 132, 71, 116, 23, 151, 80];
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
          name: "pool";
          writable: true;
          pda: {
            seeds: [
              {
                kind: "const";
                value: [112, 111, 111, 108];
              },
              {
                kind: "account";
                path: "mint";
              },
            ];
          };
        },
        {
          name: "bridgeToken";
          writable: true;
          pda: {
            seeds: [
              {
                kind: "const";
                value: [116, 111, 107, 101, 110];
              },
              {
                kind: "account";
                path: "mint";
              },
            ];
          };
        },
        {
          name: "userToken";
          writable: true;
        },
        {
          name: "userDeposit";
          writable: true;
          pda: {
            seeds: [
              {
                kind: "const";
                value: [117, 115, 101, 114, 95, 100, 101, 112, 111, 115, 105, 116];
              },
              {
                kind: "account";
                path: "mint";
              },
              {
                kind: "account";
                path: "user";
              },
            ];
          };
        },
        {
          name: "bridgeAuthority";
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
          name: "tokenProgram";
          address: "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA";
        },
        {
          name: "systemProgram";
          address: "11111111111111111111111111111111";
        },
      ];
      args: [];
    },
    {
      name: "deposit";
      discriminator: [242, 35, 198, 137, 82, 225, 242, 182];
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
          name: "pool";
          writable: true;
          pda: {
            seeds: [
              {
                kind: "const";
                value: [112, 111, 111, 108];
              },
              {
                kind: "account";
                path: "mint";
              },
            ];
          };
        },
        {
          name: "bridgeToken";
          writable: true;
          pda: {
            seeds: [
              {
                kind: "const";
                value: [116, 111, 107, 101, 110];
              },
              {
                kind: "account";
                path: "mint";
              },
            ];
          };
        },
        {
          name: "userToken";
          writable: true;
        },
        {
          name: "userDeposit";
          writable: true;
          pda: {
            seeds: [
              {
                kind: "const";
                value: [117, 115, 101, 114, 95, 100, 101, 112, 111, 115, 105, 116];
              },
              {
                kind: "account";
                path: "mint";
              },
              {
                kind: "account";
                path: "user";
              },
            ];
          };
        },
        {
          name: "bridgeAuthority";
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
      name: "initDepositAccount";
      discriminator: [136, 79, 202, 206, 211, 146, 182, 158];
      accounts: [
        {
          name: "user";
          writable: true;
          signer: true;
        },
        {
          name: "payer";
          writable: true;
          signer: true;
        },
        {
          name: "mint";
        },
        {
          name: "userDeposit";
          writable: true;
          pda: {
            seeds: [
              {
                kind: "const";
                value: [117, 115, 101, 114, 95, 100, 101, 112, 111, 115, 105, 116];
              },
              {
                kind: "account";
                path: "mint";
              },
              {
                kind: "account";
                path: "user";
              },
            ];
          };
        },
        {
          name: "systemProgram";
          address: "11111111111111111111111111111111";
        },
      ];
      args: [];
    },
    {
      name: "initialize";
      discriminator: [175, 175, 109, 31, 13, 152, 155, 237];
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
              name: "initializeArgs";
            };
          };
        },
      ];
    },
    {
      name: "initializePool";
      discriminator: [95, 180, 10, 172, 84, 174, 232, 40];
      accounts: [
        {
          name: "payer";
          writable: true;
          signer: true;
        },
        {
          name: "admin";
          signer: true;
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
          name: "pool";
          writable: true;
          pda: {
            seeds: [
              {
                kind: "const";
                value: [112, 111, 111, 108];
              },
              {
                kind: "account";
                path: "mint";
              },
            ];
          };
        },
        {
          name: "bridgeAuthority";
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
          name: "mint";
        },
        {
          name: "token";
          writable: true;
          pda: {
            seeds: [
              {
                kind: "const";
                value: [116, 111, 107, 101, 110];
              },
              {
                kind: "account";
                path: "mint";
              },
            ];
          };
        },
        {
          name: "tokenProgram";
          address: "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA";
        },
        {
          name: "systemProgram";
          address: "11111111111111111111111111111111";
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
              name: "initializePoolArgs";
            };
          };
        },
      ];
    },
    {
      name: "receiveAndSwap";
      discriminator: [49, 243, 231, 17, 38, 214, 140, 225];
      accounts: [
        {
          name: "user";
          writable: true;
        },
        {
          name: "payer";
          writable: true;
          signer: true;
        },
        {
          name: "mint";
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
          name: "pool";
          writable: true;
          pda: {
            seeds: [
              {
                kind: "const";
                value: [112, 111, 111, 108];
              },
              {
                kind: "account";
                path: "mint";
              },
            ];
          };
        },
        {
          name: "bridgeToken";
          writable: true;
          pda: {
            seeds: [
              {
                kind: "const";
                value: [116, 111, 107, 101, 110];
              },
              {
                kind: "account";
                path: "mint";
              },
            ];
          };
        },
        {
          name: "receivedMessageAccount";
        },
        {
          name: "unlock";
          writable: true;
          pda: {
            seeds: [
              {
                kind: "const";
                value: [117, 110, 108, 111, 99, 107];
              },
              {
                kind: "arg";
                path: "args.hash";
              },
            ];
          };
        },
        {
          name: "chainBridge";
        },
        {
          name: "userToken";
          writable: true;
        },
        {
          name: "bridgeAuthority";
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
          name: "tokenProgram";
          address: "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA";
        },
        {
          name: "systemProgram";
          address: "11111111111111111111111111111111";
        },
        {
          name: "messengerProgram";
        },
      ];
      args: [
        {
          name: "args";
          type: {
            defined: {
              name: "unlockArgs";
            };
          };
        },
      ];
    },
    {
      name: "receiveAndSwapWormhole";
      discriminator: [53, 141, 209, 156, 114, 7, 54, 229];
      accounts: [
        {
          name: "user";
          writable: true;
        },
        {
          name: "payer";
          writable: true;
          signer: true;
        },
        {
          name: "mint";
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
          name: "pool";
          writable: true;
          pda: {
            seeds: [
              {
                kind: "const";
                value: [112, 111, 111, 108];
              },
              {
                kind: "account";
                path: "mint";
              },
            ];
          };
        },
        {
          name: "bridgeToken";
          writable: true;
          pda: {
            seeds: [
              {
                kind: "const";
                value: [116, 111, 107, 101, 110];
              },
              {
                kind: "account";
                path: "mint";
              },
            ];
          };
        },
        {
          name: "receivedMessageAccount";
        },
        {
          name: "unlock";
          writable: true;
          pda: {
            seeds: [
              {
                kind: "const";
                value: [117, 110, 108, 111, 99, 107];
              },
              {
                kind: "arg";
                path: "args.hash";
              },
            ];
          };
        },
        {
          name: "chainBridge";
        },
        {
          name: "userToken";
          writable: true;
        },
        {
          name: "bridgeAuthority";
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
          name: "tokenProgram";
          address: "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA";
        },
        {
          name: "systemProgram";
          address: "11111111111111111111111111111111";
        },
        {
          name: "messengerProgram";
        },
      ];
      args: [
        {
          name: "args";
          type: {
            defined: {
              name: "unlockArgs";
            };
          };
        },
      ];
    },
    {
      name: "registerChainBridge";
      discriminator: [239, 66, 180, 165, 175, 10, 49, 233];
      accounts: [
        {
          name: "admin";
          signer: true;
        },
        {
          name: "payer";
          writable: true;
          signer: true;
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
          name: "chainBridge";
          writable: true;
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
              name: "registerChainBridgeArgs";
            };
          };
        },
      ];
    },
    {
      name: "removeOtherBridgeToken";
      discriminator: [149, 232, 199, 145, 241, 219, 24, 154];
      accounts: [
        {
          name: "admin";
          signer: true;
        },
        {
          name: "payer";
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
          name: "otherBridgeToken";
          writable: true;
        },
        {
          name: "systemProgram";
          address: "11111111111111111111111111111111";
        },
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
        },
      ];
    },
    {
      name: "setAdmin";
      discriminator: [251, 163, 0, 52, 91, 194, 187, 92];
      accounts: [
        {
          name: "admin";
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
      name: "setAllbridgeMessengerProgramId";
      discriminator: [168, 21, 145, 139, 97, 252, 84, 77];
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
      ];
      args: [
        {
          name: "newProgramId";
          type: "pubkey";
        },
      ];
    },
    {
      name: "setBalanceRatioMin";
      discriminator: [210, 171, 132, 168, 93, 237, 9, 201];
      accounts: [
        {
          name: "admin";
          signer: true;
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
          name: "pool";
          writable: true;
        },
      ];
      args: [
        {
          name: "balanceRatioMinBp";
          type: "u16";
        },
      ];
    },
    {
      name: "setGasOracleProgramId";
      discriminator: [172, 152, 29, 206, 112, 239, 205, 83];
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
      ];
      args: [
        {
          name: "newProgramId";
          type: "pubkey";
        },
      ];
    },
    {
      name: "setPoolAdminFeeShare";
      discriminator: [235, 219, 45, 195, 124, 82, 164, 230];
      accounts: [
        {
          name: "admin";
          signer: true;
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
          name: "pool";
          writable: true;
        },
      ];
      args: [
        {
          name: "feeShareBp";
          type: "u64";
        },
      ];
    },
    {
      name: "setPoolFeeShare";
      discriminator: [151, 35, 220, 215, 38, 227, 226, 9];
      accounts: [
        {
          name: "admin";
          signer: true;
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
          name: "pool";
          writable: true;
        },
      ];
      args: [
        {
          name: "feeShareBp";
          type: "u64";
        },
      ];
    },
    {
      name: "setRebalancer";
      discriminator: [28, 161, 168, 250, 215, 4, 144, 154];
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
          name: "rebalancer";
        },
      ];
      args: [];
    },
    {
      name: "setStopAuthority";
      discriminator: [238, 229, 235, 32, 221, 191, 227, 43];
      accounts: [
        {
          name: "admin";
          signer: true;
        },
        {
          name: "newAuthority";
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
      name: "setWormholeMessengerProgramId";
      discriminator: [215, 127, 198, 117, 43, 17, 36, 24];
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
      ];
      args: [
        {
          name: "newProgramId";
          type: "pubkey";
        },
      ];
    },
    {
      name: "startBridge";
      discriminator: [213, 146, 40, 152, 47, 121, 85, 18];
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
      ];
      args: [
        {
          name: "actionType";
          type: {
            defined: {
              name: "actionType";
            };
          };
        },
      ];
    },
    {
      name: "stopBridge";
      discriminator: [187, 52, 235, 53, 245, 59, 218, 1];
      accounts: [
        {
          name: "stopAuthority";
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
          name: "actionType";
          type: {
            defined: {
              name: "actionType";
            };
          };
        },
      ];
    },
    {
      name: "swap";
      discriminator: [248, 198, 158, 145, 225, 117, 135, 200];
      accounts: [
        {
          name: "user";
          writable: true;
          signer: true;
        },
        {
          name: "payer";
          writable: true;
          signer: true;
        },
        {
          name: "sendMint";
        },
        {
          name: "receiveMint";
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
          name: "sendPool";
          writable: true;
          pda: {
            seeds: [
              {
                kind: "const";
                value: [112, 111, 111, 108];
              },
              {
                kind: "account";
                path: "sendMint";
              },
            ];
          };
        },
        {
          name: "receivePool";
          writable: true;
          pda: {
            seeds: [
              {
                kind: "const";
                value: [112, 111, 111, 108];
              },
              {
                kind: "account";
                path: "receiveMint";
              },
            ];
          };
        },
        {
          name: "sendBridgeToken";
          writable: true;
          pda: {
            seeds: [
              {
                kind: "const";
                value: [116, 111, 107, 101, 110];
              },
              {
                kind: "account";
                path: "sendMint";
              },
            ];
          };
        },
        {
          name: "receiveBridgeToken";
          writable: true;
          pda: {
            seeds: [
              {
                kind: "const";
                value: [116, 111, 107, 101, 110];
              },
              {
                kind: "account";
                path: "receiveMint";
              },
            ];
          };
        },
        {
          name: "sendUserToken";
          writable: true;
        },
        {
          name: "receiveUserToken";
          writable: true;
        },
        {
          name: "bridgeAuthority";
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
          name: "tokenProgram";
          address: "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA";
        },
      ];
      args: [
        {
          name: "amount";
          type: "u64";
        },
        {
          name: "receiveAmountMin";
          type: "u64";
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
          name: "payer";
          writable: true;
          signer: true;
        },
        {
          name: "lock";
          writable: true;
          pda: {
            seeds: [
              {
                kind: "const";
                value: [108, 111, 99, 107];
              },
              {
                kind: "arg";
                path: "args.nonce";
              },
            ];
          };
        },
        {
          name: "mint";
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
          name: "otherBridgeToken";
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
          name: "pool";
          writable: true;
          pda: {
            seeds: [
              {
                kind: "const";
                value: [112, 111, 111, 108];
              },
              {
                kind: "account";
                path: "mint";
              },
            ];
          };
        },
        {
          name: "bridgeToken";
          writable: true;
          pda: {
            seeds: [
              {
                kind: "const";
                value: [116, 111, 107, 101, 110];
              },
              {
                kind: "account";
                path: "mint";
              },
            ];
          };
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
          name: "userToken";
          writable: true;
        },
        {
          name: "bridgeAuthority";
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
              name: "bridgeArgs";
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
          signer: true;
        },
        {
          name: "payer";
          writable: true;
          signer: true;
        },
        {
          name: "lock";
          writable: true;
          pda: {
            seeds: [
              {
                kind: "const";
                value: [108, 111, 99, 107];
              },
              {
                kind: "arg";
                path: "args.nonce";
              },
            ];
          };
        },
        {
          name: "mint";
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
          name: "otherBridgeToken";
          writable: true;
        },
        {
          name: "pool";
          writable: true;
          pda: {
            seeds: [
              {
                kind: "const";
                value: [112, 111, 111, 108];
              },
              {
                kind: "account";
                path: "mint";
              },
            ];
          };
        },
        {
          name: "bridgeToken";
          writable: true;
          pda: {
            seeds: [
              {
                kind: "const";
                value: [116, 111, 107, 101, 110];
              },
              {
                kind: "account";
                path: "mint";
              },
            ];
          };
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
          name: "userToken";
          writable: true;
        },
        {
          name: "bridgeAuthority";
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
          name: "bridge";
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
              name: "bridgeArgs";
            };
          };
        },
      ];
    },
    {
      name: "updateChainBridge";
      discriminator: [227, 4, 133, 105, 230, 88, 226, 173];
      accounts: [
        {
          name: "admin";
          signer: true;
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
          name: "chainBridge";
          writable: true;
        },
      ];
      args: [
        {
          name: "args";
          type: {
            defined: {
              name: "updateChainBridgeArgs";
            };
          };
        },
      ];
    },
    {
      name: "withdraw";
      discriminator: [183, 18, 70, 156, 148, 109, 161, 34];
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
          name: "pool";
          writable: true;
          pda: {
            seeds: [
              {
                kind: "const";
                value: [112, 111, 111, 108];
              },
              {
                kind: "account";
                path: "mint";
              },
            ];
          };
        },
        {
          name: "bridgeToken";
          writable: true;
          pda: {
            seeds: [
              {
                kind: "const";
                value: [116, 111, 107, 101, 110];
              },
              {
                kind: "account";
                path: "mint";
              },
            ];
          };
        },
        {
          name: "userToken";
          writable: true;
        },
        {
          name: "userDeposit";
          writable: true;
          pda: {
            seeds: [
              {
                kind: "const";
                value: [117, 115, 101, 114, 95, 100, 101, 112, 111, 115, 105, 116];
              },
              {
                kind: "account";
                path: "mint";
              },
              {
                kind: "account";
                path: "user";
              },
            ];
          };
        },
        {
          name: "bridgeAuthority";
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
          name: "amountLp";
          type: "u64";
        },
      ];
    },
    {
      name: "withdrawAdminFee";
      discriminator: [176, 135, 230, 197, 163, 130, 60, 252];
      accounts: [
        {
          name: "admin";
          signer: true;
        },
        {
          name: "mint";
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
          name: "pool";
          writable: true;
          pda: {
            seeds: [
              {
                kind: "const";
                value: [112, 111, 111, 108];
              },
              {
                kind: "account";
                path: "mint";
              },
            ];
          };
        },
        {
          name: "bridgeToken";
          writable: true;
          pda: {
            seeds: [
              {
                kind: "const";
                value: [116, 111, 107, 101, 110];
              },
              {
                kind: "account";
                path: "mint";
              },
            ];
          };
        },
        {
          name: "adminToken";
          writable: true;
        },
        {
          name: "bridgeAuthority";
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
          name: "tokenProgram";
          address: "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA";
        },
        {
          name: "systemProgram";
          address: "11111111111111111111111111111111";
        },
      ];
      args: [];
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
      name: "lock";
      discriminator: [8, 255, 36, 202, 210, 22, 57, 137];
    },
    {
      name: "otherBridgeToken";
      discriminator: [27, 112, 167, 155, 2, 141, 52, 167];
    },
    {
      name: "pool";
      discriminator: [241, 154, 109, 4, 17, 177, 109, 188];
    },
    {
      name: "price";
      discriminator: [50, 107, 127, 61, 83, 36, 39, 75];
    },
    {
      name: "unlock";
      discriminator: [187, 122, 21, 254, 7, 157, 241, 10];
    },
    {
      name: "userDeposit";
      discriminator: [69, 238, 23, 217, 255, 137, 185, 35];
    },
  ];
  errors: [
    {
      code: 6000;
      name: "accountAlreadyInitialized";
      msg: "This account has already been initialized";
    },
    {
      code: 6001;
      name: "adminAuthorityInvalid";
      msg: "This instruction requires admin authority";
    },
    {
      code: 6002;
      name: "invalidSignature";
      msg: "Provided signature has wrong signer or message";
    },
    {
      code: 6003;
      name: "invalidHash";
      msg: "Wrong unlock message hash";
    },
    {
      code: 6004;
      name: "poolOverflow";
      msg: "Pool overflow";
    },
    {
      code: 6005;
      name: "reservesExhausted";
      msg: "Reserves exhausted";
    },
    {
      code: 6006;
      name: "zeroAmount";
      msg: "Zero amount";
    },
    {
      code: 6007;
      name: "zeroChanges";
      msg: "Zero changes";
    },
    {
      code: 6008;
      name: "highVusdAmount";
      msg: "vUSD amount is too high";
    },
    {
      code: 6009;
      name: "balanceRatioExceeded";
      msg: "Balance ratio exceeded";
    },
    {
      code: 6010;
      name: "insufficientReceivedAmount";
      msg: "Received insufficient amount";
    },
    {
      code: 6011;
      name: "forbiddenAction";
      msg: "forbiddenAction";
    },
    {
      code: 6012;
      name: "valueTooHigh";
      msg: "Value is too high";
    },
    {
      code: 6013;
      name: "emptyRecipient";
      msg: "Empty recipient";
    },
  ];
  types: [
    {
      name: "actionType";
      type: {
        kind: "enum";
        variants: [
          {
            name: "deposit";
          },
          {
            name: "withdraw";
          },
          {
            name: "swap";
          },
        ];
      };
    },
    {
      name: "bridgeArgs";
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
            name: "allbridgeMessengerProgramId";
            type: "pubkey";
          },
          {
            name: "wormholeMessengerProgramId";
            type: "pubkey";
          },
          {
            name: "gasOracleProgramId";
            type: "pubkey";
          },
          {
            name: "rebalancer";
            type: "pubkey";
          },
          {
            name: "stopAuthority";
            type: "pubkey";
          },
          {
            name: "authorityBumpSeed";
            type: "u8";
          },
          {
            name: "canSwap";
            type: "bool";
          },
          {
            name: "canDeposit";
            type: "bool";
          },
          {
            name: "canWithdraw";
            type: "bool";
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
            name: "allbridgeMessengerProgramId";
            type: "pubkey";
          },
          {
            name: "wormholeMessengerProgramId";
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
      name: "initializePoolArgs";
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
          },
          {
            name: "balanceRatioMinBp";
            type: "u16";
          },
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
            type: "pubkey";
          },
          {
            name: "sentTokenAddress";
            type: "pubkey";
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
              defined: {
                name: "messenger";
              };
            };
          },
          {
            name: "slot";
            type: "u64";
          },
          {
            name: "fee";
            type: "u64";
          },
        ];
      };
    },
    {
      name: "messenger";
      type: {
        kind: "enum";
        variants: [
          {
            name: "none";
          },
          {
            name: "allbridge";
          },
          {
            name: "wormhole";
          },
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
            type: "pubkey";
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
            name: "reserves";
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
          },
          {
            name: "balanceRatioMinBp";
            type: "u16";
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
    {
      name: "registerChainBridgeArgs";
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
          },
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
          },
        ];
      };
    },
    {
      name: "unlockArgs";
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
            type: "pubkey";
          },
          {
            name: "sourceChainId";
            type: "u8";
          },
          {
            name: "receiveToken";
            type: "pubkey";
          },
          {
            name: "messenger";
            type: {
              defined: {
                name: "messenger";
              };
            };
          },
          {
            name: "hash";
            type: {
              array: ["u8", 32];
            };
          },
          {
            name: "receiveAmountMin";
            type: "u64";
          },
        ];
      };
    },
    {
      name: "updateChainBridgeArgs";
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
          },
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
            type: "pubkey";
          },
          {
            name: "mint";
            type: "pubkey";
          },
          {
            name: "lpAmount";
            type: "u64";
          },
          {
            name: "rewardDebt";
            type: "u64";
          },
        ];
      };
    },
  ];
};
