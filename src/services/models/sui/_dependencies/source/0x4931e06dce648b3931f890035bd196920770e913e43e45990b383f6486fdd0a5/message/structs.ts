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
  fieldToJSON,
  phantom,
} from "../../../../_framework/reified";
import { FieldsWithTypes, composeSuiType, compressSuiType } from "../../../../_framework/util";
import { Vector } from "../../../../_framework/vector";
import { PKG_V1 } from "../index";
import { bcs } from "@mysten/sui/bcs";
import { SuiClient, SuiObjectData, SuiParsedData } from "@mysten/sui/client";
import { fromB64, fromHEX, toHEX } from "@mysten/sui/utils";

/* ============================== Message =============================== */

export function isMessage(type: string): boolean {
  type = compressSuiType(type);
  return type === `${PKG_V1}::message::Message`;
}

export interface MessageFields {
  version: ToField<"u32">;
  sourceDomain: ToField<"u32">;
  destinationDomain: ToField<"u32">;
  nonce: ToField<"u64">;
  sender: ToField<"address">;
  recipient: ToField<"address">;
  destinationCaller: ToField<"address">;
  messageBody: ToField<Vector<"u8">>;
}

export type MessageReified = Reified<Message, MessageFields>;

export class Message implements StructClass {
  __StructClass = true as const;

  static get $typeName() {
    return `${PKG_V1}::message::Message`;
  }
  static readonly $numTypeParams = 0;
  static readonly $isPhantom = [] as const;

  readonly $typeName = Message.$typeName;
  readonly $fullTypeName: string;
  readonly $typeArgs: [];
  readonly $isPhantom = Message.$isPhantom;

  readonly version: ToField<"u32">;
  readonly sourceDomain: ToField<"u32">;
  readonly destinationDomain: ToField<"u32">;
  readonly nonce: ToField<"u64">;
  readonly sender: ToField<"address">;
  readonly recipient: ToField<"address">;
  readonly destinationCaller: ToField<"address">;
  readonly messageBody: ToField<Vector<"u8">>;

  private constructor(typeArgs: [], fields: MessageFields) {
    this.$fullTypeName = composeSuiType(Message.$typeName, ...typeArgs) as string;
    this.$typeArgs = typeArgs;

    this.version = fields.version;
    this.sourceDomain = fields.sourceDomain;
    this.destinationDomain = fields.destinationDomain;
    this.nonce = fields.nonce;
    this.sender = fields.sender;
    this.recipient = fields.recipient;
    this.destinationCaller = fields.destinationCaller;
    this.messageBody = fields.messageBody;
  }

  static reified(): MessageReified {
    return {
      typeName: Message.$typeName,
      fullTypeName: composeSuiType(Message.$typeName, ...[]) as string,
      typeArgs: [] as [],
      isPhantom: Message.$isPhantom,
      reifiedTypeArgs: [],
      fromFields: (fields: Record<string, any>) => Message.fromFields(fields),
      fromFieldsWithTypes: (item: FieldsWithTypes) => Message.fromFieldsWithTypes(item),
      fromBcs: (data: Uint8Array) => Message.fromBcs(data),
      bcs: Message.bcs,
      fromJSONField: (field: any) => Message.fromJSONField(field),
      fromJSON: (json: Record<string, any>) => Message.fromJSON(json),
      fromSuiParsedData: (content: SuiParsedData) => Message.fromSuiParsedData(content),
      fromSuiObjectData: (content: SuiObjectData) => Message.fromSuiObjectData(content),
      fetch: async (client: SuiClient, id: string) => Message.fetch(client, id),
      new: (fields: MessageFields) => {
        return new Message([], fields);
      },
      kind: "StructClassReified",
    };
  }

  static get r() {
    return Message.reified();
  }

  static phantom(): PhantomReified<ToTypeStr<Message>> {
    return phantom(Message.reified());
  }
  static get p() {
    return Message.phantom();
  }

  static get bcs() {
    return bcs.struct("Message", {
      version: bcs.u32(),
      source_domain: bcs.u32(),
      destination_domain: bcs.u32(),
      nonce: bcs.u64(),
      sender: bcs.bytes(32).transform({
        input: (val: string) => fromHEX(val),
        output: (val: Uint8Array) => toHEX(val),
      }),
      recipient: bcs.bytes(32).transform({
        input: (val: string) => fromHEX(val),
        output: (val: Uint8Array) => toHEX(val),
      }),
      destination_caller: bcs.bytes(32).transform({
        input: (val: string) => fromHEX(val),
        output: (val: Uint8Array) => toHEX(val),
      }),
      message_body: bcs.vector(bcs.u8()),
    });
  }

