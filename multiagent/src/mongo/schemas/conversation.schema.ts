import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document } from "mongoose";

export type ConversationDocument = Conversation & Document;

// Схема для отдельного сообщения (вложенный документ)
@Schema({ _id: false })
class Message {
  @Prop({ required: true })
  type: string; // Тип сообщения (human, ai, system)

  @Prop({ required: true })
  content: string; // Содержание сообщения

  @Prop({ default: () => new Date() })
  timestamp: Date;
}

const MessageSchema = SchemaFactory.createForClass(Message);

@Schema({ collection: "conversations" })
export class Conversation {
  @Prop({ required: true, index: true })
  userId: string;

  @Prop({ required: true, unique: true, index: true })
  sessionId: string;

  @Prop({ required: true, type: Date })
  timestamp: Date;

  @Prop({ type: [MessageSchema], default: [] })
  messages: Message[];

  @Prop({ default: "active" })
  status: string; // 'active', 'completed', 'terminated'
}

export const ConversationSchema = SchemaFactory.createForClass(Conversation);
