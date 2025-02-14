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
import { PKG_V1 } from "../index";
import { bcs } from "@mysten/sui/bcs";
import { SuiClient, SuiObjectData, SuiParsedData } from "@mysten/sui/client";
import { fromB64 } from "@mysten/sui/utils";

/* ============================== CurrentVersion =============================== */

export function isCurrentVersion(type: string): boolean {
  type = compressSuiType(type);
  return type.startsWith(`${PKG_V1}::version::CurrentVersion` + "<");
}

export interface CurrentVersionFields<Cap extends PhantomTypeArgument> {
  version: ToField<"u64">;
}

export type CurrentVersionReified<Cap extends PhantomTypeArgument> = Reified<
  CurrentVersion<Cap>,
  CurrentVersionFields<Cap>
>;

export class CurrentVersion<Cap extends PhantomTypeArgument> implements StructClass {
  __StructClass = true as const;

  static get $typeName() {
    return `${PKG_V1}::version::CurrentVersion`;
  }
  static readonly $numTypeParams = 1;
  static readonly $isPhantom = [true] as const;

  readonly $typeName = CurrentVersion.$typeName;
  readonly $fullTypeName: string;
  readonly $typeArgs: [PhantomToTypeStr<Cap>];
  readonly $isPhantom = CurrentVersion.$isPhantom;

  readonly version: ToField<"u64">;

  private constructor(typeArgs: [PhantomToTypeStr<Cap>], fields: CurrentVersionFields<Cap>) {
    this.$fullTypeName = composeSuiType(CurrentVersion.$typeName, ...typeArgs) as string;
    this.$typeArgs = typeArgs;

    this.version = fields.version;
  }

  static reified<Cap extends PhantomReified<PhantomTypeArgument>>(
    Cap: Cap
  ): CurrentVersionReified<ToPhantomTypeArgument<Cap>> {
    return {
      typeName: CurrentVersion.$typeName,
      fullTypeName: composeSuiType(CurrentVersion.$typeName, ...[extractType(Cap)]) as string,
      typeArgs: [extractType(Cap)] as [PhantomToTypeStr<ToPhantomTypeArgument<Cap>>],
      isPhantom: CurrentVersion.$isPhantom,
      reifiedTypeArgs: [Cap],
      fromFields: (fields: Record<string, any>) => CurrentVersion.fromFields(Cap, fields),
      fromFieldsWithTypes: (item: FieldsWithTypes) => CurrentVersion.fromFieldsWithTypes(Cap, item),
      fromBcs: (data: Uint8Array) => CurrentVersion.fromBcs(Cap, data),
      bcs: CurrentVersion.bcs,
      fromJSONField: (field: any) => CurrentVersion.fromJSONField(Cap, field),
      fromJSON: (json: Record<string, any>) => CurrentVersion.fromJSON(Cap, json),
      fromSuiParsedData: (content: SuiParsedData) => CurrentVersion.fromSuiParsedData(Cap, content),
      fromSuiObjectData: (content: SuiObjectData) => CurrentVersion.fromSuiObjectData(Cap, content),
      fetch: async (client: SuiClient, id: string) => CurrentVersion.fetch(client, Cap, id),
      new: (fields: CurrentVersionFields<ToPhantomTypeArgument<Cap>>) => {
        return new CurrentVersion([extractType(Cap)], fields);
      },
      kind: "StructClassReified",
    };
  }

  static get r() {
    return CurrentVersion.reified;
  }

  static phantom<Cap extends PhantomReified<PhantomTypeArgument>>(
    Cap: Cap
  ): PhantomReified<ToTypeStr<CurrentVersion<ToPhantomTypeArgument<Cap>>>> {
    return phantom(CurrentVersion.reified(Cap));
  }
  static get p() {
    return CurrentVersion.phantom;
  }

  static get bcs() {
    return bcs.struct("CurrentVersion", {
      version: bcs.u64(),
    });
  }

