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

/* ============================== DepositEvent =============================== */

export function isDepositEvent(type: string): boolean {
  type = compressSuiType(type);
  return type === `${PKG_V1}::events::DepositEvent`;
}

export interface DepositEventFields {
  token: ToField<String>;
  amount: ToField<"u64">;
  lpAmount: ToField<"u64">;
}

export type DepositEventReified = Reified<DepositEvent, DepositEventFields>;

export class DepositEvent implements StructClass {
  __StructClass = true as const;

  static get $typeName() {
    return `${PKG_V1}::events::DepositEvent`;
  }
  static readonly $numTypeParams = 0;
  static readonly $isPhantom = [] as const;

  readonly $typeName = DepositEvent.$typeName;
  readonly $fullTypeName: string;
  readonly $typeArgs: [];
  readonly $isPhantom = DepositEvent.$isPhantom;

  readonly token: ToField<String>;
  readonly amount: ToField<"u64">;
  readonly lpAmount: ToField<"u64">;

  private constructor(typeArgs: [], fields: DepositEventFields) {
    this.$fullTypeName = composeSuiType(DepositEvent.$typeName, ...typeArgs) as string;
    this.$typeArgs = typeArgs;

    this.token = fields.token;
    this.amount = fields.amount;
    this.lpAmount = fields.lpAmount;
  }

  static reified(): DepositEventReified {
    return {
      typeName: DepositEvent.$typeName,
      fullTypeName: composeSuiType(DepositEvent.$typeName, ...[]) as string,
      typeArgs: [] as [],
      isPhantom: DepositEvent.$isPhantom,
      reifiedTypeArgs: [],
      fromFields: (fields: Record<string, any>) => DepositEvent.fromFields(fields),
      fromFieldsWithTypes: (item: FieldsWithTypes) => DepositEvent.fromFieldsWithTypes(item),
      fromBcs: (data: Uint8Array) => DepositEvent.fromBcs(data),
      bcs: DepositEvent.bcs,
      fromJSONField: (field: any) => DepositEvent.fromJSONField(field),
      fromJSON: (json: Record<string, any>) => DepositEvent.fromJSON(json),
      fromSuiParsedData: (content: SuiParsedData) => DepositEvent.fromSuiParsedData(content),
      fromSuiObjectData: (content: SuiObjectData) => DepositEvent.fromSuiObjectData(content),
      fetch: async (client: SuiClient, id: string) => DepositEvent.fetch(client, id),
      new: (fields: DepositEventFields) => {
        return new DepositEvent([], fields);
      },
      kind: "StructClassReified",
    };
  }

  static get r() {
    return DepositEvent.reified();
  }

  static phantom(): PhantomReified<ToTypeStr<DepositEvent>> {
    return phantom(DepositEvent.reified());
  }
  static get p() {
    return DepositEvent.phantom();
  }

  static get bcs() {
    return bcs.struct("DepositEvent", {
      token: String.bcs,
      amount: bcs.u64(),
      lp_amount: bcs.u64(),
    });
  }

  static fromFields(fields: Record<string, any>): DepositEvent {
    return DepositEvent.reified().new({
      token: decodeFromFields(String.reified(), fields.token),
      amount: decodeFromFields("u64", fields.amount),
      lpAmount: decodeFromFields("u64", fields.lp_amount),
    });
  }

  static fromFieldsWithTypes(item: FieldsWithTypes): DepositEvent {
    if (!isDepositEvent(item.type)) {
      throw new Error("not a DepositEvent type");
    }

    return DepositEvent.reified().new({
      token: decodeFromFieldsWithTypes(String.reified(), item.fields.token),
      amount: decodeFromFieldsWithTypes("u64", item.fields.amount),
      lpAmount: decodeFromFieldsWithTypes("u64", item.fields.lp_amount),
    });
  }

  static fromBcs(data: Uint8Array): DepositEvent {
    return DepositEvent.fromFields(DepositEvent.bcs.parse(data));
  }

  toJSONField() {
    return {
      token: this.token,
      amount: this.amount.toString(),
      lpAmount: this.lpAmount.toString(),
    };
  }

  toJSON() {
    return {
      $typeName: this.$typeName,
      $typeArgs: this.$typeArgs,
      ...this.toJSONField(),
    };
  }

  static fromJSONField(field: any): DepositEvent {
    return DepositEvent.reified().new({
      token: decodeFromJSONField(String.reified(), field.token),
      amount: decodeFromJSONField("u64", field.amount),
      lpAmount: decodeFromJSONField("u64", field.lpAmount),
    });
  }

  static fromJSON(json: Record<string, any>): DepositEvent {
    if (json.$typeName !== DepositEvent.$typeName) {
      throw new Error("not a WithTwoGenerics json object");
    }

    return DepositEvent.fromJSONField(json);
  }

  static fromSuiParsedData(content: SuiParsedData): DepositEvent {
    if (content.dataType !== "moveObject") {
      throw new Error("not an object");
    }
    if (!isDepositEvent(content.type)) {
      throw new Error(`object at ${(content.fields as any).id} is not a DepositEvent object`);
    }
    return DepositEvent.fromFieldsWithTypes(content);
  }

  static fromSuiObjectData(data: SuiObjectData): DepositEvent {
    if (data.bcs) {
      if (data.bcs.dataType !== "moveObject" || !isDepositEvent(data.bcs.type)) {
        throw new Error(`object at is not a DepositEvent object`);
      }

      return DepositEvent.fromBcs(fromB64(data.bcs.bcsBytes));
    }
    if (data.content) {
      return DepositEvent.fromSuiParsedData(data.content);
    }
    throw new Error(
      "Both `bcs` and `content` fields are missing from the data. Include `showBcs` or `showContent` in the request."
    );
  }

  static async fetch(client: SuiClient, id: string): Promise<DepositEvent> {
    const res = await client.getObject({ id, options: { showBcs: true } });
    if (res.error) {
      throw new Error(`error fetching DepositEvent object at id ${id}: ${res.error.code}`);
    }
    if (res.data?.bcs?.dataType !== "moveObject" || !isDepositEvent(res.data.bcs.type)) {
      throw new Error(`object at id ${id} is not a DepositEvent object`);
    }

    return DepositEvent.fromSuiObjectData(res.data);
  }
}

/* ============================== ReceiveFeeEvent =============================== */

export function isReceiveFeeEvent(type: string): boolean {
  type = compressSuiType(type);
  return type === `${PKG_V1}::events::ReceiveFeeEvent`;
}

