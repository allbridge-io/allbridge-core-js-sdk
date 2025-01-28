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
import { FeeCollector } from "../../utils/fee-collector/structs";
import { PKG_V1 } from "../index";
import { bcs } from "@mysten/sui/bcs";
import { SuiClient, SuiObjectData, SuiParsedData } from "@mysten/sui/client";
import { fromB64 } from "@mysten/sui/utils";

/* ============================== AdminCap =============================== */

export function isAdminCap(type: string): boolean {
  type = compressSuiType(type);
  return type === `${PKG_V1}::cctp_bridge::AdminCap`;
}

export interface AdminCapFields {
  id: ToField<UID>;
}

export type AdminCapReified = Reified<AdminCap, AdminCapFields>;

export class AdminCap implements StructClass {
  __StructClass = true as const;

  static get $typeName() {
    return `${PKG_V1}::cctp_bridge::AdminCap`;
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

/* ============================== FeeCollectorCap =============================== */

export function isFeeCollectorCap(type: string): boolean {
  type = compressSuiType(type);
  return type === `${PKG_V1}::cctp_bridge::FeeCollectorCap`;
}

export interface FeeCollectorCapFields {
  dummyField: ToField<"bool">;
}

export type FeeCollectorCapReified = Reified<FeeCollectorCap, FeeCollectorCapFields>;

export class FeeCollectorCap implements StructClass {
  __StructClass = true as const;

  static get $typeName() {
    return `${PKG_V1}::cctp_bridge::FeeCollectorCap`;
  }
  static readonly $numTypeParams = 0;
  static readonly $isPhantom = [] as const;

  readonly $typeName = FeeCollectorCap.$typeName;
  readonly $fullTypeName: string;
  readonly $typeArgs: [];
  readonly $isPhantom = FeeCollectorCap.$isPhantom;

  readonly dummyField: ToField<"bool">;

  private constructor(typeArgs: [], fields: FeeCollectorCapFields) {
    this.$fullTypeName = composeSuiType(FeeCollectorCap.$typeName, ...typeArgs) as string;
    this.$typeArgs = typeArgs;

    this.dummyField = fields.dummyField;
  }

  static reified(): FeeCollectorCapReified {
    return {
      typeName: FeeCollectorCap.$typeName,
      fullTypeName: composeSuiType(FeeCollectorCap.$typeName, ...[]) as string,
      typeArgs: [] as [],
      isPhantom: FeeCollectorCap.$isPhantom,
      reifiedTypeArgs: [],
      fromFields: (fields: Record<string, any>) => FeeCollectorCap.fromFields(fields),
      fromFieldsWithTypes: (item: FieldsWithTypes) => FeeCollectorCap.fromFieldsWithTypes(item),
      fromBcs: (data: Uint8Array) => FeeCollectorCap.fromBcs(data),
      bcs: FeeCollectorCap.bcs,
      fromJSONField: (field: any) => FeeCollectorCap.fromJSONField(field),
      fromJSON: (json: Record<string, any>) => FeeCollectorCap.fromJSON(json),
      fromSuiParsedData: (content: SuiParsedData) => FeeCollectorCap.fromSuiParsedData(content),
      fromSuiObjectData: (content: SuiObjectData) => FeeCollectorCap.fromSuiObjectData(content),
      fetch: async (client: SuiClient, id: string) => FeeCollectorCap.fetch(client, id),
      new: (fields: FeeCollectorCapFields) => {
        return new FeeCollectorCap([], fields);
      },
      kind: "StructClassReified",
    };
  }

  static get r() {
    return FeeCollectorCap.reified();
  }

  static phantom(): PhantomReified<ToTypeStr<FeeCollectorCap>> {
    return phantom(FeeCollectorCap.reified());
  }
  static get p() {
    return FeeCollectorCap.phantom();
  }

  static get bcs() {
    return bcs.struct("FeeCollectorCap", {
      dummy_field: bcs.bool(),
    });
  }

  static fromFields(fields: Record<string, any>): FeeCollectorCap {
    return FeeCollectorCap.reified().new({
      dummyField: decodeFromFields("bool", fields.dummy_field),
    });
  }

  static fromFieldsWithTypes(item: FieldsWithTypes): FeeCollectorCap {
    if (!isFeeCollectorCap(item.type)) {
      throw new Error("not a FeeCollectorCap type");
    }

    return FeeCollectorCap.reified().new({
      dummyField: decodeFromFieldsWithTypes("bool", item.fields.dummy_field),
    });
  }

  static fromBcs(data: Uint8Array): FeeCollectorCap {
    return FeeCollectorCap.fromFields(FeeCollectorCap.bcs.parse(data));
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

  static fromJSONField(field: any): FeeCollectorCap {
    return FeeCollectorCap.reified().new({
      dummyField: decodeFromJSONField("bool", field.dummyField),
    });
  }

  static fromJSON(json: Record<string, any>): FeeCollectorCap {
    if (json.$typeName !== FeeCollectorCap.$typeName) {
      throw new Error("not a WithTwoGenerics json object");
    }

    return FeeCollectorCap.fromJSONField(json);
  }

  static fromSuiParsedData(content: SuiParsedData): FeeCollectorCap {
    if (content.dataType !== "moveObject") {
      throw new Error("not an object");
    }
    if (!isFeeCollectorCap(content.type)) {
      throw new Error(`object at ${(content.fields as any).id} is not a FeeCollectorCap object`);
    }
    return FeeCollectorCap.fromFieldsWithTypes(content);
  }

  static fromSuiObjectData(data: SuiObjectData): FeeCollectorCap {
    if (data.bcs) {
      if (data.bcs.dataType !== "moveObject" || !isFeeCollectorCap(data.bcs.type)) {
        throw new Error(`object at is not a FeeCollectorCap object`);
      }

      return FeeCollectorCap.fromBcs(fromB64(data.bcs.bcsBytes));
    }
    if (data.content) {
      return FeeCollectorCap.fromSuiParsedData(data.content);
    }
    throw new Error(
      "Both `bcs` and `content` fields are missing from the data. Include `showBcs` or `showContent` in the request."
    );
  }

  static async fetch(client: SuiClient, id: string): Promise<FeeCollectorCap> {
    const res = await client.getObject({ id, options: { showBcs: true } });
    if (res.error) {
      throw new Error(`error fetching FeeCollectorCap object at id ${id}: ${res.error.code}`);
    }
    if (res.data?.bcs?.dataType !== "moveObject" || !isFeeCollectorCap(res.data.bcs.type)) {
      throw new Error(`object at id ${id} is not a FeeCollectorCap object`);
    }

    return FeeCollectorCap.fromSuiObjectData(res.data);
  }
}

/* ============================== CctpBridge =============================== */

export function isCctpBridge(type: string): boolean {
  type = compressSuiType(type);
  return type === `${PKG_V1}::cctp_bridge::CctpBridge`;
}

export interface CctpBridgeFields {
  id: ToField<UID>;
  chainIdDomainMap: ToField<Table<"u8", "u32">>;
  senders: ToField<Table<"u64", "address">>;
  feeCollector: ToField<FeeCollector<ToPhantom<FeeCollectorCap>>>;
  feeCollectorCap: ToField<FeeCollectorCap>;
  adminFeeShareBp: ToField<"u64">;
  gasUsage: ToField<Table<"u8", "u64">>;
}

export type CctpBridgeReified = Reified<CctpBridge, CctpBridgeFields>;

export class CctpBridge implements StructClass {
  __StructClass = true as const;

  static get $typeName() {
    return `${PKG_V1}::cctp_bridge::CctpBridge`;
  }
  static readonly $numTypeParams = 0;
  static readonly $isPhantom = [] as const;

  readonly $typeName = CctpBridge.$typeName;
  readonly $fullTypeName: string;
  readonly $typeArgs: [];
  readonly $isPhantom = CctpBridge.$isPhantom;

  readonly id: ToField<UID>;
  readonly chainIdDomainMap: ToField<Table<"u8", "u32">>;
  readonly senders: ToField<Table<"u64", "address">>;
  readonly feeCollector: ToField<FeeCollector<ToPhantom<FeeCollectorCap>>>;
  readonly feeCollectorCap: ToField<FeeCollectorCap>;
  readonly adminFeeShareBp: ToField<"u64">;
  readonly gasUsage: ToField<Table<"u8", "u64">>;

  private constructor(typeArgs: [], fields: CctpBridgeFields) {
    this.$fullTypeName = composeSuiType(CctpBridge.$typeName, ...typeArgs) as string;
    this.$typeArgs = typeArgs;

    this.id = fields.id;
    this.chainIdDomainMap = fields.chainIdDomainMap;
    this.senders = fields.senders;
    this.feeCollector = fields.feeCollector;
    this.feeCollectorCap = fields.feeCollectorCap;
    this.adminFeeShareBp = fields.adminFeeShareBp;
    this.gasUsage = fields.gasUsage;
  }

  static reified(): CctpBridgeReified {
    return {
      typeName: CctpBridge.$typeName,
      fullTypeName: composeSuiType(CctpBridge.$typeName, ...[]) as string,
      typeArgs: [] as [],
      isPhantom: CctpBridge.$isPhantom,
      reifiedTypeArgs: [],
      fromFields: (fields: Record<string, any>) => CctpBridge.fromFields(fields),
      fromFieldsWithTypes: (item: FieldsWithTypes) => CctpBridge.fromFieldsWithTypes(item),
      fromBcs: (data: Uint8Array) => CctpBridge.fromBcs(data),
      bcs: CctpBridge.bcs,
      fromJSONField: (field: any) => CctpBridge.fromJSONField(field),
      fromJSON: (json: Record<string, any>) => CctpBridge.fromJSON(json),
      fromSuiParsedData: (content: SuiParsedData) => CctpBridge.fromSuiParsedData(content),
      fromSuiObjectData: (content: SuiObjectData) => CctpBridge.fromSuiObjectData(content),
      fetch: async (client: SuiClient, id: string) => CctpBridge.fetch(client, id),
      new: (fields: CctpBridgeFields) => {
        return new CctpBridge([], fields);
      },
      kind: "StructClassReified",
    };
  }

  static get r() {
    return CctpBridge.reified();
  }

  static phantom(): PhantomReified<ToTypeStr<CctpBridge>> {
    return phantom(CctpBridge.reified());
  }
  static get p() {
    return CctpBridge.phantom();
  }

  static get bcs() {
    return bcs.struct("CctpBridge", {
      id: UID.bcs,
      chain_id_domain_map: Table.bcs,
      senders: Table.bcs,
      fee_collector: FeeCollector.bcs,
      fee_collector_cap: FeeCollectorCap.bcs,
      admin_fee_share_bp: bcs.u64(),
      gas_usage: Table.bcs,
    });
  }

  static fromFields(fields: Record<string, any>): CctpBridge {
    return CctpBridge.reified().new({
      id: decodeFromFields(UID.reified(), fields.id),
      chainIdDomainMap: decodeFromFields(
        Table.reified(reified.phantom("u8"), reified.phantom("u32")),
        fields.chain_id_domain_map
      ),
      senders: decodeFromFields(Table.reified(reified.phantom("u64"), reified.phantom("address")), fields.senders),
      feeCollector: decodeFromFields(
        FeeCollector.reified(reified.phantom(FeeCollectorCap.reified())),
        fields.fee_collector
      ),
      feeCollectorCap: decodeFromFields(FeeCollectorCap.reified(), fields.fee_collector_cap),
      adminFeeShareBp: decodeFromFields("u64", fields.admin_fee_share_bp),
      gasUsage: decodeFromFields(Table.reified(reified.phantom("u8"), reified.phantom("u64")), fields.gas_usage),
    });
  }

  static fromFieldsWithTypes(item: FieldsWithTypes): CctpBridge {
    if (!isCctpBridge(item.type)) {
      throw new Error("not a CctpBridge type");
    }

    return CctpBridge.reified().new({
      id: decodeFromFieldsWithTypes(UID.reified(), item.fields.id),
      chainIdDomainMap: decodeFromFieldsWithTypes(
        Table.reified(reified.phantom("u8"), reified.phantom("u32")),
        item.fields.chain_id_domain_map
      ),
      senders: decodeFromFieldsWithTypes(
        Table.reified(reified.phantom("u64"), reified.phantom("address")),
        item.fields.senders
      ),
      feeCollector: decodeFromFieldsWithTypes(
        FeeCollector.reified(reified.phantom(FeeCollectorCap.reified())),
        item.fields.fee_collector
      ),
      feeCollectorCap: decodeFromFieldsWithTypes(FeeCollectorCap.reified(), item.fields.fee_collector_cap),
      adminFeeShareBp: decodeFromFieldsWithTypes("u64", item.fields.admin_fee_share_bp),
      gasUsage: decodeFromFieldsWithTypes(
        Table.reified(reified.phantom("u8"), reified.phantom("u64")),
        item.fields.gas_usage
      ),
    });
  }

  static fromBcs(data: Uint8Array): CctpBridge {
    return CctpBridge.fromFields(CctpBridge.bcs.parse(data));
  }

  toJSONField() {
    return {
      id: this.id,
      chainIdDomainMap: this.chainIdDomainMap.toJSONField(),
      senders: this.senders.toJSONField(),
      feeCollector: this.feeCollector.toJSONField(),
      feeCollectorCap: this.feeCollectorCap.toJSONField(),
      adminFeeShareBp: this.adminFeeShareBp.toString(),
      gasUsage: this.gasUsage.toJSONField(),
    };
  }

  toJSON() {
    return {
      $typeName: this.$typeName,
      $typeArgs: this.$typeArgs,
      ...this.toJSONField(),
    };
  }

  static fromJSONField(field: any): CctpBridge {
    return CctpBridge.reified().new({
      id: decodeFromJSONField(UID.reified(), field.id),
      chainIdDomainMap: decodeFromJSONField(
        Table.reified(reified.phantom("u8"), reified.phantom("u32")),
        field.chainIdDomainMap
      ),
      senders: decodeFromJSONField(Table.reified(reified.phantom("u64"), reified.phantom("address")), field.senders),
      feeCollector: decodeFromJSONField(
        FeeCollector.reified(reified.phantom(FeeCollectorCap.reified())),
        field.feeCollector
      ),
      feeCollectorCap: decodeFromJSONField(FeeCollectorCap.reified(), field.feeCollectorCap),
      adminFeeShareBp: decodeFromJSONField("u64", field.adminFeeShareBp),
      gasUsage: decodeFromJSONField(Table.reified(reified.phantom("u8"), reified.phantom("u64")), field.gasUsage),
    });
  }

  static fromJSON(json: Record<string, any>): CctpBridge {
    if (json.$typeName !== CctpBridge.$typeName) {
      throw new Error("not a WithTwoGenerics json object");
    }

    return CctpBridge.fromJSONField(json);
  }

  static fromSuiParsedData(content: SuiParsedData): CctpBridge {
    if (content.dataType !== "moveObject") {
      throw new Error("not an object");
    }
    if (!isCctpBridge(content.type)) {
      throw new Error(`object at ${(content.fields as any).id} is not a CctpBridge object`);
    }
    return CctpBridge.fromFieldsWithTypes(content);
  }

  static fromSuiObjectData(data: SuiObjectData): CctpBridge {
    if (data.bcs) {
      if (data.bcs.dataType !== "moveObject" || !isCctpBridge(data.bcs.type)) {
        throw new Error(`object at is not a CctpBridge object`);
      }

      return CctpBridge.fromBcs(fromB64(data.bcs.bcsBytes));
    }
    if (data.content) {
      return CctpBridge.fromSuiParsedData(data.content);
    }
    throw new Error(
      "Both `bcs` and `content` fields are missing from the data. Include `showBcs` or `showContent` in the request."
    );
  }

  static async fetch(client: SuiClient, id: string): Promise<CctpBridge> {
    const res = await client.getObject({ id, options: { showBcs: true } });
    if (res.error) {
      throw new Error(`error fetching CctpBridge object at id ${id}: ${res.error.code}`);
    }
    if (res.data?.bcs?.dataType !== "moveObject" || !isCctpBridge(res.data.bcs.type)) {
      throw new Error(`object at id ${id} is not a CctpBridge object`);
    }

    return CctpBridge.fromSuiObjectData(res.data);
  }
}
