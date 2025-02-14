// @ts-nocheck
import * as reified from "../../../../_framework/reified";
import {
  PhantomReified,
  Reified,
  StructClass,
  ToField,
  ToTypeStr,
  decodeFromFields,
  decodeFromFieldsWithTypes,
  decodeFromJSONField,
  fieldToJSON,
  phantom,
} from "../../../../_framework/reified";
import { FieldsWithTypes, composeSuiType, compressSuiType } from "../../../../_framework/util";
import { Vector } from "../../../../_framework/vector";
import { PKG_V1 } from "../index";
import { bcs } from "@mysten/sui/bcs";
import { SuiClient, SuiObjectData, SuiParsedData } from "@mysten/sui/client";
import { fromB64 } from "@mysten/sui/utils";

/* ============================== Bytes20 =============================== */

export function isBytes20(type: string): boolean {
  type = compressSuiType(type);
  return type === `${PKG_V1}::bytes20::Bytes20`;
}

export interface Bytes20Fields {
  data: ToField<Vector<"u8">>;
}

export type Bytes20Reified = Reified<Bytes20, Bytes20Fields>;

export class Bytes20 implements StructClass {
  __StructClass = true as const;

  static get $typeName() {
    return `${PKG_V1}::bytes20::Bytes20`;
  }
  static readonly $numTypeParams = 0;
  static readonly $isPhantom = [] as const;

  readonly $typeName = Bytes20.$typeName;
  readonly $fullTypeName: string;
  readonly $typeArgs: [];
  readonly $isPhantom = Bytes20.$isPhantom;

  readonly data: ToField<Vector<"u8">>;

  private constructor(typeArgs: [], fields: Bytes20Fields) {
    this.$fullTypeName = composeSuiType(Bytes20.$typeName, ...typeArgs) as string;
    this.$typeArgs = typeArgs;

    this.data = fields.data;
  }

  static reified(): Bytes20Reified {
    return {
      typeName: Bytes20.$typeName,
      fullTypeName: composeSuiType(Bytes20.$typeName, ...[]) as string,
      typeArgs: [] as [],
      isPhantom: Bytes20.$isPhantom,
      reifiedTypeArgs: [],
      fromFields: (fields: Record<string, any>) => Bytes20.fromFields(fields),
      fromFieldsWithTypes: (item: FieldsWithTypes) => Bytes20.fromFieldsWithTypes(item),
      fromBcs: (data: Uint8Array) => Bytes20.fromBcs(data),
      bcs: Bytes20.bcs,
      fromJSONField: (field: any) => Bytes20.fromJSONField(field),
      fromJSON: (json: Record<string, any>) => Bytes20.fromJSON(json),
      fromSuiParsedData: (content: SuiParsedData) => Bytes20.fromSuiParsedData(content),
      fromSuiObjectData: (content: SuiObjectData) => Bytes20.fromSuiObjectData(content),
      fetch: async (client: SuiClient, id: string) => Bytes20.fetch(client, id),
      new: (fields: Bytes20Fields) => {
        return new Bytes20([], fields);
      },
      kind: "StructClassReified",
    };
  }

  static get r() {
    return Bytes20.reified();
  }

  static phantom(): PhantomReified<ToTypeStr<Bytes20>> {
    return phantom(Bytes20.reified());
  }
  static get p() {
    return Bytes20.phantom();
  }

  static get bcs() {
    return bcs.struct("Bytes20", {
      data: bcs.vector(bcs.u8()),
    });
  }

  static fromFields(fields: Record<string, any>): Bytes20 {
    return Bytes20.reified().new({
      data: decodeFromFields(reified.vector("u8"), fields.data),
    });
  }

  static fromFieldsWithTypes(item: FieldsWithTypes): Bytes20 {
    if (!isBytes20(item.type)) {
      throw new Error("not a Bytes20 type");
    }

    return Bytes20.reified().new({
      data: decodeFromFieldsWithTypes(reified.vector("u8"), item.fields.data),
    });
  }

  static fromBcs(data: Uint8Array): Bytes20 {
    return Bytes20.fromFields(Bytes20.bcs.parse(data));
  }

  toJSONField() {
    return {
      data: fieldToJSON<Vector<"u8">>(`vector<u8>`, this.data),
    };
  }

  toJSON() {
    return {
      $typeName: this.$typeName,
      $typeArgs: this.$typeArgs,
      ...this.toJSONField(),
    };
  }

  static fromJSONField(field: any): Bytes20 {
    return Bytes20.reified().new({
      data: decodeFromJSONField(reified.vector("u8"), field.data),
    });
  }

  static fromJSON(json: Record<string, any>): Bytes20 {
    if (json.$typeName !== Bytes20.$typeName) {
      throw new Error("not a WithTwoGenerics json object");
    }

    return Bytes20.fromJSONField(json);
  }

  static fromSuiParsedData(content: SuiParsedData): Bytes20 {
    if (content.dataType !== "moveObject") {
      throw new Error("not an object");
    }
    if (!isBytes20(content.type)) {
      throw new Error(`object at ${(content.fields as any).id} is not a Bytes20 object`);
    }
    return Bytes20.fromFieldsWithTypes(content);
  }

  static fromSuiObjectData(data: SuiObjectData): Bytes20 {
    if (data.bcs) {
      if (data.bcs.dataType !== "moveObject" || !isBytes20(data.bcs.type)) {
        throw new Error(`object at is not a Bytes20 object`);
      }

      return Bytes20.fromBcs(fromB64(data.bcs.bcsBytes));
    }
    if (data.content) {
      return Bytes20.fromSuiParsedData(data.content);
    }
    throw new Error(
      "Both `bcs` and `content` fields are missing from the data. Include `showBcs` or `showContent` in the request."
    );
  }

  static async fetch(client: SuiClient, id: string): Promise<Bytes20> {
    const res = await client.getObject({ id, options: { showBcs: true } });
    if (res.error) {
      throw new Error(`error fetching Bytes20 object at id ${id}: ${res.error.code}`);
    }
    if (res.data?.bcs?.dataType !== "moveObject" || !isBytes20(res.data.bcs.type)) {
      throw new Error(`object at id ${id} is not a Bytes20 object`);
    }

    return Bytes20.fromSuiObjectData(res.data);
  }
}
