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
} from "../../../../_framework/reified";
import { FieldsWithTypes, composeSuiType, compressSuiType, parseTypeName } from "../../../../_framework/util";
import { PKG_V1 } from "../index";
import { bcs } from "@mysten/sui/bcs";
import { SuiClient, SuiObjectData, SuiParsedData } from "@mysten/sui/client";
import { fromB64 } from "@mysten/sui/utils";

/* ============================== MintAllowance =============================== */

export function isMintAllowance(type: string): boolean {
  type = compressSuiType(type);
  return type.startsWith(`${PKG_V1}::mint_allowance::MintAllowance` + "<");
}

export interface MintAllowanceFields<T extends PhantomTypeArgument> {
  value: ToField<"u64">;
}

export type MintAllowanceReified<T extends PhantomTypeArgument> = Reified<MintAllowance<T>, MintAllowanceFields<T>>;

export class MintAllowance<T extends PhantomTypeArgument> implements StructClass {
  __StructClass = true as const;

  static get $typeName() {
    return `${PKG_V1}::mint_allowance::MintAllowance`;
  }
  static readonly $numTypeParams = 1;
  static readonly $isPhantom = [true] as const;

  readonly $typeName = MintAllowance.$typeName;
  readonly $fullTypeName: string;
  readonly $typeArgs: [PhantomToTypeStr<T>];
  readonly $isPhantom = MintAllowance.$isPhantom;

  readonly value: ToField<"u64">;

  private constructor(typeArgs: [PhantomToTypeStr<T>], fields: MintAllowanceFields<T>) {
    this.$fullTypeName = composeSuiType(MintAllowance.$typeName, ...typeArgs) as string;
    this.$typeArgs = typeArgs;

    this.value = fields.value;
  }

  static reified<T extends PhantomReified<PhantomTypeArgument>>(T: T): MintAllowanceReified<ToPhantomTypeArgument<T>> {
    return {
      typeName: MintAllowance.$typeName,
      fullTypeName: composeSuiType(MintAllowance.$typeName, ...[extractType(T)]) as string,
      typeArgs: [extractType(T)] as [PhantomToTypeStr<ToPhantomTypeArgument<T>>],
      isPhantom: MintAllowance.$isPhantom,
      reifiedTypeArgs: [T],
      fromFields: (fields: Record<string, any>) => MintAllowance.fromFields(T, fields),
      fromFieldsWithTypes: (item: FieldsWithTypes) => MintAllowance.fromFieldsWithTypes(T, item),
      fromBcs: (data: Uint8Array) => MintAllowance.fromBcs(T, data),
      bcs: MintAllowance.bcs,
      fromJSONField: (field: any) => MintAllowance.fromJSONField(T, field),
      fromJSON: (json: Record<string, any>) => MintAllowance.fromJSON(T, json),
      fromSuiParsedData: (content: SuiParsedData) => MintAllowance.fromSuiParsedData(T, content),
      fromSuiObjectData: (content: SuiObjectData) => MintAllowance.fromSuiObjectData(T, content),
      fetch: async (client: SuiClient, id: string) => MintAllowance.fetch(client, T, id),
      new: (fields: MintAllowanceFields<ToPhantomTypeArgument<T>>) => {
        return new MintAllowance([extractType(T)], fields);
      },
      kind: "StructClassReified",
    };
  }

  static get r() {
    return MintAllowance.reified;
  }

  static phantom<T extends PhantomReified<PhantomTypeArgument>>(
    T: T
  ): PhantomReified<ToTypeStr<MintAllowance<ToPhantomTypeArgument<T>>>> {
    return phantom(MintAllowance.reified(T));
  }
  static get p() {
    return MintAllowance.phantom;
  }

  static get bcs() {
    return bcs.struct("MintAllowance", {
      value: bcs.u64(),
    });
  }