  static fromFields(fields: Record<string, any>): Message {
    return Message.reified().new({
      version: decodeFromFields("u32", fields.version),
      sourceDomain: decodeFromFields("u32", fields.source_domain),
      destinationDomain: decodeFromFields("u32", fields.destination_domain),
      nonce: decodeFromFields("u64", fields.nonce),
      sender: decodeFromFields("address", fields.sender),
      recipient: decodeFromFields("address", fields.recipient),
      destinationCaller: decodeFromFields("address", fields.destination_caller),
      messageBody: decodeFromFields(reified.vector("u8"), fields.message_body),
    });
  }

  static fromFieldsWithTypes(item: FieldsWithTypes): Message {
    if (!isMessage(item.type)) {
      throw new Error("not a Message type");
    }

    return Message.reified().new({
      version: decodeFromFieldsWithTypes("u32", item.fields.version),
      sourceDomain: decodeFromFieldsWithTypes("u32", item.fields.source_domain),
      destinationDomain: decodeFromFieldsWithTypes("u32", item.fields.destination_domain),
      nonce: decodeFromFieldsWithTypes("u64", item.fields.nonce),
      sender: decodeFromFieldsWithTypes("address", item.fields.sender),
      recipient: decodeFromFieldsWithTypes("address", item.fields.recipient),
      destinationCaller: decodeFromFieldsWithTypes("address", item.fields.destination_caller),
      messageBody: decodeFromFieldsWithTypes(reified.vector("u8"), item.fields.message_body),
    });
  }

  static fromBcs(data: Uint8Array): Message {
    return Message.fromFields(Message.bcs.parse(data));
  }

  toJSONField() {
    return {
      version: this.version,
      sourceDomain: this.sourceDomain,
      destinationDomain: this.destinationDomain,
      nonce: this.nonce.toString(),
      sender: this.sender,
      recipient: this.recipient,
      destinationCaller: this.destinationCaller,
      messageBody: fieldToJSON<Vector<"u8">>(`vector<u8>`, this.messageBody),
    };
  }

  toJSON() {
    return {
      $typeName: this.$typeName,
      $typeArgs: this.$typeArgs,
      ...this.toJSONField(),
    };
  }

  static fromJSONField(field: any): Message {
    return Message.reified().new({
      version: decodeFromJSONField("u32", field.version),
      sourceDomain: decodeFromJSONField("u32", field.sourceDomain),
      destinationDomain: decodeFromJSONField("u32", field.destinationDomain),
      nonce: decodeFromJSONField("u64", field.nonce),
      sender: decodeFromJSONField("address", field.sender),
      recipient: decodeFromJSONField("address", field.recipient),
      destinationCaller: decodeFromJSONField("address", field.destinationCaller),
      messageBody: decodeFromJSONField(reified.vector("u8"), field.messageBody),
    });
  }

  static fromJSON(json: Record<string, any>): Message {
    if (json.$typeName !== Message.$typeName) {
      throw new Error("not a WithTwoGenerics json object");
    }

    return Message.fromJSONField(json);
  }

  static fromSuiParsedData(content: SuiParsedData): Message {
    if (content.dataType !== "moveObject") {
      throw new Error("not an object");
    }
    if (!isMessage(content.type)) {
      throw new Error(`object at ${(content.fields as any).id} is not a Message object`);
    }
    return Message.fromFieldsWithTypes(content);
  }

  static fromSuiObjectData(data: SuiObjectData): Message {
    if (data.bcs) {
      if (data.bcs.dataType !== "moveObject" || !isMessage(data.bcs.type)) {
        throw new Error(`object at is not a Message object`);
      }

      return Message.fromBcs(fromB64(data.bcs.bcsBytes));
    }
    if (data.content) {
      return Message.fromSuiParsedData(data.content);
    }
    throw new Error(
      "Both `bcs` and `content` fields are missing from the data. Include `showBcs` or `showContent` in the request."
    );
  }

  static async fetch(client: SuiClient, id: string): Promise<Message> {
    const res = await client.getObject({ id, options: { showBcs: true } });
    if (res.error) {
      throw new Error(`error fetching Message object at id ${id}: ${res.error.code}`);
    }
    if (res.data?.bcs?.dataType !== "moveObject" || !isMessage(res.data.bcs.type)) {
      throw new Error(`object at id ${id} is not a Message object`);
    }

    return Message.fromSuiObjectData(res.data);
  }
}
