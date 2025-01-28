// @ts-nocheck
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
} from "../../../../_framework/reified";
import { FieldsWithTypes, composeSuiType, compressSuiType } from "../../../../_framework/util";
import { ID, UID } from "../../../../sui/object/structs";
import { PKG_V1 } from "../index";
import { bcs } from "@mysten/sui/bcs";
import { SuiClient, SuiObjectData, SuiParsedData } from "@mysten/sui/client";
import { fromB64 } from "@mysten/sui/utils";

/* ============================== EmitterCap =============================== */

export function isEmitterCap(type: string): boolean {
  type = compressSuiType(type);
  return type === `${PKG_V1}::emitter::EmitterCap`;
}

export interface EmitterCapFields {
  id: ToField<UID>;
  sequence: ToField<"u64">;
}

export type EmitterCapReified = Reified<EmitterCap, EmitterCapFields>;

export class EmitterCap implements StructClass {
  __StructClass = true as const;

  static get $typeName() {
    return `${PKG_V1}::emitter::EmitterCap`;
  }
  static readonly $numTypeParams = 0;
  static readonly $isPhantom = [] as const;

  readonly $typeName = EmitterCap.$typeName;
  readonly $fullTypeName: string;
  readonly $typeArgs: [];
  readonly $isPhantom = EmitterCap.$isPhantom;

  readonly id: ToField<UID>;
  readonly sequence: ToField<"u64">;

  private constructor(typeArgs: [], fields: EmitterCapFields) {
    this.$fullTypeName = composeSuiType(EmitterCap.$typeName, ...typeArgs) as string;
    this.$typeArgs = typeArgs;

    this.id = fields.id;
    this.sequence = fields.sequence;
  }

  static reified(): EmitterCapReified {
    return {
      typeName: EmitterCap.$typeName,
      fullTypeName: composeSuiType(EmitterCap.$typeName, ...[]) as string,
      typeArgs: [] as [],
      isPhantom: EmitterCap.$isPhantom,
      reifiedTypeArgs: [],
      fromFields: (fields: Record<string, any>) => EmitterCap.fromFields(fields),
      fromFieldsWithTypes: (item: FieldsWithTypes) => EmitterCap.fromFieldsWithTypes(item),
      fromBcs: (data: Uint8Array) => EmitterCap.fromBcs(data),
      bcs: EmitterCap.bcs,
      fromJSONField: (field: any) => EmitterCap.fromJSONField(field),
      fromJSON: (json: Record<string, any>) => EmitterCap.fromJSON(json),
      fromSuiParsedData: (content: SuiParsedData) => EmitterCap.fromSuiParsedData(content),
      fromSuiObjectData: (content: SuiObjectData) => EmitterCap.fromSuiObjectData(content),
      fetch: async (client: SuiClient, id: string) => EmitterCap.fetch(client, id),
      new: (fields: EmitterCapFields) => {
        return new EmitterCap([], fields);
      },
      kind: "StructClassReified",
    };
  }

  static get r() {
    return EmitterCap.reified();
  }

  static phantom(): PhantomReified<ToTypeStr<EmitterCap>> {
    return phantom(EmitterCap.reified());
  }
  static get p() {
    return EmitterCap.phantom();
  }

  static get bcs() {
    return bcs.struct("EmitterCap", {
      id: UID.bcs,
      sequence: bcs.u64(),
    });
  }

  static fromFields(fields: Record<string, any>): EmitterCap {
    return EmitterCap.reified().new({
      id: decodeFromFields(UID.reified(), fields.id),
      sequence: decodeFromFields("u64", fields.sequence),
    });
  }

  static fromFieldsWithTypes(item: FieldsWithTypes): EmitterCap {
    if (!isEmitterCap(item.type)) {
      throw new Error("not a EmitterCap type");
    }

    return EmitterCap.reified().new({
      id: decodeFromFieldsWithTypes(UID.reified(), item.fields.id),
      sequence: decodeFromFieldsWithTypes("u64", item.fields.sequence),
    });
  }

