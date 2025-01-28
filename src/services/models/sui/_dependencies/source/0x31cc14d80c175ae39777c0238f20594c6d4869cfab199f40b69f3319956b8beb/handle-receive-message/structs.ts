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
import { StampReceiptTicket } from "../../0x4931e06dce648b3931f890035bd196920770e913e43e45990b383f6486fdd0a5/receive-message/structs";
import { BurnMessage } from "../burn-message/structs";
import { PKG_V1 } from "../index";
import { MessageTransmitterAuthenticator } from "../message-transmitter-authenticator/structs";
import { bcs } from "@mysten/sui/bcs";
import { SuiClient, SuiObjectData, SuiParsedData } from "@mysten/sui/client";
import { fromB64 } from "@mysten/sui/utils";

/* ============================== StampReceiptTicketWithBurnMessage =============================== */

export function isStampReceiptTicketWithBurnMessage(type: string): boolean {
  type = compressSuiType(type);
  return type === `${PKG_V1}::handle_receive_message::StampReceiptTicketWithBurnMessage`;
}

export interface StampReceiptTicketWithBurnMessageFields {
  stampReceiptTicket: ToField<StampReceiptTicket<MessageTransmitterAuthenticator>>;
  burnMessage: ToField<BurnMessage>;
}

export type StampReceiptTicketWithBurnMessageReified = Reified<
  StampReceiptTicketWithBurnMessage,
  StampReceiptTicketWithBurnMessageFields
>;

export class StampReceiptTicketWithBurnMessage implements StructClass {
  __StructClass = true as const;

  static get $typeName() {
    return `${PKG_V1}::handle_receive_message::StampReceiptTicketWithBurnMessage`;
  }
  static readonly $numTypeParams = 0;
  static readonly $isPhantom = [] as const;

  readonly $typeName = StampReceiptTicketWithBurnMessage.$typeName;
  readonly $fullTypeName: string;
  readonly $typeArgs: [];
  readonly $isPhantom = StampReceiptTicketWithBurnMessage.$isPhantom;

  readonly stampReceiptTicket: ToField<StampReceiptTicket<MessageTransmitterAuthenticator>>;
  readonly burnMessage: ToField<BurnMessage>;

  private constructor(typeArgs: [], fields: StampReceiptTicketWithBurnMessageFields) {
    this.$fullTypeName = composeSuiType(StampReceiptTicketWithBurnMessage.$typeName, ...typeArgs) as string;
    this.$typeArgs = typeArgs;

    this.stampReceiptTicket = fields.stampReceiptTicket;
    this.burnMessage = fields.burnMessage;
  }

  static reified(): StampReceiptTicketWithBurnMessageReified {
    return {
      typeName: StampReceiptTicketWithBurnMessage.$typeName,
      fullTypeName: composeSuiType(StampReceiptTicketWithBurnMessage.$typeName, ...[]) as string,
      typeArgs: [] as [],
      isPhantom: StampReceiptTicketWithBurnMessage.$isPhantom,
      reifiedTypeArgs: [],
      fromFields: (fields: Record<string, any>) => StampReceiptTicketWithBurnMessage.fromFields(fields),
      fromFieldsWithTypes: (item: FieldsWithTypes) => StampReceiptTicketWithBurnMessage.fromFieldsWithTypes(item),
      fromBcs: (data: Uint8Array) => StampReceiptTicketWithBurnMessage.fromBcs(data),
      bcs: StampReceiptTicketWithBurnMessage.bcs,
      fromJSONField: (field: any) => StampReceiptTicketWithBurnMessage.fromJSONField(field),
      fromJSON: (json: Record<string, any>) => StampReceiptTicketWithBurnMessage.fromJSON(json),
      fromSuiParsedData: (content: SuiParsedData) => StampReceiptTicketWithBurnMessage.fromSuiParsedData(content),
      fromSuiObjectData: (content: SuiObjectData) => StampReceiptTicketWithBurnMessage.fromSuiObjectData(content),
      fetch: async (client: SuiClient, id: string) => StampReceiptTicketWithBurnMessage.fetch(client, id),
      new: (fields: StampReceiptTicketWithBurnMessageFields) => {
        return new StampReceiptTicketWithBurnMessage([], fields);
      },
      kind: "StructClassReified",
    };
  }

  static get r() {
    return StampReceiptTicketWithBurnMessage.reified();
  }

  static phantom(): PhantomReified<ToTypeStr<StampReceiptTicketWithBurnMessage>> {
    return phantom(StampReceiptTicketWithBurnMessage.reified());
  }
  static get p() {
    return StampReceiptTicketWithBurnMessage.phantom();
  }

