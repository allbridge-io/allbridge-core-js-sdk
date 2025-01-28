// @ts-nocheck
import {
  PhantomReified,
  PhantomToTypeStr,
  PhantomTypeArgument,
  Reified,
  StructClass,
  ToField,
  ToPhantomTypeArgument,
  ToTypeStr,
  assertFieldsWithTypesArgsMatch,
  assertReifiedTypeArgsMatch,
  decodeFromFields,
  decodeFromFieldsWithTypes,
  decodeFromJSONField,
  extractType,
  phantom,
} from "../../_framework/reified";
import { FieldsWithTypes, composeSuiType, compressSuiType, parseTypeName } from "../../_framework/util";
import { Balance } from "../../sui/balance/structs";
import { UID } from "../../sui/object/structs";
import { PKG_V1 } from "../index";
import { PoolRewards } from "../pool-rewards/structs";
import { PoolState } from "../pool-state/structs";
import { bcs } from "@mysten/sui/bcs";
import { SuiClient, SuiObjectData, SuiParsedData } from "@mysten/sui/client";
import { fromB64 } from "@mysten/sui/utils";

/* ============================== AdminCap =============================== */

export function isAdminCap(type: string): boolean {
  type = compressSuiType(type);
  return type === `${PKG_V1}::pool::AdminCap`;
}

export interface AdminCapFields {
  id: ToField<UID>;
}

export type AdminCapReified = Reified<AdminCap, AdminCapFields>;

export class AdminCap implements StructClass {
  __StructClass = true as const;

