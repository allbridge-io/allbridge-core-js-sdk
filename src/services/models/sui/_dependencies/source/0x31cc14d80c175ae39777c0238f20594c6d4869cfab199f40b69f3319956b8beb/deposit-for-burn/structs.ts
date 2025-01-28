// @ts-nocheck
import * as reified from "../../../../_framework/reified";
import {
  PhantomReified,
  PhantomToTypeStr,
  PhantomTypeArgument,
  Reified,
  StructClass,
  ToField,
  ToPhantomTypeArgument,
  ToTypeArgument,
  ToTypeStr,
  TypeArgument,
  assertFieldsWithTypesArgsMatch,
  assertReifiedTypeArgsMatch,
  decodeFromFields,
  decodeFromFieldsWithTypes,
  decodeFromJSONField,
  extractType,
  fieldToJSON,
  phantom,
  toBcs,
} from "../../../../_framework/reified";
import { FieldsWithTypes, composeSuiType, compressSuiType, parseTypeName } from "../../../../_framework/util";
import { Vector } from "../../../../_framework/vector";
import { Coin } from "../../../../sui/coin/structs";
import { Option } from "../../0x1/option/structs";
import { PKG_V1 } from "../index";
import { BcsType, bcs } from "@mysten/sui/bcs";
import { SuiClient, SuiObjectData, SuiParsedData } from "@mysten/sui/client";
import { fromB64, fromHEX, toHEX } from "@mysten/sui/utils";

/* ============================== DepositForBurnTicket =============================== */

export function isDepositForBurnTicket(type: string): boolean {
  type = compressSuiType(type);
  return type.startsWith(`${PKG_V1}::deposit_for_burn::DepositForBurnTicket` + "<");
}

export interface DepositForBurnTicketFields<T extends PhantomTypeArgument, Auth extends TypeArgument> {
  auth: ToField<Auth>;
  coins: ToField<Coin<T>>;
  destinationDomain: ToField<"u32">;
  mintRecipient: ToField<"address">;
}

export type DepositForBurnTicketReified<T extends PhantomTypeArgument, Auth extends TypeArgument> = Reified<
  DepositForBurnTicket<T, Auth>,
  DepositForBurnTicketFields<T, Auth>
>;

export class DepositForBurnTicket<T extends PhantomTypeArgument, Auth extends TypeArgument> implements StructClass {
  __StructClass = true as const;

  static get $typeName() {
    return `${PKG_V1}::deposit_for_burn::DepositForBurnTicket`;
  }
  static readonly $numTypeParams = 2;
  static readonly $isPhantom = [true, false] as const;

  readonly $typeName = DepositForBurnTicket.$typeName;
  readonly $fullTypeName: string;
  readonly $typeArgs: [PhantomToTypeStr<T>, ToTypeStr<Auth>];
  readonly $isPhantom = DepositForBurnTicket.$isPhantom;

  readonly auth: ToField<Auth>;
  readonly coins: ToField<Coin<T>>;
  readonly destinationDomain: ToField<"u32">;
  readonly mintRecipient: ToField<"address">;

  private constructor(typeArgs: [PhantomToTypeStr<T>, ToTypeStr<Auth>], fields: DepositForBurnTicketFields<T, Auth>) {
    this.$fullTypeName = composeSuiType(DepositForBurnTicket.$typeName, ...typeArgs) as string;
    this.$typeArgs = typeArgs;

    this.auth = fields.auth;
    this.coins = fields.coins;
    this.destinationDomain = fields.destinationDomain;
    this.mintRecipient = fields.mintRecipient;
  }

