// @ts-nocheck
import * as reified from "../../../../_framework/reified";
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
  ToTypeStr as ToPhantom,
} from "../../../../_framework/reified";
import { FieldsWithTypes, composeSuiType, compressSuiType, parseTypeName } from "../../../../_framework/util";
import { Table } from "../../../../sui/table/structs";
import { PKG_V1 } from "../index";
import { bcs } from "@mysten/sui/bcs";
import { SuiClient, SuiObjectData, SuiParsedData } from "@mysten/sui/client";
import { fromB64 } from "@mysten/sui/utils";

/* ============================== Empty =============================== */

export function isEmpty(type: string): boolean {
  type = compressSuiType(type);
  return type === `${PKG_V1}::set::Empty`;
}

export interface EmptyFields {
  dummyField: ToField<"bool">;
}

export type EmptyReified = Reified<Empty, EmptyFields>;

export class Empty implements StructClass {
  __StructClass = true as const;

  static get $typeName() {
    return `${PKG_V1}::set::Empty`;
  }
  static readonly $numTypeParams = 0;
  static readonly $isPhantom = [] as const;

  readonly $typeName = Empty.$typeName;
  readonly $fullTypeName: string;
  readonly $typeArgs: [];
  readonly $isPhantom = Empty.$isPhantom;

  readonly dummyField: ToField<"bool">;

  private constructor(typeArgs: [], fields: EmptyFields) {
    this.$fullTypeName = composeSuiType(Empty.$typeName, ...typeArgs) as string;
    this.$typeArgs = typeArgs;

    this.dummyField = fields.dummyField;
  }

  static reified(): EmptyReified {
    return {
      typeName: Empty.$typeName,
      fullTypeName: composeSuiType(Empty.$typeName, ...[]) as string,
      typeArgs: [] as [],
      isPhantom: Empty.$isPhantom,
      reifiedTypeArgs: [],
      fromFields: (fields: Record<string, any>) => Empty.fromFields(fields),
      fromFieldsWithTypes: (item: FieldsWithTypes) => Empty.fromFieldsWithTypes(item),
      fromBcs: (data: Uint8Array) => Empty.fromBcs(data),
      bcs: Empty.bcs,
      fromJSONField: (field: any) => Empty.fromJSONField(field),
      fromJSON: (json: Record<string, any>) => Empty.fromJSON(json),
      fromSuiParsedData: (content: SuiParsedData) => Empty.fromSuiParsedData(content),
      fromSuiObjectData: (content: SuiObjectData) => Empty.fromSuiObjectData(content),
      fetch: async (client: SuiClient, id: string) => Empty.fetch(client, id),
      new: (fields: EmptyFields) => {
        return new Empty([], fields);
      },
      kind: "StructClassReified",
    };
  }

  static get r() {
    return Empty.reified();
  }

  static phantom(): PhantomReified<ToTypeStr<Empty>> {
    return phantom(Empty.reified());
  }
  static get p() {
    return Empty.phantom();
  }

  static get bcs() {
    return bcs.struct("Empty", {
      dummy_field: bcs.bool(),
    });
  }

  static fromFields(fields: Record<string, any>): Empty {
    return Empty.reified().new({
      dummyField: decodeFromFields("bool", fields.dummy_field),
    });
  }

  static fromFieldsWithTypes(item: FieldsWithTypes): Empty {
    if (!isEmpty(item.type)) {
      throw new Error("not a Empty type");
    }

    return Empty.reified().new({
      dummyField: decodeFromFieldsWithTypes("bool", item.fields.dummy_field),
    });
  }