export interface ReceiveFeeEventFields {
  userPaySui: ToField<"u64">;
  userPayStable: ToField<"u64">;
  totalPaySui: ToField<"u64">;
  bridgeFeeSui: ToField<"u64">;
  messengerFeeSui: ToField<"u64">;
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
  readonly bridgeFeeSui: ToField<"u64">;
  readonly messengerFeeSui: ToField<"u64">;
  readonly totalFeeSui: ToField<"u64">;

  private constructor(typeArgs: [], fields: ReceiveFeeEventFields) {
    this.$fullTypeName = composeSuiType(ReceiveFeeEvent.$typeName, ...typeArgs) as string;
    this.$typeArgs = typeArgs;

    this.userPaySui = fields.userPaySui;
    this.userPayStable = fields.userPayStable;
    this.totalPaySui = fields.totalPaySui;
    this.bridgeFeeSui = fields.bridgeFeeSui;
    this.messengerFeeSui = fields.messengerFeeSui;
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
      bridge_fee_sui: bcs.u64(),
      messenger_fee_sui: bcs.u64(),
      total_fee_sui: bcs.u64(),
    });
  }

  static fromFields(fields: Record<string, any>): ReceiveFeeEvent {
    return ReceiveFeeEvent.reified().new({
      userPaySui: decodeFromFields("u64", fields.user_pay_sui),
      userPayStable: decodeFromFields("u64", fields.user_pay_stable),
      totalPaySui: decodeFromFields("u64", fields.total_pay_sui),
      bridgeFeeSui: decodeFromFields("u64", fields.bridge_fee_sui),
      messengerFeeSui: decodeFromFields("u64", fields.messenger_fee_sui),
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
      bridgeFeeSui: decodeFromFieldsWithTypes("u64", item.fields.bridge_fee_sui),
      messengerFeeSui: decodeFromFieldsWithTypes("u64", item.fields.messenger_fee_sui),
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
      bridgeFeeSui: this.bridgeFeeSui.toString(),
      messengerFeeSui: this.messengerFeeSui.toString(),
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
      bridgeFeeSui: decodeFromJSONField("u64", field.bridgeFeeSui),
      messengerFeeSui: decodeFromJSONField("u64", field.messengerFeeSui),
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

/* ============================== RewardsClaimedEvent =============================== */

export function isRewardsClaimedEvent(type: string): boolean {
  type = compressSuiType(type);
  return type === `${PKG_V1}::events::RewardsClaimedEvent`;
}

export interface RewardsClaimedEventFields {
  token: ToField<String>;
  amount: ToField<"u64">;
}

export type RewardsClaimedEventReified = Reified<RewardsClaimedEvent, RewardsClaimedEventFields>;

export class RewardsClaimedEvent implements StructClass {
  __StructClass = true as const;

  static get $typeName() {
    return `${PKG_V1}::events::RewardsClaimedEvent`;
  }
  static readonly $numTypeParams = 0;
  static readonly $isPhantom = [] as const;

  readonly $typeName = RewardsClaimedEvent.$typeName;
  readonly $fullTypeName: string;
  readonly $typeArgs: [];
  readonly $isPhantom = RewardsClaimedEvent.$isPhantom;

  readonly token: ToField<String>;
  readonly amount: ToField<"u64">;

  private constructor(typeArgs: [], fields: RewardsClaimedEventFields) {
    this.$fullTypeName = composeSuiType(RewardsClaimedEvent.$typeName, ...typeArgs) as string;
    this.$typeArgs = typeArgs;

    this.token = fields.token;
    this.amount = fields.amount;
  }

  static reified(): RewardsClaimedEventReified {
    return {
      typeName: RewardsClaimedEvent.$typeName,
      fullTypeName: composeSuiType(RewardsClaimedEvent.$typeName, ...[]) as string,
      typeArgs: [] as [],
      isPhantom: RewardsClaimedEvent.$isPhantom,
      reifiedTypeArgs: [],
      fromFields: (fields: Record<string, any>) => RewardsClaimedEvent.fromFields(fields),
      fromFieldsWithTypes: (item: FieldsWithTypes) => RewardsClaimedEvent.fromFieldsWithTypes(item),
      fromBcs: (data: Uint8Array) => RewardsClaimedEvent.fromBcs(data),
      bcs: RewardsClaimedEvent.bcs,
      fromJSONField: (field: any) => RewardsClaimedEvent.fromJSONField(field),
      fromJSON: (json: Record<string, any>) => RewardsClaimedEvent.fromJSON(json),
      fromSuiParsedData: (content: SuiParsedData) => RewardsClaimedEvent.fromSuiParsedData(content),
      fromSuiObjectData: (content: SuiObjectData) => RewardsClaimedEvent.fromSuiObjectData(content),
      fetch: async (client: SuiClient, id: string) => RewardsClaimedEvent.fetch(client, id),
      new: (fields: RewardsClaimedEventFields) => {
        return new RewardsClaimedEvent([], fields);
      },
      kind: "StructClassReified",
    };
  }

  static get r() {
    return RewardsClaimedEvent.reified();
  }

  static phantom(): PhantomReified<ToTypeStr<RewardsClaimedEvent>> {
    return phantom(RewardsClaimedEvent.reified());
  }
  static get p() {
    return RewardsClaimedEvent.phantom();
  }

  static get bcs() {
    return bcs.struct("RewardsClaimedEvent", {
      token: String.bcs,
      amount: bcs.u64(),
    });
  }

  static fromFields(fields: Record<string, any>): RewardsClaimedEvent {
    return RewardsClaimedEvent.reified().new({
      token: decodeFromFields(String.reified(), fields.token),
      amount: decodeFromFields("u64", fields.amount),
    });
  }

  static fromFieldsWithTypes(item: FieldsWithTypes): RewardsClaimedEvent {
    if (!isRewardsClaimedEvent(item.type)) {
      throw new Error("not a RewardsClaimedEvent type");
    }

    return RewardsClaimedEvent.reified().new({
      token: decodeFromFieldsWithTypes(String.reified(), item.fields.token),
      amount: decodeFromFieldsWithTypes("u64", item.fields.amount),
    });
  }

  static fromBcs(data: Uint8Array): RewardsClaimedEvent {
    return RewardsClaimedEvent.fromFields(RewardsClaimedEvent.bcs.parse(data));
  }

  toJSONField() {
    return {
      token: this.token,
      amount: this.amount.toString(),
    };
  }

  toJSON() {
    return {
      $typeName: this.$typeName,
      $typeArgs: this.$typeArgs,
      ...this.toJSONField(),
    };
  }

  static fromJSONField(field: any): RewardsClaimedEvent {
    return RewardsClaimedEvent.reified().new({
      token: decodeFromJSONField(String.reified(), field.token),
      amount: decodeFromJSONField("u64", field.amount),
    });
  }

  static fromJSON(json: Record<string, any>): RewardsClaimedEvent {
    if (json.$typeName !== RewardsClaimedEvent.$typeName) {
      throw new Error("not a WithTwoGenerics json object");
    }

    return RewardsClaimedEvent.fromJSONField(json);
  }

  static fromSuiParsedData(content: SuiParsedData): RewardsClaimedEvent {
    if (content.dataType !== "moveObject") {
      throw new Error("not an object");
    }
    if (!isRewardsClaimedEvent(content.type)) {
      throw new Error(`object at ${(content.fields as any).id} is not a RewardsClaimedEvent object`);
    }
    return RewardsClaimedEvent.fromFieldsWithTypes(content);
  }

  static fromSuiObjectData(data: SuiObjectData): RewardsClaimedEvent {
    if (data.bcs) {
      if (data.bcs.dataType !== "moveObject" || !isRewardsClaimedEvent(data.bcs.type)) {
        throw new Error(`object at is not a RewardsClaimedEvent object`);
      }

      return RewardsClaimedEvent.fromBcs(fromB64(data.bcs.bcsBytes));
    }
    if (data.content) {
      return RewardsClaimedEvent.fromSuiParsedData(data.content);
    }
    throw new Error(
      "Both `bcs` and `content` fields are missing from the data. Include `showBcs` or `showContent` in the request."
    );
  }

  static async fetch(client: SuiClient, id: string): Promise<RewardsClaimedEvent> {
    const res = await client.getObject({ id, options: { showBcs: true } });
    if (res.error) {
      throw new Error(`error fetching RewardsClaimedEvent object at id ${id}: ${res.error.code}`);
    }
    if (res.data?.bcs?.dataType !== "moveObject" || !isRewardsClaimedEvent(res.data.bcs.type)) {
      throw new Error(`object at id ${id} is not a RewardsClaimedEvent object`);
    }

    return RewardsClaimedEvent.fromSuiObjectData(res.data);
  }
}

/* ============================== SwappedEvent =============================== */

export function isSwappedEvent(type: string): boolean {
  type = compressSuiType(type);
  return type === `${PKG_V1}::events::SwappedEvent`;
}

export interface SwappedEventFields {
  tokenFrom: ToField<String>;
  tokenTo: ToField<String>;
  sentAmount: ToField<"u64">;
  receivedAmount: ToField<"u64">;
  sender: ToField<"address">;
}

export type SwappedEventReified = Reified<SwappedEvent, SwappedEventFields>;

export class SwappedEvent implements StructClass {
  __StructClass = true as const;

  static get $typeName() {
    return `${PKG_V1}::events::SwappedEvent`;
  }
  static readonly $numTypeParams = 0;
  static readonly $isPhantom = [] as const;

  readonly $typeName = SwappedEvent.$typeName;
  readonly $fullTypeName: string;
  readonly $typeArgs: [];
  readonly $isPhantom = SwappedEvent.$isPhantom;

  readonly tokenFrom: ToField<String>;
  readonly tokenTo: ToField<String>;
  readonly sentAmount: ToField<"u64">;
  readonly receivedAmount: ToField<"u64">;
  readonly sender: ToField<"address">;

  private constructor(typeArgs: [], fields: SwappedEventFields) {
    this.$fullTypeName = composeSuiType(SwappedEvent.$typeName, ...typeArgs) as string;
    this.$typeArgs = typeArgs;

    this.tokenFrom = fields.tokenFrom;
    this.tokenTo = fields.tokenTo;
    this.sentAmount = fields.sentAmount;
    this.receivedAmount = fields.receivedAmount;
    this.sender = fields.sender;
  }

  static reified(): SwappedEventReified {
    return {
      typeName: SwappedEvent.$typeName,
      fullTypeName: composeSuiType(SwappedEvent.$typeName, ...[]) as string,
      typeArgs: [] as [],
      isPhantom: SwappedEvent.$isPhantom,
      reifiedTypeArgs: [],
      fromFields: (fields: Record<string, any>) => SwappedEvent.fromFields(fields),
      fromFieldsWithTypes: (item: FieldsWithTypes) => SwappedEvent.fromFieldsWithTypes(item),
      fromBcs: (data: Uint8Array) => SwappedEvent.fromBcs(data),
      bcs: SwappedEvent.bcs,
      fromJSONField: (field: any) => SwappedEvent.fromJSONField(field),
      fromJSON: (json: Record<string, any>) => SwappedEvent.fromJSON(json),
      fromSuiParsedData: (content: SuiParsedData) => SwappedEvent.fromSuiParsedData(content),
      fromSuiObjectData: (content: SuiObjectData) => SwappedEvent.fromSuiObjectData(content),
      fetch: async (client: SuiClient, id: string) => SwappedEvent.fetch(client, id),
      new: (fields: SwappedEventFields) => {
        return new SwappedEvent([], fields);
      },
      kind: "StructClassReified",
    };
  }

  static get r() {
    return SwappedEvent.reified();
  }

  static phantom(): PhantomReified<ToTypeStr<SwappedEvent>> {
    return phantom(SwappedEvent.reified());
  }
  static get p() {
    return SwappedEvent.phantom();
  }

  static get bcs() {
    return bcs.struct("SwappedEvent", {
      token_from: String.bcs,
      token_to: String.bcs,
      sent_amount: bcs.u64(),
      received_amount: bcs.u64(),
      sender: bcs.bytes(32).transform({
        input: (val: string) => fromHEX(val),
        output: (val: Uint8Array) => toHEX(val),
      }),
    });
  }

  static fromFields(fields: Record<string, any>): SwappedEvent {
    return SwappedEvent.reified().new({
      tokenFrom: decodeFromFields(String.reified(), fields.token_from),
      tokenTo: decodeFromFields(String.reified(), fields.token_to),
      sentAmount: decodeFromFields("u64", fields.sent_amount),
      receivedAmount: decodeFromFields("u64", fields.received_amount),
      sender: decodeFromFields("address", fields.sender),
    });
  }

  static fromFieldsWithTypes(item: FieldsWithTypes): SwappedEvent {
    if (!isSwappedEvent(item.type)) {
      throw new Error("not a SwappedEvent type");
    }

    return SwappedEvent.reified().new({
      tokenFrom: decodeFromFieldsWithTypes(String.reified(), item.fields.token_from),
      tokenTo: decodeFromFieldsWithTypes(String.reified(), item.fields.token_to),
      sentAmount: decodeFromFieldsWithTypes("u64", item.fields.sent_amount),
      receivedAmount: decodeFromFieldsWithTypes("u64", item.fields.received_amount),
      sender: decodeFromFieldsWithTypes("address", item.fields.sender),
    });
  }

  static fromBcs(data: Uint8Array): SwappedEvent {
    return SwappedEvent.fromFields(SwappedEvent.bcs.parse(data));
  }

  toJSONField() {
    return {
      tokenFrom: this.tokenFrom,
      tokenTo: this.tokenTo,
      sentAmount: this.sentAmount.toString(),
      receivedAmount: this.receivedAmount.toString(),
      sender: this.sender,
    };
  }

  toJSON() {
    return {
      $typeName: this.$typeName,
      $typeArgs: this.$typeArgs,
      ...this.toJSONField(),
    };
  }

  static fromJSONField(field: any): SwappedEvent {
    return SwappedEvent.reified().new({
      tokenFrom: decodeFromJSONField(String.reified(), field.tokenFrom),
      tokenTo: decodeFromJSONField(String.reified(), field.tokenTo),
      sentAmount: decodeFromJSONField("u64", field.sentAmount),
      receivedAmount: decodeFromJSONField("u64", field.receivedAmount),
      sender: decodeFromJSONField("address", field.sender),
    });
  }

  static fromJSON(json: Record<string, any>): SwappedEvent {
    if (json.$typeName !== SwappedEvent.$typeName) {
      throw new Error("not a WithTwoGenerics json object");
    }

    return SwappedEvent.fromJSONField(json);
  }

  static fromSuiParsedData(content: SuiParsedData): SwappedEvent {
    if (content.dataType !== "moveObject") {
      throw new Error("not an object");
    }
    if (!isSwappedEvent(content.type)) {
      throw new Error(`object at ${(content.fields as any).id} is not a SwappedEvent object`);
    }
    return SwappedEvent.fromFieldsWithTypes(content);
  }

  static fromSuiObjectData(data: SuiObjectData): SwappedEvent {
    if (data.bcs) {
      if (data.bcs.dataType !== "moveObject" || !isSwappedEvent(data.bcs.type)) {
        throw new Error(`object at is not a SwappedEvent object`);
      }

      return SwappedEvent.fromBcs(fromB64(data.bcs.bcsBytes));
    }
    if (data.content) {
      return SwappedEvent.fromSuiParsedData(data.content);
    }
    throw new Error(
      "Both `bcs` and `content` fields are missing from the data. Include `showBcs` or `showContent` in the request."
    );
  }

  static async fetch(client: SuiClient, id: string): Promise<SwappedEvent> {
    const res = await client.getObject({ id, options: { showBcs: true } });
    if (res.error) {
      throw new Error(`error fetching SwappedEvent object at id ${id}: ${res.error.code}`);
    }
    if (res.data?.bcs?.dataType !== "moveObject" || !isSwappedEvent(res.data.bcs.type)) {
      throw new Error(`object at id ${id} is not a SwappedEvent object`);
    }

    return SwappedEvent.fromSuiObjectData(res.data);
  }
}

/* ============================== SwappedFromVUsdEvent =============================== */

export function isSwappedFromVUsdEvent(type: string): boolean {
  type = compressSuiType(type);
  return type === `${PKG_V1}::events::SwappedFromVUsdEvent`;
}

export interface SwappedFromVUsdEventFields {
  token: ToField<String>;
  amount: ToField<"u64">;
  vusdAmount: ToField<"u64">;
  fee: ToField<"u64">;
}

export type SwappedFromVUsdEventReified = Reified<SwappedFromVUsdEvent, SwappedFromVUsdEventFields>;

export class SwappedFromVUsdEvent implements StructClass {
  __StructClass = true as const;

  static get $typeName() {
    return `${PKG_V1}::events::SwappedFromVUsdEvent`;
  }
  static readonly $numTypeParams = 0;
  static readonly $isPhantom = [] as const;

  readonly $typeName = SwappedFromVUsdEvent.$typeName;
  readonly $fullTypeName: string;
  readonly $typeArgs: [];
  readonly $isPhantom = SwappedFromVUsdEvent.$isPhantom;

  readonly token: ToField<String>;
  readonly amount: ToField<"u64">;
  readonly vusdAmount: ToField<"u64">;
  readonly fee: ToField<"u64">;

  private constructor(typeArgs: [], fields: SwappedFromVUsdEventFields) {
    this.$fullTypeName = composeSuiType(SwappedFromVUsdEvent.$typeName, ...typeArgs) as string;
    this.$typeArgs = typeArgs;

    this.token = fields.token;
    this.amount = fields.amount;
    this.vusdAmount = fields.vusdAmount;
    this.fee = fields.fee;
  }

  static reified(): SwappedFromVUsdEventReified {
    return {
      typeName: SwappedFromVUsdEvent.$typeName,
      fullTypeName: composeSuiType(SwappedFromVUsdEvent.$typeName, ...[]) as string,
      typeArgs: [] as [],
      isPhantom: SwappedFromVUsdEvent.$isPhantom,
      reifiedTypeArgs: [],
      fromFields: (fields: Record<string, any>) => SwappedFromVUsdEvent.fromFields(fields),
      fromFieldsWithTypes: (item: FieldsWithTypes) => SwappedFromVUsdEvent.fromFieldsWithTypes(item),
      fromBcs: (data: Uint8Array) => SwappedFromVUsdEvent.fromBcs(data),
      bcs: SwappedFromVUsdEvent.bcs,
      fromJSONField: (field: any) => SwappedFromVUsdEvent.fromJSONField(field),
      fromJSON: (json: Record<string, any>) => SwappedFromVUsdEvent.fromJSON(json),
      fromSuiParsedData: (content: SuiParsedData) => SwappedFromVUsdEvent.fromSuiParsedData(content),
      fromSuiObjectData: (content: SuiObjectData) => SwappedFromVUsdEvent.fromSuiObjectData(content),
      fetch: async (client: SuiClient, id: string) => SwappedFromVUsdEvent.fetch(client, id),
      new: (fields: SwappedFromVUsdEventFields) => {
        return new SwappedFromVUsdEvent([], fields);
      },
      kind: "StructClassReified",
    };
  }

  static get r() {
    return SwappedFromVUsdEvent.reified();
  }

  static phantom(): PhantomReified<ToTypeStr<SwappedFromVUsdEvent>> {
    return phantom(SwappedFromVUsdEvent.reified());
  }
  static get p() {
    return SwappedFromVUsdEvent.phantom();
  }

  static get bcs() {
    return bcs.struct("SwappedFromVUsdEvent", {
      token: String.bcs,
      amount: bcs.u64(),
      vusd_amount: bcs.u64(),
      fee: bcs.u64(),
    });
  }

  static fromFields(fields: Record<string, any>): SwappedFromVUsdEvent {
    return SwappedFromVUsdEvent.reified().new({
      token: decodeFromFields(String.reified(), fields.token),
      amount: decodeFromFields("u64", fields.amount),
      vusdAmount: decodeFromFields("u64", fields.vusd_amount),
      fee: decodeFromFields("u64", fields.fee),
    });
  }

  static fromFieldsWithTypes(item: FieldsWithTypes): SwappedFromVUsdEvent {
    if (!isSwappedFromVUsdEvent(item.type)) {
      throw new Error("not a SwappedFromVUsdEvent type");
    }

    return SwappedFromVUsdEvent.reified().new({
      token: decodeFromFieldsWithTypes(String.reified(), item.fields.token),
      amount: decodeFromFieldsWithTypes("u64", item.fields.amount),
      vusdAmount: decodeFromFieldsWithTypes("u64", item.fields.vusd_amount),
      fee: decodeFromFieldsWithTypes("u64", item.fields.fee),
    });
  }

  static fromBcs(data: Uint8Array): SwappedFromVUsdEvent {
    return SwappedFromVUsdEvent.fromFields(SwappedFromVUsdEvent.bcs.parse(data));
  }

  toJSONField() {
    return {
      token: this.token,
      amount: this.amount.toString(),
      vusdAmount: this.vusdAmount.toString(),
      fee: this.fee.toString(),
    };
  }

  toJSON() {
    return {
      $typeName: this.$typeName,
      $typeArgs: this.$typeArgs,
      ...this.toJSONField(),
    };
  }

  static fromJSONField(field: any): SwappedFromVUsdEvent {
    return SwappedFromVUsdEvent.reified().new({
      token: decodeFromJSONField(String.reified(), field.token),
      amount: decodeFromJSONField("u64", field.amount),
      vusdAmount: decodeFromJSONField("u64", field.vusdAmount),
      fee: decodeFromJSONField("u64", field.fee),
    });
  }

  static fromJSON(json: Record<string, any>): SwappedFromVUsdEvent {
    if (json.$typeName !== SwappedFromVUsdEvent.$typeName) {
      throw new Error("not a WithTwoGenerics json object");
    }

    return SwappedFromVUsdEvent.fromJSONField(json);
  }

  static fromSuiParsedData(content: SuiParsedData): SwappedFromVUsdEvent {
    if (content.dataType !== "moveObject") {
      throw new Error("not an object");
    }
    if (!isSwappedFromVUsdEvent(content.type)) {
      throw new Error(`object at ${(content.fields as any).id} is not a SwappedFromVUsdEvent object`);
    }
    return SwappedFromVUsdEvent.fromFieldsWithTypes(content);
  }

  static fromSuiObjectData(data: SuiObjectData): SwappedFromVUsdEvent {
    if (data.bcs) {
      if (data.bcs.dataType !== "moveObject" || !isSwappedFromVUsdEvent(data.bcs.type)) {
        throw new Error(`object at is not a SwappedFromVUsdEvent object`);
      }

      return SwappedFromVUsdEvent.fromBcs(fromB64(data.bcs.bcsBytes));
    }
    if (data.content) {
      return SwappedFromVUsdEvent.fromSuiParsedData(data.content);
    }
    throw new Error(
      "Both `bcs` and `content` fields are missing from the data. Include `showBcs` or `showContent` in the request."
    );
  }

  static async fetch(client: SuiClient, id: string): Promise<SwappedFromVUsdEvent> {
    const res = await client.getObject({ id, options: { showBcs: true } });
    if (res.error) {
      throw new Error(`error fetching SwappedFromVUsdEvent object at id ${id}: ${res.error.code}`);
    }
    if (res.data?.bcs?.dataType !== "moveObject" || !isSwappedFromVUsdEvent(res.data.bcs.type)) {
      throw new Error(`object at id ${id} is not a SwappedFromVUsdEvent object`);
    }

    return SwappedFromVUsdEvent.fromSuiObjectData(res.data);
  }
}

/* ============================== SwappedToVUsdEvent =============================== */

export function isSwappedToVUsdEvent(type: string): boolean {
  type = compressSuiType(type);
  return type === `${PKG_V1}::events::SwappedToVUsdEvent`;
}

export interface SwappedToVUsdEventFields {
  token: ToField<String>;
  amount: ToField<"u64">;
  vusdAmount: ToField<"u64">;
  fee: ToField<"u64">;
}

export type SwappedToVUsdEventReified = Reified<SwappedToVUsdEvent, SwappedToVUsdEventFields>;

export class SwappedToVUsdEvent implements StructClass {
  __StructClass = true as const;

  static get $typeName() {
    return `${PKG_V1}::events::SwappedToVUsdEvent`;
  }
  static readonly $numTypeParams = 0;
  static readonly $isPhantom = [] as const;

  readonly $typeName = SwappedToVUsdEvent.$typeName;
  readonly $fullTypeName: string;
  readonly $typeArgs: [];
  readonly $isPhantom = SwappedToVUsdEvent.$isPhantom;

  readonly token: ToField<String>;
  readonly amount: ToField<"u64">;
  readonly vusdAmount: ToField<"u64">;
  readonly fee: ToField<"u64">;

  private constructor(typeArgs: [], fields: SwappedToVUsdEventFields) {
    this.$fullTypeName = composeSuiType(SwappedToVUsdEvent.$typeName, ...typeArgs) as string;
    this.$typeArgs = typeArgs;

    this.token = fields.token;
    this.amount = fields.amount;
    this.vusdAmount = fields.vusdAmount;
    this.fee = fields.fee;
  }

  static reified(): SwappedToVUsdEventReified {
    return {
      typeName: SwappedToVUsdEvent.$typeName,
      fullTypeName: composeSuiType(SwappedToVUsdEvent.$typeName, ...[]) as string,
      typeArgs: [] as [],
      isPhantom: SwappedToVUsdEvent.$isPhantom,
      reifiedTypeArgs: [],
      fromFields: (fields: Record<string, any>) => SwappedToVUsdEvent.fromFields(fields),
      fromFieldsWithTypes: (item: FieldsWithTypes) => SwappedToVUsdEvent.fromFieldsWithTypes(item),
      fromBcs: (data: Uint8Array) => SwappedToVUsdEvent.fromBcs(data),
      bcs: SwappedToVUsdEvent.bcs,
      fromJSONField: (field: any) => SwappedToVUsdEvent.fromJSONField(field),
      fromJSON: (json: Record<string, any>) => SwappedToVUsdEvent.fromJSON(json),
      fromSuiParsedData: (content: SuiParsedData) => SwappedToVUsdEvent.fromSuiParsedData(content),
      fromSuiObjectData: (content: SuiObjectData) => SwappedToVUsdEvent.fromSuiObjectData(content),
      fetch: async (client: SuiClient, id: string) => SwappedToVUsdEvent.fetch(client, id),
      new: (fields: SwappedToVUsdEventFields) => {
        return new SwappedToVUsdEvent([], fields);
      },
      kind: "StructClassReified",
    };
  }

  static get r() {
    return SwappedToVUsdEvent.reified();
  }

  static phantom(): PhantomReified<ToTypeStr<SwappedToVUsdEvent>> {
    return phantom(SwappedToVUsdEvent.reified());
  }
  static get p() {
    return SwappedToVUsdEvent.phantom();
  }

  static get bcs() {
    return bcs.struct("SwappedToVUsdEvent", {
      token: String.bcs,
      amount: bcs.u64(),
      vusd_amount: bcs.u64(),
      fee: bcs.u64(),
    });
  }

  static fromFields(fields: Record<string, any>): SwappedToVUsdEvent {
    return SwappedToVUsdEvent.reified().new({
      token: decodeFromFields(String.reified(), fields.token),
      amount: decodeFromFields("u64", fields.amount),
      vusdAmount: decodeFromFields("u64", fields.vusd_amount),
      fee: decodeFromFields("u64", fields.fee),
    });
  }

  static fromFieldsWithTypes(item: FieldsWithTypes): SwappedToVUsdEvent {
    if (!isSwappedToVUsdEvent(item.type)) {
      throw new Error("not a SwappedToVUsdEvent type");
    }

    return SwappedToVUsdEvent.reified().new({
      token: decodeFromFieldsWithTypes(String.reified(), item.fields.token),
      amount: decodeFromFieldsWithTypes("u64", item.fields.amount),
      vusdAmount: decodeFromFieldsWithTypes("u64", item.fields.vusd_amount),
      fee: decodeFromFieldsWithTypes("u64", item.fields.fee),
    });
  }

  static fromBcs(data: Uint8Array): SwappedToVUsdEvent {
    return SwappedToVUsdEvent.fromFields(SwappedToVUsdEvent.bcs.parse(data));
  }

  toJSONField() {
    return {
      token: this.token,
      amount: this.amount.toString(),
      vusdAmount: this.vusdAmount.toString(),
      fee: this.fee.toString(),
    };
  }

  toJSON() {
    return {
      $typeName: this.$typeName,
      $typeArgs: this.$typeArgs,
      ...this.toJSONField(),
    };
  }

  static fromJSONField(field: any): SwappedToVUsdEvent {
    return SwappedToVUsdEvent.reified().new({
      token: decodeFromJSONField(String.reified(), field.token),
      amount: decodeFromJSONField("u64", field.amount),
      vusdAmount: decodeFromJSONField("u64", field.vusdAmount),
      fee: decodeFromJSONField("u64", field.fee),
    });
  }

  static fromJSON(json: Record<string, any>): SwappedToVUsdEvent {
    if (json.$typeName !== SwappedToVUsdEvent.$typeName) {
      throw new Error("not a WithTwoGenerics json object");
    }

    return SwappedToVUsdEvent.fromJSONField(json);
  }

  static fromSuiParsedData(content: SuiParsedData): SwappedToVUsdEvent {
    if (content.dataType !== "moveObject") {
      throw new Error("not an object");
    }
    if (!isSwappedToVUsdEvent(content.type)) {
      throw new Error(`object at ${(content.fields as any).id} is not a SwappedToVUsdEvent object`);
    }
    return SwappedToVUsdEvent.fromFieldsWithTypes(content);
  }

  static fromSuiObjectData(data: SuiObjectData): SwappedToVUsdEvent {
    if (data.bcs) {
      if (data.bcs.dataType !== "moveObject" || !isSwappedToVUsdEvent(data.bcs.type)) {
        throw new Error(`object at is not a SwappedToVUsdEvent object`);
      }

      return SwappedToVUsdEvent.fromBcs(fromB64(data.bcs.bcsBytes));
    }
    if (data.content) {
      return SwappedToVUsdEvent.fromSuiParsedData(data.content);
    }
    throw new Error(
      "Both `bcs` and `content` fields are missing from the data. Include `showBcs` or `showContent` in the request."
    );
  }

  static async fetch(client: SuiClient, id: string): Promise<SwappedToVUsdEvent> {
    const res = await client.getObject({ id, options: { showBcs: true } });
    if (res.error) {
      throw new Error(`error fetching SwappedToVUsdEvent object at id ${id}: ${res.error.code}`);
    }
    if (res.data?.bcs?.dataType !== "moveObject" || !isSwappedToVUsdEvent(res.data.bcs.type)) {
      throw new Error(`object at id ${id} is not a SwappedToVUsdEvent object`);
    }

    return SwappedToVUsdEvent.fromSuiObjectData(res.data);
  }
}

/* ============================== TokensReceivedEvent =============================== */

export function isTokensReceivedEvent(type: string): boolean {
  type = compressSuiType(type);
  return type === `${PKG_V1}::events::TokensReceivedEvent`;
}

export interface TokensReceivedEventFields {
  token: ToField<String>;
  amount: ToField<"u64">;
  extraGasAmount: ToField<"u64">;
  recipient: ToField<"address">;
  nonce: ToField<"u256">;
  messenger: ToField<"u8">;
  message: ToField<String>;
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
  readonly amount: ToField<"u64">;
  readonly extraGasAmount: ToField<"u64">;
  readonly recipient: ToField<"address">;
  readonly nonce: ToField<"u256">;
  readonly messenger: ToField<"u8">;
  readonly message: ToField<String>;

  private constructor(typeArgs: [], fields: TokensReceivedEventFields) {
    this.$fullTypeName = composeSuiType(TokensReceivedEvent.$typeName, ...typeArgs) as string;
    this.$typeArgs = typeArgs;

    this.token = fields.token;
    this.amount = fields.amount;
    this.extraGasAmount = fields.extraGasAmount;
    this.recipient = fields.recipient;
    this.nonce = fields.nonce;
    this.messenger = fields.messenger;
    this.message = fields.message;
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
      amount: bcs.u64(),
      extra_gas_amount: bcs.u64(),
      recipient: bcs.bytes(32).transform({
        input: (val: string) => fromHEX(val),
        output: (val: Uint8Array) => toHEX(val),
      }),
      nonce: bcs.u256(),
      messenger: bcs.u8(),
      message: String.bcs,
    });
  }

  static fromFields(fields: Record<string, any>): TokensReceivedEvent {
    return TokensReceivedEvent.reified().new({
      token: decodeFromFields(String.reified(), fields.token),
      amount: decodeFromFields("u64", fields.amount),
      extraGasAmount: decodeFromFields("u64", fields.extra_gas_amount),
      recipient: decodeFromFields("address", fields.recipient),
      nonce: decodeFromFields("u256", fields.nonce),
      messenger: decodeFromFields("u8", fields.messenger),
      message: decodeFromFields(String.reified(), fields.message),
    });
  }

  static fromFieldsWithTypes(item: FieldsWithTypes): TokensReceivedEvent {
    if (!isTokensReceivedEvent(item.type)) {
      throw new Error("not a TokensReceivedEvent type");
    }

    return TokensReceivedEvent.reified().new({
      token: decodeFromFieldsWithTypes(String.reified(), item.fields.token),
      amount: decodeFromFieldsWithTypes("u64", item.fields.amount),
      extraGasAmount: decodeFromFieldsWithTypes("u64", item.fields.extra_gas_amount),
      recipient: decodeFromFieldsWithTypes("address", item.fields.recipient),
      nonce: decodeFromFieldsWithTypes("u256", item.fields.nonce),
      messenger: decodeFromFieldsWithTypes("u8", item.fields.messenger),
      message: decodeFromFieldsWithTypes(String.reified(), item.fields.message),
    });
  }

  static fromBcs(data: Uint8Array): TokensReceivedEvent {
    return TokensReceivedEvent.fromFields(TokensReceivedEvent.bcs.parse(data));
  }

  toJSONField() {
    return {
      token: this.token,
      amount: this.amount.toString(),
      extraGasAmount: this.extraGasAmount.toString(),
      recipient: this.recipient,
      nonce: this.nonce.toString(),
      messenger: this.messenger,
      message: this.message,
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
      amount: decodeFromJSONField("u64", field.amount),
      extraGasAmount: decodeFromJSONField("u64", field.extraGasAmount),
      recipient: decodeFromJSONField("address", field.recipient),
      nonce: decodeFromJSONField("u256", field.nonce),
      messenger: decodeFromJSONField("u8", field.messenger),
      message: decodeFromJSONField(String.reified(), field.message),
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
  vusdAmount: ToField<"u64">;
  sender: ToField<"address">;
  recipient: ToField<String>;
  destinationChainId: ToField<"u8">;
  receiveToken: ToField<String>;
  nonce: ToField<"u256">;
  messenger: ToField<"u8">;
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
  readonly vusdAmount: ToField<"u64">;
  readonly sender: ToField<"address">;
  readonly recipient: ToField<String>;
  readonly destinationChainId: ToField<"u8">;
  readonly receiveToken: ToField<String>;
  readonly nonce: ToField<"u256">;
  readonly messenger: ToField<"u8">;

  private constructor(typeArgs: [], fields: TokensSentEventFields) {
    this.$fullTypeName = composeSuiType(TokensSentEvent.$typeName, ...typeArgs) as string;
    this.$typeArgs = typeArgs;

    this.token = fields.token;
    this.vusdAmount = fields.vusdAmount;
    this.sender = fields.sender;
    this.recipient = fields.recipient;
    this.destinationChainId = fields.destinationChainId;
    this.receiveToken = fields.receiveToken;
    this.nonce = fields.nonce;
    this.messenger = fields.messenger;
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
      vusd_amount: bcs.u64(),
      sender: bcs.bytes(32).transform({
        input: (val: string) => fromHEX(val),
        output: (val: Uint8Array) => toHEX(val),
      }),
      recipient: String.bcs,
      destination_chain_id: bcs.u8(),
      receive_token: String.bcs,
      nonce: bcs.u256(),
      messenger: bcs.u8(),
    });
  }

  static fromFields(fields: Record<string, any>): TokensSentEvent {
    return TokensSentEvent.reified().new({
      token: decodeFromFields(String.reified(), fields.token),
      vusdAmount: decodeFromFields("u64", fields.vusd_amount),
      sender: decodeFromFields("address", fields.sender),
      recipient: decodeFromFields(String.reified(), fields.recipient),
      destinationChainId: decodeFromFields("u8", fields.destination_chain_id),
      receiveToken: decodeFromFields(String.reified(), fields.receive_token),
      nonce: decodeFromFields("u256", fields.nonce),
      messenger: decodeFromFields("u8", fields.messenger),
    });
  }

  static fromFieldsWithTypes(item: FieldsWithTypes): TokensSentEvent {
    if (!isTokensSentEvent(item.type)) {
      throw new Error("not a TokensSentEvent type");
    }

    return TokensSentEvent.reified().new({
      token: decodeFromFieldsWithTypes(String.reified(), item.fields.token),
      vusdAmount: decodeFromFieldsWithTypes("u64", item.fields.vusd_amount),
      sender: decodeFromFieldsWithTypes("address", item.fields.sender),
      recipient: decodeFromFieldsWithTypes(String.reified(), item.fields.recipient),
      destinationChainId: decodeFromFieldsWithTypes("u8", item.fields.destination_chain_id),
      receiveToken: decodeFromFieldsWithTypes(String.reified(), item.fields.receive_token),
      nonce: decodeFromFieldsWithTypes("u256", item.fields.nonce),
      messenger: decodeFromFieldsWithTypes("u8", item.fields.messenger),
    });
  }

  static fromBcs(data: Uint8Array): TokensSentEvent {
    return TokensSentEvent.fromFields(TokensSentEvent.bcs.parse(data));
  }

  toJSONField() {
    return {
      token: this.token,
      vusdAmount: this.vusdAmount.toString(),
      sender: this.sender,
      recipient: this.recipient,
      destinationChainId: this.destinationChainId,
      receiveToken: this.receiveToken,
      nonce: this.nonce.toString(),
      messenger: this.messenger,
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
      vusdAmount: decodeFromJSONField("u64", field.vusdAmount),
      sender: decodeFromJSONField("address", field.sender),
      recipient: decodeFromJSONField(String.reified(), field.recipient),
      destinationChainId: decodeFromJSONField("u8", field.destinationChainId),
      receiveToken: decodeFromJSONField(String.reified(), field.receiveToken),
      nonce: decodeFromJSONField("u256", field.nonce),
      messenger: decodeFromJSONField("u8", field.messenger),
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

/* ============================== WithdrawEvent =============================== */

export function isWithdrawEvent(type: string): boolean {
  type = compressSuiType(type);
  return type === `${PKG_V1}::events::WithdrawEvent`;
}

export interface WithdrawEventFields {
  token: ToField<String>;
  amount: ToField<"u64">;
  lpAmount: ToField<"u64">;
}

export type WithdrawEventReified = Reified<WithdrawEvent, WithdrawEventFields>;

export class WithdrawEvent implements StructClass {
  __StructClass = true as const;

  static get $typeName() {
    return `${PKG_V1}::events::WithdrawEvent`;
  }
  static readonly $numTypeParams = 0;
  static readonly $isPhantom = [] as const;

  readonly $typeName = WithdrawEvent.$typeName;
  readonly $fullTypeName: string;
  readonly $typeArgs: [];
  readonly $isPhantom = WithdrawEvent.$isPhantom;

  readonly token: ToField<String>;
  readonly amount: ToField<"u64">;
  readonly lpAmount: ToField<"u64">;

  private constructor(typeArgs: [], fields: WithdrawEventFields) {
    this.$fullTypeName = composeSuiType(WithdrawEvent.$typeName, ...typeArgs) as string;
    this.$typeArgs = typeArgs;

    this.token = fields.token;
    this.amount = fields.amount;
    this.lpAmount = fields.lpAmount;
  }

  static reified(): WithdrawEventReified {
    return {
      typeName: WithdrawEvent.$typeName,
      fullTypeName: composeSuiType(WithdrawEvent.$typeName, ...[]) as string,
      typeArgs: [] as [],
      isPhantom: WithdrawEvent.$isPhantom,
      reifiedTypeArgs: [],
      fromFields: (fields: Record<string, any>) => WithdrawEvent.fromFields(fields),
      fromFieldsWithTypes: (item: FieldsWithTypes) => WithdrawEvent.fromFieldsWithTypes(item),
      fromBcs: (data: Uint8Array) => WithdrawEvent.fromBcs(data),
      bcs: WithdrawEvent.bcs,
      fromJSONField: (field: any) => WithdrawEvent.fromJSONField(field),
      fromJSON: (json: Record<string, any>) => WithdrawEvent.fromJSON(json),
      fromSuiParsedData: (content: SuiParsedData) => WithdrawEvent.fromSuiParsedData(content),
      fromSuiObjectData: (content: SuiObjectData) => WithdrawEvent.fromSuiObjectData(content),
      fetch: async (client: SuiClient, id: string) => WithdrawEvent.fetch(client, id),
      new: (fields: WithdrawEventFields) => {
        return new WithdrawEvent([], fields);
      },
      kind: "StructClassReified",
    };
  }

  static get r() {
    return WithdrawEvent.reified();
  }

  static phantom(): PhantomReified<ToTypeStr<WithdrawEvent>> {
    return phantom(WithdrawEvent.reified());
  }
  static get p() {
    return WithdrawEvent.phantom();
  }

  static get bcs() {
    return bcs.struct("WithdrawEvent", {
      token: String.bcs,
      amount: bcs.u64(),
      lp_amount: bcs.u64(),
    });
  }

  static fromFields(fields: Record<string, any>): WithdrawEvent {
    return WithdrawEvent.reified().new({
      token: decodeFromFields(String.reified(), fields.token),
      amount: decodeFromFields("u64", fields.amount),
      lpAmount: decodeFromFields("u64", fields.lp_amount),
    });
  }

  static fromFieldsWithTypes(item: FieldsWithTypes): WithdrawEvent {
    if (!isWithdrawEvent(item.type)) {
      throw new Error("not a WithdrawEvent type");
    }

    return WithdrawEvent.reified().new({
      token: decodeFromFieldsWithTypes(String.reified(), item.fields.token),
      amount: decodeFromFieldsWithTypes("u64", item.fields.amount),
      lpAmount: decodeFromFieldsWithTypes("u64", item.fields.lp_amount),
    });
  }

  static fromBcs(data: Uint8Array): WithdrawEvent {
    return WithdrawEvent.fromFields(WithdrawEvent.bcs.parse(data));
  }

  toJSONField() {
    return {
      token: this.token,
      amount: this.amount.toString(),
      lpAmount: this.lpAmount.toString(),
    };
  }

  toJSON() {
    return {
      $typeName: this.$typeName,
      $typeArgs: this.$typeArgs,
      ...this.toJSONField(),
    };
  }

  static fromJSONField(field: any): WithdrawEvent {
    return WithdrawEvent.reified().new({
      token: decodeFromJSONField(String.reified(), field.token),
      amount: decodeFromJSONField("u64", field.amount),
      lpAmount: decodeFromJSONField("u64", field.lpAmount),
    });
  }

  static fromJSON(json: Record<string, any>): WithdrawEvent {
    if (json.$typeName !== WithdrawEvent.$typeName) {
      throw new Error("not a WithTwoGenerics json object");
    }

    return WithdrawEvent.fromJSONField(json);
  }

  static fromSuiParsedData(content: SuiParsedData): WithdrawEvent {
    if (content.dataType !== "moveObject") {
      throw new Error("not an object");
    }
    if (!isWithdrawEvent(content.type)) {
      throw new Error(`object at ${(content.fields as any).id} is not a WithdrawEvent object`);
    }
    return WithdrawEvent.fromFieldsWithTypes(content);
  }

  static fromSuiObjectData(data: SuiObjectData): WithdrawEvent {
    if (data.bcs) {
      if (data.bcs.dataType !== "moveObject" || !isWithdrawEvent(data.bcs.type)) {
        throw new Error(`object at is not a WithdrawEvent object`);
      }

      return WithdrawEvent.fromBcs(fromB64(data.bcs.bcsBytes));
    }
    if (data.content) {
      return WithdrawEvent.fromSuiParsedData(data.content);
    }
    throw new Error(
      "Both `bcs` and `content` fields are missing from the data. Include `showBcs` or `showContent` in the request."
    );
  }

  static async fetch(client: SuiClient, id: string): Promise<WithdrawEvent> {
    const res = await client.getObject({ id, options: { showBcs: true } });
    if (res.error) {
      throw new Error(`error fetching WithdrawEvent object at id ${id}: ${res.error.code}`);
    }
    if (res.data?.bcs?.dataType !== "moveObject" || !isWithdrawEvent(res.data.bcs.type)) {
      throw new Error(`object at id ${id} is not a WithdrawEvent object`);
    }

    return WithdrawEvent.fromSuiObjectData(res.data);
  }
}