  static get $typeName() {
    return `${PKG_V1}::pool::AdminCap`;
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

/* ============================== Pool =============================== */

export function isPool(type: string): boolean {
  type = compressSuiType(type);
  return type.startsWith(`${PKG_V1}::pool::Pool` + "<");
}

export interface PoolFields<T extends PhantomTypeArgument> {
  id: ToField<UID>;
  state: ToField<PoolState<T>>;
  rewards: ToField<PoolRewards<T>>;
  feeShareBp: ToField<"u64">;
  canDeposit: ToField<"bool">;
  canWithdraw: ToField<"bool">;
  decimals: ToField<"u8">;
  balance: ToField<Balance<T>>;
}

export type PoolReified<T extends PhantomTypeArgument> = Reified<Pool<T>, PoolFields<T>>;

export class Pool<T extends PhantomTypeArgument> implements StructClass {
  __StructClass = true as const;

  static get $typeName() {
    return `${PKG_V1}::pool::Pool`;
  }
  static readonly $numTypeParams = 1;
  static readonly $isPhantom = [true] as const;

  readonly $typeName = Pool.$typeName;
  readonly $fullTypeName: string;
  readonly $typeArgs: [PhantomToTypeStr<T>];
  readonly $isPhantom = Pool.$isPhantom;

  readonly id: ToField<UID>;
  readonly state: ToField<PoolState<T>>;
  readonly rewards: ToField<PoolRewards<T>>;
  readonly feeShareBp: ToField<"u64">;
  readonly canDeposit: ToField<"bool">;
  readonly canWithdraw: ToField<"bool">;
  readonly decimals: ToField<"u8">;
  readonly balance: ToField<Balance<T>>;

  private constructor(typeArgs: [PhantomToTypeStr<T>], fields: PoolFields<T>) {
    this.$fullTypeName = composeSuiType(Pool.$typeName, ...typeArgs) as string;
    this.$typeArgs = typeArgs;

    this.id = fields.id;
    this.state = fields.state;
    this.rewards = fields.rewards;
    this.feeShareBp = fields.feeShareBp;
    this.canDeposit = fields.canDeposit;
    this.canWithdraw = fields.canWithdraw;
    this.decimals = fields.decimals;
    this.balance = fields.balance;
  }

  static reified<T extends PhantomReified<PhantomTypeArgument>>(T: T): PoolReified<ToPhantomTypeArgument<T>> {
    return {
      typeName: Pool.$typeName,
      fullTypeName: composeSuiType(Pool.$typeName, ...[extractType(T)]) as string,
      typeArgs: [extractType(T)] as [PhantomToTypeStr<ToPhantomTypeArgument<T>>],
      isPhantom: Pool.$isPhantom,
      reifiedTypeArgs: [T],
      fromFields: (fields: Record<string, any>) => Pool.fromFields(T, fields),
      fromFieldsWithTypes: (item: FieldsWithTypes) => Pool.fromFieldsWithTypes(T, item),
      fromBcs: (data: Uint8Array) => Pool.fromBcs(T, data),
      bcs: Pool.bcs,
      fromJSONField: (field: any) => Pool.fromJSONField(T, field),
      fromJSON: (json: Record<string, any>) => Pool.fromJSON(T, json),
      fromSuiParsedData: (content: SuiParsedData) => Pool.fromSuiParsedData(T, content),
      fromSuiObjectData: (content: SuiObjectData) => Pool.fromSuiObjectData(T, content),
      fetch: async (client: SuiClient, id: string) => Pool.fetch(client, T, id),
      new: (fields: PoolFields<ToPhantomTypeArgument<T>>) => {
        return new Pool([extractType(T)], fields);
      },
      kind: "StructClassReified",
    };
  }

  static get r() {
    return Pool.reified;
  }

  static phantom<T extends PhantomReified<PhantomTypeArgument>>(
    T: T
  ): PhantomReified<ToTypeStr<Pool<ToPhantomTypeArgument<T>>>> {
    return phantom(Pool.reified(T));
  }
  static get p() {
    return Pool.phantom;
  }

  static get bcs() {
    return bcs.struct("Pool", {
      id: UID.bcs,
      state: PoolState.bcs,
      rewards: PoolRewards.bcs,
      fee_share_bp: bcs.u64(),
      can_deposit: bcs.bool(),
      can_withdraw: bcs.bool(),
      decimals: bcs.u8(),
      balance: Balance.bcs,
    });
  }

  static fromFields<T extends PhantomReified<PhantomTypeArgument>>(
    typeArg: T,
    fields: Record<string, any>
  ): Pool<ToPhantomTypeArgument<T>> {
    return Pool.reified(typeArg).new({
      id: decodeFromFields(UID.reified(), fields.id),
      state: decodeFromFields(PoolState.reified(typeArg), fields.state),
      rewards: decodeFromFields(PoolRewards.reified(typeArg), fields.rewards),
      feeShareBp: decodeFromFields("u64", fields.fee_share_bp),
      canDeposit: decodeFromFields("bool", fields.can_deposit),
      canWithdraw: decodeFromFields("bool", fields.can_withdraw),
      decimals: decodeFromFields("u8", fields.decimals),
      balance: decodeFromFields(Balance.reified(typeArg), fields.balance),
    });
  }

  static fromFieldsWithTypes<T extends PhantomReified<PhantomTypeArgument>>(
    typeArg: T,
    item: FieldsWithTypes
  ): Pool<ToPhantomTypeArgument<T>> {
    if (!isPool(item.type)) {
      throw new Error("not a Pool type");
    }
    assertFieldsWithTypesArgsMatch(item, [typeArg]);

    return Pool.reified(typeArg).new({
      id: decodeFromFieldsWithTypes(UID.reified(), item.fields.id),
      state: decodeFromFieldsWithTypes(PoolState.reified(typeArg), item.fields.state),
      rewards: decodeFromFieldsWithTypes(PoolRewards.reified(typeArg), item.fields.rewards),
      feeShareBp: decodeFromFieldsWithTypes("u64", item.fields.fee_share_bp),
      canDeposit: decodeFromFieldsWithTypes("bool", item.fields.can_deposit),
      canWithdraw: decodeFromFieldsWithTypes("bool", item.fields.can_withdraw),
      decimals: decodeFromFieldsWithTypes("u8", item.fields.decimals),
      balance: decodeFromFieldsWithTypes(Balance.reified(typeArg), item.fields.balance),
    });
  }

  static fromBcs<T extends PhantomReified<PhantomTypeArgument>>(
    typeArg: T,
    data: Uint8Array
  ): Pool<ToPhantomTypeArgument<T>> {
    return Pool.fromFields(typeArg, Pool.bcs.parse(data));
  }

  toJSONField() {
    return {
      id: this.id,
      state: this.state.toJSONField(),
      rewards: this.rewards.toJSONField(),
      feeShareBp: this.feeShareBp.toString(),
      canDeposit: this.canDeposit,
      canWithdraw: this.canWithdraw,
      decimals: this.decimals,
      balance: this.balance.toJSONField(),
    };
  }

  toJSON() {
    return {
      $typeName: this.$typeName,
      $typeArgs: this.$typeArgs,
      ...this.toJSONField(),
    };
  }

  static fromJSONField<T extends PhantomReified<PhantomTypeArgument>>(
    typeArg: T,
    field: any
  ): Pool<ToPhantomTypeArgument<T>> {
    return Pool.reified(typeArg).new({
      id: decodeFromJSONField(UID.reified(), field.id),
      state: decodeFromJSONField(PoolState.reified(typeArg), field.state),
      rewards: decodeFromJSONField(PoolRewards.reified(typeArg), field.rewards),
      feeShareBp: decodeFromJSONField("u64", field.feeShareBp),
      canDeposit: decodeFromJSONField("bool", field.canDeposit),
      canWithdraw: decodeFromJSONField("bool", field.canWithdraw),
      decimals: decodeFromJSONField("u8", field.decimals),
      balance: decodeFromJSONField(Balance.reified(typeArg), field.balance),
    });
  }

  static fromJSON<T extends PhantomReified<PhantomTypeArgument>>(
    typeArg: T,
    json: Record<string, any>
  ): Pool<ToPhantomTypeArgument<T>> {
    if (json.$typeName !== Pool.$typeName) {
      throw new Error("not a WithTwoGenerics json object");
    }
    assertReifiedTypeArgsMatch(composeSuiType(Pool.$typeName, extractType(typeArg)), json.$typeArgs, [typeArg]);

    return Pool.fromJSONField(typeArg, json);
  }

  static fromSuiParsedData<T extends PhantomReified<PhantomTypeArgument>>(
    typeArg: T,
    content: SuiParsedData
  ): Pool<ToPhantomTypeArgument<T>> {
    if (content.dataType !== "moveObject") {
      throw new Error("not an object");
    }
    if (!isPool(content.type)) {
      throw new Error(`object at ${(content.fields as any).id} is not a Pool object`);
    }
    return Pool.fromFieldsWithTypes(typeArg, content);
  }

  static fromSuiObjectData<T extends PhantomReified<PhantomTypeArgument>>(
    typeArg: T,
    data: SuiObjectData
  ): Pool<ToPhantomTypeArgument<T>> {
    if (data.bcs) {
      if (data.bcs.dataType !== "moveObject" || !isPool(data.bcs.type)) {
        throw new Error(`object at is not a Pool object`);
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

      return Pool.fromBcs(typeArg, fromB64(data.bcs.bcsBytes));
    }
    if (data.content) {
      return Pool.fromSuiParsedData(typeArg, data.content);
    }
    throw new Error(
      "Both `bcs` and `content` fields are missing from the data. Include `showBcs` or `showContent` in the request."
    );
  }

  static async fetch<T extends PhantomReified<PhantomTypeArgument>>(
    client: SuiClient,
    typeArg: T,
    id: string
  ): Promise<Pool<ToPhantomTypeArgument<T>>> {
    const res = await client.getObject({ id, options: { showBcs: true } });
    if (res.error) {
      throw new Error(`error fetching Pool object at id ${id}: ${res.error.code}`);
    }
    if (res.data?.bcs?.dataType !== "moveObject" || !isPool(res.data.bcs.type)) {
      throw new Error(`object at id ${id} is not a Pool object`);
    }

    return Pool.fromSuiObjectData(typeArg, res.data);
  }
}

/* ============================== StopCap =============================== */

export function isStopCap(type: string): boolean {
  type = compressSuiType(type);
  return type === `${PKG_V1}::pool::StopCap`;
}

export interface StopCapFields {
  id: ToField<UID>;
}

export type StopCapReified = Reified<StopCap, StopCapFields>;

export class StopCap implements StructClass {
  __StructClass = true as const;

  static get $typeName() {
    return `${PKG_V1}::pool::StopCap`;
  }
  static readonly $numTypeParams = 0;
  static readonly $isPhantom = [] as const;

  readonly $typeName = StopCap.$typeName;
  readonly $fullTypeName: string;
  readonly $typeArgs: [];
  readonly $isPhantom = StopCap.$isPhantom;

  readonly id: ToField<UID>;

  private constructor(typeArgs: [], fields: StopCapFields) {
    this.$fullTypeName = composeSuiType(StopCap.$typeName, ...typeArgs) as string;
    this.$typeArgs = typeArgs;

    this.id = fields.id;
  }

  static reified(): StopCapReified {
    return {
      typeName: StopCap.$typeName,
      fullTypeName: composeSuiType(StopCap.$typeName, ...[]) as string,
      typeArgs: [] as [],
      isPhantom: StopCap.$isPhantom,
      reifiedTypeArgs: [],
      fromFields: (fields: Record<string, any>) => StopCap.fromFields(fields),
      fromFieldsWithTypes: (item: FieldsWithTypes) => StopCap.fromFieldsWithTypes(item),
      fromBcs: (data: Uint8Array) => StopCap.fromBcs(data),
      bcs: StopCap.bcs,
      fromJSONField: (field: any) => StopCap.fromJSONField(field),
      fromJSON: (json: Record<string, any>) => StopCap.fromJSON(json),
      fromSuiParsedData: (content: SuiParsedData) => StopCap.fromSuiParsedData(content),
      fromSuiObjectData: (content: SuiObjectData) => StopCap.fromSuiObjectData(content),
      fetch: async (client: SuiClient, id: string) => StopCap.fetch(client, id),
      new: (fields: StopCapFields) => {
        return new StopCap([], fields);
      },
      kind: "StructClassReified",
    };
  }

  static get r() {
    return StopCap.reified();
  }

  static phantom(): PhantomReified<ToTypeStr<StopCap>> {
    return phantom(StopCap.reified());
  }
  static get p() {
    return StopCap.phantom();
  }

  static get bcs() {
    return bcs.struct("StopCap", {
      id: UID.bcs,
    });
  }

  static fromFields(fields: Record<string, any>): StopCap {
    return StopCap.reified().new({
      id: decodeFromFields(UID.reified(), fields.id),
    });
  }

  static fromFieldsWithTypes(item: FieldsWithTypes): StopCap {
    if (!isStopCap(item.type)) {
      throw new Error("not a StopCap type");
    }

    return StopCap.reified().new({
      id: decodeFromFieldsWithTypes(UID.reified(), item.fields.id),
    });
  }

  static fromBcs(data: Uint8Array): StopCap {
    return StopCap.fromFields(StopCap.bcs.parse(data));
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

  static fromJSONField(field: any): StopCap {
    return StopCap.reified().new({
      id: decodeFromJSONField(UID.reified(), field.id),
    });
  }

  static fromJSON(json: Record<string, any>): StopCap {
    if (json.$typeName !== StopCap.$typeName) {
      throw new Error("not a WithTwoGenerics json object");
    }

    return StopCap.fromJSONField(json);
  }

  static fromSuiParsedData(content: SuiParsedData): StopCap {
    if (content.dataType !== "moveObject") {
      throw new Error("not an object");
    }
    if (!isStopCap(content.type)) {
      throw new Error(`object at ${(content.fields as any).id} is not a StopCap object`);
    }
    return StopCap.fromFieldsWithTypes(content);
  }

  static fromSuiObjectData(data: SuiObjectData): StopCap {
    if (data.bcs) {
      if (data.bcs.dataType !== "moveObject" || !isStopCap(data.bcs.type)) {
        throw new Error(`object at is not a StopCap object`);
      }

      return StopCap.fromBcs(fromB64(data.bcs.bcsBytes));
    }
    if (data.content) {
      return StopCap.fromSuiParsedData(data.content);
    }
    throw new Error(
      "Both `bcs` and `content` fields are missing from the data. Include `showBcs` or `showContent` in the request."
    );
  }

  static async fetch(client: SuiClient, id: string): Promise<StopCap> {
    const res = await client.getObject({ id, options: { showBcs: true } });
    if (res.error) {
      throw new Error(`error fetching StopCap object at id ${id}: ${res.error.code}`);
    }
    if (res.data?.bcs?.dataType !== "moveObject" || !isStopCap(res.data.bcs.type)) {
      throw new Error(`object at id ${id} is not a StopCap object`);
    }

    return StopCap.fromSuiObjectData(res.data);
  }
}
