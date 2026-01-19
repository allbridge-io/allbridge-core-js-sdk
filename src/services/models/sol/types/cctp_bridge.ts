/**
 * Program IDL in camelCase format in order to be used in JS/TS.
 *
 * Note that this is only a type helper and is not the actual IDL. The original
 * IDL can be found at `target/idl/cctp_bridge.json`.
 */
export type CctpBridge = {
  address: "XHXBA5WK4PTaLjjVfhPLttXwjeiq18yLdPsBL42YKaY";
  metadata: {
    name: "cctpBridge";
    version: "0.1.0";
    spec: "0.1.0";
    description: "Created with Anchor";
  };
  instructions: [
    {
      name: "bridge";
      discriminator: [174, 41, 120, 146, 98, 218, 169, 25];
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
          name: "messageSentEventData";
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
                kind: "account";
                path: "messageSentEventData";
              },
            ];
          };
        },
        {
          name: "mint";
          writable: true;
        },
        {
          name: "cctpBridge";
          writable: true;
          pda: {
            seeds: [
              {
                kind: "const";
                value: [99, 99, 116, 112, 95, 98, 114, 105, 100, 103, 101];
              },
              {
                kind: "account";
                path: "mint";
              },
            ];
          };
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
                path: "cctpBridge";
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
      name: "initialize";
      discriminator: [175, 175, 109, 31, 13, 152, 155, 237];
      accounts: [
        {
          name: "payer";
          writable: true;
          signer: true;
        },
        {
          name: "admin";
          writable: true;
          signer: true;
        },
        {
          name: "mint";
        },
        {
          name: "cctpBridge";
          writable: true;
          pda: {
            seeds: [
              {
                kind: "const";
                value: [99, 99, 116, 112, 95, 98, 114, 105, 100, 103, 101];
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
                path: "cctpBridge";
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
          name: "cctpBridge";
          pda: {
            seeds: [
              {
                kind: "const";
                value: [99, 99, 116, 112, 95, 98, 114, 105, 100, 103, 101];
              },
              {
                kind: "arg";
                path: "args.mint";
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
      name: "setAdmin";
      discriminator: [251, 163, 0, 52, 91, 194, 187, 92];
      accounts: [
        {
          name: "admin";
          signer: true;
        },
        {
          name: "mint";
        },
        {
          name: "newAdmin";
        },
        {
          name: "cctpBridge";
          writable: true;
          pda: {
            seeds: [
              {
                kind: "const";
                value: [99, 99, 116, 112, 95, 98, 114, 105, 100, 103, 101];
              },
              {
                kind: "account";
                path: "mint";
              },
            ];
          };
        },
      ];
      args: [];
    },
    {
      name: "setAdminFeeShare";
      discriminator: [34, 2, 1, 74, 101, 120, 39, 19];
      accounts: [
        {
          name: "admin";
          signer: true;
        },
        {
          name: "mint";
        },
        {
          name: "cctpBridge";
          writable: true;
          pda: {
            seeds: [
              {
                kind: "const";
                value: [99, 99, 116, 112, 95, 98, 114, 105, 100, 103, 101];
              },
              {
                kind: "account";
                path: "mint";
              },
            ];
          };
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
      name: "setCctpTokenMessengerMinter";
      discriminator: [7, 23, 157, 231, 197, 83, 45, 203];
      accounts: [
        {
          name: "admin";
          signer: true;
        },
        {
          name: "mint";
        },
        {
          name: "cctpBridge";
          writable: true;
          pda: {
            seeds: [
              {
                kind: "const";
                value: [99, 99, 116, 112, 95, 98, 114, 105, 100, 103, 101];
              },
              {
                kind: "account";
                path: "mint";
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
      name: "setGasOracleProgramId";
      discriminator: [172, 152, 29, 206, 112, 239, 205, 83];
      accounts: [
        {
          name: "admin";
          signer: true;
        },
        {
          name: "mint";
        },
        {
          name: "cctpBridge";
          writable: true;
          pda: {
            seeds: [
              {
                kind: "const";
                value: [99, 99, 116, 112, 95, 98, 114, 105, 100, 103, 101];
              },
              {
                kind: "account";
                path: "mint";
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
      name: "updateChainBridge";
      discriminator: [227, 4, 133, 105, 230, 88, 226, 173];
      accounts: [
        {
          name: "admin";
          signer: true;
        },
        {
          name: "cctpBridge";
          pda: {
            seeds: [
              {
                kind: "const";
                value: [99, 99, 116, 112, 95, 98, 114, 105, 100, 103, 101];
              },
              {
                kind: "arg";
                path: "args.mint";
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
          name: "cctpBridge";
          writable: true;
          pda: {
            seeds: [
              {
                kind: "const";
                value: [99, 99, 116, 112, 95, 98, 114, 105, 100, 103, 101];
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
                path: "cctpBridge";
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
          name: "mint";
        },
        {
          name: "cctpBridge";
          writable: true;
          pda: {
            seeds: [
              {
                kind: "const";
                value: [99, 99, 116, 112, 95, 98, 114, 105, 100, 103, 101];
              },
              {
                kind: "account";
                path: "mint";
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
      name: "cctpBridge";
      discriminator: [164, 2, 216, 77, 99, 83, 161, 159];
    },
    {
      name: "chainBridge";
      discriminator: [25, 216, 147, 218, 140, 42, 98, 49];
    },
    {
      name: "lock";
      discriminator: [8, 255, 36, 202, 210, 22, 57, 137];
    },
    {
      name: "price";
      discriminator: [50, 107, 127, 61, 83, 36, 39, 75];
    },
  ];
  errors: [
    {
      code: 6000;
      name: "valueTooHigh";
      msg: "Value is too high";
    },
  ];
  types: [
    {
      name: "bridgeArgs";
      type: {
        kind: "struct";
        fields: [
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
      name: "cctpBridge";
      type: {
        kind: "struct";
        fields: [
          {
            name: "mint";
            type: "pubkey";
          },
          {
            name: "admin";
            type: "pubkey";
          },
          {
            name: "cctpTokenMessengerMinter";
            type: "pubkey";
          },
          {
            name: "gasOracleProgramId";
            type: "pubkey";
          },
          {
            name: "authorityBumpSeed";
            type: "u8";
          },
          {
            name: "adminFeeShareBp";
            type: "u64";
          },
          {
            name: "adminFeeAmount";
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
            name: "chainId";
            type: "u8";
          },
          {
            name: "gasUsage";
            type: "u64";
          },
          {
            name: "domain";
            type: "u32";
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
            name: "gasOracleProgramId";
            type: "pubkey";
          },
          {
            name: "cctpTokenMessengerMinter";
            type: "pubkey";
          },
          {
            name: "adminFeeShareBp";
            type: "u64";
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
            name: "amount";
            type: "u64";
          },
          {
            name: "adminFee";
            type: "u64";
          },
          {
            name: "relayerFee";
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
            name: "slot";
            type: "u64";
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
            name: "chainId";
            type: "u8";
          },
          {
            name: "gasUsage";
            type: "u64";
          },
          {
            name: "domain";
            type: "u32";
          },
          {
            name: "mint";
            type: "pubkey";
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
            name: "chainId";
            type: "u8";
          },
          {
            name: "gasUsage";
            type: "u64";
          },
          {
            name: "domain";
            type: "u32";
          },
          {
            name: "mint";
            type: "pubkey";
          },
        ];
      };
    },
  ];
};