  static fromBcs(data: Uint8Array): EmitterCap {
    return EmitterCap.fromFields(EmitterCap.bcs.parse(data));
  }

  toJSONField() {
    return {
      id: this.id,
      sequence: this.sequence.toString(),
    };
  }

  toJSON() {
    return {
      $typeName: this.$typeName,
      $typeArgs: this.$typeArgs,
      ...this.toJSONField(),
    };
  }

  static fromJSONField(field: any): EmitterCap {
    return EmitterCap.reified().new({
      id: decodeFromJSONField(UID.reified(), field.id),
      sequence: decodeFromJSONField("u64", field.sequence),
    });
  }

  static fromJSON(json: Record<string, any>): EmitterCap {
    if (json.$typeName !== EmitterCap.$typeName) {
      throw new Error("not a WithTwoGenerics json object");
    }

    return EmitterCap.fromJSONField(json);
  }

  static fromSuiParsedData(content: SuiParsedData): EmitterCap {
    if (content.dataType !== "moveObject") {
      throw new Error("not an object");
    }
    if (!isEmitterCap(content.type)) {
      throw new Error(`object at ${(content.fields as any).id} is not a EmitterCap object`);
    }
    return EmitterCap.fromFieldsWithTypes(content);
  }

  static fromSuiObjectData(data: SuiObjectData): EmitterCap {
    if (data.bcs) {
      if (data.bcs.dataType !== "moveObject" || !isEmitterCap(data.bcs.type)) {
        throw new Error(`object at is not a EmitterCap object`);
      }

      return EmitterCap.fromBcs(fromB64(data.bcs.bcsBytes));
    }
    if (data.content) {
      return EmitterCap.fromSuiParsedData(data.content);
    }
    throw new Error(
      "Both `bcs` and `content` fields are missing from the data. Include `showBcs` or `showContent` in the request."
    );
  }

  static async fetch(client: SuiClient, id: string): Promise<EmitterCap> {
    const res = await client.getObject({ id, options: { showBcs: true } });
    if (res.error) {
      throw new Error(`error fetching EmitterCap object at id ${id}: ${res.error.code}`);
    }
    if (res.data?.bcs?.dataType !== "moveObject" || !isEmitterCap(res.data.bcs.type)) {
      throw new Error(`object at id ${id} is not a EmitterCap object`);
    }

    return EmitterCap.fromSuiObjectData(res.data);
  }
}

/* ============================== EmitterCreated =============================== */

export function isEmitterCreated(type: string): boolean {
  type = compressSuiType(type);
  return type === `${PKG_V1}::emitter::EmitterCreated`;
}

export interface EmitterCreatedFields {
  emitterCap: ToField<ID>;
}

export type EmitterCreatedReified = Reified<EmitterCreated, EmitterCreatedFields>;

export class EmitterCreated implements StructClass {
  __StructClass = true as const;

  static get $typeName() {
    return `${PKG_V1}::emitter::EmitterCreated`;
  }
  static readonly $numTypeParams = 0;
  static readonly $isPhantom = [] as const;

  readonly $typeName = EmitterCreated.$typeName;
  readonly $fullTypeName: string;
  readonly $typeArgs: [];
  readonly $isPhantom = EmitterCreated.$isPhantom;

  readonly emitterCap: ToField<ID>;

  private constructor(typeArgs: [], fields: EmitterCreatedFields) {
    this.$fullTypeName = composeSuiType(EmitterCreated.$typeName, ...typeArgs) as string;
    this.$typeArgs = typeArgs;

    this.emitterCap = fields.emitterCap;
  }

