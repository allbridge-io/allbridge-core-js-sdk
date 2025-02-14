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
import { PKG_V1 } from "../index";
import { bcs } from "@mysten/sui/bcs";
import { SuiClient, SuiObjectData, SuiParsedData } from "@mysten/sui/client";
import { fromB64 } from "@mysten/sui/utils";

/* ============================== PoolRewards =============================== */

export function isPoolRewards(type: string): boolean {
  type = compressSuiType(type);
  return type.startsWith(`${PKG_V1}::pool_rewards::PoolRewards` + "<");
}

export interface PoolRewardsFields<T extends PhantomTypeArgument> {
  accRewardPerShareP: ToField<"u128">;
  adminFeeShareBp: ToField<"u64">;
  adminFee: ToField<Balance<T>>;
  rewards: ToField<Balance<T>>;
  lpSupply: ToField<"u64">;
}

export type PoolRewardsReified<T extends PhantomTypeArgument> = Reified<PoolRewards<T>, PoolRewardsFields<T>>;

export class PoolRewards<T extends PhantomTypeArgument> implements StructClass {
  __StructClass = true as const;

  static get $typeName() {
    return `${PKG_V1}::pool_rewards::PoolRewards`;
  }
  static readonly $numTypeParams = 1;
  static readonly $isPhantom = [true] as const;

  readonly $typeName = PoolRewards.$typeName;
  readonly $fullTypeName: string;
  readonly $typeArgs: [PhantomToTypeStr<T>];
  readonly $isPhantom = PoolRewards.$isPhantom;

  readonly accRewardPerShareP: ToField<"u128">;
  readonly adminFeeShareBp: ToField<"u64">;
  readonly adminFee: ToField<Balance<T>>;
  readonly rewards: ToField<Balance<T>>;
  readonly lpSupply: ToField<"u64">;

  private constructor(typeArgs: [PhantomToTypeStr<T>], fields: PoolRewardsFields<T>) {
    this.$fullTypeName = composeSuiType(PoolRewards.$typeName, ...typeArgs) as string;
    this.$typeArgs = typeArgs;

    this.accRewardPerShareP = fields.accRewardPerShareP;
    this.adminFeeShareBp = fields.adminFeeShareBp;
    this.adminFee = fields.adminFee;
    this.rewards = fields.rewards;
    this.lpSupply = fields.lpSupply;
  }

  static reified<T extends PhantomReified<PhantomTypeArgument>>(T: T): PoolRewardsReified<ToPhantomTypeArgument<T>> {
    return {
      typeName: PoolRewards.$typeName,
      fullTypeName: composeSuiType(PoolRewards.$typeName, ...[extractType(T)]) as string,
      typeArgs: [extractType(T)] as [PhantomToTypeStr<ToPhantomTypeArgument<T>>],
      isPhantom: PoolRewards.$isPhantom,
      reifiedTypeArgs: [T],
      fromFields: (fields: Record<string, any>) => PoolRewards.fromFields(T, fields),
      fromFieldsWithTypes: (item: FieldsWithTypes) => PoolRewards.fromFieldsWithTypes(T, item),
      fromBcs: (data: Uint8Array) => PoolRewards.fromBcs(T, data),
      bcs: PoolRewards.bcs,
      fromJSONField: (field: any) => PoolRewards.fromJSONField(T, field),
      fromJSON: (json: Record<string, any>) => PoolRewards.fromJSON(T, json),
      fromSuiParsedData: (content: SuiParsedData) => PoolRewards.fromSuiParsedData(T, content),
      fromSuiObjectData: (content: SuiObjectData) => PoolRewards.fromSuiObjectData(T, content),
      fetch: async (client: SuiClient, id: string) => PoolRewards.fetch(client, T, id),
      new: (fields: PoolRewardsFields<ToPhantomTypeArgument<T>>) => {
        return new PoolRewards([extractType(T)], fields);
      },
      kind: "StructClassReified",
    };
  }

  static get r() {
    return PoolRewards.reified;
  }

  static phantom<T extends PhantomReified<PhantomTypeArgument>>(
    T: T
  ): PhantomReified<ToTypeStr<PoolRewards<ToPhantomTypeArgument<T>>>> {
    return phantom(PoolRewards.reified(T));
  }
  static get p() {
    return PoolRewards.phantom;
  }

  static get bcs() {
    return bcs.struct("PoolRewards", {
      acc_reward_per_share_p: bcs.u128(),
      admin_fee_share_bp: bcs.u64(),
      admin_fee: Balance.bcs,
      rewards: Balance.bcs,
      lp_supply: bcs.u64(),
    });
  }

  static fromFields<T extends PhantomReified<PhantomTypeArgument>>(
    typeArg: T,
    fields: Record<string, any>
  ): PoolRewards<ToPhantomTypeArgument<T>> {
    return PoolRewards.reified(typeArg).new({
      accRewardPerShareP: decodeFromFields("u128", fields.acc_reward_per_share_p),
      adminFeeShareBp: decodeFromFields("u64", fields.admin_fee_share_bp),
      adminFee: decodeFromFields(Balance.reified(typeArg), fields.admin_fee),
      rewards: decodeFromFields(Balance.reified(typeArg), fields.rewards),
      lpSupply: decodeFromFields("u64", fields.lp_supply),
    });
  }

