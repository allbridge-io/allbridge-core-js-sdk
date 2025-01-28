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
import { UID } from "../../sui/object/structs";
import { PKG_V1 } from "../index";
import { bcs } from "@mysten/sui/bcs";
import { SuiClient, SuiObjectData, SuiParsedData } from "@mysten/sui/client";
import { fromB64 } from "@mysten/sui/utils";

/* ============================== UserDeposit =============================== */

export function isUserDeposit(type: string): boolean {
  type = compressSuiType(type);
  return type.startsWith(`${PKG_V1}::user_deposit::UserDeposit` + "<");
}

export interface UserDepositFields<T extends PhantomTypeArgument> {
  id: ToField<UID>;
  lpAmount: ToField<"u64">;
  rewardDebt: ToField<"u64">;
}

export type UserDepositReified<T extends PhantomTypeArgument> = Reified<UserDeposit<T>, UserDepositFields<T>>;

export class UserDeposit<T extends PhantomTypeArgument> implements StructClass {
  __StructClass = true as const;

  static get $typeName() {
    return `${PKG_V1}::user_deposit::UserDeposit`;
  }
  static readonly $numTypeParams = 1;
  static readonly $isPhantom = [true] as const;

  readonly $typeName = UserDeposit.$typeName;
  readonly $fullTypeName: string;
  readonly $typeArgs: [PhantomToTypeStr<T>];
  readonly $isPhantom = UserDeposit.$isPhantom;

  readonly id: ToField<UID>;
  readonly lpAmount: ToField<"u64">;
  readonly rewardDebt: ToField<"u64">;

  private constructor(typeArgs: [PhantomToTypeStr<T>], fields: UserDepositFields<T>) {
    this.$fullTypeName = composeSuiType(UserDeposit.$typeName, ...typeArgs) as string;
    this.$typeArgs = typeArgs;

    this.id = fields.id;
    this.lpAmount = fields.lpAmount;
    this.rewardDebt = fields.rewardDebt;
  }

  static reified<T extends PhantomReified<PhantomTypeArgument>>(T: T): UserDepositReified<ToPhantomTypeArgument<T>> {
    return {
      typeName: UserDeposit.$typeName,
      fullTypeName: composeSuiType(UserDeposit.$typeName, ...[extractType(T)]) as string,
      typeArgs: [extractType(T)] as [PhantomToTypeStr<ToPhantomTypeArgument<T>>],
      isPhantom: UserDeposit.$isPhantom,
      reifiedTypeArgs: [T],
      fromFields: (fields: Record<string, any>) => UserDeposit.fromFields(T, fields),
      fromFieldsWithTypes: (item: FieldsWithTypes) => UserDeposit.fromFieldsWithTypes(T, item),
      fromBcs: (data: Uint8Array) => UserDeposit.fromBcs(T, data),
      bcs: UserDeposit.bcs,
      fromJSONField: (field: any) => UserDeposit.fromJSONField(T, field),
      fromJSON: (json: Record<string, any>) => UserDeposit.fromJSON(T, json),
      fromSuiParsedData: (content: SuiParsedData) => UserDeposit.fromSuiParsedData(T, content),
      fromSuiObjectData: (content: SuiObjectData) => UserDeposit.fromSuiObjectData(T, content),
      fetch: async (client: SuiClient, id: string) => UserDeposit.fetch(client, T, id),
      new: (fields: UserDepositFields<ToPhantomTypeArgument<T>>) => {
        return new UserDeposit([extractType(T)], fields);
      },
      kind: "StructClassReified",
    };
  }

  static get r() {
    return UserDeposit.reified;
  }

  static phantom<T extends PhantomReified<PhantomTypeArgument>>(
    T: T
  ): PhantomReified<ToTypeStr<UserDeposit<ToPhantomTypeArgument<T>>>> {
    return phantom(UserDeposit.reified(T));
  }
  static get p() {
    return UserDeposit.phantom;
  }

  static get bcs() {
    return bcs.struct("UserDeposit", {
      id: UID.bcs,
      lp_amount: bcs.u64(),
      reward_debt: bcs.u64(),
    });
  }

