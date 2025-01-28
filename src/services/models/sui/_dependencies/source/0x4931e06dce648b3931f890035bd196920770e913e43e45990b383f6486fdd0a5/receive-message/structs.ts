// @ts-nocheck
import * as reified from "../../../../_framework/reified";
import {
  PhantomReified,
  Reified,
  StructClass,
  ToField,
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
import { VecSet } from "../../../../sui/vec-set/structs";
import { PKG_V1 } from "../index";
import { BcsType, bcs } from "@mysten/sui/bcs";
import { SuiClient, SuiObjectData, SuiParsedData } from "@mysten/sui/client";
import { fromB64, fromHEX, toHEX } from "@mysten/sui/utils";

/* ============================== Receipt =============================== */

export function isReceipt(type: string): boolean {
  type = compressSuiType(type);
  return type === `${PKG_V1}::receive_message::Receipt`;
}

export interface ReceiptFields {
  caller: ToField<"address">;
  recipient: ToField<"address">;
  sourceDomain: ToField<"u32">;
  sender: ToField<"address">;
  nonce: ToField<"u64">;
  messageBody: ToField<Vector<"u8">>;
  currentVersion: ToField<VecSet<"u64">>;
}

export type ReceiptReified = Reified<Receipt, ReceiptFields>;

export class Receipt implements StructClass {
  __StructClass = true as const;

  static get $typeName() {
    return `${PKG_V1}::receive_message::Receipt`;
  }
  static readonly $numTypeParams = 0;
  static readonly $isPhantom = [] as const;

  readonly $typeName = Receipt.$typeName;
  readonly $fullTypeName: string;
  readonly $typeArgs: [];
  readonly $isPhantom = Receipt.$isPhantom;

  readonly caller: ToField<"address">;
  readonly recipient: ToField<"address">;
  readonly sourceDomain: ToField<"u32">;
  readonly sender: ToField<"address">;
  readonly nonce: ToField<"u64">;
  readonly messageBody: ToField<Vector<"u8">>;
  readonly currentVersion: ToField<VecSet<"u64">>;

  private constructor(typeArgs: [], fields: ReceiptFields) {
    this.$fullTypeName = composeSuiType(Receipt.$typeName, ...typeArgs) as string;
    this.$typeArgs = typeArgs;

    this.caller = fields.caller;
    this.recipient = fields.recipient;
    this.sourceDomain = fields.sourceDomain;
    this.sender = fields.sender;
    this.nonce = fields.nonce;
    this.messageBody = fields.messageBody;
    this.currentVersion = fields.currentVersion;
  }

  static reified(): ReceiptReified {
    return {
      typeName: Receipt.$typeName,
      fullTypeName: composeSuiType(Receipt.$typeName, ...[]) as string,
      typeArgs: [] as [],
      isPhantom: Receipt.$isPhantom,
      reifiedTypeArgs: [],
      fromFields: (fields: Record<string, any>) => Receipt.fromFields(fields),
      fromFieldsWithTypes: (item: FieldsWithTypes) => Receipt.fromFieldsWithTypes(item),
      fromBcs: (data: Uint8Array) => Receipt.fromBcs(data),
      bcs: Receipt.bcs,
      fromJSONField: (field: any) => Receipt.fromJSONField(field),
      fromJSON: (json: Record<string, any>) => Receipt.fromJSON(json),
      fromSuiParsedData: (content: SuiParsedData) => Receipt.fromSuiParsedData(content),
      fromSuiObjectData: (content: SuiObjectData) => Receipt.fromSuiObjectData(content),
      fetch: async (client: SuiClient, id: string) => Receipt.fetch(client, id),
      new: (fields: ReceiptFields) => {
        return new Receipt([], fields);
      },
      kind: "StructClassReified",
    };
  }

  static get r() {
    return Receipt.reified();
  }

  static phantom(): PhantomReified<ToTypeStr<Receipt>> {
    return phantom(Receipt.reified());
  }
  static get p() {
    return Receipt.phantom();
  }

  static get bcs() {
    return bcs.struct("Receipt", {
      caller: bcs.bytes(32).transform({
        input: (val: string) => fromHEX(val),
        output: (val: Uint8Array) => toHEX(val),
      }),
      recipient: bcs.bytes(32).transform({
        input: (val: string) => fromHEX(val),
        output: (val: Uint8Array) => toHEX(val),
      }),
      source_domain: bcs.u32(),
      sender: bcs.bytes(32).transform({
        input: (val: string) => fromHEX(val),
        output: (val: Uint8Array) => toHEX(val),
      }),
      nonce: bcs.u64(),
      message_body: bcs.vector(bcs.u8()),
      current_version: VecSet.bcs(bcs.u64()),
    });
  }

  static fromFields(fields: Record<string, any>): Receipt {
    return Receipt.reified().new({
      caller: decodeFromFields("address", fields.caller),
      recipient: decodeFromFields("address", fields.recipient),
      sourceDomain: decodeFromFields("u32", fields.source_domain),
      sender: decodeFromFields("address", fields.sender),
      nonce: decodeFromFields("u64", fields.nonce),
      messageBody: decodeFromFields(reified.vector("u8"), fields.message_body),
      currentVersion: decodeFromFields(VecSet.reified("u64"), fields.current_version),
    });
  }

  static fromFieldsWithTypes(item: FieldsWithTypes): Receipt {
    if (!isReceipt(item.type)) {
      throw new Error("not a Receipt type");
    }

    return Receipt.reified().new({
      caller: decodeFromFieldsWithTypes("address", item.fields.caller),
      recipient: decodeFromFieldsWithTypes("address", item.fields.recipient),
      sourceDomain: decodeFromFieldsWithTypes("u32", item.fields.source_domain),
      sender: decodeFromFieldsWithTypes("address", item.fields.sender),
      nonce: decodeFromFieldsWithTypes("u64", item.fields.nonce),
      messageBody: decodeFromFieldsWithTypes(reified.vector("u8"), item.fields.message_body),
      currentVersion: decodeFromFieldsWithTypes(VecSet.reified("u64"), item.fields.current_version),
    });
  }

  static fromBcs(data: Uint8Array): Receipt {
    return Receipt.fromFields(Receipt.bcs.parse(data));
  }

  toJSONField() {
    return {
      caller: this.caller,
      recipient: this.recipient,
      sourceDomain: this.sourceDomain,
      sender: this.sender,
      nonce: this.nonce.toString(),
      messageBody: fieldToJSON<Vector<"u8">>(`vector<u8>`, this.messageBody),
      currentVersion: this.currentVersion.toJSONField(),
    };
  }

  toJSON() {
    return {
      $typeName: this.$typeName,
      $typeArgs: this.$typeArgs,
      ...this.toJSONField(),
    };
  }

  static fromJSONField(field: any): Receipt {
    return Receipt.reified().new({
      caller: decodeFromJSONField("address", field.caller),
      recipient: decodeFromJSONField("address", field.recipient),
      sourceDomain: decodeFromJSONField("u32", field.sourceDomain),
      sender: decodeFromJSONField("address", field.sender),
      nonce: decodeFromJSONField("u64", field.nonce),
      messageBody: decodeFromJSONField(reified.vector("u8"), field.messageBody),
      currentVersion: decodeFromJSONField(VecSet.reified("u64"), field.currentVersion),
    });
  }

  static fromJSON(json: Record<string, any>): Receipt {
    if (json.$typeName !== Receipt.$typeName) {
      throw new Error("not a WithTwoGenerics json object");
    }

    return Receipt.fromJSONField(json);
  }

  static fromSuiParsedData(content: SuiParsedData): Receipt {
    if (content.dataType !== "moveObject") {
      throw new Error("not an object");
    }
    if (!isReceipt(content.type)) {
      throw new Error(`object at ${(content.fields as any).id} is not a Receipt object`);
    }
    return Receipt.fromFieldsWithTypes(content);
  }

  static fromSuiObjectData(data: SuiObjectData): Receipt {
    if (data.bcs) {
      if (data.bcs.dataType !== "moveObject" || !isReceipt(data.bcs.type)) {
        throw new Error(`object at is not a Receipt object`);
      }

      return Receipt.fromBcs(fromB64(data.bcs.bcsBytes));
    }
    if (data.content) {
      return Receipt.fromSuiParsedData(data.content);
    }
    throw new Error(
      "Both `bcs` and `content` fields are missing from the data. Include `showBcs` or `showContent` in the request."
    );
  }

  static async fetch(client: SuiClient, id: string): Promise<Receipt> {
    const res = await client.getObject({ id, options: { showBcs: true } });
    if (res.error) {
      throw new Error(`error fetching Receipt object at id ${id}: ${res.error.code}`);
    }
    if (res.data?.bcs?.dataType !== "moveObject" || !isReceipt(res.data.bcs.type)) {
      throw new Error(`object at id ${id} is not a Receipt object`);
    }

    return Receipt.fromSuiObjectData(res.data);
  }
}

/* ============================== StampReceiptTicket =============================== */

export function isStampReceiptTicket(type: string): boolean {
  type = compressSuiType(type);
  return type.startsWith(`${PKG_V1}::receive_message::StampReceiptTicket` + "<");
}

export interface StampReceiptTicketFields<Auth extends TypeArgument> {
  auth: ToField<Auth>;
  receipt: ToField<Receipt>;
}

export type StampReceiptTicketReified<Auth extends TypeArgument> = Reified<
  StampReceiptTicket<Auth>,
  StampReceiptTicketFields<Auth>
>;

export class StampReceiptTicket<Auth extends TypeArgument> implements StructClass {
  __StructClass = true as const;

  static get $typeName() {
    return `${PKG_V1}::receive_message::StampReceiptTicket`;
  }
  static readonly $numTypeParams = 1;
  static readonly $isPhantom = [false] as const;

  readonly $typeName = StampReceiptTicket.$typeName;
  readonly $fullTypeName: string;
  readonly $typeArgs: [ToTypeStr<Auth>];
  readonly $isPhantom = StampReceiptTicket.$isPhantom;

  readonly auth: ToField<Auth>;
  readonly receipt: ToField<Receipt>;

  private constructor(typeArgs: [ToTypeStr<Auth>], fields: StampReceiptTicketFields<Auth>) {
    this.$fullTypeName = composeSuiType(StampReceiptTicket.$typeName, ...typeArgs) as string;
    this.$typeArgs = typeArgs;

    this.auth = fields.auth;
    this.receipt = fields.receipt;
  }

  static reified<Auth extends Reified<TypeArgument, any>>(Auth: Auth): StampReceiptTicketReified<ToTypeArgument<Auth>> {
    return {
      typeName: StampReceiptTicket.$typeName,
      fullTypeName: composeSuiType(StampReceiptTicket.$typeName, ...[extractType(Auth)]) as string,
      typeArgs: [extractType(Auth)] as [ToTypeStr<ToTypeArgument<Auth>>],
      isPhantom: StampReceiptTicket.$isPhantom,
      reifiedTypeArgs: [Auth],
      fromFields: (fields: Record<string, any>) => StampReceiptTicket.fromFields(Auth, fields),
      fromFieldsWithTypes: (item: FieldsWithTypes) => StampReceiptTicket.fromFieldsWithTypes(Auth, item),
      fromBcs: (data: Uint8Array) => StampReceiptTicket.fromBcs(Auth, data),
      bcs: StampReceiptTicket.bcs(toBcs(Auth)),
      fromJSONField: (field: any) => StampReceiptTicket.fromJSONField(Auth, field),
      fromJSON: (json: Record<string, any>) => StampReceiptTicket.fromJSON(Auth, json),
      fromSuiParsedData: (content: SuiParsedData) => StampReceiptTicket.fromSuiParsedData(Auth, content),
      fromSuiObjectData: (content: SuiObjectData) => StampReceiptTicket.fromSuiObjectData(Auth, content),
      fetch: async (client: SuiClient, id: string) => StampReceiptTicket.fetch(client, Auth, id),
      new: (fields: StampReceiptTicketFields<ToTypeArgument<Auth>>) => {
        return new StampReceiptTicket([extractType(Auth)], fields);
      },
      kind: "StructClassReified",
    };
  }

  static get r() {
    return StampReceiptTicket.reified;
  }

  static phantom<Auth extends Reified<TypeArgument, any>>(
    Auth: Auth
  ): PhantomReified<ToTypeStr<StampReceiptTicket<ToTypeArgument<Auth>>>> {
    return phantom(StampReceiptTicket.reified(Auth));
  }
  static get p() {
    return StampReceiptTicket.phantom;
  }

  static get bcs() {
    return <Auth extends BcsType<any>>(Auth: Auth) =>
      bcs.struct(`StampReceiptTicket<${Auth.name}>`, {
        auth: Auth,
        receipt: Receipt.bcs,
      });
  }

  static fromFields<Auth extends Reified<TypeArgument, any>>(
    typeArg: Auth,
    fields: Record<string, any>
  ): StampReceiptTicket<ToTypeArgument<Auth>> {
    return StampReceiptTicket.reified(typeArg).new({
      auth: decodeFromFields(typeArg, fields.auth),
      receipt: decodeFromFields(Receipt.reified(), fields.receipt),
    });
  }

  static fromFieldsWithTypes<Auth extends Reified<TypeArgument, any>>(
    typeArg: Auth,
    item: FieldsWithTypes
  ): StampReceiptTicket<ToTypeArgument<Auth>> {
    if (!isStampReceiptTicket(item.type)) {
      throw new Error("not a StampReceiptTicket type");
    }
    assertFieldsWithTypesArgsMatch(item, [typeArg]);

    return StampReceiptTicket.reified(typeArg).new({
      auth: decodeFromFieldsWithTypes(typeArg, item.fields.auth),
      receipt: decodeFromFieldsWithTypes(Receipt.reified(), item.fields.receipt),
    });
  }

  static fromBcs<Auth extends Reified<TypeArgument, any>>(
    typeArg: Auth,
    data: Uint8Array
  ): StampReceiptTicket<ToTypeArgument<Auth>> {
    const typeArgs = [typeArg];

    return StampReceiptTicket.fromFields(typeArg, StampReceiptTicket.bcs(toBcs(typeArgs[0])).parse(data));
  }

  toJSONField() {
    return {
      auth: fieldToJSON<Auth>(this.$typeArgs[0], this.auth),
      receipt: this.receipt.toJSONField(),
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
  ): StampReceiptTicket<ToTypeArgument<Auth>> {
    return StampReceiptTicket.reified(typeArg).new({
      auth: decodeFromJSONField(typeArg, field.auth),
      receipt: decodeFromJSONField(Receipt.reified(), field.receipt),
    });
  }

  static fromJSON<Auth extends Reified<TypeArgument, any>>(
    typeArg: Auth,
    json: Record<string, any>
  ): StampReceiptTicket<ToTypeArgument<Auth>> {
    if (json.$typeName !== StampReceiptTicket.$typeName) {
      throw new Error("not a WithTwoGenerics json object");
    }
    assertReifiedTypeArgsMatch(composeSuiType(StampReceiptTicket.$typeName, extractType(typeArg)), json.$typeArgs, [
      typeArg,
    ]);

    return StampReceiptTicket.fromJSONField(typeArg, json);
  }

  static fromSuiParsedData<Auth extends Reified<TypeArgument, any>>(
    typeArg: Auth,
    content: SuiParsedData
  ): StampReceiptTicket<ToTypeArgument<Auth>> {
    if (content.dataType !== "moveObject") {
      throw new Error("not an object");
    }
    if (!isStampReceiptTicket(content.type)) {
      throw new Error(`object at ${(content.fields as any).id} is not a StampReceiptTicket object`);
    }
    return StampReceiptTicket.fromFieldsWithTypes(typeArg, content);
  }

  static fromSuiObjectData<Auth extends Reified<TypeArgument, any>>(
    typeArg: Auth,
    data: SuiObjectData
  ): StampReceiptTicket<ToTypeArgument<Auth>> {
    if (data.bcs) {
      if (data.bcs.dataType !== "moveObject" || !isStampReceiptTicket(data.bcs.type)) {
        throw new Error(`object at is not a StampReceiptTicket object`);
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

      return StampReceiptTicket.fromBcs(typeArg, fromB64(data.bcs.bcsBytes));
    }
    if (data.content) {
      return StampReceiptTicket.fromSuiParsedData(typeArg, data.content);
    }
    throw new Error(
      "Both `bcs` and `content` fields are missing from the data. Include `showBcs` or `showContent` in the request."
    );
  }

  static async fetch<Auth extends Reified<TypeArgument, any>>(
    client: SuiClient,
    typeArg: Auth,
    id: string
  ): Promise<StampReceiptTicket<ToTypeArgument<Auth>>> {
    const res = await client.getObject({ id, options: { showBcs: true } });
    if (res.error) {
      throw new Error(`error fetching StampReceiptTicket object at id ${id}: ${res.error.code}`);
    }
    if (res.data?.bcs?.dataType !== "moveObject" || !isStampReceiptTicket(res.data.bcs.type)) {
      throw new Error(`object at id ${id} is not a StampReceiptTicket object`);
    }

    return StampReceiptTicket.fromSuiObjectData(typeArg, res.data);
  }
}

/* ============================== StampedReceipt =============================== */

export function isStampedReceipt(type: string): boolean {
  type = compressSuiType(type);
  return type === `${PKG_V1}::receive_message::StampedReceipt`;
}

export interface StampedReceiptFields {
  receipt: ToField<Receipt>;
}

export type StampedReceiptReified = Reified<StampedReceipt, StampedReceiptFields>;

export class StampedReceipt implements StructClass {
  __StructClass = true as const;

  static get $typeName() {
    return `${PKG_V1}::receive_message::StampedReceipt`;
  }
  static readonly $numTypeParams = 0;
  static readonly $isPhantom = [] as const;

  readonly $typeName = StampedReceipt.$typeName;
  readonly $fullTypeName: string;
  readonly $typeArgs: [];
  readonly $isPhantom = StampedReceipt.$isPhantom;

  readonly receipt: ToField<Receipt>;

  private constructor(typeArgs: [], fields: StampedReceiptFields) {
    this.$fullTypeName = composeSuiType(StampedReceipt.$typeName, ...typeArgs) as string;
    this.$typeArgs = typeArgs;

    this.receipt = fields.receipt;
  }

  static reified(): StampedReceiptReified {
    return {
      typeName: StampedReceipt.$typeName,
      fullTypeName: composeSuiType(StampedReceipt.$typeName, ...[]) as string,
      typeArgs: [] as [],
      isPhantom: StampedReceipt.$isPhantom,
      reifiedTypeArgs: [],
      fromFields: (fields: Record<string, any>) => StampedReceipt.fromFields(fields),
      fromFieldsWithTypes: (item: FieldsWithTypes) => StampedReceipt.fromFieldsWithTypes(item),
      fromBcs: (data: Uint8Array) => StampedReceipt.fromBcs(data),
      bcs: StampedReceipt.bcs,
      fromJSONField: (field: any) => StampedReceipt.fromJSONField(field),
      fromJSON: (json: Record<string, any>) => StampedReceipt.fromJSON(json),
      fromSuiParsedData: (content: SuiParsedData) => StampedReceipt.fromSuiParsedData(content),
      fromSuiObjectData: (content: SuiObjectData) => StampedReceipt.fromSuiObjectData(content),
      fetch: async (client: SuiClient, id: string) => StampedReceipt.fetch(client, id),
      new: (fields: StampedReceiptFields) => {
        return new StampedReceipt([], fields);
      },
      kind: "StructClassReified",
    };
  }

  static get r() {
    return StampedReceipt.reified();
  }

  static phantom(): PhantomReified<ToTypeStr<StampedReceipt>> {
    return phantom(StampedReceipt.reified());
  }
  static get p() {
    return StampedReceipt.phantom();
  }

  static get bcs() {
    return bcs.struct("StampedReceipt", {
      receipt: Receipt.bcs,
    });
  }

  static fromFields(fields: Record<string, any>): StampedReceipt {
    return StampedReceipt.reified().new({
      receipt: decodeFromFields(Receipt.reified(), fields.receipt),
    });
  }

  static fromFieldsWithTypes(item: FieldsWithTypes): StampedReceipt {
    if (!isStampedReceipt(item.type)) {
      throw new Error("not a StampedReceipt type");
    }

    return StampedReceipt.reified().new({
      receipt: decodeFromFieldsWithTypes(Receipt.reified(), item.fields.receipt),
    });
  }

  static fromBcs(data: Uint8Array): StampedReceipt {
    return StampedReceipt.fromFields(StampedReceipt.bcs.parse(data));
  }

  toJSONField() {
    return {
      receipt: this.receipt.toJSONField(),
    };
  }

  toJSON() {
    return {
      $typeName: this.$typeName,
      $typeArgs: this.$typeArgs,
      ...this.toJSONField(),
    };
  }

  static fromJSONField(field: any): StampedReceipt {
    return StampedReceipt.reified().new({
      receipt: decodeFromJSONField(Receipt.reified(), field.receipt),
    });
  }

  static fromJSON(json: Record<string, any>): StampedReceipt {
    if (json.$typeName !== StampedReceipt.$typeName) {
      throw new Error("not a WithTwoGenerics json object");
    }

    return StampedReceipt.fromJSONField(json);
  }

  static fromSuiParsedData(content: SuiParsedData): StampedReceipt {
    if (content.dataType !== "moveObject") {
      throw new Error("not an object");
    }
    if (!isStampedReceipt(content.type)) {
      throw new Error(`object at ${(content.fields as any).id} is not a StampedReceipt object`);
    }
    return StampedReceipt.fromFieldsWithTypes(content);
  }

  static fromSuiObjectData(data: SuiObjectData): StampedReceipt {
    if (data.bcs) {
      if (data.bcs.dataType !== "moveObject" || !isStampedReceipt(data.bcs.type)) {
        throw new Error(`object at is not a StampedReceipt object`);
      }

      return StampedReceipt.fromBcs(fromB64(data.bcs.bcsBytes));
    }
    if (data.content) {
      return StampedReceipt.fromSuiParsedData(data.content);
    }
    throw new Error(
      "Both `bcs` and `content` fields are missing from the data. Include `showBcs` or `showContent` in the request."
    );
  }

  static async fetch(client: SuiClient, id: string): Promise<StampedReceipt> {
    const res = await client.getObject({ id, options: { showBcs: true } });
    if (res.error) {
      throw new Error(`error fetching StampedReceipt object at id ${id}: ${res.error.code}`);
    }
    if (res.data?.bcs?.dataType !== "moveObject" || !isStampedReceipt(res.data.bcs.type)) {
      throw new Error(`object at id ${id} is not a StampedReceipt object`);
    }

    return StampedReceipt.fromSuiObjectData(res.data);
  }
}
