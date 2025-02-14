// @ts-nocheck
import * as reified from "../../_framework/reified";
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
  ToTypeStr as ToPhantom,
} from "../../_framework/reified";
import { FieldsWithTypes, composeSuiType, compressSuiType } from "../../_framework/util";
import { ObjectBag } from "../../sui/object-bag/structs";
import { UID } from "../../sui/object/structs";
import { Table } from "../../sui/table/structs";
import { FeeCollector } from "../../utils/fee-collector/structs";
import { Message } from "../../utils/message/structs";
import { Set } from "../../utils/set/structs";
import { AnotherBridge } from "../another-bridge/structs";
import { PKG_V1 } from "../index";
import { bcs } from "@mysten/sui/bcs";
import { SuiClient, SuiObjectData, SuiParsedData } from "@mysten/sui/client";
import { fromB64, fromHEX, toHEX } from "@mysten/sui/utils";

/* ============================== AdminCap =============================== */

export function isAdminCap(type: string): boolean {
  type = compressSuiType(type);
  return type === `${PKG_V1}::bridge::AdminCap`;
}

export interface AdminCapFields {
  id: ToField<UID>;
}

export type AdminCapReified = Reified<AdminCap, AdminCapFields>;

export class AdminCap implements StructClass {
  __StructClass = true as const;

  static get $typeName() {
    return `${PKG_V1}::bridge::AdminCap`;
  }
  static readonly $numTypeParams = 0;
  static readonly $isPhantom = [] as const;

  readonly $typeName = AdminCap.$typeName;
  readonly $fullTypeName: string;
  readonly $typeArgs: [];
  readonly $isPhantom = AdminCap.$isPhantom;

  readonly id: ToField<UID>;

  private constructor(typeArgs: [], fields: AdminCapFields) {
    this.$fullTypeName = composeSuiType(AdminCap.$typeName, ...typeArgs) as string;
    this.$typeArgs = typeArgs;

    this.id = fields.id;
  }

  static reified(): AdminCapReified {
    return {
      typeName: AdminCap.$typeName,
      fullTypeName: composeSuiType(AdminCap.$typeName, ...[]) as string,
      typeArgs: [] as [],
      isPhantom: AdminCap.$isPhantom,
      reifiedTypeArgs: [],
      fromFields: (fields: Record<string, any>) => AdminCap.fromFields(fields),
      fromFieldsWithTypes: (item: FieldsWithTypes) => AdminCap.fromFieldsWithTypes(item),
      fromBcs: (data: Uint8Array) => AdminCap.fromBcs(data),
      bcs: AdminCap.bcs,
      fromJSONField: (field: any) => AdminCap.fromJSONField(field),
      fromJSON: (json: Record<string, any>) => AdminCap.fromJSON(json),
      fromSuiParsedData: (content: SuiParsedData) => AdminCap.fromSuiParsedData(content),
      fromSuiObjectData: (content: SuiObjectData) => AdminCap.fromSuiObjectData(content),
      fetch: async (client: SuiClient, id: string) => AdminCap.fetch(client, id),
      new: (fields: AdminCapFields) => {
        return new AdminCap([], fields);
      },
      kind: "StructClassReified",
    };
  }

  static get r() {
    return AdminCap.reified();
  }

  static phantom(): PhantomReified<ToTypeStr<AdminCap>> {
    return phantom(AdminCap.reified());
  }
  static get p() {
    return AdminCap.phantom();
  }

  static get bcs() {
    return bcs.struct("AdminCap", {
      id: UID.bcs,
    });
  }

  static fromFields(fields: Record<string, any>): AdminCap {
    return AdminCap.reified().new({
      id: decodeFromFields(UID.reified(), fields.id),
    });
  }

  static fromFieldsWithTypes(item: FieldsWithTypes): AdminCap {
    if (!isAdminCap(item.type)) {
      throw new Error("not a AdminCap type");
    }

    return AdminCap.reified().new({
      id: decodeFromFieldsWithTypes(UID.reified(), item.fields.id),
    });
  }

