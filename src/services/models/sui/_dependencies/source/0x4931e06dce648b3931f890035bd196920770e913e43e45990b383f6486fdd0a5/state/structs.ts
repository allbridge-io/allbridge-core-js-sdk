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
  phantom,
} from "../../../../_framework/reified";
import { FieldsWithTypes, composeSuiType, compressSuiType } from "../../../../_framework/util";
import { UID } from "../../../../sui/object/structs";
import { Table } from "../../../../sui/table/structs";
import { VecSet } from "../../../../sui/vec-set/structs";
import { PKG_V1 } from "../index";
import { bcs } from "@mysten/sui/bcs";
import { SuiClient, SuiObjectData, SuiParsedData } from "@mysten/sui/client";
import { fromB64, fromHEX, toHEX } from "@mysten/sui/utils";

/* ============================== State =============================== */

export function isState(type: string): boolean {
  type = compressSuiType(type);
  return type === `${PKG_V1}::state::State`;
}

export interface StateFields {
  id: ToField<UID>;
  localDomain: ToField<"u32">;
  messageVersion: ToField<"u32">;
  maxMessageBodySize: ToField<"u64">;
  enabledAttesters: ToField<VecSet<"address">>;
  nextAvailableNonce: ToField<"u64">;
  usedNonces: ToField<Table<"address", "bool">>;
  signatureThreshold: ToField<"u64">;
  paused: ToField<"bool">;
  compatibleVersions: ToField<VecSet<"u64">>;
}

export type StateReified = Reified<State, StateFields>;

export class State implements StructClass {
  __StructClass = true as const;

  static get $typeName() {
    return `${PKG_V1}::state::State`;
  }
  static readonly $numTypeParams = 0;
  static readonly $isPhantom = [] as const;

  readonly $typeName = State.$typeName;
  readonly $fullTypeName: string;
  readonly $typeArgs: [];
  readonly $isPhantom = State.$isPhantom;

  readonly id: ToField<UID>;
  readonly localDomain: ToField<"u32">;
  readonly messageVersion: ToField<"u32">;
  readonly maxMessageBodySize: ToField<"u64">;
  readonly enabledAttesters: ToField<VecSet<"address">>;
  readonly nextAvailableNonce: ToField<"u64">;
  readonly usedNonces: ToField<Table<"address", "bool">>;
  readonly signatureThreshold: ToField<"u64">;
  readonly paused: ToField<"bool">;
  readonly compatibleVersions: ToField<VecSet<"u64">>;

  private constructor(typeArgs: [], fields: StateFields) {
    this.$fullTypeName = composeSuiType(State.$typeName, ...typeArgs) as string;
    this.$typeArgs = typeArgs;

    this.id = fields.id;
    this.localDomain = fields.localDomain;
    this.messageVersion = fields.messageVersion;
    this.maxMessageBodySize = fields.maxMessageBodySize;
    this.enabledAttesters = fields.enabledAttesters;
    this.nextAvailableNonce = fields.nextAvailableNonce;
    this.usedNonces = fields.usedNonces;
    this.signatureThreshold = fields.signatureThreshold;
    this.paused = fields.paused;
    this.compatibleVersions = fields.compatibleVersions;
  }

  static reified(): StateReified {
    return {
      typeName: State.$typeName,
      fullTypeName: composeSuiType(State.$typeName, ...[]) as string,
      typeArgs: [] as [],
      isPhantom: State.$isPhantom,
      reifiedTypeArgs: [],
      fromFields: (fields: Record<string, any>) => State.fromFields(fields),
      fromFieldsWithTypes: (item: FieldsWithTypes) => State.fromFieldsWithTypes(item),
      fromBcs: (data: Uint8Array) => State.fromBcs(data),
      bcs: State.bcs,
      fromJSONField: (field: any) => State.fromJSONField(field),
      fromJSON: (json: Record<string, any>) => State.fromJSON(json),
      fromSuiParsedData: (content: SuiParsedData) => State.fromSuiParsedData(content),
      fromSuiObjectData: (content: SuiObjectData) => State.fromSuiObjectData(content),
      fetch: async (client: SuiClient, id: string) => State.fetch(client, id),
      new: (fields: StateFields) => {
        return new State([], fields);
      },
      kind: "StructClassReified",
    };
  }

  static get r() {
    return State.reified();
  }

  static phantom(): PhantomReified<ToTypeStr<State>> {
    return phantom(State.reified());
  }
  static get p() {
    return State.phantom();
  }

  static get bcs() {
    return bcs.struct("State", {
      id: UID.bcs,
      local_domain: bcs.u32(),
      message_version: bcs.u32(),
      max_message_body_size: bcs.u64(),
      enabled_attesters: VecSet.bcs(
        bcs.bytes(32).transform({
          input: (val: string) => fromHEX(val),
          output: (val: Uint8Array) => toHEX(val),
        })
      ),
      next_available_nonce: bcs.u64(),
      used_nonces: Table.bcs,
      signature_threshold: bcs.u64(),
      paused: bcs.bool(),
      compatible_versions: VecSet.bcs(bcs.u64()),
    });
  }

