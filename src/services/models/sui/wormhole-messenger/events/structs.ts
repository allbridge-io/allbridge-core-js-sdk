// @ts-nocheck
import { String } from "../../_dependencies/source/0x1/ascii/structs";
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
} from "../../_framework/reified";
import { FieldsWithTypes, composeSuiType, compressSuiType } from "../../_framework/util";
import { PKG_V1 } from "../index";
import { bcs } from "@mysten/sui/bcs";
import { SuiClient, SuiObjectData, SuiParsedData } from "@mysten/sui/client";
import { fromB64 } from "@mysten/sui/utils";

/* ============================== MessageReceivedEvent =============================== */

export function isMessageReceivedEvent(type: string): boolean {
  type = compressSuiType(type);
  return type === `${PKG_V1}::events::MessageReceivedEvent`;
}

export interface MessageReceivedEventFields {
  message: ToField<String>;
  sequence: ToField<"u64">;
}

export type MessageReceivedEventReified = Reified<MessageReceivedEvent, MessageReceivedEventFields>;

export class MessageReceivedEvent implements StructClass {
  __StructClass = true as const;

  static get $typeName() {
    return `${PKG_V1}::events::MessageReceivedEvent`;
  }
  static readonly $numTypeParams = 0;
  static readonly $isPhantom = [] as const;

  readonly $typeName = MessageReceivedEvent.$typeName;
  readonly $fullTypeName: string;
  readonly $typeArgs: [];
  readonly $isPhantom = MessageReceivedEvent.$isPhantom;

  readonly message: ToField<String>;
  readonly sequence: ToField<"u64">;

  private constructor(typeArgs: [], fields: MessageReceivedEventFields) {
    this.$fullTypeName = composeSuiType(MessageReceivedEvent.$typeName, ...typeArgs) as string;
    this.$typeArgs = typeArgs;

    this.message = fields.message;
    this.sequence = fields.sequence;
  }

  static reified(): MessageReceivedEventReified {
    return {
      typeName: MessageReceivedEvent.$typeName,
      fullTypeName: composeSuiType(MessageReceivedEvent.$typeName, ...[]) as string,
      typeArgs: [] as [],
      isPhantom: MessageReceivedEvent.$isPhantom,
      reifiedTypeArgs: [],
      fromFields: (fields: Record<string, any>) => MessageReceivedEvent.fromFields(fields),
      fromFieldsWithTypes: (item: FieldsWithTypes) => MessageReceivedEvent.fromFieldsWithTypes(item),
      fromBcs: (data: Uint8Array) => MessageReceivedEvent.fromBcs(data),
      bcs: MessageReceivedEvent.bcs,
      fromJSONField: (field: any) => MessageReceivedEvent.fromJSONField(field),
      fromJSON: (json: Record<string, any>) => MessageReceivedEvent.fromJSON(json),
      fromSuiParsedData: (content: SuiParsedData) => MessageReceivedEvent.fromSuiParsedData(content),
      fromSuiObjectData: (content: SuiObjectData) => MessageReceivedEvent.fromSuiObjectData(content),
      fetch: async (client: SuiClient, id: string) => MessageReceivedEvent.fetch(client, id),
      new: (fields: MessageReceivedEventFields) => {
        return new MessageReceivedEvent([], fields);
      },
      kind: "StructClassReified",
    };
  }

  static get r() {
    return MessageReceivedEvent.reified();
  }

  static phantom(): PhantomReified<ToTypeStr<MessageReceivedEvent>> {
    return phantom(MessageReceivedEvent.reified());
  }
  static get p() {
    return MessageReceivedEvent.phantom();
  }

  static get bcs() {
    return bcs.struct("MessageReceivedEvent", {
      message: String.bcs,
      sequence: bcs.u64(),
    });
  }

  static fromFields(fields: Record<string, any>): MessageReceivedEvent {
    return MessageReceivedEvent.reified().new({
      message: decodeFromFields(String.reified(), fields.message),
      sequence: decodeFromFields("u64", fields.sequence),
    });
  }

  static fromFieldsWithTypes(item: FieldsWithTypes): MessageReceivedEvent {
    if (!isMessageReceivedEvent(item.type)) {
      throw new Error("not a MessageReceivedEvent type");
    }

    return MessageReceivedEvent.reified().new({
      message: decodeFromFieldsWithTypes(String.reified(), item.fields.message),
      sequence: decodeFromFieldsWithTypes("u64", item.fields.sequence),
    });
  }