  static fromBcs(data: Uint8Array): AdminCap {
    return AdminCap.fromFields(AdminCap.bcs.parse(data));
  }

  toJSONField() {
    return {
      id: this.id,
    };
  }

  toJSON() {
    return {
      $typeName: this.$typeName,
      $typeArgs: this.$typeArgs,
      ...this.toJSONField(),
    };
  }

  static fromJSONField(field: any): AdminCap {
    return AdminCap.reified().new({
      id: decodeFromJSONField(UID.reified(), field.id),
    });
  }

  static fromJSON(json: Record<string, any>): AdminCap {
    if (json.$typeName !== AdminCap.$typeName) {
      throw new Error("not a WithTwoGenerics json object");
    }

    return AdminCap.fromJSONField(json);
  }

  static fromSuiParsedData(content: SuiParsedData): AdminCap {
    if (content.dataType !== "moveObject") {
      throw new Error("not an object");
    }
    if (!isAdminCap(content.type)) {
      throw new Error(`object at ${(content.fields as any).id} is not a AdminCap object`);
    }
    return AdminCap.fromFieldsWithTypes(content);
  }

  static fromSuiObjectData(data: SuiObjectData): AdminCap {
    if (data.bcs) {
      if (data.bcs.dataType !== "moveObject" || !isAdminCap(data.bcs.type)) {
        throw new Error(`object at is not a AdminCap object`);
      }

      return AdminCap.fromBcs(fromB64(data.bcs.bcsBytes));
    }
    if (data.content) {
      return AdminCap.fromSuiParsedData(data.content);
    }
    throw new Error(
      "Both `bcs` and `content` fields are missing from the data. Include `showBcs` or `showContent` in the request."
    );
  }

  static async fetch(client: SuiClient, id: string): Promise<AdminCap> {
    const res = await client.getObject({ id, options: { showBcs: true } });
    if (res.error) {
      throw new Error(`error fetching AdminCap object at id ${id}: ${res.error.code}`);
    }
    if (res.data?.bcs?.dataType !== "moveObject" || !isAdminCap(res.data.bcs.type)) {
      throw new Error(`object at id ${id} is not a AdminCap object`);
    }

    return AdminCap.fromSuiObjectData(res.data);
  }
}

/* ============================== Bridge =============================== */

export function isBridge(type: string): boolean {
  type = compressSuiType(type);
  return type === `${PKG_V1}::bridge::Bridge`;
}

export interface BridgeFields {
  id: ToField<UID>;
  pools: ToField<ObjectBag>;
  otherBridges: ToField<Table<"u8", ToPhantom<AnotherBridge>>>;
  processedMessages: ToField<Set<ToPhantom<Message>>>;
  sentMessages: ToField<Set<ToPhantom<Message>>>;
  feeCollector: ToField<FeeCollector<ToPhantom<FeeCollectorCap>>>;
  feeCollectorCap: ToField<FeeCollectorCap>;
  rebalancer: ToField<"address">;
  canSwap: ToField<"bool">;
}

export type BridgeReified = Reified<Bridge, BridgeFields>;

export class Bridge implements StructClass {
  __StructClass = true as const;

  static get $typeName() {
    return `${PKG_V1}::bridge::Bridge`;
  }
  static readonly $numTypeParams = 0;
  static readonly $isPhantom = [] as const;

  readonly $typeName = Bridge.$typeName;
  readonly $fullTypeName: string;
  readonly $typeArgs: [];
  readonly $isPhantom = Bridge.$isPhantom;

  readonly id: ToField<UID>;
  readonly pools: ToField<ObjectBag>;
  readonly otherBridges: ToField<Table<"u8", ToPhantom<AnotherBridge>>>;
  readonly processedMessages: ToField<Set<ToPhantom<Message>>>;
  readonly sentMessages: ToField<Set<ToPhantom<Message>>>;
  readonly feeCollector: ToField<FeeCollector<ToPhantom<FeeCollectorCap>>>;
  readonly feeCollectorCap: ToField<FeeCollectorCap>;
  readonly rebalancer: ToField<"address">;
  readonly canSwap: ToField<"bool">;

