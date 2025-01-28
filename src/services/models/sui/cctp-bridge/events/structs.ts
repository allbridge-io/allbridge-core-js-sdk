// @ts-nocheck
import { String } from "../../_dependencies/source/0x1/ascii/structs";
import {
  PhantomReified,
  Reified,
  StructClass,
  ToField,
  ToTypeStr,
  decodeFromFields,
  decodeFromFieldsWithTypes,
  decodeFromJSONField,
  phantom,
} from "../../_framework/reified";
import { FieldsWithTypes, composeSuiType, compressSuiType } from "../../_framework/util";
import { PKG_V1 } from "../index";
import { bcs } from "@mysten/sui/bcs";
import { SuiClient, SuiObjectData, SuiParsedData } from "@mysten/sui/client";
import { fromB64, fromHEX, toHEX } from "@mysten/sui/utils";

/* ============================== ReceiveFeeEvent =============================== */

export function isReceiveFeeEvent(type: string): boolean {
  type = compressSuiType(type);
  return type === `${PKG_V1}::events::ReceiveFeeEvent`;
}

export interface ReceiveFeeEventFields {
  userPaySui: ToField<"u64">;
  userPayStable: ToField<"u64">;
  totalPaySui: ToField<"u64">;
  totalFeeSui: ToField<"u64">;
}

export type ReceiveFeeEventReified = Reified<ReceiveFeeEvent, ReceiveFeeEventFields>;

export class ReceiveFeeEvent implements StructClass {
  __StructClass = true as const;

  static get $typeName() {
    return `${PKG_V1}::events::ReceiveFeeEvent`;
  }
  static readonly $numTypeParams = 0;
  static readonly $isPhantom = [] as const;

  readonly $typeName = ReceiveFeeEvent.$typeName;
  readonly $fullTypeName: string;
  readonly $typeArgs: [];
  readonly $isPhantom = ReceiveFeeEvent.$isPhantom;

  readonly userPaySui: ToField<"u64">;
  readonly userPayStable: ToField<"u64">;
  readonly totalPaySui: ToField<"u64">;
  readonly totalFeeSui: ToField<"u64">;

  private constructor(typeArgs: [], fields: ReceiveFeeEventFields) {
    this.$fullTypeName = composeSuiType(ReceiveFeeEvent.$typeName, ...typeArgs) as string;
    this.$typeArgs = typeArgs;

    this.userPaySui = fields.userPaySui;
    this.userPayStable = fields.userPayStable;
    this.totalPaySui = fields.totalPaySui;
    this.totalFeeSui = fields.totalFeeSui;
  }

  static reified(): ReceiveFeeEventReified {
    return {
      typeName: ReceiveFeeEvent.$typeName,
      fullTypeName: composeSuiType(ReceiveFeeEvent.$typeName, ...[]) as string,
      typeArgs: [] as [],
      isPhantom: ReceiveFeeEvent.$isPhantom,
      reifiedTypeArgs: [],
      fromFields: (fields: Record<string, any>) => ReceiveFeeEvent.fromFields(fields),
      fromFieldsWithTypes: (item: FieldsWithTypes) => ReceiveFeeEvent.fromFieldsWithTypes(item),
      fromBcs: (data: Uint8Array) => ReceiveFeeEvent.fromBcs(data),
      bcs: ReceiveFeeEvent.bcs,
      fromJSONField: (field: any) => ReceiveFeeEvent.fromJSONField(field),
      fromJSON: (json: Record<string, any>) => ReceiveFeeEvent.fromJSON(json),
      fromSuiParsedData: (content: SuiParsedData) => ReceiveFeeEvent.fromSuiParsedData(content),
      fromSuiObjectData: (content: SuiObjectData) => ReceiveFeeEvent.fromSuiObjectData(content),
      fetch: async (client: SuiClient, id: string) => ReceiveFeeEvent.fetch(client, id),
      new: (fields: ReceiveFeeEventFields) => {
        return new ReceiveFeeEvent([], fields);
      },
      kind: "StructClassReified",
    };
  }

