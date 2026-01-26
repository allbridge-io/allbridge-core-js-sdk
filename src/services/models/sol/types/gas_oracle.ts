/**
 * Program IDL in camelCase format in order to be used in JS/TS.
 *
 * Note that this is only a type helper and is not the actual IDL. The original
 * IDL can be found at `target/idl/gas_oracle.json`.
 */
export type GasOracle = {
  address: "GTwX3oTgMS4pLQS8SvgZFS9Vyhxdfw1N7fijAhaS88Ff";
  metadata: {
    name: "gasOracle";
    version: "0.1.0";
    spec: "0.1.0";
    description: "Created with Anchor";
  };
  instructions: [
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
      args: [];
    },
    {
      name: "initializePrice";
      discriminator: [241, 226, 24, 17, 26, 192, 105, 181];
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
          name: "price";
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
          name: "newAdmin";
        },
      ];
      args: [];
    },
    {
      name: "setPrice";
      discriminator: [16, 19, 182, 8, 149, 83, 72, 181];
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
          name: "price";
          writable: true;
        },
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
        },
      ];
    },
  ];
  accounts: [
    {
      name: "config";
      discriminator: [155, 12, 170, 224, 30, 250, 204, 130];
    },
    {
      name: "price";
      discriminator: [50, 107, 127, 61, 83, 36, 39, 75];
    },
  ];
  types: [
    {
      name: "config";
      type: {
        kind: "struct";
        fields: [
          {
            name: "admin";
            type: "pubkey";
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