  private constructor(typeArgs: [], fields: BridgeFields) {
    this.$fullTypeName = composeSuiType(Bridge.$typeName, ...typeArgs) as string;
    this.$typeArgs = typeArgs;

    this.id = fields.id;
    this.pools = fields.pools;
    this.otherBridges = fields.otherBridges;
    this.processedMessages = fields.processedMessages;
    this.sentMessages = fields.sentMessages;
    this.feeCollector = fields.feeCollector;
    this.feeCollectorCap = fields.feeCollectorCap;
    this.rebalancer = fields.rebalancer;
    this.canSwap = fields.canSwap;
  }

  static reified(): BridgeReified {
    return {
      typeName: Bridge.$typeName,
      fullTypeName: composeSuiType(Bridge.$typeName, ...[]) as string,
      typeArgs: [] as [],
      isPhantom: Bridge.$isPhantom,
      reifiedTypeArgs: [],
      fromFields: (fields: Record<string, any>) => Bridge.fromFields(fields),
      fromFieldsWithTypes: (item: FieldsWithTypes) => Bridge.fromFieldsWithTypes(item),
      fromBcs: (data: Uint8Array) => Bridge.fromBcs(data),
      bcs: Bridge.bcs,
      fromJSONField: (field: any) => Bridge.fromJSONField(field),
      fromJSON: (json: Record<string, any>) => Bridge.fromJSON(json),
      fromSuiParsedData: (content: SuiParsedData) => Bridge.fromSuiParsedData(content),
      fromSuiObjectData: (content: SuiObjectData) => Bridge.fromSuiObjectData(content),
      fetch: async (client: SuiClient, id: string) => Bridge.fetch(client, id),
      new: (fields: BridgeFields) => {
        return new Bridge([], fields);
      },
      kind: "StructClassReified",
    };
  }

  static get r() {
    return Bridge.reified();
  }

  static phantom(): PhantomReified<ToTypeStr<Bridge>> {
    return phantom(Bridge.reified());
  }
  static get p() {
    return Bridge.phantom();
  }

  static get bcs() {
    return bcs.struct("Bridge", {
      id: UID.bcs,
      pools: ObjectBag.bcs,
      other_bridges: Table.bcs,
      processed_messages: Set.bcs,
      sent_messages: Set.bcs,
      fee_collector: FeeCollector.bcs,
      fee_collector_cap: FeeCollectorCap.bcs,
      rebalancer: bcs.bytes(32).transform({
        input: (val: string) => fromHEX(val),
        output: (val: Uint8Array) => toHEX(val),
      }),
      can_swap: bcs.bool(),
    });
  }

  static fromFields(fields: Record<string, any>): Bridge {
    return Bridge.reified().new({
      id: decodeFromFields(UID.reified(), fields.id),
      pools: decodeFromFields(ObjectBag.reified(), fields.pools),
      otherBridges: decodeFromFields(
        Table.reified(reified.phantom("u8"), reified.phantom(AnotherBridge.reified())),
        fields.other_bridges
      ),
      processedMessages: decodeFromFields(Set.reified(reified.phantom(Message.reified())), fields.processed_messages),
      sentMessages: decodeFromFields(Set.reified(reified.phantom(Message.reified())), fields.sent_messages),
      feeCollector: decodeFromFields(
        FeeCollector.reified(reified.phantom(FeeCollectorCap.reified())),
        fields.fee_collector
      ),
      feeCollectorCap: decodeFromFields(FeeCollectorCap.reified(), fields.fee_collector_cap),
      rebalancer: decodeFromFields("address", fields.rebalancer),
      canSwap: decodeFromFields("bool", fields.can_swap),
    });
  }