  static get r() {
    return ReceiveFeeEvent.reified();
  }

  static phantom(): PhantomReified<ToTypeStr<ReceiveFeeEvent>> {
    return phantom(ReceiveFeeEvent.reified());
  }
  static get p() {
    return ReceiveFeeEvent.phantom();
  }

  static get bcs() {
    return bcs.struct("ReceiveFeeEvent", {
      user_pay_sui: bcs.u64(),
      user_pay_stable: bcs.u64(),
      total_pay_sui: bcs.u64(),
      total_fee_sui: bcs.u64(),
    });
  }

  static fromFields(fields: Record<string, any>): ReceiveFeeEvent {
    return ReceiveFeeEvent.reified().new({
      userPaySui: decodeFromFields("u64", fields.user_pay_sui),
      userPayStable: decodeFromFields("u64", fields.user_pay_stable),
      totalPaySui: decodeFromFields("u64", fields.total_pay_sui),
      totalFeeSui: decodeFromFields("u64", fields.total_fee_sui),
    });
  }

  static fromFieldsWithTypes(item: FieldsWithTypes): ReceiveFeeEvent {
    if (!isReceiveFeeEvent(item.type)) {
      throw new Error("not a ReceiveFeeEvent type");
    }

    return ReceiveFeeEvent.reified().new({
      userPaySui: decodeFromFieldsWithTypes("u64", item.fields.user_pay_sui),
      userPayStable: decodeFromFieldsWithTypes("u64", item.fields.user_pay_stable),
      totalPaySui: decodeFromFieldsWithTypes("u64", item.fields.total_pay_sui),
      totalFeeSui: decodeFromFieldsWithTypes("u64", item.fields.total_fee_sui),
    });
  }

  static fromBcs(data: Uint8Array): ReceiveFeeEvent {
    return ReceiveFeeEvent.fromFields(ReceiveFeeEvent.bcs.parse(data));
  }

  toJSONField() {
    return {
      userPaySui: this.userPaySui.toString(),
      userPayStable: this.userPayStable.toString(),
      totalPaySui: this.totalPaySui.toString(),
      totalFeeSui: this.totalFeeSui.toString(),
    };
  }

  toJSON() {
    return {
      $typeName: this.$typeName,
      $typeArgs: this.$typeArgs,
      ...this.toJSONField(),
    };
  }

  static fromJSONField(field: any): ReceiveFeeEvent {
    return ReceiveFeeEvent.reified().new({
      userPaySui: decodeFromJSONField("u64", field.userPaySui),
      userPayStable: decodeFromJSONField("u64", field.userPayStable),
      totalPaySui: decodeFromJSONField("u64", field.totalPaySui),
      totalFeeSui: decodeFromJSONField("u64", field.totalFeeSui),
    });
  }

  static fromJSON(json: Record<string, any>): ReceiveFeeEvent {
    if (json.$typeName !== ReceiveFeeEvent.$typeName) {
      throw new Error("not a WithTwoGenerics json object");
    }

    return ReceiveFeeEvent.fromJSONField(json);
  }

  static fromSuiParsedData(content: SuiParsedData): ReceiveFeeEvent {
    if (content.dataType !== "moveObject") {
      throw new Error("not an object");
    }
    if (!isReceiveFeeEvent(content.type)) {
      throw new Error(`object at ${(content.fields as any).id} is not a ReceiveFeeEvent object`);
    }
    return ReceiveFeeEvent.fromFieldsWithTypes(content);
  }

  static fromSuiObjectData(data: SuiObjectData): ReceiveFeeEvent {
    if (data.bcs) {
      if (data.bcs.dataType !== "moveObject" || !isReceiveFeeEvent(data.bcs.type)) {
        throw new Error(`object at is not a ReceiveFeeEvent object`);
      }

      return ReceiveFeeEvent.fromBcs(fromB64(data.bcs.bcsBytes));
    }
    if (data.content) {
      return ReceiveFeeEvent.fromSuiParsedData(data.content);
    }
    throw new Error(
      "Both `bcs` and `content` fields are missing from the data. Include `showBcs` or `showContent` in the request."
    );
  }

