// @ts-nocheck
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
import { Bytes32 } from "../bytes32/structs";
import { PKG_V1 } from "../index";
import { bcs } from "@mysten/sui/bcs";
import { SuiClient, SuiObjectData, SuiParsedData } from "@mysten/sui/client";
import { fromB64 } from "@mysten/sui/utils";

/* ============================== Message =============================== */

export function isMessage(type: string): boolean {
  type = compressSuiType(type);
  return type === `${PKG_V1}::message::Message`;
}

export interface MessageFields {
  message: ToField<Bytes32>;
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

  readonly message: ToField<Bytes32>;

  private constructor(typeArgs: [], fields: MessageFields) {
    this.$fullTypeName = composeSuiType(Message.$typeName, ...typeArgs) as string;
    this.$typeArgs = typeArgs;

    this.message = fields.message;
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
      message: Bytes32.bcs,
    });
  }

  static fromFields(fields: Record<string, any>): Message {
    return Message.reified().new({
      message: decodeFromFields(Bytes32.reified(), fields.message),
    });
  }

  static fromFieldsWithTypes(item: FieldsWithTypes): Message {
    if (!isMessage(item.type)) {
      throw new Error("not a Message type");
    }

    return Message.reified().new({
      message: decodeFromFieldsWithTypes(Bytes32.reified(), item.fields.message),
    });
  }

  static fromBcs(data: Uint8Array): Message {
    return Message.fromFields(Message.bcs.parse(data));
  }

  toJSONField() {
    return {
      message: this.message.toJSONField(),
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
      message: decodeFromJSONField(Bytes32.reified(), field.message),
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