  static fromFieldsWithTypes(item: FieldsWithTypes): Bridge {
    if (!isBridge(item.type)) {
      throw new Error("not a Bridge type");
    }

    return Bridge.reified().new({
      id: decodeFromFieldsWithTypes(UID.reified(), item.fields.id),
      pools: decodeFromFieldsWithTypes(ObjectBag.reified(), item.fields.pools),
      otherBridges: decodeFromFieldsWithTypes(
        Table.reified(reified.phantom("u8"), reified.phantom(AnotherBridge.reified())),
        item.fields.other_bridges
      ),
      processedMessages: decodeFromFieldsWithTypes(
        Set.reified(reified.phantom(Message.reified())),
        item.fields.processed_messages
      ),
      sentMessages: decodeFromFieldsWithTypes(
        Set.reified(reified.phantom(Message.reified())),
        item.fields.sent_messages
      ),
      feeCollector: decodeFromFieldsWithTypes(
        FeeCollector.reified(reified.phantom(FeeCollectorCap.reified())),
        item.fields.fee_collector
      ),
      feeCollectorCap: decodeFromFieldsWithTypes(FeeCollectorCap.reified(), item.fields.fee_collector_cap),
      rebalancer: decodeFromFieldsWithTypes("address", item.fields.rebalancer),
      canSwap: decodeFromFieldsWithTypes("bool", item.fields.can_swap),
    });
  }

  static fromBcs(data: Uint8Array): Bridge {
    return Bridge.fromFields(Bridge.bcs.parse(data));
  }

  toJSONField() {
    return {
      id: this.id,
      pools: this.pools.toJSONField(),
      otherBridges: this.otherBridges.toJSONField(),
      processedMessages: this.processedMessages.toJSONField(),
      sentMessages: this.sentMessages.toJSONField(),
      feeCollector: this.feeCollector.toJSONField(),
      feeCollectorCap: this.feeCollectorCap.toJSONField(),
      rebalancer: this.rebalancer,
      canSwap: this.canSwap,
    };
  }

  toJSON() {
    return {
      $typeName: this.$typeName,
      $typeArgs: this.$typeArgs,
      ...this.toJSONField(),
    };
  }

  static fromJSONField(field: any): Bridge {
    return Bridge.reified().new({
      id: decodeFromJSONField(UID.reified(), field.id),
      pools: decodeFromJSONField(ObjectBag.reified(), field.pools),
      otherBridges: decodeFromJSONField(
        Table.reified(reified.phantom("u8"), reified.phantom(AnotherBridge.reified())),
        field.otherBridges
      ),
      processedMessages: decodeFromJSONField(Set.reified(reified.phantom(Message.reified())), field.processedMessages),
      sentMessages: decodeFromJSONField(Set.reified(reified.phantom(Message.reified())), field.sentMessages),
      feeCollector: decodeFromJSONField(
        FeeCollector.reified(reified.phantom(FeeCollectorCap.reified())),
        field.feeCollector
      ),
      feeCollectorCap: decodeFromJSONField(FeeCollectorCap.reified(), field.feeCollectorCap),
      rebalancer: decodeFromJSONField("address", field.rebalancer),
      canSwap: decodeFromJSONField("bool", field.canSwap),
    });
  }

  static fromJSON(json: Record<string, any>): Bridge {
    if (json.$typeName !== Bridge.$typeName) {
      throw new Error("not a WithTwoGenerics json object");
    }

    return Bridge.fromJSONField(json);
  }

  static fromSuiParsedData(content: SuiParsedData): Bridge {
    if (content.dataType !== "moveObject") {
      throw new Error("not an object");
    }
    if (!isBridge(content.type)) {
      throw new Error(`object at ${(content.fields as any).id} is not a Bridge object`);
    }
    return Bridge.fromFieldsWithTypes(content);
  }

  static fromSuiObjectData(data: SuiObjectData): Bridge {
    if (data.bcs) {
      if (data.bcs.dataType !== "moveObject" || !isBridge(data.bcs.type)) {
        throw new Error(`object at is not a Bridge object`);
      }

      return Bridge.fromBcs(fromB64(data.bcs.bcsBytes));
    }
    if (data.content) {
      return Bridge.fromSuiParsedData(data.content);
    }
    throw new Error(
      "Both `bcs` and `content` fields are missing from the data. Include `showBcs` or `showContent` in the request."
    );
  }