  static async fetch(client: SuiClient, id: string): Promise<ReceiveFeeEvent> {
    const res = await client.getObject({ id, options: { showBcs: true } });
    if (res.error) {
      throw new Error(`error fetching ReceiveFeeEvent object at id ${id}: ${res.error.code}`);
    }
    if (res.data?.bcs?.dataType !== "moveObject" || !isReceiveFeeEvent(res.data.bcs.type)) {
      throw new Error(`object at id ${id} is not a ReceiveFeeEvent object`);
    }

    return ReceiveFeeEvent.fromSuiObjectData(res.data);
  }
}

/* ============================== TokensReceivedEvent =============================== */

export function isTokensReceivedEvent(type: string): boolean {
  type = compressSuiType(type);
  return type === `${PKG_V1}::events::TokensReceivedEvent`;
}

export interface TokensReceivedEventFields {
  token: ToField<String>;
  message: ToField<String>;
  recipient: ToField<"address">;
  extraGasValue: ToField<"u64">;
}

export type TokensReceivedEventReified = Reified<TokensReceivedEvent, TokensReceivedEventFields>;

export class TokensReceivedEvent implements StructClass {
  __StructClass = true as const;

  static get $typeName() {
    return `${PKG_V1}::events::TokensReceivedEvent`;
  }
  static readonly $numTypeParams = 0;
  static readonly $isPhantom = [] as const;

  readonly $typeName = TokensReceivedEvent.$typeName;
  readonly $fullTypeName: string;
  readonly $typeArgs: [];
  readonly $isPhantom = TokensReceivedEvent.$isPhantom;

  readonly token: ToField<String>;
  readonly message: ToField<String>;
  readonly recipient: ToField<"address">;
  readonly extraGasValue: ToField<"u64">;

  private constructor(typeArgs: [], fields: TokensReceivedEventFields) {
    this.$fullTypeName = composeSuiType(TokensReceivedEvent.$typeName, ...typeArgs) as string;
    this.$typeArgs = typeArgs;

    this.token = fields.token;
    this.message = fields.message;
    this.recipient = fields.recipient;
    this.extraGasValue = fields.extraGasValue;
  }

  static reified(): TokensReceivedEventReified {
    return {
      typeName: TokensReceivedEvent.$typeName,
      fullTypeName: composeSuiType(TokensReceivedEvent.$typeName, ...[]) as string,
      typeArgs: [] as [],
      isPhantom: TokensReceivedEvent.$isPhantom,
      reifiedTypeArgs: [],
      fromFields: (fields: Record<string, any>) => TokensReceivedEvent.fromFields(fields),
      fromFieldsWithTypes: (item: FieldsWithTypes) => TokensReceivedEvent.fromFieldsWithTypes(item),
      fromBcs: (data: Uint8Array) => TokensReceivedEvent.fromBcs(data),
      bcs: TokensReceivedEvent.bcs,
      fromJSONField: (field: any) => TokensReceivedEvent.fromJSONField(field),
      fromJSON: (json: Record<string, any>) => TokensReceivedEvent.fromJSON(json),
      fromSuiParsedData: (content: SuiParsedData) => TokensReceivedEvent.fromSuiParsedData(content),
      fromSuiObjectData: (content: SuiObjectData) => TokensReceivedEvent.fromSuiObjectData(content),
      fetch: async (client: SuiClient, id: string) => TokensReceivedEvent.fetch(client, id),
      new: (fields: TokensReceivedEventFields) => {
        return new TokensReceivedEvent([], fields);
      },
      kind: "StructClassReified",
    };
  }

  static get r() {
    return TokensReceivedEvent.reified();
  }

  static phantom(): PhantomReified<ToTypeStr<TokensReceivedEvent>> {
    return phantom(TokensReceivedEvent.reified());
  }
  static get p() {
    return TokensReceivedEvent.phantom();
  }