  static fromFields<T extends PhantomReified<PhantomTypeArgument>>(
    typeArg: T,
    fields: Record<string, any>
  ): UserDeposit<ToPhantomTypeArgument<T>> {
    return UserDeposit.reified(typeArg).new({
      id: decodeFromFields(UID.reified(), fields.id),
      lpAmount: decodeFromFields("u64", fields.lp_amount),
      rewardDebt: decodeFromFields("u64", fields.reward_debt),
    });
  }

  static fromFieldsWithTypes<T extends PhantomReified<PhantomTypeArgument>>(
    typeArg: T,
    item: FieldsWithTypes
  ): UserDeposit<ToPhantomTypeArgument<T>> {
    if (!isUserDeposit(item.type)) {
      throw new Error("not a UserDeposit type");
    }
    assertFieldsWithTypesArgsMatch(item, [typeArg]);

    return UserDeposit.reified(typeArg).new({
      id: decodeFromFieldsWithTypes(UID.reified(), item.fields.id),
      lpAmount: decodeFromFieldsWithTypes("u64", item.fields.lp_amount),
      rewardDebt: decodeFromFieldsWithTypes("u64", item.fields.reward_debt),
    });
  }

  static fromBcs<T extends PhantomReified<PhantomTypeArgument>>(
    typeArg: T,
    data: Uint8Array
  ): UserDeposit<ToPhantomTypeArgument<T>> {
    return UserDeposit.fromFields(typeArg, UserDeposit.bcs.parse(data));
  }

  toJSONField() {
    return {
      id: this.id,
      lpAmount: this.lpAmount.toString(),
      rewardDebt: this.rewardDebt.toString(),
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
  ): UserDeposit<ToPhantomTypeArgument<T>> {
    return UserDeposit.reified(typeArg).new({
      id: decodeFromJSONField(UID.reified(), field.id),
      lpAmount: decodeFromJSONField("u64", field.lpAmount),
      rewardDebt: decodeFromJSONField("u64", field.rewardDebt),
    });
  }

  static fromJSON<T extends PhantomReified<PhantomTypeArgument>>(
    typeArg: T,
    json: Record<string, any>
  ): UserDeposit<ToPhantomTypeArgument<T>> {
    if (json.$typeName !== UserDeposit.$typeName) {
      throw new Error("not a WithTwoGenerics json object");
    }
    assertReifiedTypeArgsMatch(composeSuiType(UserDeposit.$typeName, extractType(typeArg)), json.$typeArgs, [typeArg]);

    return UserDeposit.fromJSONField(typeArg, json);
  }

  static fromSuiParsedData<T extends PhantomReified<PhantomTypeArgument>>(
    typeArg: T,
    content: SuiParsedData
  ): UserDeposit<ToPhantomTypeArgument<T>> {
    if (content.dataType !== "moveObject") {
      throw new Error("not an object");
    }
    if (!isUserDeposit(content.type)) {
      throw new Error(`object at ${(content.fields as any).id} is not a UserDeposit object`);
    }
    return UserDeposit.fromFieldsWithTypes(typeArg, content);
  }

  static fromSuiObjectData<T extends PhantomReified<PhantomTypeArgument>>(
    typeArg: T,
    data: SuiObjectData
  ): UserDeposit<ToPhantomTypeArgument<T>> {
    if (data.bcs) {
      if (data.bcs.dataType !== "moveObject" || !isUserDeposit(data.bcs.type)) {
        throw new Error(`object at is not a UserDeposit object`);
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

      return UserDeposit.fromBcs(typeArg, fromB64(data.bcs.bcsBytes));
    }
    if (data.content) {
      return UserDeposit.fromSuiParsedData(typeArg, data.content);
    }
    throw new Error(
      "Both `bcs` and `content` fields are missing from the data. Include `showBcs` or `showContent` in the request."
    );
  }

  static async fetch<T extends PhantomReified<PhantomTypeArgument>>(
    client: SuiClient,
    typeArg: T,
    id: string
  ): Promise<UserDeposit<ToPhantomTypeArgument<T>>> {
    const res = await client.getObject({ id, options: { showBcs: true } });
    if (res.error) {
      throw new Error(`error fetching UserDeposit object at id ${id}: ${res.error.code}`);
    }
    if (res.data?.bcs?.dataType !== "moveObject" || !isUserDeposit(res.data.bcs.type)) {
      throw new Error(`object at id ${id} is not a UserDeposit object`);
    }

    return UserDeposit.fromSuiObjectData(typeArg, res.data);
  }
}