  static async fetch(client: SuiClient, id: string): Promise<Bridge> {
    const res = await client.getObject({ id, options: { showBcs: true } });
    if (res.error) {
      throw new Error(`error fetching Bridge object at id ${id}: ${res.error.code}`);
    }
    if (res.data?.bcs?.dataType !== "moveObject" || !isBridge(res.data.bcs.type)) {
      throw new Error(`object at id ${id} is not a Bridge object`);
    }

    return Bridge.fromSuiObjectData(res.data);
  }
}

/* ============================== FeeCollectorCap =============================== */

export function isFeeCollectorCap(type: string): boolean {
  type = compressSuiType(type);
  return type === `${PKG_V1}::bridge::FeeCollectorCap`;
}

export interface FeeCollectorCapFields {
  dummyField: ToField<"bool">;
}

export type FeeCollectorCapReified = Reified<FeeCollectorCap, FeeCollectorCapFields>;

export class FeeCollectorCap implements StructClass {
  __StructClass = true as const;

  static get $typeName() {
    return `${PKG_V1}::bridge::FeeCollectorCap`;
  }
  static readonly $numTypeParams = 0;
  static readonly $isPhantom = [] as const;

  readonly $typeName = FeeCollectorCap.$typeName;
  readonly $fullTypeName: string;
  readonly $typeArgs: [];
  readonly $isPhantom = FeeCollectorCap.$isPhantom;

  readonly dummyField: ToField<"bool">;

  private constructor(typeArgs: [], fields: FeeCollectorCapFields) {
    this.$fullTypeName = composeSuiType(FeeCollectorCap.$typeName, ...typeArgs) as string;
    this.$typeArgs = typeArgs;

    this.dummyField = fields.dummyField;
  }

  static reified(): FeeCollectorCapReified {
    return {
      typeName: FeeCollectorCap.$typeName,
      fullTypeName: composeSuiType(FeeCollectorCap.$typeName, ...[]) as string,
      typeArgs: [] as [],
      isPhantom: FeeCollectorCap.$isPhantom,
      reifiedTypeArgs: [],
      fromFields: (fields: Record<string, any>) => FeeCollectorCap.fromFields(fields),
      fromFieldsWithTypes: (item: FieldsWithTypes) => FeeCollectorCap.fromFieldsWithTypes(item),
      fromBcs: (data: Uint8Array) => FeeCollectorCap.fromBcs(data),
      bcs: FeeCollectorCap.bcs,
      fromJSONField: (field: any) => FeeCollectorCap.fromJSONField(field),
      fromJSON: (json: Record<string, any>) => FeeCollectorCap.fromJSON(json),
      fromSuiParsedData: (content: SuiParsedData) => FeeCollectorCap.fromSuiParsedData(content),
      fromSuiObjectData: (content: SuiObjectData) => FeeCollectorCap.fromSuiObjectData(content),
      fetch: async (client: SuiClient, id: string) => FeeCollectorCap.fetch(client, id),
      new: (fields: FeeCollectorCapFields) => {
        return new FeeCollectorCap([], fields);
      },
      kind: "StructClassReified",
    };
  }

  static get r() {
    return FeeCollectorCap.reified();
  }

  static phantom(): PhantomReified<ToTypeStr<FeeCollectorCap>> {
    return phantom(FeeCollectorCap.reified());
  }
  static get p() {
    return FeeCollectorCap.phantom();
  }

  static get bcs() {
    return bcs.struct("FeeCollectorCap", {
      dummy_field: bcs.bool(),
    });
  }

  static fromFields(fields: Record<string, any>): FeeCollectorCap {
    return FeeCollectorCap.reified().new({
      dummyField: decodeFromFields("bool", fields.dummy_field),
    });
  }

  static fromFieldsWithTypes(item: FieldsWithTypes): FeeCollectorCap {
    if (!isFeeCollectorCap(item.type)) {
      throw new Error("not a FeeCollectorCap type");
    }

    return FeeCollectorCap.reified().new({
      dummyField: decodeFromFieldsWithTypes("bool", item.fields.dummy_field),
    });
  }

