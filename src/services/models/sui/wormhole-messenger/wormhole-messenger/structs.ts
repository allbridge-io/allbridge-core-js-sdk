// @ts-nocheck
import * as reified from "../../_framework/reified";
import { Option } from "../../_dependencies/source/0x1/option/structs";
import { EmitterCap } from "../../_dependencies/source/0xf47329f4344f3bf0f8e436e2f7b485466cff300f12a166563995d3888c296a94/emitter/structs";
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
  ToTypeStr as ToPhantom,
} from "../../_framework/reified";
import { FieldsWithTypes, composeSuiType, compressSuiType } from "../../_framework/util";
import { Vector } from "../../_framework/vector";
import { Balance } from "../../sui/balance/structs";
import { UID } from "../../sui/object/structs";
import { SUI } from "../../sui/sui/structs";
import { Table } from "../../sui/table/structs";
import { Bytes32 } from "../../utils/bytes32/structs";
import { Message } from "../../utils/message/structs";
import { Set } from "../../utils/set/structs";
import { PKG_V1 } from "../index";
import { bcs } from "@mysten/sui/bcs";
import { SuiClient, SuiObjectData, SuiParsedData } from "@mysten/sui/client";
import { fromB64 } from "@mysten/sui/utils";

/* ============================== AdminCap =============================== */

export function isAdminCap(type: string): boolean {
  type = compressSuiType(type);
  return type === `${PKG_V1}::wormhole_messenger::AdminCap`;
}

export interface AdminCapFields {
  id: ToField<UID>;
}

export type AdminCapReified = Reified<AdminCap, AdminCapFields>;

export class AdminCap implements StructClass {
  __StructClass = true as const;

