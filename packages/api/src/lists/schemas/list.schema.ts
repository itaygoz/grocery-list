import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema()
export class List extends Document {
  @Prop({ required: true })
  userId: string;

  @Prop({ required: true })
  name: string;

  @Prop({ type: Date, default: Date.now })
  date: Date;

  @Prop([{ item: String, quantity: Number }])
  items: { item: string; quantity: number }[];

  @Prop([
    {
      timestamp: Date,
      action: String,
      item: {
        itemId: String,
        quantity: Number,
      },
    },
  ])
  changelog: {
    timestamp: Date;
    action: string;
    item: { itemId: string; quantity: number };
  }[];
}

export const ListSchema = SchemaFactory.createForClass(List);
