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
import { Message } from "../../utils/message/structs";
import { Set } from "../../utils/set/structs";
import { PKG_V1 } from "../index";
import { bcs } from "@mysten/sui/bcs";
import { SuiClient, SuiObjectData, SuiParsedData } from "@mysten/sui/client";
import { fromB64 } from "@mysten/sui/utils";

/* ============================== AdminCap =============================== */

export function isAdminCap(type: string): boolean {
  type = compressSuiType(type);
  return type === `${PKG_V1}::messenger::AdminCap`;
}

export interface AdminCapFields {
  id: ToField<UID>;
}

export type AdminCapReified = Reified<AdminCap, AdminCapFields>;

export class AdminCap implements StructClass {
  __StructClass = true as const;

  static get $typeName() {
    return `${PKG_V1}::messenger::AdminCap`;
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

/* ============================== Messenger =============================== */

export function isMessenger(type: string): boolean {
  type = compressSuiType(type);
  return type === `${PKG_V1}::messenger::Messenger`;
}

export interface MessengerFields {
  id: ToField<UID>;
  primaryValidator: ToField<Vector<"u8">>;
  secondaryValidators: ToField<Set<ToPhantom<Vector<"u8">>>>;
  receivedMessages: ToField<Set<ToPhantom<Message>>>;
  sentMessages: ToField<Set<ToPhantom<Message>>>;
  otherChainIds: ToField<Vector<"bool">>;
  gasUsage: ToField<Table<"u8", "u64">>;
  gasBalance: ToField<Balance<ToPhantom<SUI>>>;
}

export type MessengerReified = Reified<Messenger, MessengerFields>;

export class Messenger implements StructClass {
  __StructClass = true as const;

  static get $typeName() {
    return `${PKG_V1}::messenger::Messenger`;
  }
  static readonly $numTypeParams = 0;
  static readonly $isPhantom = [] as const;

  readonly $typeName = Messenger.$typeName;
  readonly $fullTypeName: string;
  readonly $typeArgs: [];
  readonly $isPhantom = Messenger.$isPhantom;

  readonly id: ToField<UID>;
  readonly primaryValidator: ToField<Vector<"u8">>;
  readonly secondaryValidators: ToField<Set<ToPhantom<Vector<"u8">>>>;
  readonly receivedMessages: ToField<Set<ToPhantom<Message>>>;
  readonly sentMessages: ToField<Set<ToPhantom<Message>>>;
  readonly otherChainIds: ToField<Vector<"bool">>;
  readonly gasUsage: ToField<Table<"u8", "u64">>;
  readonly gasBalance: ToField<Balance<ToPhantom<SUI>>>;

  private constructor(typeArgs: [], fields: MessengerFields) {
    this.$fullTypeName = composeSuiType(Messenger.$typeName, ...typeArgs) as string;
    this.$typeArgs = typeArgs;

    this.id = fields.id;
    this.primaryValidator = fields.primaryValidator;
    this.secondaryValidators = fields.secondaryValidators;
    this.receivedMessages = fields.receivedMessages;
    this.sentMessages = fields.sentMessages;
    this.otherChainIds = fields.otherChainIds;
    this.gasUsage = fields.gasUsage;
    this.gasBalance = fields.gasBalance;
  }

  static reified(): MessengerReified {
    return {
      typeName: Messenger.$typeName,
      fullTypeName: composeSuiType(Messenger.$typeName, ...[]) as string,
      typeArgs: [] as [],
      isPhantom: Messenger.$isPhantom,
      reifiedTypeArgs: [],
      fromFields: (fields: Record<string, any>) => Messenger.fromFields(fields),
      fromFieldsWithTypes: (item: FieldsWithTypes) => Messenger.fromFieldsWithTypes(item),
      fromBcs: (data: Uint8Array) => Messenger.fromBcs(data),
      bcs: Messenger.bcs,
      fromJSONField: (field: any) => Messenger.fromJSONField(field),
      fromJSON: (json: Record<string, any>) => Messenger.fromJSON(json),
      fromSuiParsedData: (content: SuiParsedData) => Messenger.fromSuiParsedData(content),
      fromSuiObjectData: (content: SuiObjectData) => Messenger.fromSuiObjectData(content),
      fetch: async (client: SuiClient, id: string) => Messenger.fetch(client, id),
      new: (fields: MessengerFields) => {
        return new Messenger([], fields);
      },
      kind: "StructClassReified",
    };
  }

  static get r() {
    return Messenger.reified();
  }

  static phantom(): PhantomReified<ToTypeStr<Messenger>> {
    return phantom(Messenger.reified());
  }
  static get p() {
    return Messenger.phantom();
  }

  static get bcs() {
    return bcs.struct("Messenger", {
      id: UID.bcs,
      primary_validator: bcs.vector(bcs.u8()),
      secondary_validators: Set.bcs,
      received_messages: Set.bcs,
      sent_messages: Set.bcs,
      other_chain_ids: bcs.vector(bcs.bool()),
      gas_usage: Table.bcs,
      gas_balance: Balance.bcs,
    });
  }

  static fromFields(fields: Record<string, any>): Messenger {
    return Messenger.reified().new({
      id: decodeFromFields(UID.reified(), fields.id),
      primaryValidator: decodeFromFields(reified.vector("u8"), fields.primary_validator),
      secondaryValidators: decodeFromFields(
        Set.reified(reified.phantom(reified.vector("u8"))),
        fields.secondary_validators
      ),
      receivedMessages: decodeFromFields(Set.reified(reified.phantom(Message.reified())), fields.received_messages),
      sentMessages: decodeFromFields(Set.reified(reified.phantom(Message.reified())), fields.sent_messages),
      otherChainIds: decodeFromFields(reified.vector("bool"), fields.other_chain_ids),
      gasUsage: decodeFromFields(Table.reified(reified.phantom("u8"), reified.phantom("u64")), fields.gas_usage),
      gasBalance: decodeFromFields(Balance.reified(reified.phantom(SUI.reified())), fields.gas_balance),
    });
  }

  static fromFieldsWithTypes(item: FieldsWithTypes): Messenger {
    if (!isMessenger(item.type)) {
      throw new Error("not a Messenger type");
    }

    return Messenger.reified().new({
      id: decodeFromFieldsWithTypes(UID.reified(), item.fields.id),
      primaryValidator: decodeFromFieldsWithTypes(reified.vector("u8"), item.fields.primary_validator),
      secondaryValidators: decodeFromFieldsWithTypes(
        Set.reified(reified.phantom(reified.vector("u8"))),
        item.fields.secondary_validators
      ),
      receivedMessages: decodeFromFieldsWithTypes(
        Set.reified(reified.phantom(Message.reified())),
        item.fields.received_messages
      ),
      sentMessages: decodeFromFieldsWithTypes(
        Set.reified(reified.phantom(Message.reified())),
        item.fields.sent_messages
      ),
      otherChainIds: decodeFromFieldsWithTypes(reified.vector("bool"), item.fields.other_chain_ids),
      gasUsage: decodeFromFieldsWithTypes(
        Table.reified(reified.phantom("u8"), reified.phantom("u64")),
        item.fields.gas_usage
      ),
      gasBalance: decodeFromFieldsWithTypes(Balance.reified(reified.phantom(SUI.reified())), item.fields.gas_balance),
    });
  }

  static fromBcs(data: Uint8Array): Messenger {
    return Messenger.fromFields(Messenger.bcs.parse(data));
  }

  toJSONField() {
    return {
      id: this.id,
      primaryValidator: fieldToJSON<Vector<"u8">>(`vector<u8>`, this.primaryValidator),
      secondaryValidators: this.secondaryValidators.toJSONField(),
      receivedMessages: this.receivedMessages.toJSONField(),
      sentMessages: this.sentMessages.toJSONField(),
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

  static fromJSONField(field: any): Messenger {
    return Messenger.reified().new({
      id: decodeFromJSONField(UID.reified(), field.id),
      primaryValidator: decodeFromJSONField(reified.vector("u8"), field.primaryValidator),
      secondaryValidators: decodeFromJSONField(
        Set.reified(reified.phantom(reified.vector("u8"))),
        field.secondaryValidators
      ),
      receivedMessages: decodeFromJSONField(Set.reified(reified.phantom(Message.reified())), field.receivedMessages),
      sentMessages: decodeFromJSONField(Set.reified(reified.phantom(Message.reified())), field.sentMessages),
      otherChainIds: decodeFromJSONField(reified.vector("bool"), field.otherChainIds),
      gasUsage: decodeFromJSONField(Table.reified(reified.phantom("u8"), reified.phantom("u64")), field.gasUsage),
      gasBalance: decodeFromJSONField(Balance.reified(reified.phantom(SUI.reified())), field.gasBalance),
    });
  }

  static fromJSON(json: Record<string, any>): Messenger {
    if (json.$typeName !== Messenger.$typeName) {
      throw new Error("not a WithTwoGenerics json object");
    }

    return Messenger.fromJSONField(json);
  }

  static fromSuiParsedData(content: SuiParsedData): Messenger {
    if (content.dataType !== "moveObject") {
      throw new Error("not an object");
    }
    if (!isMessenger(content.type)) {
      throw new Error(`object at ${(content.fields as any).id} is not a Messenger object`);
    }
    return Messenger.fromFieldsWithTypes(content);
  }

  static fromSuiObjectData(data: SuiObjectData): Messenger {
    if (data.bcs) {
      if (data.bcs.dataType !== "moveObject" || !isMessenger(data.bcs.type)) {
        throw new Error(`object at is not a Messenger object`);
      }

      return Messenger.fromBcs(fromB64(data.bcs.bcsBytes));
    }
    if (data.content) {
      return Messenger.fromSuiParsedData(data.content);
    }
    throw new Error(
      "Both `bcs` and `content` fields are missing from the data. Include `showBcs` or `showContent` in the request."
    );
  }

  static async fetch(client: SuiClient, id: string): Promise<Messenger> {
    const res = await client.getObject({ id, options: { showBcs: true } });
    if (res.error) {
      throw new Error(`error fetching Messenger object at id ${id}: ${res.error.code}`);
    }
    if (res.data?.bcs?.dataType !== "moveObject" || !isMessenger(res.data.bcs.type)) {
      throw new Error(`object at id ${id} is not a Messenger object`);
    }

    return Messenger.fromSuiObjectData(res.data);
  }
}
