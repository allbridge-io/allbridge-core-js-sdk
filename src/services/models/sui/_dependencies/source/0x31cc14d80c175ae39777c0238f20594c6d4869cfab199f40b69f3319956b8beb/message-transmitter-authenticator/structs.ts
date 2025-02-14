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
} from "../../../../_framework/reified";
import { FieldsWithTypes, composeSuiType, compressSuiType } from "../../../../_framework/util";
import { PKG_V1 } from "../index";
import { bcs } from "@mysten/sui/bcs";
import { SuiClient, SuiObjectData, SuiParsedData } from "@mysten/sui/client";
import { fromB64 } from "@mysten/sui/utils";

/* ============================== MessageTransmitterAuthenticator =============================== */

export function isMessageTransmitterAuthenticator(type: string): boolean {
  type = compressSuiType(type);
  return type === `${PKG_V1}::message_transmitter_authenticator::MessageTransmitterAuthenticator`;
}

export interface MessageTransmitterAuthenticatorFields {
  dummyField: ToField<"bool">;
}

export type MessageTransmitterAuthenticatorReified = Reified<
  MessageTransmitterAuthenticator,
  MessageTransmitterAuthenticatorFields
>;

export class MessageTransmitterAuthenticator implements StructClass {
  __StructClass = true as const;

  static get $typeName() {
    return `${PKG_V1}::message_transmitter_authenticator::MessageTransmitterAuthenticator`;
  }
  static readonly $numTypeParams = 0;
  static readonly $isPhantom = [] as const;

  readonly $typeName = MessageTransmitterAuthenticator.$typeName;
  readonly $fullTypeName: string;
  readonly $typeArgs: [];
  readonly $isPhantom = MessageTransmitterAuthenticator.$isPhantom;

  readonly dummyField: ToField<"bool">;

  private constructor(typeArgs: [], fields: MessageTransmitterAuthenticatorFields) {
    this.$fullTypeName = composeSuiType(MessageTransmitterAuthenticator.$typeName, ...typeArgs) as string;
    this.$typeArgs = typeArgs;

    this.dummyField = fields.dummyField;
  }

  static reified(): MessageTransmitterAuthenticatorReified {
    return {
      typeName: MessageTransmitterAuthenticator.$typeName,
      fullTypeName: composeSuiType(MessageTransmitterAuthenticator.$typeName, ...[]) as string,
      typeArgs: [] as [],
      isPhantom: MessageTransmitterAuthenticator.$isPhantom,
      reifiedTypeArgs: [],
      fromFields: (fields: Record<string, any>) => MessageTransmitterAuthenticator.fromFields(fields),
      fromFieldsWithTypes: (item: FieldsWithTypes) => MessageTransmitterAuthenticator.fromFieldsWithTypes(item),
      fromBcs: (data: Uint8Array) => MessageTransmitterAuthenticator.fromBcs(data),
      bcs: MessageTransmitterAuthenticator.bcs,
      fromJSONField: (field: any) => MessageTransmitterAuthenticator.fromJSONField(field),
      fromJSON: (json: Record<string, any>) => MessageTransmitterAuthenticator.fromJSON(json),
      fromSuiParsedData: (content: SuiParsedData) => MessageTransmitterAuthenticator.fromSuiParsedData(content),
      fromSuiObjectData: (content: SuiObjectData) => MessageTransmitterAuthenticator.fromSuiObjectData(content),
      fetch: async (client: SuiClient, id: string) => MessageTransmitterAuthenticator.fetch(client, id),
      new: (fields: MessageTransmitterAuthenticatorFields) => {
        return new MessageTransmitterAuthenticator([], fields);
      },
      kind: "StructClassReified",
    };
  }

  static get r() {
    return MessageTransmitterAuthenticator.reified();
  }

  static phantom(): PhantomReified<ToTypeStr<MessageTransmitterAuthenticator>> {
    return phantom(MessageTransmitterAuthenticator.reified());
  }
  static get p() {
    return MessageTransmitterAuthenticator.phantom();
  }

  static get bcs() {
    return bcs.struct("MessageTransmitterAuthenticator", {
      dummy_field: bcs.bool(),
    });
  }

  static fromFields(fields: Record<string, any>): MessageTransmitterAuthenticator {
    return MessageTransmitterAuthenticator.reified().new({
      dummyField: decodeFromFields("bool", fields.dummy_field),
    });
  }

  static fromFieldsWithTypes(item: FieldsWithTypes): MessageTransmitterAuthenticator {
    if (!isMessageTransmitterAuthenticator(item.type)) {
      throw new Error("not a MessageTransmitterAuthenticator type");
    }

    return MessageTransmitterAuthenticator.reified().new({
      dummyField: decodeFromFieldsWithTypes("bool", item.fields.dummy_field),
    });
  }

  static fromBcs(data: Uint8Array): MessageTransmitterAuthenticator {
    return MessageTransmitterAuthenticator.fromFields(MessageTransmitterAuthenticator.bcs.parse(data));
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

  static fromJSONField(field: any): MessageTransmitterAuthenticator {
    return MessageTransmitterAuthenticator.reified().new({
      dummyField: decodeFromJSONField("bool", field.dummyField),
    });
  }

  static fromJSON(json: Record<string, any>): MessageTransmitterAuthenticator {
    if (json.$typeName !== MessageTransmitterAuthenticator.$typeName) {
      throw new Error("not a WithTwoGenerics json object");
    }

    return MessageTransmitterAuthenticator.fromJSONField(json);
  }

  static fromSuiParsedData(content: SuiParsedData): MessageTransmitterAuthenticator {
    if (content.dataType !== "moveObject") {
      throw new Error("not an object");
    }
    if (!isMessageTransmitterAuthenticator(content.type)) {
      throw new Error(`object at ${(content.fields as any).id} is not a MessageTransmitterAuthenticator object`);
    }
    return MessageTransmitterAuthenticator.fromFieldsWithTypes(content);
  }

  static fromSuiObjectData(data: SuiObjectData): MessageTransmitterAuthenticator {
    if (data.bcs) {
      if (data.bcs.dataType !== "moveObject" || !isMessageTransmitterAuthenticator(data.bcs.type)) {
        throw new Error(`object at is not a MessageTransmitterAuthenticator object`);
      }

      return MessageTransmitterAuthenticator.fromBcs(fromB64(data.bcs.bcsBytes));
    }
    if (data.content) {
      return MessageTransmitterAuthenticator.fromSuiParsedData(data.content);
    }
    throw new Error(
      "Both `bcs` and `content` fields are missing from the data. Include `showBcs` or `showContent` in the request."
    );
  }

  static async fetch(client: SuiClient, id: string): Promise<MessageTransmitterAuthenticator> {
    const res = await client.getObject({ id, options: { showBcs: true } });
    if (res.error) {
      throw new Error(`error fetching MessageTransmitterAuthenticator object at id ${id}: ${res.error.code}`);
    }
    if (res.data?.bcs?.dataType !== "moveObject" || !isMessageTransmitterAuthenticator(res.data.bcs.type)) {
      throw new Error(`object at id ${id} is not a MessageTransmitterAuthenticator object`);
    }

    return MessageTransmitterAuthenticator.fromSuiObjectData(res.data);
  }
}
