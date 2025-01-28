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
import { ID, UID } from "../../../../sui/object/structs";
import { Table } from "../../../../sui/table/structs";
import { VecSet } from "../../../../sui/vec-set/structs";
import { PKG_V1 } from "../index";
import { MintAllowance } from "../mint-allowance/structs";
import { bcs } from "@mysten/sui/bcs";
import { SuiClient, SuiObjectData, SuiParsedData } from "@mysten/sui/client";
import { fromB64 } from "@mysten/sui/utils";

/* ============================== Burn =============================== */

export function isBurn(type: string): boolean {
  type = compressSuiType(type);
  return type.startsWith(`${PKG_V1}::treasury::Burn` + "<");
}

export interface BurnFields<T extends PhantomTypeArgument> {
  mintCap: ToField<ID>;
  amount: ToField<"u64">;
}

export type BurnReified<T extends PhantomTypeArgument> = Reified<Burn<T>, BurnFields<T>>;

export class Burn<T extends PhantomTypeArgument> implements StructClass {
  __StructClass = true as const;

  static get $typeName() {
    return `${PKG_V1}::treasury::Burn`;
  }
  static readonly $numTypeParams = 1;
  static readonly $isPhantom = [true] as const;

  readonly $typeName = Burn.$typeName;
  readonly $fullTypeName: string;
  readonly $typeArgs: [PhantomToTypeStr<T>];
  readonly $isPhantom = Burn.$isPhantom;

  readonly mintCap: ToField<ID>;
  readonly amount: ToField<"u64">;

  private constructor(typeArgs: [PhantomToTypeStr<T>], fields: BurnFields<T>) {
    this.$fullTypeName = composeSuiType(Burn.$typeName, ...typeArgs) as string;
    this.$typeArgs = typeArgs;

    this.mintCap = fields.mintCap;
    this.amount = fields.amount;
  }

  static reified<T extends PhantomReified<PhantomTypeArgument>>(T: T): BurnReified<ToPhantomTypeArgument<T>> {
    return {
      typeName: Burn.$typeName,
      fullTypeName: composeSuiType(Burn.$typeName, ...[extractType(T)]) as string,
      typeArgs: [extractType(T)] as [PhantomToTypeStr<ToPhantomTypeArgument<T>>],
      isPhantom: Burn.$isPhantom,
      reifiedTypeArgs: [T],
      fromFields: (fields: Record<string, any>) => Burn.fromFields(T, fields),
      fromFieldsWithTypes: (item: FieldsWithTypes) => Burn.fromFieldsWithTypes(T, item),
      fromBcs: (data: Uint8Array) => Burn.fromBcs(T, data),
      bcs: Burn.bcs,
      fromJSONField: (field: any) => Burn.fromJSONField(T, field),
      fromJSON: (json: Record<string, any>) => Burn.fromJSON(T, json),
      fromSuiParsedData: (content: SuiParsedData) => Burn.fromSuiParsedData(T, content),
      fromSuiObjectData: (content: SuiObjectData) => Burn.fromSuiObjectData(T, content),
      fetch: async (client: SuiClient, id: string) => Burn.fetch(client, T, id),
      new: (fields: BurnFields<ToPhantomTypeArgument<T>>) => {
        return new Burn([extractType(T)], fields);
      },
      kind: "StructClassReified",
    };
  }

  static get r() {
    return Burn.reified;
  }

  static phantom<T extends PhantomReified<PhantomTypeArgument>>(
    T: T
  ): PhantomReified<ToTypeStr<Burn<ToPhantomTypeArgument<T>>>> {
    return phantom(Burn.reified(T));
  }
  static get p() {
    return Burn.phantom;
  }

  static get bcs() {
    return bcs.struct("Burn", {
      mint_cap: ID.bcs,
      amount: bcs.u64(),
    });
  }

  static fromFields<T extends PhantomReified<PhantomTypeArgument>>(
    typeArg: T,
    fields: Record<string, any>
  ): Burn<ToPhantomTypeArgument<T>> {
    return Burn.reified(typeArg).new({
      mintCap: decodeFromFields(ID.reified(), fields.mint_cap),
      amount: decodeFromFields("u64", fields.amount),
    });
  }