  static get bcs() {
    return bcs.struct("TokensReceivedEvent", {
      token: String.bcs,
      message: String.bcs,
      recipient: bcs.bytes(32).transform({
        input: (val: string) => fromHEX(val),
        output: (val: Uint8Array) => toHEX(val),
      }),
      extra_gas_value: bcs.u64(),
    });
  }

  static fromFields(fields: Record<string, any>): TokensReceivedEvent {
    return TokensReceivedEvent.reified().new({
      token: decodeFromFields(String.reified(), fields.token),
      message: decodeFromFields(String.reified(), fields.message),
      recipient: decodeFromFields("address", fields.recipient),
      extraGasValue: decodeFromFields("u64", fields.extra_gas_value),
    });
  }

  static fromFieldsWithTypes(item: FieldsWithTypes): TokensReceivedEvent {
    if (!isTokensReceivedEvent(item.type)) {
      throw new Error("not a TokensReceivedEvent type");
    }

    return TokensReceivedEvent.reified().new({
      token: decodeFromFieldsWithTypes(String.reified(), item.fields.token),
      message: decodeFromFieldsWithTypes(String.reified(), item.fields.message),
      recipient: decodeFromFieldsWithTypes("address", item.fields.recipient),
      extraGasValue: decodeFromFieldsWithTypes("u64", item.fields.extra_gas_value),
    });
  }

  static fromBcs(data: Uint8Array): TokensReceivedEvent {
    return TokensReceivedEvent.fromFields(TokensReceivedEvent.bcs.parse(data));
  }

  toJSONField() {
    return {
      token: this.token,
      message: this.message,
      recipient: this.recipient,
      extraGasValue: this.extraGasValue.toString(),
    };
  }

  toJSON() {
    return {
      $typeName: this.$typeName,
      $typeArgs: this.$typeArgs,
      ...this.toJSONField(),
    };
  }

  static fromJSONField(field: any): TokensReceivedEvent {
    return TokensReceivedEvent.reified().new({
      token: decodeFromJSONField(String.reified(), field.token),
      message: decodeFromJSONField(String.reified(), field.message),
      recipient: decodeFromJSONField("address", field.recipient),
      extraGasValue: decodeFromJSONField("u64", field.extraGasValue),
    });
  }

  static fromJSON(json: Record<string, any>): TokensReceivedEvent {
    if (json.$typeName !== TokensReceivedEvent.$typeName) {
      throw new Error("not a WithTwoGenerics json object");
    }

    return TokensReceivedEvent.fromJSONField(json);
  }

  static fromSuiParsedData(content: SuiParsedData): TokensReceivedEvent {
    if (content.dataType !== "moveObject") {
      throw new Error("not an object");
    }
    if (!isTokensReceivedEvent(content.type)) {
      throw new Error(`object at ${(content.fields as any).id} is not a TokensReceivedEvent object`);
    }
    return TokensReceivedEvent.fromFieldsWithTypes(content);
  }

  static fromSuiObjectData(data: SuiObjectData): TokensReceivedEvent {
    if (data.bcs) {
      if (data.bcs.dataType !== "moveObject" || !isTokensReceivedEvent(data.bcs.type)) {
        throw new Error(`object at is not a TokensReceivedEvent object`);
      }

      return TokensReceivedEvent.fromBcs(fromB64(data.bcs.bcsBytes));
    }
    if (data.content) {
      return TokensReceivedEvent.fromSuiParsedData(data.content);
    }
    throw new Error(
      "Both `bcs` and `content` fields are missing from the data. Include `showBcs` or `showContent` in the request."
    );
  }

  static async fetch(client: SuiClient, id: string): Promise<TokensReceivedEvent> {
    const res = await client.getObject({ id, options: { showBcs: true } });
    if (res.error) {
      throw new Error(`error fetching TokensReceivedEvent object at id ${id}: ${res.error.code}`);
    }
    if (res.data?.bcs?.dataType !== "moveObject" || !isTokensReceivedEvent(res.data.bcs.type)) {
      throw new Error(`object at id ${id} is not a TokensReceivedEvent object`);
    }

    return TokensReceivedEvent.fromSuiObjectData(res.data);
  }
}