  static fromBcs(data: Uint8Array): FeeCollectorCap {
    return FeeCollectorCap.fromFields(FeeCollectorCap.bcs.parse(data));
  }

  toJSONField() {
    return {
      dummyField: this.dummyField,
    };
  }

  toJSON() {
    return {
      $typeName: this.$typeName,
      $typeArgs: this.$typeArgs,
      ...this.toJSONField(),
    };
  }

  static fromJSONField(field: any): FeeCollectorCap {
    return FeeCollectorCap.reified().new({
      dummyField: decodeFromJSONField("bool", field.dummyField),
    });
  }

  static fromJSON(json: Record<string, any>): FeeCollectorCap {
    if (json.$typeName !== FeeCollectorCap.$typeName) {
      throw new Error("not a WithTwoGenerics json object");
    }

    return FeeCollectorCap.fromJSONField(json);
  }

  static fromSuiParsedData(content: SuiParsedData): FeeCollectorCap {
    if (content.dataType !== "moveObject") {
      throw new Error("not an object");
    }
    if (!isFeeCollectorCap(content.type)) {
      throw new Error(`object at ${(content.fields as any).id} is not a FeeCollectorCap object`);
    }
    return FeeCollectorCap.fromFieldsWithTypes(content);
  }

  static fromSuiObjectData(data: SuiObjectData): FeeCollectorCap {
    if (data.bcs) {
      if (data.bcs.dataType !== "moveObject" || !isFeeCollectorCap(data.bcs.type)) {
        throw new Error(`object at is not a FeeCollectorCap object`);
      }

      return FeeCollectorCap.fromBcs(fromB64(data.bcs.bcsBytes));
    }
    if (data.content) {
      return FeeCollectorCap.fromSuiParsedData(data.content);
    }
    throw new Error(
      "Both `bcs` and `content` fields are missing from the data. Include `showBcs` or `showContent` in the request."
    );
  }

  static async fetch(client: SuiClient, id: string): Promise<FeeCollectorCap> {
    const res = await client.getObject({ id, options: { showBcs: true } });
    if (res.error) {
      throw new Error(`error fetching FeeCollectorCap object at id ${id}: ${res.error.code}`);
    }
    if (res.data?.bcs?.dataType !== "moveObject" || !isFeeCollectorCap(res.data.bcs.type)) {
      throw new Error(`object at id ${id} is not a FeeCollectorCap object`);
    }

    return FeeCollectorCap.fromSuiObjectData(res.data);
  }
}

/* ============================== StopSwapCap =============================== */

export function isStopSwapCap(type: string): boolean {
  type = compressSuiType(type);
  return type === `${PKG_V1}::bridge::StopSwapCap`;
}

export interface StopSwapCapFields {
  id: ToField<UID>;
}

export type StopSwapCapReified = Reified<StopSwapCap, StopSwapCapFields>;

export class StopSwapCap implements StructClass {
  __StructClass = true as const;

  static get $typeName() {
    return `${PKG_V1}::bridge::StopSwapCap`;
  }
  static readonly $numTypeParams = 0;
  static readonly $isPhantom = [] as const;

  readonly $typeName = StopSwapCap.$typeName;
  readonly $fullTypeName: string;
  readonly $typeArgs: [];
  readonly $isPhantom = StopSwapCap.$isPhantom;

  readonly id: ToField<UID>;

  private constructor(typeArgs: [], fields: StopSwapCapFields) {
    this.$fullTypeName = composeSuiType(StopSwapCap.$typeName, ...typeArgs) as string;
    this.$typeArgs = typeArgs;

    this.id = fields.id;
  }

