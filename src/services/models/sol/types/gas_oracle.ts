export interface GasOracle {
  version: "0.1.0";
  name: "gas_oracle";
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
      args: [];
    },
    {
      name: "initializePrice";
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
          name: "price";
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
        }
      ];
    },
    {
      name: "setPrice";
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
          name: "price";
          isMut: true;
          isSigner: false;
        }
      ];
      args: [
        {
          name: "chainId";
          type: "u8";
        },
        {
          name: "price";
          type: {
            option: "u64";
          };
        },
        {
          name: "gasPrice";
          type: {
            option: "u64";
          };
        }
      ];
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
          name: "config";
          isMut: true;
          isSigner: false;
        },
        {
          name: "newAdmin";
          isMut: false;
          isSigner: false;
        }
      ];
      args: [];
    }
  ];
  accounts: [
    {
      name: "config";
      type: {
        kind: "struct";
        fields: [
          {
            name: "admin";
            type: "publicKey";
          }
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
          }
        ];
      };
    }
  ];
}

export const IDL: GasOracle = {
  version: "0.1.0",
  name: "gas_oracle",
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
      args: [],
    },
    {
      name: "initializePrice",
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
          name: "price",
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
      ],
    },
    {
      name: "setPrice",
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
          name: "price",
          isMut: true,
          isSigner: false,
        },
      ],
      args: [
        {
          name: "chainId",
          type: "u8",
        },
        {
          name: "price",
          type: {
            option: "u64",
          },
        },
        {
          name: "gasPrice",
          type: {
            option: "u64",
          },
        },
      ],
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
          name: "config",
          isMut: true,
          isSigner: false,
        },
        {
          name: "newAdmin",
          isMut: false,
          isSigner: false,
        },
      ],
      args: [],
    },
  ],
  accounts: [
    {
      name: "config",
      type: {
        kind: "struct",
        fields: [
          {
            name: "admin",
            type: "publicKey",
          },
        ],
      },
    },
    {
      name: "price",
      type: {
        kind: "struct",
        fields: [
          {
            name: "chainId",
            type: "u8",
          },
          {
            name: "price",
            type: "u64",
          },
          {
            name: "gasPrice",
            type: "u64",
          },
        ],
      },
    },
  ],
};