/* ============================== TokensSentEvent =============================== */

export function isTokensSentEvent(type: string): boolean {
  type = compressSuiType(type);
  return type === `${PKG_V1}::events::TokensSentEvent`;
}

export interface TokensSentEventFields {
  token: ToField<String>;
  amount: ToField<"u64">;
  adminFee: ToField<"u64">;
  sender: ToField<"address">;
  recipient: ToField<String>;
  recipientWalletAddress: ToField<String>;
  destinationChainId: ToField<"u8">;
  nonce: ToField<"u64">;
}

export type TokensSentEventReified = Reified<TokensSentEvent, TokensSentEventFields>;

export class TokensSentEvent implements StructClass {
  __StructClass = true as const;

  static get $typeName() {
    return `${PKG_V1}::events::TokensSentEvent`;
  }
  static readonly $numTypeParams = 0;
  static readonly $isPhantom = [] as const;

  readonly $typeName = TokensSentEvent.$typeName;
  readonly $fullTypeName: string;
  readonly $typeArgs: [];
  readonly $isPhantom = TokensSentEvent.$isPhantom;

  readonly token: ToField<String>;
  readonly amount: ToField<"u64">;
  readonly adminFee: ToField<"u64">;
  readonly sender: ToField<"address">;
  readonly recipient: ToField<String>;
  readonly recipientWalletAddress: ToField<String>;
  readonly destinationChainId: ToField<"u8">;
  readonly nonce: ToField<"u64">;

  private constructor(typeArgs: [], fields: TokensSentEventFields) {
    this.$fullTypeName = composeSuiType(TokensSentEvent.$typeName, ...typeArgs) as string;
    this.$typeArgs = typeArgs;

    this.token = fields.token;
    this.amount = fields.amount;
    this.adminFee = fields.adminFee;
    this.sender = fields.sender;
    this.recipient = fields.recipient;
    this.recipientWalletAddress = fields.recipientWalletAddress;
    this.destinationChainId = fields.destinationChainId;
    this.nonce = fields.nonce;
  }

  static reified(): TokensSentEventReified {
    return {
      typeName: TokensSentEvent.$typeName,
      fullTypeName: composeSuiType(TokensSentEvent.$typeName, ...[]) as string,
      typeArgs: [] as [],
      isPhantom: TokensSentEvent.$isPhantom,
      reifiedTypeArgs: [],
      fromFields: (fields: Record<string, any>) => TokensSentEvent.fromFields(fields),
      fromFieldsWithTypes: (item: FieldsWithTypes) => TokensSentEvent.fromFieldsWithTypes(item),
      fromBcs: (data: Uint8Array) => TokensSentEvent.fromBcs(data),
      bcs: TokensSentEvent.bcs,
      fromJSONField: (field: any) => TokensSentEvent.fromJSONField(field),
      fromJSON: (json: Record<string, any>) => TokensSentEvent.fromJSON(json),
      fromSuiParsedData: (content: SuiParsedData) => TokensSentEvent.fromSuiParsedData(content),
      fromSuiObjectData: (content: SuiObjectData) => TokensSentEvent.fromSuiObjectData(content),
      fetch: async (client: SuiClient, id: string) => TokensSentEvent.fetch(client, id),
      new: (fields: TokensSentEventFields) => {
        return new TokensSentEvent([], fields);
      },
      kind: "StructClassReified",
    };
  }

  static get r() {
    return TokensSentEvent.reified();
  }

  static phantom(): PhantomReified<ToTypeStr<TokensSentEvent>> {
    return phantom(TokensSentEvent.reified());
  }
  static get p() {
    return TokensSentEvent.phantom();
  }

  static get bcs() {
    return bcs.struct("TokensSentEvent", {
      token: String.bcs,
      amount: bcs.u64(),
      admin_fee: bcs.u64(),
      sender: bcs.bytes(32).transform({
        input: (val: string) => fromHEX(val),
        output: (val: Uint8Array) => toHEX(val),
      }),
      recipient: String.bcs,
      recipient_wallet_address: String.bcs,
      destination_chain_id: bcs.u8(),
      nonce: bcs.u64(),
    });
  }