  static fromFields<Cap extends PhantomReified<PhantomTypeArgument>>(
    typeArg: Cap,
    fields: Record<string, any>
  ): CurrentVersion<ToPhantomTypeArgument<Cap>> {
    return CurrentVersion.reified(typeArg).new({
      version: decodeFromFields("u64", fields.version),
    });
  }

  static fromFieldsWithTypes<Cap extends PhantomReified<PhantomTypeArgument>>(
    typeArg: Cap,
    item: FieldsWithTypes
  ): CurrentVersion<ToPhantomTypeArgument<Cap>> {
    if (!isCurrentVersion(item.type)) {
      throw new Error("not a CurrentVersion type");
    }
    assertFieldsWithTypesArgsMatch(item, [typeArg]);

    return CurrentVersion.reified(typeArg).new({
      version: decodeFromFieldsWithTypes("u64", item.fields.version),
    });
  }

  static fromBcs<Cap extends PhantomReified<PhantomTypeArgument>>(
    typeArg: Cap,
    data: Uint8Array
  ): CurrentVersion<ToPhantomTypeArgument<Cap>> {
    return CurrentVersion.fromFields(typeArg, CurrentVersion.bcs.parse(data));
  }

  toJSONField() {
    return {
      version: this.version.toString(),
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
  ): CurrentVersion<ToPhantomTypeArgument<Cap>> {
    return CurrentVersion.reified(typeArg).new({
      version: decodeFromJSONField("u64", field.version),
    });
  }

  static fromJSON<Cap extends PhantomReified<PhantomTypeArgument>>(
    typeArg: Cap,
    json: Record<string, any>
  ): CurrentVersion<ToPhantomTypeArgument<Cap>> {
    if (json.$typeName !== CurrentVersion.$typeName) {
      throw new Error("not a WithTwoGenerics json object");
    }
    assertReifiedTypeArgsMatch(composeSuiType(CurrentVersion.$typeName, extractType(typeArg)), json.$typeArgs, [
      typeArg,
    ]);

    return CurrentVersion.fromJSONField(typeArg, json);
  }

  static fromSuiParsedData<Cap extends PhantomReified<PhantomTypeArgument>>(
    typeArg: Cap,
    content: SuiParsedData
  ): CurrentVersion<ToPhantomTypeArgument<Cap>> {
    if (content.dataType !== "moveObject") {
      throw new Error("not an object");
    }
    if (!isCurrentVersion(content.type)) {
      throw new Error(`object at ${(content.fields as any).id} is not a CurrentVersion object`);
    }
    return CurrentVersion.fromFieldsWithTypes(typeArg, content);
  }

  static fromSuiObjectData<Cap extends PhantomReified<PhantomTypeArgument>>(
    typeArg: Cap,
    data: SuiObjectData
  ): CurrentVersion<ToPhantomTypeArgument<Cap>> {
    if (data.bcs) {
      if (data.bcs.dataType !== "moveObject" || !isCurrentVersion(data.bcs.type)) {
        throw new Error(`object at is not a CurrentVersion object`);
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

      return CurrentVersion.fromBcs(typeArg, fromB64(data.bcs.bcsBytes));
    }
    if (data.content) {
      return CurrentVersion.fromSuiParsedData(typeArg, data.content);
    }
    throw new Error(
      "Both `bcs` and `content` fields are missing from the data. Include `showBcs` or `showContent` in the request."
    );
  }

  static async fetch<Cap extends PhantomReified<PhantomTypeArgument>>(
    client: SuiClient,
    typeArg: Cap,
    id: string
  ): Promise<CurrentVersion<ToPhantomTypeArgument<Cap>>> {
    const res = await client.getObject({ id, options: { showBcs: true } });
    if (res.error) {
      throw new Error(`error fetching CurrentVersion object at id ${id}: ${res.error.code}`);
    }
    if (res.data?.bcs?.dataType !== "moveObject" || !isCurrentVersion(res.data.bcs.type)) {
      throw new Error(`object at id ${id} is not a CurrentVersion object`);
    }

    return CurrentVersion.fromSuiObjectData(typeArg, res.data);
  }
}