  static reified<T extends PhantomReified<PhantomTypeArgument>, Auth extends Reified<TypeArgument, any>>(
    T: T,
    Auth: Auth
  ): DepositForBurnTicketReified<ToPhantomTypeArgument<T>, ToTypeArgument<Auth>> {
    return {
      typeName: DepositForBurnTicket.$typeName,
      fullTypeName: composeSuiType(DepositForBurnTicket.$typeName, ...[extractType(T), extractType(Auth)]) as string,
      typeArgs: [extractType(T), extractType(Auth)] as [
        PhantomToTypeStr<ToPhantomTypeArgument<T>>,
        ToTypeStr<ToTypeArgument<Auth>>,
      ],
      isPhantom: DepositForBurnTicket.$isPhantom,
      reifiedTypeArgs: [T, Auth],
      fromFields: (fields: Record<string, any>) => DepositForBurnTicket.fromFields([T, Auth], fields),
      fromFieldsWithTypes: (item: FieldsWithTypes) => DepositForBurnTicket.fromFieldsWithTypes([T, Auth], item),
      fromBcs: (data: Uint8Array) => DepositForBurnTicket.fromBcs([T, Auth], data),
      bcs: DepositForBurnTicket.bcs(toBcs(Auth)),
      fromJSONField: (field: any) => DepositForBurnTicket.fromJSONField([T, Auth], field),
      fromJSON: (json: Record<string, any>) => DepositForBurnTicket.fromJSON([T, Auth], json),
      fromSuiParsedData: (content: SuiParsedData) => DepositForBurnTicket.fromSuiParsedData([T, Auth], content),
      fromSuiObjectData: (content: SuiObjectData) => DepositForBurnTicket.fromSuiObjectData([T, Auth], content),
      fetch: async (client: SuiClient, id: string) => DepositForBurnTicket.fetch(client, [T, Auth], id),
      new: (fields: DepositForBurnTicketFields<ToPhantomTypeArgument<T>, ToTypeArgument<Auth>>) => {
        return new DepositForBurnTicket([extractType(T), extractType(Auth)], fields);
      },
      kind: "StructClassReified",
    };
  }

  static get r() {
    return DepositForBurnTicket.reified;
  }

  static phantom<T extends PhantomReified<PhantomTypeArgument>, Auth extends Reified<TypeArgument, any>>(
    T: T,
    Auth: Auth
  ): PhantomReified<ToTypeStr<DepositForBurnTicket<ToPhantomTypeArgument<T>, ToTypeArgument<Auth>>>> {
    return phantom(DepositForBurnTicket.reified(T, Auth));
  }
  static get p() {
    return DepositForBurnTicket.phantom;
  }

  static get bcs() {
    return <Auth extends BcsType<any>>(Auth: Auth) =>
      bcs.struct(`DepositForBurnTicket<${Auth.name}>`, {
        auth: Auth,
        coins: Coin.bcs,
        destination_domain: bcs.u32(),
        mint_recipient: bcs.bytes(32).transform({
          input: (val: string) => fromHEX(val),
          output: (val: Uint8Array) => toHEX(val),
        }),
      });
  }

  static fromFields<T extends PhantomReified<PhantomTypeArgument>, Auth extends Reified<TypeArgument, any>>(
    typeArgs: [T, Auth],
    fields: Record<string, any>
  ): DepositForBurnTicket<ToPhantomTypeArgument<T>, ToTypeArgument<Auth>> {
    return DepositForBurnTicket.reified(typeArgs[0], typeArgs[1]).new({
      auth: decodeFromFields(typeArgs[1], fields.auth),
      coins: decodeFromFields(Coin.reified(typeArgs[0]), fields.coins),
      destinationDomain: decodeFromFields("u32", fields.destination_domain),
      mintRecipient: decodeFromFields("address", fields.mint_recipient),
    });
  }

  static fromFieldsWithTypes<T extends PhantomReified<PhantomTypeArgument>, Auth extends Reified<TypeArgument, any>>(
    typeArgs: [T, Auth],
    item: FieldsWithTypes
  ): DepositForBurnTicket<ToPhantomTypeArgument<T>, ToTypeArgument<Auth>> {
    if (!isDepositForBurnTicket(item.type)) {
      throw new Error("not a DepositForBurnTicket type");
    }
    assertFieldsWithTypesArgsMatch(item, typeArgs);

    return DepositForBurnTicket.reified(typeArgs[0], typeArgs[1]).new({
      auth: decodeFromFieldsWithTypes(typeArgs[1], item.fields.auth),
      coins: decodeFromFieldsWithTypes(Coin.reified(typeArgs[0]), item.fields.coins),
      destinationDomain: decodeFromFieldsWithTypes("u32", item.fields.destination_domain),
      mintRecipient: decodeFromFieldsWithTypes("address", item.fields.mint_recipient),
    });
  }

  static fromBcs<T extends PhantomReified<PhantomTypeArgument>, Auth extends Reified<TypeArgument, any>>(
    typeArgs: [T, Auth],
    data: Uint8Array
  ): DepositForBurnTicket<ToPhantomTypeArgument<T>, ToTypeArgument<Auth>> {
    return DepositForBurnTicket.fromFields(typeArgs, DepositForBurnTicket.bcs(toBcs(typeArgs[1])).parse(data));
  }