  static fromFieldsWithTypes<T extends PhantomReified<PhantomTypeArgument>>(
    typeArg: T,
    item: FieldsWithTypes
  ): PoolRewards<ToPhantomTypeArgument<T>> {
    if (!isPoolRewards(item.type)) {
      throw new Error("not a PoolRewards type");
    }
    assertFieldsWithTypesArgsMatch(item, [typeArg]);

    return PoolRewards.reified(typeArg).new({
      accRewardPerShareP: decodeFromFieldsWithTypes("u128", item.fields.acc_reward_per_share_p),
      adminFeeShareBp: decodeFromFieldsWithTypes("u64", item.fields.admin_fee_share_bp),
      adminFee: decodeFromFieldsWithTypes(Balance.reified(typeArg), item.fields.admin_fee),
      rewards: decodeFromFieldsWithTypes(Balance.reified(typeArg), item.fields.rewards),
      lpSupply: decodeFromFieldsWithTypes("u64", item.fields.lp_supply),
    });
  }

  static fromBcs<T extends PhantomReified<PhantomTypeArgument>>(
    typeArg: T,
    data: Uint8Array
  ): PoolRewards<ToPhantomTypeArgument<T>> {
    return PoolRewards.fromFields(typeArg, PoolRewards.bcs.parse(data));
  }

  toJSONField() {
    return {
      accRewardPerShareP: this.accRewardPerShareP.toString(),
      adminFeeShareBp: this.adminFeeShareBp.toString(),
      adminFee: this.adminFee.toJSONField(),
      rewards: this.rewards.toJSONField(),
      lpSupply: this.lpSupply.toString(),
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
  ): PoolRewards<ToPhantomTypeArgument<T>> {
    return PoolRewards.reified(typeArg).new({
      accRewardPerShareP: decodeFromJSONField("u128", field.accRewardPerShareP),
      adminFeeShareBp: decodeFromJSONField("u64", field.adminFeeShareBp),
      adminFee: decodeFromJSONField(Balance.reified(typeArg), field.adminFee),
      rewards: decodeFromJSONField(Balance.reified(typeArg), field.rewards),
      lpSupply: decodeFromJSONField("u64", field.lpSupply),
    });
  }

  static fromJSON<T extends PhantomReified<PhantomTypeArgument>>(
    typeArg: T,
    json: Record<string, any>
  ): PoolRewards<ToPhantomTypeArgument<T>> {
    if (json.$typeName !== PoolRewards.$typeName) {
      throw new Error("not a WithTwoGenerics json object");
    }
    assertReifiedTypeArgsMatch(composeSuiType(PoolRewards.$typeName, extractType(typeArg)), json.$typeArgs, [typeArg]);

    return PoolRewards.fromJSONField(typeArg, json);
  }

  static fromSuiParsedData<T extends PhantomReified<PhantomTypeArgument>>(
    typeArg: T,
    content: SuiParsedData
  ): PoolRewards<ToPhantomTypeArgument<T>> {
    if (content.dataType !== "moveObject") {
      throw new Error("not an object");
    }
    if (!isPoolRewards(content.type)) {
      throw new Error(`object at ${(content.fields as any).id} is not a PoolRewards object`);
    }
    return PoolRewards.fromFieldsWithTypes(typeArg, content);
  }

  static fromSuiObjectData<T extends PhantomReified<PhantomTypeArgument>>(
    typeArg: T,
    data: SuiObjectData
  ): PoolRewards<ToPhantomTypeArgument<T>> {
    if (data.bcs) {
      if (data.bcs.dataType !== "moveObject" || !isPoolRewards(data.bcs.type)) {
        throw new Error(`object at is not a PoolRewards object`);
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

      return PoolRewards.fromBcs(typeArg, fromB64(data.bcs.bcsBytes));
    }
    if (data.content) {
      return PoolRewards.fromSuiParsedData(typeArg, data.content);
    }
    throw new Error(
      "Both `bcs` and `content` fields are missing from the data. Include `showBcs` or `showContent` in the request."
    );
  }

  static async fetch<T extends PhantomReified<PhantomTypeArgument>>(
    client: SuiClient,
    typeArg: T,
    id: string
  ): Promise<PoolRewards<ToPhantomTypeArgument<T>>> {
    const res = await client.getObject({ id, options: { showBcs: true } });
    if (res.error) {
      throw new Error(`error fetching PoolRewards object at id ${id}: ${res.error.code}`);
    }
    if (res.data?.bcs?.dataType !== "moveObject" || !isPoolRewards(res.data.bcs.type)) {
      throw new Error(`object at id ${id} is not a PoolRewards object`);
    }

    return PoolRewards.fromSuiObjectData(typeArg, res.data);
  }
}