  static reified(): StopSwapCapReified {
    return {
      typeName: StopSwapCap.$typeName,
      fullTypeName: composeSuiType(StopSwapCap.$typeName, ...[]) as string,
      typeArgs: [] as [],
      isPhantom: StopSwapCap.$isPhantom,
      reifiedTypeArgs: [],
      fromFields: (fields: Record<string, any>) => StopSwapCap.fromFields(fields),
      fromFieldsWithTypes: (item: FieldsWithTypes) => StopSwapCap.fromFieldsWithTypes(item),
      fromBcs: (data: Uint8Array) => StopSwapCap.fromBcs(data),
      bcs: StopSwapCap.bcs,
      fromJSONField: (field: any) => StopSwapCap.fromJSONField(field),
      fromJSON: (json: Record<string, any>) => StopSwapCap.fromJSON(json),
      fromSuiParsedData: (content: SuiParsedData) => StopSwapCap.fromSuiParsedData(content),
      fromSuiObjectData: (content: SuiObjectData) => StopSwapCap.fromSuiObjectData(content),
      fetch: async (client: SuiClient, id: string) => StopSwapCap.fetch(client, id),
      new: (fields: StopSwapCapFields) => {
        return new StopSwapCap([], fields);
      },
      kind: "StructClassReified",
    };
  }

  static get r() {
    return StopSwapCap.reified();
  }

  static phantom(): PhantomReified<ToTypeStr<StopSwapCap>> {
    return phantom(StopSwapCap.reified());
  }
  static get p() {
    return StopSwapCap.phantom();
  }

  static get bcs() {
    return bcs.struct("StopSwapCap", {
      id: UID.bcs,
    });
  }

  static fromFields(fields: Record<string, any>): StopSwapCap {
    return StopSwapCap.reified().new({
      id: decodeFromFields(UID.reified(), fields.id),
    });
  }

  static fromFieldsWithTypes(item: FieldsWithTypes): StopSwapCap {
    if (!isStopSwapCap(item.type)) {
      throw new Error("not a StopSwapCap type");
    }

    return StopSwapCap.reified().new({
      id: decodeFromFieldsWithTypes(UID.reified(), item.fields.id),
    });
  }

  static fromBcs(data: Uint8Array): StopSwapCap {
    return StopSwapCap.fromFields(StopSwapCap.bcs.parse(data));
  }

  toJSONField() {
    return {
      id: this.id,
    };
  }

  toJSON() {
    return {
      $typeName: this.$typeName,
      $typeArgs: this.$typeArgs,
      ...this.toJSONField(),
    };
  }

  static fromJSONField(field: any): StopSwapCap {
    return StopSwapCap.reified().new({
      id: decodeFromJSONField(UID.reified(), field.id),
    });
  }

  static fromJSON(json: Record<string, any>): StopSwapCap {
    if (json.$typeName !== StopSwapCap.$typeName) {
      throw new Error("not a WithTwoGenerics json object");
    }

    return StopSwapCap.fromJSONField(json);
  }

  static fromSuiParsedData(content: SuiParsedData): StopSwapCap {
    if (content.dataType !== "moveObject") {
      throw new Error("not an object");
    }
    if (!isStopSwapCap(content.type)) {
      throw new Error(`object at ${(content.fields as any).id} is not a StopSwapCap object`);
    }
    return StopSwapCap.fromFieldsWithTypes(content);
  }

  static fromSuiObjectData(data: SuiObjectData): StopSwapCap {
    if (data.bcs) {
      if (data.bcs.dataType !== "moveObject" || !isStopSwapCap(data.bcs.type)) {
        throw new Error(`object at is not a StopSwapCap object`);
      }

      return StopSwapCap.fromBcs(fromB64(data.bcs.bcsBytes));
    }
    if (data.content) {
      return StopSwapCap.fromSuiParsedData(data.content);
    }
    throw new Error(
      "Both `bcs` and `content` fields are missing from the data. Include `showBcs` or `showContent` in the request."
    );
  }

  static async fetch(client: SuiClient, id: string): Promise<StopSwapCap> {
    const res = await client.getObject({ id, options: { showBcs: true } });
    if (res.error) {
      throw new Error(`error fetching StopSwapCap object at id ${id}: ${res.error.code}`);
    }
    if (res.data?.bcs?.dataType !== "moveObject" || !isStopSwapCap(res.data.bcs.type)) {
      throw new Error(`object at id ${id} is not a StopSwapCap object`);
    }

    return StopSwapCap.fromSuiObjectData(res.data);
  }
}