  static get $typeName() {
    return `${PKG_V1}::wormhole_messenger::AdminCap`;
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

/* ============================== WormholeMessenger =============================== */

export function isWormholeMessenger(type: string): boolean {
  type = compressSuiType(type);
  return type === `${PKG_V1}::wormhole_messenger::WormholeMessenger`;
}

export interface WormholeMessengerFields {
  id: ToField<UID>;
  emitterCap: ToField<Option<EmitterCap>>;
  receivedMessages: ToField<Set<ToPhantom<Message>>>;
  sentMessages: ToField<Set<ToPhantom<Message>>>;
  otherWormholeMessengers: ToField<Table<"u16", ToPhantom<Bytes32>>>;
  otherChainIds: ToField<Vector<"bool">>;
  gasUsage: ToField<Table<"u8", "u64">>;
  gasBalance: ToField<Balance<ToPhantom<SUI>>>;
}

export type WormholeMessengerReified = Reified<WormholeMessenger, WormholeMessengerFields>;

export class WormholeMessenger implements StructClass {
  __StructClass = true as const;

  static get $typeName() {
    return `${PKG_V1}::wormhole_messenger::WormholeMessenger`;
  }
  static readonly $numTypeParams = 0;
  static readonly $isPhantom = [] as const;

  readonly $typeName = WormholeMessenger.$typeName;
  readonly $fullTypeName: string;
  readonly $typeArgs: [];
  readonly $isPhantom = WormholeMessenger.$isPhantom;

  readonly id: ToField<UID>;
  readonly emitterCap: ToField<Option<EmitterCap>>;
  readonly receivedMessages: ToField<Set<ToPhantom<Message>>>;
  readonly sentMessages: ToField<Set<ToPhantom<Message>>>;
  readonly otherWormholeMessengers: ToField<Table<"u16", ToPhantom<Bytes32>>>;
  readonly otherChainIds: ToField<Vector<"bool">>;
  readonly gasUsage: ToField<Table<"u8", "u64">>;
  readonly gasBalance: ToField<Balance<ToPhantom<SUI>>>;

  private constructor(typeArgs: [], fields: WormholeMessengerFields) {
    this.$fullTypeName = composeSuiType(WormholeMessenger.$typeName, ...typeArgs) as string;
    this.$typeArgs = typeArgs;

    this.id = fields.id;
    this.emitterCap = fields.emitterCap;
    this.receivedMessages = fields.receivedMessages;
    this.sentMessages = fields.sentMessages;
    this.otherWormholeMessengers = fields.otherWormholeMessengers;
    this.otherChainIds = fields.otherChainIds;
    this.gasUsage = fields.gasUsage;
    this.gasBalance = fields.gasBalance;
  }

  static reified(): WormholeMessengerReified {
    return {
      typeName: WormholeMessenger.$typeName,
      fullTypeName: composeSuiType(WormholeMessenger.$typeName, ...[]) as string,
      typeArgs: [] as [],
      isPhantom: WormholeMessenger.$isPhantom,
      reifiedTypeArgs: [],
      fromFields: (fields: Record<string, any>) => WormholeMessenger.fromFields(fields),
      fromFieldsWithTypes: (item: FieldsWithTypes) => WormholeMessenger.fromFieldsWithTypes(item),
      fromBcs: (data: Uint8Array) => WormholeMessenger.fromBcs(data),
      bcs: WormholeMessenger.bcs,
      fromJSONField: (field: any) => WormholeMessenger.fromJSONField(field),
      fromJSON: (json: Record<string, any>) => WormholeMessenger.fromJSON(json),
      fromSuiParsedData: (content: SuiParsedData) => WormholeMessenger.fromSuiParsedData(content),
      fromSuiObjectData: (content: SuiObjectData) => WormholeMessenger.fromSuiObjectData(content),
      fetch: async (client: SuiClient, id: string) => WormholeMessenger.fetch(client, id),
      new: (fields: WormholeMessengerFields) => {
        return new WormholeMessenger([], fields);
      },
      kind: "StructClassReified",
    };
  }

  static get r() {
    return WormholeMessenger.reified();
  }

  static phantom(): PhantomReified<ToTypeStr<WormholeMessenger>> {
    return phantom(WormholeMessenger.reified());
  }
  static get p() {
    return WormholeMessenger.phantom();
  }

  static get bcs() {
    return bcs.struct("WormholeMessenger", {
      id: UID.bcs,
      emitter_cap: Option.bcs(EmitterCap.bcs),
      received_messages: Set.bcs,
      sent_messages: Set.bcs,
      other_wormhole_messengers: Table.bcs,
      other_chain_ids: bcs.vector(bcs.bool()),
      gas_usage: Table.bcs,
      gas_balance: Balance.bcs,
    });
  }

  static fromFields(fields: Record<string, any>): WormholeMessenger {
    return WormholeMessenger.reified().new({
      id: decodeFromFields(UID.reified(), fields.id),
      emitterCap: decodeFromFields(Option.reified(EmitterCap.reified()), fields.emitter_cap),
      receivedMessages: decodeFromFields(Set.reified(reified.phantom(Message.reified())), fields.received_messages),
      sentMessages: decodeFromFields(Set.reified(reified.phantom(Message.reified())), fields.sent_messages),
      otherWormholeMessengers: decodeFromFields(
        Table.reified(reified.phantom("u16"), reified.phantom(Bytes32.reified())),
        fields.other_wormhole_messengers
      ),
      otherChainIds: decodeFromFields(reified.vector("bool"), fields.other_chain_ids),
      gasUsage: decodeFromFields(Table.reified(reified.phantom("u8"), reified.phantom("u64")), fields.gas_usage),
      gasBalance: decodeFromFields(Balance.reified(reified.phantom(SUI.reified())), fields.gas_balance),
    });
  }

  static fromFieldsWithTypes(item: FieldsWithTypes): WormholeMessenger {
    if (!isWormholeMessenger(item.type)) {
      throw new Error("not a WormholeMessenger type");
    }

    return WormholeMessenger.reified().new({
      id: decodeFromFieldsWithTypes(UID.reified(), item.fields.id),
      emitterCap: decodeFromFieldsWithTypes(Option.reified(EmitterCap.reified()), item.fields.emitter_cap),
      receivedMessages: decodeFromFieldsWithTypes(
        Set.reified(reified.phantom(Message.reified())),
        item.fields.received_messages
      ),
      sentMessages: decodeFromFieldsWithTypes(
        Set.reified(reified.phantom(Message.reified())),
        item.fields.sent_messages
      ),
      otherWormholeMessengers: decodeFromFieldsWithTypes(
        Table.reified(reified.phantom("u16"), reified.phantom(Bytes32.reified())),
        item.fields.other_wormhole_messengers
      ),
      otherChainIds: decodeFromFieldsWithTypes(reified.vector("bool"), item.fields.other_chain_ids),
      gasUsage: decodeFromFieldsWithTypes(
        Table.reified(reified.phantom("u8"), reified.phantom("u64")),
        item.fields.gas_usage
      ),
      gasBalance: decodeFromFieldsWithTypes(Balance.reified(reified.phantom(SUI.reified())), item.fields.gas_balance),
    });
  }

  static fromBcs(data: Uint8Array): WormholeMessenger {
    return WormholeMessenger.fromFields(WormholeMessenger.bcs.parse(data));
  }

  toJSONField() {
    return {
      id: this.id,
      emitterCap: fieldToJSON<Option<EmitterCap>>(`${Option.$typeName}<${EmitterCap.$typeName}>`, this.emitterCap),
      receivedMessages: this.receivedMessages.toJSONField(),
      sentMessages: this.sentMessages.toJSONField(),
      otherWormholeMessengers: this.otherWormholeMessengers.toJSONField(),
      otherChainIds: fieldToJSON<Vector<"bool">>(`vector<bool>`, this.otherChainIds),
      gasUsage: this.gasUsage.toJSONField(),
      gasBalance: this.gasBalance.toJSONField(),
    };
  }

  toJSON() {
    return {
      $typeName: this.$typeName,
      $typeArgs: this.$typeArgs,
      ...this.toJSONField(),
    };
  }

  static fromJSONField(field: any): WormholeMessenger {
    return WormholeMessenger.reified().new({
      id: decodeFromJSONField(UID.reified(), field.id),
      emitterCap: decodeFromJSONField(Option.reified(EmitterCap.reified()), field.emitterCap),
      receivedMessages: decodeFromJSONField(Set.reified(reified.phantom(Message.reified())), field.receivedMessages),
      sentMessages: decodeFromJSONField(Set.reified(reified.phantom(Message.reified())), field.sentMessages),
      otherWormholeMessengers: decodeFromJSONField(
        Table.reified(reified.phantom("u16"), reified.phantom(Bytes32.reified())),
        field.otherWormholeMessengers
      ),
      otherChainIds: decodeFromJSONField(reified.vector("bool"), field.otherChainIds),
      gasUsage: decodeFromJSONField(Table.reified(reified.phantom("u8"), reified.phantom("u64")), field.gasUsage),
      gasBalance: decodeFromJSONField(Balance.reified(reified.phantom(SUI.reified())), field.gasBalance),
    });
  }

  static fromJSON(json: Record<string, any>): WormholeMessenger {
    if (json.$typeName !== WormholeMessenger.$typeName) {
      throw new Error("not a WithTwoGenerics json object");
    }

    return WormholeMessenger.fromJSONField(json);
  }

  static fromSuiParsedData(content: SuiParsedData): WormholeMessenger {
    if (content.dataType !== "moveObject") {
      throw new Error("not an object");
    }
    if (!isWormholeMessenger(content.type)) {
      throw new Error(`object at ${(content.fields as any).id} is not a WormholeMessenger object`);
    }
    return WormholeMessenger.fromFieldsWithTypes(content);
  }

  static fromSuiObjectData(data: SuiObjectData): WormholeMessenger {
    if (data.bcs) {
      if (data.bcs.dataType !== "moveObject" || !isWormholeMessenger(data.bcs.type)) {
        throw new Error(`object at is not a WormholeMessenger object`);
      }

      return WormholeMessenger.fromBcs(fromB64(data.bcs.bcsBytes));
    }
    if (data.content) {
      return WormholeMessenger.fromSuiParsedData(data.content);
    }
    throw new Error(
      "Both `bcs` and `content` fields are missing from the data. Include `showBcs` or `showContent` in the request."
    );
  }

  static async fetch(client: SuiClient, id: string): Promise<WormholeMessenger> {
    const res = await client.getObject({ id, options: { showBcs: true } });
    if (res.error) {
      throw new Error(`error fetching WormholeMessenger object at id ${id}: ${res.error.code}`);
    }
    if (res.data?.bcs?.dataType !== "moveObject" || !isWormholeMessenger(res.data.bcs.type)) {
      throw new Error(`object at id ${id} is not a WormholeMessenger object`);
    }

    return WormholeMessenger.fromSuiObjectData(res.data);
  }
}