  static get bcs() {
    return bcs.struct("StampReceiptTicketWithBurnMessage", {
      stamp_receipt_ticket: StampReceiptTicket.bcs(MessageTransmitterAuthenticator.bcs),
      burn_message: BurnMessage.bcs,
    });
  }

  static fromFields(fields: Record<string, any>): StampReceiptTicketWithBurnMessage {
    return StampReceiptTicketWithBurnMessage.reified().new({
      stampReceiptTicket: decodeFromFields(
        StampReceiptTicket.reified(MessageTransmitterAuthenticator.reified()),
        fields.stamp_receipt_ticket
      ),
      burnMessage: decodeFromFields(BurnMessage.reified(), fields.burn_message),
    });
  }

  static fromFieldsWithTypes(item: FieldsWithTypes): StampReceiptTicketWithBurnMessage {
    if (!isStampReceiptTicketWithBurnMessage(item.type)) {
      throw new Error("not a StampReceiptTicketWithBurnMessage type");
    }

    return StampReceiptTicketWithBurnMessage.reified().new({
      stampReceiptTicket: decodeFromFieldsWithTypes(
        StampReceiptTicket.reified(MessageTransmitterAuthenticator.reified()),
        item.fields.stamp_receipt_ticket
      ),
      burnMessage: decodeFromFieldsWithTypes(BurnMessage.reified(), item.fields.burn_message),
    });
  }

  static fromBcs(data: Uint8Array): StampReceiptTicketWithBurnMessage {
    return StampReceiptTicketWithBurnMessage.fromFields(StampReceiptTicketWithBurnMessage.bcs.parse(data));
  }

  toJSONField() {
    return {
      stampReceiptTicket: this.stampReceiptTicket.toJSONField(),
      burnMessage: this.burnMessage.toJSONField(),
    };
  }

  toJSON() {
    return {
      $typeName: this.$typeName,
      $typeArgs: this.$typeArgs,
      ...this.toJSONField(),
    };
  }

  static fromJSONField(field: any): StampReceiptTicketWithBurnMessage {
    return StampReceiptTicketWithBurnMessage.reified().new({
      stampReceiptTicket: decodeFromJSONField(
        StampReceiptTicket.reified(MessageTransmitterAuthenticator.reified()),
        field.stampReceiptTicket
      ),
      burnMessage: decodeFromJSONField(BurnMessage.reified(), field.burnMessage),
    });
  }

  static fromJSON(json: Record<string, any>): StampReceiptTicketWithBurnMessage {
    if (json.$typeName !== StampReceiptTicketWithBurnMessage.$typeName) {
      throw new Error("not a WithTwoGenerics json object");
    }

    return StampReceiptTicketWithBurnMessage.fromJSONField(json);
  }

  static fromSuiParsedData(content: SuiParsedData): StampReceiptTicketWithBurnMessage {
    if (content.dataType !== "moveObject") {
      throw new Error("not an object");
    }
    if (!isStampReceiptTicketWithBurnMessage(content.type)) {
      throw new Error(`object at ${(content.fields as any).id} is not a StampReceiptTicketWithBurnMessage object`);
    }
    return StampReceiptTicketWithBurnMessage.fromFieldsWithTypes(content);
  }

  static fromSuiObjectData(data: SuiObjectData): StampReceiptTicketWithBurnMessage {
    if (data.bcs) {
      if (data.bcs.dataType !== "moveObject" || !isStampReceiptTicketWithBurnMessage(data.bcs.type)) {
        throw new Error(`object at is not a StampReceiptTicketWithBurnMessage object`);
      }

      return StampReceiptTicketWithBurnMessage.fromBcs(fromB64(data.bcs.bcsBytes));
    }
    if (data.content) {
      return StampReceiptTicketWithBurnMessage.fromSuiParsedData(data.content);
    }
    throw new Error(
      "Both `bcs` and `content` fields are missing from the data. Include `showBcs` or `showContent` in the request."
    );
  }

  static async fetch(client: SuiClient, id: string): Promise<StampReceiptTicketWithBurnMessage> {
    const res = await client.getObject({ id, options: { showBcs: true } });
    if (res.error) {
      throw new Error(`error fetching StampReceiptTicketWithBurnMessage object at id ${id}: ${res.error.code}`);
    }
    if (res.data?.bcs?.dataType !== "moveObject" || !isStampReceiptTicketWithBurnMessage(res.data.bcs.type)) {
      throw new Error(`object at id ${id} is not a StampReceiptTicketWithBurnMessage object`);
    }

    return StampReceiptTicketWithBurnMessage.fromSuiObjectData(res.data);
  }
}
