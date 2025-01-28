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
import { UID } from "../../sui/object/structs";
import { Table } from "../../sui/table/structs";
import { PKG_V1 } from "../index";
import { bcs } from "@mysten/sui/bcs";
import { SuiClient, SuiObjectData, SuiParsedData } from "@mysten/sui/client";
import { fromB64 } from "@mysten/sui/utils";

/* ============================== AdminCap =============================== */

export function isAdminCap(type: string): boolean {
  type = compressSuiType(type);
  return type === `${PKG_V1}::gas_oracle::AdminCap`;
}

export interface AdminCapFields {
  id: ToField<UID>;
}

export type AdminCapReified = Reified<AdminCap, AdminCapFields>;

export class AdminCap implements StructClass {
  __StructClass = true as const;

  static get $typeName() {
    return `${PKG_V1}::gas_oracle::AdminCap`;
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

/* ============================== ChainData =============================== */

export function isChainData(type: string): boolean {
  type = compressSuiType(type);
  return type === `${PKG_V1}::gas_oracle::ChainData`;
}

export interface ChainDataFields {
  gasPrice: ToField<"u128">;
  price: ToField<"u128">;
}

export type ChainDataReified = Reified<ChainData, ChainDataFields>;

export class ChainData implements StructClass {
  __StructClass = true as const;

  static get $typeName() {
    return `${PKG_V1}::gas_oracle::ChainData`;
  }
  static readonly $numTypeParams = 0;
  static readonly $isPhantom = [] as const;

  readonly $typeName = ChainData.$typeName;
  readonly $fullTypeName: string;
  readonly $typeArgs: [];
  readonly $isPhantom = ChainData.$isPhantom;

  readonly gasPrice: ToField<"u128">;
  readonly price: ToField<"u128">;

  private constructor(typeArgs: [], fields: ChainDataFields) {
    this.$fullTypeName = composeSuiType(ChainData.$typeName, ...typeArgs) as string;
    this.$typeArgs = typeArgs;

    this.gasPrice = fields.gasPrice;
    this.price = fields.price;
  }

  static reified(): ChainDataReified {
    return {
      typeName: ChainData.$typeName,
      fullTypeName: composeSuiType(ChainData.$typeName, ...[]) as string,
      typeArgs: [] as [],
      isPhantom: ChainData.$isPhantom,
      reifiedTypeArgs: [],
      fromFields: (fields: Record<string, any>) => ChainData.fromFields(fields),
      fromFieldsWithTypes: (item: FieldsWithTypes) => ChainData.fromFieldsWithTypes(item),
      fromBcs: (data: Uint8Array) => ChainData.fromBcs(data),
      bcs: ChainData.bcs,
      fromJSONField: (field: any) => ChainData.fromJSONField(field),
      fromJSON: (json: Record<string, any>) => ChainData.fromJSON(json),
      fromSuiParsedData: (content: SuiParsedData) => ChainData.fromSuiParsedData(content),
      fromSuiObjectData: (content: SuiObjectData) => ChainData.fromSuiObjectData(content),
      fetch: async (client: SuiClient, id: string) => ChainData.fetch(client, id),
      new: (fields: ChainDataFields) => {
        return new ChainData([], fields);
      },
      kind: "StructClassReified",
    };
  }

  static get r() {
    return ChainData.reified();
  }

  static phantom(): PhantomReified<ToTypeStr<ChainData>> {
    return phantom(ChainData.reified());
  }
  static get p() {
    return ChainData.phantom();
  }

  static get bcs() {
    return bcs.struct("ChainData", {
      gas_price: bcs.u128(),
      price: bcs.u128(),
    });
  }

  static fromFields(fields: Record<string, any>): ChainData {
    return ChainData.reified().new({
      gasPrice: decodeFromFields("u128", fields.gas_price),
      price: decodeFromFields("u128", fields.price),
    });
  }

  static fromFieldsWithTypes(item: FieldsWithTypes): ChainData {
    if (!isChainData(item.type)) {
      throw new Error("not a ChainData type");
    }

    return ChainData.reified().new({
      gasPrice: decodeFromFieldsWithTypes("u128", item.fields.gas_price),
      price: decodeFromFieldsWithTypes("u128", item.fields.price),
    });
  }

  static fromBcs(data: Uint8Array): ChainData {
    return ChainData.fromFields(ChainData.bcs.parse(data));
  }

  toJSONField() {
    return {
      gasPrice: this.gasPrice.toString(),
      price: this.price.toString(),
    };
  }

  toJSON() {
    return {
      $typeName: this.$typeName,
      $typeArgs: this.$typeArgs,
      ...this.toJSONField(),
    };
  }

  static fromJSONField(field: any): ChainData {
    return ChainData.reified().new({
      gasPrice: decodeFromJSONField("u128", field.gasPrice),
      price: decodeFromJSONField("u128", field.price),
    });
  }

  static fromJSON(json: Record<string, any>): ChainData {
    if (json.$typeName !== ChainData.$typeName) {
      throw new Error("not a WithTwoGenerics json object");
    }

    return ChainData.fromJSONField(json);
  }

  static fromSuiParsedData(content: SuiParsedData): ChainData {
    if (content.dataType !== "moveObject") {
      throw new Error("not an object");
    }
    if (!isChainData(content.type)) {
      throw new Error(`object at ${(content.fields as any).id} is not a ChainData object`);
    }
    return ChainData.fromFieldsWithTypes(content);
  }

  static fromSuiObjectData(data: SuiObjectData): ChainData {
    if (data.bcs) {
      if (data.bcs.dataType !== "moveObject" || !isChainData(data.bcs.type)) {
        throw new Error(`object at is not a ChainData object`);
      }

      return ChainData.fromBcs(fromB64(data.bcs.bcsBytes));
    }
    if (data.content) {
      return ChainData.fromSuiParsedData(data.content);
    }
    throw new Error(
      "Both `bcs` and `content` fields are missing from the data. Include `showBcs` or `showContent` in the request."
    );
  }

  static async fetch(client: SuiClient, id: string): Promise<ChainData> {
    const res = await client.getObject({ id, options: { showBcs: true } });
    if (res.error) {
      throw new Error(`error fetching ChainData object at id ${id}: ${res.error.code}`);
    }
    if (res.data?.bcs?.dataType !== "moveObject" || !isChainData(res.data.bcs.type)) {
      throw new Error(`object at id ${id} is not a ChainData object`);
    }

    return ChainData.fromSuiObjectData(res.data);
  }
}

/* ============================== GasOracle =============================== */

export function isGasOracle(type: string): boolean {
  type = compressSuiType(type);
  return type === `${PKG_V1}::gas_oracle::GasOracle`;
}

export interface GasOracleFields {
  id: ToField<UID>;
  data: ToField<Table<"u8", ToPhantom<ChainData>>>;
}

export type GasOracleReified = Reified<GasOracle, GasOracleFields>;

export class GasOracle implements StructClass {
  __StructClass = true as const;

  static get $typeName() {
    return `${PKG_V1}::gas_oracle::GasOracle`;
  }
  static readonly $numTypeParams = 0;
  static readonly $isPhantom = [] as const;

  readonly $typeName = GasOracle.$typeName;
  readonly $fullTypeName: string;
  readonly $typeArgs: [];
  readonly $isPhantom = GasOracle.$isPhantom;

  readonly id: ToField<UID>;
  readonly data: ToField<Table<"u8", ToPhantom<ChainData>>>;

  private constructor(typeArgs: [], fields: GasOracleFields) {
    this.$fullTypeName = composeSuiType(GasOracle.$typeName, ...typeArgs) as string;
    this.$typeArgs = typeArgs;

    this.id = fields.id;
    this.data = fields.data;
  }

  static reified(): GasOracleReified {
    return {
      typeName: GasOracle.$typeName,
      fullTypeName: composeSuiType(GasOracle.$typeName, ...[]) as string,
      typeArgs: [] as [],
      isPhantom: GasOracle.$isPhantom,
      reifiedTypeArgs: [],
      fromFields: (fields: Record<string, any>) => GasOracle.fromFields(fields),
      fromFieldsWithTypes: (item: FieldsWithTypes) => GasOracle.fromFieldsWithTypes(item),
      fromBcs: (data: Uint8Array) => GasOracle.fromBcs(data),
      bcs: GasOracle.bcs,
      fromJSONField: (field: any) => GasOracle.fromJSONField(field),
      fromJSON: (json: Record<string, any>) => GasOracle.fromJSON(json),
      fromSuiParsedData: (content: SuiParsedData) => GasOracle.fromSuiParsedData(content),
      fromSuiObjectData: (content: SuiObjectData) => GasOracle.fromSuiObjectData(content),
      fetch: async (client: SuiClient, id: string) => GasOracle.fetch(client, id),
      new: (fields: GasOracleFields) => {
        return new GasOracle([], fields);
      },
      kind: "StructClassReified",
    };
  }

  static get r() {
    return GasOracle.reified();
  }

  static phantom(): PhantomReified<ToTypeStr<GasOracle>> {
    return phantom(GasOracle.reified());
  }
  static get p() {
    return GasOracle.phantom();
  }

  static get bcs() {
    return bcs.struct("GasOracle", {
      id: UID.bcs,
      data: Table.bcs,
    });
  }

  static fromFields(fields: Record<string, any>): GasOracle {
    return GasOracle.reified().new({
      id: decodeFromFields(UID.reified(), fields.id),
      data: decodeFromFields(Table.reified(reified.phantom("u8"), reified.phantom(ChainData.reified())), fields.data),
    });
  }

  static fromFieldsWithTypes(item: FieldsWithTypes): GasOracle {
    if (!isGasOracle(item.type)) {
      throw new Error("not a GasOracle type");
    }

    return GasOracle.reified().new({
      id: decodeFromFieldsWithTypes(UID.reified(), item.fields.id),
      data: decodeFromFieldsWithTypes(
        Table.reified(reified.phantom("u8"), reified.phantom(ChainData.reified())),
        item.fields.data
      ),
    });
  }

  static fromBcs(data: Uint8Array): GasOracle {
    return GasOracle.fromFields(GasOracle.bcs.parse(data));
  }

  toJSONField() {
    return {
      id: this.id,
      data: this.data.toJSONField(),
    };
  }

  toJSON() {
    return {
      $typeName: this.$typeName,
      $typeArgs: this.$typeArgs,
      ...this.toJSONField(),
    };
  }

  static fromJSONField(field: any): GasOracle {
    return GasOracle.reified().new({
      id: decodeFromJSONField(UID.reified(), field.id),
      data: decodeFromJSONField(Table.reified(reified.phantom("u8"), reified.phantom(ChainData.reified())), field.data),
    });
  }

  static fromJSON(json: Record<string, any>): GasOracle {
    if (json.$typeName !== GasOracle.$typeName) {
      throw new Error("not a WithTwoGenerics json object");
    }

    return GasOracle.fromJSONField(json);
  }

  static fromSuiParsedData(content: SuiParsedData): GasOracle {
    if (content.dataType !== "moveObject") {
      throw new Error("not an object");
    }
    if (!isGasOracle(content.type)) {
      throw new Error(`object at ${(content.fields as any).id} is not a GasOracle object`);
    }
    return GasOracle.fromFieldsWithTypes(content);
  }

  static fromSuiObjectData(data: SuiObjectData): GasOracle {
    if (data.bcs) {
      if (data.bcs.dataType !== "moveObject" || !isGasOracle(data.bcs.type)) {
        throw new Error(`object at is not a GasOracle object`);
      }

      return GasOracle.fromBcs(fromB64(data.bcs.bcsBytes));
    }
    if (data.content) {
      return GasOracle.fromSuiParsedData(data.content);
    }
    throw new Error(
      "Both `bcs` and `content` fields are missing from the data. Include `showBcs` or `showContent` in the request."
    );
  }

  static async fetch(client: SuiClient, id: string): Promise<GasOracle> {
    const res = await client.getObject({ id, options: { showBcs: true } });
    if (res.error) {
      throw new Error(`error fetching GasOracle object at id ${id}: ${res.error.code}`);
    }
    if (res.data?.bcs?.dataType !== "moveObject" || !isGasOracle(res.data.bcs.type)) {
      throw new Error(`object at id ${id} is not a GasOracle object`);
    }

    return GasOracle.fromSuiObjectData(res.data);
  }
}