  toJSONField() {
    return {
      auth: fieldToJSON<Auth>(this.$typeArgs[1], this.auth),
      coins: this.coins.toJSONField(),
      destinationDomain: this.destinationDomain,
      mintRecipient: this.mintRecipient,
    };
  }

  toJSON() {
    return {
      $typeName: this.$typeName,
      $typeArgs: this.$typeArgs,
      ...this.toJSONField(),
    };
  }

  static fromJSONField<T extends PhantomReified<PhantomTypeArgument>, Auth extends Reified<TypeArgument, any>>(
    typeArgs: [T, Auth],
    field: any
  ): DepositForBurnTicket<ToPhantomTypeArgument<T>, ToTypeArgument<Auth>> {
    return DepositForBurnTicket.reified(typeArgs[0], typeArgs[1]).new({
      auth: decodeFromJSONField(typeArgs[1], field.auth),
      coins: decodeFromJSONField(Coin.reified(typeArgs[0]), field.coins),
      destinationDomain: decodeFromJSONField("u32", field.destinationDomain),
      mintRecipient: decodeFromJSONField("address", field.mintRecipient),
    });
  }

  static fromJSON<T extends PhantomReified<PhantomTypeArgument>, Auth extends Reified<TypeArgument, any>>(
    typeArgs: [T, Auth],
    json: Record<string, any>
  ): DepositForBurnTicket<ToPhantomTypeArgument<T>, ToTypeArgument<Auth>> {
    if (json.$typeName !== DepositForBurnTicket.$typeName) {
      throw new Error("not a WithTwoGenerics json object");
    }
    assertReifiedTypeArgsMatch(
      composeSuiType(DepositForBurnTicket.$typeName, ...typeArgs.map(extractType)),
      json.$typeArgs,
      typeArgs
    );

    return DepositForBurnTicket.fromJSONField(typeArgs, json);
  }

  static fromSuiParsedData<T extends PhantomReified<PhantomTypeArgument>, Auth extends Reified<TypeArgument, any>>(
    typeArgs: [T, Auth],
    content: SuiParsedData
  ): DepositForBurnTicket<ToPhantomTypeArgument<T>, ToTypeArgument<Auth>> {
    if (content.dataType !== "moveObject") {
      throw new Error("not an object");
    }
    if (!isDepositForBurnTicket(content.type)) {
      throw new Error(`object at ${(content.fields as any).id} is not a DepositForBurnTicket object`);
    }
    return DepositForBurnTicket.fromFieldsWithTypes(typeArgs, content);
  }

  static fromSuiObjectData<T extends PhantomReified<PhantomTypeArgument>, Auth extends Reified<TypeArgument, any>>(
    typeArgs: [T, Auth],
    data: SuiObjectData
  ): DepositForBurnTicket<ToPhantomTypeArgument<T>, ToTypeArgument<Auth>> {
    if (data.bcs) {
      if (data.bcs.dataType !== "moveObject" || !isDepositForBurnTicket(data.bcs.type)) {
        throw new Error(`object at is not a DepositForBurnTicket object`);
      }

      const gotTypeArgs = parseTypeName(data.bcs.type).typeArgs;
      if (gotTypeArgs.length !== 2) {
        throw new Error(`type argument mismatch: expected 2 type arguments but got ${gotTypeArgs.length}`);
      }
      for (let i = 0; i < 2; i++) {
        const gotTypeArg = compressSuiType(gotTypeArgs[i]);
        const expectedTypeArg = compressSuiType(extractType(typeArgs[i]));
        if (gotTypeArg !== expectedTypeArg) {
          throw new Error(
            `type argument mismatch at position ${i}: expected '${expectedTypeArg}' but got '${gotTypeArg}'`
          );
        }
      }

      return DepositForBurnTicket.fromBcs(typeArgs, fromB64(data.bcs.bcsBytes));
    }
    if (data.content) {
      return DepositForBurnTicket.fromSuiParsedData(typeArgs, data.content);
    }
    throw new Error(
      "Both `bcs` and `content` fields are missing from the data. Include `showBcs` or `showContent` in the request."
    );
  }