  static fromBcs(data: Uint8Array): Empty {
    return Empty.fromFields(Empty.bcs.parse(data));
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

  static fromJSONField(field: any): Empty {
    return Empty.reified().new({
      dummyField: decodeFromJSONField("bool", field.dummyField),
    });
  }

  static fromJSON(json: Record<string, any>): Empty {
    if (json.$typeName !== Empty.$typeName) {
      throw new Error("not a WithTwoGenerics json object");
    }

    return Empty.fromJSONField(json);
  }

  static fromSuiParsedData(content: SuiParsedData): Empty {
    if (content.dataType !== "moveObject") {
      throw new Error("not an object");
    }
    if (!isEmpty(content.type)) {
      throw new Error(`object at ${(content.fields as any).id} is not a Empty object`);
    }
    return Empty.fromFieldsWithTypes(content);
  }

  static fromSuiObjectData(data: SuiObjectData): Empty {
    if (data.bcs) {
      if (data.bcs.dataType !== "moveObject" || !isEmpty(data.bcs.type)) {
        throw new Error(`object at is not a Empty object`);
      }

      return Empty.fromBcs(fromB64(data.bcs.bcsBytes));
    }
    if (data.content) {
      return Empty.fromSuiParsedData(data.content);
    }
    throw new Error(
      "Both `bcs` and `content` fields are missing from the data. Include `showBcs` or `showContent` in the request."
    );
  }

  static async fetch(client: SuiClient, id: string): Promise<Empty> {
    const res = await client.getObject({ id, options: { showBcs: true } });
    if (res.error) {
      throw new Error(`error fetching Empty object at id ${id}: ${res.error.code}`);
    }
    if (res.data?.bcs?.dataType !== "moveObject" || !isEmpty(res.data.bcs.type)) {
      throw new Error(`object at id ${id} is not a Empty object`);
    }

    return Empty.fromSuiObjectData(res.data);
  }
}

/* ============================== Set =============================== */

export function isSet(type: string): boolean {
  type = compressSuiType(type);
  return type.startsWith(`${PKG_V1}::set::Set` + "<");
}

export interface SetFields<T extends PhantomTypeArgument> {
  items: ToField<Table<T, ToPhantom<Empty>>>;
}

export type SetReified<T extends PhantomTypeArgument> = Reified<Set<T>, SetFields<T>>;

export class Set<T extends PhantomTypeArgument> implements StructClass {
  __StructClass = true as const;

  static get $typeName() {
    return `${PKG_V1}::set::Set`;
  }
  static readonly $numTypeParams = 1;
  static readonly $isPhantom = [true] as const;

  readonly $typeName = Set.$typeName;
  readonly $fullTypeName: string;
  readonly $typeArgs: [PhantomToTypeStr<T>];
  readonly $isPhantom = Set.$isPhantom;

  readonly items: ToField<Table<T, ToPhantom<Empty>>>;

  private constructor(typeArgs: [PhantomToTypeStr<T>], fields: SetFields<T>) {
    this.$fullTypeName = composeSuiType(Set.$typeName, ...typeArgs) as string;
    this.$typeArgs = typeArgs;

    this.items = fields.items;
  }

  static reified<T extends PhantomReified<PhantomTypeArgument>>(T: T): SetReified<ToPhantomTypeArgument<T>> {
    return {
      typeName: Set.$typeName,
      fullTypeName: composeSuiType(Set.$typeName, ...[extractType(T)]) as string,
      typeArgs: [extractType(T)] as [PhantomToTypeStr<ToPhantomTypeArgument<T>>],
      isPhantom: Set.$isPhantom,
      reifiedTypeArgs: [T],
      fromFields: (fields: Record<string, any>) => Set.fromFields(T, fields),
      fromFieldsWithTypes: (item: FieldsWithTypes) => Set.fromFieldsWithTypes(T, item),
      fromBcs: (data: Uint8Array) => Set.fromBcs(T, data),
      bcs: Set.bcs,
      fromJSONField: (field: any) => Set.fromJSONField(T, field),
      fromJSON: (json: Record<string, any>) => Set.fromJSON(T, json),
      fromSuiParsedData: (content: SuiParsedData) => Set.fromSuiParsedData(T, content),
      fromSuiObjectData: (content: SuiObjectData) => Set.fromSuiObjectData(T, content),
      fetch: async (client: SuiClient, id: string) => Set.fetch(client, T, id),
      new: (fields: SetFields<ToPhantomTypeArgument<T>>) => {
        return new Set([extractType(T)], fields);
      },
      kind: "StructClassReified",
    };
  }

  static get r() {
    return Set.reified;
  }