  static reified(): EmitterCreatedReified {
    return {
      typeName: EmitterCreated.$typeName,
      fullTypeName: composeSuiType(EmitterCreated.$typeName, ...[]) as string,
      typeArgs: [] as [],
      isPhantom: EmitterCreated.$isPhantom,
      reifiedTypeArgs: [],
      fromFields: (fields: Record<string, any>) => EmitterCreated.fromFields(fields),
      fromFieldsWithTypes: (item: FieldsWithTypes) => EmitterCreated.fromFieldsWithTypes(item),
      fromBcs: (data: Uint8Array) => EmitterCreated.fromBcs(data),
      bcs: EmitterCreated.bcs,
      fromJSONField: (field: any) => EmitterCreated.fromJSONField(field),
      fromJSON: (json: Record<string, any>) => EmitterCreated.fromJSON(json),
      fromSuiParsedData: (content: SuiParsedData) => EmitterCreated.fromSuiParsedData(content),
      fromSuiObjectData: (content: SuiObjectData) => EmitterCreated.fromSuiObjectData(content),
      fetch: async (client: SuiClient, id: string) => EmitterCreated.fetch(client, id),
      new: (fields: EmitterCreatedFields) => {
        return new EmitterCreated([], fields);
      },
      kind: "StructClassReified",
    };
  }

  static get r() {
    return EmitterCreated.reified();
  }

  static phantom(): PhantomReified<ToTypeStr<EmitterCreated>> {
    return phantom(EmitterCreated.reified());
  }
  static get p() {
    return EmitterCreated.phantom();
  }

  static get bcs() {
    return bcs.struct("EmitterCreated", {
      emitter_cap: ID.bcs,
    });
  }

  static fromFields(fields: Record<string, any>): EmitterCreated {
    return EmitterCreated.reified().new({
      emitterCap: decodeFromFields(ID.reified(), fields.emitter_cap),
    });
  }

  static fromFieldsWithTypes(item: FieldsWithTypes): EmitterCreated {
    if (!isEmitterCreated(item.type)) {
      throw new Error("not a EmitterCreated type");
    }

    return EmitterCreated.reified().new({
      emitterCap: decodeFromFieldsWithTypes(ID.reified(), item.fields.emitter_cap),
    });
  }

  static fromBcs(data: Uint8Array): EmitterCreated {
    return EmitterCreated.fromFields(EmitterCreated.bcs.parse(data));
  }

  toJSONField() {
    return {
      emitterCap: this.emitterCap,
    };
  }

  toJSON() {
    return {
      $typeName: this.$typeName,
      $typeArgs: this.$typeArgs,
      ...this.toJSONField(),
    };
  }

  static fromJSONField(field: any): EmitterCreated {
    return EmitterCreated.reified().new({
      emitterCap: decodeFromJSONField(ID.reified(), field.emitterCap),
    });
  }

  static fromJSON(json: Record<string, any>): EmitterCreated {
    if (json.$typeName !== EmitterCreated.$typeName) {
      throw new Error("not a WithTwoGenerics json object");
    }

    return EmitterCreated.fromJSONField(json);
  }

  static fromSuiParsedData(content: SuiParsedData): EmitterCreated {
    if (content.dataType !== "moveObject") {
      throw new Error("not an object");
    }
    if (!isEmitterCreated(content.type)) {
      throw new Error(`object at ${(content.fields as any).id} is not a EmitterCreated object`);
    }
    return EmitterCreated.fromFieldsWithTypes(content);
  }

  static fromSuiObjectData(data: SuiObjectData): EmitterCreated {
    if (data.bcs) {
      if (data.bcs.dataType !== "moveObject" || !isEmitterCreated(data.bcs.type)) {
        throw new Error(`object at is not a EmitterCreated object`);
      }

      return EmitterCreated.fromBcs(fromB64(data.bcs.bcsBytes));
    }
    if (data.content) {
      return EmitterCreated.fromSuiParsedData(data.content);
    }
    throw new Error(
      "Both `bcs` and `content` fields are missing from the data. Include `showBcs` or `showContent` in the request."
    );
  }

  static async fetch(client: SuiClient, id: string): Promise<EmitterCreated> {
    const res = await client.getObject({ id, options: { showBcs: true } });
    if (res.error) {
      throw new Error(`error fetching EmitterCreated object at id ${id}: ${res.error.code}`);
    }
    if (res.data?.bcs?.dataType !== "moveObject" || !isEmitterCreated(res.data.bcs.type)) {
      throw new Error(`object at id ${id} is not a EmitterCreated object`);
    }

    return EmitterCreated.fromSuiObjectData(res.data);
  }
}
