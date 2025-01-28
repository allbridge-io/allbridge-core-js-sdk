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
import { Bag } from "../../sui/bag/structs";
import { PKG_V1 } from "../index";
import { bcs } from "@mysten/sui/bcs";
import { SuiClient, SuiObjectData, SuiParsedData } from "@mysten/sui/client";
import { fromB64 } from "@mysten/sui/utils";

/* ============================== FeeCollector =============================== */

export function isFeeCollector(type: string): boolean {
  type = compressSuiType(type);
  return type.startsWith(`${PKG_V1}::fee_collector::FeeCollector` + "<");
}

export interface FeeCollectorFields<Cap extends PhantomTypeArgument> {
  balances: ToField<Bag>;
}

export type FeeCollectorReified<Cap extends PhantomTypeArgument> = Reified<FeeCollector<Cap>, FeeCollectorFields<Cap>>;

export class FeeCollector<Cap extends PhantomTypeArgument> implements StructClass {
  __StructClass = true as const;

  static get $typeName() {
    return `${PKG_V1}::fee_collector::FeeCollector`;
  }
  static readonly $numTypeParams = 1;
  static readonly $isPhantom = [true] as const;

  readonly $typeName = FeeCollector.$typeName;
  readonly $fullTypeName: string;
  readonly $typeArgs: [PhantomToTypeStr<Cap>];
  readonly $isPhantom = FeeCollector.$isPhantom;

  readonly balances: ToField<Bag>;

  private constructor(typeArgs: [PhantomToTypeStr<Cap>], fields: FeeCollectorFields<Cap>) {
    this.$fullTypeName = composeSuiType(FeeCollector.$typeName, ...typeArgs) as string;
    this.$typeArgs = typeArgs;

    this.balances = fields.balances;
  }

  static reified<Cap extends PhantomReified<PhantomTypeArgument>>(
    Cap: Cap
  ): FeeCollectorReified<ToPhantomTypeArgument<Cap>> {
    return {
      typeName: FeeCollector.$typeName,
      fullTypeName: composeSuiType(FeeCollector.$typeName, ...[extractType(Cap)]) as string,
      typeArgs: [extractType(Cap)] as [PhantomToTypeStr<ToPhantomTypeArgument<Cap>>],
      isPhantom: FeeCollector.$isPhantom,
      reifiedTypeArgs: [Cap],
      fromFields: (fields: Record<string, any>) => FeeCollector.fromFields(Cap, fields),
      fromFieldsWithTypes: (item: FieldsWithTypes) => FeeCollector.fromFieldsWithTypes(Cap, item),
      fromBcs: (data: Uint8Array) => FeeCollector.fromBcs(Cap, data),
      bcs: FeeCollector.bcs,
      fromJSONField: (field: any) => FeeCollector.fromJSONField(Cap, field),
      fromJSON: (json: Record<string, any>) => FeeCollector.fromJSON(Cap, json),
      fromSuiParsedData: (content: SuiParsedData) => FeeCollector.fromSuiParsedData(Cap, content),
      fromSuiObjectData: (content: SuiObjectData) => FeeCollector.fromSuiObjectData(Cap, content),
      fetch: async (client: SuiClient, id: string) => FeeCollector.fetch(client, Cap, id),
      new: (fields: FeeCollectorFields<ToPhantomTypeArgument<Cap>>) => {
        return new FeeCollector([extractType(Cap)], fields);
      },
      kind: "StructClassReified",
    };
  }

  static get r() {
    return FeeCollector.reified;
  }

  static phantom<Cap extends PhantomReified<PhantomTypeArgument>>(
    Cap: Cap
  ): PhantomReified<ToTypeStr<FeeCollector<ToPhantomTypeArgument<Cap>>>> {
    return phantom(FeeCollector.reified(Cap));
  }
  static get p() {
    return FeeCollector.phantom;
  }

  static get bcs() {
    return bcs.struct("FeeCollector", {
      balances: Bag.bcs,
    });
  }

  static fromFields<Cap extends PhantomReified<PhantomTypeArgument>>(
    typeArg: Cap,
    fields: Record<string, any>
  ): FeeCollector<ToPhantomTypeArgument<Cap>> {
    return FeeCollector.reified(typeArg).new({
      balances: decodeFromFields(Bag.reified(), fields.balances),
    });
  }

