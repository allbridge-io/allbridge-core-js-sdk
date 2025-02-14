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
import { fromB64, fromHEX, toHEX } from "@mysten/sui/utils";

/* ============================== BurnMessage =============================== */

export function isBurnMessage(type: string): boolean {
  type = compressSuiType(type);
  return type === `${PKG_V1}::burn_message::BurnMessage`;
}

export interface BurnMessageFields {
  version: ToField<"u32">;
  burnToken: ToField<"address">;
  mintRecipient: ToField<"address">;
  amount: ToField<"u256">;
  messageSender: ToField<"address">;
}

export type BurnMessageReified = Reified<BurnMessage, BurnMessageFields>;

export class BurnMessage implements StructClass {
  __StructClass = true as const;

  static get $typeName() {
    return `${PKG_V1}::burn_message::BurnMessage`;
  }
  static readonly $numTypeParams = 0;
  static readonly $isPhantom = [] as const;

  readonly $typeName = BurnMessage.$typeName;
  readonly $fullTypeName: string;
  readonly $typeArgs: [];
  readonly $isPhantom = BurnMessage.$isPhantom;

  readonly version: ToField<"u32">;
  readonly burnToken: ToField<"address">;
  readonly mintRecipient: ToField<"address">;
  readonly amount: ToField<"u256">;
  readonly messageSender: ToField<"address">;

  private constructor(typeArgs: [], fields: BurnMessageFields) {
    this.$fullTypeName = composeSuiType(BurnMessage.$typeName, ...typeArgs) as string;
    this.$typeArgs = typeArgs;

    this.version = fields.version;
    this.burnToken = fields.burnToken;
    this.mintRecipient = fields.mintRecipient;
    this.amount = fields.amount;
    this.messageSender = fields.messageSender;
  }

  static reified(): BurnMessageReified {
    return {
      typeName: BurnMessage.$typeName,
      fullTypeName: composeSuiType(BurnMessage.$typeName, ...[]) as string,
      typeArgs: [] as [],
      isPhantom: BurnMessage.$isPhantom,
      reifiedTypeArgs: [],
      fromFields: (fields: Record<string, any>) => BurnMessage.fromFields(fields),
      fromFieldsWithTypes: (item: FieldsWithTypes) => BurnMessage.fromFieldsWithTypes(item),
      fromBcs: (data: Uint8Array) => BurnMessage.fromBcs(data),
      bcs: BurnMessage.bcs,
      fromJSONField: (field: any) => BurnMessage.fromJSONField(field),
      fromJSON: (json: Record<string, any>) => BurnMessage.fromJSON(json),
      fromSuiParsedData: (content: SuiParsedData) => BurnMessage.fromSuiParsedData(content),
      fromSuiObjectData: (content: SuiObjectData) => BurnMessage.fromSuiObjectData(content),
      fetch: async (client: SuiClient, id: string) => BurnMessage.fetch(client, id),
      new: (fields: BurnMessageFields) => {
        return new BurnMessage([], fields);
      },
      kind: "StructClassReified",
    };
  }

  static get r() {
    return BurnMessage.reified();
  }

  static phantom(): PhantomReified<ToTypeStr<BurnMessage>> {
    return phantom(BurnMessage.reified());
  }
  static get p() {
    return BurnMessage.phantom();
  }

  static get bcs() {
    return bcs.struct("BurnMessage", {
      version: bcs.u32(),
      burn_token: bcs.bytes(32).transform({
        input: (val: string) => fromHEX(val),
        output: (val: Uint8Array) => toHEX(val),
      }),
      mint_recipient: bcs.bytes(32).transform({
        input: (val: string) => fromHEX(val),
        output: (val: Uint8Array) => toHEX(val),
      }),
      amount: bcs.u256(),
      message_sender: bcs.bytes(32).transform({
        input: (val: string) => fromHEX(val),
        output: (val: Uint8Array) => toHEX(val),
      }),
    });
  }

  static fromFields(fields: Record<string, any>): BurnMessage {
    return BurnMessage.reified().new({
      version: decodeFromFields("u32", fields.version),
      burnToken: decodeFromFields("address", fields.burn_token),
      mintRecipient: decodeFromFields("address", fields.mint_recipient),
      amount: decodeFromFields("u256", fields.amount),
      messageSender: decodeFromFields("address", fields.message_sender),
    });
  }

  static fromFieldsWithTypes(item: FieldsWithTypes): BurnMessage {
    if (!isBurnMessage(item.type)) {
      throw new Error("not a BurnMessage type");
    }

    return BurnMessage.reified().new({
      version: decodeFromFieldsWithTypes("u32", item.fields.version),
      burnToken: decodeFromFieldsWithTypes("address", item.fields.burn_token),
      mintRecipient: decodeFromFieldsWithTypes("address", item.fields.mint_recipient),
      amount: decodeFromFieldsWithTypes("u256", item.fields.amount),
      messageSender: decodeFromFieldsWithTypes("address", item.fields.message_sender),
    });
  }

  static fromBcs(data: Uint8Array): BurnMessage {
    return BurnMessage.fromFields(BurnMessage.bcs.parse(data));
  }

  toJSONField() {
    return {
      version: this.version,
      burnToken: this.burnToken,
      mintRecipient: this.mintRecipient,
      amount: this.amount.toString(),
      messageSender: this.messageSender,
    };
  }

  toJSON() {
    return {
      $typeName: this.$typeName,
      $typeArgs: this.$typeArgs,
      ...this.toJSONField(),
    };
  }

  static fromJSONField(field: any): BurnMessage {
    return BurnMessage.reified().new({
      version: decodeFromJSONField("u32", field.version),
      burnToken: decodeFromJSONField("address", field.burnToken),
      mintRecipient: decodeFromJSONField("address", field.mintRecipient),
      amount: decodeFromJSONField("u256", field.amount),
      messageSender: decodeFromJSONField("address", field.messageSender),
    });
  }

  static fromJSON(json: Record<string, any>): BurnMessage {
    if (json.$typeName !== BurnMessage.$typeName) {
      throw new Error("not a WithTwoGenerics json object");
    }

    return BurnMessage.fromJSONField(json);
  }

  static fromSuiParsedData(content: SuiParsedData): BurnMessage {
    if (content.dataType !== "moveObject") {
      throw new Error("not an object");
    }
    if (!isBurnMessage(content.type)) {
      throw new Error(`object at ${(content.fields as any).id} is not a BurnMessage object`);
    }
    return BurnMessage.fromFieldsWithTypes(content);
  }

  static fromSuiObjectData(data: SuiObjectData): BurnMessage {
    if (data.bcs) {
      if (data.bcs.dataType !== "moveObject" || !isBurnMessage(data.bcs.type)) {
        throw new Error(`object at is not a BurnMessage object`);
      }

      return BurnMessage.fromBcs(fromB64(data.bcs.bcsBytes));
    }
    if (data.content) {
      return BurnMessage.fromSuiParsedData(data.content);
    }
    throw new Error(
      "Both `bcs` and `content` fields are missing from the data. Include `showBcs` or `showContent` in the request."
    );
  }

  static async fetch(client: SuiClient, id: string): Promise<BurnMessage> {
    const res = await client.getObject({ id, options: { showBcs: true } });
    if (res.error) {
      throw new Error(`error fetching BurnMessage object at id ${id}: ${res.error.code}`);
    }
    if (res.data?.bcs?.dataType !== "moveObject" || !isBurnMessage(res.data.bcs.type)) {
      throw new Error(`object at id ${id} is not a BurnMessage object`);
    }

    return BurnMessage.fromSuiObjectData(res.data);
  }
}
