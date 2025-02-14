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
import { PKG_V1 } from "../index";
import { bcs } from "@mysten/sui/bcs";
import { SuiClient, SuiObjectData, SuiParsedData } from "@mysten/sui/client";
import { fromB64 } from "@mysten/sui/utils";

/* ============================== MessengerProtocol =============================== */

export function isMessengerProtocol(type: string): boolean {
  type = compressSuiType(type);
  return type === `${PKG_V1}::messenger_protocol::MessengerProtocol`;
}

export interface MessengerProtocolFields {
  id: ToField<"u8">;
}

export type MessengerProtocolReified = Reified<MessengerProtocol, MessengerProtocolFields>;

export class MessengerProtocol implements StructClass {
  __StructClass = true as const;

  static get $typeName() {
    return `${PKG_V1}::messenger_protocol::MessengerProtocol`;
  }
  static readonly $numTypeParams = 0;
  static readonly $isPhantom = [] as const;

  readonly $typeName = MessengerProtocol.$typeName;
  readonly $fullTypeName: string;
  readonly $typeArgs: [];
  readonly $isPhantom = MessengerProtocol.$isPhantom;

  readonly id: ToField<"u8">;

  private constructor(typeArgs: [], fields: MessengerProtocolFields) {
    this.$fullTypeName = composeSuiType(MessengerProtocol.$typeName, ...typeArgs) as string;
    this.$typeArgs = typeArgs;

    this.id = fields.id;
  }

  static reified(): MessengerProtocolReified {
    return {
      typeName: MessengerProtocol.$typeName,
      fullTypeName: composeSuiType(MessengerProtocol.$typeName, ...[]) as string,
      typeArgs: [] as [],
      isPhantom: MessengerProtocol.$isPhantom,
      reifiedTypeArgs: [],
      fromFields: (fields: Record<string, any>) => MessengerProtocol.fromFields(fields),
      fromFieldsWithTypes: (item: FieldsWithTypes) => MessengerProtocol.fromFieldsWithTypes(item),
      fromBcs: (data: Uint8Array) => MessengerProtocol.fromBcs(data),
      bcs: MessengerProtocol.bcs,
      fromJSONField: (field: any) => MessengerProtocol.fromJSONField(field),
      fromJSON: (json: Record<string, any>) => MessengerProtocol.fromJSON(json),
      fromSuiParsedData: (content: SuiParsedData) => MessengerProtocol.fromSuiParsedData(content),
      fromSuiObjectData: (content: SuiObjectData) => MessengerProtocol.fromSuiObjectData(content),
      fetch: async (client: SuiClient, id: string) => MessengerProtocol.fetch(client, id),
      new: (fields: MessengerProtocolFields) => {
        return new MessengerProtocol([], fields);
      },
      kind: "StructClassReified",
    };
  }

  static get r() {
    return MessengerProtocol.reified();
  }

  static phantom(): PhantomReified<ToTypeStr<MessengerProtocol>> {
    return phantom(MessengerProtocol.reified());
  }
  static get p() {
    return MessengerProtocol.phantom();
  }

  static get bcs() {
    return bcs.struct("MessengerProtocol", {
      id: bcs.u8(),
    });
  }

  static fromFields(fields: Record<string, any>): MessengerProtocol {
    return MessengerProtocol.reified().new({
      id: decodeFromFields("u8", fields.id),
    });
  }

  static fromFieldsWithTypes(item: FieldsWithTypes): MessengerProtocol {
    if (!isMessengerProtocol(item.type)) {
      throw new Error("not a MessengerProtocol type");
    }

    return MessengerProtocol.reified().new({
      id: decodeFromFieldsWithTypes("u8", item.fields.id),
    });
  }

  static fromBcs(data: Uint8Array): MessengerProtocol {
    return MessengerProtocol.fromFields(MessengerProtocol.bcs.parse(data));
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

  static fromJSONField(field: any): MessengerProtocol {
    return MessengerProtocol.reified().new({
      id: decodeFromJSONField("u8", field.id),
    });
  }

  static fromJSON(json: Record<string, any>): MessengerProtocol {
    if (json.$typeName !== MessengerProtocol.$typeName) {
      throw new Error("not a WithTwoGenerics json object");
    }

    return MessengerProtocol.fromJSONField(json);
  }

  static fromSuiParsedData(content: SuiParsedData): MessengerProtocol {
    if (content.dataType !== "moveObject") {
      throw new Error("not an object");
    }
    if (!isMessengerProtocol(content.type)) {
      throw new Error(`object at ${(content.fields as any).id} is not a MessengerProtocol object`);
    }
    return MessengerProtocol.fromFieldsWithTypes(content);
  }

  static fromSuiObjectData(data: SuiObjectData): MessengerProtocol {
    if (data.bcs) {
      if (data.bcs.dataType !== "moveObject" || !isMessengerProtocol(data.bcs.type)) {
        throw new Error(`object at is not a MessengerProtocol object`);
      }

      return MessengerProtocol.fromBcs(fromB64(data.bcs.bcsBytes));
    }
    if (data.content) {
      return MessengerProtocol.fromSuiParsedData(data.content);
    }
    throw new Error(
      "Both `bcs` and `content` fields are missing from the data. Include `showBcs` or `showContent` in the request."
    );
  }

  static async fetch(client: SuiClient, id: string): Promise<MessengerProtocol> {
    const res = await client.getObject({ id, options: { showBcs: true } });
    if (res.error) {
      throw new Error(`error fetching MessengerProtocol object at id ${id}: ${res.error.code}`);
    }
    if (res.data?.bcs?.dataType !== "moveObject" || !isMessengerProtocol(res.data.bcs.type)) {
      throw new Error(`object at id ${id} is not a MessengerProtocol object`);
    }

    return MessengerProtocol.fromSuiObjectData(res.data);
  }
}