  static phantom<T extends PhantomReified<PhantomTypeArgument>>(
    T: T
  ): PhantomReified<ToTypeStr<Set<ToPhantomTypeArgument<T>>>> {
    return phantom(Set.reified(T));
  }
  static get p() {
    return Set.phantom;
  }

  static get bcs() {
    return bcs.struct("Set", {
      items: Table.bcs,
    });
  }

  static fromFields<T extends PhantomReified<PhantomTypeArgument>>(
    typeArg: T,
    fields: Record<string, any>
  ): Set<ToPhantomTypeArgument<T>> {
    return Set.reified(typeArg).new({
      items: decodeFromFields(Table.reified(typeArg, reified.phantom(Empty.reified())), fields.items),
    });
  }

  static fromFieldsWithTypes<T extends PhantomReified<PhantomTypeArgument>>(
    typeArg: T,
    item: FieldsWithTypes
  ): Set<ToPhantomTypeArgument<T>> {
    if (!isSet(item.type)) {
      throw new Error("not a Set type");
    }
    assertFieldsWithTypesArgsMatch(item, [typeArg]);

    return Set.reified(typeArg).new({
      items: decodeFromFieldsWithTypes(Table.reified(typeArg, reified.phantom(Empty.reified())), item.fields.items),
    });
  }

  static fromBcs<T extends PhantomReified<PhantomTypeArgument>>(
    typeArg: T,
    data: Uint8Array
  ): Set<ToPhantomTypeArgument<T>> {
    return Set.fromFields(typeArg, Set.bcs.parse(data));
  }

  toJSONField() {
    return {
      items: this.items.toJSONField(),
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
  ): Set<ToPhantomTypeArgument<T>> {
    return Set.reified(typeArg).new({
      items: decodeFromJSONField(Table.reified(typeArg, reified.phantom(Empty.reified())), field.items),
    });
  }

  static fromJSON<T extends PhantomReified<PhantomTypeArgument>>(
    typeArg: T,
    json: Record<string, any>
  ): Set<ToPhantomTypeArgument<T>> {
    if (json.$typeName !== Set.$typeName) {
      throw new Error("not a WithTwoGenerics json object");
    }
    assertReifiedTypeArgsMatch(composeSuiType(Set.$typeName, extractType(typeArg)), json.$typeArgs, [typeArg]);

    return Set.fromJSONField(typeArg, json);
  }

  static fromSuiParsedData<T extends PhantomReified<PhantomTypeArgument>>(
    typeArg: T,
    content: SuiParsedData
  ): Set<ToPhantomTypeArgument<T>> {
    if (content.dataType !== "moveObject") {
      throw new Error("not an object");
    }
    if (!isSet(content.type)) {
      throw new Error(`object at ${(content.fields as any).id} is not a Set object`);
    }
    return Set.fromFieldsWithTypes(typeArg, content);
  }

  static fromSuiObjectData<T extends PhantomReified<PhantomTypeArgument>>(
    typeArg: T,
    data: SuiObjectData
  ): Set<ToPhantomTypeArgument<T>> {
    if (data.bcs) {
      if (data.bcs.dataType !== "moveObject" || !isSet(data.bcs.type)) {
        throw new Error(`object at is not a Set object`);
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

      return Set.fromBcs(typeArg, fromB64(data.bcs.bcsBytes));
    }
    if (data.content) {
      return Set.fromSuiParsedData(typeArg, data.content);
    }
    throw new Error(
      "Both `bcs` and `content` fields are missing from the data. Include `showBcs` or `showContent` in the request."
    );
  }

  static async fetch<T extends PhantomReified<PhantomTypeArgument>>(
    client: SuiClient,
    typeArg: T,
    id: string
  ): Promise<Set<ToPhantomTypeArgument<T>>> {
    const res = await client.getObject({ id, options: { showBcs: true } });
    if (res.error) {
      throw new Error(`error fetching Set object at id ${id}: ${res.error.code}`);
    }
    if (res.data?.bcs?.dataType !== "moveObject" || !isSet(res.data.bcs.type)) {
      throw new Error(`object at id ${id} is not a Set object`);
    }

    return Set.fromSuiObjectData(typeArg, res.data);
  }
}