  static async fetch<T extends PhantomReified<PhantomTypeArgument>, Auth extends Reified<TypeArgument, any>>(
    client: SuiClient,
    typeArgs: [T, Auth],
    id: string
  ): Promise<DepositForBurnTicket<ToPhantomTypeArgument<T>, ToTypeArgument<Auth>>> {
    const res = await client.getObject({ id, options: { showBcs: true } });
    if (res.error) {
      throw new Error(`error fetching DepositForBurnTicket object at id ${id}: ${res.error.code}`);
    }
    if (res.data?.bcs?.dataType !== "moveObject" || !isDepositForBurnTicket(res.data.bcs.type)) {
      throw new Error(`object at id ${id} is not a DepositForBurnTicket object`);
    }

    return DepositForBurnTicket.fromSuiObjectData(typeArgs, res.data);
  }
}

/* ============================== ReplaceDepositForBurnTicket =============================== */

export function isReplaceDepositForBurnTicket(type: string): boolean {
  type = compressSuiType(type);
  return type.startsWith(`${PKG_V1}::deposit_for_burn::ReplaceDepositForBurnTicket` + "<");
}

export interface ReplaceDepositForBurnTicketFields<Auth extends TypeArgument> {
  auth: ToField<Auth>;
  originalRawMessage: ToField<Vector<"u8">>;
  originalAttestation: ToField<Vector<"u8">>;
  newDestinationCaller: ToField<Option<"address">>;
  newMintRecipient: ToField<Option<"address">>;
}

export type ReplaceDepositForBurnTicketReified<Auth extends TypeArgument> = Reified<
  ReplaceDepositForBurnTicket<Auth>,
  ReplaceDepositForBurnTicketFields<Auth>
>;

export class ReplaceDepositForBurnTicket<Auth extends TypeArgument> implements StructClass {
  __StructClass = true as const;

  static get $typeName() {
    return `${PKG_V1}::deposit_for_burn::ReplaceDepositForBurnTicket`;
  }
  static readonly $numTypeParams = 1;
  static readonly $isPhantom = [false] as const;

  readonly $typeName = ReplaceDepositForBurnTicket.$typeName;
  readonly $fullTypeName: string;
  readonly $typeArgs: [ToTypeStr<Auth>];
  readonly $isPhantom = ReplaceDepositForBurnTicket.$isPhantom;

  readonly auth: ToField<Auth>;
  readonly originalRawMessage: ToField<Vector<"u8">>;
  readonly originalAttestation: ToField<Vector<"u8">>;
  readonly newDestinationCaller: ToField<Option<"address">>;
  readonly newMintRecipient: ToField<Option<"address">>;

  private constructor(typeArgs: [ToTypeStr<Auth>], fields: ReplaceDepositForBurnTicketFields<Auth>) {
    this.$fullTypeName = composeSuiType(ReplaceDepositForBurnTicket.$typeName, ...typeArgs) as string;
    this.$typeArgs = typeArgs;

    this.auth = fields.auth;
    this.originalRawMessage = fields.originalRawMessage;
    this.originalAttestation = fields.originalAttestation;
    this.newDestinationCaller = fields.newDestinationCaller;
    this.newMintRecipient = fields.newMintRecipient;
  }

  static reified<Auth extends Reified<TypeArgument, any>>(
    Auth: Auth
  ): ReplaceDepositForBurnTicketReified<ToTypeArgument<Auth>> {
    return {
      typeName: ReplaceDepositForBurnTicket.$typeName,
      fullTypeName: composeSuiType(ReplaceDepositForBurnTicket.$typeName, ...[extractType(Auth)]) as string,
      typeArgs: [extractType(Auth)] as [ToTypeStr<ToTypeArgument<Auth>>],
      isPhantom: ReplaceDepositForBurnTicket.$isPhantom,
      reifiedTypeArgs: [Auth],
      fromFields: (fields: Record<string, any>) => ReplaceDepositForBurnTicket.fromFields(Auth, fields),
      fromFieldsWithTypes: (item: FieldsWithTypes) => ReplaceDepositForBurnTicket.fromFieldsWithTypes(Auth, item),
      fromBcs: (data: Uint8Array) => ReplaceDepositForBurnTicket.fromBcs(Auth, data),
      bcs: ReplaceDepositForBurnTicket.bcs(toBcs(Auth)),
      fromJSONField: (field: any) => ReplaceDepositForBurnTicket.fromJSONField(Auth, field),
      fromJSON: (json: Record<string, any>) => ReplaceDepositForBurnTicket.fromJSON(Auth, json),
      fromSuiParsedData: (content: SuiParsedData) => ReplaceDepositForBurnTicket.fromSuiParsedData(Auth, content),
      fromSuiObjectData: (content: SuiObjectData) => ReplaceDepositForBurnTicket.fromSuiObjectData(Auth, content),
      fetch: async (client: SuiClient, id: string) => ReplaceDepositForBurnTicket.fetch(client, Auth, id),
      new: (fields: ReplaceDepositForBurnTicketFields<ToTypeArgument<Auth>>) => {
        return new ReplaceDepositForBurnTicket([extractType(Auth)], fields);
      },
      kind: "StructClassReified",
    };
  }