  static fromFields(fields: Record<string, any>): State {
    return State.reified().new({
      id: decodeFromFields(UID.reified(), fields.id),
      localDomain: decodeFromFields("u32", fields.local_domain),
      messageVersion: decodeFromFields("u32", fields.message_version),
      maxMessageBodySize: decodeFromFields("u64", fields.max_message_body_size),
      enabledAttesters: decodeFromFields(VecSet.reified("address"), fields.enabled_attesters),
      nextAvailableNonce: decodeFromFields("u64", fields.next_available_nonce),
      usedNonces: decodeFromFields(
        Table.reified(reified.phantom("address"), reified.phantom("bool")),
        fields.used_nonces
      ),
      signatureThreshold: decodeFromFields("u64", fields.signature_threshold),
      paused: decodeFromFields("bool", fields.paused),
      compatibleVersions: decodeFromFields(VecSet.reified("u64"), fields.compatible_versions),
    });
  }

  static fromFieldsWithTypes(item: FieldsWithTypes): State {
    if (!isState(item.type)) {
      throw new Error("not a State type");
    }

    return State.reified().new({
      id: decodeFromFieldsWithTypes(UID.reified(), item.fields.id),
      localDomain: decodeFromFieldsWithTypes("u32", item.fields.local_domain),
      messageVersion: decodeFromFieldsWithTypes("u32", item.fields.message_version),
      maxMessageBodySize: decodeFromFieldsWithTypes("u64", item.fields.max_message_body_size),
      enabledAttesters: decodeFromFieldsWithTypes(VecSet.reified("address"), item.fields.enabled_attesters),
      nextAvailableNonce: decodeFromFieldsWithTypes("u64", item.fields.next_available_nonce),
      usedNonces: decodeFromFieldsWithTypes(
        Table.reified(reified.phantom("address"), reified.phantom("bool")),
        item.fields.used_nonces
      ),
      signatureThreshold: decodeFromFieldsWithTypes("u64", item.fields.signature_threshold),
      paused: decodeFromFieldsWithTypes("bool", item.fields.paused),
      compatibleVersions: decodeFromFieldsWithTypes(VecSet.reified("u64"), item.fields.compatible_versions),
    });
  }

  static fromBcs(data: Uint8Array): State {
    return State.fromFields(State.bcs.parse(data));
  }

  toJSONField() {
    return {
      id: this.id,
      localDomain: this.localDomain,
      messageVersion: this.messageVersion,
      maxMessageBodySize: this.maxMessageBodySize.toString(),
      enabledAttesters: this.enabledAttesters.toJSONField(),
      nextAvailableNonce: this.nextAvailableNonce.toString(),
      usedNonces: this.usedNonces.toJSONField(),
      signatureThreshold: this.signatureThreshold.toString(),
      paused: this.paused,
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

  static fromJSONField(field: any): State {
    return State.reified().new({
      id: decodeFromJSONField(UID.reified(), field.id),
      localDomain: decodeFromJSONField("u32", field.localDomain),
      messageVersion: decodeFromJSONField("u32", field.messageVersion),
      maxMessageBodySize: decodeFromJSONField("u64", field.maxMessageBodySize),
      enabledAttesters: decodeFromJSONField(VecSet.reified("address"), field.enabledAttesters),
      nextAvailableNonce: decodeFromJSONField("u64", field.nextAvailableNonce),
      usedNonces: decodeFromJSONField(
        Table.reified(reified.phantom("address"), reified.phantom("bool")),
        field.usedNonces
      ),
      signatureThreshold: decodeFromJSONField("u64", field.signatureThreshold),
      paused: decodeFromJSONField("bool", field.paused),
      compatibleVersions: decodeFromJSONField(VecSet.reified("u64"), field.compatibleVersions),
    });
  }

  static fromJSON(json: Record<string, any>): State {
    if (json.$typeName !== State.$typeName) {
      throw new Error("not a WithTwoGenerics json object");
    }

    return State.fromJSONField(json);
  }

  static fromSuiParsedData(content: SuiParsedData): State {
    if (content.dataType !== "moveObject") {
      throw new Error("not an object");
    }
    if (!isState(content.type)) {
      throw new Error(`object at ${(content.fields as any).id} is not a State object`);
    }
    return State.fromFieldsWithTypes(content);
  }

  static fromSuiObjectData(data: SuiObjectData): State {
    if (data.bcs) {
      if (data.bcs.dataType !== "moveObject" || !isState(data.bcs.type)) {
        throw new Error(`object at is not a State object`);
      }

      return State.fromBcs(fromB64(data.bcs.bcsBytes));
    }
    if (data.content) {
      return State.fromSuiParsedData(data.content);
    }
    throw new Error(
      "Both `bcs` and `content` fields are missing from the data. Include `showBcs` or `showContent` in the request."
    );
  }

  static async fetch(client: SuiClient, id: string): Promise<State> {
    const res = await client.getObject({ id, options: { showBcs: true } });
    if (res.error) {
      throw new Error(`error fetching State object at id ${id}: ${res.error.code}`);
    }
    if (res.data?.bcs?.dataType !== "moveObject" || !isState(res.data.bcs.type)) {
      throw new Error(`object at id ${id} is not a State object`);
    }

    return State.fromSuiObjectData(res.data);
  }
}
