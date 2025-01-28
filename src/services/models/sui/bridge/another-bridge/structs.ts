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
import { Bytes32 } from "../../utils/bytes32/structs";
import { Set } from "../../utils/set/structs";
import { PKG_V1 } from "../index";
import { bcs } from "@mysten/sui/bcs";
import { SuiClient, SuiObjectData, SuiParsedData } from "@mysten/sui/client";
import { fromB64 } from "@mysten/sui/utils";

/* ============================== AnotherBridge =============================== */

export function isAnotherBridge(type: string): boolean {
  type = compressSuiType(type);
  return type === `${PKG_V1}::another_bridge::AnotherBridge`;
}

export interface AnotherBridgeFields {
  address: ToField<Bytes32>;
  tokens: ToField<Set<ToPhantom<Bytes32>>>;
  gasUsage: ToField<"u64">;
}

export type AnotherBridgeReified = Reified<AnotherBridge, AnotherBridgeFields>;

export class AnotherBridge implements StructClass {
  __StructClass = true as const;

  static get $typeName() {
    return `${PKG_V1}::another_bridge::AnotherBridge`;
  }
  static readonly $numTypeParams = 0;
  static readonly $isPhantom = [] as const;

  readonly $typeName = AnotherBridge.$typeName;
  readonly $fullTypeName: string;
  readonly $typeArgs: [];
  readonly $isPhantom = AnotherBridge.$isPhantom;

  readonly address: ToField<Bytes32>;
  readonly tokens: ToField<Set<ToPhantom<Bytes32>>>;
  readonly gasUsage: ToField<"u64">;

  private constructor(typeArgs: [], fields: AnotherBridgeFields) {
    this.$fullTypeName = composeSuiType(AnotherBridge.$typeName, ...typeArgs) as string;
    this.$typeArgs = typeArgs;

    this.address = fields.address;
    this.tokens = fields.tokens;
    this.gasUsage = fields.gasUsage;
  }

  static reified(): AnotherBridgeReified {
    return {
      typeName: AnotherBridge.$typeName,
      fullTypeName: composeSuiType(AnotherBridge.$typeName, ...[]) as string,
      typeArgs: [] as [],
      isPhantom: AnotherBridge.$isPhantom,
      reifiedTypeArgs: [],
      fromFields: (fields: Record<string, any>) => AnotherBridge.fromFields(fields),
      fromFieldsWithTypes: (item: FieldsWithTypes) => AnotherBridge.fromFieldsWithTypes(item),
      fromBcs: (data: Uint8Array) => AnotherBridge.fromBcs(data),
      bcs: AnotherBridge.bcs,
      fromJSONField: (field: any) => AnotherBridge.fromJSONField(field),
      fromJSON: (json: Record<string, any>) => AnotherBridge.fromJSON(json),
      fromSuiParsedData: (content: SuiParsedData) => AnotherBridge.fromSuiParsedData(content),
      fromSuiObjectData: (content: SuiObjectData) => AnotherBridge.fromSuiObjectData(content),
      fetch: async (client: SuiClient, id: string) => AnotherBridge.fetch(client, id),
      new: (fields: AnotherBridgeFields) => {
        return new AnotherBridge([], fields);
      },
      kind: "StructClassReified",
    };
  }

  static get r() {
    return AnotherBridge.reified();
  }

  static phantom(): PhantomReified<ToTypeStr<AnotherBridge>> {
    return phantom(AnotherBridge.reified());
  }
  static get p() {
    return AnotherBridge.phantom();
  }

  static get bcs() {
    return bcs.struct("AnotherBridge", {
      address: Bytes32.bcs,
      tokens: Set.bcs,
      gas_usage: bcs.u64(),
    });
  }

  static fromFields(fields: Record<string, any>): AnotherBridge {
    return AnotherBridge.reified().new({
      address: decodeFromFields(Bytes32.reified(), fields.address),
      tokens: decodeFromFields(Set.reified(reified.phantom(Bytes32.reified())), fields.tokens),
      gasUsage: decodeFromFields("u64", fields.gas_usage),
    });
  }

  static fromFieldsWithTypes(item: FieldsWithTypes): AnotherBridge {
    if (!isAnotherBridge(item.type)) {
      throw new Error("not a AnotherBridge type");
    }

    return AnotherBridge.reified().new({
      address: decodeFromFieldsWithTypes(Bytes32.reified(), item.fields.address),
      tokens: decodeFromFieldsWithTypes(Set.reified(reified.phantom(Bytes32.reified())), item.fields.tokens),
      gasUsage: decodeFromFieldsWithTypes("u64", item.fields.gas_usage),
    });
  }

  static fromBcs(data: Uint8Array): AnotherBridge {
    return AnotherBridge.fromFields(AnotherBridge.bcs.parse(data));
  }

  toJSONField() {
    return {
      address: this.address.toJSONField(),
      tokens: this.tokens.toJSONField(),
      gasUsage: this.gasUsage.toString(),
    };
  }

  toJSON() {
    return {
      $typeName: this.$typeName,
      $typeArgs: this.$typeArgs,
      ...this.toJSONField(),
    };
  }

  static fromJSONField(field: any): AnotherBridge {
    return AnotherBridge.reified().new({
      address: decodeFromJSONField(Bytes32.reified(), field.address),
      tokens: decodeFromJSONField(Set.reified(reified.phantom(Bytes32.reified())), field.tokens),
      gasUsage: decodeFromJSONField("u64", field.gasUsage),
    });
  }

  static fromJSON(json: Record<string, any>): AnotherBridge {
    if (json.$typeName !== AnotherBridge.$typeName) {
      throw new Error("not a WithTwoGenerics json object");
    }

    return AnotherBridge.fromJSONField(json);
  }

  static fromSuiParsedData(content: SuiParsedData): AnotherBridge {
    if (content.dataType !== "moveObject") {
      throw new Error("not an object");
    }
    if (!isAnotherBridge(content.type)) {
      throw new Error(`object at ${(content.fields as any).id} is not a AnotherBridge object`);
    }
    return AnotherBridge.fromFieldsWithTypes(content);
  }

  static fromSuiObjectData(data: SuiObjectData): AnotherBridge {
    if (data.bcs) {
      if (data.bcs.dataType !== "moveObject" || !isAnotherBridge(data.bcs.type)) {
        throw new Error(`object at is not a AnotherBridge object`);
      }

      return AnotherBridge.fromBcs(fromB64(data.bcs.bcsBytes));
    }
    if (data.content) {
      return AnotherBridge.fromSuiParsedData(data.content);
    }
    throw new Error(
      "Both `bcs` and `content` fields are missing from the data. Include `showBcs` or `showContent` in the request."
    );
  }

  static async fetch(client: SuiClient, id: string): Promise<AnotherBridge> {
    const res = await client.getObject({ id, options: { showBcs: true } });
    if (res.error) {
      throw new Error(`error fetching AnotherBridge object at id ${id}: ${res.error.code}`);
    }
    if (res.data?.bcs?.dataType !== "moveObject" || !isAnotherBridge(res.data.bcs.type)) {
      throw new Error(`object at id ${id} is not a AnotherBridge object`);
    }

    return AnotherBridge.fromSuiObjectData(res.data);
  }
}