  static get r() {
    return ReplaceDepositForBurnTicket.reified;
  }

  static phantom<Auth extends Reified<TypeArgument, any>>(
    Auth: Auth
  ): PhantomReified<ToTypeStr<ReplaceDepositForBurnTicket<ToTypeArgument<Auth>>>> {
    return phantom(ReplaceDepositForBurnTicket.reified(Auth));
  }
  static get p() {
    return ReplaceDepositForBurnTicket.phantom;
  }

  static get bcs() {
    return <Auth extends BcsType<any>>(Auth: Auth) =>
      bcs.struct(`ReplaceDepositForBurnTicket<${Auth.name}>`, {
        auth: Auth,
        original_raw_message: bcs.vector(bcs.u8()),
        original_attestation: bcs.vector(bcs.u8()),
        new_destination_caller: Option.bcs(
          bcs.bytes(32).transform({
            input: (val: string) => fromHEX(val),
            output: (val: Uint8Array) => toHEX(val),
          })
        ),
        new_mint_recipient: Option.bcs(
          bcs.bytes(32).transform({
            input: (val: string) => fromHEX(val),
            output: (val: Uint8Array) => toHEX(val),
          })
        ),
      });
  }

  static fromFields<Auth extends Reified<TypeArgument, any>>(
    typeArg: Auth,
    fields: Record<string, any>
  ): ReplaceDepositForBurnTicket<ToTypeArgument<Auth>> {
    return ReplaceDepositForBurnTicket.reified(typeArg).new({
      auth: decodeFromFields(typeArg, fields.auth),
      originalRawMessage: decodeFromFields(reified.vector("u8"), fields.original_raw_message),
      originalAttestation: decodeFromFields(reified.vector("u8"), fields.original_attestation),
      newDestinationCaller: decodeFromFields(Option.reified("address"), fields.new_destination_caller),
      newMintRecipient: decodeFromFields(Option.reified("address"), fields.new_mint_recipient),
    });
  }

  static fromFieldsWithTypes<Auth extends Reified<TypeArgument, any>>(
    typeArg: Auth,
    item: FieldsWithTypes
  ): ReplaceDepositForBurnTicket<ToTypeArgument<Auth>> {
    if (!isReplaceDepositForBurnTicket(item.type)) {
      throw new Error("not a ReplaceDepositForBurnTicket type");
    }
    assertFieldsWithTypesArgsMatch(item, [typeArg]);

    return ReplaceDepositForBurnTicket.reified(typeArg).new({
      auth: decodeFromFieldsWithTypes(typeArg, item.fields.auth),
      originalRawMessage: decodeFromFieldsWithTypes(reified.vector("u8"), item.fields.original_raw_message),
      originalAttestation: decodeFromFieldsWithTypes(reified.vector("u8"), item.fields.original_attestation),
      newDestinationCaller: decodeFromFieldsWithTypes(Option.reified("address"), item.fields.new_destination_caller),
      newMintRecipient: decodeFromFieldsWithTypes(Option.reified("address"), item.fields.new_mint_recipient),
    });
  }

  static fromBcs<Auth extends Reified<TypeArgument, any>>(
    typeArg: Auth,
    data: Uint8Array
  ): ReplaceDepositForBurnTicket<ToTypeArgument<Auth>> {
    const typeArgs = [typeArg];

    return ReplaceDepositForBurnTicket.fromFields(
      typeArg,
      ReplaceDepositForBurnTicket.bcs(toBcs(typeArgs[0])).parse(data)
    );
  }

  toJSONField() {
    return {
      auth: fieldToJSON<Auth>(this.$typeArgs[0], this.auth),
      originalRawMessage: fieldToJSON<Vector<"u8">>(`vector<u8>`, this.originalRawMessage),
      originalAttestation: fieldToJSON<Vector<"u8">>(`vector<u8>`, this.originalAttestation),
      newDestinationCaller: fieldToJSON<Option<"address">>(`${Option.$typeName}<address>`, this.newDestinationCaller),
      newMintRecipient: fieldToJSON<Option<"address">>(`${Option.$typeName}<address>`, this.newMintRecipient),
    };
  }