  static fromFields(fields: Record<string, any>): TokensSentEvent {
    return TokensSentEvent.reified().new({
      token: decodeFromFields(String.reified(), fields.token),
      amount: decodeFromFields("u64", fields.amount),
      adminFee: decodeFromFields("u64", fields.admin_fee),
      sender: decodeFromFields("address", fields.sender),
      recipient: decodeFromFields(String.reified(), fields.recipient),
      recipientWalletAddress: decodeFromFields(String.reified(), fields.recipient_wallet_address),
      destinationChainId: decodeFromFields("u8", fields.destination_chain_id),
      nonce: decodeFromFields("u64", fields.nonce),
    });
  }

  static fromFieldsWithTypes(item: FieldsWithTypes): TokensSentEvent {
    if (!isTokensSentEvent(item.type)) {
      throw new Error("not a TokensSentEvent type");
    }

    return TokensSentEvent.reified().new({
      token: decodeFromFieldsWithTypes(String.reified(), item.fields.token),
      amount: decodeFromFieldsWithTypes("u64", item.fields.amount),
      adminFee: decodeFromFieldsWithTypes("u64", item.fields.admin_fee),
      sender: decodeFromFieldsWithTypes("address", item.fields.sender),
      recipient: decodeFromFieldsWithTypes(String.reified(), item.fields.recipient),
      recipientWalletAddress: decodeFromFieldsWithTypes(String.reified(), item.fields.recipient_wallet_address),
      destinationChainId: decodeFromFieldsWithTypes("u8", item.fields.destination_chain_id),
      nonce: decodeFromFieldsWithTypes("u64", item.fields.nonce),
    });
  }

  static fromBcs(data: Uint8Array): TokensSentEvent {
    return TokensSentEvent.fromFields(TokensSentEvent.bcs.parse(data));
  }

  toJSONField() {
    return {
      token: this.token,
      amount: this.amount.toString(),
      adminFee: this.adminFee.toString(),
      sender: this.sender,
      recipient: this.recipient,
      recipientWalletAddress: this.recipientWalletAddress,
      destinationChainId: this.destinationChainId,
      nonce: this.nonce.toString(),
    };
  }

  toJSON() {
    return {
      $typeName: this.$typeName,
      $typeArgs: this.$typeArgs,
      ...this.toJSONField(),
    };
  }

  static fromJSONField(field: any): TokensSentEvent {
    return TokensSentEvent.reified().new({
      token: decodeFromJSONField(String.reified(), field.token),
      amount: decodeFromJSONField("u64", field.amount),
      adminFee: decodeFromJSONField("u64", field.adminFee),
      sender: decodeFromJSONField("address", field.sender),
      recipient: decodeFromJSONField(String.reified(), field.recipient),
      recipientWalletAddress: decodeFromJSONField(String.reified(), field.recipientWalletAddress),
      destinationChainId: decodeFromJSONField("u8", field.destinationChainId),
      nonce: decodeFromJSONField("u64", field.nonce),
    });
  }

  static fromJSON(json: Record<string, any>): TokensSentEvent {
    if (json.$typeName !== TokensSentEvent.$typeName) {
      throw new Error("not a WithTwoGenerics json object");
    }

    return TokensSentEvent.fromJSONField(json);
  }

  static fromSuiParsedData(content: SuiParsedData): TokensSentEvent {
    if (content.dataType !== "moveObject") {
      throw new Error("not an object");
    }
    if (!isTokensSentEvent(content.type)) {
      throw new Error(`object at ${(content.fields as any).id} is not a TokensSentEvent object`);
    }
    return TokensSentEvent.fromFieldsWithTypes(content);
  }

