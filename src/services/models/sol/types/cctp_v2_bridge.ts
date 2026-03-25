/**
 * Program IDL in camelCase format in order to be used in JS/TS.
 *
 * Note that this is only a type helper and is not the actual IDL. The original
 * IDL can be found at `target/idl/cctp_v2_bridge.json`.
 */
export type CctpV2Bridge = {
  "address": string;
  "metadata": {
    "name": "cctpV2Bridge",
    "version": "0.1.0",
    "spec": "0.1.0",
    "description": "Created with Anchor"
  },
  "instructions": [
    {
      "name": "bridge",
      "discriminator": [
        174,
        41,
        120,
        146,
        98,
        218,
        169,
        25
      ],
      "accounts": [
        {
          "name": "user",
          "writable": true,
          "signer": true
        },
        {
          "name": "payer",
          "writable": true,
          "signer": true
        },
        {
          "name": "messageSentEventData",
          "writable": true,
          "signer": true
        },
        {
          "name": "lock",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  108,
                  111,
                  99,
                  107
                ]
              },
              {
                "kind": "account",
                "path": "messageSentEventData"
              }
            ]
          }
        },
        {
          "name": "mint",
          "writable": true
        },
        {
          "name": "config",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  99,
                  111,
                  110,
                  102,
                  105,
                  103
                ]
              },
              {
                "kind": "account",
                "path": "mint"
              }
            ]
          }
        },
        {
          "name": "tokenMessengerMinterProgram"
        },
        {
          "name": "messageTransmitterProgram"
        },
        {
          "name": "messageTransmitterAccount",
          "writable": true
        },
        {
          "name": "tokenMessenger"
        },
        {
          "name": "tokenMinter"
        },
        {
          "name": "localToken",
          "writable": true
        },
        {
          "name": "remoteTokenMessenger"
        },
        {
          "name": "authorityPda"
        },
        {
          "name": "denylistAccount",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  100,
                  101,
                  110,
                  121,
                  108,
                  105,
                  115,
                  116,
                  95,
                  97,
                  99,
                  99,
                  111,
                  117,
                  110,
                  116
                ]
              },
              {
                "kind": "account",
                "path": "user"
              }
            ],
            "program": {
              "kind": "account",
              "path": "tokenMessengerMinterProgram"
            }
          }
        },
        {
          "name": "eventAuthority"
        },
        {
          "name": "bridgeToken",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  116,
                  111,
                  107,
                  101,
                  110
                ]
              },
              {
                "kind": "account",
                "path": "mint"
              }
            ]
          }
        },
        {
          "name": "gasPrice"
        },
        {
          "name": "thisGasPrice"
        },
        {
          "name": "chainBridge"
        },
        {
          "name": "userToken",
          "writable": true
        },
        {
          "name": "bridgeAuthority",
          "pda": {
            "seeds": [
              {
                "kind": "account",
                "path": "config"
              }
            ]
          }
        },
        {
          "name": "tokenProgram",
          "address": "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "args",
          "type": {
            "defined": {
              "name": "bridgeArgs"
            }
          }
        }
      ]
    },
    {
      "name": "initialize",
      "discriminator": [
        175,
        175,
        109,
        31,
        13,
        152,
        155,
        237
      ],
      "accounts": [
        {
          "name": "payer",
          "writable": true,
          "signer": true
        },
        {
          "name": "admin",
          "writable": true,
          "signer": true
        },
        {
          "name": "mint"
        },
        {
          "name": "config",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  99,
                  111,
                  110,
                  102,
                  105,
                  103
                ]
              },
              {
                "kind": "account",
                "path": "mint"
              }
            ]
          }
        },
        {
          "name": "bridgeAuthority",
          "pda": {
            "seeds": [
              {
                "kind": "account",
                "path": "config"
              }
            ]
          }
        },
        {
          "name": "bridgeToken",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  116,
                  111,
                  107,
                  101,
                  110
                ]
              },
              {
                "kind": "account",
                "path": "mint"
              }
            ]
          }
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        },
        {
          "name": "tokenProgram",
          "address": "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"
        },
        {
          "name": "rent",
          "address": "SysvarRent111111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "args",
          "type": {
            "defined": {
              "name": "initializeArgs"
            }
          }
        }
      ]
    },
    {
      "name": "receiveTokens",
      "discriminator": [
        229,
        73,
        222,
        185,
        57,
        227,
        213,
        67
      ],
      "accounts": [
        {
          "name": "payer",
          "writable": true,
          "signer": true
        },
        {
          "name": "mint",
          "writable": true
        },
        {
          "name": "config",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  99,
                  111,
                  110,
                  102,
                  105,
                  103
                ]
              },
              {
                "kind": "account",
                "path": "mint"
              }
            ]
          }
        },
        {
          "name": "bridgeAuthority",
          "pda": {
            "seeds": [
              {
                "kind": "account",
                "path": "config"
              }
            ]
          }
        },
        {
          "name": "recipient",
          "writable": true
        },
        {
          "name": "messageTransmitterProgram"
        },
        {
          "name": "authorityPda"
        },
        {
          "name": "messageTransmitterAccount"
        },
        {
          "name": "usedNonce",
          "writable": true
        },
        {
          "name": "tokenMessengerMinterProgram"
        },
        {
          "name": "messageTransmitterEventAuthority"
        },
        {
          "name": "tokenMessenger"
        },
        {
          "name": "remoteTokenMessenger"
        },
        {
          "name": "tokenMinter"
        },
        {
          "name": "localToken",
          "writable": true
        },
        {
          "name": "tokenPair"
        },
        {
          "name": "feeRecipientTokenAccount",
          "writable": true
        },
        {
          "name": "recipientTokenAccount",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "account",
                "path": "recipient"
              },
              {
                "kind": "const",
                "value": [
                  6,
                  221,
                  246,
                  225,
                  215,
                  101,
                  161,
                  147,
                  217,
                  203,
                  225,
                  70,
                  206,
                  235,
                  121,
                  172,
                  28,
                  180,
                  133,
                  237,
                  95,
                  91,
                  55,
                  145,
                  58,
                  140,
                  245,
                  133,
                  126,
                  255,
                  0,
                  169
                ]
              },
              {
                "kind": "account",
                "path": "mint"
              }
            ],
            "program": {
              "kind": "const",
              "value": [
                140,
                151,
                37,
                143,
                78,
                36,
                137,
                241,
                187,
                61,
                16,
                41,
                20,
                142,
                13,
                131,
                11,
                90,
                19,
                153,
                218,
                255,
                16,
                132,
                4,
                142,
                123,
                216,
                219,
                233,
                248,
                89
              ]
            }
          }
        },
        {
          "name": "custodyTokenAccount",
          "writable": true
        },
        {
          "name": "tokenMessengerEventAuthority"
        },
        {
          "name": "tokenProgram",
          "address": "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "args",
          "type": {
            "defined": {
              "name": "receiveTokensArgs"
            }
          }
        }
      ]
    },
    {
      "name": "registerChainBridge",
      "discriminator": [
        239,
        66,
        180,
        165,
        175,
        10,
        49,
        233
      ],
      "accounts": [
        {
          "name": "admin",
          "signer": true
        },
        {
          "name": "payer",
          "writable": true,
          "signer": true
        },
        {
          "name": "config",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  99,
                  111,
                  110,
                  102,
                  105,
                  103
                ]
              },
              {
                "kind": "arg",
                "path": "args.mint"
              }
            ]
          }
        },
        {
          "name": "chainBridge",
          "writable": true
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "args",
          "type": {
            "defined": {
              "name": "registerChainBridgeArgs"
            }
          }
        }
      ]
    },
    {
      "name": "setAdmin",
      "discriminator": [
        251,
        163,
        0,
        52,
        91,
        194,
        187,
        92
      ],
      "accounts": [
        {
          "name": "admin",
          "signer": true
        },
        {
          "name": "mint"
        },
        {
          "name": "newAdmin"
        },
        {
          "name": "config",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  99,
                  111,
                  110,
                  102,
                  105,
                  103
                ]
              },
              {
                "kind": "account",
                "path": "mint"
              }
            ]
          }
        }
      ],
      "args": []
    },
    {
      "name": "setAdminFeeShare",
      "discriminator": [
        34,
        2,
        1,
        74,
        101,
        120,
        39,
        19
      ],
      "accounts": [
        {
          "name": "admin",
          "signer": true
        },
        {
          "name": "mint"
        },
        {
          "name": "config",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  99,
                  111,
                  110,
                  102,
                  105,
                  103
                ]
              },
              {
                "kind": "account",
                "path": "mint"
              }
            ]
          }
        }
      ],
      "args": [
        {
          "name": "feeShareBp",
          "type": "u64"
        }
      ]
    },
    {
      "name": "setGasOracleProgramId",
      "discriminator": [
        172,
        152,
        29,
        206,
        112,
        239,
        205,
        83
      ],
      "accounts": [
        {
          "name": "admin",
          "signer": true
        },
        {
          "name": "mint"
        },
        {
          "name": "config",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  99,
                  111,
                  110,
                  102,
                  105,
                  103
                ]
              },
              {
                "kind": "account",
                "path": "mint"
              }
            ]
          }
        }
      ],
      "args": [
        {
          "name": "newProgramId",
          "type": "pubkey"
        }
      ]
    },
    {
      "name": "setMaxFeeShare",
      "discriminator": [
        120,
        202,
        93,
        18,
        32,
        173,
        77,
        155
      ],
      "accounts": [
        {
          "name": "admin",
          "signer": true
        },
        {
          "name": "mint"
        },
        {
          "name": "config",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  99,
                  111,
                  110,
                  102,
                  105,
                  103
                ]
              },
              {
                "kind": "account",
                "path": "mint"
              }
            ]
          }
        }
      ],
      "args": [
        {
          "name": "maxFeeShare",
          "type": "u64"
        }
      ]
    },
    {
      "name": "setMinFinalityThreshold",
      "discriminator": [
        143,
        83,
        132,
        23,
        202,
        153,
        26,
        103
      ],
      "accounts": [
        {
          "name": "admin",
          "signer": true
        },
        {
          "name": "mint"
        },
        {
          "name": "config",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  99,
                  111,
                  110,
                  102,
                  105,
                  103
                ]
              },
              {
                "kind": "account",
                "path": "mint"
              }
            ]
          }
        }
      ],
      "args": [
        {
          "name": "minFinalityThreshold",
          "type": "u32"
        }
      ]
    },
    {
      "name": "setTokenMessengerMinter",
      "discriminator": [
        136,
        50,
        92,
        91,
        209,
        211,
        206,
        234
      ],
      "accounts": [
        {
          "name": "admin",
          "signer": true
        },
        {
          "name": "mint"
        },
        {
          "name": "config",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  99,
                  111,
                  110,
                  102,
                  105,
                  103
                ]
              },
              {
                "kind": "account",
                "path": "mint"
              }
            ]
          }
        }
      ],
      "args": [
        {
          "name": "newProgramId",
          "type": "pubkey"
        }
      ]
    },
    {
      "name": "updateChainBridge",
      "discriminator": [
        227,
        4,
        133,
        105,
        230,
        88,
        226,
        173
      ],
      "accounts": [
        {
          "name": "admin",
          "signer": true
        },
        {
          "name": "config",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  99,
                  111,
                  110,
                  102,
                  105,
                  103
                ]
              },
              {
                "kind": "arg",
                "path": "args.mint"
              }
            ]
          }
        },
        {
          "name": "chainBridge",
          "writable": true
        }
      ],
      "args": [
        {
          "name": "args",
          "type": {
            "defined": {
              "name": "updateChainBridgeArgs"
            }
          }
        }
      ]
    },
    {
      "name": "withdrawAdminFee",
      "discriminator": [
        176,
        135,
        230,
        197,
        163,
        130,
        60,
        252
      ],
      "accounts": [
        {
          "name": "admin",
          "signer": true
        },
        {
          "name": "mint"
        },
        {
          "name": "config",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  99,
                  111,
                  110,
                  102,
                  105,
                  103
                ]
              },
              {
                "kind": "account",
                "path": "mint"
              }
            ]
          }
        },
        {
          "name": "bridgeToken",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  116,
                  111,
                  107,
                  101,
                  110
                ]
              },
              {
                "kind": "account",
                "path": "mint"
              }
            ]
          }
        },
        {
          "name": "adminToken",
          "writable": true
        },
        {
          "name": "bridgeAuthority",
          "pda": {
            "seeds": [
              {
                "kind": "account",
                "path": "config"
              }
            ]
          }
        },
        {
          "name": "tokenProgram",
          "address": "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": []
    },
    {
      "name": "withdrawGasToken",
      "discriminator": [
        109,
        117,
        140,
        223,
        117,
        175,
        2,
        139
      ],
      "accounts": [
        {
          "name": "admin",
          "signer": true
        },
        {
          "name": "recipient",
          "writable": true
        },
        {
          "name": "mint"
        },
        {
          "name": "config",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  99,
                  111,
                  110,
                  102,
                  105,
                  103
                ]
              },
              {
                "kind": "account",
                "path": "mint"
              }
            ]
          }
        }
      ],
      "args": [
        {
          "name": "amount",
          "type": "u64"
        }
      ]
    }
  ],
  "accounts": [
    {
      "name": "chainBridge",
      "discriminator": [
        25,
        216,
        147,
        218,
        140,
        42,
        98,
        49
      ]
    },
    {
      "name": "config",
      "discriminator": [
        155,
        12,
        170,
        224,
        30,
        250,
        204,
        130
      ]
    },
    {
      "name": "lock",
      "discriminator": [
        8,
        255,
        36,
        202,
        210,
        22,
        57,
        137
      ]
    },
    {
      "name": "price",
      "discriminator": [
        50,
        107,
        127,
        61,
        83,
        36,
        39,
        75
      ]
    }
  ],
  "errors": [
    {
      "code": 6000,
      "name": "valueTooHigh",
      "msg": "Value is too high"
    }
  ],
  "types": [
    {
      "name": "bridgeArgs",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "recipient",
            "type": {
              "array": [
                "u8",
                32
              ]
            }
          },
          {
            "name": "destinationChainId",
            "type": "u8"
          },
          {
            "name": "receiveToken",
            "type": {
              "array": [
                "u8",
                32
              ]
            }
          },
          {
            "name": "amount",
            "type": "u64"
          }
        ]
      }
    },
    {
      "name": "chainBridge",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "chainId",
            "type": "u8"
          },
          {
            "name": "gasUsage",
            "type": "u64"
          },
          {
            "name": "domain",
            "type": "u32"
          },
          {
            "name": "otherBridge",
            "type": "pubkey"
          }
        ]
      }
    },
    {
      "name": "config",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "mint",
            "type": "pubkey"
          },
          {
            "name": "admin",
            "type": "pubkey"
          },
          {
            "name": "tokenMessengerMinter",
            "type": "pubkey"
          },
          {
            "name": "messageTransmitter",
            "type": "pubkey"
          },
          {
            "name": "gasOracleProgramId",
            "type": "pubkey"
          },
          {
            "name": "authorityBumpSeed",
            "type": "u8"
          },
          {
            "name": "adminFeeShareBp",
            "type": "u64"
          },
          {
            "name": "adminFeeAmount",
            "type": "u64"
          },
          {
            "name": "maxFeeShare",
            "type": "u64"
          },
          {
            "name": "minFinalityThreshold",
            "type": "u32"
          }
        ]
      }
    },
    {
      "name": "initializeArgs",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "gasOracleProgramId",
            "type": "pubkey"
          },
          {
            "name": "tokenMessengerMinter",
            "type": "pubkey"
          },
          {
            "name": "messageTransmitter",
            "type": "pubkey"
          },
          {
            "name": "adminFeeShareBp",
            "type": "u64"
          },
          {
            "name": "maxFeeShare",
            "type": "u64"
          },
          {
            "name": "minFinalityThreshold",
            "type": "u32"
          }
        ]
      }
    },
    {
      "name": "lock",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "sender",
            "type": "pubkey"
          },
          {
            "name": "amount",
            "type": "u64"
          },
          {
            "name": "adminFee",
            "type": "u64"
          },
          {
            "name": "relayerFee",
            "type": "u64"
          },
          {
            "name": "recipient",
            "type": {
              "array": [
                "u8",
                32
              ]
            }
          },
          {
            "name": "destinationChainId",
            "type": "u8"
          },
          {
            "name": "slot",
            "type": "u64"
          }
        ]
      }
    },
    {
      "name": "price",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "chainId",
            "type": "u8"
          },
          {
            "name": "price",
            "type": "u64"
          },
          {
            "name": "gasPrice",
            "type": "u64"
          }
        ]
      }
    },
    {
      "name": "receiveTokensArgs",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "message",
            "type": "bytes"
          },
          {
            "name": "attestation",
            "type": "bytes"
          },
          {
            "name": "extraGasAmount",
            "type": "u64"
          }
        ]
      }
    },
    {
      "name": "registerChainBridgeArgs",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "chainId",
            "type": "u8"
          },
          {
            "name": "mint",
            "type": "pubkey"
          },
          {
            "name": "gasUsage",
            "type": "u64"
          },
          {
            "name": "domain",
            "type": "u32"
          },
          {
            "name": "otherBridge",
            "type": "pubkey"
          }
        ]
      }
    },
    {
      "name": "updateChainBridgeArgs",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "chainId",
            "type": "u8"
          },
          {
            "name": "mint",
            "type": "pubkey"
          },
          {
            "name": "gasUsage",
            "type": "u64"
          },
          {
            "name": "domain",
            "type": "u32"
          },
          {
            "name": "otherBridge",
            "type": "pubkey"
          }
        ]
      }
    }
  ]
};