  toJSON() {
    return {
      $typeName: this.$typeName,
      $typeArgs: this.$typeArgs,
      ...this.toJSONField(),
    };
  }

  static fromJSONField<Auth extends Reified<TypeArgument, any>>(
    typeArg: Auth,
    field: any
  ): ReplaceDepositForBurnTicket<ToTypeArgument<Auth>> {
    return ReplaceDepositForBurnTicket.reified(typeArg).new({
      auth: decodeFromJSONField(typeArg, field.auth),
      originalRawMessage: decodeFromJSONField(reified.vector("u8"), field.originalRawMessage),
      originalAttestation: decodeFromJSONField(reified.vector("u8"), field.originalAttestation),
      newDestinationCaller: decodeFromJSONField(Option.reified("address"), field.newDestinationCaller),
      newMintRecipient: decodeFromJSONField(Option.reified("address"), field.newMintRecipient),
    });
  }

  static fromJSON<Auth extends Reified<TypeArgument, any>>(
    typeArg: Auth,
    json: Record<string, any>
  ): ReplaceDepositForBurnTicket<ToTypeArgument<Auth>> {
    if (json.$typeName !== ReplaceDepositForBurnTicket.$typeName) {
      throw new Error("not a WithTwoGenerics json object");
    }
    assertReifiedTypeArgsMatch(
      composeSuiType(ReplaceDepositForBurnTicket.$typeName, extractType(typeArg)),
      json.$typeArgs,
      [typeArg]
    );

    return ReplaceDepositForBurnTicket.fromJSONField(typeArg, json);
  }

  static fromSuiParsedData<Auth extends Reified<TypeArgument, any>>(
    typeArg: Auth,
    content: SuiParsedData
  ): ReplaceDepositForBurnTicket<ToTypeArgument<Auth>> {
    if (content.dataType !== "moveObject") {
      throw new Error("not an object");
    }
    if (!isReplaceDepositForBurnTicket(content.type)) {
      throw new Error(`object at ${(content.fields as any).id} is not a ReplaceDepositForBurnTicket object`);
    }
    return ReplaceDepositForBurnTicket.fromFieldsWithTypes(typeArg, content);
  }

  static fromSuiObjectData<Auth extends Reified<TypeArgument, any>>(
    typeArg: Auth,
    data: SuiObjectData
  ): ReplaceDepositForBurnTicket<ToTypeArgument<Auth>> {
    if (data.bcs) {
      if (data.bcs.dataType !== "moveObject" || !isReplaceDepositForBurnTicket(data.bcs.type)) {
        throw new Error(`object at is not a ReplaceDepositForBurnTicket object`);
      }

      const gotTypeArgs = parseTypeName(data.bcs.type).typeArgs;
      if (gotTypeArgs.length !== 1) {
        throw new Error(`type argument mismatch: expected 1 type argument but got '${gotTypeArgs.length}'`);
      }
      const gotTypeArg = compressSuiType(gotTypeArgs[0]);
      const expectedTypeArg = compressSuiType(extractType(typeArg));
      if (gotTypeArg !== compressSuiType(extractType(typeArg))) {
        throw new Error(`type argument mismatch: expected '${expectedTypeArg}' but got '${gotTypeArg}'`);
      }

      return ReplaceDepositForBurnTicket.fromBcs(typeArg, fromB64(data.bcs.bcsBytes));
    }
    if (data.content) {
      return ReplaceDepositForBurnTicket.fromSuiParsedData(typeArg, data.content);
    }
    throw new Error(
      "Both `bcs` and `content` fields are missing from the data. Include `showBcs` or `showContent` in the request."
    );
  }

  static async fetch<Auth extends Reified<TypeArgument, any>>(
    client: SuiClient,
    typeArg: Auth,
    id: string
  ): Promise<ReplaceDepositForBurnTicket<ToTypeArgument<Auth>>> {
    const res = await client.getObject({ id, options: { showBcs: true } });
    if (res.error) {
      throw new Error(`error fetching ReplaceDepositForBurnTicket object at id ${id}: ${res.error.code}`);
    }
    if (res.data?.bcs?.dataType !== "moveObject" || !isReplaceDepositForBurnTicket(res.data.bcs.type)) {
      throw new Error(`object at id ${id} is not a ReplaceDepositForBurnTicket object`);
    }

    return ReplaceDepositForBurnTicket.fromSuiObjectData(typeArg, res.data);
  }
}