  static fromSuiObjectData(data: SuiObjectData): TokensSentEvent {
    if (data.bcs) {
      if (data.bcs.dataType !== "moveObject" || !isTokensSentEvent(data.bcs.type)) {
        throw new Error(`object at is not a TokensSentEvent object`);
      }

      return TokensSentEvent.fromBcs(fromB64(data.bcs.bcsBytes));
    }
    if (data.content) {
      return TokensSentEvent.fromSuiParsedData(data.content);
    }
    throw new Error(
      "Both `bcs` and `content` fields are missing from the data. Include `showBcs` or `showContent` in the request."
    );
  }

  static async fetch(client: SuiClient, id: string): Promise<TokensSentEvent> {
    const res = await client.getObject({ id, options: { showBcs: true } });
    if (res.error) {
      throw new Error(`error fetching TokensSentEvent object at id ${id}: ${res.error.code}`);
    }
    if (res.data?.bcs?.dataType !== "moveObject" || !isTokensSentEvent(res.data.bcs.type)) {
      throw new Error(`object at id ${id} is not a TokensSentEvent object`);
    }

    return TokensSentEvent.fromSuiObjectData(res.data);
  }
}

/* ============================== RecipientReplaced =============================== */

export function isRecipientReplaced(type: string): boolean {
  type = compressSuiType(type);
  return type === `${PKG_V1}::events::RecipientReplaced`;
}

export interface RecipientReplacedFields {
  token: ToField<String>;
  sender: ToField<"address">;
  nonce: ToField<"u64">;
  newRecipitne: ToField<String>;
}

export type RecipientReplacedReified = Reified<RecipientReplaced, RecipientReplacedFields>;

export class RecipientReplaced implements StructClass {
  __StructClass = true as const;

  static get $typeName() {
    return `${PKG_V1}::events::RecipientReplaced`;
  }
  static readonly $numTypeParams = 0;
  static readonly $isPhantom = [] as const;

  readonly $typeName = RecipientReplaced.$typeName;
  readonly $fullTypeName: string;
  readonly $typeArgs: [];
  readonly $isPhantom = RecipientReplaced.$isPhantom;

  readonly token: ToField<String>;
  readonly sender: ToField<"address">;
  readonly nonce: ToField<"u64">;
  readonly newRecipitne: ToField<String>;

  private constructor(typeArgs: [], fields: RecipientReplacedFields) {
    this.$fullTypeName = composeSuiType(RecipientReplaced.$typeName, ...typeArgs) as string;
    this.$typeArgs = typeArgs;

    this.token = fields.token;
    this.sender = fields.sender;
    this.nonce = fields.nonce;
    this.newRecipitne = fields.newRecipitne;
  }

  static reified(): RecipientReplacedReified {
    return {
      typeName: RecipientReplaced.$typeName,
      fullTypeName: composeSuiType(RecipientReplaced.$typeName, ...[]) as string,
      typeArgs: [] as [],
      isPhantom: RecipientReplaced.$isPhantom,
      reifiedTypeArgs: [],
      fromFields: (fields: Record<string, any>) => RecipientReplaced.fromFields(fields),
      fromFieldsWithTypes: (item: FieldsWithTypes) => RecipientReplaced.fromFieldsWithTypes(item),
      fromBcs: (data: Uint8Array) => RecipientReplaced.fromBcs(data),
      bcs: RecipientReplaced.bcs,
      fromJSONField: (field: any) => RecipientReplaced.fromJSONField(field),
      fromJSON: (json: Record<string, any>) => RecipientReplaced.fromJSON(json),
      fromSuiParsedData: (content: SuiParsedData) => RecipientReplaced.fromSuiParsedData(content),
      fromSuiObjectData: (content: SuiObjectData) => RecipientReplaced.fromSuiObjectData(content),
      fetch: async (client: SuiClient, id: string) => RecipientReplaced.fetch(client, id),
      new: (fields: RecipientReplacedFields) => {
        return new RecipientReplaced([], fields);
      },
      kind: "StructClassReified",
    };
  }

  static get r() {
    return RecipientReplaced.reified();
  }

  static phantom(): PhantomReified<ToTypeStr<RecipientReplaced>> {
    return phantom(RecipientReplaced.reified());
  }
  static get p() {
    return RecipientReplaced.phantom();
  }