  static fromFieldsWithTypes<T extends PhantomReified<PhantomTypeArgument>>(
    typeArg: T,
    item: FieldsWithTypes
  ): Burn<ToPhantomTypeArgument<T>> {
    if (!isBurn(item.type)) {
      throw new Error("not a Burn type");
    }
    assertFieldsWithTypesArgsMatch(item, [typeArg]);

    return Burn.reified(typeArg).new({
      mintCap: decodeFromFieldsWithTypes(ID.reified(), item.fields.mint_cap),
      amount: decodeFromFieldsWithTypes("u64", item.fields.amount),
    });
  }

  static fromBcs<T extends PhantomReified<PhantomTypeArgument>>(
    typeArg: T,
    data: Uint8Array
  ): Burn<ToPhantomTypeArgument<T>> {
    return Burn.fromFields(typeArg, Burn.bcs.parse(data));
  }

  toJSONField() {
    return {
      mintCap: this.mintCap,
      amount: this.amount.toString(),
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
  ): Burn<ToPhantomTypeArgument<T>> {
    return Burn.reified(typeArg).new({
      mintCap: decodeFromJSONField(ID.reified(), field.mintCap),
      amount: decodeFromJSONField("u64", field.amount),
    });
  }

  static fromJSON<T extends PhantomReified<PhantomTypeArgument>>(
    typeArg: T,
    json: Record<string, any>
  ): Burn<ToPhantomTypeArgument<T>> {
    if (json.$typeName !== Burn.$typeName) {
      throw new Error("not a WithTwoGenerics json object");
    }
    assertReifiedTypeArgsMatch(composeSuiType(Burn.$typeName, extractType(typeArg)), json.$typeArgs, [typeArg]);

    return Burn.fromJSONField(typeArg, json);
  }

  static fromSuiParsedData<T extends PhantomReified<PhantomTypeArgument>>(
    typeArg: T,
    content: SuiParsedData
  ): Burn<ToPhantomTypeArgument<T>> {
    if (content.dataType !== "moveObject") {
      throw new Error("not an object");
    }
    if (!isBurn(content.type)) {
      throw new Error(`object at ${(content.fields as any).id} is not a Burn object`);
    }
    return Burn.fromFieldsWithTypes(typeArg, content);
  }

  static fromSuiObjectData<T extends PhantomReified<PhantomTypeArgument>>(
    typeArg: T,
    data: SuiObjectData
  ): Burn<ToPhantomTypeArgument<T>> {
    if (data.bcs) {
      if (data.bcs.dataType !== "moveObject" || !isBurn(data.bcs.type)) {
        throw new Error(`object at is not a Burn object`);
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

      return Burn.fromBcs(typeArg, fromB64(data.bcs.bcsBytes));
    }
    if (data.content) {
      return Burn.fromSuiParsedData(typeArg, data.content);
    }
    throw new Error(
      "Both `bcs` and `content` fields are missing from the data. Include `showBcs` or `showContent` in the request."
    );
  }

  static async fetch<T extends PhantomReified<PhantomTypeArgument>>(
    client: SuiClient,
    typeArg: T,
    id: string
  ): Promise<Burn<ToPhantomTypeArgument<T>>> {
    const res = await client.getObject({ id, options: { showBcs: true } });
    if (res.error) {
      throw new Error(`error fetching Burn object at id ${id}: ${res.error.code}`);
    }
    if (res.data?.bcs?.dataType !== "moveObject" || !isBurn(res.data.bcs.type)) {
      throw new Error(`object at id ${id} is not a Burn object`);
    }

    return Burn.fromSuiObjectData(typeArg, res.data);
  }
}

/* ============================== MintCap =============================== */

export function isMintCap(type: string): boolean {
  type = compressSuiType(type);
  return type.startsWith(`${PKG_V1}::treasury::MintCap` + "<");
}

export interface MintCapFields<T extends PhantomTypeArgument> {
  id: ToField<UID>;
}

export type MintCapReified<T extends PhantomTypeArgument> = Reified<MintCap<T>, MintCapFields<T>>;

export class MintCap<T extends PhantomTypeArgument> implements StructClass {
  __StructClass = true as const;

  static get $typeName() {
    return `${PKG_V1}::treasury::MintCap`;
  }
  static readonly $numTypeParams = 1;
  static readonly $isPhantom = [true] as const;

  readonly $typeName = MintCap.$typeName;
  readonly $fullTypeName: string;
  readonly $typeArgs: [PhantomToTypeStr<T>];
  readonly $isPhantom = MintCap.$isPhantom;

  readonly id: ToField<UID>;

  private constructor(typeArgs: [PhantomToTypeStr<T>], fields: MintCapFields<T>) {
    this.$fullTypeName = composeSuiType(MintCap.$typeName, ...typeArgs) as string;
    this.$typeArgs = typeArgs;

    this.id = fields.id;
  }

  static reified<T extends PhantomReified<PhantomTypeArgument>>(T: T): MintCapReified<ToPhantomTypeArgument<T>> {
    return {
      typeName: MintCap.$typeName,
      fullTypeName: composeSuiType(MintCap.$typeName, ...[extractType(T)]) as string,
      typeArgs: [extractType(T)] as [PhantomToTypeStr<ToPhantomTypeArgument<T>>],
      isPhantom: MintCap.$isPhantom,
      reifiedTypeArgs: [T],
      fromFields: (fields: Record<string, any>) => MintCap.fromFields(T, fields),
      fromFieldsWithTypes: (item: FieldsWithTypes) => MintCap.fromFieldsWithTypes(T, item),
      fromBcs: (data: Uint8Array) => MintCap.fromBcs(T, data),
      bcs: MintCap.bcs,
      fromJSONField: (field: any) => MintCap.fromJSONField(T, field),
      fromJSON: (json: Record<string, any>) => MintCap.fromJSON(T, json),
      fromSuiParsedData: (content: SuiParsedData) => MintCap.fromSuiParsedData(T, content),
      fromSuiObjectData: (content: SuiObjectData) => MintCap.fromSuiObjectData(T, content),
      fetch: async (client: SuiClient, id: string) => MintCap.fetch(client, T, id),
      new: (fields: MintCapFields<ToPhantomTypeArgument<T>>) => {
        return new MintCap([extractType(T)], fields);
      },
      kind: "StructClassReified",
    };
  }

  static get r() {
    return MintCap.reified;
  }

  static phantom<T extends PhantomReified<PhantomTypeArgument>>(
    T: T
  ): PhantomReified<ToTypeStr<MintCap<ToPhantomTypeArgument<T>>>> {
    return phantom(MintCap.reified(T));
  }
  static get p() {
    return MintCap.phantom;
  }

  static get bcs() {
    return bcs.struct("MintCap", {
      id: UID.bcs,
    });
  }

  static fromFields<T extends PhantomReified<PhantomTypeArgument>>(
    typeArg: T,
    fields: Record<string, any>
  ): MintCap<ToPhantomTypeArgument<T>> {
    return MintCap.reified(typeArg).new({
      id: decodeFromFields(UID.reified(), fields.id),
    });
  }

  static fromFieldsWithTypes<T extends PhantomReified<PhantomTypeArgument>>(
    typeArg: T,
    item: FieldsWithTypes
  ): MintCap<ToPhantomTypeArgument<T>> {
    if (!isMintCap(item.type)) {
      throw new Error("not a MintCap type");
    }
    assertFieldsWithTypesArgsMatch(item, [typeArg]);

    return MintCap.reified(typeArg).new({
      id: decodeFromFieldsWithTypes(UID.reified(), item.fields.id),
    });
  }

  static fromBcs<T extends PhantomReified<PhantomTypeArgument>>(
    typeArg: T,
    data: Uint8Array
  ): MintCap<ToPhantomTypeArgument<T>> {
    return MintCap.fromFields(typeArg, MintCap.bcs.parse(data));
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

  static fromJSONField<T extends PhantomReified<PhantomTypeArgument>>(
    typeArg: T,
    field: any
  ): MintCap<ToPhantomTypeArgument<T>> {
    return MintCap.reified(typeArg).new({
      id: decodeFromJSONField(UID.reified(), field.id),
    });
  }

  static fromJSON<T extends PhantomReified<PhantomTypeArgument>>(
    typeArg: T,
    json: Record<string, any>
  ): MintCap<ToPhantomTypeArgument<T>> {
    if (json.$typeName !== MintCap.$typeName) {
      throw new Error("not a WithTwoGenerics json object");
    }
    assertReifiedTypeArgsMatch(composeSuiType(MintCap.$typeName, extractType(typeArg)), json.$typeArgs, [typeArg]);

    return MintCap.fromJSONField(typeArg, json);
  }

  static fromSuiParsedData<T extends PhantomReified<PhantomTypeArgument>>(
    typeArg: T,
    content: SuiParsedData
  ): MintCap<ToPhantomTypeArgument<T>> {
    if (content.dataType !== "moveObject") {
      throw new Error("not an object");
    }
    if (!isMintCap(content.type)) {
      throw new Error(`object at ${(content.fields as any).id} is not a MintCap object`);
    }
    return MintCap.fromFieldsWithTypes(typeArg, content);
  }

  static fromSuiObjectData<T extends PhantomReified<PhantomTypeArgument>>(
    typeArg: T,
    data: SuiObjectData
  ): MintCap<ToPhantomTypeArgument<T>> {
    if (data.bcs) {
      if (data.bcs.dataType !== "moveObject" || !isMintCap(data.bcs.type)) {
        throw new Error(`object at is not a MintCap object`);
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

      return MintCap.fromBcs(typeArg, fromB64(data.bcs.bcsBytes));
    }
    if (data.content) {
      return MintCap.fromSuiParsedData(typeArg, data.content);
    }
    throw new Error(
      "Both `bcs` and `content` fields are missing from the data. Include `showBcs` or `showContent` in the request."
    );
  }

  static async fetch<T extends PhantomReified<PhantomTypeArgument>>(
    client: SuiClient,
    typeArg: T,
    id: string
  ): Promise<MintCap<ToPhantomTypeArgument<T>>> {
    const res = await client.getObject({ id, options: { showBcs: true } });
    if (res.error) {
      throw new Error(`error fetching MintCap object at id ${id}: ${res.error.code}`);
    }
    if (res.data?.bcs?.dataType !== "moveObject" || !isMintCap(res.data.bcs.type)) {
      throw new Error(`object at id ${id} is not a MintCap object`);
    }

    return MintCap.fromSuiObjectData(typeArg, res.data);
  }
}

/* ============================== Treasury =============================== */

export function isTreasury(type: string): boolean {
  type = compressSuiType(type);
  return type.startsWith(`${PKG_V1}::treasury::Treasury` + "<");
}

export interface TreasuryFields<T extends PhantomTypeArgument> {
  id: ToField<UID>;
  controllers: ToField<Table<"address", ToPhantom<ID>>>;
  mintAllowances: ToField<Table<ToPhantom<ID>, ToPhantom<MintAllowance<T>>>>;
  compatibleVersions: ToField<VecSet<"u64">>;
}

export type TreasuryReified<T extends PhantomTypeArgument> = Reified<Treasury<T>, TreasuryFields<T>>;

export class Treasury<T extends PhantomTypeArgument> implements StructClass {
  __StructClass = true as const;

  static get $typeName() {
    return `${PKG_V1}::treasury::Treasury`;
  }
  static readonly $numTypeParams = 1;
  static readonly $isPhantom = [true] as const;

  readonly $typeName = Treasury.$typeName;
  readonly $fullTypeName: string;
  readonly $typeArgs: [PhantomToTypeStr<T>];
  readonly $isPhantom = Treasury.$isPhantom;

  readonly id: ToField<UID>;
  readonly controllers: ToField<Table<"address", ToPhantom<ID>>>;
  readonly mintAllowances: ToField<Table<ToPhantom<ID>, ToPhantom<MintAllowance<T>>>>;
  readonly compatibleVersions: ToField<VecSet<"u64">>;

  private constructor(typeArgs: [PhantomToTypeStr<T>], fields: TreasuryFields<T>) {
    this.$fullTypeName = composeSuiType(Treasury.$typeName, ...typeArgs) as string;
    this.$typeArgs = typeArgs;

    this.id = fields.id;
    this.controllers = fields.controllers;
    this.mintAllowances = fields.mintAllowances;
    this.compatibleVersions = fields.compatibleVersions;
  }

  static reified<T extends PhantomReified<PhantomTypeArgument>>(T: T): TreasuryReified<ToPhantomTypeArgument<T>> {
    return {
      typeName: Treasury.$typeName,
      fullTypeName: composeSuiType(Treasury.$typeName, ...[extractType(T)]) as string,
      typeArgs: [extractType(T)] as [PhantomToTypeStr<ToPhantomTypeArgument<T>>],
      isPhantom: Treasury.$isPhantom,
      reifiedTypeArgs: [T],
      fromFields: (fields: Record<string, any>) => Treasury.fromFields(T, fields),
      fromFieldsWithTypes: (item: FieldsWithTypes) => Treasury.fromFieldsWithTypes(T, item),
      fromBcs: (data: Uint8Array) => Treasury.fromBcs(T, data),
      bcs: Treasury.bcs,
      fromJSONField: (field: any) => Treasury.fromJSONField(T, field),
      fromJSON: (json: Record<string, any>) => Treasury.fromJSON(T, json),
      fromSuiParsedData: (content: SuiParsedData) => Treasury.fromSuiParsedData(T, content),
      fromSuiObjectData: (content: SuiObjectData) => Treasury.fromSuiObjectData(T, content),
      fetch: async (client: SuiClient, id: string) => Treasury.fetch(client, T, id),
      new: (fields: TreasuryFields<ToPhantomTypeArgument<T>>) => {
        return new Treasury([extractType(T)], fields);
      },
      kind: "StructClassReified",
    };
  }

  static get r() {
    return Treasury.reified;
  }

  static phantom<T extends PhantomReified<PhantomTypeArgument>>(
    T: T
  ): PhantomReified<ToTypeStr<Treasury<ToPhantomTypeArgument<T>>>> {
    return phantom(Treasury.reified(T));
  }
  static get p() {
    return Treasury.phantom;
  }

  static get bcs() {
    return bcs.struct("Treasury", {
      id: UID.bcs,
      controllers: Table.bcs,
      mint_allowances: Table.bcs,
      compatible_versions: VecSet.bcs(bcs.u64()),
    });
  }

  static fromFields<T extends PhantomReified<PhantomTypeArgument>>(
    typeArg: T,
    fields: Record<string, any>
  ): Treasury<ToPhantomTypeArgument<T>> {
    return Treasury.reified(typeArg).new({
      id: decodeFromFields(UID.reified(), fields.id),
      controllers: decodeFromFields(
        Table.reified(reified.phantom("address"), reified.phantom(ID.reified())),
        fields.controllers
      ),
      mintAllowances: decodeFromFields(
        Table.reified(reified.phantom(ID.reified()), reified.phantom(MintAllowance.reified(typeArg))),
        fields.mint_allowances
      ),
      compatibleVersions: decodeFromFields(VecSet.reified("u64"), fields.compatible_versions),
    });
  }

  static fromFieldsWithTypes<T extends PhantomReified<PhantomTypeArgument>>(
    typeArg: T,
    item: FieldsWithTypes
  ): Treasury<ToPhantomTypeArgument<T>> {
    if (!isTreasury(item.type)) {
      throw new Error("not a Treasury type");
    }
    assertFieldsWithTypesArgsMatch(item, [typeArg]);

    return Treasury.reified(typeArg).new({
      id: decodeFromFieldsWithTypes(UID.reified(), item.fields.id),
      controllers: decodeFromFieldsWithTypes(
        Table.reified(reified.phantom("address"), reified.phantom(ID.reified())),
        item.fields.controllers
      ),
      mintAllowances: decodeFromFieldsWithTypes(
        Table.reified(reified.phantom(ID.reified()), reified.phantom(MintAllowance.reified(typeArg))),
        item.fields.mint_allowances
      ),
      compatibleVersions: decodeFromFieldsWithTypes(VecSet.reified("u64"), item.fields.compatible_versions),
    });
  }

  static fromBcs<T extends PhantomReified<PhantomTypeArgument>>(
    typeArg: T,
    data: Uint8Array
  ): Treasury<ToPhantomTypeArgument<T>> {
    return Treasury.fromFields(typeArg, Treasury.bcs.parse(data));
  }

  toJSONField() {
    return {
      id: this.id,
      controllers: this.controllers.toJSONField(),
      mintAllowances: this.mintAllowances.toJSONField(),
      compatibleVersions: this.compatibleVersions.toJSONField(),
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
  ): Treasury<ToPhantomTypeArgument<T>> {
    return Treasury.reified(typeArg).new({
      id: decodeFromJSONField(UID.reified(), field.id),
      controllers: decodeFromJSONField(
        Table.reified(reified.phantom("address"), reified.phantom(ID.reified())),
        field.controllers
      ),
      mintAllowances: decodeFromJSONField(
        Table.reified(reified.phantom(ID.reified()), reified.phantom(MintAllowance.reified(typeArg))),
        field.mintAllowances
      ),
      compatibleVersions: decodeFromJSONField(VecSet.reified("u64"), field.compatibleVersions),
    });
  }

  static fromJSON<T extends PhantomReified<PhantomTypeArgument>>(
    typeArg: T,
    json: Record<string, any>
  ): Treasury<ToPhantomTypeArgument<T>> {
    if (json.$typeName !== Treasury.$typeName) {
      throw new Error("not a WithTwoGenerics json object");
    }
    assertReifiedTypeArgsMatch(composeSuiType(Treasury.$typeName, extractType(typeArg)), json.$typeArgs, [typeArg]);

    return Treasury.fromJSONField(typeArg, json);
  }

  static fromSuiParsedData<T extends PhantomReified<PhantomTypeArgument>>(
    typeArg: T,
    content: SuiParsedData
  ): Treasury<ToPhantomTypeArgument<T>> {
    if (content.dataType !== "moveObject") {
      throw new Error("not an object");
    }
    if (!isTreasury(content.type)) {
      throw new Error(`object at ${(content.fields as any).id} is not a Treasury object`);
    }
    return Treasury.fromFieldsWithTypes(typeArg, content);
  }

  static fromSuiObjectData<T extends PhantomReified<PhantomTypeArgument>>(
    typeArg: T,
    data: SuiObjectData
  ): Treasury<ToPhantomTypeArgument<T>> {
    if (data.bcs) {
      if (data.bcs.dataType !== "moveObject" || !isTreasury(data.bcs.type)) {
        throw new Error(`object at is not a Treasury object`);
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

      return Treasury.fromBcs(typeArg, fromB64(data.bcs.bcsBytes));
    }
    if (data.content) {
      return Treasury.fromSuiParsedData(typeArg, data.content);
    }
    throw new Error(
      "Both `bcs` and `content` fields are missing from the data. Include `showBcs` or `showContent` in the request."
    );
  }

  static async fetch<T extends PhantomReified<PhantomTypeArgument>>(
    client: SuiClient,
    typeArg: T,
    id: string
  ): Promise<Treasury<ToPhantomTypeArgument<T>>> {
    const res = await client.getObject({ id, options: { showBcs: true } });
    if (res.error) {
      throw new Error(`error fetching Treasury object at id ${id}: ${res.error.code}`);
    }
    if (res.data?.bcs?.dataType !== "moveObject" || !isTreasury(res.data.bcs.type)) {
      throw new Error(`object at id ${id} is not a Treasury object`);
    }

    return Treasury.fromSuiObjectData(typeArg, res.data);
  }
}

/* ============================== TreasuryCapKey =============================== */

export function isTreasuryCapKey(type: string): boolean {
  type = compressSuiType(type);
  return type === `${PKG_V1}::treasury::TreasuryCapKey`;
}

export interface TreasuryCapKeyFields {
  dummyField: ToField<"bool">;
}

export type TreasuryCapKeyReified = Reified<TreasuryCapKey, TreasuryCapKeyFields>;

export class TreasuryCapKey implements StructClass {
  __StructClass = true as const;

  static get $typeName() {
    return `${PKG_V1}::treasury::TreasuryCapKey`;
  }
  static readonly $numTypeParams = 0;
  static readonly $isPhantom = [] as const;

  readonly $typeName = TreasuryCapKey.$typeName;
  readonly $fullTypeName: string;
  readonly $typeArgs: [];
  readonly $isPhantom = TreasuryCapKey.$isPhantom;

  readonly dummyField: ToField<"bool">;

  private constructor(typeArgs: [], fields: TreasuryCapKeyFields) {
    this.$fullTypeName = composeSuiType(TreasuryCapKey.$typeName, ...typeArgs) as string;
    this.$typeArgs = typeArgs;

    this.dummyField = fields.dummyField;
  }

  static reified(): TreasuryCapKeyReified {
    return {
      typeName: TreasuryCapKey.$typeName,
      fullTypeName: composeSuiType(TreasuryCapKey.$typeName, ...[]) as string,
      typeArgs: [] as [],
      isPhantom: TreasuryCapKey.$isPhantom,
      reifiedTypeArgs: [],
      fromFields: (fields: Record<string, any>) => TreasuryCapKey.fromFields(fields),
      fromFieldsWithTypes: (item: FieldsWithTypes) => TreasuryCapKey.fromFieldsWithTypes(item),
      fromBcs: (data: Uint8Array) => TreasuryCapKey.fromBcs(data),
      bcs: TreasuryCapKey.bcs,
      fromJSONField: (field: any) => TreasuryCapKey.fromJSONField(field),
      fromJSON: (json: Record<string, any>) => TreasuryCapKey.fromJSON(json),
      fromSuiParsedData: (content: SuiParsedData) => TreasuryCapKey.fromSuiParsedData(content),
      fromSuiObjectData: (content: SuiObjectData) => TreasuryCapKey.fromSuiObjectData(content),
      fetch: async (client: SuiClient, id: string) => TreasuryCapKey.fetch(client, id),
      new: (fields: TreasuryCapKeyFields) => {
        return new TreasuryCapKey([], fields);
      },
      kind: "StructClassReified",
    };
  }

  static get r() {
    return TreasuryCapKey.reified();
  }

  static phantom(): PhantomReified<ToTypeStr<TreasuryCapKey>> {
    return phantom(TreasuryCapKey.reified());
  }
  static get p() {
    return TreasuryCapKey.phantom();
  }

  static get bcs() {
    return bcs.struct("TreasuryCapKey", {
      dummy_field: bcs.bool(),
    });
  }

  static fromFields(fields: Record<string, any>): TreasuryCapKey {
    return TreasuryCapKey.reified().new({
      dummyField: decodeFromFields("bool", fields.dummy_field),
    });
  }

  static fromFieldsWithTypes(item: FieldsWithTypes): TreasuryCapKey {
    if (!isTreasuryCapKey(item.type)) {
      throw new Error("not a TreasuryCapKey type");
    }

    return TreasuryCapKey.reified().new({
      dummyField: decodeFromFieldsWithTypes("bool", item.fields.dummy_field),
    });
  }

  static fromBcs(data: Uint8Array): TreasuryCapKey {
    return TreasuryCapKey.fromFields(TreasuryCapKey.bcs.parse(data));
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

  static fromJSONField(field: any): TreasuryCapKey {
    return TreasuryCapKey.reified().new({
      dummyField: decodeFromJSONField("bool", field.dummyField),
    });
  }

  static fromJSON(json: Record<string, any>): TreasuryCapKey {
    if (json.$typeName !== TreasuryCapKey.$typeName) {
      throw new Error("not a WithTwoGenerics json object");
    }

    return TreasuryCapKey.fromJSONField(json);
  }

  static fromSuiParsedData(content: SuiParsedData): TreasuryCapKey {
    if (content.dataType !== "moveObject") {
      throw new Error("not an object");
    }
    if (!isTreasuryCapKey(content.type)) {
      throw new Error(`object at ${(content.fields as any).id} is not a TreasuryCapKey object`);
    }
    return TreasuryCapKey.fromFieldsWithTypes(content);
  }

  static fromSuiObjectData(data: SuiObjectData): TreasuryCapKey {
    if (data.bcs) {
      if (data.bcs.dataType !== "moveObject" || !isTreasuryCapKey(data.bcs.type)) {
        throw new Error(`object at is not a TreasuryCapKey object`);
      }

      return TreasuryCapKey.fromBcs(fromB64(data.bcs.bcsBytes));
    }
    if (data.content) {
      return TreasuryCapKey.fromSuiParsedData(data.content);
    }
    throw new Error(
      "Both `bcs` and `content` fields are missing from the data. Include `showBcs` or `showContent` in the request."
    );
  }

  static async fetch(client: SuiClient, id: string): Promise<TreasuryCapKey> {
    const res = await client.getObject({ id, options: { showBcs: true } });
    if (res.error) {
      throw new Error(`error fetching TreasuryCapKey object at id ${id}: ${res.error.code}`);
    }
    if (res.data?.bcs?.dataType !== "moveObject" || !isTreasuryCapKey(res.data.bcs.type)) {
      throw new Error(`object at id ${id} is not a TreasuryCapKey object`);
    }

    return TreasuryCapKey.fromSuiObjectData(res.data);
  }
}
