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
  ToTypeStr as ToPhantom,
} from "../../../../_framework/reified";
import { FieldsWithTypes, composeSuiType, compressSuiType } from "../../../../_framework/util";
import { UID } from "../../../../sui/object/structs";
import { UpgradeCap } from "../../../../sui/package/structs";
import { Table } from "../../../../sui/table/structs";
import { ConsumedVAAs } from "../consumed-vaas/structs";
import { ExternalAddress } from "../external-address/structs";
import { FeeCollector } from "../fee-collector/structs";
import { GuardianSet } from "../guardian-set/structs";
import { PKG_V1 } from "../index";
import { bcs } from "@mysten/sui/bcs";
import { SuiClient, SuiObjectData, SuiParsedData } from "@mysten/sui/client";
import { fromB64 } from "@mysten/sui/utils";

/* ============================== State =============================== */

export function isState(type: string): boolean {
  type = compressSuiType(type);
  return type === `${PKG_V1}::state::State`;
}

export interface StateFields {
  id: ToField<UID>;
  governanceChain: ToField<"u16">;
  governanceContract: ToField<ExternalAddress>;
  guardianSetIndex: ToField<"u32">;
  guardianSets: ToField<Table<"u32", ToPhantom<GuardianSet>>>;
  guardianSetSecondsToLive: ToField<"u32">;
  consumedVaas: ToField<ConsumedVAAs>;
  feeCollector: ToField<FeeCollector>;
  upgradeCap: ToField<UpgradeCap>;
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
  readonly governanceChain: ToField<"u16">;
  readonly governanceContract: ToField<ExternalAddress>;
  readonly guardianSetIndex: ToField<"u32">;
  readonly guardianSets: ToField<Table<"u32", ToPhantom<GuardianSet>>>;
  readonly guardianSetSecondsToLive: ToField<"u32">;
  readonly consumedVaas: ToField<ConsumedVAAs>;
  readonly feeCollector: ToField<FeeCollector>;
  readonly upgradeCap: ToField<UpgradeCap>;

  private constructor(typeArgs: [], fields: StateFields) {
    this.$fullTypeName = composeSuiType(State.$typeName, ...typeArgs) as string;
    this.$typeArgs = typeArgs;

    this.id = fields.id;
    this.governanceChain = fields.governanceChain;
    this.governanceContract = fields.governanceContract;
    this.guardianSetIndex = fields.guardianSetIndex;
    this.guardianSets = fields.guardianSets;
    this.guardianSetSecondsToLive = fields.guardianSetSecondsToLive;
    this.consumedVaas = fields.consumedVaas;
    this.feeCollector = fields.feeCollector;
    this.upgradeCap = fields.upgradeCap;
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
      governance_chain: bcs.u16(),
      governance_contract: ExternalAddress.bcs,
      guardian_set_index: bcs.u32(),
      guardian_sets: Table.bcs,
      guardian_set_seconds_to_live: bcs.u32(),
      consumed_vaas: ConsumedVAAs.bcs,
      fee_collector: FeeCollector.bcs,
      upgrade_cap: UpgradeCap.bcs,
    });
  }

  static fromFields(fields: Record<string, any>): State {
    return State.reified().new({
      id: decodeFromFields(UID.reified(), fields.id),
      governanceChain: decodeFromFields("u16", fields.governance_chain),
      governanceContract: decodeFromFields(ExternalAddress.reified(), fields.governance_contract),
      guardianSetIndex: decodeFromFields("u32", fields.guardian_set_index),
      guardianSets: decodeFromFields(
        Table.reified(reified.phantom("u32"), reified.phantom(GuardianSet.reified())),
        fields.guardian_sets
      ),
      guardianSetSecondsToLive: decodeFromFields("u32", fields.guardian_set_seconds_to_live),
      consumedVaas: decodeFromFields(ConsumedVAAs.reified(), fields.consumed_vaas),
      feeCollector: decodeFromFields(FeeCollector.reified(), fields.fee_collector),
      upgradeCap: decodeFromFields(UpgradeCap.reified(), fields.upgrade_cap),
    });
  }

  static fromFieldsWithTypes(item: FieldsWithTypes): State {
    if (!isState(item.type)) {
      throw new Error("not a State type");
    }

    return State.reified().new({
      id: decodeFromFieldsWithTypes(UID.reified(), item.fields.id),
      governanceChain: decodeFromFieldsWithTypes("u16", item.fields.governance_chain),
      governanceContract: decodeFromFieldsWithTypes(ExternalAddress.reified(), item.fields.governance_contract),
      guardianSetIndex: decodeFromFieldsWithTypes("u32", item.fields.guardian_set_index),
      guardianSets: decodeFromFieldsWithTypes(
        Table.reified(reified.phantom("u32"), reified.phantom(GuardianSet.reified())),
        item.fields.guardian_sets
      ),
      guardianSetSecondsToLive: decodeFromFieldsWithTypes("u32", item.fields.guardian_set_seconds_to_live),
      consumedVaas: decodeFromFieldsWithTypes(ConsumedVAAs.reified(), item.fields.consumed_vaas),
      feeCollector: decodeFromFieldsWithTypes(FeeCollector.reified(), item.fields.fee_collector),
      upgradeCap: decodeFromFieldsWithTypes(UpgradeCap.reified(), item.fields.upgrade_cap),
    });
  }

  static fromBcs(data: Uint8Array): State {
    return State.fromFields(State.bcs.parse(data));
  }

  toJSONField() {
    return {
      id: this.id,
      governanceChain: this.governanceChain,
      governanceContract: this.governanceContract.toJSONField(),
      guardianSetIndex: this.guardianSetIndex,
      guardianSets: this.guardianSets.toJSONField(),
      guardianSetSecondsToLive: this.guardianSetSecondsToLive,
      consumedVaas: this.consumedVaas.toJSONField(),
      feeCollector: this.feeCollector.toJSONField(),
      upgradeCap: this.upgradeCap.toJSONField(),
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
      governanceChain: decodeFromJSONField("u16", field.governanceChain),
      governanceContract: decodeFromJSONField(ExternalAddress.reified(), field.governanceContract),
      guardianSetIndex: decodeFromJSONField("u32", field.guardianSetIndex),
      guardianSets: decodeFromJSONField(
        Table.reified(reified.phantom("u32"), reified.phantom(GuardianSet.reified())),
        field.guardianSets
      ),
      guardianSetSecondsToLive: decodeFromJSONField("u32", field.guardianSetSecondsToLive),
      consumedVaas: decodeFromJSONField(ConsumedVAAs.reified(), field.consumedVaas),
      feeCollector: decodeFromJSONField(FeeCollector.reified(), field.feeCollector),
      upgradeCap: decodeFromJSONField(UpgradeCap.reified(), field.upgradeCap),
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
