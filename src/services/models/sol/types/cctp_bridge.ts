export interface CctpBridge {
  version: "0.1.0";
  name: "cctp_bridge";
  instructions: [
    {
      name: "initialize";
      accounts: [
        {
          name: "payer";
          isMut: true;
          isSigner: true;
        },
        {
          name: "admin";
          isMut: true;
          isSigner: true;
        },
        {
          name: "mint";
          isMut: false;
          isSigner: false;
        },
        {
          name: "cctpBridge";
          isMut: true;
          isSigner: false;
        },
        {
          name: "bridgeAuthority";
          isMut: false;
          isSigner: false;
        },
        {
          name: "bridgeToken";
          isMut: true;
          isSigner: false;
        },
        {
          name: "systemProgram";
          isMut: false;
          isSigner: false;
        },
        {
          name: "tokenProgram";
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
            defined: "InitializeArgs";
          };
        }
      ];
    },
    {
      name: "bridge";
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
          name: "messageSentEventData";
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
          isMut: true;
          isSigner: false;
        },
        {
          name: "cctpBridge";
          isMut: true;
          isSigner: false;
        },
        {
          name: "cctpMessenger";
          isMut: false;
          isSigner: false;
        },
        {
          name: "messageTransmitterProgram";
          isMut: false;
          isSigner: false;
        },
        {
          name: "messageTransmitterAccount";
          isMut: true;
          isSigner: false;
        },
        {
          name: "tokenMessenger";
          isMut: false;
          isSigner: false;
        },
        {
          name: "tokenMinter";
          isMut: false;
          isSigner: false;
        },
        {
          name: "localToken";
          isMut: true;
          isSigner: false;
        },
        {
          name: "remoteTokenMessengerKey";
          isMut: false;
          isSigner: false;
        },
        {
          name: "authorityPda";
          isMut: false;
          isSigner: false;
        },
        {
          name: "eventAuthority";
          isMut: false;
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
          name: "thisGasPrice";
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
      name: "registerChainBridge";
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
          name: "cctpBridge";
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
          name: "admin";
          isMut: false;
          isSigner: true;
        },
        {
          name: "cctpBridge";
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
      name: "setAdminFeeShare";
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
          name: "cctpBridge";
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
      name: "setGasOracleProgramId";
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
          name: "cctpBridge";
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
          name: "mint";
          isMut: false;
          isSigner: false;
        },
        {
          name: "cctpBridge";
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
          name: "cctpBridge";
          isMut: false;
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
    },
    {
      name: "setCctpTokenMessengerMinter";
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
          name: "cctpBridge";
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
    }
  ];
  accounts: [
    {
      name: "cctpBridge";
      type: {
        kind: "struct";
        fields: [
          {
            name: "mint";
            type: "publicKey";
          },
          {
            name: "admin";
            type: "publicKey";
          },
          {
            name: "cctpTokenMessengerMinter";
            type: "publicKey";
          },
          {
            name: "gasOracleProgramId";
            type: "publicKey";
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
          }
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
            type: "publicKey";
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
            type: "publicKey";
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
            name: "gasOracleProgramId";
            type: "publicKey";
          },
          {
            name: "cctpTokenMessengerMinter";
            type: "publicKey";
          }
        ];
      };
    }
  ];
  errors: [
    {
      code: 6000;
      name: "ValueTooHigh";
      msg: "Value is too high";
    }
  ];
}

export const IDL: CctpBridge = {
  version: "0.1.0",
  name: "cctp_bridge",
  instructions: [
    {
      name: "initialize",
      accounts: [
        {
          name: "payer",
          isMut: true,
          isSigner: true,
        },
        {
          name: "admin",
          isMut: true,
          isSigner: true,
        },
        {
          name: "mint",
          isMut: false,
          isSigner: false,
        },
        {
          name: "cctpBridge",
          isMut: true,
          isSigner: false,
        },
        {
          name: "bridgeAuthority",
          isMut: false,
          isSigner: false,
        },
        {
          name: "bridgeToken",
          isMut: true,
          isSigner: false,
        },
        {
          name: "systemProgram",
          isMut: false,
          isSigner: false,
        },
        {
          name: "tokenProgram",
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
            defined: "InitializeArgs",
          },
        },
      ],
    },
    {
      name: "bridge",
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
          name: "messageSentEventData",
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
          isMut: true,
          isSigner: false,
        },
        {
          name: "cctpBridge",
          isMut: true,
          isSigner: false,
        },
        {
          name: "cctpMessenger",
          isMut: false,
          isSigner: false,
        },
        {
          name: "messageTransmitterProgram",
          isMut: false,
          isSigner: false,
        },
        {
          name: "messageTransmitterAccount",
          isMut: true,
          isSigner: false,
        },
        {
          name: "tokenMessenger",
          isMut: false,
          isSigner: false,
        },
        {
          name: "tokenMinter",
          isMut: false,
          isSigner: false,
        },
        {
          name: "localToken",
          isMut: true,
          isSigner: false,
        },
        {
          name: "remoteTokenMessengerKey",
          isMut: false,
          isSigner: false,
        },
        {
          name: "authorityPda",
          isMut: false,
          isSigner: false,
        },
        {
          name: "eventAuthority",
          isMut: false,
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
          name: "thisGasPrice",
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
      name: "registerChainBridge",
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
          name: "cctpBridge",
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
          name: "admin",
          isMut: false,
          isSigner: true,
        },
        {
          name: "cctpBridge",
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
      name: "setAdminFeeShare",
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
          name: "cctpBridge",
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
      name: "setGasOracleProgramId",
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
          name: "cctpBridge",
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
          name: "mint",
          isMut: false,
          isSigner: false,
        },
        {
          name: "cctpBridge",
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
          name: "cctpBridge",
          isMut: false,
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
    {
      name: "setCctpTokenMessengerMinter",
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
          name: "cctpBridge",
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
  ],
  accounts: [
    {
      name: "cctpBridge",
      type: {
        kind: "struct",
        fields: [
          {
            name: "mint",
            type: "publicKey",
          },
          {
            name: "admin",
            type: "publicKey",
          },
          {
            name: "cctpTokenMessengerMinter",
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
          {
            name: "adminFeeShareBp",
            type: "u64",
          },
          {
            name: "adminFeeAmount",
            type: "u64",
          },
        ],
      },
    },
    {
      name: "chainBridge",
      type: {
        kind: "struct",
        fields: [
          {
            name: "chainId",
            type: "u8",
          },
          {
            name: "gasUsage",
            type: "u64",
          },
          {
            name: "domain",
            type: "u32",
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
            name: "amount",
            type: "u64",
          },
          {
            name: "adminFee",
            type: "u64",
          },
          {
            name: "relayerFee",
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
            name: "slot",
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
            name: "chainId",
            type: "u8",
          },
          {
            name: "gasUsage",
            type: "u64",
          },
          {
            name: "domain",
            type: "u32",
          },
          {
            name: "mint",
            type: "publicKey",
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
            name: "chainId",
            type: "u8",
          },
          {
            name: "gasUsage",
            type: "u64",
          },
          {
            name: "domain",
            type: "u32",
          },
          {
            name: "mint",
            type: "publicKey",
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
            name: "amount",
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
            name: "gasOracleProgramId",
            type: "publicKey",
          },
          {
            name: "cctpTokenMessengerMinter",
            type: "publicKey",
          },
        ],
      },
    },
  ],
  errors: [
    {
      code: 6000,
      name: "ValueTooHigh",
      msg: "Value is too high",
    },
  ],
};