  static fromFields<T extends PhantomReified<PhantomTypeArgument>>(
    typeArg: T,
    fields: Record<string, any>
  ): MintAllowance<ToPhantomTypeArgument<T>> {
    return MintAllowance.reified(typeArg).new({
      value: decodeFromFields("u64", fields.value),
    });
  }

  static fromFieldsWithTypes<T extends PhantomReified<PhantomTypeArgument>>(
    typeArg: T,
    item: FieldsWithTypes
  ): MintAllowance<ToPhantomTypeArgument<T>> {
    if (!isMintAllowance(item.type)) {
      throw new Error("not a MintAllowance type");
    }
    assertFieldsWithTypesArgsMatch(item, [typeArg]);

    return MintAllowance.reified(typeArg).new({
      value: decodeFromFieldsWithTypes("u64", item.fields.value),
    });
  }

  static fromBcs<T extends PhantomReified<PhantomTypeArgument>>(
    typeArg: T,
    data: Uint8Array
  ): MintAllowance<ToPhantomTypeArgument<T>> {
    return MintAllowance.fromFields(typeArg, MintAllowance.bcs.parse(data));
  }

  toJSONField() {
    return {
      value: this.value.toString(),
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
  ): MintAllowance<ToPhantomTypeArgument<T>> {
    return MintAllowance.reified(typeArg).new({
      value: decodeFromJSONField("u64", field.value),
    });
  }

  static fromJSON<T extends PhantomReified<PhantomTypeArgument>>(
    typeArg: T,
    json: Record<string, any>
  ): MintAllowance<ToPhantomTypeArgument<T>> {
    if (json.$typeName !== MintAllowance.$typeName) {
      throw new Error("not a WithTwoGenerics json object");
    }
    assertReifiedTypeArgsMatch(composeSuiType(MintAllowance.$typeName, extractType(typeArg)), json.$typeArgs, [
      typeArg,
    ]);

    return MintAllowance.fromJSONField(typeArg, json);
  }

  static fromSuiParsedData<T extends PhantomReified<PhantomTypeArgument>>(
    typeArg: T,
    content: SuiParsedData
  ): MintAllowance<ToPhantomTypeArgument<T>> {
    if (content.dataType !== "moveObject") {
      throw new Error("not an object");
    }
    if (!isMintAllowance(content.type)) {
      throw new Error(`object at ${(content.fields as any).id} is not a MintAllowance object`);
    }
    return MintAllowance.fromFieldsWithTypes(typeArg, content);
  }

  static fromSuiObjectData<T extends PhantomReified<PhantomTypeArgument>>(
    typeArg: T,
    data: SuiObjectData
  ): MintAllowance<ToPhantomTypeArgument<T>> {
    if (data.bcs) {
      if (data.bcs.dataType !== "moveObject" || !isMintAllowance(data.bcs.type)) {
        throw new Error(`object at is not a MintAllowance object`);
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

      return MintAllowance.fromBcs(typeArg, fromB64(data.bcs.bcsBytes));
    }
    if (data.content) {
      return MintAllowance.fromSuiParsedData(typeArg, data.content);
    }
    throw new Error(
      "Both `bcs` and `content` fields are missing from the data. Include `showBcs` or `showContent` in the request."
    );
  }

  static async fetch<T extends PhantomReified<PhantomTypeArgument>>(
    client: SuiClient,
    typeArg: T,
    id: string
  ): Promise<MintAllowance<ToPhantomTypeArgument<T>>> {
    const res = await client.getObject({ id, options: { showBcs: true } });
    if (res.error) {
      throw new Error(`error fetching MintAllowance object at id ${id}: ${res.error.code}`);
    }
    if (res.data?.bcs?.dataType !== "moveObject" || !isMintAllowance(res.data.bcs.type)) {
      throw new Error(`object at id ${id} is not a MintAllowance object`);
    }

    return MintAllowance.fromSuiObjectData(typeArg, res.data);
  }
}