  static fromBcs(data: Uint8Array): MessageReceivedEvent {
    return MessageReceivedEvent.fromFields(MessageReceivedEvent.bcs.parse(data));
  }

  toJSONField() {
    return {
      message: this.message,
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

  static fromJSONField(field: any): MessageReceivedEvent {
    return MessageReceivedEvent.reified().new({
      message: decodeFromJSONField(String.reified(), field.message),
      sequence: decodeFromJSONField("u64", field.sequence),
    });
  }

  static fromJSON(json: Record<string, any>): MessageReceivedEvent {
    if (json.$typeName !== MessageReceivedEvent.$typeName) {
      throw new Error("not a WithTwoGenerics json object");
    }

    return MessageReceivedEvent.fromJSONField(json);
  }

  static fromSuiParsedData(content: SuiParsedData): MessageReceivedEvent {
    if (content.dataType !== "moveObject") {
      throw new Error("not an object");
    }
    if (!isMessageReceivedEvent(content.type)) {
      throw new Error(`object at ${(content.fields as any).id} is not a MessageReceivedEvent object`);
    }
    return MessageReceivedEvent.fromFieldsWithTypes(content);
  }

  static fromSuiObjectData(data: SuiObjectData): MessageReceivedEvent {
    if (data.bcs) {
      if (data.bcs.dataType !== "moveObject" || !isMessageReceivedEvent(data.bcs.type)) {
        throw new Error(`object at is not a MessageReceivedEvent object`);
      }

      return MessageReceivedEvent.fromBcs(fromB64(data.bcs.bcsBytes));
    }
    if (data.content) {
      return MessageReceivedEvent.fromSuiParsedData(data.content);
    }
    throw new Error(
      "Both `bcs` and `content` fields are missing from the data. Include `showBcs` or `showContent` in the request."
    );
  }

  static async fetch(client: SuiClient, id: string): Promise<MessageReceivedEvent> {
    const res = await client.getObject({ id, options: { showBcs: true } });
    if (res.error) {
      throw new Error(`error fetching MessageReceivedEvent object at id ${id}: ${res.error.code}`);
    }
    if (res.data?.bcs?.dataType !== "moveObject" || !isMessageReceivedEvent(res.data.bcs.type)) {
      throw new Error(`object at id ${id} is not a MessageReceivedEvent object`);
    }

    return MessageReceivedEvent.fromSuiObjectData(res.data);
  }
}

/* ============================== MessageSentEvent =============================== */

export function isMessageSentEvent(type: string): boolean {
  type = compressSuiType(type);
  return type === `${PKG_V1}::events::MessageSentEvent`;
}

export interface MessageSentEventFields {
  message: ToField<String>;
  sequence: ToField<"u64">;
}

export type MessageSentEventReified = Reified<MessageSentEvent, MessageSentEventFields>;

export class MessageSentEvent implements StructClass {
  __StructClass = true as const;

  static get $typeName() {
    return `${PKG_V1}::events::MessageSentEvent`;
  }
  static readonly $numTypeParams = 0;
  static readonly $isPhantom = [] as const;

  readonly $typeName = MessageSentEvent.$typeName;
  readonly $fullTypeName: string;
  readonly $typeArgs: [];
  readonly $isPhantom = MessageSentEvent.$isPhantom;

  readonly message: ToField<String>;
  readonly sequence: ToField<"u64">;

  private constructor(typeArgs: [], fields: MessageSentEventFields) {
    this.$fullTypeName = composeSuiType(MessageSentEvent.$typeName, ...typeArgs) as string;
    this.$typeArgs = typeArgs;

    this.message = fields.message;
    this.sequence = fields.sequence;
  }

  static reified(): MessageSentEventReified {
    return {
      typeName: MessageSentEvent.$typeName,
      fullTypeName: composeSuiType(MessageSentEvent.$typeName, ...[]) as string,
      typeArgs: [] as [],
      isPhantom: MessageSentEvent.$isPhantom,
      reifiedTypeArgs: [],
      fromFields: (fields: Record<string, any>) => MessageSentEvent.fromFields(fields),
      fromFieldsWithTypes: (item: FieldsWithTypes) => MessageSentEvent.fromFieldsWithTypes(item),
      fromBcs: (data: Uint8Array) => MessageSentEvent.fromBcs(data),
      bcs: MessageSentEvent.bcs,
      fromJSONField: (field: any) => MessageSentEvent.fromJSONField(field),
      fromJSON: (json: Record<string, any>) => MessageSentEvent.fromJSON(json),
      fromSuiParsedData: (content: SuiParsedData) => MessageSentEvent.fromSuiParsedData(content),
      fromSuiObjectData: (content: SuiObjectData) => MessageSentEvent.fromSuiObjectData(content),
      fetch: async (client: SuiClient, id: string) => MessageSentEvent.fetch(client, id),
      new: (fields: MessageSentEventFields) => {
        return new MessageSentEvent([], fields);
      },
      kind: "StructClassReified",
    };
  }

  static get r() {
    return MessageSentEvent.reified();
  }

  static phantom(): PhantomReified<ToTypeStr<MessageSentEvent>> {
    return phantom(MessageSentEvent.reified());
  }
  static get p() {
    return MessageSentEvent.phantom();
  }

  static get bcs() {
    return bcs.struct("MessageSentEvent", {
      message: String.bcs,
      sequence: bcs.u64(),
    });
  }

  static fromFields(fields: Record<string, any>): MessageSentEvent {
    return MessageSentEvent.reified().new({
      message: decodeFromFields(String.reified(), fields.message),
      sequence: decodeFromFields("u64", fields.sequence),
    });
  }

  static fromFieldsWithTypes(item: FieldsWithTypes): MessageSentEvent {
    if (!isMessageSentEvent(item.type)) {
      throw new Error("not a MessageSentEvent type");
    }

    return MessageSentEvent.reified().new({
      message: decodeFromFieldsWithTypes(String.reified(), item.fields.message),
      sequence: decodeFromFieldsWithTypes("u64", item.fields.sequence),
    });
  }

  static fromBcs(data: Uint8Array): MessageSentEvent {
    return MessageSentEvent.fromFields(MessageSentEvent.bcs.parse(data));
  }

  toJSONField() {
    return {
      message: this.message,
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

  static fromJSONField(field: any): MessageSentEvent {
    return MessageSentEvent.reified().new({
      message: decodeFromJSONField(String.reified(), field.message),
      sequence: decodeFromJSONField("u64", field.sequence),
    });
  }

  static fromJSON(json: Record<string, any>): MessageSentEvent {
    if (json.$typeName !== MessageSentEvent.$typeName) {
      throw new Error("not a WithTwoGenerics json object");
    }

    return MessageSentEvent.fromJSONField(json);
  }

  static fromSuiParsedData(content: SuiParsedData): MessageSentEvent {
    if (content.dataType !== "moveObject") {
      throw new Error("not an object");
    }
    if (!isMessageSentEvent(content.type)) {
      throw new Error(`object at ${(content.fields as any).id} is not a MessageSentEvent object`);
    }
    return MessageSentEvent.fromFieldsWithTypes(content);
  }

  static fromSuiObjectData(data: SuiObjectData): MessageSentEvent {
    if (data.bcs) {
      if (data.bcs.dataType !== "moveObject" || !isMessageSentEvent(data.bcs.type)) {
        throw new Error(`object at is not a MessageSentEvent object`);
      }

      return MessageSentEvent.fromBcs(fromB64(data.bcs.bcsBytes));
    }
    if (data.content) {
      return MessageSentEvent.fromSuiParsedData(data.content);
    }
    throw new Error(
      "Both `bcs` and `content` fields are missing from the data. Include `showBcs` or `showContent` in the request."
    );
  }

  static async fetch(client: SuiClient, id: string): Promise<MessageSentEvent> {
    const res = await client.getObject({ id, options: { showBcs: true } });
    if (res.error) {
      throw new Error(`error fetching MessageSentEvent object at id ${id}: ${res.error.code}`);
    }
    if (res.data?.bcs?.dataType !== "moveObject" || !isMessageSentEvent(res.data.bcs.type)) {
      throw new Error(`object at id ${id} is not a MessageSentEvent object`);
    }

    return MessageSentEvent.fromSuiObjectData(res.data);
  }
}