  static fromFieldsWithTypes<Cap extends PhantomReified<PhantomTypeArgument>>(
    typeArg: Cap,
    item: FieldsWithTypes
  ): FeeCollector<ToPhantomTypeArgument<Cap>> {
    if (!isFeeCollector(item.type)) {
      throw new Error("not a FeeCollector type");
    }
    assertFieldsWithTypesArgsMatch(item, [typeArg]);

    return FeeCollector.reified(typeArg).new({
      balances: decodeFromFieldsWithTypes(Bag.reified(), item.fields.balances),
    });
  }

  static fromBcs<Cap extends PhantomReified<PhantomTypeArgument>>(
    typeArg: Cap,
    data: Uint8Array
  ): FeeCollector<ToPhantomTypeArgument<Cap>> {
    return FeeCollector.fromFields(typeArg, FeeCollector.bcs.parse(data));
  }

  toJSONField() {
    return {
      balances: this.balances.toJSONField(),
    };
  }

  toJSON() {
    return {
      $typeName: this.$typeName,
      $typeArgs: this.$typeArgs,
      ...this.toJSONField(),
    };
  }

  static fromJSONField<Cap extends PhantomReified<PhantomTypeArgument>>(
    typeArg: Cap,
    field: any
  ): FeeCollector<ToPhantomTypeArgument<Cap>> {
    return FeeCollector.reified(typeArg).new({
      balances: decodeFromJSONField(Bag.reified(), field.balances),
    });
  }

  static fromJSON<Cap extends PhantomReified<PhantomTypeArgument>>(
    typeArg: Cap,
    json: Record<string, any>
  ): FeeCollector<ToPhantomTypeArgument<Cap>> {
    if (json.$typeName !== FeeCollector.$typeName) {
      throw new Error("not a WithTwoGenerics json object");
    }
    assertReifiedTypeArgsMatch(composeSuiType(FeeCollector.$typeName, extractType(typeArg)), json.$typeArgs, [typeArg]);

    return FeeCollector.fromJSONField(typeArg, json);
  }

  static fromSuiParsedData<Cap extends PhantomReified<PhantomTypeArgument>>(
    typeArg: Cap,
    content: SuiParsedData
  ): FeeCollector<ToPhantomTypeArgument<Cap>> {
    if (content.dataType !== "moveObject") {
      throw new Error("not an object");
    }
    if (!isFeeCollector(content.type)) {
      throw new Error(`object at ${(content.fields as any).id} is not a FeeCollector object`);
    }
    return FeeCollector.fromFieldsWithTypes(typeArg, content);
  }

  static fromSuiObjectData<Cap extends PhantomReified<PhantomTypeArgument>>(
    typeArg: Cap,
    data: SuiObjectData
  ): FeeCollector<ToPhantomTypeArgument<Cap>> {
    if (data.bcs) {
      if (data.bcs.dataType !== "moveObject" || !isFeeCollector(data.bcs.type)) {
        throw new Error(`object at is not a FeeCollector object`);
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

      return FeeCollector.fromBcs(typeArg, fromB64(data.bcs.bcsBytes));
    }
    if (data.content) {
      return FeeCollector.fromSuiParsedData(typeArg, data.content);
    }
    throw new Error(
      "Both `bcs` and `content` fields are missing from the data. Include `showBcs` or `showContent` in the request."
    );
  }

  static async fetch<Cap extends PhantomReified<PhantomTypeArgument>>(
    client: SuiClient,
    typeArg: Cap,
    id: string
  ): Promise<FeeCollector<ToPhantomTypeArgument<Cap>>> {
    const res = await client.getObject({ id, options: { showBcs: true } });
    if (res.error) {
      throw new Error(`error fetching FeeCollector object at id ${id}: ${res.error.code}`);
    }
    if (res.data?.bcs?.dataType !== "moveObject" || !isFeeCollector(res.data.bcs.type)) {
      throw new Error(`object at id ${id} is not a FeeCollector object`);
    }

    return FeeCollector.fromSuiObjectData(typeArg, res.data);
  }
}