  static get bcs() {
    return bcs.struct("RecipientReplaced", {
      token: String.bcs,
      sender: bcs.bytes(32).transform({
        input: (val: string) => fromHEX(val),
        output: (val: Uint8Array) => toHEX(val),
      }),
      nonce: bcs.u64(),
      new_recipitne: String.bcs,
    });
  }

  static fromFields(fields: Record<string, any>): RecipientReplaced {
    return RecipientReplaced.reified().new({
      token: decodeFromFields(String.reified(), fields.token),
      sender: decodeFromFields("address", fields.sender),
      nonce: decodeFromFields("u64", fields.nonce),
      newRecipitne: decodeFromFields(String.reified(), fields.new_recipitne),
    });
  }

  static fromFieldsWithTypes(item: FieldsWithTypes): RecipientReplaced {
    if (!isRecipientReplaced(item.type)) {
      throw new Error("not a RecipientReplaced type");
    }

    return RecipientReplaced.reified().new({
      token: decodeFromFieldsWithTypes(String.reified(), item.fields.token),
      sender: decodeFromFieldsWithTypes("address", item.fields.sender),
      nonce: decodeFromFieldsWithTypes("u64", item.fields.nonce),
      newRecipitne: decodeFromFieldsWithTypes(String.reified(), item.fields.new_recipitne),
    });
  }

  static fromBcs(data: Uint8Array): RecipientReplaced {
    return RecipientReplaced.fromFields(RecipientReplaced.bcs.parse(data));
  }

  toJSONField() {
    return {
      token: this.token,
      sender: this.sender,
      nonce: this.nonce.toString(),
      newRecipitne: this.newRecipitne,
    };
  }

  toJSON() {
    return {
      $typeName: this.$typeName,
      $typeArgs: this.$typeArgs,
      ...this.toJSONField(),
    };
  }

  static fromJSONField(field: any): RecipientReplaced {
    return RecipientReplaced.reified().new({
      token: decodeFromJSONField(String.reified(), field.token),
      sender: decodeFromJSONField("address", field.sender),
      nonce: decodeFromJSONField("u64", field.nonce),
      newRecipitne: decodeFromJSONField(String.reified(), field.newRecipitne),
    });
  }

  static fromJSON(json: Record<string, any>): RecipientReplaced {
    if (json.$typeName !== RecipientReplaced.$typeName) {
      throw new Error("not a WithTwoGenerics json object");
    }

    return RecipientReplaced.fromJSONField(json);
  }

  static fromSuiParsedData(content: SuiParsedData): RecipientReplaced {
    if (content.dataType !== "moveObject") {
      throw new Error("not an object");
    }
    if (!isRecipientReplaced(content.type)) {
      throw new Error(`object at ${(content.fields as any).id} is not a RecipientReplaced object`);
    }
    return RecipientReplaced.fromFieldsWithTypes(content);
  }

  static fromSuiObjectData(data: SuiObjectData): RecipientReplaced {
    if (data.bcs) {
      if (data.bcs.dataType !== "moveObject" || !isRecipientReplaced(data.bcs.type)) {
        throw new Error(`object at is not a RecipientReplaced object`);
      }

      return RecipientReplaced.fromBcs(fromB64(data.bcs.bcsBytes));
    }
    if (data.content) {
      return RecipientReplaced.fromSuiParsedData(data.content);
    }
    throw new Error(
      "Both `bcs` and `content` fields are missing from the data. Include `showBcs` or `showContent` in the request."
    );
  }

  static async fetch(client: SuiClient, id: string): Promise<RecipientReplaced> {
    const res = await client.getObject({ id, options: { showBcs: true } });
    if (res.error) {
      throw new Error(`error fetching RecipientReplaced object at id ${id}: ${res.error.code}`);
    }
    if (res.data?.bcs?.dataType !== "moveObject" || !isRecipientReplaced(res.data.bcs.type)) {
      throw new Error(`object at id ${id} is not a RecipientReplaced object`);
    }

    return RecipientReplaced.fromSuiObjectData(res.data);
  }
}
